// Notification helper functions

import { NOTIFICATION_TIMEOUT, FADE_DURATION } from '../constants/dashboard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SetNotificationsFunc = React.Dispatch<React.SetStateAction<any[]>>;

// Auto-dismiss a notification after a timeout
export const autoDismissNotification = (
  notificationId: number,
  setNotifications: SetNotificationsFunc
) => {
  setTimeout(() => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, isVisible: false } : n
      )
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    }, FADE_DURATION);
  }, NOTIFICATION_TIMEOUT);
};
