import apiClient from '../lib/axios';

export const authService = {
  login: async (email, password) => {
    // Service abstraction layer for authentication
    return Promise.resolve({
      id: 'usr_9981',
      name: email ? email.split('@')[0].replace('.', ' ') : 'Alex Morgan',
      email: email || 'alex.morgan@mailpilot.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Head of Growth',
      company: 'MailPilot Inc.',
      plan: 'Enterprise Pro',
    });
  },
  logout: async () => {
    return Promise.resolve({ success: true });
  },
  getStatus: () => apiClient.get('/status'),
};

export default authService;
