import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { ChatBotMessage, ChatBotAction } from '@stores/ChatBot/types';
import { ChatBotAppointmentCard } from '../../ChatBotAppointmentCard';
import { createStyles } from '../styles';

interface MessageBubbleProps {
  message: ChatBotMessage;
  onReschedule: (action: ChatBotAction) => void;
  onCancel: (action: ChatBotAction) => void;
  isActionPending: boolean;
}

/**
 * Balão de uma mensagem individual do chat.
 * React.memo evita re-render de todos os balões ao digitar no input
 * ou quando o estado de loading muda — apenas os props alterados re-renderizam.
 */
export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
  ({ message, onReschedule, onCancel, isActionPending }) => {
    const colors = useColors();
    const isUser = message.role === 'user';
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
      <View
        style={[
          styles.bubbleRow,
          isUser ? styles.bubbleRowUser : styles.bubbleRowBot,
        ]}>
        {/* Appointment card embedded in bot message */}
        {!isUser &&
          message.action?.type === 'confirm_appointment' &&
          message.action.appointment && (
            <ChatBotAppointmentCard
              appointment={message.action.appointment}
              onReschedule={() => onReschedule(message.action!)}
              onCancel={() => onCancel(message.action!)}
              disabled={isActionPending}
            />
          )}

        {/* Text bubble */}
        {message.text ? (
          <View
            style={[
              styles.bubble,
              isUser
                ? [styles.bubbleUser, { backgroundColor: colors.primaryOrange }]
                : [
                    styles.bubbleBot,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.borderColor,
                    },
                  ],
            ]}
            accessibilityRole="text"
            accessibilityLabel={`${isUser ? 'Você' : 'Assistente'}: ${message.text}`}>
            <Text
              style={[
                styles.bubbleText,
                { color: isUser ? colors.primaryWhite : colors.primaryBlack },
              ]}>
              {message.text}
            </Text>
          </View>
        ) : null}
      </View>
    );
  },
);
