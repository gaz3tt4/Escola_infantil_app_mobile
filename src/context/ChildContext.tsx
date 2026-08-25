import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getChildren } from '../api/children';
import { useAuth } from './AuthContext';
import type { Child } from '../types';

interface ChildContextValue {
  children_: Child[];
  selectedChild: Child | null;
  isLoading: boolean;
  selectChild: (childId: number) => void;
  reload: () => Promise<void>;
}

const ChildContext = createContext<ChildContextValue | undefined>(undefined);

export function ChildProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [list, setList] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getChildren();
      setList(data);
      if (data.length === 1) {
        setSelectedChildId(data[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      reload();
    } else {
      setList([]);
      setSelectedChildId(null);
    }
  }, [isAuthenticated, reload]);

  const selectChild = useCallback((childId: number) => {
    setSelectedChildId(childId);
  }, []);

  const value = useMemo<ChildContextValue>(
    () => ({
      children_: list,
      selectedChild: list.find((c) => c.id === selectedChildId) ?? null,
      isLoading,
      selectChild,
      reload,
    }),
    [list, selectedChildId, isLoading, selectChild, reload]
  );

  return <ChildContext.Provider value={value}>{children}</ChildContext.Provider>;
}

export function useChildren(): ChildContextValue {
  const ctx = useContext(ChildContext);
  if (!ctx) {
    throw new Error('useChildren deve ser usado dentro de um ChildProvider');
  }
  return ctx;
}
