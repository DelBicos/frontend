import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { checkForNewNotifications } from '@utils/usePushNotifications';
import { useIBGE } from '../useIBGE';
import { useLocation } from '../useLocation';
import { useNotifications } from '../useNotifications';
import { usePagination } from '../usePagination';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));
jest.mock('@utils/usePushNotifications', () => ({
  checkForNewNotifications: jest.fn(),
}));
jest.mock('@lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const requestPermission =
  Location.requestForegroundPermissionsAsync as jest.Mock;
const getPermission = Location.getForegroundPermissionsAsync as jest.Mock;
const getPosition = Location.getCurrentPositionAsync as jest.Mock;
const checkMock = checkForNewNotifications as jest.Mock;

let fetchMock: jest.Mock;

function jsonResponse(body: unknown) {
  return { json: async () => body };
}

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock = jest.fn();
  global.fetch = fetchMock as unknown as typeof fetch;
});

describe('useIBGE', () => {
  it('carrega os estados e as cidades do estado escolhido', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url.includes('/municipios')
        ? jsonResponse([{ nome: 'Sorocaba' }, { nome: 'Votorantim' }])
        : jsonResponse([{ sigla: 'SP' }, { sigla: 'RJ' }]),
    );
    const { result, rerender } = renderHook(
      ({ uf }: { uf: string }) => useIBGE(uf),
      { initialProps: { uf: '' } },
    );
    await waitFor(() =>
      expect(result.current.states).toEqual([
        { label: 'SP', value: 'SP' },
        { label: 'RJ', value: 'RJ' },
      ]),
    );
    expect(result.current.cities).toEqual([]);

    rerender({ uf: 'SP' });
    expect(result.current.loadingCities).toBe(true);
    await waitFor(() => expect(result.current.loadingCities).toBe(false));
    expect(fetchMock).toHaveBeenCalledWith(
      'https://servicodados.ibge.gov.br/api/v1/localidades/estados/SP/municipios',
    );
    expect(result.current.cities.map((c) => c.value)).toEqual([
      'Sorocaba',
      'Votorantim',
    ]);

    rerender({ uf: '' });
    expect(result.current.cities).toEqual([]);
  });

  it('mantem listas vazias quando a API falha', async () => {
    fetchMock.mockRejectedValue(new Error('rede'));
    const { result } = renderHook(() => useIBGE('SP'));
    await waitFor(() => expect(result.current.loadingCities).toBe(false));
    expect(result.current.states).toEqual([]);
    expect(result.current.cities).toEqual([]);
  });

  it('ignora respostas que chegam depois de desmontar', async () => {
    let resolveStates: (value: unknown) => void = () => undefined;
    let resolveCities: (value: unknown) => void = () => undefined;
    fetchMock.mockImplementation((url: string) =>
      url.includes('/municipios')
        ? new Promise((resolve) => {
            resolveCities = resolve;
          })
        : new Promise((resolve) => {
            resolveStates = resolve;
          }),
    );
    const { result, unmount } = renderHook(() => useIBGE('SP'));
    unmount();
    await act(async () => {
      resolveStates(jsonResponse([{ sigla: 'SP' }]));
      resolveCities(jsonResponse([{ nome: 'Sorocaba' }]));
      await Promise.resolve();
    });
    expect(result.current.states).toEqual([]);
    expect(result.current.cities).toEqual([]);
  });
});

describe('useLocation', () => {
  it('le a permissao atual ao montar, sem solicitar', async () => {
    getPermission.mockResolvedValue({ status: 'granted' });
    const { result } = renderHook(() => useLocation());
    await waitFor(() =>
      expect(result.current.permissionStatus).toBe('granted'),
    );
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it('ignora falha ao ler a permissao inicial', async () => {
    getPermission.mockRejectedValue(new Error('indisponivel'));
    const { result } = renderHook(() => useLocation());
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.permissionStatus).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('solicita permissao e obtem a posicao atual', async () => {
    getPermission.mockResolvedValue({ status: null });
    requestPermission.mockResolvedValue({ status: 'granted' });
    getPosition.mockResolvedValue({
      coords: { latitude: -23.5, longitude: -46.6 },
    });
    const { result } = renderHook(() => useLocation());

    let coords: unknown = null;
    await act(async () => {
      coords = await result.current.fetchCurrentPosition();
    });
    expect(coords).toEqual({ latitude: -23.5, longitude: -46.6 });
    expect(result.current.coords).toEqual(coords);
  });

  it('usa a permissao ja concedida sem perguntar de novo', async () => {
    getPermission.mockResolvedValue({ status: 'granted' });
    getPosition.mockResolvedValue({ coords: { latitude: 1, longitude: 2 } });
    const { result } = renderHook(() => useLocation());
    await waitFor(() =>
      expect(result.current.permissionStatus).toBe('granted'),
    );
    await act(async () => {
      await result.current.fetchCurrentPosition();
    });
    expect(requestPermission).not.toHaveBeenCalled();
    expect(result.current.coords).toEqual({ latitude: 1, longitude: 2 });
  });

  it('informa permissao negada', async () => {
    getPermission.mockResolvedValue({ status: null });
    requestPermission.mockResolvedValue({ status: 'denied' });
    const { result } = renderHook(() => useLocation());
    let coords: unknown;
    await act(async () => {
      coords = await result.current.fetchCurrentPosition();
    });
    expect(coords).toBeNull();
    expect(result.current.error).toBe('Permissão de localização não concedida');
  });

  it('informa erro ao solicitar permissao', async () => {
    getPermission.mockResolvedValue({ status: null });
    requestPermission.mockRejectedValue(new Error('negado pelo sistema'));
    const { result } = renderHook(() => useLocation());
    let status: unknown;
    await act(async () => {
      status = await result.current.requestPermission();
    });
    expect(status).toBeNull();
    expect(result.current.error).toBe('negado pelo sistema');
  });

  it('informa erro ao obter a posicao', async () => {
    getPermission.mockResolvedValue({ status: 'granted' });
    getPosition.mockRejectedValue('gps desligado');
    const { result } = renderHook(() => useLocation());
    await waitFor(() =>
      expect(result.current.permissionStatus).toBe('granted'),
    );
    await act(async () => {
      await result.current.fetchCurrentPosition();
    });
    expect(result.current.error).toBe('gps desligado');
  });
});

describe('useNotifications', () => {
  const pendingForever = () => new Promise<boolean>(() => undefined);

  it('nao consulta sozinho sem usuario', () => {
    renderHook(() => useNotifications(''));
    expect(checkMock).not.toHaveBeenCalled();
  });

  it('consulta ao montar e informa novidades', async () => {
    checkMock.mockResolvedValueOnce(true).mockImplementation(pendingForever);
    const { result, unmount } = renderHook(() =>
      useNotifications('u1', 60_000),
    );
    await waitFor(() => expect(result.current.hasNewNotifications).toBe(true));
    expect(checkMock).toHaveBeenCalledWith('u1', expect.any(Date));
    unmount();
  });

  it('nao inicia nova consulta enquanto outra esta em andamento', async () => {
    checkMock.mockImplementation(pendingForever);
    const { result, unmount } = renderHook(() => useNotifications('u1'));
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await act(async () => {
      await result.current.checkNotifications();
    });
    expect(checkMock).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('consulta manualmente e mantem a data quando nao ha novidades', async () => {
    checkMock.mockResolvedValue(false);
    const { result } = renderHook(() => useNotifications(''));
    const before = result.current.lastChecked;
    await act(async () => {
      await result.current.checkNotifications();
    });
    expect(result.current.hasNewNotifications).toBe(false);
    expect(result.current.lastChecked).toBe(before);
    expect(result.current.isLoading).toBe(false);
  });

  it('expoe a mensagem de erro da consulta', async () => {
    checkMock.mockRejectedValueOnce(new Error('falhou'));
    const { result } = renderHook(() => useNotifications(''));
    await act(async () => {
      await result.current.checkNotifications();
    });
    expect(result.current.error).toBe('falhou');

    checkMock.mockRejectedValueOnce('x');
    await act(async () => {
      await result.current.checkNotifications();
    });
    expect(result.current.error).toBe('Erro desconhecido');
  });
});

describe('usePagination', () => {
  type Item = { id: number };
  const items = (from: number, count: number): Item[] =>
    Array.from({ length: count }, (_, index) => ({ id: from + index }));

  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('carrega a primeira pagina e encerra quando vem incompleta', async () => {
    const fetchData = jest.fn().mockResolvedValue(items(1, 2));
    const { result } = renderHook(() => usePagination<Item>({ fetchData }));
    expect(result.current.loadingInitial).toBe(true);
    await act(async () => {
      await Promise.resolve();
    });
    expect(fetchData).toHaveBeenCalledWith(0, 12);
    expect(result.current.data).toEqual(items(1, 2));
    expect(result.current.hasMore).toBe(false);
    expect(result.current.loadingInitial).toBe(false);
  });

  it('carrega a proxima pagina com debounce e sem duplicar itens', async () => {
    const fetchData = jest
      .fn()
      .mockResolvedValueOnce(items(1, 2))
      .mockResolvedValueOnce(items(2, 2))
      .mockResolvedValueOnce(items(10, 1));
    const { result } = renderHook(() =>
      usePagination<Item>({ fetchData, limit: 2 }),
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.hasMore).toBe(true);

    act(() => {
      result.current.onEndReached();
      result.current.onEndReached();
    });
    await act(async () => {
      jest.advanceTimersByTime(300);
      await Promise.resolve();
    });
    expect(fetchData).toHaveBeenCalledTimes(2);
    expect(fetchData).toHaveBeenLastCalledWith(1, 2);
    expect(result.current.data.map((i) => i.id)).toEqual([1, 2, 3]);
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.onEndReached());
    await act(async () => {
      jest.advanceTimersByTime(300);
      await Promise.resolve();
    });
    expect(fetchData).toHaveBeenLastCalledWith(2, 2);
    expect(result.current.data.map((i) => i.id)).toEqual([1, 2, 3, 10]);
    expect(result.current.hasMore).toBe(false);

    act(() => result.current.onEndReached());
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(fetchData).toHaveBeenCalledTimes(3);
  });

  it('para de paginar quando a proxima pagina vem vazia ou falha', async () => {
    const fetchData = jest
      .fn()
      .mockResolvedValueOnce(items(1, 2))
      .mockResolvedValueOnce([]);
    const { result } = renderHook(() =>
      usePagination<Item>({ fetchData, limit: 2 }),
    );
    await act(async () => {
      await Promise.resolve();
    });
    act(() => result.current.onEndReached());
    await act(async () => {
      jest.advanceTimersByTime(300);
      await Promise.resolve();
    });
    expect(result.current.hasMore).toBe(false);

    const failing = jest
      .fn()
      .mockResolvedValueOnce(items(1, 2))
      .mockRejectedValueOnce(new Error('rede'));
    const second = renderHook(() =>
      usePagination<Item>({ fetchData: failing, limit: 2 }),
    );
    await act(async () => {
      await Promise.resolve();
    });
    act(() => second.result.current.onEndReached());
    await act(async () => {
      jest.advanceTimersByTime(300);
      await Promise.resolve();
    });
    expect(second.result.current.hasMore).toBe(false);
    expect(second.result.current.loadingMore).toBe(false);
  });

  it('encerra a paginacao quando a primeira pagina falha', async () => {
    const fetchData = jest.fn().mockRejectedValue(new Error('rede'));
    const { result } = renderHook(() => usePagination<Item>({ fetchData }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.hasMore).toBe(false);
    expect(result.current.loadingInitial).toBe(false);
  });

  it('ignora a primeira pagina que chega depois de desmontar', async () => {
    let resolveFirst: (value: Item[]) => void = () => undefined;
    let rejectSecond: (reason: unknown) => void = () => undefined;
    const fetchData = jest
      .fn()
      .mockReturnValueOnce(
        new Promise<Item[]>((resolve) => {
          resolveFirst = resolve;
        }),
      )
      .mockReturnValueOnce(
        new Promise<Item[]>((_, reject) => {
          rejectSecond = reject;
        }),
      );
    const first = renderHook(() => usePagination<Item>({ fetchData }));
    first.unmount();
    const second = renderHook(() => usePagination<Item>({ fetchData }));
    second.unmount();
    await act(async () => {
      resolveFirst(items(1, 1));
      rejectSecond(new Error('rede'));
      await Promise.resolve();
    });
    expect(first.result.current.data).toEqual([]);
    expect(second.result.current.hasMore).toBe(true);
  });

  it('cancela o debounce pendente ao desmontar', async () => {
    const fetchData = jest.fn().mockResolvedValue(items(1, 12));
    const { result, unmount } = renderHook(() =>
      usePagination<Item>({ fetchData }),
    );
    await act(async () => {
      await Promise.resolve();
    });
    act(() => result.current.onEndReached());
    unmount();
    jest.advanceTimersByTime(300);
    expect(fetchData).toHaveBeenCalledTimes(1);
  });
});
