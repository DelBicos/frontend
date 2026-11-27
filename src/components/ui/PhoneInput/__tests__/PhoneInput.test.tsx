import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PhoneInput from '../PhoneInput';

const display = (value: string) =>
  render(<PhoneInput value={value} onChangeText={jest.fn()} />).getByLabelText(
    'Telefone',
  ).props.value;

describe('PhoneInput', () => {
  it.each([
    ['', ''],
    ['4', '(4'],
    ['419', '(41) 9'],
    ['4133334444', '(41) 3333-4444'],
    ['41999998888', '(41) 99999-8888'],
    ['041999998888', '(41) 99999-8888'],
  ])('deve mascarar %p como %p', (value, expected) => {
    expect(display(value)).toBe(expected);
  });

  it('deve devolver só dígitos', () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = render(
      <PhoneInput value="" onChangeText={onChangeText} />,
    );
    fireEvent.changeText(getByLabelText('Telefone'), '(41) 99999-8888');
    expect(onChangeText).toHaveBeenCalledWith('41999998888');
  });

  it('deve exibir erro e respeitar desabilitado', () => {
    const { getByText, getByLabelText } = render(
      <PhoneInput
        value=""
        onChangeText={jest.fn()}
        label="Celular"
        error="Telefone inválido"
        disabled
      />,
    );
    expect(getByText('Telefone inválido')).toBeTruthy();
    expect(getByLabelText('Celular').props.editable).toBe(false);
  });

  it('não deve exibir erro booleano como texto', () => {
    const { queryByText } = render(
      <PhoneInput value="" onChangeText={jest.fn()} error />,
    );
    expect(queryByText('true')).toBeNull();
  });
});
