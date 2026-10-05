import { create } from 'zustand';
import { persist, createJSONStorage } from 'expo-zustand-persist';
import { backendHttpClient } from '@lib/helpers/httpClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChatBotStore,
  ChatBotMessage,
  ChatBotState,
  ChatBotContext,
  VoiceCommandResponse,
} from './types';

/** O backend pode fazer duas tentativas de transcricao em ate 45 s. */
const VOICE_TIMEOUT_MS = 60_000;

export const useChatBotStore = create<ChatBotStore>()(
  persist(
    (set) => ({
      submitVoiceAudio: async (input, signal) => {
        const { data } = await backendHttpClient.post<VoiceCommandResponse>(
          '/api/voice/commands',
          input.audio,
          {
            headers: {
              // O Blob criado por fetch(file://...) no Android pode rotular um
              // M4A/AAC como audio/mpeg; o gravador conhece o formato real.
              'Content-Type': input.mimeType || input.audio.type,
              Accept: 'application/json',
              'X-Voice-Language': 'pt-BR',
              'X-Voice-Channel': `voice-${input.channel}`,
              'X-Voice-Timezone': input.timezone,
              'Idempotency-Key': input.idempotencyKey,
              ...(input.sessionId
                ? { 'X-Voice-Session-Id': String(input.sessionId) }
                : {}),
              ...(input.selectedTime
                ? { 'X-Voice-Selected-Time': input.selectedTime }
                : {}),
            },
            // Impede que o cliente converta o Blob para JSON antes do envio.
            transformRequest: [(body) => body],
            timeout: VOICE_TIMEOUT_MS,
            signal,
          },
        );
        return data;
      },

      sessionId: null,
      messages: [],
      loading: false,
      error: null,
      conversationState: null,
      conversationContext: null,
      lastSentText: null,
      rateLimitResetAt: null,
      hasHydrated: false,

      setSessionId: (id: number) => set({ sessionId: id }),

      addMessage: (message: ChatBotMessage) =>
        set((state) => ({ messages: [...state.messages, message] })),

      prependMessages: (messages: ChatBotMessage[]) =>
        set((state) => ({ messages: [...messages, ...state.messages] })),

      setLoading: (loading: boolean) => set({ loading }),

      setError: (error: string | null) => set({ error }),

      setConversationState: (
        conversationState: ChatBotState,
        conversationContext: ChatBotContext,
      ) => set({ conversationState, conversationContext }),

      setLastSentText: (text: string | null) => set({ lastSentText: text }),

      setRateLimitResetAt: (ts: number | null) => set({ rateLimitResetAt: ts }),

      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),

      /** Zera sessionId e state sem apagar o histórico de mensagens. */
      resetSession: () =>
        set({
          sessionId: null,
          conversationState: null,
          conversationContext: null,
        }),

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
      // A restauração HTTP só pode começar depois que o sessionId salvo
      // tiver sido mesclado ao store. O callback também roda quando a leitura
      // do armazenamento falha, mantendo o chat utilizável sem persistência.
      onRehydrateStorage: (state) => () => state.setHasHydrated(true),
      // Persiste apenas o sessionId — histórico e estado são restaurados via API
      // A tipagem do persist exige o estado completo; so o sessionId e gravado.
      partialize: (state) =>
        ({ sessionId: state.sessionId }) as unknown as ChatBotStore,
    },
  ),
);
