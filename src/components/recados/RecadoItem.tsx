import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Card } from '../ui/Card';
import { recadoEditavel } from '../../services/recados';
import type { Recado } from '../../services/types';
import { colors, spacing } from '../../theme';
import { formatDateBR } from '../../utils/format';

function autorLabel(recado: Recado): string {
  if (recado.autor.papel === 'responsavel') return 'Você';
  if (recado.autor.papel === 'admin') return `${recado.autor.nome} (escola)`;
  return recado.autor.nome;
}

/** O `tipo` é texto livre para o app: só destaca as atividades do dia. */
export function RecadoItem({
  recado,
  onEdit,
  onDelete,
  busy,
}: {
  recado: Recado;
  onEdit?: (recado: Recado) => void;
  onDelete?: (recado: Recado) => void;
  busy?: boolean;
}) {
  const atividades = recado.tipo === 'atividades';
  // Fora do prazo as ações somem.
  const editavel = recadoEditavel(recado);
  return (
    <Card style={styles.card} tint={atividades ? colors.brandSoft : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>{atividades ? '🎨 Atividades do dia' : '💌 Recado'}</Text>
        <Text style={styles.date}>{formatDateBR(recado.data)}</Text>
      </View>
      <Text style={styles.message}>{recado.texto}</Text>
      <Text style={styles.author}>— {autorLabel(recado)}</Text>
      {editavel && (onEdit || onDelete) ? (
        <View style={styles.actions}>
          {onEdit ? (
            <TouchableOpacity onPress={() => onEdit(recado)} disabled={busy} accessibilityRole="button">
              <Text style={styles.action}>Editar</Text>
            </TouchableOpacity>
          ) : null}
          {onDelete ? (
            <TouchableOpacity onPress={() => onDelete(recado)} disabled={busy} accessibilityRole="button">
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
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
  },
  message: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
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
  author: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
