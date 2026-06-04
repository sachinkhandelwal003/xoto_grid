import React, { useState, useEffect, useCallback } from "react";
import { 
  FiUser, FiPhone, FiMail, FiSearch, FiMapPin, FiHome, FiCheck, FiX 
} from "react-icons/fi";
import { MdApartment } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";


const roleSlugMap = {
  '0':'superadmin','1':'admin','2':"customer",'5':'vendor-b2c',
  '6':'vendor-b2b','7':'freelancer','11':'accountant','12':'supervisor',
  '15':"agency",'16':"agent",'17':"developer"
};

/* ═══════════════════════════ STYLES ═══════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Lora:wght@400;500;600&display=swap');

:root {
  --white:#ffffff;
  --bg:#f5f7fa;
  --surface2:#f9fafc;
  --blue:#2563eb;
  --blue2:#1d4ed8;
  --blue-lt:#eff6ff;
  --blue-lt2:#dbeafe;
  --blue-border:#bfdbfe;
  --teal:#0891b2;
  --teal-lt:#ecfeff;
  --green:#059669;
  --green-lt:#ecfdf5;
  --green-border:#a7f3d0;
  --red:#dc2626;
  --red-lt:#fef2f2;
  --gray1:#111827;
  --gray2:#374151;
  --gray3:#6b7280;
  --gray4:#9ca3af;
  --gray5:#d1d5db;
  --gray6:#e5e7eb;
  --gray7:#f3f4f6;
  --shadow-sm:0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.05);
  --shadow-md:0 4px 16px rgba(0,0,0,.08),0 2px 6px rgba(0,0,0,.04);
  --shadow-lg:0 12px 40px rgba(0,0,0,.1),0 4px 12px rgba(0,0,0,.05);
  --shadow-blue:0 4px 20px rgba(37,99,235,.18);
  font-family:'Sora',sans-serif;
}

.lc *{box-sizing:border-box;margin:0;padding:0}
.lc{background:var(--bg);min-height:100vh;color:var(--gray1)}

.lc-topbar{
  background:linear-gradient(
    90deg,
    #5d109c 0%,
    #7c3aed 40%,
    #9333ea 70%,
    #c084fc 100%
  );
}
.lc-page{padding:32px 36px;max-width:1360px;margin:0 auto}

.lc-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:36px;gap:20px;padding:28px 32px;background:var(--white);border-radius:18px;border:1px solid var(--gray6);box-shadow:var(--shadow-sm);background-image:linear-gradient(135deg,#ffffff 0%,#f0f4ff 100%)}
.lc-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--blue);background:var(--blue-lt);border:1px solid var(--blue-border);padding:4px 12px;border-radius:20px;margin-bottom:12px}
.lc-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:var(--blue);animation:blink 2s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.lc-title{font-family:'Lora',serif;font-size:clamp(22px,3vw,34px);font-weight:600;color:var(--gray1);line-height:1.15}
.lc-title span{color:var(--blue)}
.lc-subtitle{font-size:13px;color:var(--gray3);margin-top:8px;font-weight:400;line-height:1.6}

.lc-steps{display:flex;align-items:center;gap:4px;flex-shrink:0}
.lc-step{display:flex;align-items:center;gap:9px}
.lc-step-num{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid var(--gray5);color:var(--gray4);background:var(--white);transition:all .3s}
.lc-step.active .lc-step-num{border-color:var(--blue);color:var(--white);background:var(--blue);box-shadow:var(--shadow-blue)}
.lc-step.done .lc-step-num{border-color:var(--green);color:var(--white);background:var(--green)}
.lc-step-lbl{font-size:11px;font-weight:600;color:var(--gray4);letter-spacing:.3px;text-transform:uppercase;transition:color .3s}
.lc-step.active .lc-step-lbl{color:var(--blue)}
.lc-step.done .lc-step-lbl{color:var(--green)}
.lc-step-line{width:40px;height:2px;background:var(--gray5);border-radius:2px;margin:0 4px}

.lc-cols{display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:start}
@media(max-width:900px){.lc-cols{grid-template-columns:1fr}}

.lc-card{background:var(--white);border:1px solid var(--gray6);border-radius:18px;box-shadow:var(--shadow-sm);overflow:hidden;animation:cardIn .45s cubic-bezier(.22,1,.36,1) both}
.lc-card.r{animation-delay:.08s}
@keyframes cardIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}

.lc-ch{padding:20px 26px;border-bottom:1px solid var(--gray6);display:flex;align-items:center;gap:14px;background:linear-gradient(180deg,var(--surface2),var(--white))}
.lc-ch-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.lc-ch-icon.blue{background:var(--blue-lt);border:1px solid var(--blue-border)}
.lc-ch-icon.teal{background:var(--teal-lt);border:1px solid #a5f3fc}
.lc-ch-title{font-family:'Lora',serif;font-size:17px;font-weight:600;color:var(--gray1)}
.lc-ch-sub{font-size:11px;color:var(--gray3);margin-top:2px}
.lc-ch-badge{margin-left:auto;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:4px 12px;border-radius:20px;display:flex;align-items:center;gap:5px;flex-shrink:0}
.lc-ch-badge.green{color:var(--green);border:1px solid var(--green-border);background:var(--green-lt)}
.lc-ch-badge.blue{color:var(--blue2);border:1px solid var(--blue-border);background:var(--blue-lt)}
.lc-live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:blink 1.4s ease-in-out infinite}

.lc-cb{padding:24px 26px}

.lc-sl{font-size:9px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--blue);display:flex;align-items:center;gap:10px;margin-bottom:18px}
.lc-sl::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,var(--blue-border),transparent)}

.lc-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.lc-full{grid-column:1/-1}

.lc-field{display:flex;flex-direction:column;gap:6px}
.lc-lbl{font-size:11.5px;font-weight:600;color:var(--gray2);letter-spacing:.2px;display:flex;align-items:center;gap:3px}
.lc-req{color:var(--red);font-size:14px}

.lc-inp,.lc-sel,.lc-ta{width:100%;padding:10px 13px;background:var(--white);border:1.5px solid var(--gray5);border-radius:9px;color:var(--gray1);font-size:13.5px;font-family:'Sora',sans-serif;outline:none;transition:all .2s}
.lc-inp::placeholder,.lc-ta::placeholder{color:var(--gray4)}
.lc-inp:hover,.lc-sel:hover{border-color:var(--gray4)}
.lc-inp:focus,.lc-sel:focus,.lc-ta:focus{border-color:var(--blue);background:var(--blue-lt);box-shadow:0 0 0 3px rgba(37,99,235,.1)}
.lc-ta{resize:vertical;min-height:80px;line-height:1.6}

.lc-pfx{position:relative;display:flex;align-items:center}
.lc-pfx-ico{position:absolute;left:12px;color:var(--gray4);font-size:13px;z-index:1;pointer-events:none}
.lc-pfx .lc-inp{padding-left:36px}

.lc-sel-wrap{position:relative}
.lc-sel-wrap::after{content:'▾';position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--gray4);font-size:11px;pointer-events:none}
.lc-sel{appearance:none;-webkit-appearance:none;padding-right:32px;cursor:pointer}
.lc-sel option{background:var(--white);color:var(--gray1)}

.lc-ac{position:relative}
.lc-ac-list{position:absolute;top:calc(100% + 5px);left:0;right:0;z-index:200;background:var(--white);border:1.5px solid var(--blue-border);border-radius:11px;overflow:hidden;box-shadow:var(--shadow-lg)}
.lc-ac-item{padding:10px 14px;font-size:12.5px;color:var(--gray2);cursor:pointer;transition:background .12s;border-bottom:1px solid var(--gray6);display:flex;align-items:center;gap:8px}
.lc-ac-item:last-child{border:none}
.lc-ac-item:hover{background:var(--blue-lt);color:var(--blue2)}

.lc-div{height:1px;background:var(--gray6);margin:22px 0}

.lc-sel-bar{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:10px;background:var(--green-lt);border:1px solid var(--green-border);margin-bottom:14px;font-size:13px;color:var(--green)}
.lc-sel-bar strong{font-weight:700}

.lc-btn{
  width:100%;
  padding:14px 24px;
  background:#5d109c; /* ← main color */
  border:none;
  border-radius:11px;
  color:#fff;
  font-size:14px;
  font-weight:700;
  font-family:'Sora',sans-serif;
  cursor:pointer;
  letter-spacing:.2px;
  transition:all .3s;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  box-shadow:0 4px 20px rgba(93,16,156,.25); /* ← purple shadow */
  position:relative;
  overflow:hidden;
}.lc-btn:hover{background-position:100% 0;transform:translateY(-2px);box-shadow:0 8px 28px rgba(37,99,235,.3)}
.lc-btn:active{transform:translateY(0)}
.lc-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
.lc-btn-shine{position:absolute;top:0;left:-80%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);animation:shine 3.5s ease-in-out infinite}
@keyframes shine{0%{left:-80%}50%,100%{left:130%}}

.lc-btn-ghost{width:100%;padding:12px;background:var(--white);border:1.5px solid var(--gray5);border-radius:11px;color:var(--gray3);font-size:13px;font-weight:600;font-family:'Sora',sans-serif;cursor:pointer;transition:all .2s;margin-top:10px}
.lc-btn-ghost:hover{border-color:var(--gray4);color:var(--gray1);background:var(--gray7)}

.lc-spin{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:var(--white);animation:spin .65s linear infinite;flex-shrink:0}
@keyframes spin{to{transform:rotate(360deg)}}

.lc-sticky{position:sticky;top:24px}
.lc-sticky{
  position:sticky;
  top:24px;
  height:calc(100vh - 48px); /* full viewport height */
}
  .lc-card.r{
  height:100%;
  display:flex;
  flex-direction:column;
}

.lc-plist{
  flex:1;              /* take remaining space */
  overflow-y:auto;
  max-height:none;     /* remove old calc */
}

/* ── Filter bar on right panel ── */
.lc-filter-bar{
  padding:14px 18px;border-bottom:1px solid var(--gray6);
  background:var(--blue-lt);display:flex;align-items:center;gap:10px;flex-wrap:wrap;
}
.lc-filter-inp{
  flex:1;min-width:120px;padding:7px 11px;border:1.5px solid var(--blue-border);
  border-radius:8px;font-size:12px;font-family:'Sora',sans-serif;
  background:var(--white);color:var(--gray1);outline:none;
}
.lc-filter-inp:focus{border-color:var(--blue);box-shadow:0 0 0 2px rgba(37,99,235,.1)}
.lc-filter-inp::placeholder{color:var(--gray4)}
.lc-filter-label{font-size:10px;font-weight:700;color:var(--blue2);letter-spacing:1.5px;text-transform:uppercase;white-space:nowrap}

.lc-hint{padding:11px 26px;border-bottom:1px solid var(--gray6);font-size:11.5px;color:var(--gray3);background:var(--surface2);display:flex;align-items:center;gap:8px}

.lc-plist{padding:6px 16px 20px;overflow-y:auto;}
.lc-plist::-webkit-scrollbar{width:4px}
.lc-plist::-webkit-scrollbar-track{background:var(--gray7);border-radius:2px}
.lc-plist::-webkit-scrollbar-thumb{background:var(--gray5);border-radius:2px}
.lc-plist-top{display:flex;justify-content:space-between;align-items:center;padding:14px 10px 8px}
.lc-plist-count{font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:var(--gray3)}
.lc-plist-sel{font-size:11px;font-weight:700;color:var(--white);background:var(--blue);border-radius:20px;padding:3px 12px}

/* Property card */
.lc-pc{border-radius:14px;border:1.5px solid var(--gray6);background:var(--white);margin-top:10px;overflow:hidden;cursor:pointer;transition:all .22s cubic-bezier(.22,1,.36,1);position:relative;box-shadow:var(--shadow-sm)}
.lc-pc:hover{border-color:var(--blue-border);box-shadow:var(--shadow-md);transform:translateY(-3px)}
.lc-pc.sel{border-color:var(--blue);box-shadow:0 0 0 2px rgba(37,99,235,.15),var(--shadow-md);background:var(--blue-lt)}
.lc-pc-bar{position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--blue);border-radius:2px 0 0 2px;transform:scaleY(0);transition:transform .22s;transform-origin:bottom}
.lc-pc:hover .lc-pc-bar,.lc-pc.sel .lc-pc-bar{transform:scaleY(1)}
.lc-pc-ck{position:absolute;top:10px;right:10px;width:22px;height:22px;border-radius:50%;background:var(--blue);color:var(--white);font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;transform:scale(0);transition:transform .22s cubic-bezier(.34,1.56,.64,1);box-shadow:0 3px 10px rgba(37,99,235,.4)}
.lc-pc.sel .lc-pc-ck{transform:scale(1)}

.lc-pc-inner{display:flex;min-height:100px}
.lc-pc-img{width:120px;min-height:100px;flex-shrink:0;overflow:hidden;background:var(--blue-lt)}
.lc-pc-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s}
.lc-pc:hover .lc-pc-img img{transform:scale(1.06)}
.lc-pc-img-ph{width:100%;height:100%;min-height:100px;display:flex;align-items:center;justify-content:center;font-size:32px;background:var(--blue-lt)}

.lc-pc-body{flex:1;padding:14px 16px;min-width:0;display:flex;flex-direction:column;gap:7px}
.lc-pc-name{font-size:13.5px;font-weight:700;color:var(--gray1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lc-pc-tags{display:flex;flex-wrap:wrap;gap:5px}
.lc-pc-tag{font-size:10px;font-weight:600;padding:3px 8px;border-radius:6px;border:1px solid}
.lc-pc-tag.bed{color:#1d4ed8;border-color:#bfdbfe;background:#eff6ff}
.lc-pc-tag.type{color:#7c3aed;border-color:#ddd6fe;background:#f5f3ff;text-transform:capitalize}
.lc-pc-tag.loc{color:var(--gray3);border-color:var(--gray5);background:var(--gray7);max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lc-pc-price{font-family:'Lora',serif;font-size:18px;font-weight:700;color:var(--blue2)}
.lc-pc-price span{font-family:'Sora',sans-serif;font-size:11px;font-weight:400;color:var(--gray3);margin-left:4px}

.lc-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:56px 24px;text-align:center}
.lc-empty-ico{width:72px;height:72px;border-radius:20px;background:var(--blue-lt);border:1.5px dashed var(--blue-border);display:flex;align-items:center;justify-content:center;font-size:30px;margin:0 auto 16px;animation:emptyBob 3s ease-in-out infinite}
@keyframes emptyBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
.lc-empty-h{font-family:'Lora',serif;font-size:18px;color:var(--gray2);margin-bottom:6px}
.lc-empty-p{font-size:12px;color:var(--gray3);max-width:220px;line-height:1.7}

.lc-loader{display:flex;flex-direction:column;align-items:center;padding:56px}
.lc-loader-spin{width:36px;height:36px;border-radius:50%;border:3px solid var(--blue-lt2);border-top-color:var(--blue);animation:spin .65s linear infinite;margin-bottom:14px}
.lc-loader-txt{font-size:13px;color:var(--gray2);font-weight:500}
.lc-loader-sub{font-size:11px;color:var(--gray4);margin-top:4px}

.lc-toasts{position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px}
.lc-toast{padding:12px 18px;border-radius:12px;font-size:13px;font-weight:500;display:flex;align-items:center;gap:10px;box-shadow:var(--shadow-lg);min-width:250px;max-width:340px;animation:toastIn .3s cubic-bezier(.22,1,.36,1)}
.lc-toast.s{background:var(--green-lt);border:1.5px solid var(--green-border);color:#065f46}
.lc-toast.e{background:var(--red-lt);border:1.5px solid #fecaca;color:#991b1b}
.lc-toast.i{background:var(--blue-lt);border:1.5px solid var(--blue-border);color:var(--blue2)}
@keyframes toastIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}

.lc-done{position:fixed;inset:0;z-index:9998;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.45);backdrop-filter:blur(8px)}
.lc-done-box{text-align:center;padding:56px 48px;border-radius:24px;background:var(--white);border:1px solid var(--gray6);box-shadow:var(--shadow-lg);max-width:380px}
.lc-done-ico{width:76px;height:76px;border-radius:50%;background:var(--green-lt);border:2px solid var(--green-border);display:flex;align-items:center;justify-content:center;font-size:30px;margin:0 auto 22px}
.lc-done-h{font-family:'Lora',serif;font-size:24px;color:var(--gray1);margin-bottom:10px}
.lc-done-p{font-size:13px;color:var(--gray3);line-height:1.7}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
input[type=number]{-moz-appearance:textfield}

@media(max-width:640px){
  .lc-page{padding:16px}
  .lc-header{flex-direction:column;align-items:flex-start}
  .lc-steps{display:none}
}
`;

/* ── Toast ── */
function Toast({ msg, type, onClose }) {
  React.useEffect(() => { const t = setTimeout(onClose, 3800); return () => clearTimeout(t); }, []);
  const ico = { s: '✓', e: '✕', i: 'ℹ' };
  return (
    <div className={`lc-toast ${type}`}>
      <span style={{ fontSize: 15, fontWeight: 900 }}>{ico[type]}</span>
      <span>{msg}</span>
    </div>
  );
}

/* ── Extract image from property object ── */
function resolveImage(prop) {
  if (!prop) return '';
  if (prop.mainLogo) return prop.mainLogo;
  const ph = prop.photos;
  if (ph && typeof ph === 'object' && !Array.isArray(ph)) {
    return (ph.architecture?.[0]) || (ph.interior?.[0]) || (ph.lobby?.[0]) || (ph.other?.[0]) || '';
  }
  if (Array.isArray(ph)) return ph[0] || '';
  return '';
}

/* ── Normalise one API item into a flat display object ── */
function mapItem(item) {
  const prop = (item && item.property) ? item.property : item;
  return {
    _id: prop?._id || item?._id || '',
    propertyName: prop?.propertyName  || 'Unnamed Property',
    price:        prop?.price         || prop?.price_min || 0,
    bedrooms:     prop?.bedrooms      || null,
    unitType:     prop?.unitType      || prop?.property_type || '',
    area:         prop?.area          || '',
    city:         prop?.city          || '',
    img:          resolveImage(prop),
  };
}

/* ════════════════════ MAIN COMPONENT ════════════════════ */
export default function AgentLeadSuggestionCreate() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  /* ── Form state ── */
  const [f, setF] = useState({
    first_name: '', last_name: '', phone_number: '', email: '',
    budget_min: '', budget_max: '',
    bedrooms: '', property_type: '', preferred_location: '', requirement_description: ''
  });

  /* ── All approved properties (loaded once on mount) ── */
  const [allProps,  setAllProps]  = useState([]);   // master list from API
  const [propLoad,  setPropLoad]  = useState(true); // initial load spinner

  /* ── Client-side filter search in right panel ── */
  const [search,    setSearch]    = useState('');   // free-text search in right panel

  /* ── Selected property IDs ── */
  const [selProp,  setSelProp]  = useState([]);

  /* ── UI state ── */
  const [locOpts,   setLocOpts]   = useState([]);
  const [showLoc,   setShowLoc]   = useState(false);
  const [busy,      setBusy]      = useState(false);
  const [toasts,    setToasts]    = useState([]);
  const [step,      setStep]      = useState(0);
  const [done,      setDone]      = useState(false);

  const addToast = (msg, type = 'i') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
  };
  

  /* ══════════════════════════════════════════════════════
     Load ALL agent-approved properties ONCE on mount.
     No re-fetch when filters change — filtering is client-side.
  ══════════════════════════════════════════════════════ */
  useEffect(() => {
    (async () => {
      setPropLoad(true);
      try {
        const res = await apiService.get('/agent/lead/fetch-properties?limit=100');
        let rawList = [];
        if (Array.isArray(res?.data?.data))  rawList = res.data.data;
        else if (Array.isArray(res?.data))   rawList = res.data;
        else if (Array.isArray(res))         rawList = res;
        setAllProps(rawList.map(mapItem));
        
      } catch (e) {
        console.error('[fetchAllProperties]', e);
        addToast('Could not load properties', 'e');
      } finally {
        setPropLoad(false);
      }
    })();
  }, []); // ← runs ONLY once, never again

  /* ══════════════════════════════════════════════════════
     CLIENT-SIDE FILTERING
     Applies form filters + right-panel search to allProps.
     Zero API calls.
  ══════════════════════════════════════════════════════ */
 const filteredProps = allProps.filter(p => {


    /* Bedrooms filter */
    if (f.bedrooms) {
      const bn = Number(f.bedrooms);
      if (bn === 4) { if (p.bedrooms < 4) return false; }
      else          { if (p.bedrooms !== bn) return false; }
    }

    /* Property type filter */
    if (f.property_type) {
      if ((p.unitType || '').toLowerCase() !== f.property_type.toLowerCase()) return false;
    }

    /* Preferred location filter (loose match) */
    if (f.preferred_location) {
      const loc = f.preferred_location.toLowerCase();
      const inArea = (p.area  || '').toLowerCase().includes(loc);
      const inCity = (p.city  || '').toLowerCase().includes(loc);
      if (!inArea && !inCity) return false;
    }

    /* Right-panel free-text search */
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const inName = (p.propertyName || '').toLowerCase().includes(q);
      const inArea = (p.area || '').toLowerCase().includes(q);
      const inCity = (p.city || '').toLowerCase().includes(q);
      const inType = (p.unitType || '').toLowerCase().includes(q);
      if (!inName && !inArea && !inCity && !inType) return false;
    }

    return true;
  });

  /* ── Form field setter ── */
  const set = (key, val) => {
    const next = { ...f, [key]: val };
    setF(next);
    /* No API call here — filtering is purely client-side */
    if (step === 0 && next.budget_max) setStep(1);
  };

/* ── Location autocomplete (Nominatim) ── */
  const handleLocSearch = async (v) => {
    set('preferred_location', v);
    if (!v || v.length < 3) return setLocOpts([]);
    try {
      // Yahan API URL mein '&countrycodes=ae' add kar diya hai
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(v)}&countrycodes=ae&limit=5`
      );
      const data = await res.json();
      setLocOpts(data.map(d => d.display_name));
      setShowLoc(true);
    } catch { setLocOpts([]); }
  };

  const toggleProp = (id) => {
    setSelProp(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  /* ── Submit ── */
/* ── Submit ── */
  const handleSubmit = async () => {
    if (!f.first_name || !f.last_name || !f.phone_number)
      return addToast('Please fill required fields: Name & Phone', 'e');
    if (!f.budget_max)
      return addToast('Max budget is required to create a lead', 'e');

    setBusy(true);
    try {
      /* Step 1 — Create customer */
      const custRes = await apiService.post('/users/signup/customer/agents', {
        name:     { first_name: f.first_name, last_name: f.last_name },
        email:    f.email,
        mobile:   { country_code: '+971', number: f.phone_number },
        phone:    { country_code: '+971', number: f.phone_number },
        whatsapp: { country_code: '+971', number: f.phone_number },
        location: { area: f.preferred_location || '', city: '' },
        source:   'agent',
        notes:    f.requirement_description || '',
        agent:    user?._id || user?.id,
      });

      if (!custRes.success) throw new Error(custRes?.message || 'Customer creation failed');

      // Yahan hum seedha customer object se _id nikal rahe hain
      const cid = custRes?.customer?._id;

      if (!cid) {
          throw new Error("Customer create ho gaya, par response mein ID nahi aayi.");
      }

      addToast('Customer profile created!', 's');

      /* Step 2 — Create lead */
     /* Step 2 — Create lead */
      const payload = {
  customer: cid,
  budget: { min: Number(f.budget_min) || 0, max: Number(f.budget_max) },
  preferred_location: f.preferred_location ? [f.preferred_location] : [],
  bedrooms: f.bedrooms
    ? { min: Number(f.bedrooms), max: Number(f.bedrooms) === 4 ? 20 : Number(f.bedrooms) }
    : undefined,
  property_type: f.property_type ? [f.property_type.toLowerCase()] : [],
  requirement_description: f.requirement_description || '',
  source: 'manual',
  selected_property: selProp.length > 0 ? selProp[0] : null,
  agent: user?._id || user?.id,
};

const leadRes = await apiService.post('/agent/lead/create-lead', payload);
      

      if (!leadRes.success) throw new Error(leadRes?.message || 'Lead creation failed');
      
      addToast(`Lead saved — ${selProp.length} propert${selProp.length !== 1 ? 'ies' : 'y'} linked`, 's');
      setStep(2);
      setDone(true);
      setTimeout(() => navigate(-1), 2600);
    } catch (e) {
      console.error("Submission Error:", e);
      addToast(e?.response?.data?.message || e?.message || 'Something went wrong', 'e');
    } finally { setBusy(false); }
  };

  const STEPS = ['Client Info', 'Select Properties', 'Lead Saved'];

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <>
      <style>{CSS}</style>
      <div className="lc">
        <div className="lc-topbar" />

        {/* Toasts */}
        <div className="lc-toasts">
          {toasts.map(t =>
            <Toast key={t.id} msg={t.msg} type={t.type}
              onClose={() => setToasts(x => x.filter(i => i.id !== t.id))} />
          )}
        </div>

        {/* Success overlay */}
        {done && (
          <div className="lc-done">
            <div className="lc-done-box">
              <div className="lc-done-ico">✓</div>
              <div className="lc-done-h">Lead Created!</div>
              <div className="lc-done-p">
                Customer registered and{' '}
                <strong style={{ color: 'var(--blue)' }}>{selProp.length}</strong>{' '}
                propert{selProp.length !== 1 ? 'ies' : 'y'} linked. Redirecting…
              </div>
            </div>
          </div>
        )}

        <div className="lc-page">

          {/* ── Header ── */}
          <div className="lc-header">
            <div>
            
              <div className="lc-title">Register Client &amp; <span>Match Properties</span></div>
              <div className="lc-subtitle">
                Fill in client details — select properties from your approved inventory on the right
              </div>
            </div>
            <div className="lc-steps">
              {STEPS.map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="lc-step-line" />}
                  <div className={`lc-step ${step === i ? 'active' : step > i ? 'done' : ''}`}>
                    <div className="lc-step-num">{step > i ? '✓' : i + 1}</div>
                    <div className="lc-step-lbl">{s}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="lc-cols">

            {/* ══ LEFT: FORM ══ */}
            <div className="lc-card">
              <div className="lc-ch">
                <div className="lc-ch-icon blue">
  <FiUser />
</div>
                <div>
                  <div className="lc-ch-title">Client Profile</div>
                  <div className="lc-ch-sub">Personal info &amp; property preferences</div>
                </div>
              </div>
              <div className="lc-cb">

                <div className="lc-sl">Personal Information</div>
                <div className="lc-row" style={{ marginBottom: 14 }}>
                  <div className="lc-field">
                    <label className="lc-lbl">First Name <span className="lc-req">*</span></label>
                    <input className="lc-inp" placeholder="Ahmed"
                      value={f.first_name} onChange={e => set('first_name', e.target.value)} />
                  </div>
                  <div className="lc-field">
                    <label className="lc-lbl">Last Name <span className="lc-req">*</span></label>
                    <input className="lc-inp" placeholder="Al Mansouri"
                      value={f.last_name} onChange={e => set('last_name', e.target.value)} />
                  </div>
                  <div className="lc-field">
                    <label className="lc-lbl">Phone <span className="lc-req">*</span></label>
                    <div className="lc-pfx">
                      <span className="lc-pfx-ico">
  <FiPhone />
</span>
                      <input className="lc-inp" placeholder="501234567"
                        value={f.phone_number} onChange={e => set('phone_number', e.target.value)} />
                    </div>
                  </div>
                  <div className="lc-field">
                    <label className="lc-lbl">Email</label>
                    <div className="lc-pfx">
                      <span className="lc-pfx-ico">
  <FiMail />
</span>
                      <input className="lc-inp" type="email" placeholder="client@example.com"
                        value={f.email} onChange={e => set('email', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="lc-div" />

                <div className="lc-sl">Property Requirements</div>
                <div style={{
                  fontSize:11.5, color:'var(--blue2)', fontWeight:500,
                  marginBottom:16, marginTop:-10,
                  display:'flex', alignItems:'center', gap:6,
                  padding:'8px 12px', background:'var(--blue-lt)',
                  borderRadius:8, border:'1px solid var(--blue-border)'
                }}>
                  <span>🔍</span>
                  <span>These filters narrow the property list on the right in real-time</span>
                </div>

                <div className="lc-row">
                  <div className="lc-field">
                    <label className="lc-lbl">Min Budget (AED)</label>
                    <input className="lc-inp" type="number" placeholder="1,000,000"
                      value={f.budget_min} onChange={e => set('budget_min', e.target.value)} />
                  </div>
                  <div className="lc-field">
                    <label className="lc-lbl">Max Budget (AED) <span className="lc-req">*</span></label>
                    <input className="lc-inp" type="number" placeholder="3,000,000"
                      value={f.budget_max} onChange={e => set('budget_max', e.target.value)} />
                  </div>
                  <div className="lc-field">
                    <label className="lc-lbl">Bedrooms</label>
                    <div className="lc-sel-wrap">
                      <select className="lc-sel" value={f.bedrooms}
                        onChange={e => set('bedrooms', e.target.value)}>
                        <option value="">Any Layout</option>
                        <option value="1">1 Bedroom</option>
                        <option value="2">2 Bedrooms</option>
                        <option value="3">3 Bedrooms</option>
                        <option value="4">4+ Bedrooms</option>
                      </select>
                    </div>
                  </div>
                  <div className="lc-field">
                    <label className="lc-lbl">Property Type</label>
                    <div className="lc-sel-wrap">
                      <select className="lc-sel" value={f.property_type}
                        onChange={e => set('property_type', e.target.value)}>
                        <option value="">Any Type</option>
                        <option value="apartment">Apartment</option>
                        <option value="villa">Villa</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="penthouse">Penthouse</option>
                      </select>
                    </div>
                  </div>
                  <div className="lc-field">
                    <label className="lc-lbl">Preferred Area</label>
                    <div className="lc-ac">
                      <input className="lc-inp" placeholder="Search city / area…"
                        value={f.preferred_location}
                        onChange={e => handleLocSearch(e.target.value)}
                        onBlur={() => setTimeout(() => setShowLoc(false), 180)} />
                      {showLoc && locOpts.length > 0 && (
                        <div className="lc-ac-list">
                          {locOpts.map((o, i) => (
                            <div key={i} className="lc-ac-item"
                              onMouseDown={() => { set('preferred_location', o); setShowLoc(false); }}>
                              <span><FiMapPin /></span>{o}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="lc-field lc-full">
                    <label className="lc-lbl">Notes / Special Requirements</label>
                    <textarea className="lc-ta"
                      placeholder="Sea view, payment plan, floor preference, amenities…"
                      value={f.requirement_description}
                      onChange={e => set('requirement_description', e.target.value)} />
                  </div>
                </div>

                <div className="lc-div" />

                {selProp.length > 0 && (
                  <div className="lc-sel-bar">
                    <span><FiCheck /></span>
                    <span>
                      <strong>{selProp.length}</strong>{' '}
                      propert{selProp.length > 1 ? 'ies' : 'y'} selected — will be linked on save
                    </span>
                  </div>
                )}

                <button className="lc-btn" onClick={handleSubmit} disabled={busy}>
                  <div className="lc-btn-shine" />
                  {busy ? (
                    <><div className="lc-spin" /> Processing…</>
                  ) : (
                    <>{selProp.length > 0
                      ? `Create Customer & Link ${selProp.length} Propert${selProp.length > 1 ? 'ies' : 'y'}`
                      : 'Create Customer & Lead'} →
                    </>
                  )}
                </button>
                <button className="lc-btn-ghost" onClick={() => navigate(-1)}>Cancel</button>

              </div>
            </div>

            {/* ══ RIGHT: PROPERTY PANEL ══ */}
            <div className="lc-sticky">
              <div className="lc-card r">

                {/* Card header */}
                <div className="lc-ch">
                  <div className="lc-ch-icon teal">
  <MdApartment />
</div>
                  <div>
                    <div className="lc-ch-title"> Properties</div>
                    <div className="lc-ch-sub">
                      {propLoad
                        ? 'Loading inventory…'
                        : `${allProps.length} total · ${filteredProps.length} matching filters`}
                    </div>
                  </div>
                  {!propLoad && (
                    <div className="lc-ch-badge green">
                      <div className="lc-live-dot" />
                      {allProps.length} Properties
                    </div>
                  )}
                </div>

                {/* Free-text search within right panel */}
                <div className="lc-filter-bar">
                  <span className="lc-filter-label">
  <FiSearch /> Search
</span>
                  <input
                    className="lc-filter-inp"
                    placeholder="Name, area, type…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {(search || f.budget_max || f.bedrooms || f.property_type || f.preferred_location) && (
                    <button
                      onClick={() => {
                        setSearch('');
                        setF(prev => ({
                          ...prev,
                          budget_min: '', budget_max: '',
                          bedrooms: '', property_type: '', preferred_location: ''
                        }));
                      }}
                      style={{
                        fontSize:11, fontWeight:700, color:'var(--gray3)',
                        background:'var(--white)', border:'1.5px solid var(--gray5)',
                        borderRadius:7, padding:'5px 10px', cursor:'pointer',
                        fontFamily:'Sora,sans-serif', whiteSpace:'nowrap'
                      }}
                    ><FiX /> Clear</button>
                  )}
                </div>

                <div className="lc-hint">
                  <span><FiSearch /></span>
                  <span>Click a card to select / deselect · filters on the left narrow this list</span>
                </div>

                <div className="lc-plist">
                  {propLoad ? (
                    <div className="lc-loader">
                      <div className="lc-loader-spin" />
                      <div className="lc-loader-txt">Loading your inventory…</div>
                      <div className="lc-loader-sub">Fetching approved properties</div>
                    </div>
                  ) : allProps.length === 0 ? (
                    <div className="lc-empty">
                      <div className="lc-empty-ico">🏗️</div>
                      <div className="lc-empty-h">No Properties Found</div>
                      <div className="lc-empty-p">
                        No approved properties are linked to your account yet.
                      </div>
                    </div>
                  ) : filteredProps.length === 0 ? (
                    <div className="lc-empty">
                      <div className="lc-empty-ico">🔍</div>
                      <div className="lc-empty-h">No Matches</div>
                      <div className="lc-empty-p">
                        No properties match your current filters. Try adjusting budget or area.
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="lc-plist-top">
                        <div className="lc-plist-count">
                          🏠 {filteredProps.length} of {allProps.length} shown
                        </div>
                        {selProp.length > 0 && (
                          <div className="lc-plist-sel">{selProp.length} Selected</div>
                        )}
                      </div>

                      {filteredProps.map((p, idx) => {
                        const isSel = selProp.includes(p._id);
                        return (
                          <div
                            key={p._id || idx}
                            className={`lc-pc ${isSel ? 'sel' : ''}`}
                            style={{ animationDelay: `${idx * 0.05}s` }}
                            onClick={() => p._id && toggleProp(p._id)}
                          >
                            <div className="lc-pc-bar" />
                            <div className="lc-pc-ck">
  <FiCheck />
</div>
                            <div className="lc-pc-inner">

                              {/* Image */}
                              <div className="lc-pc-img">
                                {p.img ? (
                                  <img src={p.img} alt={p.propertyName}
                                    onError={e => {
                                      e.target.onerror = null;
                                      e.target.style.display = 'none';
                                      e.target.parentNode.innerHTML =
                                        '<div class="lc-pc-img-ph">🏢</div>';
                                    }}
                                  />
                                ) : (
                                 <div className="lc-pc-img-ph">
  <FiHome />
</div>
                                )}
                              </div>

                              {/* Details */}
                              <div className="lc-pc-body">
                                <div className="lc-pc-name" title={p.propertyName}>
                                  {p.propertyName}
                                </div>
                                <div className="lc-pc-tags">
                                  {p.bedrooms && (
                                    <div className="lc-pc-tag bed">
  <FiHome /> {p.bedrooms} BHK
</div>
                                  )}
                                  {p.unitType && (
                                    <div className="lc-pc-tag type">{p.unitType}</div>
                                  )}
                                  {(p.area || p.city) && (
                                    <div className="lc-pc-tag loc">
                                      <FiMapPin /> {p.area || p.city}
                                    </div>
                                  )}
                                </div>
                                <div className="lc-pc-price">
                                  {p.price > 0
                                    ? Number(p.price).toLocaleString()
                                    : 'Price TBD'}
                                  <span>AED</span>
                                </div>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}