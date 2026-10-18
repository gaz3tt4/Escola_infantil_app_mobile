import { useCallback, useMemo, useState } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollViewProps } from 'react-native';

const MARGEM_PADRAO = 48;

/**
 * Mede a rolagem de um ScrollView: `cabeNaTela` quando o conteúdo não passa da área visível
 * e `chegouAoFim` quando o usuário rolou até o rodapé. Passe `scrollProps` ao ScreenContainer.
 */
export function useFimDaPagina(margem: number = MARGEM_PADRAO) {
  const [viewport, setViewport] = useState(0);
  const [conteudo, setConteudo] = useState(0);
  const [noFim, setNoFim] = useState(false);

  const onLayout = useCallback((event: LayoutChangeEvent) => setViewport(event.nativeEvent.layout.height), []);
  const onContentSizeChange = useCallback((_largura: number, altura: number) => setConteudo(altura), []);
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
      setNoFim(contentOffset.y + layoutMeasurement.height >= contentSize.height - margem);
    },
    [margem]
  );

  const cabeNaTela = viewport > 0 && conteudo > 0 && conteudo <= viewport + 1;

  const scrollProps = useMemo<ScrollViewProps>(
    () => ({ onLayout, onContentSizeChange, onScroll, scrollEventThrottle: 100 }),
    [onLayout, onContentSizeChange, onScroll]
  );

  return { scrollProps, cabeNaTela, chegouAoFim: noFim && !cabeNaTela };
}
