import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootStackParamList } from './types';

/** Permite navegar fora das telas (toque em notificação). */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** Abre a aba Agenda; espera o navegador ficar pronto (partida a frio). */
export function abrirAgenda(tentativas = 20) {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Main', { screen: 'Agenda' });
    return;
  }
  if (tentativas > 0) {
    setTimeout(() => abrirAgenda(tentativas - 1), 150);
  }
}
