import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import Input from '../../ui/Input';
import Button from '../../ui/Button';

export function ContactFormModal({ isOpen, onClose, onSubmit, initialData = null, loading = false }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setEmail(initialData.email || '');
      setName(initialData.name || '');
      setTagsInput(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '');
    } else {
      setEmail('');
      setName('');
      setTagsInput('Lead');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({ email, name, tags, subscribed: true });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Subscriber Contact' : 'Add Subscriber Contact'}
      subtitle={initialData ? 'Update contact details and tags.' : 'Manually add a single contact to your subscriber list.'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          required
          placeholder="alex@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Full Name (Optional)"
          placeholder="Alex Morgan"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Tags (Comma Separated)"
          placeholder="Lead, VIP, Product"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border)]">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            {initialData ? 'Save Changes' : 'Add Contact'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ContactFormModal;
