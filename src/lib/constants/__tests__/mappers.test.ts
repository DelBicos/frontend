import { AppointmentStatus } from '@stores/Appointment/types';
import { getAppointmentStatusLabel } from '../mappers';

describe('getAppointmentStatusLabel', () => {
  it('traduz os status usados na interface', () => {
    expect(getAppointmentStatusLabel(AppointmentStatus.CONFIRMED)).toBe(
      'Confirmado',
    );
    expect(getAppointmentStatusLabel(AppointmentStatus.PENDING)).toBe(
      'Pendente',
    );
    expect(getAppointmentStatusLabel(AppointmentStatus.COMPLETED)).toBe(
      'Concluído',
    );
    expect(getAppointmentStatusLabel(AppointmentStatus.CANCELED)).toBe(
      'Cancelado',
    );
    expect(getAppointmentStatusLabel(AppointmentStatus.NO_SHOW)).toBe(
      'Não compareceu',
    );
  });

  it('devolve o marcador dos status ainda sem rotulo', () => {
    expect(getAppointmentStatusLabel(AppointmentStatus.IN_TRANSIT)).toBe(
      'undefined',
    );
    expect(getAppointmentStatusLabel(AppointmentStatus.ARRIVED)).toBe(
      'undefined',
    );
    expect(getAppointmentStatusLabel(AppointmentStatus.IN_PROGRESS)).toBe(
      'undefined',
    );
  });
});
