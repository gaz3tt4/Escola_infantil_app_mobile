import { http } from './http';
import type { Agenda, DataEnvelope, SegmentoTurma } from './types';

/** O contrato fechou em `I`/`B`; aceita também a grafia por extenso da primeira versão da A1. */
function normalizarSegmento(valor: string): SegmentoTurma {
  return valor === 'B' || valor === 'bercario' ? 'B' : 'I';
}

/**
 * GET /alunos/{id}/agenda?data=Y-m-d.
 * Dia sem agenda lançada responde 200 `{data: null}` e vira `null` aqui.
 */
export async function obterAgenda(alunoId: number, data: string): Promise<Agenda | null> {
  const { data: body } = await http.get<DataEnvelope<Agenda | null>>(`/alunos/${alunoId}/agenda`, {
    params: { data },
  });
  const agenda = body.data;
  if (!agenda) return null;
  return {
    ...agenda,
    segmento: normalizarSegmento(agenda.segmento),
    refeicoes: agenda.refeicoes ?? [],
    sonecas: agenda.sonecas ?? [],
    mamadeiras: agenda.mamadeiras ?? [],
    evacuacao: agenda.evacuacao ?? null,
    xixi: agenda.xixi ?? null,
    atividades: agenda.atividades ?? null,
    recados: agenda.recados ?? [],
  };
}
