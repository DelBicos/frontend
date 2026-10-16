import React, { useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { useTicketStore } from '@stores/Ticket';
import {
  TicketStatusBadge,
  TicketMessageBubble,
} from '@components/features/Tickets';
import { TICKET_CATEGORY_LABELS } from '@stores/Ticket/types';
import type { NavigationParams } from '@screens/types';
import { createStyles } from './styles';

type TicketDetailRouteProp = RouteProp<NavigationParams, 'TicketDetail'>;

const formatFullDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const TicketDetailScreen: React.FC = () => {
  const colors = useColors();
  const styles = createStyles(colors);
  const route = useRoute<TicketDetailRouteProp>();
  const ticketId = route.params?.id;

  const {
    currentTicket,
    messages,
    isLoading,
    fetchTicketById,
    fetchMessages,
    clearCurrent,
    clearMessages,
  } = useTicketStore();

  useEffect(() => {
    if (ticketId) {
      clearCurrent();
      clearMessages();
      fetchTicketById(ticketId);
      fetchMessages(ticketId);
    }

    return () => {
      clearCurrent();
      clearMessages();
    };
  }, [ticketId, fetchTicketById, fetchMessages, clearCurrent, clearMessages]);

  if (isLoading && !currentTicket) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryOrange} />
      </View>
    );
  }

  if (!currentTicket) {
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome
          name="exclamation-circle"
          size={48}
          color={colors.textTertiary}
        />
        <Text style={styles.emptyText}>Chamado não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Cabeçalho: código + status */}
      <View style={styles.header}>
        <Text style={styles.code}>{currentTicket.ticket_code}</Text>
        <TicketStatusBadge status={currentTicket.status} />
      </View>

      {/* Título */}
      <Text style={styles.title}>{currentTicket.title}</Text>

      {/* Meta: categoria + data */}
      <View style={styles.metaRow}>
        <FontAwesome name="tag" size={12} color={colors.textTertiary} />
        <Text style={styles.metaText}>
          {TICKET_CATEGORY_LABELS[currentTicket.category]}
        </Text>
        <Text style={styles.metaDot}>•</Text>
        <Text style={styles.metaText}>
          {formatFullDateTime(currentTicket.created_at)}
        </Text>
      </View>

      {/* Descrição */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descrição</Text>
        <Text style={styles.description}>{currentTicket.description}</Text>
      </View>

      {/* Histórico de interações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Histórico de interações</Text>

        {messages.length === 0 ? (
          <View style={styles.emptyMessages}>
            <FontAwesome
              name="comments-o"
              size={32}
              color={colors.textTertiary}
            />
            <Text style={styles.emptyMessagesText}>
              Nenhuma interação ainda. Nossa equipe responderá em breve.
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <TicketMessageBubble key={message.id} message={message} />
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default TicketDetailScreen;