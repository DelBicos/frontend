import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { MessageBubble } from '../ChatWindow/MessageBubble';
import { ChatBotMessage } from '@stores/ChatBot/types';

const appointment = {
  id: 55,
  serviceTitle: 'Limpeza residencial',
  professionalName: 'Bruno',
  startTime: '2026-12-01T13:00:00.000Z',
  endTime: '2026-12-01T14:00:00.000Z',
  price: 'R$ 150,00',
};

const botMessage = (
  overrides: Partial<ChatBotMessage> = {},
): ChatBotMessage => ({
  id: '1',
  role: 'bot',
  text: 'Agendamento criado',
  createdAt: '2026-11-26T10:00:00.000Z',
  ...overrides,
});

describe('MessageBubble', () => {
  it('deve mostrar a mensagem do assistente', () => {
    const { getByLabelText } = render(
      <MessageBubble
        message={botMessage()}
        onReschedule={jest.fn()}
        onCancel={jest.fn()}
        isActionPending={false}
      />,
    );

    expect(getByLabelText('Assistente: Agendamento criado')).toBeTruthy();
  });

  it('deve embutir o cartão do agendamento e repassar as ações', () => {
    const onReschedule = jest.fn();
    const onCancel = jest.fn();
    const message = botMessage({
      text: '',
      action: { type: 'confirm_appointment', appointment },
    });
    const { getByLabelText, queryByLabelText } = render(
      <MessageBubble
        message={message}
        onReschedule={onReschedule}
        onCancel={onCancel}
        isActionPending={false}
      />,
    );

    expect(
      getByLabelText('Agendamento confirmado: Limpeza residencial'),
    ).toBeTruthy();
    expect(queryByLabelText(/^Assistente:/)).toBeNull();

    fireEvent.press(getByLabelText('Alterar agendamento'));
    fireEvent.press(getByLabelText('Cancelar agendamento'));

    expect(onReschedule).toHaveBeenCalledWith(message.action);
    expect(onCancel).toHaveBeenCalledWith(message.action);
  });

  it('não deve mostrar o cartão em mensagens do usuário', () => {
    const { queryByLabelText } = render(
      <MessageBubble
        message={botMessage({
          role: 'user',
          action: { type: 'confirm_appointment', appointment },
        })}
        onReschedule={jest.fn()}
        onCancel={jest.fn()}
        isActionPending={false}
      />,
    );

    expect(
      queryByLabelText('Agendamento confirmado: Limpeza residencial'),
    ).toBeNull();
  });
});
