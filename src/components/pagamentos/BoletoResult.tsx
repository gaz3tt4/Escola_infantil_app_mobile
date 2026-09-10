import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { colors, radius, spacing } from '../../theme/colors';
import type { BoletoPaymentResult } from '../../types';

export function BoletoResult({ data }: { data: BoletoPaymentResult }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await Clipboard.setStringAsync(data.linha_digitavel);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleOpenPdf() {
    try {
      await Linking.openURL(data.boleto_url);
    } catch {
      Alert.alert('Não foi possível abrir o boleto', 'Copie a linha digitável e pague no app do seu banco.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Pague com a linha digitável no app do seu banco ou abra o PDF do boleto.</Text>

      <View style={styles.codeBox}>
        <Text style={styles.code}>{data.linha_digitavel}</Text>
      </View>

      <TouchableOpacity style={styles.copyButton} activeOpacity={0.8} onPress={handleCopy}>
        <Text style={styles.copyButtonText}>{copied ? 'Copiado!' : 'Copiar linha digitável'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.outlineButton} activeOpacity={0.8} onPress={handleOpenPdf}>
        <Text style={styles.outlineButtonText}>Abrir boleto em PDF</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  codeBox: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  code: {
    fontSize: 13,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  copyButton: {
    borderRadius: radius.pill,
    paddingVertical: spacing.md - 2,
    alignItems: 'center',
    backgroundColor: colors.schoolGreen,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    borderRadius: radius.pill,
    paddingVertical: spacing.md - 2,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.schoolGreen,
  },
  outlineButtonText: {
    color: colors.schoolGreenDark,
    fontSize: 16,
    fontWeight: '600',
  },
});
