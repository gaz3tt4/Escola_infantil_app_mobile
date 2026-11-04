import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Altura da pílula flutuante (design system: 64). */
export const FLOATING_TAB_BAR_HEIGHT = 64;

/** Distância mínima entre a barra e a borda inferior da tela. */
const BASE_MIN = 12;
/** Respiro entre a barra e o último item do conteúdo. */
const CONTENT_GAP = 16;
/** Folga extra acima da safe area (bottom = max(insets.bottom, 12) + 8). */
const BOTTOM_LIFT = 8;

/** Distância da barra até a borda inferior da tela. */
export function useFloatingTabBarBottom(): number {
  const { bottom } = useSafeAreaInsets();
  return Math.max(bottom, BASE_MIN) + BOTTOM_LIFT;
}

/**
 * Espaço que o conteúdo das abas reserva embaixo: altura da barra + distância da borda + respiro.
 * Como a barra flutua, ela não ocupa espaço no layout.
 */
export function useFloatingTabBarInset(): number {
  return FLOATING_TAB_BAR_HEIGHT + useFloatingTabBarBottom() + CONTENT_GAP;
}
