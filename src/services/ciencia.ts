import { http } from './http';
import type { AgendaPendente, CienciaResponse, DataEnvelope } from './types';

/** POST /agendas/{id}/ciencia: sem corpo e idempotente (repetir devolve a primeira data). */
export async function registrarCiencia(agendaId: number): Promise<CienciaResponse> {
  const { data } = await http.post<DataEnvelope<CienciaResponse>>(`/agendas/${agendaId}/ciencia`);
  return data.data;
}

/** GET /agendas/pendentes: agendas dos seus filhos sem a sua ciência (recentes primeiro, máx. 100). */
export async function listarAgendasPendentes(): Promise<AgendaPendente[]> {
  const { data } = await http.get<DataEnvelope<AgendaPendente[]>>('/agendas/pendentes');
  return data.data;
}
