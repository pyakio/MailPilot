import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../app/layouts/PageHeader';
import { Card } from '../../../components/ui/Card';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../../components/ui/SecondaryButton';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import { CampaignPerformanceChart } from '../../../components/charts/CampaignPerformanceChart';
import { EmailOpenTrendChart } from '../../../components/charts/EmailOpenTrendChart';
import { RecentCampaignsTable } from '../../../components/tables/RecentCampaignsTable';
import { CampaignFormModal } from '../../../components/forms/CampaignFormModal';
import { ConfirmationDialog } from '../../../components/ui/ConfirmationDialog';
import { analyticsService } from '../../../services/analyticsService';
import { campaignService } from '../../../services/campaignService';
import { templateService } from '../../../services/templateService';
import { useToast } from '../../../hooks/useToast';
import { formatDate } from '../../../utils/formatters';
import {
  FiSend,
  FiMail,
  FiTrendingUp,
  FiMousePointer,
  FiPlus,
  FiClock,
} from 'react-icons/fi';

export function DashboardPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [analytics, setAnalytics] = useState({ trend: [], perCampaign: [] });

  // Modal states
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, cmpRes, tmplRes, anlRes] = await Promise.all([
        analyticsService.getSummary(),
        campaignService.getCampaigns(),
        templateService.getTemplates(),
        analyticsService.getAnalytics(),
      ]);
      setSummary(sumRes);
      setCampaigns(cmpRes);
      setTemplates(tmplRes);
      setAnalytics(anlRes);
    } catch (err) {
      addToast({
        title: 'Error Fetching Dashboard',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const campaignChartData = useMemo(() => {
    return (analytics.perCampaign || []).map((c) => ({
      name: c.name,
      Sent: c.sent || 0,
      Opened: c.opened || 0,
      Clicked: c.clicked || 0,
    }));
  }, [analytics]);

  const handleSaveCampaign = async (payload) => {
    try {
      setSubmitting(true);
      if (editingCampaign) {
        await campaignService.updateCampaign(editingCampaign.id, payload);
        addToast({ title: 'Campaign Updated', message: `Updated "${payload.name}".`, type: 'success' });
      } else {
        await campaignService.createCampaign(payload);
        addToast({ title: 'Campaign Created', message: `Created "${payload.name}".`, type: 'success' });
      }
      setIsCampaignModalOpen(false);
      setEditingCampaign(null);
      fetchDashboardData();
    } catch (err) {
      addToast({ title: 'Operation Failed', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendNow = async (id) => {
    try {
      setSendingId(id);
      await campaignService.sendCampaignNow(id);
      addToast({ title: 'Campaign Sent', message: 'Email sequence dispatched.', type: 'success' });
      fetchDashboardData();
    } catch (err) {
      addToast({ title: 'Send Failed', message: err.message, type: 'error' });
    } finally {
      setSendingId(null);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await campaignService.deleteCampaign(deletingId);
      addToast({ title: 'Campaign Deleted', message: 'Removed campaign.', type: 'info' });
      setDeletingId(null);
      fetchDashboardData();
    } catch (err) {
      addToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    { title: 'Total Campaigns', value: summary.totalCampaigns ?? 0, icon: FiSend },
    { title: 'Emails Sent', value: (summary.emailsSent ?? 0).toLocaleString(), icon: FiMail },
    { title: 'Open Rate', value: `${summary.openRate ?? 0}%`, icon: FiTrendingUp },
    { title: 'Click Rate', value: `${summary.clickRate ?? 0}%`, icon: FiMousePointer },
  ];

  const scheduledCampaigns = useMemo(() => {
    return campaigns.filter((c) => c.status === 'scheduled');
  }, [campaigns]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Loading campaign telemetry..." />
        <SkeletonLoader type="stat" count={4} />
        <SkeletonLoader type="card" count={2} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with single clear primary action */}
      <PageHeader
        title="Dashboard"
        description="Overview of email campaign automation, delivery telemetry, and active audience responses."
        actions={
          <PrimaryButton icon={FiPlus} onClick={() => { setEditingCampaign(null); setIsCampaignModalOpen(true); }}>
            Create Campaign
          </PrimaryButton>
        }
      />

      {/* Clean Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {stat.title}
                </span>
                <Icon className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                {stat.value}
              </h3>
            </Card>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Campaign Performance" subtitle="Volume comparison of sent, opened, and clicked emails">
          <CampaignPerformanceChart data={campaignChartData} />
        </Card>

        <Card title="Email Open Trend" subtitle="Daily engagement and open rate progression">
          <EmailOpenTrendChart data={analytics.trend || []} />
        </Card>
      </div>

      {/* Lower Section: Scheduled Campaigns & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Scheduled */}
        <Card
          title="Scheduled Campaigns"
          subtitle="Automated queue"
          className="lg:col-span-1"
        >
          {scheduledCampaigns.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-400">
              No scheduled campaigns pending.
            </p>
          ) : (
            <div className="space-y-2.5">
              {scheduledCampaigns.map((sc) => (
                <div
                  key={sc.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{sc.name}</h5>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <FiClock className="w-3 h-3 text-amber-500" />
                      {formatDate(sc.scheduledAt)}
                    </span>
                  </div>
                  <SecondaryButton
                    size="sm"
                    onClick={() => handleSendNow(sc.id)}
                    loading={sendingId === sc.id}
                  >
                    Send Now
                  </SecondaryButton>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Activity Timeline */}
        <Card title="Activity Log" subtitle="System triggers" className="lg:col-span-2">
          <div className="relative pl-4 space-y-3.5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            <div className="relative flex items-start justify-between">
              <span className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-emerald-500" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Welcome Drip campaign dispatched
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Delivered to subscribers with 38% open rate
                </p>
              </div>
              <span className="text-[10px] text-slate-400">12m ago</span>
            </div>

            <div className="relative flex items-start justify-between">
              <span className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-indigo-500" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  New Contacts Imported via CSV
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Added subscribers with "Lead" tag
                </p>
              </div>
              <span className="text-[10px] text-slate-400">2h ago</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Campaigns Table */}
      <Card
        title="Recent Campaigns"
        subtitle="Manage email broadcasts"
        action={
          <SecondaryButton size="sm" onClick={() => navigate('/campaigns')}>
            View All
          </SecondaryButton>
        }
        noPadding
      >
        <RecentCampaignsTable
          campaigns={campaigns.slice(0, 5)}
          onEdit={(c) => { setEditingCampaign(c); setIsCampaignModalOpen(true); }}
          onSendNow={handleSendNow}
          onDelete={(id) => setDeletingId(id)}
          sendingId={sendingId}
        />
      </Card>

      {/* Modals */}
      <CampaignFormModal
        isOpen={isCampaignModalOpen}
        onClose={() => { setIsCampaignModalOpen(false); setEditingCampaign(null); }}
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
        message="Are you sure you want to delete this campaign?"
        loading={submitting}
      />
    </div>
  );
}

export default DashboardPage;
