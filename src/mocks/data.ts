import type {
  Child,
  ChildProfile,
  DailyReport,
  Invoice,
  Recado,
  Reminder,
  User,
} from '../types';

export const MOCK_USER: User = {
  id: 1,
  name: 'Camila Souza',
  email: 'camila.souza@example.com',
  role: 'responsavel',
};

export const MOCK_PASSWORD = '123456';

export const MOCK_CHILDREN: Child[] = [
  {
    id: 101,
    nome: 'Bento Souza',
    data_nascimento: '2021-04-12',
    foto_url: null,
    turma: { id: 3, nome: 'Turma Jardim II', turno: 'manha' },
  },
  {
    id: 102,
    nome: 'Alice Souza',
    data_nascimento: '2019-09-03',
    foto_url: null,
    turma: { id: 5, nome: 'Turma Pré I', turno: 'tarde' },
  },
];

// Relatórios diários indexados por "childId:data"
export const MOCK_DAILY_REPORTS: Record<string, DailyReport> = {
  '101:2026-08-21': {
    data: '2026-08-21',
    alimentacao: { nivel: 'comeu_bem', descricao: 'Comeu bem no almoço, recusou a fruta da tarde.' },
    sono: { nivel: 'dormiu_bem', duracao_minutos: 95 },
    higiene: { nivel: 'trocado', observacao: 'Duas trocas de fralda, sem assaduras.' },
    humor: 'feliz',
    atividades: ['Pintura com guache', 'Roda de música', 'Brincadeira no parque'],
    observacoes_professor: 'Bento brincou bastante com os coleguinhas hoje e participou bem da roda de música.',
  },
  '101:2026-08-22': {
    data: '2026-08-22',
    alimentacao: { nivel: 'comeu_pouco', descricao: 'Comeu pouco no café da manhã, melhorou no almoço.' },
    sono: { nivel: 'dormiu_pouco', duracao_minutos: 40 },
    higiene: { nivel: 'sem_ocorrencias', observacao: null },
    humor: 'cansado',
    atividades: ['Contação de história', 'Massinha de modelar'],
    observacoes_professor: 'Ficou mais quietinho hoje, mas participou das atividades normalmente.',
  },
  '102:2026-08-22': {
    data: '2026-08-22',
    alimentacao: { nivel: 'comeu_tudo', descricao: 'Comeu tudo, repetiu o suco.' },
    sono: { nivel: 'dormiu_bem', duracao_minutos: 70 },
    higiene: { nivel: 'usou_banheiro', observacao: 'Foi ao banheiro sozinha duas vezes.' },
    humor: 'calmo',
    atividades: ['Circuito motor', 'Leitura livre', 'Desenho livre'],
    observacoes_professor: 'Alice está cada vez mais independente na hora do banheiro. Ótimo dia!',
  },
  '101:2026-08-23': {
    data: '2026-08-23',
    alimentacao: { nivel: 'comeu_bem', descricao: 'Comeu bem em todas as refeições.' },
    sono: { nivel: 'dormiu_bem', duracao_minutos: 88 },
    higiene: { nivel: 'trocado', observacao: 'Sem ocorrências.' },
    humor: 'feliz',
    atividades: ['Educação física', 'Jogos de encaixe', 'Roda de conversa'],
    observacoes_professor: 'Dia tranquilo e produtivo. Bento participou ativamente de todas as atividades.',
  },
  '102:2026-08-23': {
    data: '2026-08-23',
    alimentacao: { nivel: 'comeu_bem', descricao: 'Comeu bem, pediu repetição no almoço.' },
    sono: { nivel: 'dormiu_pouco', duracao_minutos: 35 },
    higiene: { nivel: 'usou_banheiro', observacao: null },
    humor: 'agitado',
    atividades: ['Projeto Horta', 'Contação de história', 'Pintura livre'],
    observacoes_professor: 'Alice estava bastante animada hoje, principalmente durante o Projeto Horta.',
  },
};

export const MOCK_REMINDERS: Reminder[] = [
  {
    id: 1,
    titulo: 'Feriado - Independência do Brasil',
    data: '2026-09-07',
    tipo: 'feriado',
    descricao: 'Não haverá aula. A escola retoma as atividades normalmente no dia seguinte.',
  },
  {
    id: 2,
    titulo: 'Aula extra de Música',
    data: '2026-08-28',
    tipo: 'aula_extra',
    descricao: 'Aula especial de música às 14h no pátio coberto. Trazer garrafinha de água.',
  },
  {
    id: 3,
    titulo: 'Feriado - Dia das Crianças (recesso)',
    data: '2026-10-12',
    tipo: 'feriado',
    descricao: 'Recesso escolar. Retorno às aulas no dia 13/10.',
  },
];

export const MOCK_PROFILES: Record<number, ChildProfile> = {
  101: { faltas: 2, atividades_count: 18, sonecas: { quantidade: 14, duracao_media: 82 } },
  102: { faltas: 1, atividades_count: 24, sonecas: { quantidade: 9, duracao_media: 65 } },
};

export const MOCK_RECADOS: Record<number, Recado[]> = {
  101: [
    {
      id: 1,
      titulo: 'Levar troca de roupa',
      mensagem: 'Pedimos que enviem uma muda extra de roupa na mochila do Bento para essa semana.',
      data: '2026-08-20',
      autor: 'Prof.ª Marina',
    },
    {
      id: 2,
      titulo: 'Reunião de pais',
      mensagem: 'Reunião de pais e mestres marcada para o dia 05/09 às 19h no salão principal.',
      data: '2026-08-18',
      autor: 'Coordenação Pedagógica',
    },
  ],
  102: [
    {
      id: 3,
      titulo: 'Projeto Horta',
      mensagem: 'Alice pode trazer uma muda pequena de planta para o projeto Horta na sexta-feira.',
      data: '2026-08-19',
      autor: 'Prof. Rafael',
    },
  ],
};

export const MOCK_INVOICES: Record<number, Invoice[]> = {
  101: [
    {
      id: 1001,
      descricao: 'Mensalidade - Setembro/2026',
      valor: 890.0,
      vencimento: '2026-09-05',
      status: 'pendente',
      pago_em: null,
      multa: 0,
      juros: 0,
      desconto: 0,
      valor_total: 890.0,
    },
    { id: 1002, descricao: 'Mensalidade - Agosto/2026', valor: 890.0, vencimento: '2026-08-05', status: 'pago', pago_em: '2026-08-03' },
    { id: 1003, descricao: 'Mensalidade - Julho/2026', valor: 890.0, vencimento: '2026-07-05', status: 'pago', pago_em: '2026-07-04' },
    { id: 1004, descricao: 'Matrícula 2026', valor: 450.0, vencimento: '2026-01-15', status: 'pago', pago_em: '2026-01-10' },
  ],
  102: [
    {
      id: 2001,
      descricao: 'Mensalidade - Setembro/2026',
      valor: 950.0,
      vencimento: '2026-09-05',
      status: 'pendente',
      pago_em: null,
      multa: 0,
      juros: 0,
      desconto: 47.5,
      valor_total: 902.5,
    },
    {
      id: 2002,
      descricao: 'Mensalidade - Agosto/2026',
      valor: 950.0,
      vencimento: '2026-08-05',
      status: 'atrasado',
      pago_em: null,
      multa: 19.0,
      juros: 11.4,
      desconto: 0,
      valor_total: 980.4,
    },
    { id: 2003, descricao: 'Matrícula 2026', valor: 450.0, vencimento: '2026-01-15', status: 'pago', pago_em: '2026-01-12' },
  ],
};
