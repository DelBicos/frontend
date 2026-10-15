import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { TicketStatus, TICKET_STATUS_LABELS } from '@stores/Ticket/types';
import { createStyles } from './styles';

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

const STATUS_COLOR_KEY: Record<
  TicketStatus,
  'primaryOrange' | 'primaryBlue' | 'primaryGreen' | 'textTertiary'
> = {
  ABERTO: 'primaryOrange',
  EM_ANALISE: 'primaryBlue',
  EM_ATENDIMENTO: 'primaryBlue',
  RESOLVIDO: 'primaryGreen',
  FECHADO: 'textTertiary',
};

export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({
  status,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);
  const backgroundColor = colors[STATUS_COLOR_KEY[status]];

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.label}>{TICKET_STATUS_LABELS[status]}</Text>
    </View>
  );
};
