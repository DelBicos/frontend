import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { CreateTicketScreen } from '../CreateTicketScreen';
import { useTicketStore } from '@stores/Ticket';
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

  it('deve limpar o erro da store ao cancelar', () => {
    useTicketStore.setState({ error: 'Erro anterior' });
    const { getByText } = render(<CreateTicketScreen />);

    fireEvent.press(getByText('Cancelar'));
    expect(useTicketStore.getState().error).toBeNull();
  });

  // ─── PAPEL DO USUÁRIO (TICKET-02) ────────────────────
  it('deve mostrar CLIENTE e esconder PRESTADOR para prestador', () => {
    useUserStore.setState({
      user: {
        id: 7,
        client_id: 7,
        professional_id: 3,
        name: 'Prestador Teste',
        email: 'prestador@teste.com',
        phone: '11988888888',
        cpf: '10987654321',
      },
    } as never);

    const { getByText, queryByText } = render(<CreateTicketScreen />);

    expect(getByText('Cliente')).toBeTruthy();
    expect(queryByText('Prestador')).toBeNull();
  });

  it('deve esconder CLIENTE para cliente', () => {
    const { queryByText } = render(<CreateTicketScreen />);
    expect(queryByText('Cliente')).toBeNull();
  });

  // ─── CONTEXTO DO AGENDAMENTO (categoria) ─────────────
  it('deve pré-selecionar Agendamento quando vier do agendamento', () => {
    mockRouteParams = {
      appointmentShortId: '6BDOKZ',
      contextLabel: 'agendamento #6BDOKZ',
    };
    const { getByText } = render(<CreateTicketScreen />);

    const chip = getByText('Agendamento').parent?.parent;
    expect(chip?.props.accessibilityState?.selected).toBe(true);
  });

  it('deve usar o código no banner quando não houver contextLabel', () => {
    mockRouteParams = { appointmentShortId: '6BDOKZ' };
    const { getByText } = render(<CreateTicketScreen />);

    expect(
      getByText('Chamado relacionado ao agendamento #6BDOKZ'),
    ).toBeTruthy();
  });

  it('não deve enviar appointment_short_id quando aberto pela Central', async () => {
    const mockCreateTicket = jest
      .fn()
      .mockResolvedValue({ id: 2, ticket_code: 'TKT-K9M2' });
    useTicketStore.setState({ createTicket: mockCreateTicket });

    const { getByPlaceholderText, getByText, getByTestId, findByText } = render(
      <CreateTicketScreen />,
    );

    fireEvent.changeText(
      getByPlaceholderText('Resuma o problema em poucas palavras'),
      'Sugestão de melhoria',
    );
    fireEvent.changeText(
      getByPlaceholderText(/Descreva o que aconteceu/),
      'Seria ótimo filtrar profissionais por avaliação.',
    );
    fireEvent.press(getByText('Sugestão'));
    fireEvent.press(getByTestId('ticket-priority-BAIXA'));
    fireEvent.press(getByTestId('ticket-submit-button'));

    await findByText('TKT-K9M2');
    expect(mockCreateTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'SUGESTAO',
        priority: 'BAIXA',
        appointment_short_id: undefined,
      }),
    );
  });

  // ─── PÓS-ENVIO ───────────────────────────────────────
  const submitValidForm = async (
    utils: ReturnType<typeof render>,
    code = 'TKT-B7YS',
  ) => {
    fireEvent.changeText(
      utils.getByPlaceholderText('Resuma o problema em poucas palavras'),
      'Título válido',
    );
    fireEvent.changeText(
      utils.getByPlaceholderText(/Descreva o que aconteceu/),
      'Descrição suficientemente longa',
    );
    fireEvent.press(utils.getByText('Agendamento'));
    fireEvent.press(utils.getByTestId('ticket-priority-MEDIA'));
    fireEvent.press(utils.getByTestId('ticket-submit-button'));
    await utils.findByText(code);
  };

  it('deve ir para a lista em "Ver meus chamados"', async () => {
    useTicketStore.setState({
      createTicket: jest
        .fn()
        .mockResolvedValue({ id: 1, ticket_code: 'TKT-B7YS' }),
    });
    const utils = render(<CreateTicketScreen />);
    await submitValidForm(utils);

    fireEvent.press(utils.getByText('Ver meus chamados'));
    expect(mockReplace).toHaveBeenCalledWith('TicketsList');
  });

  it('deve ir para a lista em "Fechar" quando aberto pela Central', async () => {
    useTicketStore.setState({
      createTicket: jest
        .fn()
        .mockResolvedValue({ id: 1, ticket_code: 'TKT-B7YS' }),
    });
    const utils = render(<CreateTicketScreen />);
    await submitValidForm(utils);

    fireEvent.press(utils.getByText('Fechar'));
    expect(mockReplace).toHaveBeenCalledWith('TicketsList');
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  it('deve voltar ao agendamento em "Fechar" quando veio de um agendamento', async () => {
    mockRouteParams = {
      appointmentShortId: '6BDOKZ',
      contextLabel: 'agendamento #6BDOKZ',
    };
    useTicketStore.setState({
      createTicket: jest
        .fn()
        .mockResolvedValue({ id: 1, ticket_code: 'TKT-B7YS' }),
    });
    const utils = render(<CreateTicketScreen />);
    await submitValidForm(utils);

    fireEvent.press(utils.getByText('Fechar'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('não deve abrir o modal quando a criação falhar', async () => {
    const mockCreateTicket = jest
      .fn()
      .mockRejectedValue(new Error('Prioridade inválida ou não informada'));
    useTicketStore.setState({ createTicket: mockCreateTicket });

    const { getByPlaceholderText, getByText, getByTestId, queryByText } =
      render(<CreateTicketScreen />);

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
    await act(async () => {
      fireEvent.press(getByTestId('ticket-submit-button'));
    });

    expect(mockCreateTicket).toHaveBeenCalledTimes(1);
    expect(queryByText('Chamado aberto!')).toBeNull();
  });
});
