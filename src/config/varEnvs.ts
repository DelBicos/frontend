import { Platform } from 'react-native';
import Constants from 'expo-constants';

type Environment = 'development' | 'staging' | 'production';

const configuredEnvironment = process.env.EXPO_PUBLIC_ENVIRONMENT;
export const ENVIRONMENT: Environment =
  configuredEnvironment === 'development' ||
  configuredEnvironment === 'staging' ||
  configuredEnvironment === 'production'
    ? configuredEnvironment
    : __DEV__
      ? 'development'
      : 'production';
const DOMAIN_WEB = process.env.EXPO_PUBLIC_DOMAIN_WEB;
const DOMAIN_ANDROID = process.env.EXPO_PUBLIC_DOMAIN_ANDROID;
const DOMAIN_IOS = process.env.EXPO_PUBLIC_DOMAIN_IOS;
const PORT = process.env.EXPO_PUBLIC_PORT;
const HTTP_PROTOCOL =
  process.env.EXPO_PUBLIC_HTTP_PROTOCOL ??
  (ENVIRONMENT === 'development' ? 'http' : undefined);
const WS_PROTOCOL =
  process.env.EXPO_PUBLIC_WS_PROTOCOL ??
  (ENVIRONMENT === 'development' ? 'ws' : undefined);

const configuredDomain = Platform.select({
  android: DOMAIN_ANDROID,
  ios: DOMAIN_IOS,
  web: DOMAIN_WEB,
});

const LOCAL_DEVELOPMENT_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '10.0.2.2',
  'host.docker.internal',
]);

function hostnameFromUri(value?: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value.includes('://') ? value : `http://${value}`);
    return url.hostname || undefined;
  } catch {
    return undefined;
  }
}

function runtimeDevelopmentHost(): string | undefined {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname || undefined;
  }

  const nativeHost = hostnameFromUri(
    Constants.expoConfig?.hostUri ??
      Constants.expoGoConfig?.debuggerHost ??
      Constants.platform?.hostUri,
  );
  return nativeHost === '0.0.0.0' || nativeHost === '::'
    ? undefined
    : nativeHost;
}

function resolveDomain(): string {
  if (ENVIRONMENT !== 'development') {
    if (!configuredDomain) {
      throw new Error(
        `Domínio do backend não configurado para ${Platform.OS} em ${ENVIRONMENT}.`,
      );
    }
    return configuredDomain;
  }

  const runtimeHost = runtimeDevelopmentHost();
  if (
    runtimeHost &&
    (!configuredDomain ||
      LOCAL_DEVELOPMENT_HOSTS.has(configuredDomain.toLowerCase()))
  ) {
    return runtimeHost;
  }

  if (configuredDomain) return configuredDomain;
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

function formatHost(host: string): string {
  return host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;
}

if (!HTTP_PROTOCOL || !WS_PROTOCOL) {
  throw new Error(
    `Protocolos HTTP/WS não configurados para o ambiente ${ENVIRONMENT}.`,
  );
}

const resolvedHost = formatHost(resolveDomain());
const DOMAIN = PORT ? `${resolvedHost}:${PORT}` : resolvedHost;

export const HTTP_DOMAIN = `${HTTP_PROTOCOL}://${DOMAIN}`;

export const WS_DOMAIN = `${WS_PROTOCOL}://${DOMAIN}`;

export const UNSPLASH_API_KEY = process.env.EXPO_PUBLIC_UNSPLASH_API_KEY || '';

export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

export const GOOGLE_ANALYTICS_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANALYTICS_ID || '';

export const CLARITY_ID = process.env.EXPO_PUBLIC_CLARITY_ID || '';
