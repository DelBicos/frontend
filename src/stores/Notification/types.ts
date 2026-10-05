export type Notification = {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  createdAt: string;
  user_id: number;
  notification_type?: 'appointment' | 'service' | 'system' | 'general';
};

export type NotificationStore = {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  fetchNotifications: (userId: number, showLogs?: boolean) => Promise<void>;
  markAsRead: (notificationId: number, userId: number) => Promise<void>;
  markAllAsRead: (userId: number) => Promise<void>;
  clearNotifications: () => void;
};
