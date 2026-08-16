import apiClient from '../lib/axios';

export const templateService = {
  getTemplates: () => apiClient.get('/templates'),
  getTemplate: (id) => apiClient.get(`/templates/${id}`),
  createTemplate: (data) => apiClient.post('/templates', data),
  updateTemplate: (id, data) => apiClient.put(`/templates/${id}`, data),    // Previously missing
  deleteTemplate: (id) => apiClient.delete(`/templates/${id}`),              // Previously missing
};

export default templateService;
