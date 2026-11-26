export type TicketCategory =
  | 'AGENDAMENTO'
  | 'PAGAMENTO'
  | 'SERVICO'
  | 'PRESTADOR'
  | 'CLIENTE'
  | 'SUGESTAO'
  | 'OUTROS';

export type TicketPriority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type TicketStatus =
  'ABERTO' | 'EM_ANALISE' | 'EM_ATENDIMENTO' | 'RESOLVIDO' | 'FECHADO';

export type TicketUserType = 'CLIENTE' | 'PRESTADOR';

export interface Ticket {
  id: number;
  ticket_code: string;
  title: string;
  description?: string;
  category: TicketCategory;
  priority: TicketPriority | null;
  status: TicketStatus;
  user_type?: TicketUserType;
  appointment_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  category: TicketCategory;
  /** Obrigatória no backend: sem ela o POST responde 400. */
  priority: TicketPriority;
  appointment_short_id?: string;
}

// ─── TICKET MESSAGE (TICKET-04) ──────────────────────────────

export type TicketMessageAuthorType = 'CLIENTE' | 'PRESTADOR' | 'ADMIN';

export interface TicketMessageAuthor {
  id: number;
  type: TicketMessageAuthorType;
  name: string;
  avatar_uri: string | null;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  author: TicketMessageAuthor;
  content: string;
  attachment_url: string | null;
  created_at: string;
}

/** Maximum message length accepted by the server (after trim). */
export const TICKET_MESSAGE_MAX_LENGTH = 2000;

/** Why sending a message failed, so the UI can react to each case. */
export type SendTicketMessageFailure =
  | 'INVALID_CONTENT' // 400 with field details
  | 'TICKET_CLOSED' // 409 code TICKET_CLOSED
  | 'NOT_FOUND' // 404
  | 'UNKNOWN'; // 500, network or anything else

export type SendTicketMessageResult =
  | { ok: true; message: TicketMessage }
  | { ok: false; reason: SendTicketMessageFailure; error: string };

// ─── STORE ────────────────────────────────────────────────────

export interface TicketState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  messages: TicketMessage[]; // ✅ NOVO
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export interface TicketActions {
  fetchTickets: () => Promise<void>;
  fetchTicketById: (id: number) => Promise<Ticket | null>;
  fetchMessages: (ticketId: number) => Promise<void>; // ✅ NOVO
  createTicket: (payload: CreateTicketPayload) => Promise<Ticket>;
  sendMessage: (
    ticketId: number,
    content: string,
  ) => Promise<SendTicketMessageResult>;
  clearError: () => void;
  clearCurrent: () => void;
  clearMessages: () => void; // ✅ NOVO
}

export type TicketStore = TicketState & TicketActions;

// ─── LABELS ───────────────────────────────────────────────────

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  AGENDAMENTO: 'Agendamento',
  PAGAMENTO: 'Pagamento',
  SERVICO: 'Serviço',
  PRESTADOR: 'Prestador',
  CLIENTE: 'Cliente',
  SUGESTAO: 'Sugestão',
  OUTROS: 'Outros',
};

/** Ordem de exibição no formulário: da menos para a mais urgente. */
export const TICKET_PRIORITIES: TicketPriority[] = [
  'BAIXA',
  'MEDIA',
  'ALTA',
  'CRITICA',
];

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
};

/** Texto de apoio para o usuário escolher a prioridade certa. */
export const TICKET_PRIORITY_HINTS: Record<TicketPriority, string> = {
  BAIXA: 'Dúvida ou sugestão, sem impacto no uso.',
  MEDIA: 'Atrapalha, mas dá para continuar usando.',
  ALTA: 'Impede de agendar, atender ou concluir um serviço.',
  CRITICA: 'Cobrança indevida, risco à segurança ou conta bloqueada.',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  ABERTO: 'Aberto',
  EM_ANALISE: 'Em análise',
  EM_ATENDIMENTO: 'Em atendimento',
  RESOLVIDO: 'Resolvido',
  FECHADO: 'Fechado',
};

export const TICKET_MESSAGE_AUTHOR_LABELS: Record<
  TicketMessageAuthorType,
  string
> = {
  CLIENTE: 'Cliente',
  PRESTADOR: 'Prestador',
  ADMIN: 'Suporte DelBicos',
};
