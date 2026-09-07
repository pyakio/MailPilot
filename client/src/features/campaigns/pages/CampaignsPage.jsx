import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../../../shared/ui/Card';
import Button from '../../../shared/ui/Button';
import Input from '../../../shared/ui/Input';
import Badge from '../../../shared/ui/Badge';
import Skeleton from '../../../shared/ui/Skeleton';
import Table from '../../../shared/ui/Table';
import Dropdown from '../../../shared/ui/Dropdown';
import CampaignFormModal from '../../../shared/components/forms/CampaignFormModal';
import ConfirmationDialog from '../../../shared/ui/ConfirmationDialog';
import { campaignService } from '../../../services/campaignService';
import { templateService } from '../../../services/templateService';
import { useToast } from '../../../hooks/useToast';
import { formatDate } from '../../../utils/formatters';
import {
  FiPlus,
  FiSearch,
  FiMoreHorizontal,
  FiEdit2,
  FiTrash2,
  FiSend,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';

export function CampaignsPage() {
  const { addToast } = useToast();
  const location = useLocation();
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendingId, setSendingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [campRes, tmplRes] = await Promise.all([
        campaignService.getCampaigns(),
        templateService.getTemplates().catch(() => []),
      ]);
      setCampaigns(campRes);
      setTemplates(tmplRes);
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-open campaign creator if navigated from TemplatesPage with template payload
  useEffect(() => {
    if (location.state?.selectedTemplateId || location.state?.templateHtml) {
      setEditingCampaign({
        name: location.state.templateSubject ? `Broadcast: ${location.state.templateSubject.slice(0, 30)}` : 'New Campaign',
        subject: location.state.templateSubject || '',
        content: location.state.templateHtml || location.state.templateBody || '',
        templateId: location.state.selectedTemplateId || '',
      });
      setIsModalOpen(true);
    }
  }, [location.state]);

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.subject && c.subject.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter =
      filterStatus === 'all' || c.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleSave = async (payload) => {
    try {
      setSubmitting(true);
      if (editingCampaign) {
        await campaignService.updateCampaign(editingCampaign.id, payload);
        addToast({ title: 'Success', message: 'Campaign updated.', type: 'success' });
      } else {
        await campaignService.createCampaign(payload);
        addToast({ title: 'Success', message: 'Campaign created.', type: 'success' });
      }
      setIsModalOpen(false);
      setEditingCampaign(null);
      loadData();
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

  const handleSendNow = async (id) => {
    try {
      setSendingId(id);
      await campaignService.sendCampaign(id);
      addToast({ title: 'Broadcast Sent', message: 'Campaign dispatched to audience.', type: 'success' });
      loadData();
    } catch (err) {
      addToast({ title: 'Send Failed', message: err.message, type: 'error' });
    } finally {
      setSendingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'sent':
        return <Badge variant="success">Sent</Badge>;
      case 'scheduled':
        return <Badge variant="warning">Scheduled</Badge>;
      case 'sending':
        return <Badge variant="steel">Sending...</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
      case 'draft':
      default:
        return <Badge variant="default">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Storytelling Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#E8A33D] text-xl">⚡</span>
            <h1 className="text-2xl font-bold font-heading text-[var(--text)]">Campaigns</h1>
            <Badge variant="amber">{campaigns.length} Broadcasts</Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Create, schedule, dispatch, and track live email marketing broadcasts.
          </p>
        </div>
        <Button variant="primary" icon={FiPlus} onClick={() => { setEditingCampaign(null); setIsModalOpen(true); }}>
          New Campaign
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="w-full sm:w-80">
          <Input
            icon={FiSearch}
            placeholder="Search campaigns by name or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {['all', 'draft', 'scheduled', 'sent'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-mono font-medium capitalize transition-colors ${
                filterStatus === st
                  ? 'bg-[#E8A33D] text-[#14171C] font-semibold'
                  : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] border border-[var(--border)]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table List */}
      <Card noPadding>
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-[68px]" />
            <Skeleton className="h-[68px]" />
            <Skeleton className="h-[68px]" />
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="py-12 text-center text-[var(--text-muted)]">
            <p className="text-[14px]">No campaigns found matching criteria.</p>
          </div>
        ) : (
          <Table headers={['Name', 'Status', 'Date', 'Stats', 'Actions']}>
            {filteredCampaigns.map((c, idx) => (
              <tr key={c.id} className="h-[64px] hover:bg-[var(--surface-hover)] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-[var(--text)] text-[14px]">{c.name}</div>
                  <div className="text-[12px] text-[var(--text-secondary)] truncate max-w-xs">{c.subject}</div>
                </td>
                <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)] font-mono">
                  {c.sentAt ? formatDate(c.sentAt) : c.scheduledAt ? formatDate(c.scheduledAt) : '—'}
                </td>
                <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)] font-mono">
                  {c.status?.toLowerCase() === 'sent' ? (
                    <span>
                      <strong className="text-[var(--text)]">{c.stats?.sent ?? 0}</strong> sent / <strong className="text-[#E8A33D] font-bold">{c.stats?.opened ?? 0}</strong> opens
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)]">Draft mode</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Dropdown
                    trigger={
                      <button className="p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors">
                        <FiMoreHorizontal className="w-4 h-4" />
                      </button>
                    }
                    items={[
                      { label: 'Edit', icon: FiEdit2, onClick: () => { setEditingCampaign(c); setIsModalOpen(true); } },
                      ...(c.status?.toLowerCase() !== 'sent' ? [{ label: sendingId === c.id ? 'Sending...' : 'Send Now', icon: FiSend, onClick: () => handleSendNow(c.id) }] : []),
                      { label: 'Delete', icon: FiTrash2, danger: true, onClick: () => setDeletingId(c.id) },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <CampaignFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingCampaign}
        templates={templates}
        loading={submitting}
      />

      <ConfirmationDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        message="Are you sure you want to delete this campaign? This action cannot be undone."
        loading={submitting}
      />
    </div>
  );
}

export default CampaignsPage;
