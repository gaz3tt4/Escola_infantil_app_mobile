import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { LucideIcon } from 'lucide-react-native';

import { Icon } from '../ui/Icon';
import { CalendarCheck, CalendarX } from '../ui/icons';
import type { ResumoMes } from '../../services/types';
import { radius, spacing, useColors } from '../../theme';

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string;
  bg: string;
  fg: string;
}

export function StatGrid({ resumo }: { resumo?: ResumoMes }) {
  const colors = useColors();
  const fmt = (n?: number) => (resumo ? String(n) : '—');
  const items: StatItem[] = [
    { icon: CalendarCheck, label: 'Presença', value: fmt(resumo?.presencas), bg: colors.skySoft, fg: colors.skyStrong },
    { icon: CalendarX, label: 'Faltas', value: fmt(resumo?.faltas), bg: colors.coralSoft, fg: colors.danger },
  ];

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={[styles.statCard, { backgroundColor: item.bg }]}>
          <Icon icon={item.icon} color={item.fg} />
          <Text style={[styles.value, { color: item.fg }]}>{item.value}</Text>
          <Text style={[styles.label, { color: item.fg }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    alignItems: 'center',
    gap: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
