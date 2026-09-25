import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { useUserStore } from '@stores/User';
import {
  useChatStore,
  ChatMessage,
  ChatRoomStatus,
  ChatCorrespondent,
} from '@stores/Chat';
import { useChatSocket } from '@hooks/useChatSocket';
import { createThreadPanelStyles } from './threadPanelStyles';

const PAGE_SIZE = 20;

const dayKey = (iso: string) => new Date(iso).toDateString();

/** "Hoje", "Ontem" ou "12 de setembro". */
function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Hoje';
  if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    ...(date.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
  }).format(date);
}

export type ChatThreadPanelProps = {
  roomId: number;
  correspondent: ChatCorrespondent | null;
  roomStatus?: ChatRoomStatus;
  serviceTitle?: string | null;
  showBackButton?: boolean;
  onBack?: () => void;
};

const ChatThreadPanel: React.FC<ChatThreadPanelProps> = ({
  roomId,
  correspondent,
  roomStatus: initialRoomStatus = 'active',
  serviceTitle,
  showBackButton = false,
  onBack,
}) => {
  const colors = useColors();
  const styles = createThreadPanelStyles(colors);

  const { user } = useUserStore();
  const { fetchMessages, applyIncomingMessage } = useChatStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [roomStatus, setRoomStatus] =
    useState<ChatRoomStatus>(initialRoomStatus);
  const [input, setInput] = useState('');
  const loadingMoreRef = useRef(false);

  const handleIncoming = useCallback(
    (message: ChatMessage) => {
      if (message.room_id !== roomId) return;
      setMessages((prev) => {
        const idx = prev.findIndex(
          (m) => m.client_message_uuid === message.client_message_uuid,
        );
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...message, pending: false };
          return copy;
        }
        return [{ ...message, pending: false }, ...prev];
      });
      applyIncomingMessage(message);
    },
    [roomId, applyIncomingMessage],
  );

  const { roomStatus: socketRoomStatus, sendMessage } = useChatSocket({
    roomId,
    onMessage: handleIncoming,
  });

  useEffect(() => {
    if (socketRoomStatus) setRoomStatus(socketRoomStatus);
  }, [socketRoomStatus]);

  useEffect(() => {
    setRoomStatus(initialRoomStatus);
  }, [initialRoomStatus, roomId]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingInitial(true);
      setMessages([]);
      setCursor(null);
      setHasMore(true);
      try {
        const result = await fetchMessages(roomId, undefined, PAGE_SIZE);
        if (!mounted) return;
        setMessages(result.messages);
        setCursor(result.nextCursor);
        setHasMore(!!result.nextCursor);
        setRoomStatus(result.roomStatus);
      } catch (err) {
        console.error('Erro ao carregar histórico do chat:', err);
      } finally {
        if (mounted) setLoadingInitial(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [roomId, fetchMessages]);

  const loadOlder = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore || !cursor || loadingInitial) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const result = await fetchMessages(roomId, cursor, PAGE_SIZE);
      setMessages((prev) => {
        const existing = new Set(prev.map((m) => m.id));
        const older = result.messages.filter((m) => !existing.has(m.id));
        return [...prev, ...older];
      });
      setCursor(result.nextCursor);
      setHasMore(!!result.nextCursor);
    } catch (err) {
      console.error('Erro ao paginar histórico do chat:', err);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, cursor, loadingInitial, roomId, fetchMessages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || roomStatus === 'archived' || !user) return;

    const meta = sendMessage(trimmed);
    if (!meta) return;

    const optimistic: ChatMessage = {
      id: meta.clientMessageUuid,
      room_id: roomId,
      client_message_uuid: meta.clientMessageUuid,
      sender_user_id: user.id,
      sender_role: user.professional_id ? 'professional' : 'client',
      text: trimmed,
      sent_at: meta.sentAt,
      created_at: meta.sentAt,
      pending: true,
    };
    setMessages((prev) => [optimistic, ...prev]);
    setInput('');
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: ChatMessage;
    index: number;
  }) => {
    const isMine = item.sender_user_id === user?.id;
    const older = messages[index + 1];
    const startsDay = !older || dayKey(older.sent_at) !== dayKey(item.sent_at);
    return (
      <View>
        {startsDay ? (
          <View style={styles.daySeparator}>
            <Text style={styles.daySeparatorText}>
              {dayLabel(item.sent_at)}
            </Text>
          </View>
        ) : null}
        <View
          style={[
            styles.bubbleRow,
            isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs,
          ]}>
          <View
            style={[
              styles.bubble,
              isMine ? styles.bubbleMine : styles.bubbleTheirs,
            ]}>
            <Text
              style={isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>
              {item.text}
            </Text>
            <Text
              style={[
                styles.bubbleTime,
                isMine ? styles.bubbleTimeMine : styles.bubbleTimeTheirs,
              ]}>
              {new Date(item.sent_at).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {item.pending ? ' · enviando…' : ''}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFooter = () =>
    loadingMore ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primaryOrange} />
      </View>
    ) : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {showBackButton && onBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Voltar">
            <FontAwesome
              name="arrow-left"
              size={20}
              color={colors.primaryBlack}
            />
          </TouchableOpacity>
        ) : null}

        {correspondent?.avatar_uri ? (
          <Image
            source={{ uri: correspondent.avatar_uri }}
            style={styles.headerAvatar}
          />
        ) : (
          <View style={styles.headerAvatarFallback}>
            <FontAwesome name="user" size={18} color="#000000" />
          </View>
        )}

        <View style={styles.headerTextBlock}>
          <Text style={styles.headerName} numberOfLines={1}>
            {correspondent?.name ?? 'Conversa'}
          </Text>
          {serviceTitle ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {serviceTitle}
            </Text>
          ) : null}
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        {loadingInitial ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primaryOrange} />
          </View>
        ) : (
          <FlatList
            data={messages}
            inverted
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            onEndReached={loadOlder}
            onEndReachedThreshold={0.4}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.listContent}
            // style={styles.flex}
            removeClippedSubviews={Platform.OS !== 'web'}
            initialNumToRender={15}
            maxToRenderPerBatch={15}
            windowSize={7}
          />
        )}

        {roomStatus === 'archived' ? (
          <View style={styles.archivedBar}>
            <Text style={styles.archivedBarText}>
              Conversa encerrada: o atendimento foi concluído ou cancelado.
            </Text>
          </View>
        ) : (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Digite uma mensagem"
              placeholderTextColor={colors.textTertiary}
              value={input}
              onChangeText={setInput}
              multiline
              accessibilityLabel="Mensagem"
              {...(Platform.OS === 'web'
                ? {
                    onKeyPress: (e: any) => {
                      if (
                        e.nativeEvent.key === 'Enter' &&
                        !e.nativeEvent.shiftKey
                      ) {
                        e.preventDefault();
                        handleSend();
                      }
                    },
                  }
                : {})}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !input.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!input.trim()}
              accessibilityRole="button"
              accessibilityLabel="Enviar mensagem">
              <FontAwesome name="send" size={18} color="#000000" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatThreadPanel;
