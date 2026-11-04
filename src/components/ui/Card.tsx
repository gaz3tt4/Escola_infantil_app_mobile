import React, { useMemo } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { radius, spacing, useColors, type Palette } from '../../theme';

interface CardProps extends ViewProps {
  tint?: string;
}

export function Card({ style, tint, children, ...rest }: CardProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View
      style={[styles.card, tint ? { backgroundColor: tint } : undefined, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    // Claro: sombra do card do design system. Escuro: a separação vem da borda.
    ...(colors.isDark
      ? { borderWidth: 1, borderColor: colors.border }
      : {
          shadowColor: '#1c274c',
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
          elevation: 2,
        }),
  },
});
