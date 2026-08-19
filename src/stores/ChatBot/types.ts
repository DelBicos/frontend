export type ChatBotMessageRole = 'user' | 'bot';

/**
 * Estados da máquina de conversa retornados pelo backend.
 * O frontend usa isso para derivar quick replies, hints e o AppointmentCard.
 */
export type ChatBotState =
  | 'INICIO'
  | 'COLETANDO_SERVICO'
  | 'COLETANDO_DATA'
  | 'COLETANDO_HORARIO'
  | 'CONFIRMACAO'
  | 'AGUARDANDO_CONFIRMACAO'
  | 'FINALIZADO'
  | 'AGUARDANDO_ID_AGENDAMENTO';

export interface ChatBotServiceOption {
  id: number;
  title: string;
  description?: string | null;
  subcategoryId: number;
  subcategoryName: string;
  categoryName?: string | null;
  professionalId: number;
  professionalName: string;
  professionalAvatarUri?: string | null;
  professionalDescription?: string | null;
  professionalCity?: string | null;
  professionalState?: string | null;
  /** Preço em centavos. */
  price: number;
  duration: number;
  /** Média das avaliações concluídas especificamente para este serviço. */
  rating: number;
  ratingsCount: number;
}

/**
 * Contexto acumulado da conversa retornado pelo backend.
 * Reflete o que o bot já coletou até o momento.
 */
export interface ChatBotContext {
  intent?: string;
  pendingAction?: 'CREATE' | 'CANCEL' | 'RESCHEDULE' | string;
  timeZone?: string;
  serviceId?: number;
  serviceName?: string;
  servicePrice?: number;
  /** Lista de serviços disponíveis — exibidos como chips em COLETANDO_SERVICO */
  serviceOptions?: string[];
  /** Ofertas completas por serviço e profissional — exibidas como cartões. */
  serviceOptionsData?: ChatBotServiceOption[];
  selectedDate?: string; // YYYY-MM-DD
  selectedTime?: string; // HH:MM
  date?: string; // YYYY-MM-DD
  time?: string; // HH:MM
  newDate?: string; // YYYY-MM-DD
  newTime?: string; // HH:MM
  /**
   * Slots disponíveis em COLETANDO_HORARIO.
   * Formato: "HH:MM" (mesmo dia) ou "YYYY-MM-DD|HH:MM" (dias alternativos).
   */
  suggestedSlots?: string[];
  professionalName?: string;
  professionalId?: number;
  professionalRating?: number;
  professionalRatingsCount?: number;
  professionalCity?: string | null;
  professionalState?: string | null;
  serviceDescription?: string | null;
  serviceSubcategoryId?: number;
  serviceSubcategoryName?: string;
  serviceCategoryName?: string | null;
  /** Duração do serviço em minutos — usado para calcular endTime no AppointmentCard */
  serviceDuration?: number;
  price?: string | number;
  /** URL do avatar do profissional — optional, melhora visual do AppointmentCard */
  professionalAvatarUri?: string | null;
  appointmentId?: number;
  appointmentStatus?: 'pending' | 'confirmed' | 'completed' | 'canceled';
  appointmentPaid?: boolean;
  pendingService?: ChatBotServiceOption | null;
}

export interface QuickReplyOption {
  label: string;
  value: string;
}

export interface SuggestedTime {
  /** Rótulo formatado, ex: "Sáb, 5 jul às 14:00" */
  label: string;
  /** Valor enviado ao backend: "HH:MM" ou "YYYY-MM-DD|HH:MM" */
  value: string;
}

export type ChatBotActionType =
  'confirm_appointment' | 'confirm_cancel' | 'confirm_reschedule';

export interface ChatBotAppointmentData {
  id?: number;
  serviceTitle: string;
  serviceDescription?: string | null;
  subcategoryName?: string;
  categoryName?: string | null;
  professionalName: string;
  professionalRating?: number;
  professionalRatingsCount?: number;
  professionalLocation?: string | null;
  durationMinutes?: number;
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
  /** session_id numérico do backend (inteiro > 0). null = sessão ainda não iniciada. */
  sessionId: number | null;
  messages: ChatBotMessage[];
  loading: boolean;
  error: string | null;
  /** Estado atual da máquina de conversa. */
  conversationState: ChatBotState | null;
  /** Contexto acumulado da conversa. */
  conversationContext: ChatBotContext | null;
  /** Último texto enviado ao backend — usado para retry em caso de erro 500. */
  lastSentText: string | null;
  /**
   * Epoch em ms (Date.now() escala) indicando quando o rate limit reseta.
   * Populado quando o backend retorna 429 com header RateLimit-Reset.
   */
  rateLimitResetAt: number | null;

  setSessionId: (id: number) => void;
  addMessage: (message: ChatBotMessage) => void;
  prependMessages: (messages: ChatBotMessage[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConversationState: (state: ChatBotState, context: ChatBotContext) => void;
  setLastSentText: (text: string | null) => void;
  setRateLimitResetAt: (ts: number | null) => void;
  /** Zera sessionId e state sem apagar o histórico de mensagens. */
  resetSession: () => void;
  /** Zera tudo (mensagens incluídas). */
  clearSession: () => void;
}

/** Body enviado para POST /api/chat/bot/message */
export interface SendMessageRequest {
  message: string;
  session_id: number | null;
  channel?: string;
  /** IANA timezone do cliente (ex.: America/Sao_Paulo) */
  timezone?: string;
  /** Offset UTC em minutos (positivo = à frente de UTC) */
  utc_offset_minutes?: number;
  /** ISO UTC do horário selecionado — mesmo padrão do checkout */
  selected_time?: string;
}

/** Resposta de POST /api/chat/bot/message */
export interface SendMessageResponse {
  session_id: number;
  message: string;
  state: ChatBotState;
  context: ChatBotContext;
  /** true quando o backend iniciou uma sessão nova sem o histórico anterior. */
  clear_history?: boolean;
}

/**
 * Resposta do endpoint de voz. Depois da transcrição, o backend executa a
 * mesma máquina de conversa usada pelas mensagens digitadas.
 */
export interface VoiceCommandResponse extends SendMessageResponse {
  transcript: string;
}

/** Objeto session retornado dentro do GET /api/chat/bot/session/active */
export interface ChatBotSessionMeta {
  id: number;
  state: ChatBotState;
  status: string;
  channel: string;
  started_at: string;
  ended_at: string | null;
  appointment_id: number | null;
  appointment_status?:
    'pending' | 'confirmed' | 'completed' | 'canceled' | null;
  appointment_paid?: boolean;
  payment_pending?: boolean;
  /** Contexto acumulado da conversa — presente quando o backend o inclui na resposta. */
  context?: ChatBotContext;
}

export interface ChatBotHistoryMessage {
  id: number;
  sender: ChatBotMessageRole;
  content: string;
  intent?: string | null;
  createdAt: string;
}

/** Resposta de GET /api/chat/bot/session/:id */
export interface LoadSessionResponse {
  session: ChatBotSessionMeta;
  messages: (ChatBotMessage | ChatBotHistoryMessage)[];
}
