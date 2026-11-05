import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { obterNotificacoes, pushDisponivel } from '../notifications/modulo';
import { http } from './http';
import type { DispositivoPushRequest, PlataformaPush } from './types';

// Chave do SecureStore (só alfanuméricos, ".", "-" e "_").
const PUSH_TOKEN_KEY = 'centopeia.push_token';
const CANAL_AGENDA = 'agenda';

function plataforma(): PlataformaPush | null {
  return Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : null;
}

/**
 * Pede permissão e devolve o token do Expo, ou null quando não dá (web, emulador sem
 * Google Play, permissão negada, projectId ausente). Nunca lança: push é um extra.
 */
async function obterTokenExpo(): Promise<string | null> {
  const Notifications = obterNotificacoes();
  if (!Notifications || !plataforma() || !Device.isDevice) return null;

  try {
    // Android 13+: o prompt de permissão só aparece depois de existir um canal.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CANAL_AGENDA, {
        name: 'Agenda do dia',
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: '#84CC3A',
      });
    }

    let permissao = await Notifications.getPermissionsAsync();
    if (!permissao.granted && permissao.canAskAgain) {
      permissao = await Notifications.requestPermissionsAsync();
    }
    if (!permissao.granted) return null;

    const projectId: string | undefined = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      // Pendência de configuração (eas init): o app continua funcionando sem push.
      console.warn('Push desativado: projectId do EAS ausente na configuração do app.');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch {
    // Sem rede ou sem credenciais de push neste build; tenta de novo no próximo login.
    return null;
  }
}

// Estado do módulo: garante no máximo um registro por token e sessão, mesmo com vários gatilhos.
let registroEmAndamento: Promise<void> | null = null;
let tokenRegistrado: string | null = null;
/** Último token nativo (APNs/FCM) visto pelo listener de rotação. */
let ultimoTokenNativo: string | null = null;

/** Espera antes da única nova tentativa depois de uma falha (nunca em laço). */
const RETRY_BACKOFF_MS = 5000;

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function enviarToken(token: string, os: PlataformaPush): Promise<boolean> {
  const payload: DispositivoPushRequest = { token, plataforma: os };
  for (let tentativa = 0; tentativa < 2; tentativa += 1) {
    try {
      await http.post('/dispositivos-push', payload);
      return true;
    } catch {
      // Uma única nova tentativa, com espera. Se falhar de novo, o próximo login registra.
      if (tentativa === 0) await esperar(RETRY_BACKOFF_MS);
    }
  }
  return false;
}

async function registrar(): Promise<void> {
  const os = plataforma();
  if (!os || !pushDisponivel()) return;
  const token = await obterTokenExpo();
  if (!token || token === tokenRegistrado) return;

  // Token já salvo por um registro anterior (o logout apaga a chave): o servidor já o tem.
  try {
    if ((await SecureStore.getItemAsync(PUSH_TOKEN_KEY)) === token) {
      tokenRegistrado = token;
      return;
    }
  } catch {
    // Sem acesso ao SecureStore: segue e registra.
  }

  if (!(await enviarToken(token, os))) return;
  tokenRegistrado = token;
  try {
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
  } catch {
    // O registro no servidor já valeu; só perde a chance de pular o POST na próxima abertura.
  }
}

/**
 * POST /dispositivos-push (upsert por token). Idempotente: no máximo um POST por token e sessão,
 * chamadas simultâneas dividem o mesmo registro e uma falha tem só uma nova tentativa.
 * Silencioso em qualquer falha.
 */
export function registrarDispositivoPush(): Promise<void> {
  if (!registroEmAndamento) {
    registroEmAndamento = registrar()
      .catch(() => undefined)
      .finally(() => {
        registroEmAndamento = null;
      });
  }
  return registroEmAndamento;
}

/** DELETE /dispositivos-push. Chamar ANTES do logout (a rota exige o Bearer). */
export async function removerDispositivoPush(): Promise<void> {
  // Expo Go Android nunca registra token, então não há o que remover.
  if (!pushDisponivel()) return;
  tokenRegistrado = null;
  try {
    const token = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
    if (!token) return;
    try {
      await http.delete('/dispositivos-push', { data: { token } });
    } finally {
      // Mesmo sem rede a chave sai: o próximo login (talvez de outro usuário) precisa registrar de novo.
      await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
    }
  } catch {
    // Sem rede: o backend também remove tokens inválidos quando o Expo recusa o envio.
  }
}

/**
 * Reenvia o token quando o sistema o troca (rotação).
 *
 * Atenção: no iOS, `getExpoPushTokenAsync` pede o token nativo e o módulo dispara este mesmo evento
 * a cada pedido. Registrar de dentro do listener sem filtro cria um laço infinito (um POST por
 * volta). Por isso só reage a um token nativo diferente do último visto e nunca durante um registro.
 */
export function assinarRotacaoDoToken(): { remove: () => void } {
  const Notifications = obterNotificacoes();
  if (!Notifications) return { remove: () => undefined };

  const subscription = Notifications.addPushTokenListener((token) => {
    const mudou = token.data !== ultimoTokenNativo;
    ultimoTokenNativo = token.data;
    // Evento causado pelo nosso próprio pedido de token, ou o mesmo token de novo: nada a fazer.
    if (!mudou || registroEmAndamento) return;
    void registrarDispositivoPush();
  });
  return { remove: () => subscription.remove() };
}
