import formatBRL, {
  formatBRLFromCents,
  formatBRLFromUnits,
} from '../formatCurrency';
import {
  formatAppointmentDateTime,
  getClientTimezone,
  getClientUtcOffsetMinutes,
  localDateTimeToISO,
  parseLocalDateTime,
  parseSlotParts,
} from '../datetime';
import {
  isNowBetween,
  isServiceAvailableNow,
  timeToMinutes,
} from '../../utils/availability';

// Intl pode usar espaco nao separavel entre "R$" e o valor.
const normalize = (s: string) => s.replace(/\s/g, ' ');

describe('formatCurrency', () => {
  it('formata reais e centavos em BRL', () => {
    expect(normalize(formatBRLFromUnits(1234.5))).toBe('R$ 1.234,50');
    expect(normalize(formatBRLFromUnits('10'))).toBe('R$ 10,00');
    expect(normalize(formatBRLFromCents(1999))).toBe('R$ 19,99');
  });

  it('retorna vazio para valores ausentes ou invalidos', () => {
    expect(formatBRLFromUnits(undefined)).toBe('');
    expect(formatBRLFromUnits('')).toBe('');
    expect(formatBRLFromUnits('abc')).toBe('');
    expect(formatBRLFromCents(undefined)).toBe('');
  });

  it('formatBRL prioriza price_cents sobre price', () => {
    expect(normalize(formatBRL({ price: '99', price_cents: 500 }))).toBe(
      'R$ 5,00',
    );
    expect(normalize(formatBRL({ price: '12.5' }))).toBe('R$ 12,50');
    expect(formatBRL({ price: 'x' })).toBe('');
    expect(formatBRL(undefined)).toBe('');
  });
});

describe('datetime', () => {
  it('interpreta data/hora no fuso local do dispositivo', () => {
    const date = parseLocalDateTime('2026-10-05', '14:30');
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([
      2026, 9, 5,
    ]);
    expect([date.getHours(), date.getMinutes()]).toEqual([14, 30]);
  });

  it('converte para ISO UTC ignorando segundos no horario', () => {
    expect(localDateTimeToISO('2026-10-05', '14:30:59')).toBe(
      parseLocalDateTime('2026-10-05', '14:30').toISOString(),
    );
  });

  it('separa slots "YYYY-MM-DD|HH:MM" e usa data de fallback', () => {
    expect(parseSlotParts('2026-10-05|09:00')).toEqual({
      date: '2026-10-05',
      time: '09:00',
    });
    expect(parseSlotParts('09:00:00', '2026-10-06')).toEqual({
      date: '2026-10-06',
      time: '09:00',
    });
    expect(parseSlotParts('09:00')).toBeNull();
    expect(parseSlotParts('|09:00')).toBeNull();
  });

  it('formata data de agendamento e trata vazio', () => {
    expect(formatAppointmentDateTime('')).toBe('');
    expect(formatAppointmentDateTime('2026-10-05T12:00:00Z')).toMatch(
      /\d{2}\/10/,
    );
  });

  it('informa fuso e offset do cliente', () => {
    expect(getClientTimezone()).toEqual(expect.any(String));
    expect(getClientUtcOffsetMinutes()).toBe(-new Date().getTimezoneOffset());
  });
});

describe('availability utils', () => {
  it('converte HH:MM em minutos', () => {
    expect(timeToMinutes('09:30')).toBe(570);
    expect(timeToMinutes('9h')).toBeNaN();
  });

  it('inicio inclusivo e fim exclusivo', () => {
    expect(isNowBetween('09:00', '10:00', 540)).toBe(true);
    expect(isNowBetween('09:00', '10:00', 600)).toBe(false);
    expect(isNowBetween('x', '10:00', 540)).toBe(false);
  });

  it('verifica disponibilidade do servico no dia de hoje', () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 5, 10, 0)); // segunda
    const service = {
      availabilities: [
        { day: 1, start: '09:00', end: '12:00' },
        { day: 2, start_time: '09:00', end_time: '12:00' },
      ],
    };
    expect(isServiceAvailableNow(service, 600)).toBe(true);
    expect(isServiceAvailableNow(service, 13 * 60)).toBe(false);
    expect(isServiceAvailableNow({ availabilities: [{ day: 'x' }] }, 600)).toBe(
      false,
    );
    expect(isServiceAvailableNow(null)).toBe(false);
    jest.useRealTimers();
  });
});
