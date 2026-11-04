import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import React, { useContext } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useFloatingTabBarInset } from '../../navigation/floatingTabBar';
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
  // Dentro das abas a barra flutua sobre o conteúdo: reserva o espaço dela embaixo, e o rodapé
  // fixo (ex.: ciência) fica acima dela. Telas empilhadas (detalhe, calendário) não têm barra.
  const inTabs = useContext(BottomTabBarHeightContext) !== undefined;
  const tabInset = useFloatingTabBarInset();
  const bottomSpace = inTabs ? { paddingBottom: tabInset } : null;

  if (!scroll) {
    return (
      <SafeAreaView style={styles.safe} edges={edges}>
        <View style={[styles.container, bottomSpace, style]} {...rest}>
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <ScrollView
        {...scrollProps}
        contentContainerStyle={[styles.container, bottomSpace, style]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.brandDark} colors={[colors.brandDark]} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
      {footer ? <View style={inTabs ? { marginBottom: tabInset - spacing.md } : undefined}>{footer}</View> : null}
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
