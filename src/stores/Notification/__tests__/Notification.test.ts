import { backendHttpClient } from '@lib/helpers/httpClient';
import { useNotificationStore } from '../Notification';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), patch: jest.fn() },
}));

const http = backendHttpClient as unknown as Record<string, jest.Mock>;
const notification = (id: number, isRead = false) =>
  ({
    id,
    title: `N${id}`,
    message: '',
    is_read: isRead,
    createdAt: '2026-01-01',
  }) as any;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  useNotificationStore.getState().clearNotifications();
});

describe('NotificationStore', () => {
  it('carrega notificacoes do usuario', async () => {
    http.get.mockResolvedValue({ data: [notification(1)] });
    await useNotificationStore.getState().fetchNotifications(7);
    expect(http.get).toHaveBeenCalledWith('/api/notifications/7');
    expect(useNotificationStore.getState().notifications).toHaveLength(1);
  });

  it('registra erro ao falhar', async () => {
    http.get.mockRejectedValue(new Error('401'));
    await useNotificationStore.getState().fetchNotifications(7);
    expect(useNotificationStore.getState()).toMatchObject({
      loading: false,
      error: 'Erro ao carregar notificações.',
    });
  });

  it('marca como lida apenas notificacoes nao lidas', async () => {
    useNotificationStore.setState({
      notifications: [notification(1), notification(2, true)],
    });
    http.patch.mockResolvedValue({});

    await useNotificationStore.getState().markAsRead(2, 7);
    expect(http.patch).not.toHaveBeenCalled();

    await useNotificationStore.getState().markAsRead(1, 7);
    expect(http.patch).toHaveBeenCalledWith('/api/notifications/1/read/7');
    expect(useNotificationStore.getState().notifications[0].is_read).toBe(true);
  });

  it('lanca erro amigavel se o servidor falhar ao marcar', async () => {
    useNotificationStore.setState({ notifications: [notification(1)] });
    http.patch.mockRejectedValue(new Error('500'));
    await expect(
      useNotificationStore.getState().markAsRead(1, 7),
    ).rejects.toThrow(/marcar a notifica/);
  });
});
