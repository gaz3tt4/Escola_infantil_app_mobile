import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplash } from './src/components/AnimatedSplash';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { configurarNotificacoes } from './src/notifications/config';
import { fontAssets } from './src/theme/fonts';

configurarNotificacoes();

// Segura a splash nativa até o mascote animado aparecer (handoff sem piscar).
SplashScreen.preventAutoHideAsync().catch(() => undefined);

/** Splash animada por cima do app, só na abertura a frio (este componente monta uma vez por processo). */
function SplashGate({ fontsPronto }: { fontsPronto: boolean }) {
  const { status } = useAuth();
  const [visivel, setVisivel] = useState(true);
  const esconderNativa = useCallback(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);
  const finalizar = useCallback(() => setVisivel(false), []);

  if (!visivel) return null;
  return (
    <AnimatedSplash
      ready={fontsPronto && status !== 'bootstrapping'}
      onMascoteLayout={esconderNativa}
      onFinish={finalizar}
    />
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const fontsPronto = fontsLoaded || fontError !== null;

  return (
    <GestureHandlerRootView style={styles.raiz}>
      <SafeAreaProvider>
        <AuthProvider>
          {/* O app carrega em paralelo à animação; sem fontes, nada é montado por baixo. */}
          <View style={styles.raiz}>
            {fontsPronto ? <RootNavigator /> : null}
            <StatusBar style="auto" />
          </View>
          <SplashGate fontsPronto={fontsPronto} />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ raiz: { flex: 1 } });
