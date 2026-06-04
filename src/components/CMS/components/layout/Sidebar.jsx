import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { useCmsContext } from '../../contexts/CmsContext';
import { FiX, FiChevronDown } from 'react-icons/fi';
import { useFreelancer } from '../../../../../src/context/FreelancerContext';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import logoNew from '../../../../assets/img/logoNew.png';
import vault from "../../../../assets/img/logo/logovault.png";
import favicon from '../../../../assets/img/logonewww.png';

/* --- CUSTOM LINKS CONFIGURATION --- */
// /dashboard/superadmin/developer/property
const MORTGAGE_CALCULATOR_LINK = {
  title: "Calculator",
  icon: "fas fa-calculator",
  path: "/dashboard/{roleSlug}/mortgages/calculator/eligibility",
  submenus: [
    {
      title: "Mortgage Eligibility",
      path: "/dashboard/{roleSlug}/mortgages/calculator/eligibility",
    },
    {
      title: "Affordability",
      path: "/dashboard/{roleSlug}/mortgages/calculator/affordability",
    },
  ],
};

const CUSTOM_ROLE_LINKS = {
  "0": [
    {
      title: "Properties",
      icon: "fas fa-building",
      path: "/dashboard/superadmin/properties",
      submenus: [
        {
          title: "Create Developer",
          path: "/dashboard/superadmin/developer/create"
        },
        {
          title: "Property Management",
          path: "/dashboard/superadmin/developer/property"
        },
        // {
        //   title: "Agents",
        //   path: "/dashboard/superadmin/agent-list"
        // },

        // {
        //   title: "Agencies",
        //   path: "/dashboard/superadmin/agency-list"
        // }
      ]
    },
    {
      title: "Customers",
      icon: "fas fa-users",
      path: "/dashboard/superadmin/customers",
      submenus: [
        { title: "All Customers", path: "/dashboard/superadmin/customers/list" },
      ]
    },
    {
      title: "User Feedbacks",
      icon: "fas fa-users",
      path: "/dashboard/{roleSlug}/feedbacks",
      submenus: [
        { title: "All Customers", path: "/dashboard/{roleSlug}/feedbacks" },
      ]
    },
    {
      title: "Rental Properties", icon: "fas fa-building", path: "/dashboard/{roleSlug}/rental/properties",
      submenus: [
        { title: "Create Rental Properties", path: "/dashboard/{roleSlug}/rental/properties" },
        { title: "Rental Proprties", path: "/dashboard/{roleSlug}/rental/propertieslist" },
        { title: "Rental Lead List", path: "/dashboard/{roleSlug}/rental/leadlist" },


      ],
    },
    // {
    //   title: "Setting",
    //   icon: "fas fa-cog",
    //   path: "/dashboard/superadmin/setting",
    //   submenus: [
    //     {
    //       title: "Email Setting",
    //       path: "/dashboard/superadmin/setting/email"
    //     }
    //   ]
    // }
  ],

    "1": [

    /* ── Listings & Approvals ── */
  {
    title: "Listings",
    path: "/dashboard/{roleSlug}/property-list",
    icon: "fas fa-building",
    submenus: [
      { title: "All Listings",          path: "/dashboard/{roleSlug}/property-management" },
      { title: "Approval Queue",        path: "/dashboard/{roleSlug}/listings/approval-queue" },
      { title: "Edit Review Queue",     path: "/dashboard/{roleSlug}/listings/edit-review-queue" },
      { title: "Create Properties",     path: "/dashboard/{roleSlug}/rental/properties" },
      //  { title: "Create Property ",      path: "/dashboard/{roleSlug}/grid/createoffplan" },
    ]
  },

//   {
//    title: "Inventory",
//    icon: "fas fa-layer-group",
//    path: "/dashboard/{roleSlug}/admin/inventory"
// },

    /* ── Enquiry Handling ── */
    // {
    //   title: "Enquiries",
    //   path: "/dashboard/{roleSlug}/enquiries",
    //   icon: "fas fa-inbox",
    //   submenus: [
    //     { title: "Enquiry Queue",   path: "/dashboard/{roleSlug}/enquiries/queue" },
    //     { title: "Bulk Upload",     path: "/dashboard/{roleSlug}/enquiries/bulk-upload" },
    //   ]
    // },

    /* ── Lead Management ── */
    {
      title: "Lead Management",
      path: "/dashboard/{roleSlug}/lead-management",
      icon: "fas fa-filter",
      submenus: [
        { title: "All Leads",       path: "/dashboard/{roleSlug}/grid/AllgridLeads" },
        { title: "Platform Leads",  path: "/dashboard/{roleSlug}/GridAdmin/propertyleads" },
        { title: "Agent Leads",     path: "/dashboard/{roleSlug}/grid/agentleads" },
        { title: "General Leads",   path: "/dashboard/{roleSlug}/grid/generalleads" },
        {title:"Referral Leads", path: "/dashboard/{roleSlug}//grid/referralleads"}
      
      ]
    },

    /* ── User Management ── */
    {
      title: "Partners",
      path: "/dashboard/{roleSlug}/agency-list",
      icon: "fas fa-network-wired",
      submenus: [
        { title: "Create Partner",    path: "/dashboard/{roleSlug}/onboarding/agency" },
        { title: "Partner List",      path: "/dashboard/{roleSlug}/agency-list" },
      ]
    },
    {
      title: "Developers",
      path: "/dashboard/{roleSlug}/developer-list",
      icon: "fas fa-user-tie",
      submenus: [
        { title: "Developer List",    path: "/dashboard/{roleSlug}/developer-list" },
        { title: "Create Developer",  path: "/dashboard/{roleSlug}/onboarding/developer" },
      ]
    },
    {
      title: "Agents",
      path: "/dashboard/{roleSlug}/agent-list",
      icon: "fas fa-user-friends",
      submenus: [
        { title: "Agent List",        path: "/dashboard/{roleSlug}/agent-list" },
        // { title: "Verification Queue",path: "/dashboard/{roleSlug}/agents/verification-queue" },
      ]
    },
    {
      title: "Xoto Advisors",
      path: "/dashboard/{roleSlug}/advisor-list",
      icon: "fas fa-user-shield",
      submenus: [
        { title: "Advisor List",      path: "/dashboard/{roleSlug}/advisors" },
        { title: "Create Advisor",    path: "/dashboard/{roleSlug}/advisor/create" },
        // { title: "Leaderboard",       path: "/dashboard/{roleSlug}/advisors/leaderboard" },
      ]
    },
    {
      title: "Referral Partners",
      icon: "fas fa-handshake",
      path: "/dashboard/{roleSlug}/referral-partners",
      submenus: [
        { title: "All Referral Partners", path: "/dashboard/{roleSlug}/referral-partners" },
        { title: "Leaderboard", path: "/dashboard/{roleSlug}/referral-leaderboard" },
      ],
    },
    // {
    //   title: "Customers",
    //   path: "/dashboard/{roleSlug}/customer-list",
    //   icon: "fas fa-users",
    //   submenus: [
    //     { title: "Customer List",     path: "/dashboard/{roleSlug}/customer-list" },
    //     { title: "Enquiry History",   path: "/dashboard/{roleSlug}/customers/enquiry-history" },
    //   ]
    // },

    /* ── Commission Management ── */
    {
      title: "Commission",
      path: "/dashboard/{roleSlug}/commission",
      icon: "fas fa-file-invoice-dollar",
      submenus: [
        { title: "Deal Records",        path: "/dashboard/{roleSlug}/deal-records" },
        { title: "Agreements",          path: "/dashboard/{roleSlug}/admin/agreements" },
      //   { title: "Commission Ledger",   path: "/dashboard/{roleSlug}/grid/commission" },
      //   { title: "Partner Agreements",  path: "/dashboard/{roleSlug}/commission/agreements" },
      ]
    },

    /* ── Content Management ── */
    // {
    //   title: "Content Management",
    //   path: "/dashboard/{roleSlug}/content",
    //   icon: "fas fa-photo-video",
    //   submenus: [
    //     { title: "Featured Properties", path: "/dashboard/{roleSlug}/content/featured" },
    //     { title: "Promo Banners",       path: "/dashboard/{roleSlug}/content/banners" },
    //   ]
    // },

    /* ── Analytics ── */
    // {
    //   title: "Analytics",
    //   path: "/dashboard/{roleSlug}/analytics",
    //   icon: "fas fa-chart-line",
    //   submenus: [
    //     { title: "Platform Overview",   path: "/dashboard/{roleSlug}/analytics/overview" },
    //     { title: "Agent Metrics",       path: "/dashboard/{roleSlug}/analytics/agents" },
    //     { title: "Developer Metrics",   path: "/dashboard/{roleSlug}/analytics/developers" },
    //     { title: "Commission Metrics",  path: "/dashboard/{roleSlug}/analytics/commission" },
    //   ]
    // },

  ],
  "2": [
    {
      title: "Estimates", icon: "fas fa-calendar-check", path: "/dashboard/{roleSlug}/quotations",
      submenus: [
        { title: "Submitted Estimates", path: "/dashboard/{roleSlug}/estimate/submitted" },
        { title: "Received Quotation", path: "/dashboard/{roleSlug}/quotation/received" },
        { title: "Response Submitted", path: "/dashboard/{roleSlug}/quotation/response" },

      ],
    },
    {
      title: "My Projects", icon: "fas fa-calendar-check", path: "/dashboard/{roleSlug}/projects",
      submenus: [
        { title: "Ongoing Projects", path: "/dashboard/{roleSlug}/projects/ongoing" },


      ],
    },
    {
      title: "My Favourites", icon: "fas fa-calendar-check", path: "/dashboard/{roleSlug}/My-favourite-Properties",
      submenus: [
        { title: "My Favourite Properties", path: "/dashboard/{roleSlug}/My-favourite-Properties" },


      ],
    },
    {
      title: "Bills", icon: "fas fa-calendar-check", path: "/dashboard/{roleSlug}/projects",
      submenus: [
        { title: "My Bills", path: "/dashboard/{roleSlug}/projects/milestone/bills" },
        // { title: "My Invoice", path: "/dashboard/{roleSlug}/projects/invoices" },


      ],
    },
    {
      title: "View Library", icon: "fas fa-calendar-check", path: "/dashboard/{roleSlug}/ViewLibrary",



    },

  ],
  "12": [
    {
      title: "Projects", icon: "fas fa-calendar-check", path: "/dashboard/{roleSlug}/projects/view",
      submenus: [
        { title: "Manage Projects", path: "/dashboard/{roleSlug}/projects/manage" },


      ],
    }
  ],
  "4": [

  ],
  "5": [
    {
      title: "Inventory",
      icon: "fas fa-warehouse",
      path: "/dashboard/vendor-b2c/inventory",
    },
  ],
  "7": [
    {
      title: "Quotations", icon: "fas fa-calendar-check", path: "/dashboard/{roleSlug}/quotations",
      submenus: [
        { title: "Submitted Quotation", path: "/dashboard/{roleSlug}/quotation/submitted" },
        { title: "Approved Quotation", path: "/dashboard/{roleSlug}/quotation/approved" },

      ],
    },
  ],
  "8": [
    {
      title: "Property Management",
      icon: "fas fa-building",
      path: "/dashboard/developer/property-management",
      submenus: [
        { title: "All Properties", path: "/dashboard/developer/property-management/list" },
      ],
    },
  ],
  "16": [
    {
      title: "Catalogs",
      icon: "fas fa-building",
      path: "/dashboard/{roleSlug}/agent-projects",
    },

    {
      title: "Leads", icon: "fas fa-calendar-check", path: "/dashboard/{roleSlug}/GridAgent-lead",
      // submenus: [
      //   { title: "Leads", path: "/dashboard/{roleSlug}/GridAgent-lead" },



      // ],
    },
        {
      title: "My Presentations",
      icon: "fas fa-file-powerpoint",
      path: "/dashboard/{roleSlug}/presentations",
    },
        {
      title: "Catalogs",
      icon: "fas fa-building",
      path: "/dashboard/{roleSlug}/agent-projects",
    },
    MORTGAGE_CALCULATOR_LINK,
        {
      title: "Leaderboard",
      icon: "fas fa-users",
      path: "/dashboard/{roleSlug}/Leaderboard",
    },
// {
//   title: "Training",
//   icon: "fas fa-chalkboard-teacher",
//   path: "/dashboard/{roleSlug}/Training",
// },
{
  title: "My Agreements",
  icon: "fas fa-chalkboard-teacher",
  path: "/dashboard/{roleSlug}/agent-agreement",
},




  ],
  "10": [],
  "17": [
    {
      title: "Projects",
      icon: "fas fa-building",
      path: "/dashboard/{roleSlug}/developer-properties"
    },
    //   {
    //   title: "Global Projects",
    //   icon: "fas fa-building",
    //   path: "/dashboard/{roleSlug}/property-list"
    // },
    {
      title: "Listings",
      icon: "fas fa-layer-group",
      path: "/dashboard/{roleSlug}/developer-inventory",
    },
    {
      title: "Agreements",
      icon: "fas fa-file",
      path: "/dashboard/{roleSlug}/developer-agreement",
    },

  ],
  "15": [
    {
      title: "Agent Team",
      icon: "fas fa-user-friends",
      path: "/dashboard/{roleSlug}/all-agents",
    },
    {
      title: "Leads",
      icon: "fas fa-users",
      path: "/dashboard/{roleSlug}/lead-management",
    },
    {
      title: "Commission",
      icon: "fas fa-dollar-sign",
      path: "/dashboard/{roleSlug}/partner/deals",
    },
    {
      title: "Leaderboard",
      icon: "fas fa-trophy",
      path: "/dashboard/{roleSlug}/agency-leaderboard",
    },
    {
      title: "Agreement",
      icon: "fas fa-file",
      path: "/dashboard/{roleSlug}/agency-agreements",
    },
  ],

  "18": [
    {
      title: "Agents",
      icon: "fas fa-users",
      path: "/dashboard/{roleSlug}/agents",
      submenus: [
        { title: "Onboard Agent", path: "/dashboard/{roleSlug}/agent-onboard" },
        { title: "All Agents", path: "/dashboard/{roleSlug}/vault/agent-list" },
      ],
    },
    {
      title: "Leads",
      icon: "fas fa-users",
      path: "/dashboard/{roleSlug}/leads",
      submenus: [
        { title: "Leads", path: "/dashboard/{roleSlug}/vault/agent-leads" },
      ],
    },
 {
  title: "Advisors",
  icon: "fas fa-user-tie",
  path: "/dashboard/{roleSlug}/advisor",  // parent path (optional)
  submenus: [
    { 
      title: "Create Advisor", 
      path: "/dashboard/{roleSlug}/create/vault-advisor" 
    },
    { 
      title: "All Advisors", 
      path: "/dashboard/{roleSlug}/advisor/list" 
    },
    { 
      title: "Leaderboard", 
      path: "/dashboard/{roleSlug}/advisors/leaderboard" 
    },
  ],
},
 {
  title: "Mortgages",
  icon: "fas fa-file-invoice-dollar",   // ✅ Distinct icon
  path: "/dashboard/{roleSlug}/mortgage-ops",
  submenus: [
    { 
      title: "Create Mortgage", 
      path: "/dashboard/{roleSlug}/mortgage-ops/create" 
    },
    { 
      title: "All Mortgages", 
      path: "/dashboard/{roleSlug}/mortgage-ops/list" 
    },
  ],
},
   
    {
      title: "Propersals",
      icon: "fas fa-folder-open",
      path: "/dashboard/{roleSlug}/cases",
      submenus: [
        { title: "Create Proposals", path: "/dashboard/{roleSlug}/proposals/create" },
        { title: "View Proposals", path: "/dashboard/{roleSlug}/proposals/view" },
        // { title: "Disbursed", path: "/dashboard/{roleSlug}/cases/disbursed" },
      ],

    },

       
    {
      title: "Case",
      icon: "fas fa-folder-open",
      path: "/dashboard/{roleSlug}/cases",
      submenus: [
        { title: "Create Cases", path: "/dashboard/{roleSlug}/case/create" },
        { title: "View Cases", path: "/dashboard/{roleSlug}/case/view" },
                { title: "Process Cases", path: "/dashboard/{roleSlug}/case/view/all" },
                { title: "Manage Cases", path: "/dashboard/{roleSlug}/case/manage" },

        // { title: "Disbursed", path: "/dashboard/{roleSlug}/cases/disbursed" },
      ],

    },
    {
      
      title: "Vault Partners",
      icon: "fas fa-handshake",
      path: "/dashboard/{roleSlug}/partners",
      submenus: [
        { title: "Onboard Partner", path: "/dashboard/{roleSlug}/partners" }, // handle query param in component
        { title: "All Partners", path: "/dashboard/{roleSlug}/partner-list" }
      ]
    },

    
    {
      title: "Bank Library",
      icon: "fas fa-university",
      path: "/dashboard/{roleSlug}/bank/products",
    }
  ],
  "22": [
    {
    title: "Leads",   
    icon: "fas fa-users",
    path: "/dashboard/{roleSlug}/leads",
    submenus: [
      {
        title: "Create Leads",
        path: "/dashboard/{roleSlug}/leads/create"
      },
      {
  title: "My  Leads",
  path: "/dashboard/{roleSlug}/leads" 
}
    ]
  }
    ,
    MORTGAGE_CALCULATOR_LINK,
  ],
"21": [
    {
    title: "Create Lead",
    icon: "fas fa-plus-circle",
    path: "/dashboard/{roleSlug}/leads/partner/create",
    // no submenu – direct link
  },
  {
    title: "Vault Partners",
    icon: "fas fa-users",
    path: "/dashboard/{roleSlug}/vaultpartner",
    submenus: [
      { title: "Onboard Agent", path: "/dashboard/{roleSlug}/onboard-partner" },
      { title: "All Agents", path: "/dashboard/{roleSlug}/AgentVaultlisting" },
    ],
  },
  {
      title: "Bank Library",
      icon: "fas fa-university",
      path: "/dashboard/{roleSlug}/bank/products",
    },
   
  {
    title: "All Leads",
    icon: "fas fa-file-alt",
    path: "/dashboard/{roleSlug}/partner-leads",
  },
{
      title: "Propersals",
      icon: "fas fa-folder-open",
      path: "/dashboard/{roleSlug}/cases",
      submenus: [
        { title: "Create Proposals", path: "/dashboard/{roleSlug}/proposals/create" },
        { title: "View Proposals", path: "/dashboard/{roleSlug}/proposals/view" },
        // { title: "Disbursed", path: "/dashboard/{roleSlug}/cases/disbursed" },
      ],

    },
     {
      title: "Case",
      icon: "fas fa-folder-open",
      path: "/dashboard/{roleSlug}/cases",
      submenus: [
        { title: "Create Cases", path: "/dashboard/{roleSlug}/case/create" },
        { title: "View Cases", path: "/dashboard/{roleSlug}/case/view" },
                { title: "Process Cases", path: "/dashboard/{roleSlug}/case/view/all" },

        // { title: "Disbursed", path: "/dashboard/{roleSlug}/cases/disbursed" },
      ],

    },
],
'24': [
  {
    title: "My Leads",
    icon: "fas fa-users",
    path: "/dashboard/{roleSlug}/gridAdvisorLeads",
  },
  {
    title: "Property Catalogue",
    icon: "fas fa-building",
    path: "/dashboard/{roleSlug}/property-catalogue",
  },
  {
    title: "My Presentations",
    icon: "fas fa-file-powerpoint",
    path: "/dashboard/{roleSlug}/presentations",
  },
  MORTGAGE_CALCULATOR_LINK,
],
// Baaki purane roles ke neeche ye paste karo:
  "25": [
    {
      title: "Referrals",
      icon: "fas fa-users",
      path: "/dashboard/{roleSlug}/referrals",
      submenus: [
        { 
          title: "Submit Lead", 
          path: "/dashboard/{roleSlug}/submit-leads" 
        },
        { 
          title: "My Referrals", 
          path: "/dashboard/{roleSlug}/total-leads" 
        },

      ]
    },
    {
      title: "Leaderboard",
      icon: "fas fa-trophy",
      path: "/dashboard/{roleSlug}/referral-leaderboard"
    },
  ],

"26": [
  {
    title: "My Leads",
    icon : "fas fa-file-alt",
    path : "/dashboard/{roleSlug}/leads",  
  },
   {
      title: "Proposals",
      icon: "fas fa-folder-open",
      path: "/dashboard/{roleSlug}/cases",
      submenus: [
        { title: "Create Proposals", path: "/dashboard/{roleSlug}/proposals/create" },
        { title: "View Proposals", path: "/dashboard/{roleSlug}/proposals/view" },
        // { title: "Disbursed", path: "/dashboard/{roleSlug}/cases/disbursed" },
      ],

    },

       
    {
      title: "Case",
      icon: "fas fa-folder-open",
      path: "/dashboard/{roleSlug}/cases",
      submenus: [
        { title: "Create Cases", path: "/dashboard/{roleSlug}/case/create" },
        { title: "View Cases", path: "/dashboard/{roleSlug}/case/view" },
                { title: "Process Cases", path: "/dashboard/{roleSlug}/case/view/all" },

        // { title: "Disbursed", path: "/dashboard/{roleSlug}/cases/disbursed" },
      ],

    },
],
"23": [
   
    {
      title: "Case",
      icon: "fas fa-folder-open",
      path: "/dashboard/{roleSlug}/cases",
      submenus: [
        { title: "Queue Cases", path: "/dashboard/{roleSlug}/case/queue/view" },
                { title: "My Assigned Cases", path: "/dashboard/{roleSlug}/case/assigned/all" },

        { title: "Disbursed Cases", path: "/dashboard/{roleSlug}/case/disbursed" },
      ],

    },
],


// "23": [
//   {
//     title: "Mortgage Cases",
//     icon: "fas fa-file-invoice-dollar",   // same icon as mortgage, or use fas fa-gavel
//     path: "/dashboard/{roleSlug}/mortgage-ops",
//     submenus: [
//       {
//         title: "All Cases",
//         path: "/dashboard/{roleSlug}/mortgage-ops/case/:caseId"
//       },
//       // Optional: Add a direct case detail link if needed, but usually you'd navigate from the list.
//     ]
//   } 
// ],



};


const roleSlugMap = {
  '0': 'superadmin',
  '1': 'admin',
  '2': "customer",
  '5': 'vendor-b2c',
  '6': 'vendor-b2b',
  '7': 'freelancer',
  '11': 'accountant',
  '12': 'supervisor',
  '15': "agency",        // Agency
  '16': "agent",         // Agent
  '17': "developer",
  '18': "vault-admin", //vault
  '22': "vaultagent",
  '21': "vaultpartner",
  '24': "GridAdvisor",
  // '23': "vault-advisor",
  // '26': "vault-ops",
  // '26': "vault-advisor",
  '23': "vault-ops",
  '25': "gridreferralpartner",
  '26': "vault-advisor",
  // '23': "vault-ops",
  
  
   
 

};

const ROLE_MODULE_ORDER = {
  '0': ['Dashboard', "All Estimation", "Deals", 'Xoto Partners', 'Projects', 'Customers', 'Packages', 'Estimate master', 'Consultation Bookings', 'All Users', 'Products', 'Seller B2C', 'Request', 'Payout', 'Module', 'properties', 'Permission', 'Role', 'Inventory', 'Settings'],
  '1': ['Dashboard', 'Grid Admin'],
  '5': ['Dashboard', 'Products', 'My Products', 'Inventory', 'Orders', 'Payout', 'Settings'],
  '6': ['Dashboard', 'Products', 'Projects', 'Inventory', 'Payout'],
  '7': ['Dashboard', 'My Projects', 'All Projects', 'Add Projects', 'Payout'],
  '17': ['Dashboard', 'Properties', 'Inventory', 'Analytics'],
  '11': ['Dashboard', 'All accountant', 'Requested Projects', 'Payout'],
  '12': ['Dashboard', 'All accountant', 'Requested Projects', 'Payout'],
  '16': ['Dashboard', 'AgentLead Management'],
  '15': ['Dashboard','Agent Team', 'Leads', 'Commission', 'Leaderboard'],
  '18': ['Dashboard', 'Clients', 'Cases', 'Commission', 'Bank Library', 'Reports', 'Partners', 'Advisors', 'Mortgages'],
  '22': ['Dashboard', 'Clients', 'Referrals', 'Commission', 'Calculator', 'Leaderboard','Leads'],
  // '21': ['Dashboard', 'Vault Partners', 'All Leads'],

  '25':['Dashboard' , 'Referrals', 'Leaderboard', 'Profile'],
  '21': ['Dashboard','Create Lead',  'Vault Partners', 'All Leads',],
  '24': ['Dashboard', 'My Leads', 'Property Catalogue', 'My Presentations', 'Calculator', 'Leaderboard'],
  // '25': ['Dashboard', 'Referrals', 'Earnings', 'Profile'],
    '26': ['Dashboard', 'All Leads','Case','Proposals'],
    '23': ['Dashboard', 'Mortgage Cases'], 
};


const Sidebar = () => {
  const {
    sidebarCollapsed,
    mobileSidebarCollapsed,
    toggleMobileSidebar,
    setMobileSidebarCollapsed
  } = useCmsContext();

  const location = useLocation();
  const { freelancer } = useFreelancer();
  const { user, token, permissions } = useSelector((s) => s.auth);
  const [openModule, setOpenModule] = useState(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!mobileSidebarCollapsed) {
      setMobileSidebarCollapsed(true);
    }
  }, [location.pathname, setMobileSidebarCollapsed]);

  // --- ROLE DETECTION LOGIC ---
  let roleCode = '0';
  let displayRoleName = 'User';

  if (user && user.role) {
    if (typeof user.role === 'string') {
      roleCode = user.role;
      displayRoleName = user.role;
    } else {
      roleCode = user.role.code ? user.role.code.toString() : '0';
      displayRoleName = user.role.name || 'User';
    }
  }

  if (roleCode === '15') {
    displayRoleName = 'Partner';
  }



  const roleSlug = roleSlugMap[roleCode] ?? 'dashboard';
  const basePath = `/dashboard/${roleSlug}`;
const [partnerCategory, setPartnerCategory] = useState(null);

useEffect(() => {
  if (roleCode !== '21' || !token) return;

  const loadPartnerProfile = async () => {
    try {
      const response = await apiService.get('/profile/get-profile-data');

       

      const category = response?.data?.partnerCategory
        ?.toString()
        .trim()
        .toLowerCase();
      
      setPartnerCategory(category || null);
    } catch (error) {
      console.error('partner profile fetch failed:', error);
      setPartnerCategory(null);
    }
  };

  loadPartnerProfile();
}, [roleCode, token]);

  const isFreelancer = roleCode === '7';
  const isPendingApproval = isFreelancer && freelancer && freelancer.status_info?.status !== 1;

  const navTree = useMemo(() => {
    const tree = [{ title: 'Dashboard', icon: 'fas fa-home', to: basePath, exact: true, submenus: [] }];
    if (isPendingApproval) return tree;

    const modulesMap = {};

    // 1. Dynamic Permissions from Backend
    Object.entries(permissions ?? {}).forEach(([key, p]) => {
      if (!p?.canView || !p?.route) return;
      const [module, sub] = key.split('→').map(s => s.trim());
      const fullPath = `${basePath}/${p.route.replace(/^\/+/, '')}`;
      if (!modulesMap[module]) {
        modulesMap[module] = { title: module, icon: p.icon || 'fas fa-cube', to: null, submenus: [] };
      }
      if (!sub) modulesMap[module].to = fullPath;
      else modulesMap[module].submenus.push({ title: sub, to: fullPath, icon: p.icon || 'fas fa-circle' });
    });

    // 2. Custom Links
    const customLinks = CUSTOM_ROLE_LINKS[roleCode] || [];
    customLinks.forEach(link => {
      const processedPath = link.path.replace('{roleSlug}', roleSlug);
      const processedSubmenus = link.submenus?.map(sub => ({
        ...sub,
        to: sub.path.replace('{roleSlug}', roleSlug)
      })) || [];

      modulesMap[link.title] = {
        title: link.title,
        icon: link.icon,
        to: link.submenus ? null : processedPath,
        submenus: processedSubmenus
      };
    });
if (roleCode === '21' && partnerCategory !== 'individual') {
  delete modulesMap['Create Lead'];
}
 if (partnerCategory === 'individual') {
    delete modulesMap['Vault Partners'];
  }

    // 3. Sorting
    const ordered = [];
    const customOrder = ROLE_MODULE_ORDER[roleCode] || [];
    customOrder.forEach(t => {
      if (modulesMap[t]) {
        ordered.push(modulesMap[t]);
        delete modulesMap[t];
      }
    });

    // ordered.push(...Object.values(modulesMap));
    // return [...tree, ...ordered];
    const HIDE_MODULES = ['Permission'];

    ordered.push(
      ...Object.values(modulesMap).filter(
        m => !HIDE_MODULES.includes(m.title)
      )
    );

    return [...tree, ...ordered.filter(
      m => !HIDE_MODULES.includes(m.title)
    )];
  },  [permissions, basePath, isPendingApproval, roleCode, user, token, roleSlug, partnerCategory]);

  // --- RENDER ---
  const toggleModule = (mod) => setOpenModule(openModule === mod ? null : mod);
  const isParentActive = (item) => item.submenus && item.submenus.some(s => location.pathname.startsWith(s.to));
  const handleNavClick = () => !mobileSidebarCollapsed && setMobileSidebarCollapsed(true);

  const mobileOpen = !mobileSidebarCollapsed;
  const sidebarClasses = `
    fixed top-0 left-0 h-full z-50 flex flex-col
    bg-gradient-to-b from-[#1a0b2e] via-[#2a1247] to-[#14051f]
    border-r border-purple-800/40 shadow-2xl
    transition-all duration-300 ease-in-out overflow-hidden
    ${mobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'}
    ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
  `;
const isVaultRole = ['18', '21', '22', '23', '26'].includes(roleCode);

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileSidebarCollapsed(true)} />
      )}

      <aside ref={sidebarRef} className={sidebarClasses}>
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        <div className={`flex items-center p-4 border-b border-purple-800/50 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex flex-col items-center gap-3 flex-1 overflow-hidden">
            <div className="flex flex-col items-center flex-shrink-0">
             <img
  src={
    sidebarCollapsed
      ? favicon
      : isVaultRole
        ? vault
        : logoNew
  }
  alt="Logo"
  className={`transition-all duration-300 ${
    sidebarCollapsed ? 'h-10 w-10' : 'h-10 sm:h-12 lg:h-16 w-auto'
  }`}
/>
              {!sidebarCollapsed && (
                <span className="text-white text-[8px] sm:text-[10px] whitespace-nowrap mt-1">
                  Powered by AI. Inspired by you.
                </span>
              )}
            </div>

            {!sidebarCollapsed && (
              <div className="text-center">
                <div className="text-xs uppercase tracking-widest text-purple-300/80">Welcome</div>
                <div className="text-sm font-bold text-purple-200 capitalize">{displayRoleName}</div>
                  {roleCode === '21' && partnerCategory && (
    <div className="text-[11px] mt-1 px-2 py-[2px] rounded-full bg-purple-700/40 text-purple-200 capitalize inline-block">
      {partnerCategory}
    </div>
  )}
              </div>
            )}
          </div>

          {mobileOpen && (
            <button onClick={toggleMobileSidebar} className="p-2 text-purple-300 hover:text-white lg:hidden">
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
          {navTree.map((item) => {
            const hasSub = item.submenus && item.submenus.length > 0;
            const active = location.pathname === item.to || (hasSub && isParentActive(item));
            const expanded = openModule === item.title;

            return (
              <div key={item.title}>
                {!hasSub ? (
                  <NavLink
                    to={item.to}
                    onClick={handleNavClick}
                    title={sidebarCollapsed ? item.title : ""}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${isActive ? 'bg-purple-600/50 text-white shadow-lg' : 'text-purple-300 hover:bg-purple-800/30'}
                      ${sidebarCollapsed ? 'justify-center px-0' : ''}
                    `}
                  >
                    <i className={`${item.icon} w-5 text-center`} />
                    {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                  </NavLink>
                ) : (
                  <div>
                    <button
                      onClick={() => toggleModule(item.title)}
                      title={sidebarCollapsed ? item.title : ""}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium
                        ${active || expanded ? 'text-white bg-purple-800/30' : 'text-purple-300 hover:bg-purple-800/20'}
                        ${sidebarCollapsed ? 'justify-center px-0' : ''}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <i className={`${item.icon} w-5 text-center`} />
                        {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                      </div>
                      {!sidebarCollapsed && <FiChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />}
                    </button>
                    {expanded && !sidebarCollapsed && (
                      <div className="mt-1 ml-8 space-y-1 border-l border-purple-700/30 pl-4">
                        {item.submenus.map(sub => (
                          <NavLink key={sub.to} to={sub.to} onClick={handleNavClick}
                            className={({ isActive }) => `block py-2 px-3 rounded-lg text-sm ${isActive ? 'text-purple-100' : 'text-purple-300 hover:text-white'}`}
                          >
                            {sub.title}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-purple-900/40 text-center text-xs text-purple-400">
          {!sidebarCollapsed ? <span>v2.0.0</span> : <span title="Version 2.0.0">v2</span>}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
