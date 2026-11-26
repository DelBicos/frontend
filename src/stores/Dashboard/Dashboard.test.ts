// @ts-nocheck
/// <reference types="jest" />

import { useDashboardStore } from '@stores/Dashboard';
import { backendHttpClient } from '@lib/helpers/httpClient';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: {
    get: jest.fn(),
  },
}));

// use require here because jest.mock is hoisted; silence TS about require
// @ts-ignore

describe('dashboard store', () => {
  beforeEach(() => {
    // reset store state
    useDashboardStore.getState().clear();
    jest.resetAllMocks();
  });

  it('fetchKpis stores kpis when backend returns data', async () => {
    (backendHttpClient.get as jest.Mock).mockResolvedValueOnce({
      data: { totalServices: 5, totalEarnings: 123.45, avgRating: 4.2 },
    });

    await useDashboardStore.getState().fetchKpis();

    const state = useDashboardStore.getState();
    expect(state.kpis).not.toBeNull();
    expect(state.kpis?.totalServices).toBe(5);
    expect(state.kpis?.totalEarnings).toBeCloseTo(123.45);
  });

  it('fetchEarnings stores earnings array', async () => {
    const sample = [{ month: '10-2025', total: 100 }];
    const expected = [
      { month: '10-2025', total: 100, parsedDate: '2025-10-01' },
    ];
    (backendHttpClient.get as jest.Mock).mockResolvedValueOnce({
      data: sample,
    });

    await useDashboardStore
      .getState()
      .fetchEarnings('2025-10-01', '2025-10-31');

    const state = useDashboardStore.getState();
    expect(state.earnings).toEqual(expected);
  });

  it('guarda a mensagem padrao quando os KPIs falham e encerra o carregamento', async () => {
    (backendHttpClient.get as jest.Mock).mockRejectedValueOnce(
      new Error('falhou'),
    );

    await useDashboardStore.getState().fetchKpis();

    const state = useDashboardStore.getState();
    expect(state.error).toBe('Erro ao buscar KPIs');
    expect(state.loading).toBe(false);
  });

  it('busca os ganhos sem filtro e registra o erro quando falha', async () => {
    (backendHttpClient.get as jest.Mock).mockRejectedValueOnce(
      new Error('falhou'),
    );

    await useDashboardStore.getState().fetchEarnings();

    expect(backendHttpClient.get).toHaveBeenCalledWith(
      '/api/dashboard/earnings-over-time',
    );
    expect(useDashboardStore.getState().error).toBe('Erro ao buscar ganhos');
  });

  it('busca as categorias com e sem periodo', async () => {
    const categorias = [{ category: 'Pintura', count: 2 }];
    (backendHttpClient.get as jest.Mock).mockResolvedValueOnce({
      data: categorias,
    });

    await useDashboardStore.getState().fetchCategories('2025-01-01');

    expect(backendHttpClient.get).toHaveBeenLastCalledWith(
      '/api/dashboard/services-by-category?from=2025-01-01',
    );
    expect(useDashboardStore.getState().categories).toEqual(categorias);

    (backendHttpClient.get as jest.Mock).mockResolvedValueOnce({ data: [] });
    await useDashboardStore.getState().fetchCategories(undefined, '2025-02-01');
    expect(backendHttpClient.get).toHaveBeenLastCalledWith(
      '/api/dashboard/services-by-category?to=2025-02-01',
    );

    (backendHttpClient.get as jest.Mock).mockResolvedValueOnce({ data: [] });
    await useDashboardStore.getState().fetchCategories();
    expect(backendHttpClient.get).toHaveBeenLastCalledWith(
      '/api/dashboard/services-by-category',
    );
  });

  it('registra o erro das categorias e limpa tudo com clear', async () => {
    (backendHttpClient.get as jest.Mock).mockRejectedValueOnce(
      new Error('falhou'),
    );
    await useDashboardStore.getState().fetchCategories();
    expect(useDashboardStore.getState().error).toBe(
      'Erro ao buscar categorias',
    );
    expect(useDashboardStore.getState().loading).toBe(false);

    useDashboardStore.getState().clear();
    expect(useDashboardStore.getState()).toMatchObject({
      kpis: null,
      earnings: [],
      categories: [],
      error: null,
    });
  });
});
