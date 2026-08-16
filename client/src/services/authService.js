import apiClient from '../lib/axios';

export const authService = {
  /**
   * Register with email + password
   * POST /api/auth/register
   */
  register: async (name, email, password) => {
    return apiClient.post('/auth/register', { name, email, password });
  },

  /**
   * Sign in with email + password
   * POST /api/auth/login
   */
  login: async (email, password) => {
    return apiClient.post('/auth/login', { email, password });
  },

  /**
   * Sign in / sign up with Google credential
   * POST /api/auth/google
   * credential: the JWT from Google Identity Services
   */
  loginWithGoogle: async (credential, name, email) => {
    return apiClient.post('/auth/google', { credential, name, email });
  },

  /**
   * Sign out — clears httpOnly cookie on server
   * POST /api/auth/logout
   */
  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  /**
   * Get current authenticated user from token
   * GET /api/auth/me
   */
  getMe: async () => {
    return apiClient.get('/auth/me');
  },

  /**
   * Request password reset link
   * POST /api/auth/forgot-password
   */
  forgotPassword: async (email) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   * POST /api/auth/reset-password
   */
  resetPassword: async (token, newPassword) => {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  },

  /**
   * Server health check
   * GET /api/status
   */
  getStatus: () => apiClient.get('/status'),
};

export default authService;

