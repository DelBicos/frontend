import { useThemeStore } from '@stores/Theme';
import { ThemeMode } from '@stores/Theme/types';
import lightScheme from './light';
import darkScheme from './dark';
import lightContrastScheme from './light-contrast';
import { ColorsType } from './types';
import { Platform } from 'react-native';

// Static mapping of theme palettes
const themes: Record<ThemeMode, ColorsType> = {
  [ThemeMode.LIGHT]: lightScheme,
  [ThemeMode.DARK]: darkScheme,
  [ThemeMode.LIGHT_HI_CONTRAST]: lightContrastScheme,
};

// Lightweight getter for current theme (reads store/localStorage at call-time)
export const getColors = (): ColorsType => {
  // Prefer reading persisted localStorage on web if present
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('theme-storage');
      if (stored) {
        const parsed = JSON.parse(stored as string);
        const theme = parsed?.state?.theme as ThemeMode | undefined;
        if (theme && themes[theme]) return themes[theme];
      }
    } catch {
      // Ignore parse errors and fallback to store
    }
  }

  // Read the current theme from the zustand store
  const themeFromStore = useThemeStore.getState().theme as
    | ThemeMode
    | undefined;
  if (themeFromStore && themes[themeFromStore]) return themes[themeFromStore];

  return lightScheme;
};

// Default export: a Proxy that resolves color properties lazily from current theme.
// This preserves the existing `import colors from '@theme/colors'` usage while
// ensuring the values reflect the current theme at access time.
const handler: ProxyHandler<any> = {
  get(_, prop: string) {
    const palette = getColors();
    // Return undefined if property doesn't exist on palette
    return (palette as any)[prop];
  },
  // Support enumeration and Object.keys
  ownKeys() {
    return Object.keys(getColors());
  },
  getOwnPropertyDescriptor(_, prop) {
    return {
      configurable: true,
      enumerable: true,
      value: (getColors() as any)[prop],
    } as PropertyDescriptor;
  },
};

const colorsProxy = new Proxy({}, handler) as ColorsType;

export default colorsProxy;
