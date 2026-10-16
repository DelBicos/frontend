import React, { useRef, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { MapComponentProps } from '@lib/hooks/types';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

interface NativeMapRendererProps extends MapComponentProps {
  style?: any;
}

const NativeMapRenderer: React.FC<NativeMapRendererProps> = ({
  region,
  markerCoords,
  address,
  onMapPress,
  style,
}) => {
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const colors = useColors();
  const styles = createStyles(colors);

  const handleMapReady = () => {
    setMapReady(true);
  };

  const handlePress = (event: any) => {
    const { coordinate } = event.nativeEvent;

    mapRef.current?.animateCamera(
      {
        center: coordinate,
      },
      { duration: 500 },
    );

    if (onMapPress) {
      onMapPress(event);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region as Region}
        onPress={handlePress}
        onMapReady={handleMapReady}
        showsUserLocation={false}
        showsMyLocationButton={false}
        loadingEnabled={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}>
        {markerCoords && (
          <Marker
            coordinate={markerCoords}
            title="Localização Selecionada"
            description={address?.formatted || 'Clique para selecionar'}
            pinColor={colors.primaryBlue}
          />
        )}
      </MapView>

      {!mapReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
          <Text style={styles.loadingText}>Carregando mapa...</Text>
        </View>
      )}
    </View>
  );
};

export default NativeMapRenderer;
