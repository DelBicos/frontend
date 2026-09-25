import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  variant?: 'danger' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  cancelText = 'Cancelar',
  confirmText = 'Confirmar',
  variant = 'danger',
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  const confirmButtonStyle = [
    styles.button,
    styles.confirmButton,
    variant === 'info' && { backgroundColor: colors.primaryBlue },
  ];

  return (
    <Modal
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
      transparent
      statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.modalText}>{message}</Text>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={cancelText}>
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={confirmButtonStyle}
              onPress={onConfirm}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={confirmText}>
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;
