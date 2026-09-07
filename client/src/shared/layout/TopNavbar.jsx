import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMenu,
  FiMoon,
  FiSun,
  FiUser,
  FiCreditCard,
  FiLogOut,
  FiSearch,
  FiPlus,
  FiLayers,
  FiChevronDown,
  FiBell,
  FiCheckCircle,
  FiInfo,
  FiAlertTriangle,
} from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import CommandPalette from '../components/CommandPalette';
import { notificationService } from '../../services/notificationService';

export function TopNavbar({ setMobileOpen, collapsed }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleGlobalCmdK = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalCmdK);
    return () => window.removeEventListener('keydown', handleGlobalCmdK);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setNotifLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res?.notifications || []);
      setUnreadCount(res?.unreadCount || 0);
    } catch {
      // Silently fail for notifications — non-critical
    } finally {
      setNotifLoading(false);
    }
  }, []);

  // Fetch notifications on mount and poll every 60s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpenNotifications = () => {
    setShowNotifications((v) => !v);
    setShowProfileMenu(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.clearAll();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Silently fail
    }
  };

  const notifIcon = (type) => {
    if (type === 'success') return <FiCheckCircle className="w-4 h-4 text-[#22C55E] shrink-0" />;
    if (type === 'warning') return <FiAlertTriangle className="w-4 h-4 text-[#E8A33D] shrink-0" />;
    return <FiInfo className="w-4 h-4 text-[#3E6B70] shrink-0" />;
  };

  return (
    <>
      <header
        className={`sticky top-0 z-20 h-[60px] glass-header anim-sidebar transition-colors duration-150 ${
          collapsed ? 'md:pl-[80px]' : 'md:pl-[192px]'
        }`}
      >
        <div className="flex items-center justify-between h-full px-4 md:px-8 gap-3 md:gap-6">
          {/* Left Side: Mobile Menu & Workspace Selector */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-[8px] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Open Mobile Menu"
            >
              <FiMenu className="w-5 h-5" />
            </button>

            {/* Workspace Selector Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 h-[36px] bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[10px] text-[13px] text-[var(--text-secondary)] transition-colors">
              <FiLayers className="w-3.5 h-3.5 text-[#E8A33D]" />
              <span className="font-medium text-[var(--text)]">{user?.workspaceName || 'My Workspace'}</span>
            </div>
          </div>

          {/* Center: Search Bar Trigger */}
          <div
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full max-w-[360px] h-[38px] px-3 md:px-4 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[10px] flex items-center justify-between cursor-pointer hover:border-[#E8A33D]/50 transition-colors"
          >
            <div className="flex items-center gap-2.5 text-[var(--text-secondary)] truncate">
              <FiSearch className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[13px] truncate">Search campaigns, audience, templates...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[10px] font-mono text-[var(--text-muted)]">
              ⌘ K
            </kbd>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-[8px] text-[var(--text-secondary)] hover:text-[#E8A33D] hover:bg-[var(--surface-hover)] transition-colors flex items-center justify-center"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <FiSun className="w-4 h-4 text-[#F59E0B]" />
              ) : (
                <FiMoon className="w-4 h-4 text-[#475569]" />
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleOpenNotifications}
                className="relative p-2 rounded-[8px] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors flex items-center justify-center"
                aria-label="Notifications"
              >
                <FiBell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-[#E8A33D] text-[#0D0F11] text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[var(--surface-card)] border border-[var(--border)] rounded-[14px] shadow-2xl z-50 animate-fade-in overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                    <span className="text-[13px] font-semibold text-[var(--text)]">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-[#E8A33D] hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {notifLoading ? (
                      <p className="py-6 text-center text-[12px] text-[var(--text-muted)]">Loading...</p>
                    ) : notifications.length === 0 ? (
                      <p className="py-8 text-center text-[12px] text-[var(--text-muted)]">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => !n.read && handleMarkOneRead(n.id)}
                          className={`flex items-start gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0 cursor-pointer transition-colors ${
                            n.read ? 'opacity-60' : 'hover:bg-[var(--surface-hover)]'
                          }`}
                        >
                          {notifIcon(n.type)}
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-medium text-[var(--text)] truncate">{n.title}</p>
                            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-[#E8A33D] shrink-0 mt-1" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                className="flex items-center gap-2 p-1.5 rounded-[10px] hover:bg-[var(--surface-hover)] transition-colors min-h-[40px]"
              >
                <Avatar
                  name={user?.name || 'Operator'}
                  size="sm"
                />
                <span className="hidden lg:block text-[13px] font-medium text-[var(--text)]">
                  {user?.name || 'Operator'}
                </span>
                <FiChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--surface-card)] border border-[var(--border)] rounded-[14px] shadow-2xl py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-[var(--border)]">
                    <p className="text-[13px] font-semibold text-[var(--text)]">{user?.name || 'Operator'}</p>
                    <p className="text-[11px] text-[var(--text-secondary)] truncate">{user?.email || 'admin@mailpilot.io'}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        {isDark ? <FiSun className="w-4 h-4 text-[#F59E0B]" /> : <FiMoon className="w-4 h-4 text-[#3E6B70]" />}
                        Appearance
                      </span>
                      <span className="text-[11px] font-mono capitalize px-2 py-0.5 rounded bg-[var(--surface-secondary)] border border-[var(--border)]">
                        {isDark ? 'Dark' : 'Light'}
                      </span>
                    </button>

                    <button
                      onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      <FiUser className="w-4 h-4" />
                      Account Settings
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      <FiCreditCard className="w-4 h-4" />
                      Plan & Billing
                    </button>
                  </div>

                  <div className="pt-1 border-t border-[var(--border)]">
                    <button
                      onClick={() => { logout(); navigate('/login'); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-[#EF4444] hover:bg-[#EF4444]/10 font-medium transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <div className="hidden sm:block">
              <Button
                variant="primary"
                icon={FiPlus}
                onClick={() => navigate('/campaigns')}
              >
                New Campaign
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
}

export default TopNavbar;
