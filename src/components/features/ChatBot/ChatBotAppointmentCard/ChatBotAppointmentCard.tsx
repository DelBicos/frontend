import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ChatBotAppointmentData } from '@stores/ChatBot/types';
import { createStyles } from './styles';

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
  // Memoiza o StyleSheet — evita recriar em cada render
  const styles = useMemo(() => createStyles(colors), [colors]);

  const hasAvatar = !!appointment.professionalAvatarUri;

  return (
    <View
      style={styles.card}
      accessibilityLabel={`Agendamento confirmado: ${appointment.serviceTitle}`}>
      {/* Header */}
      <View style={styles.header}>
        {/* Avatar: imagem do profissional ou fallback local com ícone */}
        {hasAvatar ? (
          <Image source={{ uri: appointment.professionalAvatarUri! }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.inputBackground }]}>
            <FontAwesome name="user" size={20} color={colors.textTertiary} />
          </View>
        )}
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
        {appointment.endTime && appointment.endTime !== appointment.startTime && (
          <View style={styles.row}>
            <FontAwesome name="clock-o" size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              até {formatDateTime(appointment.endTime)}
            </Text>
          </View>
        )}
        <View style={styles.row}>
          <FontAwesome name="tag" size={14} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            {appointment.price ? appointment.price : 'Valor não disponível'}
          </Text>
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

