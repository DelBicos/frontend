import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ChatBotAppointmentCard } from '../ChatBotAppointmentCard';
import { ChatBotAppointmentData } from '@stores/ChatBot/types';

const appointment = (
  overrides: Partial<ChatBotAppointmentData> = {},
): ChatBotAppointmentData => ({
  id: 55,
  serviceTitle: 'Limpeza residencial',
  serviceDescription: 'Limpeza completa',
  categoryName: 'Casa',
  subcategoryName: 'Limpeza',
  professionalName: 'Bruno',
  professionalRating: 4.75,
  professionalRatingsCount: 8,
  professionalLocation: 'Sorocaba/SP',
  durationMinutes: 90,
  startTime: '2026-12-01T13:00:00.000Z',
  endTime: '2026-12-01T14:30:00.000Z',
  price: 'R$ 150,00',
  professionalAvatarUri: 'https://x/b.png',
  ...overrides,
});

describe('ChatBotAppointmentCard', () => {
  it('deve mostrar os dados do agendamento confirmado', () => {
    const { getByText, getByLabelText } = render(
      <ChatBotAppointmentCard
        appointment={appointment()}
        onReschedule={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(
      getByLabelText('Agendamento confirmado: Limpeza residencial'),
    ).toBeTruthy();
    expect(getByText('Bruno')).toBeTruthy();
    expect(getByText('Casa › Limpeza')).toBeTruthy();
    expect(getByText('4.8 (8) neste serviço')).toBeTruthy();
    expect(getByText('Confirmado')).toBeTruthy();
    expect(getByText('Limpeza completa')).toBeTruthy();
    expect(getByText(/^até /)).toBeTruthy();
    expect(getByText('R$ 150,00')).toBeTruthy();
    expect(getByText('Duração estimada: 90 minutos')).toBeTruthy();
    expect(getByText('Sorocaba/SP')).toBeTruthy();
  });

  it('deve repassar alterar e cancelar com o agendamento', () => {
    const onReschedule = jest.fn();
    const onCancel = jest.fn();
    const data = appointment();
    const { getByLabelText } = render(
      <ChatBotAppointmentCard
        appointment={data}
        onReschedule={onReschedule}
        onCancel={onCancel}
      />,
    );

    fireEvent.press(getByLabelText('Alterar agendamento'));
    fireEvent.press(getByLabelText('Cancelar agendamento'));

    expect(onReschedule).toHaveBeenCalledWith(data);
    expect(onCancel).toHaveBeenCalledWith(data);
  });

  it('deve bloquear as ações enquanto aguarda confirmação', () => {
    const onReschedule = jest.fn();
    const onCancel = jest.fn();
    const { getByLabelText } = render(
      <ChatBotAppointmentCard
        appointment={appointment()}
        onReschedule={onReschedule}
        onCancel={onCancel}
        disabled
      />,
    );

    fireEvent.press(getByLabelText('Alterar agendamento'));
    fireEvent.press(getByLabelText('Cancelar agendamento'));

    expect(onReschedule).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('deve mostrar a revisão de um agendamento ainda sem id', () => {
    const { getByText, queryByText, queryByLabelText } = render(
      <ChatBotAppointmentCard
        appointment={appointment({
          id: undefined,
          professionalAvatarUri: null,
          professionalRatingsCount: 0,
          subcategoryName: undefined,
          serviceDescription: null,
          endTime: '',
          price: '',
          durationMinutes: undefined,
          professionalLocation: null,
          startTime: '',
        })}
        onReschedule={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(getByText('Revisar')).toBeTruthy();
    expect(getByText('Novo neste serviço')).toBeTruthy();
    expect(getByText('Valor não disponível')).toBeTruthy();
    expect(queryByText(/^até /)).toBeNull();
    expect(queryByText(/Duração estimada/)).toBeNull();
    expect(queryByLabelText('Alterar agendamento')).toBeNull();
  });
});
