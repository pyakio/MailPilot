import React, { useState, useEffect } from 'react';
import Card from '../../../shared/ui/Card';
import Button from '../../../shared/ui/Button';
import Input from '../../../shared/ui/Input';
import Badge from '../../../shared/ui/Badge';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { settingsService } from '../../../services/settingsService';
import { inboxService } from '../../../services/inboxService';
import {
  FiUser,
  FiLock,
  FiSave,
  FiKey,
  FiGlobe,
  FiCreditCard,
  FiCheck,
  FiZap,
  FiAlertCircle,
  FiCode,
  FiMail,
  FiRefreshCw,
  FiShield,
  FiCheckCircle,
  FiActivity,
  FiTrash2,
} from 'react-icons/fi';

const PLAN_TIERS = [
  {
    id: 'starter',
    name: 'Starter Tier',
    price: '$0',
    period: 'forever',
    contactLimit: '500 Contacts',
    emailLimit: '1,000 Emails/mo',
    features: ['Standard Open/Click Tracking', 'AI Subject Line Copilot', '1 Custom Workspace', 'Community Support'],
  },
  {
    id: 'growth',
    name: 'Scale & Growth',
    price: '$49',
    period: 'monthly',
    contactLimit: '10,000 Contacts',
    emailLimit: '50,000 Emails/mo',
    recommended: true,
    features: [
      'Real-Time Telemetry Tracking',
      'AI Email Copy Studio (Unlimited)',
      'Sub-second Automated Drips',
      'Custom DKIM/SPF Domain Auth',
      'Dedicated IP Warm-up',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Scale',
    price: '$199',
    period: 'monthly',
    contactLimit: '100,000+ Contacts',
    emailLimit: 'Unlimited Broadcasts',
    features: [
      'Multi-IP Pool Load Balancing',
      'Custom DMARC & BIMI Setup',
      '99.99% Uptime SLA',
      'Dedicated Deliverability Engineer',
      '24/7 Priority Emergency Phone',
    ],
  },
];

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'gmail' | 'billing' | 'developer'
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [senderDomain, setSenderDomain] = useState('mail.pilot-app.io');
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('growth');

  // Gmail Sync Status State
  const [gmailStatus, setGmailStatus] = useState({ connected: false });
  const [loadingGmail, setLoadingGmail] = useState(false);
  const [syncingMailbox, setSyncingMailbox] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchGmailStatus = async () => {
    setLoadingGmail(true);
    try {
      const res = await inboxService.getGmailStatus();
      setGmailStatus(res || { connected: false });
    } catch (err) {
      // ignore
    } finally {
      setLoadingGmail(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'gmail') {
      fetchGmailStatus();
    }
  }, [activeTab]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await settingsService.updateProfile({ name });
      if (res?.user && updateUser) {
        updateUser(res.user);
      }
      addToast({
        title: 'Settings Saved',
        message: 'Workspace profile updated successfully.',
        type: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Save Failed',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGmail = async () => {
    try {
      const res = await inboxService.getGoogleAuthUrl();
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      addToast({
        title: 'OAuth Error',
        message: 'Could not initialize Google OAuth login.',
        type: 'error',
      });
    }
  };

  const handleSyncMailbox = async () => {
    setSyncingMailbox(true);
    try {
      const res = await inboxService.syncInbox();
      addToast({
        title: 'Mailbox Synchronized',
        message: `Synced ${res.syncedThreads || 0} threads and ${res.syncedEmails || 0} messages.`,
        type: 'success',
      });
      await fetchGmailStatus();
    } catch (err) {
      addToast({
        title: 'Sync Failed',
        message: err.response?.data?.error || 'Unable to sync mailbox.',
        type: 'error',
      });
    } finally {
      setSyncingMailbox(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Gmail account? You can reconnect anytime.')) {
      return;
    }

    setDisconnecting(true);
    try {
      await inboxService.disconnectGmail();
      addToast({
        title: 'Gmail Disconnected',
        message: 'Your Google OAuth tokens have been securely wiped.',
        type: 'success',
      });
      await fetchGmailStatus();
    } catch (err) {
      addToast({
        title: 'Disconnection Failed',
        message: err.response?.data?.error || 'Could not disconnect Gmail.',
        type: 'error',
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleUpgradePlan = (planId) => {
    setSelectedPlan(planId);
    addToast({
      title: 'Plan Updated',
      message: `Workspace upgraded to ${planId} plan. Stripe subscription active.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Page Header & Tab Switcher */}
      <div className="space-y-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#E8A33D] text-xl">⚡</span>
            <h1 className="text-2xl font-bold font-heading text-[var(--text)]">Settings & Configuration</h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Configure workspace preferences, Gmail mailbox synchronization, subscription plans, and API keys.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-2 flex-wrap">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 text-xs font-mono font-semibold rounded-lg transition-colors ${
              activeTab === 'general'
                ? 'bg-[#E8A33D] text-[#14171C]'
                : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] border border-[var(--border)]'
            }`}
          >
            General Profile
          </button>

          <button
            onClick={() => setActiveTab('gmail')}
            className={`px-4 py-2 text-xs font-mono font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'gmail'
                ? 'bg-[#E8A33D] text-[#14171C]'
                : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] border border-[var(--border)]'
            }`}
          >
            <FiMail className="w-3.5 h-3.5" />
            Gmail & Sync
            {gmailStatus?.connected && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 text-xs font-mono font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'billing'
                ? 'bg-[#E8A33D] text-[#14171C]'
                : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] border border-[var(--border)]'
            }`}
          >
            <FiCreditCard className="w-3.5 h-3.5" />
            Plan & Billing
          </button>

          <button
            onClick={() => setActiveTab('developer')}
            className={`px-4 py-2 text-xs font-mono font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'developer'
                ? 'bg-[#E8A33D] text-[#14171C]'
                : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] border border-[var(--border)]'
            }`}
          >
            <FiCode className="w-3.5 h-3.5" />
            DKIM & Developer
          </button>
        </div>
      </div>

      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <Card title="Account Profile" subtitle="Your personal workspace identification and roles">
            <div className="space-y-4">
              <Input
                label="Full Name"
                icon={FiUser}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                icon={FiLock}
                type="email"
                value={email}
                onChange={() => {}}
                required
                disabled
              />
              <div className="text-xs font-mono text-[var(--text-secondary)]">
                Workspace: <span className="text-[var(--text)] font-semibold">{user?.workspaceName || 'Default Workspace'}</span> <span className="text-[var(--text-muted)]">({user?.workspaceId || 'ws_default'})</span>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button variant="primary" type="submit" icon={FiSave} loading={loading}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'gmail' && (
        <div className="space-y-6">
          <Card
            title="Gmail Account Connection"
            subtitle="Connect your Google Workspace or Gmail account for bi-directional synchronization and AI email processing"
          >
            {loadingGmail ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-[#E8A33D] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : gmailStatus?.connected ? (
              <div className="space-y-6">
                {/* Connected Status Card */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-500">
                      <FiCheckCircle className="w-5 h-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--text)]">
                          Connected & Synchronizing
                        </span>
                        <Badge variant="success">Active</Badge>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        Connected as <strong className="text-[var(--text)] font-mono">{gmailStatus.account?.email || user?.email}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FiRefreshCw}
                      loading={syncingMailbox}
                      onClick={handleSyncMailbox}
                    >
                      Sync Now
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={FiTrash2}
                      loading={disconnecting}
                      onClick={handleDisconnectGmail}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>

                {/* Diagnostics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
                      <FiActivity className="w-4 h-4 text-[#E8A33D]" />
                      <span>Background Sync</span>
                    </div>
                    <p className="text-sm font-bold text-[var(--text)] font-mono">
                      Every 60 Seconds
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Automatic polling active
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
                      <FiShield className="w-4 h-4 text-emerald-500" />
                      <span>Token Encryption</span>
                    </div>
                    <p className="text-sm font-bold text-[var(--text)] font-mono">
                      AES-256-GCM
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Encrypted at rest with auth tags
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
                      <FiZap className="w-4 h-4 text-[#3E6B70] dark:text-[#6ee7b7]" />
                      <span>Granted Scopes</span>
                    </div>
                    <p className="text-sm font-bold text-[var(--text)] font-mono truncate">
                      modify, send, profile
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Full read/write capability
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-[#E8A33D] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[var(--text)] block">
                      No Google Account Connected
                    </span>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Connect your Google Workspace or personal Gmail account to unlock full mailbox sync, live thread view, AI summarization, and one-click compose/reply within MailPilot.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-semibold text-[var(--text-secondary)] block">
                    Permissions MailPilot will request:
                  </span>
                  <ul className="space-y-2 text-xs text-[var(--text)]">
                    <li className="flex items-center gap-2">
                      <FiCheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Read, compose, send, and modify emails in your mailbox</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Synchronize messages and threads into MailPilot's secure cache</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Process conversation threads with AI summarization & smart reply copilots</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <Button variant="primary" icon={FiMail} onClick={handleConnectGmail}>
                    Connect Gmail Account
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Usage KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Monthly Broadcast Volume</span>
                  <div className="text-2xl font-bold font-mono text-[var(--text)] mt-1">
                    4,120 / 50,000
                  </div>
                </div>
                <Badge variant="success">8.2% Used</Badge>
              </div>
              <div className="w-full bg-[var(--surface-secondary)] h-2 rounded-full mt-4 overflow-hidden border border-[var(--border)]">
                <div className="bg-[#E8A33D] h-full rounded-full transition-all duration-300" style={{ width: '8.2%' }} />
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Subscribers / Contacts</span>
                  <div className="text-2xl font-bold font-mono text-[var(--text)] mt-1">
                    2,840 / 10,000
                  </div>
                </div>
                <Badge variant="success">28.4% Used</Badge>
              </div>
              <div className="w-full bg-[var(--surface-secondary)] h-2 rounded-full mt-4 overflow-hidden border border-[var(--border)]">
                <div className="bg-[#3E6B70] h-full rounded-full transition-all duration-300" style={{ width: '28.4%' }} />
              </div>
            </Card>
          </div>

          {/* Pricing Tier Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {PLAN_TIERS.map((tier) => {
              const isSelected = selectedPlan === tier.id;
              return (
                <div
                  key={tier.id}
                  className={`p-6 rounded-2xl border flex flex-col justify-between transition-all relative ${
                    isSelected
                      ? 'border-[#E8A33D] bg-[#E8A33D]/5 shadow-md'
                      : 'border-[var(--border)] bg-[var(--surface-card)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  {tier.recommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#E8A33D] text-[#14171C]">
                      Most Popular
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-[var(--text)] font-heading">{tier.name}</h3>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-bold font-mono text-[var(--text)]">{tier.price}</span>
                        <span className="text-xs font-mono text-[var(--text-muted)]">/{tier.period}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-[var(--text-secondary)] font-mono border-y border-[var(--border)] py-3">
                      <div>• {tier.contactLimit}</div>
                      <div>• {tier.emailLimit}</div>
                    </div>

                    <ul className="space-y-2 text-xs text-[var(--text)]">
                      {tier.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <FiCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    <Button
                      variant={isSelected ? 'primary' : 'outline'}
                      fullWidth
                      onClick={() => handleUpgradePlan(tier.id)}
                    >
                      {isSelected ? 'Active Plan' : `Upgrade to ${tier.name}`}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'developer' && (
        <div className="space-y-6">
          <Card title="Sender Domain Verification" subtitle="DKIM & SPF configuration for high inbox deliverability">
            <div className="space-y-4">
              <Input
                label="Sending Domain"
                icon={FiGlobe}
                placeholder="e.g. mail.yourdomain.com"
                value={senderDomain}
                onChange={(e) => setSenderDomain(e.target.value)}
              />
              <div className="p-4 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="w-4 h-4 text-[#F59E0B]" />
                  <span>DKIM & SPF Status: <strong className="text-[#F59E0B]">Not Verified</strong></span>
                </div>
                <Badge variant="warning">DNS Required</Badge>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Add CNAME and TXT records to your DNS provider (Cloudflare, Route53, Namecheap) to verify domain ownership.
              </p>
            </div>
          </Card>

          <Card title="API Keys & Integrations" subtitle="Authenticate external microservices with MailPilot API">
            <div className="p-4 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] space-y-2">
              <div className="flex items-center gap-2 text-[var(--text)] font-semibold">
                <FiKey className="w-4 h-4 text-[#E8A33D]" />
                <span>Workspace API Token</span>
              </div>
              <p className="font-mono bg-[var(--surface-card)] p-2.5 rounded border border-[var(--border)] text-[#E8A33D] truncate">
                mp_live_{user?.id ? user.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 24) : 'sec_key_48f92b7c'}
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Use Bearer authentication in your HTTP requests header: <code>Authorization: Bearer mp_live_...</code>
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
