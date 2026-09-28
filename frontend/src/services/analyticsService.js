import api from './api';

export const analyticsService = {
  getSummary: async () => {
    const res = await api.get('/analytics/summary');
    return res.data;
  },

  getAverageResponseTime: async ({ zone, startDate, endDate } = {}) => {
    const params = {};
    if (zone && zone !== 'ALL') params.zone = zone;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const res = await api.get('/analytics/average-response-time', { params });
    return res.data;
  }
};
