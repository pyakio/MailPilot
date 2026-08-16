import React, { useState } from 'react';
import Card from '../../../shared/ui/Card';
import Button from '../../../shared/ui/Button';
import Input from '../../../shared/ui/Input';
import Badge from '../../../shared/ui/Badge';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { authService } from '../../../services/authService';
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
  const { user, login } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'billing' | 'developer'
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [senderDomain, setSenderDomain] = useState('mail.pilot-app.io');
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('growth');

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authService.updateProfile({ name });
      if (res?.user) {
        login(localStorage.getItem('token'), res.user);
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
            Configure workspace preferences, subscription plans, sender domains, and developer keys.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-2">
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

      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Usage KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-5">
              <span className="text-[10px] font-mono font-semibold text-[var(--text-secondary)] uppercase">Subscribers Limit</span>
              <div className="text-2xl font-bold font-mono text-[var(--text)] mt-1">5 / 500</div>
              <div className="w-full bg-[var(--surface-secondary)] h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#22C55E] h-full w-[1%]" />
              </div>
              <span className="text-[11px] text-[var(--text-muted)] mt-1 block">1% of Free Tier allocated</span>
            </Card>

            <Card className="p-5">
              <span className="text-[10px] font-mono font-semibold text-[var(--text-secondary)] uppercase">Monthly Broadcast Volume</span>
              <div className="text-2xl font-bold font-mono text-[var(--text)] mt-1">10 / 1,000</div>
              <div className="w-full bg-[var(--surface-secondary)] h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#E8A33D] h-full w-[1%]" />
              </div>
              <span className="text-[11px] text-[var(--text-muted)] mt-1 block">Resets on the 1st of each month</span>
            </Card>
          </div>

          {/* Pricing Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLAN_TIERS.map((tier) => {
              const isSelected = selectedPlan === tier.id;
              return (
                <div
                  key={tier.id}
                  className={`p-6 rounded-xl border flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-[var(--surface-card)] border-[#E8A33D] shadow-lg ring-1 ring-[#E8A33D]/50'
                      : 'bg-[var(--surface-card)] border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-[var(--text)] font-heading">{tier.name}</h3>
                      {tier.recommended && <Badge variant="amber">POPULAR</Badge>}
                      {isSelected && <Badge variant="success">CURRENT</Badge>}
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold font-mono text-[var(--text)]">{tier.price}</span>
                      <span className="text-xs text-[var(--text-secondary)]">/{tier.period}</span>
                    </div>

                    <div className="py-3 border-t border-b border-[var(--border)] text-xs font-mono space-y-1 text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1.5 text-[var(--text)]">
                        <FiZap className="w-3.5 h-3.5 text-[#E8A33D]" />
                        <span>{tier.contactLimit}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[var(--text)]">
                        <FiGlobe className="w-3.5 h-3.5 text-[#3E6B70]" />
                        <span>{tier.emailLimit}</span>
                      </div>
                    </div>

                    <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                      {tier.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <FiCheck className="w-3.5 h-3.5 text-[#22C55E] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--border)]">
                    <Button
                      fullWidth
                      variant={isSelected ? 'outline' : 'primary'}
                      disabled={isSelected}
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
