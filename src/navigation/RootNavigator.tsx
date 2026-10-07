import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { LoadingView } from '../components/ui/LoadingView';
import { useAuth } from '../context/AuthContext';
import { useChildren } from '../context/ChildContext';
import { AlterarSenhaScreen } from '../screens/AlterarSenhaScreen';
import { FaturaDetalheScreen } from '../screens/FaturaDetalheScreen';
import { ChildSelectorScreen } from '../screens/ChildSelectorScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SemConexaoScreen } from '../screens/SemConexaoScreen';
import { colors } from '../theme';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { status, mustChangePassword } = useAuth();

  if (status === 'bootstrapping') {
    return <LoadingView label="Carregando..." />;
  }

  if (status === 'unreachable') {
    return <SemConexaoScreen />;
  }

  return (
    <NavigationContainer>
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
            <Stack.Screen name="Main" component={AuthenticatedGate} />
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
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AuthenticatedGate() {
  const { selectedChild, children_, isLoading } = useChildren();

  if (isLoading && children_.length === 0) {
    return <LoadingView label="Carregando seus filhos..." />;
  }

  if (!selectedChild) {
    return <ChildSelectorScreen />;
  }

  return <MainTabs />;
}
