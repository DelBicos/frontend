import React from 'react';
import { render } from '@testing-library/react-native';
import { MapComponent } from '../MapComponent';

jest.mock('../../MapRenderer', () => {
  const { Text: MockText } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: (props: { region: { latitude: number } }) => (
      <MockText>{`mapa ${props.region.latitude}`}</MockText>
    ),
  };
});

describe('MapComponent', () => {
  it('repassa a regiao ao renderizador de mapa', () => {
    const { getByText } = render(
      <MapComponent
        region={{
          latitude: -23,
          longitude: -46,
          latitudeDelta: 1,
          longitudeDelta: 1,
        }}
        markerCoords={null}
        onMapPress={jest.fn()}
      />,
    );
    expect(getByText('mapa -23')).toBeTruthy();
  });
});
