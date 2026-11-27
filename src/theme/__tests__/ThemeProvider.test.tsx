import React from 'react';
import { Text } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';
import { useThemeStore } from '@stores/Theme';
import { ThemeMode } from '@stores/Theme/types';
import { ThemeProvider, useColors } from '../ThemeProvider';
import lightScheme from '../light';
import darkScheme from '../dark';
import lightContrastScheme from '../light-contrast';

const Probe = () => {
  const colors = useColors();
  return <Text testID="cor">{colors.primaryBlue}</Text>;
};

afterEach(() => useThemeStore.setState({ theme: ThemeMode.LIGHT }));

describe('ThemeProvider', () => {
  it('fora do provider usa o tema claro', () => {
    render(<Probe />);
    expect(screen.getByTestId('cor')).toHaveTextContent(
      lightScheme.primaryBlue,
    );
  });

  it('entrega as cores do tema da store e reage a troca', () => {
    useThemeStore.setState({ theme: ThemeMode.DARK });
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('cor')).toHaveTextContent(darkScheme.primaryBlue);

    act(() => useThemeStore.setState({ theme: ThemeMode.LIGHT_HI_CONTRAST }));
    expect(screen.getByTestId('cor')).toHaveTextContent(
      lightContrastScheme.primaryBlue,
    );
  });

  it('cai para o tema claro com um tema desconhecido', () => {
    useThemeStore.setState({ theme: 'OUTRO' as unknown as ThemeMode });
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('cor')).toHaveTextContent(
      lightScheme.primaryBlue,
    );
  });
});
