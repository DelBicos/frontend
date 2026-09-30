import { backendHttpClient } from '@lib/helpers/httpClient';

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

export async function getAdminStats(year?: number): Promise<AdminStats> {
  const { data } = await backendHttpClient.get('/api/admin/stats', {
    params: year ? { year } : undefined,
  });
  return data;
}
