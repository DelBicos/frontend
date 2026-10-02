import { useState, useCallback, useRef, useEffect } from 'react';

interface UsePaginationOptions<T> {
  fetchData: (page: number, limit: number) => Promise<T[]>;
  limit?: number;
}

export function usePagination<T>({
  fetchData,
  limit = 12,
}: UsePaginationOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadInitial = async () => {
      setLoadingInitial(true);
      setHasMore(true);
      setPage(0);
      try {
        const result = await fetchData(0, limit);
        if (mounted) {
          setData(result);
          if (result.length < limit) setHasMore(false);
        }
      } catch (err) {
        console.error('Pagination Error:', err);
        if (mounted) setHasMore(false);
      } finally {
        if (mounted) setLoadingInitial(false);
      }
    };
    loadInitial();
    return () => {
      mounted = false;
    };
  }, [fetchData, limit]);

  const loadNextPage = useCallback(async () => {
    if (loadingMore || !hasMore || loadingInitial) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const result = await fetchData(nextPage, limit);
      if (result.length > 0) {
        setData((prev) => {
          const existingIds = new Set(prev.map((p: any) => p.id));
          const unique = result.filter((p: any) => !existingIds.has(p.id));
          return [...prev, ...unique];
        });
        setPage(nextPage);
        if (result.length < limit) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, loadingInitial, page, fetchData, limit]);

  const onEndReached = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!loadingMore && hasMore && !loadingInitial) {
      debounceRef.current = setTimeout(loadNextPage, 300);
    }
  }, [loadNextPage, loadingMore, hasMore, loadingInitial]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { data, loadingInitial, loadingMore, hasMore, onEndReached };
}
