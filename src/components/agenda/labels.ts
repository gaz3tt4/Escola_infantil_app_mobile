import type {
  AceitacaoRefeicao,
  AspectoXixi,
  SegmentoTurma,
  TipoEvacuacao,
  TipoRefeicao,
} from '../../services/types';

export const segmentoLabels: Record<SegmentoTurma, string> = {
  B: 'Berçário',
  I: 'Infantil',
};

export const refeicaoLabels: Record<TipoRefeicao, string> = {
  lanche_manha: 'Lanche da manhã',
  almoco: 'Almoço',
  lanche_tarde: 'Lanche da tarde',
  jantar: 'Jantar',
};

export const refeicaoIcons: Record<TipoRefeicao, string> = {
  lanche_manha: '🍎',
  almoco: '🍽️',
  lanche_tarde: '🥪',
  jantar: '🍲',
};

export const aceitacaoLabels: Record<AceitacaoRefeicao, string> = {
  pouco: 'Comeu pouco',
  metade: 'Comeu metade',
  recusou: 'Recusou',
  tudo: 'Comeu tudo',
};

export const evacuacaoLabels: Record<TipoEvacuacao, string> = {
  normal: 'Normal',
  pastoso: 'Pastoso',
  semipastoso: 'Semipastoso',
};

export const xixiLabels: Record<AspectoXixi, string> = {
  normal: 'Normal',
  escuro: 'Escuro',
};
