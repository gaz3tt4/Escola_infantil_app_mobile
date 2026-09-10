// Tipos espelhando o contrato da API do backend Laravel (papel: responsável/pai)

export type UserRole = 'responsavel';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Turma {
  id: number;
  nome: string;
  turno: 'manha' | 'tarde' | 'integral';
}

export interface Child {
  id: number;
  nome: string;
  data_nascimento: string; // YYYY-MM-DD
  foto_url: string | null;
  turma: Turma;
}

// GET /children/{id}/daily-reports?date=YYYY-MM-DD
export type NivelAlimentacao = 'nao_comeu' | 'comeu_pouco' | 'comeu_bem' | 'comeu_tudo';
export type NivelSono = 'nao_dormiu' | 'dormiu_pouco' | 'dormiu_bem';
export type NivelHigiene = 'trocado' | 'usou_banheiro' | 'sem_ocorrencias';
export type Humor = 'feliz' | 'calmo' | 'agitado' | 'choroso' | 'cansado';

export interface DailyReport {
  data: string; // YYYY-MM-DD
  alimentacao: {
    nivel: NivelAlimentacao;
    descricao: string;
  };
  sono: {
    nivel: NivelSono;
    duracao_minutos: number | null;
  };
  higiene: {
    nivel: NivelHigiene;
    observacao: string | null;
  };
  humor: Humor;
  atividades: string[];
  observacoes_professor: string | null;
}

// GET /reminders?tipo=feriado|aula_extra
export type ReminderTipo = 'feriado' | 'aula_extra';

export interface Reminder {
  id: number;
  titulo: string;
  data: string; // YYYY-MM-DD
  tipo: ReminderTipo;
  descricao: string;
}

// GET /children/{id}/profile
export interface ChildProfile {
  faltas: number;
  atividades_count: number;
  sonecas: {
    quantidade: number;
    duracao_media: number; // minutos
  };
}

// GET /children/{id}/recados
export interface Recado {
  id: number;
  titulo: string;
  mensagem: string;
  data: string; // YYYY-MM-DD
  autor: string;
}

// GET /children/{id}/invoices
export type InvoiceStatus = 'pago' | 'pendente' | 'atrasado';

export interface Invoice {
  id: number;
  descricao: string; // ex: "Mensalidade - Agosto/2026"
  valor: number;
  vencimento: string; // YYYY-MM-DD
  status: InvoiceStatus;
  pago_em: string | null;
  // Detalhamento do saldo (mensalidades pendente/atrasado) — usado no accordion.
  multa?: number;
  juros?: number;
  desconto?: number;
  valor_total?: number;
}

// POST /mensalidades/{id}/pagamento
export type PaymentMethod = 'CREDIT_CARD' | 'PIX' | 'BOLETO';

export interface CardPaymentPayload {
  numero: string; // apenas dígitos
  nome_impresso: string;
  validade: string; // MM/AA
  cvv: string;
}

export interface PagamentoRequest {
  forma_pagamento: PaymentMethod;
  cartao?: CardPaymentPayload;
}

export interface CreditCardPaymentResult {
  status: 'aprovado' | 'recusado';
  mensagem: string;
}

export interface PixPaymentResult {
  qr_code_base64: string;
  copia_cola: string;
}

export interface BoletoPaymentResult {
  linha_digitavel: string;
  boleto_url: string;
}

export type PagamentoResponse =
  | ({ forma_pagamento: 'CREDIT_CARD' } & CreditCardPaymentResult)
  | ({ forma_pagamento: 'PIX' } & PixPaymentResult)
  | ({ forma_pagamento: 'BOLETO' } & BoletoPaymentResult);
