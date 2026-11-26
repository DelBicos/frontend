import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import MapRenderer from '..';

const mockAnimateCamera = jest.fn();

jest.mock('react-native-maps', () => {
  const ReactActual = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  const MockMapView = ReactActual.forwardRef(
    (props: Record<string, unknown>, ref: unknown) => {
      ReactActual.useImperativeHandle(ref, () => ({
        animateCamera: mockAnimateCamera,
      }));
      return <View testID="map-view" {...props} />;
    },
  );
  const MockMarker = (props: Record<string, unknown>) => (
    <View testID="map-marker" {...props} />
  );
  return { __esModule: true, default: MockMapView, Marker: MockMarker };
});

const region = { latitude: -23, longitude: -46, latitudeDelta: 1, longitudeDelta: 1 };
const pressEvent = { nativeEvent: { coordinate: { latitude: -22, longitude: -45 } } };

describe('MapRenderer (nativo)', () => {
  beforeEach(() => mockAnimateCamera.mockClear());

  it('mostra carregando ate o mapa ficar pronto', () => {
    const { getByText, queryByText, getByTestId } = render(
      <MapRenderer region={region} markerCoords={null} onMapPress={jest.fn()} />,
    );
    expect(getByText('Carregando mapa...')).toBeTruthy();
    act(() => {
      getByTestId('map-view').props.onMapReady();
    });
    expect(queryByText('Carregando mapa...')).toBeNull();
  });

  it('move a camera e avisa o toque no mapa', () => {
    const onMapPress = jest.fn();
    const { getByTestId } = render(
      <MapRenderer region={region} markerCoords={null} onMapPress={onMapPress} />,
    );
    fireEvent.press(getByTestId('map-view'), pressEvent);
    expect(mockAnimateCamera).toHaveBeenCalledWith(
      { center: pressEvent.nativeEvent.coordinate },
      { duration: 500 },
    );
    expect(onMapPress).toHaveBeenCalledWith(pressEvent);
  });

  it('funciona sem callback de toque', () => {
    const { getByTestId } = render(
      <MapRenderer
        region={region}
        markerCoords={null}
        onMapPress={undefined as unknown as () => void}
      />,
    );
    fireEvent.press(getByTestId('map-view'), pressEvent);
    expect(mockAnimateCamera).toHaveBeenCalled();
  });

  it('mostra o marcador com o endereco', () => {
    const { getByTestId, rerender } = render(
      <MapRenderer
        region={region}
        markerCoords={{ latitude: -23, longitude: -46 }}
        address={{ formatted: 'Rua A, 10', display_name: 'Rua A, 10' }}
        onMapPress={jest.fn()}
      />,
    );
    expect(getByTestId('map-marker').props.description).toBe('Rua A, 10');
    rerender(
      <MapRenderer
        region={region}
        markerCoords={{ latitude: -23, longitude: -46 }}
        onMapPress={jest.fn()}
      />,
    );
    expect(getByTestId('map-marker').props.description).toBe('Clique para selecionar');
  });
});
