import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { AmbienteBadge } from '../ui/AmbienteBadge';
import { Mascote } from '../ui/Mascote';
import { ds, useTokens } from '../../theme/tokens';
import { font, type } from '../../theme/fonts';

interface BrandPanelProps {
  /** Teclado aberto: o mascote encolhe de 160 para 96 px. */
  compact?: boolean;
  /** Safe area do topo: o painel verde vai até a borda da tela. */
  topInset?: number;
}

/** Painel de marca do topo do login: fundo primary, mascote oficial, boas-vindas e chips decorativos. */
export function BrandPanel({ compact = false, topInset = 0 }: BrandPanelProps) {
  const t = useTokens();

  const chips = [
    { label: 'Agenda', bg: t.primarySoft, fg: t.primaryStrong },
    { label: 'Perfil', bg: t.accentSoft, fg: t.accentStrong },
    { label: 'Pagamentos', bg: t.surfaceRaised, fg: t.ink },
  ];

  return (
    <View style={[styles.panel, { backgroundColor: t.primary, paddingTop: ds.space[4] + topInset }]}>
      {/* Formas decorativas translúcidas. */}
      <Svg
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        <Circle cx="92%" cy="8%" r={110} fill="#ffffff" fillOpacity={0.14} />
        <Circle cx="-4%" cy="62%" r={80} fill="#ffffff" fillOpacity={0.12} />
        <Circle cx="78%" cy="92%" r={48} fill="#1a2e05" fillOpacity={0.06} />
      </Svg>

      <View style={styles.brand}>
        <Mascote size={compact ? 96 : 160} />
        <Text style={[styles.brandName, { color: t.onPrimary }]}>Centopeia</Text>
        <AmbienteBadge />
      </View>

      <View style={styles.copy}>
        <Text style={[type.display, styles.center, { color: t.onPrimary }]} accessibilityRole="header">
          Bem-vindo de volta!
        </Text>
        <Text style={[type.body, styles.center, { color: t.onPrimary }]}>
          Acompanhe o dia a dia do seu filho: diário, recados e mensalidades.
        </Text>
      </View>

      <View style={styles.chips} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {chips.map((chip) => (
          <View key={chip.label} style={[styles.chip, { backgroundColor: chip.bg }]}>
            <Text style={[type.caption, { color: chip.fg }]}>{chip.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    overflow: 'hidden',
    borderBottomLeftRadius: ds.radius.xl,
    borderBottomRightRadius: ds.radius.xl,
    paddingHorizontal: ds.margin,
    // Folga extra: o formulário sobe ~24 px sobre o painel.
    paddingBottom: ds.space[6] + 24,
    gap: ds.space[4],
  },
  brand: {
    alignItems: 'center',
    gap: ds.space[2],
  },
  brandName: {
    fontFamily: font.bold,
    fontSize: 18,
    lineHeight: 26,
  },
  copy: {
    gap: ds.space[2],
  },
  center: {
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: ds.space[2],
  },
  chip: {
    paddingVertical: ds.space[1],
    paddingHorizontal: ds.space[3],
    borderRadius: ds.radius.full,
  },
});
