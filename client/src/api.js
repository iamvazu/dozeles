// Tiny API client. In dev, Vite proxies /api to http://localhost:4000.
// In production the Node server serves the built app, so same-origin works.
const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const token = sessionStorage.getItem('dz_token');
  const res = await fetch(BASE + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 
        Authorization: `Bearer ${token}`,
        'X-Access-Token': token
      } : {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body: JSON.stringify(body) }),
  put: (p, body) => request(p, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (p, body) => request(p, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (p) => request(p, { method: 'DELETE' }),
};
