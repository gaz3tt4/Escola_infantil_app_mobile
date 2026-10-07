import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AlunoSwitcher, useAlunosGate } from '../components/AlunoSwitcher';
import { DailyReportCard } from '../components/agenda/DailyReportCard';
import { RemindersList } from '../components/agenda/RemindersList';
import { DemoBadge } from '../components/ui/DemoBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingView } from '../components/ui/LoadingView';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useAlunos } from '../context/AlunosContext';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { listarLembretes, obterRelatorioDiario } from '../services/agenda';
import type { Aluno } from '../services/types';
import { colors, radius, spacing, typography } from '../theme';
import { addDaysISO, firstName, formatDateLong, todayISO } from '../utils/format';

export function AgendaScreen() {
  const { selectedAluno } = useAlunos();
  const gate = useAlunosGate();

  return gate || !selectedAluno ? (
    <ScreenContainer>
      <Text style={typography.title}>Agenda</Text>
      {gate}
    </ScreenContainer>
  ) : (
    <AgendaDoAluno key={selectedAluno.id} aluno={selectedAluno} />
  );
}

function AgendaDoAluno({ aluno }: { aluno: Aluno }) {
  const [date, setDate] = useState(todayISO);
  const isToday = date === todayISO();

  const loader = useCallback(
    () =>
      Promise.all([obterRelatorioDiario(aluno.id, date), listarLembretes()]).then(([relatorio, lembretes]) => ({
        relatorio,
        lembretes,
      })),
    [aluno.id, date]
  );
  const { data, error, isLoading, isRefreshing, reload } = useAsyncResource(loader);

  return (
    <ScreenContainer refreshing={isRefreshing} onRefresh={reload}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={typography.title}>Agenda de {firstName(aluno.nome)}</Text>
          <DemoBadge />
        </View>
        <AlunoSwitcher />
        <View style={styles.dateNav}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setDate((d) => addDaysISO(d, -1))}
            accessibilityRole="button"
            accessibilityLabel="Dia anterior"
          >
            <Text style={styles.dateButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.dateLabel}>{isToday ? 'Hoje' : formatDateLong(date)}</Text>
          <TouchableOpacity
            style={[styles.dateButton, isToday && styles.dateButtonDisabled]}
            onPress={() => setDate((d) => addDaysISO(d, 1))}
            disabled={isToday}
            accessibilityRole="button"
            accessibilityLabel="Próximo dia"
          >
            <Text style={styles.dateButtonText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? <LoadingView label="Carregando agenda..." /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {data ? (
        <>
          {data.relatorio ? (
            <DailyReportCard report={data.relatorio} />
          ) : (
            <EmptyState
              icon="📭"
              title="Sem relatório neste dia"
              description="A professora ainda não preencheu o relatório diário para essa data."
            />
          )}
          <RemindersList reminders={data.lembretes} />
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  dateButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonDisabled: {
    opacity: 0.35,
  },
  dateButtonText: {
    fontSize: 20,
    color: colors.onBrand,
    fontWeight: '800',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
});
