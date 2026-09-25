import { Appointment, AppointmentStatus } from '@stores/Appointment/types';

// Formatacao e regras de agendamento compartilhadas entre Agenda e Painel.

export type AgendaRole = 'client' | 'professional';

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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

const endOf = (a: Appointment) => new Date(a.end_time ?? a.start_time);
const startOf = (a: Appointment) => new Date(a.start_time);

/** O profissional pode concluir um atendimento confirmado a partir do inicio. */
export function canComplete(a: Appointment, now: Date = new Date()) {
  return a.status === AppointmentStatus.CONFIRMED && startOf(a) <= now;
}

/** Pedido pendente cujo horario ja passou sem resposta. */
export function isExpired(a: Appointment, now: Date = new Date()) {
  return a.status === AppointmentStatus.PENDING && endOf(a) < now;
}

/** Cliente com atendimento aceito mas ainda sem pagamento. */
export function needsPayment(a: Appointment, role: AgendaRole) {
  return (
    role === 'client' &&
    a.status === AppointmentStatus.CONFIRMED &&
    !a.payment_intent_id
  );
}

export type AgendaTab = 'upcoming' | 'toComplete' | 'history' | 'canceled';

export type AgendaGroups = Record<AgendaTab, Appointment[]>;

/**
 * Separa os agendamentos nas abas da Agenda:
 * - Próximos: pendentes e confirmados que ainda nao terminaram.
 * - A concluir (profissional): confirmados que ja terminaram.
 * - Histórico: concluidos (e, para o cliente, os que aguardam conclusao).
 * - Cancelados: cancelados e pedidos que expiraram sem resposta.
 */
export function groupAgenda(
  appointments: Appointment[],
  role: AgendaRole,
  now: Date = new Date(),
): AgendaGroups {
  const groups: AgendaGroups = {
    upcoming: [],
    toComplete: [],
    history: [],
    canceled: [],
  };

  appointments.forEach((a) => {
    switch (a.status) {
      case AppointmentStatus.PENDING:
        (isExpired(a, now) ? groups.canceled : groups.upcoming).push(a);
        break;
      case AppointmentStatus.CONFIRMED:
        if (endOf(a) >= now) groups.upcoming.push(a);
        else if (role === 'professional') groups.toComplete.push(a);
        else groups.history.push(a);
        break;
      case AppointmentStatus.COMPLETED:
        groups.history.push(a);
        break;
      default:
        groups.canceled.push(a);
    }
  });

  const asc = (x: Appointment, y: Appointment) =>
    startOf(x).getTime() - startOf(y).getTime();
  const desc = (x: Appointment, y: Appointment) => asc(y, x);
  groups.upcoming.sort(asc);
  groups.toComplete.sort(asc);
  groups.history.sort(desc);
  groups.canceled.sort(desc);
  return groups;
}

/** Agrupa por dia, mantendo a ordem recebida. */
export function groupByDay(
  appointments: Appointment[],
  now: Date = new Date(),
) {
  const days: { label: string; items: Appointment[] }[] = [];
  appointments.forEach((a) => {
    const label = formatDayLabel(a.start_time, now);
    const last = days[days.length - 1];
    if (last && last.label === label) last.items.push(a);
    else days.push({ label, items: [a] });
  });
  return days;
}
