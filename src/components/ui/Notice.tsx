import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';

type Tone = 'error' | 'info' | 'success';

const TONES: Record<Tone, { bg: string; fg: string }> = {
  error: { bg: colors.dangerSoft, fg: colors.danger },
  info: { bg: colors.sunnySoft, fg: colors.warning },
  success: { bg: colors.brandSoft, fg: colors.brandDark },
};

/** Faixa de mensagem (erros da API, avisos, confirmações). */
export function Notice({ message, tone = 'error' }: { message: string; tone?: Tone }) {
  const palette = TONES[tone];
  return (
    <View style={[styles.box, { backgroundColor: palette.bg }]} accessibilityRole="alert">
      <Text style={[styles.text, { color: palette.fg }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
