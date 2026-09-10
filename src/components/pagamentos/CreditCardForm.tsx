import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../ui/Button';
import { colors, radius, spacing } from '../../theme/colors';
import {
  formatCardNumber,
  formatCVV,
  formatExpiry,
  isValidCardName,
  isValidCardNumber,
  isValidCVV,
  isValidExpiry,
} from '../../utils/cardMask';
import type { CardPaymentPayload } from '../../types';

interface CreditCardFormProps {
  onSubmit: (payload: CardPaymentPayload) => void;
  submitting: boolean;
  error: string | null;
}

export function CreditCardForm({ onSubmit, submitting, error }: CreditCardFormProps) {
  const [numero, setNumero] = useState('');
  const [nomeImpresso, setNomeImpresso] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  function handleSubmit() {
    if (!isValidCardNumber(numero)) {
      setFieldError('Número do cartão inválido.');
      return;
    }
    if (!isValidCardName(nomeImpresso)) {
      setFieldError('Informe o nome impresso no cartão.');
      return;
    }
    if (!isValidExpiry(validade)) {
      setFieldError('Validade inválida ou cartão vencido.');
      return;
    }
    if (!isValidCVV(cvv)) {
      setFieldError('CVV inválido.');
      return;
    }

    setFieldError(null);
    onSubmit({
      numero: numero.replace(/\D/g, ''),
      nome_impresso: nomeImpresso.trim(),
      validade,
      cvv,
    });
  }

  return (
    <View style={styles.form}>
      <View style={styles.field}>
        <Text style={styles.label}>Número do cartão</Text>
        <TextInput
          style={styles.input}
          value={numero}
          onChangeText={(text) => setNumero(formatCardNumber(text))}
          keyboardType="number-pad"
          placeholder="0000 0000 0000 0000"
          placeholderTextColor={colors.textMuted}
          maxLength={23}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Nome impresso no cartão</Text>
        <TextInput
          style={styles.input}
          value={nomeImpresso}
          onChangeText={setNomeImpresso}
          autoCapitalize="characters"
          placeholder="Como está no cartão"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.flex1]}>
          <Text style={styles.label}>Validade (MM/AA)</Text>
          <TextInput
            style={styles.input}
            value={validade}
            onChangeText={(text) => setValidade(formatExpiry(text))}
            keyboardType="number-pad"
            placeholder="MM/AA"
            placeholderTextColor={colors.textMuted}
            maxLength={5}
          />
        </View>

        <View style={[styles.field, styles.flex1]}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            style={styles.input}
            value={cvv}
            onChangeText={(text) => setCvv(formatCVV(text))}
            keyboardType="number-pad"
            placeholder="123"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            maxLength={4}
          />
        </View>
      </View>

      {(fieldError || error) ? <Text style={styles.error}>{fieldError ?? error}</Text> : null}

      <Button title="Confirmar pagamento" onPress={handleSubmit} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
    color: colors.textPrimary,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});
