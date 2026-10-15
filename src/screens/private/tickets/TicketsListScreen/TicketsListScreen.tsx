import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { useTicketStore } from '@stores/Ticket/Ticket';
import { TicketCard } from '@components/features/Tickets';
import { createStyles } from './styles';

export const TicketsListScreen: React.FC = () => {
  const colors = useColors();
  const styles = createStyles(colors);
  const navigation = useNavigation<any>();

  const { tickets, isLoading, fetchTickets } = useTicketStore();

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleRefresh = useCallback(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleOpenTicket = useCallback(
    (ticketId: number) => {
      navigation.navigate('TicketDetail', { id: ticketId });
    },
    [navigation],
  );

  const handleCreateTicket = useCallback(() => {
    navigation.navigate('CreateTicket');
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* ✅ Botão fixo no topo — substitui o FAB */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateTicket}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Abrir novo chamado">
          <FontAwesome
            name="plus-circle"
            size={16}
            color={colors.primaryWhite}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.createButtonLabel}>Abrir novo chamado</Text>
        </TouchableOpacity>
      </View>

      {isLoading && tickets.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryOrange} />
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TicketCard
              ticket={item}
              onPress={(ticket) => handleOpenTicket(ticket.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome
                name="comments-o"
                size={48}
                color={colors.textTertiary}
              />
              <Text style={styles.emptyTitle}>Nenhum chamado aberto ainda</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={colors.primaryOrange}
            />
          }
        />
      )}
    </View>
  );
};

export default TicketsListScreen;
