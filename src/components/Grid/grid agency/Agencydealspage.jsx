import { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmtAED = (n) => {
  if (n == null) return "—";
  return "AED " + Math.round(n).toLocaleString("en-AE");
};
const fmtShort = (n) => {
  if (n == null) return "—";
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `AED ${Math.round(n / 1_000)}K`;
  return `AED ${Math.round(n)}`;
};
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
};

const unwrapPayload = (res) => res?.data?.data ?? res?.data ?? res ?? {};
const PAGE_SIZE = 10;
const unwrapList = (res) => {
  const payload = unwrapPayload(res);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.deals)) return payload.deals;
  if (Array.isArray(payload?.agents)) return payload.agents;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.docs)) return payload.docs;
  return [];
};
const moneyValue = (...values) => {
  const value = values.find((item) => item !== undefined && item !== null && item !== "");
  if (value === undefined) return 0;
  const numeric = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};
const personName = (person) =>
  person?.name ||
  person?.agentName ||
  `${person?.first_name ?? person?.firstName ?? ""} ${person?.last_name ?? person?.lastName ?? ""}`.trim();

const PAGE_CSS = `
  html,
  body,
  #root {
    overflow-x: hidden;
  }

  .agency-deals-root,
  .agency-deals-root * {
    box-sizing: border-box;
  }

  .agency-deals-root {
    position: relative;
    isolation: isolate;
  }

  main:has(.agency-deals-root),
  main:has(.agency-deals-root) > div {
    overflow-x: hidden;
  }

  @media (min-width: 1024px) {
    .agency-deals-root {
      max-width: calc(100vw - 320px);
    }
  }

  @media (max-width: 768px) {
    .agency-deals-root {
      padding: 24px 16px 48px !important;
    }
  }
`;

const STATUS_CFG = {
  paid:      { label: "Paid",      bg: "#e8f5e9", color: "#2e7d32", dot: "#43a047", border: "#43a047" },
  confirmed: { label: "Confirmed", bg: "#e3f2fd", color: "#1565c0", dot: "#1976d2", border: "#1976d2" },
  pending:   { label: "Pending",   bg: "#fff8e1", color: "#e65100", dot: "#fb8c00", border: "#fb8c00" },
};

// ─── sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const normalizedStatus = String(status || "pending").toLowerCase();
  const c = STATUS_CFG[normalizedStatus] ?? STATUS_CFG.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: c.bg, color: c.color,
      borderRadius: 20, padding: "3px 10px",
      fontSize: 12, fontWeight: 500, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

function StatCard({ label, amount, count, accent, loading }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #ede9f8",
      borderRadius: 12, padding: "1rem 1.25rem",
      borderTop: `3px solid ${accent}`,
      minWidth: 0,
    }}>
      <p style={{ margin: "0 0 4px", fontSize: 11, color: "#888", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</p>
      {loading ? (
        <div style={{ height: 28, width: "70%", background: "#f0ecfc", borderRadius: 6, margin: "4px 0" }} />
      ) : (
        <p style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.2 }}>{fmtShort(amount)}</p>
      )}
      <p style={{ margin: 0, fontSize: 12, color: "#bbb" }}>{loading ? "…" : `${count ?? 0} deal${count !== 1 ? "s" : ""}`}</p>
    </div>
  );
}

function Skeleton({ h = 16, w = "100%", mb = 8 }) {
  return <div style={{ height: h, width: w, background: "#f0ecfc", borderRadius: 6, marginBottom: mb }} />;
}

// ─── main component ───────────────────────────────────────────────────────────
export default function Agencydealspage() {
  // ── state ──────────────────────────────────────────────────────────────────
  const [tab,          setTab]          = useState("deals");   // "deals" | "agents"
  const [summary,      setSummary]      = useState(null);
  const [deals,        setDeals]        = useState([]);
  const [agents,       setAgents]       = useState([]);
  const [agentOptions, setAgentOptions] = useState([]);        // for dropdown

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [agentFilter,  setAgentFilter]  = useState("all");
  const [typeFilter,   setTypeFilter]   = useState("all");

  const [page,        setPage]        = useState(1);
  const [pagination,  setPagination]  = useState(null);
  const [loadingMain, setLoadingMain] = useState(true);
  const [error,       setError]       = useState(null);

  const debounceRef = useRef(null);

  // ── data fetchers ──────────────────────────────────────────────────────────

  // Stats + agent summary — fetched once on mount
  const fetchSummaryAndAgents = useCallback(async () => {
    try {
      const [statsRes, agentRes] = await Promise.all([
        apiService.get("/deal-records/agency-stats"),
        apiService.get("/deal-records/agency-agent-summary"),
      ]);

      const statsPayload = unwrapPayload(statsRes);
      const agentData = unwrapList(agentRes);

      // Build summary from byStatus array returned by agency-stats
      const byStatus = statsPayload?.byStatus ?? [];
      const get = (key) => byStatus.find((r) => r._id === key || r.status === key || r.commissionStatus === key) ?? { count: 0 };
      const p = get("pending"), c = get("confirmed"), pd = get("paid");
      const pendingAmount = moneyValue(p.totalPartner, p.partnerShare, p.totalAgency, p.amount, p.total);
      const confirmedAmount = moneyValue(c.totalPartner, c.partnerShare, c.totalAgency, c.amount, c.total);
      const paidAmount = moneyValue(pd.totalPartner, pd.partnerShare, pd.totalAgency, pd.amount, pd.total);
      setSummary({
        pending:   { amount: pendingAmount, count: p.count ?? 0 },
        confirmed: { amount: confirmedAmount, count: c.count ?? 0 },
        paid:      { amount: paidAmount, count: pd.count ?? 0 },
        total:     pendingAmount + confirmedAmount + paidAmount,
        totalCount: (p.count ?? 0) + (c.count ?? 0) + (pd.count ?? 0),
      });

      setAgents(agentData);
      setAgentOptions(agentData.map((a) => ({ id: a._id ?? a.id, name: personName(a) || "Unknown" })));
    } catch (err) {
      console.error("[Commission] stats/agents error:", err);
      setError("Failed to load commission summary. Please refresh.");
    }
  }, []);

  // Paginated deals list
  const fetchDeals = useCallback(async (pageNum = 1) => {
    setLoadingMain(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: pageNum, limit: PAGE_SIZE });
      if (statusFilter !== "all") params.set("commissionStatus", statusFilter);
      if (agentFilter  !== "all") params.set("agentId",          agentFilter);
      if (typeFilter   !== "all") params.set("dealType",         typeFilter);

      const res = await apiService.get(`/deal-records/agency-deals?${params}`);
      const payload = unwrapPayload(res);
      const data = unwrapList(res);
      const pg = payload?.pagination ?? res?.pagination ?? null;

      // Client-side search filter (ref, property name, customer name)
      const q = search.trim().toLowerCase();
      const filtered = q
        ? data.filter((d) =>
            d.dealReference?.toLowerCase().includes(q) ||
            personName(d.agentId ?? d.agent ?? d.advisorId ?? d.advisor)?.toLowerCase().includes(q) ||
            d.propertyId?.propertyName?.toLowerCase().includes(q) ||
            d.property?.propertyName?.toLowerCase().includes(q) ||
            d.propertyName?.toLowerCase().includes(q) ||
            `${d.customerId?.firstName ?? ""} ${d.customerId?.lastName ?? ""}`.toLowerCase().includes(q)
          )
        : data;

      setDeals(filtered);
      setPagination(pg ?? null);
      setPage(pageNum);
    } catch (err) {
      console.error("[Commission] deals error:", err);
      setError("Failed to load deal records.");
    } finally {
      setLoadingMain(false);
    }
  }, [statusFilter, agentFilter, typeFilter, search]);

  // Initial load
  useEffect(() => {
    fetchSummaryAndAgents();
  }, [fetchSummaryAndAgents]);

  useEffect(() => {
    window.scrollTo({ left: 0, top: window.scrollY });
    document.scrollingElement?.scrollTo({ left: 0, top: document.scrollingElement.scrollTop });
    document.querySelector("main")?.scrollTo({ left: 0 });
  }, []);

  // Re-fetch when filters change (debounce search)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchDeals(1), search ? 350 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [fetchDeals]);

  // ── derived ────────────────────────────────────────────────────────────────
  const total        = summary?.total ?? 0;
  const paidPct      = total > 0 ? Math.round((summary?.paid.amount      ?? 0) / total * 100) : 0;
  const confirmedPct = total > 0 ? Math.round((summary?.confirmed.amount ?? 0) / total * 100) : 0;
  const pendingPct   = 100 - paidPct - confirmedPct;

  const totalRecords = pagination?.total ?? pagination?.totalRecords ?? pagination?.totalCount ?? pagination?.count ?? deals.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? pagination?.pages ?? pagination?.total_pages ?? Math.ceil(totalRecords / PAGE_SIZE));
  const currentPage = pagination?.page ?? pagination?.currentPage ?? page;
  const pageStart = deals.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const pageEnd = deals.length ? pageStart + deals.length - 1 : 0;
  const pageNumbers = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
    const start = Math.min(Math.max(currentPage - 2, 1), Math.max(totalPages - 4, 1));
    return start + index;
  }).filter((pageNumber) => pageNumber <= totalPages);

  // ── CSV export ─────────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("commissionStatus", statusFilter);
      if (agentFilter  !== "all") params.set("agentId",          agentFilter);
      if (typeFilter   !== "all") params.set("dealType",         typeFilter);

      const res = await apiService.get(`/deal-records/export?${params}`, {
        responseType: "blob",
      });
      const url  = URL.createObjectURL(res.data);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `agency-commission-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    }
  };

  // ── render helpers ─────────────────────────────────────────────────────────
  const S = {
    page: {
      padding: "32px 36px 64px",
      background: "#F5F4F8",
      fontFamily: "'Inter', sans-serif",
      color: "#140D2A",
      minHeight: "100vh",
      width: "100%",
      maxWidth: "100%",
      overflowX: "hidden",
      boxSizing: "border-box",
    },
    header: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginBottom: 24,
      paddingBottom: 20,
      borderBottom: "1.5px solid #E2DDF0",
      flexWrap: "wrap",
      gap: 12,
    },
    title: { margin: "0 0 4px", fontSize: 26, fontWeight: 700, color: "#140D2A", lineHeight: 1.15 },
    subtitle: { margin: 0, fontSize: 13, color: "#8E82AA" },
    exportBtn: {
      background: "#5B3FBF", color: "#fff", border: "none", borderRadius: 8,
      padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
      display: "flex", alignItems: "center", gap: 6,
    },
    cards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24, width: "100%" },
    pipelineCard: {
      background: "#fff", border: "1px solid #ede9f8", borderRadius: 12,
      padding: "1rem 1.25rem", marginBottom: "1.5rem",
    },
    tabBar: { display: "flex", gap: 4, marginBottom: "1rem", borderBottom: "1px solid #ede9f8" },
    filterRow: { display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap", alignItems: "center", width: "100%" },
    select: { fontSize: 13, padding: "7px 10px", borderRadius: 8, border: "1px solid #ddd", color: "#333", background: "#fff", fontFamily: "inherit", maxWidth: "100%" },
    searchInput: { flex: 1, minWidth: 200, fontSize: 13, padding: "7px 12px", borderRadius: 8, border: "1px solid #ddd", color: "#333", background: "#fff", fontFamily: "inherit" },
    table: { width: "100%", minWidth: 980, borderCollapse: "collapse", fontSize: 13 },
    th: { padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", background: "#fafafa", borderBottom: "1px solid #ede9f8" },
    td: { padding: "11px 12px", borderBottom: "1px solid #f5f3ff", verticalAlign: "middle" },
    tableWrap: { background: "#fff", border: "1px solid #ede9f8", borderRadius: 12, overflow: "hidden", maxWidth: "100%", boxShadow: "0 2px 8px rgba(123,47,190,0.07)" },
    emptyState: { padding: "3rem", textAlign: "center", color: "#bbb" },
    paginationBtn: {
      minWidth: 42, height: 34, border: "1px solid #ddd", borderRadius: 8,
      background: "#fff", color: "#5B3FBF", fontSize: 13, fontWeight: 600,
      cursor: "pointer", fontFamily: "inherit",
    },
    paginationBtnDisabled: {
      color: "#aaa", cursor: "not-allowed", background: "#f7f7f7",
    },
    paginationBtnActive: {
      background: "#5B3FBF", color: "#fff", borderColor: "#5B3FBF",
    },
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{PAGE_CSS}</style>
      <div className="agency-deals-root" style={S.page}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Commission Tracker</h1>
          <p style={S.subtitle}>Commission tracking across all agents</p>
        </div>
      </div>

      {/* ── Error banner ────────────────────────────────────────────────── */}
      {error && (
        <div style={{ background: "#ffeaea", color: "#c0392b", borderRadius: 8, padding: "10px 14px", marginBottom: "1rem", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
          <button onClick={() => { fetchSummaryAndAgents(); fetchDeals(1); }} style={{ marginLeft: "auto", background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Retry</button>
        </div>
      )}

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div style={S.cards}>
        {[
          ["Total Pipeline", total, summary?.totalCount, "#5B3FBF"],
          ["Pending",        summary?.pending.amount,   summary?.pending.count,   "#fb8c00"],
          ["Confirmed",      summary?.confirmed.amount, summary?.confirmed.count, "#1976d2"],
          ["Paid Out",       summary?.paid.amount,      summary?.paid.count,      "#43a047"],
        ].map(([lbl, amt, cnt, acc]) => (
          <StatCard key={lbl} label={lbl} amount={amt} count={cnt} accent={acc} loading={!summary} />
        ))}
      </div>

      {/* ── Pipeline bar ────────────────────────────────────────────────── */}
      <div style={S.pipelineCard}>
        <p style={{ margin: "0 0 10px", fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Commission pipeline</p>
        {!summary ? (
          <Skeleton h={10} mb={8} />
        ) : (
          <>
            <div style={{ display: "flex", height: 10, borderRadius: 6, overflow: "hidden", gap: 2 }}>
              <div style={{ width: `${paidPct}%`,      background: "#43a047", transition: "width 0.5s" }} />
              <div style={{ width: `${confirmedPct}%`, background: "#1976d2", transition: "width 0.5s" }} />
              <div style={{ width: `${pendingPct}%`,   background: "#fb8c00", transition: "width 0.5s" }} />
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 8, flexWrap: "wrap" }}>
              {[["#43a047", "Paid", paidPct], ["#1976d2", "Confirmed", confirmedPct], ["#fb8c00", "Pending", pendingPct]].map(([col, lbl, pct]) => (
                <span key={lbl} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#666" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: col }} />
                  {lbl} — {pct}%
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div style={S.tabBar}>
        {[["deals", "Transactions"], ["agents", "Agent Breakdown"]].map(([k, v]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            background: "none", border: "none",
            borderBottom: tab === k ? "2px solid #5B3FBF" : "2px solid transparent",
            padding: "8px 14px", marginBottom: -1,
            fontSize: 13, fontWeight: tab === k ? 700 : 400,
            color: tab === k ? "#5B3FBF" : "#888",
            cursor: "pointer", fontFamily: "inherit",
          }}>
            {v}
          </button>
        ))}
      </div>

      {/* ════════════ DEALS TAB ════════════════════════════════════════════ */}
      {tab === "deals" && (
        <>
          {/* Filters */}
          <div style={S.filterRow}>
            <input
              type="text"
              placeholder="Search by ref, agent, property or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={S.searchInput}
            />
            <select value={agentFilter} onChange={(e) => { setAgentFilter(e.target.value); setPage(1); }} style={S.select}>
              <option value="all">All Agents</option>
              {agentOptions.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={S.select}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="paid">Paid</option>
            </select>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} style={S.select}>
              <option value="all">All Types</option>
              <option value="sale">Sale</option>
              <option value="lease">Lease</option>
            </select>
            {(statusFilter !== "all" || agentFilter !== "all" || typeFilter !== "all" || search) && (
              <button onClick={() => { setStatusFilter("all"); setAgentFilter("all"); setTypeFilter("all"); setSearch(""); }} style={{ ...S.select, color: "#888", cursor: "pointer" }}>
                Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div style={S.tableWrap}>
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <colgroup>
                  <col style={{ width: "12%" }} /><col style={{ width: "22%" }} /><col style={{ width: "13%" }} />
                  <col style={{ width: "8%" }} /><col style={{ width: "18%" }} />
                  <col style={{ width: "10%" }} /><col style={{ width: "7%" }} />
                </colgroup>
                <thead>
                  <tr>
                    {["Ref", "Property", "Agent", "Type", "Your Share", "Status", "Date"].map((h) => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingMain ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((__, j) => (
                          <td key={j} style={S.td}><Skeleton h={14} mb={0} w={j === 1 ? "80%" : j === 4 || j === 5 ? "90%" : "60%"} /></td>
                        ))}
                      </tr>
                    ))
                  ) : deals.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={S.emptyState}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ display: "block", margin: "0 auto 8px" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#aaa" }}>No deal records found</div>
                        <div style={{ fontSize: 12, color: "#ccc", marginTop: 4 }}>Try adjusting your filters</div>
                      </td>
                    </tr>
                  ) : (
                    deals.map((d, i) => {
                      const agentName = personName(d.agentId ?? d.agent ?? d.advisorId ?? d.advisor) || "—";
                      const propertyName = d.propertyId?.propertyName ?? d.property?.propertyName ?? d.propertyName ?? d.inventoryId?.propertyName ?? "—";
                      const dealType = d.dealType ?? d.type ?? d.transactionType ?? "—";
                      const partnerShare = moneyValue(d.commission?.partnerShare, d.partnerShare, d.agencyShare, d.commission?.agencyShare);
                      const partnerPercent = moneyValue(d.commission?.partnerPercent, d.partnerPercent, d.agencyPercent, d.commission?.agencyPercent);
                      const status = d.commissionStatus ?? d.status ?? d.paymentStatus ?? "pending";
                      const dateStr = fmtDate(d.paidAt ?? d.confirmedAt ?? d.createdAt ?? d.updatedAt);
                      return (
                        <tr key={d._id ?? d.id ?? i} style={{ background: i % 2 === 0 ? "#fff" : "#fdfcff" }}>
                          <td style={{ ...S.td, color: "#5B3FBF", fontWeight: 600, fontFamily: "monospace", fontSize: 11 }}>
                            {d.dealReference ?? d.reference ?? d._id?.slice?.(-8) ?? "—"}
                          </td>
                          <td style={{ ...S.td, color: "#333", maxWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={propertyName}>
                            {propertyName}
                          </td>
                          <td style={{ ...S.td, color: "#555", whiteSpace: "nowrap" }}>{agentName || "—"}</td>
                          <td style={S.td}>
                            <span style={{
                              background: String(dealType).toLowerCase() === "sale" ? "#ede9fd" : "#e8f5e9",
                              color: String(dealType).toLowerCase() === "sale" ? "#5B3FBF" : "#2e7d32",
                              borderRadius: 4, padding: "2px 7px", fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                            }}>{dealType}</span>
                          </td>
                          <td style={{ ...S.td, fontWeight: 700, color: "#1a1a2e", whiteSpace: "nowrap" }}>
                            {fmtAED(partnerShare)}{" "}
                            <span style={{ color: "#ccc", fontWeight: 400, fontSize: 11 }}>
                              ({partnerPercent}%)
                            </span>
                          </td>
                          <td style={S.td}><StatusBadge status={status} /></td>
                          <td style={{ ...S.td, color: "#aaa", fontSize: 12, whiteSpace: "nowrap" }}>{dateStr}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer: total + pagination */}
            {!loadingMain && deals.length > 0 && (
              <div style={{ borderTop: "1px solid #f5f3ff", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: "#fafafa", flexWrap: "wrap" }}>
                <div>
                  <span style={{ fontSize: 12, color: "#888" }}>
                    Showing {pageStart}-{pageEnd} of {totalRecords} records
                  </span>
                  <span style={{ marginLeft: 12, fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>
                    {fmtAED(deals.reduce((s, d) => s + moneyValue(d.commission?.partnerShare, d.partnerShare, d.agencyShare, d.commission?.agencyShare), 0))}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    onClick={() => fetchDeals(currentPage - 1)}
                    disabled={currentPage <= 1}
                    style={{
                      ...S.paginationBtn,
                      ...(currentPage <= 1 ? S.paginationBtnDisabled : {}),
                    }}
                  >
                    Prev
                  </button>
                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => fetchDeals(pageNumber)}
                      disabled={pageNumber === currentPage}
                      style={{
                        ...S.paginationBtn,
                        ...(pageNumber === currentPage ? S.paginationBtnActive : {}),
                      }}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    onClick={() => fetchDeals(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    style={{
                      ...S.paginationBtn,
                      ...(currentPage >= totalPages ? S.paginationBtnDisabled : {}),
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ════════════ AGENTS TAB ═══════════════════════════════════════════ */}
      {tab === "agents" && (
        <div style={S.tableWrap}>
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead>
                <tr>
                  {["Agent", "Deals", "Total Earned", "Paid", "Confirmed", "Pending", "Share %"].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!summary ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} style={S.td}><Skeleton h={14} mb={0} w={j === 0 ? "70%" : "60%"} /></td>
                      ))}
                    </tr>
                  ))
                ) : agents.length === 0 ? (
                  <tr><td colSpan={7} style={S.emptyState}>No agent data available</td></tr>
                ) : (
                  agents.map((a, i) => {
                    const agentLabel = personName(a) || "—";
                    const totalEarned = moneyValue(a.totalPartner, a.partnerShare, a.agencyShare, a.totalEarned, a.total);
                    const paidAmt = moneyValue(a.paidAmt, a.paid, a.paidCommission);
                    const confirmedAmt = moneyValue(a.confirmedAmt, a.confirmed, a.confirmedCommission);
                    const pendingAmt = moneyValue(a.pendingAmt, a.pending, a.pendingCommission);
                    const pct = total > 0 ? Math.round(totalEarned / total * 100) : 0;
                    const initials = agentLabel.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
                    return (
                      <tr key={a._id ?? a.id ?? i} style={{ background: i % 2 === 0 ? "#fff" : "#fdfcff" }}>
                        <td style={{ ...S.td, minWidth: 180 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#ede9fd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#5B3FBF", flexShrink: 0 }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: 13 }}>{agentLabel}</div>
                              <div style={{ fontSize: 11, color: "#aaa" }}>{a.agentEmail || a.email || ""}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ ...S.td, color: "#555" }}>{a.totalDeals ?? a.deals ?? a.count ?? 0}</td>
                        <td style={{ ...S.td, fontWeight: 700, color: "#1a1a2e" }}>{fmtShort(totalEarned)}</td>
                        <td style={{ ...S.td, color: "#2e7d32", fontWeight: 600 }}>{fmtShort(paidAmt)}</td>
                        <td style={{ ...S.td, color: "#1565c0", fontWeight: 600 }}>{fmtShort(confirmedAmt)}</td>
                        <td style={{ ...S.td, color: "#e65100", fontWeight: 600 }}>{fmtShort(pendingAmt)}</td>
                        <td style={{ ...S.td, minWidth: 100 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#f0ecfc", overflow: "hidden", minWidth: 50 }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: "#5B3FBF", borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 12, color: "#888", minWidth: 28, textAlign: "right" }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {agents.length > 0 && (
            <div style={{ borderTop: "1px solid #f5f3ff", padding: "10px 12px", display: "flex", justifyContent: "space-between", background: "#fafafa" }}>
              <span style={{ fontSize: 12, color: "#888" }}>{agents.length} agents</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{fmtAED(total)}</span>
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
}
