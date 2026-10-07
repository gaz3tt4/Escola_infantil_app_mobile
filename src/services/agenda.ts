// TODO(backend): a API não tem endpoints de relatório diário nem de agenda/lembretes.
// Este serviço devolve dados mockados. Quando os endpoints existirem, trocar só as
// funções abaixo; os tipos já descrevem o que a tela precisa.

import { hashString, mockDelay, pick, seeded } from './mocks/mock';
import { addDaysISO, todayISO } from '../utils/format';

export type NivelAlimentacao = 'nao_comeu' | 'comeu_pouco' | 'comeu_bem' | 'comeu_tudo';
export type NivelSono = 'nao_dormiu' | 'dormiu_pouco' | 'dormiu_bem';
export type NivelHigiene = 'trocado' | 'usou_banheiro' | 'sem_ocorrencias';
export type Humor = 'feliz' | 'calmo' | 'agitado' | 'choroso' | 'cansado';

export interface RelatorioDiario {
  data: string; // Y-m-d
  alimentacao: { nivel: NivelAlimentacao; descricao: string };
  sono: { nivel: NivelSono; duracaoMinutos: number | null };
  higiene: { nivel: NivelHigiene; observacao: string | null };
  humor: Humor;
  atividades: string[];
  observacoesProfessor: string | null;
}

export type TipoLembrete = 'feriado' | 'aula_extra';

export interface Lembrete {
  id: number;
  titulo: string;
  data: string; // Y-m-d
  tipo: TipoLembrete;
  descricao: string;
}

const ATIVIDADES = [
  'Pintura com guache',
  'Roda de música',
  'Brincadeira no parque',
  'Contação de história',
  'Massinha de modelar',
  'Circuito motor',
  'Projeto Horta',
  'Jogos de encaixe',
] as const;

const ALIMENTACAO: readonly { nivel: NivelAlimentacao; descricao: string }[] = [
  { nivel: 'comeu_tudo', descricao: 'Comeu tudo e repetiu o suco.' },
  { nivel: 'comeu_bem', descricao: 'Comeu bem no almoço, recusou a fruta da tarde.' },
  { nivel: 'comeu_pouco', descricao: 'Comeu pouco no lanche, melhorou no almoço.' },
];

const OBSERVACOES = [
  'Participou bem das atividades e brincou bastante com os colegas.',
  'Ficou mais quietinho hoje, mas participou das atividades normalmente.',
  'Dia tranquilo e produtivo!',
  null,
] as const;

/** Relatório diário do aluno na data (null em fim de semana ou dia futuro). */
export async function obterRelatorioDiario(alunoId: number, data: string): Promise<RelatorioDiario | null> {
  // TODO(backend): substituir pelo endpoint de relatório diário do aluno.
  const diaDaSemana = new Date(`${data}T12:00:00`).getDay();
  if (diaDaSemana === 0 || diaDaSemana === 6 || data > todayISO()) {
    return mockDelay(null);
  }

  const seed = alunoId * 1000 + hashString(data);
  const dormiuBem = seeded(seed + 2) > 0.3;
  const atividades = [pick(ATIVIDADES, seed + 3), pick(ATIVIDADES, seed + 4)].filter(
    (atividade, index, lista) => lista.indexOf(atividade) === index
  );

  return mockDelay({
    data,
    alimentacao: pick(ALIMENTACAO, seed + 1),
    sono: dormiuBem
      ? { nivel: 'dormiu_bem', duracaoMinutos: 70 + Math.floor(seeded(seed + 5) * 40) }
      : { nivel: 'dormiu_pouco', duracaoMinutos: 30 + Math.floor(seeded(seed + 5) * 20) },
    higiene: { nivel: pick(['trocado', 'usou_banheiro', 'sem_ocorrencias'] as const, seed + 6), observacao: null },
    humor: pick(['feliz', 'calmo', 'agitado', 'cansado'] as const, seed + 7),
    atividades,
    observacoesProfessor: pick(OBSERVACOES, seed + 8),
  });
}

/** Próximos lembretes da escola (feriados, aulas extras). */
export async function listarLembretes(): Promise<Lembrete[]> {
  // TODO(backend): substituir pelo endpoint de agenda/lembretes da escola.
  const hoje = todayISO();
  return mockDelay([
    {
      id: 1,
      titulo: 'Aula extra de Música',
      data: addDaysISO(hoje, 3),
      tipo: 'aula_extra',
      descricao: 'Aula especial de música às 14h no pátio coberto. Trazer garrafinha de água.',
    },
    {
      id: 2,
      titulo: 'Recesso escolar',
      data: addDaysISO(hoje, 9),
      tipo: 'feriado',
      descricao: 'Não haverá aula. As atividades voltam normalmente no dia seguinte.',
    },
  ]);
}
