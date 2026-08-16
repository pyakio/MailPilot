import apiClient from '../lib/axios';

export const contactService = {
  getContacts: () => apiClient.get('/contacts'),
  createContact: (data) => apiClient.post('/contacts', data),
  updateContact: (id, data) => apiClient.put(`/contacts/${id}`, data),    // Previously missing
  deleteContact: (id) => apiClient.delete(`/contacts/${id}`),
  importContacts: (rows) => apiClient.post('/contacts/import', { rows }),
};

export default contactService;
