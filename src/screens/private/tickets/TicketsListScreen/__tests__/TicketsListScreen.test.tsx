import React from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import { TicketsListScreen } from '../TicketsListScreen';
import { useTicketStore, Ticket } from '@stores/Ticket';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const makeTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: 1,
  ticket_code: 'TKT-A7F3',
  title: 'Erro ao agendar serviço',
  category: 'AGENDAMENTO',
  priority: 'ALTA',
  status: 'ABERTO',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

describe('TicketsListScreen', () => {
  const mockFetchTickets = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useTicketStore.setState({
      tickets: [],
      isLoading: false,
      error: null,
      fetchTickets: mockFetchTickets,
    });
  });

  it('deve buscar os chamados ao abrir a tela', () => {
    render(<TicketsListScreen />);
    expect(mockFetchTickets).toHaveBeenCalledTimes(1);
  });

  it('deve listar os chamados com código, título e status', () => {
    useTicketStore.setState({
      tickets: [
        makeTicket(),
        makeTicket({
          id: 2,
          ticket_code: 'TKT-K9M2',
          title: 'Pagamento não confirmado',
          category: 'PAGAMENTO',
          status: 'EM_ATENDIMENTO',
        }),
      ],
    });

    const { getByText } = render(<TicketsListScreen />);

    expect(getByText('TKT-A7F3')).toBeTruthy();
    expect(getByText('Erro ao agendar serviço')).toBeTruthy();
    expect(getByText('Aberto')).toBeTruthy();
    expect(getByText('TKT-K9M2')).toBeTruthy();
    expect(getByText('Pagamento não confirmado')).toBeTruthy();
    expect(getByText('Em atendimento')).toBeTruthy();
  });

  it('deve mostrar o estado vazio quando não houver chamados', () => {
    const { getByText } = render(<TicketsListScreen />);
    expect(getByText('Nenhum chamado aberto ainda')).toBeTruthy();
  });

  it('deve mostrar o carregamento só quando ainda não há lista', () => {
    useTicketStore.setState({ isLoading: true });
    const { UNSAFE_queryByType, queryByText } = render(<TicketsListScreen />);

    expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
    expect(queryByText('Nenhum chamado aberto ainda')).toBeNull();
  });

  it('deve manter a lista visível durante a atualização', () => {
    useTicketStore.setState({ isLoading: true, tickets: [makeTicket()] });
    const { getByText, UNSAFE_getByType } = render(<TicketsListScreen />);

    expect(getByText('TKT-A7F3')).toBeTruthy();
    expect(UNSAFE_getByType(RefreshControl).props.refreshing).toBe(true);
  });

  it('deve abrir o detalhe ao tocar em um chamado', () => {
    useTicketStore.setState({ tickets: [makeTicket({ id: 42 })] });
    const { getByText } = render(<TicketsListScreen />);

    fireEvent.press(getByText('TKT-A7F3'));
    expect(mockNavigate).toHaveBeenCalledWith('TicketDetail', { id: 42 });
  });

  it('deve abrir o formulário em "Abrir novo chamado"', () => {
    const { getByText } = render(<TicketsListScreen />);

    fireEvent.press(getByText('Abrir novo chamado'));
    expect(mockNavigate).toHaveBeenCalledWith('CreateTicket');
  });

  it('deve buscar de novo no pull-to-refresh', () => {
    useTicketStore.setState({ tickets: [makeTicket()] });
    const { UNSAFE_getByType } = render(<TicketsListScreen />);

    act(() => {
      UNSAFE_getByType(RefreshControl).props.onRefresh();
    });
    expect(mockFetchTickets).toHaveBeenCalledTimes(2);
  });
});
