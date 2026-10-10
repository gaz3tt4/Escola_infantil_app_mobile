import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../ui/Card';
import type { Aviso } from '../../services/types';
import { colors, spacing } from '../../theme';
import { formatDateBR } from '../../utils/format';

function periodo(aviso: Aviso): string {
  if (aviso.data_fim && aviso.data_fim !== aviso.data) {
    return `${formatDateBR(aviso.data)} a ${formatDateBR(aviso.data_fim)}`;
  }
  return formatDateBR(aviso.data);
}

/** Avisos da escola (admin, por turma): feriados, aulas extras e comunicados. */
export function AvisosList({ avisos }: { avisos: Aviso[] }) {
  if (avisos.length === 0) return null;

  return (
    <Card>
      <Text style={styles.title}>Avisos da escola</Text>
      <View style={styles.list}>
        {avisos.map((aviso) => (
          <View key={aviso.id} style={styles.item}>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>📣</Text>
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.periodo}>{periodo(aviso)}</Text>
              <Text style={styles.itemTitle}>{aviso.titulo}</Text>
              <Text style={styles.itemText}>{aviso.texto}</Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.md,
  },
  item: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandSoft,
  },
  icon: {
    fontSize: 16,
  },
  itemBody: {
    flex: 1,
  },
  periodo: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: colors.brandDark,
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
});
