import { Platform } from 'react-native';

type VarEnvs = typeof import('../varEnvs');

type ConstantsShape = {
  expoConfig?: { hostUri?: string } | null;
  expoGoConfig?: { debuggerHost?: string } | null;
  platform?: { hostUri?: string } | null;
};

const ENV_KEYS = [
  'EXPO_PUBLIC_ENVIRONMENT',
  'EXPO_PUBLIC_DOMAIN_WEB',
  'EXPO_PUBLIC_DOMAIN_ANDROID',
  'EXPO_PUBLIC_DOMAIN_IOS',
  'EXPO_PUBLIC_PORT',
  'EXPO_PUBLIC_HTTP_PROTOCOL',
  'EXPO_PUBLIC_WS_PROTOCOL',
  'EXPO_PUBLIC_UNSPLASH_API_KEY',
  'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'EXPO_PUBLIC_GOOGLE_ANALYTICS_ID',
  'EXPO_PUBLIC_CLARITY_ID',
] as const;

const savedEnv: Record<string, string | undefined> = {};
const g = global as unknown as { window?: unknown; __DEV__?: boolean };
const originalWindow = g.window;
const originalDev = g.__DEV__;

/** Carrega o modulo do zero com o ambiente, a plataforma e o Expo informados. */
const load = (
  env: Partial<Record<(typeof ENV_KEYS)[number], string>>,
  {
    os = 'ios',
    constants = {},
    dev = true,
  }: { os?: string; constants?: ConstantsShape; dev?: boolean } = {},
): VarEnvs => {
  ENV_KEYS.forEach((key) => delete process.env[key]);
  Object.assign(process.env, env);
  g.__DEV__ = dev;
  let mod: VarEnvs | undefined;
  jest.isolateModules(() => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      default: constants,
    }));
    // isolateModules cria outra instancia do react-native: ajusta esta.
    const { Platform: isolated } = require('react-native') as {
      Platform: typeof Platform;
    };
    Object.defineProperty(isolated, 'OS', {
      configurable: true,
      get: () => os,
    });
    jest
      .spyOn(isolated, 'select')
      .mockImplementation(
        (specifics) => (specifics as Record<string, unknown>)[os],
      );
    mod = require('../varEnvs') as VarEnvs;
  });
  return mod as VarEnvs;
};

beforeAll(() => {
  ENV_KEYS.forEach((key) => {
    savedEnv[key] = process.env[key];
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  ENV_KEYS.forEach((key) => {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  });
  g.window = originalWindow;
  g.__DEV__ = originalDev;
});

describe('varEnvs', () => {
  it('em producao usa o dominio configurado da plataforma', () => {
    const env = load({
      EXPO_PUBLIC_ENVIRONMENT: 'production',
      EXPO_PUBLIC_DOMAIN_IOS: 'api.exemplo.test',
      EXPO_PUBLIC_HTTP_PROTOCOL: 'https',
      EXPO_PUBLIC_WS_PROTOCOL: 'wss',
      EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_x',
      EXPO_PUBLIC_UNSPLASH_API_KEY: 'u',
      EXPO_PUBLIC_GOOGLE_ANALYTICS_ID: 'G-1',
      EXPO_PUBLIC_CLARITY_ID: 'c1',
    });
    expect(env.ENVIRONMENT).toBe('production');
    expect(env.HTTP_DOMAIN).toBe('https://api.exemplo.test');
    expect(env.WS_DOMAIN).toBe('wss://api.exemplo.test');
    expect(env.STRIPE_PUBLISHABLE_KEY).toBe('pk_test_x');
    expect(env.UNSPLASH_API_KEY).toBe('u');
    expect(env.GOOGLE_ANALYTICS_ID).toBe('G-1');
    expect(env.CLARITY_ID).toBe('c1');
  });

  it('chaves opcionais ausentes viram texto vazio', () => {
    const env = load(
      {
        EXPO_PUBLIC_ENVIRONMENT: 'staging',
        EXPO_PUBLIC_DOMAIN_ANDROID: 'stg.exemplo.test',
        EXPO_PUBLIC_HTTP_PROTOCOL: 'https',
        EXPO_PUBLIC_WS_PROTOCOL: 'wss',
      },
      { os: 'android' },
    );
    expect(env.HTTP_DOMAIN).toBe('https://stg.exemplo.test');
    expect(env.STRIPE_PUBLISHABLE_KEY).toBe('');
    expect(env.UNSPLASH_API_KEY).toBe('');
    expect(env.GOOGLE_ANALYTICS_ID).toBe('');
    expect(env.CLARITY_ID).toBe('');
  });

  it('fora de desenvolvimento exige o dominio da plataforma', () => {
    expect(() =>
      load({
        EXPO_PUBLIC_ENVIRONMENT: 'production',
        EXPO_PUBLIC_HTTP_PROTOCOL: 'https',
        EXPO_PUBLIC_WS_PROTOCOL: 'wss',
      }),
    ).toThrow('Domínio do backend não configurado para ios em production.');
  });

  it('fora de desenvolvimento exige os protocolos', () => {
    expect(() =>
      load({
        EXPO_PUBLIC_ENVIRONMENT: 'production',
        EXPO_PUBLIC_DOMAIN_IOS: 'api.exemplo.test',
      }),
    ).toThrow(
      'Protocolos HTTP/WS não configurados para o ambiente production.',
    );
  });

  it('sem ambiente definido segue o __DEV__', () => {
    expect(load({}, { dev: true }).ENVIRONMENT).toBe('development');
    expect(() =>
      load({ EXPO_PUBLIC_ENVIRONMENT: 'outro' }, { dev: false }),
    ).toThrow(/Protocolos HTTP\/WS/);
  });

  it('em desenvolvimento usa http/ws e a porta configurada', () => {
    const env = load(
      { EXPO_PUBLIC_ENVIRONMENT: 'development', EXPO_PUBLIC_PORT: '3000' },
      { os: 'ios' },
    );
    expect(env.HTTP_DOMAIN).toBe('http://localhost:3000');
    expect(env.WS_DOMAIN).toBe('ws://localhost:3000');
  });

  it('em desenvolvimento no Android sem host usa o emulador', () => {
    const env = load(
      { EXPO_PUBLIC_ENVIRONMENT: 'development' },
      { os: 'android' },
    );
    expect(env.HTTP_DOMAIN).toBe('http://10.0.2.2');
  });

  it('em desenvolvimento usa o host do Metro no lugar de um dominio local', () => {
    const env = load(
      {
        EXPO_PUBLIC_ENVIRONMENT: 'development',
        EXPO_PUBLIC_DOMAIN_IOS: 'LOCALHOST',
        EXPO_PUBLIC_PORT: '3000',
      },
      { constants: { expoConfig: { hostUri: '192.168.0.10:8081' } } },
    );
    expect(env.HTTP_DOMAIN).toBe('http://192.168.0.10:3000');
  });

  it('le o host do Expo Go e da plataforma quando faltam os outros', () => {
    expect(
      load(
        { EXPO_PUBLIC_ENVIRONMENT: 'development' },
        {
          constants: {
            expoGoConfig: { debuggerHost: 'http://10.1.1.1:19000' },
          },
        },
      ).HTTP_DOMAIN,
    ).toBe('http://10.1.1.1');

    expect(
      load(
        { EXPO_PUBLIC_ENVIRONMENT: 'development' },
        { constants: { platform: { hostUri: 'fe80::1' } } },
      ).HTTP_DOMAIN,
    ).toBe('http://localhost');
  });

  it('ignora hosts genericos ou invalidos do Metro', () => {
    expect(
      load(
        { EXPO_PUBLIC_ENVIRONMENT: 'development' },
        { constants: { expoConfig: { hostUri: '0.0.0.0:8081' } } },
      ).HTTP_DOMAIN,
    ).toBe('http://localhost');

    expect(
      load(
        { EXPO_PUBLIC_ENVIRONMENT: 'development' },
        { constants: { expoConfig: { hostUri: 'http://[::1' } } },
      ).HTTP_DOMAIN,
    ).toBe('http://localhost');
  });

  it('mantem um dominio de desenvolvimento que nao e local', () => {
    const env = load(
      {
        EXPO_PUBLIC_ENVIRONMENT: 'development',
        EXPO_PUBLIC_DOMAIN_IOS: 'dev.exemplo.test',
      },
      { constants: { expoConfig: { hostUri: '192.168.0.10:8081' } } },
    );
    expect(env.HTTP_DOMAIN).toBe('http://dev.exemplo.test');
  });

  it('no web em desenvolvimento usa o host da pagina e trata IPv6', () => {
    g.window = { location: { hostname: 'app.exemplo.test' } };
    expect(
      load({ EXPO_PUBLIC_ENVIRONMENT: 'development' }, { os: 'web' })
        .HTTP_DOMAIN,
    ).toBe('http://app.exemplo.test');

    g.window = { location: { hostname: '' } };
    expect(
      load(
        {
          EXPO_PUBLIC_ENVIRONMENT: 'development',
          EXPO_PUBLIC_DOMAIN_WEB: '::1',
        },
        { os: 'web' },
      ).HTTP_DOMAIN,
    ).toBe('http://[::1]');
  });
});
