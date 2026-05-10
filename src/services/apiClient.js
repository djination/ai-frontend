import {
  clearAuthSession,
  getAccessToken,
  refreshAccessToken,
} from './authSession';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/content-engine';

export class ContentEngineError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, body?: unknown }} [meta]
   */
  constructor(message, meta = {}) {
    super(message);
    this.name = 'ContentEngineError';
    this.status = meta.status;
    this.body = meta.body;
  }
}

async function parseBody(response) {
  return response.json().catch(() => null);
}

async function send(path, options = {}) {
  const token = getAccessToken();
  return fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });
}

export async function request(path, options = {}) {
  let response = await send(path, options);

  if (response.status === 401) {
    try {
      await refreshAccessToken();
      response = await send(path, options);
    } catch {
      clearAuthSession();
    }
  }

  const body = await parseBody(response);
  if (!response.ok) {
    const message = body?.error ?? body?.message ?? 'Unexpected server error';
    throw new ContentEngineError(message, { status: response.status, body });
  }

  return body;
}
