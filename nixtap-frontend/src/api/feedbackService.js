import api from './axios';

// ─── FEEDBACK SERVICE  /api/v1/feedback ──────────────────────────────────

/** Get approved feedback for a card (public) */
export const getApprovedFeedback = async (cardId) => {
  try {
    const res = await api.get(`/api/v1/feedback/card/${cardId}`);
    return res.data;
  } catch {
    return { data: [] };
  }
};

/** Get ALL feedback for a card including unapproved (owner only) */
export const getAllFeedbackForCard = async (cardId) => {
  try {
    const res = await api.get(`/api/v1/feedback/card/${cardId}/all`);
    return res.data;
  } catch {
    return { data: [] };
  }
};

/** Get feedback summary — average rating and total counts (public) */
export const getFeedbackSummary = async (cardId) => {
  try {
    const res = await api.get(`/api/v1/feedback/card/${cardId}/summary`);
    return res.data;
  } catch {
    return { data: null };
  }
};

/** Get all feedback across all the authenticated owner's cards */
export const getFeedbackByOwner = async (ownerId) => {
  try {
    const res = await api.get(`/api/v1/feedback/owner/${ownerId}`);
    return res.data;
  } catch {
    return { data: [] };
  }
};

/** Submit feedback for a card (public) */
export const submitFeedback = async (data) => {
  const res = await api.post('/api/v1/feedback', data);
  return res.data;
};

/** Approve a feedback entry (owner only) */
export const approveFeedback = async (id) => {
  const res = await api.put(`/api/v1/feedback/${id}/approve`);
  return res.data;
};

/** Reject/hide a feedback entry (owner only) */
export const rejectFeedback = async (id) => {
  const res = await api.put(`/api/v1/feedback/${id}/reject`);
  return res.data;
};

/** Delete a feedback entry (owner only) */
export const deleteFeedback = async (id) => {
  const res = await api.delete(`/api/v1/feedback/${id}`);
  return res.data;
};
