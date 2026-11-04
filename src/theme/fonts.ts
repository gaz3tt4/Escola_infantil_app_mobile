import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';

/** Fontes carregadas com `useFonts` em App.tsx (Plus Jakarta Sans 400/500/600/700). */
export const fontAssets = {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
};

export const font = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

/** Escala tipográfica do mobile (body e body-sm com +2 px sobre a web). */
export const type = {
  display: { fontFamily: font.bold, fontSize: 32, lineHeight: 40 },
  heading1: { fontFamily: font.bold, fontSize: 24, lineHeight: 32 },
  heading2: { fontFamily: font.semibold, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: font.regular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: font.semibold, fontSize: 16, lineHeight: 24 },
  bodySm: { fontFamily: font.regular, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: font.medium, fontSize: 12, lineHeight: 16 },
} as const;
