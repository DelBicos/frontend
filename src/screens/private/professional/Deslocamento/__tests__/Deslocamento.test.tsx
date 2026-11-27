import React from 'react';
import { Alert, Linking, TextInput } from 'react-native';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { DeslocamentoScreen, DeslocamentoParams } from '../Deslocamento';
import { useAppointmentStore } from '@stores/Appointment';
import type { Appointment } from '@stores/Appointment/types';
import { useUserStore } from '@stores/User';
import type { User } from '@stores/User/types';
import {
  sendLocationUpdate,
  sendLocationArrived,
} from '@hooks/useLocationSocket';

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
let mockParams: Partial<DeslocamentoParams> = {};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack, navigate: mockNavigate }),
  useRoute: () => ({ params: mockParams }),
}));

jest.mock('expo-location', () => ({
  Accuracy: { High: 4 },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
}));

jest.mock('@hooks/useLocationSocket', () => ({
  useLocationSocket: jest.fn(),
  sendLocationUpdate: jest.fn(),
  sendLocationArrived: jest.fn(),
}));

jest.mock('@lib/maps', () => ({
  openGoogleMaps: jest.fn(),
  openWaze: jest.fn(),
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

const mockedLocation = Location as jest.Mocked<typeof Location>;

const position = (latitude: number, longitude: number) =>
  ({
    coords: { latitude, longitude, heading: null, speed: null },
  }) as unknown as Location.LocationObject;

const makeAppointment = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'abc',
    numeric_id: 55,
    status: 'confirmed',
    Client: { User: { name: 'Ana Cliente', phone: '11999990000' } },
    Service: { title: 'Instalação de chuveiro' },
    Address: {
      street: 'Rua A',
      number: '10',
      neighborhood: 'Centro',
      city: 'Sorocaba',
      state: 'SP',
      lat: '-23.5',
      lng: '-47.4',
    },
    ...overrides,
  }) as unknown as Appointment;

/** Preenche as quatro caixas do codigo (duas letras e dois numeros). */
const typeOtp = (
  getAll: (
    type: typeof TextInput,
  ) => { props: { onChangeText: (t: string) => void } }[],
  chars: string[],
) => {
  const inputs = getAll(TextInput).slice(-4);
  chars.forEach((c, i) => {
    act(() => inputs[i].props.onChangeText(c));
  });
};

// Tela pesada: com a maquina carregada (CI ou suite inteira) montar a tela
// e o mapa passa dos 5 s padrao do Jest. O prazo maior nao muda o que e verificado.
jest.setTimeout(20000);

describe('DeslocamentoScreen', () => {
  const mockGetById = jest.fn();
  const mockMarkInTransit = jest.fn();
  const mockMarkArrived = jest.fn();
  const mockStartService = jest.fn();
  const mockCompleteService = jest.fn();
  const mockGetConsent = jest.fn();
  const mockAcceptConsent = jest.fn();
  const watchRemove = jest.fn();
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {
      appointmentId: 55,
      serviceTitle: 'Serviço da rota',
      clientName: 'Cliente da rota',
      address: 'Endereço da rota',
      startTime: '2026-11-26T13:00:00.000Z',
    };
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    mockGetById.mockResolvedValue(null);
    mockMarkInTransit.mockResolvedValue({ success: true });
    mockMarkArrived.mockResolvedValue({ success: true });
    mockStartService.mockResolvedValue({ success: true });
    mockCompleteService.mockResolvedValue({ success: true });
    mockGetConsent.mockResolvedValue({ accepted: true });
    mockAcceptConsent.mockResolvedValue(undefined);
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    } as unknown as Location.LocationPermissionResponse);
    mockedLocation.getCurrentPositionAsync.mockResolvedValue(position(1, 2));
    mockedLocation.watchPositionAsync.mockResolvedValue({
      remove: watchRemove,
    } as unknown as Location.LocationSubscription);
    useAppointmentStore.setState({
      getAppointmentById: mockGetById,
      markInTransit: mockMarkInTransit,
      markArrived: mockMarkArrived,
      startService: mockStartService,
      completeService: mockCompleteService,
    });
    useUserStore.setState({
      user: { id: 1, location_consent_accepted: false } as unknown as User,
      getLocationConsent: mockGetConsent,
      acceptLocationConsent: mockAcceptConsent,
    });
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('deve mostrar os dados da rota no modo inicial', async () => {
    const { getByText } = render(<DeslocamentoScreen />);

    expect(getByText('Deslocamento para Serviço')).toBeTruthy();
    expect(getByText('Cliente da rota')).toBeTruthy();
    expect(getByText('Serviço da rota')).toBeTruthy();
    expect(getByText('Endereço da rota')).toBeTruthy();
    await waitFor(() => expect(mockGetById).toHaveBeenCalledWith(55));
  });

  it('deve usar textos padrão sem parâmetros e voltar pelo botão', () => {
    mockParams = {};
    const { getByText } = render(<DeslocamentoScreen />);

    expect(getByText('Cliente DelBicos')).toBeTruthy();
    expect(getByText('Serviço Agendado')).toBeTruthy();
    expect(mockGetById).not.toHaveBeenCalled();

    fireEvent.press(getByText('Voltar'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('deve trocar os dados pelos do agendamento carregado', async () => {
    mockGetById.mockResolvedValueOnce(makeAppointment());
    const { findByText, getByText } = render(<DeslocamentoScreen />);

    expect(await findByText('Ana Cliente')).toBeTruthy();
    expect(getByText('Instalação de chuveiro')).toBeTruthy();
    expect(getByText('Rua A, 10 - Centro, Sorocaba - SP')).toBeTruthy();
    expect(getByText('11999990000')).toBeTruthy();
  });

  it('deve ligar para o cliente pelo telefone do agendamento', async () => {
    const openURL = jest
      .spyOn(Linking, 'openURL')
      .mockResolvedValue(undefined as unknown as true);
    mockGetById.mockResolvedValueOnce(makeAppointment());
    const { findByText } = render(<DeslocamentoScreen />);

    fireEvent.press(await findByText('11999990000'));
    expect(openURL).toHaveBeenCalledWith('tel:11999990000');
    openURL.mockRestore();
  });

  it('deve iniciar o deslocamento e transmitir a localização', async () => {
    const { getByText, findByText } = render(<DeslocamentoScreen />);
    await waitFor(() => expect(mockGetById).toHaveBeenCalled());

    fireEvent.press(getByText('Estou a Caminho'));

    expect(await findByText('DESLOCAMENTO')).toBeTruthy();
    expect(mockMarkInTransit).toHaveBeenCalledWith(55);
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        'A Caminho! 🚗',
        expect.any(String),
      ),
    );
    expect(sendLocationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        appointment_id: 55,
        latitude: 1,
        longitude: 2,
      }),
    );

    const onPosition = mockedLocation.watchPositionAsync.mock.calls[0][1];
    act(() => {
      onPosition(position(3, 4));
    });
    expect(sendLocationUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        appointment_id: 55,
        latitude: 3,
        longitude: 4,
      }),
    );
  });

  it('deve avisar quando o servidor recusa o deslocamento', async () => {
    mockMarkInTransit.mockResolvedValueOnce({
      success: false,
      error: 'Agendamento não confirmado',
    });
    const { getByText } = render(<DeslocamentoScreen />);

    fireEvent.press(getByText('Estou a Caminho'));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        'Erro',
        'Agendamento não confirmado',
      ),
    );
    expect(getByText('Estou a Caminho')).toBeTruthy();
  });

  it('deve avisar quando a atualização do status quebra', async () => {
    mockMarkInTransit.mockRejectedValueOnce(new Error('offline'));
    const { getByText } = render(<DeslocamentoScreen />);

    fireEvent.press(getByText('Estou a Caminho'));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        'Erro',
        'Erro ao atualizar status para em deslocamento.',
      ),
    );
  });

  it('deve pedir o consentimento LGPD antes de sair e seguir ao aceitar', async () => {
    mockGetConsent.mockResolvedValueOnce({ accepted: false });
    const { getByText, findByText } = render(<DeslocamentoScreen />);

    fireEvent.press(getByText('Estou a Caminho'));
    fireEvent.press(await findByText('Aceitar e Continuar'));

    await waitFor(() => expect(mockAcceptConsent).toHaveBeenCalled());
    await waitFor(() => expect(mockMarkInTransit).toHaveBeenCalledWith(55));
  });

  it('deve usar o consentimento guardado quando a consulta falha', async () => {
    mockGetConsent.mockRejectedValueOnce(new Error('offline'));
    const { getByText, findByText } = render(<DeslocamentoScreen />);

    fireEvent.press(getByText('Estou a Caminho'));

    expect(await findByText('Recusar / Agora Não')).toBeTruthy();
    fireEvent.press(getByText('Recusar / Agora Não'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Consentimento Necessário (LGPD)',
      expect.any(String),
    );
    expect(mockMarkInTransit).not.toHaveBeenCalled();
  });

  it('deve retomar o deslocamento quando o agendamento já está a caminho', async () => {
    mockGetById.mockResolvedValue(makeAppointment({ status: 'in_transit' }));
    const { findByText } = render(<DeslocamentoScreen />);

    expect(await findByText('Cheguei no Local 🎯')).toBeTruthy();
    // O destino chega junto com o agendamento; a transmissao passa a leva-lo.
    await waitFor(() =>
      expect(sendLocationUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ appointment_id: 55, dest_lat: -23.5 }),
      ),
    );
    expect(mockedLocation.watchPositionAsync).toHaveBeenCalled();
  });

  it('deve abrir o código do cliente quando o agendamento já chegou', async () => {
    mockGetById.mockResolvedValueOnce(makeAppointment({ status: 'arrived' }));
    const { findByText, getByText } = render(<DeslocamentoScreen />);

    expect(await findByText('Digite o código do cliente')).toBeTruthy();
    expect(getByText('Digitar Código do Cliente 🔐')).toBeTruthy();
  });

  it('deve mostrar a conclusão quando o agendamento já terminou', async () => {
    mockGetById.mockResolvedValueOnce(makeAppointment({ status: 'completed' }));
    const { findByText } = render(<DeslocamentoScreen />);

    fireEvent.press(await findByText('Voltar ao painel'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('deve confirmar a chegada com a posição atual e abrir o check-in', async () => {
    mockParams = { ...mockParams, status: 'in_transit' };
    const { getByText, findByText } = render(<DeslocamentoScreen />);

    fireEvent.press(getByText('Cheguei no Local 🎯'));

    expect(await findByText('Digite o código do cliente')).toBeTruthy();
    expect(mockMarkArrived).toHaveBeenCalledWith(55, {
      latitude: 1,
      longitude: 2,
    });
    expect(sendLocationArrived).toHaveBeenCalledWith({ appointment_id: 55 });
  });

  it('deve confirmar a chegada sem coordenadas quando não há permissão', async () => {
    mockParams = { ...mockParams, status: 'in_transit' };
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'denied',
    } as unknown as Location.LocationPermissionResponse);
    const { getByText } = render(<DeslocamentoScreen />);

    fireEvent.press(getByText('Cheguei no Local 🎯'));

    await waitFor(() => expect(mockMarkArrived).toHaveBeenCalledWith(55, {}));
  });

  it('deve avisar quando a chegada não é aceita ou falha', async () => {
    mockParams = { ...mockParams, status: 'in_transit' };
    mockMarkArrived
      .mockResolvedValueOnce({ success: false, error: 'Longe do local' })
      .mockResolvedValueOnce({ success: false })
      .mockRejectedValueOnce(new Error('offline'));
    const { getByText } = render(<DeslocamentoScreen />);

    fireEvent.press(getByText('Cheguei no Local 🎯'));
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith('Atenção', 'Longe do local'),
    );

    fireEvent.press(getByText('Cheguei no Local 🎯'));
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        'Atenção',
        'Erro ao confirmar chegada.',
      ),
    );

    fireEvent.press(getByText('Cheguei no Local 🎯'));
    await waitFor(() => expect(mockMarkArrived).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(alertSpy).toHaveBeenCalledTimes(3));
  });

  it('deve iniciar o serviço com o código no formato AB-12', async () => {
    mockParams = { ...mockParams, status: 'arrived' };
    const { getByText, findByText, UNSAFE_getAllByType } = render(
      <DeslocamentoScreen />,
    );

    fireEvent.press(getByText('Digitar Código do Cliente 🔐'));
    // Letras nas duas primeiras caixas e numeros nas duas ultimas.
    typeOtp(UNSAFE_getAllByType, ['a', 'b1', '1', '2']);
    const inputs = UNSAFE_getAllByType(TextInput).slice(-4);
    expect(inputs.map((i) => i.props.value)).toEqual(['A', 'B', '1', '2']);

    fireEvent.press(getByText('Confirmar e Iniciar Serviço'));

    await waitFor(() =>
      expect(mockStartService).toHaveBeenCalledWith(55, 'AB-12'),
    );
    expect(alertSpy).toHaveBeenCalledWith(
      'Serviço Iniciado! 🚀',
      expect.any(String),
    );
    expect(
      await findByText('Finalizar Atendimento (Check-out) 🏁'),
    ).toBeTruthy();
  });

  it('deve mostrar o erro quando o código é recusado', async () => {
    mockParams = { ...mockParams, status: 'arrived' };
    mockStartService
      .mockResolvedValueOnce({ success: false, error: 'Código expirado' })
      .mockResolvedValueOnce({ success: false })
      .mockRejectedValueOnce(new Error('offline'));
    const { getByText, findByText, UNSAFE_getAllByType } = render(
      <DeslocamentoScreen />,
    );

    fireEvent.press(getByText('Digitar Código do Cliente 🔐'));
    typeOtp(UNSAFE_getAllByType, ['A', 'B', '1', '2']);

    fireEvent.press(getByText('Confirmar e Iniciar Serviço'));
    expect(await findByText('Código expirado')).toBeTruthy();

    // Ao digitar de novo o erro some.
    typeOtp(UNSAFE_getAllByType, ['A']);
    fireEvent.press(getByText('Confirmar e Iniciar Serviço'));
    expect(await findByText('Código incorreto.')).toBeTruthy();

    fireEvent.press(getByText('Confirmar e Iniciar Serviço'));
    expect(
      await findByText(
        'Código incorreto. Peça o código de confirmação ao cliente.',
      ),
    ).toBeTruthy();
  });

  it('deve voltar para a caixa anterior ao apagar uma caixa vazia', () => {
    mockParams = { ...mockParams, status: 'arrived' };
    const { getByText, UNSAFE_getAllByType } = render(<DeslocamentoScreen />);

    fireEvent.press(getByText('Digitar Código do Cliente 🔐'));
    const inputs = UNSAFE_getAllByType(TextInput).slice(-4);
    const focus = jest.spyOn(inputs[0].instance, 'focus');

    act(() => {
      inputs[1].props.onKeyPress({ nativeEvent: { key: 'Backspace' } });
    });
    expect(focus).toHaveBeenCalled();
  });

  it('deve concluir o serviço no check-out e voltar ao confirmar', async () => {
    mockParams = { ...mockParams, status: 'in_progress' };
    const { getByText, findByText, UNSAFE_getAllByType } = render(
      <DeslocamentoScreen />,
    );

    fireEvent.press(getByText('Finalizar Atendimento (Check-out) 🏁'));
    expect(getByText('CHECK-OUT DO SERVIÇO')).toBeTruthy();
    typeOtp(UNSAFE_getAllByType, ['C', 'D', '3', '4']);
    fireEvent.press(getByText('Confirmar e Finalizar Serviço'));

    await waitFor(() =>
      expect(mockCompleteService).toHaveBeenCalledWith(55, 'CD-34'),
    );
    expect(await findByText('Voltar ao painel')).toBeTruthy();

    const buttons = alertSpy.mock.calls[0][2] as { onPress: () => void }[];
    buttons[0].onPress();
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('deve mostrar o erro do check-out', async () => {
    mockParams = { ...mockParams, status: 'in_progress' };
    mockCompleteService
      .mockResolvedValueOnce({ success: false, error: 'Código inválido' })
      .mockResolvedValueOnce({ success: false });
    const { getByText, findByText, UNSAFE_getAllByType } = render(
      <DeslocamentoScreen />,
    );

    fireEvent.press(getByText('Finalizar Atendimento (Check-out) 🏁'));
    typeOtp(UNSAFE_getAllByType, ['C', 'D', '3', '4']);
    fireEvent.press(getByText('Confirmar e Finalizar Serviço'));
    expect(await findByText('Código inválido')).toBeTruthy();

    fireEvent.press(getByText('Confirmar e Finalizar Serviço'));
    expect(await findByText('Código incorreto.')).toBeTruthy();
  });

  it('deve seguir o atendimento sem agendamento salvo', async () => {
    mockParams = { appointmentId: '', status: 'in_transit' };
    const { getByText, findByText, UNSAFE_getAllByType } = render(
      <DeslocamentoScreen />,
    );

    fireEvent.press(getByText('Cheguei no Local 🎯'));
    expect(await findByText('Confirmar e Iniciar Serviço')).toBeTruthy();
    expect(mockMarkArrived).not.toHaveBeenCalled();

    typeOtp(UNSAFE_getAllByType, ['A', 'B', '1', '2']);
    fireEvent.press(getByText('Confirmar e Iniciar Serviço'));
    expect(
      await findByText('Finalizar Atendimento (Check-out) 🏁'),
    ).toBeTruthy();
    expect(mockStartService).not.toHaveBeenCalled();

    fireEvent.press(getByText('Finalizar Atendimento (Check-out) 🏁'));
    typeOtp(UNSAFE_getAllByType, ['A', 'B', '1', '2']);
    fireEvent.press(getByText('Confirmar e Finalizar Serviço'));
    expect(await findByText('Voltar ao painel')).toBeTruthy();
    expect(mockCompleteService).not.toHaveBeenCalled();
  });

  it('deve abrir a lista de conversas pelo cabeçalho', () => {
    mockParams = { ...mockParams, status: 'in_transit' };
    const { UNSAFE_getAllByProps } = render(<DeslocamentoScreen />);

    const chatIcon = UNSAFE_getAllByProps({
      name: 'chatbubble-ellipses-outline',
    })[0];
    fireEvent.press(chatIcon);
    expect(mockNavigate).toHaveBeenCalledWith('ChatList');
  });

  it('deve abrir e fechar a escolha do app de mapa', () => {
    mockParams = { ...mockParams, status: 'in_transit' };
    const { getByText, queryByText } = render(<DeslocamentoScreen />);

    fireEvent.press(getByText('Mapa'));
    expect(getByText('Cancelar')).toBeTruthy();
    fireEvent.press(getByText('Cancelar'));
    expect(queryByText('Cancelar')).toBeNull();
  });

  it('deve avisar quando não há telefone para ligar', () => {
    mockParams = { ...mockParams, status: 'arrived' };
    const { getByText } = render(<DeslocamentoScreen />);

    fireEvent.press(getByText('Digitar Código do Cliente 🔐'));
    fireEvent.press(getByText('Não consegue o código? Ligar para o cliente'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Info',
      'Telefone do cliente não disponível.',
    );
  });
});
