import api from './api';

export const campaignService = {
  getCampaigns: () => api.get('/campaigns'),
  createCampaign: (data) => api.post('/campaigns', data),
  updateCampaign: (id, data) => api.put(`/campaigns/${id}`, data),
  deleteCampaign: (id) => api.delete(`/campaigns/${id}`),
  sendCampaignNow: (id) => api.post(`/campaigns/${id}/send`),
};

export default campaignService;
