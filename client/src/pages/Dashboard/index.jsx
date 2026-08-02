import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { CampaignPerformanceChart } from '../../components/charts/CampaignPerformanceChart';
import { EmailOpenTrendChart } from '../../components/charts/EmailOpenTrendChart';
import { RecentCampaignsTable } from '../../components/tables/RecentCampaignsTable';
import { CampaignFormModal } from '../../components/forms/CampaignFormModal';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { analyticsService } from '../../services/analyticsService';
import { campaignService } from '../../services/campaignService';
import { templateService } from '../../services/templateService';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';
import {
  FiSend,
  FiMail,
  FiTrendingUp,
  FiMousePointer,
  FiAlertCircle,
  FiPlus,
  FiUsers,
  FiFileText,
  FiCalendar,
  FiZap,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi';

export function Dashboard() {
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

  // Quick Action: Create Campaign
  const handleSaveCampaign = async (payload) => {
    try {
      setSubmitting(true);
      if (editingCampaign) {
        await campaignService.updateCampaign(editingCampaign.id, payload);
        addToast({ title: 'Campaign Updated', message: `Updated "${payload.name}" successfully.`, type: 'success' });
      } else {
        await campaignService.createCampaign(payload);
        addToast({ title: 'Campaign Created', message: `Created "${payload.name}" successfully.`, type: 'success' });
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
      addToast({ title: 'Campaign Sent!', message: 'Email campaign dispatched to active list.', type: 'success' });
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
      addToast({ title: 'Campaign Deleted', message: 'Campaign removed from system.', type: 'info' });
      setDeletingId(null);
      fetchDashboardData();
    } catch (err) {
      addToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    {
      title: 'Total Campaigns',
      value: summary.totalCampaigns ?? 0,
      change: '+12% this month',
      icon: FiSend,
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      title: 'Emails Sent',
      value: (summary.emailsSent ?? 0).toLocaleString(),
      change: '+18.4% vs last week',
      icon: FiMail,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Open Rate',
      value: `${summary.openRate ?? 0}%`,
      change: '+4.2% industry avg',
      icon: FiTrendingUp,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Click Rate',
      value: `${summary.clickRate ?? 0}%`,
      change: '+1.5% from last blast',
      icon: FiMousePointer,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const scheduledCampaigns = useMemo(() => {
    return campaigns.filter((c) => c.status === 'scheduled');
  }, [campaigns]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard Overview" description="Loading metrics & workspace performance..." />
        <SkeletonLoader type="stat" count={4} />
        <SkeletonLoader type="card" count={2} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Dashboard Overview"
        description="Monitor email performance, automation drips, active subscriber response, and recent campaigns."
        badge="Live Metrics"
        actions={
          <>
            <SecondaryButton icon={FiZap} onClick={() => navigate('/analytics')}>
              View Detailed Report
            </SecondaryButton>
            <PrimaryButton icon={FiPlus} onClick={() => { setEditingCampaign(null); setIsCampaignModalOpen(true); }}>
              New Campaign
            </PrimaryButton>
          </>
        }
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {stat.value}
                  </h3>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${stat.color} text-white flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-3 flex items-center gap-1">
                <span>↑</span> {stat.change}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions Bar */}
      <Card title="Quick Actions" subtitle="Streamline your daily marketing workflows in one click">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => { setEditingCampaign(null); setIsCampaignModalOpen(true); }}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-center group"
          >
            <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
              <FiSend className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">Create Campaign</span>
            <span className="text-[10px] text-slate-400">Build email broadcast</span>
          </button>

          <button
            onClick={() => navigate('/contacts')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-center group"
          >
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
              <FiUsers className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">Import Contacts</span>
            <span className="text-[10px] text-slate-400">Add subscribers / CSV</span>
          </button>

          <button
            onClick={() => navigate('/templates')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-center group"
          >
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform">
              <FiFileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">New Template</span>
            <span className="text-[10px] text-slate-400">HTML email builder</span>
          </button>

          <button
            onClick={() => navigate('/analytics')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-center group"
          >
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 mb-2 group-hover:scale-110 transition-transform">
              <FiTrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">Deep Analytics</span>
            <span className="text-[10px] text-slate-400">Engagements & funnels</span>
          </button>
        </div>
      </Card>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Campaign Performance" subtitle="Comparison of emails sent, opened, and clicked across campaigns">
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
          title="Upcoming Scheduled"
          subtitle="Automated campaigns ready for queue dispatch"
          className="lg:col-span-1"
        >
          {scheduledCampaigns.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No scheduled campaigns pending.
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledCampaigns.map((sc) => (
                <div
                  key={sc.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{sc.name}</h5>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
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
        <Card title="Recent Activity Timeline" subtitle="System events & automated campaign triggers" className="lg:col-span-2">
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            <div className="relative flex items-start justify-between">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Welcome Drip campaign dispatched
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Delivered to 1,240 trial users with 38% open rate
                </p>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">12m ago</span>
            </div>

            <div className="relative flex items-start justify-between">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  New Contact List Imported via CSV
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Added 150 enterprise leads tagged with "Q3 Lead"
                </p>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">2h ago</span>
            </div>

            <div className="relative flex items-start justify-between">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-white dark:ring-slate-900" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  HTML Email Template Updated
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Template "Promo Highlight" modified by Alex Morgan
                </p>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">5h ago</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Campaigns Table */}
      <Card
        title="Recent Campaigns"
        subtitle="Manage and monitor all recent email marketing blasts"
        action={
          <SecondaryButton size="sm" onClick={() => navigate('/campaigns')}>
            View All Campaigns
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
        message="Are you sure you want to delete this campaign? All analytics data associated with it will be removed permanently."
        loading={submitting}
      />
    </div>
  );
}

export default Dashboard;
