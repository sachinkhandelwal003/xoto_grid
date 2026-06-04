import { Link } from 'react-router-dom';
import { useEffect, useRef ,useState } from 'react';

const NavItem = ({ item, expanded, onToggle, currentPath }) => {
  const hasSubmenu = item.submenus && item.submenus.length > 0;
  const submenuRef = useRef(null);
  const [submenuHeight, setSubmenuHeight] = useState(0);

  // Calculate submenu height for smooth animation
  useEffect(() => {
    if (submenuRef.current && hasSubmenu) {
      setSubmenuHeight(submenuRef.current.scrollHeight);
    }
  }, [hasSubmenu, item.submenus]);

  const isActive =
    (item.exact ? currentPath === item.path : currentPath.startsWith(item.path)) ||
    (hasSubmenu && item.submenus.some(sub => currentPath.startsWith(sub.path)));

  return (
    <div className="space-y-1">
      <div
        className={`flex items-center rounded-lg p-3 mx-1 transition-all duration-200 ${
          isActive 
            ? 'bg-indigo-50 text-indigo-700' 
            : 'text-gray-600 hover:bg-gray-100'
        } ${hasSubmenu ? 'cursor-pointer' : ''}`}
        onClick={hasSubmenu ? () => onToggle(item.title) : undefined}
      >
        <span className={`mr-3 text-lg ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
          <i className={item.icon}></i>
        </span>
        <span className={`flex-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
          {item.title}
        </span>
        
        {item.badge && (
          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
        
        {hasSubmenu && (
          <span className={`ml-2 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        )}
      </div>

      {hasSubmenu && (
        <div
          ref={submenuRef}
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: expanded ? `${submenuHeight}px` : '0px',
            paddingLeft: '1.5rem',
          }}
        >
          <div className="space-y-1 py-1">
            {item.submenus.map((subItem) => {
              const subActive = currentPath.startsWith(subItem.path);
              return (
                <Link
                  key={subItem.title}
                  to={subItem.path}
                  className={`block rounded-lg p-2 pl-4 transition-colors duration-200 ${
                    subActive 
                      ? 'bg-indigo-50 text-indigo-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {subItem.title}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavItem;