import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { useChatSession } from '@hooks/useChatSession';
import { ChatBotMessage, ChatBotAction } from '@stores/ChatBot/types';
import { TypingIndicator } from '../TypingIndicator';
import { QuickReplies } from '../QuickReplies';
import ConfirmationModal from '@components/ui/ConfirmationModal';
import { MessageBubble } from './MessageBubble';
import { ChatHeader } from './ChatHeader';
import { ChatInputBar } from './ChatInputBar';
import { ChatErrorBanner } from './ChatErrorBanner';
import { AppointmentStatusBanner } from './AppointmentStatusBanner';
import { ServiceOptions } from '../ServiceOptions';
import { useAppointmentPolling } from './hooks/useAppointmentPolling';
import { useRateLimitCountdown } from './hooks/useRateLimitCountdown';
import { createStyles } from './styles';

interface ChatWindowProps {
  /** Callback para fechar o painel (mobile/web). */
  onClose?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList<ChatBotMessage>>(null);
  const [inputText, setInputText] = useState('');
  const [pendingAction, setPendingAction] = useState<ChatBotAction | null>(
    null,
  );
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
    lastSentText,
    rateLimitResetAt,
    conversationState,
    conversationContext,
    sendMessage,
    sendQuickReply,
    confirmAction,
    retryLastMessage,
    clearRateLimitReset,
    restartConversation,
    receiveAppointmentStatus,
    restoreActiveSession,
  } = useChatSession();

  // ── Hooks dedicados ───────────────────────────────────────────────────────
  const appointmentId = conversationContext?.appointmentId;
  const { appointmentStatus, appointmentPaid } = useAppointmentPolling(
    appointmentId,
    conversationContext?.appointmentStatus ?? null,
    conversationContext?.appointmentPaid ?? false,
    receiveAppointmentStatus,
  );
  const rateLimitCountdown = useRateLimitCountdown(
    rateLimitResetAt,
    clearRateLimitReset,
  );

  // ── Efeitos ───────────────────────────────────────────────────────────────

  // Restaura a sessão ativa do JWT atual na abertura do painel.
  useEffect(() => {
    if (messages.length === 0 && !loading) {
      restoreActiveSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll automático ao receber novas mensagens.
  useEffect(() => {
    if (messages.length === 0) return;
    const t = setTimeout(
      () => listRef.current?.scrollToEnd({ animated: true }),
      80,
    );
    return () => clearTimeout(t);
  }, [messages.length]);

  // Foca o input ao abrir na web.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || loading) return;
    setInputText('');
    sendMessage(text);
  }, [inputText, loading, sendMessage]);

  const handleQuickReply = useCallback(
    (value: string, label: string) => sendQuickReply({ value, label }),
    [sendQuickReply],
  );

  const handleReschedule = useCallback(
    (action: ChatBotAction) => {
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
    },
    [confirmAction],
  );

  const handleCancel = useCallback(
    (action: ChatBotAction) => {
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
    },
    [confirmAction],
  );

  const handleModalCancel = useCallback(() => {
    setConfirmModal((prev) => ({ ...prev, visible: false }));
    setPendingAction(null);
  }, []);

  // ── Memos ─────────────────────────────────────────────────────────────────

  // Busca do último bot message sem criar array temporário — O(n) passagem única.
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ChatHeader onClear={restartConversation} onClose={onClose} />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome
              name="commenting-o"
              size={40}
              color={colors.textTertiary}
            />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              Olá! Como posso ajudar com seus agendamentos?
            </Text>
          </View>
        }
        renderItem={renderItem}
      />

      {loading && <TypingIndicator />}

      {error && (
        <ChatErrorBanner
          error={error}
          rateLimitCountdown={rateLimitCountdown}
          lastSentText={lastSentText}
          onRetry={retryLastMessage}
        />
      )}

      {conversationState === 'AGUARDANDO_ID_AGENDAMENTO' && !loading && (
        <View
          style={[
            styles.hintBanner,
            { backgroundColor: colors.warningBackground },
          ]}>
          <FontAwesome
            name="info-circle"
            size={14}
            color={colors.warningText}
          />
          <Text style={[styles.hintText, { color: colors.warningText }]}>
            {'Digite o ID do agendamento (disponível em “Meus Agendamentos”)'}
          </Text>
        </View>
      )}

      {conversationState === 'COLETANDO_SERVICO' &&
        !!conversationContext?.serviceOptionsData?.length && (
          <ServiceOptions
            options={conversationContext.serviceOptionsData}
            onSelect={handleQuickReply}
            disabled={loading}
          />
        )}

      {hasQuickReplies && !loading && (
        <QuickReplies
          quickReplies={lastBotMessage?.quickReplies}
          suggestedTimes={lastBotMessage?.suggestedTimes}
          onSelect={handleQuickReply}
          disabled={loading}
        />
      )}

      {appointmentId && (
        <AppointmentStatusBanner
          appointmentId={appointmentId}
          appointmentStatus={appointmentStatus}
          appointmentPaid={appointmentPaid}
          conversationContext={conversationContext}
          onClose={onClose}
        />
      )}

      <ChatInputBar
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        loading={loading}
        rateLimitCountdown={rateLimitCountdown}
        conversationState={conversationState}
        inputRef={inputRef}
      />

      <ConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        onCancel={handleModalCancel}
        onConfirm={confirmModal.onConfirm}
        confirmText="Sim, confirmar"
        cancelText="Não, voltar"
        variant={confirmModal.title.includes('Cancelar') ? 'danger' : 'info'}
      />
    </KeyboardAvoidingView>
  );
};
