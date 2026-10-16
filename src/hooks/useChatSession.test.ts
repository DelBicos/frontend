// @ts-nocheck
/// <reference types="jest" />

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { useChatSession } from './useChatSession';
import { useChatBotStore } from '@stores/ChatBot';
import { backendHttpClient } from '@lib/helpers/httpClient';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(null),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
  clear: jest.fn().mockResolvedValue(null),
}));

function ChatHarness({
  onRender,
}: {
  onRender: (session: ReturnType<typeof useChatSession>) => void;
}) {
  const session = useChatSession();
  onRender(session);
  return null;
}

describe('useChatSession - Idempotência', () => {
  let sessionApi: ReturnType<typeof useChatSession>;

  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useChatBotStore.getState().clearSession();
    });
    (backendHttpClient.get as jest.Mock).mockResolvedValue({
      data: null,
    });
    (backendHttpClient.post as jest.Mock).mockResolvedValue({
      data: {
        session_id: 1,
        message: 'Resposta do bot',
        state: 'INICIO',
        context: {},
      },
    });
  });

  it('envia header Idempotency-Key e campo idempotency_key ao enviar mensagem', async () => {
    await act(async () => {
      TestRenderer.create(
        React.createElement(ChatHarness, {
          onRender: (api) => {
            sessionApi = api;
          },
        }),
      );
    });

    await act(async () => {
      sessionApi.sendMessage('Quero agendar um eletricista');
    });

    expect(backendHttpClient.post).toHaveBeenCalledWith(
      '/api/chat/bot/message',
      expect.objectContaining({
        message: 'Quero agendar um eletricista',
        idempotency_key: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ),
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Idempotency-Key': expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
          ),
        }),
      }),
    );
  });

  it('impede novos envios enquanto uma requisição estiver pendente (loading guard)', async () => {
    act(() => {
      useChatBotStore.setState({ loading: true });
    });

    await act(async () => {
      TestRenderer.create(
        React.createElement(ChatHarness, {
          onRender: (api) => {
            sessionApi = api;
          },
        }),
      );
    });

    let sent = false;
    await act(async () => {
      sent = sessionApi.sendMessage('Mensagem duplicada');
    });

    expect(sent).toBe(false);
    expect(backendHttpClient.post).not.toHaveBeenCalled();
  });

  it('reutiliza a mesma idempotency_key ao tentar novamente a última mensagem', async () => {
    let capturedKeyFirstAttempt = '';

    (backendHttpClient.post as jest.Mock)
      .mockRejectedValueOnce({
        response: { status: 500 },
      })
      .mockResolvedValueOnce({
        data: {
          session_id: 1,
          message: 'Recuperado com sucesso',
          state: 'INICIO',
          context: {},
        },
      });

    await act(async () => {
      TestRenderer.create(
        React.createElement(ChatHarness, {
          onRender: (api) => {
            sessionApi = api;
          },
        }),
      );
    });

    // Primeira tentativa (vai falhar)
    await act(async () => {
      sessionApi.sendMessage('Mensagem para retry');
    });

    expect(backendHttpClient.post).toHaveBeenCalledTimes(1);
    const firstCallArgs = (backendHttpClient.post as jest.Mock).mock.calls[0];
    capturedKeyFirstAttempt = firstCallArgs[1].idempotency_key;
    expect(capturedKeyFirstAttempt).toBeTruthy();

    // Reenvio através de retryLastMessage
    await act(async () => {
      await sessionApi.retryLastMessage();
    });

    expect(backendHttpClient.post).toHaveBeenCalledTimes(2);
    const secondCallArgs = (backendHttpClient.post as jest.Mock).mock.calls[1];
    const capturedKeySecondAttempt = secondCallArgs[1].idempotency_key;

    // A chave DEVE ser exatamente a mesma para que o backend aplique idempotência
    expect(capturedKeySecondAttempt).toBe(capturedKeyFirstAttempt);
    expect(secondCallArgs[2].headers['Idempotency-Key']).toBe(
      capturedKeyFirstAttempt,
    );
  });

  it('envia Idempotency-Key ao confirmar ação de agendamento ou cancelamento', async () => {
    await act(async () => {
      TestRenderer.create(
        React.createElement(ChatHarness, {
          onRender: (api) => {
            sessionApi = api;
          },
        }),
      );
    });

    await act(async () => {
      await sessionApi.confirmAction('confirm_cancel', {
        appointmentId: 456,
        serviceTitle: 'Pintura',
      });
    });

    expect(backendHttpClient.post).toHaveBeenCalledWith(
      '/api/chat/bot/message',
      expect.objectContaining({
        message: '456',
        idempotency_key: expect.any(String),
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Idempotency-Key': expect.any(String),
        }),
      }),
    );
  });
});
