import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ChatBotScreen from '../ChatBotScreen';

const mockGoBack = jest.fn();
const mockReset = jest.fn();
let mockCanGoBack = true;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    canGoBack: () => mockCanGoBack,
    goBack: mockGoBack,
    reset: mockReset,
  }),
}));

// A janela do chatbot tem testes proprios; aqui basta o botao de fechar.
jest.mock('@components/features/ChatBot/ChatWindow', () => {
  const { createElement } = jest.requireActual('react');
  const { Pressable, Text } = jest.requireActual('react-native');
  return {
    ChatWindow: ({
      onClose,
      closeLabel,
    }: {
      onClose: () => void;
      closeLabel: string;
    }) =>
      createElement(
        Pressable,
        { onPress: onClose, accessibilityRole: 'button' },
        createElement(Text, null, closeLabel),
      ),
  };
});

describe('ChatBotScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve voltar para a tela anterior ao fechar', () => {
    mockCanGoBack = true;
    const { getByText } = render(<ChatBotScreen />);

    fireEvent.press(getByText('Fechar'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(mockReset).not.toHaveBeenCalled();
  });

  it('deve ir para o início quando não há tela anterior', () => {
    mockCanGoBack = false;
    const { getByText } = render(<ChatBotScreen />);

    fireEvent.press(getByText('Fechar'));

    expect(mockGoBack).not.toHaveBeenCalled();
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  });
});
