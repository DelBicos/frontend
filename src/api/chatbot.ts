import { backendHttpClient } from '@lib/helpers/httpClient';
import type {
  LoadSessionResponse,
  SendMessageResponse,
  VoiceCommandResponse,
} from '@stores/ChatBot/types';

/** O backend pode fazer duas tentativas de transcricao em ate 45 s. */
const VOICE_TIMEOUT_MS = 60_000;

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

export interface SendVoiceCommandInput {
  audio: Blob;
  /** Formato real informado pelo gravador (tem prioridade sobre audio.type). */
  mimeType?: string;
  channel: string;
  timezone: string;
  idempotencyKey: string;
  sessionId?: number | null;
  selectedTime?: string;
}

export async function sendVoiceCommand(
  input: SendVoiceCommandInput,
  signal?: AbortSignal,
): Promise<VoiceCommandResponse> {
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
}
