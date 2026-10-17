import type { LucideIcon } from 'lucide-react-native';

import { Apple, CookingPot, Sandwich, Utensils } from '../ui/icons';
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

/** Ordem das refeições ao longo do dia. */
export const ordemRefeicoes: TipoRefeicao[] = ['lanche_manha', 'almoco', 'lanche_tarde', 'jantar'];

export const refeicaoIcons: Record<TipoRefeicao, LucideIcon> = {
  lanche_manha: Apple,
  almoco: Utensils,
  lanche_tarde: Sandwich,
  jantar: CookingPot,
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
