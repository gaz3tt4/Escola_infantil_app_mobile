// TODO(backend): a API não tem endpoint de resumo (faltas, atividades, sonecas): etapa A5.
// Este serviço devolve dados mockados com o formato que a tela espera. Os recados já são
// reais e ficam em services/recados.ts.

import { mockDelay, seeded } from './mocks/mock';

export interface ResumoAluno {
  faltas: number;
  atividades: number;
  sonecas: {
    quantidade: number;
    duracaoMediaMin: number;
  };
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
