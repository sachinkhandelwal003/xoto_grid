import React from "react";
import { useSelector } from "react-redux";
import UpdateFreelancerProfile from "../managefreelancer/freelancer/UpdateFreelancerProfile";
import UpdateVendorProfile from "../managevendor/UpdatevendorProfile";

const UpdateProfilePage = () => {
  const { user } = useSelector((state) => state.auth);

  // Safety check (in case user is null)
  if (!user || !user.role) {
    return <div>No user found</div>;
  }

  const isFreelancer = user.role.name?.toLowerCase() === "freelancer";

  return (
    <>
      {isFreelancer ? (
        <UpdateFreelancerProfile />
      ) : (
        <UpdateVendorProfile />
      )}
    </>
  );
};

export default UpdateProfilePage;
