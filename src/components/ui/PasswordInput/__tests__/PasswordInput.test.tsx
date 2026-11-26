import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PasswordInput from '../PasswordInput';

describe('PasswordInput', () => {
  it('deve ocultar a senha e alternar a visibilidade', () => {
    const { getByLabelText } = render(<PasswordInput value="segredo" />);
    expect(getByLabelText('Campo de senha').props.secureTextEntry).toBe(true);
    fireEvent.press(getByLabelText('Exibir senha'));
    expect(getByLabelText('Campo de senha').props.secureTextEntry).toBe(false);
    fireEvent.press(getByLabelText('Ocultar senha'));
    expect(getByLabelText('Campo de senha').props.secureTextEntry).toBe(true);
  });

  it('deve repassar props e aceitar erro', () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = render(
      <PasswordInput
        error="Senha fraca"
        onChangeText={onChangeText}
        accessibilityLabel="Nova senha"
      />,
    );
    fireEvent.changeText(getByLabelText('Nova senha'), 'abc');
    expect(onChangeText).toHaveBeenCalledWith('abc');
  });
});
