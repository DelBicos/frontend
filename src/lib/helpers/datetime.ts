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
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
  } catch {
    return 'America/Sao_Paulo';
  }
}

/** Offset UTC do cliente em minutos (positivo = à frente de UTC). */
export function getClientUtcOffsetMinutes(): number {
  return -new Date().getTimezoneOffset();
}
