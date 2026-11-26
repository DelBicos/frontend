import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import CustomTextInput from '..';

describe('CustomTextInput', () => {
  it('mostra o rotulo e repassa a digitacao', () => {
    const onChangeText = jest.fn();
    const { getByText, getByLabelText } = render(
      <CustomTextInput label="Nome" onChangeText={onChangeText} />,
    );
    expect(getByText('Nome')).toBeTruthy();
    fireEvent.changeText(getByLabelText('Nome'), 'Maria');
    expect(onChangeText).toHaveBeenCalledWith('Maria');
  });

  it('mostra erro em texto', () => {
    const { getByText } = render(
      <CustomTextInput label="Email" error="Email obrigatorio" />,
    );
    expect(getByText('Email obrigatorio')).toBeTruthy();
  });

  it('mostra a mensagem de um FieldError', () => {
    const { getByText } = render(
      <CustomTextInput error={{ type: 'required', message: 'Campo vazio' }} />,
    );
    expect(getByText('Campo vazio')).toBeTruthy();
  });

  it('renderiza children no lugar do campo', () => {
    const { getByText, queryByLabelText } = render(
      <CustomTextInput label="Extra">
        <Text>Conteudo proprio</Text>
      </CustomTextInput>,
    );
    expect(getByText('Conteudo proprio')).toBeTruthy();
    expect(queryByLabelText('Extra')).toBeNull();
  });
});
