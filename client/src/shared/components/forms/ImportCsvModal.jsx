import React, { useState } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import { FiUploadCloud, FiCheckCircle } from 'react-icons/fi';
import { contactService } from '../../../services/contactService';
import { useToast } from '../../../hooks/useToast';

export function ImportCsvModal({ isOpen, onClose, onImported }) {
  const { addToast } = useToast();
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async (e) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n').filter(Boolean);
    const rows = lines.map((line) => {
      const parts = line.split(',');
      return {
        email: parts[0]?.trim(),
        name: parts[1]?.trim() || '',
        tags: parts[2] ? parts[2].trim().split(';').map(t => t.trim()).filter(Boolean) : ['Imported'],
      };
    }).filter(r => r.email);

    if (rows.length === 0) {
      addToast({ title: 'No Valid Rows', message: 'No valid email addresses found in CSV.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const result = await contactService.importContacts(rows);
      addToast({
        title: 'Import Complete',
        message: `${result.importedCount} contacts imported. ${result.skippedCount} skipped (duplicates).`,
        type: 'success',
      });
      setCsvText('');
      onImported?.();
    } catch (err) {
      addToast({ title: 'Import Failed', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Contacts via CSV"
      subtitle="Paste comma-separated rows: email, name, tag1;tag2"
    >
      <form onSubmit={handleImport} className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
            <FiUploadCloud className="w-4 h-4 text-[#E8A33D]" /> CSV Rows (one per line)
          </label>
          <textarea
            rows={6}
            placeholder={"john@example.com, John Doe, Lead;VIP\njane@example.com, Jane Smith, User"}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full px-3.5 py-2.5 font-mono text-xs bg-[var(--surface-secondary)] text-[var(--text)] placeholder-[var(--text-muted)] border border-[var(--border)] rounded-[10px] focus:outline-none focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D]/30 resize-none"
          />
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Format: <code className="text-[var(--text-secondary)]">email, name, tag1;tag2</code> — name and tags are optional. Duplicate emails are skipped.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border)]">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" icon={FiCheckCircle} loading={loading}>
            Import Contacts
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ImportCsvModal;
