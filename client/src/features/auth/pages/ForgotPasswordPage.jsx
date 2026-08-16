import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import Button from '../../../shared/ui/Button';
import Input from '../../../shared/ui/Input';
import authService from '../../../services/authService';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to process reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#14171C] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1B1E24] border border-[rgba(255,255,255,0.08)] rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#E8A33D]/10 border border-[#E8A33D]/20 text-[#E8A33D] mb-3">
            <FiMail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-[#F4F5F7]">Reset your password</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Enter your account email and we will dispatch a secure recovery link.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-lg text-sm text-[#4ADE80] flex items-center gap-3 text-left">
              <FiCheckCircle className="w-5 h-5 shrink-0 text-[#22C55E]" />
              <span>
                If an account exists for <strong>{email}</strong>, a password reset link has been dispatched to your inbox.
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">
              The link is valid for 60 minutes. Check your spam folder if you do not see it within 2 minutes.
            </p>
            <Link to="/login">
              <Button variant="outline" fullWidth>
                Return to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-lg text-xs text-[#F87171]">
                {error}
              </div>
            )}

            <Input
              label="Work Email Address"
              type="email"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Send Reset Link
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#F4F5F7] transition-colors"
              >
                <FiArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
