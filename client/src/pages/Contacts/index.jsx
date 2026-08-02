import { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { SearchBar } from '../../components/ui/SearchBar';
import { ContactsTable } from '../../components/tables/ContactsTable';
import { ContactFormModal } from '../../components/forms/ContactFormModal';
import { ImportCsvModal } from '../../components/forms/ImportCsvModal';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import { contactService } from '../../services/contactService';
import { useToast } from '../../hooks/useToast';
import { useDebounce } from '../../hooks/useDebounce';
import { FiUserPlus, FiUploadCloud, FiUsers } from 'react-icons/fi';

export function Contacts() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const debouncedSearch = useDebounce(search, 250);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await contactService.getContacts();
      setContacts(res);
    } catch (err) {
      addToast({ title: 'Error Loading Contacts', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Extract unique tags for tag filter
  const allTags = useMemo(() => {
    const tagSet = new Set();
    contacts.forEach((c) => {
      if (Array.isArray(c.tags)) {
        c.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet);
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesTag =
        selectedTag === 'all' || (Array.isArray(c.tags) && c.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    });
  }, [contacts, debouncedSearch, selectedTag]);

  const pageSize = 10;
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredContacts.slice(start, start + pageSize);
  }, [filteredContacts, currentPage]);

  const handleAddContact = async (data) => {
    try {
      setSubmitting(true);
      await contactService.createContact(data);
      addToast({ title: 'Contact Added', message: `Added "${data.email}" to contact list.`, type: 'success' });
      setIsContactModalOpen(false);
      fetchContacts();
    } catch (err) {
      addToast({ title: 'Add Contact Failed', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImportCsv = async (rows) => {
    try {
      setSubmitting(true);
      const res = await contactService.importContacts(rows);
      addToast({
        title: 'Contacts Imported!',
        message: `Successfully added ${res.importedCount} new subscribers.`,
        type: 'success',
      });
      setIsImportModalOpen(false);
      fetchContacts();
    } catch (err) {
      addToast({ title: 'Import Failed', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await contactService.deleteContact(deletingId);
      addToast({ title: 'Contact Deleted', message: 'Removed contact from system.', type: 'info' });
      setDeletingId(null);
      fetchContacts();
    } catch (err) {
      addToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact List Manager"
        description="Organize subscribers, manage audience tags, and import bulk contacts via CSV."
        badge={`${contacts.length} Subscribers`}
        actions={
          <>
            <SecondaryButton icon={FiUploadCloud} onClick={() => setIsImportModalOpen(true)}>
              Import CSV
            </SecondaryButton>
            <PrimaryButton icon={FiUserPlus} onClick={() => setIsContactModalOpen(true)}>
              Add Contact
            </PrimaryButton>
          </>
        }
      />

      {/* Header & Tag Filters */}
      <Card noPadding>
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
          <SearchBar value={search} onChange={setSearch} placeholder="Search contacts by name or email..." />

          {/* Tag Dropdown filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter Tag:</span>
            <select
              value={selectedTag}
              onChange={(e) => { setSelectedTag(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="all">All Tags ({contacts.length})</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  Tag: {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <SkeletonLoader type="table" count={5} />
        ) : paginatedContacts.length === 0 ? (
          <EmptyState
            title="No contacts found"
            description={search ? `No subscriber matches "${search}".` : 'Add or import subscribers to build your audience.'}
            actionLabel="Add Contact"
            onAction={() => setIsContactModalOpen(true)}
            icon={FiUsers}
          />
        ) : (
          <>
            <ContactsTable
              contacts={paginatedContacts}
              onDelete={(id) => setDeletingId(id)}
              deletingId={submitting ? deletingId : null}
            />
            <Pagination
              currentPage={currentPage}
              totalItems={filteredContacts.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </Card>

      {/* Modals */}
      <ContactFormModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSubmit={handleAddContact}
        loading={submitting}
      />

      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSubmit={handleImportCsv}
        loading={submitting}
      />

      <ConfirmationDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteContact}
        title="Delete Subscriber"
        message="Are you sure you want to remove this subscriber from your audience list?"
        loading={submitting}
      />
    </div>
  );
}

export default Contacts;
