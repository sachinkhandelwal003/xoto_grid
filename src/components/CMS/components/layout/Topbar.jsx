import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../../manageApi/store/authSlice";
import { useCmsContext } from "../../contexts/CmsContext";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";

// Ant Design
import {
  Input,
  Dropdown,
  Avatar,
  Badge,
  Typography,
  List,
  Empty,
  Card,
  Button
} from "antd";

import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";

import { getRoleColors } from "../../../../manageApi/utils/roleColors";

const { Text } = Typography;

const Topbar = () => {
  const { toggleSidebar, sidebarCollapsed, toggleMobileSidebar } = useCmsContext();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  
  // ✅ State for Notifications only (no more failing profile API call)
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const colors = getRoleColors(user?.role?.code);

  /* ---------------- ROLE LOGIC ---------------- */
  const roleCode = user?.role?.code?.toString();
  const roleSlug = {
    "0": "superadmin",
    "1": "admin",
    "2": "customer",
    "5": "vendor-b2c",
    "6": "vendor-b2b",
    "7": "freelancer",
    "11": "accountant",
    "12": "supervisor",
    "15": "agency",
    "16": "agent",
    "21":"vaultpartner",
    "25":"gridreferralpartner",
  }[roleCode] ?? "dashboard";

  // Fetch profile data
  const fetchProfile = async () => {
    if (!user?.id) return;

    // Only agency and referral partner have role-specific profile endpoints;
    // every other role uses the generic /profile/get-profile-data.
    const endpoint =
      roleCode === '15' ? "/agency/profile" :
      roleCode === '25' ? "/referral/profile" :
      "/profile/get-profile-data";

    setProfileLoading(true);
    try {
      const res = await apiService.get(endpoint);
      if (res?.data) {
        setProfileData(res.data);
      }
    } catch (err) {
      console.error("Topbar: fetchProfile error", err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id, roleCode]);

useEffect(() => {
  const handleProfilePhotoUpdate = (e) => {
    // GridAdvisorProfile se event aata hai — profileData update karo
    setProfileData((prev) => {
      const current = prev?.data || prev || {};
      const updated = { ...current, profilePhotoUrl: e.detail?.photoUrl };
      // Agar prev mein .data nesting thi toh wahi maintain karo
      return prev?.data ? { ...prev, data: updated } : updated;
    });
  };
 
  window.addEventListener("gridAdvisorPhotoUpdated", handleProfilePhotoUpdate);
  return () => window.removeEventListener("gridAdvisorPhotoUpdated", handleProfilePhotoUpdate);
}, []);

useEffect(() => {
  const handleDeveloperLogoUpdate = (e) => {
    setProfileData((prev) => {
      const current = prev?.data || prev || {};
      const updated = { ...current, logo: e.detail?.photoUrl };
      return prev?.data ? { ...prev, data: updated } : updated;
    });
  };
  window.addEventListener("developerLogoUpdated", handleDeveloperLogoUpdate);
  return () => window.removeEventListener("developerLogoUpdated", handleDeveloperLogoUpdate);
}, []);

  // ✅ Helper to safely get Name - prioritize referral partner's firstName/lastName
 const getDisplayName = () => {
  try {
    console.log("Topbar: user", user);
    console.log("Topbar: roleCode", roleCode);
    console.log("Topbar: profileData", profileData);
    const reduxData = user?.data || user;
    const data = profileData?.data || profileData || reduxData;
    console.log("Topbar: data", data);

    // 0. Check for agency (companyName)
    if (roleCode === '15' && data?.companyName) {
      return data.companyName.trim();
    }

    // 1. Check for referral partner's JWT format (firstName, lastName - no underscore)
    if (data?.firstName && typeof data.firstName === 'string') {
      const full = `${data.firstName} ${data.lastName || ''}`.trim();
      if (full) return full;
    }

    // 2. Check for underscore format (first_name, last_name)
    if (data?.first_name && typeof data.first_name === 'string') {
      const full = `${data.first_name} ${data.last_name || ''}`.trim();
      if (full) return full;
    }

    // 3. Check for name (string or object)
    if (data?.name) {
      if (typeof data.name === 'object') {
        const full = `${data.name.first_name || data.name.firstName || ''} ${data.name.last_name || data.name.lastName || ''}`.trim();
        if (full) return full;
      }
      if (typeof data.name === 'string' && data.name.trim()) {
        return data.name.trim();
      }
    }

    // 4. Username or email fallback
    if (data?.username && typeof data.username === 'string') {
      return data.username.trim();
    }

    if (data?.email && typeof data.email === 'string') {
      return data.email.split('@')[0];
    }

  } catch (e) {
    console.log("Topbar: getDisplayName error", e);
  }

  return "User"; // Last fallback
};
  // ✅ Helper for Email
  const getDisplayEmail = () => {
    const reduxData = user?.data || user;
    const data = profileData?.data || profileData || reduxData;
    return data?.email || "";
  };

  // 🚀 NAYA HELPER: Photo ko safely nikalne ke liye
  const getProfilePhoto = () => {
    const reduxData = user?.data || user;
    const data = profileData?.data || profileData || reduxData;
    
     return (
    data?.profilePhotoUrl ||
    data?.logo            ||
    data?.profile_photo   ||
    data?.profilePic      ||
    null
  );
};
  /* ---------------- NOTIFICATIONS ---------------- */
  const [notifications, setNotifications] = useState([]);
  const lastCountRef = useRef(0); 

  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      const res = await apiService.get(
        `/notifications/receiver-notification/${user.id}`
      );

      if (res?.success && Array.isArray(res.data)) {
        if (res.data.length !== lastCountRef.current) {
          lastCountRef.current = res.data.length;
          setNotifications(res.data);
        }
      }
    } catch (err) {
      console.error("Notification error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications(); 
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  /* ---------------- PROFILE DROPDOWN ---------------- */
  const profileMenuItems = [
    {
      key: "profile-info",
      label: (
        <div className="px-2 py-1">
          <Text strong className="block text-sm">
            {getDisplayName()} 
          </Text>
          <Text type="secondary" className="text-xs">
            {getDisplayEmail()} 
          </Text>
        </div>
      ),
      disabled: true
    },
    { type: "divider" },
    {
      key: "1",
      label: "My Profile",
      icon: <UserOutlined />,
      onClick: () => navigate(roleCode === '15' ? `/dashboard/${roleSlug}/agency-profile` : `/dashboard/${roleSlug}/myprofile`)
    },
  
    { type: "divider" },
    {
      key: "3",
      label: "Sign out",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout
    }
  ];

  /* ---------------- NOTIFICATION DROPDOWN ---------------- */
  const notificationDropdown = (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span>Notifications</span>
          <Badge count={unreadCount} size="small" />
        </div>
      }
      style={{ width: 320 }}
      bodyStyle={{ padding: 0 }}
      className="shadow-lg"
    >
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notifications"
          />
        ) : (
          <List
            dataSource={notifications.slice(0, 10)}
            renderItem={(item) => (
              <List.Item
                className={`px-4 hover:bg-purple-50 ${
                  !item.isRead ? "bg-purple-50/30" : ""
                }`}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<BellOutlined />}
                      style={{
                        backgroundColor: "#f9f0ff",
                        color: "#722ed1"
                      }}
                    />
                  }
                  title={
                    <Text strong style={{ fontSize: 13 }}>
                      {item.title}
                    </Text>
                  }
                  description={
                    <>
                      <Text type="secondary" className="text-xs line-clamp-2">
                        {item.message}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        <ClockCircleOutlined />{" "}
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      <div className="p-2 border-t text-center">
        <Button
        type="link"
        size="small"
        onClick={() => {
          setNotifOpen(false);  
          navigate(`/dashboard/${roleSlug}/notifications/view`);
        }}
        >
          View all notifications
        </Button>
      </div>
    </Card>
  );

  /* ---------------- UI ---------------- */
  return (
    <header
      className={`fixed top-0 right-0 z-30 bg-white/80 backdrop-blur-md h-16 transition-all
      ${sidebarCollapsed ? "left-0 lg:left-20" : "left-0 lg:left-64"}`}
    >
      <div className="flex justify-between items-center h-full px-4 lg:px-6">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-xl" onClick={toggleMobileSidebar}>
            <MenuUnfoldOutlined />
          </button>

          <button className="hidden lg:block text-xl" onClick={toggleSidebar}>
            {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>

          <Input
            prefix={<SearchOutlined />}
            placeholder="Search..."
            allowClear
            className="hidden md:flex w-64 rounded-full bg-gray-50"
          />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-6">

          {/* 🔔 Notifications */}
          <Dropdown
            open={notifOpen}
            onOpenChange={setNotifOpen}
            dropdownRender={() => notificationDropdown}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Badge count={unreadCount} size="small">
              <button className="text-xl text-gray-500 hover:text-purple-600">
                <BellOutlined />
              </button>
            </Badge>
          </Dropdown>

          {/* 👤 Profile */}
          <Dropdown
            menu={{ items: profileMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <div className="flex items-center gap-2 cursor-pointer">
              
              {/* ✅ PHOTO FIX: Naya getProfilePhoto() helper laga diya */}
             <Avatar
  title={getDisplayName()}
  src={getProfilePhoto() || undefined}
  style={{
    backgroundColor: colors?.primary || "#722ed1",
    verticalAlign: "middle"
  }}
>
  {(
    getDisplayName()?.trim()?.charAt(0) || "U"
  ).toUpperCase()}
</Avatar>

              <div className="hidden md:flex flex-col leading-tight">
                <Text strong className="text-sm">
                  {getDisplayName()} 
                </Text>
                <Text type="secondary" className="text-[11px]">
                  {getDisplayEmail()} 
                </Text>
              </div>
            </div>
          </Dropdown>

        </div>
      </div>
    </header>
  );
};

export default Topbar;