/** Regras e formatacoes do fluxo de agendamento (servico → horario → pagamento). */

/** Antecedencia minima para agendar, em horas (mesma regra do servidor). */
export const MIN_ADVANCE_HOURS = 12;

const pad = (n: number) => String(n).padStart(2, '0');

/** Data local no formato AAAA-MM-DD. */
export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Primeiro dia que ainda pode ter horario livre (hoje + 12h). */
export function minBookingDate(now: number = Date.now()) {
  return toDateKey(new Date(now + MIN_ADVANCE_HOURS * 60 * 60 * 1000));
}

/** Data local de um dia (AAAA-MM-DD) e horario (HH:mm). */
export function slotDate(day: string, time: string) {
  const [year, month, dayOfMonth] = day.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, dayOfMonth, hours, minutes, 0, 0);
}

/** O horario respeita a antecedencia minima? */
export function isSlotBookable(
  day: string,
  time: string,
  now: number = Date.now(),
) {
  return (
    slotDate(day, time).getTime() >= now + MIN_ADVANCE_HOURS * 60 * 60 * 1000
  );
}

/** "sexta-feira, 26 de setembro" (a partir de AAAA-MM-DD ou ISO). */
export function formatLongDate(value: string | Date) {
  const date =
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? slotDate(value, '00:00')
      : new Date(value);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

/** "14:00" de uma data ISO, no horario local. */
export function formatTime(value: string | Date) {
  const date = new Date(value);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "45 min", "1 h", "1 h 30 min". */
export function formatDuration(minutes?: number | null) {
  if (!minutes || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export type ResultSort = 'distance' | 'rating' | 'price';

interface SortableResult {
  distance: number;
  rating: number | null;
  ratingsCount: number;
  priceFrom: number | string;
}

/** Ordena os profissionais encontrados sem alterar a lista original. */
export function sortResults<T extends SortableResult>(
  results: T[],
  sort: ResultSort,
): T[] {
  const price = (r: T) => Number(r.priceFrom) || 0;
  const rating = (r: T) => (r.ratingsCount > 0 ? Number(r.rating) || 0 : -1);
  return [...results].sort((a, b) => {
    if (sort === 'distance') return a.distance - b.distance;
    if (sort === 'price') return price(a) - price(b);
    return rating(b) - rating(a) || b.ratingsCount - a.ratingsCount;
  });
}

/** Iniciais para o avatar de quem nao tem foto. */
export function initials(name?: string | null) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || '?';
}
