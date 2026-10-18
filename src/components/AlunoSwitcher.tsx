import React from 'react';

import { ChipSelector } from './ui/ChipSelector';
import { Backpack } from './ui/icons';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';
import { CentopeiaLoader } from './ui/CentopeiaLoader';
import { useAlunos } from '../context/AlunosContext';
import { firstName } from '../utils/format';

/** Seletor do aluno em foco; só aparece quando o responsável tem mais de um. */
export function AlunoSwitcher() {
  const { alunos, selectedAluno, selectAluno } = useAlunos();
  if (alunos.length < 2 || !selectedAluno) return null;

  return (
    <ChipSelector
      options={alunos.map((aluno) => ({ value: aluno.id, label: firstName(aluno.nome) }))}
      value={selectedAluno.id}
      onChange={selectAluno}
    />
  );
}

/**
 * Estado da lista de alunos para as abas que dependem de um aluno selecionado.
 * Retorna o elemento a exibir (loading/erro/vazio) ou null quando há aluno.
 */
export function useAlunosGate(): React.ReactElement | null {
  const { selectedAluno, isLoading, error, reload } = useAlunos();
  if (isLoading) return <CentopeiaLoader label="Carregando seus filhos..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!selectedAluno) {
    return (
      <EmptyState
        icon={Backpack}
        title="Nenhum aluno vinculado"
        description="Fale com a secretaria da escola para vincular seus filhos à sua conta."
      />
    );
  }
  return null;
}
