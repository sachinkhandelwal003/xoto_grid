// components/layout/CmsLayout.js
import React from "react";
import { CmsProvider, useCmsContext } from "../../contexts/CmsContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BackToTop from "./BackToTop";

const CmsLayoutContent = ({ children }) => {
  const { sidebarCollapsed, mobileSidebarOpen } = useCmsContext();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <Sidebar />

      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300
        ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <Topbar />

        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pt-16 pb-6 bg-gray-300 transition-all duration-300">
          <div className="max-w-full min-w-0 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 mx-auto w-full">
              {children}
           
          </div>
          <BackToTop />
        </main>
      </div>
    </div>
  );
};

const CmsLayout = ({ children }) => (
   <CmsProvider>
    <CmsLayoutContent>{children}</CmsLayoutContent>
  </CmsProvider>
);

export default CmsLayout;
