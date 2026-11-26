import { act, renderHook } from '@testing-library/react-native';
import { io } from 'socket.io-client';
import { useUserStore } from '@stores/User';
import type { User } from '@stores/User/types';
import type { ChatMessage } from '@stores/Chat';
import { logger } from '@lib/logger';
import { OptimisticMeta, useChatSocket } from './useChatSocket';

jest.mock('socket.io-client', () => ({ io: jest.fn() }));
jest.mock('react-native-uuid', () => ({ v4: () => 'uuid-fixo' }));
jest.mock('@lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

type Handler = (...args: unknown[]) => void;
type AckCallback = (err: Error | null, resp?: unknown) => void;

interface FakeSocket {
  on: jest.Mock;
  emit: jest.Mock;
  timedEmit: jest.Mock;
  timeout: jest.Mock;
  removeAllListeners: jest.Mock;
  disconnect: jest.Mock;
  trigger: (event: string, ...args: unknown[]) => void;
}

function createFakeSocket(): FakeSocket {
  const handlers = new Map<string, Handler[]>();
  const timedEmit = jest.fn();
  const socket: FakeSocket = {
    on: jest.fn((event: string, handler: Handler) => {
      handlers.set(event, [...(handlers.get(event) ?? []), handler]);
      return socket;
    }),
    emit: jest.fn(),
    timedEmit,
    timeout: jest.fn(() => ({ emit: timedEmit })),
    removeAllListeners: jest.fn(() => handlers.clear()),
    disconnect: jest.fn(),
    trigger: (event, ...args) =>
      (handlers.get(event) ?? []).forEach((handler) => handler(...args)),
  };
  return socket;
}

const ioMock = io as unknown as jest.Mock;
const warn = logger.warn as jest.Mock;
let sockets: FakeSocket[] = [];

const user = { id: 1, name: 'Ana' } as unknown as User;

function lastAck(socket: FakeSocket): AckCallback {
  const call = socket.timedEmit.mock.lastCall;
  return call?.[2] as AckCallback;
}

beforeEach(() => {
  jest.clearAllMocks();
  sockets = [];
  ioMock.mockImplementation(() => {
    const socket = createFakeSocket();
    sockets.push(socket);
    return socket;
  });
  useUserStore.setState({ token: 'token-a', user });
});

describe('useChatSocket', () => {
  it('nao abre conexao sem token ou sem sala', () => {
    useUserStore.setState({ token: null });
    const withoutToken = renderHook(() =>
      useChatSocket({ roomId: 5, onMessage: jest.fn() }),
    );
    withoutToken.unmount();
    useUserStore.setState({ token: 'token-a' });
    renderHook(() => useChatSocket({ roomId: 0, onMessage: jest.fn() }));
    expect(ioMock).not.toHaveBeenCalled();
  });

  it('entra na sala ao conectar e atualiza o status recebido', () => {
    const { result } = renderHook(() =>
      useChatSocket({ roomId: 5, onMessage: jest.fn() }),
    );
    expect(ioMock).toHaveBeenCalledWith(expect.any(String), {
      auth: { token: 'token-a' },
      transports: ['websocket'],
      forceNew: true,
    });
    const socket = sockets[0];

    act(() => socket.trigger('connect'));
    expect(result.current.connected).toBe(true);
    expect(socket.emit).toHaveBeenCalledWith(
      'room:join',
      5,
      expect.any(Function),
    );

    const joinAck = socket.emit.mock.calls[0][2] as (resp: unknown) => void;
    act(() => joinAck({ ok: true, status: 'closed' }));
    expect(result.current.roomStatus).toBe('closed');

    act(() => joinAck({ ok: false, status: 'active' }));
    act(() => joinAck(undefined));
    expect(result.current.roomStatus).toBe('closed');

    act(() => socket.trigger('disconnect'));
    expect(result.current.connected).toBe(false);
  });

  it('repassa novas mensagens ao callback mais recente', () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = renderHook(
      ({ onMessage }: { onMessage: (m: ChatMessage) => void }) =>
        useChatSocket({ roomId: 5, onMessage }),
      { initialProps: { onMessage: first } },
    );
    rerender({ onMessage: second });
    const message = { id: 1, text: 'oi' } as unknown as ChatMessage;
    act(() => sockets[0].trigger('message:new', message));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(message);
  });

  it('sai da sala e desconecta ao desmontar', () => {
    const { unmount } = renderHook(() =>
      useChatSocket({ roomId: 5, onMessage: jest.fn() }),
    );
    const socket = sockets[0];
    unmount();
    expect(socket.emit).toHaveBeenCalledWith('room:leave', 5);
    expect(socket.removeAllListeners).toHaveBeenCalled();
    expect(socket.disconnect).toHaveBeenCalled();
  });

  it('ignora texto vazio ou usuario ausente', () => {
    const { result } = renderHook(() =>
      useChatSocket({ roomId: 5, onMessage: jest.fn() }),
    );
    expect(result.current.sendMessage('   ')).toBeNull();
    act(() => {
      useUserStore.setState({ user: null });
    });
    expect(result.current.sendMessage('oi')).toBeNull();
    expect(sockets[0].timedEmit).not.toHaveBeenCalled();
  });

  it('envia a mensagem com uuid e data gerados no cliente', () => {
    const onFailure = jest.fn();
    const { result } = renderHook(() =>
      useChatSocket({ roomId: 5, onMessage: jest.fn() }),
    );
    let meta: OptimisticMeta | null = null;
    act(() => {
      meta = result.current.sendMessage('  ola  ', onFailure);
    });
    expect(meta).toEqual({
      clientMessageUuid: 'uuid-fixo',
      sentAt: expect.any(String),
    });
    const socket = sockets[0];
    expect(socket.timeout).toHaveBeenCalledWith(10_000);
    expect(socket.timedEmit).toHaveBeenCalledWith(
      'message:send',
      { roomId: 5, text: 'ola', ...(meta as unknown as OptimisticMeta) },
      expect.any(Function),
    );

    lastAck(socket)(null, { ok: true });
    expect(onFailure).not.toHaveBeenCalled();
  });

  it('chama onFailure quando o servidor recusa ou nao confirma', () => {
    const onFailure = jest.fn();
    const { result } = renderHook(() =>
      useChatSocket({ roomId: 5, onMessage: jest.fn() }),
    );
    const retry: OptimisticMeta = {
      clientMessageUuid: 'original',
      sentAt: '2026-01-01T00:00:00.000Z',
    };
    const meta = result.current.sendMessage('ola', onFailure, retry);
    expect(meta).toBe(retry);

    const socket = sockets[0];
    lastAck(socket)(null, { ok: false, error: 'sala fechada' });
    expect(onFailure).toHaveBeenCalledWith(retry);
    expect(warn).toHaveBeenCalledWith(
      'Falha ao enviar mensagem:',
      'sala fechada',
    );

    lastAck(socket)(new Error('timeout'));
    expect(warn).toHaveBeenLastCalledWith(
      'Falha ao enviar mensagem:',
      'timeout',
    );
    expect(onFailure).toHaveBeenCalledTimes(2);

    result.current.sendMessage('sem callback');
    expect(() => lastAck(socket)(new Error('timeout'))).not.toThrow();
  });

  it('sem socket avisa a falha depois de retornar os metadados', async () => {
    useUserStore.setState({ token: null });
    const onFailure = jest.fn();
    const { result } = renderHook(() =>
      useChatSocket({ roomId: 5, onMessage: jest.fn() }),
    );
    const meta = result.current.sendMessage('ola', onFailure);
    expect(meta).not.toBeNull();
    expect(onFailure).not.toHaveBeenCalled();
    await act(async () => {
      await Promise.resolve();
    });
    expect(onFailure).toHaveBeenCalledWith(meta);
  });
});
