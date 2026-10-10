import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../ui/Card';
import { Pill } from '../ui/Pill';
import type { Medicamento } from '../../services/types';
import { colors, spacing } from '../../theme';
import { formatDateBR, formatDateTimeBR } from '../../utils/format';

/** Medicamento informado pelo responsável, com a confirmação da escola. */
export function MedicamentoItem({ medicamento }: { medicamento: Medicamento }) {
  const status = medicamento.administrado
    ? `Administrado${medicamento.administrado_em ? ` em ${formatDateTimeBR(medicamento.administrado_em)}` : ''}${
        medicamento.administrado_por ? ` por ${medicamento.administrado_por}` : ''
      }`
    : 'Aguardando administração';

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>💊 {medicamento.nome}</Text>
        <Pill
          label={medicamento.administrado ? 'Administrado' : 'Aguardando'}
          bg={medicamento.administrado ? colors.brandSoft : colors.sunnySoft}
          fg={medicamento.administrado ? colors.brandDark : colors.warning}
        />
      </View>
      <Text style={styles.detail}>
        {medicamento.dose} · {medicamento.horario} · {formatDateBR(medicamento.data_administracao)}
      </Text>
      <Text style={styles.status}>{status}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  detail: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  status: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
