import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

interface TicketSuccessModalProps {
  visible: boolean;
  ticketCode: string | null;
  onViewTickets: () => void;
  onClose: () => void;
}

export const TicketSuccessModal: React.FC<TicketSuccessModalProps> = ({
  visible,
  ticketCode,
  onViewTickets,
  onClose,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Ícone de sucesso */}
          <View style={styles.iconCircle}>
            <FontAwesome
              name="check-circle"
              size={44}
              color={colors.primaryGreen}
            />
          </View>

          <Text style={styles.title}>Chamado aberto!</Text>

          <Text style={styles.message}>
            Seu chamado foi registrado com sucesso e já está disponível na
            Central de Ajuda.
          </Text>

          {ticketCode ? (
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>Código do chamado</Text>
              <Text style={styles.codeValue}>{ticketCode}</Text>
            </View>
          ) : null}

          <Text style={styles.hint}>
            Nossa equipe responderá em até 24h úteis.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onViewTickets}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Ver meus chamados">
            <FontAwesome
              name="list-alt"
              size={14}
              color={colors.primaryWhite}
              style={styles.buttonIcon}
            />
            <Text style={styles.primaryButtonLabel}>Ver meus chamados</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onClose}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Fechar">
            <Text style={styles.secondaryButtonLabel}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
