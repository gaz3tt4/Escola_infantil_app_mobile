import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';

import { FloatingTabBar } from '../components/FloatingTabBar';
import { AgendaScreen } from '../screens/AgendaScreen';
import { BookOpen, CreditCard, Pill, User } from '../components/ui/icons';
import { PagamentosScreen } from '../screens/PagamentosScreen';
import { PerfilScreen } from '../screens/PerfilScreen';
import { MedicamentosScreen } from '../screens/MedicamentosScreen';
import { usePendencias } from '../context/PendenciasContext';
import type { MainTabParamList } from './types';

const Tab = createMaterialTopTabNavigator<MainTabParamList>();

// Mesmos ícones do painel web quando o conceito é o mesmo (agenda = book-open).
const TAB_ICONS: Record<keyof MainTabParamList, LucideIcon> = {
  Agenda: BookOpen,
  Medicamentos: Pill,
  Perfil: User,
  Pagamentos: CreditCard,
};

export function MainTabs() {
  const { pendentes } = usePendencias();

  return (
    <Tab.Navigator
      // Barra flutuante (pílula) própria; ela some com o teclado aberto.
      tabBar={(props) => <FloatingTabBar {...props} icons={TAB_ICONS} badges={{ Agenda: pendentes.length }} />}
      // Pager nativo: deslizar entre abas roda fora da thread JS e cede o gesto a listas horizontais.
      tabBarPosition="bottom"
      screenOptions={{ lazy: true, swipeEnabled: true, animationEnabled: true }}
    >
      <Tab.Screen
        name="Agenda"
        component={AgendaScreen}
      />
      <Tab.Screen name="Medicamentos" component={MedicamentosScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
      <Tab.Screen name="Pagamentos" component={PagamentosScreen} />
    </Tab.Navigator>
  );
}
