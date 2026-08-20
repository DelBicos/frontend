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
import {
  MAX_VOICE_RECORDING_DURATION_MS,
  useVoiceRecorder,
} from '@hooks/useVoiceRecorder';
import { ChatBotMessage, ChatBotAction } from '@stores/ChatBot/types';
import { TypingIndicator } from '../TypingIndicator';
import { QuickReplies } from '../QuickReplies';
import ConfirmationModal from '@components/ui/ConfirmationModal';
import { MessageBubble } from './MessageBubble';
import { ChatHeader } from './ChatHeader';
import { ChatInputBar } from './ChatInputBar';
import { ChatErrorBanner } from './ChatErrorBanner';
import { AppointmentStatusBanner } from './AppointmentStatusBanner';
import { useAppointmentPolling } from './hooks/useAppointmentPolling';
import { useRateLimitCountdown } from './hooks/useRateLimitCountdown';
import { createStyles } from './styles';

interface ChatWindowProps {
  /** Callback para fechar o painel (mobile/web). */
  onClose?: () => void;
  /** Texto exibido na ação de saída do cabeçalho mobile. */
  closeLabel?: 'Fechar' | 'Minimizar';
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  onClose,
  closeLabel = 'Fechar',
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList<ChatBotMessage>>(null);
  const voiceLimitHandledRef = useRef(false);
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
    hasRetryableVoiceCommand,
    isRestarting,
    rateLimitResetAt,
    conversationState,
    conversationContext,
    sendMessage,
    sendVoiceCommand,
    sendQuickReply,
    confirmAction,
    retryLastMessage,
    retryLastVoiceCommand,
    clearRateLimitReset,
    restartConversation,
    receiveAppointmentStatus,
    restoreActiveSession,
    reportError,
  } = useChatSession();
  const {
    isRecording,
    isPreparing: isVoicePreparing,
    durationMillis: recordingDurationMillis,
    startRecording,
    stopRecording,
  } = useVoiceRecorder();

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
    const accepted = sendMessage(text);
    if (accepted) setInputText('');
  }, [inputText, loading, sendMessage]);

  const handleVoicePress = useCallback(async () => {
    if (loading || isVoicePreparing) return;

    try {
      if (isRecording) {
        const recording = await stopRecording();
        await sendVoiceCommand(recording);
        return;
      }
      await startRecording();
    } catch (voiceError) {
      const message =
        voiceError instanceof Error
          ? voiceError.message
          : 'Não foi possível usar o microfone. Tente novamente.';
      reportError(message);
    }
  }, [
    isRecording,
    isVoicePreparing,
    loading,
    reportError,
    sendVoiceCommand,
    startRecording,
    stopRecording,
  ]);

  // Evita que um toque esquecido ultrapasse o limite recomendado de 60 s.
  useEffect(() => {
    if (!isRecording) {
      voiceLimitHandledRef.current = false;
      return;
    }
    if (
      recordingDurationMillis < MAX_VOICE_RECORDING_DURATION_MS ||
      voiceLimitHandledRef.current
    ) {
      return;
    }

    voiceLimitHandledRef.current = true;
    void handleVoicePress();
  }, [handleVoicePress, isRecording, recordingDurationMillis]);

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
      <ChatHeader
        onClear={restartConversation}
        restartDisabled={isRestarting || isRecording || isVoicePreparing}
        onClose={onClose}
        closeLabel={closeLabel}
      />

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
          hasRetryableVoiceCommand={hasRetryableVoiceCommand}
          onRetry={lastSentText ? retryLastMessage : retryLastVoiceCommand}
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

      {hasQuickReplies && !loading && (
        <QuickReplies
          quickReplies={lastBotMessage?.quickReplies}
          suggestedTimes={lastBotMessage?.suggestedTimes}
          onSelect={handleQuickReply}
          disabled={loading || isRecording || isVoicePreparing}
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
        isRecording={isRecording}
        isVoicePreparing={isVoicePreparing}
        recordingDurationMillis={recordingDurationMillis}
        maxRecordingDurationMillis={MAX_VOICE_RECORDING_DURATION_MS}
        onVoicePress={handleVoicePress}
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
