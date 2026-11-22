import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TicketCard } from '../TicketCard';
import { Ticket } from '@stores/Ticket/types';

const mockTicket: Ticket = {
  id: 1,
  ticket_code: 'TKT-A7F3',
  title: 'Erro ao agendar serviço',
  category: 'AGENDAMENTO',
  priority: null,
  status: 'ABERTO',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('TicketCard', () => {
  it('deve renderizar o código do ticket', () => {
    const { getByText } = render(
      <TicketCard ticket={mockTicket} onPress={jest.fn()} />,
    );
    expect(getByText('TKT-A7F3')).toBeTruthy();
  });

  it('deve renderizar o título', () => {
    const { getByText } = render(
      <TicketCard ticket={mockTicket} onPress={jest.fn()} />,
    );
    expect(getByText('Erro ao agendar serviço')).toBeTruthy();
  });

  it('deve renderizar a categoria em pt-BR', () => {
    const { getByText } = render(
      <TicketCard ticket={mockTicket} onPress={jest.fn()} />,
    );
    expect(getByText('Agendamento')).toBeTruthy();
  });

  it('deve renderizar o status atual', () => {
    const { getByText } = render(
      <TicketCard
        ticket={{ ...mockTicket, status: 'EM_ATENDIMENTO' }}
        onPress={jest.fn()}
      />,
    );
    expect(getByText('Em atendimento')).toBeTruthy();
  });

  it('deve ter rótulo de acessibilidade com código e título', () => {
    const { getByRole } = render(
      <TicketCard ticket={mockTicket} onPress={jest.fn()} />,
    );
    expect(getByRole('button').props.accessibilityLabel).toBe(
      'Chamado TKT-A7F3: Erro ao agendar serviço',
    );
  });

  describe('tempo relativo', () => {
    const HOUR = 60 * 60 * 1000;
    const renderAt = (msAgo: number) =>
      render(
        <TicketCard
          ticket={{
            ...mockTicket,
            created_at: new Date(Date.now() - msAgo).toISOString(),
          }}
          onPress={jest.fn()}
        />,
      );

    it('deve mostrar "agora mesmo" para menos de 1h', () => {
      expect(renderAt(30 * 60 * 1000).getByText('agora mesmo')).toBeTruthy();
    });

    it('deve mostrar horas para menos de 24h', () => {
      expect(renderAt(3 * HOUR + 60 * 1000).getByText('há 3h')).toBeTruthy();
    });

    it('deve usar "dia" no singular', () => {
      expect(renderAt(25 * HOUR).getByText('há 1 dia')).toBeTruthy();
    });

    it('deve usar "dias" no plural', () => {
      expect(renderAt(50 * HOUR).getByText('há 2 dias')).toBeTruthy();
    });
  });

  it('deve chamar onPress com o ticket quando clicado', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <TicketCard ticket={mockTicket} onPress={onPress} />,
    );

    fireEvent.press(getByText('TKT-A7F3'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(mockTicket);
  });
});
