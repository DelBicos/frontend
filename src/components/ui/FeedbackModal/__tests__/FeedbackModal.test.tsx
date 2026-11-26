import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FontAwesome } from '@expo/vector-icons';
import { FeedbackModal } from '..';

describe('FeedbackModal', () => {
  it.each([
    ['success', 'check-circle'],
    ['error', 'times-circle'],
    ['warning', 'exclamation-circle'],
    ['info', 'info-circle'],
  ] as const)('usa o icone do tipo %s', (type, icon) => {
    const { UNSAFE_getByType } = render(
      <FeedbackModal visible type={type} title="T" message="M" onClose={jest.fn()} />,
    );
    expect(UNSAFE_getByType(FontAwesome).props.name).toBe(icon);
  });

  it('mostra titulo e mensagem e fecha pelo botao', () => {
    const onClose = jest.fn();
    const { getByText, getByLabelText } = render(
      <FeedbackModal
        visible
        title="Pronto"
        message="Tudo certo"
        buttonText="Fechar"
        onClose={onClose}
      />,
    );
    expect(getByText('Pronto')).toBeTruthy();
    expect(getByText('Tudo certo')).toBeTruthy();
    fireEvent.press(getByLabelText('Fechar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('usa OK como texto padrao do botao', () => {
    const { getByText } = render(
      <FeedbackModal visible title="T" message="M" onClose={jest.fn()} />,
    );
    expect(getByText('OK')).toBeTruthy();
  });
});
