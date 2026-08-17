import api from './axios';

// ─── MEETING SERVICE  /api/v1/meetings ────────────────────────────────────

/** Submit a meeting request (public — no auth needed) */
export const submitMeetingRequest = async (data) => {
  const res = await api.post('/api/v1/meetings/request', data);
  return res.data;
};

/** Get all meeting requests for the authenticated owner */
export const getMeetingsByOwner = async (ownerId) => {
  try {
    const res = await api.get(`/api/v1/meetings/owner/${ownerId}`);
    return res.data;
  } catch {
    return { data: [] };
  }
};

/** Get only PENDING meeting requests for the owner */
export const getPendingMeetings = async (ownerId) => {
  try {
    const res = await api.get(`/api/v1/meetings/owner/${ownerId}/pending`);
    return res.data;
  } catch {
    return { data: [] };
  }
};

/** Get meeting stats (total, pending, accepted, rejected) */
export const getMeetingStats = async (ownerId) => {
  try {
    const res = await api.get(`/api/v1/meetings/owner/${ownerId}/stats`);
    return res.data;
  } catch {
    return { data: null };
  }
};

/** Get single meeting request by ID */
export const getMeetingById = async (id) => {
  const res = await api.get(`/api/v1/meetings/${id}`);
  return res.data;
};

/** Accept a meeting request */
export const acceptMeeting = async (id, note = '') => {
  const res = await api.put(`/api/v1/meetings/${id}/accept`, { note });
  return res.data;
};

/** Reject a meeting request */
export const rejectMeeting = async (id, note = '') => {
  const res = await api.put(`/api/v1/meetings/${id}/reject`, { note });
  return res.data;
};

/** Cancel a meeting request (owner JWT) */
export const cancelMeeting = async (id) => {
  const res = await api.put(`/api/v1/meetings/${id}/cancel`);
  return res.data;
};

/** Delete a meeting request permanently */
export const deleteMeeting = async (id) => {
  const res = await api.delete(`/api/v1/meetings/${id}`);
  return res.data;
};
