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
let _restoreRequestId = 0;
let _conversationRequestId = 0;

type ConversationRequestKind = 'message' | 'voice' | 'restart';

interface ConversationRequest {
  id: number;
  kind: ConversationRequestKind;
  controller: AbortController;
}

let _activeConversationRequest: ConversationRequest | null = null;

function beginConversationRequest(
  kind: ConversationRequestKind,
): ConversationRequest {
  _activeConversationRequest?.controller.abort();
  const request = {
    id: ++_conversationRequestId,
    kind,
    controller: new AbortController(),
  };
  _activeConversationRequest = request;
  return request;
}

function isCurrentConversationRequest(request: ConversationRequest): boolean {
  return _activeConversationRequest?.id === request.id;
}

function finishConversationRequest(request: ConversationRequest): boolean {
  if (!isCurrentConversationRequest(request)) return false;
  _activeConversationRequest = null;
  return true;
}

type VoiceSubmissionStatus = 'sent' | 'retryable_error' | 'discarded';

const EMPTY_CHATBOT_RESPONSE_ERROR =
  'O assistente não conseguiu responder agora. Tente novamente.';

interface VoiceCommandAttempt {
  recording: VoiceRecording;
  idempotencyKey: string;
}

interface ConversationResponseOptions {
  /** Mantém o balão otimista quando o backend troca/limpa a sessão. */
  preserveUserMessage?: ChatBotMessage;
}

function hasChatBotMessage(response: unknown): response is SendMessageResponse {
  if (!response || typeof response !== 'object') return false;
  const message = (response as { message?: unknown }).message;
  return typeof message === 'string' && message.trim().length > 0;
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

function formatSuggestedDateLabel(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

/**
 * Deriva quick replies com base no estado e contexto retornados pelo backend.
 *
 * - COLETANDO_SERVICO: chips numerados com nomes de serviços (context.serviceOptions)
 * - COLETANDO_DATA: chips com as datas ISO sugeridas pelo backend
 * - SELECIONANDO_PROFISSIONAL: chips com nomes dos profissionais
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
    // Um contexto estritamente legado ainda não possui o mapeamento de serviços
    // agrupados. A migração desse contrato pertence ao backend.
    if (
      context.serviceOptionsData?.length &&
      !context.serviceChoicesData?.length
    ) {
      return undefined;
    }
    const serviceNames = context.serviceChoicesData?.length
      ? context.serviceChoicesData.map((choice) => choice.title)
      : context.serviceOptions;
    if (serviceNames?.length) {
      return serviceNames.map((name, i) => ({
        label: name,
        value: String(i + 1),
      }));
    }
  }
  if (state === 'COLETANDO_DATA' && context.suggestedDates?.length) {
    return context.suggestedDates.map((date) => ({
      label: formatSuggestedDateLabel(date),
      // Envia a data ISO, não o índice visual. Assim a escolha continua
      // correta mesmo se a sessão for restaurada ou as sugestões mudarem.
      value: date,
    }));
  }
  if (
    state === 'SELECIONANDO_PROFISSIONAL' &&
    context.professionalOptionsData?.length
  ) {
    return context.professionalOptionsData.map((option) => ({
      label: option.professionalName,
      value: String(option.index),
    }));
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
  const fallbackDate = context.date ?? context.selectedDate;

  // Se o backend enviou metadados dos slots (com nome do profissional e horário real),
  // mapeamos os índices para rótulos legíveis
  const slotsData = context.suggestedSlotsData;

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
  if (status === 429) {
    return 'Limite de uso da API de voz atingido. Aguarde a contagem para tentar novamente.';
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
  const lastVoiceCommandRef = useRef<VoiceCommandAttempt | null>(null);
  const lastTextMessageRef = useRef<ChatBotMessage | null>(null);
  const [hasRetryableVoiceCommand, setHasRetryableVoiceCommand] =
    useState(false);
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

    const requestId = ++_restoreRequestId;
    const initialStore = useChatBotStore.getState();
    const initialSessionId = initialStore.sessionId;
    const initialMessageCount = initialStore.messages.length;

    try {
      setLoading(true);
      setError(null);
      const { data } = await backendHttpClient.get<LoadSessionResponse | null>(
        '/api/chat/bot/session/active',
      );

      // Outra ChatWindow pode ter iniciado uma restauração mais recente.
      // Nunca deixe uma resposta antiga sobrescrever o store compartilhado.
      if (requestId !== _restoreRequestId) return;

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
      if (requestId !== _restoreRequestId) return;
      // O assistente continua totalmente utilizável para novos agendamentos.
      // Se a restauração não encontrar histórico ou falhar, inicia nova sessão silenciosamente.
      resetSession();
    } finally {
      if (requestId === _restoreRequestId) setLoading(false);
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
          { signal: request.controller.signal },
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
  const submitVoiceCommand = useCallback(
    async (attempt: VoiceCommandAttempt): Promise<VoiceSubmissionStatus> => {
      if (useChatBotStore.getState().loading) return 'discarded';

      const request = beginConversationRequest('voice');
      setLoading(true);
      setError(null);
      setLastSentText(null);
      let canRetry = true;

      try {
        const audioResponse = await fetch(attempt.recording.uri, {
          signal: request.controller.signal,
        });
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
              // O Blob criado por fetch(file://...) no Android pode rotular um
              // M4A/AAC como audio/mpeg. O gravador conhece o formato real e
              // deve ter prioridade para o backend não enviar M4A como MP3 ao
              // provedor de transcrição.
              'Content-Type': attempt.recording.mimeType || audio.type,
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
            // O backend pode fazer duas tentativas de transcrição dentro de
            // um orçamento de 45 s. O timeout global do Axios é 30 s e fazia
            // o app abandonar uma resposta válida durante a segunda tentativa.
            timeout: 60_000,
            signal: request.controller.signal,
          },
        );

        if (!isCurrentConversationRequest(request)) return 'discarded';

        const transcript = data.transcript?.trim();
        if (!transcript) {
          throw new Error('O serviço não retornou uma transcrição.');
        }

        if (!hasChatBotMessage(data)) {
          setError(EMPTY_CHATBOT_RESPONSE_ERROR);
          setHasRetryableVoiceCommand(true);
          return 'retryable_error';
        }

        const transcriptMessage: ChatBotMessage = {
          id: localId(),
          role: 'user',
          text: transcript,
          createdAt: new Date().toISOString(),
        };
        addMessage(transcriptMessage);
        applyConversationResponse(data, {
          preserveUserMessage: transcriptMessage,
        });
        attempt.recording.release();
        if (lastVoiceCommandRef.current === attempt) {
          lastVoiceCommandRef.current = null;
        }
        setHasRetryableVoiceCommand(false);
        return 'sent';
      } catch (err: unknown) {
        if (!isCurrentConversationRequest(request)) return 'discarded';

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
        if (finishConversationRequest(request)) setLoading(false);
      }
    },
    [
      addMessage,
      applyConversationResponse,
      conversationContext,
      conversationState,
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
      if (useChatBotStore.getState().loading) return 'discarded';
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
    [setError, submitVoiceCommand],
  );

  /** Reenvia exatamente o mesmo áudio quando a rede/provedor falhou. */
  const retryLastVoiceCommand = useCallback(async () => {
    const attempt = lastVoiceCommandRef.current;
    if (!attempt || useChatBotStore.getState().loading) return;
    await submitVoiceCommand(attempt);
  }, [submitVoiceCommand]);

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
    if (_activeConversationRequest?.kind === 'restart') return;

    // Invalida restaurações e envios ainda pendentes. Assim Reiniciar também
    // funciona quando uma resposta ficou presa em carregamento.
    ++_restoreRequestId;
    const request = beginConversationRequest('restart');
    lastTextMessageRef.current = null;
    lastVoiceCommandRef.current?.recording.release();
    lastVoiceCommandRef.current = null;
    setHasRetryableVoiceCommand(false);
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
  }, [setLoading, setError, postMessage]);

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
    setHasRetryableVoiceCommand(false);
  }, [setError, setRateLimitResetAt]);

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
