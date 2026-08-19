import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import uuid from 'react-native-uuid';
import { useChatBotStore } from '@stores/ChatBot';
import { backendHttpClient } from '@lib/helpers/httpClient';
import type { VoiceRecording } from '@hooks/useVoiceRecorder';
import { formatBRLFromCents } from '@lib/helpers/formatCurrency';
import {
  getClientTimezone,
  getClientUtcOffsetMinutes,
  localDateTimeToISO,
  parseLocalDateTime,
  parseSlotParts,
} from '@lib/helpers/datetime';
import { isValidChatBotSessionId } from '@utils/validators';
import {
  ChatBotMessage,
  ChatBotState,
  ChatBotContext,
  ChatBotAction,
  QuickReplyOption,
  SuggestedTime,
  SendMessageResponse,
  LoadSessionResponse,
  VoiceCommandResponse,
} from '@stores/ChatBot/types';
import type { AppointmentStatusEvent } from '@hooks/useAppointmentStatusSocket';

let _counter = 0;
const localId = () => `local_${Date.now()}_${++_counter}`;

type VoiceSubmissionStatus = 'sent' | 'retryable_error' | 'discarded';

interface VoiceCommandAttempt {
  recording: VoiceRecording;
  idempotencyKey: string;
}

function normalizeHistoryMessage(message: unknown): ChatBotMessage | null {
  if (!message || typeof message !== 'object') return null;
  const item = message as Record<string, unknown>;

  if (
    typeof item.text === 'string' &&
    (item.role === 'user' || item.role === 'bot')
  ) {
    return {
      id: String(item.id),
      role: item.role,
      text: item.text,
      createdAt:
        typeof item.createdAt === 'string'
          ? item.createdAt
          : new Date().toISOString(),
    };
  }

  if (
    typeof item.content === 'string' &&
    (item.sender === 'user' || item.sender === 'bot')
  ) {
    return {
      id: `history_${String(item.id)}`,
      role: item.sender,
      text: item.content,
      createdAt:
        typeof item.createdAt === 'string'
          ? item.createdAt
          : new Date().toISOString(),
    };
  }

  return null;
}

/** Canal detectado uma vez na inicialização do módulo. */
const CHANNEL: string = Platform.OS === 'web' ? 'web' : 'mobile';

/**
 * Rótulos legíveis exibidos no balão do usuário ao confirmar uma ação.
 * Evita expor JSON bruto ou IDs na UI.
 */
const ACTION_LABELS: Record<string, string> = {
  confirm_cancel: 'Confirmar cancelamento',
  confirm_reschedule: 'Confirmar alteração de horário',
  confirm_appointment: 'Sim, confirmar',
};

/**
 * Extrai e normaliza o header RateLimit-Reset do Axios.
 * Backend envia epoch Unix em segundos → converte para ms.
 */
function extractRateLimitReset(
  headers: Record<string, string> | undefined,
): number | null {
  const raw = headers?.['ratelimit-reset'] ?? headers?.['RateLimit-Reset'];
  if (!raw) return null;
  const epoch = Number(raw);
  return isNaN(epoch) ? null : epoch * 1000;
}

/**
 * Deriva quick replies com base no estado e contexto retornados pelo backend.
 *
 * - COLETANDO_SERVICO: chips numerados com nomes de serviços (context.serviceOptions)
 * - CONFIRMACAO: "Sim" / "Não"
 */
function deriveQuickReplies(
  state: ChatBotState,
  context: ChatBotContext,
): QuickReplyOption[] | undefined {
  if (state === 'COLETANDO_SERVICO') {
    if (context.pendingService) {
      return [
        { label: 'Sim', value: 'sim' },
        { label: 'Não', value: 'não' },
      ];
    }
    // As ofertas completas são exibidas em cartões; evita repetir chips abaixo.
    if (context.serviceOptionsData?.length) return undefined;
    if (context.serviceOptions?.length) {
      return context.serviceOptions.map((name, i) => ({
        label: name,
        value: String(i + 1),
      }));
    }
  }
  if (state === 'CONFIRMACAO') {
    return [
      { label: 'Sim, confirmar', value: 'sim' },
      { label: 'Não, cancelar', value: 'não' },
    ];
  }
  return undefined;
}

/**
 * Parseia um slot do backend em SuggestedTime.
 *
 * Formatos possíveis (conforme doc do backend):
 * - "HH:MM"             → mesmo dia, apenas horário
 * - "YYYY-MM-DD|HH:MM" → dia alternativo, data separada do horário por "|"
 */
function parseSlot(slot: string, fallbackDate?: string): SuggestedTime {
  try {
    const parts = parseSlotParts(slot, fallbackDate);
    if (parts && parts.time && parts.time.includes(':')) {
      const parsed = parseLocalDateTime(parts.date, parts.time);
      if (!isNaN(parsed.getTime())) {
        const label = new Intl.DateTimeFormat('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).format(parsed);
        return { label, value: slot };
      }
    }
  } catch (e) {
    console.warn('[useChatSession] Error parsing slot:', slot, e);
  }
  // Mesmo dia — slot já é "HH:MM" ou fallback genérico
  return { label: slot, value: slot };
}

/**
 * Deriva horários sugeridos somente no estado COLETANDO_HORARIO.
 */
function deriveSuggestedTimes(
  state: ChatBotState,
  context: ChatBotContext,
): SuggestedTime[] | undefined {
  if (state !== 'COLETANDO_HORARIO' || !context.suggestedSlots?.length)
    return undefined;
  const fallbackDate = (context as any).date ?? context.selectedDate;

  // Se o backend enviou metadados dos slots (com nome do profissional e horário real),
  // mapeamos os índices para rótulos legíveis
  const slotsData = (context as any).suggestedSlotsData as
    | {
        index: number;
        time: string;
        professionalName: string;
      }[]
    | undefined;

  if (slotsData && slotsData.length > 0) {
    return context.suggestedSlots.map((slot) => {
      const idx = parseInt(slot, 10);
      const matched = slotsData.find((d) => d.index === idx);
      if (matched) {
        return {
          label: `${matched.professionalName} — ${matched.time}`,
          value: slot, // envia o índice para o bot
        };
      }
      return parseSlot(slot, fallbackDate);
    });
  }

  return context.suggestedSlots.map((slot) => parseSlot(slot, fallbackDate));
}

/**
 * Deriva a ação de confirmação de agendamento quando o estado é CONFIRMACAO + CREATE.
 * Permite ao ChatWindow renderizar o AppointmentCard com os dados coletados.
 */
function deriveBotAction(
  state: ChatBotState,
  context: ChatBotContext,
): ChatBotAction | undefined {
  if (state !== 'CONFIRMACAO' || context.pendingAction !== 'CREATE')
    return undefined;
  if (!context.serviceName && !context.professionalName) return undefined;

  // Backend usa `date` e `time` no contexto (não selectedDate/selectedTime)
  const ctxDate = (context as any).date ?? context.selectedDate;
  const ctxTime = (context as any).time ?? context.selectedTime;
  const startTime =
    ctxDate && ctxTime
      ? localDateTimeToISO(ctxDate, ctxTime)
      : new Date().toISOString();

  // Calcula endTime a partir de serviceDuration (minutos), se disponivel no contexto
  let endTime = startTime;
  if (
    context.serviceDuration &&
    typeof context.serviceDuration === 'number' &&
    ctxDate &&
    ctxTime
  ) {
    const end = parseLocalDateTime(ctxDate, ctxTime);
    end.setMinutes(end.getMinutes() + context.serviceDuration);
    endTime = end.toISOString();
  }

  // Backend usa `servicePrice` (centavos) — fallback para `price`
  const rawPrice = (context as any).servicePrice ?? context.price;

  return {
    type: 'confirm_appointment',
    appointment: {
      serviceTitle: context.serviceName ?? '',
      serviceDescription: context.serviceDescription,
      subcategoryName: context.serviceSubcategoryName,
      categoryName: context.serviceCategoryName,
      professionalName: context.professionalName ?? '',
      professionalRating: context.professionalRating,
      professionalRatingsCount: context.professionalRatingsCount,
      professionalLocation:
        context.professionalCity && context.professionalState
          ? `${context.professionalCity}/${context.professionalState}`
          : null,
      durationMinutes: context.serviceDuration,
      professionalAvatarUri: context.professionalAvatarUri ?? null,
      startTime,
      endTime,
      price:
        rawPrice != null
          ? formatBRLFromCents(
              typeof rawPrice === 'number' ? rawPrice : Number(rawPrice),
            )
          : '',
    },
  };
}

/** Trata erros HTTP — retorna mensagem amigável para erros conhecidos. */
function resolveGenericError(status: number | undefined): string {
  if (status === 404)
    return 'Sessão não encontrada. Uma nova conversa será iniciada.';
  return 'Não foi possível enviar a mensagem. Tente novamente.';
}

/** Retorna mensagens específicas para os erros de envio de áudio. */
function resolveVoiceError(status: number | undefined): string {
  if (status === 413) {
    return 'O áudio está muito longo. Grave um comando mais curto e tente novamente.';
  }
  if (status === 415) {
    return 'Este formato de áudio não é compatível. Tente gravar novamente.';
  }
  if (status === 422) {
    return 'Não foi possível entender o áudio. Fale mais perto do microfone e tente novamente.';
  }
  if (status === 502) {
    return 'O serviço de transcrição não respondeu. Tente enviar o áudio novamente.';
  }
  if (status === 503) {
    return 'A transcrição de voz está temporariamente indisponível. Tente novamente em instantes.';
  }
  return resolveGenericError(status);
}

/**
 * Deriva ISO UTC do horário selecionado, alinhado ao checkout.
 * Enviado ao backend para gravar start_time corretamente no banco.
 */
function resolveSelectedTimeIso(
  messageText: string,
  state: ChatBotState | null,
  context: ChatBotContext | null,
): string | undefined {
  if (!state || !context) return undefined;

  const ctxDate = (context as any).date ?? context.selectedDate;
  const ctxTime = (context as any).time ?? context.selectedTime;

  if (state === 'CONFIRMACAO' && ctxDate && ctxTime) {
    try {
      return localDateTimeToISO(ctxDate, ctxTime);
    } catch (e) {
      console.warn('[useChatSession] Error formatting ISO for CONFIRMACAO:', e);
    }
  }

  if (state === 'COLETANDO_HORARIO') {
    const slotParts = parseSlotParts(messageText.trim(), ctxDate);
    if (slotParts && slotParts.time && slotParts.time.includes(':')) {
      try {
        return localDateTimeToISO(slotParts.date, slotParts.time);
      } catch (e) {
        console.warn('[useChatSession] Error formatting ISO for slotParts:', e);
      }
    }
    if (ctxDate && /^\d{1,2}:\d{2}$/.test(messageText.trim())) {
      try {
        return localDateTimeToISO(ctxDate, messageText.trim());
      } catch (e) {
        console.warn(
          '[useChatSession] Error formatting ISO for time string:',
          e,
        );
      }
    }
  }

  return undefined;
}

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
  const lastVoiceCommandRef = useRef<VoiceCommandAttempt | null>(null);
  const [hasRetryableVoiceCommand, setHasRetryableVoiceCommand] =
    useState(false);

  /**
   * Restaura somente o fluxo pendente do JWT atual. O backend retorna null
   * para logins novos, impedindo que um session_id persistido de outra conta
   * seja exibido no chat.
   */
  const restoreActiveSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await backendHttpClient.get<LoadSessionResponse | null>(
        '/api/chat/bot/session/active',
      );
      if (!data) {
        clearSession();
        return;
      }
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        const restoredMessages = data.messages
          .map(normalizeHistoryMessage)
          .filter((message): message is ChatBotMessage => message !== null);
        prependMessages(restoredMessages);
      }
      setSessionId(data.session.id);
      if (data.session.state) {
        setConversationState(data.session.state, {
          ...(data.session.context ?? {}),
          ...(data.session.appointment_id
            ? { appointmentId: data.session.appointment_id }
            : {}),
          ...(data.session.appointment_status
            ? { appointmentStatus: data.session.appointment_status }
            : {}),
          appointmentPaid: data.session.appointment_paid ?? false,
        });
      }
    } catch {
      // O chat continua utilizável mesmo que a restauração falhe.
      resetSession();
      setError('Não foi possível restaurar a conversa.');
    } finally {
      setLoading(false);
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
    (data: SendMessageResponse) => {
      // "reiniciar" encerra a sessão persistida no backend. Removemos as
      // mensagens locais, inclusive o próprio comando, antes de exibir o
      // primeiro balão da nova conversa.
      if (data.clear_history === true) {
        clearSession();
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

      if (typeof data.message === 'string' && data.message.length > 0) {
        addMessage({
          id: localId(),
          role: 'bot',
          text: data.message,
          createdAt: new Date().toISOString(),
          quickReplies: deriveQuickReplies(data.state, data.context ?? {}),
          suggestedTimes: deriveSuggestedTimes(data.state, data.context ?? {}),
          action: deriveBotAction(data.state, data.context ?? {}),
        });
      }

      setRateLimitResetAt(null);
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

  /**
   * Lógica compartilhada de envio HTTP.
   * Rastreia lastSentText, trata FINALIZADO (#4), 429 com header (#6).
   */
  const postMessage = useCallback(
    async (messageText: string): Promise<string | null> => {
      // Salva para uso em retryLastMessage (#5)
      setLastSentText(messageText);

      try {
        const selectedTime = resolveSelectedTimeIso(
          messageText,
          conversationState,
          conversationContext,
        );

        const { data } = await backendHttpClient.post<SendMessageResponse>(
          '/api/chat/bot/message',
          {
            message: messageText,
            ...(isValidChatBotSessionId(sessionId)
              ? { session_id: sessionId }
              : {}),
            channel: CHANNEL,
            timezone: getClientTimezone(),
            utc_offset_minutes: getClientUtcOffsetMinutes(),
            ...(selectedTime ? { selected_time: selectedTime } : {}),
          },
        );

        applyConversationResponse(data);
        return null;
      } catch (err: unknown) {
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
  const submitVoiceCommand = useCallback(
    async (attempt: VoiceCommandAttempt): Promise<VoiceSubmissionStatus> => {
      if (loading) return 'discarded';

      setLoading(true);
      setError(null);
      setLastSentText(null);
      let canRetry = true;

      try {
        const audioResponse = await fetch(attempt.recording.uri);
        const audio = await audioResponse.blob();
        if (audio.size === 0) {
          canRetry = false;
          throw new Error('O arquivo de áudio está vazio.');
        }

        const selectedTime = resolveSelectedTimeIso(
          '',
          conversationState,
          conversationContext,
        );
        const { data } = await backendHttpClient.post<VoiceCommandResponse>(
          '/api/voice/commands',
          audio,
          {
            headers: {
              'Content-Type': audio.type || attempt.recording.mimeType,
              Accept: 'application/json',
              'X-Voice-Language': 'pt-BR',
              'X-Voice-Channel': `voice-${CHANNEL}`,
              'X-Voice-Timezone': getClientTimezone(),
              'Idempotency-Key': attempt.idempotencyKey,
              ...(isValidChatBotSessionId(sessionId)
                ? { 'X-Voice-Session-Id': String(sessionId) }
                : {}),
              ...(selectedTime
                ? { 'X-Voice-Selected-Time': selectedTime }
                : {}),
            },
            // Impede que o cliente converta o Blob para JSON antes do envio.
            transformRequest: [(body) => body],
          },
        );

        const transcript = data.transcript?.trim();
        if (!transcript) {
          throw new Error('O serviço não retornou uma transcrição.');
        }

        addMessage({
          id: localId(),
          role: 'user',
          text: transcript,
          createdAt: new Date().toISOString(),
        });
        applyConversationResponse(data);
        attempt.recording.release();
        if (lastVoiceCommandRef.current === attempt) {
          lastVoiceCommandRef.current = null;
        }
        setHasRetryableVoiceCommand(false);
        return 'sent';
      } catch (err: unknown) {
        let status: number | undefined;
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosErr = err as {
            response?: { status?: number; headers?: Record<string, string> };
          };
          status = axiosErr.response?.status;
          if (status === 429) {
            const resetAt = extractRateLimitReset(axiosErr.response?.headers);
            setRateLimitResetAt(resetAt ?? Date.now() + 60_000);
          }
          if (status === 404) resetSession();
          setError(resolveVoiceError(status));
        } else {
          setError('Não foi possível enviar o áudio. Tente novamente.');
        }

        const isRetryable =
          canRetry && status !== 413 && status !== 415 && status !== 422;
        setHasRetryableVoiceCommand(isRetryable);
        if (!isRetryable) {
          attempt.recording.release();
          if (lastVoiceCommandRef.current === attempt) {
            lastVoiceCommandRef.current = null;
          }
          return 'discarded';
        }
        return 'retryable_error';
      } finally {
        setLoading(false);
      }
    },
    [
      addMessage,
      applyConversationResponse,
      conversationContext,
      conversationState,
      loading,
      resetSession,
      sessionId,
      setError,
      setLastSentText,
      setLoading,
      setRateLimitResetAt,
    ],
  );

  /** Inicia uma nova tentativa de voz e descarta uma gravação pendente anterior. */
  const sendVoiceCommand = useCallback(
    async (recording: VoiceRecording): Promise<VoiceSubmissionStatus> => {
      if (loading) return 'discarded';
      if (recording.durationMillis < 300) {
        recording.release();
        setError(
          'A gravação ficou muito curta. Grave por mais alguns instantes.',
        );
        return 'discarded';
      }

      lastVoiceCommandRef.current?.recording.release();
      const attempt: VoiceCommandAttempt = {
        recording,
        idempotencyKey: String(uuid.v4()),
      };
      lastVoiceCommandRef.current = attempt;
      setHasRetryableVoiceCommand(false);
      return submitVoiceCommand(attempt);
    },
    [loading, setError, submitVoiceCommand],
  );

  /** Reenvia exatamente o mesmo áudio quando a rede/provedor falhou. */
  const retryLastVoiceCommand = useCallback(async () => {
    const attempt = lastVoiceCommandRef.current;
    if (!attempt || loading) return;
    await submitVoiceCommand(attempt);
  }, [loading, submitVoiceCommand]);

  /** Envia uma mensagem de texto livre. (#8) loading guard já impede duplicação. */
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      addMessage({
        id: localId(),
        role: 'user',
        text: trimmed,
        createdAt: new Date().toISOString(),
      });
      setLoading(true);
      setError(null);

      const errorMsg = await postMessage(trimmed);
      if (errorMsg) setError(errorMsg);
      setLoading(false);
    },
    [loading, addMessage, setLoading, setError, postMessage],
  );

  /** Envia um quick reply sem que o usuário precise digitar. */
  const sendQuickReply = useCallback(
    async (option: QuickReplyOption) => {
      await sendMessage(option.value);
    },
    [sendMessage],
  );

  /** Reinicia a conversa persistida sem exibir o comando como mensagem do usuário. */
  const restartConversation = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);
    const errorMsg = await postMessage('reiniciar');
    if (errorMsg) setError(errorMsg);
    setLoading(false);
  }, [loading, setLoading, setError, postMessage]);

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
      if (loading) return;

      const displayLabel = ACTION_LABELS[actionType] ?? 'Confirmar';
      const textToSend = payload.appointmentId
        ? String(payload.appointmentId)
        : 'sim';

      addMessage({
        id: localId(),
        role: 'user',
        text: displayLabel,
        createdAt: new Date().toISOString(),
      });
      setLoading(true);
      setError(null);

      const errorMsg = await postMessage(textToSend);
      if (errorMsg) setError(errorMsg);
      setLoading(false);
    },
    [loading, addMessage, setLoading, setError, postMessage],
  );

  /**
   * (#5) Reenvia a última mensagem sem adicionar novo balão de usuário.
   * Botão "Tentar novamente" no ChatWindow chama isso após erro 500.
   */
  const retryLastMessage = useCallback(async () => {
    const text = useChatBotStore.getState().lastSentText;
    if (!text || loading) return;
    setLoading(true);
    setError(null);
    const errorMsg = await postMessage(text);
    if (errorMsg) setError(errorMsg);
    setLoading(false);
  }, [loading, setLoading, setError, postMessage]);

  /** (#6) Chamado pelo countdown do ChatWindow ao zerar. */
  const clearRateLimitReset = useCallback(() => {
    setRateLimitResetAt(null);
  }, [setRateLimitResetAt]);

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
    rateLimitResetAt,
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
