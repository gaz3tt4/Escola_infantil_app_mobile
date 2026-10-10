import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ResumoAluno } from '../../services/perfil';
import { colors, radius, spacing } from '../../theme';

interface StatItem {
  icon: string;
  label: string;
  value: string;
  bg: string;
  fg: string;
}

export function StatGrid({ resumo }: { resumo: ResumoAluno }) {
  const items: StatItem[] = [
    { icon: '📅', label: 'Faltas', value: String(resumo.faltas), bg: colors.coralSoft, fg: colors.danger },
    { icon: '🎨', label: 'Atividades', value: String(resumo.atividades), bg: colors.skySoft, fg: '#1E6FA8' },
    {
      icon: '😴',
      label: 'Sonecas',
      value: `${resumo.sonecas.quantidade} · ${resumo.sonecas.duracaoMediaMin}min`,
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
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '45%',
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
    fontSize: 16,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
