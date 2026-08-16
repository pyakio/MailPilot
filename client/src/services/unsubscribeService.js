import apiClient from '../lib/axios';

export const unsubscribeService = {
  verifyToken: (token) => apiClient.get(`/unsubscribe/verify/${token}`),
  submitUnsubscribe: (token) => apiClient.post(`/unsubscribe/${token}`),
};

export default unsubscribeService;
