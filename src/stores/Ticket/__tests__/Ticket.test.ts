import { useTicketStore } from '../Ticket';
import { backendHttpClient } from '@lib/helpers/httpClient';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedClient = backendHttpClient as jest.Mocked<typeof backendHttpClient>;

const mockTicket = {
  id: 1,
  ticket_code: 'TKT-A7F3',
  title: 'Erro ao agendar serviço',
  category: 'AGENDAMENTO',
  priority: null,
  status: 'ABERTO',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('useTicketStore', () => {
  beforeEach(() => {
    useTicketStore.setState({
      tickets: [],
      currentTicket: null,
      isLoading: false,
      isSubmitting: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe('createTicket', () => {
    it('deve criar um ticket e adicionar no topo da lista', async () => {
      mockedClient.post.mockResolvedValueOnce({
        data: { ticket: mockTicket },
      });

      const result = await useTicketStore.getState().createTicket({
        title: 'Erro ao agendar serviço',
        description: 'Descrição válida com mais de 10 caracteres',
        category: 'AGENDAMENTO',
      });

      expect(result).toEqual(mockTicket);
      expect(useTicketStore.getState().tickets).toContainEqual(mockTicket);
      expect(useTicketStore.getState().isSubmitting).toBe(false);
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
        }),
      ).rejects.toThrow('Erro de teste');

      expect(useTicketStore.getState().error).toBe('Erro de teste');
      expect(useTicketStore.getState().isSubmitting).toBe(false);
    });
  });

  describe('fetchTickets', () => {
    it('deve popular a lista de tickets', async () => {
      mockedClient.get.mockResolvedValueOnce({
        data: { tickets: [mockTicket] },
      });

      await useTicketStore.getState().fetchTickets();

      expect(useTicketStore.getState().tickets).toEqual([mockTicket]);
      expect(useTicketStore.getState().isLoading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('deve limpar o erro', () => {
      useTicketStore.setState({ error: 'Algo deu errado' });
      useTicketStore.getState().clearError();
      expect(useTicketStore.getState().error).toBeNull();
    });
  });
});