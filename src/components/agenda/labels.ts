import type { Humor, NivelAlimentacao, NivelHigiene, NivelSono } from '../../services/agenda';

export const alimentacaoLabels: Record<NivelAlimentacao, string> = {
  nao_comeu: 'Não comeu',
  comeu_pouco: 'Comeu pouco',
  comeu_bem: 'Comeu bem',
  comeu_tudo: 'Comeu tudo',
};

export const sonoLabels: Record<NivelSono, string> = {
  nao_dormiu: 'Não dormiu',
  dormiu_pouco: 'Dormiu pouco',
  dormiu_bem: 'Dormiu bem',
};

export const higieneLabels: Record<NivelHigiene, string> = {
  trocado: 'Fralda trocada',
  usou_banheiro: 'Usou o banheiro',
  sem_ocorrencias: 'Sem ocorrências',
};

export const humorLabels: Record<Humor, string> = {
  feliz: 'Feliz',
  calmo: 'Calmo',
  agitado: 'Agitado',
  choroso: 'Choroso',
  cansado: 'Cansado',
};

export const humorEmojis: Record<Humor, string> = {
  feliz: '😄',
  calmo: '🙂',
  agitado: '🤸',
  choroso: '😢',
  cansado: '😴',
};
