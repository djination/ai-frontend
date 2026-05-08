import { request } from './apiClient';

export function fetchCurrentModule() {
  return request('/module/');
}

export function ingestRawContent(payload) {
  return request('/ingest/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchRawContents() {
  return request('/admin/raw-content/');
}

export function fetchProcessedModules() {
  return request('/admin/processed-modules/');
}

export function setModulePublishStatus(moduleId, isPublished) {
  return request(`/admin/processed-modules/${moduleId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ is_published: isPublished }),
  });
}
