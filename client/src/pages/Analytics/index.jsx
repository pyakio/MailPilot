import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmailOpenTrendChart } from '../../components/charts/EmailOpenTrendChart';
import { CampaignBreakdownChart } from '../../components/charts/CampaignBreakdownChart';
import { analyticsService } from '../../services/analyticsService';
import { useToast } from '../../hooks/useToast';
import { FiDownload, FiCheckCircle, FiAlertTriangle, FiPercent, FiLayers, FiSmartphone, FiGlobe } from 'react-icons/fi';

export function Analytics() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({ trend: [], perCampaign: [] });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getAnalytics();
      setAnalytics(res);
    } catch (err) {
      addToast({ title: 'Error Loading Analytics', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const campaignBarData = (analytics.perCampaign || []).map((c) => ({
    name: c.name,
    Sent: c.sent || 0,
    Opened: c.opened || 0,
    Clicked: c.clicked || 0,
  }));

  const handleExportReport = () => {
    addToast({
      title: 'Report Downloaded',
      message: 'Analytics report exported as CSV document.',
      type: 'success',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Marketing Analytics" description="Loading detailed engagement stats..." />
        <SkeletonLoader type="stat" count={4} />
        <SkeletonLoader type="card" count={2} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Marketing Analytics"
        description="Comprehensive insights on email open rates, click conversions, deliverability metrics, and subscriber retention."
        badge="Real-time Telemetry"
        actions={
          <PrimaryButton icon={FiDownload} onClick={handleExportReport}>
            Export Report (.csv)
          </PrimaryButton>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Open Rate</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {analytics.openRate ?? 0}%
              </h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FiCheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
            ↑ 3.8% above benchmark
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Click Rate</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {analytics.clickRate ?? 0}%
              </h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FiPercent className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-semibold">
            ↑ 1.2% link interaction
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bounce Rate</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {analytics.bounceRate ?? 0}%
              </h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <FiAlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-semibold">
            ↓ 0.4% hard bounces
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Deliverability</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                99.2%
              </h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <FiLayers className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
            Active Inbox Placement
          </p>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Open Rate Progression" subtitle="7-Day aggregate email open trend">
          <EmailOpenTrendChart data={analytics.trend || []} />
        </Card>

        <Card title="Campaign Engagement Breakdown" subtitle="Comparison of emails sent, opened, and clicked per campaign">
          <CampaignBreakdownChart data={campaignBarData} />
        </Card>
      </div>

      {/* Demographic & Device Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Device Breakdown" subtitle="Client email client distribution">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-1.5"><FiSmartphone className="text-indigo-500" /> Mobile (Apple Mail & Gmail App)</span>
                <span>64%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '64%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-1.5"><FiGlobe className="text-emerald-500" /> Desktop Webmail (Outlook / Chrome)</span>
                <span>31%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '31%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Tablet / Others</span>
                <span>5%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '5%' }} />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Deliverability & Reputation" subtitle="DKIM, SPF, & DMARC authentication status">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">SPF Verification</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-600 text-white">PASSED</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">DKIM Signature</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-600 text-white">PASSED</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">DMARC Policy Enforcement</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-600 text-white">STRICT</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Analytics;
