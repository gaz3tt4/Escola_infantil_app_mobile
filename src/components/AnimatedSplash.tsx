import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { font } from '../theme/fonts';
import { lightTokens } from '../theme/tokens';
import { alturaMascote, MascoteGirando } from './ui/MascoteGirando';

// Tokens do design system (iguais no claro e no escuro).
const COR_FUNDO = lightTokens.primary; // #84cc3a
const COR_TEXTO = lightTokens.onPrimary; // #1a2e05

// Linha do tempo (ms), contada a partir do mascote aparecer na tela. Ajuste aqui.
const LARGURA_MASCOTE = 160; // igual a imageWidth da splash nativa (app.json)
const INICIO_NOME = 1000;
const DURACAO_NOME = 300;
const SOBE_NOME = 8;
const DURACAO_MINIMA = 1800;
const DURACAO_SAIDA = 250;
const DURACAO_MAXIMA = 4000; // se o app não ficar pronto, sai mesmo assim

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
  // O relógio só corre depois que o mascote está na tela (e a splash nativa foi escondida).
  const [visivel, setVisivel] = useState(false);
  const [minimoCumprido, setMinimoCumprido] = useState(false);
  const [estourou, setEstourou] = useState(false);
  const saiu = useRef(false);

  const opacidadeNome = useSharedValue(0);
  const subidaNome = useSharedValue(SOBE_NOME);
  const opacidadeGeral = useSharedValue(1);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduzir)
      .catch(() => setReduzir(false));
  }, []);

  useEffect(() => {
    if (!visivel || reduzir === null) return;
    const saida = Easing.out(Easing.cubic);
    opacidadeNome.value = withDelay(INICIO_NOME, withTiming(1, { duration: DURACAO_NOME }));
    subidaNome.value = reduzir
      ? 0
      : withDelay(INICIO_NOME, withTiming(0, { duration: DURACAO_NOME, easing: saida }));
    const minimo = setTimeout(() => setMinimoCumprido(true), DURACAO_MINIMA);
    return () => clearTimeout(minimo);
  }, [visivel, reduzir, opacidadeNome, subidaNome]);

  // Rede de segurança: corre desde a montagem, independente de layout/reduzir movimento.
  // Ao estourar, garante que a splash nativa também some.
  const aoMascoteLayoutRef = useRef(onMascoteLayout);
  useEffect(() => {
    aoMascoteLayoutRef.current = onMascoteLayout;
  }, [onMascoteLayout]);
  useEffect(() => {
    const maximo = setTimeout(() => {
      aoMascoteLayoutRef.current?.();
      setEstourou(true);
    }, DURACAO_MAXIMA);
    return () => clearTimeout(maximo);
  }, []);

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
  const estiloNome = useAnimatedStyle(() => ({
    opacity: opacidadeNome.value,
    transform: [{ translateY: subidaNome.value }],
  }));

  function aoLayout() {
    setVisivel(true);
    onMascoteLayout?.();
  }

  return (
    <Animated.View
      style={[styles.overlay, estiloGeral]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.centro}>
        {reduzir === null ? null : (
          <MascoteGirando size={LARGURA_MASCOTE} modo="entrada" reduzir={reduzir} onLayout={aoLayout} />
        )}
        <Animated.Text style={[styles.nome, estiloNome]}>Centopeia</Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COR_FUNDO,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  // O mascote fica no centro exato (como a splash nativa); o nome pende abaixo sem deslocá-lo.
  centro: {
    width: LARGURA_MASCOTE,
    height: alturaMascote(LARGURA_MASCOTE),
    alignItems: 'center',
  },
  nome: {
    position: 'absolute',
    top: alturaMascote(LARGURA_MASCOTE) + 16,
    fontFamily: font.bold,
    fontSize: 24,
    lineHeight: 32,
    color: COR_TEXTO,
  },
});
