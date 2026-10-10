import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AlunoSwitcher, useAlunosGate } from '../components/AlunoSwitcher';
import { MedicamentoItem } from '../components/recados/MedicamentoItem';
import { NovoItemSheet } from '../components/recados/NovoItemSheet';
import { RecadoItem } from '../components/recados/RecadoItem';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingView } from '../components/ui/LoadingView';
import { Mascote } from '../components/ui/Mascote';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useAlunos } from '../context/AlunosContext';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { listarMedicamentos } from '../services/medicamentos';
import { listarRecados } from '../services/recados';
import type { Aluno } from '../services/types';
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

  return (
    <ScreenContainer refreshing={isRefreshing} onRefresh={reload}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={typography.title}>Recados de {firstName(aluno.nome)}</Text>
          <Mascote size={22} segments={3} />
        </View>
        <AlunoSwitcher />
        <Button title="Enviar recado ou medicamento" onPress={() => setSheetAberto(true)} />
      </View>

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
                  <MedicamentoItem key={medicamento.id} medicamento={medicamento} />
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
                  <RecadoItem key={recado.id} recado={recado} />
                ))}
              </View>
            )}
          </View>
        </>
      ) : null}

      <NovoItemSheet
        visible={sheetAberto}
        aluno={aluno}
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
