import { http } from './http';
import type { DataEnvelope, MessageResponse, Medicamento } from './types';
import { todayISO } from '../utils/format';

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

/** Parte editável de um medicamento (todos os campos são opcionais na API). */
export type EdicaoMedicamento = Partial<NovoMedicamento>;

/**
 * POST /medicamentos/{id} com _method=PATCH (multipart: o PHP não lê multipart em PATCH).
 * A receita nova é opcional: sem ela, a atual é mantida.
 */
export async function atualizarMedicamento(
  medicamentoId: number,
  alteracoes: EdicaoMedicamento,
  receita?: ArquivoReceita | null
): Promise<Medicamento> {
  const form = new FormData();
  form.append('_method', 'PATCH');
  if (alteracoes.nome !== undefined) form.append('nome', alteracoes.nome);
  if (alteracoes.dose !== undefined) form.append('dose', alteracoes.dose);
  if (alteracoes.horario !== undefined) form.append('horario', alteracoes.horario);
  if (alteracoes.data_administracao !== undefined) form.append('data_administracao', alteracoes.data_administracao);
  if (receita) {
    form.append('receita', { uri: receita.uri, name: receita.name, type: receita.type } as unknown as Blob);
  }

  const { data } = await http.post<DataEnvelope<Medicamento>>(`/medicamentos/${medicamentoId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: UPLOAD_TIMEOUT_MS,
  });
  return data.data;
}

/** DELETE /medicamentos/{id}: remove o medicamento e a receita (só no dia e antes de administrado). */
export async function apagarMedicamento(medicamentoId: number): Promise<string> {
  const { data } = await http.delete<MessageResponse>(`/medicamentos/${medicamentoId}`);
  return data.message;
}

/**
 * Pode editar/apagar? Usa `editavel` do backend; sem ele (versão antiga da API), aplica a mesma
 * regra localmente: no dia da administração e enquanto não administrado.
 */
export function medicamentoEditavel(medicamento: Medicamento): boolean {
  if (typeof medicamento.editavel === 'boolean') return medicamento.editavel;
  return !medicamento.administrado && medicamento.data_administracao === todayISO();
}
