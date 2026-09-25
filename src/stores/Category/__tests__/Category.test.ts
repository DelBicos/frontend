import { backendHttpClient } from '@lib/helpers/httpClient';
import { useCategoryStore } from '../Category';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn() },
}));

const http = backendHttpClient as unknown as Record<string, jest.Mock>;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  useCategoryStore.setState({ categories: [] });
});

describe('CategoryStore', () => {
  it('carrega categorias', async () => {
    http.get.mockResolvedValue({
      status: 200,
      data: [{ id: 1, title: 'Beleza' }],
    });
    await useCategoryStore.getState().fetchCategories();
    expect(useCategoryStore.getState().categories).toEqual([
      { id: 1, title: 'Beleza' },
    ]);
  });

  it('mantem a lista em caso de falha', async () => {
    http.get.mockRejectedValue(new Error('offline'));
    await useCategoryStore.getState().fetchCategories();
    expect(useCategoryStore.getState().categories).toEqual([]);
  });

  it('compartilha a requisicao entre chamadas simultaneas', async () => {
    http.get.mockResolvedValue({ data: [] });
    const store = useCategoryStore.getState();
    await Promise.all([store.fetchCategories(), store.fetchCategories()]);
    expect(http.get).toHaveBeenCalledTimes(1);
  });
});
