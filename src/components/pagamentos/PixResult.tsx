import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { colors, radius, spacing } from '../../theme';
import type { PixPaymentResult } from '../../types';

export function PixResult({ data }: { data: PixPaymentResult }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await Clipboard.setStringAsync(data.copia_cola);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Escaneie o QR code no app do seu banco ou copie o código abaixo.</Text>

      <View style={styles.qrWrapper}>
        <Image
          source={{ uri: `data:image/png;base64,${data.qr_code_base64}` }}
          style={styles.qr}
          resizeMode="contain"
        />
      </View>

      <View style={styles.codeBox}>
        <Text style={styles.code} numberOfLines={3}>
          {data.copia_cola}
        </Text>
      </View>

      <TouchableOpacity style={styles.copyButton} activeOpacity={0.8} onPress={handleCopy}>
        <Text style={styles.copyButtonText}>{copied ? 'Copiado!' : 'Copiar código Pix'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    alignItems: 'center',
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  qrWrapper: {
    width: 180,
    height: 180,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qr: {
    width: 160,
    height: 160,
  },
  codeBox: {
    alignSelf: 'stretch',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  code: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  copyButton: {
    alignSelf: 'stretch',
    borderRadius: radius.pill,
    paddingVertical: spacing.md - 2,
    alignItems: 'center',
    backgroundColor: colors.brand,
  },
  copyButtonText: {
    color: colors.onBrand,
    fontSize: 16,
    fontWeight: '600',
  },
});
