import { backendHttpClient } from '@lib/helpers/httpClient';
import { ChatBotMessage } from '../types';
import { useChatBotStore } from '../ChatBot';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { post: jest.fn() },
}));

const http = backendHttpClient as unknown as Record<string, jest.Mock>;

const userMessage = (id: string, text: string): ChatBotMessage => ({
  id,
  role: 'user',
  text,
  createdAt: '2026-01-01T00:00:00.000Z',
});

beforeEach(() => {
  jest.clearAllMocks();
  useChatBotStore.getState().clearSession();
  useChatBotStore.setState({ hasHydrated: false });
});

describe('ChatBotStore - audio', () => {
  it('envia o blob com o formato real e os cabecalhos da sessao', async () => {
    const audio = new Blob(['a'], { type: 'audio/mpeg' });
    const signal = new AbortController().signal;
    const reply = { transcript: 'quero cortar', session_id: 7, message: 'ok' };
    http.post.mockResolvedValue({ data: reply });

    await expect(
      useChatBotStore.getState().submitVoiceAudio(
        {
          audio,
          mimeType: 'audio/mp4',
          channel: 'mobile',
          timezone: 'America/Sao_Paulo',
          idempotencyKey: 'k1',
          sessionId: 7,
          selectedTime: '14:00',
        },
        signal,
      ),
    ).resolves.toEqual(reply);

    expect(http.post).toHaveBeenCalledWith('/api/voice/commands', audio, {
      headers: {
        'Content-Type': 'audio/mp4',
        Accept: 'application/json',
        'X-Voice-Language': 'pt-BR',
        'X-Voice-Channel': 'voice-mobile',
        'X-Voice-Timezone': 'America/Sao_Paulo',
        'Idempotency-Key': 'k1',
        'X-Voice-Session-Id': '7',
        'X-Voice-Selected-Time': '14:00',
      },
      transformRequest: [expect.any(Function)],
      timeout: 60000,
      signal,
    });
    const transform = http.post.mock.calls[0][2].transformRequest[0] as (
      body: Blob,
    ) => Blob;
    expect(transform(audio)).toBe(audio);
  });

  it('omite sessao e horario quando nao foram escolhidos', async () => {
    const audio = new Blob(['a'], { type: 'audio/mpeg' });
    http.post.mockResolvedValue({ data: { transcript: '' } });

    await useChatBotStore.getState().submitVoiceAudio({
      audio,
      channel: 'web',
      timezone: 'America/Sao_Paulo',
      idempotencyKey: 'k2',
      sessionId: null,
    });

    expect(http.post.mock.calls[0][2].headers).toEqual({
      'Content-Type': 'audio/mpeg',
      Accept: 'application/json',
      'X-Voice-Language': 'pt-BR',
      'X-Voice-Channel': 'voice-web',
      'X-Voice-Timezone': 'America/Sao_Paulo',
      'Idempotency-Key': 'k2',
    });
  });
});

describe('ChatBotStore - sessao local', () => {
  it('acumula mensagens e o estado da conversa', () => {
    const store = useChatBotStore.getState();
    store.setSessionId(4);
    store.addMessage(userMessage('1', 'oi'));
    store.prependMessages([userMessage('0', 'antes')]);
    store.setLoading(true);
    store.setError('falha');
    store.setConversationState('COLETANDO_DATA', {
      selectedDate: '2026-07-05',
    });
    store.setLastSentText('oi');
    store.setRateLimitResetAt(99);
    store.setHasHydrated(true);

    expect(useChatBotStore.getState()).toMatchObject({
      sessionId: 4,
      messages: [userMessage('0', 'antes'), userMessage('1', 'oi')],
      loading: true,
      error: 'falha',
      conversationState: 'COLETANDO_DATA',
      conversationContext: { selectedDate: '2026-07-05' },
      lastSentText: 'oi',
      rateLimitResetAt: 99,
      hasHydrated: true,
    });
  });

  it('resetSession zera o identificador e preserva o historico', () => {
    useChatBotStore.setState({
      sessionId: 4,
      messages: [userMessage('1', 'oi')],
      conversationState: 'INICIO',
      conversationContext: { intent: 'CREATE' },
    });

    useChatBotStore.getState().resetSession();

    expect(useChatBotStore.getState()).toMatchObject({
      sessionId: null,
      conversationState: null,
      conversationContext: null,
      messages: [userMessage('1', 'oi')],
    });
  });

  it('clearSession apaga historico, erro e limite', () => {
    useChatBotStore.setState({
      sessionId: 4,
      messages: [userMessage('1', 'oi')],
      loading: true,
      error: 'x',
      lastSentText: 'oi',
      rateLimitResetAt: 10,
    });

    useChatBotStore.getState().clearSession();

    expect(useChatBotStore.getState()).toMatchObject({
      sessionId: null,
      messages: [],
      loading: false,
      error: null,
      lastSentText: null,
      rateLimitResetAt: null,
    });
  });
});
