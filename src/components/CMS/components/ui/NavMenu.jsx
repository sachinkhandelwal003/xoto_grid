import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import { getRoleColors } from '../../../../manageApi/utils/roleColors';
import { useSelector } from 'react-redux';

const NavLinkItem = ({ item, collapsed, colors, isActive }) => {
  const active = isActive(item.path);
  
  return (
    <NavLink
      to={item.path}
      end={item.exact}
      className={`
        flex items-center px-4 py-3 text-sm font-medium transition-all duration-200
        ${active 
          ? `bg-gray-700 text-white` 
          : 'text-gray-200 hover:bg-gray-600'
        }
        ${collapsed ? 'justify-center' : ''}
        group-hover:translate-x-1
      `}
      style={active ? { backgroundColor: '#3A3A3A' } : {}}
    >
      <i className={`
        ${item.icon} 
        ${active ? 'text-white' : 'text-gray-300'} 
        text-lg transition-all duration-200 group-hover:scale-110
      `}></i>
      {!collapsed && (
        <>
          <span className="ml-3">{item.title}</span>
          {item.badge && (
            <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

const NavMenuGroup = ({ item, collapsed, colors, isActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const groupActive = item.submenus.some(sub => isActive(sub.path)) || isActive(item.path);

  return (
    <div className="relative group">
      <Tooltip 
        title={item.title} 
        placement="right"
        arrow
        disableHoverListener={!collapsed}
      >
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              flex items-center w-full px-4 py-3 text-sm font-medium transition-all duration-200
              ${groupActive ? 'text-white' : 'text-gray-200 hover:bg-gray-600'}
              ${collapsed ? 'justify-center' : ''}
              group-hover:translate-x-1
            `}
          >
            <i className={`
              ${item.icon} 
              ${groupActive ? 'text-white' : 'text-gray-300'} 
              text-lg transition-all duration-200 group-hover:scale-110
            `}></i>
            {!collapsed && (
              <>
                <span className="ml-3 text-gray-300">{item.title}</span>
                <span className="ml-auto">
                  <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-xs text-gray-300 transition-transform duration-200`}></i>
                </span>
              </>
            )}
          </button>
        </div>
      </Tooltip>
      
      {(!collapsed || isOpen) && isOpen && (
        <ul className={`${collapsed ? 'ml-0' : 'ml-2'} mt-1 space-y-1`}>
          {item.submenus.map((submenu, subIndex) => {
            const subActive = isActive(submenu.path);
            return (
              <li key={subIndex} className="relative group">
                <Tooltip 
                  title={submenu.title} 
                  placement="right"
                  arrow
                  disableHoverListener={!collapsed}
                >
                  <div>
                    <NavLink
                      to={submenu.path}
                      className={`
                        block px-4 py-2 text-sm transition-all duration-200 rounded
                        ${subActive 
                          ? `bg-gray-700 text-white` 
                          : 'text-gray-200 hover:bg-gray-600'
                        }
                        ${collapsed ? 'text-center' : 'pl-11'}
                        group-hover:translate-x-1
                      `}
                      style={subActive ? { backgroundColor: '#3A3A3A' } : {}}
                    >
                      {collapsed ? (
                        <i className={`${submenu.icon || 'fas fa-circle'} text-gray-300 text-lg`}></i>
                      ) : (
                        submenu.title
                      )}
                    </NavLink>
                  </div>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const NavMenu = ({ items, collapsed }) => {
  const location = useLocation();
  const user = useSelector((state) => state.auth?.user);
  const colors = getRoleColors(user?.role?.code);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="overflow-hidden">
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="relative group">
            {item.submenus ? (
              <NavMenuGroup item={item} collapsed={collapsed} colors={colors} isActive={isActive} />
            ) : (
              <Tooltip 
                title={item.title} 
                placement="right"
                arrow
                disableHoverListener={!collapsed}
              >
                <div>
                  <NavLinkItem 
                    item={item} 
                    collapsed={collapsed} 
                    colors={colors} 
                    isActive={isActive} 
                  />
                </div>
              </Tooltip>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavMenu;