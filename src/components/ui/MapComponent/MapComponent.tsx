import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import MapRenderer from '../MapRenderer';
import { MapComponentProps } from './types';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
// eslint-disable-next-line import/no-named-as-default
import MapErrorBoundary from '@components/ui/MapComponent/MapErrorBoundary';

export const MapComponent: React.FC<MapComponentProps> = ({
  region,
  markerCoords,
  formattedAddress,
  onMapPress,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <MapErrorBoundary>
        <MapRenderer
          region={region}
          markerCoords={markerCoords}
          formattedAddress={formattedAddress}
          onMapPress={onMapPress}
          style={styles.mapRenderer}
        />
      </MapErrorBoundary>
    </View>
  );
};

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.inputBackground,
    },
    mapRenderer: {
      flex: 1,
      width: '100%',
      height: '100%',
      ...Platform.select({
        web: {
          minHeight: 300,
        },
      }),
    },
  });
