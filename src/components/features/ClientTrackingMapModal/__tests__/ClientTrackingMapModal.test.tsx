import React from 'react';
import { Linking } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { ClientTrackingMapModal } from '../ClientTrackingMapModal';
import { Appointment, AppointmentStatus } from '@stores/Appointment/types';

type Callback = (event: Record<string, unknown>) => void;
const mockSocket: {
  id?: number | string;
  onLocation?: Callback;
  onProximity?: Callback;
  onArrived?: Callback;
} = {};

jest.mock('@hooks/useLocationSocket', () => ({
  useLocationSocket: (
    id: number | string,
    onLocation: Callback,
    onProximity: Callback,
    onArrived: Callback,
  ) => {
    Object.assign(mockSocket, { id, onLocation, onProximity, onArrived });
    return { connected: true, sendLocation: jest.fn(), sendArrived: jest.fn() };
  },
}));

jest.mock('../LiveTrackingMap', () => ({
  LiveTrackingMap: () => null,
}));

const DEST = { lat: -23.5, lng: -47.45 };

const buildAppointment = (overrides: Partial<Appointment> = {}): Appointment =>
  ({
    id: 10,
    numeric_id: 77,
    status: AppointmentStatus.IN_TRANSIT,
    verification_code: null,
    Service: { title: 'Limpeza residencial' },
    Professional: { User: { name: 'Bruno Prestador', phone: '15999990000' } },
    Address: { street: 'Rua A', number: '10', ...DEST },
    ...overrides,
  }) as unknown as Appointment;

const renderModal = (appointment: Appointment | null = buildAppointment()) => {
  const onClose = jest.fn();
  const utils = render(
    <ClientTrackingMapModal
      visible
      onClose={onClose}
      appointment={appointment}
    />,
  );
  return { ...utils, onClose };
};

describe('ClientTrackingMapModal', () => {
  it('não deve renderizar sem agendamento', () => {
    const { toJSON } = renderModal(null);

    expect(toJSON()).toBeNull();
  });

  it('deve aguardar a localização do prestador a caminho', () => {
    const { getByText } = renderModal();

    expect(mockSocket.id).toBe(77);
    expect(getByText('⏳ Aguardando localização do prestador...')).toBeTruthy();
    expect(getByText('Aguardando sinal GPS do prestador...')).toBeTruthy();
    expect(
      getByText('GPS em espera: Aguardando prestador iniciar rota'),
    ).toBeTruthy();
    expect(getByText('Profissional a caminho do seu endereço')).toBeTruthy();
    expect(getByText('Rua A, 10', { exact: false })).toBeTruthy();
    expect(getByText('Bruno Prestador')).toBeTruthy();
  });

  it('deve mostrar distância em km e tempo estimado com a posição ao vivo', () => {
    const { getByText, queryByText } = renderModal();

    act(() => mockSocket.onLocation?.({ latitude: -23.45, longitude: -47.45 }));

    expect(getByText('🚘 Transmitindo localização a cada 5s')).toBeTruthy();
    expect(getByText('5.6 km da sua casa')).toBeTruthy();
    expect(getByText('~19 min')).toBeTruthy();
    expect(
      getByText(/^GPS Ao Vivo: Lat -23\.45000 \| Lng -47\.45000/),
    ).toBeTruthy();
    expect(
      queryByText('🚘 Prestador a cerca de 5 minutos da sua casa!'),
    ).toBeNull();
  });

  it('deve avisar quando o prestador está perto, em metros', () => {
    const { getByText } = renderModal();

    act(() =>
      mockSocket.onLocation?.({ latitude: -23.501, longitude: -47.45 }),
    );

    expect(getByText('111 metros da sua casa')).toBeTruthy();
    expect(
      getByText('🚘 Prestador a cerca de 5 minutos da sua casa!'),
    ).toBeTruthy();
  });

  it('deve ignorar atualização sem coordenadas', () => {
    const { getByText } = renderModal();

    act(() => mockSocket.onLocation?.({ latitude: 0, longitude: 0 }));

    expect(getByText('Aguardando sinal GPS do prestador...')).toBeTruthy();
  });

  it('deve exibir o alerta de proximidade enviado pelo servidor', () => {
    const { getByText } = renderModal();

    act(() => mockSocket.onProximity?.({ message: 'Chegando em 3 min' }));
    expect(getByText('Chegando em 3 min')).toBeTruthy();
  });

  it('deve usar o texto padrão quando o alerta vem sem mensagem', () => {
    const { getByText } = renderModal();

    act(() => mockSocket.onProximity?.({}));
    expect(
      getByText('🚘 Prestador a cerca de 5 minutos da sua casa!'),
    ).toBeTruthy();
  });

  it('deve mostrar a chegada e o código de confirmação', () => {
    const { getByText } = renderModal();

    act(() => mockSocket.onArrived?.({}));

    expect(
      getByText('🎯 Prestador no local (Rastreamento encerrado)'),
    ).toBeTruthy();
    expect(getByText('Prestador no local!')).toBeTruthy();
    expect(getByText('Profissional chegou na sua casa! 🎯')).toBeTruthy();
    expect(getByText('CÓDIGO DE CONFIRMAÇÃO DO SERVIÇO')).toBeTruthy();
    expect(getByText('----')).toBeTruthy();
  });

  it('deve mostrar o serviço em andamento com o código recebido', () => {
    const { getByText } = renderModal(
      buildAppointment({
        status: AppointmentStatus.IN_PROGRESS,
        verification_code: '4821',
      }),
    );

    expect(getByText('⚡ Atendimento em andamento')).toBeTruthy();
    expect(getByText('Serviço em andamento ⚡')).toBeTruthy();
    expect(getByText('4821')).toBeTruthy();
  });

  it('deve usar textos padrão e o destino de reserva sem dados', () => {
    const { getByText, queryByText } = renderModal(
      buildAppointment({
        numeric_id: undefined,
        status: undefined,
        Address: null,
        Service: undefined,
        Professional: undefined,
      } as unknown as Partial<Appointment>),
    );

    expect(mockSocket.id).toBe(10);
    expect(getByText('Prestador')).toBeTruthy();
    expect(getByText('Serviço Agendado')).toBeTruthy();
    expect(getByText(/^Endereço,/)).toBeTruthy();
    expect(queryByText('CÓDIGO DE CONFIRMAÇÃO DO SERVIÇO')).toBeNull();
  });

  it('deve ligar para o prestador', () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const { UNSAFE_getAllByProps } = renderModal();

    const [callButton] = UNSAFE_getAllByProps({ name: 'call' });
    fireEvent.press(callButton);

    expect(openURL).toHaveBeenCalledWith('tel:15999990000');
    openURL.mockRestore();
  });

  it('deve fechar pelo botão inferior', () => {
    const { getByText, onClose } = renderModal();

    fireEvent.press(getByText('Fechar Acompanhamento'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
