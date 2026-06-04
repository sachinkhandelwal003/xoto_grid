import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import {
  Eye, User, Mail, Phone, AlertCircle, CheckCircle,
  Clock, Building2, Banknote, FileText,
  Calendar, TrendingUp, RefreshCw
} from "lucide-react";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../../CMS/pages/custom/CustomTable";
import dayjs from "dayjs";
import { Card, Tag, Badge, Progress, Modal, Alert, Button, Input, Tooltip } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, EyeOutlined, RedoOutlined } from "@ant-design/icons";

const PURPLE = "#5C039B";
const PURPLE_LIGHT = "#FAF5FF";
const PURPLE_BORDER = "#E9D5FF";

const roleSlugMap = {
  '0': 'superadmin',
  '1': 'admin',
  '2': "customer",
  '5': 'vendor-b2c',
  '6': 'vendor-b2b',
  '7': 'freelancer',
  '11': 'accountant',
  '12': 'supervisor',
  '15': "agency",
  '16': "agent",
  '17': "developer",
  '18': "vault-admin",
  '22': "vaultagent",
  '21': "vaultpartner",
  '24': "GridAdvisor",
  '26': "vault-advisor",
  '23': "vault-ops",
  '25': "gridreferralpartner",
};

// ================= STATUS CONFIGURATION =================
// Row 1: Review & Under Review Statuses (Need Immediate Attention)
const REVIEW_STATUSES = [
  { key: 'all', label: 'All Cases', icon: '📋', color: PURPLE },
  { key: 'Assigned - Pending Review', label: 'Pending Review', icon: '👀', color: "#D97706" },
  { key: 'Under Review', label: 'Under Review', icon: '🔍', color: "#3B82F6" },
  { key: 'Returned - Pending Correction', label: 'Returned', icon: '⚠️', color: "#DC2626" },
  { key: 'Resubmitted-After Correction', label: 'Resubmitted', icon: '🔄', color: "#8B5CF6" }
];

// Row 2: Bank Application & Pipeline Statuses
const PIPELINE_STATUSES = [
  { key: 'Bank Application', label: 'Bank Application', icon: '🏦', color: "#8B5CF6" },
  { key: 'Collecting Documentation', label: 'Collecting Docs', icon: '📄', color: "#F59E0B" },
  { key: 'Pre-Approved', label: 'Pre-Approved', icon: '✅', color: "#10B981" },
  { key: 'Valuation', label: 'Valuation', icon: '🏠', color: "#F59E0B" },
  { key: 'FOL Processed', label: 'FOL Processed', icon: '📑', color: "#6366F1" },
  { key: 'FOL Issued', label: 'FOL Issued', icon: '📨', color: "#06B6D4" },
  { key: 'FOL Signed', label: 'FOL Signed', icon: '✍️', color: "#14B8A6" },
  { key: 'Disbursed', label: 'Disbursed', icon: '💰', color: "#059669" },
  { key: 'Draft', label: 'Draft', icon: '📝', color: "#6B7280" },
  { key: 'Submitted to Xoto', label: 'Submitted', icon: '📤', color: "#8B5CF6" },
  { key: 'In Ops Queue - Pending Pick-up', label: 'Ops Queue', icon: '⏳', color: "#F59E0B" },
  { key: 'Rejected', label: 'Rejected', icon: '❌', color: "#DC2626" },
  { key: 'Lost', label: 'Lost', icon: '📉', color: "#6B7280" }
];

const OpsAssignedcases = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "superadmin";

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCases, setTotalCases] = useState(0);
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [viewModal, setViewModal] = useState(null);
  const [toast, setToast] = useState(null);

  const getCaseId = (row) => row._id || row.id;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatCurrency = (value) => {
    if (!value) return "AED 0";
    return `AED ${value.toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return dayjs(date).format("DD MMM YYYY, hh:mm A");
  };

  // Fetch assigned cases
  const fetchAssignedCases = useCallback(async (page = 1, limit = 10, status = activeStatus, searchTerm = search) => {
    setLoading(true);
    try {
      let url = `/vault/cases/ops/my-cases?page=${page}&limit=${limit}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (status !== "all") url += `&caseStatus=${status}`;

      const response = await apiService.get(url);
      
      if (response?.success) {
        setCases(response.data || []);
        setTotalCases(response.pagination?.totalItems || response.data?.length || 0);
      } else {
        showToast(response?.message || "Failed to load assigned cases", "error");
      }
    } catch (err) {
      console.error("Error fetching assigned cases:", err);
      showToast(err?.response?.data?.message || "Failed to load assigned cases", "error");
    } finally {
      setLoading(false);
    }
  }, [activeStatus, search]);

  useEffect(() => {
    fetchAssignedCases(currentPage, itemsPerPage, activeStatus, search);
  }, [currentPage, itemsPerPage, activeStatus, search, fetchAssignedCases]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusClick = (statusKey) => {
    setActiveStatus(statusKey);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setActiveStatus("all");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchAssignedCases(currentPage, itemsPerPage, activeStatus, search);
  };

  const handleViewCase = (row) => {
    setViewModal(row);
  };

  const handleReviewCase = (id) => {
    navigate(`/dashboard/${roleSlug}/case/assigned/view/${id}`);
  };

  // Get status badge configuration
  const getStatusBadge = (status) => {
    const statusMap = {
      'Draft': { color: "#6B7280", bg: "#F3F4F6", text: "Draft", icon: <ClockCircleOutlined /> },
      'Submitted to Xoto': { color: "#8B5CF6", bg: "#F3E8FF", text: "Submitted", icon: <ClockCircleOutlined /> },
      'In Ops Queue - Pending Pick-up': { color: "#F59E0B", bg: "#FFFBEB", text: "In Queue", icon: <ClockCircleOutlined /> },
      'Assigned - Pending Review': { color: "#D97706", bg: "#FFFBEB", text: "Pending Review", icon: <ClockCircleOutlined /> },
      'Under Review': { color: "#3B82F6", bg: "#EFF6FF", text: "Under Review", icon: <EyeOutlined /> },
      'Returned - Pending Correction': { color: "#DC2626", bg: "#FEF2F2", text: "Returned", icon: <ClockCircleOutlined /> },
      'Resubmitted-After Correction': { color: "#8B5CF6", bg: "#F3E8FF", text: "Resubmitted", icon: <RedoOutlined /> },
      'Bank Application': { color: "#8B5CF6", bg: "#F3E8FF", text: "Bank Application", icon: <ClockCircleOutlined /> },
      'Collecting Documentation': { color: "#F59E0B", bg: "#FFFBEB", text: "Collecting Docs", icon: <ClockCircleOutlined /> },
      'Pre-Approved': { color: "#10B981", bg: "#ECFDF5", text: "Pre-Approved", icon: <CheckCircleOutlined /> },
      'Valuation': { color: "#F59E0B", bg: "#FFFBEB", text: "Valuation", icon: <ClockCircleOutlined /> },
      'FOL Processed': { color: "#6366F1", bg: "#EEF2FF", text: "FOL Processed", icon: <ClockCircleOutlined /> },
      'FOL Issued': { color: "#06B6D4", bg: "#ECFEFF", text: "FOL Issued", icon: <CheckCircleOutlined /> },
      'FOL Signed': { color: "#14B8A6", bg: "#F0FDFA", text: "FOL Signed", icon: <CheckCircleOutlined /> },
      'Disbursed': { color: "#059669", bg: "#ECFDF5", text: "Disbursed", icon: <CheckCircleOutlined /> },
      'Rejected': { color: "#DC2626", bg: "#FEF2F2", text: "Rejected", icon: <AlertCircle /> },
      'Lost': { color: "#6B7280", bg: "#F3F4F6", text: "Lost", icon: <AlertCircle /> }
    };
    return statusMap[status] || { color: "#6B7280", bg: "#F3F4F6", text: status, icon: <ClockCircleOutlined /> };
  };

  // Get count for each status
  const getStatusCount = (statusKey) => {
    if (statusKey === 'all') return cases.length;
    return cases.filter(c => c.currentStatus === statusKey).length;
  };

  // Calculate document progress
  const getDocumentProgress = (row) => {
    const uploaded = row.documentStatus?.documentsUploadedCount || 0;
    const total = row.documentStatus?.requiredDocuments?.length || 0;
    return total > 0 ? (uploaded / total) * 100 : 0;
  };

  // Columns for CustomTable
  const columns = [
    {
      key: "caseReference",
      title: "Case ID",
      width: 180,
      render: (_, row) => (
        <div style={{ padding: "4px 0" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: PURPLE }}>
            {row.caseReference}
          </p>
          <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
            Assigned: {formatDate(row.assignedTo?.assignedAt)}
          </p>
          {row.resubmissionCount > 0 && (
            <Tag color="purple" style={{ fontSize: 10, marginTop: 4 }}>
              <RedoOutlined /> Resubmitted: {row.resubmissionCount}x
            </Tag>
          )}
        </div>
      ),
    },
    {
      key: "clientInfo",
      title: "Client Info",
      width: 220,
      render: (_, row) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
            <User size={13} color="#9CA3AF" />
            <span style={{ fontWeight: 500 }}>{row.clientInfo?.fullName || "N/A"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280", marginTop: 4 }}>
            <Mail size={12} color="#9CA3AF" />
            <span>{row.clientInfo?.email || "N/A"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280", marginTop: 2 }}>
            <Phone size={12} color="#9CA3AF" />
            <span>{row.clientInfo?.mobile || "N/A"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "loanDetails",
      title: "Loan Details",
      width: 220,
      render: (_, row) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
            <Banknote size={13} color="#9CA3AF" />
            <span style={{ fontWeight: 500 }}>{formatCurrency(row.loanInfo?.requestedAmount)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280", marginTop: 4 }}>
            <Building2 size={12} color="#9CA3AF" />
            <span>{row.loanInfo?.selectedBank || "N/A"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280", marginTop: 2 }}>
            <TrendingUp size={12} color="#9CA3AF" />
            <span>{row.loanInfo?.interestRatePercentage || 0}%</span>
          </div>
        </div>
      ),
    },
    {
      key: "documents",
      title: "Documents",
      width: 150,
      render: (_, row) => {
        const uploaded = row.documentStatus?.documentsUploadedCount || 0;
        const total = row.documentStatus?.requiredDocuments?.length || 0;
        const percentage = getDocumentProgress(row);
        return (
          <div style={{ minWidth: 120 }}>
            <Progress 
              percent={Math.round(percentage)} 
              size="small" 
              strokeColor={percentage === 100 ? "#10b981" : PURPLE}
              format={(percent) => `${percent}%`}
            />
            <p style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>
              {uploaded} / {total} uploaded
            </p>
          </div>
        );
      }
    },
    {
      key: "status",
      title: "Status",
      width: 160,
      render: (_, row) => {
        const status = getStatusBadge(row.currentStatus);
        return (
          <Tooltip title={row.currentStatus}>
            <Badge 
              color={status.color} 
              text={
                <span style={{ color: status.color, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                  {status.icon}
                  {status.text}
                </span>
              }
            />
          </Tooltip>
        );
      }
    },
    {
      key: "actions",
      title: "Actions",
      width: 200,
      render: (_, row) => {
        const id = getCaseId(row);
        const isResubmitted = row.currentStatus === 'Resubmitted-After Correction';
        const isReturned = row.currentStatus === 'Returned - Pending Correction';
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => handleViewCase(row)}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                background: PURPLE_LIGHT, border: `1px solid ${PURPLE_BORDER}`,
                borderRadius: 7, fontSize: 12, fontWeight: 600, color: PURPLE,
                cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = PURPLE;
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = PURPLE_LIGHT;
                e.target.style.color = PURPLE;
              }}
            >
              <Eye size={13} /> View
            </button>
            <button
              onClick={() => handleReviewCase(id)}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                background: (isResubmitted || isReturned) ? PURPLE : "#fff",
                border: `1px solid ${PURPLE_BORDER}`,
                borderRadius: 7, fontSize: 12, fontWeight: 600,
                color: (isResubmitted || isReturned) ? "#fff" : "#374151",
                cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = PURPLE;
                e.target.style.borderColor = PURPLE;
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                if (isResubmitted || isReturned) {
                  e.target.style.background = PURPLE;
                } else {
                  e.target.style.background = "#fff";
                }
                e.target.style.color = (isResubmitted || isReturned) ? "#fff" : "#374151";
              }}
            >
              <FileText size={13} /> {(isResubmitted || isReturned) ? "Review Now" : "Review"}
            </button>
          </div>
        );
      }
    }
  ];

  // Row 1: Review & Under Review Status Buttons
  const ReviewStatusButtons = () => (
    <div style={{ 
      marginBottom: 16,
      background: "#fff", 
      borderRadius: 16, 
      padding: "16px 20px",
      border: `1px solid ${PURPLE_BORDER}`,
      overflowX: "auto",
      whiteSpace: "nowrap"
    }}>
      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: PURPLE, display: "flex", alignItems: "center", gap: 8 }}>
        <EyeOutlined /> REVIEW & UNDER REVIEW
        <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 400 }}>(Cases needing immediate attention)</span>
      </div>
      <div style={{ display: "inline-flex", gap: 8, flexWrap: "wrap" }}>
        {REVIEW_STATUSES.map(status => {
          const count = getStatusCount(status.key);
          const isActive = activeStatus === status.key;
          return (
            <button
              key={status.key}
              onClick={() => handleStatusClick(status.key)}
              style={{
                padding: "6px 14px",
                borderRadius: 40,
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${isActive ? status.color : "#E5E7EB"}`,
                background: isActive ? status.color : "#fff",
                color: isActive ? "#fff" : status.color,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>{status.icon}</span>
              <span>{status.label}</span>
              {count > 0 && (
                <span style={{
                  background: isActive ? "rgba(255,255,255,0.2)" : `${status.color}20`,
                  padding: "2px 6px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 600,
                  marginLeft: 4,
                  color: isActive ? "#fff" : status.color
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Row 2: Bank Application & Pipeline Status Buttons
  const PipelineStatusButtons = () => (
    <div style={{ 
      marginBottom: 24,
      background: "#fff", 
      borderRadius: 16, 
      padding: "16px 20px",
      border: `1px solid ${PURPLE_BORDER}`,
      overflowX: "auto",
      whiteSpace: "nowrap"
    }}>
      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: "#10b981", display: "flex", alignItems: "center", gap: 8 }}>
        <CheckCircleOutlined /> BANK APPLICATION & PIPELINE
        <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 400 }}>(Active cases in mortgage journey)</span>
      </div>
      <div style={{ display: "inline-flex", gap: 8, flexWrap: "wrap" }}>
        {PIPELINE_STATUSES.map(status => {
          const count = getStatusCount(status.key);
          const isActive = activeStatus === status.key;
          return (
            <button
              key={status.key}
              onClick={() => handleStatusClick(status.key)}
              style={{
                padding: "6px 14px",
                borderRadius: 40,
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${isActive ? status.color : "#E5E7EB"}`,
                background: isActive ? status.color : "#fff",
                color: isActive ? "#fff" : status.color,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>{status.icon}</span>
              <span>{status.label}</span>
              {count > 0 && (
                <span style={{
                  background: isActive ? "rgba(255,255,255,0.2)" : `${status.color}20`,
                  padding: "2px 6px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 600,
                  marginLeft: 4,
                  color: isActive ? "#fff" : status.color
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Filter Bar
  const FilterBar = () => (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "16px 20px", marginBottom: 24,
      border: `1px solid ${PURPLE_BORDER}`, display: "flex", flexWrap: "wrap",
      alignItems: "center", gap: 12, justifyContent: "space-between"
    }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, flex: 1 }}>
        <Input
          placeholder="Search by case ID or client name..."
          value={search}
          onChange={handleSearch}
          style={{ width: 260 }}
          allowClear
          prefix={<User size={14} />}
        />
        <Button onClick={resetFilters}>Reset Filters</Button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 12, color: "#6B7280", background: PURPLE_LIGHT, padding: "6px 12px", borderRadius: 8 }}>
          <Calendar size={12} style={{ marginRight: 4 }} />
          Last updated: {formatDate(new Date())}
        </span>
        <Button 
          icon={<RefreshCw size={14} />} 
          onClick={handleRefresh}
          loading={loading}
        >
          Refresh
        </Button>
      </div>
    </div>
  );

  // View Modal
  const renderViewModal = () => {
    if (!viewModal) return null;

    const status = getStatusBadge(viewModal.currentStatus);
    const uploaded = viewModal.documentStatus?.documentsUploadedCount || 0;
    const total = viewModal.documentStatus?.requiredDocuments?.length || 0;
    const percentage = total > 0 ? (uploaded / total) * 100 : 0;
    const isResubmitted = viewModal.currentStatus === 'Resubmitted-After Correction';
    const isReturned = viewModal.currentStatus === 'Returned - Pending Correction';

    return (
      <Modal
        title={`Case Details: ${viewModal.caseReference}`}
        open={!!viewModal}
        onCancel={() => setViewModal(null)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setViewModal(null)}>Close</Button>,
          <Button 
            key="review" 
            type="primary" 
            onClick={() => {
              setViewModal(null);
              handleReviewCase(viewModal._id);
            }}
            style={{ background: PURPLE }}
          >
            {(isResubmitted || isReturned) ? "Review Now" : "Review Case"}
          </Button>
        ]}
      >
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <Alert
            message={`Status: ${status.text}`}
            description={`Case assigned on ${formatDate(viewModal.assignedTo?.assignedAt)}`}
            type={isReturned ? 'error' : isResubmitted ? 'warning' : 'info'}
            showIcon
            style={{ marginBottom: 16 }}
          />

          {viewModal.resubmissionCount > 0 && (
            <Alert
              message={`Resubmission #${viewModal.resubmissionCount}`}
              description="This case has been resubmitted after corrections."
              type="warning"
              showIcon
              icon={<RedoOutlined />}
              style={{ marginBottom: 16 }}
            />
          )}

          <Card title="Client Information" size="small" style={{ marginBottom: 16 }}>
            <table style={{ width: "100%", fontSize: 13 }}>
              <tbody>
                <tr><td style={{ padding: "4px 0", color: "#6B7280", width: 120 }}>Full Name:</td><td style={{ padding: "4px 0", fontWeight: 500 }}>{viewModal.clientInfo?.fullName}</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Email:</td><td style={{ padding: "4px 0" }}>{viewModal.clientInfo?.email}</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Mobile:</td><td style={{ padding: "4px 0" }}>{viewModal.clientInfo?.mobile}</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Nationality:</td><td style={{ padding: "4px 0" }}>{viewModal.clientInfo?.nationality}</td></tr>
              </tbody>
            </table>
          </Card>

          <Card title="Loan Information" size="small" style={{ marginBottom: 16 }}>
            <table style={{ width: "100%", fontSize: 13 }}>
              <tbody>
                <tr><td style={{ padding: "4px 0", color: "#6B7280", width: 120 }}>Loan Amount:</td><td style={{ padding: "4px 0", fontWeight: 500 }}>{formatCurrency(viewModal.loanInfo?.requestedAmount)}</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Interest Rate:</td><td style={{ padding: "4px 0" }}>{viewModal.loanInfo?.interestRatePercentage}%</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Tenure:</td><td style={{ padding: "4px 0" }}>{viewModal.loanInfo?.tenureYears} years</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Selected Bank:</td><td style={{ padding: "4px 0" }}>{viewModal.loanInfo?.selectedBank}</td></tr>
              </tbody>
            </table>
          </Card>

          <Card title="Document Status" size="small">
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <Progress type="circle" percent={Math.round(percentage)} width={100} strokeColor={percentage === 100 ? "#10b981" : PURPLE} />
              <div style={{ marginTop: 8 }}><span>{uploaded} / {total} documents uploaded</span></div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              {viewModal.documentStatus?.requiredDocuments?.slice(0, 10).map((doc, idx) => (
                <Tag key={idx} color={doc.isVerified ? "green" : (doc.isUploaded ? "orange" : "red")} style={{ fontSize: 11 }}>
                  {doc.documentType?.replace(/_/g, " ").toUpperCase()}
                </Tag>
              ))}
            </div>
          </Card>
        </div>
      </Modal>
    );
  };

  // Get header title based on active status
  const getHeaderTitle = () => {
    if (activeStatus === 'all') return 'All Cases';
    const reviewStatus = REVIEW_STATUSES.find(s => s.key === activeStatus);
    if (reviewStatus) return reviewStatus.label;
    const pipelineStatus = PIPELINE_STATUSES.find(s => s.key === activeStatus);
    return pipelineStatus?.label || activeStatus;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", padding: "28px 24px" }}>
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          display: "flex", alignItems: "center", gap: 8,
          background: toast.type === "success" ? "#059669" : "#DC2626",
          color: "#fff", padding: "12px 16px", borderRadius: 10,
          fontSize: 13, fontWeight: 600, boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        }}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>My Assigned Cases</h1>
        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
          View and review cases assigned to you
        </p>
      </div>

      {/* Row 1: Review & Under Review Status Buttons */}
      <ReviewStatusButtons />

      {/* Row 2: Bank Application & Pipeline Status Buttons */}
      <PipelineStatusButtons />

      {/* Filter Bar */}
      <FilterBar />

      {/* Case Count Info */}
      <div style={{ marginBottom: 16, fontSize: 13, color: "#6B7280", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span>
          Showing <strong>{cases.length}</strong> case{cases.length !== 1 ? 's' : ''} 
          {activeStatus !== 'all' && ` with status: ${getHeaderTitle()}`}
        </span>
        {cases.length > 0 && (
          <span style={{ fontSize: 11, background: PURPLE_LIGHT, padding: "4px 10px", borderRadius: 20, color: PURPLE }}>
            Total assigned: {cases.filter(c => c.assignedTo?.opsId).length}
          </span>
        )}
      </div>

      {/* Table */}
      <CustomTable
        columns={columns}
        data={cases}
        loading={loading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalCases}
        onPageChange={(page, size) => {
          setCurrentPage(page);
          if (size !== itemsPerPage) setItemsPerPage(size);
        }}
      />

      {renderViewModal()}
    </div>
  );
};

export default OpsAssignedcases;