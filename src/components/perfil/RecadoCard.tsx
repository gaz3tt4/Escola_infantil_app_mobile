import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../ui/Card';
import { colors, spacing } from '../../theme';
import { formatDateBR } from '../../utils/format';
import type { Recado } from '../../services/perfil';

export function RecadoCard({ recado }: { recado: Recado }) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{recado.titulo}</Text>
        <Text style={styles.date}>{formatDateBR(recado.data)}</Text>
      </View>
      <Text style={styles.message}>{recado.mensagem}</Text>
      <Text style={styles.author}>— {recado.autor}</Text>
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
    color: colors.textSecondary,
    lineHeight: 20,
  },
  author: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
