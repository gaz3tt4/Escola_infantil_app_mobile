import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '../../theme';

export function Pill({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radius.pill,
    paddingVertical: spacing.xs / 2 + 2,
    paddingHorizontal: spacing.sm + 2,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
