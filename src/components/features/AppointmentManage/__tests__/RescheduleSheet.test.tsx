import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { RescheduleSheet } from '../RescheduleSheet';
import { useAppointmentStore } from '@stores/Appointment';
import { Appointment, AppointmentStatus } from '@stores/Appointment/types';
import {
  formatLongDate,
  minBookingDate,
  nextDays,
  slotDate,
} from '@lib/booking';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

const apiError = (message: string) =>
  Object.assign(new Error(message), {
    isAxiosError: true,
    response: { status: 400, data: { error: message } },
  });

const buildAppointment = (overrides: Partial<Appointment> = {}): Appointment =>
  ({
    id: 10,
    status: AppointmentStatus.CONFIRMED,
    start_time: '2030-01-10T13:00:00.000Z',
    end_time: '2030-01-10T14:00:00.000Z',
    payment_intent_id: 'pi_1',
    Service: { title: 'Limpeza residencial', price: '150.00' },
    ...overrides,
  }) as unknown as Appointment;

const sheetHandlers = () => ({ onClose: jest.fn(), onDone: jest.fn() });

const isDisabled = (node: { props: { accessibilityState?: { disabled?: boolean } } }) =>
  node.props.accessibilityState?.disabled;

describe('RescheduleSheet', () => {
  let getRescheduleSlots: jest.Mock;
  let requestReschedule: jest.Mock;
  const days = () => nextDays(minBookingDate(), 14);

  beforeEach(() => {
    getRescheduleSlots = jest.fn(() => Promise.resolve(['09:00', '10:00']));
    requestReschedule = jest.fn(() => Promise.resolve());
    useAppointmentStore.setState({ getRescheduleSlots, requestReschedule });
  });

  it('deve listar 14 dias e não mostrar horários antes da escolha', () => {
    const { getByLabelText, queryByText } = render(
      <RescheduleSheet
        visible
        appointment={buildAppointment()}
        {...sheetHandlers()}
      />,
    );

    expect(getByLabelText(formatLongDate(days()[0]))).toBeTruthy();
    expect(getByLabelText(formatLongDate(days()[13]))).toBeTruthy();
    expect(queryByText('Horário')).toBeNull();
    expect(getRescheduleSlots).not.toHaveBeenCalled();
  });

  it('deve carregar os horários do dia e enviar o pedido', async () => {
    const handlers = sheetHandlers();
    const day = days()[5];
    const { getByLabelText, getByRole, findByRole } = render(
      <RescheduleSheet
        visible
        appointment={buildAppointment()}
        {...handlers}
      />,
    );

    expect(isDisabled(getByRole('button', { name: 'Enviar pedido' }))).toBe(
      true,
    );

    await act(async () => {
      fireEvent.press(getByLabelText(formatLongDate(day)));
    });
    expect(getRescheduleSlots).toHaveBeenCalledWith(10, day);

    fireEvent.press(await findByRole('button', { name: '10:00' }));
    await act(async () => {
      fireEvent.press(getByRole('button', { name: 'Enviar pedido' }));
    });

    expect(requestReschedule).toHaveBeenCalledWith(
      10,
      slotDate(day, '10:00').toISOString(),
    );
    expect(handlers.onDone).toHaveBeenCalledWith(
      'Pedido enviado. Avisaremos quando a outra parte responder.',
    );
    expect(handlers.onClose).toHaveBeenCalledTimes(1);
  });

  it('deve avisar quando o dia não tem horários livres', async () => {
    getRescheduleSlots.mockResolvedValue([]);
    const { getByLabelText, findByText } = render(
      <RescheduleSheet
        visible
        appointment={buildAppointment()}
        {...sheetHandlers()}
      />,
    );

    await act(async () => {
      fireEvent.press(getByLabelText(formatLongDate(days()[3])));
    });

    expect(
      await findByText('Sem horários livres neste dia. Escolha outro dia.'),
    ).toBeTruthy();
  });

  it('deve mostrar o erro ao carregar os horários', async () => {
    getRescheduleSlots.mockRejectedValue(new Error('falhou'));
    const { getByLabelText, findByText } = render(
      <RescheduleSheet
        visible
        appointment={buildAppointment()}
        {...sheetHandlers()}
      />,
    );

    await act(async () => {
      fireEvent.press(getByLabelText(formatLongDate(days()[3])));
    });

    expect(
      await findByText('Não foi possível carregar os horários.'),
    ).toBeTruthy();
  });

  it('deve mostrar o erro ao enviar o pedido', async () => {
    requestReschedule.mockRejectedValue(apiError('Horário ocupado'));
    const handlers = sheetHandlers();
    const { getByLabelText, getByRole, findByRole, findByText } = render(
      <RescheduleSheet
        visible
        appointment={buildAppointment()}
        {...handlers}
      />,
    );

    await act(async () => {
      fireEvent.press(getByLabelText(formatLongDate(days()[5])));
    });
    fireEvent.press(await findByRole('button', { name: '09:00' }));
    await act(async () => {
      fireEvent.press(getByRole('button', { name: 'Enviar pedido' }));
    });

    expect(await findByText('Horário ocupado')).toBeTruthy();
    expect(handlers.onDone).not.toHaveBeenCalled();
  });
});
