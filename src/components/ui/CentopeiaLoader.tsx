import React, { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';

import { spacing, useColors, type Palette } from '../../theme';
import { MascoteGirando } from './MascoteGirando';

/** Largura do mascote nos loaders (menor que os 160 da splash). */
const TAMANHO = 96;

function useReduzirMovimento(): boolean {
  const [reduzir, setReduzir] = useState(false);
  useEffect(() => {
    let ativo = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((valor) => {
        if (ativo) setReduzir(valor);
      })
      .catch(() => undefined);
    const assinatura = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduzir);
    return () => {
      ativo = false;
      assinatura.remove();
    };
  }, []);
  return reduzir;
}

interface CentopeiaLoaderProps {
  /** Texto abaixo da animação (ex.: "Carregando..."). */
  label?: string;
}

/** Carregamento: o mascote oficial girando no sentido horário em loop (pulsação leve com "reduzir movimento"). */
export function CentopeiaLoader({ label }: CentopeiaLoaderProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const reduzir = useReduzirMovimento();

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Carregando'}
      accessibilityState={{ busy: true }}
    >
      <MascoteGirando size={TAMANHO} modo="loop" reduzir={reduzir} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  container: {
    flex: 1,
    // Dentro de uma ScrollView o flex não dá altura: garante espaço para a cena.
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
