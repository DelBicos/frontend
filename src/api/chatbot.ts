import { backendHttpClient } from '@lib/helpers/httpClient';
import type {
  LoadSessionResponse,
  SendMessageResponse,
} from '@stores/ChatBot/types';

/** Sessao pendente do usuario do token (null quando nao ha). */
export async function getActiveSession(): Promise<LoadSessionResponse | null> {
  const { data } = await backendHttpClient.get<LoadSessionResponse | null>(
    '/api/chat/bot/session/active',
  );
  return data;
}

export interface SendBotMessageInput {
  message: string;
  sessionId?: number | null;
  channel: string;
  timezone: string;
  utcOffsetMinutes: number;
  /** ISO UTC do horario escolhido (alinhado ao checkout). */
  selectedTime?: string;
}

export async function sendMessage(
  input: SendBotMessageInput,
  signal?: AbortSignal,
): Promise<SendMessageResponse> {
  const { data } = await backendHttpClient.post<SendMessageResponse>(
    '/api/chat/bot/message',
    {
      message: input.message,
      ...(input.sessionId ? { session_id: input.sessionId } : {}),
      channel: input.channel,
      timezone: input.timezone,
      utc_offset_minutes: input.utcOffsetMinutes,
      ...(input.selectedTime ? { selected_time: input.selectedTime } : {}),
    },
    { signal },
  );
  return data;
}
