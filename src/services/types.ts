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

// ---------- Agenda ----------

/** `I` = infantil, `B` = berçário. Define se a agenda traz evacuação e xixi. */
export type SegmentoTurma = 'I' | 'B';
export type TipoRefeicao = 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar';
export type AceitacaoRefeicao = 'pouco' | 'metade' | 'recusou' | 'tudo';
export type TipoEvacuacao = 'normal' | 'pastoso' | 'semipastoso';
export type AspectoXixi = 'normal' | 'escuro';

/** Horas vêm como HH:mm ou null. */
export interface RefeicaoAgenda {
  id: number;
  tipo: TipoRefeicao;
  horario: string | null;
  aceitacao: AceitacaoRefeicao | null;
  /** Preenchido quando `aceitacao` é `recusou`. */
  alimento_recusado: string | null;
  observacao: string | null;
}

export interface SonecaAgenda {
  id: number;
  dormiu_em: string | null;
  acordou_em: string | null;
}

export interface MamadeiraAgenda {
  id: number;
  quantidade_ml: number;
  horario: string | null;
}

export interface EvacuacaoAgenda {
  horario: string | null;
  tipo: TipoEvacuacao;
  observacao: string | null;
}

export interface XixiAgenda {
  horario: string | null;
  aspecto: AspectoXixi;
  observacao: string | null;
}

/** GET /alunos/{aluno}/agenda?data=Y-m-d. `evacuacao` e `xixi` só existem no berçário. */
export interface Agenda {
  id: number;
  data: string; // Y-m-d
  segmento: SegmentoTurma;
  refeicoes: RefeicaoAgenda[];
  sonecas: SonecaAgenda[];
  mamadeiras: MamadeiraAgenda[];
  evacuacao: EvacuacaoAgenda | null;
  xixi: XixiAgenda | null;
  /** Ciência do responsável; o backend devolve false/null até a etapa de ciência. */
  ciente: boolean;
  ciente_em: string | null;
}

// ---------- Ciência ----------

/** POST /agendas/{agenda}/ciencia (idempotente: repetir devolve a primeira data). */
export interface CienciaResponse {
  ciente: true;
  ciente_em: string;
}

/** Item de GET /agendas/pendentes: agendas dos seus filhos sem a sua ciência. */
export interface AgendaPendente {
  agenda_id: number;
  aluno_id: number;
  data: string; // Y-m-d
}

// ---------- Push ----------

export type PlataformaPush = 'ios' | 'android';

export interface DispositivoPushRequest {
  token: string;
  plataforma: PlataformaPush;
}

// ---------- Avisos ----------

/** GET /alunos/{id}/avisos. `data_fim` nulo = aviso de um dia só. */
export interface Aviso {
  id: number;
  /** feriado | aula_extra | evento | geral; valor desconhecido usa o visual de `geral`. */
  tipo?: string;
  titulo: string;
  texto: string;
  data: string; // Y-m-d
  data_fim: string | null;
  autor: { nome: string; papel: string };
}

// ---------- Recados ----------

/** `tipo` só tem `atividades` e `recado`; o app trata como texto. */
export interface Recado {
  id: number;
  tipo: string;
  texto: string;
  data: string; // Y-m-d
  autor: { nome: string; papel: 'professor' | 'admin' | 'responsavel' | string };
  aluno_id: number | null;
  /** ISO 8601 (-03:00) até quando o responsável pode alterar o próprio recado; null nos demais. */
  editavel_ate?: string | null;
}

// ---------- Medicamentos ----------

export interface Medicamento {
  id: number;
  nome: string;
  dose: string;
  horario: string; // HH:mm
  data_administracao: string; // Y-m-d
  administrado: boolean;
  administrado_em: string | null; // ISO 8601
  /** Só o nome do professor, ou null. */
  administrado_por: string | null;
  /**
   * ISO 8601 (-03:00) até quando o responsável AUTOR pode editar/apagar (mesmo prazo dos recados:
   * manhã/integral até 07h do dia seguinte, tarde até 12h); null nos medicamentos de outro responsável
   * ou já administrados.
   */
  editavel_ate?: string | null;
  /** Sinalizador da primeira versão do contrato; vale só se `editavel_ate` não vier. */
  editavel?: boolean;
}

// ---------- Envelopes ----------

/** Envelope `{ data: ... }` dos API Resources do Laravel. */
export interface DataEnvelope<T> {
  data: T;
}

/** Corpo de erro do Laravel (422 traz `errors` por campo). */
export interface LaravelErrorBody {
  message?: string;
  /** Código de negócio do backend (ex.: `senha_padrao`: troca de senha obrigatória pendente). */
  code?: string;
  errors?: Record<string, string[]>;
}
