import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import AgendaCard from '../AgendaCard';
import { Appointment, AppointmentStatus } from '@stores/Appointment/types';
import { AgendaRole } from '@lib/appointments';

let mockIsCompact = false;
jest.mock('@lib/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ isCompact: mockIsCompact }),
}));

const HOUR = 60 * 60 * 1000;
const future = (hours: number) =>
  new Date(Date.now() + hours * HOUR).toISOString();

const buildAppointment = (overrides: Partial<Appointment> = {}): Appointment =>
  ({
    id: 10,
    professional_id: 3,
    client_id: 31,
    status: AppointmentStatus.CONFIRMED,
    start_time: future(24),
    end_time: future(25),
    rating: null,
    payment_intent_id: 'pi_1',
    Service: { title: 'Limpeza residencial', price: '150.00' },
    Client: { User: { name: 'ana cliente', avatar_uri: null } },
    Professional: {
      User: { name: 'Bruno Prestador', avatar_uri: 'https://x/avatar.png' },
    },
    Address: { neighborhood: 'Centro', city: 'Sorocaba' },
    ...overrides,
  }) as unknown as Appointment;

const renderCard = (
  appointment: Appointment,
  role: AgendaRole,
  props: Partial<React.ComponentProps<typeof AgendaCard>> = {},
) => {
  const onOpenDetails = jest.fn();
  const utils = render(
    <AgendaCard
      appointment={appointment}
      role={role}
      onOpenDetails={onOpenDetails}
      {...props}
    />,
  );
  return { ...utils, onOpenDetails };
};

describe('AgendaCard', () => {
  beforeEach(() => {
    mockIsCompact = false;
  });

  it('deve mostrar serviço, profissional, preço e abrir os detalhes', () => {
    const { getByText, getByLabelText, onOpenDetails } = renderCard(
      buildAppointment(),
      'client',
    );

    expect(getByText('Limpeza residencial')).toBeTruthy();
    expect(getByText('Profissional: Bruno Prestador')).toBeTruthy();
    expect(getByText('R$ 150,00', { exact: false })).toBeTruthy();
    expect(getByText('Confirmado')).toBeTruthy();

    fireEvent.press(
      getByLabelText(
        /^Limpeza residencial com Bruno Prestador, .*Ver detalhes$/,
      ),
    );
    expect(onOpenDetails).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar a inicial do cliente e o bairro para o profissional', () => {
    const { getByText } = renderCard(buildAppointment(), 'professional', {
      showDate: true,
    });

    expect(getByText('A')).toBeTruthy();
    expect(getByText('Cliente: ana cliente')).toBeTruthy();
    expect(getByText('Centro, Sorocaba')).toBeTruthy();
  });

  it('deve usar nomes genéricos quando faltam dados', () => {
    const { getByText } = renderCard(
      buildAppointment({
        Service: undefined,
        Client: undefined,
        Address: null,
        final_price: null,
      } as unknown as Partial<Appointment>),
      'professional',
    );

    expect(getByText('Serviço')).toBeTruthy();
    expect(getByText('Cliente: Cliente')).toBeTruthy();
  });

  it.each<[string, Partial<Appointment>, AgendaRole]>([
    [
      'Expirado',
      {
        status: AppointmentStatus.PENDING,
        start_time: future(-3),
        end_time: future(-2),
      },
      'client',
    ],
    [
      'Reagendamento enviado',
      {
        reschedule_requested_start: future(48),
        reschedule_requested_by: 'client',
      },
      'client',
    ],
    [
      'Reagendamento pedido',
      {
        status: AppointmentStatus.PENDING,
        reschedule_requested_start: future(48),
        reschedule_requested_by: 'professional',
      },
      'client',
    ],
    ['Pagamento pendente', { payment_intent_id: null }, 'client'],
    [
      'Aguardando sua resposta',
      { status: AppointmentStatus.PENDING },
      'professional',
    ],
    [
      'Aguardando o profissional',
      { status: AppointmentStatus.PENDING },
      'client',
    ],
    [
      'Falta concluir',
      { start_time: future(-3), end_time: future(-2) },
      'professional',
    ],
    [
      'Aguardando conclusão',
      { start_time: future(-3), end_time: future(-2) },
      'client',
    ],
    [
      'Profissional a caminho',
      { status: AppointmentStatus.IN_TRANSIT },
      'client',
    ],
    ['Profissional no local', { status: AppointmentStatus.ARRIVED }, 'client'],
    ['Em andamento', { status: AppointmentStatus.IN_PROGRESS }, 'client'],
    ['Concluído', { status: AppointmentStatus.COMPLETED }, 'client'],
    [
      'Cliente não compareceu',
      { status: AppointmentStatus.NO_SHOW },
      'professional',
    ],
    ['Não compareceu', { status: AppointmentStatus.NO_SHOW }, 'client'],
    ['Cancelado', { status: AppointmentStatus.CANCELED }, 'client'],
  ])('deve mostrar o selo "%s"', (label, overrides, role) => {
    const { getByText } = renderCard(buildAppointment(overrides), role);

    expect(getByText(label)).toBeTruthy();
  });

  it('deve aceitar o pedido mostrando carregamento enquanto responde', async () => {
    let resolve: () => void = () => {};
    const onAccept = jest.fn(() => new Promise<void>((r) => (resolve = r)));
    const onDecline = jest.fn(() => Promise.resolve());
    const { getByLabelText, queryByText } = renderCard(
      buildAppointment({ status: AppointmentStatus.PENDING }),
      'professional',
      { onAccept, onDecline },
    );

    fireEvent.press(getByLabelText('Aceitar: Limpeza residencial'));
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(queryByText('Aceitar')).toBeNull();

    // Enquanto responde, os demais botões ficam bloqueados.
    fireEvent.press(getByLabelText('Recusar: Limpeza residencial'));
    expect(onDecline).not.toHaveBeenCalled();

    await act(async () => resolve());
    expect(queryByText('Aceitar')).toBeTruthy();
  });

  it('deve recusar o pedido', async () => {
    const onDecline = jest.fn(() => Promise.resolve());
    const { getByLabelText, findByText } = renderCard(
      buildAppointment({ status: AppointmentStatus.PENDING }),
      'professional',
      { onDecline },
    );

    await act(async () => {
      fireEvent.press(getByLabelText('Recusar: Limpeza residencial'));
    });

    expect(onDecline).toHaveBeenCalledTimes(1);
    expect(await findByText('Recusar')).toBeTruthy();
  });

  it('não deve fazer nada quando a ação de resposta não foi informada', async () => {
    const { getByLabelText, getByText } = renderCard(
      buildAppointment({ status: AppointmentStatus.PENDING }),
      'professional',
    );

    await act(async () => {
      fireEvent.press(getByLabelText('Aceitar: Limpeza residencial'));
    });

    expect(getByText('Aceitar')).toBeTruthy();
  });

  it('deve permitir concluir o atendimento já iniciado', async () => {
    const onComplete = jest.fn(() => Promise.resolve());
    const { getByLabelText } = renderCard(
      buildAppointment({ start_time: future(-1), end_time: future(1) }),
      'professional',
      { onComplete },
    );

    await act(async () => {
      fireEvent.press(
        getByLabelText('Concluir atendimento: Limpeza residencial'),
      );
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('deve oferecer o pagamento ao cliente sem pagamento', () => {
    mockIsCompact = true;
    const onPay = jest.fn();
    const { getByLabelText } = renderCard(
      buildAppointment({ payment_intent_id: null }),
      'client',
      { onPay },
    );

    fireEvent.press(getByLabelText('Pagar agora: Limpeza residencial'));

    expect(onPay).toHaveBeenCalledTimes(1);
  });

  it('deve oferecer avaliação e favorito em atendimentos concluídos', () => {
    const onRate = jest.fn();
    const onToggleFavorite = jest.fn();
    const { getByLabelText } = renderCard(
      buildAppointment({ status: AppointmentStatus.COMPLETED }),
      'client',
      { onRate, onToggleFavorite, isFavorite: false },
    );

    fireEvent.press(getByLabelText('Avaliar: Limpeza residencial'));
    expect(onRate).toHaveBeenCalledTimes(1);

    const favorite = getByLabelText('Favoritar Bruno Prestador');
    expect(favorite.props.accessibilityState).toEqual({ selected: false });
    fireEvent.press(favorite);
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it('deve oferecer editar avaliação e remover dos favoritos', () => {
    const { getByLabelText } = renderCard(
      buildAppointment({ status: AppointmentStatus.COMPLETED, rating: 5 }),
      'client',
      { onRate: jest.fn(), onToggleFavorite: jest.fn(), isFavorite: true },
    );

    expect(
      getByLabelText('Editar avaliação: Limpeza residencial'),
    ).toBeTruthy();
    expect(
      getByLabelText('Remover Bruno Prestador dos favoritos').props
        .accessibilityState,
    ).toEqual({ selected: true });
  });

  it('não deve mostrar ações para o cliente em atendimento confirmado e pago', () => {
    const { queryByRole } = renderCard(buildAppointment(), 'client', {
      onPay: jest.fn(),
      onRate: jest.fn(),
    });

    expect(queryByRole('button', { name: /Pagar agora/ })).toBeNull();
    expect(queryByRole('button', { name: /Avaliar/ })).toBeNull();
  });
});
