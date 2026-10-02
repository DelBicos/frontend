import { useState, useEffect } from 'react';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { SubCategory } from '@stores/SubCategory/types';
import { useCategoryStore } from '@stores/Category';

export const useServiceSearch = () => {
  const [allSubCategories, setAllSubCategories] = useState<SubCategory[]>([]);
  const [results, setResults] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { categories } = useCategoryStore();

  useEffect(() => {
    // Como a rota /api/subcategories geral deu 404, vamos buscar por categoria
    if (categories.length === 0) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const promises = categories.map((cat) =>
          backendHttpClient.get(`/api/subcategories/category/${cat.id}`),
        );
        const responses = await Promise.allSettled(promises);

        const combined: SubCategory[] = [];
        responses.forEach((result, index) => {
          if (
            result.status === 'fulfilled' &&
            Array.isArray(result.value.data)
          ) {
            const withCategoryId = result.value.data.map(
              (sub: SubCategory) => ({
                ...sub,
                categoryId: categories[index].id,
              }),
            );
            combined.push(...withCategoryId);
          }
        });

        setAllSubCategories(combined);
      } catch (error) {
        console.error('Erro ao buscar subcategorias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [categories]);

  const search = (term: string) => {
    if (!term || term.trim().length === 0) {
      setResults([]);
      return;
    }
    const lowerTerm = term.toLowerCase().trim();
    const filtered = allSubCategories
      .filter((sub) => sub.title.toLowerCase().includes(lowerTerm))
      .slice(0, 5);
    setResults(filtered);
  };

  return { results, search, setResults, loading };
};
