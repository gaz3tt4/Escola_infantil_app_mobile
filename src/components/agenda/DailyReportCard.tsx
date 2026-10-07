import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { alimentacaoLabels, higieneLabels, humorEmojis, humorLabels, sonoLabels } from './labels';
import { Card } from '../ui/Card';
import { colors, spacing } from '../../theme';
import type { DailyReport } from '../../types';

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

export function DailyReportCard({ report }: { report: DailyReport }) {
  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Relatório do dia</Text>
        <Text style={styles.humorEmoji}>{humorEmojis[report.humor]}</Text>
      </View>
      <Text style={styles.humorLabel}>Humor: {humorLabels[report.humor]}</Text>

      <View style={styles.infoList}>
        <InfoRow icon="🍽️" label="Alimentação" value={`${alimentacaoLabels[report.alimentacao.nivel]} — ${report.alimentacao.descricao}`} />
        <InfoRow
          icon="😴"
          label="Sono"
          value={
            report.sono.duracao_minutos
              ? `${sonoLabels[report.sono.nivel]} (${report.sono.duracao_minutos} min)`
              : sonoLabels[report.sono.nivel]
          }
        />
        <InfoRow
          icon="🧼"
          label="Higiene"
          value={report.higiene.observacao ? `${higieneLabels[report.higiene.nivel]} — ${report.higiene.observacao}` : higieneLabels[report.higiene.nivel]}
        />
      </View>

      {report.atividades.length > 0 && (
        <View style={styles.chipsWrap}>
          {report.atividades.map((atividade) => (
            <View key={atividade} style={styles.chip}>
              <Text style={styles.chipText}>{atividade}</Text>
            </View>
          ))}
        </View>
      )}

      {report.observacoes_professor ? (
        <View style={styles.observacoes}>
          <Text style={styles.observacoesLabel}>Observações da professora</Text>
          <Text style={styles.observacoesText}>{report.observacoes_professor}</Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  humorEmoji: {
    fontSize: 26,
  },
  humorLabel: {
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  infoList: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  rowIcon: {
    fontSize: 20,
    width: 28,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  rowValue: {
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 1,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  chip: {
    backgroundColor: colors.mintSoft,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipText: {
    fontSize: 12,
    color: colors.brandDark,
    fontWeight: '600',
  },
  observacoes: {
    marginTop: spacing.md,
    backgroundColor: colors.skySoft,
    borderRadius: 14,
    padding: spacing.sm + 2,
  },
  observacoesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  observacoesText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});
