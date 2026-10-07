import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/ui/Button';
import { Mascote } from '../components/ui/Mascote';
import { Notice } from '../components/ui/Notice';
import { TextField } from '../components/ui/TextField';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/errors';
import { colors, spacing } from '../theme';

export function LoginScreen() {
  const { login, notice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  async function handleSubmit() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Informe seu e-mail e sua senha.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await login(trimmedEmail, password);
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  const message = error ?? notice;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Mascote size={44} segments={4} />
            <Text style={styles.title}>Centopeia</Text>
            <Text style={styles.subtitle}>Acompanhe a rotina escolar do seu filho</Text>
          </View>

          <View style={styles.form}>
            <TextField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              textContentType="username"
              placeholder="seu@email.com"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!submitting}
            />

            <TextField
              ref={passwordRef}
              label="Senha"
              password
              value={password}
              onChangeText={setPassword}
              autoComplete="current-password"
              textContentType="password"
              placeholder="Sua senha"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              editable={!submitting}
            />

            {message ? <Notice message={message} tone={error ? 'error' : 'info'} /> : null}

            <Button title="Entrar" onPress={handleSubmit} loading={submitting} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },
  brand: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.brandDark,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
  },
});
