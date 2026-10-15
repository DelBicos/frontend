import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { openGoogleMaps, openWaze } from '@lib/maps';

export interface NavigationAppModalProps {
  visible: boolean;
  onClose: () => void;
  address: string;
}

export const NavigationAppModal: React.FC<NavigationAppModalProps> = ({
  visible,
  onClose,
  address,
}) => {
  const colors = useColors();

  const handleOpenGoogle = () => {
    onClose();
    void openGoogleMaps(address);
  };

  const handleOpenWaze = () => {
    onClose();
    void openWaze(address);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.borderColor,
            },
          ]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.primaryBlack }]}>
              Abrir Rota no GPS
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
            Escolha o aplicativo de mapas de sua preferência para navegação:
          </Text>

          <View style={styles.modalOptionsRow}>
            <TouchableOpacity
              style={[
                styles.gpsOptionBtn,
                { backgroundColor: colors.primaryBlue },
              ]}
              onPress={handleOpenGoogle}
              activeOpacity={0.85}>
              <Ionicons
                name="location-sharp"
                size={26}
                color={colors.primaryWhite}
              />
              <Text
                style={[styles.gpsOptionText, { color: colors.primaryWhite }]}>
                Google Maps
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.gpsOptionBtn,
                { backgroundColor: colors.primaryOrange },
              ]}
              onPress={handleOpenWaze}
              activeOpacity={0.85}>
              <Ionicons
                name="car-sport"
                size={26}
                color={colors.primaryWhite}
              />
              <Text
                style={[styles.gpsOptionText, { color: colors.primaryWhite }]}>
                Waze
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.modalCancelBtn,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.borderColor,
              },
            ]}
            onPress={onClose}>
            <Text
              style={[styles.modalCancelText, { color: colors.textSecondary }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSub: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalOptionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  gpsOptionBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
  },
  gpsOptionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalCancelBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
