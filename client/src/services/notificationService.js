import apiClient from '../lib/axios';

export const notificationService = {
  getNotifications: () => apiClient.get('/notifications'),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  clearAll: () => apiClient.delete('/notifications'),
};

export default notificationService;
