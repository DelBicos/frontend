import { backendHttpClient } from '@lib/helpers/httpClient';
import { normalizeService, useServicesStore } from '../Services';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const http = backendHttpClient as unknown as Record<string, jest.Mock>;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  useServicesStore.setState({
    services: [],
    myServices: [],
    loading: false,
    lastQuery: undefined,
  });
});

describe('normalizeService', () => {
  it('converte o formato da API (Availabilities, price decimal)', () => {
    expect(
      normalizeService({
        id: 1,
        title: 'Corte',
        price: '19.99',
        Subcategory: { category_id: 4 },
        Availabilities: [
          { day_of_week: 2, start_time: '09:00', end_time: '12:00' },
        ],
        relevance_score: 0.8,
      }),
    ).toMatchObject({
      id: 1,
      price_cents: 1999,
      category_id: 4,
      relevanceScore: 0.8,
      banner_uri: null,
      availabilities: [{ day: 2, start: '09:00', end: '12:00' }],
    });
  });

  it('mantem o formato legado ({ day, start, end }) e price_cents', () => {
    const service = normalizeService({
      id: 2,
      price_cents: 500,
      bannerUrl: 'x.png',
      availabilities: [{ day: 1, start: '08:00', end: '10:00' }],
    });
    expect(service.price_cents).toBe(500);
    expect(service.banner_uri).toBe('x.png');
    expect(service.availabilities).toEqual([
      { day: 1, start: '08:00', end: '10:00' },
    ]);
    expect(service.relevanceScore).toBeUndefined();
  });
});

describe('ServicesStore', () => {
  it('busca servicos com filtros e guarda a ultima consulta', async () => {
    http.get.mockResolvedValue({ data: { data: [{ id: 1, title: 'A' }] } });

    const result = await useServicesStore
      .getState()
      .fetchServices({ day: 1, q: 'corte' });

    expect(http.get).toHaveBeenCalledWith('/api/services', {
      params: { day: 1, q: 'corte' },
    });
    expect(result).toHaveLength(1);
    expect(useServicesStore.getState().lastQuery).toEqual({
      day: 1,
      q: 'corte',
    });

    await useServicesStore.getState().reloadServices();
    expect(http.get).toHaveBeenLastCalledWith('/api/services', {
      params: { day: 1, q: 'corte' },
    });
  });

  it('retorna lista vazia quando a busca falha', async () => {
    http.get.mockRejectedValue(new Error('offline'));
    await expect(useServicesStore.getState().fetchServices()).resolves.toEqual(
      [],
    );
    expect(useServicesStore.getState().loading).toBe(false);
  });

  it('busca semantica ignora consultas curtas e le metadados', async () => {
    await expect(
      useServicesStore.getState().searchServicesSemantically(' a '),
    ).resolves.toEqual({ services: [], total: 0, resultsLimited: false });
    expect(http.get).not.toHaveBeenCalled();

    http.get.mockResolvedValue({
      data: { data: [{ id: 3 }], total: 7, results_limited: true },
    });
    const result = await useServicesStore
      .getState()
      .searchServicesSemantically('pintura');
    expect(result).toMatchObject({ total: 7, resultsLimited: true });
    expect(http.get).toHaveBeenCalledWith('/api/services/search/semantic', {
      params: { q: 'pintura', limit: 20 },
    });
  });

  it('CRUD dos servicos do profissional atualiza myServices', async () => {
    http.get.mockResolvedValue({ data: { data: [{ id: 1, title: 'A' }] } });
    await useServicesStore.getState().fetchMyServices({ page: 1 });

    http.post.mockResolvedValue({ data: { service: { id: 2, title: 'B' } } });
    await useServicesStore.getState().createService({ title: 'B' });

    http.put.mockResolvedValue({ data: { id: 1, title: 'A2' } });
    await useServicesStore.getState().updateService(1, { title: 'A2' });

    expect(useServicesStore.getState().myServices.map((s) => s.title)).toEqual([
      'A2',
      'B',
    ]);

    http.delete.mockResolvedValue({});
    await expect(useServicesStore.getState().deleteService(2)).resolves.toBe(
      true,
    );
    http.delete.mockRejectedValue(new Error('x'));
    await expect(useServicesStore.getState().deleteService(1)).resolves.toBe(
      false,
    );
    expect(useServicesStore.getState().myServices.map((s) => s.id)).toEqual([
      1,
    ]);
  });

  it('propaga erro na criacao', async () => {
    http.post.mockRejectedValue(new Error('400'));
    await expect(useServicesStore.getState().createService({})).rejects.toThrow(
      '400',
    );
  });
});
