import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Attach JWT from storage on every request (in case page refreshed)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ---- Endpoint API ----
export const endpointApi = {
  list:   ()         => api.get('/endpoints'),
  get:    (id)       => api.get(`/endpoints/${id}`),
  create: (data)     => api.post('/endpoints', data),
  update: (id, data) => api.put(`/endpoints/${id}`, data),
  toggle: (id)       => api.patch(`/endpoints/${id}/toggle`),
  delete: (id)       => api.delete(`/endpoints/${id}`),
}

// ---- Monitoring API ----
export const monitoringApi = {
  runTest:  (id)                        => api.post(`/endpoints/${id}/test`),
  history:  (id, page = 0, size = 20)   => api.get(`/endpoints/${id}/results`, { params: { page, size } }),
  stats:    (id, hours = 24)            => api.get(`/endpoints/${id}/stats`, { params: { hours } }),
}

// ---- Dashboard API ----
export const dashboardApi = {
  summary: () => api.get('/dashboard/summary'),
}

// ---- Alert Rules API ----
export const alertApi = {
  list:   (endpointId)           => api.get(`/endpoints/${endpointId}/alerts`),
  create: (endpointId, data)     => api.post(`/endpoints/${endpointId}/alerts`, data),
  delete: (endpointId, ruleId)   => api.delete(`/endpoints/${endpointId}/alerts/${ruleId}`),
}

export default api
