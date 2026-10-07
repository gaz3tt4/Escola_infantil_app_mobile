import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Pill } from '../ui/Pill';
import { colors, spacing } from '../../theme';
import { formatCurrencyBRL, formatDateBR } from '../../utils/format';
import type { Invoice, InvoiceStatus } from '../../types';

// Provisório até a tela de Pagamentos usar o FaturaResource.
export const statusColors: Record<InvoiceStatus, { bg: string; fg: string }> = {
  pago: { bg: colors.brandSoft, fg: colors.brandDark },
  pendente: { bg: colors.sunnySoft, fg: colors.warning },
  atrasado: { bg: colors.coralSoft, fg: colors.danger },
};

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  atrasado: 'Atrasado',
};

interface InvoiceAccordionCardProps {
  invoice: Invoice;
  expanded: boolean;
  onToggle: () => void;
  onPagarAgora: () => void;
}

export function InvoiceAccordionCard({ invoice, expanded, onToggle, onPagarAgora }: InvoiceAccordionCardProps) {
  const statusStyle = statusColors[invoice.status];
  const isPayable = invoice.status !== 'pago';
  const valorTotal = invoice.valor_total ?? invoice.valor;

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        activeOpacity={isPayable ? 0.7 : 1}
        onPress={isPayable ? onToggle : undefined}
        style={styles.row}
      >
        <View style={styles.info}>
          <Text style={styles.description}>{invoice.descricao}</Text>
          <Text style={styles.date}>
            {invoice.status === 'pago' && invoice.pago_em
              ? `Pago em ${formatDateBR(invoice.pago_em)}`
              : `Vencimento ${formatDateBR(invoice.vencimento)}`}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.value}>{formatCurrencyBRL(invoice.valor)}</Text>
          <Pill label={STATUS_LABEL[invoice.status]} bg={statusStyle.bg} fg={statusStyle.fg} />
        </View>
        {isPayable ? <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text> : null}
      </TouchableOpacity>

      {isPayable && expanded ? (
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mensalidade</Text>
            <Text style={styles.detailValue}>{formatCurrencyBRL(invoice.valor)}</Text>
          </View>
          {invoice.multa ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Multa</Text>
              <Text style={styles.detailValue}>{formatCurrencyBRL(invoice.multa)}</Text>
            </View>
          ) : null}
          {invoice.juros ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Juros</Text>
              <Text style={styles.detailValue}>{formatCurrencyBRL(invoice.juros)}</Text>
            </View>
          ) : null}
          {invoice.desconto ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Desconto</Text>
              <Text style={[styles.detailValue, styles.discount]}>-{formatCurrencyBRL(invoice.desconto)}</Text>
            </View>
          ) : null}
          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total a pagar</Text>
            <Text style={styles.totalValue}>{formatCurrencyBRL(valorTotal)}</Text>
          </View>

          <View style={styles.payButton}>
            <Button title="Pagar agora" onPress={onPagarAgora} />
          </View>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    gap: spacing.sm,
  },
  info: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chevron: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  details: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  discount: {
    color: colors.brandDark,
  },
  totalRow: {
    marginTop: 4,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.brandDark,
  },
  payButton: {
    marginTop: spacing.sm,
  },
});
