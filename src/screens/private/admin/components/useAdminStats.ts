import { useCallback, useEffect, useState } from 'react';
import { AdminStats, getAdminStats } from '@api/admin';
import { getApiErrorMessage } from '@api/errors';

/** Carrega os indicadores do ano informado (ou do ano atual). */
export function useAdminStats(year?: number) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await getAdminStats(year));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar os dados.'));
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    void load();
  }, [load]);

  return { stats, loading, error, reload: load };
}
