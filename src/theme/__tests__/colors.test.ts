import { Platform } from 'react-native';
import { useThemeStore } from '@stores/Theme';
import { ThemeMode } from '@stores/Theme/types';
import colors, { getColors } from '../colors';
import lightScheme from '../light';
import darkScheme from '../dark';
import lightContrastScheme from '../light-contrast';

const previousOS = Platform.OS;
const setOS = (os: string) =>
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });

const g = global as unknown as { localStorage?: unknown };
const originalStorage = g.localStorage;

const fakeStorage = (value: string | null) => ({
  getItem: jest.fn(() => value),
});

afterEach(() => {
  setOS(previousOS);
  g.localStorage = originalStorage;
  useThemeStore.setState({ theme: ThemeMode.LIGHT });
});

describe('getColors', () => {
  it('no app usa o tema da store', () => {
    setOS('ios');
    useThemeStore.setState({ theme: ThemeMode.DARK });
    expect(getColors()).toBe(darkScheme);
  });

  it('cai para o tema claro quando a store tem tema desconhecido', () => {
    setOS('ios');
    useThemeStore.setState({ theme: 'OUTRO' as unknown as ThemeMode });
    expect(getColors()).toBe(lightScheme);
  });

  it('no web prefere o tema salvo no localStorage', () => {
    setOS('web');
    g.localStorage = fakeStorage(
      JSON.stringify({ state: { theme: ThemeMode.LIGHT_HI_CONTRAST } }),
    );
    useThemeStore.setState({ theme: ThemeMode.DARK });
    expect(getColors()).toBe(lightContrastScheme);
  });

  it('no web usa a store quando o localStorage esta vazio, invalido ou desconhecido', () => {
    setOS('web');
    useThemeStore.setState({ theme: ThemeMode.DARK });

    g.localStorage = fakeStorage(null);
    expect(getColors()).toBe(darkScheme);

    g.localStorage = fakeStorage('{nao e json');
    expect(getColors()).toBe(darkScheme);

    g.localStorage = fakeStorage(JSON.stringify({ state: { theme: 'X' } }));
    expect(getColors()).toBe(darkScheme);
  });

  it('no web sem localStorage usa a store', () => {
    setOS('web');
    delete g.localStorage;
    useThemeStore.setState({ theme: ThemeMode.DARK });
    expect(getColors()).toBe(darkScheme);
  });
});

describe('colors (proxy)', () => {
  it('resolve cada cor pelo tema atual no momento do acesso', () => {
    setOS('ios');
    useThemeStore.setState({ theme: ThemeMode.LIGHT });
    expect(colors.primaryBlue).toBe(lightScheme.primaryBlue);

    useThemeStore.setState({ theme: ThemeMode.DARK });
    expect(colors.primaryBlue).toBe(darkScheme.primaryBlue);
  });

  it('permite enumerar e espalhar as cores', () => {
    setOS('ios');
    useThemeStore.setState({ theme: ThemeMode.DARK });
    expect(Object.keys(colors)).toEqual(Object.keys(darkScheme));
    expect({ ...colors }).toEqual(darkScheme);
  });
});
