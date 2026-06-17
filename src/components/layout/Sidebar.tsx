import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FiX, FiChevronDown, FiLogOut } from 'react-icons/fi';
import { logoutUser } from '../../store/authSlice';
import type { RootState, AppDispatch } from '../../store/store';
import { GRID_ROLE_SLUG_MAP } from '../../types/auth';
import { apiService } from '../../api/apiService';
import { toast } from 'react-toastify';

interface MenuItem {
  title: string;
  icon: string;
  to?: string;
  submenus?: { title: string; to: string }[];
}

const MORTGAGE_CALCULATOR_LINK = {
  title: "Calculator",
  icon: "fas fa-calculator",
  submenus: [
    {
      title: "Mortgage Eligibility",
      to: "/dashboard/agent/mortgages/calculator/eligibility",
    },
    {
      title: "Affordability",
      to: "/dashboard/agent/mortgages/calculator/affordability",
    },
  ],
};

const GRID_NAV: Record<string, MenuItem[]> = {
  // ── Grid Admin (1) ──────────────────────────────────────────────────────────
 '1': [

  {
    title: 'Lead Management', icon: 'fas fa-filter',
    submenus: [
      { title: 'Leads Queue',    to: '/dashboard/admin/GridAdmin/propertyleads' },
      { title: 'All Leads',      to: '/dashboard/admin/grid/AllgridLeads' },
      { title: 'Agent Leads',    to: '/dashboard/admin/grid/agentleads' },
      { title: 'Create Lead',  to: '/dashboard/admin/grid/generalleads' },
      { title: 'Referral Leads', to: '/dashboard/admin/grid/referralleads' },
    ],
  },
  {
    title: 'Listing Management', icon: 'fas fa-building',
    submenus: [
      { title: 'All Listings',        to: '/dashboard/admin/property-management' },
      { title: 'Create Listing',      to: '/dashboard/admin/rental/properties' },
      { title: 'Approval Queue',      to: '/dashboard/admin/listings/approval-queue' },
      { title: 'Edit Review Queue',   to: '/dashboard/admin/listings/edit-review-queue' },
    ],
  },
  {
    title: 'Users & Profiles', icon: 'fas fa-users',
    submenus: [
      // { title: 'All Users',           to: '/dashboard/admin/grid/allusers' },  
      { title: 'Partners',            to: '/dashboard/admin/agency-list' },
      { title: 'Create Partner',      to: '/dashboard/admin/onboarding/agency' },
      { title: 'Developers',          to: '/dashboard/admin/developer-list' },
      { title: 'Create Developer',    to: '/dashboard/admin/onboarding/developer' },
      { title: 'Agents',              to: '/dashboard/admin/agent-list' },
      { title: 'Xoto Advisors',       to: '/dashboard/admin/advisors' },
      { title: 'Create Advisor',      to: '/dashboard/admin/advisor/create' },
      { title: 'Referral Partners',   to: '/dashboard/admin/referral-partners' },
    ],
  },
  {
    title: 'Commissions', icon: 'fas fa-file-invoice-dollar',
    submenus: [
      { title: 'Deal Records',    to: '/dashboard/admin/deal-records' },
      { title: 'Agreements',      to: '/dashboard/admin/admin/agreements' },
      { title: 'Leaderboard',     to: '/dashboard/admin/referral-leaderboard' },
    ],
  },
  // {
  //   title: 'Audit Logs', icon: 'fas fa-clipboard-list',
  //   submenus: [
  //     { title: 'All Logs', to: '/dashboard/admin/audit-logs' },
  //   ],
  // },
  {
    title: 'Analytics & Reporting', icon: 'fas fa-chart-line',
    submenus: [
      { title: 'Overview',          to: '/dashboard/admin/overview' },
      { title: 'Lead Reports',      to: '/dashboard/admin/leadreports' },
      { title: 'Listing Reports',   to: '/dashboard/admin/listingreports' },
    ],
  },
  {
    title: 'Notifications', icon: 'fas fa-bell',
    to: '/dashboard/admin/gridnotification',
  },
//   {
//   title: 'Platform Configuration',
//   icon: 'fas fa-sliders',
//   to: '/dashboard/admin/setting',
// },
],

  // ── Grid Partner/Agency (15) ───────────────────────────────────────────────
  '15': [
    { title: 'Agent Team', icon: 'fas fa-user-friends', to: '/dashboard/agency/all-agents' },
    { title: 'Leads', icon: 'fas fa-users', to: '/dashboard/agency/lead-management' },
    { title: 'Commission', icon: 'fas fa-dollar-sign', to: '/dashboard/agency/partner/deals' },
    { title: 'Leaderboard', icon: 'fas fa-trophy', to: '/dashboard/agency/agency-leaderboard' },
    { title: 'Agreement', icon: 'fas fa-file', to: '/dashboard/agency/agency-agreements' },
    
      {
    title: 'Notifications', icon: 'fas fa-bell',
    to: '/dashboard/agency/gridnotification',
  },
  ],

  // ── Grid Agent (16) ────────────────────────────────────────────────────────
  '16': [
    { title: "My Leads", icon: "fas fa-calendar-check", to: "/dashboard/agent/GridAgent-lead" },
    { title: "Property Catalogue", icon: "fas fa-building", to: "/dashboard/agent/agent-projects" },
    { title: "My Presentations", icon: "fas fa-file-powerpoint", to: "/dashboard/agent/presentations" },
    MORTGAGE_CALCULATOR_LINK,
    { title: "Leaderboard", icon: "fas fa-users", to: "/dashboard/agent/Leaderboard" },
    { title: "My Agreements", icon: "fas fa-chalkboard-teacher", to: "/dashboard/agent/agent-agreement" },
     {
    title: 'Notifications', icon: 'fas fa-bell',
    to: '/dashboard/agent/gridnotification',
  },
  ],

  // ── Grid Developer (17) ────────────────────────────────────────────────────
  '17': [
    { title: 'Projects', icon: 'fas fa-building', to: '/dashboard/developer/developer-properties' },
    { title: 'Listings', icon: 'fas fa-layer-group', to: '/dashboard/developer/developer-inventory' },
    { title: 'Agreements', icon: 'fas fa-file', to: '/dashboard/developer/developer-agreement' },
     {
    title: 'Notifications', icon: 'fas fa-bell',
    to: '/dashboard/developer/gridnotification',
  },
  ],

  // ── Grid Advisor (24) ──────────────────────────────────────────────────────
  '24': [
    { title: 'My Leads', icon: 'fas fa-users', to: '/dashboard/GridAdvisor/gridAdvisorLeads' },
    { title: 'Property Catalogue', icon: 'fas fa-building', to: '/dashboard/GridAdvisor/property-catalogue' },
    { title: 'My Presentations', icon: 'fas fa-file-powerpoint', to: '/dashboard/GridAdvisor/presentations' },
    {
      title: "Calculator",
      icon: "fas fa-calculator",
      submenus: [
        {
          title: "Mortgage Eligibility",
          to: "/dashboard/GridAdvisor/mortgages/calculator/eligibility",
        },
        {
          title: "Affordability",
          to: "/dashboard/GridAdvisor/mortgages/calculator/affordability",
        },
      ],
    },
    { title: 'Leaderboard', icon: 'fas fa-trophy', to: '/dashboard/GridAdvisor/leaderboard' },

  ],

  // ── Grid Referral Partner (25) ─────────────────────────────────────────────
  '25': [
    {
      title: 'Referrals', icon: 'fas fa-users',
      submenus: [
        { title: 'Submit Lead',  to: '/dashboard/gridreferralpartner/submit-leads' },
        { title: 'My Referrals', to: '/dashboard/gridreferralpartner/total-leads' },
      ],
    },
    { title: 'Leaderboard', icon: 'fas fa-trophy', to: '/dashboard/gridreferralpartner/referral-leaderboard' },
      {
    title: 'Notifications', icon: 'fas fa-bell',
    to: '/dashboard/gridreferralpartner/gridnotification',
  },
  ],
};

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, mobileOpen, onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((s: RootState) => s.auth);
  const [openModule, setOpenModule] = useState<string | null>(null);

  const roleCode = user?.role
    ? typeof user.role === 'object' ? String(user.role.code) : String(user.role)
    : '1';

  const roleSlug = GRID_ROLE_SLUG_MAP[roleCode] ?? 'admin';

  const displayName = typeof user?.role === 'object' ? user.role.name : roleSlug.replace(/-/g, ' ');


  
  useEffect(() => { onCloseMobile(); }, [location.pathname]);

  const navItems = useMemo(() => {
    const dashboardItem: MenuItem = { title: 'Dashboard', icon: 'fas fa-home', to: `/dashboard/${roleSlug}` };
    const items = GRID_NAV[roleCode] ?? [];
    return [dashboardItem, ...items];
  }, [roleCode, roleSlug]);

  // Auto-expand the parent whose submenu matches the current route
  useEffect(() => {
    const activeParent = navItems.find(item =>
      item.submenus?.some(sub => location.pathname.startsWith(sub.to))
    );
    if (activeParent) setOpenModule(activeParent.title);
  }, [location.pathname, navItems]);

  const handleLogout = async () => {
    await dispatch(logoutUser(undefined));
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  const isParentActive = (item: MenuItem) =>
    item.submenus?.some(s => location.pathname.startsWith(s.to)) ?? false;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onCloseMobile} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          transition-all duration-300 ease-in-out overflow-hidden
          ${mobileOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-[72px]' : 'lg:w-72'}
        `}
        style={{
          background: 'linear-gradient(180deg, #12052a 0%, #1e0b3a 40%, #150828 100%)',
          borderRight: '1px solid rgba(139,92,246,0.2)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
        }}
      >
        <style>{`
          .sb-scroll::-webkit-scrollbar { width: 3px; }
          .sb-scroll::-webkit-scrollbar-track { background: transparent; }
          .sb-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 99px; }
          .sb-scroll { scrollbar-width: thin; scrollbar-color: rgba(139,92,246,0.3) transparent; }
        `}</style>

        {/* ── Logo + Role ──────────────────────────────────────────────── */}
        <div
          className="flex-shrink-0 relative flex flex-col items-center"
          style={{
            padding: collapsed ? '14px 0 10px' : '20px 0 14px',
            borderBottom: '1px solid rgba(139,92,246,0.15)',
          }}
        >
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg"
              style={{ color: 'rgba(196,167,255,0.7)', background: 'rgba(139,92,246,0.1)' }}
            >
              <FiX size={16} />
            </button>
          )}

          {/* Xoto Grid logo — big & centered */}
          <img
            src="/KGT-RealEstate.png"
            alt="Xoto Grid"
            style={{
              width: collapsed ? 44 : 110,
              height: collapsed ? 44 : 110,
              objectFit: 'contain',
              display: 'block',
              transition: 'all 0.3s',
            }}
          />

          {/* Role name — only when expanded */}
          {!collapsed && (
            <div style={{
              marginTop: 8, fontSize: 11, fontWeight: 700,
              color: 'rgba(196,167,255,0.6)',
              textTransform: 'capitalize', letterSpacing: 0.4,
              textAlign: 'center',
            }}>
              {displayName}
            </div>
          )}
        </div>

        {/* ── Nav ──────────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto sb-scroll px-2.5 pb-4 space-y-0.5">
          {navItems.map((item, idx) => {
            const hasSub = !!item.submenus?.length;
            const expanded = openModule === item.title;
            const parentActive = hasSub ? isParentActive(item) : false;
            // Dashboard uses exact match; all others use startsWith via NavLink
            const isDashboard = idx === 0;

            if (!hasSub) {
              return (
                <NavLink
                  key={item.title}
                  to={item.to!}
                  end={isDashboard}
                  title={collapsed ? item.title : undefined}
                  className={({ isActive }) => {
                    const on = isActive;
                    return [
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group',
                      on
                        ? 'text-white'
                        : 'text-purple-300/60 hover:text-white hover:bg-white/5',
                      collapsed ? 'justify-center' : '',
                    ].join(' ');
                  }}
                  style={({ isActive }) => isActive ? {
                    background: 'linear-gradient(135deg, rgba(92,3,155,0.85), rgba(124,58,237,0.7))',
                    boxShadow: '0 2px 12px rgba(92,3,155,0.4)',
                    border: '1px solid rgba(139,92,246,0.35)',
                  } : { border: '1px solid transparent' }}
                >
                  <i
                    className={`${item.icon} text-[14px] flex-shrink-0`}
                    style={{ width: 18, textAlign: 'center' }}
                  />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </NavLink>
              );
            }

            // Parent with submenus
            return (
              <div key={item.title}>
                <button
                  onClick={() => setOpenModule(expanded ? null : item.title)}
                  title={collapsed ? item.title : undefined}
                  className={[
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200',
                    parentActive
                      ? 'text-white'
                      : expanded
                        ? 'text-purple-200 bg-white/5'
                        : 'text-purple-300/60 hover:text-white hover:bg-white/5',
                    collapsed ? 'justify-center' : '',
                  ].join(' ')}
                  style={parentActive ? {
                    background: 'linear-gradient(135deg, rgba(92,3,155,0.7), rgba(124,58,237,0.5))',
                    border: '1px solid rgba(139,92,246,0.3)',
                  } : { border: '1px solid transparent' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <i
                      className={`${item.icon} text-[14px] flex-shrink-0`}
                      style={{ width: 18, textAlign: 'center' }}
                    />
                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </div>
                  {!collapsed && (
                    <FiChevronDown
                      size={13}
                      className="flex-shrink-0 transition-transform duration-200"
                      style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', opacity: 0.6 }}
                    />
                  )}
                </button>

                {expanded && !collapsed && (
                  <div
                    className="mt-0.5 mb-1 ml-4 pl-3 space-y-0.5"
                    style={{ borderLeft: '1.5px solid rgba(139,92,246,0.25)' }}
                  >
                    {item.submenus!.map(sub => (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        className={({ isActive }) => [
                          'flex items-center gap-2 py-2 px-3 rounded-lg text-[11.5px] leading-snug transition-all duration-150 whitespace-normal',
                          isActive
                            ? 'text-white font-semibold'
                            : 'text-purple-300/50 font-medium hover:text-white hover:bg-white/5',
                        ].join(' ')}
                        style={({ isActive }) => isActive ? {
                          background: 'rgba(139,92,246,0.25)',
                          border: '1px solid rgba(139,92,246,0.3)',
                        } : { border: '1px solid transparent' }}
                      >
                        <span
                          className="flex-shrink-0 rounded-full"
                          style={{
                            width: 5, height: 5,
                            background: 'currentColor',
                            opacity: 0.6,
                          }}
                        />
                        {sub.title}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Logout ───────────────────────────────────────────────────── */}
        <div
          className="flex-shrink-0 px-2.5 py-3"
          style={{ borderTop: '1px solid rgba(139,92,246,0.15)' }}
        >
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200',
              'text-red-400/70 hover:text-red-300 hover:bg-red-900/20',
              collapsed ? 'justify-center' : '',
            ].join(' ')}
            style={{ border: '1px solid transparent' }}
          >
            <FiLogOut size={15} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          {!collapsed && (
            <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(139,92,246,0.35)', marginTop: 8, letterSpacing: 1 }}>
              v1.0.0
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
