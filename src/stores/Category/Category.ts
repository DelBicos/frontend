import { create } from 'zustand';
import { Category, CategoryStore } from './types';
import { backendHttpClient } from '@lib/helpers/httpClient';

import { logger } from '@lib/logger';
// Chamadas simultaneas (varios componentes montando juntos) compartilham
// a mesma requisicao.
let inFlight: Promise<void> | null = null;

export const useCategoryStore = create<CategoryStore>()((set) => ({
  categories: [],

  fetchCategories: () => {
    if (inFlight) return inFlight;
    inFlight = backendHttpClient
      .get<Category[]>('/api/categories')
      .then((response) => {
        set({ categories: response.data });
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
