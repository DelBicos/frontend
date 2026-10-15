import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { Ticket, TICKET_CATEGORY_LABELS } from '@stores/Ticket/types';
import { TicketStatusBadge } from '../TicketStatusBadge';
import { createStyles } from './styles';

interface TicketCardProps {
  ticket: Ticket;
  onPress: (ticket: Ticket) => void;
}

const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'agora mesmo';
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
};

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onPress }) => {
  const colors = useColors();
  const styles = createStyles(colors);

  const relativeDate = useMemo(
    () => formatRelativeDate(ticket.created_at),
    [ticket.created_at],
  );

  const categoryLabel = TICKET_CATEGORY_LABELS[ticket.category];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(ticket)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Chamado ${ticket.ticket_code}: ${ticket.title}`}>
      <View style={styles.header}>
        <Text style={styles.code}>{ticket.ticket_code}</Text>
        <TicketStatusBadge status={ticket.status} />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {ticket.title}
      </Text>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <FontAwesome
            name="tag"
            size={11}
            color={colors.textTertiary}
            style={styles.icon}
          />
          <Text style={styles.footerText}>{categoryLabel}</Text>
        </View>
        <Text style={styles.footerText}>{relativeDate}</Text>
      </View>

      <FontAwesome
        name="chevron-right"
        size={14}
        color={colors.textTertiary}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
};