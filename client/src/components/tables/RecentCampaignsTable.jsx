import { Badge } from '../ui/Badge';
import { SecondaryButton } from '../ui/SecondaryButton';
import { formatDate } from '../../utils/formatters';
import { FiSend, FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';

export function RecentCampaignsTable({
  campaigns = [],
  onEdit,
  onSendNow,
  onDelete,
  sendingId,
}) {
  if (campaigns.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
        No campaigns found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
            <th className="py-3.5 px-4 rounded-tl-xl">Campaign Name</th>
            <th className="py-3.5 px-4">Subject</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Schedule / Date</th>
            <th className="py-3.5 px-4 text-right rounded-tr-xl">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
          {campaigns.map((c) => (
            <tr
              key={c.id}
              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
            >
              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <span className="truncate">{c.name}</span>
                </div>
              </td>
              <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                {c.subject}
              </td>
              <td className="py-3.5 px-4">
                <Badge variant={c.status}>{c.status}</Badge>
              </td>
              <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                {c.scheduledAt ? (
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3.5 h-3.5 text-amber-500" />
                    {formatDate(c.scheduledAt)}
                  </span>
                ) : (
                  'Instant / Manual'
                )}
              </td>
              <td className="py-3.5 px-4 text-right">
                <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                  <SecondaryButton
                    size="sm"
                    variant="ghost"
                    icon={FiSend}
                    onClick={() => onSendNow(c.id)}
                    loading={sendingId === c.id}
                    title="Send Campaign Now"
                  >
                    Send
                  </SecondaryButton>
                  <SecondaryButton
                    size="sm"
                    variant="ghost"
                    icon={FiEdit2}
                    onClick={() => onEdit(c)}
                    title="Edit Campaign"
                  />
                  <SecondaryButton
                    size="sm"
                    variant="ghost"
                    icon={FiTrash2}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    onClick={() => onDelete(c.id)}
                    title="Delete Campaign"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentCampaignsTable;
