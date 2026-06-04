import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "../../CMS/components/layout/Sidebar"; 
import { useCmsContext } from "../../CMS/contexts/CmsContext";
const DeveloperLayout = () => {
  // Redux se user check kar rahe hain taaki agar login na ho toh handle ho sake
  const { user, token } = useSelector((state) => state.auth);
  
  // Aapke Sidebar toggle ki states CmsContext se aayengi
  const { 
    sidebarCollapsed, 
    mobileSidebarCollapsed, 
    setMobileSidebarCollapsed 
  } = useCmsContext();

  // Screen resize hone par mobile sidebar auto-close karne ke liye
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setMobileSidebarCollapsed]);

  // Safety check: Agar user login nahi hai toh content hide rakhein
  if (!user || !token) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 1. Sidebar Component */}
      {/* Hum wahi Sidebar use karenge jo apne share kiya tha kyunki usme logic pehle se hai */}
      <Sidebar />

      {/* 2. Main Content Wrapper */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        
        {/* Mobile Overlay (Jab mobile menu khula ho tab piche dark layer) */}
        {!mobileSidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setMobileSidebarCollapsed(true)}
          />
        )}
      </div>
    </div>
  );
};

export default DeveloperLayout;