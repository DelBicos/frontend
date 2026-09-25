import { Appointment, AppointmentStatus } from '@stores/Appointment/types';
import { EarningsMonth } from '@stores/Dashboard/types';

export interface DashboardAppointments {
  /** Pedidos que o profissional ainda precisa aceitar ou recusar. */
  pending: Appointment[];
  /** Atendimentos confirmados que ainda nao comecaram, do mais proximo ao mais distante. */
  upcoming: Appointment[];
  /** Quantos atendimentos confirmados sao hoje. */
  todayCount: number;
}

const byStartAsc = (a: Appointment, b: Appointment) =>
  new Date(a.start_time).getTime() - new Date(b.start_time).getTime();

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function splitAppointments(
  appointments: Appointment[],
  now: Date = new Date(),
): DashboardAppointments {
  // Pedidos cujo horario ja passou nao podem mais ser atendidos.
  const pending = appointments
    .filter(
      (a) =>
        a.status === AppointmentStatus.PENDING &&
        new Date(a.end_time ?? a.start_time) >= now,
    )
    .sort(byStartAsc);

  const confirmed = appointments.filter(
    (a) => a.status === AppointmentStatus.CONFIRMED,
  );
  const upcoming = confirmed
    .filter((a) => new Date(a.end_time ?? a.start_time) >= now)
    .sort(byStartAsc);
  const todayCount = confirmed.filter((a) =>
    isSameDay(new Date(a.start_time), now),
  ).length;

  return { pending, upcoming, todayCount };
}

const monthKey = (date: Date) =>
  `${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

const MONTH_LABELS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

export interface MonthTotal {
  key: string;
  label: string;
  total: number;
}

/** Ultimos `count` meses (incluindo o atual), com zero nos meses sem ganhos. */
export function lastMonthsEarnings(
  earnings: EarningsMonth[],
  count = 6,
  now: Date = new Date(),
): MonthTotal[] {
  const totals = new Map(earnings.map((e) => [e.month, e.total]));
  const months: MonthTotal[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(date);
    months.push({
      key,
      label: MONTH_LABELS[date.getMonth()],
      total: totals.get(key) ?? 0,
    });
  }
  return months;
}

export function currentMonthEarnings(
  earnings: EarningsMonth[],
  now: Date = new Date(),
) {
  return earnings.find((e) => e.month === monthKey(now))?.total ?? 0;
}

export function firstName(name?: string | null) {
  return name?.trim().split(/\s+/)[0] || '';
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    value,
  );

const pad = (n: number) => String(n).padStart(2, '0');

export function formatTimeRange(start: string, end?: string | null) {
  const s = new Date(start);
  const from = `${pad(s.getHours())}:${pad(s.getMinutes())}`;
  if (!end) return from;
  const e = new Date(end);
  return `${from}–${pad(e.getHours())}:${pad(e.getMinutes())}`;
}

/** "Hoje", "Amanhã" ou "sex., 26/09". */
export function formatDayLabel(date: string, now: Date = new Date()) {
  const d = new Date(date);
  if (isSameDay(d, now)) return 'Hoje';
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (isSameDay(d, tomorrow)) return 'Amanhã';
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(
    d,
  );
  return `${weekday}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

export function appointmentPrice(appointment: Appointment) {
  const value =
    appointment.final_price != null
      ? Number(appointment.final_price)
      : Number(appointment.Service?.price);
  return Number.isFinite(value) ? value : null;
}
