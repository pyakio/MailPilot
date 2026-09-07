import React, { useState, useEffect } from 'react';
import {
  FiStar,
  FiTrash2,
  FiMail,
  FiCornerUpLeft,
  FiPaperclip,
  FiChevronDown,
  FiChevronUp,
  FiZap,
  FiDownload,
  FiShare2,
  FiMaximize2,
  FiCheckCircle,
} from 'react-icons/fi';
import Avatar from '../../../shared/ui/Avatar';
import EmptyState from '../../../shared/ui/EmptyState';
import { inboxService } from '../../../services/inboxService';

export function ThreadView({
  thread,
  loading = false,
  onToggleStar,
  onToggleRead,
  onTrashThread,
  onOpenReply,
  onGenerateAiSummary,
  summarizing = false,
}) {
  const [expandedMessages, setExpandedMessages] = useState({});
  const [smartReplies, setSmartReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  // Fetch smart replies when thread changes
  useEffect(() => {
    let isMounted = true;
    if (thread?.id) {
      setLoadingReplies(true);
      inboxService
        .getSmartReplies(thread.id)
        .then((res) => {
          if (isMounted && Array.isArray(res?.replies)) {
            setSmartReplies(res.replies);
          }
        })
        .catch(() => {
          if (isMounted) setSmartReplies([]);
        })
        .finally(() => {
          if (isMounted) setLoadingReplies(false);
        });
    } else {
      setSmartReplies([]);
    }
    return () => {
      isMounted = false;
    };
  }, [thread?.id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-[var(--surface-card)]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#E8A33D] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-[var(--text-muted)]">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-[var(--surface-card)] p-8">
        <EmptyState
          title="No Conversation Selected"
          description="Choose a conversation from the list to view its message history, attachments, and AI summary."
        />
      </div>
    );
  }

  const messages = Array.isArray(thread.emails) ? thread.emails : [];

  const toggleMessageExpand = (msgId) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === undefined ? false : !prev[msgId],
    }));
  };

  const isExpanded = (msgId, index) => {
    if (expandedMessages[msgId] !== undefined) {
      return expandedMessages[msgId];
    }
    // Latest message is expanded by default, or if there's only 1 message
    return index === messages.length - 1;
  };

  const formatDateFull = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const sentimentStyles = {
    POSITIVE: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    URGENT: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
    NEUTRAL: 'bg-[var(--surface-secondary)] text-[var(--text-muted)] border-[var(--border)]',
    NEGATIVE: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-[var(--surface-card)]">
      {/* Top Thread Header Toolbar */}
      <div className="p-4 border-b border-[var(--border)] flex items-start justify-between gap-4 bg-[var(--surface-card)] shrink-0">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-bold text-[var(--text)] tracking-tight truncate font-heading">
              {thread.subject || '(No Subject)'}
            </h1>
            {Array.isArray(thread.labels) &&
              thread.labels
                .filter((l) => !['UNREAD', 'STARRED'].includes(l))
                .map((lbl) => (
                  <span
                    key={lbl}
                    className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[var(--surface-secondary)] text-[var(--text-muted)] rounded shrink-0"
                  >
                    {lbl}
                  </span>
                ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-mono">
            <span>{messages.length} message{messages.length === 1 ? '' : 's'}</span>
            <span>•</span>
            <span>Last active {formatDateFull(thread.lastMessageAt)}</span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onToggleStar(thread.id, !thread.isStarred)}
            className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[#E8A33D] transition-colors"
            title={thread.isStarred ? 'Unstar conversation' : 'Star conversation'}
          >
            <FiStar
              className={`w-4 h-4 ${thread.isStarred ? 'fill-[#E8A33D] text-[#E8A33D]' : ''}`}
            />
          </button>

          <button
            onClick={() => onToggleRead(thread.id, thread.unreadCount === 0)}
            className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            title={thread.unreadCount > 0 ? 'Mark as read' : 'Mark as unread'}
          >
            <FiMail className="w-4 h-4" />
          </button>

          <button
            onClick={() => onTrashThread(thread.id)}
            className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-red-500 transition-colors"
            title="Move to trash"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenReply(thread)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E8A33D] text-[#14171C] hover:bg-[#d9952f] transition-all shadow-xs"
          >
            <FiCornerUpLeft className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>
        </div>
      </div>

      {/* Scrollable Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* AI Summary Banner Card */}
        {thread.aiSummary ? (
          <div className="p-4 rounded-xl bg-linear-to-r from-[#3E6B70]/10 via-[#E8A33D]/10 to-transparent border border-[#3E6B70]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-[#3E6B70]/20 text-[#3E6B70] dark:text-[#6ee7b7]">
                  <FiZap className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold font-heading text-[var(--text)]">
                  AI Conversation Digest
                </span>
                {thread.aiSummary.sentiment && (
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded border ${
                      sentimentStyles[thread.aiSummary.sentiment] || sentimentStyles.NEUTRAL
                    }`}
                  >
                    {thread.aiSummary.sentiment}
                  </span>
                )}
              </div>
              <button
                onClick={() => onGenerateAiSummary(thread.id)}
                disabled={summarizing}
                className="text-[10px] font-mono text-[var(--text-muted)] hover:text-[#E8A33D] uppercase hover:underline"
              >
                {summarizing ? 'Refreshing...' : 'Regenerate'}
              </button>
            </div>

            <p className="text-xs text-[var(--text)] leading-relaxed">
              {thread.aiSummary.summary}
            </p>

            {Array.isArray(thread.aiSummary.keyPoints) && thread.aiSummary.keyPoints.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Key Takeaways:</span>
                <ul className="text-xs text-[var(--text-secondary)] space-y-1 pl-4 list-disc">
                  {thread.aiSummary.keyPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(thread.aiSummary.actionItems) && thread.aiSummary.actionItems.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Action Items:</span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {thread.aiSummary.actionItems.map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text)]"
                    >
                      <FiCheckCircle className="w-3 h-3 text-emerald-500" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <FiZap className="w-4 h-4 text-[#E8A33D]" />
              <span>Catch up fast on this thread with one-click AI summarization.</span>
            </div>
            <button
              onClick={() => onGenerateAiSummary(thread.id)}
              disabled={summarizing}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[#E8A33D] border border-[#E8A33D]/30 transition-all flex items-center gap-1 shrink-0"
            >
              {summarizing ? (
                <>
                  <div className="w-3 h-3 border-2 border-[#E8A33D] border-t-transparent rounded-full animate-spin" />
                  <span>Summarizing...</span>
                </>
              ) : (
                <>
                  <FiZap className="w-3 h-3" />
                  <span>Summarize Thread</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Message Cards Stack */}
        <div className="space-y-3">
          {messages.map((email, idx) => {
            const open = isExpanded(email.id, idx);
            const attachments = Array.isArray(email.attachments) ? email.attachments : [];

            return (
              <div
                key={email.id}
                className={`rounded-xl border transition-all ${
                  open
                    ? 'border-[var(--border)] bg-[var(--surface-card)] shadow-xs'
                    : 'border-[var(--border)]/60 bg-[var(--surface-secondary)] opacity-90'
                }`}
              >
                {/* Message Header */}
                <div
                  onClick={() => toggleMessageExpand(email.id)}
                  className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={email.fromName || email.from} size="sm" />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--text)] truncate">
                          {email.fromName || email.from}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)] font-mono truncate">
                          &lt;{email.from}&gt;
                        </span>
                      </div>
                      {!open && (
                        <p className="text-xs text-[var(--text-secondary)] truncate">
                          {email.snippet || 'No preview available'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {attachments.length > 0 && !open && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-[var(--text-muted)]">
                        <FiPaperclip className="w-3 h-3" />
                        {attachments.length}
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">
                      {formatDateFull(email.date)}
                    </span>
                    {open ? (
                      <FiChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                    ) : (
                      <FiChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                    )}
                  </div>
                </div>

                {/* Expanded Message Body */}
                {open && (
                  <div className="px-4 pb-4 pt-1 space-y-4 border-t border-[var(--border)]/40">
                    {/* Recipient breakdown */}
                    <div className="text-[11px] font-mono text-[var(--text-muted)] space-y-0.5 pt-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-[var(--text-secondary)]">To:</span>
                        <span>{Array.isArray(email.to) ? email.to.join(', ') : email.to}</span>
                      </div>
                      {Array.isArray(email.cc) && email.cc.length > 0 && (
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-[var(--text-secondary)]">Cc:</span>
                          <span>{email.cc.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Email HTML / Plaintext Body */}
                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed text-[var(--text)] pt-2 overflow-x-auto">
                      {email.bodyHtml ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
                          className="email-rendered-body"
                        />
                      ) : (
                        <pre className="whitespace-pre-wrap font-sans text-xs text-[var(--text)]">
                          {email.bodyText}
                        </pre>
                      )}
                    </div>

                    {/* Attachments Section */}
                    {attachments.length > 0 && (
                      <div className="pt-3 border-t border-[var(--border)] space-y-2">
                        <span className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                          <FiPaperclip className="w-3.5 h-3.5" />
                          Attachments ({attachments.length})
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {attachments.map((att, attIdx) => (
                            <div
                              key={attIdx}
                              className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="p-1.5 rounded bg-[var(--surface-card)] text-[#E8A33D]">
                                  <FiPaperclip className="w-3.5 h-3.5" />
                                </span>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-medium text-[var(--text)] truncate">
                                    {att.filename}
                                  </span>
                                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                                    {formatFileSize(att.size)}
                                  </span>
                                </div>
                              </div>
                              <button
                                className="p-1.5 text-[var(--text-muted)] hover:text-[#E8A33D] rounded hover:bg-[var(--surface-hover)] transition-colors"
                                title="Download attachment"
                              >
                                <FiDownload className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Reply Suggestions Bar */}
      {smartReplies.length > 0 && (
        <div className="px-4 py-2.5 border-t border-[var(--border)] bg-[var(--surface-card)] space-y-1.5 shrink-0">
          <div className="flex items-center gap-1 text-[10px] font-mono font-semibold uppercase text-[var(--text-muted)]">
            <FiZap className="w-3 h-3 text-[#E8A33D]" />
            <span>AI Smart Replies</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {smartReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => onOpenReply(thread, reply)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--surface-secondary)] hover:bg-[#E8A33D]/15 text-[var(--text)] hover:text-[#E8A33D] border border-[var(--border)] hover:border-[#E8A33D]/40 transition-all shrink-0 select-none text-left"
              >
                <span className="text-[#E8A33D] font-bold">⚡</span>
                <span className="truncate max-w-[280px]">{reply}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Reply Bar */}
      <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenReply(thread)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#E8A33D] text-[#14171C] hover:bg-[#d9952f] transition-all shadow-xs"
          >
            <FiCornerUpLeft className="w-3.5 h-3.5" />
            <span>Reply to Thread</span>
          </button>
        </div>
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--border)] text-[10px]">R</kbd> to reply
        </span>
      </div>
    </div>
  );
}

export default ThreadView;
