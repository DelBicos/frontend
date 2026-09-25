import {
  formatDuration,
  initials,
  isSlotBookable,
  minBookingDate,
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
});
