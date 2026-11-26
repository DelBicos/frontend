import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import NotificacoesContent from '../NotificacoesContent';
import { useNotificationStore, Notification } from '@stores/Notification';
import { useUserStore } from '@stores/User';
import type { User } from '@stores/User/types';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

const HOUR = 60 * 60 * 1000;
const at = (ms: number) => new Date(Date.now() - ms).toISOString();

const makeNotification = (
  overrides: Partial<Notification> = {},
): Notification => ({
  id: 1,
  title: 'Agendamento confirmado',
  message: 'Seu serviço foi confirmado.',
  is_read: false,
  createdAt: at(0),
  user_id: 31,
  notification_type: 'appointment',
  ...overrides,
});

describe('NotificacoesContent', () => {
  const mockFetch = jest.fn();
  const mockMarkAsRead = jest.fn();
  const mockMarkAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useUserStore.setState({ user: { id: 31 } as unknown as User });
    useNotificationStore.setState({
      notifications: [],
      loading: false,
      error: null,
      fetchNotifications: mockFetch,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAll,
    });
  });

  it('deve buscar as notificações do usuário ao abrir', () => {
    render(<NotificacoesContent />);
    expect(mockFetch).toHaveBeenCalledWith(31, false);
  });

  it('não deve buscar sem usuário', () => {
    useUserStore.setState({ user: null });
    render(<NotificacoesContent />);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('deve mostrar o carregamento sem notificações', () => {
    useNotificationStore.setState({ loading: true });
    const { UNSAFE_queryByType } = render(<NotificacoesContent />);
    expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
  });

  it('deve mostrar o erro e tentar de novo', () => {
    useNotificationStore.setState({ error: 'Falha ao carregar' });
    const { getByText } = render(<NotificacoesContent />);

    expect(getByText('Falha ao carregar')).toBeTruthy();
    fireEvent.press(getByText('Tentar de novo'));
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('deve mostrar o estado vazio sem filtros', () => {
    const { getByText, queryByText } = render(<NotificacoesContent />);

    expect(getByText('Nenhuma notificação')).toBeTruthy();
    expect(queryByText('Todas')).toBeNull();
    expect(queryByText('Marcar todas como lidas')).toBeNull();
  });

  it('deve agrupar por dia, do mais novo para o mais antigo', () => {
    useNotificationStore.setState({
      notifications: [
        makeNotification({ id: 1, title: 'Antiga', createdAt: at(72 * HOUR) }),
        makeNotification({ id: 2, title: 'Nova', createdAt: at(0) }),
        makeNotification({
          id: 3,
          title: 'Também hoje',
          createdAt: at(1000),
          notification_type: undefined,
        }),
        makeNotification({
          id: 4,
          title: 'Outro tipo',
          createdAt: at(2000),
          notification_type: 'desconhecido' as never,
        }),
      ],
    });
    const { getByText, getAllByRole } = render(<NotificacoesContent />);

    expect(getByText('Hoje')).toBeTruthy();
    const items = getAllByRole('button').filter((b) =>
      String(b.props.accessibilityLabel).startsWith('Não lida'),
    );
    expect(items.map((b) => b.props.accessibilityLabel)).toEqual([
      'Não lida. Nova',
      'Não lida. Também hoje',
      'Não lida. Outro tipo',
      'Não lida. Antiga',
    ]);
  });

  it('deve abrir a notificação e marcar como lida', async () => {
    useNotificationStore.setState({ notifications: [makeNotification()] });
    const { getByLabelText } = render(<NotificacoesContent />);

    const item = getByLabelText('Não lida. Agendamento confirmado');
    fireEvent.press(item);

    await waitFor(() => expect(mockMarkAsRead).toHaveBeenCalledWith(1, 31));
    expect(
      getByLabelText('Não lida. Agendamento confirmado').props
        .accessibilityState,
    ).toEqual({ expanded: true });

    fireEvent.press(getByLabelText('Não lida. Agendamento confirmado'));
    expect(
      getByLabelText('Não lida. Agendamento confirmado').props
        .accessibilityState,
    ).toEqual({ expanded: false });
  });

  it('deve continuar legível se marcar como lida falhar', async () => {
    mockMarkAsRead.mockRejectedValue(new Error('rede'));
    useNotificationStore.setState({ notifications: [makeNotification()] });
    const { getByLabelText, getByText } = render(<NotificacoesContent />);

    fireEvent.press(getByLabelText('Não lida. Agendamento confirmado'));

    await waitFor(() => expect(mockMarkAsRead).toHaveBeenCalled());
    expect(getByText('Seu serviço foi confirmado.')).toBeTruthy();
  });

  it('não deve marcar de novo uma notificação já lida', () => {
    useNotificationStore.setState({
      notifications: [makeNotification({ is_read: true })],
    });
    const { getByLabelText } = render(<NotificacoesContent />);

    fireEvent.press(getByLabelText('Agendamento confirmado'));
    expect(mockMarkAsRead).not.toHaveBeenCalled();
  });

  it('deve filtrar as não lidas e mostrar "Tudo lido"', () => {
    useNotificationStore.setState({
      notifications: [
        makeNotification({ id: 1, title: 'Lida', is_read: true }),
        makeNotification({ id: 2, title: 'Pendente' }),
      ],
    });
    const { getByText, queryByText } = render(<NotificacoesContent />);

    fireEvent.press(getByText('Não lidas (1)'));
    expect(queryByText('Lida')).toBeNull();
    expect(getByText('Pendente')).toBeTruthy();

    fireEvent.press(getByText('Todas'));
    expect(getByText('Lida')).toBeTruthy();

    act(() => {
      useNotificationStore.setState({
        notifications: [
          makeNotification({ id: 1, title: 'Lida', is_read: true }),
        ],
      });
    });
    fireEvent.press(getByText('Não lidas (0)'));
    expect(getByText('Tudo lido')).toBeTruthy();
  });

  it('deve marcar todas como lidas', async () => {
    mockMarkAll.mockResolvedValue(undefined);
    useNotificationStore.setState({ notifications: [makeNotification()] });
    const { getByText } = render(<NotificacoesContent />);

    fireEvent.press(getByText('Marcar todas como lidas'));

    await waitFor(() => expect(mockMarkAll).toHaveBeenCalledWith(31));
  });

  it('deve mostrar o erro ao marcar todas', async () => {
    mockMarkAll.mockRejectedValue(new Error('rede'));
    useNotificationStore.setState({ notifications: [makeNotification()] });
    const { getByText, findByText } = render(<NotificacoesContent />);

    fireEvent.press(getByText('Marcar todas como lidas'));

    expect(
      await findByText('Não foi possível marcar todas como lidas.'),
    ).toBeTruthy();
  });
});
