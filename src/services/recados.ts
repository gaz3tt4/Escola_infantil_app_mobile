import { http } from './http';
import type { DataEnvelope, Recado } from './types';

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
