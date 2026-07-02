import { create } from 'zustand';
import { ChatBotStore, ChatBotMessage } from './types';

export const useChatBotStore = create<ChatBotStore>((set) => ({
  sessionId: null,
  messages: [],
  loading: false,
  error: null,

  setSessionId: (id: string) => set({ sessionId: id }),

  addMessage: (message: ChatBotMessage) =>
    set((state) => ({ messages: [...state.messages, message] })),

  prependMessages: (messages: ChatBotMessage[]) =>
    set((state) => ({ messages: [...messages, ...state.messages] })),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string | null) => set({ error }),

  clearSession: () =>
    set({ sessionId: null, messages: [], loading: false, error: null }),
}));
