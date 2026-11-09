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
      { id: 1, title: 'Beleza', iconName: 'heartbeat' },
    ]);
  });

  it('entrega cada categoria com o proprio icone', async () => {
    http.get.mockResolvedValue({
      data: [
        { id: 2, title: 'Beleza' },
        { id: 6, title: 'Pet' },
      ],
    });
    await useCategoryStore.getState().fetchCategories();
    expect(
      useCategoryStore.getState().categories.map((c) => c.iconName),
    ).toEqual(['cut', 'paw']);
  });

  it('usa o icone padrao para categoria sem icone mapeado', async () => {
    http.get.mockResolvedValue({ data: [{ id: 99, title: 'Nova' }] });
    await useCategoryStore.getState().fetchCategories();
    expect(useCategoryStore.getState().categories[0].iconName).toBe('shapes');
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
