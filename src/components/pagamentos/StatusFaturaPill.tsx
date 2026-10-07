import React from 'react';

import { Pill } from '../ui/Pill';
import { STATUS_LABEL } from '../../services/faturas';
import type { StatusFatura } from '../../services/types';
import { colors } from '../../theme';

export const STATUS_FATURA_COLORS: Record<StatusFatura, { bg: string; fg: string }> = {
  pendente: { bg: colors.sunnySoft, fg: colors.warning },
  enviada: { bg: colors.skySoft, fg: '#1E6FA8' },
  paga: { bg: colors.brandSoft, fg: colors.brandDark },
  vencida: { bg: colors.coralSoft, fg: colors.danger },
  cancelada: { bg: colors.neutralSoft, fg: colors.neutral },
  falha: { bg: colors.lavenderSoft, fg: '#5B4FBF' },
};

export function StatusFaturaPill({ status }: { status: StatusFatura }) {
  const palette = STATUS_FATURA_COLORS[status];
  return <Pill label={STATUS_LABEL[status]} bg={palette.bg} fg={palette.fg} />;
}
