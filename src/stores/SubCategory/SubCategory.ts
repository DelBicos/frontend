import { create } from 'zustand';
import { SubCategory, SubCategoryStore } from './types';
import { backendHttpClient } from '@lib/helpers/httpClient';

import { logger } from '@lib/logger';
export const useSubCategoryStore = create<SubCategoryStore>()((set) => ({
  fetchAllSubCategories: async () => {
    try {
      const response = await backendHttpClient.get('/api/subcategories');
      const data: SubCategory[] = Array.isArray(response.data)
        ? response.data
        : response.data.subCategories || [];
      set({ subCategories: data });
    } catch (error) {
      logger.error('[SubCategoryStore] fetchAllSubCategories:', error);
      set({ subCategories: [] });
    }
  },
  subCategories: [],

  fetchSubCategoriesByCategoryId: async (categoryId: number) => {
    if (!categoryId) {
      logger.warn(
        '[SubCategoryStore] fetchSubCategoriesByCategoryId chamado sem categoryId.',
      );
      return;
    }

    try {
      const response = await backendHttpClient.get(
        `/api/subcategories/category/${categoryId}`,
      );

      const data: SubCategory[] = response.data;

      if (response.status !== 200) {
        throw new Error('Falha ao buscar subcategorias no servidor.');
      }

      set({ subCategories: data });
    } catch (error) {
      logger.error(
        `Falha ao buscar subcategorias para categoryId ${categoryId}:`,
        error,
      );
      set({ subCategories: [] }); // Limpa em caso de erro
    }
  },
}));
