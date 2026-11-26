import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import AdminDashboard from '../AdminDashboard';
import { useAdminStore, AdminStats } from '@stores/Admin';

const mockNavigate = jest.fn();
let mockRouteName = 'AdminDashboard';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({ name: mockRouteName, params: {} }),
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

const months = (value: number) => Array.from({ length: 12 }, () => value);

const makeStats = (overrides: Partial<AdminStats> = {}): AdminStats => ({
  year: 2026,
  kpis: {
    revenue: 1234.5,
    appointments: 40,
    completed: 30,
    averageRating: 4.75,
    ratingsCount: 12,
    totalUsers: 1500,
    totalProfessionals: 80,
    verifiedProfessionals: 60,
  },
  queues: { openDisputes: 2, pendingVerifications: 0 },
  usersByMonth: months(1),
  professionalsByMonth: months(1),
  revenueByMonth: months(100),
  appointmentsByMonth: {
    pending: months(0),
    confirmed: months(1),
    completed: months(2),
    canceled: months(0),
    no_show: months(0),
  },
  statusTotals: {
    pending: 3,
    confirmed: 5,
    completed: 30,
    canceled: 2,
    no_show: 1,
  },
  ...overrides,
});

describe('AdminDashboard', () => {
  const mockFetchStats = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteName = 'AdminDashboard';
    useAdminStore.setState({
      stats: null,
      loading: false,
      error: null,
      fetchStats: mockFetchStats,
    });
  });

  it('deve buscar os indicadores ao abrir a tela', () => {
    render(<AdminDashboard />);
    expect(mockFetchStats).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar o carregamento enquanto não há indicadores', () => {
    const { UNSAFE_queryByType, queryByText } = render(<AdminDashboard />);
    expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
    expect(queryByText('Aguardando você')).toBeNull();
  });

  it('deve mostrar o erro sem o carregamento', () => {
    useAdminStore.setState({ error: 'Falha ao carregar indicadores' });
    const { getByText, UNSAFE_queryByType } = render(<AdminDashboard />);

    expect(getByText('Falha ao carregar indicadores')).toBeTruthy();
    expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  it('deve mostrar filas, resumo do ano e totais por situação', () => {
    useAdminStore.setState({ stats: makeStats() });
    const { getByText } = render(<AdminDashboard />);

    expect(getByText('Aguardando você')).toBeTruthy();
    expect(getByText('Decida o reembolso')).toBeTruthy();
    expect(getByText('Nenhuma pendente')).toBeTruthy();
    expect(getByText('Resumo de 2026')).toBeTruthy();
    expect(getByText(/1\.234,50/)).toBeTruthy();
    expect(getByText('4,8')).toBeTruthy();
    expect(getByText('12 avaliações')).toBeTruthy();
    expect(getByText('1.500')).toBeTruthy();
    expect(getByText('60 verificados')).toBeTruthy();
    expect(getByText('Concluídos')).toBeTruthy();
    expect(getByText('Não compareceu')).toBeTruthy();
  });

  it('deve mostrar travessão quando não há avaliação média', () => {
    const stats = makeStats();
    useAdminStore.setState({
      stats: {
        ...stats,
        kpis: { ...stats.kpis, averageRating: null },
        queues: { openDisputes: 0, pendingVerifications: 3 },
      },
    });
    const { getByText } = render(<AdminDashboard />);

    expect(getByText('—')).toBeTruthy();
    expect(getByText('Confira documento e selfie')).toBeTruthy();
    expect(getByText('Nenhuma pendente')).toBeTruthy();
  });

  it('deve abrir as filas de disputas e de verificações', () => {
    useAdminStore.setState({ stats: makeStats() });
    const { getByText } = render(<AdminDashboard />);

    fireEvent.press(getByText('Disputas abertas'));
    expect(mockNavigate).toHaveBeenCalledWith('AdminDisputes');

    fireEvent.press(getByText('Verificações em análise'));
    expect(mockNavigate).toHaveBeenCalledWith('AdminVerifications');
  });

  it('deve navegar entre as seções sem reabrir a seção atual', () => {
    const { getByText } = render(<AdminDashboard />);

    fireEvent.press(getByText('Painel'));
    expect(mockNavigate).not.toHaveBeenCalled();

    fireEvent.press(getByText('Analytics'));
    expect(mockNavigate).toHaveBeenCalledWith('AdminAnalytics');
  });
});
