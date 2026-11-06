import { create } from 'zustand';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { useUserStore } from '@stores/User';

import { logger } from '@lib/logger';
export type AvailabilityItem = {
  id: number;
  professional_id: number;
  days_of_week?: string; // '0100001'
  start_day_of_month?: number;
  end_day_of_month?: number;
  start_day?: string; // YYYY-MM-DD
  end_day?: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  is_available: boolean;
  recurrence_pattern: 'none' | 'daily' | 'weekly' | 'monthly';
  created_at?: string;
  updated_at?: string;
};

type AvailabilityState = {
  items: AvailabilityItem[];
  loading: boolean;
  fetchList: (professionalId?: number) => Promise<AvailabilityItem[]>;
  getOne: (
    professionalId: number,
    id: number,
  ) => Promise<AvailabilityItem | null>;
  create: (
    professionalId: number,
    data: Partial<AvailabilityItem>,
  ) => Promise<AvailabilityItem | null>;
  update: (
    professionalId: number,
    id: number,
    data: Partial<AvailabilityItem>,
  ) => Promise<AvailabilityItem | null>;
  remove: (professionalId: number, id: number) => Promise<boolean>;
};

export const useAvailabilityStore = create<AvailabilityState>((set, get) => ({
  items: [],
  loading: false,

  fetchList: async (professionalId) => {
    set({ loading: true });
    try {
      const user = useUserStore.getState().user;
      const pid = professionalId ?? user?.professional_id;
      if (!pid) {
        set({ loading: false });
        return [];
      }
      const res = await backendHttpClient.get(
        `/api/professionals/${pid}/availabilities`,
      );
      const data = Array.isArray(res.data) ? res.data : res.data.items || [];
      set({ items: data, loading: false });
      return data;
    } catch (e) {
      logger.error('[Availability] fetchList', e);
      set({ loading: false });
      return [];
    }
  },

  getOne: async (professionalId, id) => {
    try {
      const res = await backendHttpClient.get(`/api/availabilities/${id}`);
      return res.data;
    } catch (e) {
      logger.error('[Availability] getOne', e);
      return null;
    }
  },

  create: async (professionalId, data) => {
    try {
      const payload = preparePayload(data);
      const res = await backendHttpClient.post(
        `/api/professionals/${professionalId}/availabilities`,
        payload,
      );
      const created = res.data;
      set({ items: [...(get().items || []), created] });
      return created;
    } catch (e) {
      logger.error('[Availability] create', e);
      return null;
    }
  },

  update: async (professionalId, id, data) => {
    try {
      const payload = preparePayload(data);
      const res = await backendHttpClient.put(
        `/api/availabilities/${id}`,
        payload,
      );
      const updated = res.data;
      set({
        items: (get().items || []).map((it) => (it.id === id ? updated : it)),
      });
      return updated;
    } catch (e) {
      logger.error('[Availability] update', e);
      return null;
    }
  },

  remove: async (professionalId, id) => {
    try {
      await backendHttpClient.delete(`/api/availabilities/${id}`);
      set({ items: (get().items || []).filter((it) => it.id !== id) });
      return true;
    } catch (e) {
      logger.error('[Availability] remove', e);
      return false;
    }
  },
}));

export default useAvailabilityStore;

// Helpers
function padTimePart(n: number) {
  return String(n).padStart(2, '0');
}

function toHHMMFromDate(d: Date) {
  return `${padTimePart(d.getHours())}:${padTimePart(d.getMinutes())}`;
}

function ddmmyyyyToIso(dateStr?: string) {
  if (!dateStr) return undefined;
  // input expected DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length !== 3) return undefined;
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

/** Campos que o formulario envia (varios formatos: Date, numero, texto). */
type AvailabilityPayload = Record<string, unknown> & {
  days_array?: boolean[];
  days_of_week?: string;
  start_time?: unknown;
  end_time?: unknown;
  start_day?: string;
  end_day?: string;
  recurrence_pattern?: string;
  start_day_of_month?: number | string;
};

function preparePayload(data: Record<string, unknown>) {
  const payload: AvailabilityPayload = { ...data };

  // days_array -> days_of_week
  if (payload.days_array && Array.isArray(payload.days_array)) {
    payload.days_of_week = payload.days_array
      .map((b) => (b ? '1' : '0'))
      .join('');
    delete payload.days_array;
  }

  // normalize days_of_week to 7 chars
  if (payload.days_of_week) {
    let s = String(payload.days_of_week || '');
    s = s.replace(/[^01]/g, '0').slice(0, 7);
    while (s.length < 7) s = s + '0';
    payload.days_of_week = s;
  }

  // times: if Date objects provided, convert; otherwise ensure HH:MM
  if (payload.start_time instanceof Date)
    payload.start_time = toHHMMFromDate(payload.start_time);
  if (payload.end_time instanceof Date)
    payload.end_time = toHHMMFromDate(payload.end_time);
  if (typeof payload.start_time === 'number')
    payload.start_time = toHHMMFromDate(new Date(payload.start_time));
  if (typeof payload.end_time === 'number')
    payload.end_time = toHHMMFromDate(new Date(payload.end_time));

  if (typeof payload.start_time === 'string')
    payload.start_time = payload.start_time.trim().slice(0, 5);
  if (typeof payload.end_time === 'string')
    payload.end_time = payload.end_time.trim().slice(0, 5);

  // dates: convert DD/MM/YYYY -> YYYY-MM-DD for 'none' recurrence
  if (payload.recurrence_pattern === 'none') {
    if (payload.start_day) payload.start_day = ddmmyyyyToIso(payload.start_day);
    if (payload.end_day) payload.end_day = ddmmyyyyToIso(payload.end_day);
  }

  // ensure numeric day_of_month
  if (payload.start_day_of_month)
    payload.start_day_of_month =
      Number(payload.start_day_of_month) || undefined;

  // remove undefined or empty strings
  Object.keys(payload).forEach((k) => {
    if (payload[k] === undefined || payload[k] === '') delete payload[k];
  });

  return payload;
}
