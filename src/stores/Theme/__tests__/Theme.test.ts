import { Platform } from 'react-native';
import { ThemeMode } from '../types';
import { useThemeStore } from '../Theme';

function setPlatform(os: string) {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });
}

describe('ThemeStore', () => {
  const previousOS = Platform.OS;

  afterEach(() => {
    setPlatform(previousOS);
  });

  it('guarda e devolve o tema escolhido', () => {
    useThemeStore.getState().setTheme(ThemeMode.DARK);
    expect(useThemeStore.getState().getTheme()).toBe(ThemeMode.DARK);
    useThemeStore.getState().setTheme(ThemeMode.LIGHT_HI_CONTRAST);
    expect(useThemeStore.getState().theme).toBe(ThemeMode.LIGHT_HI_CONTRAST);
  });

  it('no web espelha a escolha no localStorage', () => {
    const setItem = jest.fn();
    const previousStorage = global.localStorage;
    Object.defineProperty(global, 'localStorage', {
      configurable: true,
      value: { setItem },
    });
    setPlatform('web');

    useThemeStore.getState().setTheme(ThemeMode.DARK);

    expect(setItem).toHaveBeenCalledWith(
      'theme-storage',
      JSON.stringify({ state: { theme: ThemeMode.DARK }, version: 0 }),
    );

    Object.defineProperty(global, 'localStorage', {
      configurable: true,
      value: previousStorage,
    });
  });
});
