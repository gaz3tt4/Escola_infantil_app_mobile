// TODO(backend): lembretes (feriados, aulas extras) viram avisos do admin na etapa A2.
// Até lá este serviço devolve dados mockados; a tela marca o bloco com DemoBadge.

import { mockDelay } from './mocks/mock';
import { addDaysISO, todayISO } from '../utils/format';

export type TipoLembrete = 'feriado' | 'aula_extra';

export interface Lembrete {
  id: number;
  titulo: string;
  data: string; // Y-m-d
  tipo: TipoLembrete;
  descricao: string;
}

/** Próximos lembretes da escola (feriados, aulas extras). */
export async function listarLembretes(): Promise<Lembrete[]> {
  const hoje = todayISO();
  return mockDelay([
    {
      id: 1,
      titulo: 'Aula extra de Música',
      data: addDaysISO(hoje, 3),
      tipo: 'aula_extra',
      descricao: 'Aula especial de música às 14h no pátio coberto. Trazer garrafinha de água.',
    },
    {
      id: 2,
      titulo: 'Recesso escolar',
      data: addDaysISO(hoje, 9),
      tipo: 'feriado',
      descricao: 'Não haverá aula. As atividades voltam normalmente no dia seguinte.',
    },
  ]);
}
