import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle unauthorized redirects gracefully
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'Terjadi kesalahan pada sistem',
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      status: error.response?.status,
    };
    return Promise.reject(customError);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const barangApi = {
  getAll: (params) => api.get('/barang', { params }),
  getById: (id) => api.get(`/barang/${id}`),
  create: (data) => api.post('/barang', data),
  update: (id, data) => api.put(`/barang/${id}`, data),
  delete: (id) => api.delete(`/barang/${id}`),
};

export const kendaraanApi = {
  getAll: (params) => api.get('/kendaraan', { params }),
  getById: (id) => api.get(`/kendaraan/${id}`),
  create: (data) => api.post('/kendaraan', data),
  update: (id, data) => api.put(`/kendaraan/${id}`, data),
  delete: (id) => api.delete(`/kendaraan/${id}`),
  getAlerts: () => api.get('/kendaraan/alerts'),
};

export const transaksiApi = {
  getAll: (params) => api.get('/transaksi', { params }),
  getById: (id) => api.get(`/transaksi/${id}`),
  pinjam: (data) => api.post('/transaksi/pinjam', data),
  kembali: (id, data) => api.post(`/transaksi/${id}/kembali`, data),
};

export const activityLogApi = {
  getLogs: (params) => api.get('/activity-log', { params }),
};

export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
};

export default api;
