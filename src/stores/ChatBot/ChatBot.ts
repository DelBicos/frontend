import { create } from 'zustand';
import { persist, createJSONStorage } from 'expo-zustand-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatBotStore, ChatBotMessage, ChatBotState, ChatBotContext } from './types';

export const useChatBotStore = create<ChatBotStore>()(
  persist(
    (set) => ({
      sessionId: null,
      messages: [],
      loading: false,
      error: null,
      conversationState: null,
      conversationContext: null,
      lastSentText: null,
      rateLimitResetAt: null,

      setSessionId: (id: number) => set({ sessionId: id }),

      addMessage: (message: ChatBotMessage) =>
        set((state) => ({ messages: [...state.messages, message] })),

      prependMessages: (messages: ChatBotMessage[]) =>
        set((state) => ({ messages: [...messages, ...state.messages] })),

      setLoading: (loading: boolean) => set({ loading }),

      setError: (error: string | null) => set({ error }),

      setConversationState: (conversationState: ChatBotState, conversationContext: ChatBotContext) =>
        set({ conversationState, conversationContext }),

      setLastSentText: (text: string | null) => set({ lastSentText: text }),

      setRateLimitResetAt: (ts: number | null) => set({ rateLimitResetAt: ts }),

      /** Zera sessionId e state sem apagar o histórico de mensagens. */
      resetSession: () =>
        set({ sessionId: null, conversationState: null, conversationContext: null }),

      clearSession: () =>
        set({
          sessionId: null,
          messages: [],
          loading: false,
          error: null,
          conversationState: null,
          conversationContext: null,
          lastSentText: null,
          rateLimitResetAt: null,
        }),
    }),
    {
      name: 'chatbot-session',
      storage: createJSONStorage(() => AsyncStorage),
      // Persiste apenas o sessionId — histórico e estado são restaurados via API
      partialize: (state) => ({ sessionId: state.sessionId }),
    },
  ),
);
