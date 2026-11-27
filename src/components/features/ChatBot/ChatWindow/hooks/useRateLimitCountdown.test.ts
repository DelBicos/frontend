import { act, renderHook } from '@testing-library/react-native';
import { useRateLimitCountdown } from './useRateLimitCountdown';

describe('useRateLimitCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-11-26T12:00:00.000Z'));
  });

  afterEach(() => jest.useRealTimers());

  it('deve ficar em zero sem limite ativo', () => {
    const clear = jest.fn();
    const { result } = renderHook(() => useRateLimitCountdown(null, clear));

    expect(result.current).toBe(0);
    expect(clear).not.toHaveBeenCalled();
  });

  it('deve contar os segundos e limpar o limite ao terminar', () => {
    const clear = jest.fn();
    const resetAt = Date.now() + 2_500;
    const { result } = renderHook(() => useRateLimitCountdown(resetAt, clear));

    expect(result.current).toBe(3);

    act(() => jest.advanceTimersByTime(1_000));
    expect(result.current).toBe(2);

    act(() => jest.advanceTimersByTime(2_000));
    expect(result.current).toBe(0);
    expect(clear).toHaveBeenCalled();
  });

  it('deve voltar a zero quando o limite é removido', () => {
    const clear = jest.fn();
    const { result, rerender } = renderHook(
      ({ resetAt }: { resetAt: number | null }) =>
        useRateLimitCountdown(resetAt, clear),
      { initialProps: { resetAt: Date.now() + 5_000 } },
    );
    expect(result.current).toBe(5);

    rerender({ resetAt: null });

    expect(result.current).toBe(0);
  });
});
