import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CreateTicketScreen } from '../CreateTicketScreen';
import { useTicketStore } from '@stores/Ticket/Ticket';
import { useUserStore } from '@stores/User';

const mockReplace = jest.fn();
const mockGoBack = jest.fn();
let mockRouteParams: any = {};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ replace: mockReplace, goBack: mockGoBack }),
  useRoute: () => ({ params: mockRouteParams }),
  CommonActions: { reset: jest.fn() },
}));

describe('CreateTicketScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = {};

    useTicketStore.setState({
      isSubmitting: false,
      error: null,
      tickets: [],
      currentTicket: null,
      isLoading: false,
    });

    useUserStore.setState({
      user: {
        id: 31,
        client_id: 31,
        name: 'Cliente Teste',
        email: 'cliente@teste.com',
        phone: '11999999999',
        cpf: '12345678901',
      },
    });
  });

  // ─── RENDERIZAÇÃO ────────────────────────────────────
  it('deve renderizar os campos do formulário', () => {
    const { getByText, getByPlaceholderText } = render(<CreateTicketScreen />);

    expect(
      getByPlaceholderText('Resuma o problema em poucas palavras'),
    ).toBeTruthy();
    expect(getByPlaceholderText(/Descreva o que aconteceu/)).toBeTruthy();
    expect(getByText('Enviar chamado')).toBeTruthy();
    expect(getByText('Cancelar')).toBeTruthy();
  });

  it('deve renderizar todas as categorias para CLIENTE', () => {
    const { getByText } = render(<CreateTicketScreen />);

    expect(getByText('Agendamento')).toBeTruthy();
    expect(getByText('Pagamento')).toBeTruthy();
    expect(getByText('Serviço')).toBeTruthy();
    expect(getByText('Prestador')).toBeTruthy();
    expect(getByText('Sugestão')).toBeTruthy();
    expect(getByText('Outros')).toBeTruthy();
  });

  // ─── CONTEXTO DO AGENDAMENTO ─────────────────────────
  it('deve exibir banner e pré-preencher título quando vier do agendamento', () => {
    mockRouteParams = {
      appointmentShortId: '6BDOKZ',
      contextLabel: 'agendamento #6BDOKZ',
    };

    const { getByText, getByDisplayValue } = render(<CreateTicketScreen />);

    expect(getByText(/Chamado relacionado ao agendamento/)).toBeTruthy();
    expect(getByDisplayValue('Problema com agendamento #6BDOKZ')).toBeTruthy();
  });

  // ─── VALIDAÇÃO (via testID) ─────────────────────────
  it('deve manter o botão desabilitado quando o título for curto', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <CreateTicketScreen />,
    );

    fireEvent.changeText(
      getByPlaceholderText('Resuma o problema em poucas palavras'),
      'Err',
    );
    fireEvent.changeText(
      getByPlaceholderText(/Descreva o que aconteceu/),
      'Descrição suficientemente longa',
    );

    expect(
      getByTestId('ticket-submit-button').props.accessibilityState?.disabled,
    ).toBe(true);
  });

  it('deve manter o botão desabilitado quando a descrição for curta', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <CreateTicketScreen />,
    );

    fireEvent.changeText(
      getByPlaceholderText('Resuma o problema em poucas palavras'),
      'Título válido',
    );
    fireEvent.changeText(
      getByPlaceholderText(/Descreva o que aconteceu/),
      'Curta',
    );

    expect(
      getByTestId('ticket-submit-button').props.accessibilityState?.disabled,
    ).toBe(true);
  });

  it('deve manter o botão desabilitado sem categoria selecionada', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <CreateTicketScreen />,
    );

    fireEvent.changeText(
      getByPlaceholderText('Resuma o problema em poucas palavras'),
      'Título válido',
    );
    fireEvent.changeText(
      getByPlaceholderText(/Descreva o que aconteceu/),
      'Descrição suficientemente longa',
    );

    expect(
      getByTestId('ticket-submit-button').props.accessibilityState?.disabled,
    ).toBe(true);
  });

  it('deve renderizar as 4 prioridades', () => {
    const { getByText } = render(<CreateTicketScreen />);

    expect(getByText('Baixa')).toBeTruthy();
    expect(getByText('Média')).toBeTruthy();
    expect(getByText('Alta')).toBeTruthy();
    expect(getByText('Crítica')).toBeTruthy();
  });

  it('deve manter o botão desabilitado sem prioridade selecionada', () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(
      <CreateTicketScreen />,
    );

    fireEvent.changeText(
      getByPlaceholderText('Resuma o problema em poucas palavras'),
      'Título válido',
    );
    fireEvent.changeText(
      getByPlaceholderText(/Descreva o que aconteceu/),
      'Descrição suficientemente longa',
    );
    fireEvent.press(getByText('Agendamento'));

    expect(
      getByTestId('ticket-submit-button').props.accessibilityState?.disabled,
    ).toBe(true);
  });

  it('deve habilitar o botão quando todos os campos estiverem preenchidos', () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(
      <CreateTicketScreen />,
    );

    fireEvent.changeText(
      getByPlaceholderText('Resuma o problema em poucas palavras'),
      'Título válido',
    );
    fireEvent.changeText(
      getByPlaceholderText(/Descreva o que aconteceu/),
      'Descrição suficientemente longa',
    );
    fireEvent.press(getByText('Agendamento'));
    fireEvent.press(getByTestId('ticket-priority-MEDIA'));

    expect(
      getByTestId('ticket-submit-button').props.accessibilityState?.disabled,
    ).toBe(false);
  });

  // ─── ENVIO ───────────────────────────────────────────
  it('deve enviar prioridade e agendamento no payload e mostrar o código', async () => {
    mockRouteParams = {
      appointmentShortId: '6BDOKZ',
      contextLabel: 'agendamento #6BDOKZ',
    };
    const mockCreateTicket = jest.fn().mockResolvedValue({
      id: 1,
      ticket_code: 'TKT-B7YS',
    });
    useTicketStore.setState({ createTicket: mockCreateTicket });

    const { getByPlaceholderText, getByTestId, findByText } = render(
      <CreateTicketScreen />,
    );

    fireEvent.changeText(
      getByPlaceholderText(/Descreva o que aconteceu/),
      '  O profissional não apareceu no horário.  ',
    );
    fireEvent.press(getByTestId('ticket-priority-ALTA'));
    fireEvent.press(getByTestId('ticket-submit-button'));

    expect(await findByText('TKT-B7YS')).toBeTruthy();
    expect(mockCreateTicket).toHaveBeenCalledWith({
      title: 'Problema com agendamento #6BDOKZ',
      description: 'O profissional não apareceu no horário.',
      category: 'AGENDAMENTO',
      priority: 'ALTA',
      appointment_short_id: '6BDOKZ',
    });
  });

  it('deve mostrar o erro do backend sem limpar os campos', () => {
    useTicketStore.setState({ error: 'Prioridade inválida ou não informada' });

    const { getByText, getByDisplayValue, getByPlaceholderText } = render(
      <CreateTicketScreen />,
    );
    fireEvent.changeText(
      getByPlaceholderText('Resuma o problema em poucas palavras'),
      'Título válido',
    );

    expect(getByText('Prioridade inválida ou não informada')).toBeTruthy();
    expect(getByDisplayValue('Título válido')).toBeTruthy();
  });

  // ─── CANCELAR ────────────────────────────────────────
  it('deve chamar goBack ao cancelar', () => {
    const { getByText } = render(<CreateTicketScreen />);

    fireEvent.press(getByText('Cancelar'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
