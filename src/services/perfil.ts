// TODO(backend): a API não tem endpoints de faltas, atividades, sonecas nem recados.
// Este serviço devolve dados mockados com o formato que as telas esperam. Quando os
// endpoints existirem, trocar só as funções abaixo (as telas não mudam).

import { mockDelay, pick, seeded } from './mocks/mock';
import { addDaysISO, todayISO } from '../utils/format';

export interface ResumoAluno {
  faltas: number;
  atividades: number;
  sonecas: {
    quantidade: number;
    duracaoMediaMin: number;
  };
}

export interface Recado {
  id: number;
  titulo: string;
  mensagem: string;
  data: string; // Y-m-d
  autor: string;
}

/** Resumo do mês do aluno (faltas, atividades, sonecas). */
export async function obterResumoDoAluno(alunoId: number): Promise<ResumoAluno> {
  // TODO(backend): substituir pelo endpoint de resumo/frequência do aluno.
  return mockDelay({
    faltas: Math.floor(seeded(alunoId) * 4),
    atividades: 12 + Math.floor(seeded(alunoId + 1) * 14),
    sonecas: {
      quantidade: 8 + Math.floor(seeded(alunoId + 2) * 10),
      duracaoMediaMin: 50 + Math.floor(seeded(alunoId + 3) * 40),
    },
  });
}

const RECADOS_BASE: readonly Omit<Recado, 'id' | 'data'>[] = [
  {
    titulo: 'Levar troca de roupa',
    mensagem: 'Pedimos que enviem uma muda extra de roupa na mochila nesta semana.',
    autor: 'Prof.ª Marina',
  },
  {
    titulo: 'Reunião de pais',
    mensagem: 'Reunião de pais e mestres no salão principal, às 19h. Contamos com sua presença!',
    autor: 'Coordenação Pedagógica',
  },
  {
    titulo: 'Projeto Horta',
    mensagem: 'Se puder, envie uma muda pequena de planta para o Projeto Horta na sexta-feira.',
    autor: 'Prof. Rafael',
  },
];

/** Recados da escola para o aluno. */
export async function listarRecados(alunoId: number): Promise<Recado[]> {
  // TODO(backend): substituir pelo endpoint de recados.
  const quantidade = 1 + Math.floor(seeded(alunoId + 7) * RECADOS_BASE.length);
  const hoje = todayISO();
  const recados = Array.from({ length: quantidade }, (_, index) => ({
    ...pick(RECADOS_BASE, alunoId + index * 13),
    id: alunoId * 100 + index,
    data: addDaysISO(hoje, -(index * 3 + 1)),
  }));
  return mockDelay(recados);
}
