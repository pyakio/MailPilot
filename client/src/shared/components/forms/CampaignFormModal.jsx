import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import { aiService } from '../../../services/aiService';
import { useToast } from '../../../hooks/useToast';
import { FiCpu, FiCheck, FiAlertCircle, FiZap, FiShield } from 'react-icons/fi';

export function CampaignFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  templates = [],
  loading = false,
}) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    templateId: '',
    scheduledAt: '',
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAiModal, setShowAiModal] = useState(false);
  const [spamAnalysis, setSpamAnalysis] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        subject: initialData.subject || '',
        content: initialData.content || '',
        templateId: initialData.templateId || '',
        scheduledAt: initialData.scheduledAt ? initialData.scheduledAt.substring(0, 16) : '',
      });
    } else {
      setFormData({ name: '', subject: '', content: '', templateId: '', scheduledAt: '' });
    }
    setAiSuggestions([]);
    setShowAiModal(false);
  }, [initialData, isOpen]);

  // Live Spam Check debounce
  useEffect(() => {
    if (!formData.subject && !formData.content) {
      setSpamAnalysis(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await aiService.checkSpamRisk({ subject: formData.subject, content: formData.content });
        if (res.analysis) {
          setSpamAnalysis(res.analysis);
        }
      } catch {
        // Ignore live check error
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [formData.subject, formData.content]);

  const handleGenerateAiSubjects = async () => {
    const topic = formData.name || formData.subject || 'Special Product Announcement';
    try {
      setAiLoading(true);
      const res = await aiService.getSubjectLines({ topic, audience: 'Subscribers', tone: 'Engaging' });
      if (res.suggestions && res.suggestions.length > 0) {
        setAiSuggestions(res.suggestions);
        setShowAiModal(true);
      }
    } catch (err) {
      addToast({ title: 'AI Assistant Error', message: err.message, type: 'error' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectSuggestion = (subject) => {
    setFormData((prev) => ({ ...prev, subject }));
    setShowAiModal(false);
    addToast({ title: 'Subject Applied', message: 'AI subject line set.', type: 'success' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      status: formData.scheduledAt ? 'SCHEDULED' : 'DRAFT',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Campaign' : 'Create Campaign'}
      subtitle="Configure email broadcast parameters, AI optimization, and template selection."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Campaign Name"
          required
          placeholder="e.g. Q3 Product Release Broadcast"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        />

        {/* Subject line with AI Generator Button */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono font-medium text-[#9CA3AF] uppercase">
              Subject Line
            </label>
            <button
              type="button"
              onClick={handleGenerateAiSubjects}
              disabled={aiLoading}
              className="inline-flex items-center gap-1.5 text-xs text-[#E8A33D] hover:text-[#F59E0B] font-semibold transition-colors disabled:opacity-50"
            >
              <FiZap className="w-3.5 h-3.5" />
              {aiLoading ? 'Optimizing...' : 'AI Subject Line Copilot'}
            </button>
          </div>
          <input
            type="text"
            required
            placeholder="e.g. Introducing MailPilot 2.0 Fast Delivery ⚡"
            value={formData.subject}
            onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
            className="w-full h-[40px] px-3.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#E8A33D] transition-colors"
          />
        </div>

        {/* AI Suggestions Drawer */}
        {showAiModal && aiSuggestions.length > 0 && (
          <div className="p-3 bg-[var(--surface-secondary)] border border-[#E8A33D]/30 rounded-lg space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-mono text-[#E8A33D]">
              <span className="flex items-center gap-1.5">
                <FiCpu className="w-3.5 h-3.5" />
                AI Subject Line Variations
              </span>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-[#9CA3AF] hover:text-[#F4F5F7]"
              >
                Close
              </button>
            </div>
            <div className="space-y-1.5">
              {aiSuggestions.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSuggestion(s.subject)}
                  className="p-2 bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs text-[#F4F5F7] group-hover:text-[#E8A33D] font-medium truncate">
                      {s.subject}
                    </p>
                    <p className="text-[10px] text-[#9CA3AF]">{s.rationale}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="amber">{s.score}% Score</Badge>
                    <Badge variant="steel">{s.tone}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spam Risk Live Pre-Check Indicator */}
        {spamAnalysis && (
          <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FiShield className="w-4 h-4" style={{ color: spamAnalysis.ratingColor }} />
              <span className="text-[var(--text-secondary)]">
                Deliverability Health: <strong style={{ color: spamAnalysis.ratingColor }}>{spamAnalysis.rating} ({spamAnalysis.deliverabilityScore}%)</strong>
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[200px]">
              {spamAnalysis.suggestions?.[0]}
            </span>
          </div>
        )}

        {/* Template Select */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-medium text-[var(--text-secondary)] uppercase">
            Email Template (Optional)
          </label>
          <select
            value={formData.templateId}
            onChange={(e) => setFormData((prev) => ({ ...prev, templateId: e.target.value }))}
            className="w-full h-[40px] px-3.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:border-[#E8A33D] transition-colors"
          >
            <option value="">-- No Template (Custom Message Body) --</option>
            {templates.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.title} ({tmpl.category})
              </option>
            ))}
          </select>
        </div>

        {/* Custom Email Content Body */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-medium text-[var(--text-secondary)] uppercase">
            Email Content Body (HTML / Markdown)
          </label>
          <textarea
            rows={4}
            placeholder="<p>Hello {{first_name}},</p><p>We are excited to share our latest product updates...</p>"
            value={formData.content}
            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
            className="w-full p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg text-xs font-mono text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#E8A33D] transition-colors"
          />
          <span className="text-[10px] text-[var(--text-muted)] block font-mono">
            Supported tags: &#123;&#123;first_name&#125;&#125;, &#123;&#123;name&#125;&#125;, &#123;&#123;email&#125;&#125;, &#123;&#123;workspace_name&#125;&#125;
          </span>
        </div>

        {/* Schedule */}
        <Input
          label="Schedule Automated Dispatch (Optional)"
          type="datetime-local"
          value={formData.scheduledAt}
          onChange={(e) => setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))}
        />

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border)]">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            {initialData ? 'Save Changes' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CampaignFormModal;
