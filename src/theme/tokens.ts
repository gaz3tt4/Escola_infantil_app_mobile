import { useColorScheme } from 'react-native';

// Tokens do design system "Centopeia" (claro/escuro), com os mesmos nomes do painel web.
// O objeto `colors` (theme/index.ts) segue valendo para as telas ainda não migradas.

export interface Tokens {
  surface: string;
  surfaceRaised: string;
  surfaceSunken: string;
  line: string;
  lineStrong: string;
  ink: string;
  inkMuted: string;
  inkSubtle: string;
  primary: string;
  primaryHover: string;
  primarySoft: string;
  onPrimary: string;
  primaryStrong: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  focus: string;
  focusSoft: string;
  // Apoio (pílulas de status, avisos e fundos de tela): cores que não estão na lista base do design system.
  skySoft: string;
  skyStrong: string;
  lavenderSoft: string;
  lavenderStrong: string;
  mintSoft: string;
  sunny: string;
  overlay: string;
  dark: boolean;
}

export const lightTokens: Tokens = {
  // Fundo verde sutil (pouco saturado, perto do branco); cards seguem brancos.
  surface: '#f2f7ec',
  surfaceRaised: '#ffffff',
  surfaceSunken: '#e8f0df',
  line: '#dce6d1',
  lineStrong: '#8a90a0',
  ink: '#1b1d26',
  inkMuted: '#626878',
  inkSubtle: '#8a90a0',
  primary: '#84cc3a',
  primaryHover: '#76b930',
  primarySoft: '#eef8e2',
  onPrimary: '#1a2e05',
  primaryStrong: '#3f7a0f',
  accent: '#f26b4a',
  accentStrong: '#b8401f',
  accentSoft: '#feede8',
  warning: '#8a5a00',
  warningSoft: '#fff4d6',
  danger: '#c42a4b',
  dangerSoft: '#fdeaee',
  success: '#0f766e',
  successSoft: '#e0f4f1',
  focus: '#84cc3a',
  focusSoft: '#eef8e2',
  skySoft: '#e4f4fc',
  skyStrong: '#1e6fa8',
  lavenderSoft: '#edeafd',
  lavenderStrong: '#5b4fbf',
  mintSoft: '#e1fbf4',
  sunny: '#ffc53d',
  overlay: 'rgba(0,0,0,0.4)',
  dark: false,
};

export const darkTokens: Tokens = {
  // Toque mínimo de verde no escuro, sem perder contraste.
  surface: '#131814',
  surfaceRaised: '#1b201c',
  surfaceSunken: '#171b18',
  line: '#2b322d',
  lineStrong: '#6b7282',
  ink: '#e8eaf2',
  inkMuted: '#9aa1b2',
  inkSubtle: '#6b7282',
  primary: '#84cc3a',
  primaryHover: '#98d957',
  primarySoft: '#22331a',
  onPrimary: '#13200a',
  primaryStrong: '#9fdc5f',
  accent: '#ff8a6b',
  accentStrong: '#ff8a6b',
  accentSoft: '#3a2219',
  warning: '#f0c04a',
  warningSoft: '#332a12',
  danger: '#ff7a93',
  dangerSoft: '#3a1c24',
  success: '#34d3bf',
  successSoft: '#0f2e2b',
  focus: '#84cc3a',
  focusSoft: '#22331a',
  skySoft: '#14283a',
  skyStrong: '#6cc1f0',
  lavenderSoft: '#262046',
  lavenderStrong: '#b9afff',
  mintSoft: '#0f2e2b',
  sunny: '#f0c04a',
  overlay: 'rgba(0,0,0,0.6)',
  dark: true,
};

/** Tokens do tema do sistema (claro por padrão). */
export function useTokens(): Tokens {
  return useColorScheme() === 'dark' ? darkTokens : lightTokens;
}

/** Raios, espaços e margem do design system. */
export const ds = {
  radius: { sm: 6, md: 10, lg: 16, xl: 24, full: 999 },
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40 },
  margin: 20,
} as const;
