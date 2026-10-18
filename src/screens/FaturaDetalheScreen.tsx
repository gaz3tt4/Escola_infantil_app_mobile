import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { descricaoFatura } from '../components/pagamentos/FaturaCard';
import { PagamentoSheet } from '../components/pagamentos/PagamentoSheet';
import { StatusFaturaPill } from '../components/pagamentos/StatusFaturaPill';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CopyButton } from '../components/ui/CopyButton';
import { ErrorState } from '../components/ui/ErrorState';
import { CentopeiaLoader } from '../components/ui/CentopeiaLoader';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { obterFatura, podePagar, TIPO_LABEL } from '../services/faturas';
import type { Fatura } from '../services/types';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { formatCompetencia, formatCurrencyBRL, formatDateBR, formatDateTimeBR } from '../utils/format';
import { openExternalUrl } from '../utils/links';

type Props = NativeStackScreenProps<RootStackParamList, 'FaturaDetalhe'>;

const FORMA_LABEL = { pix: 'Pix', boleto: 'Boleto' } as const;

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function FaturaDetalheScreen({ route }: Props) {
  const { faturaId, alunoNome } = route.params;
  const loader = useCallback(() => obterFatura(faturaId), [faturaId]);
  const { data: fatura, error, isLoading, isRefreshing, reload } = useAsyncResource(loader);
  const [pagando, setPagando] = useState(false);

  if (isLoading) return <CentopeiaLoader label="Carregando fatura..." />;

  return (
    <ScreenContainer edges={[]} refreshing={isRefreshing} onRefresh={reload}>
      {error || !fatura ? (
        <ErrorState message={error ?? 'Fatura não encontrada.'} onRetry={reload} />
      ) : (
        <FaturaDetalhe
          fatura={fatura}
          alunoNome={fatura.aluno ?? alunoNome}
          onPagar={() => setPagando(true)}
        />
      )}

      {fatura ? (
        <PagamentoSheet
          fatura={fatura}
          visible={pagando}
          onClose={(gerado) => {
            setPagando(false);
            if (gerado) reload();
          }}
        />
      ) : null}
    </ScreenContainer>
  );
}

function FaturaDetalhe({ fatura, alunoNome, onPagar }: { fatura: Fatura; alunoNome: string; onPagar: () => void }) {
  const aberta = podePagar(fatura.status);

  return (
    <>
      <Card style={styles.hero}>
        <Text style={styles.aluno}>{alunoNome}</Text>
        <Text style={styles.descricao}>{descricaoFatura(fatura)}</Text>
        <Text style={styles.valor}>{formatCurrencyBRL(fatura.valor)}</Text>
        <StatusFaturaPill status={fatura.status} />
      </Card>

      <Card style={styles.infoCard}>
        <InfoRow label="Tipo" value={TIPO_LABEL[fatura.tipo]} />
        {fatura.competencias.length > 0 ? (
          <InfoRow
            label={fatura.competencias.length > 1 ? 'Competências' : 'Competência'}
            value={fatura.competencias.map(formatCompetencia).join(', ')}
          />
        ) : null}
        <InfoRow label="Vencimento" value={formatDateBR(fatura.vencimento)} />
        {fatura.forma_pagamento ? <InfoRow label="Forma de pagamento" value={FORMA_LABEL[fatura.forma_pagamento]} /> : null}
        {fatura.valor_pago !== null ? <InfoRow label="Valor pago" value={formatCurrencyBRL(fatura.valor_pago)} /> : null}
        {fatura.pago_em ? <InfoRow label="Pago em" value={formatDateTimeBR(fatura.pago_em)} /> : null}
      </Card>

      {aberta ? (
        <>
          <Button title="Pagar" onPress={onPagar} />

          {/* Preenchidos só depois de um pagamento já gerado via /pagamento. */}
          {fatura.pix_copia_cola ? (
            <Card style={styles.codeCard}>
              <Text style={styles.codeTitle}>Código Pix já gerado</Text>
              <Text style={styles.code} numberOfLines={2} selectable>
                {fatura.pix_copia_cola}
              </Text>
              <CopyButton value={fatura.pix_copia_cola} label="Copiar código Pix" variant="outline" />
            </Card>
          ) : null}
          {fatura.linha_digitavel ? (
            <Card style={styles.codeCard}>
              <Text style={styles.codeTitle}>Linha digitável do boleto</Text>
              <Text style={styles.code} selectable>
                {fatura.linha_digitavel}
              </Text>
              <CopyButton value={fatura.linha_digitavel} label="Copiar linha digitável" variant="outline" />
            </Card>
          ) : null}
        </>
      ) : null}

      {fatura.link_fatura ? (
        <Button title="Ver fatura online" variant="secondary" onPress={() => openExternalUrl(fatura.link_fatura ?? '')} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  aluno: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.brandDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  descricao: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  valor: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: spacing.xs,
  },
  infoCard: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  rowValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  codeCard: {
    gap: spacing.sm,
  },
  codeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  code: {
    fontSize: 12,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
});
