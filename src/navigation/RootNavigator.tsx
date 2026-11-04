import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { CentopeiaLoader } from '../components/ui/CentopeiaLoader';
import { AlunosProvider } from '../context/AlunosContext';
import { useAuth } from '../context/AuthContext';
import { PendenciasProvider } from '../context/PendenciasContext';
import { NotificationsBridge } from '../notifications/NotificationsBridge';
import { AlterarSenhaScreen } from '../screens/AlterarSenhaScreen';
import { CalendarioScreen } from '../screens/CalendarioScreen';
import { FaturaDetalheScreen } from '../screens/FaturaDetalheScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SemConexaoScreen } from '../screens/SemConexaoScreen';
import { useColors } from '../theme';
import { MainTabs } from './MainTabs';
import { navigationRef } from './ref';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const colors = useColors();
  // Tema da navegação: fundo, cartões e bordas do tema do sistema (sem flash branco no escuro).
  const navigationTheme: Theme = {
    dark: colors.isDark,
    colors: {
      primary: colors.brandDark,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.coral,
    },
    fonts: DefaultTheme.fonts,
  };
  const { status, mustChangePassword } = useAuth();

  if (status === 'bootstrapping') {
    return <CentopeiaLoader label="Carregando..." />;
  }

  if (status === 'unreachable') {
    return <SemConexaoScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <NotificationsBridge />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          headerTintColor: colors.brandDark,
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerBackTitle: 'Voltar',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {status !== 'signedIn' ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ animationTypeForReplace: 'pop' }} />
        ) : mustChangePassword ? (
          // Navegação bloqueada até a troca da senha provisória.
          <Stack.Screen name="TrocaSenhaObrigatoria" component={AlterarSenhaScreen} options={{ gestureEnabled: false }} />
        ) : (
          <Stack.Group>
            <Stack.Screen name="Main" component={AppHome} />
            <Stack.Screen
              name="FaturaDetalhe"
              component={FaturaDetalheScreen}
              options={{ headerShown: true, title: 'Fatura' }}
            />
            <Stack.Screen
              name="AlterarSenha"
              component={AlterarSenhaScreen}
              options={{ headerShown: true, title: 'Alterar senha' }}
            />
            <Stack.Screen
              name="Calendario"
              component={CalendarioScreen}
              options={{ headerShown: true, title: 'Calendário' }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/** Área logada: os alunos ficam em contexto enquanto a sessão existir. */
function AppHome() {
  return (
    <AlunosProvider>
      <PendenciasProvider>
        <MainTabs />
      </PendenciasProvider>
    </AlunosProvider>
  );
}
