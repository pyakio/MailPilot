import React from 'react';
import Table from '../../ui/Table';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import Dropdown from '../../ui/Dropdown';
import { formatDate } from '../../../utils/formatters';
import {
  FiMoreHorizontal,
  FiSend,
  FiEdit2,
  FiTrash2,
  FiArrowRight,
  FiPlus,
  FiMail,
} from 'react-icons/fi';

export const RecentCampaignsTable = React.memo(function RecentCampaignsTable({
  campaigns,
  onEdit,
  onSendNow,
  onDelete,
  sendingId,
}) {
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="py-12 px-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#E8A33D]/10 border border-[#E8A33D]/20 flex items-center justify-center text-[#E8A33D] mx-auto mb-3 shadow-xs">
          <FiMail className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold font-heading text-[var(--text)]">No broadcasts created yet</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
          Start your first email marketing broadcast to view delivery performance, open rates, and real-time telemetry here.
        </p>
        <div className="mt-4">
          <Button
            size="sm"
            variant="primary"
            icon={FiPlus}
            onClick={() => onEdit(null)}
          >
            Create First Broadcast
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'SENT':
        return <Badge variant="success">Sent</Badge>;
      case 'SCHEDULED':
        return <Badge variant="warning">Scheduled</Badge>;
      case 'DRAFT':
      default:
        return <Badge variant="default">Draft</Badge>;
    }
  };

  const getStatusIndicatorColor = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'SENT':
        return '#22C55E';
      case 'SCHEDULED':
        return '#F59E0B';
      case 'DRAFT':
      default:
        return '#3E6B70';
    }
  };

  const calculateOpenRate = (c) => {
    if (c.openRate !== undefined && c.openRate !== null) {
      return `${c.openRate}%`;
    }
    const sent = c.sentCount || c.stats?.sent || 0;
    const opened = c.openCount || c.stats?.opened || 0;
    if (sent > 0) {
      return `${Math.round((opened / sent) * 100)}%`;
    }
    return '0%';
  };

  const headers = ['Campaign', 'Status', 'Open Rate', 'Date', 'Actions'];

  return (
    <Table headers={headers}>
      {campaigns.map((c) => {
        const isSent = (c.status || '').toUpperCase() === 'SENT';
        const isSending = sendingId === c.id;

        const actionItems = [
          { label: 'Edit broadcast', icon: FiEdit2, onClick: () => onEdit(c) },
          ...(!isSent
            ? [
                {
                  label: isSending ? 'Sending batch...' : 'Send now',
                  icon: FiSend,
                  onClick: () => onSendNow(c.id),
                },
              ]
            : []),
          { label: 'Delete broadcast', icon: FiTrash2, danger: true, onClick: () => onDelete(c.id) },
        ];

        const indicatorColor = getStatusIndicatorColor(c.status);

        return (
          <tr
            key={c.id}
            className="h-[56px] hover:bg-[var(--surface-hover)] transition-colors relative group border-l-3"
            style={{ borderLeftColor: indicatorColor }}
          >
            {/* Campaign Name & Subject */}
            <td className="px-6 py-3.5">
              <div
                onClick={() => onEdit(c)}
                className="flex items-center gap-2 cursor-pointer group/title min-w-0"
              >
                <span className="text-sm font-semibold text-[var(--text)] group-hover/title:text-[#E8A33D] transition-colors truncate max-w-[200px] sm:max-w-xs">
                  {c.name}
                </span>
                <FiArrowRight className="w-3.5 h-3.5 text-[#E8A33D] opacity-0 group-hover/title:opacity-100 group-hover/title:translate-x-0.5 transition-all duration-150 shrink-0" />
                {c.subject && (
                  <span className="text-xs text-[var(--text-secondary)] truncate hidden md:inline max-w-[220px]">
                    • {c.subject}
                  </span>
                )}
              </div>
            </td>

            {/* Status Badge */}
            <td className="px-6 py-3.5 whitespace-nowrap">
              {getStatusBadge(c.status)}
            </td>

            {/* Open Rate */}
            <td className="px-6 py-3.5 whitespace-nowrap text-sm font-mono">
              {isSent ? (
                <span className="text-[#22C55E] font-bold bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
                  {calculateOpenRate(c)}
                </span>
              ) : (
                <span className="text-[var(--text-muted)]">—</span>
              )}
            </td>

            {/* Sent / Scheduled / Updated Date */}
            <td className="px-6 py-3.5 whitespace-nowrap text-xs text-[var(--text-secondary)] font-mono">
              {c.sentAt
                ? formatDate(c.sentAt)
                : c.scheduledAt
                ? `Due: ${formatDate(c.scheduledAt)}`
                : c.updatedAt
                ? formatDate(c.updatedAt)
                : formatDate(c.createdAt)}
            </td>

            {/* Actions Menu */}
            <td className="px-6 py-3.5 text-right whitespace-nowrap">
              <div className="flex justify-end">
                <Dropdown
                  trigger={
                    <button
                      className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-secondary)] border border-transparent hover:border-[var(--border)] transition-colors"
                      title="Broadcast Actions"
                    >
                      <FiMoreHorizontal className="w-4 h-4" />
                    </button>
                  }
                  items={actionItems}
                />
              </div>
            </td>
          </tr>
        );
      })}
    </Table>
  );
});

export default RecentCampaignsTable;
