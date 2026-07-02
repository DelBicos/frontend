import { useCallback } from 'react';
import { useChatBotStore } from '@stores/ChatBot';
import { backendHttpClient } from '@lib/helpers/httpClient';
import {
  ChatBotMessage,
  QuickReplyOption,
  SendMessageResponse,
  LoadSessionResponse,
} from '@stores/ChatBot/types';

let _counter = 0;
const localId = () => `local_${Date.now()}_${++_counter}`;

/**
 * Hook principal do chatbot de agendamentos.
 * Gerencia sessionId, histórico de mensagens, loading e erro,
 * consumindo os endpoints POST /chat/message e GET /chat/session/:id.
 */
export function useChatSession() {
  const {
    sessionId,
    messages,
    loading,
    error,
    setSessionId,
    addMessage,
    prependMessages,
    setLoading,
    setError,
    clearSession,
  } = useChatBotStore();

  /** Carrega o histórico de uma sessão existente. */
  const loadSession = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await backendHttpClient.get<LoadSessionResponse>(
          `/chat/session/${id}`,
        );
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          prependMessages(data.messages);
        }
        setSessionId(data.sessionId ?? id);
      } catch {
        setError('Não foi possível carregar o histórico da conversa.');
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, prependMessages, setSessionId],
  );

  /** Envia uma mensagem de texto e aguarda a resposta do bot. */
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      // Mensagem otimista do usuário
      const userMsg: ChatBotMessage = {
        id: localId(),
        role: 'user',
        text: trimmed,
        createdAt: new Date().toISOString(),
      };
      addMessage(userMsg);
      setLoading(true);
      setError(null);

      try {
        const { data } = await backendHttpClient.post<SendMessageResponse>(
          '/chat/message',
          { text: trimmed, sessionId },
        );

        if (data.sessionId) {
          setSessionId(data.sessionId);
        }
        if (data.message) {
          addMessage(data.message);
        }
      } catch {
        setError('Não foi possível enviar a mensagem. Tente novamente.');
      } finally {
        setLoading(false);
      }
    },
    [loading, sessionId, addMessage, setLoading, setError, setSessionId],
  );

  /** Envia um quick reply sem que o usuário precise digitar. */
  const sendQuickReply = useCallback(
    async (option: QuickReplyOption) => {
      await sendMessage(option.value);
    },
    [sendMessage],
  );

  /**
   * Confirma explicitamente uma ação (cancelamento, alteração).
   * Sinaliza o backend com um texto estruturado.
   */
  const confirmAction = useCallback(
    async (actionType: string, payload: Record<string, unknown>) => {
      const confirmText = `confirm:${actionType}:${JSON.stringify(payload)}`;
      await sendMessage(confirmText);
    },
    [sendMessage],
  );

  return {
    sessionId,
    messages,
    loading,
    error,
    sendMessage,
    sendQuickReply,
    confirmAction,
    clearSession,
    loadSession,
  };
}
