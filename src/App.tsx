import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import DashboardLayout from './components/layout/DashboardLayout';
import GridLogin from './pages/login/VaultLogin';
import AuthCallback from './pages/login/AuthCallback';
import PrivateRoute, { RoleRedirect } from './auth/PrivateRoute';

// ── Lazy-load grid components ──────────────────────────────────
// Role 1 - Grid Admin
const AdminDashboard = lazy(() => import('./components/CMS/pages/AdminDashboard'));
const Propertymanagement = lazy(() => import('./components/CMS/pages/Properties/Propertymanagement'));
const ApprovalQueue = lazy(() => import('./components/CMS/pages/Properties/ApprovalQueue'));
const EditReviewQueue = lazy(() => import('./components/CMS/pages/Properties/EditReviewQueue'));
const CreateRentalProperty = lazy(() => import('./component/Rent/Createrentalproperty'));
const Agentdetail = lazy(() => import('./components/CMS/pages/Properties/Agentdetail'));
const AgencyAgentProperties = lazy(() => import('./components/CMS/pages/Properties/AgencyAgentProperties'));
const CreateSecondaryProperty = lazy(() => import('./components/CMS/pages/Properties/CreateSecondaryProperty'));
const SecondaryPlans = lazy(() => import('./components/CMS/pages/Properties/SecondaryPlans'));
const Secondarypropertydetail = lazy(() => import('./components/CMS/pages/Properties/Secondarypropertydetail'));
const Developerdetail = lazy(() => import('./components/CMS/pages/Developerdetail'));
const Adminpropertydetails = lazy(() => import('./components/CMS/pages/Adminpropertydetails'));
const AdminPropertyGrid = lazy(() => import('./components/CMS/pages/AdminPropertyGrid'));
const Propertydetailpage = lazy(() => import('./components/CMS/pages/Propertydetailpage'));
const Adminpropertylistings = lazy(() => import('./components/CMS/pages/Adminpropertylistings'));
const Adminoffplancreate = lazy(() => import('./components/CMS/pages/Adminoffplancreate'));
const PropertyDetailPage = Propertydetailpage;
const AllgridLeads = lazy(() => import('./components/Grid/GridAdmin/AllgridLeads'));
const PlatformLeads = lazy(() => import('./components/Grid/GridAdmin/PlatformLeads'));
const AgentLeads = lazy(() => import('./components/Grid/GridAdmin/AgentLeads'));
const GeneralLeads = lazy(() => import('./components/Grid/GridAdmin/GeneralLeads'));
const ReferralLeads = lazy(() => import('./components/Grid/GridAdmin/ReferralLeads'));
const GridAgentLeadDetailadmin = lazy(() => import('./components/Grid/GridAdmin/GridAgentLeadDetailadmin'));
const VaultLeadDetails = lazy(() => import('./components/ecommerce/B2C/VaultLeadDetails'));
const OnBoardingAgency = lazy(() => import('./components/CMS/pages/dashboardPages/OnBoardingAgency'));
const AgencyList = lazy(() => import('./components/CMS/pages/Properties/AgencyList'));
const DeveloperList = lazy(() => import('./components/CMS/pages/DeveloperList'));
const DeveloperForm = lazy(() => import('./components/CMS/pages/dashboardPages/DeveloperForm'));
const AgentList = lazy(() => import('./components/CMS/pages/Properties/AgentList'));
const AllAdvisors = lazy(() => import('./components/Grid/GridAdmin/Alladvisors'));
const GridCreateadvisor = lazy(() => import('./components/Grid/GridAdmin/GridCreateadvisor'));
const Advisordetail = lazy(() => import('./components/Grid/GridAdmin/Advisordetail'));
const AdvisorLeaderboard = lazy(() => import('./components/Grid/GridAdmin/AdvisorLeaderboard'));
const CreateOffplan = lazy(() => import('./components/Grid/GridAdmin/CreateOffplan'));
const CommissionDashboard = lazy(() => import('./components/Grid/GridAdmin/CommissionDashboard'));
const AddGeneralleads = lazy(() => import('./components/Grid/GridAdmin/AddGeneralleads'));
const AllUsers = lazy(() => import('./components/Grid/GridAdmin/AllUsers'));
const AllReferralPartners = lazy(() => import('./components/GridReferralPartner/Admin/AllReferralPartners'));
const ReferralPartnerDetail = lazy(() => import('./components/GridReferralPartner/Admin/ReferralPartnerDetail'));
const GridNotification = lazy(() => import('./components/Grid/GridAdmin/GridNotification'));
const ReferralPartnerLeaderboard = lazy(() => import('./components/GridReferralPartner/GridDashboardpages/ReferralPartnerLeaderboard'));
const Dealrecordspage = lazy(() => import('./components/Grid/GridAdmin/Dealrecordspage'));
const DealRecordDetailPage = lazy(() => import('./components/Grid/GridAdmin/Dealrecorddetailpage'));
const AdminAgreements = lazy(() => import('./components/Grid/GridAdmin/Agreement'));

// Grid Analytics Pages
const GridOverview = lazy(() => import('./components/Grid/GridAdmin/GridOverview'));
const GridLeadReports = lazy(() => import('./components/Grid/GridAdmin/GridLeadreports'));
const GridListingReports = lazy(() => import('./components/Grid/GridAdmin/GridListingreports'));
const GridSetting = lazy(() => import('./components/Grid/GridAdmin/GridSetting'));
const PropertyDocumentLibrary = lazy(() => import('./components/Grid/GridAdmin/PropertyDocumentLibrary'));

// Role 15 - Agency
const AgencyDashboard = lazy(() => import('./components/ecommerce/B2C/AgencyDashboard'));
const AllAgents = lazy(() => import('./components/Grid/grid agency/AllAgents'));
const LeadManagement = lazy(() => import('./components/CMS/pages/LeadManagement'));
const AgencyLeadDetailsPage = lazy(() => import('./components/CMS/pages/AgencyLeadDetailsPage'));
const AgencyDealsPage = lazy(() => import('./components/Grid/grid agency/Agencydealspage'));
const AgencyLeaderboard = lazy(() => import('./components/ecommerce/B2C/AgencyLeaderboard'));
const Agreementagency = lazy(() => import('./components/Grid/grid agency/Agreementagency'));
const AgentCreate = lazy(() => import('./components/Grid/grid agency/AgentCreate'));

// Role 16 - Grid Agent
const AgentDashboard = lazy(() => import('./components/ecommerce/B2C/AgentDashboard'));
const AgentProjects = lazy(() => import('./components/Grid/GridAgent/AgentProjects'));
const AgentProjectDetails = lazy(() => import('./components/Grid/GridAgent/AgentProjectDetails'));
const GridAgentLead = lazy(() => import('./components/Grid/GridAgent/GridAgentLead'));
const CreateAgentLead = lazy(() => import('./components/Grid/GridAgent/CreateAgentLead'));
const GridAgentLeadDetail = lazy(() => import('./components/Grid/GridAgent/GridAgentLeadDetail'));
const PresentationsList = lazy(() => import('./components/Grid/presentation/PresentationsList'));
const AgentLeaderboard = lazy(() => import('./components/ecommerce/B2C/AgentLeaderboard'));
const Agreementagent = lazy(() => import('./components/Grid/GridAgent/Agreementagent'));
const Addleaddetails = lazy(() => import('./components/ecommerce/B2C/AgentLeadDetails'));
const AgentDeals = lazy(() => import('./components/ecommerce/B2C/AgentDeals'));
const AgentCreateDeal = lazy(() => import('./components/ecommerce/B2C/AgentCreateDeal'));
const AgentDealDetails = lazy(() => import('./components/ecommerce/B2C/AgentDealDetails'));
const AgentSiteVisits = lazy(() => import('./components/ecommerce/B2C/AgentSiteVisits'));
const AgentCreateVisit = lazy(() => import('./components/ecommerce/B2C/AgentCreateVisit'));
const AgentSiteVisitDetails = lazy(() => import('./components/ecommerce/B2C/AgentSiteVisitDetails'));
const AgentCommission = lazy(() => import('./components/ecommerce/B2C/AgentCommission'));
const AgentCommissionDetails = lazy(() => import('./components/ecommerce/B2C/AgentCommissionDetails'));
const AgentSubscription = lazy(() => import('./components/ecommerce/B2C/AgentSubscription'));

// Role 17 - Developer
const DeveloperDashboard = lazy(() => import('./components/ecommerce/B2C/DeveloperDashboard'));
const DeveloperProjects = lazy(() => import('./components/ecommerce/B2C/DeveloperProjects'));
const DeveloperProjectDetails = lazy(() => import('./components/ecommerce/B2C/DeveloperProjectDetails'));
const DeveloperInventory = lazy(() => import('./components/ecommerce/B2C/DeveloperInventory'));
const DeveloperLeads = lazy(() => import('./components/ecommerce/B2C/DeveloperLeads'));
const DeveloperLeadDetails = lazy(() => import('./components/ecommerce/B2C/DeveloperLeadDetails'));
const DeveloperCreateBooking = lazy(() => import('./components/ecommerce/B2C/DeveloperCreateBooking'));
const DeveloperBookings = lazy(() => import('./components/ecommerce/B2C/DeveloperBookings'));
const DeveloperBookingDetails = lazy(() => import('./components/ecommerce/B2C/DeveloperBookingDetails'));
const DeveloperRevenue = lazy(() => import('./components/ecommerce/B2C/DeveloperRevenue'));
const DeveloperAnalytics = lazy(() => import('./components/ecommerce/B2C/DeveloperAnalytics'));
const DeveloperCommissionScheme = lazy(() => import('./components/ecommerce/B2C/DeveloperCommisionScheme'));
const DeveloperAddProperty = lazy(() => import('./components/ecommerce/B2C/DeveloperAddProperty'));
const DeveloperEditProperty = lazy(() => import('./components/ecommerce/B2C/DeveloperEditProperty'));
const DeveloperDocumentLibrary = lazy(() => import('./components/ecommerce/B2C/DeveloperDocumentLibrary'));
const Agreementdeveloper = lazy(() => import('./components/Grid/DeveloperGrid/Agreementdeveloper'));

// Role 24 - Grid Advisor
const GridAdvisorDashboard = lazy(() => import('./components/CMS/pages/GridAdvisorDashboard'));
const AdvisorLeadsPage = lazy(() => import('./components/Grid/AdvisorGrid/Advisorleadspage'));
const AdvisorLeaderboardPage = lazy(() => import('./components/Grid/AdvisorGrid/AdvisorLeaderboard'));
const GridAdvisorLeadDetail = lazy(() => import('./components/Grid/AdvisorGrid/GridAdvisorLeadDetail'));
const PropertyCatalogue = lazy(() => import('./components/Grid/AdvisorGrid/Propertycatalogue'));
const FavouriteProperty = lazy(() => import('./components/Grid/Fav Property/FavouriteProperty'));

// Profile Pages
const AdminProfile = lazy(() => import('./components/CMS/pages/dashboardPages/Profiles/AdminProfile'));
const AgencyProfile = lazy(() => import('./components/CMS/pages/dashboardPages/Profiles/AgencyProfile'));
const AgentProfile = lazy(() => import('./components/CMS/pages/dashboardPages/Profiles/AgentProfile'));
const DeveloperProfile = lazy(() => import('./components/CMS/pages/dashboardPages/Profiles/DeveloperProfile'));
const GridAdvisorProfile = lazy(() => import('./components/CMS/pages/dashboardPages/Profiles/GridAdvisorProfile'));

// Role 25 - Grid Referral Partner
const ReferralPartnerDashboard = lazy(() => import('./components/CMS/pages/ReferralPartnerDashboard'));
const ActiveLeads = lazy(() => import('./components/GridReferralPartner/GridDashboardpages/CreateReferralLead'));
const TotalLeads = lazy(() => import('./components/GridReferralPartner/GridDashboardpages/TotalLeads'));
const RecentLeads = lazy(() => import('./components/GridReferralPartner/GridDashboardpages/RecentLeads'));
const ReferralPartnerProfile = lazy(() => import('./components/GridReferralPartner/ReferralPartnerProfile'));
const ReferralPartnerLeadDetail = lazy(() => import('./components/GridReferralPartner/GridDashboardpages/ReferralPartnerLeadDetail'));

// Mortgage Calculator Components
const PerfectMortgageCalculator = lazy(() => import("./components/homepage/MortgageCalculator"));
const MortgageEligibilityCalculatorPage = lazy(() => import("./components/homepage/MortgageEligibilityCalculatorPage"));
const MortgageAffordabilityCalculatorPage = lazy(() => import("./components/homepage/MortgageAffordabilityCalculatorPage"));


const PageLoader = () => (
  <div className="flex items-center justify-center py-24">
    <Spin size="large" />
  </div>
);

const Unauthorized: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
    <div className="w-20 h-20 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
      <i className="fas fa-lock text-3xl text-red-500" />
    </div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
    <p className="text-gray-500 mb-6">You do not have permission to access this area.</p>
    <a href="/login" className="px-6 py-3 rounded-xl text-white font-semibold"
      style={{ background: 'linear-gradient(135deg, #5C039B, #03A4F4)' }}>
      Back to Login
    </a>
  </div>
);

const App: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    
    <Routes>
      {/* ── Public ── */}
      <Route path="/login" element={<GridLogin />} />
              <Route path="/grid/login" element={<GridLogin />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* ══════════════ GRID ADMIN (role 1) ══════════════ */}
      <Route path="/dashboard/admin/*"
        element={<PrivateRoute allowedRoleCodes={['1']}><DashboardLayout /></PrivateRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="property-management" element={<Propertymanagement />} />
        <Route path="listings/approval-queue" element={<ApprovalQueue />} />
        <Route path="listings/edit-review-queue" element={<EditReviewQueue />} />
        <Route path="rental/properties" element={<CreateRentalProperty />} />
        <Route path="rental/properties/edit/:id" element={<CreateRentalProperty />} />
        <Route path="rental/properties/:id" element={<Propertydetailpage />} />
        <Route path="property-grid" element={<AdminPropertyGrid />} />
        <Route path="property-listings" element={<Adminpropertylistings />} />
        <Route path="properties/:id" element={<Adminpropertydetails />} />
        <Route path="properties/create" element={<Adminoffplancreate />} />
        <Route path="properties/edit/:id" element={<Adminoffplancreate />} />
        {/* Property View with Role Slug Pattern */}
        <Route path="property/view/:id" element={<PropertyDetailPage />} />
        <Route path="secondary-properties" element={<CreateSecondaryProperty />} />
        <Route path="secondary-properties/edit/:id" element={<CreateSecondaryProperty />} />
        <Route path="secondary-properties/:id" element={<Secondarypropertydetail />} />
        <Route path="secondary-plans" element={<SecondaryPlans />} />
        <Route path="grid/AllgridLeads" element={<AllgridLeads />} />
        <Route path="GridAdmin/propertyleads" element={<PlatformLeads />} />
        <Route path="grid/agentleads" element={<AgentLeads />} />
        <Route path="grid/generalleads" element={<GeneralLeads />} />
        <Route path="grid/allusers" element={<AllUsers />} />
        <Route path="grid/referralleads" element={<ReferralLeads />} />
        <Route path="onboarding/agency" element={<OnBoardingAgency />} />
        <Route path="agency-list" element={<AgencyList />} />
        <Route path="agency-agent-properties" element={<AgencyAgentProperties />} />
        <Route path="developer-list" element={<DeveloperList />} />
        <Route path="developers/:id" element={<Developerdetail />} />
        <Route path="onboarding/developer" element={<DeveloperForm />} />
        <Route path="agent-list" element={<AgentList />} />
        <Route path="agents/:id" element={<Agentdetail />} />
        <Route path="advisors" element={<AllAdvisors />} />
        <Route path="advisor/create" element={<GridCreateadvisor />} />
        <Route path="advisors/:id" element={<Advisordetail />} />
        <Route path="advisor-leaderboard" element={<AdvisorLeaderboard />} />
        <Route path="commission-dashboard" element={<CommissionDashboard />} />
        <Route path="create-offplan" element={<CreateOffplan />} />
        <Route path="add-generalleads" element={<AddGeneralleads />} />
        <Route path="grid/addgeneralleads" element={<AddGeneralleads />} />
        <Route path="grid/agent-leads/:id" element={<GridAgentLeadDetailadmin />} />
        {/* Lead Detail Page for Admin */}
        <Route path="lead-detail-admin/:id" element={<GridAgentLeadDetailadmin />} />
        <Route path="referral-partners" element={<AllReferralPartners />} />
        <Route path="referral-partners/:id" element={<ReferralPartnerDetail />} />
        <Route path="referral-leaderboard" element={<ReferralPartnerLeaderboard />} />
        <Route path="deal-records" element={<Dealrecordspage />} />
        <Route path="deal-records/create/:leadId" element={<Dealrecordspage />} />
        <Route path="deal-records/:dealId" element={<DealRecordDetailPage />} />
        <Route path="admin/agreements" element={<AdminAgreements />} />
        <Route path="gridnotification" element={<GridNotification />} />
        <Route path="overview" element={<GridOverview />} />
        <Route path="leadreports" element={<GridLeadReports />} />
        <Route path="listingreports" element={<GridListingReports />} />
        <Route path="setting" element={<GridSetting />} />
        <Route path="properties/:id/documents" element={<PropertyDocumentLibrary />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="*" element={<Navigate to="/dashboard/admin" replace />} />
      </Route>

      {/* ══════════════ GRID AGENCY (role 15) ══════════════ */}
      <Route path="/dashboard/agency/*"
        element={<PrivateRoute allowedRoleCodes={['15']}><DashboardLayout /></PrivateRoute>}>
        <Route index element={<AgencyDashboard />} />
        <Route path="all-agents" element={<AllAgents />} />
        <Route path="all-agents/create" element={<AgentCreate />} />
        <Route path="lead-management" element={<LeadManagement />} />
        <Route path="lead-management/:id" element={<AgencyLeadDetailsPage />} />
        <Route path="lead-detail/:id" element={<VaultLeadDetails />} />
        <Route path="partner/deals" element={<AgencyDealsPage />} />
        <Route path="agency-leaderboard" element={<AgencyLeaderboard />} />
        <Route path="agency-agreements" element={<Agreementagency />} />
        <Route path="property/view/:id" element={<PropertyDetailPage />} />
        <Route path="profile" element={<AgencyProfile />} />
        <Route path="gridnotification" element={<GridNotification />} />
        <Route path="*" element={<Navigate to="/dashboard/agency" replace />} />
      </Route>

      {/* ══════════════ GRID AGENT (role 16) ══════════════ */}
      <Route path="/dashboard/agent/*"
        element={<PrivateRoute allowedRoleCodes={['16']}><DashboardLayout /></PrivateRoute>}>
        <Route index element={<AgentDashboard />} />
        <Route path="agent-projects" element={<AgentProjects />} />
        <Route path="projects/:id" element={<AgentProjectDetails />} />
        <Route path="GridAgent-lead" element={<GridAgentLead />} />
        <Route path="GridAgent-lead/:id" element={<GridAgentLeadDetail />} />
        <Route path="CreateAgent-Lead" element={<CreateAgentLead />} />
        <Route path="presentations" element={<PresentationsList />} />
        <Route path="mortgages/calculator" element={<PerfectMortgageCalculator initialTab="affordability" />} />
        <Route path="mortgages/calculator/eligibility" element={<MortgageEligibilityCalculatorPage />} />
        <Route path="mortgages/calculator/affordability" element={<MortgageAffordabilityCalculatorPage />} />
        <Route path="mortgages/calculator/emi" element={<PerfectMortgageCalculator initialTab="mortgage" />} />
        <Route path="Leaderboard" element={<AgentLeaderboard />} />
        <Route path="agent-agreement" element={<Agreementagent />} />
        <Route path="agent-lead/:id" element={<Addleaddetails />} />
        <Route path="lead-detail/:id" element={<VaultLeadDetails />} />
        <Route path="deals" element={<AgentDeals />} />
        <Route path="deals/create" element={<AgentCreateDeal />} />
        <Route path="deals/:id" element={<AgentDealDetails />} />
        <Route path="visits" element={<AgentSiteVisits />} />
        <Route path="visits/create" element={<AgentCreateVisit />} />
        <Route path="site-visits/:id" element={<AgentSiteVisitDetails />} />
        <Route path="commission" element={<AgentCommission />} />
        <Route path="commission/:id" element={<AgentCommissionDetails />} />
        <Route path="subscription" element={<AgentSubscription />} />
        <Route path="favourite-properties" element={<FavouriteProperty />} />
        <Route path="property/view/:id" element={<PropertyDetailPage />} />
        <Route path="profile" element={<AgentProfile />} />
        <Route path="gridnotification" element={<GridNotification />} />
        <Route path="*" element={<Navigate to="/dashboard/agent" replace />} />
      </Route>

      {/* ══════════════ GRID DEVELOPER (role 17) ══════════════ */}
      <Route path="/dashboard/developer/*"
        element={<PrivateRoute allowedRoleCodes={['17']}><DashboardLayout /></PrivateRoute>}>
        <Route index element={<DeveloperDashboard />} />
        <Route path="developer-properties" element={<DeveloperProjects />} />
        <Route path="developer-properties/add" element={<DeveloperAddProperty />} />
        <Route path="developer-properties/:id" element={<DeveloperProjectDetails />} />
        <Route path="edit-property/:id" element={<DeveloperEditProperty />} />
        <Route path="property/:id" element={<PropertyDetailPage />} />
        <Route path="developer-inventory" element={<DeveloperInventory />} />
        <Route path="developer-leads" element={<DeveloperLeads />} />
        <Route path="leads/:id" element={<DeveloperLeadDetails />} />
        <Route path="leads/:id/booking" element={<DeveloperCreateBooking />} />
        <Route path="bookings" element={<DeveloperBookings />} />
        <Route path="bookings/:id" element={<DeveloperBookingDetails />} />
        <Route path="revenue" element={<DeveloperRevenue />} />
        <Route path="analytics" element={<DeveloperAnalytics />} />
        <Route path="commission-scheme" element={<DeveloperCommissionScheme />} />
        <Route path="developer-agreement" element={<Agreementdeveloper />} />
        <Route path="developer-properties/:id/documents" element={<DeveloperDocumentLibrary />} />
        <Route path="profile" element={<DeveloperProfile />} />
        <Route path="gridnotification" element={<GridNotification />} />
        <Route path="*" element={<Navigate to="/dashboard/developer" replace />} />
      </Route>

      {/* ══════════════ GRID ADVISOR (role 24) ══════════════ */}
      <Route path="/dashboard/GridAdvisor/*"
        element={<PrivateRoute allowedRoleCodes={['24']}><DashboardLayout /></PrivateRoute>}>
        <Route index element={<GridAdvisorDashboard />} />
        <Route path="gridAdvisorLeads" element={<AdvisorLeadsPage />} />
        <Route path="gridAdvisorLeads/:id" element={<GridAdvisorLeadDetail />} />
        <Route path="property-catalogue" element={<PropertyCatalogue />} />
        <Route path="property/view/:id" element={<PropertyDetailPage />} />
        <Route path="favourite-properties" element={<FavouriteProperty />} />
        <Route path="presentations" element={<PresentationsList />} />
        <Route path="mortgages/calculator" element={<PerfectMortgageCalculator initialTab="affordability" />} />
        <Route path="mortgages/calculator/eligibility" element={<MortgageEligibilityCalculatorPage />} />
        <Route path="mortgages/calculator/affordability" element={<MortgageAffordabilityCalculatorPage />} />
        <Route path="mortgages/calculator/emi" element={<PerfectMortgageCalculator initialTab="mortgage" />} />
        <Route path="profile" element={<GridAdvisorProfile />} />
        <Route path="leaderboard" element={<AdvisorLeaderboardPage />} />
        <Route path="*" element={<Navigate to="/dashboard/GridAdvisor" replace />} />
      </Route>

      {/* ══════════════ GRID REFERRAL PARTNER (role 25) ══════════════ */}
      <Route path="/dashboard/gridreferralpartner/*"
        element={<PrivateRoute allowedRoleCodes={['25']}><DashboardLayout /></PrivateRoute>}>
        <Route index element={<ReferralPartnerDashboard />} />
        <Route path="submit-leads" element={<ActiveLeads />} />
        <Route path="total-leads" element={<TotalLeads />} />
        <Route path="recent-leads" element={<RecentLeads />} />
        <Route path="profile" element={<ReferralPartnerProfile />} />
        <Route path="leaderboard" element={<ReferralPartnerLeaderboard />} />
        <Route path="referral-leaderboard" element={<ReferralPartnerLeaderboard />} />
        <Route path="lead/:id" element={<ReferralPartnerLeadDetail />} />
        <Route path="gridnotification" element={<GridNotification />} />
        <Route path="*" element={<Navigate to="/dashboard/gridreferralpartner" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Suspense>
);

export default App;
