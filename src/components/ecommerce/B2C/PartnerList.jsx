// src/components/Vault/PartnerList.jsx
import { useState, useEffect } from "react";
import { Avatar } from "antd";
import {
  Eye,
  Building2,
  Mail,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  UserPlus,
  Search,
  Filter,
  X,
  User,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Trash2,
  Edit,
  RefreshCw,
  Shield,
  Ban,
  UserCheck,
  Tag as TagIcon,
} from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { useNavigate } from "react-router-dom";
import { Modal, message, Dropdown, Space, Tag, Tooltip } from "antd";
import CustomTable from "../../CMS/pages/custom/CustomTable";

const BRAND_PURPLE = "#5C039B";
const BRAND_LIGHT = "#f3e8ff";
const SUCCESS_GREEN = "#10b981";
const WARNING_ORANGE = "#f59e0b";
const ERROR_RED = "#ef4444";

// Status badge component
const StatusBadge = ({ status }) => {
  const config = {
    active: { bg: "#d1fae5", color: "#065f46", icon: <CheckCircle size={12} />, label: "Active" },
    pending: { bg: "#fef3c7", color: "#92400e", icon: <Clock size={12} />, label: "Pending" },
    suspended: { bg: "#fee2e2", color: "#991b1b", icon: <Ban size={12} />, label: "Suspended" },
    inactive: { bg: "#f3f4f6", color: "#374151", icon: <XCircle size={12} />, label: "Inactive" },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium`} style={{ background: c.bg, color: c.color }}>
      {c.icon} {c.label}
    </span>
  );
};

// Partner Category Badge
const CategoryBadge = ({ category }) => {
  if (category === "company") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
        <Building2 size={12} /> Company
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
      <User size={12} /> Individual
    </span>
  );
};

export default function PartnerList() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPartners, setTotalPartners] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [suspendModalVisible, setSuspendModalVisible] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const navigate = useNavigate();

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDisplayName = (partner) => {
    if (partner.partnerCategory === "company") {
      return partner.companyName || partner.dbaName || "N/A";
    }
    return `${partner.individualDetails?.firstName || ""} ${partner.individualDetails?.lastName || ""}`.trim() || "N/A";
  };

  const getFirstName = (partner) => {
    if (partner.partnerCategory === "individual") {
      return partner.individualDetails?.firstName || "N/A";
    }
    return "—";
  };

  const getLastName = (partner) => {
    if (partner.partnerCategory === "individual") {
      return partner.individualDetails?.lastName || "N/A";
    }
    return "—";
  };

  const getCompanyName = (partner) => {
    if (partner.partnerCategory === "company") {
      return partner.companyName || "N/A";
    }
    return "—";
  };

  const getDBAName = (partner) => {
    return partner.dbaName || "—";
  };

  const getLocation = (partner) => {
    const addr = partner.billingAddress;
    return [addr?.area, addr?.city].filter(Boolean).join(", ") || "N/A";
  };

  const fetchPartners = async (page = 1, search = "", status = "", category = "") => {
    setLoading(true);
    try {
      let url = `/vault/partner/all?page=${page}&limit=${itemsPerPage}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status && status !== "all") url += `&status=${status}`;
      if (category && category !== "all") url += `&partnerCategory=${category}`;

      const response = await apiService.get(url);
      const data = response?.data || response;

      let partnersList = [];
      let total = 0;

      if (Array.isArray(data)) {
        partnersList = data;
        total = data.length;
      } else if (data?.data) {
        partnersList = data.data;
        total = data.total || data.data.length;
      } else if (data?.partners) {
        partnersList = data.partners;
        total = data.total || data.partners.length;
      }

      setPartners(partnersList);
      setTotalPartners(total);
    } catch (err) {
      setError(err.message || "Failed to load partners");
      message.error("Failed to load partners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPartners(currentPage, searchTerm, statusFilter, categoryFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, categoryFilter]);

  // API: Delete Partner
  const handleDeletePartner = async () => {
    if (!selectedPartner) return;
    setActionLoading(true);
    try {
      await apiService.delete(`/vault/partner/delete/${selectedPartner._id}`);
      message.success("Partner deleted successfully");
      setDeleteModalVisible(false);
      fetchPartners(currentPage, searchTerm, statusFilter, categoryFilter);
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to delete partner");
    } finally {
      setActionLoading(false);
      setSelectedPartner(null);
    }
  };

  // API: Activate Partner
  const handleActivatePartner = async (partner) => {
    setActionLoading(true);
    try {
      await apiService.post(`/vault/partner/activate/${partner._id}`);
      message.success(`Partner activated successfully`);
      fetchPartners(currentPage, searchTerm, statusFilter, categoryFilter);
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to activate partner");
    } finally {
      setActionLoading(false);
    }
  };

  // API: Suspend Partner
  const handleSuspendPartner = async () => {
    if (!selectedPartner) return;
    setActionLoading(true);
    try {
      await apiService.post(`/vault/partner/suspend/${selectedPartner._id}`, {
        reason: suspendReason || "No reason provided"
      });
      message.success("Partner suspended successfully");
      setSuspendModalVisible(false);
      setSuspendReason("");
      fetchPartners(currentPage, searchTerm, statusFilter, categoryFilter);
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to suspend partner");
    } finally {
      setActionLoading(false);
      setSelectedPartner(null);
    }
  };

  // Open suspend modal
  const openSuspendModal = (partner) => {
    setSelectedPartner(partner);
    setSuspendReason("");
    setSuspendModalVisible(true);
  };

  // Dropdown menu for actions
  const getActionMenuItems = (record) => [
    {
      key: "view",
      label: "View Details",
      icon: <Eye size={14} />,
      onClick: () => navigate(`/dashboard/vault-admin/partner-details/${record._id}`),
    },
    { type: "divider" },
    {
      key: "activate",
      label: "Activate",
      icon: <UserCheck size={14} style={{ color: SUCCESS_GREEN }} />,
      disabled: record.status === "active",
      onClick: () => handleActivatePartner(record),
    },
    {
      key: "suspend",
      label: "Suspend",
      icon: <Ban size={14} style={{ color: WARNING_ORANGE }} />,
      disabled: record.status === "suspended",
      onClick: () => openSuspendModal(record),
    },
    { type: "divider" },
    {
      key: "delete",
      label: "Delete Partner",
      icon: <Trash2 size={14} style={{ color: ERROR_RED }} />,
      danger: true,
      onClick: () => {
        setSelectedPartner(record);
        setDeleteModalVisible(true);
      },
    },
  ];

  const columns = [
    {
      key: "profile",
      title: "Profile",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={42}
            src={row.profilePic || undefined}
            style={{
              backgroundColor: !row.profilePic ? "#ede9fe" : "transparent",
              color: BRAND_PURPLE,
              fontWeight: 600,
            }}
          >
            {!row.profilePic && getInitials(getDisplayName(row))}
          </Avatar>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{getDisplayName(row)}</p>
            <div className="flex items-center gap-2 mt-1">
              <CategoryBadge category={row.partnerCategory} />
              <StatusBadge status={row.status} />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      title: "Category",
      sortable: true,
      render: (_, row) => <CategoryBadge category={row.partnerCategory} />,
    },
    {
      key: "company_info",
      title: "Company / Individual",
      render: (_, row) => {
        if (row.partnerCategory === "company") {
          return (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-sm text-gray-800">
                <Building2 size={13} className="text-purple-500" />
                <span className="font-medium">{getCompanyName(row)}</span>
              </div>
              {row.dbaName && (
                <div className="text-xs text-gray-500">
                  DBA: {row.dbaName}
                </div>
              )}
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2 text-sm text-gray-800">
            <User size={13} className="text-blue-500" />
            <span>{getFirstName(row)} {getLastName(row)}</span>
          </div>
        );
      },
    },
    {
      key: "dba_name",
      title: "DBA / Trade Name",
      render: (_, row) => (
        <span className="text-sm text-gray-600">
          {row.partnerCategory === "company" ? (row.dbaName || "—") : "—"}
        </span>
      ),
    },
    
    {
      key: "commission",
      title: "Commission",
      render: (_, row) => (
        <div className="text-sm font-semibold text-gray-700">
          {row.commissionConfiguration?.tier1?.commissionPercentage}% / {row.commissionConfiguration?.tier2?.commissionPercentage}%
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, row) => (
        <Dropdown menu={{ items: getActionMenuItems(row) }} trigger={["click"]} placement="bottomRight">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <MoreVertical size={16} className="text-gray-500" />
          </button>
        </Dropdown>
      ),
    },
  ];

  // Filter chips
  const FilterChip = ({ label, value, current, onClick }) => (
    <button
      onClick={() => onClick(value)}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        current === value
          ? "text-white shadow-sm"
          : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
      }`}
      style={current === value ? { background: BRAND_PURPLE } : {}}
    >
      {label}
    </button>
  );

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "suspended", label: "Suspended" },
    { value: "inactive", label: "Inactive" },
  ];

  const categoryOptions = [
    { value: "all", label: "All Types" },
    { value: "company", label: "Companies" },
    { value: "individual", label: "Individuals" },
  ];

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => fetchPartners(currentPage, searchTerm, statusFilter, categoryFilter)}
          className="px-5 py-2 rounded-xl transition flex items-center gap-2"
          style={{ background: BRAND_PURPLE, color: "#fff" }}
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Vault Partners</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalPartners} partner{totalPartners !== 1 ? "s" : ""} registered
          </p>
        </div>
        
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company name, email, or license..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition"
              style={{ focusRingColor: BRAND_PURPLE, borderColor: "#e2e8f0" }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <div className="flex gap-2">
              {categoryOptions.map((opt) => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  value={opt.value}
                  current={categoryFilter}
                  onClick={setCategoryFilter}
                />
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-gray-400" />
            <div className="flex gap-2">
              {statusOptions.map((opt) => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  value={opt.value}
                  current={statusFilter}
                  onClick={setStatusFilter}
                />
              ))}
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchPartners(currentPage, searchTerm, statusFilter, categoryFilter)}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-gray-400" : "text-gray-500"} />
          </button>
        </div>
      </div>

      {/* Table */}
      <CustomTable
        columns={columns}
        data={partners}
        loading={loading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalPartners}
        onPageChange={(page, size) => {
          setCurrentPage(page);
          if (size !== itemsPerPage) setItemsPerPage(size);
        }}
        emptyText={
          <div className="text-center py-12">
            <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No partners found</p>
            <button
              onClick={() => navigate("/dashboard/vault-admin/partner-onboard")}
              className="mt-3 text-sm font-medium hover:underline"
              style={{ color: BRAND_PURPLE }}
            >
              + Onboard your first partner
            </button>
          </div>
        }
      />

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-50">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <span className="text-lg font-semibold">Delete Partner</span>
          </div>
        }
        open={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedPartner(null);
        }}
        footer={[
          <button
            key="cancel"
            onClick={() => {
              setDeleteModalVisible(false);
              setSelectedPartner(null);
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>,
          <button
            key="delete"
            onClick={handleDeletePartner}
            disabled={actionLoading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete Partner
          </button>,
        ]}
        width={450}
        centered
      >
        <div className="py-4">
          <p className="text-gray-600">
            Are you sure you want to delete{" "}
            <strong className="text-gray-900">{selectedPartner ? getDisplayName(selectedPartner) : ""}</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
        </div>
      </Modal>

      {/* Suspend Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-50">
              <Ban size={20} className="text-orange-500" />
            </div>
            <span className="text-lg font-semibold">Suspend Partner</span>
          </div>
        }
        open={suspendModalVisible}
        onCancel={() => {
          setSuspendModalVisible(false);
          setSelectedPartner(null);
          setSuspendReason("");
        }}
        footer={[
          <button
            key="cancel"
            onClick={() => {
              setSuspendModalVisible(false);
              setSelectedPartner(null);
              setSuspendReason("");
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>,
          <button
            key="suspend"
            onClick={handleSuspendPartner}
            disabled={actionLoading}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
            Suspend Partner
          </button>,
        ]}
        width={450}
        centered
      >
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to suspend{" "}
            <strong className="text-gray-900">{selectedPartner ? getDisplayName(selectedPartner) : ""}</strong>?
          </p>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suspension Reason (Optional)
            </label>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Enter reason for suspension..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}