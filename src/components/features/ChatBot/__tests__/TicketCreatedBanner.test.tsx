import React from 'react';
import { Platform } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { TicketCreatedBanner } from '../ChatWindow/TicketCreatedBanner';

const mockNavigate = jest.fn();
let mockIsReady = true;

jest.mock('@screens/navigationRef', () => ({
  navigationRef: {
    isReady: () => mockIsReady,
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
    mockIsReady = true;
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

  describe('sem o navegador pronto', () => {
    const previousOS = Platform.OS;
    const setOS = (os: string) =>
      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        get: () => os,
      });

    beforeEach(() => {
      mockIsReady = false;
    });

    afterEach(() => {
      setOS(previousOS);
    });

    it('deve abrir a rota do chamado na web', () => {
      setOS('web');
      const location = { href: '' };
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: location,
      });
      const { getByLabelText } = render(
        <TicketCreatedBanner ticketId={4} ticketCode="TKT-8WZF" />,
      );

      fireEvent.press(getByLabelText('Ver chamado'));
      jest.runAllTimers();

      expect(location.href).toBe('/ticket-detail?id=4');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
