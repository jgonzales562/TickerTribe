// Custom hook for managing notifications

import { useState, useCallback } from 'react';
import type { Notification, Trade } from '../types/dashboard';
import { autoDismissNotification } from '../utils/notifications';
import { FADE_DURATION } from '../constants/dashboard';

export const useNotifications = (playNotificationSound: () => void) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (trade: Trade, customMessage?: string) => {
      const notification: Notification = {
        id: Date.now(),
        trade: customMessage ? { ...trade, notes: customMessage } : trade,
        isVisible: true,
      };
      setNotifications((prev) => [...prev, notification]);
      playNotificationSound();
      autoDismissNotification(notification.id, setNotifications);
    },
    [playNotificationSound]
  );

  const dismissNotification = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isVisible: false } : n))
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, FADE_DURATION);
  }, []);

  return {
    notifications,
    addNotification,
    dismissNotification,
  };
};
