import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChatHeader } from '../ChatWindow/ChatHeader';

describe('ChatHeader', () => {
  // ─── IDENTIDADE ──────────────────────────────────────
  it('deve exibir o nome do assistente e o status "online agora"', () => {
    const { getByText, queryByText } = render(
      <ChatHeader onClear={jest.fn()} />,
    );

    expect(getByText('Assistente DelBicos')).toBeTruthy();
    expect(getByText('online agora')).toBeTruthy();
    expect(queryByText('Agendamentos via chat')).toBeNull();
  });

  it('deve marcar o nome do assistente como título para leitores de tela', () => {
    const { getByRole } = render(<ChatHeader onClear={jest.fn()} />);

    expect(getByRole('header', { name: 'Assistente DelBicos' })).toBeTruthy();
  });

  // ─── AÇÕES ───────────────────────────────────────────
  it('deve reiniciar a conversa ao tocar em "Reiniciar"', () => {
    const onClear = jest.fn();
    const { getByLabelText } = render(<ChatHeader onClear={onClear} />);

    fireEvent.press(getByLabelText('Reiniciar conversa'));

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('deve bloquear "Reiniciar" quando restartDisabled for verdadeiro', () => {
    const onClear = jest.fn();
    const { getByLabelText } = render(
      <ChatHeader onClear={onClear} restartDisabled />,
    );
    const button = getByLabelText('Reiniciar conversa');

    fireEvent.press(button);

    expect(button.props.accessibilityState?.disabled).toBe(true);
    expect(onClear).not.toHaveBeenCalled();
  });

  it('não deve exibir o botão de fechar sem onClose', () => {
    const { queryByLabelText } = render(<ChatHeader onClear={jest.fn()} />);

    expect(queryByLabelText('Fechar chat')).toBeNull();
  });

  it('deve fechar o chat com o rótulo informado', () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(
      <ChatHeader
        onClear={jest.fn()}
        onClose={onClose}
        closeLabel="Minimizar"
      />,
    );

    fireEvent.press(getByLabelText('Minimizar chat'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
