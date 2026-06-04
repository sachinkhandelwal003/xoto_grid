// src/ecommerce/B2C/PartnerAgentleadlist.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  User, Mail, Phone, MapPin, Loader2, AlertCircle,
  Eye, Trash2, Upload, FileText, Clock, Search, RefreshCw,
  TrendingUp, CheckCircle2, Users, PlusCircle,
} from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../CMS/pages/custom/CustomTable";

/* ── Constants ──────────────────────────────────────────────────────────────── */
const PURPLE = "#5C039B";

// Role slug mapping for navigation
const roleSlugMap = {
  '0': 'superadmin',
  '1': 'admin',
  '2': "customer",
  '5': 'vendor-b2c',
  '6': 'vendor-b2b',
  '7': 'freelancer',
  '11': 'accountant',
  '12': 'supervisor',
  '15': "agency",        // Agency
  '16': "agent",         // Agent
  '17': "developer",
  '18': "vault-admin", //vault
  '22': "vaultagent",
  '21': "vaultpartner",
  '24': "GridAdvisor",
  '23': "vault-advisor",
  // '26': "vault-ops",
  // '26': "vault-advisor",
  // '23': "vault-ops",
  '25': "gridreferralpartner",
  '26': "vault-advisor",
  // '23': "vault-ops",
  
   
 


};

/* ── Status Badge ───────────────────────────────────────────────────────────── */
const STATUS_MAP = {
  "New":                      { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6", border: "#bfdbfe" },
  "Contacted":                { bg: "#fffbeb", color: "#92400e", dot: "#f59e0b", border: "#fde68a" },
  "Qualified":                { bg: "#f0fdf4", color: "#166534", dot: "#22c55e", border: "#bbf7d0" },
  "Collecting Documentation": { bg: "#faf5ff", color: "#581c87", dot: "#a855f7", border: "#e9d5ff" },
  "Documents Complete":       { bg: "#f0f9ff", color: "#075985", dot: "#0ea5e9", border: "#bae6fd" },
  "Application opened":       { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", border: "#fde68a" },
  "Submitted to Bank":        { bg: "#e0e7ff", color: "#3730a3", dot: "#6366f1", border: "#c7d2fe" },
  "Pre-Approved":             { bg: "#dcfce7", color: "#166534", dot: "#22c55e", border: "#bbf7d0" },
  "Valuation":                { bg: "#fef9c3", color: "#854d0e", dot: "#eab308", border: "#fef08a" },
  "FOL Issued":               { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6", border: "#bfdbfe" },
  "FOL Signed":               { bg: "#f3e8ff", color: "#6b21a5", dot: "#a855f7", border: "#e9d5ff" },
  "Disbursed":                { bg: "#ecfdf5", color: "#065f46", dot: "#10b981", border: "#d1fae5" },
  "Lost":                     { bg: "#fef2f2", color: "#991b1b", dot: "#ef4444", border: "#fecaca" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { bg: "#f8fafc", color: "#475569", dot: "#94a3b8", border: "#e2e8f0" };
  return (
    <span style={{ 
      display: "inline-flex", 
      alignItems: "center", 
      gap: 5, 
      padding: "3px 10px", 
      borderRadius: 999, 
      whiteSpace: "nowrap", 
      background: s.bg, 
      color: s.color, 
      border: `1px solid ${s.border}`, 
      fontSize: 11.5, 
      fontWeight: 600 
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status || "Unknown"}
    </span>
  );
};

/* ── Stat Card ──────────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div style={{ 
    background: "#fff", 
    borderRadius: 14, 
    padding: "16px 20px", 
    border: "1px solid #e8edf5", 
    display: "flex", 
    alignItems: "center", 
    gap: 14, 
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)", 
    flex: 1, 
    minWidth: 140,
    transition: "all 0.2s ease"
  }}>
    <div style={{ 
      width: 42, 
      height: 42, 
      borderRadius: 12, 
      flexShrink: 0, 
      background: `${accent}14`, 
      border: `1.5px solid ${accent}30`, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center" 
    }}>
      <Icon size={18} style={{ color: accent }} />
    </div>
    <div>
      <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{label}</p>
      <p style={{ 
        margin: "3px 0 0", 
        fontSize: 22, 
        fontWeight: 700, 
        color: "#0f172a", 
        fontFamily: "'JetBrains Mono', monospace", 
        letterSpacing: "-0.02em", 
        lineHeight: 1 
      }}>{value ?? 0}</p>
    </div>
  </div>
);

/* ── Main Component ─────────────────────────────────────────────────────────── */
export default function PartnerAgentleadlist() {
  const [leads, setLeads]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalLeads, setTotalLeads]     = useState(0);
  const [search, setSearch]             = useState("");
  const [deleteModal, setDeleteModal]   = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "partner";

  /* ── Fetch Leads ── */
  const fetchLeads = async (page = 1, limit = 10) => {
    setLoading(true);
    setError("");
    try {
      const response = await apiService.get(`/vault/lead/partner/get?page=${page}&limit=${limit}`);
      const data = response?.data || response;

      let list = [], total = 0;
      if (Array.isArray(data))       { list = data;       total = data.length; }
      else if (data?.leads)          { list = data.leads;  total = data.total || data.leads.length; }
      else if (data?.data)           { list = Array.isArray(data.data) ? data.data : []; total = data.total || list.length; }
      else if (data?.docs)           { list = data.docs;   total = data.totalDocs || data.docs.length; }

      setLeads(list);
      setTotalLeads(total);
    } catch (err) {
      setError(err?.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(currentPage, itemsPerPage); }, [currentPage, itemsPerPage]);

  const getLeadId   = (row) => row._id || row.id;
  const getLeadName = (row) => row.customerInfo?.fullName || "Lead";

  /* ── Delete Lead ── */
  const handleDeleteConfirm = async () => {
    const id = getLeadId(deleteModal);
    setActionLoading(id + "_delete");
    try {
      await apiService.delete(`/vault/lead/delete/${id}`);
      setLeads((prev) => prev.filter((l) => getLeadId(l) !== id));
      setTotalLeads((prev) => prev - 1);
      setDeleteModal(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Search filter ── */
  const filteredLeads = leads.filter((row) => {
    const q        = search.toLowerCase();
    const fullName = row.customerInfo?.fullName?.toLowerCase() || "";
    const email    = row.customerInfo?.email?.toLowerCase()    || "";
    const mobile   = row.customerInfo?.mobileNumber            || "";
    return fullName.includes(q) || email.includes(q) || mobile.includes(q);
  });

  /* ── Counts ── */
  const totalLeadsCount = leads.length;
  const newCount        = leads.filter(l => l.currentStatus === "New").length;
  const qualifiedCount  = leads.filter(l => l.currentStatus === "Qualified").length;
  const disbursedCount  = leads.filter(l => l.currentStatus === "Disbursed").length;

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  /* ── Navigation Handlers ── */
  const navigateToDocuments = (id) => {
    navigate(`/dashboard/${roleSlug}/lead-documents/${id}`);
  };

  const navigateToLeadDetail = (id) => {
    navigate(`/dashboard/${roleSlug}/partner/lead/${id}`);
  };

  const navigateToCreateLead = () => {
    navigate(`/dashboard/${roleSlug}/create-lead`);
  };

  /* ── Columns ── */
  const columns = [
    {
      key: "name",
      title: "Lead",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
          <div style={{ 
            width: 36, 
            height: 36, 
            borderRadius: "50%", 
            background: "#faf5ff", 
            border: `1.5px solid ${PURPLE}30`, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            flexShrink: 0 
          }}>
            <User size={15} color={PURPLE} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: 0 }}>{row.customerInfo?.fullName || "—"}</p>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{row.customerInfo?.nationality || "No nationality"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Contact",
      render: (_, row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#374151" }}>
            <Mail size={11} color="#94a3b8" />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
              {row.customerInfo?.email || "—"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#374151" }}>
            <Phone size={11} color="#94a3b8" />
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {row.customerInfo?.mobileNumber || "—"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      title: "City",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#374151" }}>
          <MapPin size={12} color="#94a3b8" />
          <span>{row.propertyDetails?.propertyAddress?.city || "—"}</span>
        </div>
      ),
    },
    {
      key: "loanType",
      title: "Rate Type",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#374151" }}>
          <FileText size={12} color="#94a3b8" />
          <span>{row.loanRequirements?.preferredInterestRateType || "—"}</span>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_, row) => <StatusBadge status={row.currentStatus} />,
    },
    {
      key: "createdAt",
      title: "Created",
      render: (_, row) => (
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>
          {fmtDate(row.createdAt || row.sourceInfo?.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      title: "",
      align: "right",
      render: (_, row) => {
        const id = getLeadId(row);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
            {/* Upload Docs */}
            <button
              onClick={() => navigateToDocuments(id)}
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: 5, 
                padding: "5px 10px", 
                background: "#eff6ff", 
                border: "1px solid #bfdbfe", 
                borderRadius: 8, 
                fontSize: 11.5, 
                fontWeight: 600, 
                color: "#2563eb", 
                cursor: "pointer", 
                transition: "all 0.14s",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#dbeafe"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#eff6ff"; }}
            >
              <Upload size={12} /> Docs
            </button>

            {/* View Details */}
            <button
              onClick={() => navigateToLeadDetail(id)}
              style={{ 
                width: 32, 
                height: 32, 
                borderRadius: 8, 
                border: `1px solid ${PURPLE}30`, 
                background: "#faf5ff", 
                color: PURPLE, 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center", 
                cursor: "pointer", 
                transition: "all 0.14s" 
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = PURPLE; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#faf5ff"; e.currentTarget.style.color = PURPLE; }}
              title="View Details"
            >
              <Eye size={14} />
            </button>

            {/* Delete */}
            <button
              onClick={() => setDeleteModal(row)}
              disabled={!!actionLoading}
              style={{ 
                width: 32, 
                height: 32, 
                borderRadius: 8, 
                border: "1px solid #fecaca", 
                background: "#fef2f2", 
                color: "#dc2626", 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center", 
                cursor: "pointer", 
                transition: "all 0.14s", 
                opacity: actionLoading ? 0.6 : 1 
              }}
              onMouseEnter={(e) => { if (!actionLoading) { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#fca5a5"; } }}
              onMouseLeave={(e) => { if (!actionLoading) { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#fecaca"; } }}
              title="Delete Lead"
            >
              {actionLoading === id + "_delete"
                ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />
                : <Trash2 size={13} />}
            </button>
          </div>
        );
      },
    },
  ];

  /* ── Error Screen ── */
  if (error) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: "#f4f7fb", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: 32 
      }}>
        <AlertCircle size={44} color="#ef4444" style={{ marginBottom: 12 }} />
        <p style={{ color: "#b91c1c", marginBottom: 16, fontSize: 14 }}>{error}</p>
        <button 
          onClick={() => fetchLeads(currentPage, itemsPerPage)} 
          style={{ 
            padding: "9px 20px", 
            background: PURPLE, 
            color: "#fff", 
            border: "none", 
            borderRadius: 9, 
            fontSize: 14, 
            fontWeight: 600, 
            cursor: "pointer" 
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: "32px 36px" }}>
      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.22s ease both;
        }
      `}</style>

      {/* Header Section */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
            All Partner Leads
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: 13.5, color: "#64748b" }}>
            {totalLeadsCount} lead{totalLeadsCount !== 1 ? "s" : ""} found
          </p>
        </div>
        
        {/* Create New Lead Button */}
      
      </div>

      {/* Stat Cards - Only Total Leads */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard icon={Users} label="Total Leads" value={totalLeadsCount} accent={PURPLE} />
        <StatCard icon={Clock} label="New" value={newCount} accent="#2563eb" />
        <StatCard icon={TrendingUp} label="Qualified" value={qualifiedCount} accent="#16a34a" />
        <StatCard icon={CheckCircle2} label="Disbursed" value={disbursedCount} accent="#0ea5e9" />
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
        <div style={{ 
          flex: 1, 
          display: "flex", 
          alignItems: "center", 
          gap: 10, 
          background: "#fff", 
          border: "1px solid #e8edf5", 
          borderRadius: 12, 
          padding: "8px 16px",
          transition: "all 0.2s ease"
        }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 13.5,
              background: "transparent",
              color: "#0f172a"
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: 16
              }}
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Refresh Button */}
        <button
          onClick={() => fetchLeads(currentPage, itemsPerPage)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            background: "#fff",
            border: "1px solid #e8edf5",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 500,
            color: "#64748b",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#faf5ff"; e.currentTarget.style.borderColor = PURPLE; e.currentTarget.style.color = PURPLE; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e8edf5"; e.currentTarget.style.color = "#64748b"; }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Table Section */}
      <div style={{ 
        background: "#fff", 
        borderRadius: 16, 
        border: "1px solid #e8edf5", 
        overflow: "hidden", 
        boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)" 
      }}>
        <CustomTable
          columns={columns}
          data={filteredLeads}
          loading={loading}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalLeadsCount}
          onPageChange={(page, size) => {
            setCurrentPage(page);
            if (size !== itemsPerPage) setItemsPerPage(size);
          }}
        />
      </div>

      {/* Empty State */}
      {!loading && filteredLeads.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "#fff",
          borderRadius: 16,
          marginTop: 20
        }}>
          <Users size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 15, color: "#64748b", marginBottom: 8 }}>No leads found</p>
          <p style={{ fontSize: 13, color: "#94a3b8" }}>
            {search ? "Try adjusting your search" : "Create your first lead to get started"}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div style={{ 
          position: "fixed", 
          inset: 0, 
          zIndex: 50, 
          background: "rgba(0,0,0,0.45)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          padding: 16 
        }}>
          <div style={{ 
            background: "#fff", 
            borderRadius: 18, 
            width: "100%", 
            maxWidth: 380, 
            padding: 28, 
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)", 
            textAlign: "center" 
          }} className="animate-fadeIn">
            <div style={{ 
              width: 52, 
              height: 52, 
              borderRadius: "50%", 
              background: "#fef2f2", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              margin: "0 auto 16px" 
            }}>
              <Trash2 size={22} color="#dc2626" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Delete Lead?</h2>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
              Are you sure you want to permanently delete{" "}
              <strong style={{ color: "#111827" }}>{getLeadName(deleteModal)}</strong>?{" "}
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteModal(null)}
                style={{ 
                  flex: 1, 
                  padding: "10px 0", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: 10, 
                  fontSize: 13, 
                  fontWeight: 600, 
                  color: "#374151", 
                  background: "#fff", 
                  cursor: "pointer" 
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={!!actionLoading}
                style={{ 
                  flex: 1, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: 6, 
                  padding: "10px 0", 
                  border: "none", 
                  borderRadius: 10, 
                  fontSize: 13, 
                  fontWeight: 600, 
                  color: "#fff", 
                  background: "#dc2626", 
                  cursor: "pointer", 
                  opacity: actionLoading ? 0.7 : 1 
                }}
                onMouseEnter={(e) => { if (!actionLoading) e.currentTarget.style.background = "#b91c1c"; }}
                onMouseLeave={(e) => { if (!actionLoading) e.currentTarget.style.background = "#dc2626"; }}
              >
                {actionLoading
                  ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
                  : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}