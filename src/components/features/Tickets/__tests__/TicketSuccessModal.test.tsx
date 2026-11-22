import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TicketSuccessModal } from '../TicketSuccessModal';

const renderModal = (
  props: Partial<React.ComponentProps<typeof TicketSuccessModal>> = {},
) => {
  const onViewTickets = jest.fn();
  const onClose = jest.fn();
  const utils = render(
    <TicketSuccessModal
      visible
      ticketCode="TKT-B7YS"
      onViewTickets={onViewTickets}
      onClose={onClose}
      {...props}
    />,
  );
  return { ...utils, onViewTickets, onClose };
};

describe('TicketSuccessModal', () => {
  it('deve exibir a confirmação e o código do chamado', () => {
    const { getByText } = renderModal();

    expect(getByText('Chamado aberto!')).toBeTruthy();
    expect(getByText('Código do chamado')).toBeTruthy();
    expect(getByText('TKT-B7YS')).toBeTruthy();
    expect(getByText('Nossa equipe responderá em até 24h úteis.')).toBeTruthy();
  });

  it('não deve exibir a caixa de código quando ele não vier', () => {
    const { queryByText, getByText } = renderModal({ ticketCode: null });

    expect(getByText('Chamado aberto!')).toBeTruthy();
    expect(queryByText('Código do chamado')).toBeNull();
  });

  it('deve chamar onViewTickets em "Ver meus chamados"', () => {
    const { getByText, onViewTickets, onClose } = renderModal();

    fireEvent.press(getByText('Ver meus chamados'));
    expect(onViewTickets).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deve chamar onClose em "Fechar"', () => {
    const { getByText, onClose, onViewTickets } = renderModal();

    fireEvent.press(getByText('Fechar'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onViewTickets).not.toHaveBeenCalled();
  });

  it('não deve renderizar o conteúdo quando estiver oculto', () => {
    const { queryByText } = renderModal({ visible: false });

    expect(queryByText('Chamado aberto!')).toBeNull();
  });
});
