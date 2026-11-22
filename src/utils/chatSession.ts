import type { ChatBotMessage } from '@stores/ChatBot/types';
import { Platform } from 'react-native';
import type { VoiceRecording } from '@hooks/useVoiceRecorder';

let _counter = 0;
/** Id local (otimista) de uma mensagem ainda nao confirmada pelo servidor. */
export const localId = () => `local_${Date.now()}_${++_counter}`;

export type VoiceSubmissionStatus = 'sent' | 'retryable_error' | 'discarded';

export interface VoiceCommandAttempt {
  recording: VoiceRecording;
  idempotencyKey: string;
}

export interface ConversationResponseOptions {
  /** Mantém o balão otimista quando o backend troca/limpa a sessão. */
  preserveUserMessage?: ChatBotMessage;
}

/** Canal detectado uma vez na inicialização do módulo. */
export const CHANNEL: string = Platform.OS === 'web' ? 'web' : 'mobile';
