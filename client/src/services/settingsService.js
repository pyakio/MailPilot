import apiClient from '../lib/axios';

export const settingsService = {
  updateProfile: (data) => apiClient.put('/auth/profile', data),
};

export default settingsService;
