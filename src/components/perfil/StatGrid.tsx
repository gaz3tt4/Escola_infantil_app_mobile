import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import type { ChildProfile } from '../../types';

interface StatItem {
  icon: string;
  label: string;
  value: string;
  bg: string;
  fg: string;
}

export function StatGrid({ profile }: { profile: ChildProfile }) {
  const items: StatItem[] = [
    { icon: '📅', label: 'Faltas', value: String(profile.faltas), bg: colors.coralSoft, fg: '#B23A2C' },
    { icon: '🎨', label: 'Atividades', value: String(profile.atividades_count), bg: colors.skySoft, fg: '#1E6FA8' },
    {
      icon: '😴',
      label: 'Sonecas',
      value: `${profile.sonecas.quantidade} · ${profile.sonecas.duracao_media} min`,
      bg: colors.lavenderSoft,
      fg: '#5B4FBF',
    },
  ];

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={[styles.statCard, { backgroundColor: item.bg }]}>
          <Text style={styles.icon}>{item.icon}</Text>
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
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
