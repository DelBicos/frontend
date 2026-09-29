import { create } from 'zustand';
import { isAxiosError, isCancel } from 'axios';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { useUserStore } from '@stores/User';
import {
  ChatStore,
  Conversation,
  FetchMessagesResult,
  ChatMessage,
  FetchRoomsOptions,
} from './types';

import { logger } from '@lib/logger';
const CHAT_ROOMS_LIMIT = 50;
const CHAT_ROOMS_TIMEOUT_MS = 20000;
const CHAT_ROOMS_RETRY_BACKOFF_MS = 400;

let fetchRoomsController: AbortController | null = null;
let fetchRoomsPromise: Promise<void> | null = null;
let fetchRoomsVersion = 0;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const isRequestCanceled = (error: unknown) => {
  if (isCancel(error)) return true;
  return isAxiosError(error) && error.code === 'ERR_CANCELED';
};

const isTimeoutError = (error: unknown) => {
  if (!isAxiosError(error)) return false;

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return true;
  }

  const message = (error.message || '').toLowerCase();
  return message.includes('timeout') || message.includes('timed out');
};

const isUnauthorizedError = (error: unknown) => {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 401 || status === 403;
};

const getFetchRoomsErrorMessage = (error: unknown, hasToken: boolean) => {
  if (!hasToken || isUnauthorizedError(error)) {
    return 'Sessão expirada ou sem token. Faça login novamente.';
  }

  if (isTimeoutError(error)) {
    return 'Tempo limite excedido ao carregar conversas. Tente novamente.';
  }

  return 'Erro ao carregar conversas.';
};

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  loadingRooms: false,
  error: null,

  fetchRooms: async (options?: FetchRoomsOptions) => {
    const forceRefresh = options?.forceRefresh ?? false;

    if (fetchRoomsPromise && !forceRefresh) {
      return fetchRoomsPromise;
    }

    if (forceRefresh && fetchRoomsController) {
      fetchRoomsController.abort();
    }

    const token = useUserStore.getState().token;
    const hasToken = Boolean(token?.trim());

    if (!hasToken) {
      set({
        error: 'Sessão expirada ou sem token. Faça login novamente.',
        loadingRooms: false,
      });
      return;
    }

    const requestVersion = ++fetchRoomsVersion;
    const controller = new AbortController();
    fetchRoomsController = controller;

    set({ loadingRooms: true, error: null });

    const requestRooms = () =>
      backendHttpClient.get('/api/chat/rooms', {
        params: { limit: CHAT_ROOMS_LIMIT },
        timeout: CHAT_ROOMS_TIMEOUT_MS,
        signal: controller.signal,
      });

    const runRequest = async () => {
      try {
        const response = await requestRooms();
        if (requestVersion !== fetchRoomsVersion) return;

        const conversations = (response.data as Conversation[]) || [];
        set({ conversations, loadingRooms: false, error: null });
      } catch (error) {
        if (controller.signal.aborted || isRequestCanceled(error)) {
          return;
        }

        if (isTimeoutError(error) && !isUnauthorizedError(error)) {
          await sleep(CHAT_ROOMS_RETRY_BACKOFF_MS);

          if (
            controller.signal.aborted ||
            requestVersion !== fetchRoomsVersion
          ) {
            return;
          }

          try {
            const retryResponse = await requestRooms();
            if (requestVersion !== fetchRoomsVersion) return;

            const conversations = (retryResponse.data as Conversation[]) || [];
            set({ conversations, loadingRooms: false, error: null });
            return;
          } catch (retryError) {
            if (controller.signal.aborted || isRequestCanceled(retryError)) {
              return;
            }

            if (requestVersion !== fetchRoomsVersion) return;

            const errorMessage = getFetchRoomsErrorMessage(
              retryError,
              hasToken,
            );
            set({ error: errorMessage, loadingRooms: false });
            logger.error('Erro ao buscar conversas (retry):', retryError);
            return;
          }
        }

        if (requestVersion !== fetchRoomsVersion) return;

        const errorMessage = getFetchRoomsErrorMessage(error, hasToken);
        set({ error: errorMessage, loadingRooms: false });
        logger.error('Erro ao buscar conversas:', error);
      } finally {
        if (fetchRoomsController === controller) {
          fetchRoomsController = null;
        }
      }
    };

    const requestPromise = runRequest();
    fetchRoomsPromise = requestPromise;

    try {
      await requestPromise;
    } finally {
      if (fetchRoomsPromise === requestPromise) {
        fetchRoomsPromise = null;
      }
    }
  },

  fetchMessages: async (
    roomId: number,
    cursor?: string,
    limit = 20,
  ): Promise<FetchMessagesResult> => {
    const params: Record<string, string | number> = { limit };
    if (cursor) params.cursor = cursor;

    const response = await backendHttpClient.get(
      `/api/chat/rooms/${roomId}/messages`,
      { params },
    );

    const data = response.data || {};
    return {
      messages: (data.messages as ChatMessage[]) || [],
      nextCursor: data.nextCursor ?? null,
      roomStatus: data.room_status ?? 'active',
      role: data.role ?? 'client',
    };
  },

  // Atualiza a prévia da última mensagem na lista de conversas em tempo real
  applyIncomingMessage: (message: ChatMessage) => {
    const { conversations } = get();
    const updated = conversations.map((conv) =>
      conv.room_id === message.room_id
        ? {
            ...conv,
            last_message_preview: message.text.slice(0, 280),
            last_message_at: message.sent_at,
          }
        : conv,
    );

    // Reordena: conversa com mensagem mais recente vai para o topo
    updated.sort((a, b) => {
      const aTime = a.last_message_at
        ? new Date(a.last_message_at).getTime()
        : 0;
      const bTime = b.last_message_at
        ? new Date(b.last_message_at).getTime()
        : 0;
      return bTime - aTime;
    });

    set({ conversations: updated });
  },

  clearChat: () => {
    fetchRoomsController?.abort();
    fetchRoomsController = null;
    fetchRoomsPromise = null;
    fetchRoomsVersion += 1;
    set({ conversations: [], error: null, loadingRooms: false });
  },
}));
