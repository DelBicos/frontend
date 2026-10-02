import { useState, useEffect, useCallback } from 'react';
import { checkForNewNotifications } from '@lib/helpers/notifications';

interface UseNotificationsReturn {
  checkNotifications: () => Promise<void>;
  isLoading: boolean;
  lastChecked: Date;
  hasNewNotifications: boolean;
  error: string | null;
}

export const useNotifications = (
  userId: string,
  pollingInterval: number = 30000,
): UseNotificationsReturn => {
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasNewNotifications, setHasNewNotifications] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkNotifications = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const hasNew = await checkForNewNotifications(userId, lastChecked);
      setHasNewNotifications(hasNew);

      if (hasNew) {
        setLastChecked(new Date());
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro no checkNotifications:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId, lastChecked, isLoading]);

  useEffect(() => {
    // Não executa se não houver userId
    if (!userId) {
      return;
    }

    checkNotifications();

    const interval = setInterval(checkNotifications, pollingInterval);

    return () => {
      clearInterval(interval);
    };
  }, [checkNotifications, pollingInterval, userId]);

  return {
    checkNotifications,
    isLoading,
    lastChecked,
    hasNewNotifications,
    error,
  };
};
