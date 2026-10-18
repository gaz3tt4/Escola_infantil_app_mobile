import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AlunoSwitcher, useAlunosGate } from '../components/AlunoSwitcher';
import { ChildHeader } from '../components/perfil/ChildHeader';
import { StatGrid } from '../components/perfil/StatGrid';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { DemoBadge } from '../components/ui/DemoBadge';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingView } from '../components/ui/LoadingView';
import { Mascote } from '../components/ui/Mascote';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useAlunos } from '../context/AlunosContext';
import { useAuth } from '../context/AuthContext';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { obterMatriculaAtiva, PERIODO_LABEL } from '../services/alunos';
import { getMe } from '../services/auth';
import { obterResumoDoAluno } from '../services/perfil';
import type { Aluno, Responsavel } from '../services/types';
import { colors, spacing, typography } from '../theme';
import { firstName, formatCPF, formatCurrencyBRL, formatDateBR, formatTelefone } from '../utils/format';

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? '—'}</Text>
    </View>
  );
}

export function PerfilScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const alunos = useAlunos();
  const gate = useAlunosGate();
  const me = useAsyncResource(getMe);
  const [saindo, setSaindo] = useState(false);

  const refreshing = me.isRefreshing || alunos.isRefreshing;
  const [alunoRefreshKey, setAlunoRefreshKey] = useState(0);

  function handleRefresh() {
    me.reload();
    alunos.reload();
    setAlunoRefreshKey((key) => key + 1);
  }

  async function handleLogout() {
    setSaindo(true);
    await logout();
  }

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh}>
      <View style={styles.header}>
        <View style={styles.headerTexts}>
          <Text style={typography.title}>
            {me.data?.nome ? `Olá, ${firstName(me.data.nome)}!` : 'Perfil'}
          </Text>
          <Text style={styles.headerSubtitle}>Seus dados e dos seus filhos</Text>
        </View>
        <Mascote size={26} segments={3} />
      </View>

      <ResponsavelCard data={me.data} error={me.error} isLoading={me.isLoading} onRetry={me.reload} />

      <AlunoSwitcher />
      {gate ?? (alunos.selectedAluno ? <AlunoSection key={`${alunos.selectedAluno.id}:${alunoRefreshKey}`} aluno={alunos.selectedAluno} /> : null)}

      <View style={styles.actions}>
        <Button title="Alterar senha" variant="outline" onPress={() => navigation.navigate('AlterarSenha')} />
        <Button title="Sair" variant="secondary" onPress={handleLogout} loading={saindo} />
      </View>
    </ScreenContainer>
  );
}

function ResponsavelCard({
  data,
  error,
  isLoading,
  onRetry,
}: {
  data: Responsavel | undefined;
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
}) {
  return (
    <Card style={styles.card}>
      <Text style={typography.sectionTitle}>Responsável</Text>
      {isLoading ? <LoadingView /> : null}
      {error ? <ErrorState message={error} onRetry={onRetry} /> : null}
      {data ? (
        <View style={styles.rows}>
          <InfoRow label="Nome" value={data.nome} />
          <InfoRow label="E-mail" value={data.email} />
          <InfoRow label="CPF" value={data.cpf ? formatCPF(data.cpf) : null} />
          <InfoRow label="Telefone" value={data.telefone ? formatTelefone(data.telefone) : null} />
        </View>
      ) : null}
    </Card>
  );
}

/** Dados do aluno em foco: matrícula (API real) + resumo do mês (mock; os recados têm aba própria). */
function AlunoSection({ aluno }: { aluno: Aluno }) {
  const loader = useCallback(
    () =>
      Promise.all([obterMatriculaAtiva(aluno.id), obterResumoDoAluno(aluno.id)]).then(([matricula, resumo]) => ({
        matricula,
        resumo,
      })),
    [aluno.id]
  );
  const { data, error, isLoading, reload } = useAsyncResource(loader);

  return (
    <>
      <Card style={styles.card}>
        <ChildHeader aluno={aluno} />
        {isLoading ? <LoadingView /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}
        {data ? (
          data.matricula ? (
            <View style={styles.rows}>
              <InfoRow label="Turma" value={data.matricula.turma} />
              <InfoRow label="Período" value={PERIODO_LABEL[data.matricula.periodo] ?? data.matricula.periodo} />
              <InfoRow label="Mensalidade" value={formatCurrencyBRL(data.matricula.valor_mensalidade)} />
              <InfoRow label="Matrícula" value={formatCurrencyBRL(data.matricula.valor_matricula)} />
              <InfoRow label="Início" value={data.matricula.data_inicio ? formatDateBR(data.matricula.data_inicio) : null} />
              {data.matricula.data_fim ? <InfoRow label="Término" value={formatDateBR(data.matricula.data_fim)} /> : null}
            </View>
          ) : (
            <Text style={styles.semMatricula}>Sem matrícula ativa no momento.</Text>
          )
        ) : null}
      </Card>

      {data ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={typography.sectionTitle}>Resumo do mês</Text>
            <DemoBadge />
          </View>
          <StatGrid resumo={data.resumo} />
        </>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerTexts: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: {
    gap: spacing.md,
  },
  rows: {
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
  semMatricula: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  list: {
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
