import { useColorScheme } from 'react-native';

import { darkTokens, lightTokens, type Tokens } from './tokens';

/**
 * Paleta com os nomes que o app já usa (`colors.brandDark`, `colors.background`...), derivada dos
 * tokens do design system (src/theme/tokens.ts) para cada tema. Telas e componentes leem com
 * `useColors()`; nada de hex fixo nos estilos.
 */
function paletteFrom(t: Tokens) {
  return {
    /** true no tema escuro (sombras viram borda). */
    isDark: t.dark,

    brand: t.primary,
    brandDark: t.primaryStrong,
    brandSoft: t.primarySoft,
    onBrand: t.onPrimary,

    sunny: t.sunny,
    sunnySoft: t.warningSoft,

    coral: t.accent,
    coralSoft: t.accentSoft,
    coralStrong: t.accentStrong,

    skySoft: t.skySoft,
    skyStrong: t.skyStrong,

    lavenderSoft: t.lavenderSoft,
    lavenderStrong: t.lavenderStrong,

    mintSoft: t.mintSoft,

    /** Fundo das telas. */
    background: t.surface,
    /** Cards, campos e folhas (surface-raised). */
    surface: t.surfaceRaised,
    surfaceSunken: t.surfaceSunken,
    border: t.line,
    overlay: t.overlay,

    textPrimary: t.ink,
    textSecondary: t.inkMuted,
    /** Texto de apoio: ink-muted (ink-subtle não passa em AA, fica só para placeholder). */
    textMuted: t.inkMuted,
    placeholder: t.inkSubtle,

    success: t.primaryStrong,
    warning: t.warning,
    danger: t.danger,
    dangerSoft: t.dangerSoft,
    neutralSoft: t.surfaceSunken,
    neutral: t.inkMuted,
  };
}

export type Palette = ReturnType<typeof paletteFrom>;

export const lightPalette: Palette = paletteFrom(lightTokens);
export const darkPalette: Palette = paletteFrom(darkTokens);

/** Paleta do tema do sistema. */
export function useColors(): Palette {
  return useColorScheme() === 'dark' ? darkPalette : lightPalette;
}
