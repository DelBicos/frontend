import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { navigationRef } from '@screens/navigationRef';
import { useColors } from '@theme/ThemeProvider';
import { useChatSession } from '@hooks/useChatSession';
import { useUserStore } from '@stores/User';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { ChatBotMessage, ChatBotAction } from '@stores/ChatBot/types';
import { TypingIndicator } from '../TypingIndicator';
import { QuickReplies } from '../QuickReplies';
import { ChatBotAppointmentCard } from '../ChatBotAppointmentCard';
import ConfirmationModal from '@components/ui/ConfirmationModal';
import { createStyles } from './styles';

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
  const styles = useMemo(() => createStyles(colors), [colors]);

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
    lastSentText,
    rateLimitResetAt,
    conversationState,
    conversationContext,
    sendMessage,
    sendQuickReply,
    confirmAction,
    retryLastMessage,
    clearRateLimitReset,
    clearSession,
    loadSession,
    sessionId,
  } = useChatSession();

  let navigation: any = null;
  try {
    navigation = useNavigation();
  } catch (e) {
    // ChatWindow está fora do NavigationContainer (ex: ChatWidget global)
  }

  const [appointmentStatus, setAppointmentStatus] = useState<string | null>(null);
  const [appointmentPaid, setAppointmentPaid] = useState(false);
  const appointmentId = conversationContext?.appointmentId;

  // Polling para checar se o agendamento foi aceito/pago pelo profissional
  useEffect(() => {
    if (!appointmentId || conversationState !== 'FINALIZADO') {
      setAppointmentStatus(null);
      setAppointmentPaid(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const { user } = useUserStore.getState();
        if (!user) return;
        const response = await backendHttpClient.get(`api/appointments/user/${user.id}`);
        const list = response.data as Array<{ id: number; status: string; payment_intent_id?: string | null }>;
        const found = list.find((a) => a.id === appointmentId);
        if (found) {
          setAppointmentStatus(found.status);
          setAppointmentPaid(!!found.payment_intent_id);
        }
      } catch (e) {
        console.warn('[ChatWindow] Error checking appointment status:', e);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // 10s

    return () => clearInterval(interval);
  }, [appointmentId, conversationState]);

  // (#3) Restaura sessão persistida quando o painel abre e não há mensagens em memória
  useEffect(() => {
    if (sessionId && messages.length === 0 && !loading) {
      loadSession(sessionId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // (#6) Countdown do rate limit
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  useEffect(() => {
    if (!rateLimitResetAt) {
      setRateLimitCountdown(0);
      return;
    }
    const update = () => {
      const secs = Math.ceil((rateLimitResetAt - Date.now()) / 1000);
      if (secs <= 0) {
        setRateLimitCountdown(0);
        clearRateLimitReset();
      } else {
        setRateLimitCountdown(secs);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [rateLimitResetAt, clearRateLimitReset]);

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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={clearSession}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Reiniciar chat">
            <FontAwesome name="refresh" size={15} color={colors.primaryOrange} style={{ marginRight: 4 }} />
            <Text style={{ color: colors.primaryOrange, fontFamily: 'Afacad-SemiBold', fontSize: 14 }}>Reiniciar</Text>
          </TouchableOpacity>
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

      {/* Error banner com retry (#5) e countdown rate limit (#6) */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: colors.errorBackground }]}>
          <Text style={[styles.errorText, { color: colors.errorText }]}>
            {rateLimitCountdown > 0
              ? `Aguarde ${rateLimitCountdown}s antes de enviar outra mensagem.`
              : error}
          </Text>
          {lastSentText && rateLimitCountdown === 0 && (
            <TouchableOpacity
              onPress={retryLastMessage}
              accessibilityRole="button"
              accessibilityLabel="Tentar novamente">
              <Text style={[styles.retryText, { color: colors.primaryBlue }]}>
                Tentar novamente
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Hint contextual: informa o usuário quando o bot aguarda um ID de agendamento */}
      {conversationState === 'AGUARDANDO_ID_AGENDAMENTO' && !loading && (
        <View style={[styles.hintBanner, { backgroundColor: colors.warningBackground }]}>
          <FontAwesome name="info-circle" size={14} color={colors.warningText} />
          <Text style={[styles.hintText, { color: colors.warningText }]}>
            Digite o ID do agendamento (disponível em “Meus Agendamentos”)
          </Text>
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

      {/* Banner de status do agendamento finalizado */}
      {conversationState === 'FINALIZADO' && appointmentId && (
        <View style={[styles.hintBanner, { 
          backgroundColor: appointmentStatus === 'canceled' ? colors.errorBackground : colors.warningBackground, 
          paddingVertical: 12,
          marginVertical: 6,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <FontAwesome 
              name={
                appointmentStatus === 'confirmed' 
                  ? (appointmentPaid ? 'check-circle' : 'exclamation-circle') 
                  : appointmentStatus === 'canceled' ? 'times-circle' : 'clock-o'
              } 
              size={16} 
              color={
                appointmentStatus === 'confirmed' && appointmentPaid 
                  ? colors.successText 
                  : appointmentStatus === 'canceled' ? colors.errorText : colors.warningText
              } 
            />
            <Text style={[styles.hintText, { 
              color: appointmentStatus === 'canceled' ? colors.errorText : colors.warningText,
              fontFamily: 'Afacad-SemiBold',
              fontSize: 14 
            }]}>
              {appointmentStatus === 'pending' && 'Aguardando o prestador aceitar o agendamento...'}
              {appointmentStatus === 'confirmed' && !appointmentPaid && 'Agendamento aceito! Efetue o pagamento para finalizar.'}
              {appointmentStatus === 'confirmed' && appointmentPaid && '🎉 Tudo pronto! Agendamento pago e confirmado.'}
              {appointmentStatus === 'canceled' && 'Este agendamento foi cancelado ou recusado.'}
            </Text>
          </View>

          {appointmentStatus === 'confirmed' && !appointmentPaid && (
            <TouchableOpacity
              style={{
                backgroundColor: colors.primaryOrange,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 16,
                marginLeft: 12,
              }}
              onPress={() => {
                const ctx = conversationContext as any;
                const selectedTime = ctx.newDate || ctx.date || ctx.selectedDate;
                const params = {
                  professionalId: ctx.professionalId,
                  selectedTime,
                  serviceId: ctx.serviceId,
                  appointmentId: appointmentId,
                  imageUrl: ctx.imageUrl || undefined,
                  professionalName: ctx.professionalName,
                };
                if (navigation) {
                  navigation.navigate('Checkout', params);
                } else if (navigationRef.isReady()) {
                  navigationRef.navigate('Checkout', params);
                } else {
                  const queryStr = `professionalId=${ctx.professionalId}&selectedTime=${encodeURIComponent(selectedTime || '')}&serviceId=${ctx.serviceId}&appointmentId=${appointmentId}&imageUrl=${encodeURIComponent(ctx.imageUrl || '')}&professionalName=${encodeURIComponent(ctx.professionalName || '')}`;
                  if (Platform.OS === 'web') {
                    window.location.href = `/checkout?${queryStr}`;
                  } else {
                    import('react-native').then(({ Linking }) => {
                      Linking.openURL(`delbicos://checkout?${queryStr}`);
                    });
                  }
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Pagar agendamento">
              <Text style={{ color: colors.primaryWhite, fontFamily: 'Afacad-Bold', fontSize: 13 }}>Pagar</Text>
            </TouchableOpacity>
          )}

          {appointmentStatus === 'confirmed' && appointmentPaid && (
            <TouchableOpacity
              style={{
                backgroundColor: colors.primaryBlue,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                marginLeft: 12,
              }}
              onPress={() => {
                if (navigation) {
                  navigation.navigate('MySchedules');
                } else if (navigationRef.isReady()) {
                  navigationRef.navigate('MySchedules');
                } else {
                  if (Platform.OS === 'web') {
                    window.location.href = `/profile?subroute=MeusAgendamentos`;
                  } else {
                    import('react-native').then(({ Linking }) => {
                      Linking.openURL(`delbicos://schedules`);
                    });
                  }
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Ver agendamento">
              <Text style={{ color: colors.primaryWhite, fontFamily: 'Afacad-Bold', fontSize: 13 }}>Ver Agenda</Text>
            </TouchableOpacity>
          )}
        </View>
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
          maxLength={2000}
          editable={!loading && rateLimitCountdown === 0}
          // (#7) Teclado numérico quando o bot aguarda ID de agendamento
          keyboardType={
            conversationState === 'AGUARDANDO_ID_AGENDAMENTO' ? 'numeric' : 'default'
          }
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

