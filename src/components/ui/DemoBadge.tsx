import React from 'react';

import { Pill } from './Pill';
import { colors } from '../../theme';

/** Marca conteúdo vindo de serviço mockado (sem endpoint no backend ainda). */
export function DemoBadge() {
  return <Pill label="Demonstração" bg={colors.lavenderSoft} fg="#5B4FBF" />;
}
