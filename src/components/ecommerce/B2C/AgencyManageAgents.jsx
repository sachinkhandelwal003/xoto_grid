import React, { useState, useEffect, useCallback } from "react";
import {
  Button, Modal, Form, Input, Tag, Typography, Row, Col,
  Upload, Select, InputNumber, Tooltip, Space, Spin, Empty,
  Steps, Alert, Popconfirm, Drawer,
} from "antd";
import {
  PlusOutlined, DeleteOutlined, UserOutlined, CheckCircleFilled,
  FileDoneOutlined, EyeOutlined, MailOutlined, PhoneOutlined,
  EnvironmentOutlined, TrophyOutlined, UploadOutlined, TeamOutlined,
  ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined, EditOutlined, FilterOutlined, StopOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../CMS/pages/custom/CustomTable"; // ← apna sahi path lagao

const { Option } = Select;

const AVATAR_COLORS = [
  "#5f0f9c","#0891B2","#059669","#D97706",
  "#DC2626","#7C3AED","#DB2777","#EA580C","#65A30D","#0284C7",
];
const SPECIALIZATIONS = ["Luxury","Residential","Commercial","Off-Plan","Rental","Investment"];
const COUNTRY_CODES = [
  { code:"+971", label:"AE +971" }, { code:"+91",  label:"IN +91"  },
  { code:"+1",   label:"US +1"   }, { code:"+44",  label:"GB +44"  },
  { code:"+966", label:"SA +966" }, { code:"+974", label:"QA +974" },
];
const STORAGE_KEY = "rm_agency_agents_v3";

const getInitials = (name="") => name.split(" ").map((w)=>w[0]||"").join("").toUpperCase().slice(0,2);
const getAvatarColor = (name="") => {
  const h = name.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};
const loadFromStorage = () => { try { const r=localStorage.getItem(STORAGE_KEY); return r?JSON.parse(r):[]; } catch{return[];} };
const saveToStorage = (d) => { try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d));}catch{} };

/* ── useIsMobile ── */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return isMobile;
};

/* ── AgentAvatar ── */
const AgentAvatar = ({ name="", src, size=40, showDot=false, active=true }) => (
  <div style={{ position:"relative", display:"inline-block", flexShrink:0 }}>
    {src
      ? <img src={src} alt={name} style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", border:"3px solid #fff", boxShadow:"0 4px 12px rgba(95,15,156,.2)" }} />
      : <div style={{ width:size, height:size, borderRadius:"50%", background:getAvatarColor(name), color:"#fff", fontWeight:700, fontSize:size*.35, display:"flex", alignItems:"center", justifyContent:"center", border:"3px solid #fff", boxShadow:"0 4px 12px rgba(95,15,156,.2)", letterSpacing:"-.5px" }}>{getInitials(name)}</div>
    }
    {showDot && <span style={{ position:"absolute", bottom:0, right:0, width:12, height:12, borderRadius:"50%", border:"3px solid #fff", background:active?"#22c55e":"#9CA3AF", boxShadow:`0 0 0 2px ${active?"#bbf7d0":"#e5e7eb"}` }} />}
  </div>
);

/* ── StatCard ── */
const StatCard = ({ title, value, icon, accent, bg }) => (
  <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:16, padding:"16px 18px", display:"flex", alignItems:"center", gap:14, boxShadow:"0 2px 8px rgba(0,0,0,.06)", transition:"all .25s", cursor:"default" }}
    onMouseEnter={(e)=>{ e.currentTarget.style.boxShadow="0 12px 28px rgba(95,15,156,.12)"; e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.borderColor="#5f0f9c"; }}
    onMouseLeave={(e)=>{ e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,.06)"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.borderColor="#E5E7EB"; }}
  >
    <div style={{ width:46, height:46, borderRadius:14, background:bg, color:accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{icon}</div>
    <div>
      <div style={{ fontSize:11, color:"#6B7280", fontWeight:600, marginBottom:2 }}>{title}</div>
      <div style={{ fontSize:26, fontWeight:800, color:"#111827", lineHeight:1 }}>{value}</div>
    </div>
  </div>
);

/* ── UploadField ── */
const UploadField = ({ type, label, accept, fileObj, uploading, onUpload, onRemove }) => (
  <div>
    <div style={{ fontSize:12, fontWeight:600, color:"#374151", marginBottom:6 }}>{label}</div>
    {fileObj ? (
      <div style={{ border:"2px solid #5f0f9c", borderRadius:14, padding:"12px 14px", background:"linear-gradient(135deg,#faf5ff,#f3e8ff)", display:"flex", alignItems:"center", gap:10 }}>
        <CheckOutlined style={{ color:"#5f0f9c", fontSize:16 }} />
        <span style={{ flex:1, fontSize:12, color:"#5f0f9c", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight:700 }} title={fileObj.name||label}>{fileObj.name||label}</span>
        <button onClick={()=>onRemove(type)} style={{ border:"none", background:"none", cursor:"pointer", color:"#9CA3AF", fontSize:20, lineHeight:1, padding:"0 8px" }} type="button">×</button>
      </div>
    ) : (
      <Upload showUploadList={false} beforeUpload={(f)=>{onUpload(f,type);return false;}} accept={accept}>
        <div style={{ border:"2px dashed #5f0f9c", borderRadius:14, padding:"20px 16px", textAlign:"center", cursor:"pointer", background:"linear-gradient(135deg,#faf5ff,#f3e8ff)", transition:"all .2s" }}
          onMouseEnter={(e)=>{ e.currentTarget.style.borderColor="#7c3aed"; e.currentTarget.style.transform="scale(1.01)"; }}
          onMouseLeave={(e)=>{ e.currentTarget.style.borderColor="#5f0f9c"; e.currentTarget.style.transform="scale(1)"; }}
        >
          {uploading ? <Spin size="small" /> : <>
            <UploadOutlined style={{ fontSize:22, color:"#5f0f9c", display:"block", marginBottom:6 }} />
            <div style={{ fontSize:12, fontWeight:700, color:"#5f0f9c" }}>Click to upload</div>
            <div style={{ fontSize:11, color:"#7c3aed", marginTop:2 }}>{type==="profile"?"PNG, JPG up to 2MB":"PDF or image"}</div>
          </>}
        </div>
      </Upload>
    )}
  </div>
);

/* ── StatusPill ── */
const StatusPill = ({ active }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:999, fontSize:11, fontWeight:700, border:"1px solid", background:active?"linear-gradient(135deg,#f0fdf4,#dcfce7)":"#f9fafb", borderColor:active?"#86efac":"#e5e7eb", color:active?"#15803d":"#6b7280" }}>
    <span style={{ width:7, height:7, borderRadius:"50%", background:active?"#22c55e":"#9ca3af", boxShadow:active?"0 0 0 3px rgba(34,197,94,.2)":"none" }} />
    {active ? "Active" : "Inactive"}
  </span>
);

const specColor = (s="") => ({ Luxury:"purple",Residential:"blue",Commercial:"gold","Off-Plan":"geekblue",Rental:"green",Investment:"magenta" })[s] || "default";

/* ── Mobile AgentCard ── */
const AgentCard = ({ agent, onView, onDelete, delay=0 }) => (
  <div style={{ background:"#fff", borderRadius:18, padding:"18px 16px", border:"1px solid #f0e6ff", marginBottom:12, boxShadow:"0 4px 16px rgba(95,15,156,.07)", animation:`rowFadeIn .25s ease ${delay}s both`, transition:"all .2s" }}
    onMouseEnter={(e)=>{ e.currentTarget.style.boxShadow="0 8px 28px rgba(95,15,156,.15)"; e.currentTarget.style.transform="translateY(-2px)"; }}
    onMouseLeave={(e)=>{ e.currentTarget.style.boxShadow="0 4px 16px rgba(95,15,156,.07)"; e.currentTarget.style.transform="translateY(0)"; }}
  >
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <AgentAvatar name={agent.name} src={agent.avatar} size={48} showDot active={agent.status} />
        <div>
          <div style={{ fontSize:15, fontWeight:800, color:"#111827" }}>{agent.name}</div>
          <div style={{ fontSize:11, color:"#9CA3AF", fontWeight:600, marginTop:2 }}>{agent.role||"Agent"}</div>
        </div>
      </div>
      <StatusPill active={!!agent.status} />
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
      {[["Email",agent.email],["Phone",agent.phone],["City",agent.city],["Experience",agent.experience!=null?`${agent.experience} yr`:null]].map(([label,value])=>(
        <div key={label} style={{ background:"#faf5ff", borderRadius:10, padding:"10px 12px" }}>
          <div style={{ fontSize:10, color:"#7c3aed", fontWeight:700, marginBottom:4, textTransform:"uppercase", letterSpacing:".5px" }}>{label}</div>
          <div style={{ fontSize:12, color:"#374151", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value||"--"}</div>
        </div>
      ))}
    </div>
    {agent.specialization && <div style={{ marginBottom:14 }}><Tag style={{ borderRadius:999, border:"none", fontWeight:700, fontSize:11, padding:"4px 12px", margin:0, background:"linear-gradient(135deg,#faf5ff,#f3e8ff)", color:"#5f0f9c" }}>{agent.specialization}</Tag></div>}
    <div style={{ display:"flex", gap:10 }}>
      <Button onClick={()=>onView(agent)} style={{ flex:1, height:40, borderRadius:12, fontWeight:700, fontSize:13, border:"1px solid #e9d5ff", color:"#5f0f9c", background:"#faf5ff" }} icon={<EyeOutlined />}>View</Button>
      <Popconfirm title="Remove Agent" description="Remove this agent?" onConfirm={()=>onDelete(agent.id)} okText="Remove" okType="danger" cancelText="Cancel" placement="topRight">
        <Button danger style={{ flex:1, height:40, borderRadius:12, fontWeight:700, fontSize:13, border:"1px solid #fca5a5", background:"#fff2f2" }} icon={<DeleteOutlined />}>Remove</Button>
      </Popconfirm>
    </div>
  </div>
);

/* ── ViewAgentModal ── */
const ViewAgentModal = ({ open, onClose, agent }) => {
  const isMobile = useIsMobile();
  if (!agent) return null;
  const isActive = agent.status === true;

  const content = (
    <>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(1.3)}}
        .vaBanner{background:linear-gradient(135deg,#5f0f9c,#7c3aed 50%,#a855f7);padding:28px 20px 60px;position:relative;overflow:hidden}
        .vaBanner::before{content:'';position:absolute;top:-60%;right:-15%;width:280px;height:280px;background:rgba(255,255,255,.08);border-radius:50%}
        .vaBanner::after{content:'';position:absolute;bottom:-40%;left:-15%;width:220px;height:220px;background:rgba(255,255,255,.06);border-radius:50%}
        .vaBadge{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;font-size:12px;font-weight:700;backdrop-filter:blur(10px)}
        .vaBadge.active{background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3)}
        .vaBadge.inactive{background:rgba(0,0,0,.2);color:rgba(255,255,255,.8);border:1px solid rgba(255,255,255,.2)}
        .vaStatsGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:-44px;padding:0 16px 16px;position:relative;z-index:1}
        .vaMiniStat{background:#fff;border-radius:16px;padding:14px 10px;text-align:center;box-shadow:0 8px 24px rgba(95,15,156,.12);border:1px solid rgba(95,15,156,.08);transition:all .25s}
        .vaMiniStat:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(95,15,156,.18)}
        .vaMiniStatIcon{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:18px}
        .vaMiniStatValue{font-size:17px;font-weight:800;color:#0f172a;line-height:1;margin-bottom:4px}
        .vaMiniStatLabel{font-size:9px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
        .vaSection{background:#fff;border-radius:16px;margin:0 14px 12px;padding:16px 18px;box-shadow:0 2px 12px rgba(0,0,0,.04);border:1px solid #f1f5f9}
        .vaSectionTitle{font-size:10px;font-weight:800;color:#5f0f9c;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:14px;display:flex;align-items:center;gap:8px}
        .vaSectionTitle::after{content:'';flex:1;height:2px;background:linear-gradient(90deg,#e9d5ff,transparent);border-radius:2px}
        .vaInfoRow{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px dashed #f1f5f9}
        .vaInfoRow:last-child{border-bottom:none;padding-bottom:0}
        .vaInfoLabel{font-size:12px;color:#64748b;font-weight:500;display:flex;align-items:center;gap:8px}
        .vaInfoLabelIcon{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
        .vaInfoValue{font-size:13px;font-weight:700;color:#0f172a;text-align:right;max-width:55%;overflow:hidden;text-overflow:ellipsis}
        .vaInfoValue.empty{color:#cbd5e1;font-weight:500}
        .vaDocCard{display:flex;align-items:center;gap:12px;padding:12px 14px;background:linear-gradient(135deg,#faf5ff,#f3e8ff);border-radius:12px;border:1px solid #e9d5ff;margin-bottom:10px;transition:all .2s}
        .vaDocCard:last-child{margin-bottom:0}
        .vaDocCard:hover{transform:translateX(4px);border-color:#5f0f9c}
        .vaDocIcon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;background:#fff}
        .vaDocInfo{flex:1;min-width:0}
        .vaDocName{font-size:13px;font-weight:700;color:#0f172a;margin-bottom:2px}
        .vaDocMeta{font-size:11px;color:#7c3aed}
        .vaDocLink{padding:7px 14px;border-radius:10px;font-size:12px;font-weight:700;background:linear-gradient(135deg,#5f0f9c,#7c3aed);color:#fff;border:none;cursor:pointer;text-decoration:none;box-shadow:0 4px 12px rgba(95,15,156,.3);white-space:nowrap}
        .vaDocLink:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(95,15,156,.4)}
        .vaFooter{padding:12px 14px 20px;display:flex;gap:10px}
        .vaVerified{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;background:linear-gradient(135deg,#f0fdf4,#dcfce7);color:#16a34a;margin-left:6px}
      `}</style>

      <div className="vaBanner">
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ position:"relative" }}>
              <AgentAvatar name={agent.name} src={agent.avatar} size={68} />
              <div style={{ position:"absolute", bottom:2, right:2, width:16, height:16, borderRadius:"50%", background:isActive?"#22c55e":"#94a3b8", border:"3px solid #fff" }} />
            </div>
            <div>
              <h2 style={{ fontSize:20, fontWeight:800, color:"#fff", margin:"0 0 8px", letterSpacing:"-.5px" }}>{agent.name}</h2>
              <div className={`vaBadge ${isActive?"active":"inactive"}`}>
                {isActive && <span style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80", animation:"pulse 2s infinite" }} />}
                {isActive?"Active Now":"Offline"}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"1px solid rgba(255,255,255,.3)", background:"rgba(255,255,255,.15)", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, position:"relative", zIndex:2 }}>✕</button>
        </div>
      </div>

      <div className="vaStatsGrid">
        {[
          { icon:<TrophyOutlined/>, bg:"linear-gradient(135deg,#fef3c7,#fde68a)", color:"#d97706", value: agent.experience??0, label:"Years Exp." },
          { icon:<EnvironmentOutlined/>, bg:"linear-gradient(135deg,#dbeafe,#bfdbfe)", color:"#2563eb", value: agent.city||"—", label:"Location", small:true },
          { icon:<FileDoneOutlined/>, bg: agent.specialization?"linear-gradient(135deg,#faf5ff,#f3e8ff)":"#f1f5f9", color: agent.specialization?"#5f0f9c":"#94a3b8", value: agent.specialization||"—", label:"Specialization", small:true },
        ].map(({icon,bg,color,value,label,small})=>(
          <div key={label} className="vaMiniStat">
            <div className="vaMiniStatIcon" style={{ background:bg, color }}>{icon}</div>
            <div className="vaMiniStatValue" style={{ fontSize:small?13:17 }}>{value}</div>
            <div className="vaMiniStatLabel">{label}</div>
          </div>
        ))}
      </div>

      <div className="vaSection">
        <div className="vaSectionTitle">📞 Contact Information</div>
        {[
          { icon:<MailOutlined/>, bg:"linear-gradient(135deg,#fef3c7,#fde68a)", color:"#d97706", label:"Email", value:agent.email },
          { icon:<PhoneOutlined/>, bg:"linear-gradient(135deg,#dbeafe,#bfdbfe)", color:"#2563eb", label:"Phone", value:agent.phone },
          { icon:<EnvironmentOutlined/>, bg:"linear-gradient(135deg,#fce7f3,#fbcfe8)", color:"#db2777", label:"Location", value:[agent.city,agent.country].filter(Boolean).join(", ")||null },
        ].map(({icon,bg,color,label,value})=>(
          <div key={label} className="vaInfoRow">
            <div className="vaInfoLabel"><div className="vaInfoLabelIcon" style={{ background:bg, color }}>{icon}</div>{label}</div>
            <div className={`vaInfoValue ${!value?"empty":""}`}>{value||"Not provided"}</div>
          </div>
        ))}
      </div>

      <div className="vaSection">
        <div className="vaSectionTitle">💼 Professional Details</div>
        <div className="vaInfoRow">
          <div className="vaInfoLabel"><div className="vaInfoLabelIcon" style={{ background:"linear-gradient(135deg,#fef3c7,#fde68a)", color:"#d97706" }}><TrophyOutlined/></div>Experience</div>
          <div className="vaInfoValue">{agent.experience!=null?`${agent.experience} Years`:"—"}</div>
        </div>
        <div className="vaInfoRow">
          <div className="vaInfoLabel"><div className="vaInfoLabelIcon" style={{ background:"linear-gradient(135deg,#dcfce7,#bbf7d0)", color:"#16a34a" }}><FileDoneOutlined/></div>RERA No.</div>
          <div className={`vaInfoValue ${!agent.reraNumber?"empty":""}`}>{agent.reraNumber?<>{agent.reraNumber}<span className="vaVerified">✓</span></>:"Not registered"}</div>
        </div>
        <div className="vaInfoRow">
          <div className="vaInfoLabel"><div className="vaInfoLabelIcon" style={{ background:"linear-gradient(135deg,#faf5ff,#f3e8ff)", color:"#5f0f9c" }}><CheckCircleFilled/></div>Specialization</div>
          <div className="vaInfoValue">{agent.specialization||"—"}</div>
        </div>
      </div>

      {(agent.idProof||agent.reraCertificate) && (
        <div className="vaSection">
          <div className="vaSectionTitle">📄 Documents</div>
          {agent.idProof && <div className="vaDocCard"><div className="vaDocIcon">🪪</div><div className="vaDocInfo"><div className="vaDocName">ID Proof</div><div className="vaDocMeta">Government issued ID</div></div><a href={agent.idProof} target="_blank" rel="noopener noreferrer" className="vaDocLink">View</a></div>}
          {agent.reraCertificate && <div className="vaDocCard"><div className="vaDocIcon">📜</div><div className="vaDocInfo"><div className="vaDocName">RERA Certificate</div><div className="vaDocMeta">Real Estate Regulatory Agency</div></div><a href={agent.reraCertificate} target="_blank" rel="noopener noreferrer" className="vaDocLink">View</a></div>}
        </div>
      )}

      <div className="vaFooter">
        <Button type="primary" icon={<EditOutlined/>} size="large" style={{ flex:1, height:46, borderRadius:12, fontWeight:700, fontSize:14, background:"linear-gradient(135deg,#5f0f9c,#7c3aed)", border:"none", boxShadow:"0 8px 20px rgba(95,15,156,.35)" }}>Edit Profile</Button>
        <Button size="large" onClick={onClose} style={{ flex:1, height:46, borderRadius:12, fontWeight:700, fontSize:14, background:"#f8fafc", border:"1px solid #e2e8f0", color:"#475569" }}>Close</Button>
      </div>
    </>
  );

  if (isMobile) return <Drawer open={open} onClose={onClose} placement="bottom" height="92vh" styles={{ body:{padding:0,overflowY:"auto"}, header:{display:"none"} }} style={{ borderRadius:"20px 20px 0 0" }}>{content}</Drawer>;
  return <Modal open={open} onCancel={onClose} closable={false}    width={720} centered footer={null} styles={{ content:{borderRadius:24,padding:0,overflow:"hidden",boxShadow:"0 25px 60px -12px rgba(95,15,156,.3)"} }}>{content}</Modal>;
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
const AgencyManageAgents = () => {
  const { user } = useSelector((s) => s.auth);
  const agencyId = user?._id || user?.id;
  const isMobile = useIsMobile();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [tableFilters, setTableFilters] = useState({});

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const [urls, setUrls] = useState({ profile:"", idProof:"", rera:"" });
  const [uploadFiles, setUploadFiles] = useState({ profile:null, idProof:null, rera:null });
  const [uploading, setUploading] = useState({ profile:false, idProof:false, rera:false });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  
  const [actionLoading, setActionLoading] = useState(false);

  /* ── Fetch ── */
  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/agency/agents");
      const data = res?.data?.data;
      if (!Array.isArray(data)) { setAgents(loadFromStorage()); return; }
      const formatted = data.map((a) => ({
        id: a._id, _id: a._id,
        name: `${a.first_name||""} ${a.last_name||""}`.trim(),
        email: a.email || "",
        phone: `${a.country_code||""} ${a.phone_number||""}`.trim(),
        role: a.role || "Agent",
        status: a.isActive ?? a.is_active ?? a.status ?? true,
        avatar: a.profile_photo || null,
        city: a.operating_city || "",
        country: a.country || "",
        specialization: a.specialization || "",
        experience_years: Number(a.experience_years) || 0,
        reraNumber: a.reraCardNumber || a.rera_number || "",
        idProof: a.emiratesIdUrl || a.id_proof || null,
        reraCertificate: a.reraCardUrl || a.rera_certificate || null,
        agencyApprovalStatus: a.agencyApprovalStatus || "pending",
      }));
      setAgents(formatted);
      saveToStorage(formatted);
    } catch { setAgents(loadFromStorage()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  /* ── Upload ── */
  const handleUpload = async (file, type) => {
    const allowed = type==="profile" ? ["image/jpeg","image/png","image/jpg","image/webp"] : ["application/pdf","image/jpeg","image/png","image/jpg"];
    if (!allowed.includes(file.type)) { toast.error("Invalid file type"); return false; }
    setUploading((p)=>({...p,[type]:true}));
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await apiService.upload("upload", fd);
      const uploadedUrl = res?.file?.url || res?.url;
      if (uploadedUrl) { setUrls((p)=>({...p,[type]:uploadedUrl})); setUploadFiles((p)=>({...p,[type]:file})); toast.success(`${type==="profile"?"Photo":type.toUpperCase()} uploaded`); }
    } catch { setUrls((p)=>({...p,[type]:URL.createObjectURL(file)})); setUploadFiles((p)=>({...p,[type]:file})); }
    finally { setUploading((p)=>({...p,[type]:false})); }
    return false;
  };
  const removeFile = (type) => { setUrls((p)=>({...p,[type]:""})); setUploadFiles((p)=>({...p,[type]:null})); };
  const resetModal = () => { form.resetFields(); setUrls({profile:"",idProof:"",rera:""}); setUploadFiles({profile:null,idProof:null,rera:null}); setCurrentStep(0); };
  const closeAddModal = () => { setAddModalOpen(false); resetModal(); };

  const STEP0_FIELDS = ["first_name","last_name","email","password","phone_number"];
  const STEP1_FIELDS = ["operating_city"];
  const handleNext = async () => {
    try {
      if (currentStep===0) await form.validateFields(STEP0_FIELDS);
      if (currentStep===1) await form.validateFields(STEP1_FIELDS);
      setCurrentStep((s)=>s+1);
    } catch {}
  };

  /* ── Submit ── */
  const handleAddAgent = async () => {
    try { await form.validateFields([...STEP0_FIELDS,...STEP1_FIELDS]); }
    catch { toast.error("Please complete all required fields"); return; }
    const v = form.getFieldsValue(true);
    const payload = {
      first_name:(v.first_name||"").trim(), last_name:(v.last_name||"").trim(),
      email:(v.email||"").trim(), password:v.password||"",
      phone_number:(v.phone_number||"").trim(), country_code:v.country_code||"+971",
      operating_city:(v.operating_city||"").trim(), specialization:v.specialization||"",
      country:(v.country||"UAE").trim(), experience_years:Number(v.experience_years)??0,
      rera_number:(v.rera_number||"").trim(),
      profile_photo:urls.profile||null, id_proof:urls.idProof||null, rera_certificate:urls.rera||null,
      agency_id:agencyId,
    };
    const tempId = Date.now().toString();
    const localAgent = {
      id:tempId, _id:tempId,
      name:`${payload.first_name} ${payload.last_name}`.trim(),
      email:payload.email, phone:`${payload.country_code} ${payload.phone_number}`.trim(),
      city:payload.operating_city, country:payload.country, specialization:payload.specialization,
      experience:payload.experience_years??null, reraNumber:payload.rera_number,
      status:true, avatar:urls.profile||null, idProof:urls.idProof||null, reraCertificate:urls.rera||null, role:"Agent",
    };
    try { await apiService.post("/agent/agent-signup", payload); toast.success("Agent created successfully!"); }
    catch (err) { toast.error(err?.response?.data?.message || "API error — saved locally"); }
    const updated = [...agents, localAgent];
    setAgents(updated); saveToStorage(updated); closeAddModal();
  };

  const handleDelete = async (id) => {
    try { await apiService.delete(`agent/delete-agent/${id}`); } catch {}
    const updated = agents.filter((a)=>a.id!==id);
    setAgents(updated); saveToStorage(updated); toast.success("Agent removed");
  };

  const handleApprove = async (agent) => {
    setActionLoading(true);
    try {
      await apiService.patch(`/agency/agents/${agent.id}/approve`);
      toast.success("Agent approved successfully!");
      fetchAgents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve agent");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRejectModal = (agent) => {
    setSelectedAgent(agent);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setActionLoading(true);
    try {
      await apiService.patch(`/agency/agents/${selectedAgent.id}/decline`, { reason: rejectReason });
      toast.success("Agent rejected successfully!");
      setRejectModalOpen(false);
      fetchAgents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject agent");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenSuspendModal = (agent) => {
    setSelectedAgent(agent);
    setSuspendReason("");
    setSuspendModalOpen(true);
  };

  const handleSuspend = async () => {
    setActionLoading(true);
    try {
      await apiService.patch(`/agency/agents/${selectedAgent.id}/suspend`, { reason: suspendReason });
      toast.success("Agent suspended successfully!");
      setSuspendModalOpen(false);
      fetchAgents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to suspend agent");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async (agent) => {
    setActionLoading(true);
    try {
      await apiService.patch(`/agency/agents/${agent.id}/unsuspend`);
      toast.success("Agent unsuspended successfully!");
      fetchAgents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to unsuspend agent");
    } finally {
      setActionLoading(false);
    }
  };

  const total = agents.length;
  const active = agents.filter((a)=>a.status).length;
  const inactive = total - active;

  /* ─────────────────────────────────────────────────────────
     CUSTOM TABLE COLUMNS
  ───────────────────────────────────────────────────────── */
  const tableColumns = [
    {
      key: "name", title: "Agent", sortable: true,
      render: (_, agent) => (
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <AgentAvatar name={agent.name} src={agent.avatar} size={38} showDot active={agent.status} />
          <div>
            <div style={{ fontSize:13, fontWeight:800, color:"#111827", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{agent.name}</div>
            <div style={{ fontSize:11, color:"#9CA3AF", display:"flex", alignItems:"center", gap:4, marginTop:2, fontWeight:600 }}>
              <MailOutlined style={{ fontSize:10, color:"#5f0f9c" }} />
              <span style={{ maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{agent.email||"--"}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "phone", title: "Contact",
      render: (_, agent) => (
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          <div style={{ fontSize:12, color:"#374151", display:"flex", alignItems:"center", gap:5, fontWeight:600 }}>
            <PhoneOutlined style={{ color:"#5f0f9c", fontSize:11 }} />
            {agent.phone ? <a href={`tel:${agent.phone}`} style={{ color:"inherit", textDecoration:"none" }}>{agent.phone}</a> : "--"}
          </div>
          <span style={{ fontSize:10, color:"#9CA3AF", fontWeight:700, padding:"2px 7px", background:"linear-gradient(135deg,#faf5ff,#f3e8ff)", borderRadius:5, width:"fit-content" }}>{agent.role||"Agent"}</span>
        </div>
      ),
    },
    {
      key: "city", title: "City", sortable: true,
      render: (_, agent) => (
        <div>
          <div style={{ fontSize:12, color:"#374151", display:"flex", alignItems:"center", gap:5, fontWeight:600 }}>
            <EnvironmentOutlined style={{ color:"#0891B2", fontSize:11 }} />{agent.city||"--"}
          </div>
          {agent.country && <div style={{ fontSize:10, color:"#9CA3AF", marginTop:2, paddingLeft:16 }}>{agent.country}</div>}
        </div>
      ),
    },
    {
      key: "specialization", title: "Specialization", sortable: true,
      filterable: true, filterKey: "specialization",
      filterOptions: SPECIALIZATIONS.map((s)=>({ label:s, value:s })),
      render: (val) => val
        ? <Tag style={{ borderRadius:999, border:"none", fontWeight:700, fontSize:11, padding:"3px 10px", margin:0, background:"linear-gradient(135deg,#faf5ff,#f3e8ff)", color:"#5f0f9c" }}>{val}</Tag>
        : <span style={{ color:"#D1D5DB", fontSize:12 }}>--</span>,
    },
    {
      key: "experience", title: "Exp.", sortable: true,
      render: (val) => val!=null
        ? <div style={{ display:"flex", alignItems:"center", gap:5 }}><TrophyOutlined style={{ color:"#D97706", fontSize:13 }} /><span style={{ fontWeight:800, fontSize:13, color:"#374151" }}>{val}yr</span></div>
        : <span style={{ color:"#D1D5DB", fontSize:12 }}>--</span>,
    },
    {
      key: "approvalStatus", title: "Approval Status",
      render: (_, agent) => {
        const getStatusStyle = (status) => {
          switch(status) {
            case "approved":
              return { background: "linear-gradient(135deg,#ECFDF5,#DCFCE7)", color: "#059669", borderColor: "#86EFAC" };
            case "declined":
              return { background: "linear-gradient(135deg,#FEF2F2,#FEE2E2)", color: "#DC2626", borderColor: "#FCA5A5" };
            default:
              return { background: "linear-gradient(135deg,#FFFBEB,#FEF3C7)", color: "#D97706", borderColor: "#FDE68A" };
          }
        };
        const style = getStatusStyle(agent.agencyApprovalStatus);
        return (
          <span style={{ 
            display:"inline-flex", alignItems:"center", gap:"6px", 
            padding:"5px 12px", borderRadius:"999px", fontSize:"11px", fontWeight:"700",
            border: `1px solid ${style.borderColor}`, background: style.background, color: style.color 
          }}>
            {agent.agencyApprovalStatus === "approved" ? "Approved" : 
             agent.agencyApprovalStatus === "declined" ? "Declined" : "Pending"}
          </span>
        );
      }
    },
    {
      key: "status", title: "Status",
      filterable: true, filterKey: "status",
      filterOptions: [{ label:"Active", value:"true" }, { label:"Inactive", value:"false" }],
      render: (_, agent) => <StatusPill active={!!agent.status} />,
    },
    {
      key: "actions", title: "Actions",
      render: (_, agent) => (
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <Tooltip title="View Details">
            <Button type="text" size="small" icon={<EyeOutlined />}
              onClick={()=>{ setSelectedAgent(agent); setViewModalOpen(true); }}
              style={{ width:34, height:34, borderRadius:10, border:"1px solid #e5e7eb", color:"#5f0f9c", background:"#fff" }}
            />
          </Tooltip>

          {/* Approve/Reject buttons for pending agents */}
          {agent.agencyApprovalStatus === "pending" && (
            <>
              <Tooltip title="Approve">
                <Button type="text" size="small" icon={<CheckOutlined />}
                  onClick={()=>handleApprove(agent)}
                  loading={actionLoading}
                  style={{ width:34, height:34, borderRadius:10, border:"1px solid #bbf7d0", color:"#16a34a", background:"#f0fdf4" }}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button type="text" size="small" icon={<StopOutlined />}
                  onClick={()=>handleOpenRejectModal(agent)}
                  style={{ width:34, height:34, borderRadius:10, border:"1px solid #fecaca", color:"#dc2626", background:"#fef2f2" }}
                />
              </Tooltip>
            </>
          )}

          {/* Suspend/Unsuspend buttons for approved agents */}
          {agent.agencyApprovalStatus === "approved" && (
            agent.status ? (
              <Tooltip title="Suspend">
                <Button type="text" size="small" icon={<StopOutlined />}
                  onClick={()=>handleOpenSuspendModal(agent)}
                  style={{ width:34, height:34, borderRadius:10, border:"1px solid #fed7aa", color:"#d97706", background:"#fff7ed" }}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Unsuspend">
                <Button type="text" size="small" icon={<CheckOutlined />}
                  onClick={()=>handleUnsuspend(agent)}
                  loading={actionLoading}
                  style={{ width:34, height:34, borderRadius:10, border:"1px solid #bbf7d0", color:"#16a34a", background:"#f0fdf4" }}
                />
              </Tooltip>
            )
          )}

          <Popconfirm title="Remove Agent" description="Remove this agent from your team?"
            onConfirm={()=>handleDelete(agent.id)} okText="Remove" okType="danger" cancelText="Cancel" placement="topRight"
          >
            <Tooltip title="Remove">
              <Button type="text" danger size="small" icon={<DeleteOutlined />}
                style={{ width:34, height:34, borderRadius:10, border:"1px solid #fca5a5", background:"#fff" }}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Apply status dropdown filter from CustomTable
  const tableData = agents.filter((a) => {
    if (tableFilters.status === "true")  return a.status === true;
    if (tableFilters.status === "false") return a.status === false;
    return true;
  });

  /* ── Add Agent content ── */
  const addAgentContent = (
    <>
      <div style={{ padding:"20px 22px 18px", background:"linear-gradient(135deg,#5f0f9c,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}><UserOutlined style={{ color:"#fff", fontSize:18 }} /></div>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:"#fff" }}>Register New Agent</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.8)" }}>Step {currentStep+1} of 3</div>
          </div>
        </div>
        <button onClick={closeAddModal} style={{ width:32, height:32, borderRadius:"50%", border:"1px solid rgba(255,255,255,.3)", background:"rgba(255,255,255,.15)", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>✕</button>
      </div>
      <div style={{ padding:"18px 22px 0" }}>
        <Steps current={currentStep} size="small" style={{ marginBottom:20 }} items={[
          { title:isMobile?"":"Personal",     icon:<UserOutlined/>     },
          { title:isMobile?"":"Professional", icon:<TrophyOutlined/>   },
          { title:isMobile?"":"Documents",    icon:<FileDoneOutlined/> },
        ]} />
      </div>
      <Form form={form} layout="vertical" preserve style={{ padding:"0 22px 12px" }}>
        {/* Step 0 */}
        <div style={{ display:currentStep===0?"block":"none" }}>
          <Alert message="Personal Information" description="Basic details for the agent's account." type="info" showIcon style={{ borderRadius:12, marginBottom:18, border:"none", background:"linear-gradient(135deg,#faf5ff,#f3e8ff)" }} />
          <Row gutter={14}>
            <Col xs={24} md={12}><Form.Item name="first_name" label="First Name" rules={[{required:true,message:"Required"}]}><Input size="large" placeholder="e.g. Sarah" style={{ borderRadius:12 }} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="last_name" label="Last Name" rules={[{required:true,message:"Required"}]}><Input size="large" placeholder="e.g. Ahmed" style={{ borderRadius:12 }} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="email" label="Email Address" rules={[{required:true,type:"email",message:"Valid email required"}]}><Input size="large" placeholder="agent@realestate.com" prefix={<MailOutlined style={{ color:"#5f0f9c" }} />} style={{ borderRadius:12 }} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="password" label="Temporary Password" rules={[{required:true,min:6,message:"Min 6 chars"}]}><Input.Password size="large" placeholder="Create a password" style={{ borderRadius:12 }} /></Form.Item></Col>
            <Col xs={24} sm={8}><Form.Item name="country_code" label="Code" initialValue="+971"><Select size="large">{COUNTRY_CODES.map((c)=><Option key={c.code} value={c.code}>{c.label}</Option>)}</Select></Form.Item></Col>
            <Col xs={24} sm={16}><Form.Item name="phone_number" label="Phone Number" rules={[{required:true,message:"Required"}]}><Input size="large" placeholder="50 123 4567" prefix={<PhoneOutlined style={{ color:"#5f0f9c" }} />} style={{ borderRadius:12 }} /></Form.Item></Col>
          </Row>
        </div>
        {/* Step 1 */}
        <div style={{ display:currentStep===1?"block":"none" }}>
          <Alert message="Professional Details" description="Expertise, location and qualifications." type="info" showIcon style={{ borderRadius:12, marginBottom:18, border:"none", background:"linear-gradient(135deg,#faf5ff,#f3e8ff)" }} />
          <Row gutter={14}>
            <Col xs={24} sm={8}><Form.Item name="country" label="Country" initialValue="UAE"><Input size="large" placeholder="UAE" prefix={<EnvironmentOutlined style={{ color:"#5f0f9c" }} />} style={{ borderRadius:12 }} /></Form.Item></Col>
            <Col xs={24} sm={8}><Form.Item name="operating_city" label="City" rules={[{required:true,message:"Required"}]}><Input size="large" placeholder="Dubai" prefix={<EnvironmentOutlined style={{ color:"#0891B2" }} />} style={{ borderRadius:12 }} /></Form.Item></Col>
            <Col xs={24} sm={8}><Form.Item name="experience_years" label="Experience (Yrs)"><InputNumber size="large" min={0} max={50} placeholder="0" style={{ width:"100%", borderRadius:12 }} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="specialization" label="Specialization"><Select size="large" placeholder="Select..." allowClear>{SPECIALIZATIONS.map((s)=><Option key={s} value={s}>{s}</Option>)}</Select></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="rera_number" label="RERA Number"><Input size="large" placeholder="RERA-2024-001" prefix={<FileDoneOutlined style={{ color:"#5f0f9c" }} />} style={{ borderRadius:12 }} /></Form.Item></Col>
          </Row>
        </div>
        {/* Step 2 */}
        <div style={{ display:currentStep===2?"block":"none" }}>
          <Alert message="Documents & Media" description="Upload verification documents." type="info" showIcon style={{ borderRadius:12, marginBottom:18, border:"none", background:"linear-gradient(135deg,#faf5ff,#f3e8ff)" }} />
          <Row gutter={14}>
            <Col xs={24} sm={8}><UploadField type="profile" label="Profile Photo" accept="image/*" fileObj={uploadFiles.profile} uploading={uploading.profile} onUpload={handleUpload} onRemove={removeFile} /></Col>
            <Col xs={24} sm={8} style={{ marginTop:isMobile?14:0 }}><UploadField type="idProof" label="ID Proof" accept=".pdf,image/*" fileObj={uploadFiles.idProof} uploading={uploading.idProof} onUpload={handleUpload} onRemove={removeFile} /></Col>
            <Col xs={24} sm={8} style={{ marginTop:isMobile?14:0 }}><UploadField type="rera" label="RERA Certificate" accept=".pdf,image/*" fileObj={uploadFiles.rera} uploading={uploading.rera} onUpload={handleUpload} onRemove={removeFile} /></Col>
          </Row>
        </div>
        {/* Footer */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:24, paddingTop:18, borderTop:"1px solid #f3f4f6" }}>
          {currentStep>0 ? <Button size="large" icon={<ArrowLeftOutlined/>} onClick={()=>setCurrentStep((s)=>s-1)} style={{ borderRadius:12, fontWeight:700 }}>Back</Button> : <div/>}
          <Space>
            <Button size="large" onClick={closeAddModal} style={{ borderRadius:12, fontWeight:700, borderColor:"#e9d5ff" }}>Cancel</Button>
            {currentStep<2
              ? <Button size="large" type="primary" onClick={handleNext} icon={<ArrowRightOutlined/>} style={{ borderRadius:12, paddingInline:22, fontWeight:700, fontSize:14, background:"linear-gradient(135deg,#5f0f9c,#7c3aed)", border:"none" }}>Next</Button>
              : <Button size="large" type="primary" onClick={handleAddAgent} icon={<CheckOutlined/>} style={{ borderRadius:12, paddingInline:22, fontWeight:700, fontSize:14, background:"linear-gradient(135deg,#16a34a,#15803d)", border:"none" }}>Create Agent</Button>
            }
          </Space>
        </div>
      </Form>
    </>
  );

  return (
    <div style={{ padding:isMobile?"16px 14px":"28px 24px", background:"linear-gradient(135deg,#faf5ff 0%,#f3e8ff 50%,#ede9fe 100%)", minHeight:"100vh", fontFamily:"'DM Sans',-apple-system,sans-serif" }}>
      <style>{`
        @keyframes rowFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        .flt-btn{padding:7px 14px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;font-size:12px;font-weight:700;color:#6b7280;cursor:pointer;transition:all .2s}
        .flt-btn.flt-active{background:linear-gradient(135deg,#5f0f9c,#7c3aed);color:#fff;border-color:#5f0f9c;box-shadow:0 6px 20px rgba(95,15,156,.3)}
        .flt-btn:hover:not(.flt-active){border-color:#5f0f9c;color:#5f0f9c}
      `}</style>

      <div style={{ maxWidth:1300, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, gap:10, flexWrap:"wrap", animation:"fadeUp .3s ease" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <div style={{ width:38, height:38, borderRadius:12, background:"linear-gradient(135deg,#5f0f9c,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 16px rgba(95,15,156,.3)" }}><TeamOutlined style={{ color:"#fff", fontSize:18 }} /></div>
              <h1 style={{ fontSize:isMobile?20:24, fontWeight:800, color:"#1e1b4b", margin:0 }}>Team Management</h1>
            </div>
            {!isMobile && <p style={{ fontSize:13, color:"#7c3aed", margin:0, marginLeft:48, fontWeight:500 }}>Manage and monitor your agency's real estate agents</p>}
          </div>
          <Button type="primary" icon={<PlusOutlined/>} size={isMobile?"middle":"large"} onClick={()=>setAddModalOpen(true)}
            style={{ borderRadius:12, paddingInline:isMobile?16:22, fontWeight:700, height:isMobile?40:46, fontSize:isMobile?13:14, background:"linear-gradient(135deg,#5f0f9c,#7c3aed)", border:"none", boxShadow:"0 8px 24px rgba(95,15,156,.35)" }}>
            {isMobile?"Add Agent":"Add New Agent"}
          </Button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:isMobile?10:16, marginBottom:18, animation:"fadeUp .35s ease" }}>
          <StatCard title="Total"    value={total}    accent="#5f0f9c" bg="linear-gradient(135deg,#faf5ff,#f3e8ff)" icon={<TeamOutlined/>}       />
          <StatCard title="Active"   value={active}   accent="#16a34a" bg="linear-gradient(135deg,#f0fdf4,#dcfce7)" icon={<CheckCircleFilled/>}   />
          <StatCard title="Inactive" value={inactive} accent="#dc2626" bg="linear-gradient(135deg,#fef2f2,#fee2e2)" icon={<UserOutlined/>}        />
        </div>

        {/* Mobile: Cards | Desktop: CustomTable */}
        {isMobile ? (
          <>
            <div style={{ background:"rgba(255,255,255,.9)", border:"1px solid #e9d5ff", borderRadius:14, padding:"12px 14px", marginBottom:14, display:"flex", gap:10, alignItems:"center" }}>
              <Input size="middle" allowClear placeholder="Search agents..." prefix={<MailOutlined style={{ color:"#5f0f9c" }} />}
                style={{ flex:1, borderRadius:12, borderColor:"#e9d5ff" }} />
              <button onClick={()=>setFilterDrawerOpen(true)} style={{ width:40, height:40, borderRadius:10, border:"1px solid #e9d5ff", background:statusFilter!=="all"?"linear-gradient(135deg,#5f0f9c,#7c3aed)":"#fff", color:statusFilter!=="all"?"#fff":"#5f0f9c", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:16, flexShrink:0 }}>
                <FilterOutlined />
              </button>
            </div>

            <Drawer open={filterDrawerOpen} onClose={()=>setFilterDrawerOpen(false)} placement="bottom" height="auto" title="Filter Agents" styles={{ body:{padding:"16px 20px 28px"} }} style={{ borderRadius:"20px 20px 0 0" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {["all","active","inactive"].map((f)=>(
                  <button key={f} onClick={()=>{ setStatusFilter(f); setFilterDrawerOpen(false); }}
                    style={{ width:"100%", padding:"14px 18px", borderRadius:12, fontWeight:700, fontSize:14, border:"1px solid", cursor:"pointer", textAlign:"left", background:statusFilter===f?"linear-gradient(135deg,#5f0f9c,#7c3aed)":"#faf5ff", color:statusFilter===f?"#fff":"#374151", borderColor:statusFilter===f?"#5f0f9c":"#e9d5ff" }}>
                    {f==="all"?"All Agents":f==="active"?"Active Only":"Inactive Only"}
                  </button>
                ))}
              </div>
            </Drawer>

            <div style={{ animation:"fadeUp .45s ease" }}>
              {loading
                ? <div style={{ padding:60, textAlign:"center" }}><Spin size="large" /></div>
                : agents.filter((a)=>statusFilter==="all"?true:statusFilter==="active"?a.status:!a.status).length===0
                  ? <Empty description={<div style={{ color:"#7c3aed" }}><p style={{ marginBottom:12, fontWeight:600 }}>No agents found</p><Button type="primary" icon={<PlusOutlined/>} onClick={()=>setAddModalOpen(true)} style={{ borderRadius:12, background:"linear-gradient(135deg,#5f0f9c,#7c3aed)", border:"none" }}>Add first agent</Button></div>} style={{ padding:"60px 20px" }} />
                  : agents.filter((a)=>statusFilter==="all"?true:statusFilter==="active"?a.status:!a.status)
                      .map((agent,i)=><AgentCard key={agent.id} agent={agent} delay={i*.03} onView={(a)=>{ setSelectedAgent(a); setViewModalOpen(true); }} onDelete={handleDelete} />)
              }
            </div>
          </>
        ) : (
          /* ─── CustomTable (Desktop) ─── */
          <div style={{ animation:"fadeUp .45s ease" }}>
            <CustomTable
              columns={tableColumns}
              data={tableData}
              loading={loading}
              itemsPerPage={10}
              showSearch={true}
              onFilter={(filters) => setTableFilters(filters)}
            />
          </div>
        )}
      </div>

      {/* ADD AGENT */}
      {isMobile
        ? <Drawer open={addModalOpen} onClose={closeAddModal} placement="bottom" height="95vh" styles={{ body:{padding:0,overflowY:"auto"}, header:{display:"none"} }} style={{ borderRadius:"20px 20px 0 0" }}>{addAgentContent}</Drawer>
        : <Modal open={addModalOpen} onCancel={closeAddModal} closable={false}    width={720} centered footer={null} destroyOnClose={false} styles={{ content:{borderRadius:24,padding:0,overflow:"hidden",boxShadow:"0 25px 60px -12px rgba(95,15,156,.3)"} }}>{addAgentContent}</Modal>
      }

      {/* VIEW AGENT */}
      <ViewAgentModal open={viewModalOpen} onClose={()=>setViewModalOpen(false)} agent={selectedAgent} />

      {/* REJECT REASON MODAL */}
      <Modal
        open={rejectModalOpen}
        onCancel={()=>setRejectModalOpen(false)}
        title="Reject Agent"
        centered
        footer={null}
      >
        <div style={{ padding: "10px 0" }}>
          <p style={{ color: "#6B7280", marginBottom: "16px" }}>Please provide a reason for rejecting this agent:</p>
          <Input.TextArea
            value={rejectReason}
            onChange={(e)=>setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
            rows={4}
            style={{ marginBottom: "20px", borderRadius: "10px" }}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              onClick={()=>setRejectModalOpen(false)}
              style={{ flex: 1, borderRadius: "10px" }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              onClick={handleReject}
              loading={actionLoading}
              style={{ flex: 1, borderRadius: "10px", background: "#dc2626" }}
            >
              Confirm Reject
            </Button>
          </div>
        </div>
      </Modal>

      {/* SUSPEND REASON MODAL */}
      <Modal
        open={suspendModalOpen}
        onCancel={()=>setSuspendModalOpen(false)}
        title="Suspend Agent"
        centered
        footer={null}
      >
        <div style={{ padding: "10px 0" }}>
          <p style={{ color: "#6B7280", marginBottom: "16px" }}>Please provide a reason for suspending this agent (optional):</p>
          <Input.TextArea
            value={suspendReason}
            onChange={(e)=>setSuspendReason(e.target.value)}
            placeholder="Enter suspension reason..."
            rows={4}
            style={{ marginBottom: "20px", borderRadius: "10px" }}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              onClick={()=>setSuspendModalOpen(false)}
              style={{ flex: 1, borderRadius: "10px" }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSuspend}
              loading={actionLoading}
              style={{ flex: 1, borderRadius: "10px", background: "#d97706" }}
            >
              Confirm Suspend
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AgencyManageAgents;