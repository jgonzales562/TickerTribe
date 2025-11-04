// Notification display component

import type React from 'react';
import type { Notification } from '../types/dashboard';
import { formatCurrency } from '../utils/dashboard';

interface NotificationListProps {
  notifications: Notification[];
  onDismiss: (id: number) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onDismiss,
}) => {
  return (
    <div className='notifications-container'>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification ${
            notification.isVisible ? 'visible' : 'hidden'
          }`}
        >
          <div className='notification-header'>
            <span className='notification-icon'>🔔</span>
            <span className='notification-title'>New Trade Alert</span>
            <button
              className='notification-close'
              onClick={() => onDismiss(notification.id)}
            >
              ✕
            </button>
          </div>
          <div className='notification-body'>
            <div className='notification-trade-info'>
              <span
                className={`notification-action ${notification.trade.action.toLowerCase()}`}
              >
                {notification.trade.action}
              </span>
              <span className='notification-ticker'>
                {notification.trade.ticker}
              </span>
            </div>
            <div className='notification-details'>
              {notification.trade.quantity} shares @{' '}
              {formatCurrency(notification.trade.price)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
