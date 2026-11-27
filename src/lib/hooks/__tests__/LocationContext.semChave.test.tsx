import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { useUserStore } from '@stores/User';
import { logger } from '@lib/logger';
import { LocationProvider, useLocation } from '../LocationContext';

// A chave da LocationIQ e lida quando o LocationContext carrega. O factory do
// mock do logger roda antes dessa leitura (o logger e importado antes), entao
// e o unico ponto que define a chave antes do modulo testado.
jest.mock('@lib/logger', () => {
  process.env.EXPO_PUBLIC_LOCATIONIQ_API_KEY = '';
  return {
    logger: {
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    },
  };
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LocationProvider>{children}</LocationProvider>
);
const renderLocation = () => renderHook(() => useLocation(), { wrapper });

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = jest.fn();
  global.fetch = fetchMock as unknown as typeof fetch;
  useUserStore.setState({ address: null });
});

describe('LocationContext sem chave da API', () => {
  it('avisa que a chave nao esta configurada', async () => {
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('EXPO_PUBLIC_LOCATIONIQ_API_KEY'),
    );
  });

  it('exige o provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useLocation())).toThrow(
      'useLocation deve ser usado dentro de um LocationProvider',
    );
    jest.restoreAllMocks();
  });

  it('define a cidade sem coordenadas e recusa reverse geocoding', async () => {
    const { result } = renderLocation();
    await act(async () => {
      await result.current.setLocation('Sorocaba', 'SP');
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.city).toBe('Sorocaba');
    expect(result.current.state).toBe('SP');
    expect(result.current.address?.formatted).toBe('Sorocaba - SP');

    let failure: unknown;
    await act(async () => {
      await result.current.lookupByCoordinates(1, 2).catch((e) => {
        failure = e;
      });
    });
    expect((failure as Error).message).toMatch(/não configurada/);
    expect(result.current.error).toMatch(/não configurada/);
  });
});
