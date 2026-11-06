import { create } from 'zustand';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { getApiErrorMessage } from '@api/errors';
import type { Dispute, AdminDispute } from '@stores/Appointment/types';
import type { AdminStats, AdminStore, AdminVerification } from './types';

/** Rotulos de apresentacao dos indicadores. */
export const MONTH_LABELS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

export const STATUS_LABELS = {
  pending: 'Pendentes',
  confirmed: 'Confirmados',
  completed: 'Concluídos',
  canceled: 'Cancelados',
  no_show: 'Não compareceu',
} as const;

export const useAdminStore = create<AdminStore>()((set) => ({
  stats: null,
  loading: false,
  error: null,

  fetchStats: async (year) => {
    set({ loading: true, error: null });
    try {
      const { data } = await backendHttpClient.get<AdminStats>(
        '/api/admin/stats',
        { params: year ? { year } : undefined },
      );
      set({ stats: data, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: getApiErrorMessage(error, 'Não foi possível carregar os dados.'),
      });
    }
  },

  listDisputes: async (status) => {
    const { data } = await backendHttpClient.get<AdminDispute[]>(
      '/api/admin/disputes',
      { params: status ? { status } : undefined },
    );
    return data;
  },

  resolveDispute: async (disputeId, input) => {
    const { data } = await backendHttpClient.post<Dispute>(
      `/api/admin/disputes/${disputeId}/resolve`,
      input,
    );
    return data;
  },

  listVerifications: async (status = 'pending') => {
    const { data } = await backendHttpClient.get<{
      verifications?: AdminVerification[];
    }>('/api/admin/verifications', { params: { status } });
    return data.verifications ?? [];
  },

  reviewVerification: async (id, decision, reason) => {
    await backendHttpClient.post(`/api/admin/verifications/${id}/review`, {
      decision,
      reason,
    });
  },
}));
