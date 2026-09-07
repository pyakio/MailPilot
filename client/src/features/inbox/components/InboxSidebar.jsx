import React from 'react';
import {
  FiInbox,
  FiStar,
  FiSend,
  FiTrash2,
  FiRefreshCw,
  FiEdit3,
  FiCheckCircle,
  FiAlertCircle,
  FiMail,
} from 'react-icons/fi';

export function InboxSidebar({
  activeLabel,
  onSelectLabel,
  stats = {},
  onSync,
  syncing = false,
  gmailStatus = {},
  onOpenCompose,
  onConnectGmail,
}) {
  const folders = [
    { key: 'INBOX', label: 'Inbox', icon: FiInbox, badge: stats.inboxUnread },
    { key: 'UNREAD', label: 'Unread', icon: FiMail, badge: stats.inboxUnread },
    { key: 'STARRED', label: 'Starred', icon: FiStar, badge: stats.starred },
    { key: 'SENT', label: 'Sent', icon: FiSend, badge: stats.sent },
    { key: 'TRASH', label: 'Trash', icon: FiTrash2, badge: stats.trash },
  ];

  return (
    <aside className="w-60 shrink-0 border-r border-[var(--border)] p-3 flex flex-col justify-between h-full bg-[var(--surface-card)] select-none">
      <div className="space-y-4">
        {/* Compose CTA */}
        <button
          onClick={onOpenCompose}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold bg-[#E8A33D] text-[#14171C] hover:bg-[#d9952f] active:scale-[0.98] shadow-sm hover:shadow transition-all duration-150"
        >
          <FiEdit3 className="w-4 h-4" />
          <span>Compose Email</span>
        </button>

        {/* Section Header & Sync */}
        <div className="flex items-center justify-between px-2 pt-2">
          <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[var(--text-muted)]">
            Mailbox Folders
          </span>
          <button
            onClick={onSync}
            disabled={syncing}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[#E8A33D] hover:bg-[var(--surface-hover)] transition-colors"
            title="Synchronize Mailbox with Gmail"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-[#E8A33D]' : ''}`} />
          </button>
        </div>

        {/* Folder List */}
        <nav className="space-y-1">
          {folders.map((folder) => {
            const Icon = folder.icon;
            const isActive = activeLabel === folder.key;
            return (
              <button
                key={folder.key}
                onClick={() => onSelectLabel(folder.key)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#E8A33D]/15 text-[#E8A33D] font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#E8A33D]' : 'opacity-70'
                    }`}
                  />
                  <span className="truncate">{folder.label}</span>
                </div>
                {folder.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full leading-none ${
                      isActive
                        ? 'bg-[#E8A33D] text-[#14171C]'
                        : 'bg-[var(--surface-secondary)] text-[var(--text-muted)]'
                    }`}
                  >
                    {folder.badge > 99 ? '99+' : folder.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Gmail Account Status Box */}
      <div className="pt-3 border-t border-[var(--border)] space-y-2">
        <div className="p-2.5 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[10px] uppercase font-semibold text-[var(--text-muted)]">
              Gmail Sync
            </span>
            <div className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  gmailStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-[10px] font-medium text-[var(--text-secondary)]">
                {gmailStatus?.connected ? 'Live' : 'Mock/Dev'}
              </span>
            </div>
          </div>

          {gmailStatus?.connected ? (
            <div className="text-[11px] text-[var(--text-secondary)] truncate">
              {gmailStatus.account?.email || 'Connected Account'}
            </div>
          ) : (
            <button
              onClick={onConnectGmail}
              className="w-full mt-1 py-1 px-2 text-[11px] font-medium rounded bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[#E8A33D] border border-[#E8A33D]/30 transition-colors text-center block"
            >
              Connect Gmail Account
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export default InboxSidebar;
