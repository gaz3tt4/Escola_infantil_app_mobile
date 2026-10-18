import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon } from '../ui/Icon';
import { Barcode, ChevronRight, Zap } from '../ui/icons';
import type { LucideIcon } from 'lucide-react-native';
import type { FormaPagamento } from '../../services/faturas';
import { colors, radius, spacing } from '../../theme';

const OPTIONS: { forma: FormaPagamento; icon: LucideIcon; label: string; description: string }[] = [
  { forma: 'pix', icon: Zap, label: 'Pix', description: 'QR code ou copia e cola, compensação na hora' },
  { forma: 'boleto', icon: Barcode, label: 'Boleto bancário', description: 'Linha digitável ou PDF do boleto' },
];

interface PaymentMethodPickerProps {
  onSelect: (forma: FormaPagamento) => void;
  /** Modo seleção (radio) em vez de ação imediata. */
  selected?: FormaPagamento;
  disabled?: boolean;
}

export function PaymentMethodPicker({ onSelect, selected, disabled }: PaymentMethodPickerProps) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const isSelected = selected === option.forma;
        return (
          <TouchableOpacity
            key={option.forma}
            style={[styles.option, isSelected && styles.optionSelected]}
            activeOpacity={0.7}
            disabled={disabled}
            onPress={() => onSelect(option.forma)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled }}
          >
            <Icon icon={option.icon} color="brandDark" />
            <View style={styles.texts}>
              <Text style={styles.label}>{option.label}</Text>
              <Text style={styles.description}>{option.description}</Text>
            </View>
            {selected === undefined ? <Icon icon={ChevronRight} color="textMuted" /> : <View style={[styles.radio, isSelected && styles.radioOn]} />}
          </TouchableOpacity>
        );
      })}
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
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
  },
  optionSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
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
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
  },
  radioOn: {
    borderColor: colors.brandDark,
    borderWidth: 6,
  },
});
