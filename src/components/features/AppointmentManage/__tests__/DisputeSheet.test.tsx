import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { DisputeSheet } from '../DisputeSheet';
import { useAppointmentStore } from '@stores/Appointment';
import { Appointment, AppointmentStatus } from '@stores/Appointment/types';

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

describe('DisputeSheet', () => {
  let openDispute: jest.Mock;

  beforeEach(() => {
    openDispute = jest.fn(() => Promise.resolve());
    useAppointmentStore.setState({ openDispute });
  });

  it('deve exigir uma descrição mínima', async () => {
    const { getByRole, findByText } = render(
      <DisputeSheet
        visible
        appointment={buildAppointment({ status: AppointmentStatus.COMPLETED })}
        {...sheetHandlers()}
      />,
    );

    await act(async () => {
      fireEvent.press(getByRole('button', { name: 'Enviar disputa' }));
    });

    expect(
      await findByText('Descreva o que aconteceu (mínimo de 10 caracteres).'),
    ).toBeTruthy();
    expect(openDispute).not.toHaveBeenCalled();
  });

  it('deve enviar a disputa com o motivo escolhido', async () => {
    const handlers = sheetHandlers();
    const { getByRole, getByLabelText } = render(
      <DisputeSheet
        visible
        appointment={buildAppointment({ status: AppointmentStatus.COMPLETED })}
        {...handlers}
      />,
    );

    fireEvent.press(getByRole('button', { name: 'Cobrança incorreta' }));
    fireEvent.changeText(
      getByLabelText('Descrição da disputa'),
      '  Cobraram o dobro do combinado  ',
    );
    await act(async () => {
      fireEvent.press(getByRole('button', { name: 'Enviar disputa' }));
    });

    expect(openDispute).toHaveBeenCalledWith(10, {
      reason: 'wrong_charge',
      description: 'Cobraram o dobro do combinado',
    });
    expect(handlers.onDone).toHaveBeenCalledWith(
      'Disputa aberta. Nossa equipe vai analisar e você será avisado.',
    );
    expect(handlers.onClose).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar o erro da API ao abrir a disputa', async () => {
    openDispute.mockRejectedValue(apiError('Disputa já aberta'));
    const { getByRole, getByLabelText, findByText } = render(
      <DisputeSheet
        visible
        appointment={buildAppointment({ status: AppointmentStatus.NO_SHOW })}
        {...sheetHandlers()}
      />,
    );

    expect(getByRole('button', { name: 'Eu compareci' })).toBeTruthy();
    fireEvent.changeText(
      getByLabelText('Descrição da disputa'),
      'Eu estava em casa no horário',
    );
    await act(async () => {
      fireEvent.press(getByRole('button', { name: 'Enviar disputa' }));
    });

    expect(await findByText('Disputa já aberta')).toBeTruthy();
  });
});
