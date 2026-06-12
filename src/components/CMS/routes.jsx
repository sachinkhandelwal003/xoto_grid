import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

// PAGES
import Dashboard from "./pages/Dashboard";
import VendorDashboard from "./pages/VendorDashboard";
import Freelancerdashboard from "./pages/Freelancerdashboard";
import CustomerList from "./pages/dashboardPages/Customerlist";
import Modules from "./pages/modules/Modules";
import Permission from "./pages/permission/Permission";
import Role from "./pages/role/Role";
import VendorB2C from "./pages/dashboardPages/managevendor/VendorB2C";
import VendorB2CProfile from "./pages/dashboardPages/managevendor/VendorB2CProfile";
import VendorInventory from "../ecommerce/B2C/products/Vendorinventory";
import ProductRequestB2C from "./pages/dashboardPages/manageProducts/ProductRequestB2C";
import CategoryFreelancers from "./pages/dashboardPages/managefreelancer/freelancer/categoryandsubcategory/CategoryFreelancers";
import Freelancers from "./pages/dashboardPages/managefreelancer/freelancer/Freelancers";
import FreelancerProfile from "./pages/dashboardPages/managefreelancer/freelancer/FreelancerProfile";
import MyprofileFreelancer from "./pages/dashboardPages/managefreelancer/freelancer/MyprofileFreelancer";
import UpdateFreelncerProfile from "./pages/dashboardPages/managefreelancer/freelancer/UpdateFreelancerProfile";
import Projects from "./pages/dashboardPages/managefreelancer/freelancer/Projects/Projects";
import ViewwProject from "./pages/dashboardPages/ViewLibrary";
import MyProjects from "./pages/dashboardPages/managefreelancer/freelancer/Projects/MyProjects";
import Accountant from "./pages/dashboardPages/manageaccountant/Accountant";
import AccountantDashboard from "./pages/AccountantDashboard";
import ManageProjects from "./pages/dashboardPages/manageaccountant/ManageProjects";
import AddProjects from "./pages/dashboardPages/managefreelancer/freelancer/Projects/AddProjects";
import AddCategory from "../ecommerce/B2C/products/AddCategory";
import AddMaterial from "../ecommerce/B2C/products/AddMaterial";
import AddBrand from "../ecommerce/B2C/products/AddBrand";
import AllVendorProductB2C from "./pages/dashboardPages/manageProducts/AllVendorProductB2C";
import VendorProducts from "../ecommerce/B2C/products/VendorProducts";
import AddProducts from "../ecommerce/B2C/products/AddProducts";
import Currency from "./pages/settings/Currency";
import Tax from "./pages/settings/Tax";
import ProductReview from "./pages/dashboardPages/manageProducts/ProductReview";
import ProductProfile from "../ecommerce/B2C/products/ProductProfile";
import VendorProfile from "./pages/dashboardPages/managevendor/VendorProfile";
import UsersRoleList from "./pages/dashboardPages/users/UsersRoleList";
import LeadsList from "./pages/dashboardPages/leads/LeadsList";

import SupervisorDashboard from "./pages/SupervisorDashboard";
import AssignedLeadsList from "./pages/dashboardPages/leads/AssignedLeadsList";
import QuatationLeadsList from "./pages/dashboardPages/leads/QuatationLeadsList";
import Myestimates from "./pages/dashboardPages/leads/Myestimates";
import Leads from "./pages/dashboardPages/leads/Leads";
import Customerdashboard from "./pages/Customerdashboard";
import MyProfileB2C from "./pages/dashboardPages/managevendor/vendorprofile/Vendorb2c-Myprofile";
import MyProfileb2b from "./pages/dashboardPages/managevendor/vendorprofile/Vendorb2b-MyProfile";
import MyProfile from "./pages/dashboardPages/Profiles/FreelancerProfile";
import UpdateFreelancerProfile from "./pages/dashboardPages/managefreelancer/freelancer/UpdateFreelancerProfile";
import Bookings from "./pages/dashboardPages/consult/Bookings";
import Packages from "./pages/packages/Packages";
import MasterCategory from "./pages/estimateMaster/MasterCategory";
import Enquiry from "./pages/dashboardPages/consult/Enquiry";
import PropertyLeads from "./pages/dashboardPages/consult/PropertyLeads";
import Meta from "./pages/dashboardPages/consult/MetaLeads";
import MyListings from "./pages/MyListings";
import UpdateProfilePage from "./pages/dashboardPages/updates/UpdateProfilepage";
import Inventory from "../ecommerce/B2C/products/Inventory";
import ManageWarehouses from "../ecommerce/setting/ManageWareHouses";
import AddAttributes from "../ecommerce/B2C/products/AddAttributes";
import AddTags from "../ecommerce/B2C/products/AddTags";
import UpdateProduct from "../ecommerce/B2C/products/UpdateProduct";
import ViewProject from "./pages/dashboardPages/managefreelancer/freelancer/Projects/ViewProjects";
import TypesGallery from "./pages/estimateMaster/TypesGallery";
import Questions from "./pages/estimateMaster/Questions";
import CreateDeveloper from "./pages/Properties/createDeveloper";
import Propertymanagement from "./pages/Properties/Propertymanagement";
import ApprovalQueue from "./pages/Properties/ApprovalQueue";
import EditReviewQueue from "./pages/Properties/EditReviewQueue";
import Blog from "./pages/Blog/CreateBlog";
import SubmittedQuotation from "./pages/dashboardPages/leads/quotation/SubmittedQuotation";
import ApprovedQuotation from "./pages/dashboardPages/leads/quotation/ApprovedQuotation";
import ReceivedQuotation from "./pages/dashboardPages/leads/quotation/Customer/ReceivedQuotation";
import CustomerSubmittedQuotation from "./pages/dashboardPages/leads/quotation/Customer/CustomerSubmittedQuotation";
import EmailSetting from "./pages/settings/EmailSetting";
import Notifications from "./pages/dashboardPages/notification/Notifications";
import ManageProjectsSupervisor from "./pages/dashboardPages/managefreelancer/freelancer/Projects/ManageProjectsSupervisor";
import ManageProjectFreelancer from "./pages/dashboardPages/managefreelancer/freelancer/Projects/ManageProjectFreelancer";
import CustomerProjects from "./pages/dashboardPages/managefreelancer/freelancer/Projects/CustomerProjects";
import CustomerBillsview from "./pages/dashboardPages/Bills/CustomerBillsview";
import CustomerInvoicesview from "./pages/dashboardPages/Bills/CustomerInvoicesview";
import Profile from "./pages/dashboardPages/Profiles/Profile";
import AgentList from "./pages/Properties/AgentList";
import AgencyList from "./pages/Properties/AgencyList";
import DeveloperDashboard from "../ecommerce/B2C/DeveloperDashboard";
import AgentDashboard from "../ecommerce/B2C/AgentDashboard";
import AgentLeaderboard from "../ecommerce/B2C/AgentLeaderboard";
import AgentAgreements from "../ecommerce/B2C/AgentAgreements";
import VaultpartnerDashboard from "../../components/CMS/pages/VaultPartnerDashboard";
import AgentLayout from "../ecommerce/B2C/AgentLayout";
import Addleaddetails from "../ecommerce/B2C/AgentLeadDetails"
import AgentLeadDashboard from "../ecommerce/B2C/AgentLeadCreated";
import AgentSubscription from "../ecommerce/B2C/AgentSubscription";
import AgentProjects from "../Grid/GridAgent/AgentProjects";
import AgentProjectDetails from "../Grid/GridAgent/AgentProjectDetails";
import AgentPresentations from "../ecommerce/B2C/AgentPresentations";
import AgentSiteVisits from "../ecommerce/B2C/AgentSiteVisits";
import AgentDeals from "../ecommerce/B2C/AgentDeals";
import AgentCommission from "../ecommerce/B2C/AgentCommission";
import LeadDetails from "../ecommerce/B2C/LeadDetails";
import AddProperty from "../ecommerce/B2C/AddProperty";
// import AgentLeadDetails from "../ecommerce/B2C/AgentLeadDetails";
import AgentCreateDeal from "../ecommerce/B2C/AgentCreateDeal";
import AgentDealDetails from "../ecommerce/B2C/AgentDealDetails";
import AgentSiteVisitDetails from "../ecommerce/B2C/AgentSiteVisitDetails";
import AgentCommissionDetails from "../ecommerce/B2C/AgentCommissionDetails";
import AgentCreateVisit from "../ecommerce/B2C/AgentCreateVisit";
import DeveloperProjects from "../ecommerce/B2C/DeveloperProjects";
import DeveloperInventory from "../ecommerce/B2C/DeveloperInventory";
import DeveloperLeads from "../ecommerce/B2C/DeveloperLeads";
import DeveloperRevenue from "../ecommerce/B2C/DeveloperRevenue";
import DeveloperProjectDetails from "../ecommerce/B2C/DeveloperProjectDetails";
import DeveloperAddProject from "../ecommerce/B2C/DeveloperAddProject";
import DeveloperAddUnit from "../ecommerce/B2C/DeveloperAddUnit";
import DeveloperUnitDetails from "../ecommerce/B2C/DeveloperUnitDetails";
import DeveloperEditUnit from "../ecommerce/B2C/DeveloperEditUnit";
import DeveloperLeadDetails from "../ecommerce/B2C/DeveloperLeadDetails";
import DeveloperCreateBooking from "../ecommerce/B2C/DeveloperCreateBooking";
import DeveloperBookings from "../ecommerce/B2C/DeveloperBookings";
import DeveloperBookingDetails from "../ecommerce/B2C/DeveloperBookingDetails";
import DeveloperList from "./pages/DeveloperList";
import DeveloperAnalytics from "../ecommerce/B2C/DeveloperAnalytics";
import DeveloperCommissionScheme from "../ecommerce/B2C/DeveloperCommisionScheme";
import DeveloperDetail from "./pages/Developerdetail";
import DealCommissionManager from "./pages/DealCommissionManager";
import DeveloperAddProperty from "../ecommerce/B2C/DeveloperAddProperty";
import DeveloperEditProperty from "../ecommerce/B2C/DeveloperEditProperty";
import DeveloperPropertyEdit from "../ecommerce/B2C/DeveloperPropertyEdit";
import BankProductManagement from "../homepage/BankProductManagement";
// {Agency}------------------------------------------------------------
import AgencyManageAgents from "../ecommerce/B2C/AgencyManageAgents";
import AgencyPerformance from "../ecommerce/B2C/AgencyPerformance";
import AgencyAgentDetails from "../ecommerce/B2C/AgencyAgentDetails";
import AgencyCommission from "../ecommerce/B2C/AgencyCommission";
import AgencyLeadManagement from "../ecommerce/B2C/AgencyLeadManagement";
import AgencyAgentProperties from "./pages/Properties/AgencyAgentProperties";
// import AgencyTargets from "../ecommerce/B2C/AgencyTargets";
import AgencyLeaderboard from "../ecommerce/B2C/AgencyLeaderboard"; 
import AdvisorLeaderboard from "../Grid/GridAdmin/AdvisorLeaderboard";
// import AgencyIncentives from "../ecommerce/B2C/AgencyIncentives";
// import AgencyBranches from "../ecommerce/B2C/AgencyBranches";
// import AgencyRoles from "../ecommerce/B2C/AgencyRoles";
// import AgencyAdvancedAnalytics from "../ecommerce/B2C/AgencyAdvancedAnalytics";
// import AgencyProfitEngine from "../ecommerce/B2C/AgencyProfitEngine";
import AgencySubscription from "../ecommerce/B2C/AgencySubscription";
import AgencyProjects from "../ecommerce/B2C/AgencyProjects";
import AgencyDeals from "../ecommerce/B2C/AgencyDeals";
import AgencyProfile from "./pages/dashboardPages/Profiles/AgencyProfile";

// import AgencyAssignProjects from "../ecommerce/B2C/AgencyAssignProjects";

// import RegistrationAgency from "./pages/Properties/RegistrationAgency";
// import AddBrand from "../ecommerce/B2C/products/AddBrand"
import AdminDashboard from "./pages/AdminDashboard";
import AdminPropertyGrid from "./pages/AdminPropertyGrid";
import AdminPropertyListings from "./pages/Adminpropertylistings"
import AdminPropertyDetail from "./pages/Adminpropertydetails";
import AdminOffPlanCreate from "./pages/Adminoffplancreate";
import LeadManagement from "./pages/LeadManagement";
import AgencyLeadDetailsPage from "./pages/AgencyLeadDetailsPage";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import VerificationQueue from "./pages/VerificationQueue";
import AgencyDashboard from "../ecommerce/B2C/AgencyDashboard";
import XobiaTrainingAdmin from "./pages/XobiaTrainingAdmin";
import GlobalSettings from "./pages/GlobalSettings";
import XotoBlitzCampaigns from "./pages/XotoBlitzCampaigns";
import AgentLeadSuggestionCreate from "../ecommerce/B2C/AgentLeadSuggestionCreate";
import MyChatRequests from "../chat/Mychatrequests";
import AdminChatRequests from "../chat/Adminchatrequests";
import BrochureGenerator from "../ecommerce/B2C/BrochureGenerator";
import TrackBrochure from "../ecommerce/B2C/TrackBrochure";
import WaitingApproval from "../ecommerce/B2C/WaitingApproval";
import AgentDetail from "./pages/Properties/Agentdetail";
import DeveloperForm from "./pages/dashboardPages/DeveloperForm";
import OnBoardingAgent from "./pages/dashboardPages/OnBoardingAgent";
import OnBoardingAgency from "./pages/dashboardPages/OnBoardingAgency";
import CreateSecondaryProperty from "./pages/Properties/CreateSecondaryProperty";
import SecondaryPlans from "./pages/Properties/SecondaryPlans";
import SecondaryPropertyDetail from "./pages/Properties/Secondarypropertydetail";


import GridCreateadvisor from "../Grid/GridAdmin/GridCreateadvisor";
import AllAdvisors from "../Grid/GridAdmin/Alladvisors";
import AdvisorDetail from "../Grid/GridAdmin/Advisordetail";
import AllReferralPartners from "../GridReferralPartner/Admin/AllReferralPartners";
import ReferralPartnerDetail from "../GridReferralPartner/Admin/ReferralPartnerDetail";
import PlatformLeads from "../Grid/GridAdmin/PlatformLeads";
import AdvisorLeadsPage from "../Grid/AdvisorGrid/Advisorleadspage";
import PropertyCatalogue from "../Grid/AdvisorGrid/Propertycatalogue";
import FavouriteProperty from "../Grid/Fav Property/FavouriteProperty";
import AgentLeads from "../Grid/GridAdmin/AgentLeads";
import AddGeneralleads from "../Grid/GridAdmin/AddGeneralleads";
import GeneralLeads from "../Grid/GridAdmin/GeneralLeads";
import ReferralLeads from "../Grid/GridAdmin/ReferralLeads";
import AllgridLeads from "../Grid/GridAdmin/AllgridLeads";
import CreateOffplan from "../Grid/GridAdmin/CreateOffplan";
import CommissionDashboard from "../Grid/GridAdmin/CommissionDashboard";
import GridAgentLead from "../Grid/GridAgent/GridAgentLead";
import CreateAgentLead from "../Grid/GridAgent/CreateAgentLead";


{/*Xoto Vault*/ }
import VaultAdminDashboard from "../ecommerce/B2C/VaultAdminDashboard";
import VaultAgents from "../ecommerce/B2C/VaultAgents";
import VaultCases from "../ecommerce/B2C/VaultCases";
import VaultClients from "../ecommerce/B2C/VaultClients";
import VaultPartners from "../ecommerce/B2C/VaultPartners";
import PartnerList from "../ecommerce/B2C/PartnerList";
import PartnerDetail from "../ecommerce/B2C/PartnerDetails";
import VaultAgentonboard from "../ecommerce/B2C/VaultAgentonboard";
import VaultAgentlist from "../ecommerce/B2C/VaultAgentlist";
import VaultAgentdetail from "../ecommerce/B2C/VaultAgentdetails";
import PropertyDetailPage from "./pages/Propertydetailpage";
import VaultAgentDashboard from "../ecommerce/B2C/VaultAgentDashBoard";
import OnboardPartner from "./pages/OnboardPartner";
import AgentVaultListing from "./pages/AgentVaultListing";
import VaultCreateLeads from "../ecommerce/B2C/VaultCreateLeads";
import VaultLeads from "../ecommerce/B2C/VaultLeads";
import VaultLeadDetails from "../ecommerce/B2C/VaultLeadDetails";
import VaultLeadDocuments from "../ecommerce/B2C/VaultLeadDocuments";
import VaultAgentLeadList from "../ecommerce/B2C/VaultAgentLeadList";
import VaultAgentLeadDetail from "../ecommerce/B2C/VaultAgentLeadDetail";
import VaultLeadDocumentUpload from "../ecommerce/B2C/VaultLeadDocumentUpload";
import PartnerAgentleads from "../ecommerce/B2C/PartnerAgentleadlist";
// import VaultAgentDocuments from "../ecommerce/B2C/VaultAgentDocuments";
import VaultAgentDocument from "../ecommerce/B2C/VaultAgentDocument";
import PartnerLeadDetails from "../ecommerce/B2C/PartnerLeadDetails";
import CreateProposal from "../ecommerce/B2C/PartnerCreateproposal";
import ProposalForm from "../ecommerce/B2C/ProposalForm";
import AllProposals from "../ecommerce/B2C/AllProposals";
import CreateAdvisor from "../ecommerce/B2C/VaultCreateadviosor";
import AdvisorList   from "../ecommerce/B2C/VaultAdvisorlist";
import VaultAdvisorDetail from "../ecommerce/B2C/VaultAdvisordetail";
import VaultCreateMortgage from "../ecommerce/B2C/VaultCreatemortgage";
import VaultMortgageList from "../ecommerce/B2C/VaultMortgagelist";
import VaultMortgagedetail from "../ecommerce/B2C/VaultMortgagedetail";
import MortgageOpsDashboard from "../ecommerce/B2C/MortgageopsDashboard";
import AdvisorDashboard from "../ecommerce/B2C/AdvisorDashboard";
import IndividualLeadCreate from "../ecommerce/vault/individualpartner/IndividualLead";
import AdvisorLeads from "../ecommerce/vault/vaultadvisor/index";
import AdvisorLeadUploadDocuments from "../ecommerce/vault/vaultadvisor/UploadDocuments";
import MortgageOpsCaseDetail from "../ecommerce/vault/case/OpsCaseDetails";

// import OnBoardingAgent from "./pages/dashboardPages/OnBoardingAgent";
// import OnBoardingAgency from "./pages/dashboardPages/OnBoardingAgency";

import CreateRentalProperty from "../../component/Rent/Createrentalproperty";
import RentalPropertyList from "../../component/Rent/Rentalpropertylist";
import AdminLeadList from "../../component/Rent/Adminleadlist";
import BankProductListVault from "../ecommerce/vault/Index";
import CreateProposalAdmin from "../ecommerce/vault/proposal/Index";
import ViewProposal from "../ecommerce/vault/proposal/ViewProposal";
import CreateCase from "../ecommerce/vault/case/Index";
import ViewCases from "../ecommerce/vault/case/ViewCases";
import DetailedViewCases from "../ecommerce/vault/case/DetailedViewCases";
import ProcessCasesUpdates from "../ecommerce/vault/case/ProcessCasesUpdates";
// import ReferralPartnerLogin from "../GridReferralPartner/ReferralPartnerLogin";
// import ReferralPartnerLogin from "../GridReferralPartner/ReferralPartnerLogin"; dfs
import ReferralPartnerDashboard from "./pages/ReferralPartnerDashboard"
import TotalLeads from "../GridReferralPartner/GridDashboardpages/TotalLeads";
import ActiveLeads from "../GridReferralPartner/GridDashboardpages/CreateReferralLead";
import RecentLeads from "../GridReferralPartner/GridDashboardpages/RecentLeads";
import ReferralPartnerLeaderboard from "../GridReferralPartner/GridDashboardpages/ReferralPartnerLeaderboard";
import ReferralPartnerProfile from "../../components/CMS/pages/dashboardPages/Profiles/ReferralPartnerProfile";
import ReferralPartnerLeadDetail from "../GridReferralPartner/GridDashboardpages/ReferralPartnerLeadDetail";
import LeadsVault from "../ecommerce/vault/Lead/LeadsVault";
import QueueCases from "../ecommerce/vault/case/QueueCases";
import OpsAssignedcases from "../ecommerce/vault/case/OpsAssignedcases";
import AddAgent from "../Grid/grid agency/AgentCreate";
import AllAgents from "../Grid/grid agency/AllAgents";
import GridAdvisorDashboard from "./pages/GridAdvisorDashboard";
import GridAdvisorProfile from "./pages/dashboardPages/Profiles/GridAdvisorProfile";
import ReferralProfile from "./pages/dashboardPages/Profiles/ReferraProfile";
import OpsAssignedReview from "../ecommerce/vault/case/OpsAssignedReview";
import VaultCreateadvisor from "../ecommerce/B2C/VaultCreateadviosor";
import AdminManagecases from "../ecommerce/vault/case/AdminManagecases";
// import AdvisorLeads from "../ecommerce/vault/vaultadvisor";
import VaultAdvisorLeads from "../ecommerce/B2C/VaultAdvisorLeads";
import DisbursedCases from "../ecommerce/vault/case/DisbursedCases";
import DisbursedFullAmountCases from "../ecommerce/vault/case/DisbursedFullAmountCases";
import AgentsLeadFullView from "../ecommerce/B2C/AgentsLeadFullView";
import Adminfeedbacks from "../../components/footer/Adminfeedbacks";
import Presentations from "../ecommerce/B2C/PresentationManager";
import BankProductViewwithdocuments from "../homepage/BankProductViewwithdocuments";
import BankProductDocuments from "../homepage/BankProductDocuments";
import GridAgentLeadDetail from "../Grid/GridAgent/GridAgentLeadDetail";
import GridAgentLeadDetailadmin from "../Grid/GridAdmin/GridAgentLeadDetailadmin";
import GridAdvisorLeadDetail from "../Grid/AdvisorGrid/GridAdvisorLeadDetail";
import PerfectMortgageCalculator from "../../components/homepage/MortgageCalculator";
import MortgageEligibilityCalculatorPage from "../../components/homepage/MortgageEligibilityCalculatorPage";
import MortgageAffordabilityCalculatorPage from "../../components/homepage/MortgageAffordabilityCalculatorPage";
import PresentationsList from '../Grid/presentation/PresentationsList';
import Dealrecordspage from "../Grid/GridAdmin/Dealrecordspage";
import DealRecordDetailPage from "../Grid/GridAdmin/DealRecordDetailPage";
import AgencyDealsPage from "../Grid/grid agency/Agencydealspage";
import AdminAgreements from "../Grid/GridAdmin/Agreement";
import Agreementdeveloper from "../Grid/DeveloperGrid/Agreementdeveloper";
import Agreementagency from "../Grid/grid agency/Agreementagency";
import Agreementagent from "../Grid/GridAgent/Agreementagent";
import AllUsers from "../Grid/GridAdmin/AllUsers";
import GridOverview from "../Grid/GridAdmin/GridOverview";
import GridLeadreports from "../Grid/GridAdmin/GridLeadreports";
import GridListingreports from "../Grid/GridAdmin/GridListingreports";
import GridSetting from "../Grid/GridAdmin/Gridsetting";
import GridNotification from "../Grid/GridAdmin/GridNotification";



const roleSlugMap = {
  0: "superadmin",
  1: "admin",
  2: "customer",
  5: "vendor-b2c",
  6: "vendor-b2b",
  7: "freelancer",
  11: "accountant",
  12: "supervisor",
  15: "agency",
  16: "agent",
  17: "developer",
  18: "vault-admin",
  22: "vaultagent",
  26: "vault-advisor",
  23: "vault-ops",
  25: "gridreferralpartner",

  21: "vaultpartner",
  24: "GridAdvisor"
};

const dashboardMap = {
  0: <Dashboard />,
  1: <AdminDashboard />,
  2: <Customerdashboard />,
  5: <VendorDashboard />,
  6: <VendorDashboard />,
  7: <Freelancerdashboard />,
  11: <AccountantDashboard />,
  12: <SupervisorDashboard />,
  16: <AgentDashboard />,
  17: <DeveloperDashboard />,
  15: <AgencyDashboard />,
  18: <VaultAdminDashboard />,
  22: <VaultAgentDashboard />,
  26: <AdvisorDashboard />,
  23: <MortgageOpsDashboard />,

  25: <ReferralPartnerDashboard />,
  // 21:<VaultPartnerDashboard/>
  21: <VaultpartnerDashboard />,
  24: <GridAdvisorDashboard />
};

const componentMap = {
  "products/list": <ProductRequestB2C />,
  "modules/list": <Modules />,
  permission: <Permission />,
  roles: <Role />,
  "seller/list": <VendorB2C />,
  "freelancer/category": <CategoryFreelancers />,
  "freelancer/list": <Freelancers />,
  "request/projects": <ManageProjects />,
  "sellers/list": <VendorB2C />,
  projects: <Projects />,
  myProjects: <MyProjects />,
  accountant: <Accountant />,
  users: <UsersRoleList />,

  addProjects: <AddProjects />,
  categories: <AddCategory />,
  material: <AddMaterial />,
  currency: <Currency />,
  tax: <Tax />,
  brands: <AddBrand />,
  "products/my": <VendorProducts />,
  "products/add": <AddProducts />,
  "leads/requested": <LeadsList />,
  "leads/assigned": <AssignedLeadsList />,
  "request/quatation": <QuatationLeadsList />,
  "estimates/my": <Myestimates />,
  "estimate/master/categories": <MasterCategory />,
  "master/types/gallery": <TypesGallery />,
  "estimate/questions": <Questions />,
  deals: <Leads />,
  bookings: <Bookings />,
  warehouse: <ManageWarehouses />,

  "property/leads": <PropertyLeads />,
  "meta/leads": <Meta />,
  enquiries: <Enquiry />,
  packages: <Packages />,
  "developer/create": <CreateDeveloper />,
  "developer/property": <Propertymanagement />
  , "create": <Blog />,
  "products/brands": <AddBrand />,
  "create-mortgages": <BankProductManagement />
};


// Placeholder for missing components
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-full p-10 text-center text-gray-400">
    <div>
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p>No component is assigned for this module yet.</p>
    </div>
  </div>
);

const CmsRoutes = () => {
  const { user, permissions } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!user?.role?.code) {
    return <div className="p-8 text-center">Loading user...</div>;
  }

  const roleSlug = roleSlugMap[user.role.code] ?? "dashboard";
  const base = `/dashboard/${roleSlug}`; // REMOVED /sawtar


  // Redirect root dashboard to role-specific
  if (
    // location.pathname === "/dashboard" ||
    location.pathname === "/dashboard/"
  ) {
    return <Navigate to={base} replace />;
  }

  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/" element={dashboardMap[user.role.code] ?? <Dashboard />} />

      {/* Static routes for Referral Partner (role 25) */}
      {user.role.code === 25 && (
        <>
          <Route path="submit-leads" element={<ActiveLeads />} />
          <Route path="total-leads" element={<TotalLeads />} />
          <Route path="recent-leads" element={<RecentLeads />} />
          <Route path="profile" element={<ReferralPartnerProfile />} />
          <Route path="leaderboard" element={<ReferralPartnerLeaderboard />} />
          <Route path="lead/:id" element={<ReferralPartnerLeadDetail />} />
        </>
      )}

      {/* Dynamic Routes from Permissions */}
      {Object.entries(permissions ?? {}).map(([key, p]) => {
        if (!p?.canView || !p?.route) return null;

        const clean = p.route.replace(/^\/+/, "");
        const Component = componentMap[clean];

        const [moduleName] = key.split("→").map((s) => s.trim());

        return (
          <Route
            key={clean}
            path={clean}
            element={Component ?? <Placeholder title={moduleName} />}
          />
        );
      })}

      {/* Static Routes */}
      <Route
        path="seller/:id/product-request"
        element={
          permissions?.["Vendor B2C→All Vendors"]?.canView ? (
            <ProductRequestB2C />
          ) : (
            <Navigate to="/seller/list" replace />
          )
        }
      />
      <Route path="quotation/submitted" element={<SubmittedQuotation />} />
      <Route path="quotation/approved" element={<ApprovedQuotation />} />
      <Route path="projects/manage" element={<ManageProjectsSupervisor />} />
      <Route path="projects/manage/:projectId" element={<ManageProjectFreelancer />} />
      <Route path="projects/ongoing" element={<CustomerProjects />} />
      <Route path="ViewLibrary" element={<ViewwProject />} />
      <Route path="myprofile" element={<Profile />} />
      <Route path="products" element={<ProductReview />} />
      <Route path="attributes/add" element={<AddAttributes />} />
      <Route path="tags/add" element={<AddTags />} />
      {/* <Route path="/create" element={<Blog />} /> */}
      <Route path="products/view" element={<ProductProfile />} />
      <Route path="products/edit/:id" element={<UpdateProduct />} />
      <Route path="products/edit/:id" element={<UpdateProduct />} />
      <Route path="/My-favourite-Properties" element={<FavouriteProperty />} />

      <Route path="product/inventory/:id" element={<Inventory />} />

      <Route path="seller/:id" element={<VendorB2CProfile />} />
      <Route path="inventory" element={<VendorInventory />} />

      <Route path="/feedbacks" element={<Adminfeedbacks />} />

      {/* <Route path="projects/:id" element={<ViewProject/>} /> */}
      <Route path="quotation/received" element={<ReceivedQuotation />} />
      <Route path="estimate/submitted" element={<CustomerSubmittedQuotation />} />
      <Route path="quotation/response" element={<Myestimates />} />
      <Route path="setting/email" element={<EmailSetting />} />
      <Route path="projects/milestone/bills" element={<CustomerBillsview />} />
      <Route path="projects/invoices" element={<CustomerInvoicesview />} />

      <Route path="seller/product/:id" element={<ProductRequestB2C />} />
      <Route path="freelancer/view" element={<FreelancerProfile />} />
      <Route path="notifications/view" element={<Notifications />} />
      <Route path="freelancer/myprofile" element={<MyprofileFreelancer />} />
      <Route path="/update" element={<UpdateProfilePage />} />
      {/* Agents */}
      {/* <Route index element={<AgentDashboard />} /> */}

      {/* Leads */}
      <Route path="agent-leads" element={<AgentLeadDashboard />} />
      <Route path="agent-leads/add" element={<AgentLeadSuggestionCreate />} />
      <Route path="lead-details/:id" element={<LeadDetails />} />
      <Route path="lead-details/brocure" element={<BrochureGenerator />} />
      <Route path="track-brochures" element={<TrackBrochure />} />
      <Route path="GridAgent-lead" element={<GridAgentLead />} />
      <Route path="CreateAgent-Lead" element={<CreateAgentLead />} />
      <Route path="presentations" element={<PresentationsList />} />
      <Route path="Leaderboard" element={<AgentLeaderboard />} />
      <Route path="leaderboard" element={<AgentLeaderboard />} />
      <Route path="my-Agreements" element={<AgentAgreements />} />
      <Route path="my-agreements" element={<AgentAgreements />} />
      <Route path="agreements" element={<AgentAgreements />} />
      <Route path="agent-agreement" element={<Agreementagent />} />

      <Route path="agent-lead/:id" element={<Addleaddetails />} />
      {/* <Route path="/dashboard/agent/lead/adds" element={<Addleaddetails />} /> */}

      {/* Projects */}
      <Route path="agent-projects" element={<AgentProjects />} />
      <Route path="projects/:id"element={<AgentProjectDetails />}/>

      {/* Deals */}
      <Route path="deals" element={<AgentDeals />} />
      <Route path="deals/create" element={<AgentCreateDeal />} />
      <Route path="deals/:id" element={<AgentDealDetails />} />

      {/* Site Visits */}
      <Route path="visits" element={<AgentSiteVisits />} />
      <Route path="visits/create" element={<AgentCreateVisit />} />
      <Route path="site-visits/:id" element={<AgentSiteVisitDetails />} />

      {/* Commission */}
      <Route path="commission" element={<AgentCommission />} />
      <Route path="commission/:id" element={<AgentCommissionDetails />} />

      {/* Subscription */}
      <Route path="subscription" element={<AgentSubscription />} />

      {/* Presentations */}
      {/* <Route path="presentations" element={<AgentPresentations />} /> */}

      <Route path="create-secondary-plans" element={<CreateSecondaryProperty />} />
      <Route path="create-secondary-plans/:id" element={<CreateSecondaryProperty />} />
      <Route path="secondary-plans" element={<SecondaryPlans />} />

      <Route path="secondary/:id" element={<SecondaryPropertyDetail />} />
      {/* <Route path="waiting-approval" element={<WaitingApproval />} /> */}
      <Route path="agents/:agentId" element={<AgentDetail />} />

      {/* Xoto Vault */}
      <Route path="/" element={user?.role?.code == 18 ? <VaultAdminDashboard /> : (dashboardMap[user.role.code] ?? <Dashboard />)} />
      <Route path="agents" element={<VaultAgents />} />
      <Route path="clients" element={<VaultClients />} />
      <Route path="cases" element={<VaultCases />} />
      <Route path="partners" element={<VaultPartners />} />
      <Route path="partner-list" element={<PartnerList />} />
      <Route path="partner-details/:id" element={<PartnerDetail />} />
      <Route path="agent-onboard" element={<VaultAgentonboard />} />
      <Route path="vault/agent-list" element={<VaultAgentlist />} />
      <Route path="agent-details/:id" element={<VaultAgentdetail />} />

      <Route path="dashboard/vaultagent" element={<VaultAgentDashboard />} />
      {/* Xoto Vault */}
      <Route path="/" element={user?.role?.code == 18 ? <VaultAdminDashboard /> : (dashboardMap[user.role.code] ?? <Dashboard />)} />
      <Route path="agents" element={<VaultAgents />} />
      <Route path="clients" element={<VaultClients />} />
      <Route path="cases" element={<VaultCases />} />
      <Route path="partners" element={<VaultPartners />} />
      <Route path="partner-list" element={<PartnerList />} />
      <Route path="partner-details/:id" element={<PartnerDetail />} />
      <Route path="agent-onboard" element={<VaultAgentonboard />} />
      <Route path="agent-details/:id" element={<VaultAgentdetail />} />
      <Route path="xotovaultpartner" element={<VaultpartnerDashboard />} />
      <Route path="onboard-partner" element={<OnboardPartner />} />
      <Route path="AgentVaultlisting" element={<AgentVaultListing />} />
      <Route path="leads/create" element={<VaultCreateLeads />} />
      <Route path="leads" element={<LeadsVault />} />
      <Route path="leads/advisor" element={<AdvisorLeads />} />
      <Route path="leads/advisor/view/:id" element={<VaultAgentLeadDetail />} />

<Route path="leads/:leadId" element={<VaultLeadDetails />} />
<Route path="vault/lead/:leadId/documents" element={<VaultLeadDocuments />} /> 
<Route path="leads/:leadId/documents" element={<VaultLeadDocuments />} /> 
<Route path="/lead-documents/:leadId"element={<VaultAgentDocument/>} />
<Route path="partner-leads" element={<PartnerAgentleads />} />
<Route path="partner/lead/:id"element={<PartnerLeadDetails />}/>
{/* <Route path="proposals/create" element={<CreateProposal />} /> */}
<Route path="proposals/create/:leadId" element={<ProposalForm />} />
<Route path="proposals/all" element={<AllProposals />} />
<Route path="advisor/create" element={<GridCreateadvisor />} />
<Route path="advisor/list"   element={<AdvisorList />} />
<Route path="advisor/:id" element={<VaultAdvisorDetail />} />
<Route path="referral-partners" element={<AllReferralPartners />} />
<Route path="referral-partners/:id" element={<ReferralPartnerDetail />} />
<Route path="mortgage-ops/create" element={<VaultCreateMortgage />} />
<Route path="create/vault-advisor" element={<VaultCreateadvisor />} />

      <Route path="mortgage-ops/list" element={<VaultMortgageList />} />
      <Route path="mortgage-ops/:id" element={<VaultMortgagedetail />} />
      <Route path="mortgage/dashboard" element={<MortgageOpsDashboard />} />
      <Route path="advisor/dashboard" element={<AdvisorDashboard />} />
      <Route path="/advisor/adv-leads" element={<AdvisorLeads />} />
      <Route path="advisor/upload-documents" element={<AdvisorLeadUploadDocuments />} />
      <Route path="leads/partner/create" element={<IndividualLeadCreate />} />


      {/* Mortgage ops case details */}

      <Route path="mortgage-ops/case/:caseId" element={<MortgageOpsCaseDetail />} />


<Route path="vault/agent-leads" element={<VaultAgentLeadList />} />
<Route path="vault/lead/:id" element={<AgentsLeadFullView />} />
{/* <Route path="vault/lead/:id/eligibility" element={<LoanEligibilitycheck />} /> */}

<Route path="vault/lead/documents/:leadId" element={<VaultLeadDocumentUpload />} />


      {/* admin */}
      <Route path="/agent-list" element={<AgentList />} />
      <Route path="/agency-list" element={<AgencyList />} />
      <Route path="/customers/list" element={<CustomerList />} />
      {/* <Route path="/agent-registration" element={<AgentRegistration />} /> */}
      <Route path="/developer-list" element={<DeveloperList />} />
      <Route path="/onboarding/developer" element={<DeveloperForm />} />
      <Route path="/onboarding/agent" element={<OnBoardingAgent />} />
      <Route path="/onboarding/agency" element={<OnBoardingAgency />} />

      <Route path="/property-list" element={<AdminPropertyGrid />} />
      <Route path="/DealCommissionManager" element={<DealCommissionManager />} />
      <Route path="lead-management" element={<LeadManagement />} />
      <Route path="lead-management/:id" element={<AgencyLeadDetailsPage />} />
      <Route path="/subscription-plans" element={<SubscriptionPlans />} />
      <Route path="/verification-queue" element={<VerificationQueue />} />
      <Route path="/ai-training" element={<XobiaTrainingAdmin />} />
      <Route path="/global-settings" element={<GlobalSettings />} />
      <Route path="/marketing-hub" element={<XotoBlitzCampaigns />} />
      <Route path="/admin-chat-requests" element={<AdminChatRequests />} />
      <Route path="/my-listings" element={<MyListings />} />
      <Route path="/properties" element={<AdminPropertyListings />} />
      <Route path="/properties/:id" element={<AdminPropertyDetail />} />
      <Route path="/properties/create-offplan" element={<AdminOffPlanCreate />} />
      <Route path="developer/property/:id" element={<PropertyDetailPage />} />
      <Route path="/admin/inventory" element={<DeveloperInventory />} />
      <Route path="gridnotification" element={<GridNotification/>}/>

      
      <Route path="/grid/allusers" element={<AllUsers/>}/>
      <Route path="/GridAdmin/propertyleads" element={<PlatformLeads />} />
      <Route path="/grid/agentleads" element={<AgentLeads />} /> 
      <Route path="/grid/referralleads" element={<ReferralLeads/>}/>
      <Route path="/grid/generalleads" element={<GeneralLeads/>}/>
      <Route path= "/grid/AllgridLeads" element={<AllgridLeads/>}/>
      <Route path="grid/addgeneralleads" element={<AddGeneralleads/>}/>
      <Route path="/grid/createoffplan" element={<CreateOffplan/>}/>
      <Route path="/grid/commission" element={<CommissionDashboard/>}/>
      <Route path="/lead-detail/:id" element={<GridAgentLeadDetail />} />
      <Route path="/lead-detail-admin/:id" element={<GridAgentLeadDetailadmin />} />
     <Route path="gridAdvisorLeads/:id" element={<GridAdvisorLeadDetail />} />
     <Route path="calculator" element={<PerfectMortgageCalculator initialTab="affordability" />} />
     <Route path="mortgages/calculator" element={<PerfectMortgageCalculator initialTab="affordability" />} />
     <Route path="mortgages/calculator/eligibility" element={<MortgageEligibilityCalculatorPage />} />
     <Route path="mortgages/calculator/affordability" element={<MortgageAffordabilityCalculatorPage />} />
     <Route path="mortgages/calculator/emi" element={<PerfectMortgageCalculator initialTab="mortgage" />} />
     <Route path="/property-management" element={<Propertymanagement />} />
     <Route path="listings/approval-queue"    element={<ApprovalQueue />} />
    <Route path="listings/edit-review-queue" element={<EditReviewQueue />} />
    <Route path="deal-records" element={<Dealrecordspage />} />
    <Route path="deal-records/create/:leadId" element={<Dealrecordspage />} />
    <Route path="deal-records/:dealId" element={<DealRecordDetailPage />} /> 
    <Route path="partner/deals" element={<AgencyDealsPage />} />
    <Route path="admin/agreements" element={<AdminAgreements />} />
    <Route path="agency-agreements" element={<Agreementagency />} />
    <Route path="/overview" element={<GridOverview/>} />
    <Route path="/leadreports" element={<GridLeadreports/>}/>
    <Route path="/listingreports" element={<GridListingreports/>}/>
    <Route path="/setting" element={<GridSetting/>}/>

      
      


      {/* Agency */}
      <Route path="add" element={<AddAgent />} />
      <Route path="all-agents" element={<AllAgents />} />


      <Route path="manage-agents" element={<AgencyManageAgents />} />
      <Route path="manage-agents/:id" element={<AgencyAgentDetails />} />
      <Route path="performance" element={<AgencyPerformance />} />
      <Route path="commission" element={<AgencyCommission />} />
      <Route path="lead-management-legacy" element={<AgencyLeadManagement />} />
      <Route path="add-property" element={<AddProperty />} />
      {/* <Route path="targets" element={<AgencyTargets />} /> */}
      <Route path="agency-leaderboard" element={<AgencyLeaderboard />} />
      <Route path="advisors/leaderboard" element={<AdvisorLeaderboard />} />
      {/* <Route path="incentives" element={<AgencyIncentives />} /> */}
      {/* <Route path="branches" element={<AgencyBranches />} /> */}
      {/* <Route path="internal-roles" element={<AgencyRoles />} /> */}
      {/* <Route path="advanced-analytics" element={<AgencyAdvancedAnalytics />} /> */}
      {/* <Route path="profit-engine" element={<AgencyProfitEngine />} /> */}
      <Route path="subscription" element={<AgencySubscription />} />
      <Route path="agency-projects" element={<AgencyProjects />} />
      <Route path="agency/deals" element={<AgencyDeals />} />
      <Route path="agency-agent-properties" element={<AgencyAgentProperties />} />
      <Route path="agency-profile" element={<AgencyProfile />} />
      <Route path="presentations" element={<Presentations />} />

      {/* <Route path="assign-projects" element={<AgencyAssignProjects />} /> */}
      {/* Developer */}
      <Route path="developer-properties" element={<DeveloperProjects />} />
      <Route path="developer-properties/add" element={<DeveloperAddProperty />} />
      <Route path="developer-properties/add" element={<DeveloperAddProject />} />
      <Route path="developer-properties/:id" element={<DeveloperProjectDetails />} />
      <Route path="edit-property/:id" element={<DeveloperEditProperty />} />
      <Route path="edit-property/:id" element={<DeveloperPropertyEdit />} />
      <Route path="developer-inventory" element={<DeveloperInventory />} />
      <Route path="/inventory/add" element={<DeveloperAddUnit />} />
      <Route path="/inventory/:id" element={<DeveloperUnitDetails />} />
      <Route path="/inventory/:id/edit" element={<DeveloperEditUnit />} />
      <Route path="developer-leads" element={<DeveloperLeads />} />
      <Route path="leads/:id" element={<DeveloperLeadDetails />} />
      <Route path="/leads/:id/booking" element={<DeveloperCreateBooking />} />
      <Route path="/bookings" element={<DeveloperBookings />} />
      <Route path="/bookings/:id" element={<DeveloperBookingDetails />} />
      <Route path="revenue" element={<DeveloperRevenue />} />
      <Route path="analytics" element={<DeveloperAnalytics />} />
      <Route path="commission-scheme" element={<DeveloperCommissionScheme />} />
      <Route path="commission-scheme/:id" element={<DeveloperCommissionScheme />} />
      <Route path="/developer/view/:id" element={<DeveloperDetail />} />
      <Route path="developer-agreement" element={<Agreementdeveloper />} />

      {/* <Route path="notifications" element={<DeveloperNotifications/>}/> */}
      {/* <Route path="team" element={<DeveloperTeam/>}/> */}

{/* Grid Referral Partner   */}
<Route path="/grid-referral-partner" element={<ReferralPartnerDashboard />} />
<Route path="/total-leads" element={<TotalLeads />} />
<Route path="/Submit-leads" element={<ActiveLeads />} />
<Route path="/recent-leads" element={<RecentLeads />} />


<Route path="advisors/:id" element={<AdvisorDetail />} />   
<Route path="advisors" element={<AllAdvisors />} />         
<Route path="create-advisor" element={<CreateAdvisor />} />
<Route path="dashboard/myprofile" element={<GridAdvisorProfile />} />
<Route path="dashboard/myprofile" element={<ReferralProfile/>} />
{/* <Route path="leaderboard" element={< ReferralLeaderboard />} /> */}
<Route path="gridAdvisorLeads" element={<AdvisorLeadsPage />} />
<Route path="property-catalogue" element={<PropertyCatalogue />} />
      {/* Grid Referral Partner   */}
      <Route path="/grid-referral-partner" element={<ReferralPartnerDashboard />} />
      <Route path="/total-leads" element={<TotalLeads />} />
      <Route path="/Submit-leads" element={<ActiveLeads />} />
      <Route path="/recent-leads" element={<RecentLeads />} />
      <Route path="/profile" element={<ReferralPartnerProfile />} />
      <Route path="/dashboard/gridreferralpartner/leaderboard" element={<ReferralPartnerLeaderboard />} />
      <Route path="/referral-leaderboard" element={<ReferralPartnerLeaderboard />} />


      <Route path="advisors/:id" element={<AdvisorDetail />} />
      <Route path="advisors" element={<AllAdvisors />} />
      <Route path="create-advisor" element={<CreateAdvisor />} />
      <Route path="dashboard/myprofile" element={<GridAdvisorProfile />} />
      <Route path="gridAdvisorLeads" element={<AdvisorLeadsPage />} />
      <Route path="property-catalogue" element={<PropertyCatalogue />} />



      {/* vault */}

      <Route path="/bank/products" element={< BankProductListVault />} />
      <Route path="/proposals/create" element={< CreateProposalAdmin />} />
      <Route path="/proposals/view" element={< ViewProposal />} />



      {/* cases vault */}

      <Route path="/case/create" element={< CreateCase />} />
      <Route path="/case/view" element={< ViewCases />} />
      <Route path="/case/manage" element={< AdminManagecases />} />

      <Route path="/case/queue/view" element={< QueueCases />} />
      <Route path="/case/assigned/all" element={< OpsAssignedcases />} />

      <Route path="/case/view/all" element={< ProcessCasesUpdates />} />
      <Route path="/case/disbursed" element={< DisbursedCases />} />


      <Route path="/case/view/:caseId" element={< DetailedViewCases />} />
      <Route path="/case/amount/view/:caseId" element={< DisbursedFullAmountCases />} />

      <Route path="/case/assigned/view/:caseId" element={< OpsAssignedReview />} />





      <Route path="/rental/properties" element={<CreateRentalProperty />} />
      <Route path="/rental/properties/create" element={<CreateRentalProperty />} />
      <Route path="/rental/properties/edit/:id" element={<CreateRentalProperty />} />
      <Route path="/rental/propertieslist" element={<RentalPropertyList />} />
      <Route path="/rental/leadlist" element={<AdminLeadList />} />


    </Routes>
  );
};

export default CmsRoutes;

