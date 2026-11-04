import { http } from './http';
import type { DataCalendario, DataEnvelope } from './types';

/**
 * GET /calendario?ano=AAAA: feriados da escola e datas marcadas pelo admin visíveis ao responsável
 * (escola toda + turmas dos filhos). Ano inválido volta 422.
 */
export async function listarCalendario(ano: number): Promise<DataCalendario[]> {
  const { data: body } = await http.get<DataEnvelope<DataCalendario[]>>('/calendario', { params: { ano } });
  return body.data;
}
