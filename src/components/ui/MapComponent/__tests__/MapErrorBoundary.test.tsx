import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import MapErrorBoundary from '../MapErrorBoundary';

jest.mock('@lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const Boom = () => {
  throw new Error('falhou');
};

describe('MapErrorBoundary', () => {
  let errorSpy: jest.SpyInstance;
  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => errorSpy.mockRestore());

  it('mostra os filhos quando nao ha erro', () => {
    const { getByText } = render(
      <MapErrorBoundary>
        <Text>mapa</Text>
      </MapErrorBoundary>,
    );
    expect(getByText('mapa')).toBeTruthy();
  });

  it('mostra o aviso padrao quando o mapa quebra', () => {
    const { getByText } = render(
      <MapErrorBoundary>
        <Boom />
      </MapErrorBoundary>,
    );
    expect(getByText('Mapa Indisponível')).toBeTruthy();
    const { logger } = jest.requireMock('@lib/logger');
    expect(logger.error).toHaveBeenCalled();
  });

  it('usa o fallback recebido', () => {
    const { getByText } = render(
      <MapErrorBoundary fallback={<Text>sem mapa</Text>}>
        <Boom />
      </MapErrorBoundary>,
    );
    expect(getByText('sem mapa')).toBeTruthy();
  });
});
