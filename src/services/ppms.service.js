/**
 * Typed wrappers around every PPMS API endpoint
 * Components never call Axios directly - they import one of these functions, so
 * the URL surface stays in a single file.
 */
import api, { fileUrl } from './api';

//Authentication
export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  verifyOtp: (payload) => api.post('/auth/verify-otp', payload),
  resendOtp: (email) => api.post('/auth/resend-otp', { email }),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
};

//Profile and personal history 
export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (payload) => api.put('/users/me', payload),
  changePassword: (payload) => api.put('/users/me/password', payload),
  getStats: () => api.get('/users/me/stats'),
  getUploads: (params) => api.get('/users/me/uploads', { params }),
  getDownloads: (params) => api.get('/users/me/downloads', { params }),
};

//Catalogue (colleges, programs, courses, controlled vocabularies)
export const catalogApi = {
  getOptions: () => api.get('/catalog/options'),
  getColleges: () => api.get('/catalog/colleges'),
  getPrograms: () => api.get('/catalog/programs'),
  getCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get('/courses/' + id),
};

//Papers
export const paperApi = {
  /**
   * Upload a paper.
   * Only the course id and the paper identity are sent: college, program and
   * course code are resolved by the server from the signed-in student and the
   * course catalogue.
   */
  upload: (formData, onUploadProgress) =>
    api.post('/papers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),

  search: (params) => api.get('/papers', { params }),
  getById: (id) => api.get('/papers/' + id),

  /** Mint a short lived token so the browser can open the PDF directly. */
  requestAccess: (id) => api.post('/papers/' + id + '/access'),

  /** Absolute URLs for the <iframe> preview and the download anchor. */
  viewUrl: (id, token) => fileUrl('/papers/' + id + '/view' + (token ? '?token=' + encodeURIComponent(token) : '')),
  downloadUrl: (id, token) => fileUrl('/papers/' + id + '/download' + (token ? '?token=' + encodeURIComponent(token) : '')),
};

//Administration
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPapers: (params) => api.get('/admin/papers', { params }),
  getPaper: (id) => api.get('/admin/papers/' + id),
  approvePaper: (id) => api.post('/admin/papers/' + id + '/approve'),
  rejectPaper: (id, reason) => api.post('/admin/papers/' + id + '/reject', { reason }),
  deletePaper: (id, purge = false) => api.delete('/admin/papers/' + id, { params: { purge } }),
  getUsers: (params) => api.get('/admin/users', { params }),
  setSuspension: (id, suspended) => api.patch('/admin/users/' + id + '/suspend', { suspended }),
  deleteUser: (id) => api.delete('/admin/users/' + id),
};

//Public
export const publicApi = {
  getStats: () => api.get('/public/stats'),
  getContact: () => api.get('/public/contact'),
};

/**
 * Open a paper for viewing or downloading
 * Requests a fresh access token first, so the resulting URL works in a new tab
 * or an <iframe> even when the API sits on a different domain from the client
 * @param {string} paperId
 * @param {'view'|'download'} mode
 * @returns {Promise<string>} the authorised URL
 */
export async function buildPaperFileUrl(paperId, mode = 'view') {
  const response = await paperApi.requestAccess(paperId);
  const { token } = response.data;
  return mode === 'download' ? paperApi.downloadUrl(paperId, token) : paperApi.viewUrl(paperId, token);
}

/**
 * Trigger a real browser download of a paper.
 * Uses a temporary anchor so the browser handles the file natively, which keeps
 * memory usage flat even for large PDFs.
 */
export async function downloadPaperFile(paperId) {
  const url = await buildPaperFileUrl(paperId, 'download');
  const anchor = document.createElement('a');
  anchor.href = url;
  // The filename comes from the server's Content-Disposition header.
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/** Open a paper in a new browser tab. */
export async function openPaperInNewTab(paperId) {
  const url = await buildPaperFileUrl(paperId, 'view');
  window.open(url, '_blank', 'noopener,noreferrer');
}
