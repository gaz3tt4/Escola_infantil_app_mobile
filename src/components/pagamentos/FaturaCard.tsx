import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { StatusFaturaPill } from './StatusFaturaPill';
import { Card } from '../ui/Card';
import { TIPO_LABEL, type FaturaComAluno } from '../../services/faturas';
import type { Fatura } from '../../services/types';
import { colors, spacing } from '../../theme';
import { formatCompetencia, formatCurrencyBRL, formatDateBR, firstName } from '../../utils/format';

/** "Mensalidade · set/2026, out/2026" */
export function descricaoFatura(fatura: Pick<Fatura, 'tipo' | 'competencias'>): string {
  const tipo = TIPO_LABEL[fatura.tipo];
  if (fatura.competencias.length === 0) return tipo;
  return `${tipo} · ${fatura.competencias.map(formatCompetencia).join(', ')}`;
}

interface FaturaCardProps {
  fatura: FaturaComAluno;
  showAluno: boolean;
  onPress: () => void;
}

export function FaturaCard({ fatura, showAluno, onPress }: FaturaCardProps) {
  const pagoEm = fatura.status === 'paga' && fatura.pago_em ? `Paga em ${formatDateBR(fatura.pago_em)}` : null;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${descricaoFatura(fatura)}, ${formatCurrencyBRL(fatura.valor)}`}
    >
      <Card style={styles.card}>
        <View style={styles.info}>
          {showAluno ? <Text style={styles.aluno}>{firstName(fatura.alunoNome)}</Text> : null}
          <Text style={styles.descricao}>{descricaoFatura(fatura)}</Text>
          <Text style={styles.data}>{pagoEm ?? `Vence em ${formatDateBR(fatura.vencimento)}`}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.valor}>{formatCurrencyBRL(fatura.valor_pago ?? fatura.valor)}</Text>
          <StatusFaturaPill status={fatura.status} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  aluno: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.brandDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  descricao: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  data: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  valor: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
});
