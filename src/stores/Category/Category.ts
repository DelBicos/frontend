import { create } from 'zustand';
import { Category, CategoryPayload, CategoryStore } from './types';
import { backendHttpClient } from '@lib/helpers/httpClient';

import { logger } from '@lib/logger';

// Icones por id de categoria ate que venham do backend.
const CATEGORY_ICONS: Record<number, string> = {
  1: 'heartbeat',
  2: 'cut',
  3: 'tools',
  4: 'lightbulb',
  5: 'home',
  6: 'paw',
};
const DEFAULT_CATEGORY_ICON = 'shapes';

/** Entrega a categoria ja com o icone, para os componentes so exibirem. */
export function normalizeCategory(payload: CategoryPayload): Category {
  return {
    ...payload,
    iconName: CATEGORY_ICONS[payload.id] ?? DEFAULT_CATEGORY_ICON,
  };
}

// Chamadas simultaneas (varios componentes montando juntos) compartilham
// a mesma requisicao.
let inFlight: Promise<void> | null = null;

export const useCategoryStore = create<CategoryStore>()((set) => ({
  categories: [],

  fetchCategories: () => {
    if (inFlight) return inFlight;
    inFlight = backendHttpClient
      .get<CategoryPayload[]>('/api/categories')
      .then((response) => {
        set({ categories: response.data.map(normalizeCategory) });
      })
      .catch((error) => {
        logger.error('Failed to fetch categories:', error);
      })
      .finally(() => {
        inFlight = null;
      });
    return inFlight;
  },
}));
