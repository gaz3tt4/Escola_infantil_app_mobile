// Tema único do app: cores, espaçamentos, raios e tipografia.
// Paleta baseada no conceito do protótipo (verde da marca + tons alegres),
// em hex porque o React Native não suporta oklch().

export const colors = {
  // Verde da marca. Texto branco sobre #84CC3A não tem contraste suficiente,
  // então botões/realces usam `onBrand` como cor de texto, e textos/ícones
  // verdes sobre fundo claro usam `brandDark`.
  brand: '#84CC3A',
  brandDark: '#3F6B12',
  brandSoft: '#EEF8E2',
  onBrand: '#1C3008',

  sunny: '#FFC53D',
  sunnySoft: '#FFF4D6',

  // Coral: cabeça do mascote e alertas suaves.
  coral: '#FF7A6E',
  coralSoft: '#FFE6E2',

  sky: '#4FB3E8',
  skySoft: '#E4F4FC',

  lavender: '#9B8CF2',
  lavenderSoft: '#EDEAFD',

  mint: '#3FD6B0',
  mintSoft: '#E1FBF4',

  background: '#F8FAF3',
  surface: '#FFFFFF',
  border: '#E6EBDD',
  overlay: 'rgba(0,0,0,0.4)',

  textPrimary: '#26301C',
  textSecondary: '#6B7262',
  textMuted: '#9AA092',

  success: '#3F6B12',
  warning: '#946A00',
  danger: '#C2412F',
  dangerSoft: '#FDECEA',
  neutralSoft: '#EEEFEA',
  neutral: '#5F6458',
} as const;

export type ColorToken = keyof typeof colors;

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

export const typography = {
  title: { fontSize: 22, fontWeight: '800' as const, color: colors.textPrimary },
  sectionTitle: { fontSize: 17, fontWeight: '700' as const, color: colors.textPrimary },
  body: { fontSize: 14, color: colors.textPrimary },
  caption: { fontSize: 12, color: colors.textSecondary },
};
