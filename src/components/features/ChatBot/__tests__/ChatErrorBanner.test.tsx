import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ChatErrorBanner } from '../ChatWindow/ChatErrorBanner';

const renderBanner = (
  props: Partial<React.ComponentProps<typeof ChatErrorBanner>> = {},
) => {
  const onRetry = jest.fn();
  const utils = render(
    <ChatErrorBanner
      error="Falha ao enviar"
      rateLimitCountdown={0}
      lastSentText={null}
      hasRetryableVoiceCommand={false}
      onRetry={onRetry}
      {...props}
    />,
  );
  return { ...utils, onRetry };
};

describe('ChatErrorBanner', () => {
  it('deve mostrar o erro sem a opção de reenviar quando não há o que repetir', () => {
    const { getByText, queryByLabelText } = renderBanner();

    expect(getByText('Falha ao enviar')).toBeTruthy();
    expect(queryByLabelText('Tentar novamente')).toBeNull();
  });

  it('deve reenviar a última mensagem de texto', () => {
    const { getByLabelText, onRetry } = renderBanner({ lastSentText: 'oi' });

    fireEvent.press(getByLabelText('Tentar novamente'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('deve oferecer reenviar o comando de voz', () => {
    const { getByLabelText } = renderBanner({ hasRetryableVoiceCommand: true });

    expect(getByLabelText('Tentar novamente')).toBeTruthy();
  });

  it('deve mostrar a contagem do limite de mensagens e esconder o reenvio', () => {
    const { getByText, queryByLabelText } = renderBanner({
      rateLimitCountdown: 7,
      lastSentText: 'oi',
    });

    expect(
      getByText('Aguarde 7s antes de enviar outra mensagem.'),
    ).toBeTruthy();
    expect(queryByLabelText('Tentar novamente')).toBeNull();
  });
});
