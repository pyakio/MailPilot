import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../shared/ui/Card';
import Button from '../../../shared/ui/Button';
import Badge from '../../../shared/ui/Badge';
import Skeleton from '../../../shared/ui/Skeleton';
import RecentCampaignsTable from '../../../shared/components/tables/RecentCampaignsTable';
import CampaignFormModal from '../../../shared/components/forms/CampaignFormModal';
import ConfirmationDialog from '../../../shared/ui/ConfirmationDialog';
import { campaignService } from '../../../services/campaignService';
import { contactService } from '../../../services/contactService';
import { templateService } from '../../../services/templateService';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { formatDate } from '../../../utils/formatters';
import {
  FiSend,
  FiUsers,
  FiFileText,
  FiActivity,
  FiPlus,
  FiArrowRight,
  FiArrowUpRight,
  FiCpu,
  FiZap,
  FiClock,
  FiCheck,
} from 'react-icons/fi';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [campaigns, setCampaigns] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendingId, setSendingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [campRes, contRes, tmplRes] = await Promise.all([
        campaignService.getCampaigns().catch(() => []),
        contactService.getContacts().catch(() => []),
        templateService.getTemplates().catch(() => []),
      ]);
      setCampaigns(campRes);
      setContacts(contRes);
      setTemplates(tmplRes);
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to load dashboard workspace data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCampaign = async (payload) => {
    try {
      setSubmitting(true);
      if (editingCampaign) {
        await campaignService.updateCampaign(editingCampaign.id, payload);
        addToast({ title: 'Success', message: 'Campaign updated.', type: 'success' });
      } else {
        await campaignService.createCampaign(payload);
        addToast({ title: 'Success', message: 'Campaign created successfully.', type: 'success' });
      }
      setIsCampaignModalOpen(false);
      setEditingCampaign(null);
      loadData();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendNow = async (id) => {
    try {
      setSendingId(id);
      await campaignService.sendCampaign(id);
      addToast({ title: 'Broadcast Sent', message: 'Campaign sent to subscriber audience.', type: 'success' });
      loadData();
    } catch (err) {
      addToast({ title: 'Send Error', message: err.message, type: 'error' });
    } finally {
      setSendingId(null);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await campaignService.deleteCampaign(deletingId);
      addToast({ title: 'Deleted', message: 'Campaign deleted.', type: 'info' });
      setDeletingId(null);
      loadData();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const latestCampaign = campaigns[0] || null;
  const draftCampaigns = campaigns.filter((c) => c.status?.toLowerCase() === 'draft');
  const scheduledCampaigns = campaigns.filter((c) => c.status?.toLowerCase() === 'scheduled');
  const sentCampaigns = campaigns.filter((c) => c.status?.toLowerCase() === 'sent');
  const subscribedContacts = contacts.filter((c) => c.subscribed !== false);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* 1. Hero Section (Flight Instrument Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Conversational Hero */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-heading text-[var(--text)] transition-colors duration-200 hover:text-[#E8A33D] cursor-default">
              Welcome back, {user?.name ? user.name.split(' ')[0] : 'Operator'}
            </h1>
            <div className="text-sm font-normal text-[var(--text-secondary)] leading-relaxed space-y-1">
              <p className="font-semibold text-[var(--text)] transition-colors duration-200 hover:text-[#E8A33D] cursor-default">
                {latestCampaign
                  ? `Latest: ${latestCampaign.name} (${latestCampaign.status})`
                  : 'Workspace ready • Create your first broadcast'}
              </p>
              <p className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
                <span>Total Campaigns: <strong className="text-[var(--text)]">{campaigns.length}</strong></span>
                <span>&bull;</span>
                <span>Audience Reach: <strong className="text-[#E8A33D]">{subscribedContacts.length} subscribers</strong></span>
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex">
            <Button
              variant="primary"
              icon={FiPlus}
              className="w-full sm:w-auto"
              onClick={() => {
                setEditingCampaign(null);
                setIsCampaignModalOpen(true);
              }}
            >
              New Campaign
            </Button>
          </div>
        </div>

        {/* Right Side: Workspace Overview Widget */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Performance Overview</span>
            <Badge variant={sentCampaigns.length > 0 ? 'success' : 'warning'}>
              {sentCampaigns.length > 0 ? 'Active Engine' : 'Ready'}
            </Badge>
          </div>
          <div>
            <h4 className="text-sm font-bold font-heading text-[var(--text)]">
              {scheduledCampaigns.length > 0
                ? `${scheduledCampaigns.length} Scheduled Dispatches`
                : draftCampaigns.length > 0
                ? `${draftCampaigns.length} Draft Broadcasts`
                : 'No Active Dispatches'}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1.5 font-mono">
              <FiClock className="w-3.5 h-3.5 text-[#E8A33D]" />
              {latestCampaign ? `Updated ${formatDate(latestCampaign.updatedAt || latestCampaign.createdAt)}` : 'No broadcast activity yet'}
            </p>
            <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Templates: <strong className="text-[var(--text)]">{templates.length}</strong></span>
              <span className="text-[#E8A33D] font-medium cursor-pointer hover:underline" onClick={() => navigate('/campaigns')}>Manage broadcasts →</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Metrics Overview Strip */}
      <div className="px-4 py-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <FiSend className="w-3.5 h-3.5 text-[#E8A33D]" />
          <span>Total Campaigns: <strong className="text-[var(--text)]">{campaigns.length}</strong></span>
        </div>
        <span className="hidden sm:inline text-[var(--border-strong)]">&bull;</span>
        <div className="flex items-center gap-2">
          <FiUsers className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Audience: <strong className="text-[#22C55E]">{subscribedContacts.length} contacts</strong></span>
        </div>
        <span className="hidden sm:inline text-[var(--border-strong)]">&bull;</span>
        <div className="flex items-center gap-2">
          <FiFileText className="w-3.5 h-3.5 text-[#3E6B70]" />
          <span>Templates: <strong className="text-[var(--text)]">{templates.length}</strong></span>
        </div>
        <span className="hidden sm:inline text-[var(--border-strong)]">&bull;</span>
        <div className="flex items-center gap-2">
          <FiActivity className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>ESP Delivery: <strong className="text-[#16A34A] dark:text-[#4ADE80]">Active & Ready</strong></span>
        </div>
      </div>

      {/* 3. Continue Working Section */}
      <div className="space-y-3">
        <h2 className="section-title">
          Continue Working
        </h2>

        <div className="divide-y divide-[var(--border)] border-t border-b border-[var(--border)]">
          {campaigns.length === 0 && templates.length === 0 ? (
            <div className="py-6 text-center text-[var(--text-muted)] text-sm">
              No active drafts or templates. Click "New Campaign" above to get started.
            </div>
          ) : (
            <>
              {draftCampaigns.slice(0, 2).map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => { setEditingCampaign(draft); setIsCampaignModalOpen(true); }}
                  className="py-3 px-4 flex items-center justify-between notion-row cursor-pointer rounded-lg group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#E8A33D] shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--text)] group-hover:text-[#E8A33D] transition-colors">{draft.name}</h4>
                      <p className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                        <span className="text-[#E8A33D] font-medium">Draft Broadcast</span>
                        <span>&bull;</span>
                        <span>{draft.subject || 'No subject set'}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[#E8A33D] flex items-center gap-1">
                    Resume <FiArrowRight className="w-3.5 h-3.5 row-arrow transition-all duration-150 opacity-80" />
                  </span>
                </div>
              ))}

              {templates.slice(0, 2).map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => navigate('/templates')}
                  className="py-3 px-4 flex items-center justify-between notion-row cursor-pointer rounded-lg group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#3E6B70] shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--text)] group-hover:text-[#3E6B70] transition-colors">{tmpl.title}</h4>
                      <p className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                        <span className="text-[#3E6B70] font-medium">Email Template</span>
                        <span>&bull;</span>
                        <span>Category: {tmpl.category}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[#3E6B70] flex items-center gap-1">
                    View <FiArrowRight className="w-3.5 h-3.5 row-arrow transition-all duration-150 opacity-80" />
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* 4. Quick Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-heading text-[var(--text)] flex items-center gap-2">
            <span className="text-[#E8A33D]">⚡</span>
            <span>Quick Actions</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1: New Campaign */}
          <div
            className="group relative p-5 bg-[var(--surface-card)] border border-[var(--border)] hover:border-[#E8A33D]/70 rounded-xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-lg dark:hover:shadow-[0_10px_25px_-5px_rgba(232,163,61,0.15)] flex flex-col justify-between h-[115px] hover:-translate-y-0.5 active:scale-[0.98]"
            onClick={() => { setEditingCampaign(null); setIsCampaignModalOpen(true); }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E8A33D]/15 border border-[#E8A33D]/30 flex items-center justify-center text-[#E8A33D] font-bold text-sm shadow-xs group-hover:scale-110 transition-transform">
                  ⚡
                </div>
                <div>
                  <h3 className="text-sm font-bold font-heading text-[var(--text)] group-hover:text-[#E8A33D] transition-colors">
                    New Campaign
                  </h3>
                </div>
              </div>
              <FiArrowUpRight className="w-4 h-4 text-[#E8A33D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-mono flex items-center gap-1">
              <span>Draft, personalize, and broadcast email</span>
              <span className="text-[#E8A33D] group-hover:translate-x-1 transition-transform">→</span>
            </p>
          </div>

          {/* Action 2: AI Copilot */}
          <div
            className="group relative p-5 bg-[var(--surface-card)] border border-[var(--border)] hover:border-[#E8A33D]/70 rounded-xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-lg dark:hover:shadow-[0_10px_25px_-5px_rgba(232,163,61,0.15)] flex flex-col justify-between h-[115px] hover:-translate-y-0.5 active:scale-[0.98]"
            onClick={() => navigate('/ai-workspace')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#3E6B70]/15 border border-[#3E6B70]/30 flex items-center justify-center text-[#3E6B70] shadow-xs group-hover:scale-110 transition-transform">
                  <FiCpu className="w-4 h-4 text-[#E8A33D]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-heading text-[var(--text)] group-hover:text-[#E8A33D] transition-colors">
                    AI Copilot
                  </h3>
                </div>
              </div>
              <FiArrowUpRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[#E8A33D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-mono flex items-center gap-1">
              <span>Generate subject lines & copy</span>
              <span className="text-[#E8A33D] group-hover:translate-x-1 transition-transform">→</span>
            </p>
          </div>

          {/* Action 3: Workflows */}
          <div
            className="group relative p-5 bg-[var(--surface-card)] border border-[var(--border)] hover:border-[#E8A33D]/70 rounded-xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-lg dark:hover:shadow-[0_10px_25px_-5px_rgba(232,163,61,0.15)] flex flex-col justify-between h-[115px] hover:-translate-y-0.5 active:scale-[0.98]"
            onClick={() => navigate('/workflows')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] shadow-xs group-hover:scale-110 transition-transform">
                  <FiZap className="w-4 h-4 text-[#22C55E]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-heading text-[var(--text)] group-hover:text-[#E8A33D] transition-colors">
                    Workflows
                  </h3>
                </div>
              </div>
              <FiArrowUpRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[#E8A33D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-mono flex items-center gap-1">
              <span>Automate drip sequences</span>
              <span className="text-[#E8A33D] group-hover:translate-x-1 transition-transform">→</span>
            </p>
          </div>
        </div>
      </div>

      {/* 5. Recent Campaigns Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">
            Recent Broadcasts
          </h2>
          <Button size="sm" variant="ghost" onClick={() => navigate('/campaigns')}>
            View all
          </Button>
        </div>

        <Card noPadding>
          <RecentCampaignsTable
            campaigns={campaigns.slice(0, 5)}
            onEdit={(c) => { setEditingCampaign(c); setIsCampaignModalOpen(true); }}
            onSendNow={handleSendNow}
            onDelete={(id) => setDeletingId(id)}
            sendingId={sendingId}
          />
        </Card>
      </div>

      {/* 6. AI Features & Real Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Features Card */}
        <Card
          title="AI Assistant Active"
          subtitle="Generate copy and inspect spam heuristics"
          action={<Badge variant="amber">ONLINE</Badge>}
        >
          <div className="space-y-4">
            <p className="text-sm text-[var(--text)] leading-relaxed">
              Use the AI Copilot to generate subject lines, draft complete emails, and run real-time deliverability checks.
            </p>
            <div className="space-y-2 text-xs font-mono text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <FiCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>AI Subject Line Optimizer (5 Variations)</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Automated Email Copy Studio</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Spam Filter Heuristic Scoring</span>
              </div>
            </div>

            <Button
              fullWidth
              variant="primary"
              onClick={() => navigate('/ai-workspace')}
            >
              Open AI Copilot Workspace →
            </Button>
          </div>
        </Card>

        {/* Real Activity Feed Timeline */}
        <Card title="Activity Stream" subtitle="Workspace event and campaign log">
          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <p className="py-6 text-center text-xs text-[var(--text-secondary)]">
                No broadcast events recorded yet. Create a campaign to start logging events.
              </p>
            ) : (
              <div className="relative pl-6 space-y-4 border-l border-[var(--border)]">
                {campaigns.slice(0, 4).map((c) => (
                  <div key={c.id} className="relative">
                    <span
                      className={`absolute -left-[29px] top-1.5 w-2 h-2 rounded-full ${
                        c.status?.toLowerCase() === 'sent'
                          ? 'bg-[#22C55E]'
                          : c.status?.toLowerCase() === 'scheduled'
                          ? 'bg-[#E8A33D]'
                          : 'bg-[#3E6B70]'
                      }`}
                    />
                    <p className="text-xs text-[var(--text)]">
                      <strong className="text-[var(--text-muted)] font-mono mr-2">
                        {formatDate(c.createdAt)}
                      </strong>
                      Campaign <strong className="text-[var(--text)]">{c.name}</strong> status is <span className="capitalize font-semibold">{c.status?.toLowerCase()}</span>.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <CampaignFormModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        onSubmit={handleSaveCampaign}
        initialData={editingCampaign}
        templates={templates}
        loading={submitting}
      />

      <ConfirmationDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteCampaign}
        title="Delete Campaign"
        message="Are you sure you want to delete this campaign? This action cannot be undone."
        loading={submitting}
      />
    </div>
  );
}

export default DashboardPage;
