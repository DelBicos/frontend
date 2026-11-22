import { AppointmentStatus } from '@stores/Appointment/types';
import {
  appointmentPrice,
  currentMonthEarnings,
  firstName,
  formatDayLabel,
  lastMonthsEarnings,
  splitAppointments,
} from '../dashboardData';

const NOW = new Date(2026, 8, 25, 10, 0); // 25/09/2026 10:00

const appt = (
  id: number,
  status: AppointmentStatus,
  start: Date,
  hours = 1,
): any => ({
  id,
  status,
  start_time: start.toISOString(),
  end_time: new Date(start.getTime() + hours * 3600_000).toISOString(),
  Service: { price: '100.00' },
});

describe('splitAppointments', () => {
  it('separa pedidos pendentes futuros e proximos confirmados', () => {
    const list = [
      appt(1, AppointmentStatus.PENDING, new Date(2026, 8, 27, 9)),
      appt(2, AppointmentStatus.PENDING, new Date(2026, 8, 20, 9)), // expirado
      appt(3, AppointmentStatus.CONFIRMED, new Date(2026, 8, 25, 15)),
      appt(4, AppointmentStatus.CONFIRMED, new Date(2026, 8, 26, 8)),
      appt(5, AppointmentStatus.CONFIRMED, new Date(2026, 8, 24, 8)), // passado
      appt(6, AppointmentStatus.COMPLETED, new Date(2026, 8, 25, 8)),
    ];
    const result = splitAppointments(list, NOW);
    expect(result.pending.map((a) => a.id)).toEqual([1]);
    expect(result.upcoming.map((a) => a.id)).toEqual([3, 4]);
    expect(result.todayCount).toBe(1);
  });

  it('mantem um atendimento em andamento como proximo', () => {
    const list = [
      appt(1, AppointmentStatus.CONFIRMED, new Date(2026, 8, 25, 9, 30)),
    ];
    expect(splitAppointments(list, NOW).upcoming).toHaveLength(1);
  });
});

describe('ganhos', () => {
  const earnings = [
    { month: '09-2026', total: 300 },
    { month: '07-2026', total: 120 },
  ];

  it('preenche meses sem ganhos com zero', () => {
    const months = lastMonthsEarnings(earnings, 3, NOW);
    expect(months.map((m) => [m.label, m.total])).toEqual([
      ['jul', 120],
      ['ago', 0],
      ['set', 300],
    ]);
  });

  it('retorna o total do mes atual', () => {
    expect(currentMonthEarnings(earnings, NOW)).toBe(300);
    expect(currentMonthEarnings([], NOW)).toBe(0);
  });
});

describe('formatacao', () => {
  it('usa Hoje/Amanha para datas proximas', () => {
    expect(formatDayLabel(new Date(2026, 8, 25, 18).toISOString(), NOW)).toBe(
      'Hoje',
    );
    expect(formatDayLabel(new Date(2026, 8, 26, 9).toISOString(), NOW)).toBe(
      'Amanhã',
    );
  });

  it('pega o primeiro nome', () => {
    expect(firstName('  Eduardo Kamo ')).toBe('Eduardo');
    expect(firstName(undefined)).toBe('');
  });

  it('prefere o preco final ao preco do servico', () => {
    expect(
      appointmentPrice({ final_price: 80, Service: { price: '100' } } as any),
    ).toBe(80);
    expect(appointmentPrice({ Service: { price: '100.50' } } as any)).toBe(
      100.5,
    );
  });
});
