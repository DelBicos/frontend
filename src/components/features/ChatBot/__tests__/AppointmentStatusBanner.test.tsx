import React from 'react';
import { Platform } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { AppointmentStatusBanner } from '../ChatWindow/AppointmentStatusBanner';
import { ChatBotContext } from '@stores/ChatBot/types';
import { localDateTimeInTimeZoneToISO } from '@lib/helpers/datetime';

const mockNavigate = jest.fn();
let mockIsReady = true;

jest.mock('@screens/navigationRef', () => ({
  navigationRef: {
    isReady: () => mockIsReady,
    navigate: (...args: unknown[]) => mockNavigate(...args),
  },
}));

const context: ChatBotContext = {
  professionalId: 3,
  professionalName: 'Bruno Prestador',
  serviceId: 9,
  date: '2026-12-01',
  time: '14:00',
};

const renderBanner = (
  props: Partial<React.ComponentProps<typeof AppointmentStatusBanner>> = {},
) => {
  const onClose = jest.fn();
  const utils = render(
    <AppointmentStatusBanner
      appointmentId={55}
      appointmentStatus="pending"
      appointmentPaid={false}
      conversationContext={context}
      onClose={onClose}
      {...props}
    />,
  );
  return { ...utils, onClose };
};

const setOS = (os: string) =>
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });

describe('AppointmentStatusBanner', () => {
  const previousOS = Platform.OS;

  beforeEach(() => {
    jest.useFakeTimers();
    mockNavigate.mockClear();
    mockIsReady = true;
  });

  afterEach(() => {
    jest.useRealTimers();
    setOS(previousOS);
  });

  it.each<[string, string, boolean]>([
    [
      'pending',
      'Agendamento criado! Efetue o pagamento para prosseguir.',
      false,
    ],
    ['pending', 'Pagamento efetuado! Aguardando aceite do prestador...', true],
    [
      'confirmed',
      'Agendamento aceito! Efetue o pagamento para finalizar.',
      false,
    ],
    ['confirmed', '🎉 Tudo pronto! Agendamento pago e confirmado.', true],
    ['canceled', 'Este agendamento foi cancelado ou recusado.', false],
  ])('deve mostrar o status %s (pago: %s)', (status, text, paid) => {
    const { getByText } = renderBanner({
      appointmentStatus: status,
      appointmentPaid: paid,
    });

    expect(getByText(text)).toBeTruthy();
  });

  it('deve esconder "Pagar" quando pago ou cancelado', () => {
    const paid = renderBanner({ appointmentPaid: true });
    expect(paid.queryByLabelText('Pagar agendamento')).toBeNull();
    paid.unmount();

    const canceled = renderBanner({ appointmentStatus: 'canceled' });
    expect(canceled.queryByLabelText('Pagar agendamento')).toBeNull();
  });

  it('deve fechar o chat e abrir o checkout com os dados da conversa', () => {
    const { getByLabelText, onClose } = renderBanner();

    fireEvent.press(getByLabelText('Pagar agendamento'));
    expect(onClose).toHaveBeenCalledTimes(1);
    jest.runAllTimers();

    expect(mockNavigate).toHaveBeenCalledWith('Checkout', {
      professionalId: 3,
      selectedTime: localDateTimeInTimeZoneToISO('2026-12-01', '14:00'),
      serviceId: 9,
      appointmentId: '55',
      imageUrl: undefined,
      professionalName: 'Bruno Prestador',
    });
  });

  it('deve priorizar a nova data do reagendamento no checkout', () => {
    const { getByLabelText } = renderBanner({
      conversationContext: {
        ...context,
        newDate: '2026-12-05',
        newTime: '09:30',
      },
    });

    fireEvent.press(getByLabelText('Pagar agendamento'));
    jest.runAllTimers();

    expect(mockNavigate).toHaveBeenCalledWith(
      'Checkout',
      expect.objectContaining({
        selectedTime: localDateTimeInTimeZoneToISO('2026-12-05', '09:30'),
      }),
    );
  });

  it('deve usar só a data ou vazio quando falta o horário', () => {
    const onlyDate = renderBanner({
      conversationContext: { selectedDate: '2026-12-07' },
    });
    fireEvent.press(onlyDate.getByLabelText('Pagar agendamento'));
    jest.runAllTimers();
    expect(mockNavigate).toHaveBeenLastCalledWith(
      'Checkout',
      expect.objectContaining({
        selectedTime: '2026-12-07',
        professionalId: 0,
        serviceId: 0,
      }),
    );
    onlyDate.unmount();

    const empty = renderBanner({
      conversationContext: null,
      onClose: undefined,
    });
    fireEvent.press(empty.getByLabelText('Pagar agendamento'));
    jest.runAllTimers();
    expect(mockNavigate).toHaveBeenLastCalledWith(
      'Checkout',
      expect.objectContaining({ selectedTime: '' }),
    );
  });

  it('deve abrir a agenda quando tudo está pago e confirmado', () => {
    const { getByLabelText, onClose } = renderBanner({
      appointmentStatus: 'confirmed',
      appointmentPaid: true,
    });

    fireEvent.press(getByLabelText('Ver agendamento'));
    jest.runAllTimers();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('MySchedules');
  });

  describe('na web sem o navegador pronto', () => {
    let location: { href: string };

    beforeEach(() => {
      mockIsReady = false;
      setOS('web');
      location = { href: '' };
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: location,
      });
    });

    it('deve ir para a rota de checkout com a consulta montada', () => {
      const { getByLabelText } = renderBanner();

      fireEvent.press(getByLabelText('Pagar agendamento'));
      jest.runAllTimers();

      const selected = encodeURIComponent(
        localDateTimeInTimeZoneToISO('2026-12-01', '14:00'),
      );
      expect(location.href).toBe(
        `/checkout?professionalId=3&selectedTime=${selected}&serviceId=9&appointmentId=55&imageUrl=&professionalName=Bruno%20Prestador`,
      );
    });

    it('deve ir para a rota da agenda', () => {
      const { getByLabelText } = renderBanner({
        appointmentStatus: 'confirmed',
        appointmentPaid: true,
      });

      fireEvent.press(getByLabelText('Ver agendamento'));
      jest.runAllTimers();

      expect(location.href).toBe('/profile?subroute=MeusAgendamentos');
    });
  });
});
