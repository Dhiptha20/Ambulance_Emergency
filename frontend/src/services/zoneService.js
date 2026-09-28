import api from './api';

export const zoneService = {
  getAll: async () => {
    const res = await api.get('/zones');
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/zones/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/zones', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/zones/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/zones/${id}`);
    return res.data;
  }
};
