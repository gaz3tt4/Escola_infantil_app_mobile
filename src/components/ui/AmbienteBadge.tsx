import React from 'react';

import { Pill } from './Pill';
import { AMBIENTE } from '../../services/config';
import { useColors } from '../../theme';

/** Selo discreto fora de produção, para não confundir os ambientes. Em produção não renderiza nada. */
export function AmbienteBadge() {
  const colors = useColors();
  if (AMBIENTE === 'producao') return null;
  return <Pill label={AMBIENTE === 'homologacao' ? 'Homologação' : 'Ambiente de testes'} bg={colors.sunnySoft} fg={colors.warning} />;
}
