import apiClient from '../lib/axios';

export const aiService = {
  askAssistant: (messages, provider) =>
    apiClient.post('/ai/assistant', { messages, provider }),

  getSubjectLines: (data) =>
    apiClient.post('/ai/subject-lines', data),

  getEmailCopy: (data) =>
    apiClient.post('/ai/email-copy', data),

  checkSpamRisk: (data) =>
    apiClient.post('/ai/spam-check', data),
};

export default aiService;
