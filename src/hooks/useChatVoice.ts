import { useCallback, useRef, useState } from 'react';
import uuid from 'react-native-uuid';
import { useChatBotStore } from '@stores/ChatBot';
import type { VoiceRecording } from '@hooks/useVoiceRecorder';
import { getClientTimezone } from '@lib/helpers/datetime';
import { isValidChatBotSessionId } from '@utils/validators';
import type {
  ChatBotMessage,
  SendMessageResponse,
} from '@stores/ChatBot/types';
import * as ChatBotApi from '@api/chatbot';
import { hasChatBotMessage, resolveSelectedTimeIso } from '@lib/chatbot/derive';
import {
  EMPTY_CHATBOT_RESPONSE_ERROR,
  extractRateLimitReset,
  resolveVoiceError,
} from '@lib/chatbot/errors';
import {
  beginConversationRequest,
  finishConversationRequest,
  isCurrentConversationRequest,
} from '@lib/chatbot/conversationRequest';
import {
  CHANNEL,
  ConversationResponseOptions,
  VoiceCommandAttempt,
  VoiceSubmissionStatus,
  localId,
} from './chatSession.shared';

interface UseChatVoiceOptions {
  applyConversationResponse: (
    data: SendMessageResponse,
    options?: ConversationResponseOptions,
  ) => void;
}

/**
 * Comandos de voz do chatbot: envio do audio, reenvio idempotente e
 * descarte da gravacao pendente. Compartilha o estado da conversa com
 * useChatSession pelo store e por `applyConversationResponse`.
 */
export function useChatVoice({
  applyConversationResponse,
}: UseChatVoiceOptions) {
  const {
    addMessage,
    setLoading,
    setError,
    setLastSentText,
    setRateLimitResetAt,
    resetSession,
  } = useChatBotStore();
  const lastVoiceCommandRef = useRef<VoiceCommandAttempt | null>(null);
  const [hasRetryableVoiceCommand, setHasRetryableVoiceCommand] =
    useState(false);

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

        // Leia a sessão no instante do envio. Em comandos de voz consecutivos,
        // o callback ainda pode pertencer ao render anterior mesmo depois de a
        // primeira resposta ter atualizado o Zustand. Usar o snapshot atual
        // impede que o segundo áudio volte ao início por enviar sessionId e
        // contexto obsoletos.
        const currentConversation = useChatBotStore.getState();
        const selectedTime = resolveSelectedTimeIso(
          '',
          currentConversation.conversationState,
          currentConversation.conversationContext,
        );
        const data = await ChatBotApi.sendVoiceCommand(
          {
            audio,
            mimeType: attempt.recording.mimeType,
            channel: CHANNEL,
            timezone: getClientTimezone(),
            idempotencyKey: attempt.idempotencyKey,
            sessionId: isValidChatBotSessionId(currentConversation.sessionId)
              ? currentConversation.sessionId
              : null,
            selectedTime,
          },
          request.controller.signal,
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
      resetSession,
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

  /** Libera a gravacao pendente (reiniciar conversa). */
  const discardPendingVoiceCommand = useCallback(() => {
    lastVoiceCommandRef.current?.recording.release();
    lastVoiceCommandRef.current = null;
    setHasRetryableVoiceCommand(false);
  }, []);

  /** Esconde o botao de reenviar sem descartar a gravacao. */
  const clearRetryableVoiceCommand = useCallback(() => {
    setHasRetryableVoiceCommand(false);
  }, []);

  return {
    hasRetryableVoiceCommand,
    sendVoiceCommand,
    retryLastVoiceCommand,
    discardPendingVoiceCommand,
    clearRetryableVoiceCommand,
  };
}
