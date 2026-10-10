import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AlunoSwitcher, useAlunosGate } from '../components/AlunoSwitcher';
import { MedicamentoItem } from '../components/recados/MedicamentoItem';
import { NovoItemSheet } from '../components/recados/NovoItemSheet';
import { RecadoItem } from '../components/recados/RecadoItem';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingView } from '../components/ui/LoadingView';
import { Mascote } from '../components/ui/Mascote';
import { Notice } from '../components/ui/Notice';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useAlunos } from '../context/AlunosContext';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { toApiError } from '../services/errors';
import { apagarMedicamento, listarMedicamentos } from '../services/medicamentos';
import { apagarRecado, listarRecados } from '../services/recados';
import type { Aluno, Medicamento, Recado } from '../services/types';
import { colors, spacing, typography } from '../theme';
import { firstName } from '../utils/format';

export function RecadosScreen() {
  const { selectedAluno } = useAlunos();
  const gate = useAlunosGate();

  return gate || !selectedAluno ? (
    <ScreenContainer>
      <Text style={typography.title}>Recados</Text>
      {gate}
    </ScreenContainer>
  ) : (
    <RecadosDoAluno key={selectedAluno.id} aluno={selectedAluno} />
  );
}

function RecadosDoAluno({ aluno }: { aluno: Aluno }) {
  const loader = useCallback(
    () =>
      Promise.all([listarRecados(aluno.id), listarMedicamentos(aluno.id)]).then(([recados, medicamentos]) => ({
        recados,
        medicamentos,
      })),
    [aluno.id]
  );
  const { data, error, isLoading, isRefreshing, reload } = useAsyncResource(loader);
  const [sheetAberto, setSheetAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Medicamento | null>(null);
  const [recadoEmEdicao, setRecadoEmEdicao] = useState<Recado | null>(null);
  const [apagando, setApagando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  function confirmarExclusaoRecado(recado: Recado) {
    Alert.alert('Apagar recado?', 'O recado será removido e o professor deixará de vê-lo.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          setApagando(true);
          setAviso(null);
          try {
            await apagarRecado(recado.id);
          } catch (error) {
            // 403 (não é seu) ou 422 (passou do prazo): a mensagem vem do backend.
            setAviso(toApiError(error).message);
          } finally {
            setApagando(false);
            reload();
          }
        },
      },
    ]);
  }

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
          } catch (error) {
            // 403 (sem permissão) ou 422 (fora do prazo): a mensagem vem do backend.
            setAviso(toApiError(error).message);
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
          <Text style={typography.title}>Recados de {firstName(aluno.nome)}</Text>
          <Mascote size={22} segments={3} />
        </View>
        <AlunoSwitcher />
        <Button
          title="Enviar recado ou medicamento"
          onPress={() => {
            setAviso(null);
            setEmEdicao(null);
            setRecadoEmEdicao(null);
            setSheetAberto(true);
          }}
        />
      </View>

      {aviso ? <Notice message={aviso} /> : null}
      {isLoading ? <LoadingView label="Carregando recados..." /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {data ? (
        <>
          <View style={styles.section}>
            <Text style={typography.sectionTitle}>Medicamentos</Text>
            {data.medicamentos.length === 0 ? (
              <Text style={styles.empty}>Nenhum medicamento informado.</Text>
            ) : (
              <View style={styles.list}>
                {data.medicamentos.map((medicamento) => (
                  <MedicamentoItem
                    key={medicamento.id}
                    medicamento={medicamento}
                    busy={apagando}
                    onEdit={(item) => {
                      setAviso(null);
                      setRecadoEmEdicao(null);
                      setEmEdicao(item);
                      setSheetAberto(true);
                    }}
                    onDelete={confirmarExclusao}
                  />
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={typography.sectionTitle}>Recados</Text>
            {data.recados.length === 0 ? (
              <EmptyState icon="💌" title="Nenhum recado por aqui" description="Os recados da escola e os que você enviar aparecem nesta lista." />
            ) : (
              <View style={styles.list}>
                {data.recados.map((recado) => (
                  <RecadoItem
                    key={recado.id}
                    recado={recado}
                    busy={apagando}
                    onEdit={(item) => {
                      setAviso(null);
                      setEmEdicao(null);
                      setRecadoEmEdicao(item);
                      setSheetAberto(true);
                    }}
                    onDelete={confirmarExclusaoRecado}
                  />
                ))}
              </View>
            )}
          </View>
        </>
      ) : null}

      <NovoItemSheet
        key={`${emEdicao?.id ?? 'novo'}-${recadoEmEdicao?.id ?? ''}`}
        visible={sheetAberto}
        aluno={aluno}
        medicamento={emEdicao}
        recado={recadoEmEdicao}
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
  section: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  empty: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
