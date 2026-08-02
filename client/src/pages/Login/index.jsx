import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { FiMail, FiLock, FiCheckCircle, FiZap, FiArrowRight } from 'react-icons/fi';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('alex.morgan@acmecloud.io');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      addToast({
        title: 'Welcome Back!',
        message: 'Successfully logged into CloudMail Dashboard.',
        type: 'success',
      });
      navigate('/');
    } catch (err) {
      addToast({ title: 'Authentication Failed', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Form Column */}
      <div className="flex-1 flex flex-col justify-between p-8 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <FiMail className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white text-xl tracking-tight">
              CloudMail<span className="text-indigo-600 dark:text-indigo-400">.io</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              Sign in to your account
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter your credentials to access your email marketing campaigns and telemetry.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">Remember for 30 days</span>
              </label>
            </div>

            <PrimaryButton type="submit" loading={loading} fullWidth size="lg" icon={FiArrowRight}>
              Sign In to Dashboard
            </PrimaryButton>
          </form>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-center">
          © 2026 CloudMail Inc. Enterprise SaaS Platform.
        </div>
      </div>

      {/* Right Hero Branding Column */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-950" />
        <div className="relative z-10 max-w-lg text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
            <FiZap className="fill-current" /> High-Deliverability Cloud Engine
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Enterprise Email Marketing & Automation Drips.
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Join over 12,000 SaaS teams scaling customer engagement with real-time telemetry, automated triggers, and DKIM/SPF domain verification.
          </p>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <FiCheckCircle className="text-emerald-400 w-5 h-5 shrink-0" />
              <span>99.4% Inbox placement deliverability rate</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <FiCheckCircle className="text-emerald-400 w-5 h-5 shrink-0" />
              <span>Visual HTML email builder with dynamic tags</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <FiCheckCircle className="text-emerald-400 w-5 h-5 shrink-0" />
              <span>Real-time click & open analytics telemetry</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
