import { AppointmentStatus } from '@stores/Appointment/types';
import {
  canCancel,
  canComplete,
  canDispute,
  canMarkNoShow,
  canReschedule,
  pendingReschedule,
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

describe('regras de gestao do agendamento', () => {
  const hoursFrom = (h: number) => new Date(NOW.getTime() + h * 3_600_000);
  const at = (h: number, status: AppointmentStatus, extra = {}) =>
    appt(1, status, hoursFrom(h), extra);

  it('cancela pendente/confirmado apenas antes do inicio', () => {
    expect(canCancel(at(5, AppointmentStatus.CONFIRMED), NOW)).toBe(true);
    expect(canCancel(at(5, AppointmentStatus.PENDING), NOW)).toBe(true);
    expect(canCancel(at(-1, AppointmentStatus.CONFIRMED), NOW)).toBe(false);
    expect(canCancel(at(5, AppointmentStatus.COMPLETED), NOW)).toBe(false);
    expect(canCancel(at(5, AppointmentStatus.NO_SHOW), NOW)).toBe(false);
  });

  it('reagenda somente com 24h de antecedencia', () => {
    expect(canReschedule(at(23, AppointmentStatus.CONFIRMED), NOW)).toBe(false);
    expect(canReschedule(at(24, AppointmentStatus.CONFIRMED), NOW)).toBe(true);
    expect(canReschedule(at(48, AppointmentStatus.CANCELED), NOW)).toBe(false);
  });

  it('nao comparecimento: so o profissional, 15 min apos o horario', () => {
    expect(
      canMarkNoShow(at(-0.1, AppointmentStatus.CONFIRMED), 'professional', NOW),
    ).toBe(false);
    expect(
      canMarkNoShow(
        at(-0.25, AppointmentStatus.CONFIRMED),
        'professional',
        NOW,
      ),
    ).toBe(true);
    expect(
      canMarkNoShow(at(-1, AppointmentStatus.CONFIRMED), 'client', NOW),
    ).toBe(false);
    expect(
      canMarkNoShow(at(-1, AppointmentStatus.PENDING), 'professional', NOW),
    ).toBe(false);
  });

  it('disputa: so o cliente, com pagamento e dentro de 7 dias', () => {
    const paid = { payment_intent_id: 'pi_1' };
    const done = (days: number) =>
      at(-24 * days, AppointmentStatus.COMPLETED, {
        ...paid,
        completed_at: hoursFrom(-24 * days).toISOString(),
      });
    expect(canDispute(done(2), 'client', NOW)).toBe(true);
    expect(canDispute(done(8), 'client', NOW)).toBe(false);
    expect(canDispute(done(2), 'professional', NOW)).toBe(false);
    expect(
      canDispute(at(-48, AppointmentStatus.COMPLETED), 'client', NOW),
    ).toBe(false);
    expect(
      canDispute(at(-48, AppointmentStatus.NO_SHOW, paid), 'client', NOW),
    ).toBe(true);
    // profissional ausente: confirmado, 2h depois do horario
    expect(
      canDispute(at(-1, AppointmentStatus.CONFIRMED, paid), 'client', NOW),
    ).toBe(false);
    expect(
      canDispute(at(-3, AppointmentStatus.CONFIRMED, paid), 'client', NOW),
    ).toBe(true);
    expect(
      canDispute(at(-48, AppointmentStatus.CANCELED, paid), 'client', NOW),
    ).toBe(false);
  });

  it('identifica pedido de reagendamento enviado ou recebido', () => {
    const req = (by: 'client' | 'professional') =>
      at(48, AppointmentStatus.CONFIRMED, {
        reschedule_requested_start: hoursFrom(100).toISOString(),
        reschedule_requested_by: by,
      });
    expect(pendingReschedule(req('client'), 'client')).toBe('outgoing');
    expect(pendingReschedule(req('client'), 'professional')).toBe('incoming');
    expect(
      pendingReschedule(at(48, AppointmentStatus.CONFIRMED), 'client'),
    ).toBeNull();
  });

  it('nao comparecimento vai para o historico', () => {
    const g = groupAgenda([at(-48, AppointmentStatus.NO_SHOW)], 'client', NOW);
    expect(g.history).toHaveLength(1);
    expect(g.canceled).toHaveLength(0);
  });
});
