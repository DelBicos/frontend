import { useAppointmentStore } from '../Appointment';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { useUserStore } from '@stores/User';
import { AppointmentStatus } from '../types';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock('@stores/User', () => ({
  useUserStore: {
    getState: jest.fn(),
  },
}));

jest.mock('@lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const http = backendHttpClient as unknown as Record<string, jest.Mock>;
const mockUser = (user: { id: number; name: string } | null) =>
  (useUserStore.getState as jest.Mock).mockReturnValue({ user });

describe('AppointmentStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppointmentStore.setState({
      appointments: [],
      appointmentsByStatus: {},
      loading: false,
      activeRole: undefined,
    });
  });

  it('deve buscar e agrupar agendamentos por status', async () => {
    (useUserStore.getState as jest.Mock).mockReturnValue({
      user: { id: 1, name: 'Usuário Teste' },
    });

    const mockData = [
      {
        id: 1,
        status: 'pending',
        start_time: '2026-09-01T10:00:00Z',
        Service: { title: 'Serviço 1' },
      },
      {
        id: 2,
        status: 'confirmed',
        start_time: '2026-09-02T14:00:00Z',
        Service: { title: 'Serviço 2' },
      },
      {
        id: 3,
        status: 'completed',
        start_time: '2026-08-20T09:00:00Z',
        Service: { title: 'Serviço 3' },
      },
    ];

    (backendHttpClient.get as jest.Mock).mockResolvedValue({ data: mockData });

    await useAppointmentStore.getState().fetchAppointments('client');

    const state = useAppointmentStore.getState();
    expect(backendHttpClient.get).toHaveBeenCalledWith(
      'api/appointments/user/1?role=client',
    );
    expect(state.appointments).toHaveLength(3);
    expect(state.appointmentsByStatus['pending']).toHaveLength(1);
    expect(state.appointmentsByStatus['confirmed']).toHaveLength(1);
    expect(state.appointmentsByStatus['completed']).toHaveLength(1);
  });

  it('deve atualizar o status do agendamento com sucesso', async () => {
    (useUserStore.getState as jest.Mock).mockReturnValue({
      user: { id: 1, name: 'Usuário Teste' },
    });
    (backendHttpClient.put as jest.Mock).mockResolvedValue({ status: 200 });
    (backendHttpClient.get as jest.Mock).mockResolvedValue({ data: [] });

    const result = await useAppointmentStore
      .getState()
      .updateAppointmentStatus(1, 'confirmed' as any);

    expect(result).toBe(true);
    expect(backendHttpClient.put).toHaveBeenCalledWith('api/appointments/1', {
      status: 'confirmed',
    });
  });

  it('mantem a lista ao atualizar com o mesmo papel e limpa ao trocar de papel', async () => {
    mockUser({ id: 1, name: 'Usuário Teste' });
    const atual = [{ id: 9, status: 'pending', start_time: '2026-01-01' }];
    useAppointmentStore.setState({
      appointments: atual as never,
      activeRole: 'client',
    });

    let resolver: (v: unknown) => void = () => undefined;
    http.get.mockReturnValue(new Promise((r) => (resolver = r)));
    const mesmoPapel = useAppointmentStore
      .getState()
      .fetchAppointments('client');
    expect(useAppointmentStore.getState().appointments).toHaveLength(1);
    expect(useAppointmentStore.getState().loading).toBe(true);
    resolver({ data: [] });
    await mesmoPapel;

    useAppointmentStore.setState({ appointments: atual as never });
    http.get.mockReturnValue(new Promise((r) => (resolver = r)));
    const outroPapel = useAppointmentStore
      .getState()
      .fetchAppointments('professional');
    expect(useAppointmentStore.getState().appointments).toEqual([]);
    expect(useAppointmentStore.getState().activeRole).toBe('professional');
    resolver({ data: [] });
    await outroPapel;
  });

  it('ordena do mais recente para o mais antigo e agrupa status repetidos', async () => {
    mockUser({ id: 1, name: 'Usuário Teste' });
    http.get.mockResolvedValue({
      data: [
        { id: 1, status: 'pending', start_time: '2026-01-01T10:00:00Z' },
        { id: 2, status: 'pending', start_time: '2026-03-01T10:00:00Z' },
      ],
    });

    await useAppointmentStore.getState().fetchAppointments();

    const state = useAppointmentStore.getState();
    expect(http.get).toHaveBeenCalledWith('api/appointments/user/1');
    expect(state.appointments.map((a) => a.id)).toEqual([2, 1]);
    expect(state.appointmentsByStatus.pending?.map((a) => a.id)).toEqual([
      2, 1,
    ]);
    expect(state.loading).toBe(false);
  });

  it('esvazia a lista quando nao ha usuario ou a requisicao falha', async () => {
    mockUser(null);
    useAppointmentStore.setState({ appointments: [{ id: 1 }] as never });
    await useAppointmentStore.getState().fetchAppointments('client');
    expect(useAppointmentStore.getState().appointments).toEqual([]);
    expect(http.get).not.toHaveBeenCalled();

    mockUser({ id: 1, name: 'Usuário Teste' });
    http.get.mockRejectedValue(new Error('falhou'));
    await useAppointmentStore.getState().fetchAppointments('client');
    expect(useAppointmentStore.getState().appointments).toEqual([]);
    expect(useAppointmentStore.getState().loading).toBe(false);
  });

  describe('fetchAppointmentsAsSheet', () => {
    it('monta as linhas da planilha', async () => {
      mockUser({ id: 7, name: 'Usuário Teste' });
      http.get.mockResolvedValue({
        data: [
          {
            id: 3,
            status: 'completed',
            start_time: '2026-05-10T12:00:00Z',
            Professional: { User: { name: 'Ana' } },
            Client: { User: { name: 'Bruno' } },
            Service: { title: 'Pintura' },
          },
        ],
      });

      const rows = await useAppointmentStore
        .getState()
        .fetchAppointmentsAsSheet('professional');

      expect(http.get).toHaveBeenCalledWith(
        'api/appointments/user/7?role=professional',
      );
      expect(rows).toEqual([
        {
          ID: 3,
          Professional: 'Ana',
          Client: 'Bruno',
          Service: 'Pintura',
          Date: new Date('2026-05-10T12:00:00Z').toLocaleDateString(),
          Status: 'completed',
        },
      ]);
    });

    it('usa o endpoint sem papel quando nenhum e informado', async () => {
      mockUser({ id: 7, name: 'Usuário Teste' });
      http.get.mockResolvedValue({ data: [] });
      expect(
        await useAppointmentStore.getState().fetchAppointmentsAsSheet(),
      ).toEqual([]);
      expect(http.get).toHaveBeenCalledWith('api/appointments/user/7');
    });

    it('retorna lista vazia sem usuario ou com erro', async () => {
      mockUser(null);
      expect(
        await useAppointmentStore.getState().fetchAppointmentsAsSheet('client'),
      ).toEqual([]);

      mockUser({ id: 7, name: 'Usuário Teste' });
      http.get.mockRejectedValue(new Error('falhou'));
      expect(
        await useAppointmentStore.getState().fetchAppointmentsAsSheet('client'),
      ).toEqual([]);
    });
  });

  describe('reviewAppointment', () => {
    it('retorna true quando a API responde 200', async () => {
      http.post.mockResolvedValue({ status: 200 });
      expect(
        await useAppointmentStore
          .getState()
          .reviewAppointment(5, 4, 'Muito bom'),
      ).toBe(true);
      expect(http.post).toHaveBeenCalledWith('api/appointments/5/review', {
        rating: 4,
        review: 'Muito bom',
      });
    });

    it('retorna false para outro status ou erro', async () => {
      http.post.mockResolvedValueOnce({ status: 201 });
      expect(
        await useAppointmentStore.getState().reviewAppointment(5, 4, 'ok'),
      ).toBe(false);

      http.post.mockRejectedValueOnce(new Error('falhou'));
      expect(
        await useAppointmentStore.getState().reviewAppointment(5, 4, 'ok'),
      ).toBe(false);
    });
  });

  describe('fetchInvoice', () => {
    it('busca a nota com o id do usuario', async () => {
      mockUser({ id: 7, name: 'Usuário Teste' });
      const nota = { id: 'n1', total: 100 };
      http.get.mockResolvedValue({ data: nota });

      expect(await useAppointmentStore.getState().fetchInvoice(12)).toEqual(
        nota,
      );
      expect(http.get).toHaveBeenCalledWith('api/appointments/12/receipt', {
        params: { userId: 7 },
      });
    });

    it('retorna null sem usuario ou com erro', async () => {
      mockUser(null);
      expect(await useAppointmentStore.getState().fetchInvoice(12)).toBeNull();

      mockUser({ id: 7, name: 'Usuário Teste' });
      http.get.mockRejectedValue(new Error('falhou'));
      expect(await useAppointmentStore.getState().fetchInvoice(12)).toBeNull();
    });
  });

  describe('completeAppointment', () => {
    it('conclui e recarrega a lista com o papel ativo', async () => {
      mockUser({ id: 1, name: 'Usuário Teste' });
      useAppointmentStore.setState({ activeRole: 'professional' });
      http.post.mockResolvedValue({ status: 200 });
      http.get.mockResolvedValue({ data: [] });

      expect(await useAppointmentStore.getState().completeAppointment(8)).toBe(
        true,
      );
      expect(http.post).toHaveBeenCalledWith('api/appointments/8/complete');
      expect(http.get).toHaveBeenCalledWith(
        'api/appointments/user/1?role=professional',
      );
    });

    it('retorna false quando a API falha', async () => {
      http.post.mockRejectedValue(new Error('falhou'));
      expect(await useAppointmentStore.getState().completeAppointment(8)).toBe(
        false,
      );
    });
  });

  it('nao recarrega e retorna false quando a atualizacao de status nao responde 200', async () => {
    http.put.mockResolvedValueOnce({ status: 204 });
    expect(
      await useAppointmentStore
        .getState()
        .updateAppointmentStatus(1, AppointmentStatus.CONFIRMED),
    ).toBe(false);
    expect(http.get).not.toHaveBeenCalled();

    http.put.mockRejectedValueOnce(new Error('falhou'));
    expect(
      await useAppointmentStore
        .getState()
        .updateAppointmentStatus(1, AppointmentStatus.CONFIRMED),
    ).toBe(false);
  });

  describe('getAppointmentById', () => {
    it('retorna o agendamento ou null quando vazio', async () => {
      http.get.mockResolvedValueOnce({ data: { id: 4 } });
      expect(
        await useAppointmentStore.getState().getAppointmentById('4'),
      ).toEqual({ id: 4 });
      expect(http.get).toHaveBeenCalledWith('/api/appointments/4');

      http.get.mockResolvedValueOnce({ data: undefined });
      expect(
        await useAppointmentStore.getState().getAppointmentById('4'),
      ).toBeNull();
    });

    it('retorna null quando a requisicao falha', async () => {
      http.get.mockRejectedValue(new Error('falhou'));
      expect(
        await useAppointmentStore.getState().getAppointmentById('4'),
      ).toBeNull();
    });
  });
});
