import apiClient from '../lib/axios';

export const settingsService = {
  getSettings: () => Promise.resolve({
    fromName: 'Alex from MailPilot',
    replyTo: 'support@mailpilot.com',
    domain: 'mail.mailpilot.com',
    domainStatus: 'VERIFIED',
    apiKey: 'mp_live_9981a88b776211ff09aa',
  }),
  updateSettings: (data) => Promise.resolve({ success: true, ...data }),
};

export default settingsService;
