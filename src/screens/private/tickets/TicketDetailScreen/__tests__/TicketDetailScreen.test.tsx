import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render } from '@testing-library/react-native';
import { TicketDetailScreen } from '../TicketDetailScreen';
import { useTicketStore, Ticket, TicketMessage } from '@stores/Ticket';

let mockRouteParams: { id?: number } = { id: 42 };

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: mockRouteParams }),
}));

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
});
