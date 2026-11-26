import { act, renderHook } from '@testing-library/react-native';
import type { AppointmentStatusEvent } from '@hooks/useAppointmentStatusSocket';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { logger } from '@lib/logger';
import { useAppointmentPolling } from './useAppointmentPolling';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn() },
}));

jest.mock('@lib/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

let socketHandler: ((event: AppointmentStatusEvent) => void) | undefined;
jest.mock('@hooks/useAppointmentStatusSocket', () => ({
  useAppointmentStatusSocket: (
    handler: (event: AppointmentStatusEvent) => void,
  ) => {
    socketHandler = handler;
  },
}));

const mockGet = backendHttpClient.get as jest.Mock;

const buildEvent = (
  overrides: Partial<AppointmentStatusEvent> = {},
): AppointmentStatusEvent => ({
  appointment_id: 7,
  status: 'confirmed',
  session_ids: [1],
  message: 'Agendamento confirmado',
  payment_status: 'pending',
  payment_pending: true,
  paid: false,
  updated_at: '2026-11-26T12:00:00.000Z',
  ...overrides,
});

const response = (
  overrides: Partial<AppointmentStatusEvent> = {},
  pollAfterMs: number | null = null,
) => ({
  data: {
    ...buildEvent(overrides),
    waiting_for_professional: false,
    poll_after_ms: pollAfterMs,
  },
});

// Deixa as promessas pendentes (a requisicao mockada) se resolverem.
const flush = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

// O callback precisa ser estavel entre renders (como no ChatWindow): um novo
// a cada render recria a consulta.
describe('useAppointmentPolling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockGet.mockReset();
    socketHandler = undefined;
    (logger.warn as jest.Mock).mockClear();
  });

  afterEach(() => jest.useRealTimers());

  it('deve começar com o status inicial e não consultar sem agendamento', () => {
    const onStatus = jest.fn();
    const { result } = renderHook(() =>
      useAppointmentPolling(undefined, 'pending', false, onStatus),
    );

    expect(result.current).toEqual({
      appointmentStatus: 'pending',
      appointmentPaid: false,
    });
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('deve consultar o status do agendamento e avisar o chat', async () => {
    mockGet.mockResolvedValue(response({ status: 'confirmed', paid: true }));
    const onStatus = jest.fn();
    const { result } = renderHook(() =>
      useAppointmentPolling(7, 'pending', false, onStatus),
    );
    await flush();

    expect(mockGet).toHaveBeenCalledWith('/api/chat/bot/appointments/7/status');
    expect(result.current).toEqual({
      appointmentStatus: 'confirmed',
      appointmentPaid: true,
    });
    expect(onStatus).toHaveBeenCalledTimes(1);
  });

  it('deve consultar de novo no prazo indicado pela API', async () => {
    mockGet
      .mockResolvedValueOnce(response({ status: 'pending' }, 3_000))
      .mockResolvedValueOnce(response({ status: 'confirmed' }));
    const onStatus = jest.fn();
    const { result } = renderHook(() =>
      useAppointmentPolling(7, 'pending', false, onStatus),
    );
    await flush();

    // Status pendente não gera aviso no chat.
    expect(onStatus).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(3_000));
    await flush();

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(result.current.appointmentStatus).toBe('confirmed');
    expect(onStatus).toHaveBeenCalledTimes(1);
  });

  it('deve registrar o erro e tentar de novo em 10 segundos', async () => {
    mockGet
      .mockRejectedValueOnce(new Error('rede'))
      .mockResolvedValueOnce(response());
    const onStatus = jest.fn();
    renderHook(() => useAppointmentPolling(7, 'pending', false, onStatus));
    await flush();

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledTimes(1);

    act(() => jest.advanceTimersByTime(10_000));
    await flush();

    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it('deve parar de consultar ao desmontar', async () => {
    mockGet.mockResolvedValue(response({ status: 'pending' }, 3_000));
    const onStatus = jest.fn();
    const { unmount } = renderHook(() =>
      useAppointmentPolling(7, 'pending', false, onStatus),
    );
    await flush();
    unmount();

    act(() => jest.advanceTimersByTime(10_000));
    await flush();

    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('deve ignorar resposta que chega depois de desmontar', async () => {
    let resolve: (value: unknown) => void = () => {};
    mockGet.mockReturnValue(new Promise((r) => (resolve = r)));
    const onStatus = jest.fn();
    const { unmount } = renderHook(() =>
      useAppointmentPolling(7, 'pending', false, onStatus),
    );
    unmount();

    await act(async () => {
      resolve(response());
      await Promise.resolve();
    });

    expect(onStatus).not.toHaveBeenCalled();
  });

  it('deve aplicar eventos do socket só do próprio agendamento e sem repetir aviso', async () => {
    mockGet.mockResolvedValue(response({ status: 'pending' }));
    const onStatus = jest.fn();
    const { result } = renderHook(() =>
      useAppointmentPolling(7, 'pending', false, onStatus),
    );
    await flush();

    act(() => socketHandler?.(buildEvent({ appointment_id: 99 })));
    expect(result.current.appointmentStatus).toBe('pending');

    act(() => socketHandler?.(buildEvent({ status: 'completed', paid: true })));
    act(() => socketHandler?.(buildEvent({ status: 'completed', paid: true })));

    expect(result.current).toEqual({
      appointmentStatus: 'completed',
      appointmentPaid: true,
    });
    expect(onStatus).toHaveBeenCalledTimes(1);
  });

  it('deve voltar ao status inicial quando o agendamento muda', async () => {
    mockGet.mockResolvedValue(response({ status: 'confirmed' }));
    const onStatus = jest.fn();
    const { result, rerender } = renderHook(
      ({ id, status }: { id: number; status: string }) =>
        useAppointmentPolling(id, status, false, onStatus),
      { initialProps: { id: 7, status: 'pending' } },
    );
    await flush();
    expect(result.current.appointmentStatus).toBe('confirmed');

    mockGet.mockReturnValue(new Promise(() => {}));
    rerender({ id: 8, status: 'pending' });

    expect(result.current.appointmentStatus).toBe('pending');
  });
});
