import { act, renderHook } from '@testing-library/react-native';
import { io } from 'socket.io-client';
import { useUserStore } from '@stores/User';
import {
  AppointmentStatusEvent,
  useAppointmentStatusSocket,
} from './useAppointmentStatusSocket';

jest.mock('socket.io-client', () => ({ io: jest.fn() }));

type Handler = (...args: unknown[]) => void;

interface FakeSocket {
  connected: boolean;
  on: jest.Mock;
  emit: jest.Mock;
  removeAllListeners: jest.Mock;
  disconnect: jest.Mock;
  trigger: (event: string, ...args: unknown[]) => void;
}

function createFakeSocket(): FakeSocket {
  const handlers = new Map<string, Handler[]>();
  const socket: FakeSocket = {
    connected: false,
    on: jest.fn((event: string, handler: Handler) => {
      handlers.set(event, [...(handlers.get(event) ?? []), handler]);
      return socket;
    }),
    emit: jest.fn(),
    removeAllListeners: jest.fn(() => handlers.clear()),
    disconnect: jest.fn(),
    trigger: (event, ...args) =>
      (handlers.get(event) ?? []).forEach((handler) => handler(...args)),
  };
  return socket;
}

const ioMock = io as unknown as jest.Mock;
let sockets: FakeSocket[] = [];

const event = (
  overrides: Partial<AppointmentStatusEvent> = {},
): AppointmentStatusEvent => ({
  appointment_id: 10,
  status: 'confirmed',
  session_ids: [1],
  message: 'Agendamento confirmado',
  payment_status: 'pending',
  payment_pending: true,
  paid: false,
  updated_at: '2026-01-01T10:00:00.000Z',
  ...overrides,
});

beforeEach(() => {
  sockets = [];
  ioMock.mockReset();
  ioMock.mockImplementation(() => {
    const socket = createFakeSocket();
    sockets.push(socket);
    return socket;
  });
  useUserStore.setState({ token: 'token-a' });
});

describe('useAppointmentStatusSocket', () => {
  it('nao conecta sem token', () => {
    useUserStore.setState({ token: null });
    const { result } = renderHook(() => useAppointmentStatusSocket(jest.fn()));
    expect(result.current).toBe(false);
    expect(ioMock).not.toHaveBeenCalled();
  });

  it('abre um unico socket compartilhado e repassa eventos validos', () => {
    const first = jest.fn();
    const second = jest.fn();
    const hookA = renderHook(() => useAppointmentStatusSocket(first));
    const hookB = renderHook(() => useAppointmentStatusSocket(second));

    expect(ioMock).toHaveBeenCalledTimes(1);
    expect(ioMock).toHaveBeenCalledWith(expect.any(String), {
      auth: { token: 'token-a' },
      transports: ['websocket'],
    });

    act(() => sockets[0].trigger('connect'));
    expect(hookA.result.current).toBe(true);
    expect(hookB.result.current).toBe(true);

    act(() => sockets[0].trigger('appointment:status', event()));
    expect(first).toHaveBeenCalledWith(event());
    expect(second).toHaveBeenCalledWith(event());

    act(() => sockets[0].trigger('appointment:status', { appointment_id: 0 }));
    act(() => sockets[0].trigger('appointment:status', undefined));
    expect(first).toHaveBeenCalledTimes(1);

    act(() => sockets[0].trigger('disconnect'));
    expect(hookA.result.current).toBe(false);

    hookA.unmount();
    expect(sockets[0].disconnect).not.toHaveBeenCalled();
    hookB.unmount();
    expect(sockets[0].removeAllListeners).toHaveBeenCalled();
    expect(sockets[0].disconnect).toHaveBeenCalled();
  });

  it('usa sempre o callback mais recente', () => {
    const initial = jest.fn();
    const updated = jest.fn();
    const { rerender, unmount } = renderHook(
      ({ cb }: { cb: (e: AppointmentStatusEvent) => void }) =>
        useAppointmentStatusSocket(cb),
      { initialProps: { cb: initial } },
    );
    rerender({ cb: updated });
    act(() => sockets[0].trigger('appointment:status', event()));
    expect(initial).not.toHaveBeenCalled();
    expect(updated).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('reporta conectado quando o socket compartilhado ja esta conectado', () => {
    const hookA = renderHook(() => useAppointmentStatusSocket(jest.fn()));
    sockets[0].connected = true;
    const hookB = renderHook(() => useAppointmentStatusSocket(jest.fn()));
    expect(hookB.result.current).toBe(true);
    hookA.unmount();
    hookB.unmount();
  });

  it('troca o socket quando o token muda', () => {
    const { unmount } = renderHook(() => useAppointmentStatusSocket(jest.fn()));
    act(() => {
      useUserStore.setState({ token: 'token-b' });
    });
    expect(ioMock).toHaveBeenCalledTimes(2);
    expect(sockets[0].disconnect).toHaveBeenCalled();
    expect(ioMock).toHaveBeenLastCalledWith(expect.any(String), {
      auth: { token: 'token-b' },
      transports: ['websocket'],
    });
    unmount();
    expect(sockets[1].disconnect).toHaveBeenCalled();
  });
});
