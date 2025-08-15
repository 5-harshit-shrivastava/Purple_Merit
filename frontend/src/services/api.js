import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://purplemerit-backend.onrender.com/api'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const unwrap = (res) => res.data?.data ?? res.data

const apiService = {
  // Auth
  register: (payload) => api.post('/auth/register', payload).then(unwrap),
  login: async (payload) => {
    const res = await api.post('/auth/login', payload).then(unwrap)
    if (res?.token) {
      localStorage.setItem('authToken', res.token)
      if (res.user) localStorage.setItem('user', JSON.stringify(res.user))
    }
    return res
  },
  profile: () => api.get('/auth/profile').then(unwrap),
  logout: () => { localStorage.removeItem('authToken'); localStorage.removeItem('user') },

  // Drivers
  getDrivers: () => api.get('/drivers').then(unwrap),
  getDriver: (id) => api.get(`/drivers/${id}`).then(unwrap),
  createDriver: (data) => api.post('/drivers', data).then(unwrap),
  updateDriver: (id, data) => api.put(`/drivers/${id}`, data).then(unwrap),
  deleteDriver: (id) => api.delete(`/drivers/${id}`).then(unwrap),

  // Routes
  getRoutes: () => api.get('/routes').then(unwrap),
  getRoute: (id) => api.get(`/routes/${id}`).then(unwrap),
  getRouteByRouteId: (routeId) => api.get(`/routes/route/${routeId}`).then(unwrap),
  createRoute: (data) => api.post('/routes', data).then(unwrap),
  updateRoute: (id, data) => api.put(`/routes/${id}`, data).then(unwrap),
  deleteRoute: (id) => api.delete(`/routes/${id}`).then(unwrap),

  // Orders
  getOrders: () => api.get('/orders').then(unwrap),
  getOrder: (id) => api.get(`/orders/${id}`).then(unwrap),
  createOrder: (data) => api.post('/orders', data).then(unwrap),
  updateOrder: (id, data) => api.put(`/orders/${id}`, data).then(unwrap),
  deleteOrder: (id) => api.delete(`/orders/${id}`).then(unwrap),

  // Simulation
  runSimulation: (payload) => api.post('/simulation/run', payload).then(unwrap),
  getSimulationHistory: () => api.get('/simulation/history').then(unwrap),

  // Data Management
  loadInitialData: () => api.post('/data/load-initial').then(unwrap),
  uploadCSV: (formData) => api.post('/data/upload-csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(unwrap),
  loadJSON: (payload) => api.post('/data/load-json', payload).then(unwrap),
  getStats: () => api.get('/data/stats').then(unwrap),

  // Health
  health: () => api.get('/health').then(unwrap)
}

export default apiService


