import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { FiMail, FiLock, FiUser, FiArrowRight, FiEye, FiEyeOff, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { APP_NAME } from '../../../constants';
import GoogleAuthModal from '../../../shared/components/auth/GoogleAuthModal';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const passwordStrength = (() => {
    if (password.length === 0) return null;
    if (password.length < 8) return 'weak';
    if (password.length < 12 || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) return 'fair';
    return 'strong';
  })();

  const strengthColors = { weak: '#EF4444', fair: '#E8A33D', strong: '#22C55E' };
  const strengthLabels = { weak: 'Too short (min 8)', fair: 'Good', strong: 'Strong' };

  const handleGoogleAccountSelect = async (account) => {
    try {
      setGoogleLoading(true);
      setErrorMsg('');
      const cred = `demo_${account.email}:::${account.name}`;
      await loginWithGoogle(cred, account.name, account.email);
      setIsGoogleModalOpen(false);
      addToast({
        title: 'Workspace Created',
        message: `Welcome to MailPilot, ${account.name}!`,
        type: 'success',
      });
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Google registration failed.');
      addToast({ title: 'Google Sign In Failed', message: err.message, type: 'error' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please provide a valid work email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);
      addToast({ title: 'Account Created', message: `Welcome to MailPilot, ${name.split(' ')[0]}!`, type: 'success' });
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#14171C] font-sans">
      {/* Left Panel — Brand Hero */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] bg-[#111317] border-r border-[rgba(255,255,255,0.07)] p-12 relative overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-lg bg-[#E8A33D] flex items-center justify-center text-[#14171C] font-bold text-lg">
            ⚡
          </div>
          <div>
            <span className="font-bold text-[#F4F5F7] text-[18px] tracking-tight font-heading">{APP_NAME}</span>
            <p className="text-[11px] text-[#6B7280] font-mono uppercase tracking-wider">AI Email Marketing Engine</p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="space-y-6 relative z-10">
          <h2 className="text-3xl font-bold font-heading text-[#F4F5F7] leading-snug">
            Create your high-deliverability email marketing workspace.
          </h2>
          <div className="space-y-3 text-sm text-[#9CA3AF]">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#E8A33D]" />
              <span>Instant multi-tenant workspace isolation</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#3E6B70]" />
              <span>Integrated AI copywriter & deliverability scanner</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span>Free tier with up to 1,000 monthly broadcast emails</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-xs font-mono text-[#6B7280]">
          MailPilot Platform &bull; v2.0 Enterprise Release
        </p>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#E8A33D] flex items-center justify-center text-[#14171C] font-bold">
            ⚡
          </div>
          <span className="font-bold text-[#F4F5F7] text-[16px] font-heading">{APP_NAME}</span>
        </div>

        <div className="w-full max-w-[420px] space-y-6 bg-[#1B1E24] p-8 rounded-xl border border-[rgba(255,255,255,0.08)] shadow-2xl">
          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-heading text-[#F4F5F7] tracking-tight">
              Create your workspace
            </h2>
            <p className="text-xs text-[#9CA3AF]">
              Already registered?{' '}
              <Link to="/login" className="text-[#E8A33D] hover:underline font-semibold">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-lg text-xs text-[#F87171] flex items-start gap-2.5"
            >
              <FiAlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={() => setIsGoogleModalOpen(true)}
            disabled={googleLoading || loading}
            className="w-full h-[44px] flex items-center justify-center gap-3 bg-[#16191F] hover:bg-[#20242D] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs font-medium text-[#F4F5F7] active:scale-[0.99] transition-all"
          >
            {googleLoading ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin text-[#E8A33D]" />
                <span>Creating workspace with Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
            <span className="text-xs font-mono text-[#6B7280]">or register with email</span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="register-name" className="block text-xs font-mono font-medium text-[#9CA3AF] uppercase">
                Your Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  id="register-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (errorMsg) setErrorMsg(''); }}
                  placeholder="Alex Morgan"
                  className="w-full h-[42px] pl-10 pr-4 bg-[#16191F] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-[#F4F5F7] placeholder-[#6B7280] focus:outline-none focus:border-[#E8A33D] transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="register-email" className="block text-xs font-mono font-medium text-[#9CA3AF] uppercase">
                Work Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  id="register-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errorMsg) setErrorMsg(''); }}
                  placeholder="operator@company.com"
                  className="w-full h-[42px] pl-10 pr-4 bg-[#16191F] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-[#F4F5F7] placeholder-[#6B7280] focus:outline-none focus:border-[#E8A33D] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="register-password" className="block text-xs font-mono font-medium text-[#9CA3AF] uppercase">
                  Password
                </label>
                {passwordStrength && (
                  <span className="text-[11px] font-mono font-medium" style={{ color: strengthColors[passwordStrength] }}>
                    {strengthLabels[passwordStrength]}
                  </span>
                )}
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errorMsg) setErrorMsg(''); }}
                  placeholder="Min. 8 characters"
                  className="w-full h-[42px] pl-10 pr-10 bg-[#16191F] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-[#F4F5F7] placeholder-[#6B7280] focus:outline-none focus:border-[#E8A33D] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF] p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="register-confirm-password" className="block text-xs font-mono font-medium text-[#9CA3AF] uppercase">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  id="register-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (errorMsg) setErrorMsg(''); }}
                  placeholder="Re-enter password"
                  className="w-full h-[42px] pl-10 pr-4 bg-[#16191F] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-[#F4F5F7] placeholder-[#6B7280] focus:outline-none focus:border-[#E8A33D] transition-colors"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={loading || googleLoading}
              className="w-full h-[44px] flex items-center justify-center gap-2 bg-[#E8A33D] hover:bg-[#D9932E] active:scale-[0.99] text-[#14171C] font-semibold text-sm rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 focus:outline-none focus:ring-2 focus:ring-[#E8A33D]"
            >
              {loading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-mono font-medium">Creating account...</span>
                </>
              ) : (
                <>
                  Create Account & Launch Workspace
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleGoogleAccountSelect}
        loading={googleLoading}
      />
    </div>
  );
}

export default RegisterPage;
