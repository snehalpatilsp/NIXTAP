import api from './axios';

export const registerNfcTag = async (data) => {
  const res = await api.post(
    '/api/v1/nfc/tags/register',
    data
  );

  return res.data;
};

export const linkNfcTag = async (id, data) => {
  const res = await api.put(
    `/api/v1/nfc/tags/${id}/link`,
    data
  );

  return res.data;
};

export const unlinkNfcTag = async (id) => {
  const res = await api.put(
    `/api/v1/nfc/tags/${id}/unlink`
  );

  return res.data;
};

export const deactivateNfcTag = async (
  id,
  status = 'INACTIVE'
) => {
  const res = await api.put(
    `/api/v1/nfc/tags/${id}/deactivate`,
    null,
    {
      params: { status },
    }
  );

  return res.data;
};

export const replaceNfcTag = async (id, data) => {
  const res = await api.post(
    `/api/v1/nfc/tags/${id}/replace`,
    data
  );

  return res.data;
};

export const getNfcTagsByUser = async (userId) => {
  const res = await api.get(
    `/api/v1/nfc/tags/user/${userId}`
  );

  return res.data;
};

export const getNfcTagById = async (id) => {
  const res = await api.get(
    `/api/v1/nfc/tags/${id}`
  );

  return res.data;
};

export const getNfcTagByUid = async (uid) => {
  const res = await api.get(
    `/api/v1/nfc/tags/uid/${uid}`
  );

  return res.data;
};

export const deleteNfcTag = async (id) => {
  const res = await api.delete(
    `/api/v1/nfc/tags/${id}`
  );

  return res.data;
};