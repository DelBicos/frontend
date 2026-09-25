import { create } from 'zustand';
import { backendHttpClient } from '@lib/helpers/httpClient';

export type ServiceItem = {
  id: number;
  title: string;
  description?: string;
  date?: string; // YYYY-MM-DD
  price_cents?: number;
  price?: number; // fallback float caso price_cents não esteja no banco
  duration?: number; // minutos
  subcategory_id?: number;
  banner_uri?: string | null;
  active?: boolean;
  category_id?: number;
  /** Pontuação retornada somente pela busca semântica (0 a 1). */
  relevanceScore?: number;
  availabilities?: {
    day: number; // 0=domingo .. 6=sábado
    start: string; // HH:MM
    end: string; // HH:MM
  }[];
};

export type SemanticServiceSearchResult = {
  services: ServiceItem[];
  total: number;
  resultsLimited: boolean;
};

/** Normaliza os formatos históricos e o retorno da busca semântica do backend. */
function normalizeService(raw: any): ServiceItem {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    date: raw.date,
    price_cents:
      raw.price_cents ??
      (raw.price != null ? Math.round(Number(raw.price) * 100) : undefined),
    duration: raw.duration,
    subcategory_id: raw.subcategory_id,
    banner_uri: raw.banner_uri ?? raw.bannerUrl ?? null,
    active: raw.active,
    category_id:
      raw.category_id ??
      raw.Subcategory?.category_id ??
      raw.subcategory?.category_id ??
      raw.category?.id,
    relevanceScore:
      typeof raw.relevance_score === 'number' ? raw.relevance_score : undefined,
    availabilities: Array.isArray(raw.availabilities)
      ? raw.availabilities.map((availability: any) => ({
          day: availability.day,
          start: availability.start,
          end: availability.end,
        }))
      : Array.isArray(raw.Availabilities)
        ? raw.Availabilities.map((availability: any) => ({
            day: availability.day_of_week ?? availability.day,
            start: availability.start_time ?? availability.start,
            end: availability.end_time ?? availability.end,
          }))
        : undefined,
  };
}

type ServicesState = {
  services: ServiceItem[];
  myServices: ServiceItem[];
  loading: boolean;
  lastQuery?: {
    day?: number;
    category_id?: number;
    subcategory_id?: number;
    q?: string;
  };
  fetchServices: (opts?: {
    day?: number;
    category_id?: number;
    subcategory_id?: number;
    q?: string;
  }) => Promise<ServiceItem[]>;
  searchServicesSemantically: (
    query: string,
  ) => Promise<SemanticServiceSearchResult>;
  fetchMyServices: (opts?: {
    page?: number;
    limit?: number;
  }) => Promise<ServiceItem[]>;
  reloadServices: () => Promise<ServiceItem[]>;
  reloadMyServices: () => Promise<ServiceItem[]>;
  createService: (data: Partial<ServiceItem>) => Promise<ServiceItem | null>;
  updateService: (
    id: number,
    data: Partial<ServiceItem>,
  ) => Promise<ServiceItem | null>;
  deleteService: (id: number) => Promise<boolean>;
};

export const useServicesStore = create<ServicesState>((set, get) => ({
  services: [],
  myServices: [],
  loading: false,

  fetchServices: async (opts?: {
    day?: number;
    category_id?: number;
    subcategory_id?: number;
    q?: string;
  }) => {
    set({ loading: true });
    try {
      set({ lastQuery: opts });
      const params: any = {};
      if (opts?.day !== undefined) params.day = opts.day;
      if (opts?.category_id !== undefined)
        params.category_id = opts.category_id;
      if (opts?.subcategory_id !== undefined)
        params.subcategory_id = opts.subcategory_id;
      if (opts?.q !== undefined) params.q = opts.q;
      const res = await backendHttpClient.get('/api/services', { params });
      const raw = Array.isArray(res.data)
        ? res.data
        : res.data.data || res.data.services || [];
      const data: ServiceItem[] = (raw as any[]).map(normalizeService);
      set({ services: data, loading: false });
      return data;
    } catch (e) {
      console.error('[Services] fetchServices', e);
      set({ loading: false });
      return [];
    }
  },

  fetchMyServices: async (opts?: { page?: number; limit?: number }) => {
    set({ myServices: [], loading: true });
    try {
      const params: any = {};
      if (opts?.page !== undefined) params.page = opts.page;
      if (opts?.limit !== undefined) params.limit = opts.limit;
      const res = await backendHttpClient.get('/api/services/my', { params });
      const raw = Array.isArray(res.data)
        ? res.data
        : res.data.data || res.data.services || [];
      const data: ServiceItem[] = (raw as any[]).map(normalizeService);
      set({ myServices: data, loading: false });
      return data;
    } catch (e) {
      console.error('[Services] fetchMyServices', e);
      set({ myServices: [], loading: false });
      return [];
    }
  },

  searchServicesSemantically: async (query: string) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      return { services: [], total: 0, resultsLimited: false };
    }

    try {
      const res = await backendHttpClient.get('/api/services/search/semantic', {
        params: { q: trimmedQuery, limit: 20 },
      });
      const raw = Array.isArray(res.data)
        ? res.data
        : (res.data?.data ?? res.data?.services ?? []);

      return {
        services: (raw as any[]).map(normalizeService),
        total: Number(res.data?.total ?? raw.length),
        resultsLimited: res.data?.results_limited === true,
      };
    } catch (error) {
      console.error('[Services] searchServicesSemantically', error);
      throw error;
    }
  },

  reloadServices: async () => {
    const opts = get().lastQuery;
    return await get().fetchServices(opts);
  },

  reloadMyServices: async () => {
    return await get().fetchMyServices();
  },

  createService: async (data) => {
    try {
      const res = await backendHttpClient.post('/api/services', data);
      const r = res.data && res.data.service ? res.data.service : res.data;
      const created = normalizeService(r);
      set({ myServices: [...(get().myServices || []), created] });
      return created;
    } catch (e) {
      console.error('[Services] createService', e);
      throw e;
    }
  },

  updateService: async (id, data) => {
    try {
      const res = await backendHttpClient.put(`/api/services/${id}`, data);
      const r = res.data && res.data.service ? res.data.service : res.data;
      const updated = normalizeService(r);
      set({
        myServices: (get().myServices || []).map((s) =>
          s.id === id ? updated : s,
        ),
      });
      return updated;
    } catch (e) {
      console.error('[Services] updateService', e);
      throw e;
    }
  },

  deleteService: async (id) => {
    try {
      await backendHttpClient.delete(`/api/services/${id}`);
      set({ myServices: (get().myServices || []).filter((s) => s.id !== id) });
      return true;
    } catch (e) {
      console.error('[Services] deleteService', e);
      return false;
    }
  },
}));

export default useServicesStore;
