import api from './axios';

// 1. getUserCards() -> GET /api/v1/cards/user/me
export const getUserCards = async () => {
  const res = await api.get('/api/v1/cards/user/me');
  return res.data;
};

// 1b. getPublicUserCards(userId) -> GET /api/v1/cards/public/user/{userId}
export const getPublicUserCards = async (userId) => {
  try {
    const id = userId || 1;
    const res = await api.get(`/api/v1/cards/public/user/${id}`);
    return res.data?.data || res.data;
  } catch {
    return [];
  }
};

// 2. createCard(data) -> POST /api/v1/cards
export const createCard = async (data) => {
  const res = await api.post('/api/v1/cards', data);
  return res.data;
};

// 3. updateCard(id, data) -> PUT /api/v1/cards/{id}
export const updateCard = async (id, data) => {
  const res = await api.put(`/api/v1/cards/${id}`, data);
  return res.data;
};

// 4. deleteCard(id) -> DELETE /api/v1/cards/{id}
export const deleteCard = async (id) => {
  const res = await api.delete(`/api/v1/cards/${id}`);
  return res.data;
};

// 5. getThemes() -> GET /api/v1/themes
export const getThemes = async () => {
  try {
    const res = await api.get('/api/v1/themes');
    return res.data;
  } catch (err) {
    // Fallback preset themes when backend is unavailable
    return {
      data: [
        { id: 1, name: 'Midnight Indigo', slug: 'midnight-indigo', primaryColor: '#4f46e5', secondaryColor: '#312e81', gradient: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)' },
        { id: 2, name: 'Emerald Luxe',    slug: 'emerald-luxe',    primaryColor: '#059669', secondaryColor: '#064e3b', gradient: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)' },
        { id: 3, name: 'Sunset Bronze',   slug: 'sunset-bronze',   primaryColor: '#d97706', secondaryColor: '#78350f', gradient: 'linear-gradient(135deg, #d97706 0%, #78350f 100%)' },
        { id: 4, name: 'Cyber Neon',      slug: 'cyber-neon',      primaryColor: '#ec4899', secondaryColor: '#831843', gradient: 'linear-gradient(135deg, #ec4899 0%, #831843 100%)' },
        { id: 5, name: 'Clean Slate',     slug: 'clean-slate',     primaryColor: '#475569', secondaryColor: '#0f172a', gradient: 'linear-gradient(135deg, #475569 0%, #0f172a 100%)' },
      ],
    };
  }
};

// 6. linkNfcTag(cardId, nfcData) — Fix 2: two-step flow
//    Step 1: POST /api/v1/nfc/tags/register  (register the physical tag)
//    Step 2: PUT  /api/v1/nfc/tags/{id}/link?cardId={cardId}  (bind tag to card)
export const linkNfcTag = async (cardId, nfcData) => {
  // Step 1: Register physical NFC tag
  const registerRes = await api.post('/api/v1/nfc/tags/register', {
    userId: nfcData.userId,
    tagUid: nfcData.tagUid || nfcData.uid,
    tagType: nfcData.tagType || 'NTAG213',
    notes: nfcData.notes || '',
  });

  const tag = registerRes.data?.data || registerRes.data;

  if (!tag?.id) {
    throw new Error('NFC tag registration did not return a tag ID');
  }

  // Step 2: Link NFC tag to Business Card
  const linkRes = await api.put(
    `/api/v1/nfc/tags/${tag.id}/link`,
    {
      cardId: cardId,
      linkedUrl: nfcData.linkedUrl,
    }
  );

  return linkRes.data;
};

// 7. unlinkNfcTag(tagId) -> PUT /api/v1/nfc/tags/{id}/unlink
export const unlinkNfcTag = async (tagId) => {
  const res = await api.put(`/api/v1/nfc/tags/${tagId}/unlink`);
  return res.data;
};
