import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Card } from '../components/ui/Card';
import { LoadingView } from '../components/ui/LoadingView';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useChildren } from '../context/ChildContext';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../theme/colors';

export function ChildSelectorScreen() {
  const { children_, isLoading, selectChild } = useChildren();
  const { logout } = useAuth();

  if (isLoading && children_.length === 0) {
    return <LoadingView label="Carregando seus filhos..." />;
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Quem vamos acompanhar hoje?</Text>
        <Text style={styles.subtitle}>Selecione um dos seus filhos matriculados</Text>
      </View>

      {children_.map((child) => (
        <TouchableOpacity key={child.id} activeOpacity={0.85} onPress={() => selectChild(child.id)}>
          <Card style={styles.childCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{child.nome.charAt(0)}</Text>
            </View>
            <View style={styles.childInfo}>
              <Text style={styles.childName}>{child.nome}</Text>
              <Text style={styles.childMeta}>{child.turma.nome}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Card>
        </TouchableOpacity>
      ))}

      <TouchableOpacity onPress={logout} style={styles.logout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.sm,
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.schoolGreenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.schoolGreenDark,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  childMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: colors.textMuted,
  },
  logout: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  logoutText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
