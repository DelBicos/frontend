import React from 'react';
import { render, act } from '@testing-library/react-native';
import MapRendererWeb from '../MapRenderer.web';

const mockPanTo = jest.fn();

jest.mock('@lib/logger', () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

jest.mock('@react-google-maps/api', () => {
  const { View } = jest.requireActual('react-native');
  return {
    LoadScript: (props: { children: React.ReactNode }) => (
      <View testID="load-script" {...props} />
    ),
    GoogleMap: (props: { children: React.ReactNode }) => (
      <View testID="google-map" {...props} />
    ),
    Marker: (props: Record<string, unknown>) => <View testID="google-marker" {...props} />,
  };
});

const region = { latitude: -23, longitude: -46, latitudeDelta: 1, longitudeDelta: 1 };
const ORIGINAL_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

describe('MapRenderer (web)', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = 'chave-teste';
    mockPanTo.mockClear();
  });
  afterAll(() => {
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = ORIGINAL_KEY;
  });

  it('avisa quando falta a chave da API', () => {
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = '';
    const { getByText } = render(
      <MapRendererWeb region={region} markerCoords={null} onMapPress={jest.fn()} />,
    );
    expect(getByText('API Key do Google Maps não encontrada.')).toBeTruthy();
  });

  it('mostra erro quando o script do Google falha', () => {
    const { getByTestId, getByText } = render(
      <MapRendererWeb region={region} markerCoords={null} onMapPress={jest.fn()} />,
    );
    act(() => {
      getByTestId('load-script').props.onError(new Error('rede'));
    });
    expect(getByText('❌ Falha na conexão com Google Maps.')).toBeTruthy();
  });

  it('carrega o mapa, mostra o marcador e trata cliques', () => {
    const onMapPress = jest.fn();
    const { getByTestId, getByText, queryByText, queryByTestId, rerender } = render(
      <MapRendererWeb
        region={null}
        markerCoords={{ latitude: -23, longitude: -46 }}
        onMapPress={onMapPress}
      />,
    );
    expect(getByText('Iniciando mapa...')).toBeTruthy();
    expect(queryByTestId('google-marker')).toBeNull();
    expect(getByTestId('google-map').props.zoom).toBe(12);

    act(() => {
      getByTestId('google-map').props.onLoad({ panTo: mockPanTo });
    });
    expect(queryByText('Iniciando mapa...')).toBeNull();
    expect(getByTestId('google-marker').props.title).toBe('Local selecionado');

    act(() => {
      getByTestId('google-map').props.onClick({
        latLng: { lat: () => -22, lng: () => -45 },
      });
    });
    expect(mockPanTo).toHaveBeenCalledWith({ lat: -22, lng: -45 });
    expect(onMapPress).toHaveBeenCalledWith({
      nativeEvent: { coordinate: { latitude: -22, longitude: -45 } },
    });

    act(() => {
      getByTestId('google-map').props.onClick({ latLng: null });
    });
    expect(onMapPress).toHaveBeenCalledTimes(1);

    rerender(
      <MapRendererWeb
        region={region}
        markerCoords={{ latitude: -23, longitude: -46 }}
        address={{ formatted: 'Rua B', display_name: 'Rua B' }}
        onMapPress={onMapPress}
      />,
    );
    expect(mockPanTo).toHaveBeenLastCalledWith({ lat: -23, lng: -46 });
    expect(getByTestId('google-map').props.zoom).toBe(15);
    expect(getByTestId('google-marker').props.title).toBe('Rua B');
  });

  it('marca carregado pelo onLoad do script e aceita clique sem callback', () => {
    const { getByTestId, queryByText } = render(
      <MapRendererWeb
        region={region}
        markerCoords={null}
        onMapPress={undefined as unknown as () => void}
      />,
    );
    act(() => {
      getByTestId('load-script').props.onLoad();
    });
    expect(queryByText('Iniciando mapa...')).toBeNull();
    act(() => {
      getByTestId('google-map').props.onClick({
        latLng: { lat: () => 1, lng: () => 2 },
      });
    });
  });
});
