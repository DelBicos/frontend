import { create } from 'zustand';
import { Category, CategoryStore } from './types';
import { backendHttpClient } from '@lib/helpers/httpClient';

export const useCategoryStore = create<CategoryStore>()((set) => ({
  categories: [],

  fetchCategories: async () => {
    try {
      const response = await backendHttpClient.get('/api/categories');

      const data: Category[] = response.data;

      if (response.status !== 200) {
        throw new Error('Falha ao buscar categorias no servidor.');
      }

      set({ categories: data });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  },
}));
