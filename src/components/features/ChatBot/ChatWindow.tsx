import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { useChatSession } from '@hooks/useChatSession';
import { ChatBotMessage, ChatBotAction } from '@stores/ChatBot/types';
import { TypingIndicator } from './TypingIndicator';
import { QuickReplies } from './QuickReplies';
import { ChatBotAppointmentCard } from './ChatBotAppointmentCard';
import ConfirmationModal from '@components/ui/ConfirmationModal';

// ─── Message Bubble ──────────────────────────────────────────────────────────

/**
 * React.memo evita re-render de todos os balões ao digitar no input
 * ou quando o estado de loading muda — apenas os props alterados re-renderizam.
 */
const MessageBubble: React.FC<{
  message: ChatBotMessage;
  onReschedule: (action: ChatBotAction) => void;
  onCancel: (action: ChatBotAction) => void;
  isActionPending: boolean;
}> = React.memo(({ message, onReschedule, onCancel, isActionPending }) => {
  const colors = useColors();
  const isUser = message.role === 'user';

  return (
    <View
      style={[
        styles.bubbleRow,
        isUser ? styles.bubbleRowUser : styles.bubbleRowBot,
      ]}>
      {/* Appointment card embedded in bot message */}
      {!isUser && message.action?.type === 'confirm_appointment' && message.action.appointment && (
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
});

// ─── ChatWindow ──────────────────────────────────────────────────────────────

interface ChatWindowProps {
  /** Callback para fechar o painel (mobile/web). */
  onClose?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const colors = useColors();
  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList<ChatBotMessage>>(null);
  const [inputText, setInputText] = useState('');
  const [pendingAction, setPendingAction] = useState<ChatBotAction | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ visible: false, title: '', message: '', onConfirm: () => {} });

  const {
    messages,
    loading,
    error,
    sendMessage,
    sendQuickReply,
    confirmAction,
  } = useChatSession();

  // Scroll to end quando novas mensagens chegam — timer limpo no unmount
  useEffect(() => {
    if (messages.length === 0) return;
    const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages.length]);

  // Foca o input assim que o painel abre (web) — timer limpo no unmount
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || loading) return;
    setInputText('');
    sendMessage(text);
  }, [inputText, loading, sendMessage]);

  const handleQuickReply = useCallback(
    (value: string, label: string) => {
      sendQuickReply({ value, label });
    },
    [sendQuickReply],
  );

  const handleReschedule = useCallback((action: ChatBotAction) => {
    setPendingAction(action);
    setConfirmModal({
      visible: true,
      title: 'Alterar agendamento',
      message: `Deseja realmente alterar o agendamento de "${action.serviceTitle ?? 'serviço'}"? O assistente vai sugerir novos horários.`,
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        confirmAction('confirm_reschedule', {
          appointmentId: action.appointmentId,
          serviceTitle: action.serviceTitle,
        });
        setPendingAction(null);
      },
    });
  }, [confirmAction]);

  const handleCancel = useCallback((action: ChatBotAction) => {
    setPendingAction(action);
    setConfirmModal({
      visible: true,
      title: 'Cancelar agendamento',
      message: `Tem certeza que deseja cancelar o agendamento de "${action.serviceTitle ?? 'serviço'}"? Essa ação não pode ser desfeita.`,
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        confirmAction('confirm_cancel', {
          appointmentId: action.appointmentId,
          serviceTitle: action.serviceTitle,
        });
        setPendingAction(null);
      },
    });
  }, [confirmAction]);

  const handleModalCancel = useCallback(() => {
    setConfirmModal((prev) => ({ ...prev, visible: false }));
    setPendingAction(null);
  }, []);

  // Busca do último bot message sem criar array temporário — O(n) passagem única
  const lastBotMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'bot') return messages[i];
    }
    return undefined;
  }, [messages]);

  const hasQuickReplies = useMemo(
    () =>
      !!lastBotMessage &&
      ((lastBotMessage.quickReplies?.length ?? 0) > 0 ||
        (lastBotMessage.suggestedTimes?.length ?? 0) > 0),
    [lastBotMessage],
  );

  // Memoiza o StyleSheet — evita recriar em cada render
  const styles = useMemo(() => createStyles(colors), [colors]);

  // renderItem precisa ser um useCallback no topo do componente —
  // chamar useCallback() diretamente dentro de uma prop JSX viola as Regras dos Hooks
  const renderItem = useCallback(
    ({ item }: { item: ChatBotMessage }) => (
      <MessageBubble
        message={item}
        onReschedule={handleReschedule}
        onCancel={handleCancel}
        isActionPending={pendingAction !== null}
      />
    ),
    [handleReschedule, handleCancel, pendingAction],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>

      {/* Header */}
      <View style={styles.header} accessibilityRole="header">
        <View style={styles.botInfo}>
          <View style={[styles.botAvatar, { backgroundColor: colors.primaryOrange }]}>
            <FontAwesome name="commenting" size={16} color={colors.primaryWhite} />
          </View>
          <View>
            <Text style={styles.botName}>Assistente DelBicos</Text>
            <Text style={styles.botSubtitle}>Agendamentos via chat</Text>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Fechar chat">
            <FontAwesome name="times" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome name="commenting-o" size={40} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              Olá! Como posso ajudar com seus agendamentos?
            </Text>
          </View>
        }
        renderItem={renderItem}
      />

      {/* Typing indicator */}
      {loading && <TypingIndicator />}

      {/* Error banner */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: colors.errorBackground }]}>
          <Text style={[styles.errorText, { color: colors.errorText }]}>{error}</Text>
        </View>
      )}

      {/* Quick replies */}
      {hasQuickReplies && !loading && (
        <QuickReplies
          quickReplies={lastBotMessage?.quickReplies}
          suggestedTimes={lastBotMessage?.suggestedTimes}
          onSelect={handleQuickReply}
          disabled={loading}
        />
      )}

      {/* Input area */}
      <View style={[styles.inputRow, { borderTopColor: colors.borderColor }]}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: colors.primaryBlack,
              backgroundColor: colors.inputBackground,
              borderColor: colors.borderColor,
            },
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={colors.placeholder}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          multiline={false}
          maxLength={500}
          editable={!loading}
          accessibilityLabel="Campo de mensagem"
          accessibilityHint="Digite e pressione enviar ou Enter"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor:
                inputText.trim() && !loading
                  ? colors.primaryOrange
                  : colors.inputBackground,
            },
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || loading}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensagem">
          {loading ? (
            <ActivityIndicator size="small" color={colors.primaryOrange} />
          ) : (
            <FontAwesome
              name="send"
              size={16}
              color={
                inputText.trim() ? colors.primaryWhite : colors.textTertiary
              }
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Confirmation modal */}
      <ConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        onCancel={handleModalCancel}
        onConfirm={confirmModal.onConfirm}
        confirmText="Sim, confirmar"
        cancelText="Não, voltar"
        variant={
          confirmModal.title.includes('Cancelar') ? 'danger' : 'info'
        }
      />
    </KeyboardAvoidingView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const createStyles = (colors: ReturnType<typeof import('@theme/ThemeProvider').useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundElevated,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    botInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    botAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botName: {
      fontSize: 15,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
    },
    botSubtitle: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    closeButton: {
      padding: 8,
    },
    messagesList: {
      paddingVertical: 12,
      paddingBottom: 4,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 60,
      gap: 12,
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 15,
      textAlign: 'center',
      lineHeight: 22,
    },
    bubbleRow: {
      paddingHorizontal: 12,
      marginVertical: 2,
    },
    bubbleRowUser: {
      alignItems: 'flex-end',
    },
    bubbleRowBot: {
      alignItems: 'flex-start',
    },
    bubble: {
      maxWidth: '80%',
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 18,
    },
    bubbleUser: {
      borderBottomRightRadius: 4,
    },
    bubbleBot: {
      borderBottomLeftRadius: 4,
      borderWidth: 1,
    },
    bubbleText: {
      fontSize: 15,
      lineHeight: 21,
    },
    errorBanner: {
      marginHorizontal: 12,
      marginVertical: 4,
      borderRadius: 8,
      padding: 10,
    },
    errorText: {
      fontSize: 13,
      textAlign: 'center',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderTopWidth: 1,
      backgroundColor: colors.cardBackground,
      gap: 8,
    },
    input: {
      flex: 1,
      height: 42,
      borderRadius: 21,
      borderWidth: 1,
      paddingHorizontal: 16,
      fontSize: 15,
      fontFamily: 'Afacad-Regular',
    },
    sendButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
