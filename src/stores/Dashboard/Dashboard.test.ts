// @ts-nocheck
/// <reference types="jest" />

import { useDashboardStore } from '@stores/Dashboard';
import { backendHttpClient } from '@lib/helpers/httpClient';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: {
    get: jest.fn(),
  },
}));

// use require here because jest.mock is hoisted; silence TS about require
// @ts-ignore

describe('dashboard store', () => {
  beforeEach(() => {
    // reset store state
    useDashboardStore.getState().clear();
    jest.resetAllMocks();
  });

  it('fetchKpis stores kpis when backend returns data', async () => {
    (backendHttpClient.get as jest.Mock).mockResolvedValueOnce({
      data: { totalServices: 5, totalEarnings: 123.45, avgRating: 4.2 },
    });

    await useDashboardStore.getState().fetchKpis();

    const state = useDashboardStore.getState();
    expect(state.kpis).not.toBeNull();
    expect(state.kpis?.totalServices).toBe(5);
    expect(state.kpis?.totalEarnings).toBeCloseTo(123.45);
  });

  it('fetchEarnings stores earnings array', async () => {
    const sample = [{ month: '10-2025', total: 100 }];
    const expected = [
      { month: '10-2025', total: 100, parsedDate: '2025-10-01' },
    ];
    (backendHttpClient.get as jest.Mock).mockResolvedValueOnce({
      data: sample,
    });

    await useDashboardStore
      .getState()
      .fetchEarnings('2025-10-01', '2025-10-31');

    const state = useDashboardStore.getState();
    expect(state.earnings).toEqual(expected);
  });
});
