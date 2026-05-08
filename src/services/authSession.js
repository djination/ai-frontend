import { STORAGE_KEYS } from '../constants/storageKeys';

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL ?? 'http://127.0.0.1:8000/api/auth';

function parseJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return localStorage.getItem(STORAGE_KEYS.AUTH_ACCESS_TOKEN) ?? '';
}

export function getRefreshToken() {
  return localStorage.getItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN) ?? '';
}

export function saveAuthTokens({ access, refresh }) {
  localStorage.setItem(STORAGE_KEYS.AUTH_ACCESS_TOKEN, access);
  localStorage.setItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN, refresh);
  localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
}

export function clearAuthSession() {
  localStorage.removeItem(STORAGE_KEYS.AUTH_ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
}

export function isAccessTokenExpired() {
  const token = getAccessToken();
  const payload = parseJwtPayload(token);
  if (!payload?.exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}

export async function loginWithCredentials(username, password) {
  const response = await fetch(`${AUTH_BASE_URL}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.detail ?? 'Login gagal');
  }

  saveAuthTokens(body);
  return body;
}

export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearAuthSession();
    throw new Error('Refresh token tidak tersedia');
  }

  const response = await fetch(`${AUTH_BASE_URL}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.access) {
    clearAuthSession();
    throw new Error(body?.detail ?? 'Session berakhir, silakan login ulang');
  }

  localStorage.setItem(STORAGE_KEYS.AUTH_ACCESS_TOKEN, body.access);
  return body.access;
}

export async function fetchCurrentUser() {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Belum login');
  }

  const response = await fetch(`${AUTH_BASE_URL}/me/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.detail ?? 'Gagal memuat profil');
  }
  return body;
}
