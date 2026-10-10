import { http } from './http';
import type { DataEnvelope, MessageResponse, Recado } from './types';

export const TEXTO_RECADO_MAX = 2000;

/**
 * GET /alunos/{id}/recados. Sem `data` a API pagina de 30 em 30 ({data, links, meta});
 * aqui lemos só a primeira página, que traz os mais recentes. A visibilidade é decidida
 * pelo backend (recados de outro responsável não chegam).
 */
export async function listarRecados(alunoId: number): Promise<Recado[]> {
  const { data } = await http.get<DataEnvelope<Recado[]>>(`/alunos/${alunoId}/recados`);
  return data.data;
}

/** POST /alunos/{id}/recados: sempre gravado como recado do responsável ao professor. */
export async function enviarRecado(alunoId: number, texto: string): Promise<Recado> {
  const { data } = await http.post<DataEnvelope<Recado>>(`/alunos/${alunoId}/recados`, { texto });
  return data.data;
}

/** PUT /recados/{id}: só recado seu e dentro do prazo (`editavel_ate`). */
export async function editarRecado(recadoId: number, texto: string): Promise<Recado> {
  const { data } = await http.put<DataEnvelope<Recado>>(`/recados/${recadoId}`, { texto });
  return data.data;
}

/** DELETE /recados/{id}: só recado seu e dentro do prazo. */
export async function apagarRecado(recadoId: number): Promise<string> {
  const { data } = await http.delete<MessageResponse>(`/recados/${recadoId}`);
  return data.message;
}

/** Ainda dá para alterar? O prazo vem do backend (manhã/integral até 07h, tarde até 12h do dia seguinte). */
export function recadoEditavel(recado: Recado, agora: number = Date.now()): boolean {
  if (recado.autor.papel !== 'responsavel' || !recado.editavel_ate) return false;
  const limite = Date.parse(recado.editavel_ate);
  return Number.isFinite(limite) && limite > agora;
}
