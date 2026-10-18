import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '../../theme';

interface ScreenContainerProps extends ViewProps {
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Bordas com safe area. Telas com header da pilha usam []. */
  edges?: Edge[];
  /** Props extras do ScrollView (ex.: medir a rolagem). */
  scrollProps?: ScrollViewProps;
  /** Rodapé fixo abaixo da área rolável (ex.: botão de ciência). */
  footer?: React.ReactNode;
}

export function ScreenContainer({
  children,
  style,
  scroll = true,
  refreshing,
  onRefresh,
  edges = ['top'],
  scrollProps,
  footer,
  ...rest
}: ScreenContainerProps) {
  if (!scroll) {
    return (
      <SafeAreaView style={styles.safe} edges={edges}>
        <View style={[styles.container, style]} {...rest}>
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <ScrollView
        {...scrollProps}
        contentContainerStyle={[styles.container, style]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.brandDark} colors={[colors.brandDark]} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
});
