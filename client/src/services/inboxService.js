// Inbox Service — MailPilot
// API client for mailbox synchronization, thread queries, message actions, and email sending

import apiClient from '../lib/axios';

export const inboxService = {
  /**
   * Fetches paginated threads with label/query filters
   * GET /api/inbox/threads
   */
  getThreads: async (params = {}) => {
    const response = await apiClient.get('/inbox/threads', { params });
    return response.data;
  },

  /**
   * Advanced multi-criteria search
   * GET /api/inbox/search
   */
  searchThreads: async (params = {}) => {
    const response = await apiClient.get('/inbox/search', { params });
    return response.data;
  },

  /**
   * Executes atomic bulk operations on multiple threads
   * POST /api/inbox/batch
   */
  batchAction: async (payload) => {
    const response = await apiClient.post('/inbox/batch', payload);
    return response.data;
  },

  /**
   * Fetches full thread detail including message stream and AI summary
   * GET /api/inbox/threads/:id
   */
  getThread: async (id) => {
    const response = await apiClient.get(`/inbox/threads/${id}`);
    return response.data;
  },

  /**
   * Generates executive AI summary for a thread
   * POST /api/inbox/threads/:id/summarize
   */
  summarizeThread: async (id) => {
    const response = await apiClient.post(`/inbox/threads/${id}/summarize`);
    return response.data;
  },

  /**
   * Generates 3 context-aware smart replies
   * POST /api/inbox/threads/:id/smart-replies
   */
  getSmartReplies: async (id) => {
    const response = await apiClient.post(`/inbox/threads/${id}/smart-replies`);
    return response.data;
  },

  /**
   * Polishes draft text with AI
   * POST /api/inbox/polish
   */
  polishEmail: async (payload) => {
    const response = await apiClient.post('/inbox/polish', payload);
    return response.data;
  },

  /**
   * Dispatches an email message
   * POST /api/inbox/send
   */
  sendEmail: async (payload) => {
    const response = await apiClient.post('/inbox/send', payload);
    return response.data;
  },

  /**
   * Retrieves all email drafts
   * GET /api/inbox/drafts
   */
  getDrafts: async () => {
    const response = await apiClient.get('/inbox/drafts');
    return response.data;
  },

  /**
   * Saves or updates an email draft
   * POST /api/inbox/drafts
   */
  saveDraft: async (payload) => {
    const response = await apiClient.post('/inbox/drafts', payload);
    return response.data;
  },

  /**
   * Deletes an email draft
   * DELETE /api/inbox/drafts/:id
   */
  deleteDraft: async (id) => {
    const response = await apiClient.delete(`/inbox/drafts/${id}`);
    return response.data;
  },

  /**
   * Toggles read/unread state on a thread
   * PATCH /api/inbox/threads/:id/read
   */
  markThreadRead: async (id, isRead = true) => {
    const response = await apiClient.patch(`/api/inbox/threads/${id}/read`, { isRead });
    return response.data;
  },

  /**
   * Toggles starred state on a thread
   * PATCH /api/inbox/threads/:id/star
   */
  markThreadStarred: async (id, isStarred = true) => {
    const response = await apiClient.patch(`/api/inbox/threads/${id}/star`, { isStarred });
    return response.data;
  },

  /**
   * Moves thread to trash
   * POST /api/inbox/threads/:id/trash
   */
  trashThread: async (id) => {
    const response = await apiClient.post(`/api/inbox/threads/${id}/trash`);
    return response.data;
  },

  /**
   * Restores thread from trash
   * POST /api/inbox/threads/:id/untrash
   */
  untrashThread: async (id) => {
    const response = await apiClient.post(`/api/inbox/threads/${id}/untrash`);
    return response.data;
  },

  /**
   * Fetches sidebar inbox badge counts
   * GET /api/inbox/stats
   */
  getInboxStats: async () => {
    const response = await apiClient.get('/inbox/stats');
    return response.data;
  },

  /**
   * Triggers manual Gmail synchronization
   * POST /api/inbox/sync
   */
  syncInbox: async (params = {}) => {
    const response = await apiClient.post('/inbox/sync', null, { params });
    return response.data;
  },

  /**
   * Checks Gmail connection status
   * GET /api/auth/gmail/status
   */
  getGmailStatus: async () => {
    const response = await apiClient.get('/auth/gmail/status');
    return response.data;
  },

  /**
   * Gets Google OAuth connection URL
   * GET /api/auth/google/url
   */
  getGoogleAuthUrl: async (state = '') => {
    const response = await apiClient.get('/auth/google/url', { params: { state } });
    return response.data;
  },

  /**
   * Disconnects Gmail account
   * POST /api/auth/gmail/disconnect
   */
  disconnectGmail: async () => {
    const response = await apiClient.post('/auth/gmail/disconnect');
    return response.data;
  },
};

export default inboxService;
