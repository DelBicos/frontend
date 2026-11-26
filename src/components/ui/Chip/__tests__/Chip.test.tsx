import React from 'react';
import { Platform, ScrollView, Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import Chip, { ChipGroup } from '..';

describe('Chip', () => {
  it('chama onPress e expoe o estado selecionado', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Chip label="Pintor" selected onPress={onPress} icon="paint-brush" />,
    );
    const chip = getByRole('button');
    expect(chip.props.accessibilityState).toEqual({ selected: true });
    fireEvent.press(chip);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('usa o tom secundario e o rotulo acessivel', () => {
    const { getByLabelText, getByText } = render(
      <Chip
        label="Eletricista"
        selected
        tone="secondary"
        onPress={jest.fn()}
        accessibilityLabel="Filtro eletricista"
      />,
    );
    expect(getByLabelText('Filtro eletricista')).toBeTruthy();
    expect(getByText('Eletricista')).toBeTruthy();
  });

  it('fica desmarcado quando selected e falso', () => {
    const { getByRole } = render(
      <Chip label="Diarista" selected={false} onPress={jest.fn()} icon="home" />,
    );
    expect(getByRole('button').props.accessibilityState).toEqual({
      selected: false,
    });
  });
});

describe('ChipGroup', () => {
  const originalOS = Platform.OS;
  afterEach(() => {
    Platform.OS = originalOS;
  });

  it('rola na horizontal no app', () => {
    const { UNSAFE_getByType, getByText } = render(
      <ChipGroup accessibilityLabel="Filtros">
        <Text>Um</Text>
      </ChipGroup>,
    );
    expect(UNSAFE_getByType(ScrollView).props.horizontal).toBe(true);
    expect(getByText('Um')).toBeTruthy();
  });

  it('quebra linha no web, sem ScrollView', () => {
    Platform.OS = 'web';
    const { UNSAFE_queryByType, getByLabelText } = render(
      <ChipGroup accessibilityLabel="Filtros">
        <Text>Um</Text>
      </ChipGroup>,
    );
    expect(UNSAFE_queryByType(ScrollView)).toBeNull();
    expect(getByLabelText('Filtros')).toBeTruthy();
  });
});
