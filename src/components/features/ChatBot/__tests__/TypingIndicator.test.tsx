import React from 'react';
import { render } from '@testing-library/react-native';
import { TypingIndicator } from '../TypingIndicator';

const CAPTION = "O assistente da Delbicos está digitando";

describe('TypingIndicator', () => {
  it('deve exibir a legenda abaixo dos pontos quando informada', () => {
    const { getByText } = render(<TypingIndicator caption={CAPTION} />);

    expect(getByText(CAPTION)).toBeTruthy();
  });

  it('deve cortar a legenda em uma linha com reticências', () => {
    const { getByText } = render(<TypingIndicator caption={CAPTION} />);
    const caption = getByText(CAPTION);

    expect(caption.props.numberOfLines).toBe(1);
    expect(caption.props.ellipsizeMode).toBe('tail');
  });

  it('deve anunciar que o assistente está digitando, com a legenda', () => {
    const { getByTestId } = render(<TypingIndicator caption={CAPTION} />);
    const indicator = getByTestId('chat-typing-indicator');

    expect(indicator.props.accessibilityLabel).toBe(
      `Assistente digitando. ${CAPTION}`,
    );
    expect(indicator.props.accessibilityLiveRegion).toBe('polite');
  });

  it('não deve exibir legenda quando ela não for informada', () => {
    const { getByTestId, queryByText } = render(<TypingIndicator />);

    expect(getByTestId('chat-typing-indicator').props.accessibilityLabel).toBe(
      'Assistente digitando',
    );
    expect(queryByText(CAPTION)).toBeNull();
  });
});
