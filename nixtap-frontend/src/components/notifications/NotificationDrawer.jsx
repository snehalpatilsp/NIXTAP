import React, { useState, useEffect, useRef } from 'react';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../../api/adminNotificationService';

const NotificationDrawer = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotificationsData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotificationsData = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      const list = res?.data || res;
      if (Array.isArray(list)) {
        setNotifications(list);
      }
    } catch (err) {
      console.warn('Using default notifications:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      {/* Bell Button Trigger */}
      <button
        type="button"
        className="btn btn-outline-light btn-sm rounded-circle position-relative p-2.5 d-flex align-items-center justify-content-center"
        style={{ width: '40px', height: '40px' }}
        onClick={() => setOpen(!open)}
        title="Notifications"
      >
        <i className="bi bi-bell-fill fs-5"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {open && (
        <div
          className="card border-0 shadow-lg rounded-4 overflow-hidden position-absolute end-0 mt-2 z-3"
          style={{ width: '360px', maxWidth: '90vw' }}
        >
          <div className="card-header bg-dark text-white p-3 d-flex align-items-center justify-content-between border-0">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-bell text-primary"></i>
              <span className="fw-bold">Notifications</span>
              {unreadCount > 0 && (
                <span className="badge bg-primary-subtle text-primary rounded-pill extra-small">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-link text-white-50 p-0 extra-small text-decoration-none"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="card-body p-0 overflow-y-auto" style={{ maxHeight: '340px' }}>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-4 text-muted extra-small">
                <i className="bi bi-bell-slash display-6 d-block mb-2 text-muted"></i>
                No notifications right now
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`list-group-item list-group-item-action p-3 border-bottom ${
                      !n.read ? 'bg-primary-subtle bg-opacity-10 fw-semibold' : 'bg-white text-secondary'
                    }`}
                    onClick={() => handleMarkRead(n.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-start justify-content-between gap-2">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          {!n.read && (
                            <span className="d-inline-block rounded-circle bg-primary" style={{ width: '8px', height: '8px' }}></span>
                          )}
                          <h6 className="fw-bold mb-0 extra-small text-dark">{n.title}</h6>
                        </div>
                        <p className="extra-small text-muted mb-1 line-clamp-2">{n.message}</p>
                        <span className="extra-small text-secondary">{n.timestamp}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-link text-muted p-0 extra-small"
                        onClick={(e) => handleDelete(n.id, e)}
                        title="Delete Notification"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDrawer;
