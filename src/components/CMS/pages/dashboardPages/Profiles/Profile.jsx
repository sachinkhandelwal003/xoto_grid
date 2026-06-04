import React from "react";
import { useSelector } from "react-redux";
import FreelancerProfile from "./FreelancerProfile";
import VendorMYProfile from "./VendorMYProfile";
import SupervisorProfile from "./SupervisorProfile";
import AdminProfile from "./AdminProfile";
import CustomerProfile from "./CustomerProfile";
import { ConsoleSqlOutlined } from "@ant-design/icons";
import AccountantProfile from "./AccountantProfile";
import AgentProfile from "./AgentProfile";
import VaultAgentProfile from "./VaultAgentprofile";
import VaultPartnerProfile from "./VaultPartnerProfile";
import DeveloperProfile from "./DeveloperProfile";
import GridAdminProfile from "./GridAdmin";
import GridAdvisorProfile from "./GridAdvisorProfile";
import ReferralPartnerProfile from "./ReferralPartnerProfile";


const Profile = () => {
  const { user } = useSelector((state) => state.auth);


  // 
  // Safety check
  if (!user || !user.role) {
    return <div>No user found</div>;
  }

  const roleCode = Number(user.role.code);
  

  switch (roleCode) {
    case 0:
      return <AdminProfile />;

    case 7:
      return <FreelancerProfile />;

    case 12:
      return <SupervisorProfile />;

    case 2:
      return <CustomerProfile />;
          case 11:
      return <AccountantProfile />;

      case 16: 
      return <AgentProfile /> ;
      case 17: 
      return <DeveloperProfile /> ;
      case 22:
        return <VaultAgentProfile /> ;
        case 21:
          return <VaultPartnerProfile /> ;

      case 1:
        return <GridAdminProfile />
      case 24:
        return <GridAdvisorProfile />
      case 25:
        return <ReferralPartnerProfile />

    default:
      return <VendorMYProfile />;
  }
};

export default Profile;
