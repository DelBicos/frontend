import React from 'react';
import { render, act } from '@testing-library/react-native';
import WebMapRenderer from '../MapRenderer.web';
import { logger } from '@lib/logger';

const mockPanTo = jest.fn();
const captured: Record<string, Record<string, (...args: never[]) => void>> = {};

jest.mock('@react-google-maps/api', () => {
  const { View, Text } = jest.requireActual('react-native');
  return {
    LoadScript: (props: Record<string, unknown>) => {
      captured.loadScript = props as never;
      return <View>{props.children as React.ReactNode}</View>;
    },
    GoogleMap: (props: Record<string, unknown>) => {
      captured.googleMap = props as never;
      return <View>{props.children as React.ReactNode}</View>;
    },
    Marker: (props: { title: string }) => <Text>{props.title}</Text>,
  };
});

const base = { region: null, markerCoords: null, onMapPress: jest.fn() };

const region = {
  latitude: -25.4,
  longitude: -49.2,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const ORIGINAL_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

describe('MapRenderer (web)', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = 'chave-teste';
    mockPanTo.mockClear();
  });
  afterAll(() => {
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = ORIGINAL_KEY;
  });

  it('deve avisar quando falta a chave da API', () => {
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = '';
    const { getByText } = render(<WebMapRenderer {...base} />);
    expect(getByText('API Key do Google Maps não encontrada.')).toBeTruthy();
  });

  it('deve mostrar carregando e o marcador depois de carregar', () => {
    const { getByText, queryByText } = render(
      <WebMapRenderer
        {...base}
        region={region}
        markerCoords={{ latitude: 1, longitude: 2 }}
        address={{ display_name: 'x', formatted: 'Rua C, 3' }}
      />,
    );
    expect(getByText('Iniciando mapa...')).toBeTruthy();
    act(() => {
      captured.googleMap.onLoad({ panTo: mockPanTo } as never);
    });
    expect(queryByText('Iniciando mapa...')).toBeNull();
    expect(getByText('Rua C, 3')).toBeTruthy();
    expect(captured.googleMap.zoom).toBe(15);
  });

  it('deve usar o título padrão e o carregamento do script', () => {
    const { getByText } = render(
      <WebMapRenderer {...base} markerCoords={{ latitude: 1, longitude: 2 }} />,
    );
    act(() => {
      captured.loadScript.onLoad();
    });
    expect(getByText('Local selecionado')).toBeTruthy();
    expect(captured.googleMap.zoom).toBe(12);
  });

  it('deve repassar o clique no mapa e ignorar clique sem posição', () => {
    const onMapPress = jest.fn();
    render(<WebMapRenderer {...base} onMapPress={onMapPress} />);
    act(() => {
      captured.googleMap.onLoad({ panTo: mockPanTo } as never);
    });
    act(() => {
      captured.googleMap.onClick({
        latLng: { lat: () => 5, lng: () => 6 },
      } as never);
    });
    expect(mockPanTo).toHaveBeenCalledWith({ lat: 5, lng: 6 });
    expect(onMapPress).toHaveBeenCalledWith({
      nativeEvent: { coordinate: { latitude: 5, longitude: 6 } },
    });
    act(() => {
      captured.googleMap.onClick({ latLng: null } as never);
    });
    expect(onMapPress).toHaveBeenCalledTimes(1);
  });

  it('deve centralizar no mapa quando a região muda', () => {
    const { rerender } = render(<WebMapRenderer {...base} />);
    act(() => {
      captured.googleMap.onLoad({ panTo: mockPanTo } as never);
    });
    rerender(<WebMapRenderer {...base} region={region} />);
    expect(mockPanTo).toHaveBeenCalledWith({ lat: -25.4, lng: -49.2 });
  });

  it('deve mostrar erro quando o script falha', () => {
    const spy = jest.spyOn(logger, 'error').mockImplementation(() => undefined);
    const { getByText } = render(<WebMapRenderer {...base} />);
    act(() => {
      captured.loadScript.onError(new Error('rede') as never);
    });
    expect(getByText(/Falha na conexão com Google Maps/)).toBeTruthy();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
