import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CobrancaAvulsaSheet } from '../components/pagamentos/CobrancaAvulsaSheet';
import { FaturaCard } from '../components/pagamentos/FaturaCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ChipSelector } from '../components/ui/ChipSelector';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { CentopeiaLoader } from '../components/ui/CentopeiaLoader';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { listarFaturasDosMeusAlunos, podePagar, type FaturaComAluno } from '../services/faturas';
import { CircleCheck, Backpack } from '../components/ui/icons';
import { colors, spacing, typography } from '../theme';
import { formatCurrencyBRL } from '../utils/format';

type Filtro = number | 'todos';

export function PagamentosScreen() {
  const navigation = useNavigation();
  const { data, error, isLoading, isRefreshing, reload } = useAsyncResource(listarFaturasDosMeusAlunos);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [avulsaAberta, setAvulsaAberta] = useState(false);

  // Recarrega ao voltar do detalhe (o status pode ter mudado), mas não no primeiro foco.
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      reload();
    }, [reload])
  );

  const alunos = useMemo(() => data?.alunos ?? [], [data]);
  const filtroAtivo: Filtro = filtro !== 'todos' && alunos.some((aluno) => aluno.id === filtro) ? filtro : 'todos';

  const { emAberto, historico, totalEmAberto } = useMemo(() => {
    const faturas = (data?.faturas ?? []).filter((fatura) => filtroAtivo === 'todos' || fatura.alunoId === filtroAtivo);
    const abertas = faturas.filter((fatura) => podePagar(fatura.status));
    return {
      emAberto: abertas,
      historico: faturas.filter((fatura) => !podePagar(fatura.status)),
      totalEmAberto: abertas.reduce((total, fatura) => total + fatura.valor, 0),
    };
  }, [data, filtroAtivo]);

  function openFatura(fatura: Pick<FaturaComAluno, 'id' | 'alunoNome'>) {
    navigation.navigate('FaturaDetalhe', { faturaId: fatura.id, alunoNome: fatura.alunoNome });
  }

  function renderContent() {
    if (isLoading) return <CentopeiaLoader label="Carregando pagamentos..." />;
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (alunos.length === 0) {
      return <EmptyState icon={Backpack} title="Nenhum aluno vinculado" description="Fale com a secretaria da escola para vincular seus filhos à sua conta." />;
    }

    const showAluno = alunos.length > 1 && filtroAtivo === 'todos';

    return (
      <>
        {alunos.length > 1 ? (
          <ChipSelector<Filtro>
            options={[{ value: 'todos', label: 'Todos' }, ...alunos.map((aluno) => ({ value: aluno.id, label: aluno.nome }))]}
            value={filtroAtivo}
            onChange={setFiltro}
          />
        ) : null}

        {emAberto.length > 0 ? (
          <Card tint={colors.brandSoft} style={styles.resumo}>
            <Text style={styles.resumoLabel}>Total em aberto</Text>
            <Text style={styles.resumoValor}>{formatCurrencyBRL(totalEmAberto)}</Text>
          </Card>
        ) : null}

        <View style={styles.section}>
          <Text style={typography.sectionTitle}>Em aberto</Text>
          {emAberto.length === 0 ? (
            <Card>
              <EmptyState icon={CircleCheck} title="Tudo em dia!" description="Não há cobranças em aberto no momento." />
            </Card>
          ) : (
            <View style={styles.list}>
              {emAberto.map((fatura) => (
                <FaturaCard key={fatura.id} fatura={fatura} showAluno={showAluno} onPress={() => openFatura(fatura)} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={typography.sectionTitle}>Histórico</Text>
          {historico.length === 0 ? (
            <Text style={styles.emptyHistory}>Nenhuma cobrança paga ou cancelada ainda.</Text>
          ) : (
            <View style={styles.list}>
              {historico.map((fatura) => (
                <FaturaCard key={fatura.id} fatura={fatura} showAluno={showAluno} onPress={() => openFatura(fatura)} />
              ))}
            </View>
          )}
        </View>
      </>
    );
  }

  return (
    <ScreenContainer refreshing={isRefreshing} onRefresh={reload}>
      <View style={styles.header}>
        <Text style={typography.title}>Pagamentos</Text>
        {alunos.length > 0 ? (
          <Button title="Adiantar / gerar cobrança" variant="outline" onPress={() => setAvulsaAberta(true)} />
        ) : null}
      </View>

      {renderContent()}

      <CobrancaAvulsaSheet
        visible={avulsaAberta}
        alunos={alunos}
        faturas={data?.faturas ?? []}
        alunoInicialId={filtroAtivo === 'todos' ? null : filtroAtivo}
        onClose={() => setAvulsaAberta(false)}
        onCreated={(fatura, aluno) => {
          setAvulsaAberta(false);
          openFatura({ id: fatura.id, alunoNome: aluno.nome });
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
  },
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resumoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandDark,
  },
  resumoValor: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.brandDark,
  },
  section: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  emptyHistory: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
