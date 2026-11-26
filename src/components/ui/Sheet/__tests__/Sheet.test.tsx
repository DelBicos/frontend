import React from 'react';
import { ActivityIndicator, Platform, Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Sheet, SheetButton } from '..';

describe('Sheet', () => {
  const originalOS = Platform.OS;
  afterEach(() => {
    Platform.OS = originalOS;
  });

  it('mostra titulo, conteudo e rodape e fecha ao tocar fora', () => {
    const onClose = jest.fn();
    const { getByText, getByLabelText } = render(
      <Sheet
        visible
        title="Remarcar"
        onClose={onClose}
        footer={<Text>rodape</Text>}>
        <Text>corpo</Text>
      </Sheet>,
    );
    expect(getByText('Remarcar')).toBeTruthy();
    expect(getByText('corpo')).toBeTruthy();
    expect(getByText('rodape')).toBeTruthy();
    fireEvent.press(getByLabelText('Fechar', { includeHiddenElements: true }));
    expect(onClose).toHaveBeenCalled();
  });

  it('no web vira dialogo e sem rodape', () => {
    Platform.OS = 'web';
    const { getByText, queryByText } = render(
      <Sheet visible title="Cancelar" onClose={jest.fn()}>
        <Text>corpo</Text>
      </Sheet>,
    );
    expect(getByText('Cancelar')).toBeTruthy();
    expect(queryByText('rodape')).toBeNull();
  });
});

describe('SheetButton', () => {
  it('chama onPress', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <SheetButton label="Confirmar" onPress={onPress} />,
    );
    fireEvent.press(getByText('Confirmar'));
    expect(onPress).toHaveBeenCalled();
  });

  it('mostra carregando e fica desabilitado', () => {
    const onPress = jest.fn();
    const { getByRole, UNSAFE_getByType, queryByText } = render(
      <SheetButton
        label="Confirmar"
        onPress={onPress}
        loading
        variant="secondary"
      />,
    );
    expect(UNSAFE_getByType(ActivityIndicator).props.color).toBeTruthy();
    expect(queryByText('Confirmar')).toBeNull();
    expect(getByRole('button').props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
  });

  it('variantes de perigo e secundaria mostram o texto', () => {
    const { getByText, rerender, UNSAFE_getByType } = render(
      <SheetButton
        label="Excluir"
        onPress={jest.fn()}
        variant="danger"
        disabled
      />,
    );
    expect(getByText('Excluir')).toBeTruthy();
    rerender(
      <SheetButton label="Voltar" onPress={jest.fn()} variant="secondary" />,
    );
    expect(getByText('Voltar')).toBeTruthy();
    rerender(<SheetButton label="Ir" onPress={jest.fn()} loading />);
    expect(UNSAFE_getByType(ActivityIndicator).props.color).toBe('#000000');
  });
});
