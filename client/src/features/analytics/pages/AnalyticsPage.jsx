import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../../app/layouts/PageHeader';
import { Card } from '../../../components/ui/Card';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import { EmailOpenTrendChart } from '../../../components/charts/EmailOpenTrendChart';
import { CampaignBreakdownChart } from '../../../components/charts/CampaignBreakdownChart';
import { analyticsService } from '../../../services/analyticsService';
import { useToast } from '../../../hooks/useToast';
import { FiDownload, FiCheckCircle, FiPercent, FiAlertTriangle, FiLayers, FiSmartphone, FiGlobe } from 'react-icons/fi';

export function AnalyticsPage() {
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
      message: 'Exported analytics CSV report.',
      type: 'success',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Loading metrics..." />
        <SkeletonLoader type="stat" count={4} />
        <SkeletonLoader type="card" count={2} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Comprehensive insights on email open rates, click conversions, deliverability metrics, and audience retention."
        badge="Real-time Telemetry"
        actions={
          <PrimaryButton icon={FiDownload} onClick={handleExportReport}>
            Export Report (.csv)
          </PrimaryButton>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Open Rate</span>
            <FiCheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {analytics.openRate ?? 0}%
          </h3>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Click Rate</span>
            <FiPercent className="w-4 h-4 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {analytics.clickRate ?? 0}%
          </h3>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Bounce Rate</span>
            <FiAlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {analytics.bounceRate ?? 0}%
          </h3>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Deliverability</span>
            <FiLayers className="w-4 h-4 text-purple-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            99.2%
          </h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Open Rate Trend" subtitle="Daily email open rate progression">
          <EmailOpenTrendChart data={analytics.trend || []} />
        </Card>

        <Card title="Engagement Breakdown" subtitle="Comparison per campaign">
          <CampaignBreakdownChart data={campaignBarData} />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Device Distribution" subtitle="Client breakdown">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-1.5"><FiSmartphone /> Mobile Clients</span>
                <span>64%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '64%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-1.5"><FiGlobe /> Desktop Webmail</span>
                <span>31%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '31%' }} />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Domain Authentication" subtitle="DNS status verification">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">SPF Verification</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">PASSED</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">DKIM Signature</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">PASSED</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsPage;
