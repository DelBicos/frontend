import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { MapComponentProps } from '@lib/hooks/types';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

import { logger } from '@lib/logger';
import type { StyleProp, ViewStyle } from 'react-native';
const containerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  zoomControl: true,
  disableDefaultUI: true,
  clickableIcons: false,
};

const defaultCenter = { lat: -23.5505, lng: -46.6333 };

const WebMapRenderer: React.FC<
  MapComponentProps & { style?: StyleProp<ViewStyle> }
> = ({ region, markerCoords, address, onMapPress, style }) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const colors = useColors();
  const styles = createStyles(colors);

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    if (region) {
      const newCenter = { lat: region.latitude, lng: region.longitude };
      setMapCenter(newCenter);
      if (mapRef.current) {
        mapRef.current.panTo(newCenter);
      }
    }
  }, [region]);

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        const newPos = { lat, lng };

        setMapCenter(newPos);

        mapRef.current?.panTo(newPos);

        if (onMapPress) {
          onMapPress({
            nativeEvent: { coordinate: { latitude: lat, longitude: lng } },
          });
        }
      }
    },
    [onMapPress],
  );

  const handleLoadError = (err: unknown) => {
    logger.error('[WebMap] Erro ao carregar:', err);
    setError('Falha na conexão com Google Maps.');
  };

  if (!apiKey) {
    return (
      <View style={[styles.container, style, styles.errorContainer]}>
        <Text style={styles.errorText}>⚠️ Configuração Pendente</Text>
        <Text style={styles.errorSubtext}>
          API Key do Google Maps não encontrada.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style, styles.errorContainer]}>
        <Text style={styles.errorText}>❌ {error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <LoadScript
        googleMapsApiKey={apiKey}
        onError={handleLoadError}
        onLoad={() => setMapLoaded(true)}
        loadingElement={
          <ActivityIndicator size="large" color={colors.primaryBlue} />
        }>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={region ? 15 : 12}
          onLoad={(map) => {
            mapRef.current = map;
            setMapLoaded(true);
          }}
          onClick={handleMapClick}
          options={mapOptions}>
          {markerCoords && mapLoaded && (
            <Marker
              position={{
                lat: markerCoords.latitude,
                lng: markerCoords.longitude,
              }}
              title={address?.formatted || 'Local selecionado'}
            />
          )}
        </GoogleMap>
      </LoadScript>

      {!mapLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
          <Text style={styles.loadingText}>Iniciando mapa...</Text>
        </View>
      )}
    </View>
  );
};

export default WebMapRenderer;
