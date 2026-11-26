import {
  formatDuration,
  formatLongDate,
  formatShortDay,
  formatTime,
  initials,
  isSlotBookable,
  minBookingDate,
  nextDays,
  sortResults,
  toDateKey,
} from '../booking';

describe('booking', () => {
  const now = new Date(2026, 8, 25, 20, 0).getTime(); // 25/09 20h

  it('primeiro dia agendavel respeita as 12h de antecedencia', () => {
    expect(minBookingDate(now)).toBe('2026-09-26');
    expect(minBookingDate(new Date(2026, 8, 25, 8, 0).getTime())).toBe(
      '2026-09-25',
    );
  });

  it('horario so e agendavel com 12h de antecedencia', () => {
    expect(isSlotBookable('2026-09-26', '07:00', now)).toBe(false);
    expect(isSlotBookable('2026-09-26', '08:00', now)).toBe(true);
  });

  it('formata data e duracao', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(60)).toBe('1 h');
    expect(formatDuration(90)).toBe('1 h 30 min');
    expect(formatDuration(0)).toBe('');
  });

  it('ordena por distancia, avaliacao e preco', () => {
    const list = [
      { id: 1, distance: 5, rating: 4.5, ratingsCount: 2, priceFrom: '80' },
      { id: 2, distance: 1, rating: 0, ratingsCount: 0, priceFrom: '50' },
      { id: 3, distance: 3, rating: 4.9, ratingsCount: 10, priceFrom: '120' },
    ];
    expect(sortResults(list, 'distance').map((r) => r.id)).toEqual([2, 3, 1]);
    expect(sortResults(list, 'rating').map((r) => r.id)).toEqual([3, 1, 2]);
    expect(sortResults(list, 'price').map((r) => r.id)).toEqual([2, 1, 3]);
    expect(list[0].id).toBe(1);
  });

  it('gera iniciais', () => {
    expect(initials('Maria da Silva')).toBe('MS');
    expect(initials('Ana')).toBe('A');
    expect(initials('')).toBe('?');
  });

  it('lista os proximos dias virando o mes', () => {
    expect(nextDays('2026-09-29', 4)).toEqual([
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
    ]);
    expect(nextDays('2026-12-31', 2)).toEqual(['2026-12-31', '2027-01-01']);
  });

  it('formata o dia curto com dia e mes', () => {
    expect(formatShortDay('2026-09-29')).toMatch(/29\/09$/);
  });

  it('formata a data longa a partir de AAAA-MM-DD, ISO ou Date', () => {
    expect(formatLongDate('2026-09-26')).toBe('sábado, 26 de setembro');
    expect(formatLongDate(new Date(2026, 8, 25, 12))).toBe(
      'sexta-feira, 25 de setembro',
    );
    expect(formatLongDate('2026-09-24T12:00:00')).toBe(
      'quinta-feira, 24 de setembro',
    );
  });

  it('formata a hora local com dois digitos', () => {
    expect(formatTime(new Date(2026, 8, 25, 9, 5))).toBe('09:05');
  });
});
