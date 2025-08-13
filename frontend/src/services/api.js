import axios from 'axios';
import { toast } from 'sonner';

// Create an Axios instance.
// Vite exposes environment variables on `import.meta.env`.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Add a request interceptor to include the JWT token in every request.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle data unwrapping and errors globally.
apiClient.interceptors.response.use(
  (response) => {
    // Your backend wraps successful responses like { success: true, data: [...] }
    // We can return the inner `data` object directly to the components.
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    // Show a toast notification for any API error.
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

// Define all your API calls in one place.
const apiService = {
  // Auth
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },
  getProfile: () => apiClient.get('/auth/profile'),
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Drivers
  getDrivers: () => apiClient.get('/drivers'),
  getDriver: (id) => apiClient.get(`/drivers/${id}`),
  createDriver: (driverData) => apiClient.post('/drivers', driverData),
  updateDriver: (id, driverData) => apiClient.put(`/drivers/${id}`, driverData),
  deleteDriver: (id) => apiClient.delete(`/drivers/${id}`),

  // Routes
  getRoutes: () => apiClient.get('/routes'),
  getRoute: (id) => apiClient.get(`/routes/${id}`),
  getRouteByRouteId: (routeId) => apiClient.get(`/routes/route/${routeId}`),
  createRoute: (routeData) => apiClient.post('/routes', routeData),
  updateRoute: (id, routeData) => apiClient.put(`/routes/${id}`, routeData),
  deleteRoute: (id) => apiClient.delete(`/routes/${id}`),

  // Orders
  getOrders: () => apiClient.get('/orders'),
  getOrder: (id) => apiClient.get(`/orders/${id}`),
  createOrder: (orderData) => apiClient.post('/orders', orderData),
  updateOrder: (id, orderData) => apiClient.put(`/orders/${id}`, orderData),
  deleteOrder: (id) => apiClient.delete(`/orders/${id}`),

  // Simulation
  runSimulation: (simulationData) => apiClient.post('/simulation/run', simulationData),
  getSimulationHistory: () => apiClient.get('/simulation/history'),

  // Data
  loadInitialData: () => apiClient.post('/data/load-initial'),
  uploadCSV: (csvData) => apiClient.post('/data/upload-csv', csvData),
  loadJSON: (jsonData) => apiClient.post('/data/load-json', jsonData),
  getStats: () => apiClient.get('/data/stats'),

  // Health check
  healthCheck: () => apiClient.get('/health'),
};

export default apiService;