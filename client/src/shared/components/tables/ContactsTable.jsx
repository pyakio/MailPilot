import React from 'react';
import Table from '../../ui/Table';
import Badge from '../../ui/Badge';
import Avatar from '../../ui/Avatar';
import Dropdown from '../../ui/Dropdown';
import { formatDate } from '../../../utils/formatters';
import { FiMoreHorizontal, FiTrash2 } from 'react-icons/fi';

export const ContactsTable = React.memo(function ContactsTable({
  contacts,
  onDelete,
  deletingId,
}) {
  const headers = ['Subscriber', 'Status', 'Tags', 'Subscribed Date', 'Actions'];

  return (
    <Table headers={headers}>
      {contacts.map((contact) => {
        const actionItems = [
          {
            label: deletingId === contact.id ? 'Deleting...' : 'Delete Contact',
            icon: FiTrash2,
            danger: true,
            onClick: () => onDelete(contact.id),
          },
        ];

        return (
          <tr key={contact.id} className="hover:bg-[#161C2E]/60 transition-colors">
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Avatar name={contact.name || contact.email} size="sm" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#F8FAFC]">
                    {contact.name || 'Unnamed Subscriber'}
                  </span>
                  <span className="text-[11px] text-[#475569]">{contact.email}</span>
                </div>
              </div>
            </td>

            <td className="px-5 py-3.5">
              <Badge variant={contact.status === 'subscribed' ? 'success' : 'default'}>
                {contact.status || 'Subscribed'}
              </Badge>
            </td>

            <td className="px-5 py-3.5">
              <div className="flex flex-wrap gap-1">
                {Array.isArray(contact.tags) && contact.tags.length > 0 ? (
                  contact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 text-[10px] bg-[#161C2E] text-[#94A3B8] rounded-mp-sm border border-[rgba(255,255,255,0.05)]"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-[#475569]">No tags</span>
                )}
              </div>
            </td>

            <td className="px-5 py-3.5 text-xs text-[#94A3B8]">
              {formatDate(contact.subscribedAt || contact.createdAt)}
            </td>

            <td className="px-5 py-3.5 text-right">
              <Dropdown
                trigger={
                  <button className="p-1.5 rounded-mp-sm text-[#475569] hover:text-[#F8FAFC] hover:bg-[#161C2E] transition-colors">
                    <FiMoreHorizontal className="w-4 h-4" />
                  </button>
                }
                items={actionItems}
              />
            </td>
          </tr>
        );
      })}
    </Table>
  );
});

export default ContactsTable;
