import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../CMS/components/layout/Sidebar";

const AgencyLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      <Sidebar />

      <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
        <div className="p-6">
          <Outlet />
        </div>
      </div>

    </div>
  );
};

export default AgencyLayout;
