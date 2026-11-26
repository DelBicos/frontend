import { backendHttpClient } from '@lib/helpers/httpClient';
import { Professional } from '@stores/Professional/types';
import { useProfessionalStore } from '../Professional';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), put: jest.fn() },
}));

const http = backendHttpClient as unknown as Record<string, jest.Mock>;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  useProfessionalStore.setState({
    professionals: [],
    selectedProfessional: null,
  });
});

describe('ProfessionalStore - listagem', () => {
  it('normaliza o formato novo da API', async () => {
    http.get.mockResolvedValue({
      data: [
        {
          id: 7,
          name: 'Lia',
          rating: '4.5',
          ratings_count: '12',
          verified: 1,
          avatar_uri: 'https://img/lia.png',
          MainAddress: { city: 'Campinas', state: 'SP' },
          distance_km: '3.2',
          Services: ['Corte', { title: 'Barba' }],
        },
      ],
    });

    const listed = await useProfessionalStore
      .getState()
      .fetchProfessionals('corte', 2, 10, -22.9, -47.06);

    expect(http.get).toHaveBeenCalledWith('/api/professionals', {
      params: {
        termo: 'corte',
        page: 2,
        limit: 10,
        lat: -22.9,
        lng: -47.06,
      },
    });
    expect(listed).toEqual([
      {
        id: 7,
        name: 'Lia',
        rating: 4.5,
        ratingsCount: 12,
        verified: true,
        imageUrl: 'https://img/lia.png',
        location: 'Campinas, SP',
        distance: 3.2,
        offeredServices: ['Corte', 'Barba'],
        category: 'Corte',
      },
    ]);
  });

  it('aceita a lista embrulhada e preenche o que a API omitiu', async () => {
    http.get.mockResolvedValue({
      data: {
        professionals: [
          {
            id: 1,
            User: { name: 'Otto', avatar_uri: 'https://img/otto.png' },
            dataValues: { distance_km: 1 },
          },
        ],
      },
    });

    const listed = await useProfessionalStore.getState().fetchProfessionals();

    expect(http.get).toHaveBeenCalledWith('/api/professionals', {
      params: { limit: 12 },
    });
    expect(listed[0]).toMatchObject({
      name: 'Otto',
      imageUrl: 'https://img/otto.png',
      location: 'Localização não informada',
      distance: 1,
      offeredServices: ['Serviços Gerais'],
      category: 'Serviços Diversos',
      rating: 0,
      ratingsCount: 0,
    });
  });

  it('devolve lista vazia quando a busca falha', async () => {
    http.get.mockRejectedValue(new Error('offline'));
    await expect(
      useProfessionalStore.getState().fetchProfessionals('ana'),
    ).resolves.toEqual([]);
  });
});

describe('ProfessionalStore - perfil', () => {
  it('calcula a media so das avaliacoes com nota', async () => {
    const raw = {
      id: 5,
      Appointments: [{ rating: 4 }, { rating: 5 }, { review: 'sem nota' }],
    };
    http.get.mockResolvedValue({ status: 200, data: raw });

    const professional = await useProfessionalStore
      .getState()
      .fetchProfessionalById(5);

    expect(http.get).toHaveBeenCalledWith('/api/professionals/5');
    expect(professional).toMatchObject({ rating: 4.5, ratings_count: 2 });
    expect(useProfessionalStore.getState().selectedProfessional).toMatchObject({
      id: 5,
      rating: 4.5,
    });
  });

  it('limpa a selecao quando o perfil nao vem', async () => {
    http.get.mockResolvedValue({ status: 404, data: null });
    await expect(
      useProfessionalStore.getState().fetchProfessionalById(9),
    ).resolves.toBeNull();
    expect(useProfessionalStore.getState().selectedProfessional).toBeNull();
  });
});

describe('ProfessionalStore - raio', () => {
  it('arredonda para baixo e atualiza o perfil aberto', async () => {
    useProfessionalStore.setState({
      selectedProfessional: { id: 3, service_radius_km: 1 } as Professional,
    });
    http.put.mockResolvedValue({});

    await useProfessionalStore.getState().updateRadius(3, 12.8);

    expect(http.put).toHaveBeenCalledWith('/api/professionals/3/radius', {
      service_radius_km: 12,
    });
    expect(
      useProfessionalStore.getState().selectedProfessional?.service_radius_km,
    ).toBe(12);
  });

  it('nao altera outro perfil que esteja aberto', async () => {
    useProfessionalStore.setState({
      selectedProfessional: { id: 8, service_radius_km: 4 } as Professional,
    });
    http.put.mockResolvedValue({});

    await useProfessionalStore.getState().updateRadius(3, 10);

    expect(
      useProfessionalStore.getState().selectedProfessional?.service_radius_km,
    ).toBe(4);
  });
});

describe('ProfessionalStore - disponibilidade', () => {
  it('repassa o resultado da busca por horario', async () => {
    const found = [{ id: 9, name: 'Lia' }];
    http.get.mockResolvedValue({ data: found });

    await expect(
      useProfessionalStore
        .getState()
        .fetchProfessionalsByAvailability(3, '2026-07-05', 1, 2),
    ).resolves.toEqual(found);
    expect(http.get).toHaveBeenCalledWith(
      '/api/professionals/search-availability',
      { params: { subCategoryId: 3, date: '2026-07-05', lat: 1, lng: 2 } },
    );
  });

  it('propaga a falha para a tela distinguir de lista vazia', async () => {
    http.get.mockRejectedValue(new Error('offline'));
    await expect(
      useProfessionalStore
        .getState()
        .fetchProfessionalsByAvailability(3, '2026-07-05'),
    ).rejects.toThrow('offline');
  });
});
