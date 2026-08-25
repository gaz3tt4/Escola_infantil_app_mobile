import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { LoadingView } from '../components/ui/LoadingView';
import { useAuth } from '../context/AuthContext';
import { useChildren } from '../context/ChildContext';
import { ChildSelectorScreen } from '../screens/ChildSelectorScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <LoadingView label="Carregando..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={AuthenticatedGate} />
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
