import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useUserStore } from '@stores/User';
import type { Address } from '@stores/User/types';
import { LocationProvider, useLocation } from '../LocationContext';

// A chave da LocationIQ e lida quando o LocationContext carrega. O factory do
// mock do logger roda antes dessa leitura (o logger e importado antes), entao
// e o unico ponto que define a chave antes do modulo testado.
jest.mock('@lib/logger', () => {
  process.env.EXPO_PUBLIC_LOCATIONIQ_API_KEY = 'chave';
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
const okJson = (body: unknown) => ({ ok: true, json: async () => body });

beforeEach(() => {
  fetchMock = jest.fn();
  global.fetch = fetchMock as unknown as typeof fetch;
  useUserStore.setState({ address: null });
});

describe('LocationContext com chave da API', () => {
  it('busca a cidade e formata o endereco brasileiro', async () => {
    fetchMock.mockResolvedValue(
      okJson([
        {
          display_name: 'Rua A, Centro, Sorocaba',
          lat: '-23.5',
          lon: '-47.4',
          address: {
            road: 'Rua A',
            house_number: '10',
            suburb: 'Centro',
            city: 'Sorocaba',
            state: 'SP',
            postcode: '18000000',
            country_code: 'br',
          },
        },
      ]),
    );
    const { result } = renderLocation();
    await act(async () => {
      await result.current.setLocation('Sorocaba', 'SP');
    });
    expect(fetchMock.mock.calls[0][0]).toContain(
      'q=Sorocaba%2C%20SP%2C%20Brazil',
    );
    expect(result.current.address).toMatchObject({
      formatted: 'Rua A, 10, Centro, Sorocaba - SP, 18000-000',
      city: 'Sorocaba',
      state: 'SP',
      lat: '-23.5',
      lng: '-47.4',
      country_iso: 'BR',
    });
    expect(result.current.loading).toBe(false);
  });

  it('usa a cidade digitada quando a busca nao encontra ou falha', async () => {
    const { result } = renderLocation();

    fetchMock.mockResolvedValueOnce(okJson([]));
    await act(async () => {
      await result.current.setLocation('Itu', 'SP');
    });
    expect(result.current.address?.formatted).toBe('Itu - SP');

    fetchMock.mockResolvedValueOnce({ ok: false });
    await act(async () => {
      await result.current.setLocation('Tatui', 'SP');
    });
    expect(result.current.city).toBe('Tatui');

    fetchMock.mockRejectedValueOnce(new Error('rede'));
    await act(async () => {
      await result.current.setLocation('Salto', 'SP');
    });
    expect(result.current.city).toBe('Salto');
    expect(result.current.error).toBeNull();
  });

  it('faz reverse geocoding a partir das coordenadas', async () => {
    fetchMock.mockResolvedValue(
      okJson({
        display_name: 'Algum lugar',
        lat: 1,
        lon: 2,
        address: {
          street: 'Av. B',
          town: 'Piedade',
          state_district: 'Sudeste',
          neighbourhood: 'Piedade',
          postcode: '18170-000',
        },
      }),
    );
    const { result } = renderLocation();
    await act(async () => {
      await result.current.lookupByCoordinates(1, 2);
    });
    expect(fetchMock.mock.calls[0][0]).toContain(
      'reverse?key=chave&lat=1&lon=2',
    );
    expect(result.current.address).toMatchObject({
      formatted: 'Av. B, Piedade - Sudeste, 18170-000',
      road: 'Av. B',
      country_iso: 'BR',
    });
    expect(result.current.error).toBeNull();
  });

  it('usa o display_name quando nao ha componentes de endereco', async () => {
    fetchMock.mockResolvedValueOnce(okJson({ display_name: 'Ponto X' }));
    const { result } = renderLocation();
    await act(async () => {
      await result.current.lookupByCoordinates(1, 2);
    });
    expect(result.current.address?.formatted).toBe('Ponto X');

    fetchMock.mockResolvedValueOnce(okJson({ address: { village: 'Vila' } }));
    await act(async () => {
      await result.current.lookupByCoordinates(1, 2);
    });
    expect(result.current.address?.formatted).toBe('Vila');

    fetchMock.mockResolvedValueOnce(okJson({}));
    await act(async () => {
      await result.current.lookupByCoordinates(1, 2);
    });
    expect(result.current.address?.formatted).toBe('Endereço não identificado');
  });

  it('propaga erros do reverse geocoding', async () => {
    const { result } = renderLocation();
    const lookup = async () => {
      let failure: Error | undefined;
      await act(async () => {
        await result.current.lookupByCoordinates(1, 2).catch((e: Error) => {
          failure = e;
        });
      });
      return failure?.message;
    };

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'erro interno',
    });
    expect(await lookup()).toBe('LocationIQ respondeu com 500: erro interno');
    expect(result.current.error).toBe(
      'LocationIQ respondeu com 500: erro interno',
    );

    fetchMock.mockResolvedValueOnce(okJson({ error: { message: 'Limite' } }));
    expect(await lookup()).toBe('Limite');

    fetchMock.mockResolvedValueOnce(okJson({ error: {} }));
    expect(await lookup()).toBe('Resposta inválida da API');

    expect(result.current.loading).toBe(false);
  });

  it('usa a cidade da conta quando nenhuma foi escolhida', async () => {
    fetchMock.mockResolvedValue(okJson([]));
    act(() => {
      useUserStore.setState({
        address: { city: 'Sorocaba', state: 'SP' } as unknown as Address,
      });
    });
    const { result } = renderLocation();
    await waitFor(() => expect(result.current.city).toBe('Sorocaba'));
    expect(result.current.state).toBe('SP');
  });
});
