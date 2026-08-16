import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import ToastNotifications from '../ui/ToastNotifications';

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex flex-col font-sans transition-colors duration-150">
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar setMobileOpen={setMobileOpen} collapsed={collapsed} />

        <main
          className={`flex-1 transition-all duration-200 ${
            collapsed ? 'md:ml-[80px]' : 'md:ml-[192px]'
          }`}
        >
          <div className="max-w-[1280px] mx-auto pt-[40px] pb-[64px] px-6 sm:px-10 md:px-[48px] space-y-[48px]">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastNotifications />
    </div>
  );
}

export default Layout;
