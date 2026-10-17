import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AlunoSwitcher, useAlunosGate } from '../components/AlunoSwitcher';
import { AgendaDoDia, agendaSemBlocos, agendaSemConteudo, RefeicoesBloco } from '../components/agenda/AgendaDoDia';
import { AvisosList } from '../components/agenda/AvisosList';
import { CienciaBarra, CienciaSheet } from '../components/agenda/CienciaSheet';
import { NovoItemSheet } from '../components/recados/NovoItemSheet';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Icon } from '../components/ui/Icon';
import { ChevronLeft, ChevronRight, Inbox } from '../components/ui/icons';
import { LoadingView } from '../components/ui/LoadingView';
import { Mascote } from '../components/ui/Mascote';
import { Notice } from '../components/ui/Notice';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useAlunos } from '../context/AlunosContext';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { useConfirmarCiencia } from '../hooks/useConfirmarCiencia';
import { useFimDaPagina } from '../hooks/useFimDaPagina';
import { clearAgendaTarget, useAgendaTarget, type AgendaTarget } from '../notifications/agendaTarget';
import { obterAgenda, temCardapio } from '../services/agenda';
import { listarAvisos } from '../services/avisos';
import { toApiError } from '../services/errors';
import { apagarRecado } from '../services/recados';
import type { Aluno, Recado } from '../services/types';
import { colors, radius, spacing, typography } from '../theme';
import { addDaysISO, firstName, formatDateLong, todayISO } from '../utils/format';

export function AgendaScreen() {
  const { alunos, selectedAluno, selectAluno } = useAlunos();
  const gate = useAlunosGate();
  const alvo = useAgendaTarget();

  // Toque na notificação: foca o aluno do aviso; a data é aplicada por AgendaDoAluno.
  useEffect(() => {
    if (!alvo) return;
    if (alunos.some((aluno) => aluno.id === alvo.alunoId)) {
      selectAluno(alvo.alunoId);
    } else if (alunos.length > 0) {
      clearAgendaTarget();
    }
  }, [alvo, alunos, selectAluno]);

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
  const alvo = useAgendaTarget();
  const [date, setDate] = useState(() => (alvo && alvo.alunoId === aluno.id ? alvo.data : todayISO()));
  const isToday = date === todayISO();

  // Data do push: aplicada durante a renderização (uma vez por destino) e depois liberada.
  const [aplicado, setAplicado] = useState<AgendaTarget | null>(null);
  if (alvo && alvo !== aplicado && alvo.alunoId === aluno.id) {
    setAplicado(alvo);
    setDate(alvo.data);
  }
  useEffect(() => {
    if (alvo && alvo.alunoId === aluno.id) clearAgendaTarget();
  }, [alvo, aluno.id]);

  const loader = useCallback(
    () =>
      Promise.all([
        obterAgenda(aluno.id, date),
        // Falha nos avisos não derruba a agenda.
        listarAvisos(aluno.id, date).catch(() => []),
      ]).then(([{ agenda, cardapio }, avisos]) => ({ agenda, cardapio, avisos })),
    [aluno.id, date]
  );
  const { data, error, isLoading, isRefreshing, reload } = useAsyncResource(loader);

  // Ciência: pop-up ao chegar ao fim; agenda curta (cabe sem rolar) usa a barra fixa.
  const fim = useFimDaPagina();
  const [confirmadas, setConfirmadas] = useState<ReadonlySet<number>>(new Set());
  const [dispensada, setDispensada] = useState<number | null>(null);
  const onConfirmada = useCallback((agendaId: number) => {
    setConfirmadas((atual) => new Set(atual).add(agendaId));
  }, []);
  const ciencia = useConfirmarCiencia(onConfirmada);

  // Recados: enviar, editar e apagar os próprios (dentro de `editavel_ate`) sem sair da Agenda.
  const [recadoAberto, setRecadoAberto] = useState(false);
  const [recadoEmEdicao, setRecadoEmEdicao] = useState<Recado | null>(null);
  const [apagando, setApagando] = useState(false);
  const [avisoRecado, setAvisoRecado] = useState<string | null>(null);

  function confirmarExclusaoRecado(recado: Recado) {
    Alert.alert('Apagar recado?', 'O recado será removido e o professor deixará de vê-lo.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          setApagando(true);
          setAvisoRecado(null);
          try {
            await apagarRecado(recado.id);
          } catch (err) {
            // 403 (não é seu) ou 422 (passou do prazo): a mensagem vem do backend.
            setAvisoRecado(toApiError(err).message);
          } finally {
            setApagando(false);
            reload();
          }
        },
      },
    ]);
  }

  const agenda = data?.agenda ?? null;
  // Agenda "só de recado" (sem blocos) não exige ciência: o backend não a lista como pendente nem envia push.
  const exigeCiencia = agenda !== null && !agendaSemBlocos(agenda);
  const pendente = exigeCiencia && !agenda.ciente && !confirmadas.has(agenda.id);
  const cienteAgora = exigeCiencia && (agenda.ciente || confirmadas.has(agenda.id));
  const sheetAberto = pendente && fim.chegouAoFim && dispensada !== agenda.id;
  const confirmar = () => {
    if (agenda) void ciencia.confirmar(agenda.id);
  };

  return (
    <ScreenContainer
      refreshing={isRefreshing}
      onRefresh={reload}
      scrollProps={fim.scrollProps}
      footer={
        pendente && fim.cabeNaTela ? (
          <CienciaBarra loading={ciencia.loading} error={ciencia.error} onConfirm={confirmar} />
        ) : null
      }
    >
      <View style={styles.header}>
        <Text style={typography.title}>Agenda de {firstName(aluno.nome)}</Text>
        <AlunoSwitcher />
        <View style={styles.dateNav}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setDate((d) => addDaysISO(d, -1))}
            accessibilityRole="button"
            accessibilityLabel="Dia anterior"
          >
            <Icon icon={ChevronLeft} color="onBrand" />
          </TouchableOpacity>
          <Text style={styles.dateLabel}>{isToday ? 'Hoje' : formatDateLong(date)}</Text>
          <TouchableOpacity
            style={[styles.dateButton, isToday && styles.dateButtonDisabled]}
            onPress={() => setDate((d) => addDaysISO(d, 1))}
            disabled={isToday}
            accessibilityRole="button"
            accessibilityLabel="Próximo dia"
          >
            <Icon icon={ChevronRight} color="onBrand" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? <LoadingView label="Carregando agenda..." /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {data ? (
        <>
          {cienteAgora ? <Notice tone="success" message="Ciência confirmada. Obrigado!" /> : null}
          {agenda && !agendaSemConteudo(agenda, data.cardapio) ? (
            <AgendaDoDia
              agenda={agenda}
              cardapio={data.cardapio}
              busy={apagando}
              onEditRecado={(recado) => {
                setAvisoRecado(null);
                setRecadoEmEdicao(recado);
                setRecadoAberto(true);
              }}
              onDeleteRecado={confirmarExclusaoRecado}
            />
          ) : !agenda && temCardapio(data.cardapio) ? (
            <View style={styles.semAgenda}>
              <Text style={styles.legenda}>A professora ainda não lançou a agenda deste dia. Veja o cardápio:</Text>
              <RefeicoesBloco refeicoes={[]} cardapio={data.cardapio} />
            </View>
          ) : (
            <View style={styles.vazio}>
              <Mascote size={30} segments={3} />
              <EmptyState
                icon={Inbox}
                title={agenda ? 'Agenda sem registros' : 'Sem agenda neste dia'}
                description={
                  agenda
                    ? 'A professora ainda não registrou nada nesta agenda.'
                    : 'A professora ainda não lançou a agenda para essa data.'
                }
              />
            </View>
          )}
          {avisoRecado ? <Notice message={avisoRecado} /> : null}
          {isToday ? (
            <Button
              title="Enviar recado ao professor"
              variant="outline"
              onPress={() => {
                setAvisoRecado(null);
                setRecadoEmEdicao(null);
                setRecadoAberto(true);
              }}
            />
          ) : null}
          <AvisosList avisos={data.avisos} />
          {/* Fallback para quem dispensou o pop-up (agenda longa); a curta usa a barra fixa. */}
          {pendente && !fim.cabeNaTela ? (
            <Button title="Confirmar ciência" onPress={confirmar} loading={ciencia.loading} />
          ) : null}
          {pendente && !fim.cabeNaTela && ciencia.error && !sheetAberto ? <Notice message={ciencia.error} /> : null}
        </>
      ) : null}

      <NovoItemSheet
        key={recadoEmEdicao?.id ?? 'novo'}
        modo="recado"
        visible={recadoAberto}
        aluno={aluno}
        recado={recadoEmEdicao}
        onClose={() => setRecadoAberto(false)}
        onSent={() => {
          setRecadoAberto(false);
          reload();
        }}
      />

      <CienciaSheet
        visible={sheetAberto}
        loading={ciencia.loading}
        error={ciencia.error}
        onConfirm={confirmar}
        onClose={() => {
          ciencia.limparErro();
          if (agenda) setDispensada(agenda.id);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  semAgenda: {
    gap: spacing.md,
  },
  legenda: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  vazio: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
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
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
});
