import { create } from 'zustand';
import { persist, createJSONStorage } from 'expo-zustand-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { backendHttpClient } from '@lib/helpers/httpClient';
import {
  Ticket,
  TicketStatus,
  TicketStore,
  CreateTicketPayload,
  TicketMessage,
  SendTicketMessageFailure,
} from './types';

/**
 * Statuses that still accept new messages.
 * Mirror of server rules for UX only; the server stays the source of truth.
 */
const OPEN_TICKET_STATUSES: TicketStatus[] = [
  'ABERTO',
  'EM_ANALISE',
  'EM_ATENDIMENTO',
];

export const isTicketOpen = (status: TicketStatus): boolean =>
  OPEN_TICKET_STATUSES.includes(status);

/**
 * Extrai a mensagem de erro do backend (padrão { error, details }).
 */
const extractErrorMessage = (error: unknown): string => {
  if (typeof error !== 'object' || error === null) {
    return 'Não foi possível concluir a operação.';
  }
  const response = (error as { response?: { data?: unknown } }).response;
  const data = response?.data;
  if (typeof data !== 'object' || data === null) {
    return 'Não foi possível concluir a operação.';
  }
  const { details, error: errorMessage } = data as {
    details?: { message?: string }[];
    error?: string;
  };
  return (
    details?.[0]?.message ||
    errorMessage ||
    'Não foi possível concluir a operação.'
  );
};

/** Maps a send-message error to the case the UI must handle. */
const getSendFailureReason = (error: unknown): SendTicketMessageFailure => {
  const response = (
    error as { response?: { status?: number; data?: { code?: string } } }
  )?.response;
  if (response?.status === 409 && response.data?.code === 'TICKET_CLOSED') {
    return 'TICKET_CLOSED';
  }
  if (response?.status === 404) return 'NOT_FOUND';
  const details = (response?.data as { details?: unknown[] } | undefined)
    ?.details;
  if (response?.status === 400 && details?.length) return 'INVALID_CONTENT';
  return 'UNKNOWN';
};

export const useTicketStore = create<TicketStore>()(
  persist(
    (set, get) => ({
      // ─── STATE ──────────────────────────────────────
      tickets: [],
      currentTicket: null,
      messages: [],
      isLoading: false,
      isSubmitting: false,
      error: null,

      // ─── ACTIONS: TICKETS ───────────────────────────
      fetchTickets: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await backendHttpClient.get<{ tickets: Ticket[] }>(
            '/api/tickets',
          );
          set({ tickets: data.tickets ?? [], isLoading: false });
        } catch (error) {
          set({
            error: extractErrorMessage(error),
            isLoading: false,
          });
        }
      },

      fetchTicketById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await backendHttpClient.get<{ ticket: Ticket }>(
            `/api/tickets/${id}`,
          );
          set({ currentTicket: data.ticket, isLoading: false });
          return data.ticket;
        } catch (error) {
          set({
            error: extractErrorMessage(error),
            isLoading: false,
          });
          return null;
        }
      },

      createTicket: async (payload: CreateTicketPayload) => {
        set({ isSubmitting: true, error: null });
        try {
          const { data } = await backendHttpClient.post<{ ticket: Ticket }>(
            '/api/tickets',
            payload,
          );
          set((state) => ({
            tickets: [data.ticket, ...state.tickets],
            isSubmitting: false,
          }));
          return data.ticket;
        } catch (error) {
          const message = extractErrorMessage(error);
          set({ error: message, isSubmitting: false });
          throw new Error(message);
        }
      },

      // ─── ACTIONS: MESSAGES (TICKET-04) ──────────────
      fetchMessages: async (ticketId: number) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await backendHttpClient.get<{
            messages: TicketMessage[];
          }>(`/api/tickets/${ticketId}/messages`);
          set({ messages: data.messages ?? [], isLoading: false });
        } catch (error) {
          set({
            error: extractErrorMessage(error),
            isLoading: false,
          });
        }
      },

      // ─── ACTIONS: SEND MESSAGE (TICKET-05) ──────────
      sendMessage: async (ticketId, content) => {
        set({ isSubmitting: true });
        try {
          // Only `content` is sent: author and ticket come from token and URL.
          const { data } = await backendHttpClient.post<{
            ticket_message: TicketMessage;
          }>(`/api/tickets/${ticketId}/messages`, { content: content.trim() });
          const message = data.ticket_message;
          // The server moves the ticket's updated_at to now; mirror it so the
          // cached list shows this ticket first without waiting for a refetch.
          const updatedAt = message.created_at;
          set((state) => {
            const listed = state.tickets.find((t) => t.id === ticketId);
            return {
              messages: [...state.messages, message],
              currentTicket:
                state.currentTicket?.id === ticketId
                  ? { ...state.currentTicket, updated_at: updatedAt }
                  : state.currentTicket,
              tickets: listed
                ? [
                    { ...listed, updated_at: updatedAt },
                    ...state.tickets.filter((t) => t.id !== ticketId),
                  ]
                : state.tickets,
              isSubmitting: false,
            };
          });
          return { ok: true, message };
        } catch (error) {
          const reason = getSendFailureReason(error);
          const errorMessage =
            reason === 'UNKNOWN' && !(error as { response?: unknown })?.response
              ? 'Não foi possível enviar a mensagem. Verifique sua conexão.'
              : extractErrorMessage(error);
          set({ isSubmitting: false });
          if (reason === 'TICKET_CLOSED') {
            // Refresh the detail so the new closed status shows on screen.
            await get().fetchTicketById(ticketId);
          }
          return { ok: false, reason, error: errorMessage };
        }
      },

      // ─── ACTIONS: RESET ─────────────────────────────
      clearError: () => set({ error: null }),
      clearCurrent: () => set({ currentTicket: null }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'delbicos-ticket-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        ...state,
        currentTicket: null,
        messages: [],
        isLoading: false,
        isSubmitting: false,
        error: null,
      }),
    },
  ),
);
