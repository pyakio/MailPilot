import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiSend,
  FiUsers,
  FiFileText,
  FiCpu,
  FiBarChart2,
  FiPlus,
  FiCornerDownLeft,
  FiX,
  FiZap,
  FiUploadCloud,
  FiSettings,
} from 'react-icons/fi';
import { useToast } from '../../hooks/useToast';

export function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const commandGroups = [
    {
      category: 'AI Commands',
      items: [
        {
          id: 'ai-subj',
          label: 'Generate Subject Line',
          icon: FiCpu,
          action: () => {
            addToast({ title: 'AI Copilot', message: 'Generating subject line variations...', type: 'info' });
            navigate('/templates');
          },
        },
        {
          id: 'ai-[#3B82F6]',
          label: 'Generate Full Email',
          icon: FiZap,
          action: () => {
            addToast({ title: 'AI Copilot', message: 'Opening AI Email Builder...', type: 'info' });
            navigate('/templates');
          },
        },
        {
          id: 'ai-opt',
          label: 'Optimize Deliverability',
          icon: FiCpu,
          action: () => {
            addToast({ title: 'AI Copilot', message: 'Auditing email sender domain & SPF...', type: 'success' });
            navigate('/settings');
          },
        },
      ],
    },
    {
      category: 'Campaigns',
      items: [
        { id: 'new-camp', label: 'Create Campaign', icon: FiPlus, path: '/campaigns' },
        { id: 'view-camps', label: 'Search Campaigns', icon: FiSend, path: '/campaigns' },
      ],
    },
    {
      category: 'Audience',
      items: [
        { id: 'imp-contacts', label: 'Import CSV Contacts', icon: FiUploadCloud, path: '/contacts' },
        { id: 'view-contacts', label: 'Find Subscribers', icon: FiUsers, path: '/contacts' },
      ],
    },
    {
      category: 'Templates & Navigation',
      items: [
        { id: 'browse-tmpl', label: 'Browse Email Templates', icon: FiFileText, path: '/templates' },
        { id: 'anl-rep', label: 'Go to Analytics', icon: FiBarChart2, path: '/analytics' },
        { id: 'set-page', label: 'Account Settings', icon: FiSettings, path: '/settings' },
      ],
    },
  ];

  const filteredGroups = commandGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (item) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-md anim-modal"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[620px] bg-[#1D2127] border border-[rgba(255,255,255,0.06)] rounded-[16px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-5 h-[56px] border-b border-[rgba(255,255,255,0.05)]">
          <FiSearch className="w-5 h-5 text-[#9CA3AF] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campaigns, audience, AI commands..."
            className="w-full h-full bg-transparent text-[15px] text-[#F8FAFC] placeholder-[#9CA3AF] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] text-[#9CA3AF] hover:text-[#F8FAFC] hover:bg-[#252A31] transition-colors ml-2"
            title="Close"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-4">
          {filteredGroups.length === 0 ? (
            <p className="py-8 text-center text-[14px] text-[#9CA3AF]">
              No items found matching "{query}".
            </p>
          ) : (
            filteredGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <span className="px-3 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                  {group.category}
                </span>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="flex items-center justify-between px-3 h-[42px] rounded-[10px] text-[14px] text-[#9CA3AF] hover:text-[#F8FAFC] hover:bg-[#252A31] cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#3B82F6] transition-colors" />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[12px] text-[#6B7280]">
                        <span>Run</span>
                        <FiCornerDownLeft className="w-3 h-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="h-[40px] px-4 bg-[#181C20] border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between text-[12px] text-[#6B7280]">
          <span>Press <kbd className="font-mono text-[#F8FAFC]">Esc</kbd> to close</span>
          <span>Raycast Copilot Engine</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
