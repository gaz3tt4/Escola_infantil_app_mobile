// Paleta inspirada no protótipo visual de referência (colorful-campus-ui),
// convertida para hex já que React Native não suporta oklch() em estilos.
// Tons: school-green, sunny, coral, sky, lavender, mint.

export const colors = {
  schoolGreen: '#2F9E6E',
  schoolGreenDark: '#1F7A54',
  schoolGreenSoft: '#E3F6ED',

  sunny: '#FFC53D',
  sunnySoft: '#FFF4D6',

  coral: '#FF7A6E',
  coralSoft: '#FFE6E2',

  sky: '#4FB3E8',
  skySoft: '#E4F4FC',

  lavender: '#9B8CF2',
  lavenderSoft: '#EDEAFD',

  mint: '#3FD6B0',
  mintSoft: '#E1FBF4',

  background: '#FAFAF7',
  surface: '#FFFFFF',
  border: '#EDEDE6',

  textPrimary: '#2B2B24',
  textSecondary: '#767669',
  textMuted: '#A3A395',

  success: '#2F9E6E',
  warning: '#FFC53D',
  danger: '#E8543F',
} as const;

export type ColorToken = keyof typeof colors;

export const statusColors: Record<'pago' | 'pendente' | 'atrasado', { bg: string; fg: string }> = {
  pago: { bg: colors.schoolGreenSoft, fg: colors.schoolGreenDark },
  pendente: { bg: colors.sunnySoft, fg: '#946A00' },
  atrasado: { bg: colors.coralSoft, fg: '#B23A2C' },
};

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
