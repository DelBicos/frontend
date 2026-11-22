import { useState, useEffect } from 'react';

/**
 * Gerencia o countdown exibido quando o backend retorna 429 com RateLimit-Reset.
 * Zera `rateLimitResetAt` via callback quando o tempo esgota.
 */
export function useRateLimitCountdown(
  rateLimitResetAt: number | null,
  clearRateLimitReset: () => void,
): number {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!rateLimitResetAt) {
      setCountdown(0);
      return;
    }

    const update = () => {
      const secs = Math.ceil((rateLimitResetAt - Date.now()) / 1000);
      if (secs <= 0) {
        setCountdown(0);
        clearRateLimitReset();
      } else {
        setCountdown(secs);
      }
    };

    update();
    const interval = setInterval(update, 1_000);
    return () => clearInterval(interval);
  }, [rateLimitResetAt, clearRateLimitReset]);

  return countdown;
}
