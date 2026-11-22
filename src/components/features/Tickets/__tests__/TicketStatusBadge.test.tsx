import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { TicketStatusBadge } from '../TicketStatusBadge';
import { TICKET_STATUS_LABELS, TicketStatus } from '@stores/Ticket/types';
import lightColors from '@theme/light';

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

  it.each<[TicketStatus, string, string]>([
    ['ABERTO', 'Aberto', lightColors.primaryOrange],
    ['EM_ANALISE', 'Em análise', lightColors.primaryBlue],
    ['EM_ATENDIMENTO', 'Em atendimento', lightColors.primaryBlue],
    ['RESOLVIDO', 'Resolvido', lightColors.primaryGreen],
    ['FECHADO', 'Fechado', lightColors.textTertiary],
  ])('deve usar a cor do tema para %s', (status, label, expectedColor) => {
    const { getByText } = render(<TicketStatusBadge status={status} />);

    const badge = getByText(label).parent?.parent;
    expect(StyleSheet.flatten(badge?.props.style).backgroundColor).toBe(
      expectedColor,
    );
  });
});
