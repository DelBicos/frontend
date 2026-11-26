import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { TicketCreatedBanner } from '../ChatWindow/TicketCreatedBanner';

const mockNavigate = jest.fn();

jest.mock('@screens/navigationRef', () => ({
  navigationRef: {
    isReady: () => true,
    navigate: (...args: unknown[]) => mockNavigate(...args),
  },
}));

jest.mock('@theme/ThemeProvider', () => ({
  useColors: () => jest.requireActual('@theme/dark').default,
}));

describe('TicketCreatedBanner', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('mostra o código do chamado aberto pelo chatbot', () => {
    const { getByText } = render(
      <TicketCreatedBanner ticketId={4} ticketCode="TKT-8WZF" />,
    );

    expect(getByText('TKT-8WZF')).toBeTruthy();
    expect(getByText('Ver chamado')).toBeTruthy();
  });

  it('fecha o chat e abre o detalhe do chamado pelo botão', () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(
      <TicketCreatedBanner
        ticketId={4}
        ticketCode="TKT-8WZF"
        onClose={onClose}
      />,
    );

    fireEvent.press(getByLabelText('Ver chamado'));
    jest.runAllTimers();

    expect(onClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('TicketDetail', { id: 4 });
  });

  it('abre o detalhe do chamado ao tocar no código', () => {
    const { getByText } = render(
      <TicketCreatedBanner ticketId={4} ticketCode="TKT-8WZF" />,
    );

    fireEvent.press(getByText('TKT-8WZF'));
    jest.runAllTimers();

    expect(mockNavigate).toHaveBeenCalledWith('TicketDetail', { id: 4 });
  });
});
