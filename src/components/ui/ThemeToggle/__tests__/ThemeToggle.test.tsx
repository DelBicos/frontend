import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useThemeStore } from '@stores/Theme';
import { ThemeMode } from '@stores/Theme/types';
import { ThemeToggle, THEME_OPTIONS } from '..';

describe('ThemeToggle', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: ThemeMode.LIGHT });
  });

  it('marca o tema atual e lista as tres opcoes', () => {
    const { getByTestId } = render(<ThemeToggle />);
    expect(THEME_OPTIONS).toHaveLength(3);
    expect(getByTestId('theme-LIGHT-button').props.accessibilityState).toEqual({
      checked: true,
    });
    expect(getByTestId('theme-DARK-button').props.accessibilityState).toEqual({
      checked: false,
    });
  });

  it('troca o tema ao tocar em uma opcao', () => {
    const { getByLabelText } = render(<ThemeToggle fill />);
    fireEvent.press(getByLabelText('Tema Escuro'));
    expect(useThemeStore.getState().theme).toBe(ThemeMode.DARK);
  });

  it('usa claro quando o tema esta vazio', () => {
    useThemeStore.setState({ theme: undefined as unknown as ThemeMode });
    const { getByTestId } = render(<ThemeToggle />);
    expect(getByTestId('theme-LIGHT-button').props.accessibilityState).toEqual({
      checked: true,
    });
  });
});
