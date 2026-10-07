import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getInvoices } from '../api/payments';
import { InvoiceAccordionCard, statusColors } from '../components/pagamentos/InvoiceAccordionCard';
import { PaymentModal } from '../components/pagamentos/PaymentModal';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingView } from '../components/ui/LoadingView';
import { Pill } from '../components/ui/Pill';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useChildren } from '../context/ChildContext';
import { colors, spacing } from '../theme';
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
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [invoiceInPayment, setInvoiceInPayment] = useState<Invoice | null>(null);

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

  const sorted = useMemo(
    () => invoices.slice().sort((a, b) => b.vencimento.localeCompare(a.vencimento)),
    [invoices]
  );

  const emAberto = useMemo(() => sorted.filter((invoice) => invoice.status !== 'pago'), [sorted]);
  const pagas = useMemo(() => sorted.filter((invoice) => invoice.status === 'pago'), [sorted]);

  function handlePagamentoConcluido() {
    setInvoiceInPayment(null);
    setExpandedId(null);
    load(false);
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Em aberto</Text>
            {emAberto.length === 0 ? (
              <Card>
                <EmptyState icon="✅" title="Tudo em dia!" description="Não há mensalidades pendentes no momento." />
              </Card>
            ) : (
              <View style={styles.list}>
                {emAberto.map((invoice) => (
                  <InvoiceAccordionCard
                    key={invoice.id}
                    invoice={invoice}
                    expanded={expandedId === invoice.id}
                    onToggle={() => setExpandedId((current) => (current === invoice.id ? null : invoice.id))}
                    onPagarAgora={() => setInvoiceInPayment(invoice)}
                  />
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Histórico</Text>
            <View style={styles.list}>
              {pagas.map((invoice) => {
                const statusStyle = statusColors[invoice.status];
                return (
                  <Card key={invoice.id} style={styles.historyItem}>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyDescription}>{invoice.descricao}</Text>
                      <Text style={styles.historyDate}>
                        {invoice.pago_em ? `Pago em ${formatDateBR(invoice.pago_em)}` : formatDateBR(invoice.vencimento)}
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

      <PaymentModal
        invoice={invoiceInPayment}
        onClose={() => setInvoiceInPayment(null)}
        onPaid={handlePagamentoConcluido}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  list: {
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
