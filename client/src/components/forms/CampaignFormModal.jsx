import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';

export function CampaignFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  templates = [],
  loading = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    templateId: '',
    list: 'All Contacts',
    scheduledAt: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        subject: initialData.subject || '',
        templateId: initialData.templateId || '',
        list: initialData.list || 'All Contacts',
        scheduledAt: initialData.scheduledAt ? initialData.scheduledAt.slice(0, 16) : '',
      });
    } else {
      setFormData({
        name: '',
        subject: '',
        templateId: templates[0]?.id || '',
        list: 'All Contacts',
        scheduledAt: '',
      });
    }
  }, [initialData, templates, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.subject) return;
    onSubmit({
      ...formData,
      templateId: Number(formData.templateId) || templates[0]?.id || 1,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Campaign' : 'Create New Campaign'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Campaign Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Q3 Product Announcement Drip"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Email Subject Line *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Exclusive 30% Off Your Enterprise Upgrade"
            value={formData.subject}
            onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Select Template
            </label>
            <select
              value={formData.templateId}
              onChange={(e) => setFormData((prev) => ({ ...prev, templateId: e.target.value }))}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            >
              <option value="">Choose a template...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Target List Name
            </label>
            <input
              type="text"
              placeholder="e.g. All Contacts"
              value={formData.list}
              onChange={(e) => setFormData((prev) => ({ ...prev, list: e.target.value }))}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Schedule Send Time (Optional)
          </label>
          <input
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) => setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))}
            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Leave blank to save as instant draft.
          </span>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <SecondaryButton onClick={onClose} disabled={loading}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" loading={loading}>
            {initialData ? 'Update Campaign' : 'Create Campaign'}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

export default CampaignFormModal;
