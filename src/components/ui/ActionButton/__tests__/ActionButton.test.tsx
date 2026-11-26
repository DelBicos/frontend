import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { FontAwesome } from '@expo/vector-icons';
import ActionButton from '..';

describe('ActionButton', () => {
  it('chama onPress e mostra o icone', () => {
    const onPress = jest.fn();
    const { getByRole, UNSAFE_getByType } = render(
      <ActionButton label="Salvar" onPress={onPress} icon="check" />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalled();
    expect(UNSAFE_getByType(FontAwesome).props.size).toBe(16);
  });

  it('carregando fica ocupado e desabilitado', () => {
    const onPress = jest.fn();
    const { getByRole, UNSAFE_getByType } = render(
      <ActionButton label="Salvar" onPress={onPress} loading variant="danger" />,
    );
    const button = getByRole('button');
    expect(button.props.accessibilityState).toEqual({ disabled: true, busy: true });
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('aceita tamanho pequeno, fantasma, bloco e papel de link', () => {
    const { getByRole, getByLabelText, UNSAFE_getByType } = render(
      <ActionButton
        label="Ver"
        onPress={jest.fn()}
        variant="ghost"
        size="sm"
        block
        icon="eye"
        accessibilityRole="link"
        accessibilityLabel="Ver mais"
      />,
    );
    expect(getByRole('link')).toBeTruthy();
    expect(getByLabelText('Ver mais')).toBeTruthy();
    expect(UNSAFE_getByType(FontAwesome).props.size).toBe(14);
  });

  it('desabilitado nao chama onPress', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <ActionButton label="Ok" onPress={onPress} disabled variant="secondary" />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('aplica estilo de hover e pressionado no web', () => {
    const { getByRole } = render(<ActionButton label="Ok" onPress={jest.fn()} />);
    const style = getByRole('button').props.style;
    expect(style).toBeTruthy();
  });
});
