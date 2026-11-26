import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import CustomTextInput from '../CustomTextInput';

describe('CustomTextInput', () => {
  it('deve renderizar rótulo e campo acessível', () => {
    const { getByText, getByLabelText } = render(
      <CustomTextInput label="Nome" value="Ana" />,
    );
    expect(getByText('Nome')).toBeTruthy();
    expect(getByLabelText('Nome').props.value).toBe('Ana');
  });

  it('deve exibir erro como texto ou FieldError', () => {
    const { getByText, rerender } = render(
      <CustomTextInput label="Email" error="Email inválido" />,
    );
    expect(getByText('Email inválido')).toBeTruthy();
    rerender(
      <CustomTextInput
        label="Email"
        error={{ type: 'required', message: 'Obrigatório' }}
      />,
    );
    expect(getByText('Obrigatório')).toBeTruthy();
  });

  it('deve renderizar filhos no lugar do campo', () => {
    const { getByText, queryByLabelText } = render(
      <CustomTextInput label="Custom">
        <Text>Filho</Text>
      </CustomTextInput>,
    );
    expect(getByText('Filho')).toBeTruthy();
    expect(queryByLabelText('Custom')).toBeNull();
  });
});
