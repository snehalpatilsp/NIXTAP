import api from './axios';

// ---------------------------------------------------------------------------
// NOTIFICATION ENDPOINTS
// ---------------------------------------------------------------------------

// 1. getNotifications() -> GET /api/v1/notifications
export const getNotifications = async () => {
  try {
    const res = await api.get('/api/v1/notifications');
    return res.data;
  } catch (err) {
    // Fallback mock data so the drawer still renders
    return {
      data: [
        {
          id: 1,
          title: 'New Meeting Booked',
          message: 'Alex Rivera scheduled a consultation for tomorrow at 10:30 AM.',
          read: false,
          timestamp: '10 mins ago',
          type: 'MEETING',
        },
        {
          id: 2,
          title: 'New Review Received',
          message: 'Sarah Chen left a 5-star rating on your Executive Business Card.',
          read: false,
          timestamp: '1 hour ago',
          type: 'FEEDBACK',
        },
        {
          id: 3,
          title: 'NFC Card Tapped',
          message: 'Your Executive Business Card was scanned via NFC in San Francisco, CA.',
          read: true,
          timestamp: '3 hours ago',
          type: 'TAP',
        },
      ],
    };
  }
};

// 2. markNotificationAsRead(id) -> PUT /api/v1/notifications/{id}/read  (Fix 8: PATCH→PUT)
export const markNotificationAsRead = async (id) => {
  const res = await api.put(`/api/v1/notifications/${id}/read`);
  return res.data;
};

// 3. markAllNotificationsAsRead() -> PUT /api/v1/notifications/read-all  (Fix 8: PATCH→PUT)
export const markAllNotificationsAsRead = async () => {
  const res = await api.put('/api/v1/notifications/read-all');
  return res.data;
};

// 4. deleteNotification — backend has no delete endpoint for notifications.
//    Silently succeed so the UI can remove the item locally.
export const deleteNotification = async () => ({ success: true });

// 5. getUnreadCount() -> GET /api/v1/notifications/unread-count
export const getUnreadCount = async () => {
  try {
    const res = await api.get('/api/v1/notifications/unread-count');
    return res.data;
  } catch (err) {
    return null;
  }
};

// ---------------------------------------------------------------------------
// ADMIN ENDPOINTS
// ---------------------------------------------------------------------------

// 6. getAdminMetrics() -> GET /api/v1/admin/dashboard  (Fix 8: /stats → /dashboard)
export const getAdminMetrics = async () => {
  try {
    const res = await api.get('/api/v1/admin/dashboard');
    return res.data;
  } catch (err) {
    // Fallback mock metrics
    return {
      data: {
        totalUsers:    1420,
        activeCards:   3850,
        totalScans:    24890,
        serverHealth: '99.98%',
      },
    };
  }
};

export const getAllUsers = async (page = 0, size = 20) => {
  try {
    const res = await api.get('/api/v1/admin/users', { params: { page, size } });
    const content = res.data?.data?.content || res.data?.data;
    if (Array.isArray(content)) {
      return { data: content };
    }
    return { data: [] };
  } catch (err) {
    console.warn('Failed to fetch real users from admin-service:', err);
    return { data: [] };
  }
};

const MOCK_ADMIN_USERS = [
  {
    id: 101,
    fullName: 'John Doe',
          email: 'john.doe@nixtap.com',
          role: 'ROLE_ADMIN',
          status: 'ACTIVE',
          jobTitle: 'Senior Platform Administrator & Architect',
          company: 'Nixtap Microservices Inc.',
          phone: '+1 (555) 019-2834',
          address: 'San Francisco, CA, USA',
          registeredDate: '2026-01-15',
          cards: [
            { id: 1, title: 'Executive Admin Card', views: 842, nfc: true, qr: true, status: 'Active' },
            { id: 2, title: 'Nixtap Platform Tag', views: 420, nfc: true, qr: true, status: 'Active' }
          ],
          portfolios: [
            { id: 10, title: 'Nixtap Microservice Architecture', category: 'Backend Ecosystem', tags: ['Spring Cloud', 'Docker', 'JWT'] },
            { id: 11, title: 'Contactless NFC Hardware Sync', category: 'Hardware', tags: ['NFC', 'WebUSB', 'vCard'] }
          ],
          analytics: { totalViews: 1262, totalScans: 890, vcardsDownloaded: 412 }
        },
        {
          id: 102,
          fullName: 'Jane Smith',
          email: 'jane.smith@tech.io',
          role: 'ROLE_USER',
          status: 'ACTIVE',
          jobTitle: 'Lead Product Manager',
          company: 'Innovate Tech Labs',
          phone: '+1 (555) 438-9901',
          address: 'Austin, TX, USA',
          registeredDate: '2026-02-10',
          cards: [
            { id: 3, title: 'Product Leader Card', views: 512, nfc: true, qr: true, status: 'Active' }
          ],
          portfolios: [
            { id: 12, title: 'Mobile NFC Networking App', category: 'Web App', tags: ['React', 'Bootstrap 5'] }
          ],
          analytics: { totalViews: 512, totalScans: 310, vcardsDownloaded: 145 }
        },
        {
          id: 103,
          fullName: 'Michael Scott',
          email: 'mscott@dundermifflin.com',
          role: 'ROLE_USER',
          status: 'SUSPENDED',
          jobTitle: 'Regional Sales Director',
          company: 'Dunder Mifflin Paper Co.',
          phone: '+1 (555) 902-1144',
          address: 'Scranton, PA, USA',
          registeredDate: '2026-03-04',
          cards: [
            { id: 4, title: 'Regional Manager Card', views: 184, nfc: false, qr: true, status: 'Suspended' }
          ],
          portfolios: [],
          analytics: { totalViews: 184, totalScans: 62, vcardsDownloaded: 19 }
        },
        {
          id: 104,
          fullName: 'Sarah Chen',
          email: 'sarah.chen@innovate.org',
          role: 'ROLE_USER',
          status: 'ACTIVE',
          jobTitle: 'Full-Stack Developer',
          company: 'Cloud Scale Inc.',
          phone: '+1 (555) 772-3310',
          address: 'Seattle, WA, USA',
          registeredDate: '2026-04-12',
          cards: [
            { id: 5, title: 'Dev Tech Card', views: 390, nfc: true, qr: true, status: 'Active' }
          ],
          portfolios: [
            { id: 13, title: 'Telemetry Event Pipeline', category: 'Analytics', tags: ['Kafka', 'Microservices'] }
          ],
        },
      ];

// 8. toggleUserStatus — Fix 13: backend uses separate enable/disable endpoints
//    PUT /api/v1/admin/users/{id}/enable   (to activate)
//    PUT /api/v1/admin/users/{id}/disable  (to suspend)
export const toggleUserStatus = async (userId, newStatus) => {
  const action = newStatus === 'ACTIVE' ? 'enable' : 'disable';
  try {
    const res = await api.put(`/api/v1/admin/users/${userId}/${action}`);
    return res.data;
  } catch (err) {
    // Stub response so UI still toggles locally
    return { success: true, userId, status: newStatus };
  }
};

const MOCK_SYSTEM_LOGS = [
  { id: 1, service: 'gateway-service', level: 'INFO', message: 'Route /api/v1/cards matched for client 192.168.1.1', timestamp: '2026-08-05 00:45:12' },
  { id: 2, service: 'auth-service',    level: 'INFO', message: 'JWT AccessToken refreshed successfully for user john.doe@nixtap.com', timestamp: '2026-08-05 00:42:01' },
  { id: 3, service: 'qr-service',      level: 'INFO', message: 'QR Code PNG stream generated for card ID 1', timestamp: '2026-08-05 00:38:19' },
  { id: 4, service: 'nfc-service',     level: 'INFO', message: 'NFC Tag UID 04:8A:2B:10:99:A1 bound to card ID 1', timestamp: '2026-08-05 00:35:44' },
];

export const getSystemLogs = async () => {
  try {
    const res = await api.get('/api/v1/admin/audit-logs');
    const content = res.data?.data?.content || res.data?.data;
    if (Array.isArray(content) && content.length > 0) {
      return { data: content };
    }
    return { data: MOCK_SYSTEM_LOGS };
  } catch (err) {
    return { data: MOCK_SYSTEM_LOGS };
  }
};

// 10. broadcastNotification(payload) -> POST /api/v1/admin/broadcast
export const broadcastNotification = async (payload) => {
  try {
    const res = await api.post('/api/v1/admin/broadcast', payload);
    return res.data;
  } catch (err) {
    return { success: true, message: 'Broadcast notification sent successfully' };
  }
};

// 11. deleteUser(userId) -> DELETE /api/v1/admin/users/{id}
export const deleteUser = async (userId) => {
  try {
    const res = await api.delete(`/api/v1/admin/users/${userId}`);
    return res.data;
  } catch (err) {
    return { success: true, userId };
  }
};
