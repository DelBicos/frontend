import { UNSPLASH_API_KEY } from '@config/varEnvs';
import { useUnsplashStore } from '../Unsplash';

const fetchMock = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  global.fetch = fetchMock as unknown as typeof fetch;
});

describe('UnsplashStore', () => {
  it('devolve a url pequena da foto aleatoria', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      statusText: 'OK',
      json: async () => ({ urls: { small: 'https://img/small.jpg' } }),
    });

    await expect(
      useUnsplashStore.getState().fetchRandomPhoto('corte'),
    ).resolves.toBe('https://img/small.jpg');

    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.unsplash.com/photos/random?query=corte&client_id=${UNSPLASH_API_KEY}`,
    );
  });

  it('devolve nulo quando o Unsplash recusa ou a rede falha', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      statusText: 'Forbidden',
      json: async () => ({}),
    });
    await expect(
      useUnsplashStore.getState().fetchRandomPhoto('corte'),
    ).resolves.toBeNull();

    fetchMock.mockRejectedValueOnce(new Error('offline'));
    await expect(
      useUnsplashStore.getState().fetchRandomPhoto('corte'),
    ).resolves.toBeNull();
  });
});
