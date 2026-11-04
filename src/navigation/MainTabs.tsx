import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';

import { FloatingTabBar } from '../components/FloatingTabBar';
import { AgendaScreen } from '../screens/AgendaScreen';
import { BookOpen, CreditCard, Pill, User } from '../components/ui/icons';
import { PagamentosScreen } from '../screens/PagamentosScreen';
import { PerfilScreen } from '../screens/PerfilScreen';
import { MedicamentosScreen } from '../screens/MedicamentosScreen';
import { usePendencias } from '../context/PendenciasContext';
import { colors } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

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
      tabBar={(props) => <FloatingTabBar {...props} icons={TAB_ICONS} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{
          // Indicador de agendas sem a sua ciência.
          tabBarBadge: pendentes.length > 0 ? pendentes.length : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.coral, color: colors.surface },
        }}
      />
      <Tab.Screen name="Medicamentos" component={MedicamentosScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
      <Tab.Screen name="Pagamentos" component={PagamentosScreen} />
    </Tab.Navigator>
  );
}
