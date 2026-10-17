import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';

import { AgendaScreen } from '../screens/AgendaScreen';
import { Icon } from '../components/ui/Icon';
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
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brandDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        // Aba ativa na cor da marca; inativa em cinza do tema.
        tabBarIcon: ({ focused }) => (
          <Icon icon={TAB_ICONS[route.name as keyof MainTabParamList]} color={focused ? 'brandDark' : 'textMuted'} />
        ),
      })}
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
