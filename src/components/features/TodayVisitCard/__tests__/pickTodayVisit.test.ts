import { pickTodayVisit } from '../TodayVisitCard';
import { Appointment } from '@stores/Appointment/types';

const appt = (id: number, status: string, start: string) =>
  ({ id, status, start_time: start }) as unknown as Appointment;

describe('pickTodayVisit', () => {
  const now = new Date('2026-11-09T09:00:00');

  it('prioriza o atendimento que já está em andamento', () => {
    const list = [
      appt(1, 'confirmed', '2026-11-09T10:00:00'),
      appt(2, 'in_transit', '2026-11-09T11:00:00'),
    ];
    expect(pickTodayVisit(list, now)?.id).toBe(2);
  });

  it('escolhe o confirmado mais cedo de hoje', () => {
    const list = [
      appt(1, 'confirmed', '2026-11-09T15:00:00'),
      appt(2, 'confirmed', '2026-11-09T10:00:00'),
      appt(3, 'confirmed', '2026-11-10T08:00:00'),
    ];
    expect(pickTodayVisit(list, now)?.id).toBe(2);
  });

  it('ignora pendentes e dias diferentes', () => {
    const list = [
      appt(1, 'pending', '2026-11-09T10:00:00'),
      appt(2, 'confirmed', '2026-11-10T10:00:00'),
    ];
    expect(pickTodayVisit(list, now)).toBeNull();
  });
});
