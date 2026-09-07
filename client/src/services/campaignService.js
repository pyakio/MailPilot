import apiClient from '../lib/axios';

export const campaignService = {
  getCampaigns: () => apiClient.get('/campaigns'),
  getCampaign: (id) => apiClient.get(`/campaigns/${id}`),
  createCampaign: (data) => apiClient.post('/campaigns', data),
  updateCampaign: (id, data) => apiClient.put(`/campaigns/${id}`, data),
  deleteCampaign: (id) => apiClient.delete(`/campaigns/${id}`),
  sendCampaign: (id) => apiClient.post(`/campaigns/${id}/send`),
};

export default campaignService;
