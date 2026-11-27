import React from 'react';
import { Image } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { LiveTrackingMap } from '../LiveTrackingMap';

const destination = { latitude: -23.5, longitude: -47.45 };

const layout = (width: number, height: number) => ({
  nativeEvent: { layout: { width, height, x: 0, y: 0 } },
});

describe('LiveTrackingMap', () => {
  it('deve mostrar só a atribuição antes de medir a área', () => {
    const { getByText, queryByLabelText, UNSAFE_queryAllByType } = render(
      <LiveTrackingMap destination={destination} />,
    );

    expect(getByText('© OpenStreetMap')).toBeTruthy();
    expect(queryByLabelText('Endereço do atendimento')).toBeNull();
    expect(UNSAFE_queryAllByType(Image)).toHaveLength(0);
  });

  it('deve desenhar os blocos e o destino no zoom máximo', () => {
    const { getByText, getByLabelText, queryByLabelText, UNSAFE_getAllByType } =
      render(<LiveTrackingMap destination={destination} />);

    fireEvent(getByText('© OpenStreetMap').parent!, 'layout', layout(400, 300));

    expect(getByLabelText('Endereço do atendimento')).toBeTruthy();
    expect(queryByLabelText('Posição do profissional')).toBeNull();
    const tiles = UNSAFE_getAllByType(Image);
    expect(tiles.length).toBeGreaterThan(0);
    expect(tiles[0].props.source.uri).toMatch(
      /^https:\/\/tile\.openstreetmap\.org\/17\/\d+\/\d+\.png$/,
    );
  });

  it('deve afastar o zoom para caber o profissional e o destino', () => {
    const { getByText, getByLabelText, UNSAFE_getAllByType } = render(
      <LiveTrackingMap
        destination={destination}
        professional={{ latitude: -23.6, longitude: -47.3 }}
      />,
    );

    fireEvent(getByText('© OpenStreetMap').parent!, 'layout', layout(400, 300));

    expect(getByLabelText('Posição do profissional')).toBeTruthy();
    const zoom = Number(
      /org\/(\d+)\//.exec(UNSAFE_getAllByType(Image)[0].props.source.uri)?.[1],
    );
    expect(zoom).toBeLessThan(17);
  });

  it('deve usar o zoom mínimo para pontos muito distantes', () => {
    const { getByText, UNSAFE_getAllByType } = render(
      <LiveTrackingMap
        destination={{ latitude: 60, longitude: -170 }}
        professional={{ latitude: -60, longitude: 170 }}
      />,
    );

    fireEvent(getByText('© OpenStreetMap').parent!, 'layout', layout(200, 200));

    const uris = UNSAFE_getAllByType(Image).map((t) => t.props.source.uri);
    expect(uris.every((u: string) => u.includes('.org/3/'))).toBe(true);
  });
});
