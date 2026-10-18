import { useCallback, useState } from 'react';

import { usePendencias } from '../context/PendenciasContext';
import { errorMessage } from '../services/errors';
import { registrarCiencia } from '../services/ciencia';

/**
 * Confirma a ciência de uma agenda. Em caso de falha (ex.: sem rede) guarda a mensagem para a
 * tela mostrar e permite tentar de novo; a ciência é idempotente no backend.
 */
export function useConfirmarCiencia(onConfirmada: (agendaId: number) => void) {
  const { marcarCiente } = usePendencias();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmar = useCallback(
    async (agendaId: number) => {
      setLoading(true);
      setError(null);
      try {
        await registrarCiencia(agendaId);
        await marcarCiente(agendaId);
        onConfirmada(agendaId);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [marcarCiente, onConfirmada]
  );

  const limparErro = useCallback(() => setError(null), []);

  return { confirmar, loading, error, limparErro };
}
