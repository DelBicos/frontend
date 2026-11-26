import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTicketStore, isTicketOpen } from '../Ticket';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { Ticket, TicketMessage } from '../types';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedClient = backendHttpClient as jest.Mocked<typeof backendHttpClient>;

const GENERIC_ERROR = 'Não foi possível concluir a operação.';

const mockTicket: Ticket = {
  id: 1,
  ticket_code: 'TKT-A7F3',
  title: 'Erro ao agendar serviço',
  category: 'AGENDAMENTO',
  priority: null,
  status: 'ABERTO',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockDetailedTicket: Ticket = {
  ...mockTicket,
  id: 42,
  ticket_code: 'TKT-B7YS',
  description: 'Não consigo agendar um serviço de limpeza para amanhã.',
  priority: 'ALTA',
  user_type: 'CLIENTE',
  appointment_id: 7,
};

const mockMessage: TicketMessage = {
  id: 10,
  ticket_id: 42,
  author: {
    id: 99,
    type: 'ADMIN',
    name: 'Equipe DelBicos',
    avatar_uri: null,
  },
  content: 'Estamos verificando o seu agendamento.',
  attachment_url: null,
  created_at: new Date().toISOString(),
};

describe('useTicketStore', () => {
  beforeEach(() => {
    useTicketStore.setState({
      tickets: [],
      currentTicket: null,
      messages: [],
      isLoading: false,
      isSubmitting: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  // ─── CREATE ──────────────────────────────────────────
  describe('createTicket', () => {
    it('deve criar um ticket e adicionar no topo da lista', async () => {
      mockedClient.post.mockResolvedValueOnce({
        data: { ticket: mockTicket },
      });

      const payload = {
        title: 'Erro ao agendar serviço',
        description: 'Descrição válida com mais de 10 caracteres',
        category: 'AGENDAMENTO' as const,
        priority: 'ALTA' as const,
      };
      const result = await useTicketStore.getState().createTicket(payload);

      expect(mockedClient.post).toHaveBeenCalledWith('/api/tickets', payload);
      expect(result).toEqual(mockTicket);
      expect(useTicketStore.getState().tickets).toContainEqual(mockTicket);
      expect(useTicketStore.getState().isSubmitting).toBe(false);
    });

    it('deve manter os chamados anteriores abaixo do novo', async () => {
      const older = { ...mockTicket, id: 2, ticket_code: 'TKT-OLD1' };
      useTicketStore.setState({ tickets: [older] });
      mockedClient.post.mockResolvedValueOnce({
        data: { ticket: mockTicket },
      });

      await useTicketStore.getState().createTicket({
        title: 'Erro ao agendar serviço',
        description: 'Descrição válida com mais de 10 caracteres',
        category: 'AGENDAMENTO',
        priority: 'MEDIA',
      });

      expect(useTicketStore.getState().tickets).toEqual([mockTicket, older]);
    });

    it('deve enviar o appointment_short_id quando informado', async () => {
      mockedClient.post.mockResolvedValueOnce({
        data: { ticket: mockTicket },
      });

      await useTicketStore.getState().createTicket({
        title: 'Problema com agendamento #6BDOKZ',
        description: 'O profissional não apareceu no horário.',
        category: 'AGENDAMENTO',
        priority: 'CRITICA',
        appointment_short_id: '6BDOKZ',
      });

      expect(mockedClient.post).toHaveBeenCalledWith(
        '/api/tickets',
        expect.objectContaining({
          priority: 'CRITICA',
          appointment_short_id: '6BDOKZ',
        }),
      );
    });

    it('deve marcar isSubmitting enquanto a requisição está em andamento', async () => {
      let resolveRequest: (value: unknown) => void = () => {};
      mockedClient.post.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
      );

      const promise = useTicketStore.getState().createTicket({
        title: 'Erro ao agendar serviço',
        description: 'Descrição válida com mais de 10 caracteres',
        category: 'AGENDAMENTO',
        priority: 'BAIXA',
      });

      expect(useTicketStore.getState().isSubmitting).toBe(true);

      resolveRequest({ data: { ticket: mockTicket } });
      await promise;

      expect(useTicketStore.getState().isSubmitting).toBe(false);
    });

    it('deve limpar o erro anterior ao enviar de novo', async () => {
      useTicketStore.setState({ error: 'Erro antigo' });
      mockedClient.post.mockResolvedValueOnce({
        data: { ticket: mockTicket },
      });

      await useTicketStore.getState().createTicket({
        title: 'Erro ao agendar serviço',
        description: 'Descrição válida com mais de 10 caracteres',
        category: 'AGENDAMENTO',
        priority: 'BAIXA',
      });

      expect(useTicketStore.getState().error).toBeNull();
    });

    it('deve capturar erro do backend', async () => {
      mockedClient.post.mockRejectedValueOnce({
        response: { data: { error: 'Erro de teste' } },
      });

      await expect(
        useTicketStore.getState().createTicket({
          title: 'Teste',
          description: 'Descrição válida com mais de 10 caracteres',
          category: 'AGENDAMENTO',
          priority: 'BAIXA',
        }),
      ).rejects.toThrow('Erro de teste');

      expect(useTicketStore.getState().error).toBe('Erro de teste');
      expect(useTicketStore.getState().isSubmitting).toBe(false);
    });

    it('deve usar a mensagem de details quando o backend validar o body', async () => {
      mockedClient.post.mockRejectedValueOnce({
        response: {
          data: {
            error: 'Dados inválidos.',
            details: [
              {
                field: 'priority',
                message: 'Prioridade inválida ou não informada',
              },
            ],
          },
        },
      });

      await expect(
        useTicketStore.getState().createTicket({
          title: 'Título válido',
          description: 'Descrição válida com mais de 10 caracteres',
          category: 'AGENDAMENTO',
          priority: 'MEDIA',
        }),
      ).rejects.toThrow('Prioridade inválida ou não informada');

      expect(useTicketStore.getState().error).toBe(
        'Prioridade inválida ou não informada',
      );
    });

    it('deve usar o campo error quando details vier vazio', async () => {
      mockedClient.post.mockRejectedValueOnce({
        response: { data: { error: 'Dados inválidos.', details: [] } },
      });

      await expect(
        useTicketStore.getState().createTicket({
          title: 'Título válido',
          description: 'Descrição válida com mais de 10 caracteres',
          category: 'OUTROS',
          priority: 'BAIXA',
        }),
      ).rejects.toThrow('Dados inválidos.');
    });

    it('deve repassar o 403 de administrador', async () => {
      mockedClient.post.mockRejectedValueOnce({
        response: {
          status: 403,
          data: { error: 'Administradores não podem abrir chamados.' },
        },
      });

      await expect(
        useTicketStore.getState().createTicket({
          title: 'Título válido',
          description: 'Descrição válida com mais de 10 caracteres',
          category: 'OUTROS',
          priority: 'BAIXA',
        }),
      ).rejects.toThrow('Administradores não podem abrir chamados.');

      expect(useTicketStore.getState().tickets).toEqual([]);
    });

    it('deve usar a mensagem genérica quando não houver resposta', async () => {
      mockedClient.post.mockRejectedValueOnce(new Error('Network Error'));

      await expect(
        useTicketStore.getState().createTicket({
          title: 'Título válido',
          description: 'Descrição válida com mais de 10 caracteres',
          category: 'OUTROS',
          priority: 'BAIXA',
        }),
      ).rejects.toThrow(GENERIC_ERROR);

      expect(useTicketStore.getState().error).toBe(GENERIC_ERROR);
    });

    it('deve usar a mensagem genérica quando a resposta vier sem corpo', async () => {
      mockedClient.post.mockRejectedValueOnce({ response: { data: '' } });

      await expect(
        useTicketStore.getState().createTicket({
          title: 'Título válido',
          description: 'Descrição válida com mais de 10 caracteres',
          category: 'OUTROS',
          priority: 'BAIXA',
        }),
      ).rejects.toThrow(GENERIC_ERROR);
    });

    it('deve usar a mensagem genérica quando o erro não for um objeto', async () => {
      mockedClient.post.mockRejectedValueOnce('falha');

      await expect(
        useTicketStore.getState().createTicket({
          title: 'Título válido',
          description: 'Descrição válida com mais de 10 caracteres',
          category: 'OUTROS',
          priority: 'BAIXA',
        }),
      ).rejects.toThrow(GENERIC_ERROR);
    });
  });

  // ─── LIST ────────────────────────────────────────────
  describe('fetchTickets', () => {
    it('deve popular a lista de tickets', async () => {
      mockedClient.get.mockResolvedValueOnce({
        data: { tickets: [mockTicket] },
      });

      await useTicketStore.getState().fetchTickets();

      expect(mockedClient.get).toHaveBeenCalledWith('/api/tickets');
      expect(useTicketStore.getState().tickets).toEqual([mockTicket]);
      expect(useTicketStore.getState().isLoading).toBe(false);
    });

    it('deve substituir a lista local pela do servidor (status atual)', async () => {
      useTicketStore.setState({ tickets: [mockTicket] });
      const updated = { ...mockTicket, status: 'EM_ATENDIMENTO' as const };
      mockedClient.get.mockResolvedValueOnce({
        data: { tickets: [updated] },
      });

      await useTicketStore.getState().fetchTickets();

      expect(useTicketStore.getState().tickets).toEqual([updated]);
    });

    it('deve usar lista vazia quando a resposta não trouxer tickets', async () => {
      useTicketStore.setState({ tickets: [mockTicket] });
      mockedClient.get.mockResolvedValueOnce({ data: {} });

      await useTicketStore.getState().fetchTickets();

      expect(useTicketStore.getState().tickets).toEqual([]);
    });

    it('deve guardar o erro e manter a lista anterior', async () => {
      useTicketStore.setState({ tickets: [mockTicket] });
      mockedClient.get.mockRejectedValueOnce({
        response: { data: { error: 'Erro ao listar chamados.' } },
      });

      await useTicketStore.getState().fetchTickets();

      expect(useTicketStore.getState().error).toBe('Erro ao listar chamados.');
      expect(useTicketStore.getState().tickets).toEqual([mockTicket]);
      expect(useTicketStore.getState().isLoading).toBe(false);
    });
  });

  // ─── DETAIL ──────────────────────────────────────────
  describe('fetchTicketById', () => {
    it('deve buscar o chamado e guardar em currentTicket', async () => {
      mockedClient.get.mockResolvedValueOnce({
        data: { ticket: mockDetailedTicket },
      });

      const result = await useTicketStore.getState().fetchTicketById(42);

      expect(mockedClient.get).toHaveBeenCalledWith('/api/tickets/42');
      expect(result).toEqual(mockDetailedTicket);
      expect(useTicketStore.getState().currentTicket).toEqual(
        mockDetailedTicket,
      );
      expect(useTicketStore.getState().isLoading).toBe(false);
    });

    it('deve retornar null e guardar o erro no 404', async () => {
      mockedClient.get.mockRejectedValueOnce({
        response: { status: 404, data: { error: 'Chamado não encontrado.' } },
      });

      const result = await useTicketStore.getState().fetchTicketById(999);

      expect(result).toBeNull();
      expect(useTicketStore.getState().currentTicket).toBeNull();
      expect(useTicketStore.getState().error).toBe('Chamado não encontrado.');
      expect(useTicketStore.getState().isLoading).toBe(false);
    });
  });

  // ─── MESSAGES ────────────────────────────────────────
  describe('fetchMessages', () => {
    it('deve buscar o histórico do chamado', async () => {
      mockedClient.get.mockResolvedValueOnce({
        data: { messages: [mockMessage] },
      });

      await useTicketStore.getState().fetchMessages(42);

      expect(mockedClient.get).toHaveBeenCalledWith('/api/tickets/42/messages');
      expect(useTicketStore.getState().messages).toEqual([mockMessage]);
      expect(useTicketStore.getState().isLoading).toBe(false);
    });

    it('deve usar lista vazia quando a resposta não trouxer mensagens', async () => {
      mockedClient.get.mockResolvedValueOnce({ data: {} });

      await useTicketStore.getState().fetchMessages(42);

      expect(useTicketStore.getState().messages).toEqual([]);
    });

    it('deve guardar o erro quando a busca falhar', async () => {
      mockedClient.get.mockRejectedValueOnce({
        response: { data: { error: 'Chamado não encontrado.' } },
      });

      await useTicketStore.getState().fetchMessages(42);

      expect(useTicketStore.getState().error).toBe('Chamado não encontrado.');
      expect(useTicketStore.getState().isLoading).toBe(false);
    });
  });

  // ─── RESET ───────────────────────────────────────────
  describe('clearError', () => {
    it('deve limpar o erro', () => {
      useTicketStore.setState({ error: 'Algo deu errado' });
      useTicketStore.getState().clearError();
      expect(useTicketStore.getState().error).toBeNull();
    });
  });

  describe('clearCurrent', () => {
    it('deve limpar o chamado selecionado', () => {
      useTicketStore.setState({ currentTicket: mockDetailedTicket });
      useTicketStore.getState().clearCurrent();
      expect(useTicketStore.getState().currentTicket).toBeNull();
    });
  });

  describe('clearMessages', () => {
    it('deve limpar o histórico', () => {
      useTicketStore.setState({ messages: [mockMessage] });
      useTicketStore.getState().clearMessages();
      expect(useTicketStore.getState().messages).toEqual([]);
    });
  });

  // ─── SEND MESSAGE (TICKET-05) ────────────────────────
  describe('sendMessage', () => {
    const sentMessage: TicketMessage = {
      id: 11,
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

    const httpError = (status: number, data: unknown) => ({
      response: { status, data },
    });

    it('deve enviar só o conteúdo aparado e anexar a mensagem ao fim', async () => {
      useTicketStore.setState({ messages: [mockMessage] });
      mockedClient.post.mockResolvedValueOnce({
        data: {
          message: 'Mensagem adicionada com sucesso.',
          ticket_message: sentMessage,
        },
      });

      const result = await useTicketStore
        .getState()
        .sendMessage(42, '  O prestador ainda não respondeu.  ');

      expect(mockedClient.post).toHaveBeenCalledWith(
        '/api/tickets/42/messages',
        { content: 'O prestador ainda não respondeu.' },
      );
      expect(result).toEqual({ ok: true, message: sentMessage });
      expect(useTicketStore.getState().messages).toEqual([
        mockMessage,
        sentMessage,
      ]);
      expect(useTicketStore.getState().isSubmitting).toBe(false);
    });

    it('deve atualizar updated_at e levar o chamado ao topo da lista', async () => {
      const other = { ...mockTicket, id: 7 };
      useTicketStore.setState({
        tickets: [other, mockDetailedTicket],
        currentTicket: mockDetailedTicket,
      });
      mockedClient.post.mockResolvedValueOnce({
        data: { ticket_message: sentMessage },
      });

      await useTicketStore.getState().sendMessage(42, 'Olá');

      const { tickets, currentTicket } = useTicketStore.getState();
      expect(tickets.map((t) => t.id)).toEqual([42, 7]);
      expect(tickets[0].updated_at).toBe(sentMessage.created_at);
      expect(currentTicket?.updated_at).toBe(sentMessage.created_at);
    });

    it('deve marcar isSubmitting durante o envio', async () => {
      let resolvePost: (value: unknown) => void = () => undefined;
      mockedClient.post.mockReturnValueOnce(
        new Promise((resolve) => {
          resolvePost = resolve;
        }) as never,
      );

      const pending = useTicketStore.getState().sendMessage(42, 'Olá');
      expect(useTicketStore.getState().isSubmitting).toBe(true);

      resolvePost({ data: { ticket_message: sentMessage } });
      await pending;
      expect(useTicketStore.getState().isSubmitting).toBe(false);
    });

    it('não deve mexer na lista quando o chamado não estiver nela', async () => {
      useTicketStore.setState({ tickets: [mockTicket] });
      mockedClient.post.mockResolvedValueOnce({
        data: { ticket_message: sentMessage },
      });

      await useTicketStore.getState().sendMessage(42, 'Olá');

      expect(useTicketStore.getState().tickets).toEqual([mockTicket]);
    });

    it('não deve alterar o chamado aberto quando for de outro id', async () => {
      const other = { ...mockDetailedTicket, id: 7 };
      useTicketStore.setState({ currentTicket: other });
      mockedClient.post.mockResolvedValueOnce({
        data: { ticket_message: sentMessage },
      });

      await useTicketStore.getState().sendMessage(42, 'Olá');

      expect(useTicketStore.getState().currentTicket).toEqual(other);
    });

    it('não deve alterar histórico nem lista quando o envio falhar', async () => {
      useTicketStore.setState({
        tickets: [mockDetailedTicket],
        currentTicket: mockDetailedTicket,
        messages: [mockMessage],
      });
      mockedClient.post.mockRejectedValueOnce(
        httpError(500, { error: 'Erro ao adicionar mensagem.' }),
      );

      await useTicketStore.getState().sendMessage(42, 'Olá');

      const { tickets, currentTicket, messages } = useTicketStore.getState();
      expect(messages).toEqual([mockMessage]);
      expect(tickets).toEqual([mockDetailedTicket]);
      expect(currentTicket).toEqual(mockDetailedTicket);
    });

    it('deve tratar 400 sem detalhes como UNKNOWN', async () => {
      mockedClient.post.mockRejectedValueOnce(
        httpError(400, { error: 'ID inválido.' }),
      );

      const result = await useTicketStore.getState().sendMessage(42, 'Olá');

      expect(result).toEqual({
        ok: false,
        reason: 'UNKNOWN',
        error: 'ID inválido.',
      });
    });

    it('deve retornar INVALID_CONTENT com a mensagem do campo no 400', async () => {
      mockedClient.post.mockRejectedValueOnce(
        httpError(400, {
          error: 'Dados inválidos.',
          details: [
            { field: 'content', message: 'Mensagem não pode ficar vazia' },
          ],
        }),
      );

      const result = await useTicketStore.getState().sendMessage(42, 'x');

      expect(result).toEqual({
        ok: false,
        reason: 'INVALID_CONTENT',
        error: 'Mensagem não pode ficar vazia',
      });
      expect(useTicketStore.getState().messages).toEqual([]);
    });

    it('deve retornar TICKET_CLOSED no 409 e recarregar o chamado', async () => {
      const closed = { ...mockDetailedTicket, status: 'FECHADO' as const };
      mockedClient.post.mockRejectedValueOnce(
        httpError(409, {
          error: 'Chamado encerrado não aceita novas mensagens.',
          code: 'TICKET_CLOSED',
        }),
      );
      mockedClient.get.mockResolvedValueOnce({ data: { ticket: closed } });

      const result = await useTicketStore.getState().sendMessage(42, 'Olá');

      expect(result).toEqual({
        ok: false,
        reason: 'TICKET_CLOSED',
        error: 'Chamado encerrado não aceita novas mensagens.',
      });
      expect(mockedClient.get).toHaveBeenCalledWith('/api/tickets/42');
      expect(useTicketStore.getState().currentTicket?.status).toBe('FECHADO');
    });

    it('não deve tratar como encerrado um 409 sem o código TICKET_CLOSED', async () => {
      mockedClient.post.mockRejectedValueOnce(
        httpError(409, { error: 'Conflito.' }),
      );

      const result = await useTicketStore.getState().sendMessage(42, 'Olá');

      expect(result).toMatchObject({ ok: false, reason: 'UNKNOWN' });
      expect(mockedClient.get).not.toHaveBeenCalled();
    });

    it('deve retornar NOT_FOUND no 404', async () => {
      mockedClient.post.mockRejectedValueOnce(
        httpError(404, { error: 'Chamado não encontrado.' }),
      );

      const result = await useTicketStore.getState().sendMessage(42, 'Olá');

      expect(result).toEqual({
        ok: false,
        reason: 'NOT_FOUND',
        error: 'Chamado não encontrado.',
      });
    });

    it('deve retornar UNKNOWN com a mensagem do servidor no 500', async () => {
      mockedClient.post.mockRejectedValueOnce(
        httpError(500, { error: 'Erro ao adicionar mensagem.' }),
      );

      const result = await useTicketStore.getState().sendMessage(42, 'Olá');

      expect(result).toEqual({
        ok: false,
        reason: 'UNKNOWN',
        error: 'Erro ao adicionar mensagem.',
      });
      expect(useTicketStore.getState().isSubmitting).toBe(false);
    });

    it('deve avisar sobre a conexão quando não houver resposta', async () => {
      mockedClient.post.mockRejectedValueOnce(new Error('Network Error'));

      const result = await useTicketStore.getState().sendMessage(42, 'Olá');

      expect(result).toEqual({
        ok: false,
        reason: 'UNKNOWN',
        error: 'Não foi possível enviar a mensagem. Verifique sua conexão.',
      });
    });
  });

  describe('isTicketOpen', () => {
    it.each(['ABERTO', 'EM_ANALISE', 'EM_ATENDIMENTO'] as const)(
      'deve aceitar mensagens com status %s',
      (status) => {
        expect(isTicketOpen(status)).toBe(true);
      },
    );

    it.each(['RESOLVIDO', 'FECHADO'] as const)(
      'não deve aceitar mensagens com status %s',
      (status) => {
        expect(isTicketOpen(status)).toBe(false);
      },
    );
  });

  // ─── PERSIST ─────────────────────────────────────────
  describe('persistência', () => {
    it('deve salvar só a lista de chamados, sem estado transitório', async () => {
      useTicketStore.setState({
        tickets: [mockTicket],
        currentTicket: mockDetailedTicket,
        messages: [mockMessage],
        isLoading: true,
        isSubmitting: true,
        error: 'Erro temporário',
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      const raw = await AsyncStorage.getItem('delbicos-ticket-store');
      expect(raw).not.toBeNull();
      const { state } = JSON.parse(raw as string);

      expect(state.tickets).toEqual([mockTicket]);
      expect(state.currentTicket).toBeNull();
      expect(state.messages).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.isSubmitting).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
