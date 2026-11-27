import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useThemeStore } from '@stores/Theme';
import { ThemeMode } from '@stores/Theme/types';
import { backendHttpClient } from '@lib/helpers/httpClient';
import lightScheme from '@theme/light';
import darkScheme from '@theme/dark';
import lightContrastScheme from '@theme/light-contrast';
import { useBreakpoint } from '../useBreakpoint';
import { useColors } from '../useColors';
import { resetSubCategoryCache, useServiceSearch } from '../useServiceSearch';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 1400, height: 900, scale: 1, fontScale: 1 }),
}));
jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn() },
}));
jest.mock('@lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const get = backendHttpClient.get as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  resetSubCategoryCache();
});

describe('useBreakpoint', () => {
  it('le a largura da janela e calcula o breakpoint', () => {
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.breakpoint).toBe('expanded');
    expect(result.current.sideInset).toBe(100);
  });
});

describe('useColors', () => {
  it('retorna o esquema do tema escolhido', () => {
    act(() => useThemeStore.setState({ theme: ThemeMode.DARK }));
    const { result, rerender } = renderHook(() => useColors());
    expect(result.current).toBe(darkScheme);

    act(() => useThemeStore.setState({ theme: ThemeMode.LIGHT_HI_CONTRAST }));
    rerender({});
    expect(result.current).toBe(lightContrastScheme);

    act(() => useThemeStore.setState({ theme: ThemeMode.LIGHT }));
    rerender({});
    expect(result.current).toBe(lightScheme);
  });

  it('usa o tema claro quando o tema salvo e desconhecido', () => {
    act(() =>
      useThemeStore.setState({ theme: 'ANTIGO' as unknown as ThemeMode }),
    );
    const { result } = renderHook(() => useColors());
    expect(result.current).toBe(lightScheme);
  });
});

describe('useServiceSearch', () => {
  const subs = [
    { id: 1, title: 'Eletricista', category_id: 1 },
    { id: 2, title: 'Encanador', category_id: 1 },
  ];

  it('limpa os resultados para termo vazio sem buscar', () => {
    const { result } = renderHook(() => useServiceSearch());
    act(() => result.current.search('   '));
    expect(result.current.results).toEqual([]);
    expect(get).not.toHaveBeenCalled();
  });

  it('busca a lista na primeira digitacao e usa o cache depois', async () => {
    get.mockResolvedValue({ data: subs });
    const { result } = renderHook(() => useServiceSearch());
    act(() => result.current.search('ele'));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.results.map((s) => s.id)).toEqual([1]);

    act(() => result.current.search('enc'));
    expect(result.current.results.map((s) => s.id)).toEqual([2]);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('ignora a resposta de um termo ja substituido', async () => {
    get.mockResolvedValue({ data: subs });
    const { result } = renderHook(() => useServiceSearch());
    act(() => {
      result.current.search('ele');
      result.current.search('');
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.results).toEqual([]);
  });

  it('trata lista invalida e falha da API', async () => {
    get.mockResolvedValueOnce({ data: null });
    const { result } = renderHook(() => useServiceSearch());
    act(() => result.current.search('ele'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.results).toEqual([]);

    resetSubCategoryCache();
    get.mockRejectedValueOnce(new Error('rede'));
    act(() => result.current.search('ele'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.results).toEqual([]);
  });
});
