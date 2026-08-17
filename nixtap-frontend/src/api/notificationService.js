import api from './axios';

// ─── NOTIFICATION SERVICE  /api/v1/notifications ─────────────────────────

/** Get my notification preferences */
export const getNotificationPreferences = async () => {
  try {
    const res = await api.get('/api/v1/notifications/preferences');
    return res.data;
  } catch {
    return { data: null };
  }
};

/** Update my notification preferences */
export const updateNotificationPreferences = async (data) => {
  const res = await api.put('/api/v1/notifications/preferences', data);
  return res.data;
};

/** Get my notification logs (paginated) */
export const getNotificationLogs = async (page = 0, size = 20) => {
  try {
    const res = await api.get('/api/v1/notifications/logs', { params: { page, size } });
    return res.data;
  } catch {
    return { data: { content: [] } };
  }
};

/** Get count of unread notifications */
export const getUnreadNotificationCount = async () => {
  try {
    const res = await api.get('/api/v1/notifications/logs/unread/count');
    return res.data;
  } catch {
    return { data: 0 };
  }
};

/** Mark a single notification log as read */
export const markNotificationRead = async (id) => {
  const res = await api.put(`/api/v1/notifications/logs/${id}/read`);
  return res.data;
};

/** Mark all notifications as read */
export const markAllNotificationsRead = async () => {
  const res = await api.put('/api/v1/notifications/logs/read-all');
  return res.data;
};
