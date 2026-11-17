import { Platform } from 'react-native';
import { webStyle } from '../webStyle';

describe('webStyle', () => {
  const previousOS = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => previousOS,
    });
  });

  it('devolve o estilo somente no web', () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'web',
    });
    expect(webStyle({ cursor: 'pointer' })).toEqual({ cursor: 'pointer' });

    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'ios',
    });
    expect(webStyle({ cursor: 'pointer' })).toEqual({});
  });
});
