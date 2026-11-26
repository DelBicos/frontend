import React from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfessionalDashboard from '../ProfessionalDashboard';
import { useUserStore } from '@stores/User';
import type { User } from '@stores/User/types';
import { useDashboardStore } from '@stores/Dashboard';
import { useAppointmentStore } from '@stores/Appointment';
import { Appointment, AppointmentStatus } from '@stores/Appointment/types';
import { ClientProfileSubRoutes } from '@screens/types';

const mockNavigate = jest.fn();
let mockWidth = 400;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useFocusEffect: (cb: () => void) => cb(),
}));

jest.mock('@lib/hooks/useBreakpoint', () => {
  const actual = jest.requireActual('@lib/hooks/useBreakpoint');
  return {
    ...actual,
    useBreakpoint: () => actual.getBreakpointInfo(mockWidth),
  };
});

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

const inDays = (days: number, hour = 14) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const makeAppointment = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 1,
    status: AppointmentStatus.PENDING,
    start_time: inDays(2),
    end_time: inDays(2, 15),
    final_price: 120,
    Service: { title: 'Troca de chuveiro' },
    Client: { User: { name: 'Ana Cliente', avatar_uri: null } },
    Address: { neighborhood: 'Centro', city: 'Sorocaba' },
    ...overrides,
  }) as unknown as Appointment;

const now = new Date();
const thisMonth = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

describe('ProfessionalDashboard', () => {
  const mockFetchKpis = jest.fn();
  const mockFetchEarnings = jest.fn();
  const mockFetchAppointments = jest.fn();
  const mockUpdateStatus = jest.fn();
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWidth = 400;
    mockUpdateStatus.mockResolvedValue(true);
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    useUserStore.setState({
      user: {
        id: 1,
        name: 'Bruno da Silva',
        professional_id: 3,
      } as unknown as User,
    });
    useDashboardStore.setState({
      kpis: { totalServices: 12, totalEarnings: 2500, avgRating: 4.8 },
      earnings: [{ month: thisMonth, total: 900 }],
      error: null,
      fetchKpis: mockFetchKpis,
      fetchEarnings: mockFetchEarnings,
    });
    useAppointmentStore.setState({
      appointments: [],
      loading: false,
      fetchAppointments: mockFetchAppointments,
      updateAppointmentStatus: mockUpdateStatus,
    });
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('deve pedir login quando não há usuário', () => {
    useUserStore.setState({ user: null });
    const { getByText } = render(<ProfessionalDashboard />);

    expect(getByText(/Entre na sua conta de colaborador/)).toBeTruthy();
    fireEvent.press(getByText('Entrar'));
    expect(mockNavigate).toHaveBeenCalledWith('Login', undefined);
    expect(mockFetchKpis).not.toHaveBeenCalled();
  });

  it('deve convidar o cliente a virar colaborador', () => {
    useUserStore.setState({ user: { id: 1, name: 'Ana' } as unknown as User });
    const { getByText } = render(<ProfessionalDashboard />);

    fireEvent.press(getByText('Tornar-se colaborador'));
    expect(mockNavigate).toHaveBeenCalledWith('ClientProfile', {
      subroute: ClientProfileSubRoutes.TornarParceiro,
    });
  });

  it('deve buscar indicadores, ganhos e agenda ao abrir', () => {
    const { getByText } = render(<ProfessionalDashboard />);

    expect(getByText('Olá, Bruno!')).toBeTruthy();
    expect(getByText(/Nenhum atendimento hoje/)).toBeTruthy();
    expect(mockFetchKpis).toHaveBeenCalled();
    expect(mockFetchEarnings).toHaveBeenCalled();
    expect(mockFetchAppointments).toHaveBeenCalledWith('professional');
  });

  it('deve mostrar os indicadores e ocultá-los ao pedir', () => {
    const { getByLabelText, queryByLabelText } = render(
      <ProfessionalDashboard />,
    );

    expect(getByLabelText(/Ganhos no mês: R\$\s900,00/)).toBeTruthy();
    expect(getByLabelText(/Ganhos totais: R\$\s2\.500,00/)).toBeTruthy();
    expect(getByLabelText('Serviços concluídos: 12')).toBeTruthy();
    expect(getByLabelText('Avaliação média: 4.8 ★')).toBeTruthy();

    fireEvent.press(getByLabelText('Ocultar valores'));

    expect(getByLabelText('Ganhos no mês: R$ ••••')).toBeTruthy();
    expect(queryByLabelText(/Ganhos totais: R\$\s2\.500/)).toBeNull();
    expect(getByLabelText('Mostrar valores')).toBeTruthy();
  });

  it('deve avisar quando os indicadores não carregam', () => {
    useDashboardStore.setState({ kpis: null, error: 'falhou' });
    const { getByText, getByLabelText } = render(<ProfessionalDashboard />);

    expect(
      getByText('Não foi possível carregar seus indicadores agora.'),
    ).toBeTruthy();
    expect(getByLabelText('Ganhos totais: —')).toBeTruthy();
    expect(getByText('Sem avaliações ainda')).toBeTruthy();
  });

  it('deve mostrar carregamento e estados vazios da agenda', () => {
    useAppointmentStore.setState({ loading: true });
    const { UNSAFE_queryAllByType, rerender, getByText } = render(
      <ProfessionalDashboard />,
    );
    expect(UNSAFE_queryAllByType(ActivityIndicator)).toHaveLength(2);

    useAppointmentStore.setState({ loading: false });
    rerender(<ProfessionalDashboard />);
    expect(getByText(/Nenhum pedido pendente/)).toBeTruthy();
    expect(getByText(/Nenhum atendimento confirmado/)).toBeTruthy();
  });

  it('deve aceitar um pedido e atualizar os indicadores', async () => {
    useAppointmentStore.setState({ appointments: [makeAppointment()] });
    const { getByLabelText, getByText } = render(<ProfessionalDashboard />);

    expect(getByText(/120,00/)).toBeTruthy();
    expect(getByText('Centro, Sorocaba')).toBeTruthy();
    fireEvent.press(getByLabelText('Aceitar Troca de chuveiro de Ana Cliente'));

    await waitFor(() =>
      expect(mockUpdateStatus).toHaveBeenCalledWith(
        1,
        AppointmentStatus.CONFIRMED,
      ),
    );
    await waitFor(() => expect(mockFetchKpis).toHaveBeenCalledTimes(2));
  });

  it('deve avisar quando a resposta ao pedido falha', async () => {
    mockUpdateStatus.mockResolvedValueOnce(false);
    useAppointmentStore.setState({ appointments: [makeAppointment()] });
    const { getByLabelText, findByText } = render(<ProfessionalDashboard />);

    fireEvent.press(getByLabelText('Aceitar Troca de chuveiro de Ana Cliente'));

    expect(
      await findByText(/Não foi possível responder ao pedido/),
    ).toBeTruthy();
  });

  it('deve recusar o pedido só depois de confirmar', async () => {
    useAppointmentStore.setState({ appointments: [makeAppointment()] });
    const { getByLabelText } = render(<ProfessionalDashboard />);

    fireEvent.press(getByLabelText('Recusar Troca de chuveiro de Ana Cliente'));
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    const [title, , buttons] = alertSpy.mock.calls[0];
    expect(title).toBe('Recusar pedido?');

    (buttons as { onPress: () => void }[])[1].onPress();

    await waitFor(() =>
      expect(mockUpdateStatus).toHaveBeenCalledWith(
        1,
        AppointmentStatus.CANCELED,
      ),
    );
  });

  it('não deve recusar quando a confirmação é cancelada', async () => {
    useAppointmentStore.setState({ appointments: [makeAppointment()] });
    const { getByLabelText } = render(<ProfessionalDashboard />);

    fireEvent.press(getByLabelText('Recusar Troca de chuveiro de Ana Cliente'));
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    (alertSpy.mock.calls[0][2] as { onPress: () => void }[])[0].onPress();

    await waitFor(() => expect(mockUpdateStatus).not.toHaveBeenCalled());
  });

  it('deve listar os próximos atendimentos e abrir a agenda', () => {
    useAppointmentStore.setState({
      appointments: [
        makeAppointment({
          id: 5,
          status: AppointmentStatus.CONFIRMED,
          Client: {
            User: { name: 'Caio', avatar_uri: 'https://x.exemplo.com/c.jpg' },
          },
          Address: undefined,
        }),
      ],
    });
    const { getByLabelText } = render(<ProfessionalDashboard />);

    fireEvent.press(getByLabelText(/Troca de chuveiro com Caio/));
    expect(mockNavigate).toHaveBeenCalledWith(
      'ProfessionalSchedulesTab',
      undefined,
    );
  });

  it('deve contar os atendimentos de hoje', () => {
    useAppointmentStore.setState({
      appointments: [
        makeAppointment({
          id: 6,
          status: AppointmentStatus.CONFIRMED,
          start_time: inDays(0, 23),
          end_time: inDays(0, 23),
        }),
        makeAppointment({
          id: 7,
          status: AppointmentStatus.CONFIRMED,
          start_time: inDays(0, 23),
          end_time: inDays(0, 23),
        }),
      ],
    });
    const { getByText } = render(<ProfessionalDashboard />);

    expect(getByText(/2 atendimentos hoje/)).toBeTruthy();
  });

  it('deve abrir os atalhos e o perfil público no celular', () => {
    const { getByText } = render(<ProfessionalDashboard />);

    fireEvent.press(getByText('Conversas'));
    expect(mockNavigate).toHaveBeenCalledWith('ChatList', undefined);
    fireEvent.press(getByText('Central de Ajuda'));
    expect(mockNavigate).toHaveBeenCalledWith('Help', undefined);
    fireEvent.press(getByText('Ver perfil público'));
    expect(mockNavigate).toHaveBeenCalledWith('PartnerProfile', { id: 3 });
  });

  it('deve mostrar o perfil público no cabeçalho em telas largas', () => {
    mockWidth = 1300;
    const { getByText } = render(<ProfessionalDashboard />);

    expect(getByText('Ganhos nos últimos 6 meses')).toBeTruthy();
    fireEvent.press(getByText('Ver perfil público'));
    expect(mockNavigate).toHaveBeenCalledWith('PartnerProfile', { id: 3 });
  });

  it('deve destacar o mês escolhido no gráfico de ganhos', () => {
    useDashboardStore.setState({
      earnings: [{ month: thisMonth, total: 1500 }],
    });
    const { getByText, getAllByRole } = render(<ProfessionalDashboard />);

    expect(getByText('R$ 1,5 mil')).toBeTruthy();
    const bars = getAllByRole('radio');
    expect(bars).toHaveLength(6);

    fireEvent.press(bars[0]);
    expect(getByText('R$ 0')).toBeTruthy();

    fireEvent(bars[5], 'hoverIn');
    expect(getByText('R$ 1,5 mil')).toBeTruthy();
    fireEvent(bars[5], 'hoverOut');
    fireEvent(bars[2], 'focus');
    fireEvent(bars[2], 'blur');
    expect(getByText('R$ 0')).toBeTruthy();
  });

  it('deve mostrar valor pequeno no gráfico e esconder ao ocultar', () => {
    useDashboardStore.setState({
      earnings: [{ month: thisMonth, total: 300 }],
    });
    const { getByText, getByLabelText, getAllByText } = render(
      <ProfessionalDashboard />,
    );

    expect(getByText('R$ 300')).toBeTruthy();
    fireEvent.press(getByLabelText('Ocultar valores'));
    expect(getByText('••••')).toBeTruthy();
    expect(getAllByText('R$ ••••').length).toBeGreaterThan(0);
  });
});
