import apiClient from '../lib/axios';

export const campaignService = {
  getCampaigns: () => apiClient.get('/campaigns'),
  createCampaign: (data) => apiClient.post('/campaigns', data),
  updateCampaign: (id, data) => apiClient.put(`/campaigns/${id}`, data),
  deleteCampaign: (id) => apiClient.delete(`/campaigns/${id}`),
  sendCampaignNow: (id) => apiClient.post(`/campaigns/${id}/send`),
};

export default campaignService;
