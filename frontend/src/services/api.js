import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://purple-merit.onrender.com';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token expiration
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(credentials) {
    const response = await this.client.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async register(userData) {
    const response = await this.client.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Simulation endpoints
  async runSimulation(params) {
    const response = await this.client.post('/simulation/run', params);
    return response.data;
  }

  async getSimulationHistory(limit = 10) {
    const response = await this.client.get(`/simulation/history?limit=${limit}`);
    return response.data;
  }

  // Driver endpoints
  async getDrivers() {
    const response = await this.client.get('/drivers');
    return response.data;
  }

  async createDriver(driverData) {
    const response = await this.client.post('/drivers', driverData);
    return response.data;
  }

  async updateDriver(id, driverData) {
    const response = await this.client.put(`/drivers/${id}`, driverData);
    return response.data;
  }

  async deleteDriver(id) {
    const response = await this.client.delete(`/drivers/${id}`);
    return response.data;
  }

  // Route endpoints
  async getRoutes() {
    const response = await this.client.get('/routes');
    return response.data;
  }

  async createRoute(routeData) {
    const response = await this.client.post('/routes', routeData);
    return response.data;
  }

  async updateRoute(id, routeData) {
    const response = await this.client.put(`/routes/${id}`, routeData);
    return response.data;
  }

  async deleteRoute(id) {
    const response = await this.client.delete(`/routes/${id}`);
    return response.data;
  }

  // Order endpoints
  async getOrders() {
    const response = await this.client.get('/orders');
    return response.data;
  }

  async createOrder(orderData) {
    const response = await this.client.post('/orders', orderData);
    return response.data;
  }

  async updateOrder(id, orderData) {
    const response = await this.client.put(`/orders/${id}`, orderData);
    return response.data;
  }

  async deleteOrder(id) {
    const response = await this.client.delete(`/orders/${id}`);
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;