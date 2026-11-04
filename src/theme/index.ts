// Tema do app: cores (claro/escuro), espaçamentos, raios e tipografia.
// As cores vêm dos tokens do design system (tokens.ts) e são lidas com `useColors()`.
import { useMemo } from 'react';

import { lightPalette, useColors, type Palette } from './palette';

export { darkPalette, lightPalette, useColors, type Palette } from './palette';

/** Paleta clara estática: só para tipos (`ColorToken`) e usos fora de componentes. */
export const colors = lightPalette;

export type ColorToken = Exclude<keyof Palette, 'isDark'>;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export function makeTypography(palette: Palette) {
  return {
    title: { fontSize: 22, fontWeight: '800' as const, color: palette.textPrimary },
    sectionTitle: { fontSize: 17, fontWeight: '700' as const, color: palette.textPrimary },
    body: { fontSize: 14, color: palette.textPrimary },
    caption: { fontSize: 12, color: palette.textSecondary },
  };
}

/** Tipografia com a cor do tema atual. */
export function useTypography() {
  const palette = useColors();
  return useMemo(() => makeTypography(palette), [palette]);
}
