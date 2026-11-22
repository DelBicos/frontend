import React from 'react';
import { Image } from 'react-native';
import { render } from '@testing-library/react-native';
import { TicketMessageBubble } from '../TicketMessageBubble';
import { TicketMessage } from '@stores/Ticket/types';

const baseMessage: TicketMessage = {
  id: 1,
  ticket_id: 42,
  author: {
    id: 31,
    type: 'CLIENTE',
    name: 'Cliente Teste',
    avatar_uri: null,
  },
  content: 'O profissional não apareceu no horário.',
  attachment_url: null,
  created_at: '2026-11-22T19:25:17.091Z',
};

describe('TicketMessageBubble', () => {
  it('deve exibir autor, conteúdo e o tipo do autor em pt-BR', () => {
    const { getByText } = render(<TicketMessageBubble message={baseMessage} />);

    expect(getByText('Cliente Teste')).toBeTruthy();
    expect(getByText('Cliente')).toBeTruthy();
    expect(getByText('O profissional não apareceu no horário.')).toBeTruthy();
  });

  it('deve identificar mensagens do suporte', () => {
    const { getByText } = render(
      <TicketMessageBubble
        message={{
          ...baseMessage,
          author: { ...baseMessage.author, type: 'ADMIN', name: 'Ana' },
        }}
      />,
    );

    expect(getByText('Suporte DelBicos')).toBeTruthy();
  });

  it('deve identificar mensagens do prestador', () => {
    const { getByText } = render(
      <TicketMessageBubble
        message={{
          ...baseMessage,
          author: { ...baseMessage.author, type: 'PRESTADOR' },
        }}
      />,
    );

    expect(getByText('Prestador')).toBeTruthy();
  });

  it('deve exibir a data formatada', () => {
    const expected = new Date(baseMessage.created_at).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const { getByText } = render(<TicketMessageBubble message={baseMessage} />);

    expect(getByText(expected)).toBeTruthy();
  });

  it('deve usar a foto do autor quando houver', () => {
    const { UNSAFE_getByType } = render(
      <TicketMessageBubble
        message={{
          ...baseMessage,
          author: {
            ...baseMessage.author,
            avatar_uri: 'https://cdn.delbicos.test/avatar.png',
          },
        }}
      />,
    );

    expect(UNSAFE_getByType(Image).props.source).toEqual({
      uri: 'https://cdn.delbicos.test/avatar.png',
    });
  });

  it('não deve usar Image quando o autor não tiver foto', () => {
    const { UNSAFE_queryByType } = render(
      <TicketMessageBubble message={baseMessage} />,
    );

    expect(UNSAFE_queryByType(Image)).toBeNull();
  });

  it('deve indicar anexo só quando existir', () => {
    const { queryByText, rerender } = render(
      <TicketMessageBubble message={baseMessage} />,
    );
    expect(queryByText('Anexo disponível')).toBeNull();

    rerender(
      <TicketMessageBubble
        message={{
          ...baseMessage,
          attachment_url: 'https://cdn.delbicos.test/print.png',
        }}
      />,
    );
    expect(queryByText('Anexo disponível')).toBeTruthy();
  });
});
