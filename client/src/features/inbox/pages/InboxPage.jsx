import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InboxSidebar } from '../components/InboxSidebar';
import { ThreadList } from '../components/ThreadList';
import { ThreadView } from '../components/ThreadView';
import { EmailComposerModal } from '../components/EmailComposerModal';
import { inboxService } from '../../../services/inboxService';
import { useToast } from '../../../hooks/useToast';

export default function InboxPage() {
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeLabel, setActiveLabel] = useState('INBOX');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [activeThreadDetail, setActiveThreadDetail] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [stats, setStats] = useState({ inboxUnread: 0, starred: 0, sent: 0, trash: 0 });
  const [gmailStatus, setGmailStatus] = useState({ connected: false });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Composer State
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerConfig, setComposerConfig] = useState({
    recipient: '',
    subject: '',
    body: '',
    threadId: null,
    inReplyTo: null,
  });

  // 1. Fetch thread collection
  const fetchThreads = useCallback(
    async (label = activeLabel, filter = activeFilter, query = searchQuery, page = 1) => {
      setLoadingList(true);
      try {
        const params = {
          label,
          page,
          limit: 20,
        };

        if (filter === 'UNREAD') params.isRead = false;
        if (filter === 'STARRED') params.isStarred = true;
        if (filter === 'ATTACHMENTS') params.hasAttachment = true;
        if (query && query.trim()) params.q = query.trim();

        const data = await inboxService.getThreads(params);
        const list = data.threads || [];
        setThreads(list);
        setPagination(data.pagination || { page: 1, limit: 20, total: list.length, totalPages: 1 });

        // Auto-select first thread if nothing is selected or if previous selection is not in list
        if (list.length > 0) {
          const currentInList = list.find((t) => t.id === selectedThreadId);
          if (!currentInList) {
            setSelectedThreadId(list[0].id);
          }
        } else {
          setSelectedThreadId(null);
          setActiveThreadDetail(null);
        }
      } catch (err) {
        console.error('Failed to fetch threads:', err);
      } finally {
        setLoadingList(false);
      }
    },
    [activeLabel, activeFilter, searchQuery, selectedThreadId]
  );

  // 2. Fetch full detail for selected thread
  const fetchThreadDetail = useCallback(async (threadId) => {
    if (!threadId) {
      setActiveThreadDetail(null);
      return;
    }
    setLoadingDetail(true);
    try {
      const data = await inboxService.getThread(threadId);
      setActiveThreadDetail(data.thread || null);
    } catch (err) {
      console.error('Failed to fetch thread detail:', err);
      setActiveThreadDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // 3. Fetch stats and Gmail status
  const fetchStatsAndStatus = async () => {
    try {
      const [statsRes, statusRes] = await Promise.allSettled([
        inboxService.getInboxStats(),
        inboxService.getGmailStatus(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.stats) {
        setStats(statsRes.value.stats);
      }
      if (statusRes.status === 'fulfilled') {
        setGmailStatus(statusRes.value);
      }
    } catch (err) {
      // ignore
    }
  };

  // Initial load and URL param checks
  useEffect(() => {
    fetchThreads(activeLabel, activeFilter, searchQuery, 1);
    fetchStatsAndStatus();

    // Check if redirected with ?connected=gmail
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('connected') === 'gmail') {
      addToast({
        type: 'success',
        title: 'Gmail Connected',
        message: 'Your Gmail account has been successfully connected and synchronized.',
      });
      navigate('/inbox', { replace: true });
    }
  }, [activeLabel, activeFilter]);

  // Load detail when selectedThreadId changes
  useEffect(() => {
    if (selectedThreadId) {
      fetchThreadDetail(selectedThreadId);
    }
  }, [selectedThreadId, fetchThreadDetail]);

  // Actions
  const handleSelectThread = (thread) => {
    setSelectedThreadId(thread.id);
  };

  const handleToggleStar = async (threadId, isStarred) => {
    try {
      await inboxService.markThreadStarred(threadId, isStarred);
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, isStarred } : t))
      );
      if (activeThreadDetail?.id === threadId) {
        setActiveThreadDetail((prev) => ({ ...prev, isStarred }));
      }
      fetchStatsAndStatus();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update star state.' });
    }
  };

  const handleToggleRead = async (threadId, isRead) => {
    try {
      await inboxService.markThreadRead(threadId, isRead);
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, unreadCount: isRead ? 0 : 1 } : t
        )
      );
      if (activeThreadDetail?.id === threadId) {
        setActiveThreadDetail((prev) => ({
          ...prev,
          unreadCount: isRead ? 0 : 1,
        }));
      }
      fetchStatsAndStatus();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update read state.' });
    }
  };

  const handleTrashThread = async (threadId) => {
    try {
      await inboxService.trashThread(threadId);
      addToast({ type: 'success', title: 'Moved to Trash', message: 'Conversation moved to trash.' });
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      if (selectedThreadId === threadId) {
        setSelectedThreadId(null);
        setActiveThreadDetail(null);
      }
      fetchStatsAndStatus();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to trash conversation.' });
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await inboxService.syncInbox();
      addToast({
        type: 'success',
        title: 'Mailbox Synchronized',
        message: `Synced ${res.syncedThreads || 0} threads and ${res.syncedEmails || 0} messages.`,
      });
      await fetchThreads(activeLabel, activeFilter, searchQuery, pagination.page);
      await fetchStatsAndStatus();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Sync Failed',
        message: err.response?.data?.error || 'Unable to sync mailbox.',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleBatchAction = async (threadIds, action) => {
    try {
      const res = await inboxService.batchAction({ threadIds, action });
      addToast({
        type: 'success',
        title: 'Batch Action Complete',
        message: `Updated ${res.count || threadIds.length} conversation(s).`,
      });
      await fetchThreads(activeLabel, activeFilter, searchQuery, pagination.page);
      await fetchStatsAndStatus();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Batch Action Failed',
        message: err.response?.data?.error || 'Unable to complete batch action.',
      });
    }
  };

  const handleConnectGmail = async () => {
    try {
      const res = await inboxService.getGoogleAuthUrl();
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Could not generate Google authorization link.',
      });
    }
  };

  const handleOpenCompose = () => {
    setComposerConfig({
      recipient: '',
      subject: '',
      body: '',
      threadId: null,
      inReplyTo: null,
    });
    setComposerOpen(true);
  };

  const handleOpenReply = (thread, initialBodyText = '') => {
    if (!thread) return;
    const emails = Array.isArray(thread.emails) ? thread.emails : [];
    const latestEmail = emails.length > 0 ? emails[emails.length - 1] : null;

    const recipient = latestEmail?.from || '';
    const subjectPrefix = thread.subject?.startsWith('Re:') ? thread.subject : `Re: ${thread.subject || ''}`;

    setComposerConfig({
      recipient,
      subject: subjectPrefix,
      body: initialBodyText || '',
      threadId: thread.id,
      inReplyTo: latestEmail?.gmailId || null,
    });
    setComposerOpen(true);
  };

  const handleEmailSent = async (res) => {
    await fetchThreads(activeLabel, activeFilter, searchQuery, 1);
    if (res?.threadId) {
      setSelectedThreadId(res.threadId);
      await fetchThreadDetail(res.threadId);
    }
    await fetchStatsAndStatus();
  };

  const handleGenerateAiSummary = async (threadId) => {
    if (!threadId) return;
    setSummarizing(true);
    try {
      const res = await inboxService.summarizeThread(threadId);
      if (res?.aiSummary) {
        setActiveThreadDetail((prev) => (prev ? { ...prev, aiSummary: res.aiSummary } : prev));
        setThreads((prev) =>
          prev.map((t) => (t.id === threadId ? { ...t, aiSummary: res.aiSummary } : t))
        );
        addToast({
          type: 'success',
          title: '✨ AI Summary Generated',
          message: 'Key takeaways and action items updated.',
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Summary Failed',
        message: err.response?.data?.error || 'Unable to generate AI summary.',
      });
    } finally {
      setSummarizing(false);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is in an input field or composer is open
      if (composerOpen || ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'r' || e.key === 'R') {
        if (activeThreadDetail) {
          e.preventDefault();
          handleOpenReply(activeThreadDetail);
        }
      } else if (e.key === 's' || e.key === 'S') {
        if (activeThreadDetail) {
          e.preventDefault();
          handleToggleStar(activeThreadDetail.id, !activeThreadDetail.isStarred);
        }
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleOpenCompose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeThreadDetail, composerOpen]);

  return (
    <div className="flex h-full w-full min-h-[calc(100vh-3.5rem)] overflow-hidden bg-[var(--background)] relative">
      {/* Pane 1: Sub-navigation Sidebar */}
      <InboxSidebar
        activeLabel={activeLabel}
        onSelectLabel={(label) => {
          setActiveLabel(label);
          setSelectedThreadId(null);
        }}
        stats={stats}
        onSync={handleSync}
        syncing={syncing}
        gmailStatus={gmailStatus}
        onOpenCompose={handleOpenCompose}
        onConnectGmail={handleConnectGmail}
      />

      {/* Pane 2: Thread List */}
      <ThreadList
        threads={threads}
        selectedThreadId={selectedThreadId}
        onSelectThread={handleSelectThread}
        loading={loadingList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={(q) => fetchThreads(activeLabel, activeFilter, q, 1)}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onToggleStar={handleToggleStar}
        onToggleRead={handleToggleRead}
        onTrashThread={handleTrashThread}
        pagination={pagination}
        onPageChange={(p) => fetchThreads(activeLabel, activeFilter, searchQuery, p)}
        onBatchAction={handleBatchAction}
      />

      {/* Pane 3: Thread Reading View */}
      <ThreadView
        thread={activeThreadDetail}
        loading={loadingDetail}
        onToggleStar={handleToggleStar}
        onToggleRead={handleToggleRead}
        onTrashThread={handleTrashThread}
        onOpenReply={handleOpenReply}
        onGenerateAiSummary={handleGenerateAiSummary}
        summarizing={summarizing}
      />

      {/* Floating Email Composer Modal */}
      <EmailComposerModal
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        initialRecipient={composerConfig.recipient}
        initialSubject={composerConfig.subject}
        initialBody={composerConfig.body}
        threadId={composerConfig.threadId}
        inReplyTo={composerConfig.inReplyTo}
        onEmailSent={handleEmailSent}
      />
    </div>
  );
}
