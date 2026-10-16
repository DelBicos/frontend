import { useAppointmentStore } from '../Appointment';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { useUserStore } from '@stores/User';

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

  it('deve confirmar chegada e retornar verification_code com sucesso', async () => {
    (backendHttpClient.post as jest.Mock).mockResolvedValue({
      data: { success: true, verification_code: 'AB-12' },
    });

    const res = await useAppointmentStore
      .getState()
      .markArrived(100, { latitude: -23.55, longitude: -46.63 });

    expect(res.success).toBe(true);
    expect(res.verification_code).toBe('AB-12');
    expect(backendHttpClient.post).toHaveBeenCalledWith(
      'api/appointments/100/arrived',
      { latitude: -23.55, longitude: -46.63 },
    );
  });

  it('deve iniciar o serviço (check-in) com código com sucesso', async () => {
    (backendHttpClient.post as jest.Mock).mockResolvedValue({
      data: { success: true },
    });

    const res = await useAppointmentStore.getState().startService(100, 'AB-12');

    expect(res.success).toBe(true);
    expect(backendHttpClient.post).toHaveBeenCalledWith(
      'api/appointments/100/start-service',
      { code: 'AB-12' },
    );
  });

  it('deve finalizar o serviço (check-out) com código com sucesso', async () => {
    (backendHttpClient.post as jest.Mock).mockResolvedValue({
      data: { success: true },
    });

    const res = await useAppointmentStore
      .getState()
      .completeService(100, 'AB-12');

    expect(res.success).toBe(true);
    expect(backendHttpClient.post).toHaveBeenCalledWith(
      'api/appointments/100/complete-service',
      { code: 'AB-12' },
    );
  });

  it('deve retornar mensagem de erro quando o código for incorreto', async () => {
    (backendHttpClient.post as jest.Mock).mockRejectedValue({
      response: { data: { error: 'Código de confirmação incorreto.' } },
    });

    const res = await useAppointmentStore.getState().startService(100, 'XX-99');

    expect(res.success).toBe(false);
    expect(res.error).toBe('Código de confirmação incorreto.');
  });

  it('deve buscar agendamentos do usuário via fetchUserAppointments', async () => {
    (useUserStore.getState as jest.Mock).mockReturnValue({
      user: { id: 42, name: 'Prestador' },
    });
    const mockList = [{ id: 10, status: 'confirmed' }];
    (backendHttpClient.get as jest.Mock).mockResolvedValue({ data: mockList });

    const result = await useAppointmentStore
      .getState()
      .fetchUserAppointments('professional');

    expect(backendHttpClient.get).toHaveBeenCalledWith(
      'api/appointments/user/42?role=professional',
    );
    expect(result).toEqual(mockList);
  });
});
