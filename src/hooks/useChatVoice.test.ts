// @ts-nocheck
/// <reference types="jest" />

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { useChatVoice } from './useChatVoice';
import { useChatBotStore } from '@stores/ChatBot';
import { backendHttpClient } from '@lib/helpers/httpClient';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { post: jest.fn() },
}));
const sendVoiceAudio = backendHttpClient.post as jest.Mock;
jest.mock('react-native-uuid', () => ({ v4: () => 'uuid-fixo' }));

type Voice = ReturnType<typeof useChatVoice>;

function setup() {
  const applyConversationResponse = jest.fn();
  const ref: { current: Voice | null } = { current: null };
  const Harness = () => {
    ref.current = useChatVoice({ applyConversationResponse });
    return null;
  };
  act(() => {
    TestRenderer.create(React.createElement(Harness));
  });
  return { ref, applyConversationResponse };
}

const recording = (durationMillis = 2000) => ({
  uri: 'file://voz.m4a',
  mimeType: 'audio/m4a',
  durationMillis,
  release: jest.fn(),
});

beforeEach(() => {
  jest.clearAllMocks();
  useChatBotStore.setState({
    sessionId: null,
    messages: [],
    loading: false,
    error: null,
  });
  global.fetch = jest.fn().mockResolvedValue({
    blob: async () => ({ size: 10 }),
  }) as unknown as typeof fetch;
});

describe('useChatVoice', () => {
  it('descarta gravacoes muito curtas e explica o motivo', async () => {
    const { ref } = setup();
    const rec = recording(100);
    let status;
    await act(async () => {
      status = await ref.current!.sendVoiceCommand(rec as never);
    });
    expect(status).toBe('discarded');
    expect(rec.release).toHaveBeenCalled();
    expect(useChatBotStore.getState().error).toMatch(/muito curta/);
    expect(sendVoiceAudio).not.toHaveBeenCalled();
  });

  it('envia o audio, mostra a transcricao e aplica a resposta', async () => {
    sendVoiceAudio.mockResolvedValue({
      data: {
        transcript: 'quero agendar',
        message: 'Qual serviço?',
        session_id: 7,
        state: 'COLETANDO_SERVICO',
        context: {},
      },
    });
    const { ref, applyConversationResponse } = setup();
    const rec = recording();
    let status;
    await act(async () => {
      status = await ref.current!.sendVoiceCommand(rec as never);
    });

    expect(status).toBe('sent');
    expect(applyConversationResponse).toHaveBeenCalledTimes(1);
    expect(useChatBotStore.getState().messages.map((m) => m.text)).toContain(
      'quero agendar',
    );
    expect(rec.release).toHaveBeenCalled();
    expect(useChatBotStore.getState().loading).toBe(false);
  });

  it('em falha de rede permite reenviar exatamente o mesmo audio', async () => {
    sendVoiceAudio
      .mockRejectedValueOnce({ response: { status: 500, headers: {} } })
      .mockResolvedValueOnce({
        data: {
          transcript: 'oi',
          message: 'Olá',
          session_id: 1,
          state: 'INICIO',
          context: {},
        },
      });
    const { ref } = setup();
    const rec = recording();

    await act(async () => {
      expect(await ref.current!.sendVoiceCommand(rec as never)).toBe(
        'retryable_error',
      );
    });
    expect(ref.current!.hasRetryableVoiceCommand).toBe(true);
    expect(rec.release).not.toHaveBeenCalled();

    await act(async () => {
      await ref.current!.retryLastVoiceCommand();
    });
    const calls = sendVoiceAudio.mock.calls;
    expect(calls[0][2].headers['Idempotency-Key']).toBe(
      calls[1][2].headers['Idempotency-Key'],
    );
    expect(ref.current!.hasRetryableVoiceCommand).toBe(false);
  });

  it('nao reenvia quando o servidor recusa o audio (415)', async () => {
    sendVoiceAudio.mockRejectedValue({
      response: { status: 415, headers: {} },
    });
    const { ref } = setup();
    const rec = recording();
    await act(async () => {
      expect(await ref.current!.sendVoiceCommand(rec as never)).toBe(
        'discarded',
      );
    });
    expect(rec.release).toHaveBeenCalled();
    expect(ref.current!.hasRetryableVoiceCommand).toBe(false);
  });

  it('descartar a gravacao pendente libera o audio', async () => {
    sendVoiceAudio.mockRejectedValue({
      response: { status: 500, headers: {} },
    });
    const { ref } = setup();
    const rec = recording();
    await act(async () => {
      await ref.current!.sendVoiceCommand(rec as never);
    });
    act(() => ref.current!.discardPendingVoiceCommand());
    expect(rec.release).toHaveBeenCalled();
    expect(ref.current!.hasRetryableVoiceCommand).toBe(false);
  });
});
