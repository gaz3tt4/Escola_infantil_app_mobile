import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/ui/Button';
import { Mascote } from '../components/ui/Mascote';
import { Notice } from '../components/ui/Notice';
import { TextField } from '../components/ui/TextField';
import { useAuth } from '../context/AuthContext';
import { toApiError } from '../services/errors';
import { colors, spacing, typography } from '../theme';

/** Mesmo mínimo do backend (Password::min(8)). */
const MIN_LENGTH = 8;

type Field = 'atual' | 'nova' | 'confirmacao';
type FieldErrors = Partial<Record<Field, string>>;

function validate(atual: string, nova: string, confirmacao: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!atual) errors.atual = 'Informe a senha atual.';
  if (!nova) errors.nova = 'Informe a nova senha.';
  else if (nova.length < MIN_LENGTH) errors.nova = `A senha deve ter no mínimo ${MIN_LENGTH} caracteres.`;
  else if (atual && nova === atual) errors.nova = 'A nova senha deve ser diferente da senha atual.';
  if (nova && confirmacao !== nova) errors.confirmacao = 'A confirmação de senha não confere.';
  return errors;
}

/** Converte os erros 422 do backend (current_password, password) para os campos da tela. */
function mapServerErrors(fieldErrors: Record<string, string>): FieldErrors {
  const errors: FieldErrors = {};
  if (fieldErrors.current_password) errors.atual = fieldErrors.current_password;
  if (fieldErrors.password) {
    // A regra `confirmed` do Laravel reporta o erro no campo `password`.
    if (/confirma/i.test(fieldErrors.password)) errors.confirmacao = fieldErrors.password;
    else errors.nova = fieldErrors.password;
  }
  if (fieldErrors.password_confirmation) errors.confirmacao = fieldErrors.password_confirmation;
  return errors;
}

/**
 * Troca de senha (PUT /senha).
 * - Obrigatória: aparece sozinha quando o login veio com must_change_password = true.
 * - Voluntária: aberta pelo Perfil.
 */
export function AlterarSenhaScreen() {
  const { mustChangePassword, changePassword, logout } = useAuth();
  const navigation = useNavigation();
  const forced = mustChangePassword;

  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const novaRef = useRef<TextInput>(null);
  const confirmacaoRef = useRef<TextInput>(null);

  async function handleSubmit() {
    const localErrors = validate(atual, nova, confirmacao);
    setFieldErrors(localErrors);
    setFormError(null);
    if (Object.keys(localErrors).length > 0) return;

    setSubmitting(true);
    try {
      const message = await changePassword({
        current_password: atual,
        password: nova,
        password_confirmation: confirmacao,
      });
      // No modo obrigatório o navegador troca para o app assim que a flag é limpa.
      if (!forced) {
        setSuccess(message);
        setAtual('');
        setNova('');
        setConfirmacao('');
      }
    } catch (error) {
      const apiError = toApiError(error);
      const serverErrors = mapServerErrors(apiError.fieldErrors);
      setFieldErrors(serverErrors);
      if (Object.keys(serverErrors).length === 0) setFormError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  }

  const content = (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {forced ? (
        <View style={styles.header}>
          <Mascote size={36} segments={3} />
          <Text style={styles.title}>Crie uma nova senha</Text>
          <Text style={styles.subtitle}>
            Por segurança, troque a senha provisória que você recebeu da escola antes de continuar.
          </Text>
        </View>
      ) : (
        <Text style={styles.subtitle}>
          Ao trocar a senha, os outros aparelhos conectados à sua conta serão desconectados.
        </Text>
      )}

      {success ? (
        <View style={styles.form}>
          <Notice tone="success" message={`${success} Os outros aparelhos conectados foram desconectados.`} />
          <Button title="Voltar" onPress={() => navigation.goBack()} />
        </View>
      ) : (
        <View style={styles.form}>
          <TextField
            label={forced ? 'Senha provisória' : 'Senha atual'}
            password
            value={atual}
            onChangeText={setAtual}
            error={fieldErrors.atual}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="next"
            onSubmitEditing={() => novaRef.current?.focus()}
            editable={!submitting}
          />
          <TextField
            ref={novaRef}
            label="Nova senha"
            password
            value={nova}
            onChangeText={setNova}
            error={fieldErrors.nova}
            placeholder={`Mínimo de ${MIN_LENGTH} caracteres`}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            onSubmitEditing={() => confirmacaoRef.current?.focus()}
            editable={!submitting}
          />
          <TextField
            ref={confirmacaoRef}
            label="Confirme a nova senha"
            password
            value={confirmacao}
            onChangeText={setConfirmacao}
            error={fieldErrors.confirmacao}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
            editable={!submitting}
          />

          {formError ? <Notice message={formError} /> : null}

          <Button title="Salvar nova senha" onPress={handleSubmit} loading={submitting} />

          {forced ? (
            <TouchableOpacity style={styles.logout} onPress={logout} disabled={submitting}>
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe} edges={forced ? ['top', 'bottom'] : ['bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {content}
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
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  title: {
    ...typography.title,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    gap: spacing.md,
  },
  logout: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  logoutText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
