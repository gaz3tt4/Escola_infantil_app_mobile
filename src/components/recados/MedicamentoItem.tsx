import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Card } from '../ui/Card';
import { Pill } from '../ui/Pill';
import { medicamentoEditavel } from '../../services/medicamentos';
import type { Medicamento } from '../../services/types';
import { colors, spacing } from '../../theme';
import { formatDateBR, formatDateTimeBR } from '../../utils/format';

/** Medicamento informado pelo responsável, com a confirmação da escola. */
export function MedicamentoItem({
  medicamento,
  onEdit,
  onDelete,
  busy,
}: {
  medicamento: Medicamento;
  onEdit?: (medicamento: Medicamento) => void;
  onDelete?: (medicamento: Medicamento) => void;
  busy?: boolean;
}) {
  // Só o autor, no prazo e antes de administrado; fora disso as ações somem.
  const editavel = medicamentoEditavel(medicamento);
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
      {editavel && (onEdit || onDelete) ? (
        <View style={styles.actions}>
          {onEdit ? (
            <TouchableOpacity onPress={() => onEdit(medicamento)} disabled={busy} accessibilityRole="button">
              <Text style={styles.action}>Editar</Text>
            </TouchableOpacity>
          ) : null}
          {onDelete ? (
            <TouchableOpacity onPress={() => onDelete(medicamento)} disabled={busy} accessibilityRole="button">
              <Text style={[styles.action, styles.danger]}>Apagar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
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
  actions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  action: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brandDark,
  },
  danger: {
    color: colors.danger,
  },
});
