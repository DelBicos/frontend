/**
 * Utilitários de data/hora para agendamentos.
 * Horários escolhidos pelo usuário são sempre interpretados no fuso local do dispositivo.
 */

/** Converte partes YYYY-MM-DD + HH:MM em Date local (sem ambiguidade de UTC). */
export function parseLocalDateTime(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

/**
 * Converte data/hora local para ISO UTC — mesmo padrão do checkout (ProfessionalResultCard).
 * Ex.: 16:00 em UTC-3 → "2026-07-13T19:00:00.000Z"
 */
export function localDateTimeToISO(date: string, time: string): string {
  return parseLocalDateTime(date, time.trim().slice(0, 5)).toISOString();
}

/** Formata ISO ou datetime para exibição no fuso local do dispositivo. */
export function formatAppointmentDateTime(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Extrai YYYY-MM-DD e HH:MM de um slot do backend ("HH:MM" ou "YYYY-MM-DD|HH:MM"). */
export function parseSlotParts(
  slot: string,
  fallbackDate?: string,
): { date: string; time: string } | null {
  if (slot.includes('|')) {
    const [date, time] = slot.split('|');
    if (!date || !time) return null;
    return { date, time: time.trim().slice(0, 5) };
  }
  if (fallbackDate) {
    return { date: fallbackDate, time: slot.trim().slice(0, 5) };
  }
  return null;
}

/** IANA timezone do cliente (ex.: "America/Sao_Paulo"). */
export function getClientTimezone(): string {
  try {
    return (
      Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo'
    );
  } catch {
    return 'America/Sao_Paulo';
  }
}

/** Offset UTC do cliente em minutos (positivo = à frente de UTC). */
export function getClientUtcOffsetMinutes(): number {
  return -new Date().getTimezoneOffset();
}

export interface BotSelectedTimeContext {
  pendingAction?: string;
  timeZone?: string;
  selectedDate?: string;
  selectedTime?: string;
  date?: string;
  time?: string;
  newDate?: string;
  newTime?: string;
}

function timeZoneOffsetAt(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
  return (
    Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute),
      Number(values.second),
    ) - date.getTime()
  );
}

/** Converte partes de calendário no fuso informado para um ISO UTC. */
export function localDateTimeInTimeZoneToISO(
  date: string,
  time: string,
  timeZone = 'America/Sao_Paulo',
): string {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.trim().slice(0, 5).split(':').map(Number);
  const localTimestamp = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  let utcTimestamp =
    localTimestamp - timeZoneOffsetAt(new Date(localTimestamp), timeZone);
  utcTimestamp =
    localTimestamp - timeZoneOffsetAt(new Date(utcTimestamp), timeZone);
  return new Date(utcTimestamp).toISOString();
}

/**
 * Deriva o ISO enviado ao bot. Em remarcações, a nova data/hora tem
 * precedência sobre o intervalo original.
 */
export function resolveBotSelectedTimeIso(
  messageText: string,
  state: string | null,
  context: BotSelectedTimeContext | null,
): string | undefined {
  if (!state || !context) return undefined;

  const isReschedule = context.pendingAction === 'RESCHEDULE';
  const contextDate = isReschedule
    ? (context.newDate ?? context.date ?? context.selectedDate)
    : (context.date ?? context.selectedDate);
  const contextTime = isReschedule
    ? (context.newTime ?? context.time ?? context.selectedTime)
    : (context.time ?? context.selectedTime);
  const timeZone = 'America/Sao_Paulo';

  if (state === 'CONFIRMACAO' && contextDate && contextTime) {
    return localDateTimeInTimeZoneToISO(contextDate, contextTime, timeZone);
  }

  if (state === 'COLETANDO_HORARIO') {
    const slotParts = parseSlotParts(messageText.trim(), contextDate);
    if (slotParts?.time.includes(':')) {
      return localDateTimeInTimeZoneToISO(
        slotParts.date,
        slotParts.time,
        timeZone,
      );
    }
    if (contextDate && /^\d{1,2}:\d{2}$/.test(messageText.trim())) {
      return localDateTimeInTimeZoneToISO(
        contextDate,
        messageText.trim(),
        timeZone,
      );
    }
  }

  return undefined;
}
