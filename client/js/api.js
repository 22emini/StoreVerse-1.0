/**
 * StoreVerse API Client
 * Centralized fetch wrapper for all backend communication.
 */
const API_BASE = 'http://localhost:5000/api';

const api = {
  async request(method, path, body = null) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body && method !== 'GET') {
      opts.body = JSON.stringify(body);
    }
    try {
      const res = await fetch(`${API_BASE}${path}`, opts);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = (data && data.message) || `Request failed (${res.status})`;
        throw new Error(msg);
      }
      return data;
    } catch (err) {
      // Re-throw with a cleaner message so callers can show toasts
      throw err;
    }
  },

  get(path)        { return this.request('GET', path); },
  post(path, body) { return this.request('POST', path, body); },
  put(path, body)  { return this.request('PUT', path, body); },
  patch(path, body){ return this.request('PATCH', path, body); },
  del(path)        { return this.request('DELETE', path); },
};

// Make globally available
window.api = api;
