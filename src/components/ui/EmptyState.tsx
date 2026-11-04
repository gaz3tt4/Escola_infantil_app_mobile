import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { LucideIcon } from 'lucide-react-native';

import { Icon } from './Icon';
import { Inbox } from './icons';
import { spacing, useColors, type Palette } from '../../theme';

export function EmptyState({ icon = Inbox, title, description }: { icon?: LucideIcon; title: string; description?: string }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon icon={icon} color="brandDark" />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandSoft,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
