import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { Icon } from '../ui/Icon';
import { font } from '../../theme/fonts';
import { ds, useTokens } from '../../theme/tokens';

interface PrimaryButtonProps {
  title: string;
  /** Rótulo durante o envio. */
  loadingTitle?: string;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

/** Botão principal: largura total, 48 px, primary com texto on-primary e sombra verde (só no claro). */
export function PrimaryButton({ title, loadingTitle, icon, loading, disabled, onPress }: PrimaryButtonProps) {
  const t = useTokens();
  const blocked = loading || disabled;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={blocked}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={loading ? (loadingTitle ?? title) : title}
      accessibilityState={{ disabled: !!blocked, busy: !!loading }}
      style={[
        styles.base,
        { backgroundColor: t.primary },
        !t.dark && styles.shadow,
        blocked && styles.blocked,
      ]}
    >
      {loading ? <ActivityIndicator color={t.onPrimary} /> : null}
      <Text style={[styles.text, { color: t.onPrimary }]}>{loading ? (loadingTitle ?? title) : title}</Text>
      {!loading && icon ? <Icon icon={icon} color={t.onPrimary} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    minHeight: 48,
    borderRadius: ds.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ds.space[2],
    paddingHorizontal: ds.space[6],
  },
  shadow: {
    shadowColor: '#6baa28',
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  blocked: {
    opacity: 0.7,
  },
  text: {
    fontFamily: font.semibold,
    fontSize: 16,
    lineHeight: 24,
  },
});
