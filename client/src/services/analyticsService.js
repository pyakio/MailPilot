import api from './api';

export const analyticsService = {
  getSummary: () => api.get('/summary'),
  getAnalytics: () => api.get('/analytics'),
};

export default analyticsService;
