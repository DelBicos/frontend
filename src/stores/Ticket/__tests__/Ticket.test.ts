import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTicketStore } from '../Ticket';
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
