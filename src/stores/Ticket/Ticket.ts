import { create } from 'zustand';
import { persist, createJSONStorage } from 'expo-zustand-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { backendHttpClient } from '@lib/helpers/httpClient';
import {
  Ticket,
  TicketStore,
  CreateTicketPayload,
  TicketMessage,
} from './types';

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

export const useTicketStore = create<TicketStore>()(
  persist(
    (set) => ({
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