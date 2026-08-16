import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { FiCode, FiEye, FiZap, FiPlus } from 'react-icons/fi';

const CATEGORY_OPTIONS = [
  { value: 'onboarding', label: 'Onboarding & Activation' },
  { value: 'product', label: 'Product & Changelog' },
  { value: 'announcement', label: 'Announcements & Events' },
  { value: 'newsletter', label: 'Newsletters & Digests' },
  { value: 'promotional', label: 'Promotional & Sales' },
  { value: 'transactional', label: 'Transactional & Receipts' },
  { value: 'feedback', label: 'Surveys & Feedback' },
  { value: 'reengagement', label: 'Win-back & Re-engagement' },
  { value: 'custom', label: 'Custom Layout' },
];

export function TemplateFormModal({ isOpen, onClose, onSubmit, initialData = null, loading = false }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('newsletter');
  const [body, setBody] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSubject(initialData.subject || '');
      setCategory(initialData.category || 'newsletter');
      setBody(initialData.body || '');
      setHtmlBody(initialData.htmlBody || '');
    } else {
      setTitle('');
      setSubject('');
      setCategory('newsletter');
      setBody('');
      setHtmlBody('');
    }
    setActiveTab('editor');
  }, [initialData, isOpen]);

  const insertVariable = (varName) => {
    setBody((prev) => `${prev} ${varName}`);
    if (htmlBody) {
      setHtmlBody((prev) => `${prev} ${varName}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title: title.trim(),
      subject: subject.trim(),
      category,
      body: body.trim(),
      htmlBody: htmlBody.trim() || `<div style="font-family: sans-serif; padding: 24px; color: #1e293b;">${body.replace(/\n/g, '<br/>')}</div>`,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Template: ${initialData.title}` : 'Create Email Template'}
      subtitle={initialData ? 'Customize the content, layout, and subject line for this template.' : 'Design a reusable HTML & plain text email template.'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title & Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Template Name"
            required
            placeholder="e.g. Welcome & Quickstart Guide"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-medium text-[var(--text-secondary)] uppercase">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-[42px] px-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[8px] text-sm text-[var(--text)] focus:outline-none focus:border-[#E8A33D]"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Default Subject Line"
          placeholder="e.g. Welcome to {{workspace_name}}, {{first_name}} 🚀"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        {/* Variable Helper Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase">Insert Dynamic Variable:</span>
            {/* Editor vs Preview Tabs */}
            <div className="flex rounded-lg bg-[var(--surface-secondary)] p-0.5 border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-2.5 py-1 text-xs font-mono rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === 'editor'
                    ? 'bg-[#E8A33D] text-[#14171C] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
                }`}
              >
                <FiCode className="w-3 h-3" />
                Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 text-xs font-mono rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-[#E8A33D] text-[#14171C] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
                }`}
              >
                <FiEye className="w-3 h-3" />
                Live Preview
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {['{{first_name}}', '{{email}}', '{{workspace_name}}', '{{unsubscribe_url}}'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => insertVariable(v)}
                className="px-2 py-0.5 text-xs font-mono bg-[var(--surface-secondary)] text-[#E8A33D] border border-[var(--border)] rounded hover:bg-[var(--surface-hover)] transition-colors"
                title="Click to insert"
              >
                + {v}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Editor */}
        {activeTab === 'editor' ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono font-medium text-[var(--text-secondary)] uppercase mb-1">
                HTML Email Layout (Rich / Styled)
              </label>
              <textarea
                rows={6}
                placeholder="<div style='font-family: sans-serif; padding: 24px;'>...</div>"
                value={htmlBody}
                onChange={(e) => setHtmlBody(e.target.value)}
                className="w-full px-3.5 py-2.5 font-mono text-xs bg-[var(--surface-secondary)] text-[var(--text)] placeholder-[var(--text-muted)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[#E8A33D]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-[var(--text-secondary)] uppercase mb-1">
                Plain Text Fallback Body
              </label>
              <textarea
                required
                rows={3}
                placeholder="Hello {{first_name}}, here is your email content..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3.5 py-2.5 font-mono text-xs bg-[var(--surface-secondary)] text-[var(--text)] placeholder-[var(--text-muted)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[#E8A33D]"
              />
            </div>
          </div>
        ) : (
          /* Tab 2: Live Rendered Preview */
          <div className="space-y-2">
            <div className="p-4 bg-white text-slate-900 rounded-lg max-h-[300px] overflow-y-auto border border-slate-200 shadow-inner">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    htmlBody ||
                    `<p style="font-family: sans-serif; padding: 16px; color: #1e293b;">${body ? body.replace(/\n/g, '<br/>') : '<em>Type some content in the editor to see rendered preview...</em>'}</p>`,
                }}
              />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-mono">
              Live simulation of HTML rendering in subscriber inboxes.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border)]">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            {initialData ? 'Save Changes' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TemplateFormModal;
