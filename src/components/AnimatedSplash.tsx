import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { font } from '../theme/fonts';
import { lightTokens } from '../theme/tokens';

// Arte oficial, sem edição: só rotação e escala uniformes. Mesmo arquivo da tela de login e da splash nativa.
const MASCOTE = require('../../assets/mascote/centopeia-sentada-recorte.png');
const PROPORCAO = 276 / 279;

// Tokens do design system (iguais no claro e no escuro).
const COR_FUNDO = lightTokens.primary; // #84cc3a
const COR_TEXTO = lightTokens.onPrimary; // #1a2e05

// Linha do tempo (ms). Ajuste aqui.
const LARGURA_MASCOTE = 200; // igual a imageWidth da splash nativa
const DURACAO_ENTRADA = 900;
const INICIO_NOME = 1000;
const DURACAO_NOME = 300;
const SOBE_NOME = 8;
const DURACAO_MINIMA = 1800;
const DURACAO_SAIDA = 250;
const DURACAO_MAXIMA = 4000; // se o app não ficar pronto, sai mesmo assim
const DURACAO_REDUZIDA = 300;

interface AnimatedSplashProps {
  /** true quando fontes e leitura do token terminaram. */
  ready: boolean;
  /** Chamado ao terminar o fade-out; o pai desmonta o componente. */
  onFinish: () => void;
  /** Chamado no layout do mascote: hora de esconder a splash nativa. */
  onMascoteLayout?: () => void;
}

/** Splash animada: mascote gira no sentido horário (-360° → 0°), nome aparece, overlay some em fade. */
export function AnimatedSplash({ ready, onFinish, onMascoteLayout }: AnimatedSplashProps) {
  const [reduzir, setReduzir] = useState<boolean | null>(null);
  const [minimoCumprido, setMinimoCumprido] = useState(false);
  const [estourou, setEstourou] = useState(false);
  const saiu = useRef(false);

  const rotacao = useSharedValue(-360);
  const escala = useSharedValue(0.6);
  const opacidadeMascote = useSharedValue(0.4);
  const opacidadeNome = useSharedValue(0);
  const subidaNome = useSharedValue(SOBE_NOME);
  const opacidadeGeral = useSharedValue(1);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduzir)
      .catch(() => setReduzir(false));
  }, []);

  // Começa a linha do tempo só depois de saber a preferência de movimento.
  useEffect(() => {
    if (reduzir === null) return;
    const suave = { duration: DURACAO_REDUZIDA, easing: Easing.out(Easing.cubic) };
    if (reduzir) {
      rotacao.value = 0;
      escala.value = 1;
      opacidadeMascote.value = 0;
      opacidadeMascote.value = withTiming(1, suave);
      opacidadeNome.value = withDelay(INICIO_NOME, withTiming(1, suave));
      subidaNome.value = 0;
    } else {
      const saida = Easing.out(Easing.cubic);
      rotacao.value = withTiming(0, { duration: DURACAO_ENTRADA, easing: saida });
      opacidadeMascote.value = withTiming(1, { duration: DURACAO_ENTRADA, easing: saida });
      escala.value = withSequence(
        withTiming(1, { duration: DURACAO_ENTRADA, easing: saida }),
        withSpring(1.04, { damping: 12, stiffness: 260 }),
        withSpring(1, { damping: 14, stiffness: 220 }),
      );
      opacidadeNome.value = withDelay(INICIO_NOME, withTiming(1, { duration: DURACAO_NOME }));
      subidaNome.value = withDelay(INICIO_NOME, withTiming(0, { duration: DURACAO_NOME, easing: saida }));
    }
    const minimo = setTimeout(() => setMinimoCumprido(true), DURACAO_MINIMA);
    const maximo = setTimeout(() => setEstourou(true), DURACAO_MAXIMA);
    return () => {
      clearTimeout(minimo);
      clearTimeout(maximo);
    };
  }, [reduzir, rotacao, escala, opacidadeMascote, opacidadeNome, subidaNome]);

  // Sai quando a animação terminou E o app está pronto (ou quando estoura o limite).
  useEffect(() => {
    if (saiu.current) return;
    if (!(minimoCumprido && ready) && !estourou) return;
    saiu.current = true;
    opacidadeGeral.value = withTiming(0, { duration: DURACAO_SAIDA }, (terminou) => {
      if (terminou) scheduleOnRN(onFinish);
    });
  }, [minimoCumprido, ready, estourou, opacidadeGeral, onFinish]);

  const estiloGeral = useAnimatedStyle(() => ({ opacity: opacidadeGeral.value }));
  const estiloMascote = useAnimatedStyle(() => ({
    opacity: opacidadeMascote.value,
    transform: [{ rotate: `${rotacao.value}deg` }, { scale: escala.value }],
  }));
  const estiloNome = useAnimatedStyle(() => ({
    opacity: opacidadeNome.value,
    transform: [{ translateY: subidaNome.value }],
  }));

  return (
    <Animated.View style={[styles.overlay, estiloGeral]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.centro}>
        <Animated.View style={[styles.mascote, estiloMascote]} onLayout={onMascoteLayout}>
          <Image source={MASCOTE} style={styles.imagem} resizeMode="contain" />
        </Animated.View>
        <Animated.Text style={[styles.nome, estiloNome]}>Centopeia</Animated.Text>
      </View>
    </Animated.View>
  );
}

const ALTURA_MASCOTE = LARGURA_MASCOTE / PROPORCAO;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COR_FUNDO,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  // O mascote fica no centro exato (como a splash nativa); o nome pende abaixo sem deslocá-lo.
  centro: {
    width: LARGURA_MASCOTE,
    height: ALTURA_MASCOTE,
    alignItems: 'center',
  },
  mascote: {
    width: LARGURA_MASCOTE,
    height: ALTURA_MASCOTE,
  },
  imagem: {
    width: LARGURA_MASCOTE,
    height: ALTURA_MASCOTE,
  },
  nome: {
    position: 'absolute',
    top: ALTURA_MASCOTE + 16,
    fontFamily: font.bold,
    fontSize: 24,
    lineHeight: 32,
    color: COR_TEXTO,
  },
});
