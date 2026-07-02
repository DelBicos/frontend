export type ChatBotMessageRole = 'user' | 'bot';

export interface QuickReplyOption {
  label: string;
  value: string;
}

export interface SuggestedTime {
  /** Rótulo formatado, ex: "Sáb, 5 jul às 14:00" */
  label: string;
  /** ISO datetime */
  value: string;
}

export type ChatBotActionType =
  | 'confirm_appointment'
  | 'confirm_cancel'
  | 'confirm_reschedule';

export interface ChatBotAppointmentData {
  id?: number;
  serviceTitle: string;
  professionalName: string;
  /** ISO datetime */
  startTime: string;
  /** ISO datetime */
  endTime: string;
  price: string;
  professionalAvatarUri?: string | null;
  status?: string;
}

export interface ChatBotAction {
  type: ChatBotActionType;
  appointmentId?: number;
  serviceTitle?: string;
  /** Usado em confirm_reschedule */
  newTime?: string;
  /** Usado em confirm_appointment */
  appointment?: ChatBotAppointmentData;
}

export interface ChatBotMessage {
  id: string;
  role: ChatBotMessageRole;
  text: string;
  quickReplies?: QuickReplyOption[];
  suggestedTimes?: SuggestedTime[];
  action?: ChatBotAction;
  createdAt: string;
}

export interface ChatBotStore {
  sessionId: string | null;
  messages: ChatBotMessage[];
  loading: boolean;
  error: string | null;

  setSessionId: (id: string) => void;
  addMessage: (message: ChatBotMessage) => void;
  prependMessages: (messages: ChatBotMessage[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSession: () => void;
}

export interface SendMessageRequest {
  text: string;
  sessionId: string | null;
}

export interface SendMessageResponse {
  sessionId: string;
  message: ChatBotMessage;
}

export interface LoadSessionResponse {
  sessionId: string;
  messages: ChatBotMessage[];
}
