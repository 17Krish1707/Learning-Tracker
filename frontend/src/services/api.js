// ─── API Service Layer ─────────────────────────────────────────────────────
// Single source of truth for all backend calls.
// Reads JWT from localStorage and attaches it automatically.

const BASE = '';  // same-origin in production, proxied via vite in dev

function getToken() {
  try {
    const u = localStorage.getItem('lt_user');
    return u ? JSON.parse(u).token : null;
  } catch {
    return null;
  }
}

async function request(method, path, body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

export async function uploadFile(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE}/api/upload`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data;
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  googleLogin: (accessToken) => request('POST', '/api/auth/google', { accessToken }),
  getMe:       ()            => request('GET',  '/api/auth/me'),
  updateMe:    (data)        => request('PUT',  '/api/auth/me', data),
};

// ─── Folders ───────────────────────────────────────────────────────────────
export const foldersAPI = {
  getAll:  ()           => request('GET',    '/api/folders'),
  create:  (data)       => request('POST',   '/api/folders', data),
  update:  (id, data)   => request('PUT',    `/api/folders/${id}`, data),
  remove:  (id)         => request('DELETE', `/api/folders/${id}`),
};

// ─── Subjects ──────────────────────────────────────────────────────────────
export const subjectsAPI = {
  getAll:  ()           => request('GET',    '/api/subjects'),
  create:  (data)       => request('POST',   '/api/subjects', data),
  update:  (id, data)   => request('PUT',    `/api/subjects/${id}`, data),
  remove:  (id)         => request('DELETE', `/api/subjects/${id}`),
};

// ─── Topics ────────────────────────────────────────────────────────────────
export const topicsAPI = {
  getBySubject: (subjectId) => request('GET',    `/api/topics/${subjectId}`),
  create:       (data)      => request('POST',   '/api/topics', data),
  update:       (id, data)  => request('PUT',    `/api/topics/${id}`, data),
  remove:       (id)        => request('DELETE', `/api/topics/${id}`),
};

// ─── Sessions ──────────────────────────────────────────────────────────────
export const sessionsAPI = {
  create:        (data)        => request('POST',   '/api/sessions', data),
  getByTopic:    (topicId)     => request('GET',    `/api/sessions/${topicId}`),
  getAll:        ()            => request('GET',    '/api/sessions'),
  remove:        (id)          => request('DELETE', `/api/sessions/${id}`),
  getTodayStats: ()            => request('GET',    '/api/sessions/stats/today'),
};

// ─── Stats ─────────────────────────────────────────────────────────────────
export const statsAPI = {
  getOverall:  () => request('GET', '/api/stats'),
  getSubjects: () => request('GET', '/api/stats/subjects'),
};