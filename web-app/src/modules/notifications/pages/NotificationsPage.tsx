import React from 'react'
import { useNotificationStore } from '@store/index'
import './NotificationsPage.css'

const EmptyStateIllustration = () => (
  <svg viewBox="0 0 200 200" fill="none" className="empty-illustration" aria-hidden="true">
    <circle cx="100" cy="100" r="80" className="empty-illustration__halo" />
    <path d="M100 60C85 60 70 70 70 85v25l-10 15v10h80v-10l-10-15V85C130 70 115 60 100 60z" className="empty-illustration__bell" />
    <path d="M90 145h20c0 5.5-4.5 10-10 10s-10-4.5-10-10z" className="empty-illustration__clapper" />
    <circle cx="130" cy="70" r="12" className="empty-illustration__badge" />
    <path d="M125 70l4 4 6-6" className="empty-illustration__tick" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
)

const NotificationsPage: React.FC = () => {
  const notifications = useNotificationStore((state) => state.notifications)
  const clearAll = useNotificationStore((state) => state.clearAll)
  const removeNotification = useNotificationStore((state) => state.removeNotification)

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="notifications-header-left">
          <h1>Notifications</h1>
          {notifications.length > 0 && (
            <span className="notifications-count-badge">{notifications.length}</span>
          )}
        </div>

        <button
          type="button"
          className="notifications-clear-btn"
          onClick={clearAll}
          disabled={notifications.length === 0}
          title={notifications.length === 0 ? 'No notifications to clear' : 'Clear all notifications'}
          aria-label="Clear all notifications"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Clear All
        </button>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <EmptyStateIllustration />
            <h2>No notifications yet.</h2>
            <p>When you submit an application, document, or payment, your notifications will appear here.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className="notification-card">
              <div className="notification-icon">
                <DocumentIcon />
              </div>
              <div className="notification-content">
                <div className="notification-header-row">
                  <h3>{notification.title}</h3>
                  <div className="notification-meta-row">
                    <span className="timestamp">{notification.timestamp}</span>
                    <button
                      type="button"
                      className="notification-dismiss-btn"
                      onClick={() => removeNotification(notification.id)}
                      title="Dismiss notification"
                      aria-label={`Dismiss ${notification.title}`}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
                <p>{notification.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
