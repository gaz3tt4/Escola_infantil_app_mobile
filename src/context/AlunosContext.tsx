import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { useAsyncResource } from '../hooks/useAsyncResource';
import { listarMeusAlunos } from '../services/alunos';
import type { Aluno } from '../services/types';

interface AlunosContextValue {
  alunos: Aluno[];
  /** Aluno em foco na Agenda/Perfil. Por padrão, o primeiro da lista. */
  selectedAluno: Aluno | null;
  selectAluno: (alunoId: number) => void;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  reload: () => void;
}

const AlunosContext = createContext<AlunosContextValue | undefined>(undefined);

/** Montado só dentro da área autenticada: ao sair, os dados somem junto. */
export function AlunosProvider({ children }: { children: React.ReactNode }) {
  const resource = useAsyncResource(listarMeusAlunos);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const alunos = useMemo(() => resource.data ?? [], [resource.data]);
  const selectedAluno = alunos.find((aluno) => aluno.id === selectedId) ?? alunos[0] ?? null;
  const selectAluno = useCallback((alunoId: number) => setSelectedId(alunoId), []);

  const value = useMemo<AlunosContextValue>(
    () => ({
      alunos,
      selectedAluno,
      selectAluno,
      isLoading: resource.isLoading,
      isRefreshing: resource.isRefreshing,
      error: resource.error,
      reload: resource.reload,
    }),
    [alunos, selectedAluno, selectAluno, resource.isLoading, resource.isRefreshing, resource.error, resource.reload]
  );

  return <AlunosContext.Provider value={value}>{children}</AlunosContext.Provider>;
}

export function useAlunos(): AlunosContextValue {
  const ctx = useContext(AlunosContext);
  if (!ctx) {
    throw new Error('useAlunos deve ser usado dentro de um AlunosProvider');
  }
  return ctx;
}
