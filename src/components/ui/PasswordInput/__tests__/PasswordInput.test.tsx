import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PasswordInput from '..';

describe('PasswordInput', () => {
  it('oculta a senha por padrao e alterna ao tocar no olho', () => {
    const { getByLabelText } = render(<PasswordInput placeholder="Senha" />);
    expect(getByLabelText('Campo de senha').props.secureTextEntry).toBe(true);

    fireEvent.press(getByLabelText('Exibir senha'));
    expect(getByLabelText('Campo de senha').props.secureTextEntry).toBe(false);

    fireEvent.press(getByLabelText('Ocultar senha'));
    expect(getByLabelText('Campo de senha').props.secureTextEntry).toBe(true);
  });

  it('repassa onChangeText e aceita erro', () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = render(
      <PasswordInput error="Senha invalida" onChangeText={onChangeText} />,
    );
    fireEvent.changeText(getByLabelText('Campo de senha'), 'abc123');
    expect(onChangeText).toHaveBeenCalledWith('abc123');
  });
});
