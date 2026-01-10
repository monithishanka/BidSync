import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { 
  IoCheckmarkDone, 
  IoTrash, 
  IoNotifications, 
  IoCheckmarkCircle,
  IoClose,
  IoChevronForward,
  IoRefresh,
  IoTrophy,
  IoDocument,
  IoAlertCircle,
  IoShieldCheckmark,
  IoPersonAdd,
  IoStar,
  IoMailOpen,
  IoCog
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import './Notifications.css';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.current, limit: 20 };
      if (filter === 'unread') params.unreadOnly = 'true';
      
      const response = await notificationAPI.getAll(params);
      setNotifications(response.data.notifications || []);
      setPagination(response.data.pagination || { current: 1, pages: 1, total: 0 });
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      'bid_received': <IoDocument className="notif-icon-bid" />,
      'bid_submitted': <IoCheckmarkCircle className="notif-icon-success" />,
      'tender_awarded': <IoTrophy className="notif-icon-award" />,
      'tender_lost': <IoClose className="notif-icon-danger" />,
      'tender_closed': <IoAlertCircle className="notif-icon-warning" />,
      'new_rfq': <IoDocument className="notif-icon-info" />,
      'kyc_approved': <IoShieldCheckmark className="notif-icon-success" />,
      'kyc_rejected': <IoClose className="notif-icon-danger" />,
      'account_approved': <IoPersonAdd className="notif-icon-success" />,
      'rating_received': <IoStar className="notif-icon-award" />,
      'private_invite': <IoMailOpen className="notif-icon-info" />,
      'system': <IoCog className="notif-icon-system" />
    };
    return iconMap[type] || <IoNotifications className="notif-icon-default" />;
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="notifications-page">
      <div className="container">
        {/* Header */}
        <div className="notifications-header">
          <div>
            <h1>Notifications</h1>
            <p>{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
          </div>
          <div className="notifications-actions">
            <button 
              className="btn btn-ghost btn-sm"
              onClick={fetchNotifications}
              title="Refresh"
            >
              <IoRefresh size={18} />
            </button>
            {unreadCount > 0 && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleMarkAllAsRead}
              >
                <IoCheckmarkDone size={18} />
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="notifications-tabs">
          <button 
            className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`tab-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread {unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
          </button>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {loading ? (
            <>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="notification-skeleton">
                  <div className="skeleton-icon"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line w-75"></div>
                    <div className="skeleton-line w-50"></div>
                  </div>
                </div>
              ))}
            </>
          ) : notifications.length > 0 ? (
            notifications.map(notification => (
              <div 
                key={notification._id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <h4 className="notification-title">{notification.title}</h4>
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">{formatTime(notification.createdAt)}</span>
                </div>
                <div className="notification-actions">
                  {!notification.isRead && (
                    <button 
                      className="notif-action-btn"
                      onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification._id); }}
                      title="Mark as read"
                    >
                      <IoCheckmarkCircle size={18} />
                    </button>
                  )}
                  <button 
                    className="notif-action-btn notif-delete-btn"
                    onClick={(e) => { e.stopPropagation(); handleDelete(notification._id); }}
                    title="Delete"
                  >
                    <IoTrash size={16} />
                  </button>
                  {notification.actionUrl && (
                    <IoChevronForward className="notification-arrow" size={18} />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="notifications-empty">
              <IoNotifications size={48} />
              <h3>No notifications</h3>
              <p>
                {filter === 'unread' 
                  ? "You've read all your notifications" 
                  : "You don't have any notifications yet"}
              </p>
              {filter === 'unread' && (
                <button className="btn btn-secondary" onClick={() => setFilter('all')}>
                  View all notifications
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="notifications-pagination">
            <span className="pagination-info">
              Page {pagination.current} of {pagination.pages}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
