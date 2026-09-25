import React, { useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';

type FeedbackType = 'success' | 'error' | 'info' | 'warning';

interface FeedbackModalProps {
  visible: boolean;
  type?: FeedbackType;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  type = 'info',
  title,
  message,
  buttonText = 'OK',
  onClose,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  const config = useMemo(() => {
    switch (type) {
      case 'success':
        return {
          icon: 'check-circle',
          color: colors.successText || '#2E7D32',
        };
      case 'error':
        return {
          icon: 'times-circle',
          color: colors.errorText || '#D32F2F',
        };
      case 'warning':
        return {
          icon: 'exclamation-circle',
          color: colors.warningText || '#F57C00',
        };
      default:
        return {
          icon: 'info-circle',
          color: colors.primaryBlue,
        };
    }
  }, [type, colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer} accessibilityViewIsModal>
          {/* Ícone no topo */}
          <View style={styles.iconContainer}>
            <FontAwesome
              name={config.icon as any}
              size={64}
              color={config.color}
            />
          </View>

          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>

          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: config.color }]}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={buttonText}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
