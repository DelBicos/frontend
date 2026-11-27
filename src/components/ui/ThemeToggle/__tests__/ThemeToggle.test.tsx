import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeToggle, THEME_OPTIONS } from '../ThemeToggle';
import { useThemeStore, ThemeMode } from '@stores/Theme';

describe('ThemeToggle', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: ThemeMode.LIGHT });
  });

  it('deve exibir uma opção por tema e marcar a atual', () => {
    const { getByTestId } = render(<ThemeToggle />);
    expect(THEME_OPTIONS).toHaveLength(3);
    expect(getByTestId('theme-LIGHT-button').props.accessibilityState).toEqual({
      checked: true,
    });
    expect(getByTestId('theme-DARK-button').props.accessibilityState).toEqual({
      checked: false,
    });
  });

  it('deve trocar o tema ao tocar', () => {
    const { getByLabelText } = render(<ThemeToggle fill />);
    fireEvent.press(getByLabelText('Tema Escuro'));
    expect(useThemeStore.getState().theme).toBe(ThemeMode.DARK);
  });

  it('deve usar o tema claro quando não há tema salvo', () => {
    useThemeStore.setState({ theme: undefined as unknown as ThemeMode });
    const { getByTestId } = render(<ThemeToggle />);
    expect(
      getByTestId('theme-LIGHT-button').props.accessibilityState.checked,
    ).toBe(true);
  });
});
