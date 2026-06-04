// src/pages/admin/Freelancers.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Space,
  Tag,
  Tooltip,
  Modal,
  Input,
  Tabs,
  Popconfirm,
  Alert,
  message,
  Badge,
  Typography,
  Avatar,
  Row,
  Col,
  Statistic,
  Table
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  FileTextOutlined,
  StopOutlined,
  UserAddOutlined,
  CreditCardOutlined,
  ReloadOutlined // ✅ Icon updated to match your screenshot
} from "@ant-design/icons";
import moment from "moment";
import { apiService } from "../../../../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../../custom/CustomTable";

const { TextArea } = Input;
const { Title, Text } = Typography;

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

// Role map
const roleSlugMap = {
  0: "superadmin",
  1: "admin",
  5: "vendor-b2c",
  6: "vendor-b2b",
  7: "freelancer",
  11: "accountant",
};

// Permission Hook
const useFreelancerPermission = () => {
  const { permissions } = useSelector((s) => s.auth);
  const p = permissions?.["Xoto Partners→All Partners"] ?? {};

  return {
    canView: !!p.canView,
    canAdd: !!p.canAdd,
    canEdit: !!p.canEdit,
    canDelete: !!p.canDelete,
    canApprove: !!p.canEdit,
    canReject: !!p.canDelete,
  };
};

const Freelancers = () => {
  const navigate = useNavigate();
  const { token, user } = useSelector((s) => s.auth);
  const perm = useFreelancerPermission();

  const roleSlug = roleSlugMap[user?.role?.code] ?? "dashboard";

  // DEFAULT TAB SET TO 'approved'
  const [activeTab, setActiveTab] = useState("approved");
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false); // ✅ Update loader
  const [freelancers, setFreelancers] = useState([]);

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });

  // Action States
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Rate Card Modal States
  const [showRateCardModal, setShowRateCardModal] = useState(false);
  const [rateCardData, setRateCardData] = useState([]);
  const [rateCardFreelancerName, setRateCardFreelancerName] = useState("");
  const [rateCardCurrency, setRateCardCurrency] = useState("");

  // Status mapping for API
  const statusMap = {
    pending: 0,
    approved: 1,
    rejected: 2
  };

  // Status UI Config
  const statusConfig = {
    0: { label: "Pending", color: "warning", icon: <ClockCircleOutlined /> },
    1: { label: "Approved", color: "success", icon: <CheckCircleOutlined /> },
    2: { label: "Rejected", color: "error", icon: <CloseCircleOutlined /> },
  };

  // Onboarding Status UI Config
  const onboardingStatusConfig = {
    registered: { label: "Registered", color: "default", icon: <UserAddOutlined /> },
    profile_incomplete: { label: "Profile Incomplete", color: "warning", icon: <FileTextOutlined /> },
    profile_submitted: { label: "Profile Submitted", color: "processing", icon: <ClockCircleOutlined /> },
    under_review: { label: "Under Review", color: "processing", icon: <EyeOutlined /> },
    approved: { label: "Approved", color: "success", icon: <CheckCircleOutlined /> },
    rejected: { label: "Rejected", color: "error", icon: <CloseCircleOutlined /> },
    suspended: { label: "Suspended", color: "volcano", icon: <StopOutlined /> },
  };

  // ✅ MOBILE FORMATTER
  const formatMobile = (freelancer) => {
    if (freelancer.mobile) {
      if (typeof freelancer.mobile === 'object') {
        return `${freelancer.mobile.country_code} ${freelancer.mobile.number}`;
      }
      return freelancer.mobile;
    }
    return "—";
  };

  /**
   * ✅ MAIN FIX FOR SEARCH
   */
  const flattenFreelancersForSearch = (list = []) => {
    return list.map((f) => {
      const first = f?.name?.first_name || "";
      const last = f?.name?.last_name || "";
      const fullName = `${first} ${last}`.trim();

      const email = f?.email || "";
      const phone = formatMobile(f);

      const location = [
        f?.location?.city,
        f?.location?.state,
        f?.location?.country,
      ]
        .filter(Boolean)
        .join(" ");

      const experience = `${f?.professional?.experience_years || 0} years`;

      let servicesText = "";
      if (Array.isArray(f?.services_offered)) {
        servicesText = f.services_offered
          .map((svc) => {
            const categoryLabel = svc?.category?.label || "";
            const subcats = Array.isArray(svc?.subcategories)
              ? svc.subcategories.map((s) => s?.type?.label || "").filter(Boolean).join(" ")
              : "";
            return `${categoryLabel} ${subcats}`.trim();
          })
          .filter(Boolean)
          .join(" ");
      }

      const onboarding = f?.onboarding_status || "";
      const statusLabel = statusConfig[f?.status_info?.status ?? 0]?.label || "";

      return {
        ...f,
        __search_name: fullName,
        __search_email: email,
        __search_mobile: phone,
        __search_location: location,
        __search_experience: experience,
        __search_services: servicesText,
        __search_onboarding: onboarding,
        __search_status: statusLabel,
      };
    });
  };

  // Fetch Freelancers
  const fetchFreelancers = useCallback(
    async (page = 1, limit = 10) => {
      if (!token || !perm.canView) return;
      setLoading(true);

      try {
        const params = {
          page,
          limit,
          status: statusMap[activeTab],
        };

        const res = await apiService.get("/freelancer", params);

        if (res.success) {
          setFreelancers(flattenFreelancersForSearch(res.freelancers || []));

          const paginationData = res.pagination || {};
          setPagination({
            currentPage: paginationData.page || 1,
            totalPages: paginationData.totalPages || 1,
            totalResults: paginationData.total || 0,
            itemsPerPage: paginationData.limit || limit,
          });

          if (res.stats) {
            setStats(res.stats);
          } else {
            const all = res.freelancers || [];
            setStats((prev) => ({ ...prev, [activeTab]: all.length }));
          }
        } else {
          message.error(res.message || "Failed to fetch freelancers");
          setFreelancers([]);
        }
      } catch (err) {
        console.error("Error fetching freelancers:", err);
        message.error("Failed to load freelancers");
      } finally {
        setLoading(false);
      }
    },
    [activeTab, token, perm.canView]
  );

  useEffect(() => {
    fetchFreelancers(pagination.currentPage, pagination.itemsPerPage);
  }, [activeTab, fetchFreelancers]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPagination((p) => ({ ...p, currentPage: 1 }));
  };

  const handlePageChange = (page, limit) => {
    fetchFreelancers(page, limit);
  };

  const handleRefresh = () => {
    fetchFreelancers(pagination.currentPage, pagination.itemsPerPage);
  };

  // ✅ CUSTOM UPDATE API FUNCTION
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const res = await apiService.put(`/${roleSlug}/update`);
      
      if (res.success) {
        message.success("Update successful!");
        handleRefresh();
      } else {
        message.error(res.message || "Failed to update");
      }
    } catch (error) {
      console.error("Update Error: ", error);
      message.error("Something went wrong while updating");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const response = await apiService.put(`/freelancer/${id}/status`, { status: 1 });
      if (response.success) {
        message.success("Freelancer approved successfully!");
        handleRefresh();
      } else {
        message.error(response.message || "Failed to approve freelancer");
      }
    } catch (err) {
      message.error("Failed to approve freelancer");
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (record) => {
    setSelectedFreelancer(record);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      message.error("Please provide a rejection reason");
      return;
    }

    setActionLoading(selectedFreelancer._id);
    try {
      const response = await apiService.put(
        `/freelancer/${selectedFreelancer._id}/status`,
        {
          status: 2,
          rejection_reason: rejectionReason,
        }
      );

      if (response.success) {
        message.success("Freelancer rejected successfully!");
        handleRefresh();
        setShowRejectModal(false);
      } else {
        message.error(response.message || "Failed to reject freelancer");
      }
    } catch (err) {
      message.error("Failed to reject freelancer");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (freelancer) => {
    navigate(`/dashboard/${roleSlug}/freelancer/view?freelancerId=${freelancer._id}`);
  };

  const handleViewRateCard = (record) => {
    const rows = [];
    record.services_offered?.forEach(service => {
      service.subcategories?.forEach(sub => {
        rows.push({
          _id: sub._id,
          categoryLabel: service.category?.label,
          subServiceLabel: sub.type?.label,
          price_range: sub.price_range,
          unit: sub.unit
        });
      });
    });

    setRateCardData(rows);
    setRateCardFreelancerName(`${record.name?.first_name} ${record.name?.last_name}`);
    setRateCardCurrency(record.payment?.preferred_currency?.symbol || "");
    setShowRateCardModal(true);
  };

  // --- MAIN TABLE COLUMNS ---
  const columns = useMemo(() => {
    const baseCols = [
      {
        title: "Freelancer Profile",
        key: "freelancer_profile",
        width: 280,
        render: (_, record) => (
          <div className="flex items-center gap-3">
            <Avatar
              size={48}
              style={{
                background: THEME.bgLight,
                color: THEME.primary,
                border: `1px solid ${THEME.secondary}20`
              }}
            >
              {record.name?.first_name?.[0]?.toUpperCase() || "F"}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-800 truncate text-base">
                {record.name?.first_name} {record.name?.last_name}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <MailOutlined /> {record.email}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Joined: {moment(record.createdAt).format("DD MMM YYYY")}
              </div>
            </div>
          </div>
        ),
      }
    ];

    if (activeTab !== 'approved') {
      baseCols.push({
        title: "Onboarding Status",
        key: "onboarding_status",
        width: 180,
        render: (_, record) => {
          const status = record.onboarding_status || "registered";
          const config = onboardingStatusConfig[status];
          return (
            <Tag
              color={config.color}
              style={{
                borderRadius: 12,
                padding: "2px 10px",
                display: "flex",
                width: "fit-content",
                alignItems: "center",
                gap: "6px"
              }}
            >
              {config.icon} {config.label}
            </Tag>
          );
        },
      });
    }

    baseCols.push(
      {
        title: "Contact & Location",
        key: "contact_location",
        width: 200,
        render: (_, record) => {
          const location = [
            record.location?.city,
            record.location?.state
          ].filter(Boolean).join(", ");

          return (
            <Space direction="vertical" size={0}>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <PhoneOutlined className="text-gray-400" />
                <span>{formatMobile(record)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <GlobalOutlined className="text-gray-400" />
                <Tooltip title={`${location}, ${record.location?.country || ''}`}>
                  <span className="truncate max-w-[150px]">{location || "—"}</span>
                </Tooltip>
              </div>
            </Space>
          );
        },
      },
      {
        title: "Professional Info",
        key: "professional_info",
        width: 150,
        render: (_, record) => (
          <Space direction="vertical" size={2}>
            <Tag color="purple">
              <SafetyCertificateOutlined className="mr-1" />
              {record.professional?.experience_years || 0} Years Exp.
            </Tag>
            <div className="text-xs text-gray-500 pl-1">
              {record.services_offered?.length || 0} Services Offered
            </div>
          </Space>
        ),
      },
      {
        title: "Status",
        key: "status",
        width: 130,
        render: (_, record) => {
          const status = record.status_info?.status ?? 0;
          const config = statusConfig[status];
          return (
            <Tag
              color={config.color}
              style={{
                borderRadius: 12,
                padding: '2px 10px',
                display: 'flex',
                width: 'fit-content',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {config.icon} {config.label}
            </Tag>
          );
        },
      },
      {
        title: "Actions",
        fixed: "right",
        key: "actions",
        width: 140,
        align: 'center',
        render: (_, record) => (
          <Space>
            <Tooltip title="View Details">
              <Button
                icon={<EyeOutlined style={{ color: THEME.primary }} />}
                size="small"
                shape="circle"
                onClick={() => handleViewDetails(record)}
                style={{ borderColor: THEME.primary }}
              />
            </Tooltip>

            {activeTab === 'approved' && (
              <Tooltip title="View Rate Card">
                <Button
                  icon={<CreditCardOutlined style={{ color: '#13c2c2' }} />}
                  size="small"
                  shape="circle"
                  onClick={() => handleViewRateCard(record)}
                  style={{ borderColor: '#13c2c2' }}
                />
              </Tooltip>
            )}

            {(activeTab === "pending" || activeTab === "rejected") && perm.canApprove && (
              <Tooltip title={activeTab === 'rejected' ? "Re-Approve" : "Approve"}>
                <Popconfirm
                  title="Approve Freelancer"
                  description="Are you sure you want to approve this freelancer?"
                  onConfirm={() => handleApprove(record._id)}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ style: { background: THEME.success, borderColor: THEME.success } }}
                >
                  <Button
                    type="primary"
                    size="small"
                    shape="circle"
                    icon={activeTab === 'rejected' ? <ReloadOutlined /> : <CheckOutlined />}
                    style={{ backgroundColor: THEME.success, borderColor: THEME.success }}
                    loading={actionLoading === record._id}
                  />
                </Popconfirm>
              </Tooltip>
            )}

            {(activeTab === "pending" || activeTab === "approved") && perm.canReject && (
              <Tooltip title={activeTab === 'approved' ? "Reject/Suspend" : "Reject"}>
                <Button
                  danger
                  size="small"
                  shape="circle"
                  icon={<CloseOutlined />}
                  onClick={() => openRejectModal(record)}
                  loading={actionLoading === record._id}
                />
              </Tooltip>
            )}
          </Space>
        ),
      }
    );

    return baseCols;
  }, [activeTab, perm, actionLoading, navigate, roleSlug]);

  if (!perm.canView) {
    return (
      <div className="p-6 text-center">
        <Alert
          message="Access Denied"
          description="You don't have permission to view freelancers."
          type="error"
          showIcon
        />
      </div>
    );
  }

  // --- TAB CONFIGURATION ---
  const tabItems = [
    {
      key: 'approved',
      label: (
        <span>
          <CheckCircleOutlined /> Approved
          <Badge count={stats.approved} style={{ marginLeft: 8, backgroundColor: THEME.success }} />
        </span>
      )
    },
    {
      key: 'pending',
      label: (
        <span>
          <ClockCircleOutlined /> Pending
          <Badge count={stats.pending} style={{ marginLeft: 8, backgroundColor: THEME.warning }} />
        </span>
      )
    },
    {
      key: 'rejected',
      label: (
        <span>
          <CloseCircleOutlined /> Rejected
          <Badge count={stats.rejected} style={{ marginLeft: 8, backgroundColor: THEME.error }} />
        </span>
      )
    }
  ];

  // --- RATE CARD MODAL COLUMNS ---
  const rateCardColumns = [
    {
      title: "Service",
      dataIndex: "categoryLabel",
      key: "category",
      render: text => <Text strong>{text || "N/A"}</Text>
    },
    {
      title: "Sub Service",
      dataIndex: "subServiceLabel",
      key: "subService",
      render: text => <Tag color="blue">{text || "N/A"}</Tag>
    },
    {
      title: "Price",
      dataIndex: "price_range",
      key: "price_range",
      render: (text) =>
        text ? (
          <Tag color="green" style={{ fontSize: 14 }}>
            {rateCardCurrency} {text}
          </Tag>
        ) : (
          <Tag color="orange">Not Set</Tag>
        )
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      render: text => <Text type="secondary">{text || "-"}</Text>
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* 1. Header (UI EXACTLY RESTORED TO ORIGINAL) */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={3} style={{ margin: 0 }}>Freelancer Management</Title>
            <Text type="secondary">Review applications and manage freelancer profiles.</Text>
          </div>
        </div>
      </div>

      {/* 2. Main Content */}
      <Card bordered={false} className="shadow-md rounded-lg" bodyStyle={{ padding: 0 }}>

        {/* Filter Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          size="large"
          tabBarStyle={{ margin: 0, paddingLeft: 16, paddingTop: 16, background: '#fafafa' }}
          items={tabItems}
        />

        {/* ✅ ACTION BUTTONS ADDED HERE WITHOUT BREAKING UI (Matches screenshot) */}
      

        {/* Data Table */}
        <div className="p-0">
          <CustomTable
            columns={columns}
            data={freelancers}
            loading={loading}
            totalItems={pagination.totalResults}
            currentPage={pagination.currentPage}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            scroll={{ x: 1000 }}
            rowKey="_id"
          />
        </div>
      </Card>

      {/* 3. Reject Modal */}
      <Modal
        open={showRejectModal}
        title={
          <div className="flex items-center gap-2 text-red-600 font-bold">
            <CloseCircleOutlined /> Reject Application
          </div>
        }
        onCancel={() => setShowRejectModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>,
          <Button
            key="reject"
            type="primary"
            danger
            loading={actionLoading === selectedFreelancer?._id}
            disabled={!rejectionReason.trim()}
            onClick={handleReject}
          >
            Confirm Rejection
          </Button>,
        ]}
        width={500}
        destroyOnClose
        centered
      >
        {selectedFreelancer && (
          <div className="pt-2">
            <Alert
              message="Action Required"
              description="Please provide a valid reason for rejection."
              type="warning"
              showIcon
              className="mb-4"
            />

            <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-center gap-3">
                <Avatar size="small">{selectedFreelancer.name?.first_name?.[0]}</Avatar>
                <div>
                  <div className="font-semibold text-sm text-gray-800">
                    {selectedFreelancer.name?.first_name} {selectedFreelancer.name?.last_name}
                  </div>
                  <div className="text-xs text-gray-500">{selectedFreelancer.email}</div>
                </div>
              </div>
            </div>

            <Text strong className="block mb-2">Rejection Reason:</Text>
            <TextArea
              rows={4}
              placeholder="E.g., Incomplete profile information..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              maxLength={500}
              showCount
            />
          </div>
        )}
      </Modal>

      {/* 4. RATE CARD MODAL */}
      <Modal
        open={showRateCardModal}
        title={
          <div className="flex items-center gap-2 text-gray-700">
            <CreditCardOutlined style={{ color: '#13c2c2' }} />
            Rate Card: <span className="font-bold">{rateCardFreelancerName}</span>
          </div>
        }
        onCancel={() => setShowRateCardModal(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setShowRateCardModal(false)}>
            Close
          </Button>
        ]}
        width={700}
        centered
      >
        <Table
          dataSource={rateCardData}
          columns={rateCardColumns}
          pagination={false}
          rowKey="_id"
          bordered
          size="small"
          locale={{ emptyText: "No services found in rate card" }}
        />
      </Modal>

    </div>
  );
};

export default Freelancers;