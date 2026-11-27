import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ActionButton from '../ActionButton';

const variants = ['primary', 'secondary', 'danger', 'ghost'] as const;

describe('ActionButton', () => {
  it('deve chamar onPress ao tocar', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ActionButton label="Salvar" onPress={onPress} />,
    );
    fireEvent.press(getByText('Salvar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it.each(variants)('deve renderizar a variante %s com ícone', (variant) => {
    const { getByRole } = render(
      <ActionButton
        label="Ação"
        onPress={jest.fn()}
        variant={variant}
        icon="check"
        size="sm"
        block
      />,
    );
    const style = getByRole('button').props.style;
    expect(style).toBeTruthy();
  });

  it('deve ficar desabilitado e ocupado durante o carregamento', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <ActionButton
        label="Enviar"
        onPress={onPress}
        loading
        accessibilityLabel="Enviar formulário"
      />,
    );
    const button = getByRole('button');
    expect(button.props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
    expect(button.props.accessibilityLabel).toBe('Enviar formulário');
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('deve aceitar o papel de link e ícone no tamanho médio', () => {
    const { getByRole } = render(
      <ActionButton
        label="Ver mais"
        onPress={jest.fn()}
        accessibilityRole="link"
        icon="arrow-right"
        disabled
      />,
    );
    expect(getByRole('link').props.accessibilityState.disabled).toBe(true);
  });
});
