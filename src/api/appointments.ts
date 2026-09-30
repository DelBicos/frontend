import { backendHttpClient } from '@lib/helpers/httpClient';

/** Identificador publico do agendamento (o backend expoe o short_id). */
type AppointmentId = string | number;

export type CancellationTier =
  'unconfirmed' | 'free' | 'mid' | 'late' | 'full_refund';

export interface CancellationOutcome {
  tier: CancellationTier;
  retentionPercent: number;
  retainedCents: number;
  refundCents: number;
}

export interface CancelResult {
  tier: CancellationTier;
  retainedCents: number;
  refundedCents: number;
}

export type DisputeReason =
  | 'service_not_done'
  | 'poor_quality'
  | 'wrong_charge'
  | 'wrong_no_show'
  | 'professional_absent'
  | 'other';

export type DisputeResolution = 'refund_full' | 'refund_partial' | 'rejected';

export interface Dispute {
  id: number;
  appointment_id: number;
  reason: DisputeReason;
  description: string;
  status: 'open' | 'resolved';
  resolution?: DisputeResolution | null;
  refund_cents?: number | null;
  resolution_note?: string | null;
  createdAt: string;
  resolved_at?: string | null;
}

/** Disputa com os dados do agendamento, como o painel admin recebe. */
export interface AdminDispute extends Dispute {
  Appointment?: {
    short_id: string;
    status: string;
    retained_cents?: number | null;
    refunded_cents?: number | null;
    Service?: { title: string; price?: string };
    Client?: { User?: { name: string; email: string } };
    Professional?: { User?: { name: string; email: string } };
  };
}

const base = (id: AppointmentId) => `/api/appointments/${id}`;

/** Quanto seria retido/devolvido se o usuario cancelasse agora. */
export async function previewCancellation(id: AppointmentId) {
  const { data } = await backendHttpClient.get<CancellationOutcome>(
    `${base(id)}/cancellation-preview`,
  );
  return data;
}

export async function cancelAppointment(id: AppointmentId, reason?: string) {
  const { data } = await backendHttpClient.post<CancelResult>(
    `${base(id)}/cancel`,
    { reason: reason?.trim() || undefined },
  );
  return data;
}

/** Profissional registra que o cliente nao compareceu. */
export async function markNoShow(id: AppointmentId) {
  await backendHttpClient.post(`${base(id)}/no-show`);
}

/** Horarios livres (HH:mm) do profissional em um dia (AAAA-MM-DD). */
export async function getRescheduleSlots(id: AppointmentId, date: string) {
  const { data } = await backendHttpClient.get<{
    date: string;
    slots: string[];
  }>(`${base(id)}/reschedule-slots`, { params: { date } });
  return data.slots;
}

/** Pede um novo horario (ISO); a outra parte precisa aceitar. */
export async function requestReschedule(id: AppointmentId, startTime: string) {
  await backendHttpClient.post(`${base(id)}/reschedule`, {
    start_time: startTime,
  });
}

export async function respondToReschedule(id: AppointmentId, accept: boolean) {
  await backendHttpClient.post(`${base(id)}/reschedule/respond`, { accept });
}

export async function openDispute(
  id: AppointmentId,
  input: { reason: DisputeReason; description: string },
) {
  const { data } = await backendHttpClient.post<Dispute>(
    `${base(id)}/dispute`,
    input,
  );
  return data;
}

export async function getDispute(id: AppointmentId) {
  const { data } = await backendHttpClient.get<Dispute | null>(
    `${base(id)}/dispute`,
  );
  return data ?? null;
}

// --- Painel do administrador ---

export async function listAdminDisputes(status?: 'open' | 'resolved') {
  const { data } = await backendHttpClient.get<AdminDispute[]>(
    '/api/admin/disputes',
    { params: status ? { status } : undefined },
  );
  return data;
}

export async function resolveAdminDispute(
  disputeId: number,
  input: {
    resolution: DisputeResolution;
    refundCents?: number;
    note?: string;
  },
) {
  const { data } = await backendHttpClient.post<Dispute>(
    `/api/admin/disputes/${disputeId}/resolve`,
    input,
  );
  return data;
}
