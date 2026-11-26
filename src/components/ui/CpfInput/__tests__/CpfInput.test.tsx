import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CpfInput, { maskCpf } from '../CpfInput';

describe('maskCpf', () => {
  it.each([
    [undefined, ''],
    ['', ''],
    ['123', '123'],
    ['1234', '123.4'],
    ['1234567', '123.456.7'],
    ['12345678901', '123.456.789-01'],
    ['123456789012345', '123.456.789-01'],
  ])('mascara %p como %p', (input, expected) => {
    expect(maskCpf(input)).toBe(expected);
  });
});

describe('CpfInput', () => {
  it('deve exibir mascarado e devolver só dígitos', () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = render(
      <CpfInput value="12345678901" onChangeText={onChangeText} />,
    );
    const input = getByLabelText('CPF');
    expect(input.props.value).toBe('123.456.789-01');
    fireEvent.changeText(input, '987.654.321-00');
    expect(onChangeText).toHaveBeenCalledWith('98765432100');
  });

  it('deve exibir erro de texto e respeitar desabilitado', () => {
    const { getByText, getByLabelText, rerender, queryByText } = render(
      <CpfInput
        value=""
        onChangeText={jest.fn()}
        error="CPF inválido"
        label="Documento"
        disabled
      />,
    );
    expect(getByText('CPF inválido')).toBeTruthy();
    expect(getByLabelText('Documento').props.editable).toBe(false);
    rerender(<CpfInput value="" onChangeText={jest.fn()} error />);
    expect(queryByText('CPF inválido')).toBeNull();
  });
});
