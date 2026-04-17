import axios from 'axios'
import keycloak from '../keycloak'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Attach the current Keycloak token on every request
api.interceptors.request.use(config => {
  const token = keycloak.token
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// On 401: try to refresh the token once, then redirect to Keycloak login
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true
      try {
        const refreshed = await keycloak.updateToken(30)
        if (refreshed) {
          err.config.headers['Authorization'] = `Bearer ${keycloak.token}`
          return api.request(err.config)
        }
      } catch {
        keycloak.login()
      }
    }
    return Promise.reject(err)
  }
)

// ---- Endpoint API ----
export const endpointApi = {
  list:   (page = 0, size = 10) => api.get('/endpoints', { params: { page, size } }),
  get:    (id)       => api.get(`/endpoints/${id}`),
  create: (data)     => api.post('/endpoints', data),
  update: (id, data) => api.put(`/endpoints/${id}`, data),
  toggle: (id)       => api.patch(`/endpoints/${id}/toggle`),
  delete: (id)       => api.delete(`/endpoints/${id}`),
}

// ---- Monitoring API ----
export const monitoringApi = {
  runTest: (id)                      => api.post(`/endpoints/${id}/test`),
  history: (id, page = 0, size = 20) => api.get(`/endpoints/${id}/results`, { params: { page, size } }),
  stats:   (id, hours = 24)          => api.get(`/endpoints/${id}/stats`,   { params: { hours } }),
}

// ---- Dashboard API ----
export const dashboardApi = {
  summary: () => api.get('/dashboard/summary'),
}

// ---- Alert Rules API ----
export const alertApi = {
  list:   (endpointId)         => api.get(`/endpoints/${endpointId}/alerts`),
  create: (endpointId, data)   => api.post(`/endpoints/${endpointId}/alerts`, data),
  delete: (endpointId, ruleId) => api.delete(`/endpoints/${endpointId}/alerts/${ruleId}`),
}

export default api
