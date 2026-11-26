import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchField from '../SearchField';

describe('SearchField', () => {
  it('deve repassar digitação e envio', () => {
    const onChangeText = jest.fn();
    const onSubmit = jest.fn();
    const { getByLabelText, queryByLabelText } = render(
      <SearchField
        value=""
        onChangeText={onChangeText}
        onSubmit={onSubmit}
        placeholder="Buscar"
        accessibilityLabel="Buscar serviços"
      />,
    );
    const input = getByLabelText('Buscar serviços');
    fireEvent.changeText(input, 'pintor');
    fireEvent(input, 'submitEditing');
    expect(onChangeText).toHaveBeenCalledWith('pintor');
    expect(onSubmit).toHaveBeenCalled();
    expect(queryByLabelText('Limpar busca')).toBeNull();
  });

  it('deve limpar a busca', () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = render(
      <SearchField
        value="pintor"
        onChangeText={onChangeText}
        placeholder="Buscar"
        accessibilityLabel="Buscar serviços"
      />,
    );
    fireEvent.press(getByLabelText('Limpar busca'));
    expect(onChangeText).toHaveBeenCalledWith('');
  });
});
