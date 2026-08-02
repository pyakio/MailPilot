import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { APP_NAME, APP_SUBTITLE } from '../../../constants';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('alex.morgan@mailpilot.com');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      addToast({
        title: 'Welcome Back',
        message: 'Signed in to MailPilot dashboard.',
        type: 'success',
      });
      navigate('/');
    } catch (err) {
      addToast({ title: 'Sign In Error', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#090D16] font-sans items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl animate-fade-in">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
            <FiMail className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight leading-none">
              {APP_NAME}
            </h2>
            <span className="text-[10px] font-medium text-slate-400">
              {APP_SUBTITLE}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
            Sign in to MailPilot
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your email and password to access your marketing workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Work Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <a href="#" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <FiLock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <PrimaryButton type="submit" loading={loading} fullWidth size="lg" icon={FiArrowRight}>
            Sign In
          </PrimaryButton>
        </form>

        <p className="mt-8 text-center text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          © 2026 MailPilot Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
