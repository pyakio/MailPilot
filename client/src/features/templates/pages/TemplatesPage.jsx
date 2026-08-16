import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../shared/ui/Card';
import Button from '../../../shared/ui/Button';
import Input from '../../../shared/ui/Input';
import Badge from '../../../shared/ui/Badge';
import Modal from '../../../shared/ui/Modal';
import Skeleton from '../../../shared/ui/Skeleton';
import TemplateFormModal from '../../../shared/components/forms/TemplateFormModal';
import ConfirmationDialog from '../../../shared/ui/ConfirmationDialog';
import { templateService } from '../../../services/templateService';
import { aiService } from '../../../services/aiService';
import { useToast } from '../../../hooks/useToast';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiFileText,
  FiEye,
  FiSend,
  FiZap,
  FiCopy,
  FiCheck,
  FiImage,
  FiCode,
} from 'react-icons/fi';
import { TemplateThumbnail, getTemplateImageSrc } from '../components/TemplateThumbnail';

const CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'product', label: 'Product & Updates' },
  { id: 'announcement', label: 'Announcements' },
  { id: 'newsletter', label: 'Newsletters' },
  { id: 'promotional', label: 'Promotional & Sales' },
  { id: 'transactional', label: 'Transactional' },
  { id: 'feedback', label: 'Feedback & NPS' },
  { id: 'reengagement', label: 'Win-Back' },
];

export function TemplatesPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewViewMode, setPreviewViewMode] = useState('html'); // 'html' | 'design'
  const [submitting, setSubmitting] = useState(false);

  // AI Template Generator State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiGoal, setAiGoal] = useState('Feature Adoption');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await templateService.getTemplates();
      setTemplates(data);
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.subject && t.subject.toLowerCase().includes(search.toLowerCase())) ||
      (t.category && t.category.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      activeCategory === 'all' ||
      (t.category && t.category.toLowerCase() === activeCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const handleSave = async (payload) => {
    try {
      setSubmitting(true);
      if (editingTemplate) {
        await templateService.updateTemplate(editingTemplate.id, payload);
        addToast({ title: 'Template Saved', message: `"${payload.title}" updated successfully.`, type: 'success' });
      } else {
        await templateService.createTemplate(payload);
        addToast({ title: 'Template Created', message: `"${payload.title}" added to your workspace library.`, type: 'success' });
      }
      setIsModalOpen(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = async (tmpl) => {
    try {
      setSubmitting(true);
      const duplicatePayload = {
        title: `${tmpl.title} (Custom Copy)`,
        subject: tmpl.subject || 'Special Update',
        category: tmpl.category || 'custom',
        body: tmpl.body || '',
        htmlBody: tmpl.htmlBody || '',
        thumbnail: tmpl.thumbnail || `/templates/${tmpl.id}.svg`,
      };
      await templateService.createTemplate(duplicatePayload);
      addToast({ title: 'Template Cloned', message: `Created custom copy of "${tmpl.title}". You can now customize it.`, type: 'success' });
      fetchTemplates();
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
      await templateService.deleteTemplate(deletingId);
      addToast({ title: 'Deleted', message: 'Template removed from workspace.', type: 'info' });
      setDeletingId(null);
      fetchTemplates();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiGenerateTemplate = async (e) => {
    e.preventDefault();
    if (!aiTopic.trim()) {
      addToast({ title: 'Topic Required', message: 'Please describe what this email is about.', type: 'error' });
      return;
    }
    try {
      setAiLoading(true);
      const res = await aiService.generateEmailCopy(aiTopic, aiGoal);
      if (res.copy) {
        await templateService.createTemplate({
          title: `AI: ${aiTopic.slice(0, 36)}`,
          subject: res.copy.subject || 'Special Update',
          body: res.copy.body || '',
          htmlBody: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; color: #1e293b; border-radius: 12px; border: 1px solid #e2e8f0;">${res.copy.body.replace(/\n/g, '<br/>')}</div>`,
          thumbnail: '/templates/tmpl_05.svg',
          category: 'announcement',
        });
        addToast({ title: 'AI Template Generated', message: 'New AI email template generated and added to your library.', type: 'success' });
        setIsAiModalOpen(false);
        setAiTopic('');
        fetchTemplates();
      }
    } catch (err) {
      addToast({ title: 'AI Generation Failed', message: err.message, type: 'error' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleUseInCampaign = (template) => {
    navigate('/campaigns', { state: { selectedTemplateId: template.id } });
  };

  const getCategoryCount = (catId) => {
    if (catId === 'all') return templates.length;
    return templates.filter((t) => t.category && t.category.toLowerCase() === catId.toLowerCase()).length;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#E8A33D] text-xl">⚡</span>
            <h1 className="text-2xl font-bold font-heading text-[var(--text)]">Email Template Library</h1>
            <Badge variant="amber">{templates.length} Ready Templates</Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Pick from 20+ professionally styled SaaS email layouts with live visual previews and full customizer.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            icon={FiZap}
            onClick={() => setIsAiModalOpen(true)}
          >
            AI Template Studio
          </Button>
          <Button
            variant="primary"
            icon={FiPlus}
            onClick={() => { setEditingTemplate(null); setIsModalOpen(true); }}
          >
            New Template
          </Button>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {CATEGORIES.map((cat) => {
            const count = getCategoryCount(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[#E8A33D] text-[#14171C] font-semibold shadow-xs'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] border border-[var(--border)]'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === cat.id ? 'bg-[#14171C]/20 text-[#14171C]' : 'bg-[var(--border)] text-[var(--text-muted)]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="w-full md:w-72 shrink-0">
          <Input
            icon={FiSearch}
            placeholder="Search 20+ templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Templates Grid with Visual Artwork Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[320px] rounded-xl" />
          <Skeleton className="h-[320px] rounded-xl" />
          <Skeleton className="h-[320px] rounded-xl" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="py-16 text-center text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-xl">
          <FiFileText className="w-8 h-8 mx-auto mb-2 text-[#E8A33D]/60" />
          <p className="text-sm font-semibold text-[var(--text)]">No templates found in this category</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Try selecting "All Templates" or adjust your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((t) => (
            <div
              key={t.id}
              className="bg-[var(--surface-card)] border border-[var(--border)] rounded-xl overflow-hidden flex flex-col justify-between card-hover shadow-sm transition-all group"
            >
              {/* Top Visual Image / Vector Preview */}
              <div
                className="relative w-full h-44 overflow-hidden cursor-pointer group/thumb bg-[var(--surface-secondary)] border-b border-[var(--border)] flex items-center justify-center"
                onClick={() => {
                  setPreviewViewMode('html');
                  setPreviewTemplate(t);
                }}
              >
                <TemplateThumbnail
                  template={t}
                  imgClassName="group-hover/thumb:scale-105"
                />
                
                {/* Floating Quick Action Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-[#E8A33D] text-[#14171C] text-xs font-bold font-mono flex items-center gap-1.5 shadow-lg">
                    <FiEye className="w-3.5 h-3.5" />
                    Quick Preview
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <Badge variant="amber" className="capitalize text-[10px] shadow-sm backdrop-blur-md">
                    {t.category || 'General'}
                  </Badge>
                </div>
              </div>

              {/* Card Meta & Body */}
              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold font-heading text-[var(--text)] tracking-tight line-clamp-1 group-hover:text-[#E8A33D] transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-xs font-mono text-[#E8A33D] mt-0.5 truncate" title={t.subject}>
                    Subject: {t.subject || 'No subject configured'}
                  </p>
                </div>

                {/* Content Preview Snippet */}
                <div className="p-2.5 bg-[var(--surface-secondary)] rounded-lg text-[11px] text-[var(--text-secondary)] line-clamp-2 font-mono leading-relaxed border border-[var(--border)]">
                  {t.body?.slice(0, 110) || 'Custom layout...'}
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] mt-auto">
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="xs"
                      variant="outline"
                      icon={FiEye}
                      onClick={() => {
                        setPreviewViewMode('html');
                        setPreviewTemplate(t);
                      }}
                    >
                      Preview
                    </Button>
                    <Button
                      size="xs"
                      variant="primary"
                      icon={FiSend}
                      onClick={() => handleUseInCampaign(t)}
                    >
                      Use
                    </Button>
                  </div>

                  {/* Edit, Clone, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingTemplate(t); setIsModalOpen(true); }}
                      className="p-1.5 text-[var(--text-secondary)] hover:text-[#E8A33D] hover:bg-[var(--surface-hover)] rounded transition-colors"
                      title="Edit / Customize Template"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(t)}
                      className="p-1.5 text-[var(--text-secondary)] hover:text-[#3E6B70] hover:bg-[var(--surface-hover)] rounded transition-colors"
                      title="Duplicate / Clone Template"
                    >
                      <FiCopy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(t.id)}
                      className="p-1.5 text-[var(--text-secondary)] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded transition-colors"
                      title="Delete Template"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rendered HTML & Visual Design Preview Modal */}
      {previewTemplate && (
        <Modal
          isOpen={Boolean(previewTemplate)}
          onClose={() => setPreviewTemplate(null)}
          title={previewTemplate.title}
          subtitle={`Default Subject: ${previewTemplate.subject || 'N/A'}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            {/* View Mode Switcher */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Category: <strong className="text-[var(--text)] capitalize">{previewTemplate.category}</strong>
              </span>

              <div className="flex rounded-lg bg-[var(--surface-secondary)] p-0.5 border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setPreviewViewMode('html')}
                  className={`px-3 py-1 text-xs font-mono rounded-md flex items-center gap-1.5 transition-colors ${
                    previewViewMode === 'html'
                      ? 'bg-[#E8A33D] text-[#14171C] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
                  }`}
                >
                  <FiCode className="w-3 h-3" />
                  Rendered Email
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewMode('design')}
                  className={`px-3 py-1 text-xs font-mono rounded-md flex items-center gap-1.5 transition-colors ${
                    previewViewMode === 'design'
                      ? 'bg-[#E8A33D] text-[#14171C] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
                  }`}
                >
                  <FiImage className="w-3 h-3" />
                  Visual Layout Card
                </button>
              </div>
            </div>

            {/* Preview Frame */}
            {previewViewMode === 'html' ? (
              <div className="p-5 bg-white text-slate-900 rounded-xl max-h-[420px] overflow-y-auto border border-slate-200 shadow-inner">
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      previewTemplate.htmlBody ||
                      `<p style="font-family: sans-serif; padding: 16px; color: #1e293b;">${previewTemplate.body.replace(/\n/g, '<br/>')}</p>`,
                  }}
                />
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[#0F1318] flex items-center justify-center p-2">
                <img
                  src={getTemplateImageSrc(previewTemplate)}
                  alt={previewTemplate.title}
                  className="w-full max-h-[380px] object-contain rounded-lg"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
              <Button
                variant="outline"
                size="sm"
                icon={FiEdit2}
                onClick={() => {
                  const sel = previewTemplate;
                  setPreviewTemplate(null);
                  setEditingTemplate(sel);
                  setIsModalOpen(true);
                }}
              >
                Edit Template
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={FiSend}
                onClick={() => {
                  const sel = previewTemplate;
                  setPreviewTemplate(null);
                  handleUseInCampaign(sel);
                }}
              >
                Use in Campaign
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* AI Generate Template Modal */}
      {isAiModalOpen && (
        <Modal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          title="✨ AI Email Template Studio"
          subtitle="Generate tailored email template layouts powered by MailPilot AI."
        >
          <form onSubmit={handleAiGenerateTemplate} className="space-y-4">
            <Input
              label="What is this email about?"
              required
              placeholder="e.g. Announcing 50% summer discount for annual plans"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-medium text-[var(--text-secondary)] uppercase">
                Goal / Primary CTA
              </label>
              <select
                value={aiGoal}
                onChange={(e) => setAiGoal(e.target.value)}
                className="w-full h-[40px] px-3.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:border-[#E8A33D]"
              >
                <option value="Feature Adoption">Feature Adoption & Clicks</option>
                <option value="Product Launch">Product Launch Announcement</option>
                <option value="Upgrade & Conversion">Upgrade & Plan Conversion</option>
                <option value="Event Registration">Webinar / Event Registration</option>
                <option value="Customer Feedback">Customer Survey & NPS</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border)]">
              <Button variant="outline" size="sm" onClick={() => setIsAiModalOpen(false)} disabled={aiLoading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={aiLoading} icon={FiZap}>
                Generate & Save Template
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create / Edit Template Modal */}
      <TemplateFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingTemplate}
        loading={submitting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Template"
        message="Are you sure you want to delete this template? Any existing campaigns created with this template will retain their compiled copy."
        loading={submitting}
      />
    </div>
  );
}

export default TemplatesPage;
