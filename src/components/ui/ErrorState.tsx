import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { Icon } from './Icon';
import { TriangleAlert } from './icons';
import { colors, spacing } from '../../theme';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon icon={TriangleAlert} color="danger" />
      </View>
      <Text style={styles.title}>Não foi possível carregar</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <View style={styles.action}>
          <Button title="Tentar novamente" variant="outline" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerSoft,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  action: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
});
