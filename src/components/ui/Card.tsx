import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { colors, radius, spacing } from '../../theme';

interface CardProps extends ViewProps {
  tint?: string;
}

export function Card({ style, tint, children, ...rest }: CardProps) {
  return (
    <View
      style={[styles.card, tint ? { backgroundColor: tint } : undefined, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
