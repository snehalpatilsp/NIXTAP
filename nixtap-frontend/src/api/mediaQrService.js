import api from './axios';

// 1. uploadFile(file, mediaType, referenceId) -> POST /api/v1/media/upload
export const uploadFile = async (file, mediaType = 'PROFILE_IMAGE', referenceId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mediaType', mediaType);
  if (referenceId) {
    formData.append('referenceId', referenceId);
  }
  const res = await api.post('/api/v1/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// 2. deleteFile(fileId) -> DELETE /api/v1/media/{fileId}  (Fix 9: removed /files/ segment)
export const deleteFile = async (fileId) => {
  const res = await api.delete(`/api/v1/media/${fileId}`);
  return res.data;
};

// 3. generateQrCode(cardId, options) -> POST /api/v1/qr/generate
//    Fix 9: backend QrCodeRequest only accepts { cardId, label } — removed fgColor/bgColor
export const generateQrCode = async (cardId, options = {}) => {
  const res = await api.post('/api/v1/qr/generate', {
    cardId,
    label: options.label || `QR for card ${cardId}`,
  });
  return res.data;
};

// 4. getUserQrCodes() -> GET /api/v1/qr/user/me
export const getUserQrCodes = async () => {
  const res = await api.get('/api/v1/qr/user/me');
  return res.data;
};

// 5. getQrCodeById(id) -> GET /api/v1/qr/{id}
export const getQrCodeById = async (id) => {
  const res = await api.get(`/api/v1/qr/${id}`);
  return res.data;
};

// 6. deleteQrCode(id) -> DELETE /api/v1/qr/{id}
export const deleteQrCode = async (id) => {
  const res = await api.delete(`/api/v1/qr/${id}`);
  return res.data;
};

// 7. downloadQrCode — Fix 9: backend has no download endpoint.
//    Returns null so the caller falls back to client-side SVG download.
export const downloadQrCode = async () => null;
