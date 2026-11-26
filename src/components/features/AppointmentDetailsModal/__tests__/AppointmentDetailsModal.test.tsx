import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { AppointmentDetailsModal } from '../AppointmentDetailsModal';
import { Appointment, AppointmentStatus } from '@stores/Appointment/types';
import { useUserStore } from '@stores/User';

const mockPanelProps: { role?: string; onChanged?: () => void } = {};

jest.mock('@components/features/AppointmentManage', () => ({
  AppointmentManagePanel: (props: { role: string; onChanged: () => void }) => {
    Object.assign(mockPanelProps, props);
    return null;
  },
}));

jest.mock(
  '@components/features/ClientTrackingMapModal/ClientTrackingMapModal',
  () => {
    const { Text: RNText, Pressable } = jest.requireActual('react-native');
    const ReactActual = jest.requireActual('react');
    return {
      ClientTrackingMapModal: ({
        visible,
        onClose,
      }: {
        visible: boolean;
        onClose: () => void;
      }) =>
        visible
          ? ReactActual.createElement(
              Pressable,
              { onPress: onClose },
              ReactActual.createElement(RNText, null, 'mapa-aberto'),
            )
          : null,
    };
  },
);

const buildAppointment = (overrides: Partial<Appointment> = {}): Appointment =>
  ({
    id: '6BDOKZ',
    professional_id: 3,
    client_id: 31,
    status: AppointmentStatus.CONFIRMED,
    start_time: '2026-11-25T13:00:00.000Z',
    end_time: '2026-11-25T14:00:00.000Z',
    payment_method: 'Pix',
    verification_code: '4821',
    Service: {
      title: 'Limpeza residencial',
      price: '150.5',
      Subcategory: { name: 'Limpeza' },
    },
    Client: { User: { name: 'Cliente Teste', avatar_uri: 'https://x/c.png' } },
    Professional: { User: { name: 'Prestador Teste', avatar_uri: null } },
    Address: {
      street: 'Rua A',
      number: '10',
      complement: 'Apto 2',
      neighborhood: 'Centro',
      city: 'Sorocaba',
      state: 'SP',
      postal_code: '18000-000',
    },
    ...overrides,
  }) as unknown as Appointment;

const renderModal = (appointment: Appointment | null) => {
  const onClose = jest.fn();
  const onChanged = jest.fn();
  const utils = render(
    <AppointmentDetailsModal
      visible
      appointment={appointment}
      onClose={onClose}
      onChanged={onChanged}
    />,
  );
  return { ...utils, onClose, onChanged };
};

describe('AppointmentDetailsModal', () => {
  beforeEach(() => {
    useUserStore.setState({
      user: { id: 31, client_id: 31, name: 'Cliente Teste' },
    } as never);
  });

  it('não deve renderizar sem agendamento', () => {
    const { toJSON } = renderModal(null);

    expect(toJSON()).toBeNull();
  });

  it('deve mostrar os detalhes completos para o cliente', () => {
    const { getByText, getAllByText } = renderModal(buildAppointment());

    expect(getByText('#6BDOKZ')).toBeTruthy();
    expect(getAllByText('Limpeza').length).toBeGreaterThan(0);
    expect(getAllByText('Prestador Teste').length).toBeGreaterThan(0);
    expect(
      getByText('Rua A, 10 (Apto 2) - Centro, Sorocaba/SP - CEP 18000-000'),
    ).toBeTruthy();
    expect(getByText('Pix')).toBeTruthy();
    expect(getByText('R$ 150,50')).toBeTruthy();
    expect(getByText('Confirmado pelo prestador')).toBeTruthy();
    expect(mockPanelProps.role).toBe('client');
  });

  it('deve usar o cliente no cabeçalho e o papel de profissional', () => {
    useUserStore.setState({
      user: { id: 3, professional_id: 3, name: 'Prestador Teste' },
    } as never);
    const { getAllByText, queryByText } = renderModal(
      buildAppointment({ status: AppointmentStatus.IN_TRANSIT }),
    );

    expect(getAllByText('Cliente Teste').length).toBeGreaterThan(0);
    expect(mockPanelProps.role).toBe('professional');
    // O código de início é só do cliente.
    expect(queryByText('CÓDIGO DE INÍCIO DO SERVIÇO')).toBeNull();
    expect(queryByText('Acompanhar o profissional no mapa')).toBeNull();
  });

  it('deve usar textos padrão quando faltam dados', () => {
    const { getByText, getAllByText } = renderModal(
      buildAppointment({
        Service: undefined,
        Client: undefined,
        Professional: undefined,
        Address: null,
        payment_method: undefined,
      } as unknown as Partial<Appointment>),
    );

    expect(getByText('Endereço não informado')).toBeTruthy();
    expect(getByText('Cartão de Crédito')).toBeTruthy();
    expect(getAllByText('N/A').length).toBe(5);
    expect(getByText('Serviço')).toBeTruthy();
  });

  it('deve montar o endereço sem complemento nem CEP', () => {
    const { getByText } = renderModal(
      buildAppointment({
        Address: {
          street: 'Rua B',
          number: '5',
          complement: null,
          neighborhood: 'Vila',
          city: 'Itu',
          state: 'SP',
          postal_code: '',
        },
      } as unknown as Partial<Appointment>),
    );

    expect(getByText('Rua B, 5 - Vila, Itu/SP')).toBeTruthy();
  });

  it.each([
    [AppointmentStatus.PENDING, 'Pendente'],
    [AppointmentStatus.ARRIVED, 'Profissional no local'],
    [AppointmentStatus.IN_PROGRESS, 'Serviço em andamento'],
    [AppointmentStatus.COMPLETED, 'Concluído'],
    [AppointmentStatus.CANCELED, 'Cancelado'],
    [AppointmentStatus.NO_SHOW, 'Cliente não compareceu'],
    ['desconhecido', 'desconhecido'],
  ])('deve traduzir o status %s', (status, label) => {
    const { getByText } = renderModal(
      buildAppointment({ status: status as AppointmentStatus }),
    );

    expect(getByText(label)).toBeTruthy();
  });

  it('deve mostrar o código de início e abrir o mapa a caminho', () => {
    const { getByText, queryByText } = renderModal(
      buildAppointment({ status: AppointmentStatus.IN_TRANSIT }),
    );

    expect(getByText('Profissional a caminho')).toBeTruthy();
    expect(getByText('CÓDIGO DE INÍCIO DO SERVIÇO')).toBeTruthy();
    expect(getByText('4821')).toBeTruthy();

    fireEvent.press(getByText('Acompanhar o profissional no mapa'));
    expect(getByText('mapa-aberto')).toBeTruthy();

    fireEvent.press(getByText('mapa-aberto'));
    expect(queryByText('mapa-aberto')).toBeNull();
  });

  it('deve mostrar "----" sem código durante o atendimento', () => {
    const { getByText, queryByText } = renderModal(
      buildAppointment({
        status: AppointmentStatus.IN_PROGRESS,
        verification_code: null,
      }),
    );

    expect(getByText('----')).toBeTruthy();
    expect(queryByText('Acompanhar o profissional no mapa')).toBeNull();
  });

  it('deve fechar e repassar mudanças do painel', () => {
    const { getByText, onClose, onChanged } = renderModal(buildAppointment());

    fireEvent.press(getByText('Fechar'));
    mockPanelProps.onChanged?.();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onChanged).toHaveBeenCalledTimes(1);
  });
});
