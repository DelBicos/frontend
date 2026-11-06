import { create } from 'zustand';
import { backendHttpClient } from '@lib/helpers/httpClient';
import {
  KpisResponse,
  EarningsResponse,
  CategoriesResponse,
  DashboardState,
} from './types';

import { getApiErrorMessage } from '@api/errors';
export const useDashboardStore = create<DashboardState>((set, get) => ({
  kpis: null,
  earnings: [],
  categories: [],
  loading: false,
  error: null,

  fetchKpis: async () => {
    set({ loading: true, error: null });
    try {
      const response = await backendHttpClient.get<KpisResponse>(
        '/api/dashboard/kpis',
      );
      set({ kpis: response.data });
    } catch (err) {
      set({ error: getApiErrorMessage(err, 'Erro ao buscar KPIs') });
    } finally {
      set({ loading: false });
    }
  },

  fetchEarnings: async (from?: string, to?: string) => {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const query = new URLSearchParams(params).toString();
    const url = `/api/dashboard/earnings-over-time${query ? `?${query}` : ''}`;

    set({ loading: true, error: null });
    try {
      const response = await backendHttpClient.get<EarningsResponse>(url);
      // normalize months: add parsedDate YYYY-MM-01 in ISO
      const normalized = response.data.map((item) => {
        const [mm, yyyy] = item.month.split('-').map((v) => Number(v));
        const parsedDate = new Date(yyyy, mm - 1, 1).toISOString().slice(0, 10);
        return { ...item, parsedDate };
      });
      set({ earnings: normalized });
    } catch (err) {
      set({ error: getApiErrorMessage(err, 'Erro ao buscar ganhos') });
    } finally {
      set({ loading: false });
    }
  },

  fetchCategories: async (from?: string, to?: string) => {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const query = new URLSearchParams(params).toString();
    const url = `/api/dashboard/services-by-category${query ? `?${query}` : ''}`;

    set({ loading: true, error: null });
    try {
      const response = await backendHttpClient.get<CategoriesResponse>(url);
      set({ categories: response.data });
    } catch (err) {
      set({ error: getApiErrorMessage(err, 'Erro ao buscar categorias') });
    } finally {
      set({ loading: false });
    }
  },

  clear: () => set({ kpis: null, earnings: [], categories: [], error: null }),
}));
