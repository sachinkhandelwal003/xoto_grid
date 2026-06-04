// src/pages/Advisor/VaultMortgageOpsList.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye, User, Mail, Phone, Loader2, AlertCircle, CheckCircle, XCircle, Trash2,
  Briefcase, MoreVertical, ShieldCheck, Calendar, TrendingUp, Building2, UserCog,
  PauseCircle, PlayCircle, FileText, Clock, Database
} from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../CMS/pages/custom/CustomTable";
import dayjs from "dayjs";

const PURPLE = "#5C039B";
const PURPLE_LIGHT = "#FAF5FF";
const PURPLE_BORDER = "#E9D5FF";

const VaultMortgageOpsList = () => {
  const navigate = useNavigate();

  const [opsList, setOpsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalOps, setTotalOps] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Filters & Tab State
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'active', 'suspended'
  const [toast, setToast] = useState(null);

  // Action states (Modals & Loading)
  const [actionLoading, setActionLoading] = useState(null);
  const [suspendModal, setSuspendModal] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const [activateModal, setActivateModal] = useState(null);

  const DEPARTMENTS = [
    "Mortgage Operations", "Underwriting", "Processing",
    "Quality Assurance", "Compliance",
  ];

  const getOpsId = (row) => row._id || row.id;
  
  const getOpsName = (row) => {
    // Handle nested name object structure from backend
    if (row.name) {
      return `${row.name.first_name || ""} ${row.name.last_name || ""}`.trim() || "Operations Staff";
    }
    // Fallback for flat structure
    return `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Operations Staff";
  };

  const getOpsEmail = (row) => row.email || "N/A";
  
  const getOpsPhone = (row) => {
    if (row.phone) {
      return `${row.phone.country_code || ""} ${row.phone.number || ""}`.trim();
    }
    return `${row.country_code || ""} ${row.phone_number || ""}`.trim() || "N/A";
  };

  const getOpsDepartment = (row) => row.department || "Mortgage Operations";
  
  const getOpsDesignation = (row) => row.designation || "Mortgage Operations Executive";
  
  const getCurrentApplications = (row) => row.workload?.currentApplications || row.currentApplications || 0;
  
  const getMaxCapacity = (row) => row.workload?.maxCapacity || row.maxCapacity || 30;
  
  const getQueueStatus = (row) => {
    const queue = row.queueStatus || {};
    return {
      pendingReview: queue.pendingReview || 0,
      inProgress: queue.inProgress || 0,
      waitingBank: queue.waitingBank || 0
    };
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch Mortgage Ops ─────────────────────────────────────────────────────────
  const fetchOps = useCallback(async (page = 1, limit = 10, tab = activeTab, searchTerm = search, dept = department) => {
    setLoading(true);
    try {
      let url = `/vault/ops/all?page=${page}&limit=${limit}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (dept && dept !== 'all') url += `&department=${encodeURIComponent(dept)}`;

      // Map tab to status filter
      if (tab === "active") url += `&status=active`;
      if (tab === "suspended") url += `&status=suspended`;

      const response = await apiService.get(url);
      const data = response?.data?.data || response?.data || [];

      let list = [];
      let total = 0;

      if (Array.isArray(data)) {
        list = data;
        total = response?.data?.total || data.length;
      } else if (data?.opsList) {
        list = data.opsList;
        total = data.total || data.opsList.length;
      } else if (data?.docs) {
        list = data.docs;
        total = data.totalDocs || data.docs.length;
      }

      setOpsList(list);
      setTotalOps(total);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to load mortgage operations staff", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, department]);

  // Re-fetch when dependencies change
  useEffect(() => {
    fetchOps(currentPage, itemsPerPage, activeTab, search, department);
  }, [currentPage, itemsPerPage, activeTab, search, department, fetchOps]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (value) => {
    setDepartment(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setDepartment("");
    setActiveTab("all");
    setCurrentPage(1);
  };

  // ── Action Handlers ───────────────────────────────────────────────────────
  const handleActivateConfirm = async () => {
    const id = getOpsId(activateModal);
    setActionLoading(id + "_activate");
    try {
      await apiService.post(`/vault/ops/activate/${id}`);
      showToast(`Staff "${getOpsName(activateModal)}" activated successfully ✅`);

      if (activeTab === "suspended") {
        setOpsList(prev => prev.filter(a => getOpsId(a) !== id));
        setTotalOps(prev => prev - 1);
      } else {
        setOpsList(prev =>
          prev.map(a => getOpsId(a) === id ? { ...a, isActive: true, suspendedAt: null } : a)
        );
      }
      setActivateModal(null);
    } catch (err) {
      showToast(err?.response?.data?.message || "Activation failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendConfirm = async () => {
    const id = getOpsId(suspendModal);
    setActionLoading(id + "_suspend");
    try {
      await apiService.post(`/vault/ops/suspend/${id}`, {
        suspensionReason: suspendReason.trim(),
      });
      showToast(`Staff "${getOpsName(suspendModal)}" suspended successfully ⚠️`);

      if (activeTab === "active") {
        setOpsList(prev => prev.filter(a => getOpsId(a) !== id));
        setTotalOps(prev => prev - 1);
      } else {
        setOpsList(prev =>
          prev.map(a => getOpsId(a) === id ? { ...a, isActive: false, suspendedAt: new Date() } : a)
        );
      }
      setSuspendModal(null);
      setSuspendReason("");
    } catch (err) {
      showToast(err?.response?.data?.message || "Suspension failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    const id = getOpsId(deleteModal);
    setActionLoading(id + "_delete");
    try {
      await apiService.delete(`/vault/ops/delete/${id}`);
      showToast(`Staff "${getOpsName(deleteModal)}" deleted successfully 🗑️`);
      setOpsList(prev => prev.filter(a => getOpsId(a) !== id));
      setTotalOps(prev => prev - 1);
      setDeleteModal(null);
    } catch (err) {
      showToast(err?.response?.data?.message || "Delete failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const menuItemStyle = (color) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    fontSize: 13,
    cursor: "pointer",
    color,
    borderBottom: "1px solid #F3F4F6",
    transition: "background 0.2s",
  });

  // ── Columns Definition ────────────────────────────────────────────────────
  const columns = [
    {
      key: "name",
      title: "Staff Member",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: PURPLE_LIGHT,
            border: `1.5px solid ${PURPLE_BORDER}`, display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0
          }}>
            {row.profilePic ? (
              <img src={row.profilePic} alt="avatar" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <User size={18} color={PURPLE} />
            )}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
              {getOpsName(row)}
            </p>
          
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Contact Info",
      render: (_, row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
            <Mail size={13} color="#9CA3AF" />
            <span>{getOpsEmail(row)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
            <Phone size={13} color="#9CA3AF" />
            <span>{getOpsPhone(row)}</span>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      title: "Department",
      render: (_, row) => (
        <div>
          <span style={{
            padding: "4px 10px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
            background: "#F3E8FF",
            color: PURPLE
          }}>
            {getOpsDepartment(row)}
          </span>
        </div>
      )
    },

    {
      key: "joinDate",
      title: "Join Date",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
          <Calendar size={13} color="#9CA3AF" />
          <span>{row.joinDate ? dayjs(row.joinDate).format("DD MMM YYYY") : "—"}</span>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_, row) => {
        const suspended = row.suspendedAt !== null && row.suspendedAt !== undefined;
        const active = row.isActive === true && !suspended;

        let statusLabel = "Active";
        let bg = "#ECFDF5";
        let color = "#059669";

        if (suspended) {
          statusLabel = "Suspended";
          bg = "#FEF2F2";
          color = "#DC2626";
        } else if (!active) {
          statusLabel = "Inactive";
          bg = "#FFFBEB";
          color = "#D97706";
        }

        return (
          <span style={{
            padding: "3px 10px",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 600,
            background: bg,
            color
          }}>
            {statusLabel}
          </span>
        );
      }
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, row) => {
        const id = getOpsId(row);
        const suspended = row.suspendedAt !== null && row.suspendedAt !== undefined;
        const isActive = row.isActive === true && !suspended;
        const isOpen = openMenuId === id;

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* View Button */}
            <button
              onClick={() => navigate(`/dashboard/vault-admin/mortgage-ops/${id}`)}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "6px 10px",
                background: PURPLE_LIGHT, border: `1px solid ${PURPLE_BORDER}`,
                borderRadius: 7, fontSize: 12, fontWeight: 600, color: PURPLE,
                cursor: "pointer", transition: "all 0.2s"
              }}
            >
              <Eye size={13} /> View
            </button>

            {/* Menu Dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setOpenMenuId(isOpen ? null : id)}
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px" }}
              >
                <MoreVertical size={18} color="#6B7280" />
              </button>

              {isOpen && (
                <div style={{
                  position: "absolute", right: 0, top: 30, background: "#fff",
                  border: "1px solid #E5E7EB", borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  width: 180, zIndex: 10
                }}>
                  {/* Activate - shown for suspended or inactive */}
                  {(suspended || !isActive) && (
                    <div
                      onClick={() => { setActivateModal(row); setOpenMenuId(null); }}
                      style={menuItemStyle("#059669")}
                    >
                      <PlayCircle size={14} /> Activate
                    </div>
                  )}

                  {/* Suspend - shown for active only */}
                  {isActive && !suspended && (
                    <div
                      onClick={() => { setSuspendModal(row); setOpenMenuId(null); }}
                      style={menuItemStyle("#D97706")}
                    >
                      <PauseCircle size={14} /> Suspend
                    </div>
                  )}

                  {/* Delete - always shown */}
                  <div
                    onClick={() => { setDeleteModal(row); setOpenMenuId(null); }}
                    style={menuItemStyle("#DC2626")}
                  >
                    <Trash2 size={14} /> Delete
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }
    }
  ];

  // Filter bar component
  const FilterBar = () => (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "16px 20px", marginBottom: 24,
      border: `1px solid ${PURPLE_BORDER}`, display: "flex", flexWrap: "wrap",
      alignItems: "center", gap: 12, justifyContent: "space-between"
    }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, flex: 1 }}>
        <input
          type="text"
          placeholder="Search by name, email or employee code..."
          value={search}
          onChange={handleSearch}
          style={{
            padding: "8px 14px", borderRadius: 10, border: `1px solid #E5E7EB`,
            fontSize: 13, width: 260, outline: "none", transition: "all 0.2s"
          }}
          onFocus={(e) => e.target.style.borderColor = PURPLE}
          onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
        />
        <select
          value={department}
          onChange={(e) => handleDepartmentChange(e.target.value)}
          style={{
            padding: "8px 14px", borderRadius: 10, border: `1px solid #E5E7EB`,
            fontSize: 13, background: "#fff", cursor: "pointer", outline: "none"
          }}
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button
          onClick={resetFilters}
          style={{
            padding: "8px 16px", borderRadius: 10, border: `1px solid #E5E7EB`,
            fontSize: 13, background: "#fff", cursor: "pointer", color: "#6B7280"
          }}
        >
          Reset Filters
        </button>
      </div>
   
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", padding: "28px 24px" }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          display: "flex", alignItems: "center", gap: 8,
          background: toast.type === "success" ? "#059669" : "#DC2626",
          color: "#fff", padding: "12px 16px", borderRadius: 10,
          fontSize: 13, fontWeight: 600, boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
        }}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Mortgage Operations</h1>
        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
          {totalOps} {activeTab === "all" ? "total" : activeTab} staff member{totalOps !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Custom Tabs */}
      <div style={{ display: "flex", gap: 32, borderBottom: `1px solid ${PURPLE_BORDER}`, marginBottom: 24 }}>
        {[
          { id: "all", label: "All Staff" },
          { id: "active", label: "Active" },
          { id: "suspended", label: "Suspended" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            style={{
              padding: "0 4px 12px", background: "transparent", border: "none",
              borderBottom: activeTab === tab.id ? `2px solid ${PURPLE}` : "2px solid transparent",
              color: activeTab === tab.id ? PURPLE : "#6B7280",
              fontWeight: activeTab === tab.id ? 600 : 500, fontSize: 14,
              cursor: "pointer", transition: "all 0.2s ease"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Table */}
      <CustomTable
        columns={columns}
        data={opsList}
        loading={loading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalOps}
        onPageChange={(page, size) => {
          setCurrentPage(page);
          if (size !== itemsPerPage) setItemsPerPage(size);
        }}
      />

      {/* ==================== MODALS ==================== */}

      {/* Activate Confirmation Modal */}
      {activateModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 380, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <CheckCircle size={22} color="#059669" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Activate Staff Member?</h2>
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 22 }}>
              Are you sure you want to activate <strong>{getOpsName(activateModal)}</strong>? They will be granted access.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setActivateModal(null)} style={{ flex: 1, padding: "10px 0", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleActivateConfirm} disabled={!!actionLoading} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#fff", background: "#059669", cursor: "pointer", opacity: actionLoading ? 0.7 : 1 }}>
                {actionLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle size={14} />}
                Confirm Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {suspendModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PauseCircle size={20} color="#D97706" />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Suspend Staff Member</h2>
            </div>
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
              You are about to suspend <strong>{getOpsName(suspendModal)}</strong>. They will lose access until reactivated.
            </p>
            <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: 6, fontSize: 13 }}>Suspension Reason <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional)</span></label>
            <textarea
              rows={3}
              placeholder="e.g. Under performance review, pending documentation…"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              maxLength={300}
              style={{ width: "100%", borderRadius: 10, border: "1px solid #E5E7EB", padding: "8px 12px", fontSize: 13, resize: "vertical", outline: "none" }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => { setSuspendModal(null); setSuspendReason(""); }} style={{ flex: 1, padding: "10px 0", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSuspendConfirm} disabled={!!actionLoading} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#fff", background: "#D97706", cursor: "pointer", opacity: actionLoading ? 0.7 : 1 }}>
                {actionLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <PauseCircle size={14} />}
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 380, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Trash2 size={22} color="#DC2626" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Delete Staff Member?</h2>
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 22 }}>
              Are you sure you want to permanently delete <strong>{getOpsName(deleteModal)}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteModal(null)} style={{ flex: 1, padding: "10px 0", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleDeleteConfirm} disabled={!!actionLoading} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#fff", background: "#DC2626", cursor: "pointer", opacity: actionLoading ? 0.7 : 1 }}>
                {actionLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default VaultMortgageOpsList;