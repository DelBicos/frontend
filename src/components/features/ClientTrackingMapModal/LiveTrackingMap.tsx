import React, { useMemo, useState } from 'react';
import { Image, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';

/**
 * Mapa ao vivo com os blocos do OpenStreetMap (sem chave de API).
 * Mostra o destino (casa do cliente) e, quando houver, a posição atual do
 * profissional; o enquadramento se ajusta para os dois pontos caberem na tela.
 */
interface Point {
  latitude: number;
  longitude: number;
}

interface LiveTrackingMapProps {
  destination: Point;
  professional?: Point | null;
}

const TILE_SIZE = 256;
const MAX_ZOOM = 17;
const MIN_ZOOM = 3;
const TILE_URL = 'https://tile.openstreetmap.org';

/** Projeção Web Mercator: coordenada geográfica para pixels no zoom informado. */
function toPixel({ latitude, longitude }: Point, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const latRad = (latitude * Math.PI) / 180;
  return {
    x: ((longitude + 180) / 360) * scale,
    y:
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      scale,
  };
}

/** Maior zoom em que os pontos cabem em 70% da área visível. */
function fitZoom(points: Point[], width: number, height: number) {
  for (let zoom = MAX_ZOOM; zoom > MIN_ZOOM; zoom--) {
    const px = points.map((p) => toPixel(p, zoom));
    const spanX =
      Math.max(...px.map((p) => p.x)) - Math.min(...px.map((p) => p.x));
    const spanY =
      Math.max(...px.map((p) => p.y)) - Math.min(...px.map((p) => p.y));
    if (spanX <= width * 0.7 && spanY <= height * 0.7) return zoom;
  }
  return MIN_ZOOM;
}

export function LiveTrackingMap({
  destination,
  professional,
}: LiveTrackingMapProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  const view = useMemo(() => {
    if (!size.width || !size.height) return null;
    const points = professional ? [destination, professional] : [destination];
    const zoom = fitZoom(points, size.width, size.height);
    const px = points.map((p) => toPixel(p, zoom));
    const center = {
      x: px.reduce((sum, p) => sum + p.x, 0) / px.length,
      y: px.reduce((sum, p) => sum + p.y, 0) / px.length,
    };
    const left = center.x - size.width / 2;
    const top = center.y - size.height / 2;
    const max = 2 ** zoom;
    const tiles: { key: string; uri: string; x: number; y: number }[] = [];
    for (
      let tx = Math.floor(left / TILE_SIZE);
      tx <= Math.floor((left + size.width) / TILE_SIZE);
      tx++
    ) {
      for (
        let ty = Math.floor(top / TILE_SIZE);
        ty <= Math.floor((top + size.height) / TILE_SIZE);
        ty++
      ) {
        if (ty < 0 || ty >= max) continue;
        const wrappedX = ((tx % max) + max) % max;
        tiles.push({
          key: `${zoom}-${tx}-${ty}`,
          uri: `${TILE_URL}/${zoom}/${wrappedX}/${ty}.png`,
          x: tx * TILE_SIZE - left,
          y: ty * TILE_SIZE - top,
        });
      }
    }
    const place = (p: Point) => {
      const pixel = toPixel(p, zoom);
      return { x: pixel.x - left, y: pixel.y - top };
    };
    return {
      tiles,
      destination: place(destination),
      professional: professional ? place(professional) : null,
    };
  }, [size, destination, professional]);

  return (
    <View style={styles.container} onLayout={onLayout}>
      {view?.tiles.map((tile) => (
        <Image
          key={tile.key}
          source={{ uri: tile.uri }}
          style={[styles.tile, { left: tile.x, top: tile.y }]}
        />
      ))}
      {view ? (
        <View
          style={[
            styles.marker,
            styles.destination,
            { left: view.destination.x - 18, top: view.destination.y - 18 },
          ]}
          accessibilityLabel="Endereço do atendimento">
          <Ionicons name="home" size={18} color={colors.primaryWhite} />
        </View>
      ) : null}
      {view?.professional ? (
        <View
          style={[
            styles.marker,
            styles.professional,
            { left: view.professional.x - 18, top: view.professional.y - 18 },
          ]}
          accessibilityLabel="Posição do profissional">
          <Ionicons name="car" size={18} color={colors.primaryWhite} />
        </View>
      ) : null}
      {/* Exigência da licença dos blocos do OpenStreetMap. */}
      <Text style={styles.attribution}>© OpenStreetMap</Text>
    </View>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      overflow: 'hidden',
      backgroundColor: colors.backgroundElevated,
    },
    tile: {
      position: 'absolute',
      width: TILE_SIZE,
      height: TILE_SIZE,
    },
    marker: {
      position: 'absolute',
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.primaryWhite,
    },
    destination: { backgroundColor: colors.primaryBlue },
    professional: { backgroundColor: colors.primaryOrange },
    attribution: {
      position: 'absolute',
      right: 4,
      bottom: 4,
      fontSize: 10,
      paddingHorizontal: 4,
      color: colors.primaryBlack,
      backgroundColor: colors.primaryWhite,
    },
  });
