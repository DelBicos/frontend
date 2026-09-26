import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { useUserStore } from '@stores/User';
import { useNotificationStore, Notification } from '@stores/Notification';
import Chip, { ChipGroup } from '@components/ui/Chip';
import ActionButton from '@components/ui/ActionButton';
import EmptyState from '@components/ui/EmptyState';
import InlineAlert from '@components/ui/InlineAlert';
import { formatDayLabel, isSameDay } from '@lib/appointments';
import ProfilePage from '../../components/ProfilePage';
import { createStyles } from './styles';

const TYPE_ICON: Record<
  string,
  React.ComponentProps<typeof FontAwesome>['name']
> = {
  appointment: 'calendar',
  service: 'wrench',
  system: 'bell',
  general: 'bell',
};

const pad = (n: number) => String(n).padStart(2, '0');
const timeOf = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Avisos do app, agrupados por dia; tocar abre o texto e marca como lido. */
const NotificacoesContent: React.FC = () => {
  const colors = useColors();
  const styles = createStyles(colors);
  const { user } = useUserStore();
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (user?.id) fetchNotifications(user.id, false);
  }, [user?.id, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const groups = useMemo(() => {
    const list = [...notifications]
      .filter((n) => filter === 'all' || !n.is_read)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    const result: { label: string; items: Notification[] }[] = [];
    list.forEach((n) => {
      const last = result[result.length - 1];
      if (
        last &&
        isSameDay(new Date(last.items[0].createdAt), new Date(n.createdAt))
      ) {
        last.items.push(n);
      } else {
        result.push({ label: formatDayLabel(n.createdAt), items: [n] });
      }
    });
    return result;
  }, [notifications, filter]);

  const toggle = async (item: Notification) => {
    setExpanded((current) => (current === item.id ? null : item.id));
    if (!item.is_read && user?.id) {
      try {
        await markAsRead(item.id, user.id);
      } catch {
        // Continua legivel mesmo se nao marcar como lida.
      }
    }
  };

  const readAll = async () => {
    if (!user?.id) return;
    setMarkingAll(true);
    setActionError(null);
    try {
      await markAllAsRead(user.id);
    } catch {
      setActionError('Não foi possível marcar todas como lidas.');
    } finally {
      setMarkingAll(false);
    }
  };

  let body: React.ReactNode;
  if (loading && notifications.length === 0) {
    body = (
      <ActivityIndicator
        size="large"
        color={colors.primaryBlack}
        style={styles.loading}
      />
    );
  } else if (error && notifications.length === 0) {
    body = (
      <EmptyState
        icon="exclamation-circle"
        title="Algo deu errado"
        text={error}>
        <ActionButton
          label="Tentar de novo"
          variant="secondary"
          onPress={() => user?.id && fetchNotifications(user.id, false)}
        />
      </EmptyState>
    );
  } else if (groups.length === 0) {
    body = (
      <EmptyState
        icon="bell-o"
        title={filter === 'unread' ? 'Tudo lido' : 'Nenhuma notificação'}
        text={
          filter === 'unread'
            ? 'Você não tem notificações novas.'
            : 'Avisos sobre seus agendamentos e pagamentos aparecem aqui.'
        }
      />
    );
  } else {
    body = groups.map((group) => (
      <View key={group.label} style={styles.group}>
        <Text
          style={styles.groupLabel}
          accessibilityRole="header"
          {...({ 'aria-level': 2 } as object)}>
          {group.label}
        </Text>
        <View style={styles.list}>
          {group.items.map((item, i) => {
            const isOpen = expanded === item.id;
            const unread = !item.is_read;
            return (
              <Pressable
                key={item.id}
                onPress={() => toggle(item)}
                style={({ pressed, hovered }: any) => [
                  styles.item,
                  i > 0 && styles.itemDivider,
                  (pressed || hovered) && styles.itemPressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                accessibilityLabel={`${unread ? 'Não lida. ' : ''}${item.title}`}>
                <View style={styles.icon}>
                  <FontAwesome
                    name={
                      TYPE_ICON[item.notification_type ?? 'general'] ?? 'bell'
                    }
                    size={16}
                    color={colors.primaryBlack}
                  />
                </View>
                <View style={styles.texts}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[styles.title, unread && styles.titleUnread]}
                      numberOfLines={isOpen ? undefined : 1}>
                      {item.title}
                    </Text>
                    <Text style={styles.time}>{timeOf(item.createdAt)}</Text>
                  </View>
                  <Text
                    style={styles.message}
                    numberOfLines={isOpen ? undefined : 2}>
                    {item.message}
                  </Text>
                </View>
                {unread ? (
                  <View style={styles.dot} accessibilityElementsHidden />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    ));
  }

  return (
    <ProfilePage
      title="Notificações"
      subtitle="Toque em um aviso para ler o texto completo."
      action={
        unreadCount > 0 ? (
          <ActionButton
            label="Marcar todas como lidas"
            icon="check"
            variant="secondary"
            size="sm"
            onPress={readAll}
            loading={markingAll}
          />
        ) : null
      }>
      {notifications.length > 0 ? (
        <ChipGroup
          accessibilityLabel="Filtrar notificações"
          style={styles.chips}>
          <Chip
            label="Todas"
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <Chip
            label={`Não lidas (${unreadCount})`}
            selected={filter === 'unread'}
            onPress={() => setFilter('unread')}
          />
        </ChipGroup>
      ) : null}
      {actionError ? <InlineAlert>{actionError}</InlineAlert> : null}
      {body}
    </ProfilePage>
  );
};

export default NotificacoesContent;
