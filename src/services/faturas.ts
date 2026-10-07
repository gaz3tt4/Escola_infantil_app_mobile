import { listarMeusAlunos } from './alunos';
import { http } from './http';
import type {
  Aluno,
  CobrancaAvulsaRequest,
  DataEnvelope,
  Fatura,
  FormaPagamentoCobranca,
  FormaPagamentoFatura,
  PagamentoResponse,
  StatusFatura,
  TipoFatura,
} from './types';

/**
 * Forma de pagamento usada pelas telas. A API usa minúsculo em /faturas/avulsa
 * e MAIÚSCULO em /faturas/{id}/pagamento; a conversão acontece só aqui.
 */
export type FormaPagamento = FormaPagamentoFatura;

const PARA_COBRANCA: Record<FormaPagamento, FormaPagamentoCobranca> = {
  pix: 'PIX',
  boleto: 'BOLETO',
};

export interface FaturaComAluno extends Fatura {
  alunoId: number;
  alunoNome: string;
}

export type ResultadoPagamento =
  | {
      forma: 'pix';
      qrCodeBase64: string | null;
      copiaECola: string | null;
      expiracao: string | null;
    }
  | {
      forma: 'boleto';
      linhaDigitavel: string | null;
      codigoBarras: string | null;
      urlPdf: string | null;
    };

/** Status que ainda aceitam pagamento (mesma regra do backend). */
const STATUS_EM_ABERTO: readonly StatusFatura[] = ['pendente', 'enviada', 'vencida'];

export function podePagar(status: StatusFatura): boolean {
  return STATUS_EM_ABERTO.includes(status);
}

export const STATUS_LABEL: Record<StatusFatura, string> = {
  pendente: 'Pendente',
  enviada: 'Enviada',
  paga: 'Paga',
  vencida: 'Vencida',
  cancelada: 'Cancelada',
  falha: 'Falha no envio',
};

export const TIPO_LABEL: Record<TipoFatura, string> = {
  mensalidade: 'Mensalidade',
  matricula: 'Matrícula',
};

/** GET /alunos/{id}/faturas (ordenado por vencimento decrescente pelo backend). */
export async function listarFaturasDoAluno(alunoId: number): Promise<Fatura[]> {
  const { data } = await http.get<DataEnvelope<Fatura[]>>(`/alunos/${alunoId}/faturas`);
  return data.data;
}

/**
 * Não existe lista geral de faturas do responsável na API: busca os alunos
 * e as faturas de cada um em paralelo, unificando numa lista só.
 */
export async function listarFaturasDosMeusAlunos(): Promise<{ alunos: Aluno[]; faturas: FaturaComAluno[] }> {
  // TODO(backend): trocar por um endpoint único de faturas do responsável, se for criado.
  const alunos = await listarMeusAlunos();
  const porAluno = await Promise.all(
    alunos.map(async (aluno) => {
      const faturas = await listarFaturasDoAluno(aluno.id);
      return faturas.map<FaturaComAluno>((fatura) => ({ ...fatura, alunoId: aluno.id, alunoNome: aluno.nome }));
    })
  );
  const faturas = porAluno.flat().sort((a, b) => b.vencimento.localeCompare(a.vencimento) || b.id - a.id);
  return { alunos, faturas };
}

/** GET /faturas/{id} */
export async function obterFatura(faturaId: number): Promise<Fatura> {
  const { data } = await http.get<DataEnvelope<Fatura>>(`/faturas/${faturaId}`);
  return data.data;
}

/** POST /faturas/{id}/pagamento (forma em MAIÚSCULO). */
export async function pagarFatura(faturaId: number, forma: FormaPagamento): Promise<ResultadoPagamento> {
  const { data } = await http.post<PagamentoResponse>(`/faturas/${faturaId}/pagamento`, {
    forma_pagamento: PARA_COBRANCA[forma],
  });

  if (data.forma_pagamento === 'PIX') {
    return {
      forma: 'pix',
      qrCodeBase64: data.qr_code.imagem_base64,
      copiaECola: data.qr_code.copia_e_cola,
      expiracao: data.qr_code.expiracao,
    };
  }
  return {
    forma: 'boleto',
    linhaDigitavel: data.boleto.linha_digitavel,
    codigoBarras: data.boleto.codigo_barras,
    urlPdf: data.boleto.url_pdf,
  };
}

export interface NovaCobrancaAvulsa {
  tipo: TipoFatura;
  forma: FormaPagamento;
  /** Y-m-d. Na mensalidade, escolhe a competência (mês) a adiantar. */
  vencimento?: string;
}

/** POST /alunos/{id}/faturas/avulsa (forma em minúsculo). */
export async function gerarCobrancaAvulsa(alunoId: number, cobranca: NovaCobrancaAvulsa): Promise<Fatura> {
  const payload: CobrancaAvulsaRequest = {
    tipo: cobranca.tipo,
    forma_pagamento: cobranca.forma,
    ...(cobranca.vencimento ? { vencimento: cobranca.vencimento } : {}),
  };
  const { data } = await http.post<DataEnvelope<Fatura>>(`/alunos/${alunoId}/faturas/avulsa`, payload);
  return data.data;
}
