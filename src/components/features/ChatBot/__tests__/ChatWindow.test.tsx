import React from 'react';
import { render } from '@testing-library/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChatWindow, TYPING_CAPTION } from '../ChatWindow/ChatWindow';
import { VOICE_HINT } from '../ChatWindow/ChatInputBar/ChatInputBar';
import darkScheme from '@theme/dark';

let mockSession: Record<string, unknown> = {};

jest.mock('@hooks/useChatSession', () => ({
  useChatSession: () => mockSession,
}));

jest.mock('@hooks/useVoiceRecorder', () => ({
  MAX_VOICE_RECORDING_DURATION_MS: 60_000,
  useVoiceRecorder: () => ({
    isRecording: false,
    isPreparing: false,
    durationMillis: 0,
    meteringDb: null,
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    cancelRecording: jest.fn(),
  }),
}));

jest.mock('../ChatWindow/hooks/useAppointmentPolling', () => ({
  useAppointmentPolling: () => ({
    appointmentStatus: null,
    appointmentPaid: false,
  }),
}));

jest.mock('@theme/ThemeProvider', () => ({
  useColors: () => jest.requireActual('@theme/dark').default,
}));

const buildSession = (overrides: Record<string, unknown> = {}) => ({
  messages: [],
  loading: false,
  error: null,
  lastSentText: null,
  hasRetryableVoiceCommand: false,
  isRestarting: false,
  rateLimitResetAt: null,
  // Not hydrated yet: the session-restore effect stays idle in these tests.
  hasHydrated: false,
  conversationState: null,
  conversationContext: null,
  sendMessage: jest.fn(),
  sendVoiceCommand: jest.fn(),
  sendQuickReply: jest.fn(),
  confirmAction: jest.fn(),
  retryLastMessage: jest.fn(),
  retryLastVoiceCommand: jest.fn(),
  clearRateLimitReset: jest.fn(),
  restartConversation: jest.fn(),
  receiveAppointmentStatus: jest.fn(),
  restoreActiveSession: jest.fn(),
  reportError: jest.fn(),
  ...overrides,
});

describe('ChatWindow', () => {
  beforeEach(() => {
    mockSession = buildSession();
  });

  it('deve montar o fundo em gradiente com o brilho laranja do tema', () => {
    const { UNSAFE_getAllByType } = render(<ChatWindow />);
    const [background, glow] = UNSAFE_getAllByType(LinearGradient);

    expect(background.props.colors).toEqual([
      darkScheme.chat.backgroundTop,
      darkScheme.chat.backgroundMid,
      darkScheme.chat.backgroundMid,
    ]);
    expect(glow.props.colors[2]).toBe(darkScheme.chat.glow);
    expect(glow.props.end).toEqual({ x: 1, y: 1 });
  });

  it('deve exibir cabeçalho, estado vazio e a dica de voz', () => {
    const { getByText } = render(<ChatWindow />);

    expect(getByText('Assistente DelBicos')).toBeTruthy();
    expect(getByText('online agora')).toBeTruthy();
    expect(
      getByText('Olá! Como posso ajudar com seus agendamentos?'),
    ).toBeTruthy();
    expect(getByText(VOICE_HINT)).toBeTruthy();
  });

  it('deve mostrar o "digitando" com a legenda enquanto o assistente responde', () => {
    mockSession = buildSession({ loading: true });
    const { getByTestId, getByText } = render(<ChatWindow />);

    expect(getByTestId('chat-typing-indicator')).toBeTruthy();
    expect(getByText(TYPING_CAPTION)).toBeTruthy();
  });

  it('não deve mostrar o "digitando" nem a legenda fora do carregamento', () => {
    const { queryByTestId, queryByText } = render(<ChatWindow />);

    expect(queryByTestId('chat-typing-indicator')).toBeNull();
    expect(queryByText(TYPING_CAPTION)).toBeNull();
  });

  it('deve exibir a mensagem do usuário no balão', () => {
    mockSession = buildSession({
      messages: [
        { id: '1', role: 'user', text: 'quero uma limpeza sexta às 14h' },
      ],
    });
    const { getByLabelText } = render(<ChatWindow />);

    expect(getByLabelText('Você: quero uma limpeza sexta às 14h')).toBeTruthy();
  });
});
