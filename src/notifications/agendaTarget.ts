import { useSyncExternalStore } from 'react';

/** Destino aberto ao tocar na notificação da agenda (só ids e data; sem dados da criança). */
export interface AgendaTarget {
  agendaId: number;
  alunoId: number;
  data: string; // Y-m-d
}

let current: AgendaTarget | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function setAgendaTarget(target: AgendaTarget) {
  current = target;
  emit();
}

export function clearAgendaTarget() {
  if (current === null) return;
  current = null;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Destino pendente de abertura; a tela Agenda consome e limpa. */
export function useAgendaTarget(): AgendaTarget | null {
  return useSyncExternalStore(subscribe, () => current);
}

/** Lê o `data` do push: {tipo:'agenda', agenda_id, aluno_id, data}. */
export function parseAgendaPush(data: unknown): AgendaTarget | null {
  if (typeof data !== 'object' || data === null) return null;
  const { tipo, agenda_id, aluno_id, data: dia } = data as Record<string, unknown>;
  if (tipo !== 'agenda') return null;
  const agendaId = Number(agenda_id);
  const alunoId = Number(aluno_id);
  if (!Number.isInteger(agendaId) || !Number.isInteger(alunoId) || typeof dia !== 'string') return null;
  return { agendaId, alunoId, data: dia };
}
