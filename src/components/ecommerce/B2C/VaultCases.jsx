import React, { useState, useEffect } from "react";
// import {
//   vaultFetch, GREEN, CYAN, MUTED, DTEXT, PURPLE,
//   StatCard, Card, Badge, TableHead, ActionBtn,
//   ErrorBox, Spinner, PageHeader,
//   CLIENT_STATUSES, statusLabel
// } from "./vaultHelpers";

const VaultCases = () => {
  const [clients,      setClients]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusModal,  setStatusModal]  = useState(null);
  const [updating,     setUpdating]     = useState(false);
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type="success") => {
    setToast({msg,type}); setTimeout(()=>setToast(null),3000);
  };

  const fetchClients = async () => {
    setLoading(true); setError(null);
    try {
      const data = await vaultFetch("GET", "/clients");
      setClients(Array.isArray(data) ? data : []);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    setUpdating(true);
    try {
      await vaultFetch("PUT", `/client-status/${id}`, { status });
      setClients(c => c.map(x => x._id===id ? {...x,status} : x));
      showToast(`Case advanced to "${statusLabel(status)}"`);
      setStatusModal(null);
    } catch(e) { showToast(e.message,"error"); }
    finally { setUpdating(false); }
  };

  useEffect(() => { fetchClients(); }, []);

  const filtered = clients.filter(c =>
    (statusFilter==="All" || c.status===statusFilter) &&
    ((c.name||"").toLowerCase().includes(search.toLowerCase()) ||
     (c.phone||"").includes(search))
  );

  // Pipeline stages with counts
  const pipeline = CLIENT_STATUSES.map(s => ({
    label: statusLabel(s), status: s,
    count: clients.filter(c=>c.status===s).length,
  }));

  return (
    <div style={{ padding:"1.5rem" }}>
      <PageHeader title="Cases Pipeline" sub="Track every client through the mortgage lifecycle" />

      {/* Pipeline bar */}
      <div style={{ display:"flex", gap:6, marginBottom:"1.5rem", overflowX:"auto", paddingBottom:4 }}>
        {pipeline.map(p=>(
          <button key={p.status} onClick={()=>setStatusFilter(statusFilter===p.status?"All":p.status)} style={{
            flexShrink:0, padding:"8px 14px", borderRadius:20, border:"none", cursor:"pointer",
            background: statusFilter===p.status?"#5C039B":"#f8f4ff",
            color: statusFilter===p.status?"#fff":MUTED,
            fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:6,
            boxShadow: statusFilter===p.status?"0 4px 12px rgba(92,3,155,0.3)":"none",
            transition:"all 0.15s",
          }}>
            {p.label}
            <span style={{
              background: statusFilter===p.status?"rgba(255,255,255,0.25)":"#ede5ff",
              color: statusFilter===p.status?"#fff":PURPLE,
              borderRadius:10, padding:"0 7px", fontSize:11, fontWeight:700,
            }}>{p.count}</span>
          </button>
        ))}
      </div>

      {/* Quick stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:"1.25rem" }}>
        <StatCard label="Total Cases"   value={clients.length} />
        <StatCard label="In Progress"   value={clients.filter(c=>!["disbursed","lost"].includes(c.status)).length} accent={CYAN}    />
        <StatCard label="Disbursed"     value={clients.filter(c=>c.status==="disbursed").length}                   accent={GREEN}   />
        <StatCard label="Lost"          value={clients.filter(c=>c.status==="lost").length}                        accent="#E24B4A" />
      </div>

      {error && <ErrorBox msg={error} onRetry={fetchClients} />}

      <Card>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap" }}>
          <div style={{ fontSize:15, fontWeight:700, color:DTEXT, flex:1 }}>
            {statusFilter==="All" ? "All Cases" : `Cases — ${statusLabel(statusFilter)}`}
          </div>
          <input placeholder="Search client name or phone..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{ border:"1px solid #ede5ff", borderRadius:8, padding:"8px 14px", fontSize:13, width:240, outline:"none" }} />
          {statusFilter!=="All" && (
            <ActionBtn label="✕ Clear Filter" color={MUTED} onClick={()=>setStatusFilter("All")} />
          )}
          <ActionBtn label="↻ Refresh" onClick={fetchClients} />
        </div>

        {loading ? <Spinner /> : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <TableHead cols={["Client","Phone","Agent","Current Stage","Created","Last Updated","Advance Stage"]} />
              <tbody>
                {filtered.length===0 && (
                  <tr><td colSpan={7} style={{ padding:"2.5rem", textAlign:"center", color:MUTED }}>
                    No cases {statusFilter!=="All"?`in "${statusLabel(statusFilter)}"`:"found"}
                  </td></tr>
                )}
                {filtered.map(c=>{
                  const currentIdx = CLIENT_STATUSES.indexOf(c.status);
                  const nextStatus = currentIdx < CLIENT_STATUSES.length-1 ? CLIENT_STATUSES[currentIdx+1] : null;
                  return (
                    <tr key={c._id} style={{ borderBottom:"1px solid #f3eeff" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#f8f4ff"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"11px 12px", fontWeight:700, color:DTEXT }}>
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <div style={{
                            width:32, height:32, borderRadius:16, background:"#ede5ff",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:12, fontWeight:800, color:PURPLE, flexShrink:0,
                          }}>{(c.name||"?")[0]?.toUpperCase()}</div>
                          {c.name||"—"}
                        </div>
                      </td>
                      <td style={{ padding:"11px 12px", color:MUTED }}>{c.phone||"—"}</td>
                      <td style={{ padding:"11px 12px", fontSize:12, color:MUTED }}>
                        {c.agentId?.fullName||c.agentId?.name||"Direct"}
                      </td>
                      <td style={{ padding:"11px 12px" }}><Badge label={c.status||"new"} /></td>
                      <td style={{ padding:"11px 12px", color:MUTED, fontSize:11 }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td style={{ padding:"11px 12px", color:MUTED, fontSize:11 }}>
                        {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td style={{ padding:"11px 12px", display:"flex", gap:5, flexWrap:"wrap" }}>
                        {nextStatus && nextStatus!=="lost" && (
                          <ActionBtn label={`→ ${statusLabel(nextStatus)}`} color={GREEN}
                            onClick={()=>updateStatus(c._id, nextStatus)} />
                        )}
                        <ActionBtn label="Any Stage" color={CYAN} onClick={()=>setStatusModal(c)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding:"10px 12px", borderTop:"1px solid #ede5ff", fontSize:12, color:MUTED }}>
              Showing {filtered.length} of {clients.length} cases
            </div>
          </div>
        )}
      </Card>

      {/* Status Modal */}
      {statusModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)",
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:16, padding:"1.5rem",
            width:400, maxWidth:"92vw", boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }}>
            <div style={{ fontWeight:800, fontSize:16, color:DTEXT, marginBottom:4 }}>Move to Any Stage</div>
            <div style={{ color:MUTED, fontSize:13, marginBottom:12 }}>
              {statusModal.name} — current: <Badge label={statusModal.status||"new"} />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:5, maxHeight:300, overflowY:"auto" }}>
              {CLIENT_STATUSES.map(s=>(
                <button key={s} disabled={updating} onClick={()=>updateStatus(statusModal._id,s)} style={{
                  background: s===statusModal.status?"#f3eaff":"#f8f4ff",
                  border:`1px solid ${s===statusModal.status?PURPLE:"#ede5ff"}`,
                  borderRadius:8, padding:"10px 14px",
                  color: s===statusModal.status?PURPLE:"#6b5b88",
                  cursor: updating?"not-allowed":"pointer",
                  textAlign:"left", fontSize:13, fontWeight: s===statusModal.status?700:400,
                }}>{statusLabel(s)}</button>
              ))}
            </div>
            <button onClick={()=>setStatusModal(null)} style={{
              marginTop:12, width:"100%", background:"none",
              border:"1px solid #ede5ff", borderRadius:8, padding:10, color:MUTED, cursor:"pointer", fontSize:13,
            }}>Cancel</button>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position:"fixed", bottom:24, right:24, zIndex:9999, background:"#2d1a4a",
          borderLeft:`3px solid ${toast.type==="success"?GREEN:"#E24B4A"}`,
          borderRadius:10, padding:"12px 18px", fontSize:13, fontWeight:500,
          color: toast.type==="success"?GREEN:"#F09595",
          boxShadow:"0 8px 24px rgba(0,0,0,0.3)", maxWidth:320,
        }}>{toast.msg}</div>
      )}
    </div>
  );
};

export default VaultCases;