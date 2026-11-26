import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { logger } from '@lib/logger';
import {
  checkForNewNotifications,
  scheduleLocalNotification,
  setupNotifications,
} from '../usePushNotifications';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));
jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn() },
}));
jest.mock('@lib/logger', () => ({ logger: { error: jest.fn() } }));

const notifications = Notifications as unknown as Record<string, jest.Mock>;
const http = backendHttpClient as unknown as Record<string, jest.Mock>;

// Capturado antes do clearAllMocks: o handler e registrado na importacao.
const handlerCall = notifications.setNotificationHandler.mock.calls[0];

const previousOS = Platform.OS;
const setOS = (os: string) =>
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });

type WebNotificationMock = jest.Mock & {
  permission: string;
  requestPermission: jest.Mock;
};

const g = global as unknown as { window?: unknown; Notification?: unknown };
const originalWindow = g.window;
const originalNotification = g.Notification;

const installWebNotification = (permission: string) => {
  const close = jest.fn();
  const ctor = jest.fn(() => ({ close })) as WebNotificationMock;
  ctor.permission = permission;
  ctor.requestPermission = jest.fn(async () => permission);
  g.Notification = ctor;
  g.window = { Notification: ctor };
  return { ctor, close };
};

beforeEach(() => jest.clearAllMocks());

afterEach(() => {
  setOS(previousOS);
  g.window = originalWindow;
  g.Notification = originalNotification;
  jest.useRealTimers();
});

describe('handler de notificacoes', () => {
  it('mostra alerta, som e badge; banner e lista so no iOS', async () => {
    const [{ handleNotification }] = handlerCall as [
      { handleNotification: () => Promise<Record<string, boolean>> },
    ];
    setOS('ios');
    await expect(handleNotification()).resolves.toEqual({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    });
    setOS('android');
    await expect(handleNotification()).resolves.toMatchObject({
      shouldShowBanner: false,
      shouldShowList: false,
    });
  });
});

describe('setupNotifications', () => {
  it('no app devolve o token quando a permissao e concedida', async () => {
    setOS('ios');
    notifications.requestPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });
    notifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'tok' });
    await expect(setupNotifications()).resolves.toEqual({ data: 'tok' });
  });

  it('no app devolve null sem permissao', async () => {
    setOS('android');
    notifications.requestPermissionsAsync.mockResolvedValue({
      status: 'denied',
    });
    await expect(setupNotifications()).resolves.toBeNull();
    expect(notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it('no web pede permissao ao navegador', async () => {
    setOS('web');
    installWebNotification('granted');
    await expect(setupNotifications()).resolves.toBe('web-notification');

    installWebNotification('denied');
    await expect(setupNotifications()).resolves.toBeNull();
  });

  it('no web sem suporte a notificacoes devolve null', async () => {
    setOS('web');
    g.window = {};
    await expect(setupNotifications()).resolves.toBeNull();
  });
});

describe('scheduleLocalNotification', () => {
  it('no app agenda uma notificacao imediata', async () => {
    setOS('ios');
    await scheduleLocalNotification('Oi', 'Corpo');
    expect(notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: { title: 'Oi', body: 'Corpo', sound: 'default' },
      trigger: null,
    });
  });

  it('registra o erro quando o agendamento falha', async () => {
    setOS('ios');
    notifications.scheduleNotificationAsync.mockRejectedValue(new Error('x'));
    await expect(scheduleLocalNotification('Oi', 'Corpo')).resolves.toBe(
      undefined,
    );
    expect(logger.error).toHaveBeenCalled();
  });

  it('no web mostra e fecha a notificacao depois de 5 segundos', async () => {
    jest.useFakeTimers();
    setOS('web');
    const { ctor, close } = installWebNotification('granted');

    await scheduleLocalNotification('Oi', 'Corpo');

    expect(ctor).toHaveBeenCalledWith('Oi', {
      body: 'Corpo',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
    jest.advanceTimersByTime(5000);
    expect(close).toHaveBeenCalled();
    expect(notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('no web sem permissao nao mostra nada', async () => {
    setOS('web');
    const { ctor } = installWebNotification('denied');
    await scheduleLocalNotification('Oi', 'Corpo');
    expect(ctor).not.toHaveBeenCalled();
  });
});

describe('checkForNewNotifications', () => {
  const desde = new Date('2026-01-10T00:00:00Z');

  it('agenda apenas as nao lidas posteriores a ultima verificacao', async () => {
    setOS('ios');
    http.get.mockResolvedValue({
      data: [
        {
          title: 'Nova',
          message: 'm1',
          is_read: false,
          createdAt: '2026-01-11',
        },
        {
          title: 'Lida',
          message: 'm2',
          is_read: true,
          createdAt: '2026-01-11',
        },
        {
          title: 'Antiga',
          message: 'm3',
          is_read: false,
          createdAt: '2026-01-01',
        },
      ],
    });

    await expect(checkForNewNotifications('7', desde)).resolves.toBe(true);
    expect(http.get).toHaveBeenCalledWith('/api/notifications/7');
    expect(notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: 'Nova', body: 'm1' }),
      }),
    );
  });

  it('retorna false sem novidades', async () => {
    http.get.mockResolvedValue({ data: [] });
    await expect(checkForNewNotifications('7', desde)).resolves.toBe(false);
  });

  it('retorna false em erro e so registra quando showLogs e verdadeiro', async () => {
    http.get.mockRejectedValue(new Error('401'));
    await expect(checkForNewNotifications('7', desde)).resolves.toBe(false);
    expect(logger.error).not.toHaveBeenCalled();

    await expect(checkForNewNotifications('7', desde, true)).resolves.toBe(
      false,
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Erro ao verificar notificações:',
      expect.any(Error),
    );
  });
});
