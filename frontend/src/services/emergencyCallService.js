import api from './api';

export const emergencyCallService = {
  getAll: async () => {
    const res = await api.get('/emergency-calls');
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/emergency-calls/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/emergency-calls', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/emergency-calls/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/emergency-calls/${id}`);
    return res.data;
  },

  // Core nearest ambulance assignment
  assignNearestAmbulance: async (id) => {
    const res = await api.post(`/emergency-calls/${id}/assign`);
    return res.data;
  },

  startEmergency: async (id) => {
    const res = await api.post(`/emergency-calls/${id}/start`);
    return res.data;
  },

  completeEmergency: async (id) => {
    const res = await api.post(`/emergency-calls/${id}/complete`);
    return res.data;
  },

  cancelEmergency: async (id) => {
    const res = await api.post(`/emergency-calls/${id}/cancel`);
    return res.data;
  }
};
