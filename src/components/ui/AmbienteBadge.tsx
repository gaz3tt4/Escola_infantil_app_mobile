import React from 'react';

import { Pill } from './Pill';
import { AMBIENTE } from '../../services/config';
import { colors } from '../../theme';

/** Selo discreto fora de produção, para não confundir os ambientes. Em produção não renderiza nada. */
export function AmbienteBadge() {
  if (AMBIENTE === 'producao') return null;
  return <Pill label={AMBIENTE === 'homologacao' ? 'Homologação' : 'Ambiente de testes'} bg={colors.sunnySoft} fg={colors.warning} />;
}
