import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { colors, type ColorToken } from '../../theme';

/** Tamanhos do design system do painel web: 16 px (sm) e 24 px (md). */
const SIZES = { sm: 16, md: 24 } as const;
export type IconSize = keyof typeof SIZES;

/** Espessura do traço, igual à do painel web. */
const STROKE_WIDTH = 1.8;

interface IconProps {
  /** Ícone Lucide (veja `icons.ts`). */
  icon: LucideIcon;
  size?: IconSize;
  /** Token do tema (`colors`); aceita também um valor de cor já definido no design system. */
  color?: ColorToken | (string & {});
  /**
   * Ícone com significado próprio: vira imagem acessível com este rótulo.
   * Sem `label` o ícone é decorativo e fica oculto do leitor de tela.
   */
  label?: string;
}

/** Ícone Lucide do app: traço 1,8, tamanhos sm/md, cor do tema e acessibilidade como no painel web. */
export function Icon({ icon: Glyph, size = 'md', color = 'textPrimary', label }: IconProps) {
  const resolved = color in colors ? colors[color as ColorToken] : color;
  const pixels = SIZES[size];

  return (
    <View
      accessible={!!label}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      accessibilityElementsHidden={!label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
    >
      <Glyph size={pixels} color={resolved} strokeWidth={STROKE_WIDTH} />
    </View>
  );
}
