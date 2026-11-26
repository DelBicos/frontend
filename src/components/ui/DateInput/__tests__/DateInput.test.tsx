import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DateInput from '../DateInput';

describe('DateInput', () => {
  it('deve exibir a data mascarada', () => {
    const { getByLabelText } = render(
      <DateInput value="25112026" onChangeText={jest.fn()} />,
    );
    expect(getByLabelText('Data').props.value).toBe('25/11/2026');
  });

  it.each([
    ['2', '2'],
    ['251', '25/1'],
    ['25112026999', '25/11/2026'],
    ['', ''],
  ])('deve mascarar a digitação %p como %p', (typed, expected) => {
    const onChangeText = jest.fn();
    const { getByLabelText } = render(
      <DateInput value="" onChangeText={onChangeText} />,
    );
    fireEvent.changeText(getByLabelText('Data'), typed);
    expect(onChangeText).toHaveBeenCalledWith(expected);
  });

  it('deve exibir erro e respeitar desabilitado', () => {
    const { getByText, getByLabelText } = render(
      <DateInput
        value=""
        onChangeText={jest.fn()}
        label="Nascimento"
        error="Data inválida"
        disabled
      />,
    );
    expect(getByText('Data inválida')).toBeTruthy();
    expect(getByLabelText('Nascimento').props.editable).toBe(false);
  });

  it('não deve exibir erro booleano como texto', () => {
    const { queryByText } = render(
      <DateInput
        value={undefined as unknown as string}
        onChangeText={jest.fn()}
        error
      />,
    );
    expect(queryByText('true')).toBeNull();
  });
});
