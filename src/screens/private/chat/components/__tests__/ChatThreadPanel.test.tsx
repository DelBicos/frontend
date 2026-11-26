import React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import ChatThreadPanel from '../ChatThreadPanel';
import { useChatStore, ChatMessage, FetchMessagesResult } from '@stores/Chat';
import { useUserStore, User } from '@stores/User';
import type { OptimisticMeta } from '@hooks/useChatSocket';
import { logger } from '@lib/logger';

type OnMessage = (message: ChatMessage) => void;
type OnFailure = (meta: OptimisticMeta) => void;

const mockSendMessage = jest.fn();
let mockSocketRoomStatus: 'active' | 'archived' | null = null;
let mockOnMessage: OnMessage | null = null;

jest.mock('@hooks/useChatSocket', () => ({
  useChatSocket: ({ onMessage }: { onMessage: OnMessage }) => {
    mockOnMessage = onMessage;
    return { roomStatus: mockSocketRoomStatus, sendMessage: mockSendMessage };
  },
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@lib/logger', () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

const ME = { id: 1, name: 'Eu', professional_id: 5 } as unknown as User;

const today = new Date();
today.setHours(10, 0, 0, 0);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

const makeMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'm1',
  room_id: 10,
  client_message_uuid: 'uuid-1',
  sender_user_id: 2,
  sender_role: 'client',
  text: 'Olá, tudo bem?',
  sent_at: today.toISOString(),
  created_at: today.toISOString(),
  ...overrides,
});

const page = (
  messages: ChatMessage[],
  overrides: Partial<FetchMessagesResult> = {},
): FetchMessagesResult => ({
  messages,
  nextCursor: null,
  roomStatus: 'active',
  role: 'professional',
  ...overrides,
});

const correspondent = { user_id: 2, name: 'Ana Cliente', avatar_uri: null };

describe('ChatThreadPanel', () => {
  const mockFetchMessages = jest.fn();
  const mockApplyIncoming = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocketRoomStatus = null;
    mockOnMessage = null;
    mockFetchMessages.mockResolvedValue(page([]));
    mockSendMessage.mockReturnValue({
      clientMessageUuid: 'uuid-novo',
      sentAt: today.toISOString(),
    });
    useUserStore.setState({ user: ME });
    useChatStore.setState({
      fetchMessages: mockFetchMessages,
      applyIncomingMessage: mockApplyIncoming,
    });
  });

  const renderPanel = (
    props: Partial<React.ComponentProps<typeof ChatThreadPanel>> = {},
  ) =>
    render(
      <ChatThreadPanel roomId={10} correspondent={correspondent} {...props} />,
    );

  it('deve carregar o histórico e mostrar o cabeçalho da conversa', async () => {
    mockFetchMessages.mockResolvedValueOnce(
      page([
        makeMessage({ id: 'm2', text: 'Chego às 10h', sender_user_id: 1 }),
        makeMessage({ id: 'm1', sent_at: yesterday.toISOString() }),
      ]),
    );
    const { UNSAFE_queryByType, findByText, getByText } = renderPanel({
      serviceTitle: 'Instalação de chuveiro',
    });

    expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
    // Primeiro teste do arquivo: a montagem inicial pode demorar com a maquina carregada.
    expect(
      await findByText('Chego às 10h', {}, { timeout: 5000 }),
    ).toBeTruthy();
    expect(getByText('Olá, tudo bem?')).toBeTruthy();
    expect(getByText('Hoje')).toBeTruthy();
    expect(getByText('Ontem')).toBeTruthy();
    expect(getByText('Ana Cliente')).toBeTruthy();
    expect(getByText('Instalação de chuveiro')).toBeTruthy();
    expect(mockFetchMessages).toHaveBeenCalledWith(10, undefined, 20);
  });

  it('deve mostrar a data por extenso nas mensagens mais antigas', async () => {
    mockFetchMessages.mockResolvedValueOnce(
      page([makeMessage({ sent_at: '2024-09-12T15:00:00.000Z' })]),
    );
    const { findByText } = renderPanel();

    expect(await findByText('12 de setembro de 2024')).toBeTruthy();
  });

  it('deve usar "Conversa" e o botão voltar quando pedido', async () => {
    const onBack = jest.fn();
    const { getByText, getByLabelText } = renderPanel({
      correspondent: null,
      showBackButton: true,
      onBack,
    });
    await waitFor(() => expect(mockFetchMessages).toHaveBeenCalled());

    expect(getByText('Conversa')).toBeTruthy();
    fireEvent.press(getByLabelText('Voltar'));
    expect(onBack).toHaveBeenCalled();
  });

  it('deve avisar quando o histórico falha e tentar de novo ao tocar', async () => {
    mockFetchMessages.mockRejectedValueOnce(new Error('offline'));
    const { findByLabelText, queryByLabelText } = renderPanel();

    const retry = await findByLabelText(
      'Não foi possível carregar as mensagens anteriores. Tentar de novo',
    );
    expect(logger.error).toHaveBeenCalled();

    fireEvent.press(retry);

    await waitFor(() => expect(mockFetchMessages).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(
        queryByLabelText(
          'Não foi possível carregar as mensagens anteriores. Tentar de novo',
        ),
      ).toBeNull(),
    );
  });

  it('deve enviar a mensagem digitada e mostrá-la como enviando', async () => {
    const { getByLabelText, findByText } = renderPanel();
    await waitFor(() => expect(mockFetchMessages).toHaveBeenCalled());

    fireEvent.changeText(getByLabelText('Mensagem'), '  Bom dia!  ');
    fireEvent.press(getByLabelText('Enviar mensagem'));

    expect(mockSendMessage).toHaveBeenCalledWith(
      'Bom dia!',
      expect.any(Function),
    );
    expect(await findByText('Bom dia!')).toBeTruthy();
    expect(await findByText(/enviando…/)).toBeTruthy();
    expect(getByLabelText('Mensagem').props.value).toBe('');
  });

  it('não deve enviar texto em branco nem sem usuário logado', async () => {
    const { getByLabelText } = renderPanel();
    await waitFor(() => expect(mockFetchMessages).toHaveBeenCalled());

    fireEvent.changeText(getByLabelText('Mensagem'), '   ');
    fireEvent.press(getByLabelText('Enviar mensagem'));
    expect(mockSendMessage).not.toHaveBeenCalled();

    act(() => {
      useUserStore.setState({ user: null });
    });
    fireEvent.changeText(getByLabelText('Mensagem'), 'Oi');
    fireEvent.press(getByLabelText('Enviar mensagem'));
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('deve manter o texto quando o socket não aceita o envio', async () => {
    mockSendMessage.mockReturnValueOnce(null);
    const { getByLabelText } = renderPanel();
    await waitFor(() => expect(mockFetchMessages).toHaveBeenCalled());

    fireEvent.changeText(getByLabelText('Mensagem'), 'Oi');
    fireEvent.press(getByLabelText('Enviar mensagem'));

    expect(getByLabelText('Mensagem').props.value).toBe('Oi');
  });

  it('deve marcar a mensagem como não enviada e reenviar ao tocar', async () => {
    const { getByLabelText, findByLabelText } = renderPanel();
    await waitFor(() => expect(mockFetchMessages).toHaveBeenCalled());

    fireEvent.changeText(getByLabelText('Mensagem'), 'Oi');
    fireEvent.press(getByLabelText('Enviar mensagem'));
    const onFailure = mockSendMessage.mock.calls[0][1] as OnFailure;

    act(() => {
      onFailure({
        clientMessageUuid: 'uuid-novo',
        sentAt: today.toISOString(),
      });
    });

    const failed = await findByLabelText(
      'Mensagem não enviada. Tentar de novo',
    );
    fireEvent.press(failed);

    expect(mockSendMessage).toHaveBeenLastCalledWith('Oi', onFailure, {
      clientMessageUuid: 'uuid-novo',
      sentAt: today.toISOString(),
    });
  });

  it('deve confirmar a mensagem pendente e incluir mensagens novas do socket', async () => {
    const { getByLabelText, findByText, queryByText } = renderPanel();
    await waitFor(() => expect(mockFetchMessages).toHaveBeenCalled());

    fireEvent.changeText(getByLabelText('Mensagem'), 'Oi');
    fireEvent.press(getByLabelText('Enviar mensagem'));
    expect(await findByText(/enviando…/)).toBeTruthy();

    act(() => {
      mockOnMessage?.(
        makeMessage({
          id: 'srv-1',
          client_message_uuid: 'uuid-novo',
          sender_user_id: 1,
          text: 'Oi',
        }),
      );
    });
    await waitFor(() => expect(queryByText(/enviando…/)).toBeNull());

    const incoming = makeMessage({ id: 'srv-2', client_message_uuid: 'u-2' });
    act(() => {
      mockOnMessage?.(incoming);
      mockOnMessage?.(
        makeMessage({ id: 'x', room_id: 99, text: 'Outra sala' }),
      );
    });

    expect(await findByText('Olá, tudo bem?')).toBeTruthy();
    expect(queryByText('Outra sala')).toBeNull();
    expect(mockApplyIncoming).toHaveBeenCalledWith(incoming);
    expect(mockApplyIncoming).toHaveBeenCalledTimes(2);
  });

  it('deve carregar mensagens mais antigas sem repetir as já exibidas', async () => {
    mockFetchMessages
      .mockResolvedValueOnce(
        page([makeMessage({ id: 'm1', text: 'Recente' })], {
          nextCursor: 'c1',
        }),
      )
      .mockResolvedValueOnce(
        page([
          makeMessage({ id: 'm1', text: 'Recente' }),
          makeMessage({ id: 'm0', text: 'Antiga' }),
        ]),
      );
    const { findByText, getAllByText, UNSAFE_getByType } = renderPanel();
    await findByText('Recente');

    await act(async () => {
      await UNSAFE_getByType(FlatList).props.onEndReached();
    });

    expect(mockFetchMessages).toHaveBeenLastCalledWith(10, 'c1', 20);
    expect(await findByText('Antiga')).toBeTruthy();
    expect(getAllByText('Recente')).toHaveLength(1);

    // Sem cursor, nao ha mais paginas para buscar.
    await act(async () => {
      await UNSAFE_getByType(FlatList).props.onEndReached();
    });
    expect(mockFetchMessages).toHaveBeenCalledTimes(2);
  });

  it('deve registrar a falha ao paginar e manter as mensagens', async () => {
    mockFetchMessages
      .mockResolvedValueOnce(
        page([makeMessage({ text: 'Recente' })], { nextCursor: 'c1' }),
      )
      .mockRejectedValueOnce(new Error('offline'));
    const { findByText, getByText, UNSAFE_getByType } = renderPanel();
    await findByText('Recente');

    await act(async () => {
      await UNSAFE_getByType(FlatList).props.onEndReached();
    });

    expect(logger.error).toHaveBeenCalled();
    expect(getByText('Recente')).toBeTruthy();
  });

  it('deve bloquear o envio quando a conversa está encerrada', async () => {
    mockFetchMessages.mockResolvedValueOnce(
      page([], { roomStatus: 'archived' }),
    );
    const { findByText, queryByLabelText } = renderPanel();

    expect(
      await findByText(
        'Conversa encerrada: o atendimento foi concluído ou cancelado.',
      ),
    ).toBeTruthy();
    expect(queryByLabelText('Mensagem')).toBeNull();
  });

  it('deve encerrar a conversa quando o socket avisa', async () => {
    mockSocketRoomStatus = 'archived';
    // O historico mantem o status do socket (encerrada) nesta conversa.
    mockFetchMessages.mockResolvedValueOnce(
      page([], { roomStatus: 'archived' }),
    );
    const { findByText } = renderPanel({ roomStatus: 'active' });

    expect(
      await findByText(
        'Conversa encerrada: o atendimento foi concluído ou cancelado.',
      ),
    ).toBeTruthy();
  });
});
