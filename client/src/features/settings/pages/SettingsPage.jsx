import { useState } from 'react';
import { PageHeader } from '../../../app/layouts/PageHeader';
import { Card } from '../../../components/ui/Card';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../../components/ui/SecondaryButton';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import {
  FiUser,
  FiMail,
  FiKey,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiCreditCard,
} from 'react-icons/fi';
import { APP_NAME } from '../../../constants';

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Alex Morgan',
    email: user?.email || 'alex.morgan@mailpilot.com',
    role: user?.role || 'Head of Growth',
    company: user?.company || 'MailPilot Inc.',
  });

  const [apiKey] = useState('mp_live_9981a88b776211ff09aa');
  const [showKey, setShowKey] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser(profileForm);
    addToast({
      title: 'Profile Saved',
      message: 'Updated profile information.',
      type: 'success',
    });
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    addToast({
      title: 'API Key Copied',
      message: 'Copied key to clipboard.',
      type: 'success',
      duration: 2000,
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'sender', label: 'Sender Domain', icon: FiMail },
    { id: 'api', label: 'API Keys', icon: FiKey },
    { id: 'billing', label: 'Billing & Plan', icon: FiCreditCard },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage workspace profile, sender authentication, API integrations, and billing plans."
      />

      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' && (
        <Card title="Account Profile" subtitle="Update personal details and company information">
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt="Avatar"
                className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-800"
              />
              <SecondaryButton size="sm">Change Photo</SecondaryButton>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="pt-2">
              <PrimaryButton type="submit">Save Profile</PrimaryButton>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'sender' && (
        <Card title="Sender & Domain Verification" subtitle="Configure custom sending domains">
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                From Name
              </label>
              <input
                type="text"
                defaultValue={`Alex from ${APP_NAME}`}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reply-To Email
              </label>
              <input
                type="email"
                defaultValue="support@mailpilot.com"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'api' && (
        <Card title="API Keys" subtitle="REST API key for backend integrations">
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Production Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  readOnly
                  value={apiKey}
                  className="w-full px-3 py-2 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
                <SecondaryButton icon={showKey ? FiEyeOff : FiEye} onClick={() => setShowKey(!showKey)}>
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

      {activeTab === 'billing' && (
        <Card title="Subscription Tier" subtitle="Current plan detail">
          <div className="p-4 rounded-xl border border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 max-w-md">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Enterprise Pro</span>
            <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">$149 / mo</h4>
            <p className="text-xs text-slate-500 mt-1">100,000 monthly email capacity</p>
          </div>
        </Card>
      )}
    </div>
  );
}

export default SettingsPage;
