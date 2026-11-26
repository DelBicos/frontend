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

  it('busca semantica indisponivel (503) cai para a busca por titulo', async () => {
    http.get
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 503 } })
      .mockResolvedValueOnce({
        data: { data: [{ id: 4, title: 'Instalação de Tomadas' }], total: 1 },
      });
    const result = await useServicesStore
      .getState()
      .searchServicesSemantically('tomada');
    expect(http.get).toHaveBeenLastCalledWith('/api/services', {
      params: { q: 'tomada', limit: 20 },
    });
    expect(result).toMatchObject({ total: 1, resultsLimited: false });
    expect(result.services).toHaveLength(1);
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

  it('envia filtros de categoria e subcategoria e aceita a chave services', async () => {
    http.get.mockResolvedValue({ data: { services: [{ id: 5, title: 'C' }] } });

    const result = await useServicesStore
      .getState()
      .fetchServices({ category_id: 2, subcategory_id: 3 });

    expect(http.get).toHaveBeenCalledWith('/api/services', {
      params: { category_id: 2, subcategory_id: 3 },
    });
    expect(result.map((s) => s.id)).toEqual([5]);
  });

  it('servicos do profissional aceitam lista direta e limpam em caso de erro', async () => {
    http.get.mockResolvedValueOnce({ data: [{ id: 1, title: 'A' }] });
    await useServicesStore.getState().fetchMyServices({ page: 2, limit: 10 });
    expect(http.get).toHaveBeenCalledWith('/api/services/my', {
      params: { page: 2, limit: 10 },
    });
    expect(useServicesStore.getState().myServices).toHaveLength(1);

    http.get.mockRejectedValueOnce(new Error('offline'));
    await expect(
      useServicesStore.getState().reloadMyServices(),
    ).resolves.toEqual([]);
    expect(useServicesStore.getState().myServices).toEqual([]);
    expect(useServicesStore.getState().loading).toBe(false);
  });

  it('busca semantica aceita lista direta e propaga erros que nao sao 503', async () => {
    http.get.mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }] });
    await expect(
      useServicesStore.getState().searchServicesSemantically('pintura'),
    ).resolves.toMatchObject({ total: 2, resultsLimited: false });

    const falha = { isAxiosError: true, response: { status: 500 } };
    http.get.mockRejectedValueOnce(falha);
    await expect(
      useServicesStore.getState().searchServicesSemantically('pintura'),
    ).rejects.toBe(falha);
  });

  it('busca por titulo de reserva aceita lista direta', async () => {
    http.get
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 503 } })
      .mockResolvedValueOnce({ data: [{ id: 4 }, { id: 5 }] });
    await expect(
      useServicesStore.getState().searchServicesSemantically('tomada'),
    ).resolves.toMatchObject({ total: 2, resultsLimited: false });
  });

  it('propaga erro na atualizacao', async () => {
    http.put.mockRejectedValue(new Error('409'));
    await expect(
      useServicesStore.getState().updateService(1, {}),
    ).rejects.toThrow('409');
  });
});
