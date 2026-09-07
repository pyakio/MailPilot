import React, { useState } from 'react';
import Card from '../../../shared/ui/Card';
import Button from '../../../shared/ui/Button';
import Input from '../../../shared/ui/Input';
import Badge from '../../../shared/ui/Badge';
import { aiService } from '../../../services/aiService';
import { useToast } from '../../../hooks/useToast';
import AssistantPanel from '../components/AssistantPanel';
import {
  FiZap,
  FiSend,
  FiShield,
  FiCopy,
  FiCheck,
  FiCpu,
  FiCheckCircle,
  FiAlertTriangle,
  FiMessageSquare,
} from 'react-icons/fi';

export function AiWorkspacePage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('assistant'); // 'assistant' | 'subject' | 'copy' | 'spam'

  // Tab 1: Subject Line Optimizer State
  const [subjectTopic, setSubjectTopic] = useState('');
  const [subjectAudience, setSubjectAudience] = useState('');
  const [subjectTone, setSubjectTone] = useState('Direct & High Value');
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectResults, setSubjectResults] = useState([]);
  const [copiedSubjectIdx, setCopiedSubjectIdx] = useState(null);

  // Tab 2: Email Copy Studio State
  const [copyTopic, setCopyTopic] = useState('');
  const [copyAudience, setCopyAudience] = useState('');
  const [copyGoal, setCopyGoal] = useState('Feature Announcement');
  const [copyLoading, setCopyLoading] = useState(false);
  const [copyResult, setCopyResult] = useState(null);
  const [copiedCopy, setCopiedCopy] = useState(false);

  // Tab 3: Spam Deliverability Pre-Check State
  const [spamSubject, setSpamSubject] = useState('');
  const [spamContent, setSpamContent] = useState('');
  const [spamLoading, setSpamLoading] = useState(false);
  const [spamAnalysis, setSpamAnalysis] = useState(null);

  const handleGenerateSubjects = async (e) => {
    e.preventDefault();
    if (!subjectTopic.trim()) {
      addToast({ title: 'Topic Required', message: 'Please describe the email topic.', type: 'error' });
      return;
    }

    try {
      setSubjectLoading(true);
      const res = await aiService.getSubjectLines({ topic: subjectTopic, audience: subjectAudience, tone: subjectTone });
      setSubjectResults(res.variations || []);
      addToast({ title: 'Generated', message: 'Generated 5 high-converting subject variations.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Generation Failed', message: err.message, type: 'error' });
    } finally {
      setSubjectLoading(false);
    }
  };

  const handleGenerateCopy = async (e) => {
    e.preventDefault();
    if (!copyTopic.trim()) {
      addToast({ title: 'Topic Required', message: 'Please describe the email copy topic.', type: 'error' });
      return;
    }

    try {
      setCopyLoading(true);
      const res = await aiService.getEmailCopy({ topic: copyTopic, goal: copyGoal, audience: copyAudience });
      setCopyResult(res.copy || null);
      addToast({ title: 'Draft Generated', message: 'Complete email draft ready in preview.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Generation Failed', message: err.message, type: 'error' });
    } finally {
      setCopyLoading(false);
    }
  };

  const handleAuditSpam = async (e) => {
    e.preventDefault();
    if (!spamContent.trim() && !spamSubject.trim()) {
      addToast({ title: 'Content Required', message: 'Enter subject or body text to audit.', type: 'error' });
      return;
    }

    try {
      setSpamLoading(true);
      const res = await aiService.checkSpamRisk({ subject: spamSubject, content: spamContent });
      setSpamAnalysis(res.analysis || null);
      addToast({ title: 'Audit Completed', message: 'Deliverability and spam scoring complete.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Audit Failed', message: err.message, type: 'error' });
    } finally {
      setSpamLoading(false);
    }
  };

  const copyToClipboard = (text, type, idx = null) => {
    navigator.clipboard.writeText(text);
    if (type === 'subject') {
      setCopiedSubjectIdx(idx);
      setTimeout(() => setCopiedSubjectIdx(null), 2000);
    } else {
      setCopiedCopy(true);
      setTimeout(() => setCopiedCopy(false), 2000);
    }
    addToast({ title: 'Copied', message: 'Copied to clipboard.', type: 'info' });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#E8A33D] text-xl">⚡</span>
            <h1 className="text-2xl font-bold font-heading text-[var(--text)]">AI Copilot Workspace</h1>
            <Badge variant="amber">AI Engine</Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Generate high-converting subject lines, craft full email campaigns, and audit ISP spam deliverability.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-[var(--surface-secondary)] p-1 rounded-lg border border-[var(--border)] overflow-x-auto">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'assistant'
                ? 'bg-[#E8A33D] text-[#14171C] font-semibold shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <FiMessageSquare className="w-3.5 h-3.5" />
            AI Copilot Chat
          </button>
          <button
            onClick={() => setActiveTab('subject')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              activeTab === 'subject'
                ? 'bg-[#E8A33D] text-[#14171C] font-semibold shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            Subject Lines
          </button>
          <button
            onClick={() => setActiveTab('copy')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              activeTab === 'copy'
                ? 'bg-[#E8A33D] text-[#14171C] font-semibold shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            Email Copy Studio
          </button>
          <button
            onClick={() => setActiveTab('spam')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              activeTab === 'spam'
                ? 'bg-[#E8A33D] text-[#14171C] font-semibold shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            Deliverability & Spam Check
          </button>
        </div>
      </div>

      {/* ─── TAB 0: AI COPILOT CHAT ────────────────────────────────────────── */}
      {activeTab === 'assistant' && (
        <div className="w-full">
          <AssistantPanel />
        </div>
      )}

      {/* ─── TAB 1: SUBJECT LINE GENERATOR ──────────────────────────────────── */}
      {activeTab === 'subject' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <Card title="Subject Line Parameters" subtitle="Configure the campaign context">
              <form onSubmit={handleGenerateSubjects} className="space-y-4">
                <Input
                  label="Topic or Feature Announcement"
                  placeholder="e.g. Launching 2x faster webhook delivery and instant sync"
                  value={subjectTopic}
                  onChange={(e) => setSubjectTopic(e.target.value)}
                  required
                />

                <Input
                  label="Target Audience"
                  placeholder="e.g. SaaS Founders, Early Beta Users"
                  value={subjectAudience}
                  onChange={(e) => setSubjectAudience(e.target.value)}
                />

                <div>
                  <label className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                    Tone of Voice
                  </label>
                  <select
                    value={subjectTone}
                    onChange={(e) => setSubjectTone(e.target.value)}
                    className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[#E8A33D]"
                  >
                    <option value="Direct & High Value">Direct & High Value</option>
                    <option value="Urgent & Time-Sensitive">Urgent & Time-Sensitive</option>
                    <option value="Curious & Intriguing">Curious & Intriguing</option>
                    <option value="Conversational & Founder-to-User">Conversational & Founder-to-User</option>
                    <option value="Data-Driven & Analytical">Data-Driven & Analytical</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={subjectLoading}
                  icon={FiZap}
                >
                  Generate 5 Subject Lines
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card title="Generated Variations" subtitle="Scored by predicted open rate impact">
              {subjectResults.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-lg">
                  <FiCpu className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-[var(--text)]">No variations generated yet.</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Fill out the parameters and click Generate.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subjectResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border)] hover:border-[#E8A33D]/40 transition-colors flex items-start justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-[#E8A33D]">#{idx + 1}</span>
                          <Badge variant="steel">{item.tone}</Badge>
                          <span className="text-[11px] font-mono text-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.5 rounded border border-[#22C55E]/20">
                            Score: {item.score}/100
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[var(--text)] tracking-tight">{item.subject}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 italic">{item.rationale}</p>
                      </div>

                      <button
                        onClick={() => copyToClipboard(item.subject, 'subject', idx)}
                        className="p-2 rounded bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text)] border border-[var(--border)] transition-colors shrink-0"
                        title="Copy Subject Line"
                      >
                        {copiedSubjectIdx === idx ? (
                          <FiCheck className="w-4 h-4 text-[#22C55E]" />
                        ) : (
                          <FiCopy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ─── TAB 2: EMAIL COPY STUDIO ────────────────────────────────────────── */}
      {activeTab === 'copy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <Card title="Copy Generator Settings" subtitle="Draft complete newsletter or broadcast copy">
              <form onSubmit={handleGenerateCopy} className="space-y-4">
                <Input
                  label="What is this email about?"
                  placeholder="e.g. Major v2.0 platform release with new analytics dashboard"
                  value={copyTopic}
                  onChange={(e) => setCopyTopic(e.target.value)}
                  required
                />

                <Input
                  label="Target Audience"
                  placeholder="e.g. Active SaaS subscribers"
                  value={copyAudience}
                  onChange={(e) => setCopyAudience(e.target.value)}
                />

                <div>
                  <label className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                    Primary Goal
                  </label>
                  <select
                    value={copyGoal}
                    onChange={(e) => setCopyGoal(e.target.value)}
                    className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[#E8A33D]"
                  >
                    <option value="Feature Announcement">Feature Announcement</option>
                    <option value="Product Onboarding">Product Onboarding</option>
                    <option value="Special Promotion / Offer">Special Promotion / Offer</option>
                    <option value="Weekly Newsletter">Weekly Newsletter</option>
                    <option value="User Feedback Survey">User Feedback Survey</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={copyLoading}
                  icon={FiSend}
                >
                  Generate Email Draft
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card
              title="Draft Preview"
              subtitle={copyResult ? copyResult.subject : 'AI generated body preview'}
              action={
                copyResult && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(copyResult.body || '', 'copy')}
                    icon={copiedCopy ? FiCheck : FiCopy}
                  >
                    {copiedCopy ? 'Copied' : 'Copy HTML'}
                  </Button>
                )
              }
            >
              {!copyResult ? (
                <div className="text-center py-16 border border-dashed border-[var(--border)] rounded-lg">
                  <FiCpu className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-[var(--text)]">No draft generated yet.</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Configure your campaign details to produce a complete email.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border)] space-y-1">
                    <p className="text-xs font-mono text-[var(--text-secondary)] uppercase">Subject</p>
                    <p className="text-sm font-semibold text-[var(--text)]">{copyResult.subject}</p>
                    {copyResult.previewText && (
                      <p className="text-xs text-[var(--text-secondary)] pt-1">Preheader: {copyResult.previewText}</p>
                    )}
                  </div>

                  <div className="p-4 bg-white text-slate-900 rounded-lg border border-slate-200 text-sm leading-relaxed overflow-x-auto shadow-inner">
                    <div dangerouslySetInnerHTML={{ __html: copyResult.body }} />
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ─── TAB 3: SPAM DELIVERABILITY AUDITOR ──────────────────────────────── */}
      {activeTab === 'spam' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <Card title="Email Deliverability Inspector" subtitle="Scan for spam triggers and formatting flags">
              <form onSubmit={handleAuditSpam} className="space-y-4">
                <Input
                  label="Subject Line"
                  placeholder="e.g. Get 100% Free Access Now! Act Fast!!!"
                  value={spamSubject}
                  onChange={(e) => setSpamSubject(e.target.value)}
                />

                <div>
                  <label className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                    Email Body Content (Text or HTML)
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Paste your email copy here to inspect..."
                    value={spamContent}
                    onChange={(e) => setSpamContent(e.target.value)}
                    className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-md p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[#E8A33D] font-mono text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={spamLoading}
                  icon={FiShield}
                >
                  Run Deliverability Audit
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-6">
            <Card title="ISP Deliverability Audit" subtitle="Pre-flight inbox placement score">
              {!spamAnalysis ? (
                <div className="text-center py-16 border border-dashed border-[var(--border)] rounded-lg">
                  <FiShield className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-[var(--text)]">No scan results yet.</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Enter your subject and copy to check inbox placement probability.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Big Score Gauge */}
                  <div className="p-4 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border)] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono text-[var(--text-secondary)] uppercase">Deliverability Score</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-bold font-mono" style={{ color: spamAnalysis.ratingColor }}>
                          {spamAnalysis.deliverabilityScore}%
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: `${spamAnalysis.ratingColor}20`, color: spamAnalysis.ratingColor }}>
                          {spamAnalysis.rating}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-mono text-[var(--text-secondary)] uppercase">Spam Risk Factor</p>
                      <p className="text-xl font-bold font-mono text-[#EF4444] mt-1">{spamAnalysis.score}/100</p>
                    </div>
                  </div>

                  {/* Trigger Words */}
                  <div>
                    <p className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Detected Spam Trigger Words ({spamAnalysis.foundTriggers.length})
                    </p>
                    {spamAnalysis.foundTriggers.length === 0 ? (
                      <div className="flex items-center gap-2 text-xs text-[#22C55E] bg-[#22C55E]/10 p-2.5 rounded border border-[#22C55E]/20">
                        <FiCheckCircle className="w-4 h-4 shrink-0" />
                        <span>No blacklisted spam trigger phrases detected.</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {spamAnalysis.foundTriggers.map((word, i) => (
                          <span key={i} className="text-xs font-mono px-2 py-0.5 bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 rounded">
                            {word}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actionable Suggestions */}
                  <div>
                    <p className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Actionable Deliverability Recommendations
                    </p>
                    <ul className="space-y-1.5">
                      {spamAnalysis.suggestions.map((sug, i) => (
                        <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2 p-2 bg-[var(--surface-secondary)] rounded border border-[var(--border)]">
                          <span className="text-[#E8A33D] shrink-0 font-bold">&bull;</span>
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiWorkspacePage;
