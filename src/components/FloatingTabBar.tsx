import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { LucideIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { FLOATING_TAB_BAR_HEIGHT, useFloatingTabBarBottom } from '../navigation/floatingTabBar';
import { font } from '../theme/fonts';
import { ds, useTokens } from '../theme/tokens';
import { Icon } from './ui/Icon';

const ITEM_SIZE = 48;
const MAX_WIDTH = 420;
const WIDE_SCREEN = 600;
const DURATION_MS = 200;
/** Texto do badge: ink sobre accent passa de 4,5:1 nos dois temas. */
const ON_ACCENT = '#1b1d26';

interface FloatingTabBarProps extends BottomTabBarProps {
  icons: Record<string, LucideIcon>;
}

/** true enquanto o teclado está aberto (a barra some para não cobrir os campos). */
function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () =>
      setVisible(true)
    );
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () =>
      setVisible(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}

/** Barra de abas flutuante: pílula suspensa, aba ativa em primary com rótulo ao lado do ícone. */
export function FloatingTabBar({ state, descriptors, navigation, icons }: FloatingTabBarProps) {
  const t = useTokens();
  const { width } = useWindowDimensions();
  const bottom = useFloatingTabBarBottom();
  const reducedMotion = useReducedMotion();
  const keyboardVisible = useKeyboardVisible();

  if (keyboardVisible) return null;

  const side = width >= WIDE_SCREEN ? 20 : 16;
  const layout = reducedMotion
    ? undefined
    : LinearTransition.duration(DURATION_MS).easing(Easing.out(Easing.cubic));

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { left: side, right: side, bottom }]}>
      <View
        accessibilityRole="tablist"
        style={[
          styles.bar,
          { backgroundColor: t.surfaceRaised, borderColor: t.dark ? t.line : 'rgba(28,39,76,0.08)' },
          !t.dark && styles.shadow,
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = options.title ?? route.name;
          const badge = typeof options.tabBarBadge === 'number' ? options.tabBarBadge : null;
          const a11yLabel = badge
            ? `${label}, ${badge} ${badge === 1 ? 'pendência' : 'pendências'}`
            : label;
          const color = focused ? t.onPrimary : t.inkMuted;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={a11yLabel}
              hitSlop={4}
            >
              <Animated.View
                layout={layout}
                style={[styles.item, focused ? [styles.itemActive, { backgroundColor: t.primary }] : null]}
              >
                <View>
                  <Icon icon={icons[route.name]} color={color} />
                  {badge ? (
                    <View style={[styles.badge, { backgroundColor: t.accent, borderColor: t.surfaceRaised }]}>
                      <Text style={styles.badgeText}>{badge > 9 ? '9+' : String(badge)}</Text>
                    </View>
                  ) : null}
                </View>
                {focused ? (
                  <Animated.Text
                    entering={reducedMotion ? undefined : FadeIn.duration(DURATION_MS)}
                    exiting={reducedMotion ? undefined : FadeOut.duration(100)}
                    numberOfLines={1}
                    style={[styles.label, { color: t.onPrimary }]}
                  >
                    {label}
                  </Animated.Text>
                ) : null}
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    height: FLOATING_TAB_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: ds.space[2],
    borderRadius: ds.radius.full,
    borderWidth: 1,
  },
  shadow: {
    shadowColor: '#1c274c',
    shadowOpacity: 0.14,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  item: {
    minWidth: ITEM_SIZE,
    height: ITEM_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ds.space[2],
    borderRadius: ds.radius.full,
  },
  itemActive: {
    paddingHorizontal: ds.space[4],
  },
  label: {
    fontFamily: font.semibold,
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: ON_ACCENT,
    fontFamily: font.bold,
    fontSize: 11,
    lineHeight: 14,
  },
});
