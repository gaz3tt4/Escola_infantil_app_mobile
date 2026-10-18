import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';

export interface ChipOption<T extends string | number> {
  value: T;
  label: string;
}

interface ChipSelectorProps<T extends string | number> {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Rolagem horizontal (lista de alunos) ou linha que quebra (opções curtas). */
  scroll?: boolean;
}

export function ChipSelector<T extends string | number>({ options, value, onChange, scroll = true }: ChipSelectorProps<T>) {
  const chips = options.map((option) => {
    const selected = option.value === value;
    return (
      <TouchableOpacity
        key={String(option.value)}
        onPress={() => onChange(option.value)}
        activeOpacity={0.8}
        style={[styles.chip, selected && styles.chipSelected]}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
      </TouchableOpacity>
    );
  });

  if (!scroll) {
    return <View style={styles.wrap}>{chips}</View>;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {chips}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs + 3,
    paddingHorizontal: spacing.md,
  },
  chipSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.onBrand,
    fontWeight: '700',
  },
});
