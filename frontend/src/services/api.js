import axios from 'axios';

// With Vite proxy, /api goes to backend; in production use env var
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 90000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  console.log(`API → ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

api.interceptors.response.use(
  res => res.data,
  err => {
    const message = err.response?.data?.error || err.message || 'Error de conexión';
    return Promise.reject(new Error(message));
  }
);

export const auditsAPI = {
  list: () => api.get('/audits'),
  get: (id) => api.get(`/audits/${id}`),
  create: (data) => api.post('/audits', data),
  update: (id, data) => api.put(`/audits/${id}`, data),
  delete: (id) => api.delete(`/audits/${id}`),
  generatePlan: (id) => api.post(`/audits/${id}/generate-plan`),
  getChecklist: (id) => api.get(`/audits/${id}/checklist`),
  getLogs: (id) => api.get(`/audits/${id}/logs`),
  batchUpdatePhases: (id, statusMap) => api.patch(`/audits/${id}/phases/batch-status`, { statusMap }),
  updatePhase: (auditId, phaseId, data) => api.put(`/audits/${auditId}/phases/${phaseId}`, data),
  updateRequirement: (auditId, reqId, data) => api.put(`/audits/${auditId}/requirements/${reqId}`, data),
};

export const aiAPI = {
  chat: (message, audit_id) => api.post('/ai/chat', { message, audit_id }),
  getKnowledge: (category) => api.get('/ai/knowledge', { params: { category } }),
  getKnowledgeDetail: (id) => api.get(`/ai/knowledge/${id}`),
  searchKnowledge: (query, category, limit) => api.post('/ai/knowledge/search', { query, category, limit }),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
