import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import { checkout, getInvoices } from '../api/payments';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingView } from '../components/ui/LoadingView';
import { Pill } from '../components/ui/Pill';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useChildren } from '../context/ChildContext';
import { colors, radius, spacing, statusColors } from '../theme/colors';
import { formatCurrencyBRL, formatDateBR } from '../utils/format';
import type { Invoice, InvoiceStatus } from '../types';

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  atrasado: 'Atrasado',
};

export function PagamentosScreen() {
  const { selectedChild } = useChildren();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const load = useCallback(
    async (showSpinner = true) => {
      if (!selectedChild) return;
      if (showSpinner) setIsLoading(true);
      try {
        const data = await getInvoices(selectedChild.id);
        setInvoices(data);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [selectedChild]
  );

  useEffect(() => {
    load();
  }, [load]);

  const nextDue = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.status !== 'pago')
        .sort((a, b) => a.vencimento.localeCompare(b.vencimento))[0] ?? null,
    [invoices]
  );

  const history = useMemo(
    () => invoices.slice().sort((a, b) => b.vencimento.localeCompare(a.vencimento)),
    [invoices]
  );

  async function handlePay() {
    if (!nextDue) return;
    setIsPaying(true);
    try {
      const response = await checkout({ invoice_id: nextDue.id });
      await Linking.openURL(response.checkout_url).catch(() => {
        Alert.alert('Pagamento', 'Checkout gerado. Em produção, isso abrirá o link de pagamento do Asaas.');
      });
    } catch {
      Alert.alert('Não foi possível iniciar o pagamento', 'Tente novamente em instantes.');
    } finally {
      setIsPaying(false);
    }
  }

  if (!selectedChild) {
    return <LoadingView label="Carregando..." />;
  }

  return (
    <ScreenContainer
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load(false);
      }}
    >
      <Text style={styles.title}>Pagamentos</Text>

      {isLoading ? (
        <LoadingView label="Carregando pagamentos..." />
      ) : (
        <>
          {nextDue ? (
            <View style={styles.dueCard}>
              <Text style={styles.dueLabel}>Próximo vencimento</Text>
              <Text style={styles.dueDescription}>{nextDue.descricao}</Text>
              <Text style={styles.dueValue}>{formatCurrencyBRL(nextDue.valor)}</Text>
              <Text style={styles.dueDate}>Vence em {formatDateBR(nextDue.vencimento)}</Text>
              <View style={styles.dueButton}>
                <Button title="Pagar agora" onPress={handlePay} loading={isPaying} />
              </View>
            </View>
          ) : (
            <Card>
              <EmptyState icon="✅" title="Tudo em dia!" description="Não há mensalidades pendentes no momento." />
            </Card>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Histórico</Text>
            <View style={styles.historyList}>
              {history.map((invoice) => {
                const statusStyle = statusColors[invoice.status];
                return (
                  <Card key={invoice.id} style={styles.historyItem}>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyDescription}>{invoice.descricao}</Text>
                      <Text style={styles.historyDate}>
                        {invoice.status === 'pago' && invoice.pago_em
                          ? `Pago em ${formatDateBR(invoice.pago_em)}`
                          : `Vencimento ${formatDateBR(invoice.vencimento)}`}
                      </Text>
                    </View>
                    <View style={styles.historyRight}>
                      <Text style={styles.historyValue}>{formatCurrencyBRL(invoice.valor)}</Text>
                      <Pill label={STATUS_LABEL[invoice.status]} bg={statusStyle.bg} fg={statusStyle.fg} />
                    </View>
                  </Card>
                );
              })}
            </View>
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dueCard: {
    backgroundColor: colors.schoolGreen,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 2,
  },
  dueLabel: {
    color: '#EAFBF2',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dueDescription: {
    color: '#fff',
    fontSize: 15,
    marginTop: 4,
  },
  dueValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  dueDate: {
    color: '#EAFBF2',
    fontSize: 13,
    marginTop: 2,
  },
  dueButton: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyList: {
    gap: spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  historyDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  historyDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  historyValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
