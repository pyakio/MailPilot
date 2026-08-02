import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import {
  FiUser,
  FiMail,
  FiKey,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiCreditCard,
} from 'react-icons/fi';

export function Settings() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'sender' | 'api' | 'billing'
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Alex Morgan',
    email: user?.email || 'alex@mailpilot.io',
    role: user?.role || 'Head of Growth',
    company: user?.company || 'MailPilot SaaS Inc.',
  });

  const [apiKey] = useState('mp_live_9981a88b776211ff09aa');
  const [showKey, setShowKey] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser(profileForm);
    addToast({
      title: 'Profile Updated',
      message: 'Account details saved successfully.',
      type: 'success',
    });
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    addToast({
      title: 'API Key Copied',
      message: 'Copied secret key to clipboard.',
      type: 'success',
      duration: 2000,
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: FiUser },
    { id: 'sender', label: 'Sender & Domain', icon: FiMail },
    { id: 'api', label: 'API Keys & Webhooks', icon: FiKey },
    { id: 'billing', label: 'Subscription & Billing', icon: FiCreditCard },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Configuration"
        description="Manage workspace profile, sender authentication keys, API integrations, and billing plans."
      />

      {/* Tabs Header */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card title="Account Profile" subtitle="Update your personal details and company workspace information">
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-500/20"
              />
              <div>
                <SecondaryButton size="sm">Change Avatar</SecondaryButton>
                <p className="text-[11px] text-slate-400 mt-1">JPG, GIF or PNG. Max size 2MB.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Role Title
                </label>
                <input
                  type="text"
                  value={profileForm.role}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  value={profileForm.company}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            <div className="pt-2">
              <PrimaryButton type="submit">Save Changes</PrimaryButton>
            </div>
          </form>
        </Card>
      )}

      {/* Sender Tab */}
      {activeTab === 'sender' && (
        <Card title="Sender & Domain Authentication" subtitle="Configure custom sending domain records (DKIM, SPF, DMARC)">
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                From Name
              </label>
              <input
                type="text"
                defaultValue="Alex from MailPilot"
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Reply-To Email Address
              </label>
              <input
                type="email"
                defaultValue="support@mailpilot.io"
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  Sending Domain Status: mail.mailpilot.io
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                All DNS CNAME & TXT records verified. High deliverability active.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api' && (
        <Card title="API Keys & Webhooks" subtitle="Connect external applications using REST API key">
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Live Production Secret Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  readOnly
                  value={apiKey}
                  className="w-full px-3.5 py-2 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
                <SecondaryButton
                  icon={showKey ? FiEyeOff : FiEye}
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? 'Hide' : 'Show'}
                </SecondaryButton>
                <PrimaryButton icon={FiCopy} onClick={handleCopyKey}>
                  Copy
                </PrimaryButton>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <Card title="Subscription & SaaS Tiers" subtitle="Manage your MailPilot enterprise marketing plan">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Starter</span>
              <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">$29/mo</h4>
              <p className="text-xs text-slate-500 mt-2">Up to 10,000 emails/mo</p>
              <SecondaryButton fullWidth className="mt-4">Downgrade</SecondaryButton>
            </div>

            <div className="p-6 rounded-2xl border-2 border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 relative shadow-xl">
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-indigo-600 text-white rounded-full">
                Active Plan
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Enterprise Pro</span>
              <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">$149/mo</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">Up to 100,000 emails/mo + priority IP</p>
              <PrimaryButton fullWidth className="mt-4" disabled>Current Active Plan</PrimaryButton>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Custom Scale</span>
              <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Custom</h4>
              <p className="text-xs text-slate-500 mt-2">1M+ emails with dedicated account manager</p>
              <SecondaryButton fullWidth className="mt-4">Contact Sales</SecondaryButton>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default Settings;
