import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { ToastNotifications } from '../../components/ui/ToastNotifications';

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar setMobileOpen={setMobileOpen} collapsed={collapsed} />

        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-200 ${
            collapsed ? 'md:ml-20' : 'md:ml-60'
          }`}
        >
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastNotifications />
    </div>
  );
}

export default Layout;
