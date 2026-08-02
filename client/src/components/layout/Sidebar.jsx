import { useState } from 'react';
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
  FiZap,
  FiX,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

export function Sidebar({ mobileOpen, setMobileOpen, collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: FiGrid },
    { name: 'Campaigns', path: '/campaigns', icon: FiSend, badge: '2' },
    { name: 'Templates', path: '/templates', icon: FiFileText },
    { name: 'Contacts', path: '/contacts', icon: FiUsers },
    { name: 'Analytics', path: '/analytics', icon: FiBarChart2 },
    { name: 'Settings', path: '/settings', icon: FiSettings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <FiMail className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base truncate">
                MailPilot<span className="text-indigo-600 dark:text-indigo-400">.io</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                AI Email Platform
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`
              }
              title={collapsed ? item.name : ''}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-5 h-5 shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </div>
              {!collapsed && item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-200 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Pro Plan Widget */}
      {!collapsed && (
        <div className="p-3 mx-3 mb-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/60 dark:from-slate-800 dark:to-indigo-950/40 border border-indigo-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2 mb-1.5 text-indigo-600 dark:text-indigo-400">
            <FiZap className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold uppercase tracking-wider">Enterprise Plan</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
            85,400 / 100,000 monthly emails sent.
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: '85%' }} />
          </div>
        </div>
      )}

      {/* User Footer / Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/20 shrink-0"
            />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.name || 'Alex Morgan'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'alex@mailpilot.io'}
                </span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Logout"
            >
              <FiLogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 left-0 h-screen z-30 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 z-50 transform transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export default Sidebar;
