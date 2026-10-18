import type { NotificationResponse } from 'expo-notifications';
import { useEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import { abrirAgenda } from '../navigation/ref';
import { assinarRotacaoDoToken } from '../services/push';
import { parseAgendaPush, setAgendaTarget } from './agendaTarget';
import { obterNotificacoes } from './modulo';

/**
 * Liga o push ao app enquanto há sessão ativa: toque na notificação abre a Agenda na data
 * do aviso (inclusive com o app fechado) e a rotação do token é reenviada ao backend.
 * Não renderiza nada.
 */
export function NotificationsBridge() {
  const { status, mustChangePassword } = useAuth();
  const ativo = status === 'signedIn' && !mustChangePassword;

  useEffect(() => {
    // Sem push (Expo Go Android) não há listener a registrar.
    const Notifications = obterNotificacoes();
    if (!ativo || !Notifications) return;

    function tratar(resposta: NotificationResponse) {
      const alvo = parseAgendaPush(resposta.notification.request.content.data);
      if (!alvo) return;
      setAgendaTarget(alvo);
      abrirAgenda();
    }

    const toque = Notifications.addNotificationResponseReceivedListener(tratar);
    const rotacao = assinarRotacaoDoToken();

    // App aberto a partir da notificação (partida a frio).
    Notifications.getLastNotificationResponseAsync()
      .then((resposta) => {
        if (!resposta) return;
        tratar(resposta);
        return Notifications.clearLastNotificationResponseAsync();
      })
      .catch(() => undefined);

    return () => {
      toque.remove();
      rotacao.remove();
    };
  }, [ativo]);

  return null;
}
