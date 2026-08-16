import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiSend,
  FiFileText,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiX,
  FiCpu,
  FiZap,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { APP_NAME } from '../../constants';
import Avatar from '../ui/Avatar';

export function Sidebar({ mobileOpen, setMobileOpen, collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Save collapsed state memory
  const handleToggleCollapse = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    try {
      localStorage.setItem('sidebar_collapsed', JSON.stringify(nextState));
    } catch (e) {
      // ignore
    }
  };

  const navGroups = [
    {
      group: 'WORKSPACE',
      items: [
        { name: 'Overview', path: '/', icon: FiGrid, hint: 'G O' },
        { name: 'Campaigns', path: '/campaigns', icon: FiSend, hint: 'G C' },
        { name: 'Audience', path: '/contacts', icon: FiUsers, hint: 'G A' },
      ],
    },
    {
      group: 'CREATE',
      items: [
        { name: 'Templates', path: '/templates', icon: FiFileText },
        { name: 'AI Studio', path: '/ai-workspace', icon: FiCpu },
      ],
    },
    {
      group: 'AUTOMATION',
      items: [
        { name: 'Workflows', path: '/workflows', icon: FiZap },
      ],
    },
    {
      group: 'INSIGHTS',
      items: [
        { name: 'Analytics', path: '/analytics', icon: FiBarChart2, hint: 'G N' },
      ],
    },
    {
      group: 'SETTINGS',
      items: [
        { name: 'Settings', path: '/settings', icon: FiSettings },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--sidebar)] border-r border-[var(--border)] anim-sidebar transition-colors duration-150">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-[56px] px-4 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2 overflow-hidden cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-[#E8A33D] font-bold text-base shrink-0">⚡</span>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[var(--text)] tracking-tight text-[14px] truncate leading-tight font-heading">
                {APP_NAME}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] truncate font-mono uppercase tracking-wider">
                Email Platform
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={handleToggleCollapse}
          className="hidden md:flex p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text)]"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Menu Groups */}
      <nav className="flex-1 px-2 py-4 space-y-5 overflow-y-auto">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <span className="px-[10px] text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase tracking-[0.15em] block mb-1.5">
                {group.group}
              </span>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center justify-between min-h-[36px] px-[10px] rounded-[6px] text-[13px] sidebar-item transition-colors ${
                      isActive
                        ? 'sidebar-item-active'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] font-normal'
                    }`
                  }
                  title={collapsed ? item.name : ''}
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-[16px] h-[16px] shrink-0 sidebar-icon transition-transform transition-opacity duration-150 ${
                            isActive ? 'text-[#E8A33D]' : 'opacity-70'
                          }`}
                        />
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </div>
                      {!collapsed && item.hint && (
                        <kbd className="hidden group-hover:inline-block text-[9px] font-mono text-[var(--text-muted)] bg-[var(--surface-secondary)] px-1 rounded border border-[var(--border)]">
                          {item.hint}
                        </kbd>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer / Logout */}
      <div className="p-3 border-t border-[var(--border)] shrink-0 bg-[var(--surface-secondary)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar
              name={user?.name || 'Operator'}
              size="sm"
            />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-medium text-[var(--text)] truncate">
                  {user?.name || 'Operator'}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)] truncate">
                  {user?.email || 'admin@mailpilot.io'}
                </span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-[4px] text-[var(--text-secondary)] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
              title="Logout"
            >
              <FiLogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (192px expanded / 80px collapsed) */}
      <aside
        className={`hidden md:block fixed top-0 left-0 h-screen z-30 anim-sidebar ${
          collapsed ? 'w-[80px]' : 'w-[192px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[240px] z-50 transform anim-sidebar md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export default Sidebar;
