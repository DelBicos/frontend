import React from 'react';
import { Platform } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import Chip from '../Chip';
import ChipGroup from '../ChipGroup';

describe('Chip', () => {
  it('deve chamar onPress e expor o estado selecionado', () => {
    const onPress = jest.fn();
    const { getByRole, getByText } = render(
      <Chip label="Elétrica" selected onPress={onPress} icon="bolt" />,
    );
    fireEvent.press(getByText('Elétrica'));
    expect(onPress).toHaveBeenCalled();
    expect(getByRole('button').props.accessibilityState).toEqual({
      selected: true,
    });
  });

  it('deve renderizar o tom secundário e não selecionado', () => {
    const { getByRole, rerender } = render(
      <Chip
        label="Todos"
        selected={false}
        onPress={jest.fn()}
        tone="secondary"
        icon="list"
        accessibilityLabel="Filtro todos"
      />,
    );
    expect(getByRole('button').props.accessibilityLabel).toBe('Filtro todos');
    rerender(
      <Chip label="Todos" selected onPress={jest.fn()} tone="secondary" />,
    );
    expect(getByRole('button').props.accessibilityState.selected).toBe(true);
  });
});

describe('ChipGroup', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve rolar na horizontal no app', () => {
    const { getByLabelText } = render(
      <ChipGroup accessibilityLabel="Filtros">
        <Chip label="A" selected={false} onPress={jest.fn()} />
      </ChipGroup>,
    );
    expect(getByLabelText('Filtros').props.horizontal).toBe(true);
  });

  it('deve quebrar linha no web', () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const { getByLabelText } = render(
      <ChipGroup accessibilityLabel="Filtros">
        <Chip label="A" selected={false} onPress={jest.fn()} />
      </ChipGroup>,
    );
    expect(getByLabelText('Filtros').props.horizontal).toBeUndefined();
  });
});
