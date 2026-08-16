import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import Button from '../../../shared/ui/Button';
import Input from '../../../shared/ui/Input';
import authService from '../../../services/authService';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid or missing password reset token. Please request a new link.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#14171C] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1B1E24] border border-[rgba(255,255,255,0.08)] rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#E8A33D]/10 border border-[#E8A33D]/20 text-[#E8A33D] mb-3">
            <FiLock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-[#F4F5F7]">Set new password</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Choose a strong password containing at least 8 characters.
          </p>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-lg text-sm text-[#4ADE80] flex items-center gap-3 text-left">
              <FiCheckCircle className="w-5 h-5 shrink-0 text-[#22C55E]" />
              <span>Your password has been updated successfully! Redirecting you to sign in...</span>
            </div>
            <Link to="/login">
              <Button variant="primary" fullWidth>
                Sign In Now
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
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
