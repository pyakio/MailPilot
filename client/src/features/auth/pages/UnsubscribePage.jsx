import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiMail, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import Button from '../../../shared/ui/Button';
import unsubscribeService from '../../../services/unsubscribeService';

export function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const statusParam = searchParams.get('status');
  const emailParam = searchParams.get('email') || '';

  const [loading, setLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [unsubscribed, setUnsubscribed] = useState(statusParam === 'success');
  const [error, setError] = useState(statusParam === 'error' ? 'Invalid or expired unsubscribe link.' : null);

  useEffect(() => {
    if (token && !statusParam) {
      // Verify token
      setLoading(true);
      unsubscribeService
        .verifyToken(token)
        .then((res) => {
          setContactInfo(res.data);
          if (res.data.subscribed === false) {
            setUnsubscribed(true);
          }
        })
        .catch((err) => {
          setError('Unable to verify unsubscribe link. It may have expired.');
        })
        .finally(() => setLoading(false));
    }
  }, [token, statusParam]);

  const handleConfirmUnsubscribe = async () => {
    if (!token) return;
    try {
      setLoading(true);
      await unsubscribeService.submitUnsubscribe(token);
      setUnsubscribed(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process unsubscribe request.');
    } finally {
      setLoading(false);
    }
  };

  const displayEmail = emailParam || contactInfo?.email || 'your email';

  return (
    <div className="min-h-screen bg-[#14171C] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1B1E24] border border-[rgba(255,255,255,0.08)] rounded-xl p-8 shadow-2xl text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#E8A33D]/10 border border-[#E8A33D]/20 text-[#E8A33D] mb-4">
          <FiMail className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-bold font-heading text-[#F4F5F7]">Email Subscription Preferences</h1>

        {unsubscribed ? (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-lg text-sm text-[#4ADE80] flex items-center gap-3 text-left">
              <FiCheckCircle className="w-5 h-5 shrink-0 text-[#22C55E]" />
              <span>
                <strong>{displayEmail}</strong> has been successfully unsubscribed from future broadcasts.
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">
              You will no longer receive marketing emails from this sender. Transactional account notices may still be delivered.
            </p>
          </div>
        ) : error ? (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-lg text-sm text-[#F87171] flex items-center gap-3 text-left">
              <FiAlertCircle className="w-5 h-5 shrink-0 text-[#EF4444]" />
              <span>{error}</span>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-5 text-left">
            <p className="text-sm text-[#9CA3AF]">
              Are you sure you want to unsubscribe <strong>{displayEmail}</strong> from all future updates and announcements?
            </p>

            <Button
              variant="primary"
              fullWidth
              loading={loading}
              onClick={handleConfirmUnsubscribe}
            >
              Confirm Unsubscribe
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UnsubscribePage;
