import type { DataCalendario } from '../services/types';

export const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Y-m-d montado na mão (sem Date/fuso). `mes` de 0 a 11. */
export function isoDia(ano: number, mes: number, dia: number): string {
  return `${ano}-${pad(mes + 1)}-${pad(dia)}`;
}

/** Semanas do mês (domingo a sábado); `null` = célula fora do mês. */
export function semanasDoMes(ano: number, mes: number): (number | null)[][] {
  const primeiro = new Date(ano, mes, 1).getDay();
  const total = new Date(ano, mes + 1, 0).getDate();
  const celulas: (number | null)[] = [
    ...Array<null>(primeiro).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (celulas.length % 7 !== 0) celulas.push(null);
  const semanas: (number | null)[][] = [];
  for (let i = 0; i < celulas.length; i += 7) semanas.push(celulas.slice(i, i + 7));
  return semanas;
}

/** Agrupa por Y-m-d, mantendo a ordem recebida. */
export function agruparPorDia(datas: DataCalendario[]): Map<string, DataCalendario[]> {
  const mapa = new Map<string, DataCalendario[]>();
  for (const item of datas) {
    const dia = item.data.slice(0, 10);
    mapa.set(dia, [...(mapa.get(dia) ?? []), item]);
  }
  return mapa;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Cor da API se for #RRGGBB válida; senão `fallback`. */
export function corValida(cor: string | null | undefined, fallback: string): string {
  return cor && HEX.test(cor) ? cor : fallback;
}

/** Cor do texto (escura ou branca) com bom contraste sobre `fundo` (#RRGGBB). */
export function textoSobre(fundo: string): string {
  const n = parseInt(fundo.slice(1), 16);
  const canal = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const lum = 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
  return lum > 0.4 ? '#26301C' : '#FFFFFF';
}
