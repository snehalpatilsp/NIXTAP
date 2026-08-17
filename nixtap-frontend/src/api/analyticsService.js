import api from './axios';

/**
 * Fetch analytics dashboard summary metrics for an owner
 * @param {string|number} ownerId
 */
export const getOverviewStats = async (ownerId) => {
  try {
    const id = ownerId || 1;
    const res = await api.get(`/api/v1/analytics/dashboard/${id}`);
    return res.data?.data || res.data;
  } catch (err) {
    console.warn('Analytics API error, falling back:', err);
    return null;
  }
};

/**
 * Fetch paginated events recorded for an owner
 * @param {string|number} ownerId
 * @param {number} page
 * @param {number} size
 */
export const getEventsByOwner = async (ownerId, page = 0, size = 20) => {
  try {
    const id = ownerId || 1;
    const res = await api.get(`/api/v1/analytics/events/owner/${id}`, { params: { page, size } });
    return res.data?.data || res.data;
  } catch (err) {
    return null;
  }
};

/**
 * Public telemetry event tracking: card views, QR scans, NFC taps
 * @param {Object} payload { ownerId, targetType ('CARD'|'PORTFOLIO'|'QR'), targetId, eventType ('VIEW'|'SCAN'|'TAP') }
 */
export const trackEvent = async (payload) => {
  try {
    const body = {
      ownerId: String(payload.ownerId || '1'),
      targetType: payload.targetType || 'CARD',
      targetId: String(payload.targetId || '1'),
      eventType: payload.eventType || 'VIEW',
    };
    await api.post('/api/v1/analytics/events', body);
  } catch (err) {
    // Non-critical background telemetry — swallow silently
  }
};

export const getTrafficSources = async () => null;
export const getGeographicData  = async () => null;
export const getCardAnalytics   = async () => null;
