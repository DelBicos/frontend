import type {
  Dispute,
  DisputeResolution,
  AdminDispute,
} from '@stores/Appointment/types';
import type { IdentityStatus, DocumentType } from '@stores/Verification/types';

export type AppointmentStatusKey =
  'pending' | 'confirmed' | 'completed' | 'canceled' | 'no_show';

export interface AdminStats {
  year: number;
  kpis: {
    /** Concluidos + valor retido em cancelamentos e nao comparecimentos (R$). */
    revenue: number;
    appointments: number;
    completed: number;
    averageRating: number | null;
    ratingsCount: number;
    totalUsers: number;
    totalProfessionals: number;
    verifiedProfessionals: number;
  };
  queues: { openDisputes: number; pendingVerifications: number };
  usersByMonth: number[];
  professionalsByMonth: number[];
  revenueByMonth: number[];
  appointmentsByMonth: Record<AppointmentStatusKey, number[]>;
  statusTotals: Record<AppointmentStatusKey, number>;
}

/** Pedido de verificacao de identidade, como o painel admin recebe. */
export interface AdminVerification {
  id: number;
  status: IdentityStatus;
  document_type: DocumentType;
  submitted_at: string;
  reviewed_at?: string | null;
  reject_reason?: string | null;
  professional: { id: number; name: string; email: string; cpf: string };
  front_url: string | null;
  back_url: string | null;
  selfie_url: string | null;
}

export interface AdminStore {
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;

  /** Indicadores do ano (ou do ano atual, sem parametro). */
  fetchStats: (year?: number) => Promise<void>;
  listDisputes: (status?: 'open' | 'resolved') => Promise<AdminDispute[]>;
  resolveDispute: (
    disputeId: number,
    input: {
      resolution: DisputeResolution;
      refundCents?: number;
      note?: string;
    },
  ) => Promise<Dispute>;
  listVerifications: (
    status?: IdentityStatus | 'all',
  ) => Promise<AdminVerification[]>;
  reviewVerification: (
    id: number,
    decision: 'approve' | 'reject',
    reason?: string,
  ) => Promise<void>;
}
