import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FeedbackModal } from '../FeedbackModal';

describe('FeedbackModal', () => {
  it.each(['success', 'error', 'warning', 'info', undefined] as const)(
    'deve renderizar o tipo %p',
    (type) => {
      const { getByText } = render(
        <FeedbackModal
          visible
          type={type}
          title="Pronto"
          message="Tudo certo."
          onClose={jest.fn()}
        />,
      );
      expect(getByText('Pronto')).toBeTruthy();
      expect(getByText('Tudo certo.')).toBeTruthy();
      expect(getByText('OK')).toBeTruthy();
    },
  );

  it('deve fechar pelo botão personalizado', () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(
      <FeedbackModal
        visible
        title="Erro"
        message="Falhou."
        buttonText="Tentar de novo"
        onClose={onClose}
      />,
    );
    fireEvent.press(getByLabelText('Tentar de novo'));
    expect(onClose).toHaveBeenCalled();
  });
});
