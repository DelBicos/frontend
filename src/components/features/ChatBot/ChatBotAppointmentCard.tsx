import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ChatBotAppointmentData } from '@stores/ChatBot/types';

interface ChatBotAppointmentCardProps {
  appointment: ChatBotAppointmentData;
  /** Chamado quando o usuário solicita alterar o agendamento via chat. */
  onReschedule: (appointment: ChatBotAppointmentData) => void;
  /** Chamado quando o usuário solicita cancelar o agendamento via chat. */
  onCancel: (appointment: ChatBotAppointmentData) => void;
  /** Desabilita ações enquanto aguarda confirmação. */
  disabled?: boolean;
}

const formatDateTime = (iso: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Exibe um agendamento confirmado dentro do chat do bot.
 * Reutiliza o design language do projeto (useColors + StyleSheet).
 * Oferece ações de alterar e cancelar com confirmação explícita no componente pai.
 */
export const ChatBotAppointmentCard: React.FC<ChatBotAppointmentCardProps> = ({
  appointment,
  onReschedule,
  onCancel,
  disabled = false,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  const avatar =
    appointment.professionalAvatarUri ||
    'https://via.placeholder.com/48';

  return (
    <View
      style={styles.card}
      accessibilityRole="region"
      accessibilityLabel={`Agendamento confirmado: ${appointment.serviceTitle}`}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.serviceTitle} numberOfLines={2}>
            {appointment.serviceTitle}
          </Text>
          <Text style={styles.professionalName} numberOfLines={1}>
            {appointment.professionalName}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: colors.successBackground }]}>
          <Text style={[styles.statusText, { color: colors.successText }]}>
            Confirmado
          </Text>
        </View>
      </View>

      {/* Detalhes */}
      <View style={styles.details}>
        <View style={styles.row}>
          <FontAwesome name="calendar-o" size={14} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            {formatDateTime(appointment.startTime)}
          </Text>
        </View>
        <View style={styles.row}>
          <FontAwesome name="clock-o" size={14} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            até {formatDateTime(appointment.endTime)}
          </Text>
        </View>
        <View style={styles.row}>
          <FontAwesome name="tag" size={14} color={colors.textSecondary} />
          <Text style={styles.detailText}>R$ {appointment.price}</Text>
        </View>
      </View>

      {/* Ações */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.rescheduleButton,
            { borderColor: colors.primaryBlue },
            disabled && styles.disabledButton,
          ]}
          onPress={() => onReschedule(appointment)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Alterar agendamento">
          <FontAwesome name="pencil" size={14} color={disabled ? colors.textTertiary : colors.primaryBlue} />
          <Text
            style={[
              styles.actionText,
              { color: disabled ? colors.textTertiary : colors.primaryBlue },
            ]}>
            Alterar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.cancelButton,
            { borderColor: colors.primaryRed },
            disabled && styles.disabledButton,
          ]}
          onPress={() => onCancel(appointment)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Cancelar agendamento">
          <FontAwesome name="times" size={14} color={disabled ? colors.textTertiary : colors.primaryRed} />
          <Text
            style={[
              styles.actionText,
              { color: disabled ? colors.textTertiary : colors.primaryRed },
            ]}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof import('@theme/ThemeProvider').useColors>) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      overflow: 'hidden',
      marginVertical: 4,
      marginHorizontal: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 12,
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.inputBackground,
    },
    headerText: {
      flex: 1,
    },
    serviceTitle: {
      fontSize: 15,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
    },
    professionalName: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statusBadge: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
      alignSelf: 'flex-start',
    },
    statusText: {
      fontSize: 11,
      fontFamily: 'Afacad-SemiBold',
    },
    details: {
      padding: 12,
      gap: 6,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    detailText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    actions: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      gap: 6,
      borderWidth: 0,
    },
    rescheduleButton: {
      borderRightWidth: 0.5,
      borderRightColor: colors.divider,
    },
    cancelButton: {},
    disabledButton: {
      opacity: 0.5,
    },
    actionText: {
      fontSize: 14,
      fontFamily: 'Afacad-SemiBold',
    },
  });
