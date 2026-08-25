import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getDailyReport } from '../api/dailyReports';
import { getReminders } from '../api/reminders';
import { DailyReportCard } from '../components/agenda/DailyReportCard';
import { RemindersList } from '../components/agenda/RemindersList';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingView } from '../components/ui/LoadingView';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useChildren } from '../context/ChildContext';
import { colors, radius, spacing } from '../theme/colors';
import { addDaysISO, formatDateLong, todayISO } from '../utils/format';
import type { DailyReport, Reminder } from '../types';

export function AgendaScreen() {
  const { selectedChild } = useChildren();
  const [date, setDate] = useState(todayISO());
  const [report, setReport] = useState<DailyReport | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (showSpinner = true) => {
      if (!selectedChild) return;
      if (showSpinner) setIsLoading(true);
      try {
        const [reportData, remindersData] = await Promise.all([
          getDailyReport(selectedChild.id, date),
          getReminders(),
        ]);
        setReport(reportData);
        setReminders(remindersData);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [selectedChild, date]
  );

  useEffect(() => {
    load();
  }, [load]);

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
      <View style={styles.header}>
        <Text style={styles.title}>Agenda de {selectedChild.nome.split(' ')[0]}</Text>
        <View style={styles.dateNav}>
          <TouchableOpacity style={styles.dateButton} onPress={() => setDate((d) => addDaysISO(d, -1))}>
            <Text style={styles.dateButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.dateLabel}>{formatDateLong(date)}</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setDate((d) => addDaysISO(d, 1))}>
            <Text style={styles.dateButtonText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <LoadingView label="Carregando agenda..." />
      ) : (
        <>
          {report ? (
            <DailyReportCard report={report} />
          ) : (
            <EmptyState
              icon="📭"
              title="Sem relatório neste dia"
              description="A professora ainda não preencheu o relatório diário para essa data."
            />
          )}
          <RemindersList reminders={reminders} />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.schoolGreenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 18,
    color: colors.schoolGreenDark,
    fontWeight: '700',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
});
