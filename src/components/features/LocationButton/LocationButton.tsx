import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MapComponent } from '../../ui/MapComponent/MapComponent';
import { Region } from '@lib/hooks/types';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

import { logger } from '@lib/logger';
import type { MapPressEventLike } from '@lib/hooks/types';
interface LocationButtonProps {
  onPress: () => Promise<{ latitude: number; longitude: number } | null>;
  loading: boolean;
  disabled?: boolean;
  onConfirm: (coords: { latitude: number; longitude: number }) => void;
}

export const LocationButton: React.FC<LocationButtonProps> = ({
  onPress,
  loading,
  disabled = false,
  onConfirm,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);
  const { width, height } = useWindowDimensions();

  const [open, setOpen] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [markerCoords, setMarkerCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapLoading, setMapLoading] = useState(false);

  const getDeltas = () => ({
    latitudeDelta: 0.01,
    longitudeDelta: (0.01 * width) / height,
  });

  const handleOpen = async () => {
    setMapLoading(true);
    try {
      const coords = await onPress();
      if (coords) {
        setCurrentRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          ...getDeltas(),
        });
        setMarkerCoords(coords);
        setOpen(true);
      }
    } catch (error) {
      logger.error('Erro ao obter localização:', error);
    } finally {
      setMapLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleMapPress = (event: MapPressEventLike) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerCoords({ latitude, longitude });
  };

  const handleConfirm = () => {
    if (markerCoords) {
      onConfirm(markerCoords);
    }
    handleClose();
  };

  const isLoading = loading || mapLoading;
  const isDisabled = disabled || isLoading;

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.button,
          isDisabled && { opacity: 0.6, backgroundColor: colors.textTertiary },
        ]}
        onPress={handleOpen}
        disabled={isDisabled}
        activeOpacity={0.8}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primaryWhite} />
        ) : (
          <>
            <FontAwesome
              name="map-marker"
              size={18}
              color={colors.primaryWhite}
            />
            <Text style={styles.buttonText}>Obter Localização Atual</Text>
          </>
        )}
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Sua Localização</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <FontAwesome
                  name="close"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.mapContainer}>
              <MapComponent
                region={currentRegion}
                markerCoords={markerCoords}
                onMapPress={handleMapPress}
              />
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}>
              <Text style={styles.confirmButtonText}>
                Confirmar Localização
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
