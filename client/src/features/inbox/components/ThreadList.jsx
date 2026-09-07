import React, { useState } from 'react';
import {
  FiSearch,
  FiStar,
  FiPaperclip,
  FiCheck,
  FiTrash2,
  FiMail,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiCheckSquare,
  FiSquare,
  FiSlash,
} from 'react-icons/fi';
import Loader from '../../../shared/ui/Loader';
import EmptyState from '../../../shared/ui/EmptyState';

export function ThreadList({
  threads = [],
  selectedThreadId,
  onSelectThread,
  loading = false,
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  activeFilter,
  onFilterChange,
  onToggleStar,
  onToggleRead,
  onTrashThread,
  pagination = {},
  onPageChange,
  onBatchAction,
}) {
  const [selectedIds, setSelectedIds] = useState([]);

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const isThisYear = date.getFullYear() === now.getFullYear();
    if (isThisYear) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    return date.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: '2-digit' });
  };

  const handleSelectAllToggle = () => {
    if (selectedIds.length === threads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(threads.map((t) => t.id));
    }
  };

  const handleToggleSelectThread = (threadId, e) => {
    e.stopPropagation();
    if (selectedIds.includes(threadId)) {
      setSelectedIds(selectedIds.filter((id) => id !== threadId));
    } else {
      setSelectedIds([...selectedIds, threadId]);
    }
  };

  const handleExecuteBatch = async (action) => {
    if (selectedIds.length === 0 || !onBatchAction) return;
    await onBatchAction(selectedIds, action);
    setSelectedIds([]);
  };

  return (
    <div className="w-[420px] shrink-0 border-r border-[var(--border)] flex flex-col h-full bg-[var(--background)] relative">
      {/* Search Header */}
      <div className="p-3 border-b border-[var(--border)] bg-[var(--surface-card)] space-y-2.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit(searchQuery);
          }}
          className="relative flex items-center"
        >
          <FiSearch className="absolute left-3 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search conversations, senders, content..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg pl-9 pr-8 py-1.5 text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#E8A33D] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onSearchSubmit('');
              }}
              className="absolute right-2.5 text-[var(--text-muted)] hover:text-[var(--text)] p-0.5"
            >
              <FiX className="w-3 h-3" />
            </button>
          )}
        </form>

        {/* Filter Pills & Pagination Info */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <div className="flex items-center gap-1">
            <button
              onClick={handleSelectAllToggle}
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              title={selectedIds.length === threads.length && threads.length > 0 ? 'Deselect All' : 'Select All'}
            >
              {selectedIds.length > 0 && selectedIds.length === threads.length ? (
                <FiCheckSquare className="w-3.5 h-3.5 text-[#E8A33D]" />
              ) : (
                <FiSquare className="w-3.5 h-3.5" />
              )}
            </button>

            {['ALL', 'UNREAD', 'STARRED', 'ATTACHMENTS'].map((tab) => (
              <button
                key={tab}
                onClick={() => onFilterChange(tab)}
                className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors ${
                  activeFilter === tab
                    ? 'bg-[var(--surface-secondary)] text-[#E8A33D] font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {tab === 'ATTACHMENTS' ? 'Files' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {pagination.total > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-mono">
              <span>
                {Math.min(pagination.total, (pagination.page - 1) * pagination.limit + 1)}-
                {Math.min(pagination.total, pagination.page * pagination.limit)} of {pagination.total}
              </span>
              <div className="flex items-center gap-0.5 ml-1">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-0.5 rounded hover:bg-[var(--surface-hover)] disabled:opacity-30"
                >
                  <FiChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-0.5 rounded hover:bg-[var(--surface-hover)] disabled:opacity-30"
                >
                  <FiChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Batch Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="p-2 px-3 bg-[#1B1E24] text-white border-b border-[var(--border)] flex items-center justify-between text-xs z-20 shadow-md">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#E8A33D] text-[#14171C] font-mono font-bold rounded text-[10px]">
              {selectedIds.length} selected
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleExecuteBatch('mark_read')}
              className="p-1 px-2 rounded hover:bg-white/10 text-xs flex items-center gap-1"
              title="Mark as Read"
            >
              <FiMail className="w-3.5 h-3.5" />
              <span>Read</span>
            </button>
            <button
              onClick={() => handleExecuteBatch('star')}
              className="p-1 px-2 rounded hover:bg-white/10 text-xs flex items-center gap-1"
              title="Star"
            >
              <FiStar className="w-3.5 h-3.5" />
              <span>Star</span>
            </button>
            <button
              onClick={() => handleExecuteBatch('trash')}
              className="p-1 px-2 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
              title="Move to Trash"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              <span>Trash</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-1 text-gray-400 hover:text-white ml-1"
              title="Clear Selection"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Threads Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader size="sm" message="Loading conversations..." />
          </div>
        ) : threads.length === 0 ? (
          <div className="py-20 px-4 text-center">
            <EmptyState
              title="No messages found"
              description="No conversations match your search or active filter."
            />
          </div>
        ) : (
          threads.map((thread) => {
            const isSelected = selectedThreadId === thread.id;
            const isChecked = selectedIds.includes(thread.id);
            const isUnread = thread.unreadCount > 0;

            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                className={`group relative p-3.5 cursor-pointer transition-all duration-100 select-none ${
                  isSelected
                    ? 'bg-[#E8A33D]/10 border-l-2 border-l-[#E8A33D]'
                    : isUnread
                    ? 'bg-[var(--surface-card)] hover:bg-[var(--surface-hover)]'
                    : 'bg-[var(--background)] hover:bg-[var(--surface-secondary)] opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Left: Checkbox & Star Button */}
                  <div className="flex flex-col items-center gap-1.5 pt-0.5">
                    <button
                      onClick={(e) => handleToggleSelectThread(thread.id, e)}
                      className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    >
                      {isChecked ? (
                        <FiCheckSquare className="w-3.5 h-3.5 text-[#E8A33D]" />
                      ) : (
                        <FiSquare className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(thread.id, !thread.isStarred);
                      }}
                      className="text-[var(--text-muted)] hover:text-[#E8A33D] transition-colors p-0.5"
                      title={thread.isStarred ? 'Unstar conversation' : 'Star conversation'}
                    >
                      <FiStar
                        className={`w-3.5 h-3.5 ${
                          thread.isStarred ? 'fill-[#E8A33D] text-[#E8A33D]' : 'opacity-40 group-hover:opacity-100'
                        }`}
                      />
                    </button>
                    {isUnread && (
                      <span
                        className="w-2 h-2 rounded-full bg-[#E8A33D] shadow-[0_0_6px_rgba(232,163,61,0.8)]"
                        title="Unread message"
                      />
                    )}
                  </div>

                  {/* Main: Subject, Snippet, Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`text-xs truncate ${
                            isUnread ? 'font-bold text-[var(--text)]' : 'font-medium text-[var(--text-secondary)]'
                          }`}
                        >
                          {thread.subject || '(No Subject)'}
                        </span>
                        {thread.messageCount > 1 && (
                          <span className="px-1.5 py-0.2 text-[9px] font-mono font-semibold bg-[var(--surface-secondary)] text-[var(--text-muted)] rounded-full shrink-0">
                            {thread.messageCount}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                        {formatRelativeTime(thread.lastMessageAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {thread.snippet || 'No preview available.'}
                    </p>

                    {/* Footer tags / attachment icon */}
                    <div className="flex items-center justify-between mt-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        {thread.hasAttachments && (
                          <span className="flex items-center text-[10px] text-[var(--text-muted)]" title="Contains attachments">
                            <FiPaperclip className="w-3 h-3" />
                          </span>
                        )}
                        {thread.aiSummary && (
                          <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-[#3E6B70]/20 text-[#3E6B70] dark:text-[#6ee7b7] rounded">
                            AI Summarized
                          </span>
                        )}
                      </div>

                      {/* Quick Hover Actions */}
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleRead(thread.id, !isUnread);
                          }}
                          className="p-1 rounded bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)] shadow-xs transition-colors"
                          title={isUnread ? 'Mark as read' : 'Mark as unread'}
                        >
                          <FiMail className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTrashThread(thread.id);
                          }}
                          className="p-1 rounded bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-red-500 border border-[var(--border)] shadow-xs transition-colors"
                          title="Move to trash"
                        >
                          <FiTrash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ThreadList;
