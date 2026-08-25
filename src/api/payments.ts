import { apiClient } from './client';
import { USE_MOCKS } from './config';
import { MOCK_INVOICES } from '../mocks/data';
import { mockDelay } from '../utils/delay';
import type { Invoice, PaymentCheckoutRequest, PaymentCheckoutResponse } from '../types';

// GET /children/{id}/invoices
export async function getInvoices(childId: number): Promise<Invoice[]> {
  if (USE_MOCKS) {
    return mockDelay(MOCK_INVOICES[childId] ?? []);
  }

  const { data } = await apiClient.get<Invoice[]>(`/children/${childId}/invoices`);
  return data;
}

// POST /payments/checkout
export async function checkout(payload: PaymentCheckoutRequest): Promise<PaymentCheckoutResponse> {
  if (USE_MOCKS) {
    return mockDelay({
      checkout_url: 'https://sandbox.asaas.com/checkout/mock',
      invoice_id: payload.invoice_id,
    });
  }

  const { data } = await apiClient.post<PaymentCheckoutResponse>('/payments/checkout', payload);
  return data;
}
