import { apiClient } from './client';
import { USE_MOCKS } from './config';
import { MOCK_INVOICES } from '../mocks/data';
import { mockDelay } from '../utils/delay';
import type { Invoice, PagamentoRequest, PagamentoResponse } from '../types';

// GET /children/{id}/invoices
export async function getInvoices(childId: number): Promise<Invoice[]> {
  if (USE_MOCKS) {
    return mockDelay(MOCK_INVOICES[childId] ?? []);
  }

  const { data } = await apiClient.get<Invoice[]>(`/children/${childId}/invoices`);
  return data;
}

// POST /mensalidades/{id}/pagamento
export async function payInvoice(invoiceId: number, payload: PagamentoRequest): Promise<PagamentoResponse> {
  if (USE_MOCKS) {
    if (payload.forma_pagamento === 'CREDIT_CARD') {
      const recusado = payload.cartao?.numero?.endsWith('0000');
      await mockDelay(null, 700);
      if (recusado) {
        throw new Error('Cartão recusado pela operadora. Verifique os dados ou tente outro cartão.');
      }
      return {
        forma_pagamento: 'CREDIT_CARD',
        status: 'aprovado',
        mensagem: 'Pagamento aprovado com sucesso.',
      };
    }

    if (payload.forma_pagamento === 'PIX') {
      return mockDelay(
        {
          forma_pagamento: 'PIX',
          qr_code_base64:
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
          copia_cola: `00020126580014BR.GOV.BCB.PIX0136mock-pix-${invoiceId}5204000053039865405${'0'.repeat(1)}5802BR5913Centopeia Ltda6009Sao Paulo62070503***6304ABCD`,
        },
        600
      );
    }

    return mockDelay(
      {
        forma_pagamento: 'BOLETO',
        linha_digitavel: '34191.79001 01043.510047 91020.150008 8 96520000089000',
        boleto_url: 'https://sandbox.example.com/boletos/mock.pdf',
      },
      600
    );
  }

  const { data } = await apiClient.post<PagamentoResponse>(`/mensalidades/${invoiceId}/pagamento`, payload);
  return data;
}
