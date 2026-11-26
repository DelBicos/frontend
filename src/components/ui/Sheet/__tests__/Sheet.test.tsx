import React from 'react';
import { Platform, Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

import { Sheet, SheetButton } from '../Sheet';

type Node = ReturnType<typeof render>['UNSAFE_root'];

describe('Sheet', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve exibir título, conteúdo e rodapé e fechar pelo fundo', () => {
    const onClose = jest.fn();
    const { getByText, getByLabelText } = render(
      <Sheet
        visible
        title="Reagendar"
        onClose={onClose}
        footer={<Text>rodapé</Text>}>
        <Text>conteúdo</Text>
      </Sheet>,
    );
    expect(getByText('Reagendar')).toBeTruthy();
    expect(getByText('conteúdo')).toBeTruthy();
    expect(getByText('rodapé')).toBeTruthy();
    // O fundo fica fora da árvore acessível por causa do accessibilityViewIsModal
    // do conteúdo, então a busca precisa incluir elementos ocultos.
    fireEvent.press(getByLabelText('Fechar', { includeHiddenElements: true }));
    expect(onClose).toHaveBeenCalled();
  });

  it('deve ter papel de diálogo no web', () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const { UNSAFE_root } = render(
      <Sheet visible title="Web" onClose={jest.fn()}>
        <Text>x</Text>
      </Sheet>,
    );
    expect(
      UNSAFE_root.findAll((n: Node) => n.props.role === 'dialog').length,
    ).toBeGreaterThan(0);
  });
});

describe('SheetButton', () => {
  it.each(['primary', 'secondary', 'danger'] as const)(
    'deve chamar onPress na variante %s',
    (variant) => {
      const onPress = jest.fn();
      const { getByText } = render(
        <SheetButton label="Confirmar" variant={variant} onPress={onPress} />,
      );
      fireEvent.press(getByText('Confirmar'));
      expect(onPress).toHaveBeenCalled();
    },
  );

  it.each(['primary', 'secondary'] as const)(
    'deve mostrar carregando e bloquear na variante %s',
    (variant) => {
      const onPress = jest.fn();
      const { getByRole, queryByText } = render(
        <SheetButton
          label="Salvar"
          variant={variant}
          onPress={onPress}
          loading
        />,
      );
      expect(queryByText('Salvar')).toBeNull();
      expect(getByRole('button').props.accessibilityState).toEqual({
        disabled: true,
        busy: true,
      });
    },
  );
});
