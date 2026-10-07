import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import type { PaymentMethod } from '../../types';

const OPTIONS: { method: PaymentMethod; icon: string; label: string; description: string }[] = [
  { method: 'CREDIT_CARD', icon: '💳', label: 'Cartão de crédito', description: 'Pague com os dados do seu cartão' },
  { method: 'PIX', icon: '⚡', label: 'Pix', description: 'QR code ou copia e cola, aprovação na hora' },
  { method: 'BOLETO', icon: '🧾', label: 'Boleto bancário', description: 'Vence em até 3 dias úteis' },
];

export function PaymentMethodPicker({ onSelect }: { onSelect: (method: PaymentMethod) => void }) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.method}
          style={styles.option}
          activeOpacity={0.7}
          onPress={() => onSelect(option.method)}
        >
          <Text style={styles.icon}>{option.icon}</Text>
          <View style={styles.texts}>
            <Text style={styles.label}>{option.label}</Text>
            <Text style={styles.description}>{option.description}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  texts: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
  },
});
