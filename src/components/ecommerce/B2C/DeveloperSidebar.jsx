import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiX, FiChevronDown } from "react-icons/fi";

// SAME IMAGES (change path if needed)
import logoNew from "../../../assets/img/logoNew.png";
import favicon from "../../../assets/img/logonewww.png";

const DeveloperSidebar = ({
  sidebarCollapsed = false,
  mobileSidebarCollapsed = true,
  toggleMobileSidebar = () => {},
  setMobileSidebarCollapsed = () => {},
}) => {
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [openModule, setOpenModule] = useState(null);

  useEffect(() => {
    if (!mobileSidebarCollapsed) {
      setMobileSidebarCollapsed(true);
    }
  }, [location.pathname, setMobileSidebarCollapsed]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        !mobileSidebarCollapsed &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setMobileSidebarCollapsed(true);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [mobileSidebarCollapsed, setMobileSidebarCollapsed]);

  const mobileOpen = !mobileSidebarCollapsed;

  const sidebarClasses = `
    fixed top-0 left-0 h-full z-50 flex flex-col
    bg-gradient-to-b from-[#1a0b2e] via-[#2a1247] to-[#14051f]
    border-r border-purple-800/40 shadow-2xl
    transition-all duration-300 ease-in-out overflow-hidden
    ${mobileOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0"}
    ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"}
  `;

  const navItems = [
    {
      title: "Dashboard",
      icon: "fas fa-home",
      to: "/dashboard/developer",
    },
    {
      title: "Property Management",
      icon: "fas fa-building",
      to: "/dashboard/developer/developer-properties",
    },
    {
      title: "Inventory",
      icon: "fas fa-boxes-stacked",
      to: "/dashboard/developer/developer-inventory",
    },
    {
      title: "Analytics",
      icon: "fas fa-chart-line",
      to: "/dashboard/developer/analytics",
    },
  ];

  const handleNavClick = () => {
    if (!mobileSidebarCollapsed) setMobileSidebarCollapsed(true);
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarCollapsed(true)}
        />
      )}

      <aside ref={sidebarRef} className={sidebarClasses}>
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* HEADER */}
        <div
          className={`flex items-center p-4 border-b border-purple-800/50 ${
            sidebarCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div className="flex flex-col items-center gap-3 flex-1 overflow-hidden">
            <div
              className="flex flex-col items-center flex-shrink-0"
              title={sidebarCollapsed ? "Home" : ""}
            >
              <img
                src={sidebarCollapsed ? favicon : logoNew}
                alt="Logo"
                className={`transition-all duration-300 ${
                  sidebarCollapsed ? "h-8 w-8" : "h-10 sm:h-12 lg:h-14 w-auto"
                }`}
              />
              {!sidebarCollapsed && (
                <span className="text-white text-[8px] sm:text-[10px] whitespace-nowrap mt-1 animate-in fade-in duration-500">
                  Powered by AI. Inspired by you.
                </span>
              )}
            </div>

            {!sidebarCollapsed && (
              <div className="text-center animate-in slide-in-from-top-1 duration-300">
                <div className="text-xs uppercase tracking-widest text-purple-300/80">
                  Welcome
                </div>
                <div className="text-sm font-bold text-purple-200">Developer</div>
              </div>
            )}
          </div>

          {mobileOpen && (
            <button
              onClick={toggleMobileSidebar}
              className="p-2 text-purple-300 hover:text-white lg:hidden"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* NAV */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.to}
              onClick={handleNavClick}
              title={sidebarCollapsed ? item.title : ""}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-purple-600/50 text-white shadow-lg"
                    : "text-purple-300 hover:bg-purple-800/30"
                }
                ${sidebarCollapsed ? "justify-center px-0" : ""}
              `}
            >
              <i className={`${item.icon} w-5 text-center`} />
              {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-purple-900/40 text-center text-xs text-purple-400">
          {!sidebarCollapsed ? <span>v2.0.0</span> : <span title="Version 2.0.0">v2</span>}
        </div>
      </aside>
    </>
  );
};

export default DeveloperSidebar;