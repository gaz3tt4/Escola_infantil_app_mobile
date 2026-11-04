import React from 'react';

import { Pill } from '../ui/Pill';
import { STATUS_LABEL } from '../../services/faturas';
import type { StatusFatura } from '../../services/types';
import { useColors, type Palette } from '../../theme';

export const statusFaturaColors = (colors: Palette): Record<StatusFatura, { bg: string; fg: string }> => ({
  pendente: { bg: colors.sunnySoft, fg: colors.warning },
  enviada: { bg: colors.skySoft, fg: colors.skyStrong },
  paga: { bg: colors.brandSoft, fg: colors.brandDark },
  vencida: { bg: colors.coralSoft, fg: colors.danger },
  cancelada: { bg: colors.neutralSoft, fg: colors.neutral },
  falha: { bg: colors.lavenderSoft, fg: colors.lavenderStrong },
});

export function StatusFaturaPill({ status }: { status: StatusFatura }) {
  const palette = statusFaturaColors(useColors())[status];
  return <Pill label={STATUS_LABEL[status]} bg={palette.bg} fg={palette.fg} />;
}
