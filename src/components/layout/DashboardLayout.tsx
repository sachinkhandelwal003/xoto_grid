import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <TopBar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(p => !p)}
        onToggleMobile={() => setMobileOpen(p => !p)}
      />
      <main
        className={`
          transition-all duration-300 pt-16
          ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-72'}
          ml-0
        `}
      >
        <div className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
