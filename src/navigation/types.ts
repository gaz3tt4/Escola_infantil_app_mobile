import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Agenda: undefined;
  Perfil: undefined;
  Pagamentos: undefined;
};

/**
 * Uma única pilha com grupos condicionais: sem sessão só existe `Login`;
 * com troca de senha obrigatória só existe `TrocaSenhaObrigatoria`.
 */
export type RootStackParamList = {
  Login: undefined;
  TrocaSenhaObrigatoria: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  FaturaDetalhe: { faturaId: number; alunoNome: string };
  AlterarSenha: undefined;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
