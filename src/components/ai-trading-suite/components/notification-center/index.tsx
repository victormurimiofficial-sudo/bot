import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { aiTradingStore } from '../../store/ai-trading-store';
import { TAiNotification } from '../../store/types';

const formatTime = (ts: number): string => {
    const diff = Date.now() - ts;
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
};

const NotificationRow: React.FC<{ notification: TAiNotification }> = observer(({ notification }) => {
    const handleRead = useCallback(() => {
        aiTradingStore.markNotificationRead(notification.id);
    }, [notification.id]);

    return (
        <div
            className={`ats-notif-row ats-notif-row--${notification.priority.toLowerCase()} ${!notification.read ? 'ats-notif-row--unread' : ''}`}
            onClick={handleRead}
            role='button'
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleRead()}
            aria-label={notification.title}
        >
            <div className='ats-notif-row__indicator' />
            <div className='ats-notif-row__body'>
                <div className='ats-notif-row__header'>
                    <span className='ats-notif-row__title'>{notification.title}</span>
                    <span className='ats-notif-row__time'>{formatTime(notification.timestamp)}</span>
                </div>
                <span className='ats-notif-row__message'>{notification.message}</span>
                <span className={`ats-priority-chip ats-priority-chip--${notification.priority.toLowerCase()}`}>
                    {notification.priority}
                </span>
            </div>
        </div>
    );
});

const NotificationCenter: React.FC = observer(() => {
    const { notifications, unreadCount } = aiTradingStore;

    return (
        <div className='ats-notification-center'>
            <div className='ats-notif-header'>
                <div className='ats-notif-title'>
                    🔔 Notification Center
                    {unreadCount > 0 && (
                        <span className='ats-notif-badge'>{unreadCount} new</span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        className='ats-mark-all-read'
                        onClick={() => aiTradingStore.markAllNotificationsRead()}
                    >
                        Mark all read
                    </button>
                )}
            </div>

            <div className='ats-notif-legend'>
                <div className='ats-notif-legend__item ats-notif-legend__item--high'>High Priority</div>
                <div className='ats-notif-legend__item ats-notif-legend__item--medium'>Medium</div>
                <div className='ats-notif-legend__item ats-notif-legend__item--low'>Low</div>
            </div>

            {notifications.length === 0 ? (
                <div className='ats-empty'>No notifications yet — monitoring markets...</div>
            ) : (
                <div className='ats-notif-feed'>
                    {notifications.map(n => (
                        <NotificationRow key={n.id} notification={n} />
                    ))}
                </div>
            )}
        </div>
    );
});

export default NotificationCenter;
