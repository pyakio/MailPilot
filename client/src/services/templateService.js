import apiClient from '../lib/axios';

export const templateService = {
  getTemplates: () => apiClient.get('/templates'),
  createTemplate: (data) => apiClient.post('/templates', data),
};

export default templateService;
