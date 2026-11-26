import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DateInput from '..';

describe('DateInput', () => {
  it('aplica a mascara ao valor recebido', () => {
    const { getByLabelText } = render(
      <DateInput value="25122024" onChangeText={jest.fn()} />,
    );
    expect(getByLabelText('Data').props.value).toBe('25/12/2024');
  });

  it('devolve o texto mascarado ao digitar', () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = render(
      <DateInput value="" onChangeText={onChangeText} label="Nascimento" />,
    );
    fireEvent.changeText(getByLabelText('Nascimento'), '0102199999');
    expect(onChangeText).toHaveBeenCalledWith('01/02/1999');
  });

  it('mostra erro em texto e fica bloqueado quando desabilitado', () => {
    const { getByText, getByLabelText } = render(
      <DateInput value="" onChangeText={jest.fn()} error="Data invalida" disabled />,
    );
    expect(getByText('Data invalida')).toBeTruthy();
    expect(getByLabelText('Data').props.editable).toBe(false);
  });

  it('ignora erro booleano e limpa valor vazio', () => {
    const onChangeText = jest.fn();
    const { getByLabelText, queryByText } = render(
      <DateInput value="" onChangeText={onChangeText} error />,
    );
    fireEvent.changeText(getByLabelText('Data'), '');
    expect(onChangeText).toHaveBeenCalledWith('');
    expect(queryByText('true')).toBeNull();
  });
});
