import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MapRenderer from '../MapRenderer';

const mockAnimateCamera = jest.fn();

jest.mock('react-native-maps', () => {
  const ReactActual = jest.requireActual('react');
  const { View, Text } = jest.requireActual('react-native');
  const MapView = ReactActual.forwardRef(
    (props: Record<string, unknown>, ref: unknown) => {
      ReactActual.useImperativeHandle(ref, () => ({
        animateCamera: mockAnimateCamera,
      }));
      return <View testID="map-view" {...props} />;
    },
  );
  const Marker = (props: { description: string }) => (
    <Text>{props.description}</Text>
  );
  return { __esModule: true, default: MapView, Marker };
});

const base = { region: null, markerCoords: null, onMapPress: jest.fn() };

const region = {
  latitude: -25.4,
  longitude: -49.2,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

describe('MapRenderer (nativo)', () => {
  it('deve mostrar carregando até o mapa ficar pronto', () => {
    const { getByText, queryByText, getByTestId } = render(
      <MapRenderer {...base} region={region} />,
    );
    expect(getByText('Carregando mapa...')).toBeTruthy();
    fireEvent(getByTestId('map-view'), 'mapReady');
    expect(queryByText('Carregando mapa...')).toBeNull();
  });

  it('deve exibir o marcador com o endereço ou o texto padrão', () => {
    const { getByText, rerender } = render(
      <MapRenderer
        {...base}
        region={region}
        markerCoords={{ latitude: 1, longitude: 2 }}
        address={{ display_name: 'x', formatted: 'Rua B, 2' }}
      />,
    );
    expect(getByText('Rua B, 2')).toBeTruthy();
    rerender(
      <MapRenderer
        {...base}
        region={region}
        markerCoords={{ latitude: 1, longitude: 2 }}
      />,
    );
    expect(getByText('Clique para selecionar')).toBeTruthy();
  });

  it('deve centralizar a câmera e repassar o toque', () => {
    const onMapPress = jest.fn();
    const { getByTestId, rerender } = render(
      <MapRenderer {...base} region={region} onMapPress={onMapPress} />,
    );
    const event = {
      nativeEvent: { coordinate: { latitude: 3, longitude: 4 } },
    };
    fireEvent(getByTestId('map-view'), 'press', event);
    expect(mockAnimateCamera).toHaveBeenCalledWith(
      { center: { latitude: 3, longitude: 4 } },
      { duration: 500 },
    );
    expect(onMapPress).toHaveBeenCalledWith(event);

    rerender(<MapRenderer {...base} region={region} />);
    fireEvent(getByTestId('map-view'), 'press', event);
    expect(onMapPress).toHaveBeenCalledTimes(1);
  });
});
