import { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '../../../app/layouts/PageHeader';
import { Card } from '../../../components/ui/Card';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { SearchBar } from '../../../components/ui/SearchBar';
import { RecentCampaignsTable } from '../../../components/tables/RecentCampaignsTable';
import { CampaignFormModal } from '../../../components/forms/CampaignFormModal';
import { ConfirmationDialog } from '../../../components/ui/ConfirmationDialog';
import { Pagination } from '../../../components/ui/Pagination';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { campaignService } from '../../../services/campaignService';
import { templateService } from '../../../services/templateService';
import { useToast } from '../../../hooks/useToast';
import { useDebounce } from '../../../hooks/useDebounce';
import { FiPlus, FiSend } from 'react-icons/fi';

export function CampaignsPage() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const debouncedSearch = useDebounce(search, 250);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [cmpRes, tmplRes] = await Promise.all([
        campaignService.getCampaigns(),
        templateService.getTemplates(),
      ]);
      setCampaigns(cmpRes);
      setTemplates(tmplRes);
    } catch (err) {
      addToast({ title: 'Error Loading Campaigns', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.subject.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || c.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, debouncedSearch, statusFilter]);

  const pageSize = 10;
  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCampaigns.slice(start, start + pageSize);
  }, [filteredCampaigns, currentPage]);

  const handleSave = async (payload) => {
    try {
      setSubmitting(true);
      if (editingCampaign) {
        await campaignService.updateCampaign(editingCampaign.id, payload);
        addToast({ title: 'Campaign Updated', message: `Saved "${payload.name}".`, type: 'success' });
      } else {
        await campaignService.createCampaign(payload);
        addToast({ title: 'Campaign Created', message: `Added "${payload.name}".`, type: 'success' });
      }
      setIsModalOpen(false);
      setEditingCampaign(null);
      fetchData();
    } catch (err) {
      addToast({ title: 'Save Failed', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendNow = async (id) => {
    try {
      setSendingId(id);
      await campaignService.sendCampaignNow(id);
      addToast({ title: 'Campaign Sent', message: 'Email sequence triggered.', type: 'success' });
      fetchData();
    } catch (err) {
      addToast({ title: 'Send Error', message: err.message, type: 'error' });
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await campaignService.deleteCampaign(deletingId);
      addToast({ title: 'Campaign Deleted', message: 'Campaign permanently deleted.', type: 'info' });
      setDeletingId(null);
      fetchData();
    } catch (err) {
      addToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const statuses = [
    { id: 'all', label: 'All Campaigns' },
    { id: 'draft', label: 'Drafts' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'sent', label: 'Sent' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Design, schedule, and monitor automated email marketing broadcasts."
        badge={`${filteredCampaigns.length} Total`}
        actions={
          <PrimaryButton icon={FiPlus} onClick={() => { setEditingCampaign(null); setIsModalOpen(true); }}>
            Create Campaign
          </PrimaryButton>
        }
      />

      <Card noPadding>
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
          <SearchBar value={search} onChange={setSearch} placeholder="Search campaigns..." />

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
            {statuses.map((s) => (
              <button
                key={s.id}
                onClick={() => { setStatusFilter(s.id); setCurrentPage(1); }}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === s.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonLoader type="table" count={5} />
        ) : paginatedCampaigns.length === 0 ? (
          <EmptyState
            title="No campaigns found"
            description={search ? `No campaigns match "${search}".` : 'Create your first email campaign to get started.'}
            actionLabel="Create Campaign"
            onAction={() => { setEditingCampaign(null); setIsModalOpen(true); }}
            icon={FiSend}
          />
        ) : (
          <>
            <RecentCampaignsTable
              campaigns={paginatedCampaigns}
              onEdit={(c) => { setEditingCampaign(c); setIsModalOpen(true); }}
              onSendNow={handleSendNow}
              onDelete={(id) => setDeletingId(id)}
              sendingId={sendingId}
            />
            <Pagination
              currentPage={currentPage}
              totalItems={filteredCampaigns.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </Card>

      <CampaignFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCampaign(null); }}
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
        message="Are you sure you want to permanently delete this campaign?"
        loading={submitting}
      />
    </div>
  );
}

export default CampaignsPage;
