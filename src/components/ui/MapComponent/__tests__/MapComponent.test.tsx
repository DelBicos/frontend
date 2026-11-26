import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { MapComponent } from '../MapComponent';
import { MapErrorBoundary } from '../MapErrorBoundary';
import { logger } from '@lib/logger';

const mockRenderer = jest.fn();
jest.mock('../../MapRenderer', () => {
  const { Text: MockText } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: (props: { address?: { formatted: string } }) => {
      mockRenderer(props);
      return <MockText>{props.address?.formatted ?? 'mapa'}</MockText>;
    },
  };
});

const Broken = () => {
  throw new Error('falhou');
};

describe('MapComponent', () => {
  it('deve repassar as props para o renderizador', () => {
    const onMapPress = jest.fn();
    const { getByText } = render(
      <MapComponent
        region={{
          latitude: 1,
          longitude: 2,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        markerCoords={{ latitude: 1, longitude: 2 }}
        address={{ display_name: 'x', formatted: 'Rua A, 1' }}
        onMapPress={onMapPress}
      />,
    );
    expect(getByText('Rua A, 1')).toBeTruthy();
    expect(mockRenderer).toHaveBeenCalledWith(
      expect.objectContaining({ onMapPress }),
    );
  });
});

describe('MapErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve renderizar os filhos sem erro', () => {
    const { getByText } = render(
      <MapErrorBoundary>
        <Text>ok</Text>
      </MapErrorBoundary>,
    );
    expect(getByText('ok')).toBeTruthy();
  });

  it('deve mostrar o fallback padrão e registrar o erro', () => {
    const { getByText } = render(
      <MapErrorBoundary>
        <Broken />
      </MapErrorBoundary>,
    );
    expect(getByText('Mapa Indisponível')).toBeTruthy();
    expect(logger.error).toHaveBeenCalled();
  });

  it('deve mostrar o fallback personalizado', () => {
    const { getByText } = render(
      <MapErrorBoundary fallback={<Text>sem mapa</Text>}>
        <Broken />
      </MapErrorBoundary>,
    );
    expect(getByText('sem mapa')).toBeTruthy();
  });
});
