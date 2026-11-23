import React from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TicketDetailScreen } from '../TicketDetailScreen';
import { useTicketStore, Ticket, TicketMessage } from '@stores/Ticket';
import { backendHttpClient } from '@lib/helpers/httpClient';

let mockRouteParams: { id?: number } = { id: 42 };
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: mockRouteParams }),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedClient = backendHttpClient as jest.Mocked<typeof backendHttpClient>;
const CLOSED_NOTICE =
  'Este chamado foi encerrado e não aceita novas mensagens.';

const mockTicket: Ticket = {
  id: 42,
  ticket_code: 'TKT-B7YS',
  title: 'Erro ao agendar serviço',
  description: 'Não consigo agendar um serviço de limpeza para amanhã.',
  category: 'AGENDAMENTO',
  priority: 'ALTA',
  status: 'EM_ANALISE',
  user_type: 'CLIENTE',
  appointment_id: 7,
  created_at: '2026-11-22T19:25:17.091Z',
  updated_at: '2026-11-22T19:25:17.091Z',
};

const mockMessage: TicketMessage = {
  id: 1,
  ticket_id: 42,
  author: {
    id: 99,
    type: 'ADMIN',
    name: 'Ana Suporte',
    avatar_uri: null,
  },
  content: 'Estamos verificando o seu agendamento.',
  attachment_url: null,
  created_at: '2026-11-22T20:00:00.000Z',
};

describe('TicketDetailScreen', () => {
  const mockFetchTicketById = jest.fn();
  const mockFetchMessages = jest.fn();
  const mockClearCurrent = jest.fn();
  const mockClearMessages = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = { id: 42 };
    useTicketStore.setState({
      currentTicket: mockTicket,
      messages: [],
      isLoading: false,
      error: null,
      fetchTicketById: mockFetchTicketById,
      fetchMessages: mockFetchMessages,
      clearCurrent: mockClearCurrent,
      clearMessages: mockClearMessages,
    });
  });

  // ─── CARREGAMENTO ────────────────────────────────────
  it('deve limpar o estado anterior e buscar chamado e histórico pelo id', () => {
    render(<TicketDetailScreen />);

    expect(mockClearCurrent).toHaveBeenCalled();
    expect(mockClearMessages).toHaveBeenCalled();
    expect(mockFetchTicketById).toHaveBeenCalledWith(42);
    expect(mockFetchMessages).toHaveBeenCalledWith(42);
  });

  it('não deve buscar nada sem id na rota', () => {
    mockRouteParams = {};
    render(<TicketDetailScreen />);

    expect(mockFetchTicketById).not.toHaveBeenCalled();
    expect(mockFetchMessages).not.toHaveBeenCalled();
  });

  it('deve limpar o chamado e o histórico ao sair da tela', () => {
    const { unmount } = render(<TicketDetailScreen />);
    jest.clearAllMocks();

    unmount();

    expect(mockClearCurrent).toHaveBeenCalledTimes(1);
    expect(mockClearMessages).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar o carregamento enquanto não há chamado', () => {
    useTicketStore.setState({ currentTicket: null, isLoading: true });
    const { UNSAFE_queryByType, queryByText } = render(<TicketDetailScreen />);

    expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
    expect(queryByText('Chamado não encontrado.')).toBeNull();
  });

  it('deve mostrar "Chamado não encontrado." quando a busca falhar', () => {
    useTicketStore.setState({ currentTicket: null, isLoading: false });
    const { getByText } = render(<TicketDetailScreen />);

    expect(getByText('Chamado não encontrado.')).toBeTruthy();
  });

  // ─── DADOS DO CHAMADO ────────────────────────────────
  it('deve exibir código, status, título, categoria e descrição', () => {
    const { getByText } = render(<TicketDetailScreen />);

    expect(getByText('TKT-B7YS')).toBeTruthy();
    expect(getByText('Em análise')).toBeTruthy();
    expect(getByText('Erro ao agendar serviço')).toBeTruthy();
    expect(getByText('Agendamento')).toBeTruthy();
    expect(
      getByText('Não consigo agendar um serviço de limpeza para amanhã.'),
    ).toBeTruthy();
  });

  it('deve exibir a prioridade quando definida', () => {
    const { getByText } = render(<TicketDetailScreen />);
    expect(getByText('Prioridade Alta')).toBeTruthy();
  });

  it('não deve exibir prioridade quando ela for nula', () => {
    useTicketStore.setState({
      currentTicket: { ...mockTicket, priority: null },
    });
    const { queryByText } = render(<TicketDetailScreen />);

    expect(queryByText(/^Prioridade/)).toBeNull();
  });

  it('deve exibir a data de abertura formatada', () => {
    const expected = new Date(mockTicket.created_at).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const { getByText } = render(<TicketDetailScreen />);

    expect(getByText(expected)).toBeTruthy();
  });

  // ─── HISTÓRICO ───────────────────────────────────────
  it('deve mostrar o aviso quando ainda não houver interações', () => {
    const { getByText } = render(<TicketDetailScreen />);

    expect(getByText('Histórico de interações')).toBeTruthy();
    expect(
      getByText('Nenhuma interação ainda. Nossa equipe responderá em breve.'),
    ).toBeTruthy();
  });

  it('deve listar as mensagens do histórico', () => {
    useTicketStore.setState({ messages: [mockMessage] });
    const { getByText, queryByText } = render(<TicketDetailScreen />);

    expect(getByText('Ana Suporte')).toBeTruthy();
    expect(getByText('Suporte DelBicos')).toBeTruthy();
    expect(getByText('Estamos verificando o seu agendamento.')).toBeTruthy();
    expect(queryByText(/Nenhuma interação ainda/)).toBeNull();
  });

  // ─── NOVA MENSAGEM (TICKET-05) ───────────────────────
  describe('nova mensagem', () => {
    const sentMessage: TicketMessage = {
      id: 3,
      ticket_id: 42,
      author: {
        id: 31,
        type: 'CLIENTE',
        name: 'Maria Souza',
        avatar_uri: null,
      },
      content: 'O prestador ainda não respondeu.',
      attachment_url: null,
      created_at: '2026-11-23T14:05:00.000Z',
    };

    it('deve mostrar o campo abaixo do aviso de histórico vazio', () => {
      const { getByText, getByPlaceholderText } = render(
        <TicketDetailScreen />,
      );

      expect(getByText(/Nenhuma interação ainda/)).toBeTruthy();
      expect(getByPlaceholderText('Escreva uma mensagem')).toBeTruthy();
    });

    it.each(['RESOLVIDO', 'FECHADO'] as const)(
      'deve mostrar o aviso de encerrado e manter o histórico para %s',
      (status) => {
        useTicketStore.setState({
          currentTicket: { ...mockTicket, status },
          messages: [mockMessage],
        });
        const { getByText, queryByPlaceholderText } = render(
          <TicketDetailScreen />,
        );

        expect(getByText(CLOSED_NOTICE)).toBeTruthy();
        expect(queryByPlaceholderText('Escreva uma mensagem')).toBeNull();
        expect(
          getByText('Estamos verificando o seu agendamento.'),
        ).toBeTruthy();
      },
    );

    it('deve anexar a mensagem enviada ao fim do histórico com o nome do autor', async () => {
      useTicketStore.setState({ messages: [mockMessage] });
      mockedClient.post.mockResolvedValueOnce({
        data: { ticket_message: sentMessage },
      });
      const { getByTestId, findByText, getAllByText } = render(
        <TicketDetailScreen />,
      );

      fireEvent.changeText(
        getByTestId('ticket-message-input'),
        'O prestador ainda não respondeu.',
      );
      fireEvent.press(getByTestId('ticket-message-send-button'));

      expect(await findByText('Maria Souza')).toBeTruthy();
      const contents = getAllByText(
        /Estamos verificando|O prestador ainda não respondeu/,
      ).map((node) => node.props.children);
      expect(contents).toEqual([
        'Estamos verificando o seu agendamento.',
        'O prestador ainda não respondeu.',
      ]);
      expect(getByTestId('ticket-message-input').props.value).toBe('');
    });

    it('deve mostrar o aviso de encerrado abaixo do histórico vazio', () => {
      useTicketStore.setState({
        currentTicket: { ...mockTicket, status: 'RESOLVIDO' },
      });
      const { getByText } = render(<TicketDetailScreen />);

      expect(getByText(/Nenhuma interação ainda/)).toBeTruthy();
      expect(getByText(CLOSED_NOTICE)).toBeTruthy();
    });

    it('não deve rolar a tela ao carregar o histórico', () => {
      useTicketStore.setState({ messages: [mockMessage] });
      const { UNSAFE_getByType } = render(<TicketDetailScreen />);
      const scrollView = UNSAFE_getByType(ScrollView);
      const scrollToEnd = scrollView.instance.scrollToEnd as jest.Mock;
      scrollToEnd.mockClear();

      fireEvent(scrollView, 'contentSizeChange', 360, 800);

      expect(scrollToEnd).not.toHaveBeenCalled();
    });

    it('deve rolar até a mensagem nova depois do envio', async () => {
      mockedClient.post.mockResolvedValueOnce({
        data: { ticket_message: sentMessage },
      });
      const { getByTestId, findByText, UNSAFE_getByType } = render(
        <TicketDetailScreen />,
      );
      const scrollView = UNSAFE_getByType(ScrollView);
      const scrollToEnd = scrollView.instance.scrollToEnd as jest.Mock;
      scrollToEnd.mockClear();

      fireEvent.changeText(getByTestId('ticket-message-input'), 'Olá');
      fireEvent.press(getByTestId('ticket-message-send-button'));
      await findByText('Maria Souza');
      fireEvent(scrollView, 'contentSizeChange', 360, 1200);

      expect(scrollToEnd).toHaveBeenCalledWith({ animated: true });

      // Only once: later layout changes must not keep pulling the user down.
      scrollToEnd.mockClear();
      fireEvent(scrollView, 'contentSizeChange', 360, 1300);
      expect(scrollToEnd).not.toHaveBeenCalled();
    });

    it('404: deve mostrar a mensagem e voltar para a lista de chamados', async () => {
      mockedClient.post.mockRejectedValueOnce({
        response: { status: 404, data: { error: 'Chamado não encontrado.' } },
      });
      const { getByTestId, findByText, getByText } = render(
        <TicketDetailScreen />,
      );

      fireEvent.changeText(getByTestId('ticket-message-input'), 'Olá');
      fireEvent.press(getByTestId('ticket-message-send-button'));

      expect(await findByText('Chamado não encontrado.')).toBeTruthy();
      fireEvent.press(getByText('Voltar para meus chamados'));

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('TicketsList'),
      );
    });

    it('409: deve recarregar o detalhe do chamado', async () => {
      mockedClient.post.mockRejectedValueOnce({
        response: {
          status: 409,
          data: {
            error: 'Chamado encerrado não aceita novas mensagens.',
            code: 'TICKET_CLOSED',
          },
        },
      });
      const { getByTestId, findByText, getByText } = render(
        <TicketDetailScreen />,
      );
      mockFetchTicketById.mockClear();

      fireEvent.changeText(getByTestId('ticket-message-input'), 'Olá');
      fireEvent.press(getByTestId('ticket-message-send-button'));

      expect(
        await findByText('Chamado encerrado não aceita novas mensagens.'),
      ).toBeTruthy();
      expect(mockFetchTicketById).toHaveBeenCalledWith(42);
      expect(getByText(CLOSED_NOTICE)).toBeTruthy();
      expect(getByTestId('ticket-message-input').props.value).toBe('Olá');
    });
  });
});
