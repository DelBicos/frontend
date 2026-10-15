import React from 'react';
import { render } from '@testing-library/react-native';
import { TicketStatusBadge } from '../TicketStatusBadge';
import { TICKET_STATUS_LABELS } from '@stores/Ticket/types';

describe('TicketStatusBadge', () => {       
  it('deve renderizar o label "Aberto" para status ABERTO', () => {
    const { getByText } = render(<TicketStatusBadge status="ABERTO" />);
    expect(getByText(TICKET_STATUS_LABELS.ABERTO)).toBeTruthy();
  });

  it('deve renderizar o label "Resolvido" para status RESOLVIDO', () => {
    const { getByText } = render(<TicketStatusBadge status="RESOLVIDO" />);
    expect(getByText('Resolvido')).toBeTruthy();
  });

  it('deve renderizar o label "Fechado" para status FECHADO', () => {
    const { getByText } = render(<TicketStatusBadge status="FECHADO" />);
    expect(getByText('Fechado')).toBeTruthy();
  });
});