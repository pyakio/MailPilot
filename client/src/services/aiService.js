import apiClient from '../lib/axios';

// AI requests call Gemini which can take up to 30-40s — override the global 15s timeout
const AI_TIMEOUT = 60000;

export const aiService = {
  askAssistant: (messages, provider) =>
    apiClient.post('/ai/assistant', { messages, provider }, { timeout: AI_TIMEOUT }),

  getSubjectLines: (data) =>
    apiClient.post('/ai/subject-lines', data, { timeout: AI_TIMEOUT }),

  getEmailCopy: (data) =>
    apiClient.post('/ai/email-copy', data, { timeout: AI_TIMEOUT }),

  checkSpamRisk: (data) =>
    apiClient.post('/ai/spam-check', data),
};

export default aiService;
