import { http } from './http';
import type { Agenda, Cardapio, DataEnvelope, SegmentoTurma } from './types';

/** Resposta de GET /alunos/{id}/agenda: a agenda (ou null), o cardápio do dia e se o aluno faltou. */
export interface AgendaComCardapio {
  agenda: Agenda | null;
  cardapio: Cardapio;
  /** Dia com falta registrada: o app mostra só os avisos da turma. */
  falta: boolean;
}

function itens(valor: unknown): string[] {
  return Array.isArray(valor) ? valor.filter((item): item is string => typeof item === 'string' && item.trim() !== '') : [];
}

/** Garante as 4 chaves; backend sem o campo `cardapio` (homologação antiga) vira tudo vazio. */
function normalizarCardapio(valor: Partial<Record<keyof Cardapio, unknown>> | null | undefined): Cardapio {
  return {
    lanche_manha: itens(valor?.lanche_manha),
    almoco: itens(valor?.almoco),
    lanche_tarde: itens(valor?.lanche_tarde),
    jantar: itens(valor?.jantar),
  };
}

export function temCardapio(cardapio: Cardapio): boolean {
  return Object.values(cardapio).some((lista) => lista.length > 0);
}

/** O contrato fechou em `I`/`B`; aceita também a grafia por extenso da primeira versão da A1. */
function normalizarSegmento(valor: string): SegmentoTurma {
  return valor === 'B' || valor === 'bercario' ? 'B' : 'I';
}

/**
 * GET /alunos/{id}/agenda?data=Y-m-d.
 * Dia sem agenda lançada responde 200 `{data: null, cardapio}`; `agenda` vira `null` e o cardápio
 * (que vem sempre, até em fim de semana, com as listas vazias) continua disponível.
 * Dia com falta responde `{data: null, cardapio: null, falta: true}`; sem a chave `falta`
 * (backend antigo) vale `false`.
 */
export async function obterAgenda(alunoId: number, data: string): Promise<AgendaComCardapio> {
  const { data: body } = await http.get<
    DataEnvelope<Agenda | null> & { cardapio?: Partial<Record<keyof Cardapio, unknown>> | null; falta?: boolean }
  >(
    `/alunos/${alunoId}/agenda`,
    { params: { data } }
  );
  const falta = body.falta === true;
  // Em dia de falta não há agenda nem cardápio a mostrar, mesmo que venham preenchidos.
  if (falta) return { agenda: null, cardapio: normalizarCardapio(null), falta };
  const cardapio = normalizarCardapio(body.cardapio);
  const agenda = body.data;
  if (!agenda) return { agenda: null, cardapio, falta };
  return {
    cardapio,
    falta,
    agenda: {
    ...agenda,
    segmento: normalizarSegmento(agenda.segmento),
    refeicoes: agenda.refeicoes ?? [],
    sonecas: agenda.sonecas ?? [],
    mamadeiras: agenda.mamadeiras ?? [],
    evacuacao: agenda.evacuacao ?? null,
    xixi: agenda.xixi ?? null,
    atividades: agenda.atividades ?? null,
    recados: agenda.recados ?? [],
    },
  };
}
