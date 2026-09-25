import { AppointmentStatus } from '@stores/Appointment/types';
import {
  canComplete,
  groupAgenda,
  groupByDay,
  needsPayment,
} from '../appointments';

const NOW = new Date(2026, 8, 25, 10, 0);

const appt = (
  id: number,
  status: AppointmentStatus,
  start: Date,
  extra: Record<string, unknown> = {},
): any => ({
  id,
  status,
  start_time: start.toISOString(),
  end_time: new Date(start.getTime() + 3600_000).toISOString(),
  ...extra,
});

const list = [
  appt(1, AppointmentStatus.PENDING, new Date(2026, 8, 27, 9)),
  appt(2, AppointmentStatus.PENDING, new Date(2026, 8, 20, 9)), // expirado
  appt(3, AppointmentStatus.CONFIRMED, new Date(2026, 8, 26, 9)),
  appt(4, AppointmentStatus.CONFIRMED, new Date(2026, 8, 24, 9)), // ja terminou
  appt(5, AppointmentStatus.COMPLETED, new Date(2026, 8, 10, 9)),
  appt(6, AppointmentStatus.CANCELED, new Date(2026, 8, 12, 9)),
];

const ids = (items: { id: number }[]) => items.map((a) => a.id);

describe('groupAgenda', () => {
  it('profissional: confirmados que ja terminaram vao para "A concluir"', () => {
    const g = groupAgenda(list, 'professional', NOW);
    expect(ids(g.upcoming)).toEqual([3, 1]);
    expect(ids(g.toComplete)).toEqual([4]);
    expect(ids(g.history)).toEqual([5]);
    expect(ids(g.canceled)).toEqual([2, 6]);
  });

  it('cliente: confirmados que ja terminaram ficam no historico', () => {
    const g = groupAgenda(list, 'client', NOW);
    expect(g.toComplete).toEqual([]);
    expect(ids(g.history)).toEqual([4, 5]);
  });
});

describe('regras de acao', () => {
  it('so conclui confirmado depois do inicio', () => {
    expect(
      canComplete(
        appt(1, AppointmentStatus.CONFIRMED, new Date(2026, 8, 25, 9, 30)),
        NOW,
      ),
    ).toBe(true);
    expect(
      canComplete(
        appt(1, AppointmentStatus.CONFIRMED, new Date(2026, 8, 25, 11)),
        NOW,
      ),
    ).toBe(false);
    expect(
      canComplete(
        appt(1, AppointmentStatus.PENDING, new Date(2026, 8, 25, 9)),
        NOW,
      ),
    ).toBe(false);
  });

  it('pagamento pendente so para o cliente sem pagamento', () => {
    const a = appt(1, AppointmentStatus.CONFIRMED, NOW, {
      payment_intent_id: null,
    });
    expect(needsPayment(a, 'client')).toBe(true);
    expect(needsPayment(a, 'professional')).toBe(false);
    expect(needsPayment({ ...a, payment_intent_id: 'pi_1' }, 'client')).toBe(
      false,
    );
  });
});

it('groupByDay agrupa dias consecutivos', () => {
  const days = groupByDay(
    [
      appt(1, AppointmentStatus.CONFIRMED, new Date(2026, 8, 25, 14)),
      appt(2, AppointmentStatus.CONFIRMED, new Date(2026, 8, 25, 16)),
      appt(3, AppointmentStatus.CONFIRMED, new Date(2026, 8, 26, 9)),
    ],
    NOW,
  );
  expect(days.map((d) => [d.label, d.items.length])).toEqual([
    ['Hoje', 2],
    ['Amanhã', 1],
  ]);
});
