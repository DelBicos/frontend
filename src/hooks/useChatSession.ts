import { useCallback, useRef, useState } from 'react';
import { useChatBotStore } from '@stores/ChatBot';
import {
  getClientTimezone,
  getClientUtcOffsetMinutes,
} from '@lib/helpers/datetime';
import { isValidChatBotSessionId } from '@utils/validators';
import type {
  ChatBotMessage,
  ChatBotContext,
  QuickReplyOption,
  SendMessageResponse,
} from '@stores/ChatBot/types';
import * as ChatBotApi from '@api/chatbot';
import {
  ACTION_LABELS,
  deriveBotAction,
  deriveQuickReplies,
  deriveSuggestedTimes,
  hasChatBotMessage,
  normalizeHistoryMessage,
  resolveSelectedTimeIso,
} from '@lib/chatbot/derive';
import {
  EMPTY_CHATBOT_RESPONSE_ERROR,
  extractRateLimitReset,
  resolveGenericError,
} from '@lib/chatbot/errors';
import {
  ConversationRequest,
  activeConversationKind,
  beginConversationRequest,
  finishConversationRequest,
  isCurrentConversationRequest,
  isCurrentRestoreRequest,
  nextRestoreRequestId,
} from '@lib/chatbot/conversationRequest';
import type { AppointmentStatusEvent } from '@hooks/useAppointmentStatusSocket';
import { useChatVoice } from './useChatVoice';
import {
  CHANNEL,
  ConversationResponseOptions,
  localId,
} from './chatSession.shared';

/**
 * Hook principal do chatbot de agendamentos.
 *
 * Implementa as melhorias sugeridas pelo backend:
 * (#1)  Preços convertidos de centavos para BRL via formatCentsToBRL
 * (#3)  session_id persistido no AsyncStorage (via expo-zustand-persist no store)
 * (#4)  Sessão zerada automaticamente quando state === FINALIZADO
 * (#5)  retryLastMessage reenvia a última mensagem sem novo balão de usuário
 * (#6)  RateLimit-Reset extraído do header 429 para countdown na UI
 * (#7)  keyboardType "numeric" exposto via conversationState (consumido no ChatWindow)
 * (#2/#8) Typing indicator e deduplicação já implementados (loading guard)
 */
export function useChatSession() {
  const {
    sessionId,
    messages,
    loading,
    error,
    lastSentText,
    rateLimitResetAt,
    hasHydrated,
    conversationState,
    conversationContext,
    setSessionId,
    addMessage,
    prependMessages,
    setLoading,
    setError,
    setConversationState,
    setLastSentText,
    setRateLimitResetAt,
    resetSession,
    clearSession,
  } = useChatBotStore();
  const lastTextMessageRef = useRef<ChatBotMessage | null>(null);
  const [isRestarting, setIsRestarting] = useState(false);

  /**
   * Restaura somente o fluxo pendente do JWT atual. O backend retorna null
   * para logins novos, impedindo que um session_id persistido de outra conta
   * seja exibido no chat.
   */
  const restoreActiveSession = useCallback(async () => {
    // O middleware persistente hidrata de forma assíncrona no web e no
    // nativo. Aguardar esse sinal evita comparar a resposta HTTP com um
    // sessionId que ainda estava chegando do armazenamento.
    if (!useChatBotStore.getState().hasHydrated) return;

    const requestId = nextRestoreRequestId();
    const initialStore = useChatBotStore.getState();
    const initialSessionId = initialStore.sessionId;
    const initialMessageCount = initialStore.messages.length;

    try {
      setLoading(true);
      setError(null);
      const data = await ChatBotApi.getActiveSession();

      // Outra ChatWindow pode ter iniciado uma restauração mais recente.
      // Nunca deixe uma resposta antiga sobrescrever o store compartilhado.
      if (!isCurrentRestoreRequest(requestId)) return;

      const currentStore = useChatBotStore.getState();
      const storeChangedWhileLoading =
        currentStore.sessionId !== initialSessionId ||
        currentStore.messages.length !== initialMessageCount;
      if (storeChangedWhileLoading) return;

      if (!data) {
        clearSession();
        return;
      }
      const restoredContext: ChatBotContext = {
        ...(data.session.context ?? {}),
        ...(data.session.appointment_id
          ? { appointmentId: data.session.appointment_id }
          : {}),
        ...(data.session.appointment_status
          ? { appointmentStatus: data.session.appointment_status }
          : {}),
        appointmentPaid: data.session.appointment_paid ?? false,
      };
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        const restoredMessages = data.messages
          .map(normalizeHistoryMessage)
          .filter((message): message is ChatBotMessage => message !== null);

        // O histórico persiste apenas texto. Recria as ações do último balão
        // usando o estado/contexto atuais (inclusive após migração de sessões
        // antigas), para não exibir números com um significado já obsoleto.
        for (let index = restoredMessages.length - 1; index >= 0; index -= 1) {
          if (restoredMessages[index].role !== 'bot') continue;
          restoredMessages[index] = {
            ...restoredMessages[index],
            quickReplies: deriveQuickReplies(
              data.session.state,
              restoredContext,
            ),
            suggestedTimes: deriveSuggestedTimes(
              data.session.state,
              restoredContext,
            ),
            action: deriveBotAction(data.session.state, restoredContext),
          };
          break;
        }
        prependMessages(restoredMessages);
      }
      setSessionId(data.session.id);
      if (data.session.state) {
        setConversationState(data.session.state, restoredContext);
      }
    } catch {
      if (!isCurrentRestoreRequest(requestId)) return;
      // O assistente continua totalmente utilizável para novos agendamentos.
      // Se a restauração não encontrar histórico ou falhar, inicia nova sessão silenciosamente.
      resetSession();
    } finally {
      if (isCurrentRestoreRequest(requestId)) setLoading(false);
    }
  }, [
    setLoading,
    setError,
    prependMessages,
    setSessionId,
    setConversationState,
    resetSession,
    clearSession,
  ]);

  /**
   * Atualiza a conversa com a resposta compartilhada por texto e voz.
   * Mantém a mesma máquina de estados, quick replies e cartões nos dois canais.
   */
  const applyConversationResponse = useCallback(
    (
      data: SendMessageResponse,
      options: ConversationResponseOptions = {},
    ): boolean => {
      // Uma resposta HTTP 200 ainda pode estar malformada. Sem esta proteção,
      // a mensagem do usuário fica no histórico sem balão do bot nem erro.
      if (!hasChatBotMessage(data)) return false;

      // "reiniciar" encerra a sessão persistida no backend. Removemos as
      // mensagens anteriores, mas preservamos o balão que disparou a ação
      // quando o comando veio do campo de texto.
      if (data.clear_history === true) {
        clearSession();
        if (options.preserveUserMessage) {
          addMessage(options.preserveUserMessage);
        }
      }

      if (isValidChatBotSessionId(data.session_id)) {
        setSessionId(data.session_id);
      }
      if (data.state && data.context) {
        setConversationState(data.state, data.context);
      }

      // Sessão finalizada: zera sessionId/state sem apagar mensagens.
      // A próxima mensagem cria uma nova sessão automaticamente.
      if (data.state === 'FINALIZADO') {
        resetSession();
      }

      addMessage({
        id: localId(),
        role: 'bot',
        text: data.message,
        createdAt: new Date().toISOString(),
        quickReplies: deriveQuickReplies(data.state, data.context ?? {}),
        suggestedTimes: deriveSuggestedTimes(data.state, data.context ?? {}),
        action: deriveBotAction(data.state, data.context ?? {}),
      });

      setRateLimitResetAt(null);
      return true;
    },
    [
      addMessage,
      clearSession,
      resetSession,
      setConversationState,
      setRateLimitResetAt,
      setSessionId,
    ],
  );

  const {
    hasRetryableVoiceCommand,
    sendVoiceCommand,
    retryLastVoiceCommand,
    discardPendingVoiceCommand,
    clearRetryableVoiceCommand,
  } = useChatVoice({ applyConversationResponse });

  /**
   * Lógica compartilhada de envio HTTP.
   * Rastreia lastSentText, trata FINALIZADO (#4), 429 com header (#6).
   */
  const postMessage = useCallback(
    async (
      messageText: string,
      request: ConversationRequest,
      preserveUserMessage?: ChatBotMessage,
    ): Promise<string | null> => {
      // Salva para uso em retryLastMessage (#5)
      setLastSentText(messageText);

      try {
        const selectedTime = resolveSelectedTimeIso(
          messageText,
          conversationState,
          conversationContext,
        );

        const data = await ChatBotApi.sendMessage(
          {
            message: messageText,
            sessionId: isValidChatBotSessionId(sessionId) ? sessionId : null,
            channel: CHANNEL,
            timezone: getClientTimezone(),
            utcOffsetMinutes: getClientUtcOffsetMinutes(),
            selectedTime,
          },
          request.controller.signal,
        );

        if (!isCurrentConversationRequest(request)) return null;

        return applyConversationResponse(data, { preserveUserMessage })
          ? null
          : EMPTY_CHATBOT_RESPONSE_ERROR;
      } catch (err: unknown) {
        // Uma nova ação (principalmente Reiniciar) substituiu esta requisição.
        // A resposta/erro antigo não deve alterar a conversa atual.
        if (!isCurrentConversationRequest(request)) return null;

        if (err && typeof err === 'object' && 'response' in err) {
          const axiosErr = err as {
            response?: { status?: number; headers?: Record<string, string> };
          };
          const status = axiosErr.response?.status;

          if (status === 429) {
            // (#6) Extrai RateLimit-Reset para countdown na UI
            const resetAt = extractRateLimitReset(axiosErr.response?.headers);
            setRateLimitResetAt(resetAt ?? Date.now() + 60_000);
            return 'Muitas mensagens enviadas. Aguarde antes de tentar novamente.';
          }
          if (status === 404) {
            resetSession();
          }
          return resolveGenericError(status);
        }
        return 'Não foi possível enviar a mensagem. Tente novamente.';
      }
    },
    [
      sessionId,
      conversationState,
      conversationContext,
      setLastSentText,
      setRateLimitResetAt,
      resetSession,
      applyConversationResponse,
    ],
  );

  /** Envia (ou reenvia) uma gravação mantendo a mesma chave de idempotência. */
  /** Envia uma mensagem de texto livre. (#8) loading guard já impede duplicação. */
  const sendMessage = useCallback(
    (text: string, displayText = text): boolean => {
      const trimmed = text.trim();
      const trimmedDisplayText = displayText.trim();
      // Consulta o store atual, não o valor capturado pelo render. Assim, um
      // toque ocorrido durante restauração/reinício não perde o texto digitado.
      if (
        !trimmed ||
        !trimmedDisplayText ||
        useChatBotStore.getState().loading
      ) {
        return false;
      }

      const optimisticMessage: ChatBotMessage = {
        id: localId(),
        role: 'user',
        text: trimmedDisplayText,
        createdAt: new Date().toISOString(),
      };
      const request = beginConversationRequest('message');
      lastTextMessageRef.current = optimisticMessage;
      addMessage(optimisticMessage);
      setLoading(true);
      setError(null);

      void postMessage(trimmed, request, optimisticMessage)
        .then((errorMsg) => {
          if (errorMsg && isCurrentConversationRequest(request)) {
            setError(errorMsg);
          }
        })
        .catch(() => {
          if (isCurrentConversationRequest(request)) {
            setError('Não foi possível enviar a mensagem. Tente novamente.');
          }
        })
        .finally(() => {
          if (finishConversationRequest(request)) setLoading(false);
        });

      return true;
    },
    [addMessage, setLoading, setError, postMessage],
  );

  /** Envia um quick reply sem que o usuário precise digitar. */
  const sendQuickReply = useCallback(
    (option: QuickReplyOption) => {
      sendMessage(option.value, option.label);
    },
    [sendMessage],
  );

  /** Reinicia a conversa persistida sem exibir o comando como mensagem do usuário. */
  const restartConversation = useCallback(async () => {
    if (activeConversationKind() === 'restart') return;

    // Invalida restaurações e envios ainda pendentes. Assim Reiniciar também
    // funciona quando uma resposta ficou presa em carregamento.
    nextRestoreRequestId();
    const request = beginConversationRequest('restart');
    lastTextMessageRef.current = null;
    discardPendingVoiceCommand();
    setIsRestarting(true);
    setLoading(true);
    setError(null);
    try {
      const errorMsg = await postMessage('reiniciar', request);
      if (errorMsg && isCurrentConversationRequest(request)) {
        setError(errorMsg);
      }
    } finally {
      if (finishConversationRequest(request)) setLoading(false);
      setIsRestarting(false);
    }
  }, [setLoading, setError, postMessage, discardPendingVoiceCommand]);

  /** Aplica no chat uma confirmação recebida por Socket.IO ou polling. */
  const receiveAppointmentStatus = useCallback(
    (event: AppointmentStatusEvent) => {
      const store = useChatBotStore.getState();
      const context = store.conversationContext;
      if (context?.appointmentId !== event.appointment_id) return;

      if (
        event.message &&
        !store.messages.some(
          (message) => message.role === 'bot' && message.text === event.message,
        )
      ) {
        store.addMessage({
          id: `appointment_status_${event.appointment_id}_${event.status}_${event.paid}`,
          role: 'bot',
          text: event.message,
          createdAt: event.updated_at,
        });
      }

      store.setConversationState(
        event.status === 'pending' ? 'AGUARDANDO_CONFIRMACAO' : 'INICIO',
        {
          ...context,
          appointmentStatus: event.status,
          appointmentPaid: event.paid,
        },
      );
    },
    [],
  );

  /**
   * Confirma uma ação após o modal de confirmação explícita do frontend.
   * - CONFIRMACAO → envia "sim"
   * - AGUARDANDO_ID_AGENDAMENTO → envia o ID numérico do agendamento
   */
  const confirmAction = useCallback(
    async (
      actionType: string,
      payload: { appointmentId?: number; serviceTitle?: string },
    ) => {
      if (useChatBotStore.getState().loading) return;

      const displayLabel = ACTION_LABELS[actionType] ?? 'Confirmar';
      const textToSend = payload.appointmentId
        ? String(payload.appointmentId)
        : 'sim';

      const optimisticMessage: ChatBotMessage = {
        id: localId(),
        role: 'user',
        text: displayLabel,
        createdAt: new Date().toISOString(),
      };
      lastTextMessageRef.current = optimisticMessage;
      const request = beginConversationRequest('message');
      addMessage(optimisticMessage);
      setLoading(true);
      setError(null);

      try {
        const errorMsg = await postMessage(
          textToSend,
          request,
          optimisticMessage,
        );
        if (errorMsg && isCurrentConversationRequest(request)) {
          setError(errorMsg);
        }
      } finally {
        if (finishConversationRequest(request)) setLoading(false);
      }
    },
    [addMessage, setLoading, setError, postMessage],
  );

  /**
   * (#5) Reenvia a última mensagem sem adicionar novo balão de usuário.
   * Botão "Tentar novamente" no ChatWindow chama isso após erro 500.
   */
  const retryLastMessage = useCallback(async () => {
    const currentStore = useChatBotStore.getState();
    const text = currentStore.lastSentText;
    if (!text || currentStore.loading) return;
    const request = beginConversationRequest('message');
    setLoading(true);
    setError(null);
    const errorMsg = await postMessage(
      text,
      request,
      lastTextMessageRef.current ?? undefined,
    );
    if (errorMsg && isCurrentConversationRequest(request)) setError(errorMsg);
    if (finishConversationRequest(request)) setLoading(false);
  }, [setLoading, setError, postMessage]);

  /** (#6) Chamado pelo countdown do ChatWindow ao zerar. */
  const clearRateLimitReset = useCallback(() => {
    setRateLimitResetAt(null);
    setError(null);
    clearRetryableVoiceCommand();
  }, [setError, setRateLimitResetAt, clearRetryableVoiceCommand]);

  /** Exibe falhas locais, como permissão de microfone, no banner do chat. */
  const reportError = useCallback(
    (message: string) => {
      setLastSentText(null);
      setError(message);
    },
    [setError, setLastSentText],
  );

  return {
    sessionId,
    messages,
    loading,
    error,
    lastSentText,
    hasRetryableVoiceCommand,
    isRestarting,
    rateLimitResetAt,
    hasHydrated,
    conversationState,
    conversationContext,
    sendMessage,
    sendVoiceCommand,
    sendQuickReply,
    restartConversation,
    receiveAppointmentStatus,
    confirmAction,
    retryLastMessage,
    retryLastVoiceCommand,
    clearRateLimitReset,
    reportError,
    clearSession,
    restoreActiveSession,
  };
}
