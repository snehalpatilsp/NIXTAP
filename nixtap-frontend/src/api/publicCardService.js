import api from './axios';

// 1. getPublicCard(cardIdOrSlug) -> GET /api/v1/cards/public/slug/{slug}
export const getPublicCard = async (cardIdOrSlug) => {
  try {
    const res = await api.get(`/api/v1/cards/public/slug/${cardIdOrSlug}`);
    return res.data;
  } catch (err) {
    // Numeric IDs won't match slug — try fetching by ID directly (public page still works)
    const res = await api.get(`/api/v1/cards/${cardIdOrSlug}`);
    return res.data;
  }
};

// 2. bookMeeting — Fix 10: align field names with backend MeetingServiceImpl
//    Backend MeetingRequest expects:
//      { hostUserId, guestName, guestEmail, proposedTime, durationMinutes, agenda, cardId }
export const bookMeeting = async (card, meetingData) => {
  // Convert "09:00 AM" time slot + date into ISO-8601 datetime
  const proposedTime = buildProposedTime(meetingData.date, meetingData.timeSlot);

  const res = await api.post('/api/v1/meetings/request', {
    cardId:          card?.id,
    hostUserId:      card?.userId,
    guestName:       meetingData.guestName,
    guestEmail:      meetingData.guestEmail,
    proposedTime,
    durationMinutes: meetingData.durationMinutes || 30,
    agenda:          meetingData.purpose
                       ? `${meetingData.purpose}${meetingData.notes ? ' — ' + meetingData.notes : ''}`
                       : (meetingData.notes || 'General Consultation'),
  });
  return res.data;
};

// Helper — convert a date string + "09:00 AM" slot into "2027-01-15T09:00:00"
const buildProposedTime = (dateStr, timeSlot) => {
  if (!dateStr) return null;
  if (!timeSlot) return `${dateStr}T09:00:00`;

  // Parse "09:00 AM" / "02:30 PM"
  const match = timeSlot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return `${dateStr}T09:00:00`;

  let hours   = parseInt(match[1], 10);
  const mins  = match[2];
  const ampm  = match[3].toUpperCase();

  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours  = 0;

  return `${dateStr}T${String(hours).padStart(2, '0')}:${mins}:00`;
};

// 3. getAvailableSlots — backend has no slots endpoint; return default slots
export const getAvailableSlots = async () => ({
  data: ['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'],
});

// 4. submitFeedback(cardId, feedbackData) -> POST /api/v1/feedback
//    Backend FeedbackRequest expects: { cardId, rating, comment }
export const submitFeedback = async (cardId, feedbackData) => {
  const res = await api.post('/api/v1/feedback', {
    cardId:  cardId,
    rating:  feedbackData.rating,
    comment: feedbackData.comment,
  });
  return res.data;
};

// 5. getCardFeedback(cardId) -> GET /api/v1/feedback/card/{cardId}
export const getCardFeedback = async (cardId) => {
  try {
    const res = await api.get(`/api/v1/feedback/card/${cardId}`);
    return res.data;
  } catch (err) {
    return { data: [] };
  }
};

// 6. trackCardView — Fix 11: include ownerId from card data
//    Backend AnalyticsEvent expects: { ownerId, eventType, cardId, source }
export const trackCardView = async (card) => {
  try {
    await api.post('/api/v1/analytics/track', {
      ownerId:   String(card?.userId || card?.id || ''),
      cardId:    String(card?.id || ''),
      eventType: 'CARD_VIEW',
      source:    'PUBLIC_LINK',
    });
  } catch (err) {
    // Non-critical — swallow silently
  }
};
