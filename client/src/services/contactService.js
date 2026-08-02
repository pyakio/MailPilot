import api from './api';

export const contactService = {
  getContacts: () => api.get('/contacts'),
  createContact: (data) => api.post('/contacts', data),
  deleteContact: (id) => api.delete(`/contacts/${id}`),
  importContacts: (rows) => api.post('/contacts/import', { rows }),
};

export default contactService;
