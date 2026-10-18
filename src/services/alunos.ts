import { isHttpStatus } from './errors';
import { http } from './http';
import type { Aluno, DataEnvelope, Matricula, Periodo } from './types';

/** GET /meus-alunos */
export async function listarMeusAlunos(): Promise<Aluno[]> {
  const { data } = await http.get<DataEnvelope<Aluno[]>>('/meus-alunos');
  return data.data;
}

/** GET /alunos/{id}/matricula. Retorna null quando não há matrícula ativa (404). */
export async function obterMatriculaAtiva(alunoId: number): Promise<Matricula | null> {
  try {
    const { data } = await http.get<DataEnvelope<Matricula>>(`/alunos/${alunoId}/matricula`);
    return data.data;
  } catch (error) {
    if (isHttpStatus(error, 404)) return null;
    throw error;
  }
}

export const PERIODO_LABEL: Record<Periodo, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  integral: 'Integral',
};
