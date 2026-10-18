import { http } from './http';
import type { Aviso, DataEnvelope } from './types';

/**
 * GET /alunos/{id}/avisos. Com `data`, os avisos que valem naquele dia;
 * sem `data`, os próximos (até 50). Avisos são sempre do admin, por turma.
 */
export async function listarAvisos(alunoId: number, data?: string): Promise<Aviso[]> {
  const { data: body } = await http.get<DataEnvelope<Aviso[]>>(`/alunos/${alunoId}/avisos`, {
    params: data ? { data } : undefined,
  });
  return body.data;
}
