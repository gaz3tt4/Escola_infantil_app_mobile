const pad = (value: number) => String(value).padStart(2, '0');

function toLocalISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Y-m-d → dd/mm/aaaa. Aceita também data e hora ISO (usa só a parte da data). */
export function formatDateBR(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

export function formatDateLong(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}

/** Data e hora ISO 8601 → "dd/mm/aaaa às hh:mm" no fuso do aparelho. */
export function formatDateTimeBR(iso: string): string {
  // A API manda America/Sao_Paulo com offset (-03:00): mostra o horário da escola, não o do aparelho.
  const saoPaulo = iso.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?-03:?00$/);
  if (saoPaulo) {
    const [, ano, mes, dia, hora, minuto] = saoPaulo;
    return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
  }
  const date = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return iso;
  return `${toLocalISO(date).split('-').reverse().join('/')} às ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** Competência Y-m → "set/2026". */
export function formatCompetencia(competencia: string): string {
  const [year, month] = competencia.split('-');
  const nome = MESES[Number(month) - 1];
  return nome ? `${nome}/${year}` : competencia;
}

export function formatCurrencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatTelefone(telefone: string): string {
  const digits = telefone.replace(/\D/g, '');
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return telefone;
}

/** Data de hoje (Y-m-d) no fuso do aparelho. */
export function todayISO(): string {
  return toLocalISO(new Date());
}

export function addDaysISO(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalISO(date);
}

/** Converte "dd/mm/aaaa" em Y-m-d; null se a data for inválida. */
export function parseDateBR(value: string): string | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getDate() !== Number(day) || date.getMonth() !== Number(month) - 1) return null;
  return `${year}-${month}-${day}`;
}

/** Máscara progressiva de data dd/mm/aaaa enquanto o usuário digita. */
export function maskDateBR(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function calculateAge(isoBirthDate: string): number {
  const birth = new Date(`${isoBirthDate}T00:00:00`);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}
