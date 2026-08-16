import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Avatar from '../../ui/Avatar';
import Badge from '../../ui/Badge';
import { FiUser, FiMail, FiCheck, FiPlus, FiArrowRight, FiTrash2 } from 'react-icons/fi';

const STORAGE_KEY = 'mailpilot_saved_google_accounts';

const DEFAULT_ACCOUNTS = [
  {
    name: 'Akio',
    email: 'akio.pilot@gmail.com',
    image: 'https://ui-avatars.com/api/?name=Akio&background=E8A33D&color=14171C&bold=true',
  },
  {
    name: 'Abhay Singh',
    email: 'abhay.singh@gmail.com',
    image: 'https://ui-avatars.com/api/?name=Abhay+Singh&background=3E6B70&color=FFFFFF&bold=true',
  },
];

export function GoogleAuthModal({ isOpen, onClose, onSelectAccount, loading = false }) {
  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_ACCOUNTS;
  });

  const [mode, setMode] = useState('list'); // 'list' | 'add'
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [rememberAccount, setRememberAccount] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setMode('list');
    }
  }, [isOpen]);

  const handleAccountClick = (acc) => {
    if (loading) return;
    onSelectAccount(acc);
  };

  const handleAddAccountSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = customName.trim();
    const trimmedEmail = customEmail.trim().toLowerCase();

    if (!trimmedName) {
      setError('Please enter your full name or username.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }

    const newAcc = {
      name: trimmedName,
      email: trimmedEmail,
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=E8A33D&color=14171C&bold=true`,
    };

    if (rememberAccount) {
      const updated = [newAcc, ...accounts.filter((a) => a.email !== trimmedEmail)];
      setAccounts(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }

    onSelectAccount(newAcc);
  };

  const handleRemoveAccount = (e, emailToRemove) => {
    e.stopPropagation();
    const updated = accounts.filter((a) => a.email !== emailToRemove);
    setAccounts(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="md"
    >
      <div className="space-y-5 pt-1">
        {/* Google Header Logo & Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-md mx-auto p-2 border border-slate-200">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-[var(--text)]">
              Sign in with Google
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Choose your browser Google account or enter custom credentials to access MailPilot.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-mono">
            {error}
          </div>
        )}

        {mode === 'list' ? (
          <div className="space-y-3">
            <div className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider px-1">
              Detected Accounts on this Device ({accounts.length})
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {accounts.map((acc) => (
                <div
                  key={acc.email}
                  onClick={() => handleAccountClick(acc)}
                  className="p-3 bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[#E8A33D]/60 rounded-xl flex items-center justify-between cursor-pointer transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={acc.image}
                      alt={acc.name}
                      className="w-9 h-9 rounded-full border border-[var(--border)] shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[var(--text)] group-hover:text-[#E8A33D] transition-colors truncate">
                          {acc.name}
                        </p>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] font-mono truncate">
                        {acc.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleRemoveAccount(e, acc.email)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove from saved accounts"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="p-2 rounded-lg bg-[var(--surface-card)] text-[#E8A33D] group-hover:translate-x-0.5 transition-transform">
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add / Choose Another Account Button */}
            <button
              type="button"
              onClick={() => {
                setCustomName('');
                setCustomEmail('');
                setMode('add');
              }}
              className="w-full p-3 rounded-xl border border-dashed border-[var(--border)] hover:border-[#E8A33D] text-[var(--text-secondary)] hover:text-[var(--text)] text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors bg-[var(--surface-card)] hover:bg-[var(--surface-hover)]"
            >
              <FiPlus className="w-4 h-4 text-[#E8A33D]" />
              <span>Use another account / Add username</span>
            </button>
          </div>
        ) : (
          /* Custom Account Form */
          <form onSubmit={handleAddAccountSubmit} className="space-y-4">
            <div className="p-3.5 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)] space-y-3">
              <Input
                label="Your Username / Full Name"
                icon={FiUser}
                placeholder="e.g. Akio or Abhay Singh"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
                autoFocus
              />

              <Input
                label="Google Email Address"
                icon={FiMail}
                type="email"
                placeholder="e.g. yourname@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                required
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberAccountCheck"
                  checked={rememberAccount}
                  onChange={(e) => setRememberAccount(e.target.checked)}
                  className="rounded border-[var(--border)] text-[#E8A33D] focus:ring-[#E8A33D]"
                />
                <label
                  htmlFor="rememberAccountCheck"
                  className="text-xs text-[var(--text-secondary)] cursor-pointer select-none"
                >
                  Save this account to browser for 1-click login
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMode('list')}
              >
                Back to Accounts
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={loading}
                icon={FiCheck}
              >
                Continue as {customName.trim() || 'User'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

export default GoogleAuthModal;
