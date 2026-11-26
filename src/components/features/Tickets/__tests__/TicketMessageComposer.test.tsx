import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TicketMessageComposer } from '../TicketMessageComposer';
import { CLOSED_TICKET_NOTICE } from '../TicketMessageComposer/TicketMessageComposer';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { useTicketStore, TicketMessage, TicketStatus } from '@stores/Ticket';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedClient = backendHttpClient as jest.Mocked<typeof backendHttpClient>;

const sentMessage: TicketMessage = {
  id: 3,
  ticket_id: 42,
  author: { id: 31, type: 'CLIENTE', name: 'Maria Souza', avatar_uri: null },
  content: 'O prestador ainda não respondeu.',
  attachment_url: null,
  created_at: '2026-11-23T14:05:00.000Z',
};

const httpError = (status: number, data: unknown) => ({
  response: { status, data },
});

const renderComposer = (status: TicketStatus = 'ABERTO') => {
  const onSent = jest.fn();
  const onTicketNotFound = jest.fn();
  const utils = render(
    <TicketMessageComposer
      ticketId={42}
      status={status}
      onSent={onSent}
      onTicketNotFound={onTicketNotFound}
    />,
  );
  return { ...utils, onSent, onTicketNotFound };
};

const isSendDisabled = (getByTestId: (id: string) => any) =>
  getByTestId('ticket-message-send-button').props.accessibilityState?.disabled;

describe('TicketMessageComposer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTicketStore.setState({
      tickets: [],
      currentTicket: null,
      messages: [],
      isLoading: false,
      isSubmitting: false,
      error: null,
    });
  });

  // ─── STATUS ──────────────────────────────────────────
  it.each(['ABERTO', 'EM_ANALISE', 'EM_ATENDIMENTO'] as const)(
    'deve mostrar o campo de mensagem para o status %s',
    (status) => {
      const { getByPlaceholderText, queryByText } = renderComposer(status);

      expect(getByPlaceholderText('Escreva uma mensagem')).toBeTruthy();
      expect(queryByText(CLOSED_TICKET_NOTICE)).toBeNull();
    },
  );

  it.each(['RESOLVIDO', 'FECHADO'] as const)(
    'deve esconder o campo e mostrar o aviso para o status %s',
    (status) => {
      const { getByText, queryByPlaceholderText, queryByTestId } =
        renderComposer(status);

      expect(getByText(CLOSED_TICKET_NOTICE)).toBeTruthy();
      expect(queryByPlaceholderText('Escreva uma mensagem')).toBeNull();
      expect(queryByTestId('ticket-message-send-button')).toBeNull();
    },
  );

  // ─── VALIDAÇÃO ───────────────────────────────────────
  it('deve desabilitar o envio com texto vazio ou só espaços', () => {
    const { getByTestId } = renderComposer();

    expect(isSendDisabled(getByTestId)).toBe(true);

    fireEvent.changeText(getByTestId('ticket-message-input'), '    ');
    expect(isSendDisabled(getByTestId)).toBe(true);

    fireEvent.press(getByTestId('ticket-message-send-button'));
    expect(mockedClient.post).not.toHaveBeenCalled();

    fireEvent.changeText(getByTestId('ticket-message-input'), ' Olá ');
    expect(isSendDisabled(getByTestId)).toBe(false);
  });

  it('deve limitar o campo a 2000 caracteres e mostrar o contador', () => {
    const { getByTestId, getByText } = renderComposer();
    const input = getByTestId('ticket-message-input');

    expect(input.props.maxLength).toBe(2000);
    expect(getByText('0/2000')).toBeTruthy();

    fireEvent.changeText(input, 'a'.repeat(2000));
    expect(getByText('2000/2000')).toBeTruthy();
    expect(isSendDisabled(getByTestId)).toBe(false);
  });

  it('deve desabilitar o envio enquanto a requisição está em andamento', async () => {
    let resolvePost: (value: unknown) => void = () => undefined;
    mockedClient.post.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePost = resolve;
      }) as never,
    );
    const { getByTestId } = renderComposer();

    fireEvent.changeText(getByTestId('ticket-message-input'), 'Olá');
    fireEvent.press(getByTestId('ticket-message-send-button'));
    fireEvent.press(getByTestId('ticket-message-send-button'));

    expect(isSendDisabled(getByTestId)).toBe(true);
    expect(
      getByTestId('ticket-message-send-button').props.accessibilityState?.busy,
    ).toBe(true);
    expect(mockedClient.post).toHaveBeenCalledTimes(1);

    resolvePost({ data: { ticket_message: sentMessage } });
    await waitFor(() =>
      expect(getByTestId('ticket-message-input').props.value).toBe(''),
    );
  });

  it('deve impedir o envio acima de 2000 caracteres', () => {
    const { getByTestId } = renderComposer();

    // Pasting can bypass maxLength on some platforms; the button still blocks it.
    fireEvent.changeText(getByTestId('ticket-message-input'), 'a'.repeat(2001));

    expect(isSendDisabled(getByTestId)).toBe(true);
    fireEvent.press(getByTestId('ticket-message-send-button'));
    expect(mockedClient.post).not.toHaveBeenCalled();
  });

  it('deve bloquear o campo enquanto envia', async () => {
    let resolvePost: (value: unknown) => void = () => undefined;
    mockedClient.post.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePost = resolve;
      }) as never,
    );
    const { getByTestId } = renderComposer();

    fireEvent.changeText(getByTestId('ticket-message-input'), 'Olá');
    fireEvent.press(getByTestId('ticket-message-send-button'));

    expect(getByTestId('ticket-message-input').props.editable).toBe(false);

    resolvePost({ data: { ticket_message: sentMessage } });
    await waitFor(() =>
      expect(getByTestId('ticket-message-input').props.editable).toBe(true),
    );
  });

  // ─── 201 ─────────────────────────────────────────────
  it('deve enviar só o conteúdo aparado, anexar a mensagem e limpar o campo', async () => {
    mockedClient.post.mockResolvedValueOnce({
      data: { ticket_message: sentMessage },
    });
    const { getByTestId, onSent } = renderComposer();

    fireEvent.changeText(
      getByTestId('ticket-message-input'),
      '  O prestador ainda não respondeu.  ',
    );
    fireEvent.press(getByTestId('ticket-message-send-button'));

    await waitFor(() => expect(onSent).toHaveBeenCalled());
    expect(mockedClient.post).toHaveBeenCalledWith('/api/tickets/42/messages', {
      content: 'O prestador ainda não respondeu.',
    });
    expect(useTicketStore.getState().messages).toEqual([sentMessage]);
    expect(getByTestId('ticket-message-input').props.value).toBe('');
  });

  // ─── ERROS ───────────────────────────────────────────
  it('400: deve mostrar o erro do campo e manter o texto', async () => {
    mockedClient.post.mockRejectedValueOnce(
      httpError(400, {
        error: 'Dados inválidos.',
        details: [
          { field: 'content', message: 'Mensagem não pode ficar vazia' },
        ],
      }),
    );
    const { getByTestId, findByText } = renderComposer();

    fireEvent.changeText(getByTestId('ticket-message-input'), 'Olá');
    fireEvent.press(getByTestId('ticket-message-send-button'));

    expect(await findByText('Mensagem não pode ficar vazia')).toBeTruthy();
    expect(getByTestId('ticket-message-input').props.value).toBe('Olá');
  });

  it('409 TICKET_CLOSED: deve mostrar o erro, recarregar o chamado, fechar o campo e manter o texto', async () => {
    mockedClient.post.mockRejectedValueOnce(
      httpError(409, {
        error: 'Chamado encerrado não aceita novas mensagens.',
        code: 'TICKET_CLOSED',
      }),
    );
    mockedClient.get.mockResolvedValueOnce({
      data: { ticket: { id: 42, status: 'FECHADO' } },
    });
    const { getByTestId, findByText, getByText, queryByTestId } =
      renderComposer();

    fireEvent.changeText(getByTestId('ticket-message-input'), 'Ainda aguardo');
    fireEvent.press(getByTestId('ticket-message-send-button'));

    expect(
      await findByText('Chamado encerrado não aceita novas mensagens.'),
    ).toBeTruthy();
    expect(mockedClient.get).toHaveBeenCalledWith('/api/tickets/42');
    expect(getByText(CLOSED_TICKET_NOTICE)).toBeTruthy();
    expect(queryByTestId('ticket-message-send-button')).toBeNull();
    const input = getByTestId('ticket-message-input');
    expect(input.props.value).toBe('Ainda aguardo');
    expect(input.props.editable).toBe(false);
  });

  it('404: deve avisar a tela com a mensagem do servidor', async () => {
    mockedClient.post.mockRejectedValueOnce(
      httpError(404, { error: 'Chamado não encontrado.' }),
    );
    const { getByTestId, onTicketNotFound } = renderComposer();

    fireEvent.changeText(getByTestId('ticket-message-input'), 'Olá');
    fireEvent.press(getByTestId('ticket-message-send-button'));

    await waitFor(() =>
      expect(onTicketNotFound).toHaveBeenCalledWith('Chamado não encontrado.'),
    );
    expect(getByTestId('ticket-message-input').props.value).toBe('Olá');
  });

  it('500: deve mostrar o erro com "Tentar novamente", manter o texto e reenviar', async () => {
    mockedClient.post
      .mockRejectedValueOnce(
        httpError(500, { error: 'Erro ao adicionar mensagem.' }),
      )
      .mockResolvedValueOnce({ data: { ticket_message: sentMessage } });
    const { getByTestId, findByText, queryByTestId, onSent } = renderComposer();

    fireEvent.changeText(getByTestId('ticket-message-input'), 'Olá');
    fireEvent.press(getByTestId('ticket-message-send-button'));

    expect(await findByText('Erro ao adicionar mensagem.')).toBeTruthy();
    expect(getByTestId('ticket-message-input').props.value).toBe('Olá');

    fireEvent.press(getByTestId('ticket-message-retry-button'));

    await waitFor(() => expect(onSent).toHaveBeenCalled());
    expect(mockedClient.post).toHaveBeenCalledTimes(2);
    expect(queryByTestId('ticket-message-send-error')).toBeNull();
  });
  it('deve limpar o erro do campo ao digitar de novo', async () => {
    mockedClient.post.mockRejectedValueOnce(
      httpError(400, {
        error: 'Dados inválidos.',
        details: [
          { field: 'content', message: 'Mensagem não pode ficar vazia' },
        ],
      }),
    );
    const { getByTestId, findByText, queryByTestId } = renderComposer();

    fireEvent.changeText(getByTestId('ticket-message-input'), 'Olá');
    fireEvent.press(getByTestId('ticket-message-send-button'));
    await findByText('Mensagem não pode ficar vazia');

    fireEvent.changeText(getByTestId('ticket-message-input'), 'Olá, tudo bem?');

    expect(queryByTestId('ticket-message-field-error')).toBeNull();
  });

  it('400: não deve oferecer "Tentar novamente" para erro do campo', async () => {
    mockedClient.post.mockRejectedValueOnce(
      httpError(400, {
        error: 'Dados inválidos.',
        details: [
          { field: 'content', message: 'Mensagem não pode ficar vazia' },
        ],
      }),
    );
    const { getByTestId, findByText, queryByTestId } = renderComposer();

    fireEvent.changeText(getByTestId('ticket-message-input'), 'Olá');
    fireEvent.press(getByTestId('ticket-message-send-button'));
    await findByText('Mensagem não pode ficar vazia');

    expect(queryByTestId('ticket-message-retry-button')).toBeNull();
    expect(queryByTestId('ticket-message-send-error')).toBeNull();
  });

  it('400 sem detalhes: deve tratar como erro genérico com "Tentar novamente"', async () => {
    mockedClient.post.mockRejectedValueOnce(
      httpError(400, { error: 'ID inválido.' }),
    );
    const { getByTestId, findByText, queryByTestId } = renderComposer();

    fireEvent.changeText(getByTestId('ticket-message-input'), 'Olá');
    fireEvent.press(getByTestId('ticket-message-send-button'));

    expect(await findByText('ID inválido.')).toBeTruthy();
    expect(queryByTestId('ticket-message-field-error')).toBeNull();
    expect(getByTestId('ticket-message-retry-button')).toBeTruthy();
  });

  it('409: deve fechar o campo mesmo se o recarregamento do chamado falhar', async () => {
    mockedClient.post.mockRejectedValueOnce(
      httpError(409, {
        error: 'Chamado encerrado não aceita novas mensagens.',
        code: 'TICKET_CLOSED',
      }),
    );
    mockedClient.get.mockRejectedValueOnce(new Error('Network Error'));
    const { getByTestId, findByText, getByText, queryByTestId } =
      renderComposer('EM_ATENDIMENTO');

    fireEvent.changeText(getByTestId('ticket-message-input'), 'Ainda aguardo');
    fireEvent.press(getByTestId('ticket-message-send-button'));

    expect(
      await findByText('Chamado encerrado não aceita novas mensagens.'),
    ).toBeTruthy();
    expect(getByText(CLOSED_TICKET_NOTICE)).toBeTruthy();
    expect(queryByTestId('ticket-message-send-button')).toBeNull();
    expect(getByTestId('ticket-message-input').props.value).toBe(
      'Ainda aguardo',
    );
  });

  // ─── ACESSIBILIDADE ──────────────────────────────────
  it('deve rotular o campo e o botão de envio', () => {
    const { getByTestId, getByLabelText } = renderComposer();

    expect(getByLabelText('Nova mensagem para o chamado')).toBeTruthy();
    const button = getByTestId('ticket-message-send-button');
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityLabel).toBe('Enviar mensagem');
  });

  it('deve anunciar o erro de envio ao leitor de tela', async () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => undefined);
    mockedClient.post.mockRejectedValueOnce(
      httpError(500, { error: 'Erro ao adicionar mensagem.' }),
    );
    const { getByTestId, findByText } = renderComposer();

    fireEvent.changeText(getByTestId('ticket-message-input'), 'Olá');
    fireEvent.press(getByTestId('ticket-message-send-button'));
    await findByText('Erro ao adicionar mensagem.');

    expect(announce).toHaveBeenCalledWith('Erro ao adicionar mensagem.');
    announce.mockRestore();
  });
});
