import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import AvaliacoesTab from '../AvaliacoesTab';
import { useAppointmentStore } from '@stores/Appointment';
import { Appointment, AppointmentStatus } from '@stores/Appointment/types';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

jest.mock('@components/features/RateServiceModal', () => {
  const { Text, View } = jest.requireActual('react-native');
  return {
    RateServiceModal: ({
      serviceTitle,
      existingRating,
      onClose,
      onSuccess,
    }: {
      serviceTitle: string;
      existingRating: number | null;
      onClose: () => void;
      onSuccess: () => void;
    }) => (
      <View>
        <Text>
          Avaliando {serviceTitle} ({existingRating ?? 'sem nota'})
        </Text>
        <Text onPress={onSuccess}>Enviar avaliação</Text>
        <Text onPress={onClose}>Fechar avaliação</Text>
      </View>
    ),
  };
});

const makeAppointment = (overrides: Partial<Appointment> = {}): Appointment =>
  ({
    id: 1,
    status: AppointmentStatus.COMPLETED,
    start_time: '2026-03-10T12:00:00.000Z',
    rating: null,
    review: null,
    Service: { id: 9, title: 'Pintura' },
    Professional: { id: 4, User: { name: 'Carlos Pintor', avatar_uri: null } },
    Client: { id: 31, User: { name: 'Maria Cliente', avatar_uri: null } },
    ...overrides,
  }) as unknown as Appointment;

describe('AvaliacoesTab', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAppointmentStore.setState({
      appointments: [],
      loading: false,
      fetchAppointments: mockFetch,
    });
  });

  it('deve buscar os atendimentos ao abrir', () => {
    render(<AvaliacoesTab />);
    expect(mockFetch).toHaveBeenCalledWith('client');
  });

  it('deve mostrar o carregamento sem atendimentos', () => {
    useAppointmentStore.setState({ loading: true });
    const { UNSAFE_queryByType } = render(<AvaliacoesTab />);
    expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
  });

  it('deve mostrar o estado vazio do cliente', () => {
    const { getByText } = render(<AvaliacoesTab />);
    expect(getByText('Nenhuma avaliação ainda')).toBeTruthy();
  });

  it('deve listar os pendentes e as avaliações feitas', () => {
    useAppointmentStore.setState({
      appointments: [
        makeAppointment({ id: 1 }),
        makeAppointment({
          id: 2,
          rating: 4,
          review: 'Muito bom',
          Service: { id: 8, title: 'Elétrica' } as never,
        }),
        makeAppointment({
          id: 3,
          rating: 5,
          start_time: '2026-04-01T12:00:00.000Z',
          Service: undefined as never,
        }),
      ],
    });
    const { getByText, getAllByText } = render(<AvaliacoesTab />);

    expect(getByText('Esperando sua avaliação')).toBeTruthy();
    expect(getByText('Pintura')).toBeTruthy();
    expect(getByText('Suas avaliações')).toBeTruthy();
    expect(getByText(/^Elétrica · /)).toBeTruthy();
    expect(getByText(/^Serviço · /)).toBeTruthy();
    expect(getByText('“Muito bom”')).toBeTruthy();
    expect(getAllByText('Editar avaliação').length).toBe(2);
  });

  it('não deve mostrar o vazio quando só há pendentes', () => {
    useAppointmentStore.setState({ appointments: [makeAppointment()] });
    const { queryByText } = render(<AvaliacoesTab />);
    expect(queryByText('Nenhuma avaliação ainda')).toBeNull();
    expect(queryByText('Suas avaliações')).toBeNull();
  });

  it('deve abrir a avaliação de um pendente e recarregar ao enviar', () => {
    useAppointmentStore.setState({ appointments: [makeAppointment()] });
    const { getByText, queryByText } = render(<AvaliacoesTab />);

    fireEvent.press(getByText('Avaliar'));
    expect(getByText('Avaliando Pintura (sem nota)')).toBeTruthy();
    fireEvent.press(getByText('Enviar avaliação'));
    expect(mockFetch).toHaveBeenCalledTimes(2);
    fireEvent.press(getByText('Fechar avaliação'));
    expect(queryByText(/Avaliando/)).toBeNull();
  });

  it('deve editar uma avaliação já feita', () => {
    useAppointmentStore.setState({
      appointments: [makeAppointment({ rating: 3 })],
    });
    const { getByText } = render(<AvaliacoesTab />);

    fireEvent.press(getByText('Editar avaliação'));
    expect(getByText('Avaliando Pintura (3)')).toBeTruthy();
  });

  describe('como profissional', () => {
    it('deve mostrar o vazio do profissional', () => {
      const { getByText } = render(<AvaliacoesTab role="professional" />);

      expect(mockFetch).toHaveBeenCalledWith('professional');
      expect(getByText('Nenhuma avaliação recebida')).toBeTruthy();
    });

    it('deve mostrar a média e as avaliações recebidas sem pendentes', () => {
      useAppointmentStore.setState({
        appointments: [
          makeAppointment({ id: 1 }),
          makeAppointment({ id: 2, rating: 4 }),
          makeAppointment({ id: 3, rating: 5 }),
        ],
      });
      const { getByText, queryByText } = render(
        <AvaliacoesTab role="professional" />,
      );

      expect(getByText('4,5')).toBeTruthy();
      expect(getByText(/2\s+avaliações/)).toBeTruthy();
      expect(queryByText('Esperando sua avaliação')).toBeNull();
      expect(queryByText('Editar avaliação')).toBeNull();
      expect(queryByText('Suas avaliações')).toBeNull();
    });

    it('deve usar o singular com uma avaliação', () => {
      useAppointmentStore.setState({
        appointments: [makeAppointment({ rating: 5 })],
      });
      const { getByText } = render(<AvaliacoesTab role="professional" />);
      expect(getByText(/1\s+avaliação$/)).toBeTruthy();
    });
  });
});
