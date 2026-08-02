import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { FiEye, FiEdit3 } from 'react-icons/fi';

export function TemplateFormModal({ isOpen, onClose, onSubmit, loading = false }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !body) return;
    onSubmit({ title, body });
    setTitle('');
    setBody('');
  };

  const previewBody = body
    ? body.replace(/{{name}}/g, 'Alex Morgan').replace(/{{company}}/g, 'Acme SaaS Corp')
    : 'Template body preview will appear here...';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Email Template" maxWidth="max-w-2xl">
      {/* Editor / Preview Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'editor'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <FiEdit3 className="w-4 h-4" />
          Template Builder
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <FiEye className="w-4 h-4" />
          Live Preview
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === 'editor' ? (
          <>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Template Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Welcome & Onboarding Email"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Email Body Content *
                </label>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  Supports {"{{name}}"} and {"{{company}}"}
                </span>
              </div>
              <textarea
                rows={6}
                required
                placeholder="Hi {{name}},\n\nWelcome to {{company}}! We are thrilled to help you scale your campaigns..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>
          </>
        ) : (
          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[220px]">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Subject Preview
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-base">
                {title || 'Sample Email Title'}
              </p>
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {previewBody}
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <SecondaryButton onClick={onClose} disabled={loading}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" loading={loading} disabled={!title || !body}>
            Save Template
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

export default TemplateFormModal;
