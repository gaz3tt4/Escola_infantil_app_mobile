import { http } from './http';
import type { DataEnvelope, Medicamento } from './types';

/** Arquivo da receita já comprimido (JPEG), pronto para o multipart. */
export interface ArquivoReceita {
  uri: string;
  name: string;
  type: string;
}

export interface NovoMedicamento {
  nome: string;
  dose: string;
  /** HH:mm */
  horario: string;
  /** Y-m-d, hoje ou depois. */
  data_administracao: string;
}

const UPLOAD_TIMEOUT_MS = 60000;

/** GET /alunos/{id}/medicamentos (sem data: os 50 mais recentes). */
export async function listarMedicamentos(alunoId: number, data?: string): Promise<Medicamento[]> {
  const { data: body } = await http.get<DataEnvelope<Medicamento[]>>(`/alunos/${alunoId}/medicamentos`, {
    params: data ? { data } : undefined,
  });
  return body.data;
}

/** POST /alunos/{id}/medicamentos (multipart; a receita é obrigatória). */
export async function criarMedicamento(
  alunoId: number,
  medicamento: NovoMedicamento,
  receita: ArquivoReceita
): Promise<Medicamento> {
  const form = new FormData();
  form.append('nome', medicamento.nome);
  form.append('dose', medicamento.dose);
  form.append('horario', medicamento.horario);
  form.append('data_administracao', medicamento.data_administracao);
  // No React Native o arquivo é descrito por { uri, name, type }.
  form.append('receita', { uri: receita.uri, name: receita.name, type: receita.type } as unknown as Blob);

  const { data } = await http.post<DataEnvelope<Medicamento>>(`/alunos/${alunoId}/medicamentos`, form, {
    // Troca o JSON padrão: o boundary do multipart é montado na requisição.
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: UPLOAD_TIMEOUT_MS,
  });
  return data.data;
}
