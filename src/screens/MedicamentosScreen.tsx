import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AlunoSwitcher, useAlunosGate } from '../components/AlunoSwitcher';
import { MedicamentoItem } from '../components/recados/MedicamentoItem';
import { NovoItemSheet } from '../components/recados/NovoItemSheet';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Pill } from '../components/ui/icons';
import { CentopeiaLoader } from '../components/ui/CentopeiaLoader';
import { Mascote } from '../components/ui/Mascote';
import { Notice } from '../components/ui/Notice';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useAlunos } from '../context/AlunosContext';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { toApiError } from '../services/errors';
import { apagarMedicamento, listarMedicamentos } from '../services/medicamentos';
import type { Aluno, Medicamento } from '../services/types';
import { spacing, typography } from '../theme';
import { firstName } from '../utils/format';

/** Medicamentos do aluno (os recados ficam na Agenda do dia). */
export function MedicamentosScreen() {
  const { selectedAluno } = useAlunos();
  const gate = useAlunosGate();

  return gate || !selectedAluno ? (
    <ScreenContainer>
      <Text style={typography.title}>Medicamentos</Text>
      {gate}
    </ScreenContainer>
  ) : (
    <MedicamentosDoAluno key={selectedAluno.id} aluno={selectedAluno} />
  );
}

function MedicamentosDoAluno({ aluno }: { aluno: Aluno }) {
  const loader = useCallback(() => listarMedicamentos(aluno.id), [aluno.id]);
  const { data: medicamentos, error, isLoading, isRefreshing, reload } = useAsyncResource(loader);
  const [sheetAberto, setSheetAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Medicamento | null>(null);
  const [apagando, setApagando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  function confirmarExclusao(medicamento: Medicamento) {
    Alert.alert('Apagar medicamento?', `${medicamento.nome} e a receita enviada serão removidos.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          setApagando(true);
          setAviso(null);
          try {
            await apagarMedicamento(medicamento.id);
          } catch (err) {
            // 403 (sem permissão) ou 422 (fora do prazo): a mensagem vem do backend.
            setAviso(toApiError(err).message);
          } finally {
            setApagando(false);
            reload();
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer refreshing={isRefreshing} onRefresh={reload}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={typography.title}>Medicamentos de {firstName(aluno.nome)}</Text>
          <Mascote size={22} segments={3} />
        </View>
        <AlunoSwitcher />
        <Button
          title="Informar medicamento"
          onPress={() => {
            setAviso(null);
            setEmEdicao(null);
            setSheetAberto(true);
          }}
        />
      </View>

      {aviso ? <Notice message={aviso} /> : null}
      {isLoading ? <CentopeiaLoader label="Carregando medicamentos..." /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {medicamentos ? (
        medicamentos.length === 0 ? (
          <EmptyState icon={Pill} title="Nenhum medicamento informado" description="Informe aqui os medicamentos que a escola deve dar ao seu filho, com a foto da receita." />
        ) : (
          <View style={styles.list}>
            {medicamentos.map((medicamento) => (
              <MedicamentoItem
                key={medicamento.id}
                medicamento={medicamento}
                busy={apagando}
                onEdit={(item) => {
                  setAviso(null);
                  setEmEdicao(item);
                  setSheetAberto(true);
                }}
                onDelete={confirmarExclusao}
              />
            ))}
          </View>
        )
      ) : null}

      <NovoItemSheet
        key={emEdicao?.id ?? 'novo'}
        modo="medicamento"
        visible={sheetAberto}
        aluno={aluno}
        medicamento={emEdicao}
        onClose={() => setSheetAberto(false)}
        onSent={() => {
          setSheetAberto(false);
          reload();
        }}
      />
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
  list: {
    gap: spacing.sm,
  },
});
