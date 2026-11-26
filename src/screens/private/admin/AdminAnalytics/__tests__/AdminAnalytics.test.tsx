import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import AdminAnalytics from '../AdminAnalytics';
import { useAdminStore, AdminStats } from '@stores/Admin';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useRoute: () => ({ name: 'AdminAnalytics', params: {} }),
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

// Os graficos desenham SVG; aqui basta saber que foram montados e com que dados.
jest.mock('react-native-chart-kit', () => {
  const { createElement } = jest.requireActual('react');
  const { Text } = jest.requireActual('react-native');
  const chart =
    (name: string) =>
    ({
      data,
      chartConfig,
    }: {
      data: { datasets: { data: number[]; color?: () => string }[] };
      chartConfig: { color: () => string; labelColor: () => string };
    }) => {
      chartConfig.color();
      chartConfig.labelColor();
      data.datasets.forEach((d) => d.color?.());
      return createElement(
        Text,
        null,
        `${name}:${data.datasets.map((d) => d.data.join(',')).join('|')}`,
      );
    };
  return { BarChart: chart('barras'), LineChart: chart('linhas') };
});

const months = (value: number) => Array.from({ length: 12 }, () => value);

const makeStats = (): AdminStats => ({
  year: 2026,
  kpis: {
    revenue: 500,
    appointments: 10,
    completed: 8,
    averageRating: 4.5,
    ratingsCount: 3,
    totalUsers: 20,
    totalProfessionals: 5,
    verifiedProfessionals: 2,
  },
  queues: { openDisputes: 0, pendingVerifications: 0 },
  usersByMonth: months(2),
  professionalsByMonth: months(1),
  revenueByMonth: months(50),
  appointmentsByMonth: {
    pending: months(0),
    confirmed: months(3),
    completed: months(4),
    canceled: months(5),
    no_show: months(0),
  },
  statusTotals: {
    pending: 0,
    confirmed: 3,
    completed: 4,
    canceled: 5,
    no_show: 0,
  },
});

/** Os cartoes so desenham o grafico depois de medir a propria largura. */
const layoutCharts = (root: ReactTestInstance) => {
  const cards = root.findAll(
    (node) => typeof node.type === 'string' && !!node.props.onLayout,
  );
  act(() => {
    cards.forEach((card) =>
      card.props.onLayout({ nativeEvent: { layout: { width: 600 } } }),
    );
  });
};

describe('AdminAnalytics', () => {
  const mockFetchStats = jest.fn();
  const currentYear = new Date().getFullYear();

  beforeEach(() => {
    jest.clearAllMocks();
    useAdminStore.setState({
      stats: null,
      loading: false,
      error: null,
      fetchStats: mockFetchStats,
    });
  });

  it('deve buscar os indicadores do ano atual ao abrir', () => {
    render(<AdminAnalytics />);
    expect(mockFetchStats).toHaveBeenCalledWith(currentYear);
  });

  it('deve buscar de novo ao escolher outro ano', () => {
    const { getByText } = render(<AdminAnalytics />);

    fireEvent.press(getByText(String(currentYear - 1)));
    expect(mockFetchStats).toHaveBeenLastCalledWith(currentYear - 1);
  });

  it('deve mostrar o carregamento enquanto não há dados', () => {
    const { UNSAFE_queryByType, queryByText } = render(<AdminAnalytics />);

    expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
    expect(queryByText('Valor movimentado por mês')).toBeNull();
  });

  it('deve mostrar o erro da store', () => {
    useAdminStore.setState({ error: 'Sem permissão' });
    const { getByText, UNSAFE_queryByType } = render(<AdminAnalytics />);

    expect(getByText('Sem permissão')).toBeTruthy();
    expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  it('deve esconder os gráficos durante uma nova busca', () => {
    useAdminStore.setState({ stats: makeStats(), loading: true });
    const { queryByText } = render(<AdminAnalytics />);

    expect(queryByText('Valor movimentado por mês')).toBeNull();
  });

  it('deve desenhar os quatro gráficos com os dados mensais', () => {
    useAdminStore.setState({ stats: makeStats() });
    const { getByText, getByLabelText, UNSAFE_root } = render(
      <AdminAnalytics />,
    );

    expect(getByText('Valor movimentado por mês')).toBeTruthy();
    expect(getByText('Novos usuários')).toBeTruthy();
    expect(getByText('Novos profissionais')).toBeTruthy();
    expect(getByLabelText(/Total no ano: R\$\s500,00/)).toBeTruthy();
    expect(getByLabelText(/Novos usuários\. 24 no ano/)).toBeTruthy();
    expect(getByLabelText(/Concluídos: 4\. Cancelados: 5/)).toBeTruthy();

    layoutCharts(UNSAFE_root);

    expect(getByText(`barras:${months(50).join(',')}`)).toBeTruthy();
    expect(getByText(`barras:${months(2).join(',')}`)).toBeTruthy();
    expect(getByText(`barras:${months(1).join(',')}`)).toBeTruthy();
    expect(
      getByText(
        `linhas:${[months(4), months(3), months(5)].map((m) => m.join(',')).join('|')}`,
      ),
    ).toBeTruthy();
  });
});
