import React, { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Arte oficial, sem edição: só rotação e escala uniformes. Mesmo arquivo do login e da splash nativa.
const MASCOTE = require('../../../assets/mascote/centopeia-sentada-recorte.png');
const PROPORCAO = 276 / 279;

// Tempos (ms). Ajuste aqui.
export const DURACAO_ENTRADA = 900;
const DURACAO_VOLTA = 1200; // uma volta completa no loop
const DURACAO_REDUZIDA = 300;
const DURACAO_PULSO = 900;

interface MascoteGirandoProps {
  /** Largura em px. */
  size: number;
  /**
   * 'entrada': uma volta horária (-360° → 0°) com escala e opacidade, e assenta (splash).
   * 'loop': gira continuamente no sentido horário (loaders).
   */
  modo: 'entrada' | 'loop';
  /** "Reduzir movimento": sem rotação nem escala. Entrada = fade; loop = pulsação leve de opacidade. */
  reduzir: boolean;
  /** Quando false, fica parado no estado inicial (útil para esperar o layout). */
  ativo?: boolean;
  onLayout?: () => void;
}

/** Mascote oficial animado: gira no sentido horário (ângulo crescente = horário no React Native). */
export function MascoteGirando({ size, modo, reduzir, ativo = true, onLayout }: MascoteGirandoProps) {
  const entrada = modo === 'entrada';
  const rotacao = useSharedValue(entrada ? -360 : 0);
  const escala = useSharedValue(entrada && !reduzir ? 0.6 : 1);
  const opacidade = useSharedValue(entrada ? 0.4 : 1);

  useEffect(() => {
    if (!ativo) return;
    const saida = Easing.out(Easing.cubic);
    if (reduzir) {
      rotacao.value = 0;
      escala.value = 1;
      if (entrada) {
        opacidade.value = 0;
        opacidade.value = withTiming(1, { duration: DURACAO_REDUZIDA, easing: saida });
      } else {
        opacidade.value = withRepeat(
          withSequence(
            withTiming(0.5, { duration: DURACAO_PULSO, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: DURACAO_PULSO, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
        );
      }
    } else if (entrada) {
      rotacao.value = withTiming(0, { duration: DURACAO_ENTRADA, easing: saida });
      opacidade.value = withTiming(1, { duration: DURACAO_ENTRADA, easing: saida });
      escala.value = withSequence(
        withTiming(1, { duration: DURACAO_ENTRADA, easing: saida }),
        withSpring(1.04, { damping: 12, stiffness: 260 }),
        withSpring(1, { damping: 14, stiffness: 220 }),
      );
    } else {
      rotacao.value = 0;
      rotacao.value = withRepeat(withTiming(360, { duration: DURACAO_VOLTA, easing: Easing.linear }), -1, false);
    }
    return () => {
      cancelAnimation(rotacao);
      cancelAnimation(opacidade);
      cancelAnimation(escala);
    };
  }, [ativo, reduzir, entrada, rotacao, escala, opacidade]);

  const estilo = useAnimatedStyle(() => ({
    opacity: opacidade.value,
    transform: [{ rotate: `${rotacao.value}deg` }, { scale: escala.value }],
  }));

  const altura = size / PROPORCAO;
  return (
    <Animated.View style={[{ width: size, height: altura }, estilo]} onLayout={onLayout}>
      <Image source={MASCOTE} style={styles.imagem} resizeMode="contain" accessible={false} />
    </Animated.View>
  );
}

export const alturaMascote = (size: number) => size / PROPORCAO;

const styles = StyleSheet.create({
  imagem: { width: '100%', height: '100%' },
});
