import React from 'react';
import { View, Text, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import {
  TicketMessage,
  TICKET_MESSAGE_AUTHOR_LABELS,
} from '@stores/Ticket/types';
import { createStyles } from './styles';

interface TicketMessageBubbleProps {
  message: TicketMessage;
}

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const TicketMessageBubble: React.FC<TicketMessageBubbleProps> = ({
  message,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  const isAdmin = message.author.type === 'ADMIN';
  const authorLabel = TICKET_MESSAGE_AUTHOR_LABELS[message.author.type];

  return (
    <View style={[styles.container, isAdmin && styles.adminContainer]}>
      <View style={styles.header}>
        {message.author.avatar_uri ? (
          <Image
            source={{ uri: message.author.avatar_uri }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <FontAwesome
              name={isAdmin ? 'headphones' : 'user'}
              size={14}
              color={colors.primaryWhite}
            />
          </View>
        )}

        <View style={styles.authorInfo}>
          <Text style={styles.authorName} numberOfLines={1}>
            {message.author.name}
          </Text>
          <View style={styles.authorMeta}>
            <View style={[styles.authorBadge, isAdmin && styles.adminBadge]}>
              <Text
                style={[
                  styles.authorBadgeText,
                  isAdmin && styles.adminBadgeText,
                ]}>
                {authorLabel}
              </Text>
            </View>
            <Text style={styles.dateText}>
              {formatDateTime(message.created_at)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.content}>{message.content}</Text>

      {message.attachment_url ? (
        <View style={styles.attachment}>
          <FontAwesome
            name="paperclip"
            size={12}
            color={colors.primaryOrange}
          />
          <Text style={styles.attachmentText} numberOfLines={1}>
            Anexo disponível
          </Text>
        </View>
      ) : null}
    </View>
  );
};