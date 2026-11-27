import { Alert, Linking, Platform } from 'react-native';
import { formatAddressForQuery, openGoogleMaps, openWaze } from '../maps';

const previousOS = Platform.OS;
// O mock do react-native fixa Platform.select no iOS; aqui ele segue o OS.
const setOS = (os: string) => {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });
  jest
    .spyOn(Platform, 'select')
    .mockImplementation(
      (specifics) =>
        (specifics as Record<string, unknown>)[os] ??
        (specifics as Record<string, unknown>).default,
    );
};

const webUrl = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${q}`;

describe('maps', () => {
  let canOpenURL: jest.SpyInstance;
  let openURL: jest.SpyInstance;

  beforeEach(() => {
    canOpenURL = jest.spyOn(Linking, 'canOpenURL');
    openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => previousOS,
    });
  });

  describe('formatAddressForQuery', () => {
    it('acrescenta o pais quando falta e codifica o texto', () => {
      expect(formatAddressForQuery('  Rua A, 10 ')).toBe(
        encodeURIComponent('Rua A, 10, Brasil'),
      );
    });

    it('mantem o endereco que ja cita o pais', () => {
      expect(formatAddressForQuery('Rua A, Brasil')).toBe(
        encodeURIComponent('Rua A, Brasil'),
      );
      expect(formatAddressForQuery('Main St, Brazil')).toBe(
        encodeURIComponent('Main St, Brazil'),
      );
    });
  });

  describe('openGoogleMaps', () => {
    const q = encodeURIComponent('Rua A, Brasil');

    it('abre o app do Google Maps no iOS quando disponivel', async () => {
      setOS('ios');
      canOpenURL.mockResolvedValue(true);
      await openGoogleMaps('Rua A');
      expect(openURL).toHaveBeenCalledWith(`comgooglemaps://?q=${q}`);
    });

    it('usa o link geo no Android', async () => {
      setOS('android');
      canOpenURL.mockResolvedValue(true);
      await openGoogleMaps('Rua A');
      expect(openURL).toHaveBeenCalledWith(`geo:0,0?q=${q}`);
    });

    it('usa o link web em outras plataformas', async () => {
      setOS('web');
      canOpenURL.mockResolvedValue(true);
      await openGoogleMaps('Rua A');
      expect(openURL).toHaveBeenCalledWith(webUrl(q));
    });

    it('cai para o site quando o app nao abre', async () => {
      setOS('ios');
      canOpenURL.mockResolvedValue(false);
      await openGoogleMaps('Rua A');
      expect(openURL).toHaveBeenCalledWith(webUrl(q));
    });

    it('cai para o site quando a verificacao falha', async () => {
      setOS('ios');
      canOpenURL.mockRejectedValue(new Error('sem permissao'));
      await openGoogleMaps('Rua A');
      expect(openURL).toHaveBeenCalledWith(webUrl(q));
    });
  });

  describe('openWaze', () => {
    it('abre o Waze com navegacao', async () => {
      await openWaze('Rua A');
      expect(openURL).toHaveBeenCalledWith(
        `https://waze.com/ul?q=${encodeURIComponent('Rua A, Brasil')}&navigate=yes`,
      );
    });

    it('avisa quando nao consegue abrir o Waze', async () => {
      openURL.mockRejectedValue(new Error('falhou'));
      const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
      await openWaze('Rua A');
      expect(alert).toHaveBeenCalledWith(
        'Erro',
        'Não foi possível abrir o aplicativo Waze.',
      );
    });
  });
});
