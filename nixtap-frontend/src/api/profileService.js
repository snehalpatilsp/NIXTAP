import api from './axios';

// 1. getProfile() -> GET /api/v1/profiles/me
export const getProfile = async () => {
  const res = await api.get('/api/v1/profiles/me');
  return res.data;
};

// 2. updateProfile(data) -> PUT /api/v1/profiles/me
export const updateProfile = async (data) => {
  const res = await api.put('/api/v1/profiles/me', data);
  return res.data;
};

// 3. getSocialLinks(userId) -> GET /api/v1/social/links/user/{userId}
export const getSocialLinks = async (userId) => {
  const id = userId || 1;
  const res = await api.get(`/api/v1/social/links/user/${id}`);
  return res.data;
};

// 4. getPublicSocialLinks(userId) -> GET /api/v1/social/links/public/user/{userId}
export const getPublicSocialLinks = async (userId) => {
  try {
    const id = userId || 1;
    const res = await api.get(`/api/v1/social/links/public/user/${id}`);
    return res.data?.data || res.data;
  } catch {
    return [];
  }
};

// 4b. getPublicProfileByUsername(username) -> GET /api/v1/profiles/public/username/{username}
export const getPublicProfileByUsername = async (username) => {
  const res = await api.get(`/api/v1/profiles/public/username/${username}`);
  return res.data?.data || res.data;
};

// 4c. getPublicProfileByUserId(userId) -> GET /api/v1/profiles/public/user/{userId}
export const getPublicProfileByUserId = async (userId) => {
  const res = await api.get(`/api/v1/profiles/public/user/${userId}`);
  return res.data?.data || res.data;
};

// 5. addSocialLink(data) -> POST /api/v1/social/links
export const addSocialLink = async (data) => {
  const res = await api.post('/api/v1/social/links', data);
  return res.data;
};

// 6. updateSocialLink(id, data) -> PUT /api/v1/social/links/{id}
export const updateSocialLink = async (id, data) => {
  const res = await api.put(`/api/v1/social/links/${id}`, data);
  return res.data;
};

// 7. deleteSocialLink(id) -> DELETE /api/v1/social/links/{id}
export const deleteSocialLink = async (id) => {
  const res = await api.delete(`/api/v1/social/links/${id}`);
  return res.data;
};

// 7. getvCard() — Fix 4: backend has no vCard endpoint.
//    Generate the .vcf entirely on the client from profile data.
//    profileData shape: { fullName, company, jobTitle, phone, email, bio }
export const getvCard = (profileData) => {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profileData.fullName || ''}`,
    `N:${profileData.fullName || ''};;;`,
    `ORG:${profileData.company || ''}`,
    `TITLE:${profileData.jobTitle || ''}`,
    `TEL;TYPE=CELL:${profileData.phone || ''}`,
    `EMAIL:${profileData.email || ''}`,
    `NOTE:${profileData.bio || ''}`,
    'END:VCARD',
  ];
  return lines.join('\r\n');
};
