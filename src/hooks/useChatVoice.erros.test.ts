import { act, renderHook } from '@testing-library/react-native';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { useChatBotStore } from '@stores/ChatBot';
import { EMPTY_CHATBOT_RESPONSE_ERROR } from '@lib/chatbot/errors';
import type { VoiceRecording } from './useVoiceRecorder';
import { useChatVoice } from './useChatVoice';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { post: jest.fn() },
}));
jest.mock('react-native-uuid', () => ({ v4: () => 'uuid-fixo' }));

const post = backendHttpClient.post as jest.Mock;
const store = () => useChatBotStore.getState();

const recording = (): VoiceRecording & { release: jest.Mock } => ({
  uri: 'file://voz.m4a',
  mimeType: 'audio/m4a',
  durationMillis: 2000,
  release: jest.fn(),
});

function setup() {
  const applyConversationResponse = jest.fn();
  const hook = renderHook(() => useChatVoice({ applyConversationResponse }));
  return { ...hook, applyConversationResponse };
}

let blobSize = 10;

beforeEach(() => {
  jest.clearAllMocks();
  blobSize = 10;
  act(() => {
    useChatBotStore.setState({
      sessionId: 7,
      messages: [],
      loading: false,
      error: null,
      rateLimitResetAt: null,
      conversationState: null,
      conversationContext: null,
    });
  });
  global.fetch = jest.fn(async () => ({
    blob: async () => ({ size: blobSize }),
  })) as unknown as typeof fetch;
});

describe('useChatVoice - falhas de envio', () => {
  it('descarta audio vazio sem permitir reenvio', async () => {
    blobSize = 0;
    const { result } = setup();
    const rec = recording();
    let status: string | undefined;
    await act(async () => {
      status = await result.current.sendVoiceCommand(rec);
    });
    expect(status).toBe('discarded');
    expect(post).not.toHaveBeenCalled();
    expect(rec.release).toHaveBeenCalled();
    expect(store().error).toBe(
      'Não foi possível enviar o áudio. Tente novamente.',
    );
  });

  it('nao envia durante outro carregamento', async () => {
    act(() => {
      useChatBotStore.setState({ loading: true });
    });
    const { result } = setup();
    let status: string | undefined;
    await act(async () => {
      status = await result.current.sendVoiceCommand(recording());
    });
    expect(status).toBe('discarded');
    await act(async () => {
      await result.current.retryLastVoiceCommand();
    });
    expect(post).not.toHaveBeenCalled();
  });

  it('trata resposta sem transcricao como erro reenviavel', async () => {
    post.mockResolvedValue({ data: { transcript: '  ', message: 'Oi' } });
    const { result } = setup();
    let status: string | undefined;
    await act(async () => {
      status = await result.current.sendVoiceCommand(recording());
    });
    expect(status).toBe('retryable_error');
    expect(result.current.hasRetryableVoiceCommand).toBe(true);
    expect(post.mock.calls[0][2].headers['X-Voice-Session-Id']).toBe('7');
  });

  it('mostra erro quando o bot responde sem mensagem', async () => {
    post.mockResolvedValue({ data: { transcript: 'oi', message: '' } });
    const { result, applyConversationResponse } = setup();
    let status: string | undefined;
    await act(async () => {
      status = await result.current.sendVoiceCommand(recording());
    });
    expect(status).toBe('retryable_error');
    expect(store().error).toBe(EMPTY_CHATBOT_RESPONSE_ERROR);
    expect(applyConversationResponse).not.toHaveBeenCalled();
  });

  it('agenda o reenvio a partir do cabecalho do 429', async () => {
    post.mockRejectedValue({
      response: { status: 429, headers: { 'ratelimit-reset': '100' } },
    });
    const { result } = setup();
    await act(async () => {
      await result.current.sendVoiceCommand(recording());
    });
    expect(store().rateLimitResetAt).toBe(100_000);
    expect(result.current.hasRetryableVoiceCommand).toBe(true);

    act(() => result.current.clearRetryableVoiceCommand());
    expect(result.current.hasRetryableVoiceCommand).toBe(false);
  });

  it('usa um minuto de espera no 429 sem cabecalho', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);
    post.mockRejectedValue({ response: { status: 429 } });
    const { result } = setup();
    await act(async () => {
      await result.current.sendVoiceCommand(recording());
    });
    expect(store().rateLimitResetAt).toBe(61_000);
    jest.restoreAllMocks();
  });

  it('zera a sessao no 404', async () => {
    post.mockRejectedValue({ response: { status: 404 } });
    const { result } = setup();
    await act(async () => {
      await result.current.sendVoiceCommand(recording());
    });
    expect(store().sessionId).toBeNull();
  });

  it('libera a gravacao anterior ao gravar outra', async () => {
    post.mockRejectedValue({ response: { status: 500 } });
    const { result } = setup();
    const first = recording();
    const second = recording();
    await act(async () => {
      await result.current.sendVoiceCommand(first);
    });
    expect(first.release).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.sendVoiceCommand(second);
    });
    expect(first.release).toHaveBeenCalled();
  });
});
