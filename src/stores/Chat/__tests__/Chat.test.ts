import { backendHttpClient } from '@lib/helpers/httpClient';
import { useUserStore } from '@stores/User';
import { ChatMessage, Conversation } from '../types';
import { useChatStore } from '../Chat';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn() },
}));

const http = backendHttpClient as unknown as Record<string, jest.Mock>;

const room = (id: number, at: string): Conversation => ({
  room_id: id,
  appointment_id: 1,
  service_id: 2,
  service_title: 'Corte',
  status: 'active',
  correspondent: { user_id: 9, name: 'Lia', avatar_uri: null },
  last_message_preview: 'oi',
  last_message_at: at,
});

const message = (
  partial: Partial<ChatMessage> &
    Pick<ChatMessage, 'room_id' | 'text' | 'sent_at'>,
): ChatMessage => ({
  id: 'm1',
  client_message_uuid: 'u1',
  sender_user_id: 9,
  sender_role: 'client',
  created_at: partial.sent_at,
  ...partial,
});

function requestError(options: {
  code?: string;
  message?: string;
  status?: number;
}): Error {
  const error = new Error(options.message ?? 'falha') as Error & {
    isAxiosError: boolean;
    code?: string;
    response?: { status: number };
  };
  error.isAxiosError = true;
  if (options.code) error.code = options.code;
  if (options.status) error.response = { status: options.status };
  return error;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  useUserStore.setState({ token: 'abc' });
  useChatStore.getState().clearChat();
});

describe('ChatStore - salas', () => {
  it('recusa a carga sem token', async () => {
    useUserStore.setState({ token: '   ' });
    await useChatStore.getState().fetchRooms();
    expect(http.get).not.toHaveBeenCalled();
    expect(useChatStore.getState().error).toBe(
      'Sessão expirada ou sem token. Faça login novamente.',
    );
    expect(useChatStore.getState().loadingRooms).toBe(false);
  });

  it('guarda as conversas retornadas', async () => {
    const conversations = [room(1, '2026-01-02T00:00:00.000Z')];
    http.get.mockResolvedValue({ data: conversations });

    await useChatStore.getState().fetchRooms();

    expect(http.get).toHaveBeenCalledWith('/api/chat/rooms', {
      params: { limit: 50 },
      timeout: 20000,
      signal: expect.any(AbortSignal),
    });
    expect(useChatStore.getState().conversations).toEqual(conversations);
    expect(useChatStore.getState().loadingRooms).toBe(false);
    expect(useChatStore.getState().error).toBeNull();
  });

  it('trata lista ausente como vazia', async () => {
    http.get.mockResolvedValue({ data: null });
    await useChatStore.getState().fetchRooms();
    expect(useChatStore.getState().conversations).toEqual([]);
  });

  it('compartilha a requisicao em andamento', async () => {
    let resolveFirst: (value: { data: Conversation[] }) => void = () => {};
    http.get.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
    );

    const first = useChatStore.getState().fetchRooms();
    const second = useChatStore.getState().fetchRooms();
    expect(http.get).toHaveBeenCalledTimes(1);
    resolveFirst({ data: [room(1, '2026-01-02T00:00:00.000Z')] });
    await first;
    await second;
    expect(useChatStore.getState().conversations).toHaveLength(1);
  });

  it('um refresh forçado cancela a carga anterior e busca de novo', async () => {
    let calls = 0;
    http.get.mockImplementation(
      (_url: unknown, config?: { signal?: AbortSignal }) => {
        calls += 1;
        if (calls === 1) {
          return new Promise((_resolve, reject) => {
            config?.signal?.addEventListener('abort', () => {
              reject(
                requestError({ code: 'ERR_CANCELED', message: 'canceled' }),
              );
            });
          });
        }
        return Promise.resolve({ data: [room(2, '2026-01-03T00:00:00.000Z')] });
      },
    );

    const first = useChatStore.getState().fetchRooms();
    await useChatStore.getState().fetchRooms({ forceRefresh: true });
    await first;

    expect(http.get).toHaveBeenCalledTimes(2);
    expect(useChatStore.getState().conversations).toEqual([
      room(2, '2026-01-03T00:00:00.000Z'),
    ]);
    expect(useChatStore.getState().error).toBeNull();
  });

  it('sessao recusada vira pedido de novo login', async () => {
    http.get.mockRejectedValue(requestError({ status: 401 }));
    await useChatStore.getState().fetchRooms();
    expect(useChatStore.getState().error).toBe(
      'Sessão expirada ou sem token. Faça login novamente.',
    );
    expect(useChatStore.getState().loadingRooms).toBe(false);
  });

  it('erro generico nao esvazia a mensagem padrao', async () => {
    http.get.mockRejectedValue(new Error('boom'));
    await useChatStore.getState().fetchRooms();
    expect(useChatStore.getState().error).toBe('Erro ao carregar conversas.');
  });

  it('tenta de novo depois de um timeout e entao guarda as salas', async () => {
    http.get
      .mockRejectedValueOnce(
        requestError({ code: 'ECONNABORTED', message: 'timeout' }),
      )
      .mockResolvedValueOnce({ data: [room(1, '2026-01-02T00:00:00.000Z')] });

    await useChatStore.getState().fetchRooms();

    expect(http.get).toHaveBeenCalledTimes(2);
    expect(useChatStore.getState().conversations).toHaveLength(1);
    expect(useChatStore.getState().error).toBeNull();
  });

  it('mostra tempo esgotado quando a nova tentativa tambem falha', async () => {
    http.get.mockRejectedValue(
      requestError({ code: 'ETIMEDOUT', message: 'timed out' }),
    );
    await useChatStore.getState().fetchRooms();
    expect(useChatStore.getState().error).toBe(
      'Tempo limite excedido ao carregar conversas. Tente novamente.',
    );
  });
});

describe('ChatStore - mensagens', () => {
  it('devolve o paginado com os campos da sala', async () => {
    const incoming = message({
      room_id: 4,
      text: 'olá',
      sent_at: '2026-01-02T12:00:00.000Z',
    });
    http.get.mockResolvedValue({
      data: {
        messages: [incoming],
        nextCursor: 'c2',
        room_status: 'archived',
        role: 'professional',
      },
    });

    await expect(
      useChatStore.getState().fetchMessages(4, 'c1', 10),
    ).resolves.toEqual({
      messages: [incoming],
      nextCursor: 'c2',
      roomStatus: 'archived',
      role: 'professional',
    });
    expect(http.get).toHaveBeenCalledWith('/api/chat/rooms/4/messages', {
      params: { limit: 10, cursor: 'c1' },
    });
  });

  it('preenche o padrao quando a resposta vem vazia', async () => {
    http.get.mockResolvedValue({ data: {} });
    await expect(useChatStore.getState().fetchMessages(1)).resolves.toEqual({
      messages: [],
      nextCursor: null,
      roomStatus: 'active',
      role: 'client',
    });
  });

  it('atualiza a previa e sobe a conversa mais recente', () => {
    useChatStore.setState({
      conversations: [
        room(1, '2026-01-02T00:00:00.000Z'),
        room(2, '2026-01-01T00:00:00.000Z'),
      ],
    });

    useChatStore.getState().applyIncomingMessage(
      message({
        room_id: 2,
        text: 'novo',
        sent_at: '2026-01-03T00:00:00.000Z',
      }),
    );

    const conversations = useChatStore.getState().conversations;
    expect(conversations.map((item) => item.room_id)).toEqual([2, 1]);
    expect(conversations[0].last_message_preview).toBe('novo');
    expect(conversations[0].last_message_at).toBe('2026-01-03T00:00:00.000Z');
  });

  it('clearChat zera a lista e o erro', () => {
    useChatStore.setState({
      conversations: [room(1, '2026-01-02T00:00:00.000Z')],
      error: 'falha',
      loadingRooms: true,
    });
    useChatStore.getState().clearChat();
    expect(useChatStore.getState()).toMatchObject({
      conversations: [],
      error: null,
      loadingRooms: false,
    });
  });
});
