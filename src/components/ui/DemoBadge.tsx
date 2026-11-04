import React from 'react';

import { Pill } from './Pill';
import { useColors } from '../../theme';

/** Marca conteúdo vindo de serviço mockado (sem endpoint no backend ainda). */
export function DemoBadge() {
  const colors = useColors();
  return <Pill label="Demonstração" bg={colors.lavenderSoft} fg={colors.lavenderStrong} />;
}
