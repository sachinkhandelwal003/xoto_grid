import React from "react";
import { useSelector } from "react-redux";
import VaultAgentLeadDetail from "./VaultAgentLeadDetail";
import VaultAgentLeadViewAdvisor from "./VaultAgentLeadViewAdvisor";

const AgentsLeadFullView = () => {
  const { user } = useSelector((state) => state.auth);

  // Safety check
  if (!user || !user.role) {
    return <div>No user found</div>;
  }

  // ✅ correct role check
  const isAdvisor = user.role.code === 26 || user.role.code === "26";

  return (
    <>
      {isAdvisor ? <VaultAgentLeadViewAdvisor /> : <VaultAgentLeadDetail />}
    </>
  );
};

export default AgentsLeadFullView;