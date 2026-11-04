import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { configurarNotificacoes } from './src/notifications/config';
import { fontAssets } from './src/theme/fonts';

configurarNotificacoes();

// Segura a splash até a Plus Jakarta Sans carregar (se falhar, segue com a fonte do sistema).
SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const pronto = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (pronto) SplashScreen.hideAsync().catch(() => undefined);
  }, [pronto]);

  if (!pronto) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootNavigator />
          <StatusBar style="dark" />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
