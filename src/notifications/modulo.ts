import { isRunningInExpoGo } from 'expo';
import type * as NotificacoesModulo from 'expo-notifications';
import { Platform } from 'react-native';

type Notificacoes = typeof NotificacoesModulo;

let modulo: Notificacoes | null | undefined;
let avisou = false;

/**
 * Único lugar que decide se o push existe neste ambiente. Desde o SDK 53 o Expo Go no Android
 * não tem push remoto: `getDevicePushTokenAsync`, `addPushTokenListener` e afins lançam
 * "Android Push notifications (remote notifications) functionality provided by expo-notifications
 * was removed from Expo Go with the release of SDK 53". Development build, produção, iOS e
 * qualquer ambiente fora do Expo Go seguem com push normal. (`isRunningInExpoGo` distingue o Expo Go
 * da development build; `Constants.executionEnvironment === 'storeClient'` valeria para os dois.)
 */
export function pushDisponivel(): boolean {
  if (Platform.OS === 'web') return false;
  return !(Platform.OS === 'android' && isRunningInExpoGo());
}

/**
 * Carrega o `expo-notifications` sob demanda: no Expo Go Android o módulo nem é carregado
 * (devolve null) e quem chama simplesmente pula o push.
 */
export function obterNotificacoes(): Notificacoes | null {
  if (!pushDisponivel()) {
    if (__DEV__ && !avisou && Platform.OS !== 'web') {
      avisou = true;
      console.log('Push indisponível no Expo Go (Android): use uma development build para testar notificações.');
    }
    return null;
  }
  if (modulo === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    modulo = require('expo-notifications') as Notificacoes;
  }
  return modulo;
}
