import { Badge } from '../ui/Badge';
import { SecondaryButton } from '../ui/SecondaryButton';
import { FiTrash2, FiMail, FiUser } from 'react-icons/fi';

export function ContactsTable({ contacts = [], onDelete, deletingId }) {
  if (contacts.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
        No contacts found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
            <th className="py-3.5 px-4 rounded-tl-xl">Contact Name</th>
            <th className="py-3.5 px-4">Email Address</th>
            <th className="py-3.5 px-4">Tags</th>
            <th className="py-3.5 px-4 text-right rounded-tr-xl">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
          {contacts.map((c) => (
            <tr
              key={c.id}
              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
            >
              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
                    {c.name ? c.name.charAt(0).toUpperCase() : <FiUser className="w-4 h-4" />}
                  </div>
                  <span>{c.name || 'Unnamed Contact'}</span>
                </div>
              </td>
              <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <FiMail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{c.email}</span>
                </div>
              </td>
              <td className="py-3.5 px-4">
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(c.tags) && c.tags.length > 0 ? (
                    c.tags.map((tag, idx) => (
                      <Badge key={idx} variant="purple" size="sm">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </div>
              </td>
              <td className="py-3.5 px-4 text-right">
                <SecondaryButton
                  size="sm"
                  variant="ghost"
                  icon={FiTrash2}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  onClick={() => onDelete(c.id)}
                  loading={deletingId === c.id}
                  title="Delete Contact"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ContactsTable;
