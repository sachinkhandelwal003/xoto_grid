// contexts/CmsContext.js
import { createContext, useState, useContext } from "react";

const CmsContext = createContext(null);

export const CmsProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarCollapsed, setMobileSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
    setSidebarCollapsed(prev => !prev);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarCollapsed(prev => !prev);
  };

  return (
    <CmsContext.Provider
      value={{
        sidebarOpen,
        sidebarCollapsed,
        mobileSidebarCollapsed,
        toggleSidebar,
        toggleMobileSidebar,
        setMobileSidebarCollapsed
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCmsContext = () => useContext(CmsContext);
