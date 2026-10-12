import { obterNotificacoes } from './modulo';

/**
 * Notificação recebida com o app aberto: mostra o banner e toca o som, sem mexer no badge
 * (o badge é a contagem de agendas pendentes, atualizada pelo PendenciasProvider).
 * Chamado uma vez, no carregamento do app.
 */
export function configurarNotificacoes() {
  const Notifications = obterNotificacoes();
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Remove da bandeja as notificações apresentadas da agenda indicada. */
export async function removerNotificacoesDaAgenda(agendaId: number): Promise<void> {
  // Sem push (Expo Go Android) não há notificação apresentada para remover; a ciência segue normal.
  const Notifications = obterNotificacoes();
  if (!Notifications) return;

  try {
    const apresentadas = await Notifications.getPresentedNotificationsAsync();
    await Promise.all(
      apresentadas
        .filter((notificacao) => Number(notificacao.request.content.data?.agenda_id) === agendaId)
        .map((notificacao) => Notifications.dismissNotificationAsync(notificacao.request.identifier))
    );
  } catch {
    // Sem suporte neste aparelho: a notificação some quando o usuário a descarta.
  }
}
