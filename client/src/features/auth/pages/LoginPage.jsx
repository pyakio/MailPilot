import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { APP_NAME } from '../../../constants';
import GoogleAuthModal from '../../../shared/components/auth/GoogleAuthModal';

function loadGoogleScript(clientId, callback) {
  if (!clientId) return;
  if (window.google) {
    callback();
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = callback;
  document.head.appendChild(script);
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Field-level inline errors
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [serverError, setServerError] = useState('');

  // Target redirect destination if redirected from protected route
  const destination = location.state?.from?.pathname || '/';

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    loadGoogleScript(GOOGLE_CLIENT_ID, () => {
      try {
        window.google?.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const btnContainer = document.getElementById('google-signin-btn-container');
        if (btnContainer && window.google?.accounts?.id?.renderButton) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: btnContainer.offsetWidth || 340,
            text: 'continue_with',
          });
        }
      } catch {
        // Graceful Google OAuth initialization fallback
      }
    });
  }, []);

  const handleGoogleCredential = async (response) => {
    if (!response?.credential) return;
    try {
      setGoogleLoading(true);
      setServerError('');
      await loginWithGoogle(response.credential);
      addToast({ title: 'Welcome to MailPilot', message: 'Signed in with Google.', type: 'success' });
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.message || 'Google authentication failed. Please try again.';
      setServerError(msg);
      addToast({ title: 'Google Sign In Failed', message: msg, type: 'error' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleAccountSelect = async (account) => {
    try {
      setGoogleLoading(true);
      setServerError('');
      const cred = `demo_${account.email}:::${account.name}`;
      await loginWithGoogle(cred, account.name, account.email);
      setIsGoogleModalOpen(false);
      addToast({
        title: 'Welcome to MailPilot',
        message: `Signed in as ${account.name} (${account.email}).`,
        type: 'success',
      });
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.message || 'Google authentication failed. Please try again.';
      setServerError(msg);
      addToast({ title: 'Google Sign In Failed', message: msg, type: 'error' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (GOOGLE_CLIENT_ID && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setIsGoogleModalOpen(true);
    }
  };

  const validateFields = () => {
    const errors = { email: '', password: '' };
    let isValid = true;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Please enter your work email.';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email format (e.g. operator@company.com).';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Please enter your password.';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: '' }));
    }
    if (serverError) setServerError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateFields()) {
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      addToast({ title: 'Welcome Back', message: 'Signed in to MailPilot.', type: 'success' });
      navigate(destination, { replace: true });
    } catch (err) {
      let msg = err.message || 'Unable to sign in. Please try again.';
      if (msg.includes('No account found')) {
        msg = 'No account found with this email address. Please register a new account.';
      } else if (msg.includes('Incorrect password')) {
        msg = 'Incorrect password. Please verify your credentials and try again.';
      } else if (msg.includes('Too many')) {
        msg = 'Too many authentication attempts. Please try again after 15 minutes.';
      }
      setServerError(msg);
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
            Email marketing infrastructure built for high-growth SaaS founders.
          </h2>
          <div className="space-y-3 text-sm text-[#9CA3AF]">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#E8A33D]" />
              <span>Real-time open tracking & click insights</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#3E6B70]" />
              <span>AI subject line generation & spam deliverability scoring</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span>Multi-tenant workspace isolation & background scheduling</span>
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
              Sign in to workspace
            </h2>
            <p className="text-xs text-[#9CA3AF]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#E8A33D] hover:underline font-semibold">
                Create one free
              </Link>
            </p>
          </div>

          {/* Server Error Alert Banner */}
          {serverError && (
            <div
              role="alert"
              className="p-3.5 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-lg text-xs text-[#F87171] flex items-start gap-2.5"
            >
              <FiAlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{serverError}</div>
            </div>
          )}

          {/* Google Sign In */}
          <div className="space-y-3">
            {GOOGLE_CLIENT_ID ? (
              <div id="google-signin-btn" className="w-full min-h-[44px]" />
            ) : (
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={googleLoading || loading}
                className="w-full h-[44px] flex items-center justify-center gap-3 bg-[#16191F] hover:bg-[#20242D] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs font-medium text-[#F4F5F7] active:scale-[0.99] transition-all"
              >
                {googleLoading ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin text-[#E8A33D]" />
                    <span>Signing in with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
            <span className="text-xs font-mono text-[#6B7280]">or sign in with email</span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-mono font-medium text-[#9CA3AF] uppercase">
                Work Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={handleEmailChange}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  placeholder="operator@company.com"
                  className={`w-full h-[42px] pl-10 pr-4 bg-[#16191F] border rounded-lg text-sm text-[#F4F5F7] placeholder-[#6B7280] focus:outline-none transition-colors ${
                    fieldErrors.email
                      ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]'
                      : 'border-[rgba(255,255,255,0.08)] focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D]'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p id="email-error" role="alert" className="text-[11px] text-[#EF4444] font-medium mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="block text-xs font-mono font-medium text-[#9CA3AF] uppercase">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-[#E8A33D] hover:underline font-medium focus:outline-none focus:ring-1 focus:ring-[#E8A33D] rounded">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={handlePasswordChange}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  placeholder="••••••••••••"
                  className={`w-full h-[42px] pl-10 pr-10 bg-[#16191F] border rounded-lg text-sm text-[#F4F5F7] placeholder-[#6B7280] focus:outline-none transition-colors ${
                    fieldErrors.password
                      ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]'
                      : 'border-[rgba(255,255,255,0.08)] focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF] p-1 rounded focus:outline-none focus:ring-1 focus:ring-[#E8A33D]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" role="alert" className="text-[11px] text-[#EF4444] font-medium mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading || googleLoading}
              className="w-full h-[44px] flex items-center justify-center gap-2 bg-[#E8A33D] hover:bg-[#D9932E] active:scale-[0.99] text-[#14171C] font-semibold text-sm rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:ring-offset-2 focus:ring-offset-[#1B1E24]"
            >
              {loading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-mono font-medium">Authenticating...</span>
                </>
              ) : (
                <>
                  Sign In to MailPilot
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

export default LoginPage;
