import { create } from 'zustand';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { useUserStore } from '@stores/User';

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
  availabilities?: {
    day: number; // 0=domingo .. 6=sábado
    start: string; // HH:MM
    end: string; // HH:MM
  }[];
};

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

  // NOTE: normalization removed — backend now returns `price_cents` reliably

  fetchServices: async (opts?: {
    day?: number;
    category_id?: number;
    subcategory_id?: number;
    q?: string;
  }) => {
    set({ loading: true });
    try {
      // store last used query to allow reloads with same filters
      set({ lastQuery: opts });
      const params: any = {};
      if (opts?.day !== undefined) params.day = opts.day;
      if (opts?.category_id !== undefined)
        params.category_id = opts.category_id;
      if (opts?.subcategory_id !== undefined)
        params.subcategory_id = opts.subcategory_id;
      if (opts?.q !== undefined) params.q = opts.q;
      // GET /api/services retorna { total, page, limit, data: [...] }
      const res = await backendHttpClient.get('/api/services', { params });
      const raw = Array.isArray(res.data)
        ? res.data
        : res.data.data || res.data.services || [];
      const data: ServiceItem[] = (raw as any[]).map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        date: r.date,
        price_cents:
          r.price_cents ??
          (r.price != null ? Math.round(Number(r.price) * 100) : undefined),
        duration: r.duration,
        subcategory_id: r.subcategory_id,
        banner_uri: r.banner_uri ?? r.bannerUrl ?? null,
        active: r.active,
        category_id:
          r.category_id ??
          r.Subcategory?.category_id ??
          r.subcategory?.category_id ??
          (r.category ? r.category.id : undefined),
        availabilities: Array.isArray(r.availabilities)
          ? r.availabilities.map((a: any) => ({
              day: a.day,
              start: a.start,
              end: a.end,
            }))
          : Array.isArray(r.Availabilities)
            ? r.Availabilities.map((a: any) => ({
                day: a.day_of_week ?? a.day,
                start: a.start_time ?? a.start,
                end: a.end_time ?? a.end,
              }))
            : undefined,
      }));
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
      const data: ServiceItem[] = (raw as any[]).map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        date: r.date,
        price_cents:
          r.price_cents ??
          (r.price != null ? Math.round(Number(r.price) * 100) : undefined),
        duration: r.duration,
        subcategory_id: r.subcategory_id,
        banner_uri: r.banner_uri ?? r.bannerUrl ?? null,
        active: r.active,
        category_id:
          r.category_id ??
          r.Subcategory?.category_id ??
          r.subcategory?.category_id ??
          (r.category ? r.category.id : undefined),
        availabilities: Array.isArray(r.availabilities)
          ? r.availabilities.map((a: any) => ({
              day: a.day,
              start: a.start,
              end: a.end,
            }))
          : Array.isArray(r.Availabilities)
            ? r.Availabilities.map((a: any) => ({
                day: a.day_of_week ?? a.day,
                start: a.start_time ?? a.start,
                end: a.end_time ?? a.end,
              }))
            : undefined,
      }));
      set({ myServices: data, loading: false });
      return data;
    } catch (e) {
      console.error('[Services] fetchMyServices', e);
      set({ myServices: [], loading: false });
      return [];
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
      // POST /api/services — rota principal; professional_id resolvido pelo token
      const res = await backendHttpClient.post('/api/services', data);
      const r = res.data && res.data.service ? res.data.service : res.data;
      const created: ServiceItem = {
        id: r.id,
        title: r.title,
        description: r.description,
        date: r.date,
        price_cents:
          r.price_cents ??
          (r.price != null ? Math.round(Number(r.price) * 100) : undefined),
        duration: r.duration,
        subcategory_id: r.subcategory_id,
        banner_uri: r.banner_uri ?? r.bannerUrl ?? null,
        active: r.active,
        category_id:
          r.category_id ??
          r.Subcategory?.category_id ??
          r.subcategory?.category_id ??
          (r.category ? r.category.id : undefined),
        availabilities: Array.isArray(r.availabilities)
          ? r.availabilities.map((a: any) => ({
              day: a.day,
              start: a.start,
              end: a.end,
            }))
          : Array.isArray(r.Availabilities)
            ? r.Availabilities.map((a: any) => ({
                day: a.day_of_week ?? a.day,
                start: a.start_time ?? a.start,
                end: a.end_time ?? a.end,
              }))
            : undefined,
      };
      set({ myServices: [...(get().myServices || []), created] });
      return created;
    } catch (e) {
      console.error('[Services] createService', e);
      // Propagate the error so UI can display backend message
      throw e;
    }
  },

  updateService: async (id, data) => {
    try {
      const res = await backendHttpClient.put(`/api/services/${id}`, data);
      const r = res.data && res.data.service ? res.data.service : res.data;
      const updated: ServiceItem = {
        id: r.id,
        title: r.title,
        description: r.description,
        date: r.date,
        price_cents:
          r.price_cents ??
          (r.price != null ? Math.round(Number(r.price) * 100) : undefined),
        duration: r.duration,
        subcategory_id: r.subcategory_id,
        banner_uri: r.banner_uri ?? r.bannerUrl ?? null,
        active: r.active,
        category_id:
          r.category_id ??
          r.Subcategory?.category_id ??
          r.subcategory?.category_id ??
          (r.category ? r.category.id : undefined),
        availabilities: Array.isArray(r.availabilities)
          ? r.availabilities.map((a: any) => ({
              day: a.day,
              start: a.start,
              end: a.end,
            }))
          : Array.isArray(r.Availabilities)
            ? r.Availabilities.map((a: any) => ({
                day: a.day_of_week ?? a.day,
                start: a.start_time ?? a.start,
                end: a.end_time ?? a.end,
              }))
            : undefined,
      };
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
