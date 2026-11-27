import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { CancelSheet } from '../CancelSheet';
import { useAppointmentStore } from '@stores/Appointment';
import {
  Appointment,
  AppointmentStatus,
  CancellationOutcome,
} from '@stores/Appointment/types';

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

const outcome: CancellationOutcome = {
  tier: 'free',
  retentionPercent: 0,
  retainedCents: 0,
  refundCents: 15000,
} as unknown as CancellationOutcome;

const sheetHandlers = () => ({ onClose: jest.fn(), onDone: jest.fn() });

const isDisabled = (node: {
  props: { accessibilityState?: { disabled?: boolean } };
}) => node.props.accessibilityState?.disabled;

describe('CancelSheet', () => {
  let previewCancellation: jest.Mock;
  let cancelAppointment: jest.Mock;

  beforeEach(() => {
    previewCancellation = jest.fn(() => Promise.resolve(outcome));
    cancelAppointment = jest.fn(() => Promise.resolve({}));
    useAppointmentStore.setState({ previewCancellation, cancelAppointment });
  });

  it('não deve calcular nada enquanto fechado', () => {
    render(
      <CancelSheet
        visible={false}
        appointment={buildAppointment()}
        role="client"
        {...sheetHandlers()}
      />,
    );

    expect(previewCancellation).not.toHaveBeenCalled();
  });

  it('deve mostrar a política com os valores e cancelar com o motivo', async () => {
    const handlers = sheetHandlers();
    const { findByText, getByLabelText, getByRole } = render(
      <CancelSheet
        visible
        appointment={buildAppointment()}
        role="client"
        {...handlers}
      />,
    );

    expect(previewCancellation).toHaveBeenCalledWith(10);
    expect(await findByText(/Cancelamento gratuito/)).toBeTruthy();

    fireEvent.changeText(getByLabelText('Motivo do cancelamento'), 'Viagem');
    await act(async () => {
      fireEvent.press(getByRole('button', { name: 'Cancelar agendamento' }));
    });

    expect(cancelAppointment).toHaveBeenCalledWith(10, 'Viagem');
    expect(handlers.onDone).toHaveBeenCalledWith('Agendamento cancelado.');
    expect(handlers.onClose).toHaveBeenCalledTimes(1);
  });

  it('deve bloquear o cancelamento enquanto calcula o valor', () => {
    previewCancellation.mockReturnValue(new Promise(() => {}));
    const { getByRole } = render(
      <CancelSheet
        visible
        appointment={buildAppointment()}
        role="client"
        {...sheetHandlers()}
      />,
    );

    expect(
      isDisabled(getByRole('button', { name: 'Cancelar agendamento' })),
    ).toBe(true);
  });

  it('deve mostrar o erro ao calcular o valor', async () => {
    previewCancellation.mockRejectedValue(apiError('Prazo encerrado'));
    const { findByText } = render(
      <CancelSheet
        visible
        appointment={buildAppointment()}
        role="client"
        {...sheetHandlers()}
      />,
    );

    expect(await findByText('Prazo encerrado')).toBeTruthy();
  });

  it('deve mostrar o erro ao cancelar e manter a folha aberta', async () => {
    cancelAppointment.mockRejectedValue(new Error('falhou'));
    const handlers = sheetHandlers();
    const { findByText, getByRole } = render(
      <CancelSheet
        visible
        appointment={buildAppointment({ payment_intent_id: null })}
        role="professional"
        {...handlers}
      />,
    );

    expect(await findByText(/não há nenhuma cobrança/)).toBeTruthy();
    await act(async () => {
      fireEvent.press(getByRole('button', { name: 'Cancelar agendamento' }));
    });

    expect(
      await findByText('Não foi possível cancelar. Tente novamente.'),
    ).toBeTruthy();
    expect(handlers.onDone).not.toHaveBeenCalled();
  });

  it('deve fechar ao tocar em "Voltar"', () => {
    const handlers = sheetHandlers();
    const { getByRole } = render(
      <CancelSheet
        visible
        appointment={buildAppointment()}
        role="client"
        {...handlers}
      />,
    );

    fireEvent.press(getByRole('button', { name: 'Voltar' }));

    expect(handlers.onClose).toHaveBeenCalled();
  });
});
