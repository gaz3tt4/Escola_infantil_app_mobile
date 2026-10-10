import * as Notifications from 'expo-notifications';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { removerNotificacoesDaAgenda } from '../notifications/config';
import { listarAgendasPendentes } from '../services/ciencia';
import type { AgendaPendente } from '../services/types';

interface PendenciasContextValue {
  /** Agendas dos seus filhos sem a sua ciência. */
  pendentes: AgendaPendente[];
  reload: () => void;
  /** Chamado depois de registrar a ciência: tira a agenda da lista e some com a notificação. */
  marcarCiente: (agendaId: number) => Promise<void>;
}

const PendenciasContext = createContext<PendenciasContextValue | undefined>(undefined);

/** Montado dentro da área autenticada. Mantém o indicador de pendência (aba e ícone do app). */
export function PendenciasProvider({ children }: { children: React.ReactNode }) {
  const [pendentes, setPendentes] = useState<AgendaPendente[]>([]);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    let active = true;
    listarAgendasPendentes().then(
      (lista) => active && setPendentes(lista),
      // O indicador é secundário: sem rede, mantém o que já tinha.
      () => undefined
    );
    return () => {
      active = false;
    };
  }, [version]);

  // Volta ao primeiro plano ou chega notificação com o app aberto: confere de novo.
  useEffect(() => {
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') reload();
    });
    const recebida = Notifications.addNotificationReceivedListener(() => reload());
    return () => {
      appState.remove();
      recebida.remove();
    };
  }, [reload]);

  // Contagem no ícone do app; zera ao sair da área autenticada.
  useEffect(() => {
    Notifications.setBadgeCountAsync(pendentes.length).catch(() => undefined);
  }, [pendentes.length]);
  useEffect(
    () => () => {
      Notifications.setBadgeCountAsync(0).catch(() => undefined);
    },
    []
  );

  const marcarCiente = useCallback(async (agendaId: number) => {
    setPendentes((lista) => lista.filter((pendente) => pendente.agenda_id !== agendaId));
    await removerNotificacoesDaAgenda(agendaId);
  }, []);

  const value = useMemo(() => ({ pendentes, reload, marcarCiente }), [pendentes, reload, marcarCiente]);

  return <PendenciasContext.Provider value={value}>{children}</PendenciasContext.Provider>;
}

export function usePendencias(): PendenciasContextValue {
  const ctx = useContext(PendenciasContext);
  if (!ctx) {
    throw new Error('usePendencias deve ser usado dentro de um PendenciasProvider');
  }
  return ctx;
}
