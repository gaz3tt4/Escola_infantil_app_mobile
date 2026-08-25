import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../ui/Card';
import { colors, spacing } from '../../theme/colors';
import { formatDateBR } from '../../utils/format';
import type { Reminder } from '../../types';

const TIPO_META: Record<Reminder['tipo'], { icon: string; bg: string; fg: string; label: string }> = {
  feriado: { icon: '🎉', bg: colors.coralSoft, fg: '#B23A2C', label: 'Feriado' },
  aula_extra: { icon: '⭐', bg: colors.lavenderSoft, fg: '#5B4FBF', label: 'Aula extra' },
};

function ReminderItem({ reminder }: { reminder: Reminder }) {
  const meta = TIPO_META[reminder.tipo];
  return (
    <View style={styles.item}>
      <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
        <Text style={styles.icon}>{meta.icon}</Text>
      </View>
      <View style={styles.itemBody}>
        <Text style={[styles.tipoLabel, { color: meta.fg }]}>{meta.label} · {formatDateBR(reminder.data)}</Text>
        <Text style={styles.itemTitle}>{reminder.titulo}</Text>
        <Text style={styles.itemDescription}>{reminder.descricao}</Text>
      </View>
    </View>
  );
}

export function RemindersList({ reminders }: { reminders: Reminder[] }) {
  return (
    <Card>
      <Text style={styles.title}>Lembretes</Text>
      {reminders.length === 0 ? (
        <Text style={styles.empty}>Nenhum lembrete por enquanto.</Text>
      ) : (
        <View style={styles.list}>
          {reminders.map((reminder) => (
            <ReminderItem key={reminder.id} reminder={reminder} />
          ))}
        </View>
      )}
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
  empty: {
    color: colors.textSecondary,
    fontSize: 13,
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
  },
  icon: {
    fontSize: 16,
  },
  itemBody: {
    flex: 1,
  },
  tipoLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
});
