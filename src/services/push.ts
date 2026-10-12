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

/** POST /dispositivos-push (upsert por token). Silencioso em qualquer falha. */
export async function registrarDispositivoPush(): Promise<void> {
  const os = plataforma();
  if (!os || !pushDisponivel()) return;
  const token = await obterTokenExpo();
  if (!token) return;

  try {
    const payload: DispositivoPushRequest = { token, plataforma: os };
    await http.post('/dispositivos-push', payload);
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
  } catch {
    // Falha de rede ou 422: nada a fazer agora; o próximo login registra de novo.
  }
}

/** DELETE /dispositivos-push. Chamar ANTES do logout (a rota exige o Bearer). */
export async function removerDispositivoPush(): Promise<void> {
  // Expo Go Android nunca registra token, então não há o que remover.
  if (!pushDisponivel()) return;
  try {
    const token = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
    if (!token) return;
    await http.delete('/dispositivos-push', { data: { token } });
    await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
  } catch {
    // Sem rede: o backend também remove tokens inválidos quando o Expo recusa o envio.
  }
}

/** Reenvia o token quando o sistema o troca (rotação). */
export function assinarRotacaoDoToken(): { remove: () => void } {
  const Notifications = obterNotificacoes();
  if (!Notifications) return { remove: () => undefined };

  const subscription = Notifications.addPushTokenListener(() => {
    void registrarDispositivoPush();
  });
  return { remove: () => subscription.remove() };
}
