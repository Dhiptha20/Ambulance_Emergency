import api from './api';

export const ambulanceService = {
  getAll: async () => {
    const res = await api.get('/ambulances');
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/ambulances/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/ambulances', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/ambulances/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/ambulances/${id}`);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.patch(`/ambulances/${id}/status`, { status });
    return res.data;
  },

  updateCurrentZone: async (id, zoneId) => {
    const res = await api.patch(`/ambulances/${id}/zone`, { zoneId });
    return res.data;
  }
};
