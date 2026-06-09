import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Notification({ notifications, onDismiss }) {
  return (
    <div className="notification-stack">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function NotificationItem({ notification, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(notification.id), 4000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const isSuccess = notification.type === 'success';

  return (
    <div className={`notification ${isSuccess ? 'notification--success' : 'notification--error'}`}>
      <div className="notification-icon">
        {isSuccess ? <CheckCircle size={18} /> : <XCircle size={18} />}
      </div>
      <p className="notification-msg">{notification.message}</p>
      <button
        className="notification-close"
        onClick={() => onDismiss(notification.id)}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
