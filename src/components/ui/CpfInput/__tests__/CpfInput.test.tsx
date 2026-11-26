import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CpfInput from '..';
import { maskCpf } from '../CpfInput';

describe('CpfInput', () => {
  it('mostra o CPF mascarado', () => {
    const { getByLabelText } = render(
      <CpfInput value="12345678901" onChangeText={jest.fn()} />,
    );
    expect(getByLabelText('CPF').props.value).toBe('123.456.789-01');
  });

  it('devolve so os digitos ao digitar', () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = render(
      <CpfInput value="" onChangeText={onChangeText} />,
    );
    fireEvent.changeText(getByLabelText('CPF'), '123.456.789-01');
    expect(onChangeText).toHaveBeenCalledWith('12345678901');
  });

  it('mostra erro e respeita disabled', () => {
    const { getByText, getByLabelText } = render(
      <CpfInput
        value=""
        onChangeText={jest.fn()}
        error="CPF invalido"
        disabled
        label="Documento"
      />,
    );
    expect(getByText('CPF invalido')).toBeTruthy();
    expect(getByLabelText('Documento').props.editable).toBe(false);
  });

  it('maskCpf devolve vazio sem valor e corta digitos extras', () => {
    expect(maskCpf(undefined)).toBe('');
    expect(maskCpf('123456789012345')).toBe('123.456.789-01');
  });
});
