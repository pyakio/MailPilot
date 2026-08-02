import apiClient from '../lib/axios';

export const analyticsService = {
  getSummary: () => apiClient.get('/summary'),
  getAnalytics: () => apiClient.get('/analytics'),
};

export default analyticsService;
