import React from "react";
import { useSelector } from "react-redux";
import AdvisorLeads from "../vaultadvisor";
import VaultLeads from "../../B2C/VaultLeads";

const LeadsVault = () => {
  const { user } = useSelector((state) => state.auth);

  // Safety check
  if (!user || !user.role) {
    return <div>No user found</div>;
  }

  // ✅ correct role check
  const isAdvisor = user.role.code === 26 || user.role.code === "26";

  return (
    <>
      {isAdvisor ? <AdvisorLeads /> : <VaultLeads />}
    </>
  );
};

export default LeadsVault;