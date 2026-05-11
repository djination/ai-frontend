import { ContentEngineError, request } from './apiClient';
import { STORAGE_KEYS } from '../constants/storageKeys';

function buildQuery(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      q.set(key, String(value));
    }
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

/** Effective `language` query for learner module endpoints (localStorage overrides build-time env). */
export function getLearnerContentLanguage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEARNER_CONTENT_LANGUAGE);
    if (raw != null && raw.trim() !== '') {
      return raw.trim().toLowerCase();
    }
  } catch {
    /* ignore */
  }
  return import.meta.env.VITE_LEARNER_LANGUAGE?.trim() ?? '';
}

/** Persist learner content filter; pass empty string to clear (falls back to `VITE_LEARNER_LANGUAGE`). */
export function setLearnerContentLanguage(code) {
  try {
    const c = String(code || '').trim().toLowerCase();
    if (!c) {
      localStorage.removeItem(STORAGE_KEYS.LEARNER_CONTENT_LANGUAGE);
    } else {
      localStorage.setItem(STORAGE_KEYS.LEARNER_CONTENT_LANGUAGE, c);
    }
  } catch {
    /* ignore */
  }
}

function learnerLanguageParams() {
  const lang = getLearnerContentLanguage();
  return lang ? { language: lang } : {};
}

export function fetchCurrentModule() {
  return request(`/module/${buildQuery(learnerLanguageParams())}`);
}

export function fetchPublishedModules() {
  return request(`/modules/published/${buildQuery(learnerLanguageParams())}`);
}

export function fetchPublishedModule(moduleId) {
  return request(`/modules/${moduleId}/${buildQuery(learnerLanguageParams())}`);
}

export function discoverIngest(payload) {
  return request('/admin/discover-ingest/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function ingestRawContent(payload) {
  const ingestKey = import.meta.env.VITE_INGEST_API_KEY?.trim();
  return request('/ingest/', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: ingestKey ? { 'X-API-Key': ingestKey } : {},
  });
}

export function fetchRawContents(filters = {}) {
  const q = new URLSearchParams();
  if (filters.category) q.set('category', filters.category);
  if (filters.learning_path) q.set('learning_path', filters.learning_path);
  if (filters.language_code) q.set('language_code', filters.language_code);
  if (filters.language) q.set('language', filters.language);
  if (filters.suggested_difficulty) q.set('suggested_difficulty', filters.suggested_difficulty);
  const qs = q.toString();
  return request(`/admin/raw-content/${qs ? `?${qs}` : ''}`);
}

export function fetchRawContentDetail(rawContentId) {
  return request(`/admin/raw-content/${rawContentId}/`);
}

export function patchRawContent(rawContentId, body) {
  return request(`/admin/raw-content/${rawContentId}/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function createDraftModuleFromRaw(rawContentId, options = {}) {
  return request(`/admin/raw-content/${rawContentId}/draft-module/`, {
    method: 'POST',
    body: JSON.stringify({
      ...(options.difficulty ? { difficulty: options.difficulty } : {}),
      ...(options.module_json ? { module_json: options.module_json } : {}),
    }),
  });
}

export function fetchProcessedModules(filters = {}) {
  const q = new URLSearchParams();
  if (filters.language_code) q.set('language_code', filters.language_code);
  if (filters.language) q.set('language', filters.language);
  if (filters.is_published === true || filters.is_published === false) {
    q.set('is_published', filters.is_published ? 'true' : 'false');
  }
  const qs = q.toString();
  return request(`/admin/processed-modules/${qs ? `?${qs}` : ''}`);
}

export function setModulePublishStatus(moduleId, isPublished, options = {}) {
  return request(`/admin/processed-modules/${moduleId}/`, {
    method: 'PATCH',
    body: JSON.stringify({
      is_published: isPublished,
      ...(options.review_action ? { review_action: options.review_action } : {}),
      ...(typeof options.review_notes === 'string'
        ? { review_notes: options.review_notes }
        : {}),
    }),
  });
}

/** List chat sessions for the current user (newest first). */
export function fetchChatSessions(options = {}) {
  const q = new URLSearchParams();
  if (options.limit != null) q.set('limit', String(options.limit));
  if (options.status) q.set('status', String(options.status));
  const qs = q.toString();
  return request(`/chat/sessions/${qs ? `?${qs}` : ''}`);
}

/** Rename a chat session (custom title). */
export function patchChatSession(sessionKey, body) {
  const sk = encodeURIComponent(String(sessionKey).trim());
  return request(`/chat/sessions/${sk}/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** Soft-delete a chat session. */
export function deleteChatSession(sessionKey) {
  const sk = encodeURIComponent(String(sessionKey).trim());
  return request(`/chat/sessions/${sk}/`, {
    method: 'DELETE',
  });
}

/** Load persisted chat turns for the current JWT user and session (GET). */
export function fetchChatHistory(sessionKey) {
  const q = new URLSearchParams();
  q.set('session_key', String(sessionKey).trim());
  return request(`/chat/history/?${q.toString()}`);
}

export function sendChatMessage({ message, sessionKey, mode, level, moduleContext }) {
  return request('/chat/', {
    method: 'POST',
    body: JSON.stringify({
      message,
      ...(sessionKey ? { session_key: sessionKey } : {}),
      ...(mode ? { mode } : {}),
      ...(level ? { level } : {}),
      ...(moduleContext ? { module_context: moduleContext } : {}),
    }),
  });
}

export { ContentEngineError };

/** Current learner plan + quotas (JWT). */
export function fetchLearnerEntitlement() {
  return request('/me/entitlement/');
}

/** Current learner usage/remaining limits (JWT). */
export function fetchLearnerLimits() {
  return request('/me/limits/');
}

/** Katalog paket (JWT opsional). */
export function fetchBillingPlans() {
  return request('/billing/plans/');
}

/** Catat pilihan upgrade; pembayaran via gateway nanti (JWT wajib). */
export function requestBillingPlanUpgrade(planCode) {
  return request('/billing/request-upgrade/', {
    method: 'POST',
    body: JSON.stringify({ plan_code: planCode }),
  });
}

/**
 * intent: cancel | revoke_cancel | downgrade
 * cancel: default akhir periode; when: 'immediate' menghentikan akses sekarang.
 */
export function manageSubscription({ intent, planCode, when } = {}) {
  return request('/billing/subscription/manage/', {
    method: 'POST',
    body: JSON.stringify({
      intent,
      ...(planCode ? { plan_code: planCode } : {}),
      ...(when ? { when } : {}),
    }),
  });
}

/** Hanya jika backend mengaktifkan BILLING_DEMO_PAYMENT_ENABLED (simulasi bayar). */
export function completeDemoPayment({ planCode } = {}) {
  return request('/billing/demo/complete-payment/', {
    method: 'POST',
    body: JSON.stringify({
      ...(planCode ? { plan_code: planCode } : {}),
    }),
  });
}
