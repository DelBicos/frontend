import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AppointmentDetailsModal } from '../AppointmentDetailsModal';
import { Appointment, AppointmentStatus } from '@stores/Appointment/types';
import { useUserStore } from '@stores/User';

// Fora do escopo destes testes: painel de ações e mapa de rastreamento.
jest.mock('@components/features/AppointmentManage', () => ({
  AppointmentManagePanel: () => null,
}));
jest.mock(
  '@components/features/ClientTrackingMapModal/ClientTrackingMapModal',
  () => ({ ClientTrackingMapModal: () => null }),
);

const HELP_LABEL = 'Preciso de ajuda com este agendamento';

const makeAppointment = (status: AppointmentStatus): Appointment =>
  ({
    id: '6BDOKZ',
    professional_id: 3,
    client_id: 31,
    status,
    start_time: '2026-11-25T13:00:00.000Z',
    end_time: '2026-11-25T14:00:00.000Z',
    Service: {
      title: 'Limpeza residencial',
      price: '150.00',
      Subcategory: { name: 'Limpeza' },
    },
    Client: { User: { name: 'Cliente Teste', avatar_uri: null } },
    Professional: { User: { name: 'Prestador Teste', avatar_uri: null } },
    Address: null,
  }) as unknown as Appointment;

describe('AppointmentDetailsModal — ajuda contextual', () => {
  beforeEach(() => {
    useUserStore.setState({
      user: { id: 31, client_id: 31, name: 'Cliente Teste' },
    } as never);
  });

  it('deve exibir o botão de ajuda quando onOpenHelp for informado', () => {
    const { getByText } = render(
      <AppointmentDetailsModal
        visible
        appointment={makeAppointment(AppointmentStatus.CONFIRMED)}
        onClose={jest.fn()}
        onOpenHelp={jest.fn()}
      />,
    );

    expect(getByText(HELP_LABEL)).toBeTruthy();
  });

  it('não deve exibir o botão sem onOpenHelp', () => {
    const { queryByText } = render(
      <AppointmentDetailsModal
        visible
        appointment={makeAppointment(AppointmentStatus.CONFIRMED)}
        onClose={jest.fn()}
      />,
    );

    expect(queryByText(HELP_LABEL)).toBeNull();
  });

  it('não deve exibir o botão para agendamento cancelado', () => {
    const { queryByText } = render(
      <AppointmentDetailsModal
        visible
        appointment={makeAppointment(AppointmentStatus.CANCELED)}
        onClose={jest.fn()}
        onOpenHelp={jest.fn()}
      />,
    );

    expect(queryByText(HELP_LABEL)).toBeNull();
  });

  it.each([
    AppointmentStatus.PENDING,
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.COMPLETED,
  ])('deve exibir o botão para agendamento %s', (status) => {
    const { getByText } = render(
      <AppointmentDetailsModal
        visible
        appointment={makeAppointment(status)}
        onClose={jest.fn()}
        onOpenHelp={jest.fn()}
      />,
    );

    expect(getByText(HELP_LABEL)).toBeTruthy();
  });

  it('deve chamar onOpenHelp com o agendamento e fechar o modal', () => {
    const onOpenHelp = jest.fn();
    const onClose = jest.fn();
    const appointment = makeAppointment(AppointmentStatus.CONFIRMED);
    const { getByLabelText } = render(
      <AppointmentDetailsModal
        visible
        appointment={appointment}
        onClose={onClose}
        onOpenHelp={onOpenHelp}
      />,
    );

    fireEvent.press(getByLabelText(HELP_LABEL));

    expect(onOpenHelp).toHaveBeenCalledWith(appointment);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
