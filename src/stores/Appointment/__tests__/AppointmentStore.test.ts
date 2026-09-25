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
});
