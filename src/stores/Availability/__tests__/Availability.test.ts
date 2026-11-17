import { backendHttpClient } from '@lib/helpers/httpClient';
import { useUserStore } from '@stores/User';
import { User } from '@stores/User/types';
import { AvailabilityItem, useAvailabilityStore } from '../Availability';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const http = backendHttpClient as unknown as Record<string, jest.Mock>;

const item = (id: number): AvailabilityItem => ({
  id,
  professional_id: 4,
  start_time: '09:00',
  end_time: '18:00',
  is_available: true,
  recurrence_pattern: 'weekly',
});

const user = { professional_id: 4 } as User;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  useUserStore.setState({ user: null });
  useAvailabilityStore.setState({ items: [], loading: false });
});

describe('AvailabilityStore', () => {
  it('nao busca sem profissional', async () => {
    await expect(useAvailabilityStore.getState().fetchList()).resolves.toEqual(
      [],
    );
    expect(http.get).not.toHaveBeenCalled();
    expect(useAvailabilityStore.getState().loading).toBe(false);
  });

  it('usa o profissional logado e aceita a lista embrulhada', async () => {
    useUserStore.setState({ user });
    http.get.mockResolvedValue({ data: { items: [item(1)] } });

    await expect(useAvailabilityStore.getState().fetchList()).resolves.toEqual([
      item(1),
    ]);
    expect(http.get).toHaveBeenCalledWith(
      '/api/professionals/4/availabilities',
    );
    expect(useAvailabilityStore.getState().items).toEqual([item(1)]);
  });

  it('prioriza o id explicito e devolve vazio na falha', async () => {
    useUserStore.setState({ user });
    http.get.mockRejectedValue(new Error('offline'));
    await expect(useAvailabilityStore.getState().fetchList(9)).resolves.toEqual(
      [],
    );
    expect(http.get).toHaveBeenCalledWith(
      '/api/professionals/9/availabilities',
    );
    expect(useAvailabilityStore.getState().loading).toBe(false);
  });

  it('busca um horario e devolve nulo se falhar', async () => {
    http.get.mockResolvedValueOnce({ data: item(2) });
    await expect(useAvailabilityStore.getState().getOne(4, 2)).resolves.toEqual(
      item(2),
    );
    expect(http.get).toHaveBeenCalledWith('/api/availabilities/2');

    http.get.mockRejectedValueOnce(new Error('offline'));
    await expect(
      useAvailabilityStore.getState().getOne(4, 3),
    ).resolves.toBeNull();
  });

  it('normaliza dias, horario e data antes de criar', async () => {
    const created = item(5);
    http.post.mockResolvedValue({ data: created });

    // O formulario manda Date, dias como boolean[] e dia do mes como texto.
    // O tipo publico do item nao descreve esse formato de entrada.
    const result = await useAvailabilityStore.getState().create(4, {
      days_array: [true, false, true, false, false, false, false],
      start_time: new Date(Date.UTC(2026, 0, 1, 8, 5)),
      end_time: '18:30:00',
      start_day: '05/07/2026',
      end_day: '',
      recurrence_pattern: 'none',
      start_day_of_month: '8',
      note: '',
    } as unknown as Partial<AvailabilityItem>);

    expect(result).toEqual(created);
    expect(http.post).toHaveBeenCalledWith(
      '/api/professionals/4/availabilities',
      {
        days_of_week: '1010000',
        start_time: '08:05',
        end_time: '18:30',
        start_day: '2026-07-05',
        recurrence_pattern: 'none',
        start_day_of_month: 8,
      },
    );
    expect(useAvailabilityStore.getState().items).toEqual([created]);
  });

  it('substitui o item atualizado e remove pelo id', async () => {
    useAvailabilityStore.setState({ items: [item(1), item(2)] });
    const updated = { ...item(2), start_time: '10:00' };
    http.put.mockResolvedValue({ data: updated });

    await expect(
      useAvailabilityStore.getState().update(4, 2, { start_time: '10:00' }),
    ).resolves.toEqual(updated);
    expect(http.put).toHaveBeenCalledWith('/api/availabilities/2', {
      start_time: '10:00',
    });
    expect(useAvailabilityStore.getState().items[1]).toEqual(updated);

    http.delete.mockResolvedValue({});
    await expect(useAvailabilityStore.getState().remove(4, 1)).resolves.toBe(
      true,
    );
    expect(useAvailabilityStore.getState().items).toEqual([updated]);
  });

  it('devolve nulo ou falso quando a escrita falha', async () => {
    useAvailabilityStore.setState({ items: [item(1)] });
    http.post.mockRejectedValue(new Error('offline'));
    http.put.mockRejectedValue(new Error('offline'));
    http.delete.mockRejectedValue(new Error('offline'));

    await expect(
      useAvailabilityStore.getState().create(4, { start_time: '09:00' }),
    ).resolves.toBeNull();
    await expect(
      useAvailabilityStore.getState().update(4, 1, { start_time: '10:00' }),
    ).resolves.toBeNull();
    await expect(useAvailabilityStore.getState().remove(4, 1)).resolves.toBe(
      false,
    );
    expect(useAvailabilityStore.getState().items).toEqual([item(1)]);
  });
});
