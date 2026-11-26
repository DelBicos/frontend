import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchField from '..';

describe('SearchField', () => {
  it('repassa digitacao e envio', () => {
    const onChangeText = jest.fn();
    const onSubmit = jest.fn();
    const { getByLabelText, queryByLabelText } = render(
      <SearchField
        value=""
        onChangeText={onChangeText}
        placeholder="Buscar"
        accessibilityLabel="Buscar servico"
        onSubmit={onSubmit}
      />,
    );
    expect(queryByLabelText('Limpar busca')).toBeNull();
    fireEvent.changeText(getByLabelText('Buscar servico'), 'pintor');
    expect(onChangeText).toHaveBeenCalledWith('pintor');
    fireEvent(getByLabelText('Buscar servico'), 'submitEditing');
    expect(onSubmit).toHaveBeenCalled();
  });

  it('limpa a busca pelo botao', () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = render(
      <SearchField
        value="abc"
        onChangeText={onChangeText}
        placeholder="Buscar"
        accessibilityLabel="Buscar servico"
      />,
    );
    fireEvent.press(getByLabelText('Limpar busca'));
    expect(onChangeText).toHaveBeenCalledWith('');
  });
});
