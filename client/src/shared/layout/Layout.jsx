import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import ToastNotifications from '../ui/ToastNotifications';

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex flex-col font-sans transition-colors duration-150 overflow-x-hidden">
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar setMobileOpen={setMobileOpen} collapsed={collapsed} />

        <main
          className={`flex-1 transition-all duration-150 ${
            collapsed ? 'md:ml-[80px]' : 'md:ml-[192px]'
          } ml-0`}
        >
          <div className="max-w-[1280px] mx-auto pt-4 sm:pt-6 md:pt-[36px] pb-12 px-3 sm:px-6 md:px-8 space-y-6 sm:space-y-8 md:space-y-10">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastNotifications />
    </div>
  );
}

export default Layout;
