import { backendHttpClient } from '@lib/helpers/httpClient';
import { useFavoriteStore } from '../Favorite';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

const http = backendHttpClient as unknown as Record<string, jest.Mock>;
const fav = (professionalId: number) =>
  ({ professionalId, professionalName: `P${professionalId}` }) as any;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  useFavoriteStore.setState({ favorites: [], loading: false, error: null });
});

describe('FavoriteStore', () => {
  it('sincroniza com o servidor mapeando os campos', async () => {
    http.get.mockResolvedValue({
      data: {
        favorites: [
          {
            professionalId: 1,
            professionalName: 'Ana',
            professionalAvatar: null,
            lastServiceTitle: 'Corte',
            addedAt: '2026-01-01',
          },
        ],
      },
    });

    await useFavoriteStore.getState().syncWithServer();

    expect(useFavoriteStore.getState().favorites).toEqual([
      {
        professionalId: 1,
        professionalName: 'Ana',
        professionalAvatar: undefined,
        category: undefined,
        serviceTitle: 'Corte',
        addedAt: '2026-01-01',
      },
    ]);
  });

  it('registra erro quando a sincronizacao falha', async () => {
    http.get.mockRejectedValue(new Error('offline'));
    await useFavoriteStore.getState().syncWithServer();
    expect(useFavoriteStore.getState()).toMatchObject({
      loading: false,
      error: 'offline',
    });
  });

  it('adiciona sem duplicar e mantem local se o servidor falhar', async () => {
    http.post.mockRejectedValueOnce(new Error('500'));
    const store = useFavoriteStore.getState();

    await store.addFavorite(fav(1));
    await store.addFavorite(fav(1));

    expect(http.post).toHaveBeenCalledTimes(1);
    expect(useFavoriteStore.getState().favorites).toHaveLength(1);
    expect(useFavoriteStore.getState().isFavorite(1)).toBe(true);
  });

  it('remove e limpa favoritos', async () => {
    http.delete.mockResolvedValue({});
    useFavoriteStore.setState({ favorites: [fav(1), fav(2)] });

    await useFavoriteStore.getState().removeFavorite(1);
    expect(http.delete).toHaveBeenCalledWith('/api/favorites/1');
    expect(useFavoriteStore.getState().isFavorite(1)).toBe(false);

    useFavoriteStore.getState().clearFavorites();
    expect(useFavoriteStore.getState().favorites).toEqual([]);
  });
});
