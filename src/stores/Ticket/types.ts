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
  | 'ABERTO'
  | 'EM_ANALISE'
  | 'EM_ATENDIMENTO'
  | 'RESOLVIDO'
  | 'FECHADO';

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
  appointment_short_id?: string;
}

export interface TicketState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export interface TicketActions {
  fetchTickets: () => Promise<void>;
  fetchTicketById: (id: number) => Promise<Ticket | null>;
  createTicket: (payload: CreateTicketPayload) => Promise<Ticket>;
  clearError: () => void;
  clearCurrent: () => void;
}

export type TicketStore = TicketState & TicketActions;

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  AGENDAMENTO: 'Agendamento',
  PAGAMENTO: 'Pagamento',
  SERVICO: 'Serviço',
  PRESTADOR: 'Prestador',
  CLIENTE: 'Cliente',
  SUGESTAO: 'Sugestão',
  OUTROS: 'Outros',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  ABERTO: 'Aberto',
  EM_ANALISE: 'Em análise',
  EM_ATENDIMENTO: 'Em atendimento',
  RESOLVIDO: 'Resolvido',
  FECHADO: 'Fechado',
};
