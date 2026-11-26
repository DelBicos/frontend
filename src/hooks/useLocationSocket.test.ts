import { act, renderHook } from '@testing-library/react-native';
import { io } from 'socket.io-client';
import { useUserStore } from '@stores/User';
import {
  LocationArrivedEvent,
  LocationUpdateEvent,
  ProximityWarningEvent,
  sendLocationArrived,
  sendLocationUpdate,
  useLocationSocket,
} from './useLocationSocket';

jest.mock('socket.io-client', () => ({ io: jest.fn() }));

type Handler = (...args: unknown[]) => void;

interface FakeSocket {
  connected: boolean;
  on: jest.Mock;
  off: jest.Mock;
  emit: jest.Mock;
  removeAllListeners: jest.Mock;
  disconnect: jest.Mock;
  trigger: (event: string, ...args: unknown[]) => void;
  listenerCount: () => number;
}

function createFakeSocket(): FakeSocket {
  const handlers = new Map<string, Handler[]>();
  const socket: FakeSocket = {
    connected: false,
    on: jest.fn((event: string, handler: Handler) => {
      handlers.set(event, [...(handlers.get(event) ?? []), handler]);
      return socket;
    }),
    off: jest.fn((event: string, handler: Handler) => {
      handlers.set(
        event,
        (handlers.get(event) ?? []).filter((item) => item !== handler),
      );
      return socket;
    }),
    emit: jest.fn(),
    removeAllListeners: jest.fn(() => handlers.clear()),
    disconnect: jest.fn(),
    trigger: (event, ...args) =>
      (handlers.get(event) ?? []).forEach((handler) => handler(...args)),
    listenerCount: () =>
      [...handlers.values()].reduce((total, list) => total + list.length, 0),
  };
  return socket;
}

const ioMock = io as unknown as jest.Mock;
let sockets: FakeSocket[] = [];
let tokenSeq = 0;

/** O socket e compartilhado no modulo: um token novo forca uma conexao nova. */
function freshToken(): string {
  tokenSeq += 1;
  const token = `token-${tokenSeq}`;
  useUserStore.setState({ token });
  return token;
}

const update = (appointment_id: number): LocationUpdateEvent => ({
  appointment_id,
  latitude: -23.5,
  longitude: -46.6,
  timestamp: '2026-01-01T10:00:00.000Z',
});
const proximity = (appointment_id: number): ProximityWarningEvent => ({
  appointment_id,
  message: 'Chegando',
  estimated_minutes: 3,
  distance_meters: 500,
});
const arrived = (appointment_id: number): LocationArrivedEvent => ({
  appointment_id,
  message: 'Chegou',
  timestamp: '2026-01-01T10:10:00.000Z',
});

beforeEach(() => {
  jest.clearAllMocks();
  sockets = [];
  ioMock.mockImplementation(() => {
    const socket = createFakeSocket();
    sockets.push(socket);
    return socket;
  });
});

describe('useLocationSocket', () => {
  it('fica desconectado sem token', () => {
    useUserStore.setState({ token: null });
    const { result } = renderHook(() => useLocationSocket(1));
    expect(result.current.connected).toBe(false);
    expect(ioMock).not.toHaveBeenCalled();
  });

  it('entra na sala do agendamento ao conectar', () => {
    const token = freshToken();
    const { result, unmount } = renderHook(() => useLocationSocket('42'));
    expect(ioMock).toHaveBeenCalledWith(expect.any(String), {
      auth: { token },
      transports: ['websocket'],
    });
    const socket = sockets[0];
    expect(result.current.connected).toBe(false);

    socket.connected = true;
    act(() => socket.trigger('connect'));
    expect(result.current.connected).toBe(true);
    expect(socket.emit).toHaveBeenCalledWith('appointment:join', 42);

    act(() => socket.trigger('disconnect'));
    expect(result.current.connected).toBe(false);

    unmount();
    expect(socket.off).toHaveBeenCalledTimes(5);
    expect(socket.listenerCount()).toBe(0);
  });

  it('nao entra em sala com id invalido ou ausente', () => {
    freshToken();
    renderHook(() => useLocationSocket('abc'));
    renderHook(() => useLocationSocket(-1));
    renderHook(() => useLocationSocket());
    act(() => sockets[0].trigger('connect'));
    expect(sockets[0].emit).not.toHaveBeenCalled();
  });

  it('reaproveita o socket ja conectado do mesmo token', () => {
    freshToken();
    const first = renderHook(() => useLocationSocket(7));
    const socket = sockets[0];
    socket.connected = true;

    const second = renderHook(() => useLocationSocket(8));
    expect(ioMock).toHaveBeenCalledTimes(1);
    expect(second.result.current.connected).toBe(true);
    expect(socket.emit).toHaveBeenCalledWith('appointment:join', 8);
    first.unmount();
    second.unmount();
  });

  it('troca o socket quando o token muda', () => {
    freshToken();
    renderHook(() => useLocationSocket(7));
    act(() => {
      freshToken();
    });
    expect(ioMock).toHaveBeenCalledTimes(2);
    expect(sockets[0].removeAllListeners).toHaveBeenCalled();
    expect(sockets[0].disconnect).toHaveBeenCalled();
  });

  it('repassa apenas eventos do agendamento observado', () => {
    freshToken();
    const onUpdate = jest.fn();
    const onProximity = jest.fn();
    const onArrived = jest.fn();
    renderHook(() => useLocationSocket(7, onUpdate, onProximity, onArrived));
    const socket = sockets[0];

    act(() => {
      socket.trigger('location:update', update(7));
      socket.trigger('location:update', update(8));
      socket.trigger('location:proximity_warning', proximity(7));
      socket.trigger('location:proximity_warning', proximity(8));
      socket.trigger('location:arrived', arrived(7));
      socket.trigger('location:arrived', arrived(8));
    });

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith(update(7));
    expect(onProximity).toHaveBeenCalledTimes(1);
    expect(onProximity).toHaveBeenCalledWith(proximity(7));
    expect(onArrived).toHaveBeenCalledTimes(1);
    expect(onArrived).toHaveBeenCalledWith(arrived(7));
  });

  it('ignora eventos quando nao ha agendamento ou callbacks', () => {
    freshToken();
    const onUpdate = jest.fn();
    renderHook(() => useLocationSocket(undefined, onUpdate));
    renderHook(() => useLocationSocket(7));
    const socket = sockets[0];
    expect(() =>
      act(() => {
        socket.trigger('location:update', update(7));
        socket.trigger('location:proximity_warning', proximity(7));
        socket.trigger('location:arrived', arrived(7));
      }),
    ).not.toThrow();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('envia localizacao e chegada somente com o socket conectado', () => {
    freshToken();
    const { result } = renderHook(() => useLocationSocket(7));
    const socket = sockets[0];
    const payload = { appointment_id: 7, latitude: 1, longitude: 2 };

    result.current.sendLocation(payload);
    result.current.sendArrived({ appointment_id: 7 });
    expect(socket.emit).not.toHaveBeenCalled();

    socket.connected = true;
    sendLocationUpdate(payload);
    sendLocationArrived({ appointment_id: 7, client_user_id: 3 });
    expect(socket.emit).toHaveBeenCalledWith('location:send', payload);
    expect(socket.emit).toHaveBeenCalledWith('location:arrived', {
      appointment_id: 7,
      client_user_id: 3,
    });
  });
});
