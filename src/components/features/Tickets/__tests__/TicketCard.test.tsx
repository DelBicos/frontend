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