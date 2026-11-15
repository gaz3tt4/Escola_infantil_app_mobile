import React, { useState } from 'react';

import { BoletoResult } from './BoletoResult';
import { descricaoFatura } from './FaturaCard';
import { PaymentMethodPicker } from './PaymentMethodPicker';
import { PixResult } from './PixResult';
import { BottomSheet } from '../ui/BottomSheet';
import { CentopeiaLoader } from '../ui/CentopeiaLoader';
import { Notice } from '../ui/Notice';
import { errorMessage } from '../../services/errors';
import { pagarFatura, type FormaPagamento, type ResultadoPagamento } from '../../services/faturas';
import type { Fatura } from '../../services/types';
import { formatCurrencyBRL } from '../../utils/format';

interface PagamentoSheetProps {
  fatura: Fatura;
  visible: boolean;
  /** `gerado` indica que um Pix/boleto foi gerado (a fatura deve ser recarregada). */
  onClose: (gerado: boolean) => void;
}

/** Escolha Pix/Boleto → POST /faturas/{id}/pagamento → QR code ou boleto. */
export function PagamentoSheet({ fatura, visible, onClose }: PagamentoSheetProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultadoPagamento | null>(null);

  function handleClose() {
    if (submitting) return;
    const gerado = result !== null;
    setError(null);
    setResult(null);
    onClose(gerado);
  }

  async function handleSelect(forma: FormaPagamento) {
    setSubmitting(true);
    setError(null);
    try {
      setResult(await pagarFatura(fatura.id, forma));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const title = result ? (result.forma === 'pix' ? 'Pague com Pix' : 'Pague com boleto') : 'Como deseja pagar?';

  return (
    <BottomSheet
      visible={visible}
      title={title}
      subtitle={`${descricaoFatura(fatura)} · ${formatCurrencyBRL(fatura.valor)}`}
      onClose={handleClose}
    >
      {result?.forma === 'pix' ? <PixResult data={result} /> : null}
      {result?.forma === 'boleto' ? <BoletoResult data={result} /> : null}

      {!result ? (
        <>
          {error ? <Notice message={error} /> : null}
          {submitting ? (
            <CentopeiaLoader label="Gerando pagamento..." />
          ) : (
            <PaymentMethodPicker onSelect={handleSelect} />
          )}
        </>
      ) : null}
    </BottomSheet>
  );
}
