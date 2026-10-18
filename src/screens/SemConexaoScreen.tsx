import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/ui/Button';
import { Mascote } from '../components/ui/Mascote';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme';

/** Exibida quando há sessão salva mas o servidor não respondeu na abertura do app. */
export function SemConexaoScreen() {
  const { bootError, retryBootstrap, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Mascote size={40} segments={3} />
        <Text style={styles.title}>Não conseguimos conectar</Text>
        <Text style={styles.message}>{bootError ?? 'Verifique sua internet e tente novamente.'}</Text>
        <View style={styles.actions}>
          <Button title="Tentar novamente" onPress={retryBootstrap} />
          <TouchableOpacity onPress={logout} style={styles.logout}>
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  logout: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  logoutText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
