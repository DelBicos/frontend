import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { useChatStore, Conversation } from '@stores/Chat';
import { createListPanelStyles } from './listPanelStyles';

const formatTime = (iso: string | null) => {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString('pt-BR');
};

export type ChatRoomListPanelProps = {
  selectedRoomId?: number | null;
  onSelectRoom: (room: Conversation) => void;
};

const ChatRoomListPanel: React.FC<ChatRoomListPanelProps> = ({
  selectedRoomId,
  onSelectRoom,
}) => {
  const colors = useColors();
  const styles = createListPanelStyles(colors);
  const { conversations, loadingRooms, error, fetchRooms } = useChatStore();

  useFocusEffect(
    useCallback(() => {
      void fetchRooms();
    }, [fetchRooms]),
  );

  const handleRefresh = useCallback(() => {
    if (loadingRooms) return;
    void fetchRooms({ forceRefresh: true });
  }, [loadingRooms, fetchRooms]);

  const renderItem = ({ item }: { item: Conversation }) => {
    const name = item.correspondent?.name ?? 'Conversa';
    const avatar = item.correspondent?.avatar_uri;
    const isArchived = item.status === 'archived';
    const isSelected = selectedRoomId === item.room_id;

    return (
      <TouchableOpacity
        style={[styles.row, isSelected && styles.rowSelected]}
        activeOpacity={0.7}
        onPress={() => onSelectRoom(item)}>
        <View style={styles.avatarWrapper}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <FontAwesome name="user" size={22} color="#000000" />
            </View>
          )}
        </View>

        <View style={styles.rowContent}>
          <View style={styles.rowHeader}>
            <Text
              style={[styles.name, isSelected && styles.nameSelected]}
              numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.time}>{formatTime(item.last_message_at)}</Text>
          </View>

          {item.service_title ? (
            <Text style={styles.serviceTitle} numberOfLines={1}>
              {item.service_title}
            </Text>
          ) : null}

          <View style={styles.rowHeader}>
            <Text style={styles.preview} numberOfLines={1}>
              {item.last_message_preview || 'Nenhuma mensagem ainda'}
            </Text>
            {isArchived && (
              <View style={styles.archivedBadge}>
                <Text style={styles.archivedText}>Arquivada</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loadingRooms && conversations.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryOrange} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderTitle}>Conversas</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => String(item.room_id)}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS !== 'web'}
        renderItem={renderItem}
        contentContainerStyle={
          conversations.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        refreshing={loadingRooms}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          !loadingRooms ? (
            <View style={styles.centered}>
              <FontAwesome
                name="comments-o"
                size={40}
                color={colors.textTertiary}
              />
              <Text style={styles.emptyText}>
                Você ainda não tem conversas. Elas aparecem aqui quando um
                serviço é agendado.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default ChatRoomListPanel;
