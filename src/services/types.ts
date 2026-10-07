// Contrato da API existente (EscolaCentopeia, routes/api.php).
// Estes tipos espelham as respostas como elas são; nada aqui deve ser inventado.

// ---------- Autenticação ----------

/** Usuário retornado em POST /login. `must_change_password` só vem aqui. */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  must_change_password: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  token_type: 'Bearer';
  user: AuthUser;
}

export interface MessageResponse {
  message: string;
}

/** PUT /senha */
export interface TrocarSenhaRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

/** GET /me: dados do Responsável (todos os campos são anuláveis no banco). */
export interface Responsavel {
  id: number;
  nome: string | null;
  email: string | null;
  cpf: string | null;
  telefone: string | null;
}

// ---------- Alunos ----------

export type Periodo = 'manha' | 'tarde' | 'integral';

/** Item de GET /meus-alunos. `turma` e `periodo` vêm nulos sem matrícula ativa. */
export interface Aluno {
  id: number;
  nome: string;
  data_nascimento: string; // Y-m-d
  idade: number;
  turma: string | null;
  periodo: Periodo | null;
}

/** GET /alunos/{aluno}/matricula (só a matrícula ativa; 404 se não houver). */
export interface Matricula {
  id: number;
  turma: string;
  periodo: Periodo;
  valor_mensalidade: number;
  valor_matricula: number;
  data_inicio: string | null; // Y-m-d
  data_fim: string | null; // Y-m-d
  status: string;
}

// ---------- Faturas ----------

export type TipoFatura = 'matricula' | 'mensalidade';
export type StatusFatura = 'pendente' | 'enviada' | 'paga' | 'vencida' | 'cancelada' | 'falha';
/** Forma de pagamento como guardada na fatura e aceita em /faturas/avulsa (minúsculo). */
export type FormaPagamentoFatura = 'pix' | 'boleto';
/** Forma de pagamento aceita/retornada por /faturas/{id}/pagamento (MAIÚSCULO). */
export type FormaPagamentoCobranca = 'PIX' | 'BOLETO';

export interface Fatura {
  id: number;
  tipo: TipoFatura;
  aluno: string | null; // nome do aluno
  competencias: string[]; // Y-m
  valor: number;
  vencimento: string; // Y-m-d
  status: StatusFatura;
  forma_pagamento: FormaPagamentoFatura | null;
  valor_pago: number | null;
  pago_em: string | null; // ISO 8601
  link_fatura: string | null;
  /** Só vem preenchido depois de chamar /pagamento com PIX. */
  pix_copia_cola: string | null;
  /** Só vem preenchido depois de chamar /pagamento com BOLETO. */
  linha_digitavel: string | null;
}

export interface CobrancaAvulsaRequest {
  tipo: TipoFatura;
  forma_pagamento: FormaPagamentoFatura;
  vencimento?: string; // Y-m-d, >= hoje
}

export interface PagamentoRequest {
  forma_pagamento: FormaPagamentoCobranca;
}

export interface PagamentoPixResponse {
  forma_pagamento: 'PIX';
  status: string;
  qr_code: {
    imagem_base64: string | null;
    copia_e_cola: string | null;
    expiracao: string | null;
  };
}

export interface PagamentoBoletoResponse {
  forma_pagamento: 'BOLETO';
  status: string;
  boleto: {
    linha_digitavel: string | null;
    codigo_barras: string | null;
    url_pdf: string | null;
  };
}

export type PagamentoResponse = PagamentoPixResponse | PagamentoBoletoResponse;

// ---------- Envelopes ----------

/** Envelope `{ data: ... }` dos API Resources do Laravel. */
export interface DataEnvelope<T> {
  data: T;
}

/** Corpo de erro do Laravel (422 traz `errors` por campo). */
export interface LaravelErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}
