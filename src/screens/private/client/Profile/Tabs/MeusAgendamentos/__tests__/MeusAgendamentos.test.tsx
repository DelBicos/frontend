import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import MeusAgendamentos from '../MeusAgendamentos';
import { useAppointmentStore } from '@stores/Appointment';
import { Appointment, AppointmentStatus } from '@stores/Appointment/types';
import { useFavoriteStore } from '@stores/Favorite';
import { useUserStore } from '@stores/User';
import type { User } from '@stores/User/types';
import { confirmAction } from '@lib/utils/confirmAction';
import { useAppointmentStatusSocket } from '@hooks/useAppointmentStatusSocket';

const mockNavigate = jest.fn();
let mockFocused = true;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useIsFocused: () => mockFocused,
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

jest.mock('@lib/utils/confirmAction', () => ({
  confirmAction: jest.fn(),
}));

jest.mock('@hooks/useAppointmentStatusSocket', () => ({
  useAppointmentStatusSocket: jest.fn(),
}));

// O cartao real tem regras proprias; aqui so expoe as acoes que a tela liga.
jest.mock('@components/features/AgendaCard', () => {
  const { Text, View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({
      appointment,
      isFavorite,
      onOpenDetails,
      onAccept,
      onDecline,
      onComplete,
      onPay,
      onRate,
      onToggleFavorite,
    }: {
      appointment: { id: number; Service: { title: string } };
      isFavorite: boolean;
      onOpenDetails: () => void;
      onAccept: () => void;
      onDecline: () => void;
      onComplete: () => void;
      onPay: () => void;
      onRate: () => void;
      onToggleFavorite: () => void;
    }) => (
      <View>
        <Text>{appointment.Service.title}</Text>
        <Text>{isFavorite ? 'favorito' : 'não favorito'}</Text>
        <Text onPress={onOpenDetails}>abrir {appointment.id}</Text>
        <Text onPress={onAccept}>aceitar {appointment.id}</Text>
        <Text onPress={onDecline}>recusar {appointment.id}</Text>
        <Text onPress={onComplete}>concluir {appointment.id}</Text>
        <Text onPress={onPay}>pagar {appointment.id}</Text>
        <Text onPress={onRate}>avaliar {appointment.id}</Text>
        <Text onPress={onToggleFavorite}>favoritar {appointment.id}</Text>
      </View>
    ),
  };
});

jest.mock('@components/features/AppointmentDetailsModal', () => {
  const { Text, View } = jest.requireActual('react-native');
  return {
    AppointmentDetailsModal: ({
      visible,
      appointment,
      onClose,
      onChanged,
      onOpenHelp,
    }: {
      visible: boolean;
      appointment: { id: number; Service: { title: string } } | null;
      onClose: () => void;
      onChanged: () => void;
      onOpenHelp: (a: { id: number }) => void;
    }) =>
      visible && appointment ? (
        <View>
          <Text>Detalhe: {appointment.Service.title}</Text>
          <Text onPress={onClose}>Fechar detalhe</Text>
          <Text onPress={onChanged}>Detalhe mudou</Text>
          <Text onPress={() => onOpenHelp(appointment)}>Pedir ajuda</Text>
        </View>
      ) : null,
  };
});

jest.mock('@components/features/RateServiceModal', () => {
  const { Text, View } = jest.requireActual('react-native');
  return {
    RateServiceModal: ({
      professionalName,
      onClose,
      onSuccess,
    }: {
      professionalName: string;
      onClose: () => void;
      onSuccess: () => void;
    }) => (
      <View>
        <Text>Avaliar {professionalName}</Text>
        <Text onPress={onSuccess}>Enviar avaliação</Text>
        <Text onPress={onClose}>Fechar avaliação</Text>
      </View>
    ),
  };
});

const mockConfirm = confirmAction as jest.MockedFunction<typeof confirmAction>;
const mockSocket = useAppointmentStatusSocket as jest.Mock;

const DAY = 24 * 60 * 60 * 1000;
const isoFromNow = (ms: number) => new Date(Date.now() + ms).toISOString();

const makeAppointment = (overrides: Partial<Appointment> = {}): Appointment =>
  ({
    id: 1,
    professional_id: 4,
    status: AppointmentStatus.CONFIRMED,
    start_time: isoFromNow(2 * DAY),
    end_time: isoFromNow(2 * DAY + 60 * 60 * 1000),
    rating: null,
    review: null,
    Service: {
      id: 9,
      title: 'Pintura',
      price: 150,
      banner_uri: 'https://banner',
      Subcategory: { name: 'Reformas' },
    },
    Professional: {
      id: 4,
      User: { name: 'Carlos Pintor', avatar_uri: 'https://avatar' },
    },
    Client: { id: 31, User: { name: 'Maria Cliente' } },
    ...overrides,
  }) as unknown as Appointment;

describe('MeusAgendamentos', () => {
  const mockFetch = jest.fn();
  const mockUpdateStatus = jest.fn();
  const mockComplete = jest.fn();
  const mockAddFavorite = jest.fn();
  const mockRemoveFavorite = jest.fn();
  const mockIsFavorite = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFocused = true;
    mockIsFavorite.mockReturnValue(false);
    useUserStore.setState({ user: { id: 31 } as unknown as User });
    useAppointmentStore.setState({
      appointments: [],
      loading: false,
      fetchAppointments: mockFetch,
      updateAppointmentStatus: mockUpdateStatus,
      completeAppointment: mockComplete,
    });
    useFavoriteStore.setState({
      addFavorite: mockAddFavorite,
      removeFavorite: mockRemoveFavorite,
      isFavorite: mockIsFavorite,
    });
  });

  it('deve pedir login quando não há usuário', () => {
    useUserStore.setState({ user: null });
    const { getByText } = render(<MeusAgendamentos />);

    expect(getByText('Acompanhe seus agendamentos')).toBeTruthy();
    fireEvent.press(getByText('Entrar'));
    expect(mockNavigate).toHaveBeenCalledWith('Login');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('deve buscar ao abrir e atualizar a cada 30 segundos', () => {
    jest.useFakeTimers();
    try {
      const { unmount } = render(<MeusAgendamentos />);
      expect(mockFetch).toHaveBeenCalledWith('client');

      act(() => {
        jest.advanceTimersByTime(30000);
      });
      expect(mockFetch).toHaveBeenCalledTimes(2);

      unmount();
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });

  it('não deve buscar enquanto a aba está em segundo plano', () => {
    mockFocused = false;
    render(<MeusAgendamentos />);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('deve recarregar quando o socket avisa mudança de status', () => {
    render(<MeusAgendamentos />);
    const refresh = mockSocket.mock.calls[0][0] as () => void;

    act(() => refresh());
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('deve mostrar o carregamento sem agendamentos', () => {
    useAppointmentStore.setState({ loading: true });
    const { UNSAFE_queryByType } = render(<MeusAgendamentos />);
    expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
  });

  it('deve mostrar as abas do cliente e o texto vazio de cada uma', () => {
    const { getByText, queryByText } = render(<MeusAgendamentos />);

    expect(getByText('Meus agendamentos')).toBeTruthy();
    expect(queryByText(/A concluir/)).toBeNull();
    expect(getByText('Você não tem agendamentos marcados.')).toBeTruthy();

    fireEvent.press(getByText('Histórico (0)'));
    expect(getByText('Seus serviços realizados aparecem aqui.')).toBeTruthy();

    fireEvent.press(getByText('Cancelados (0)'));
    expect(getByText('Nenhum agendamento cancelado.')).toBeTruthy();
  });

  it('deve separar os agendamentos nas abas', () => {
    useAppointmentStore.setState({
      appointments: [
        makeAppointment({ id: 1 }),
        makeAppointment({
          id: 2,
          status: AppointmentStatus.COMPLETED,
          start_time: isoFromNow(-3 * DAY),
          end_time: isoFromNow(-3 * DAY),
          Service: { id: 8, title: 'Elétrica' } as never,
        }),
        makeAppointment({
          id: 3,
          status: AppointmentStatus.CANCELED,
          Service: { id: 7, title: 'Encanamento' } as never,
        }),
      ],
    });
    const { getByText, queryByText } = render(<MeusAgendamentos />);

    expect(getByText('Próximos (1)')).toBeTruthy();
    expect(getByText('Pintura')).toBeTruthy();
    expect(queryByText('Elétrica')).toBeNull();

    fireEvent.press(getByText('Histórico (1)'));
    expect(getByText('Elétrica')).toBeTruthy();

    fireEvent.press(getByText('Cancelados (1)'));
    expect(getByText('Encanamento')).toBeTruthy();
  });

  it('deve abrir o pagamento com os dados do agendamento', () => {
    useAppointmentStore.setState({ appointments: [makeAppointment()] });
    const { getByText } = render(<MeusAgendamentos />);

    fireEvent.press(getByText('pagar 1'));
    expect(mockNavigate).toHaveBeenCalledWith('Checkout', {
      professionalId: 4,
      selectedTime: expect.any(String),
      serviceId: 9,
      appointmentId: '1',
      imageUrl: 'https://banner',
      professionalName: 'Carlos Pintor',
    });
  });

  it('deve abrir o detalhe, recarregar e pedir ajuda', () => {
    useAppointmentStore.setState({ appointments: [makeAppointment()] });
    const { getByText, queryByText } = render(<MeusAgendamentos />);

    fireEvent.press(getByText('abrir 1'));
    expect(getByText('Detalhe: Pintura')).toBeTruthy();

    fireEvent.press(getByText('Detalhe mudou'));
    expect(mockFetch).toHaveBeenCalledTimes(2);

    fireEvent.press(getByText('Pedir ajuda'));
    expect(mockNavigate).toHaveBeenCalledWith('CreateTicket', {
      appointmentShortId: '1',
      contextLabel: 'agendamento #1',
    });

    fireEvent.press(getByText('Fechar detalhe'));
    expect(queryByText('Detalhe: Pintura')).toBeNull();
  });

  it('deve abrir a avaliação e recarregar ao enviar', () => {
    useAppointmentStore.setState({ appointments: [makeAppointment()] });
    const { getByText, queryByText } = render(<MeusAgendamentos />);

    fireEvent.press(getByText('avaliar 1'));
    expect(getByText('Avaliar Carlos Pintor')).toBeTruthy();
    fireEvent.press(getByText('Enviar avaliação'));
    expect(mockFetch).toHaveBeenCalledTimes(2);
    fireEvent.press(getByText('Fechar avaliação'));
    expect(queryByText('Avaliar Carlos Pintor')).toBeNull();
  });

  it('deve favoritar o profissional', () => {
    useAppointmentStore.setState({ appointments: [makeAppointment()] });
    const { getByText } = render(<MeusAgendamentos />);

    fireEvent.press(getByText('favoritar 1'));
    expect(mockAddFavorite).toHaveBeenCalledWith({
      professionalId: 4,
      professionalName: 'Carlos Pintor',
      professionalAvatar: 'https://avatar',
      category: 'Reformas',
      serviceTitle: 'Pintura',
      addedAt: expect.any(String),
    });
    expect(mockRemoveFavorite).not.toHaveBeenCalled();
  });

  it('deve tirar dos favoritos quando já é favorito', () => {
    mockIsFavorite.mockReturnValue(true);
    useAppointmentStore.setState({ appointments: [makeAppointment()] });
    const { getByText } = render(<MeusAgendamentos />);

    expect(getByText('favorito')).toBeTruthy();
    fireEvent.press(getByText('favoritar 1'));
    expect(mockRemoveFavorite).toHaveBeenCalledWith(4);
    expect(mockAddFavorite).not.toHaveBeenCalled();
  });

  describe('como profissional', () => {
    const pending = () =>
      makeAppointment({ id: 5, status: AppointmentStatus.PENDING });

    it('deve mostrar a agenda com a aba "A concluir"', () => {
      const { getByText } = render(<MeusAgendamentos role="professional" />);

      expect(mockFetch).toHaveBeenCalledWith('professional');
      expect(getByText('Agenda')).toBeTruthy();
      fireEvent.press(getByText('A concluir (0)'));
      expect(
        getByText('Tudo em dia: nenhum atendimento esperando conclusão.'),
      ).toBeTruthy();
    });

    it('deve aceitar um pedido', async () => {
      mockUpdateStatus.mockResolvedValue(true);
      useAppointmentStore.setState({ appointments: [pending()] });
      const { getByText, queryByText } = render(
        <MeusAgendamentos role="professional" />,
      );

      fireEvent.press(getByText('aceitar 5'));

      await waitFor(() =>
        expect(mockUpdateStatus).toHaveBeenCalledWith(
          5,
          AppointmentStatus.CONFIRMED,
        ),
      );
      expect(queryByText(/Não foi possível/)).toBeNull();
    });

    it('deve mostrar o erro quando aceitar falha', async () => {
      mockUpdateStatus.mockResolvedValue(false);
      useAppointmentStore.setState({ appointments: [pending()] });
      const { getByText, findByText } = render(
        <MeusAgendamentos role="professional" />,
      );

      fireEvent.press(getByText('aceitar 5'));

      expect(
        await findByText('Não foi possível aceitar o pedido. Tente novamente.'),
      ).toBeTruthy();
    });

    it('deve recusar um pedido depois de confirmar', async () => {
      mockConfirm.mockResolvedValue(true);
      mockUpdateStatus.mockResolvedValue(false);
      useAppointmentStore.setState({ appointments: [pending()] });
      const { getByText, findByText } = render(
        <MeusAgendamentos role="professional" />,
      );

      fireEvent.press(getByText('recusar 5'));

      expect(
        await findByText('Não foi possível recusar o pedido. Tente novamente.'),
      ).toBeTruthy();
      expect(mockUpdateStatus).toHaveBeenCalledWith(
        5,
        AppointmentStatus.CANCELED,
      );
    });

    it('não deve recusar sem confirmação', async () => {
      mockConfirm.mockResolvedValue(false);
      useAppointmentStore.setState({ appointments: [pending()] });
      const { getByText } = render(<MeusAgendamentos role="professional" />);

      fireEvent.press(getByText('recusar 5'));

      await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
      expect(mockUpdateStatus).not.toHaveBeenCalled();
    });

    it('deve concluir um atendimento depois de confirmar', async () => {
      mockConfirm.mockResolvedValue(true);
      mockComplete.mockResolvedValue(false);
      useAppointmentStore.setState({ appointments: [pending()] });
      const { getByText, findByText } = render(
        <MeusAgendamentos role="professional" />,
      );

      fireEvent.press(getByText('concluir 5'));

      expect(
        await findByText(
          'Não foi possível concluir o atendimento. Tente novamente.',
        ),
      ).toBeTruthy();
      expect(mockComplete).toHaveBeenCalledWith(5);
    });

    it('não deve concluir sem confirmação', async () => {
      mockConfirm.mockResolvedValue(false);
      useAppointmentStore.setState({ appointments: [pending()] });
      const { getByText } = render(<MeusAgendamentos role="professional" />);

      fireEvent.press(getByText('concluir 5'));

      await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
      expect(mockComplete).not.toHaveBeenCalled();
    });
  });
});
