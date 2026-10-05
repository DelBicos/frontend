import { backendHttpClient } from '@lib/helpers/httpClient';
import { useAppointmentStore } from '../Appointment';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));
jest.mock('@stores/User', () => ({
  useUserStore: { getState: jest.fn() },
}));

const http = backendHttpClient as unknown as Record<string, jest.Mock>;
const actions = () => useAppointmentStore.getState();

beforeEach(() => jest.clearAllMocks());

describe('AppointmentStore - cancelamento, reagendamento e disputas', () => {
  it('mostra quanto seria retido antes de cancelar', async () => {
    const outcome = {
      tier: 'mid',
      retentionPercent: 20,
      retainedCents: 2000,
      refundCents: 8000,
    };
    http.get.mockResolvedValue({ data: outcome });

    expect(await actions().previewCancellation('A1B2C3')).toEqual(outcome);
    expect(http.get).toHaveBeenCalledWith(
      '/api/appointments/A1B2C3/cancellation-preview',
    );
  });

  it('cancela enviando o motivo sem espacos; motivo vazio nao e enviado', async () => {
    http.post.mockResolvedValue({
      data: { tier: 'free', retainedCents: 0, refundedCents: 10000 },
    });

    await actions().cancelAppointment('A1B2C3', '  Imprevisto  ');
    expect(http.post).toHaveBeenLastCalledWith(
      '/api/appointments/A1B2C3/cancel',
      {
        reason: 'Imprevisto',
      },
    );

    await actions().cancelAppointment('A1B2C3', '   ');
    expect(http.post).toHaveBeenLastCalledWith(
      '/api/appointments/A1B2C3/cancel',
      {
        reason: undefined,
      },
    );
  });

  it('registra o nao comparecimento', async () => {
    http.post.mockResolvedValue({ data: {} });
    await actions().markNoShow('A1B2C3');
    expect(http.post).toHaveBeenCalledWith('/api/appointments/A1B2C3/no-show');
  });

  it('lista os horarios livres do dia e pede o reagendamento', async () => {
    http.get.mockResolvedValue({
      data: { date: '2030-02-01', slots: ['09:00', '10:00'] },
    });
    expect(await actions().getRescheduleSlots('A1B2C3', '2030-02-01')).toEqual([
      '09:00',
      '10:00',
    ]);
    expect(http.get).toHaveBeenCalledWith(
      '/api/appointments/A1B2C3/reschedule-slots',
      {
        params: { date: '2030-02-01' },
      },
    );

    http.post.mockResolvedValue({ data: {} });
    await actions().requestReschedule('A1B2C3', '2030-02-01T10:00:00.000Z');
    expect(http.post).toHaveBeenLastCalledWith(
      '/api/appointments/A1B2C3/reschedule',
      {
        start_time: '2030-02-01T10:00:00.000Z',
      },
    );

    await actions().respondToReschedule('A1B2C3', true);
    expect(http.post).toHaveBeenLastCalledWith(
      '/api/appointments/A1B2C3/reschedule/respond',
      {
        accept: true,
      },
    );
  });

  it('abre a disputa e consulta a existente (null quando nao ha)', async () => {
    http.post.mockResolvedValue({ data: { id: 3, status: 'open' } });
    const input = {
      reason: 'poor_quality' as const,
      description: 'Servico mal feito',
    };
    expect(await actions().openDispute('A1B2C3', input)).toEqual({
      id: 3,
      status: 'open',
    });
    expect(http.post).toHaveBeenCalledWith(
      '/api/appointments/A1B2C3/dispute',
      input,
    );

    http.get.mockResolvedValue({ data: null });
    expect(await actions().getDispute('A1B2C3')).toBeNull();
  });
});
