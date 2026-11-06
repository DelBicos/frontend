import { backendHttpClient } from '@lib/helpers/httpClient';
import { useAdminStore } from '../Admin';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

const http = backendHttpClient as unknown as Record<string, jest.Mock>;

beforeEach(() => {
  jest.clearAllMocks();
  useAdminStore.setState({ stats: null, loading: false, error: null });
});

describe('AdminStore', () => {
  it('carrega os indicadores do ano pedido', async () => {
    http.get.mockResolvedValue({ data: { year: 2025, kpis: { revenue: 10 } } });

    await useAdminStore.getState().fetchStats(2025);

    expect(http.get).toHaveBeenCalledWith('/api/admin/stats', {
      params: { year: 2025 },
    });
    expect(useAdminStore.getState().stats).toMatchObject({ year: 2025 });
    expect(useAdminStore.getState().loading).toBe(false);
  });

  it('sem ano pede o ano atual (sem parametro)', async () => {
    http.get.mockResolvedValue({ data: { year: 2026 } });
    await useAdminStore.getState().fetchStats();
    expect(http.get).toHaveBeenCalledWith('/api/admin/stats', {
      params: undefined,
    });
  });

  it('registra o erro quando a consulta falha', async () => {
    http.get.mockRejectedValue(new Error('rede'));
    await useAdminStore.getState().fetchStats();
    expect(useAdminStore.getState().error).toBeTruthy();
  });

  it('lista e resolve disputas', async () => {
    http.get.mockResolvedValue({ data: [{ id: 1 }] });
    expect(await useAdminStore.getState().listDisputes('open')).toEqual([
      { id: 1 },
    ]);
    expect(http.get).toHaveBeenCalledWith('/api/admin/disputes', {
      params: { status: 'open' },
    });

    http.post.mockResolvedValue({ data: { id: 1, status: 'resolved' } });
    await useAdminStore
      .getState()
      .resolveDispute(1, { resolution: 'refund_partial', refundCents: 2000 });
    expect(http.post).toHaveBeenCalledWith('/api/admin/disputes/1/resolve', {
      resolution: 'refund_partial',
      refundCents: 2000,
    });
  });

  it('lista (pendentes por padrao) e analisa verificacoes', async () => {
    http.get.mockResolvedValue({ data: { verifications: [{ id: 5 }] } });
    expect(await useAdminStore.getState().listVerifications()).toEqual([
      { id: 5 },
    ]);
    expect(http.get).toHaveBeenCalledWith('/api/admin/verifications', {
      params: { status: 'pending' },
    });

    http.post.mockResolvedValue({ data: {} });
    await useAdminStore
      .getState()
      .reviewVerification(5, 'reject', 'Foto ilegível');
    expect(http.post).toHaveBeenCalledWith(
      '/api/admin/verifications/5/review',
      {
        decision: 'reject',
        reason: 'Foto ilegível',
      },
    );
  });
});
