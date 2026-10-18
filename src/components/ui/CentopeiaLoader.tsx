import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { colors, spacing } from '../../theme';

// Imagem original, sem nenhuma edição: o movimento é só transformação aplicada a ela inteira.
const MASCOTE = require('../../../assets/centopeia_img_loader.png');
const PROPORCAO = 618 / 404;

const LARGURA_IMAGEM = 170;
const ALTURA_IMAGEM = LARGURA_IMAGEM / PROPORCAO;
const ALTURA_PULO = 44;
const DURACAO_PULO = 900;

// Chão: uma faixa de 6 ladrilhos repetida duas vezes lado a lado; ela anda uma faixa inteira e
// recomeça idêntica, então a emenda não aparece.
const LARGURA_CHAO = 260;
const LADRILHO = 52;
const LADRILHOS_POR_FAIXA = 6;
const LARGURA_FAIXA = LADRILHO * LADRILHOS_POR_FAIXA;
const DURACAO_CHAO = 1100;
const ALTURA_CHAO = 14;

// Subida desacelera (ease-out) e descida acelera (ease-in), como um corpo sob gravidade. É a
// única exceção ao "nunca ease-in": aqui o movimento representa um objeto físico, não a interface.
const PULO = {
  '0%': { transform: [{ translateY: 0 }, { scaleX: 1.06 }, { scaleY: 0.92 }], animationTimingFunction: 'ease-out' },
  '14%': { transform: [{ translateY: -10 }, { scaleX: 0.97 }, { scaleY: 1.05 }], animationTimingFunction: 'ease-out' },
  '50%': { transform: [{ translateY: -ALTURA_PULO }, { scaleX: 1 }, { scaleY: 1 }], animationTimingFunction: 'ease-in' },
  '90%': { transform: [{ translateY: -4 }, { scaleX: 0.98 }, { scaleY: 1.03 }], animationTimingFunction: 'ease-out' },
  '100%': { transform: [{ translateY: 0 }, { scaleX: 1.06 }, { scaleY: 0.92 }] },
} as const;

// A sombra (elemento separado) encolhe e some um pouco quando a centopeia sobe.
const SOMBRA = {
  '0%': { transform: [{ scaleX: 1 }], opacity: 1, animationTimingFunction: 'ease-out' },
  '50%': { transform: [{ scaleX: 0.55 }], opacity: 0.45, animationTimingFunction: 'ease-in' },
  '100%': { transform: [{ scaleX: 1 }], opacity: 1 },
} as const;

const CHAO = {
  from: { transform: [{ translateX: 0 }] },
  to: { transform: [{ translateX: -LARGURA_FAIXA }] },
} as const;

function useReduzirMovimento(): boolean {
  const [reduzir, setReduzir] = useState(false);
  useEffect(() => {
    let ativo = true;
    AccessibilityInfo.isReduceMotionEnabled().then((valor) => {
      if (ativo) setReduzir(valor);
    });
    const assinatura = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduzir);
    return () => {
      ativo = false;
      assinatura.remove();
    };
  }, []);
  return reduzir;
}

function Faixa() {
  return (
    <View style={styles.faixa}>
      {Array.from({ length: LADRILHOS_POR_FAIXA }).map((_, indice) => (
        <View key={indice} style={styles.ladrilho}>
          <View style={styles.traco} />
        </View>
      ))}
    </View>
  );
}

interface CentopeiaLoaderProps {
  /** Texto abaixo da animação (ex.: "Carregando..."). */
  label?: string;
}

/**
 * Carregamento de tela inteira: a centopeia pula em loop sobre um chão que passa sem emenda.
 * Tudo roda na thread de UI (animações CSS do Reanimated), sem setInterval nem render por quadro.
 * Com "reduzir movimento" ativo, mostra a imagem parada com um indicador discreto.
 */
export function CentopeiaLoader({ label }: CentopeiaLoaderProps) {
  const reduzir = useReduzirMovimento();

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Carregando'}
      accessibilityState={{ busy: true }}
    >
      <View style={styles.cena}>
        <View style={styles.palco}>
          {reduzir ? (
            <Image source={MASCOTE} style={styles.imagem} resizeMode="contain" accessible={false} />
          ) : (
            <Animated.View
              style={[
                styles.pulo,
                {
                  transformOrigin: '50% 100%',
                  animationName: PULO,
                  animationDuration: DURACAO_PULO,
                  animationIterationCount: 'infinite',
                },
              ]}
            >
              <Image source={MASCOTE} style={styles.imagem} resizeMode="contain" accessible={false} />
            </Animated.View>
          )}
        </View>

        <View style={styles.chao}>
          {reduzir ? null : (
            <Animated.View
              style={[
                styles.sombra,
                {
                  animationName: SOMBRA,
                  animationDuration: DURACAO_PULO,
                  animationIterationCount: 'infinite',
                },
              ]}
            />
          )}
          {reduzir ? (
            <View style={styles.faixaFixa}>
              <Faixa />
            </View>
          ) : (
            <Animated.View
              style={[
                styles.faixas,
                {
                  animationName: CHAO,
                  animationDuration: DURACAO_CHAO,
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite',
                },
              ]}
            >
              <Faixa />
              <Faixa />
            </Animated.View>
          )}
        </View>
      </View>

      {reduzir ? <ActivityIndicator size="small" color={colors.brandDark} /> : null}
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Dentro de uma ScrollView o flex não dá altura: garante espaço para a cena.
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  cena: {
    width: LARGURA_CHAO,
    alignItems: 'center',
  },
  // Espaço reservado para o pulo não empurrar o layout.
  palco: {
    width: LARGURA_CHAO,
    height: ALTURA_IMAGEM + ALTURA_PULO,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  pulo: {
    width: LARGURA_IMAGEM,
    height: ALTURA_IMAGEM,
  },
  imagem: {
    width: LARGURA_IMAGEM,
    height: ALTURA_IMAGEM,
  },
  chao: {
    width: LARGURA_CHAO,
    height: ALTURA_CHAO,
    overflow: 'hidden',
    borderRadius: ALTURA_CHAO / 2,
    backgroundColor: colors.brandSoft,
    marginTop: -spacing.xs,
  },
  sombra: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: LARGURA_IMAGEM * 0.7,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brandDark,
    opacity: 0.25,
  },
  faixas: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    flexDirection: 'row',
    width: LARGURA_FAIXA * 2,
  },
  faixaFixa: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  faixa: {
    flexDirection: 'row',
    width: LARGURA_FAIXA,
    height: ALTURA_CHAO,
  },
  ladrilho: {
    width: LADRILHO,
    height: ALTURA_CHAO,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  traco: {
    width: 20,
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
    backgroundColor: colors.brand,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
