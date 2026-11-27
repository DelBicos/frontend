import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import ProfessionalEarningsScreen from '../ProfessionalEarningsScreen';
import { useDashboardStore } from '@stores/Dashboard';
import { useThemeStore, ThemeMode } from '@stores/Theme';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

describe('ProfessionalEarningsScreen', () => {
  const mockFetchEarnings = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useThemeStore.setState({ theme: ThemeMode.LIGHT });
    useDashboardStore.setState({
      kpis: { totalServices: 3, totalEarnings: 100 },
      loading: false,
      fetchEarnings: mockFetchEarnings,
    });
  });

  it('deve buscar os ganhos dos últimos 30 dias ao abrir', () => {
    render(<ProfessionalEarningsScreen />);

    expect(mockFetchEarnings).toHaveBeenCalledTimes(1);
    const [from, to] = mockFetchEarnings.mock.calls[0];
    expect(from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(to).getTime() - new Date(from).getTime()).toBe(
      30 * 24 * 60 * 60 * 1000,
    );
  });

  it('deve começar com os valores ocultos e mostrá-los ao tocar no olho', () => {
    const { getAllByText, getByText, UNSAFE_getAllByProps } = render(
      <ProfessionalEarningsScreen />,
    );

    expect(getByText('••••')).toBeTruthy();
    expect(getAllByText('R$ ••••')).toHaveLength(2);

    fireEvent.press(UNSAFE_getAllByProps({ name: 'eye' })[0]);

    expect(getByText(/200,00/)).toBeTruthy();
    expect(getByText(/100,00/)).toBeTruthy();
    expect(getByText(/1\.000,00/)).toBeTruthy();
  });

  it('deve mostrar zero quando não há indicadores', () => {
    useThemeStore.setState({ theme: ThemeMode.DARK });
    useDashboardStore.setState({ kpis: null });
    const { getAllByText, UNSAFE_getAllByProps } = render(
      <ProfessionalEarningsScreen />,
    );

    fireEvent.press(UNSAFE_getAllByProps({ name: 'eye' })[0]);
    expect(getAllByText(/R\$\s0,00/)).toHaveLength(3);
  });

  it('deve mostrar carregamento e, depois, o histórico vazio', () => {
    useThemeStore.setState({ theme: ThemeMode.LIGHT_HI_CONTRAST });
    useDashboardStore.setState({ loading: true });
    const { UNSAFE_queryAllByType, queryByText, rerender } = render(
      <ProfessionalEarningsScreen />,
    );

    expect(UNSAFE_queryAllByType(ActivityIndicator)).toHaveLength(2);
    expect(queryByText(/não possui transações/)).toBeNull();

    useDashboardStore.setState({ loading: false });
    rerender(<ProfessionalEarningsScreen />);
    expect(
      queryByText('Você ainda não possui transações recentes.'),
    ).toBeTruthy();
  });
});
