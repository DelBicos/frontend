import { useCallback, useRef, useState } from 'react';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { SubCategory } from '@stores/SubCategory/types';

const MAX_RESULTS = 5;

// Cache compartilhado entre telas: a lista de subcategorias muda raramente.
let cache: SubCategory[] | null = null;
let inFlight: Promise<SubCategory[]> | null = null;

/** Carrega todas as subcategorias com uma unica requisicao (e so uma vez). */
export function loadAllSubCategories(): Promise<SubCategory[]> {
  if (cache) return Promise.resolve(cache);
  if (!inFlight) {
    inFlight = backendHttpClient
      .get<SubCategory[]>('/api/subcategories')
      .then(({ data }) => {
        cache = Array.isArray(data) ? data : [];
        return cache;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

/** Apenas para testes. */
export function resetSubCategoryCache() {
  cache = null;
  inFlight = null;
}

/** Minusculas e sem acentos, para "eletrica" encontrar "Elétrica". */
export function normalizeSearchText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function filterSubCategories(
  all: SubCategory[],
  term: string,
  limit = MAX_RESULTS,
): SubCategory[] {
  const needle = normalizeSearchText(term);
  if (!needle) return [];
  return all
    .filter((sub) => normalizeSearchText(sub.title).includes(needle))
    .slice(0, limit);
}

/**
 * Autocomplete de servicos (subcategorias). A lista so e buscada quando a
 * pessoa comeca a digitar, evitando requisicoes em toda abertura da pagina.
 */
export const useServiceSearch = () => {
  const [results, setResults] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const lastTerm = useRef('');

  const search = useCallback((term: string) => {
    lastTerm.current = term;
    if (!term || term.trim().length === 0) {
      setResults([]);
      return;
    }
    if (cache) {
      setResults(filterSubCategories(cache, term));
      return;
    }
    setLoading(true);
    loadAllSubCategories()
      .then((all) => {
        // Ignora respostas de termos ja substituidos pela digitacao.
        if (lastTerm.current === term) {
          setResults(filterSubCategories(all, term));
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar subcategorias:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  return { results, search, setResults, loading };
};
