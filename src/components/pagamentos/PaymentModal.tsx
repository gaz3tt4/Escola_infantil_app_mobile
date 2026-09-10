import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BoletoResult } from './BoletoResult';
import { CreditCardForm } from './CreditCardForm';
import { PaymentMethodPicker } from './PaymentMethodPicker';
import { PixResult } from './PixResult';
import { payInvoice } from '../../api/payments';
import { colors, radius, spacing } from '../../theme/colors';
import { formatCurrencyBRL } from '../../utils/format';
import type { CardPaymentPayload, Invoice, PagamentoResponse, PaymentMethod } from '../../types';

type Step = 'method' | 'card-form' | 'result';

interface PaymentModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onPaid: () => void;
}

export function PaymentModal({ invoice, onClose, onPaid }: PaymentModalProps) {
  const [step, setStep] = useState<Step>('method');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PagamentoResponse | null>(null);

  useEffect(() => {
    if (invoice) {
      setStep('method');
      setSubmitting(false);
      setError(null);
      setResult(null);
    }
  }, [invoice]);

  if (!invoice) return null;

  async function runPayment(method: PaymentMethod, cartao?: CardPaymentPayload) {
    setSubmitting(true);
    setError(null);
    try {
      const response = await payInvoice(invoice!.id, { forma_pagamento: method, cartao });
      setResult(response);
      setStep('result');
      if (response.forma_pagamento === 'CREDIT_CARD' && response.status === 'aprovado') {
        onPaid();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir o pagamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleSelectMethod(method: PaymentMethod) {
    if (method === 'CREDIT_CARD') {
      setError(null);
      setStep('card-form');
      return;
    }
    runPayment(method);
  }

  const titles: Record<Step, string> = {
    method: 'Como deseja pagar?',
    'card-form': 'Dados do cartão',
    result: result?.forma_pagamento === 'CREDIT_CARD' ? 'Resultado do pagamento' : 'Pagamento gerado',
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerTexts}>
              <Text style={styles.title}>{titles[step]}</Text>
              <Text style={styles.subtitle}>
                {invoice.descricao} · {formatCurrencyBRL(invoice.valor_total ?? invoice.valor)}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {step === 'method' ? (
            <>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              {submitting ? (
                <View style={styles.loading}>
                  <ActivityIndicator color={colors.schoolGreen} size="large" />
                  <Text style={styles.loadingLabel}>Gerando pagamento...</Text>
                </View>
              ) : (
                <PaymentMethodPicker onSelect={handleSelectMethod} />
              )}
            </>
          ) : null}

          {step === 'card-form' ? (
            <CreditCardForm
              submitting={submitting}
              error={error}
              onSubmit={(cartao) => runPayment('CREDIT_CARD', cartao)}
            />
          ) : null}

          {step === 'result' && result ? (
            <>
              {result.forma_pagamento === 'CREDIT_CARD' ? (
                <View style={styles.cardResult}>
                  <Text style={styles.cardResultIcon}>{result.status === 'aprovado' ? '✅' : '⚠️'}</Text>
                  <Text style={styles.cardResultMessage}>{result.mensagem}</Text>
                </View>
              ) : null}
              {result.forma_pagamento === 'PIX' ? <PixResult data={result} /> : null}
              {result.forma_pagamento === 'BOLETO' ? <BoletoResult data={result} /> : null}
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTexts: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  close: {
    fontSize: 18,
    color: colors.textMuted,
    padding: spacing.xs,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  loading: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  loadingLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  cardResult: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  cardResultIcon: {
    fontSize: 40,
  },
  cardResultMessage: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
