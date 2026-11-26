import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PhoneInput from '..';

const shown = (value: string) => {
  const { getByLabelText } = render(
    <PhoneInput value={value} onChangeText={jest.fn()} />,
  );
  return getByLabelText('Telefone').props.value;
};

describe('PhoneInput', () => {
  it('mascara celular, fixo e numeros parciais', () => {
    expect(shown('11987654321')).toBe('(11) 98765-4321');
    expect(shown('1133334444')).toBe('(11) 3333-4444');
    expect(shown('1198')).toBe('(11) 98');
    expect(shown('1')).toBe('(1');
    expect(shown('')).toBe('');
    expect(shown('0')).toBe('');
  });

  it('devolve so os digitos ao digitar', () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = render(
      <PhoneInput value="" onChangeText={onChangeText} />,
    );
    fireEvent.changeText(getByLabelText('Telefone'), '(11) 9');
    expect(onChangeText).toHaveBeenCalledWith('119');
  });

  it('mostra erro e respeita disabled', () => {
    const { getByText, getByLabelText } = render(
      <PhoneInput
        value=""
        onChangeText={jest.fn()}
        error="Telefone invalido"
        disabled
      />,
    );
    expect(getByText('Telefone invalido')).toBeTruthy();
    expect(getByLabelText('Telefone').props.editable).toBe(false);
  });
});
