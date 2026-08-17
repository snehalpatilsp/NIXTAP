import api from './axios';

// ─── AGGREGATED FULL PORTFOLIO ─────────────────────────────────────────────
/** Get full portfolio (all 8 sections) for the authenticated user */
export const getFullPortfolioMe = async () => {
  try {
    const res = await api.get('/api/v1/portfolio/all/user/me');
    return res.data?.data || res.data;
  } catch (err) {
    return null;
  }
};

/** Get full portfolio by userId (public) */
export const getPublicFullPortfolio = async (userId) => {
  try {
    const res = await api.get(`/api/v1/portfolio/public/user/${userId}`);
    return res.data?.data || res.data;
  } catch (err) {
    return null;
  }
};

// ─── 1. PROJECTS ───────────────────────────────────────────────────────────
export const getUserPortfolios = async () => {
  try {
    const res = await api.get('/api/v1/portfolio/all/user/me');
    const data = res.data?.data || res.data;
    if (data && Array.isArray(data.projects)) {
      return { data: data.projects };
    }
    return res.data;
  } catch (err) {
    const res = await api.get('/api/v1/portfolio/projects/user/me');
    return res.data;
  }
};

export const createPortfolioItem = async (data) => {
  const res = await api.post('/api/v1/portfolio/projects', data);
  return res.data;
};

export const updatePortfolioItem = async (id, data) => {
  const res = await api.put(`/api/v1/portfolio/projects/${id}`, data);
  return res.data;
};

export const deletePortfolioItem = async (id) => {
  const res = await api.delete(`/api/v1/portfolio/projects/${id}`);
  return res.data;
};

export const toggleFeaturedStatus = async (id, currentFeaturedStatus) => {
  const res = await api.put(`/api/v1/portfolio/projects/${id}`, {
    featured: !currentFeaturedStatus,
  });
  return res.data;
};

// ─── 2. EXPERIENCE ─────────────────────────────────────────────────────────
export const getExperience = async (userId) => {
  const res = await api.get(`/api/v1/portfolio/experience/user/${userId}`);
  return res.data;
};
export const createExperience = async (data) => {
  const res = await api.post('/api/v1/portfolio/experience', data);
  return res.data;
};
export const updateExperience = async (id, data) => {
  const res = await api.put(`/api/v1/portfolio/experience/${id}`, data);
  return res.data;
};
export const deleteExperience = async (id) => {
  const res = await api.delete(`/api/v1/portfolio/experience/${id}`);
  return res.data;
};

// ─── 3. EDUCATION ──────────────────────────────────────────────────────────
export const getEducation = async (userId) => {
  const res = await api.get(`/api/v1/portfolio/education/user/${userId}`);
  return res.data;
};
export const createEducation = async (data) => {
  const res = await api.post('/api/v1/portfolio/education', data);
  return res.data;
};
export const updateEducation = async (id, data) => {
  const res = await api.put(`/api/v1/portfolio/education/${id}`, data);
  return res.data;
};
export const deleteEducation = async (id) => {
  const res = await api.delete(`/api/v1/portfolio/education/${id}`);
  return res.data;
};

// ─── 4. SKILLS ──────────────────────────────────────────────────────────────
export const getSkills = async (userId) => {
  const res = await api.get(`/api/v1/portfolio/skills/user/${userId}`);
  return res.data;
};
export const createSkill = async (data) => {
  const res = await api.post('/api/v1/portfolio/skills', data);
  return res.data;
};
export const updateSkill = async (id, data) => {
  const res = await api.put(`/api/v1/portfolio/skills/${id}`, data);
  return res.data;
};
export const deleteSkill = async (id) => {
  const res = await api.delete(`/api/v1/portfolio/skills/${id}`);
  return res.data;
};

// ─── 5. CERTIFICATES ────────────────────────────────────────────────────────
export const getCertificates = async (userId) => {
  const res = await api.get(`/api/v1/portfolio/certificates/user/${userId}`);
  return res.data;
};
export const createCertificate = async (data) => {
  const res = await api.post('/api/v1/portfolio/certificates', data);
  return res.data;
};
export const updateCertificate = async (id, data) => {
  const res = await api.put(`/api/v1/portfolio/certificates/${id}`, data);
  return res.data;
};
export const deleteCertificate = async (id) => {
  const res = await api.delete(`/api/v1/portfolio/certificates/${id}`);
  return res.data;
};

// ─── 6. RESUMES ─────────────────────────────────────────────────────────────
export const getResume = async (userId) => {
  const res = await api.get(`/api/v1/portfolio/resume/user/${userId}`);
  return res.data;
};
export const saveResume = async (data) => {
  const res = await api.post('/api/v1/portfolio/resume', data);
  return res.data;
};
export const deleteResume = async (userId) => {
  const res = await api.delete(`/api/v1/portfolio/resume/user/${userId}`);
  return res.data;
};

// ─── 7. AWARDS ──────────────────────────────────────────────────────────────
export const getAwards = async (userId) => {
  const res = await api.get(`/api/v1/portfolio/awards/user/${userId}`);
  return res.data;
};
export const createAward = async (data) => {
  const res = await api.post('/api/v1/portfolio/awards', data);
  return res.data;
};
export const updateAward = async (id, data) => {
  const res = await api.put(`/api/v1/portfolio/awards/${id}`, data);
  return res.data;
};
export const deleteAward = async (id) => {
  const res = await api.delete(`/api/v1/portfolio/awards/${id}`);
  return res.data;
};

// ─── 8. LANGUAGES ───────────────────────────────────────────────────────────
export const getLanguages = async (userId) => {
  const res = await api.get(`/api/v1/portfolio/languages/user/${userId}`);
  return res.data;
};
export const createLanguage = async (data) => {
  const res = await api.post('/api/v1/portfolio/languages', data);
  return res.data;
};
export const updateLanguage = async (id, data) => {
  const res = await api.put(`/api/v1/portfolio/languages/${id}`, data);
  return res.data;
};
export const deleteLanguage = async (id) => {
  const res = await api.delete(`/api/v1/portfolio/languages/${id}`);
  return res.data;
};
