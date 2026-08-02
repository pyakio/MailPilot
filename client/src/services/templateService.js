import api from './api';

export const templateService = {
  getTemplates: () => api.get('/templates'),
  createTemplate: (data) => api.post('/templates', data),
};

export default templateService;
