import {
  Typography,
  Row,
  Col,
  Input,
  Select,
  Spin,
  message,
  Popover,
  Checkbox,
  Avatar,
  Slider,
  Switch,
  InputNumber
} from "antd";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import {
  SearchOutlined,
  DownOutlined,
  CloseOutlined,
  TeamOutlined,
  ExpandOutlined,
  EditOutlined,
  EyeOutlined,
  FireOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@400;600;700&display=swap');

  :root {
    /* Sidebar palette extracted from screenshot */
    --sb-dark:    #1E0A3C;
    --sb-mid:     #2D1560;
    --sb-accent:  #7B2FBE;
    --sb-green:   #22C55E;
    --sb-green2:  #16A34A;

    /* Page surface */
    --bg:         #F5F4F8;
    --surface:    #FFFFFF;
    --surface2:   #F0EEF5;
    --surface3:   #E8E4F2;
    --border:     #E2DDF0;
    --border2:    #C9C0E2;

    /* Text */
    --tx:         #140D2A;
    --tx-sub:     #4B3D6E;
    --tx-muted:   #8E82AA;

    /* Purple tints */
    --pur-soft:   #EDE5F9;
    --pur-mid:    #C4A8F0;

    /* Shadows */
    --sh-sm:  0 1px 3px rgba(123,47,190,0.07), 0 1px 2px rgba(0,0,0,0.04);
    --sh-md:  0 4px 16px rgba(123,47,190,0.11), 0 2px 4px rgba(0,0,0,0.04);
    --sh-lg:  0 14px 40px rgba(123,47,190,0.15), 0 4px 8px rgba(0,0,0,0.06);
    --sh-card:0 2px 8px rgba(123,47,190,0.07);

    --rad:    12px;
    --rad-sm: 8px;
    --rad-xs: 6px;
  }

  *, *::before, *::after { box-sizing: border-box; }

  .xp-root {
    padding: 32px 36px 64px;
    background: var(--bg);
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
    color: var(--tx);
  }

  /* ── HEADER ── */
  .xp-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1.5px solid var(--border);
  }
  .xp-eyebrow {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.8px;
    text-transform: uppercase;
    color: var(--sb-accent);
    margin: 0 0 6px;
  }
  .xp-title {
    font-family: 'Sora', sans-serif !important;
    font-size: 26px !important;
    font-weight: 700 !important;
    color: var(--tx) !important;
    margin: 0 !important;
    line-height: 1.15 !important;
    letter-spacing: -0.4px;
  }
  .xp-count-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 100px;
    padding: 6px 16px 6px 10px;
    box-shadow: var(--sh-sm);
  }
  .xp-count-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--sb-green);
    box-shadow: 0 0 0 3px rgba(34,197,94,0.18);
  }
  .xp-count-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--tx-sub);
    font-family: 'Inter', sans-serif;
  }

  /* ── FILTER BAR ── */
  .xp-filterbar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 10px;
  }
  .xp-search .ant-input-affix-wrapper {
    background: var(--surface) !important;
    border: 1.5px solid var(--border) !important;
    border-radius: var(--rad-sm) !important;
    height: 38px !important;
    box-shadow: var(--sh-sm) !important;
    transition: all 0.2s !important;
  }
  .xp-search .ant-input-affix-wrapper:hover,
  .xp-search .ant-input-affix-wrapper-focused {
    border-color: var(--sb-accent) !important;
    box-shadow: 0 0 0 3px rgba(123,47,190,0.10) !important;
  }
  .xp-search .ant-input { background: transparent !important; color: var(--tx) !important; font-family:'Inter',sans-serif !important; font-size:13px !important; }
  .xp-search .ant-input::placeholder { color: var(--tx-muted) !important; }
  .xp-search .ant-input-prefix { color: var(--tx-muted) !important; margin-right:6px; }

  .xp-fbtn {
    height: 38px;
    padding: 0 14px;
    border-radius: var(--rad-sm);
    border: 1.5px solid var(--border);
    background: var(--surface);
    color: var(--tx-sub);
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    transition: all 0.18s;
    white-space: nowrap;
    box-shadow: var(--sh-sm);
  }
  .xp-fbtn:hover { border-color: var(--sb-accent); color: var(--sb-accent); }
  .xp-fbtn.on {
    background: var(--sb-dark) !important;
    border-color: var(--sb-dark) !important;
    color: #fff !important;
  }
  .xp-fbtn.on .anticon { color: rgba(255,255,255,0.5) !important; }
  .xp-chip {
    background: rgba(255,255,255,0.18);
    color: #fff;
    padding: 1px 7px;
    border-radius: 100px;
    font-size: 10.5px;
    font-weight: 700;
  }
  .xp-dot-on {
    width: 5px; height: 5px;
    background: var(--sb-green);
    border-radius: 50%;
    display: inline-block;
  }

  /* Active tags row */
  .xp-tag-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }
  .xp-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: var(--pur-soft);
    border: 1px solid var(--pur-mid);
    color: var(--sb-accent);
    font-size: 11.5px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 100px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: background 0.15s;
  }
  .xp-tag:hover { background: #DDD0F5; }
  .xp-clear-all {
    font-size: 11.5px;
    color: var(--tx-muted);
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    padding: 3px 8px;
    transition: color 0.15s;
  }
  .xp-clear-all:hover { color: var(--tx-sub); }

  /* Results bar */
  .xp-results-bar {
    display: flex;
    align-items: center;
    margin-bottom: 18px;
  }
  .xp-results-text {
    font-size: 12.5px;
    color: var(--tx-muted);
    font-family: 'Inter', sans-serif;
    margin: 0;
  }
  .xp-results-text strong { color: var(--tx-sub); font-weight: 600; }

  /* ── CARD ── */
  .xp-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--rad);
    overflow: hidden;
    cursor: pointer;
    transition: box-shadow 0.24s, transform 0.24s, border-color 0.2s;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: var(--sh-card);
    position: relative;
  }
  .xp-card:hover {
    box-shadow: var(--sh-lg);
    transform: translateY(-5px);
    border-color: var(--pur-mid);
  }


  /* Image */
  .xp-img-wrap {
    position: relative;
    height: 195px;
    overflow: hidden;
    background: var(--surface3);
    flex-shrink: 0;
  }
  .xp-img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
    display: block;
  }
  .xp-card:hover .xp-img { transform: scale(1.05); }
  .xp-img-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(20,13,42,0.50) 0%, transparent 55%);
    pointer-events: none;
  }

  /* Badges */
  .xp-badge-status {
    position: absolute; top: 11px; left: 11px;
    background: rgba(255,255,255,0.96);
    backdrop-filter: blur(6px);
    color: var(--sb-dark);
    padding: 3px 10px;
    border-radius: var(--rad-xs);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    font-family: 'Inter', sans-serif;
    border: 1px solid rgba(0,0,0,0.07);
  }
  .xp-badge-date {
    position: absolute; top: 11px; right: 11px;
    background: rgba(30,10,60,0.75);
    backdrop-filter: blur(6px);
    color: rgba(255,255,255,0.88);
    padding: 3px 9px;
    border-radius: var(--rad-xs);
    font-size: 10.5px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    border: 1px solid rgba(255,255,255,0.12);
  }
  .xp-dev-logo {
    position: absolute; bottom: -15px; left: 13px;
    width: 38px; height: 38px;
    border-radius: var(--rad-sm);
    background: var(--surface);
    border: 1.5px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    box-shadow: var(--sh-md);
    z-index: 2;
  }

  /* Body */
  .xp-body {
    padding: 22px 16px 15px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .xp-prop-name {
    font-family: 'Sora', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--tx);
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
  }
  .xp-location {
    display: flex; align-items: center; gap: 4px;
    font-size: 11.5px; color: var(--tx-muted);
    margin-bottom: 13px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .xp-location .anticon { font-size: 10px; color: var(--sb-accent); }

  /* Spec pills */
  .xp-specs { display: flex; gap: 6px; margin-bottom: 13px; flex-wrap: wrap; }
  .xp-spec {
    display: flex; align-items: center; gap: 5px;
    background: var(--pur-soft);
    border: 1px solid #DDD0F5;
    border-radius: 5px;
    padding: 3px 9px;
    font-size: 11.5px;
    color: var(--sb-accent);
    font-weight: 600;
    font-family: 'Inter', sans-serif;
  }
  .xp-spec .anticon { font-size: 10px; color: var(--sb-mid); }

  /* Divider */
  .xp-div { height: 1px; background: var(--border); margin: 11px 0; }

  /* Price */
  .xp-price-row {
    display: flex; justify-content: space-between; align-items: flex-end;
    margin-bottom: 13px;
  }
  .xp-lbl {
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--tx-muted);
    font-weight: 600;
    display: block;
    margin-bottom: 3px;
    font-family: 'Inter', sans-serif;
  }
  /* ✅ Professional clean price — Inter bold, tabular, no decorative font */
  .xp-price {
    font-family: 'Inter', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: var(--tx);
    line-height: 1;
    letter-spacing: -0.3px;
    font-variant-numeric: tabular-nums;
  }
  .xp-currency {
    font-size: 10px;
    color: var(--tx-muted);
    font-weight: 600;
    letter-spacing: 0.8px;
    margin-right: 4px;
  }
  .xp-plan-yes {
    font-size: 12px; font-weight: 600;
    color: var(--sb-green2);
    display: flex; align-items: center; justify-content: flex-end; gap: 4px;
    font-family: 'Inter', sans-serif;
  }
  .xp-plan-no {
    font-size: 12px; font-weight: 500;
    color: var(--tx-muted);
    text-align: right;
    font-family: 'Inter', sans-serif;
  }

  /* Actions */
  .xp-actions { display: flex; gap: 7px; margin-top: auto; }
  .xp-btn-view {
    flex: 1; height: 36px;
    border-radius: var(--rad-sm);
    border: 1.5px solid var(--border);
    background: transparent;
    color: var(--tx-sub);
    font-size: 12.5px; font-weight: 600;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: all 0.18s;
    font-family: 'Inter', sans-serif;
  }
  .xp-btn-view:hover {
    background: var(--surface2);
    border-color: var(--sb-accent);
    color: var(--sb-accent);
  }
  .xp-btn-edit {
    flex: 1; height: 36px;
    border-radius: var(--rad-sm);
    border: none;
    background: #5d0f9b;
    color: #fff;
    font-size: 12.5px; font-weight: 600;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: all 0.18s;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 2px 8px rgba(30,10,60,0.22);
  }
  .xp-btn-edit:hover {
    background: var(--sb-mid);
    box-shadow: 0 4px 16px rgba(30,10,60,0.32);
    transform: translateY(-1px);
  }

  /* Popover */
  .xp-pop .ant-popover-inner {
    background: #fff !important;
    border: 1.5px solid var(--border) !important;
    border-radius: 12px !important;
    box-shadow: var(--sh-lg) !important;
    padding: 0 !important;
  }
  .xp-pop .ant-popover-arrow::before,
  .xp-pop .ant-popover-arrow::after { background: #fff !important; }
  .pop-ttl {
    font-size: 10px; font-weight: 700;
    letter-spacing: 1.4px; text-transform: uppercase;
    color: var(--sb-accent);
    font-family: 'Inter', sans-serif;
    margin: 0;
  }

  /* Load more */
  .xp-load-more {
    height: 42px; padding: 0 36px;
    border-radius: var(--rad-sm);
    border: 1.5px solid var(--border2);
    background: var(--surface);
    color: var(--tx-sub);
    font-size: 13px; font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;
    box-shadow: var(--sh-sm);
  }
  .xp-load-more:hover {
    background: var(--sb-dark);
    color: #fff;
    border-color: var(--sb-dark);
    box-shadow: var(--sh-md);
  }

  /* Animations */
  @keyframes xp-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .xp-card-wrap { animation: xp-up 0.38s ease both; height: 100%; }
  .xp-empty { text-align: center; padding: 72px 0; color: var(--tx-muted); font-family: 'Inter', sans-serif; }
  .xp-empty-ico { font-size: 36px; margin-bottom: 12px; opacity: 0.35; }
`;

export default function AgencyAgentProperties() {
  const navigate = useNavigate();

  const [projects, setProjects]     = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [developers, setDevelopers] = useState([]);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(true);

  const [search, setSearch]                           = useState("");
  const [devPopoverOpen, setDevPopoverOpen]           = useState(false);
  const [devSearchText, setDevSearchText]             = useState("");
  const [selectedDevelopers, setSelectedDevelopers]   = useState([]);
  const [pricePopoverOpen, setPricePopoverOpen]       = useState(false);
  const [priceMin, setPriceMin]                       = useState(null);
  const [priceMax, setPriceMax]                       = useState(null);
  const [paymentPopoverOpen, setPaymentPopoverOpen]   = useState(false);
  const [preHandoverPct, setPreHandoverPct]           = useState(100);
  const [postHandoverOnly, setPostHandoverOnly]       = useState(false);
  const [handoverPopoverOpen, setHandoverPopoverOpen] = useState(false);
  const [handoverFrom, setHandoverFrom]               = useState(null);
  const [handoverTo, setHandoverTo]                   = useState(null);
  const [unitTypePopoverOpen, setUnitTypePopoverOpen] = useState(false);
  const [selectedUnitTypes, setSelectedUnitTypes]     = useState([]);

  const unitTypeOptions = ["Apartments", "Villa", "Townhouse", "Duplex", "Penthouse"];
  const priceOptions    = [500000, 1000000, 1500000, 3000000, 5000000];

  const fetchProjects = async (pageNo = 1, append = false) => {
    try {
      setLoading(true);
      const res  = await apiService.get(`/agency/listings?page=${pageNo}&limit=20`);
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      if (!list.length) setHasMore(false);
      setProjects(prev => append ? [...prev, ...list] : list);
    } catch (err) { console.error(err); message.error("Failed to load properties"); }
    finally { setLoading(false); }
  };

  const fetchDevelopers = async () => {
    try {
      const res = await apiService.get("/property/get-all-developers");
      setDevelopers(Array.isArray(res?.data) ? res.data : res?.data?.data || []);
    } catch (err) {  }
  };

  useEffect(() => { fetchProjects(1, false); fetchDevelopers(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    const result = projects.filter(p => {
      const ms = !q || p.propertyName?.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q) || p.area?.toLowerCase().includes(q);
      const md = selectedDevelopers.length === 0 || selectedDevelopers.includes(p.developer?._id) ||
        selectedDevelopers.some(id => { const d = developers.find(d => d._id === id); return d && d.name === p.developerName; });
      const pr = Number(p.price || p.price_min || 0);
      const mpm = !priceMin || pr >= priceMin;
      const mpx = !priceMax || pr <= priceMax;
      const pt  = p.unitType?.toLowerCase() || "";
      const mu  = selectedUnitTypes.length === 0 || selectedUnitTypes.some(ut => pt.includes(ut.toLowerCase().replace('s', '')));
      const mpp = Number(p.paymentPlan_initialPercentage || 100) <= preHandoverPct;
      const mpo = !postHandoverOnly || Number(p.paymentPlan_laterPercentage || 0) > 0;
      let mh = true;
      if (handoverFrom || handoverTo) {
        const yr = p.completionDate?.year ? parseInt(p.completionDate.year) : p.availableFrom ? new Date(p.availableFrom).getFullYear() : 0;
        if (yr) {
          if (handoverFrom && yr < parseInt(handoverFrom)) mh = false;
          if (handoverTo   && yr > parseInt(handoverTo))   mh = false;
        }
      }
      return ms && md && mpm && mpx && mu && mpp && mpo && mh;
    });
    setFiltered(result);
  }, [search, selectedDevelopers, priceMin, priceMax, selectedUnitTypes, preHandoverPct, postHandoverOnly, handoverFrom, handoverTo, projects, developers]);

  const loadMore = () => { const n = page + 1; setPage(n); fetchProjects(n, true); };

  const fmt = (ds) => {
    if (!ds) return "";
    const d = new Date(ds);
    return isNaN(d.getTime()) ? ds : d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
  };

  const cover = (p) => {
    if (p.photos?.architecture?.length > 0) return p.photos.architecture[0];
    if (p.photos?.interior?.length > 0)     return p.photos.interior[0];
    if (p.mainLogo) return p.mainLogo;
    return "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80";
  };

  const popInner = { background:'#fff', border:'1.5px solid #E2DDF0', borderRadius:12, padding:0, boxShadow:'0 14px 40px rgba(123,47,190,0.15)' };
  const inp = { background:'#F5F4F8', border:'1px solid #E2DDF0', borderRadius:7, color:'#140D2A', fontFamily:'Inter, sans-serif', fontSize:13 };

  /* ── Popovers ── */
  const devPop = (
    <div style={{ width:300 }}>
      <div style={{ padding:'16px 16px 12px' }}>
        <p className="pop-ttl" style={{ marginBottom:10 }}>Filter by Developer</p>
        <Input prefix={<SearchOutlined style={{ color:'#8E82AA' }}/>} placeholder="Search…" value={devSearchText}
          onChange={e=>setDevSearchText(e.target.value)} style={inp} allowClear />
      </div>
      <div style={{ maxHeight:220, overflowY:'auto', padding:'0 16px', borderTop:'1px solid #F0EEF5', borderBottom:'1px solid #F0EEF5' }}>
        {developers.filter(d=>d.name.toLowerCase().includes(devSearchText.toLowerCase())).map(dev=>(
          <div key={dev._id||dev.id} style={{ padding:'9px 0', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid #F5F4F8' }}>
            <Checkbox checked={selectedDevelopers.includes(dev._id||dev.id)}
              onChange={e=>{ const id=dev._id||dev.id; setSelectedDevelopers(e.target.checked?[...selectedDevelopers,id]:selectedDevelopers.filter(i=>i!==id)); }} />
            <Avatar shape="square" src={dev.logo} size="small" style={{ background:'#EDE5F9', color:'#7B2FBE', borderRadius:5, fontSize:12, fontWeight:700 }}>
              {!dev.logo && dev.name.charAt(0)}
            </Avatar>
            <Text style={{ color:'#140D2A', fontSize:13, fontFamily:'Inter, sans-serif' }}>{dev.name}</Text>
          </div>
        ))}
      </div>
      <div style={{ display:'flex' }}>
        <button onClick={()=>setSelectedDevelopers([])} style={{ flex:1, height:40, background:'transparent', border:'none', color:'#8E82AA', cursor:'pointer', fontSize:13, fontFamily:'Inter, sans-serif', borderRadius:'0 0 0 12px', fontWeight:500 }}>Clear all</button>
        <div style={{ width:1, background:'#F0EEF5' }}/>
        <button onClick={()=>setDevPopoverOpen(false)} style={{ flex:1, height:40, background:'transparent', border:'none', color:'#7B2FBE', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'Inter, sans-serif', borderRadius:'0 0 12px 0' }}>Apply</button>
      </div>
    </div>
  );

  const pricePop = (
    <div style={{ width:340, padding:18 }}>
      <p className="pop-ttl" style={{ marginBottom:14 }}>Price Range (AED)</p>
      <Row gutter={12} style={{ marginBottom:14 }}>
        <Col span={12}>
          <Text style={{ fontSize:11, color:'#8E82AA', display:'block', marginBottom:5, fontWeight:600, fontFamily:'Inter, sans-serif' }}>Min</Text>
          <InputNumber style={{ width:'100%', ...inp }} placeholder="From" value={priceMin} onChange={setPriceMin}/>
        </Col>
        <Col span={12}>
          <Text style={{ fontSize:11, color:'#8E82AA', display:'block', marginBottom:5, fontWeight:600, fontFamily:'Inter, sans-serif' }}>Max</Text>
          <InputNumber style={{ width:'100%', ...inp }} placeholder="To" value={priceMax} onChange={setPriceMax}/>
        </Col>
      </Row>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
        {priceOptions.map(v=>(
          <button key={v} onClick={()=>setPriceMin(v)}
            style={{ padding:'4px 11px', background:priceMin===v?'#1E0A3C':'#F0EEF5', border:`1px solid ${priceMin===v?'#1E0A3C':'#E2DDF0'}`, borderRadius:6, color:priceMin===v?'#fff':'#4B3D6E', fontSize:11.5, cursor:'pointer', fontWeight:600, fontFamily:'Inter, sans-serif' }}>
            {v>=1000000?`${v/1000000}M`:`${v/1000}K`}
          </button>
        ))}
      </div>
      <button onClick={()=>setPricePopoverOpen(false)} style={{ width:'100%', height:37, borderRadius:8, border:'none', background:'#1E0A3C', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:13, fontFamily:'Inter, sans-serif' }}>
        Apply Filter
      </button>
    </div>
  );

  const paymentPop = (
    <div style={{ width:300, padding:18 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <p className="pop-ttl" style={{ margin:0 }}>Payment Plan</p>
        <button onClick={()=>{ setPreHandoverPct(100); setPostHandoverOnly(false); }} style={{ background:'none', border:'none', color:'#8E82AA', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif', fontWeight:500 }}>Reset</button>
      </div>
      <Text style={{ fontSize:12, color:'#4B3D6E', display:'block', marginBottom:8, fontFamily:'Inter, sans-serif' }}>Pre-handover up to <strong>{preHandoverPct}%</strong></Text>
      <Slider min={0} max={100} value={preHandoverPct} onChange={setPreHandoverPct}
        trackStyle={{ background:'#7B2FBE' }} handleStyle={{ borderColor:'#7B2FBE', background:'#7B2FBE' }} railStyle={{ background:'#E8E4F2' }}/>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:14 }}>
        <Switch checked={postHandoverOnly} onChange={setPostHandoverOnly} style={{ background:postHandoverOnly?'#7B2FBE':'#E2DDF0' }}/>
        <Text style={{ color:'#4B3D6E', fontSize:13, fontFamily:'Inter, sans-serif' }}>Post handover plans only</Text>
      </div>
    </div>
  );

  const handoverPop = (
    <div style={{ width:280, padding:18 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <p className="pop-ttl" style={{ margin:0 }}>Handover Year</p>
        <button onClick={()=>{ setHandoverFrom(null); setHandoverTo(null); }} style={{ background:'none', border:'none', color:'#8E82AA', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif', fontWeight:500 }}>Reset</button>
      </div>
      <Row gutter={12}>
        <Col span={12}>
          <Text style={{ fontSize:11, color:'#8E82AA', display:'block', marginBottom:5, fontWeight:600 }}>From</Text>
          <Select style={{ width:'100%' }} placeholder="Year" value={handoverFrom} onChange={setHandoverFrom} allowClear>
            {["2024","2025","2026","2027"].map(y=><Option key={y} value={y}>{y}</Option>)}
          </Select>
        </Col>
        <Col span={12}>
          <Text style={{ fontSize:11, color:'#8E82AA', display:'block', marginBottom:5, fontWeight:600 }}>To</Text>
          <Select style={{ width:'100%' }} placeholder="Year" value={handoverTo} onChange={setHandoverTo} allowClear>
            {["2025","2026","2027","2028","2029"].map(y=><Option key={y} value={y}>{y}</Option>)}
          </Select>
        </Col>
      </Row>
    </div>
  );

  const unitPop = (
    <div style={{ width:320, padding:16 }}>
      <p className="pop-ttl" style={{ marginBottom:12 }}>Unit Type</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
        {unitTypeOptions.map(type=>{
          const on=selectedUnitTypes.includes(type);
          return(
            <button key={type}
              onClick={()=>on?setSelectedUnitTypes(selectedUnitTypes.filter(t=>t!==type)):setSelectedUnitTypes([...selectedUnitTypes,type])}
              style={{ padding:'6px 15px', background:on?'#1E0A3C':'#F0EEF5', border:`1px solid ${on?'#1E0A3C':'#E2DDF0'}`, borderRadius:7, color:on?'#fff':'#4B3D6E', fontWeight:600, fontSize:13, cursor:'pointer', transition:'all 0.18s', fontFamily:'Inter, sans-serif' }}>
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );

  const filters = [
    // { label:'Developer',    on:selectedDevelopers.length>0,          count:selectedDevelopers.length, pop:devPop,     open:devPopoverOpen,      setOpen:setDevPopoverOpen },
    { label:'Price',        on:!!(priceMin||priceMax),                dot:true,                        pop:pricePop,   open:pricePopoverOpen,    setOpen:setPricePopoverOpen },
    { label:'Payment Plan', on:preHandoverPct<100||postHandoverOnly,  dot:true,                        pop:paymentPop, open:paymentPopoverOpen,  setOpen:setPaymentPopoverOpen },
    // { label:'Handover',     on:!!(handoverFrom||handoverTo),          dot:true,                        pop:handoverPop,open:handoverPopoverOpen, setOpen:setHandoverPopoverOpen },
    { label:'Unit Type',    on:selectedUnitTypes.length>0,            count:selectedUnitTypes.length,  pop:unitPop,    open:unitTypePopoverOpen, setOpen:setUnitTypePopoverOpen },
  ];

  const activeTags = [
    ...(priceMin||priceMax ? [`Price: ${priceMin?`${priceMin>=1e6?priceMin/1e6+'M':priceMin/1000+'K'}`:'Any'} – ${priceMax?`${priceMax>=1e6?priceMax/1e6+'M':priceMax/1000+'K'}`:'Any'}`] : []),
    ...(preHandoverPct<100 ? [`Pre-HO ≤${preHandoverPct}%`] : []),
    ...(postHandoverOnly   ? ['Post-HO only'] : []),
    ...(handoverFrom||handoverTo ? [`Handover: ${handoverFrom||'?'} – ${handoverTo||'?'}`] : []),
    ...selectedUnitTypes,
  ];

  const clearAll = () => {
    setPriceMin(null); setPriceMax(null);
    setPreHandoverPct(100); setPostHandoverOnly(false);
    setHandoverFrom(null); setHandoverTo(null);
    // setSelectedUnitTypes([]); setSelectedDevelopers([]);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="xp-root">

        {/* HEADER */}
        <div className="xp-header">
          <div>
            <Title className="xp-title">Agent Properties</Title>
          </div>
       
        </div>

        {/* FILTER BAR */}
        <div className="xp-filterbar">
          <div className="xp-search">
            <Input prefix={<SearchOutlined/>} placeholder="Search by name, area, city…" value={search}
              onChange={e=>setSearch(e.target.value)} allowClear style={{ width:260 }}/>
          </div>
          {filters.map(({label,on,count,dot,pop,open,setOpen})=>(
            <Popover key={label} content={pop} trigger="click" open={open} onOpenChange={setOpen}
              placement="bottomLeft" overlayInnerStyle={popInner} overlayStyle={{ zIndex:9999 }} overlayClassName="xp-pop">
              <button className={`xp-fbtn${on?' on':''}`}>
                {label}
                {count>0  && <span className="xp-chip">{count}</span>}
                {dot && on && <span className="xp-dot-on"/>}
                <DownOutlined style={{ fontSize:8 }}/>
              </button>
            </Popover>
          ))}
        </div>

        {/* ACTIVE TAGS */}
        {activeTags.length>0 && (
          <div className="xp-tag-row">
            {activeTags.map(t=>(
              <span key={t} className="xp-tag">{t} <CloseOutlined style={{ fontSize:9 }}/></span>
            ))}
            <button className="xp-clear-all" onClick={clearAll}>Clear all</button>
          </div>
        )}

        {/* RESULTS */}
        <div className="xp-results-bar">
          <p className="xp-results-text">
            {/* Showing <strong>{filtered.length}</strong> {filtered.length===1?'property':'properties'} */}
            {search && <> for "<strong>{search}</strong>"</>}
          </p>
        </div>

        {/* GRID */}
        <Row gutter={[20,24]}>
          {filtered.length===0 && !loading && (
            <Col span={24}>
              <div className="xp-empty">
                <div className="xp-empty-ico">🏠</div>
                <p style={{ margin:0, fontSize:14 }}>No properties match your current filters.</p>
              </div>
            </Col>
          )}
          {filtered.map((p,i)=>(
            <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
              <div className="xp-card-wrap" style={{ animationDelay:`${Math.min(i*0.05,0.42)}s` }}>
                <div className="xp-card">
                  <div className="xp-img-wrap">
                    <img className="xp-img" src={cover(p)} alt={p.propertyName}
                      onError={e=>{ e.target.src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80"; }}/>
                    <div className="xp-img-overlay"/>
                    <div className="xp-badge-status">{p.projectStatus||p.propertySubType||"Secondary"}</div>
                    {(p.availableFrom||p.completionDate?.year) && (
                      <div className="xp-badge-date">{p.availableFrom?fmt(p.availableFrom):p.completionDate?.year}</div>
                    )}
                    {(p.developer?.logo||p.developerName) && (
                      <div className="xp-dev-logo">
                        {p.developer?.logo
                          ? <img src={p.developer.logo} alt="dev" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:6 }}/>
                          : <span style={{ color:'#7B2FBE', fontSize:14, fontWeight:700, fontFamily:'Sora, sans-serif' }}>{(p.developerName||'D').charAt(0)}</span>
                        }
                      </div>
                    )}
                  </div>

                  <div className="xp-body">
                    <p className="xp-prop-name">{p.propertyName}</p>
                    <div className="xp-location">
                      <EnvironmentOutlined/>
                      <span>{p.area||p.city}{p.developerName?` · ${p.developerName}`:''}</span>
                    </div>

                    <div className="xp-specs">
                      {p.bedrooms>0 && <div className="xp-spec"><TeamOutlined/>{p.bedrooms} Bed{p.bedrooms>1?'s':''}</div>}
                      {p.builtUpArea>0 && <div className="xp-spec"><ExpandOutlined/>{Number(p.builtUpArea).toLocaleString()} {p.builtUpAreaUnit||'sqft'}</div>}
                    </div>

                    <div className="xp-div"/>

                    <div className="xp-price-row">
                      <div>
                        <span className="xp-lbl">Asking Price</span>
                        <div className="xp-price">
                          <span className="xp-currency">AED</span>
                          {Number(p.price||0).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <span className="xp-lbl" style={{ textAlign:'right', display:'block' }}>Plan</span>
                        {p.paymentPlan?.length>0
                          ? <div className="xp-plan-yes"><FireOutlined style={{ fontSize:10 }}/> Available</div>
                          : <div className="xp-plan-no">On Request</div>
                        }
                      </div>
                    </div>

                    <div className="xp-actions" onClick={e=>e.stopPropagation()}>
                      <button className="xp-btn-view" onClick={()=>navigate(`/dashboard/agent/secondary/${p._id}`)}>
                        <EyeOutlined/> View
                      </button>
                      <button className="xp-btn-edit" onClick={()=>navigate(`/dashboard/agent/create-secondary-plans/${p._id}`)}>
                        <EditOutlined/> Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* FOOTER */}
        <div style={{ textAlign:'center', marginTop:48 }}>
          {loading
            ? <Spin size="large"/>
            : hasMore
              ? <button className="xp-load-more" onClick={loadMore}>Load More Properties</button>
              : <Text style={{ color:'#8E82AA', fontSize:13, fontFamily:'Inter, sans-serif' }}>— All properties loaded —</Text>
          }
        </div>

      </div>
    </>
  );
}