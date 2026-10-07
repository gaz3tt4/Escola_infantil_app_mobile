import { useCallback, useEffect, useState } from 'react';

import { errorMessage } from '../services/errors';

type Outcome<T> = { ok: true; data: T } | { ok: false; error: string };

interface Entry<T> {
  loader: () => Promise<T>;
  version: number;
  outcome: Outcome<T>;
}

export interface AsyncResource<T> {
  data: T | undefined;
  error: string | null;
  /** Primeira carga (ou troca de parâmetros): ainda não há nada para mostrar. */
  isLoading: boolean;
  /** Recarga com dados já na tela (pull-to-refresh / tentar novamente). */
  isRefreshing: boolean;
  reload: () => void;
}

/**
 * Carrega dados de um serviço com estados de loading/erro/refresh.
 * `loader` deve ser estável (useCallback); trocar o loader recarrega do zero.
 */
export function useAsyncResource<T>(loader: () => Promise<T>): AsyncResource<T> {
  const [version, setVersion] = useState(0);
  const [entry, setEntry] = useState<Entry<T> | null>(null);

  useEffect(() => {
    let active = true;
    loader().then(
      (data) => active && setEntry({ loader, version, outcome: { ok: true, data } }),
      (error: unknown) => active && setEntry({ loader, version, outcome: { ok: false, error: errorMessage(error) } })
    );
    return () => {
      active = false;
    };
  }, [loader, version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  const sameLoader = entry?.loader === loader;
  const outcome = sameLoader ? entry.outcome : undefined;

  return {
    data: outcome?.ok ? outcome.data : undefined,
    error: outcome && !outcome.ok ? outcome.error : null,
    isLoading: !sameLoader,
    isRefreshing: sameLoader && entry.version !== version,
    reload,
  };
}
