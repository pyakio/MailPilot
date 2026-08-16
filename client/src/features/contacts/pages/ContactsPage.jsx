import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../../shared/ui/Card';
import Button from '../../../shared/ui/Button';
import Input from '../../../shared/ui/Input';
import Badge from '../../../shared/ui/Badge';
import Skeleton from '../../../shared/ui/Skeleton';
import Table from '../../../shared/ui/Table';
import Dropdown from '../../../shared/ui/Dropdown';
import ContactFormModal from '../../../shared/components/forms/ContactFormModal';
import ImportCsvModal from '../../../shared/components/forms/ImportCsvModal';
import ConfirmationDialog from '../../../shared/ui/ConfirmationDialog';
import { contactService } from '../../../services/contactService';
import { useToast } from '../../../hooks/useToast';
import { formatDate } from '../../../utils/formatters';
import {
  FiPlus,
  FiUploadCloud,
  FiSearch,
  FiMoreHorizontal,
  FiEdit2,
  FiTrash2,
  FiUsers,
} from 'react-icons/fi';

export function ContactsPage() {
  const { addToast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await contactService.getContacts();
      setContacts(data);
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const filteredContacts = contacts.filter(
    (c) =>
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
      (c.tags && c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())))
  );

  const handleSave = async (payload) => {
    try {
      setSubmitting(true);
      if (editingContact) {
        await contactService.updateContact(editingContact.id, payload);
        addToast({ title: 'Success', message: 'Contact updated.', type: 'success' });
      } else {
        await contactService.createContact(payload);
        addToast({ title: 'Success', message: 'Contact added.', type: 'success' });
      }
      setIsModalOpen(false);
      setEditingContact(null);
      fetchContacts();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await contactService.deleteContact(deletingId);
      addToast({ title: 'Deleted', message: 'Contact removed.', type: 'info' });
      setDeletingId(null);
      fetchContacts();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Storytelling Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#E8A33D] text-xl">⚡</span>
            <h1 className="text-2xl font-bold font-heading text-[var(--text)]">Audience</h1>
            <Badge variant="amber">{contacts.length} Subscribers</Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage subscribers, segments, and audience engagement insights.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" icon={FiUploadCloud} onClick={() => setIsImportModalOpen(true)}>
            Import CSV
          </Button>
          <Button variant="primary" icon={FiPlus} onClick={() => { setEditingContact(null); setIsModalOpen(true); }}>
            Add Contact
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <Input
          icon={FiSearch}
          placeholder="Search audience by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Contacts Table */}
      <Card noPadding>
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-[68px]" />
            <Skeleton className="h-[68px]" />
            <Skeleton className="h-[68px]" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="py-12 text-center text-[var(--text-muted)]">
            <p className="text-[14px]">No contacts found matching search criteria.</p>
          </div>
        ) : (
          <Table headers={['Name & Email', 'Status', 'Tags', 'Subscribed Date', 'Actions']}>
            {filteredContacts.map((c, idx) => (
              <tr key={c.id} className="h-[64px] hover:bg-[var(--surface-hover)] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-[var(--text)] text-[14px]">{c.name || 'Unnamed Subscriber'}</div>
                  <div className="text-[12px] text-[var(--text-secondary)] font-mono">{c.email}</div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={c.subscribed ? 'success' : 'danger'}>
                    {c.subscribed ? 'Subscribed' : 'Unsubscribed'}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {(c.tags || ['Lead']).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-[var(--surface-secondary)] text-[11px] font-mono text-[var(--text-secondary)] rounded-full border border-[var(--border)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)] font-mono">
                  {c.createdAt ? formatDate(c.createdAt) : 'Recently'}
                </td>
                <td className="px-6 py-4 text-right">
                  <Dropdown
                    trigger={
                      <button className="p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors">
                        <FiMoreHorizontal className="w-4 h-4" />
                      </button>
                    }
                    items={[
                      { label: 'Edit Contact', icon: FiEdit2, onClick: () => { setEditingContact(c); setIsModalOpen(true); } },
                      { label: 'Delete Contact', icon: FiTrash2, danger: true, onClick: () => setDeletingId(c.id) },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <ContactFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingContact}
        loading={submitting}
      />

      <ConfirmationDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Contact"
        message="Are you sure you want to remove this contact?"
        loading={submitting}
      />

      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImported={() => { setIsImportModalOpen(false); fetchContacts(); }}
      />
    </div>
  );
}

export default ContactsPage;
