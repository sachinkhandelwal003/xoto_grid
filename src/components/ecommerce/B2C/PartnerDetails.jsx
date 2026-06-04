// src/components/Vault/PartnerDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2, User, Users, MapPin, CreditCard, Percent, FileText,
  ChevronLeft, Mail, Phone, AlertCircle, Globe, Calendar, Briefcase,
  Award, FileCheck, Clock, Copy, Check, CheckCircle, XCircle,
  Landmark, BadgeCheck, Info, ExternalLink, Hash, Shield,
  ArrowRight, TrendingUp, Activity, Star, Lock, RefreshCw,
  AlertTriangle, CheckSquare, Layers, Tag, Zap, BarChart2,
} from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

// ─── Design Tokens ─────────────────────────────────────────────────────────
const C = {
  primary     : "#5C039B",
  primaryMid  : "#7C3AED",
  primaryLight: "#9333EA",
  primaryGlow : "rgba(92,3,155,0.12)",
  primarySoft : "#F5F0FF",
  primaryBord : "#E9D5FF",
  green       : "#10B981",
  greenSoft   : "#ECFDF5",
  greenBord   : "#A7F3D0",
  red         : "#EF4444",
  redSoft     : "#FEF2F2",
  amber       : "#F59E0B",
  amberSoft   : "#FFFBEB",
  blue        : "#3B82F6",
  blueSoft    : "#EFF6FF",
  gray        : "#6B7280",
  grayLight   : "#F9FAFB",
  grayBord    : "#E5E7EB",
  text        : "#111827",
  textSub     : "#374151",
  textMuted   : "#9CA3AF",
  white       : "#FFFFFF",
  bg          : "#F4F0FA",
};

// ─── Helpers ───────────────────────────────────────────────────────────────
const show     = (v) => (v !== null && v !== undefined && v !== "") ? v : null;
const fmtDate  = (s) => { try { return s ? new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null; } catch { return null; } };
const boolLabel= (v) => v === true ? "Yes" : v === false ? "No" : null;
const isExpired= (d) => d && new Date(d) < new Date();
const fmtAED   = (n) => n ? `AED ${Number(n).toLocaleString()}` : null;

// ══════════════════════════════════════════════════════════════════════════
export default function PartnerDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => { if (id) fetchPartner(); }, [id]);

  const fetchPartner = async () => {
    try {
      setLoading(true); setError("");
      const res  = await apiService.get(`/vault/partner/all?page=1&limit=1000`);
      const data = res?.data || res;
      const list = data.data || data;
      const found = list.find((p) => p._id === id || p.id === id);
      if (!found) throw new Error("Partner not found");
      setPartner(found);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: C.primarySoft, border: `2px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <RefreshCw size={24} color={C.primary} style={{ animation: "spin 1s linear infinite" }} />
      </div>
      <p style={{ color: C.gray, fontSize: 14, fontWeight: 500 }}>Loading partner details...</p>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────
  if (error || !partner) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: C.redSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <AlertCircle size={28} color={C.red} />
      </div>
      <p style={{ color: "#B91C1C", marginBottom: 20, fontSize: 15, fontWeight: 600 }}>{error || "Partner not found"}</p>
      <button onClick={() => navigate(-1)} style={{ padding: "10px 24px", background: C.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
        <ChevronLeft size={16} /> Go Back
      </button>
    </div>
  );

  // ── Derived values ───────────────────────────────────────────────────
  const isActive  = partner.isActive !== false && partner.status !== "inactive";
  const statusVal = partner.status || (isActive ? "active" : "inactive");
  const pc  = partner.primaryContact        || {};
  const sc  = partner.secondaryContact      || {};
  const ba  = partner.billingAddress        || {};
  const sa  = partner.shippingAddress       || {};
  const bk  = partner.bankDetails           || {};
  const cc  = partner.commissionConfiguration || {};
  const ag  = partner.agreementDetails      || {};
  const cr  = partner.credentials           || {};
  const pcPhone = [pc.countryCode, pc.phone].filter(Boolean).join(" ") || null;
  const scPhone = [sc.countryCode, sc.phone].filter(Boolean).join(" ") || null;
  const addrStr = (a) => [a.buildingName, a.floorUnit, a.area, a.city, a.country].filter(Boolean).join(", ") || null;
  const billingStr  = addrStr(ba);
  const shippingStr = addrStr(sa);
  const sameAddr    = billingStr && billingStr === shippingStr;

  // ── Tabs ─────────────────────────────────────────────────────────────
  const TABS = [
    { id: "overview",    label: "Overview",    icon: Layers      },
    { id: "contacts",    label: "Contacts",    icon: Users       },
    { id: "financial",   label: "Financial",   icon: BarChart2   },
    { id: "agreement",   label: "Agreement",   icon: FileText    },
    { id: "system",      label: "System",      icon: Shield      },
  ];

  // ════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        .pd-tab { transition: all .2s; cursor: pointer; }
        .pd-tab:hover { background: ${C.primaryGlow} !important; color: ${C.primary} !important; }
        .pd-row:last-child { border-bottom: none !important; }
        .pd-copy:hover { color: ${C.primary} !important; background: ${C.primarySoft} !important; }
        .pd-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(92,3,155,0.1) !important; }
        @media(max-width:768px) { .pd-grid-2 { grid-template-columns: 1fr !important; } .pd-header-inner { flex-direction: column !important; } .pd-stats { grid-template-columns: 1fr 1fr !important; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── Back Button ── */}
        <button
          onClick={() => navigate(-1)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "8px 16px", background: C.white, border: `1px solid ${C.grayBord}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.textSub, cursor: "pointer", transition: "all .2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primaryBord; e.currentTarget.style.color = C.primary; e.currentTarget.style.background = C.primarySoft; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.grayBord; e.currentTarget.style.color = C.textSub; e.currentTarget.style.background = C.white; }}
        >
          <ChevronLeft size={15} /> Back to Partners
        </button>

        {/* ════════════════════════════════════════════════════════════
            PROFILE HEADER CARD
        ════════════════════════════════════════════════════════════ */}
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.grayBord}`, marginBottom: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(92,3,155,0.06)", animation: "fadeUp .4s ease" }}>
          {/* Purple accent bar */}
          <div style={{ height: 5, background: `linear-gradient(90deg, ${C.primary}, ${C.primaryMid}, ${C.primaryLight})` }} />

          <div className="pd-header-inner" style={{ display: "flex", alignItems: "flex-start", gap: 20, padding: "24px 28px 20px" }}>
            {/* Logo */}
            <div style={{ width: 76, height: 76, borderRadius: 18, background: C.primarySoft, border: `2px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
              {partner.logoUrl
                ? <img src={partner.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <Building2 size={32} color={C.primary} />}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0, letterSpacing: "-.4px" }}>
                  {partner.companyName || "—"}
                </h1>
                {partner.legalEntityType && <StatusPill bg={C.primarySoft} color={C.primary} label={partner.legalEntityType} />}
                <StatusPill
                  bg={isActive ? C.greenSoft : C.redSoft}
                  color={isActive ? C.green : C.red}
                  icon={isActive ? CheckCircle : XCircle}
                  label={isActive ? "Active" : "Inactive"}
                />
                {partner.isVerified !== undefined && (
                  <StatusPill
                    bg={partner.isVerified ? C.greenSoft : C.amberSoft}
                    color={partner.isVerified ? C.green : C.amber}
                    icon={partner.isVerified ? BadgeCheck : AlertTriangle}
                    label={partner.isVerified ? "Verified" : "Pending Verification"}
                  />
                )}
              </div>

              {/* Contact chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
                <InfoChip icon={Mail}     value={partner.email || pc.email} />
                <InfoChip icon={Phone}    value={pcPhone} />
                <InfoChip icon={Globe}    value={partner.website} link={partner.website ? `https://${partner.website}` : null} />
                <InfoChip icon={MapPin}   value={[ba.city, ba.country].filter(Boolean).join(", ")} />
                <InfoChip icon={Calendar} value={partner.createdAt ? `Since ${fmtDate(partner.createdAt)}` : null} />
              </div>
            </div>

           
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            STATS ROW
        ════════════════════════════════════════════════════════════ */}
        <div className="pd-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
          <StatTile icon={Award}     color={C.primary}  label="Trade License" value={show(partner.tradeLicenseNumber) || "—"} />
          <StatTile icon={Briefcase} color="#0891B2"    label="Branches"      value={show(partner.numberOfBranches)   || "—"} />
          <StatTile icon={Calendar}  color={C.green}    label="Est. Year"     value={show(partner.yearEstablished)    || "—"} />
          <StatTile icon={Hash}      color={C.amber}    label="TRN"           value={show(partner.taxRegistrationNumber) || "—"} />
        </div>

        {/* ════════════════════════════════════════════════════════════
            TABS
        ════════════════════════════════════════════════════════════ */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.grayBord}`, padding: "4px 6px", display: "flex", gap: 2, marginBottom: 16, overflowX: "auto" }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className="pd-tab"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display     : "flex",
                  alignItems  : "center",
                  gap         : 7,
                  padding     : "9px 16px",
                  borderRadius: 10,
                  border      : "none",
                  background  : active ? C.primarySoft : "transparent",
                  color       : active ? C.primary : C.gray,
                  fontWeight  : active ? 700 : 500,
                  fontSize    : 13,
                  cursor      : "pointer",
                  whiteSpace  : "nowrap",
                  transition  : "all .2s",
                  borderBottom: active ? `2px solid ${C.primary}` : "2px solid transparent",
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════════════════
            TAB CONTENT
        ════════════════════════════════════════════════════════════ */}
        <div style={{ animation: "fadeUp .3s ease" }} key={activeTab}>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className="pd-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Section icon={Building2} title="Company Details">
                <DRow label="Company Name"      value={show(partner.companyName)} />
                <DRow label="Legal Entity"      value={show(partner.legalEntityType)} />
                <DRow label="DBA / Trade Name"  value={show(partner.dbaName)} />
                <DRow label="Year Established"  value={show(partner.yearEstablished)} />
                <DRow label="Branches"          value={show(partner.numberOfBranches)} />
                <DRow label="Website"           value={partner.website} link={partner.website ? `https://${partner.website}` : null} />
                <DRow label="Status"            value={statusVal} badge={{ bg: isActive ? C.greenSoft : C.redSoft, color: isActive ? C.green : C.red }} />
                <DRow label="Trade License No." value={show(partner.tradeLicenseNumber)} copy />
                <DRow label="License Issue"     value={fmtDate(partner.tradeLicenseIssueDate)} />
                <DRow label="License Expiry"    value={fmtDate(partner.tradeLicenseExpiryDate)} expired={isExpired(partner.tradeLicenseExpiryDate)} />
                <DRow label="TRN"               value={show(partner.taxRegistrationNumber)} copy />
              </Section>

              <Section icon={MapPin} title="Addresses">
                <GroupLabel label="Billing Address" />
                {billingStr ? (
                  <>
                    <DRow label="Building"    value={show(ba.buildingName)} />
                    <DRow label="Floor / Unit" value={show(ba.floorUnit)} />
                    <DRow label="Area"        value={show(ba.area)} />
                    <DRow label="City"        value={show(ba.city)} />
                    <DRow label="PO Box"      value={show(ba.poBox)} />
                    <DRow label="Country"     value={show(ba.country)} />
                  </>
                ) : <EmptyNote msg="No billing address added" />}

                {!sameAddr && (
                  <>
                    <div style={{ height: 1, background: C.grayBord, margin: "14px 0" }} />
                    <GroupLabel label="Shipping Address" />
                    {shippingStr ? (
                      <>
                        <DRow label="Building"    value={show(sa.buildingName)} />
                        <DRow label="Floor / Unit" value={show(sa.floorUnit)} />
                        <DRow label="Area"        value={show(sa.area)} />
                        <DRow label="City"        value={show(sa.city)} />
                        <DRow label="Country"     value={show(sa.country)} />
                      </>
                    ) : <EmptyNote msg="No shipping address added" />}
                  </>
                )}
                {sameAddr && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, padding: "8px 12px", background: C.primarySoft, borderRadius: 8, fontSize: 12, color: C.primary }}>
                    <CheckSquare size={13} /> Shipping address same as billing
                  </div>
                )}
              </Section>
            </div>
          )}

          {/* ── CONTACTS ── */}
          {activeTab === "contacts" && (
            <div className="pd-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Section icon={User} title="Primary Contact">
                <DRow label="Full Name"    value={show(pc.name)} />
                <DRow label="Designation"  value={show(pc.designation)} />
                <DRow label="Email"        value={show(pc.email)} copy />
                <DRow label="Phone"        value={show(pcPhone)} copy />
                <DRow label="WhatsApp"     value={show(pc.whatsappNumber)} />
                <DRow label="Emirates ID"  value={show(pc.emiratesId)} copy />
                <DRow label="Nationality"  value={show(pc.nationality)} />
              </Section>

              <Section icon={Users} title="Secondary Contact">
                {sc.name || sc.email ? (
                  <>
                    <DRow label="Full Name"   value={show(sc.name)} />
                    <DRow label="Designation" value={show(sc.designation)} />
                    <DRow label="Email"       value={show(sc.email)} copy />
                    <DRow label="Phone"       value={show(scPhone)} copy />
                  </>
                ) : <EmptyNote msg="No secondary contact added" />}
              </Section>
            </div>
          )}

          {/* ── FINANCIAL ── */}
          {activeTab === "financial" && (
            <div className="pd-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Section icon={Landmark} title="Bank Details">
                {bk.bankName || bk.accountNumber ? (
                  <>
                    <DRow label="Beneficiary"    value={show(bk.beneficiaryName)} copy />
                    <DRow label="Bank Name"      value={show(bk.bankName)} />
                    <DRow label="Account No."   value={show(bk.accountNumber)} copy />
                    <DRow label="IBAN"           value={show(bk.iban)} copy />
                    <DRow label="SWIFT"          value={show(bk.swiftCode)} copy />
                    <DRow label="Account Type"  value={show(bk.accountType)} />
                    <DRow label="Verified"      value={boolLabel(bk.verified)} highlight={bk.verified} />
                    {bk.verifiedAt && <DRow label="Verified At" value={fmtDate(bk.verifiedAt)} />}
                  </>
                ) : <EmptyNote msg="No bank details added" />}
              </Section>

              <Section icon={Percent} title="Commission Configuration">
                {cc.tier1 && (
                  <div style={{ background: C.primarySoft, borderRadius: 12, padding: "14px 16px", marginBottom: 12, border: `1px solid ${C.primaryBord}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 7, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Tag size={12} color="#fff" />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13, color: C.primary }}>Tier 1</span>
                    </div>
                    <DRow label="Max Loan Amt"  value={fmtAED(cc.tier1.loanAmountMax)} />
                    <DRow label="Commission"    value={cc.tier1.commissionPercentage !== undefined ? `${cc.tier1.commissionPercentage}%` : null} />
                    {cc.tier1.description && <DRow label="Notes" value={cc.tier1.description} />}
                  </div>
                )}
                {cc.tier2 && (
                  <div style={{ background: C.greenSoft, borderRadius: 12, padding: "14px 16px", marginBottom: 12, border: `1px solid ${C.greenBord}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 7, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Tag size={12} color="#fff" />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#065F46" }}>Tier 2</span>
                    </div>
                    <DRow label="Min Loan Amt" value={fmtAED(cc.tier2.loanAmountMin)} />
                    <DRow label="Commission"   value={cc.tier2.commissionPercentage !== undefined ? `${cc.tier2.commissionPercentage}%` : null} />
                    {cc.tier2.description && <DRow label="Notes" value={cc.tier2.description} />}
                  </div>
                )}
                {!cc.tier1 && !cc.tier2 && <EmptyNote msg="No commission configuration" />}
                {(cc.paymentTerms || cc.calculationBasis) && (
                  <>
                    <DRow label="Payment Terms"     value={show(cc.paymentTerms)} />
                    <DRow label="Calculation Basis" value={show(cc.calculationBasis)} />
                  </>
                )}
              </Section>
            </div>
          )}

          {/* ── AGREEMENT ── */}
          {activeTab === "agreement" && (
            <div className="pd-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Section icon={FileText} title="Agreement Details">
                {ag.agreementType || ag.startDate ? (
                  <>
                    <DRow label="Agreement Type"    value={show(ag.agreementType)} />
                    <DRow label="Start Date"        value={fmtDate(ag.startDate)} />
                    <DRow label="End Date"          value={fmtDate(ag.endDate)} expired={isExpired(ag.endDate)} />
                    <DRow label="Auto Renew"        value={boolLabel(ag.autoRenew)} highlight={ag.autoRenew} />
                    <DRow label="Signed by XOTO"   value={boolLabel(ag.signedByXoto)} highlight={ag.signedByXoto} />
                    <DRow label="Signed by Partner" value={boolLabel(ag.signedByPartner)} highlight={ag.signedByPartner} />
                    <DRow label="Renewal Notice"   value={ag.renewalNoticeDays ? `${ag.renewalNoticeDays} days` : null} />
                    {ag.documentUrl && (
                      <a
                        href={ag.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 14, padding: "9px 16px", background: C.primarySoft, borderRadius: 9, color: C.primary, fontWeight: 600, fontSize: 13, textDecoration: "none", border: `1px solid ${C.primaryBord}`, transition: "all .2s" }}
                      >
                        <FileCheck size={14} />
                        View Agreement Document
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </>
                ) : <EmptyNote msg="No agreement details added" />}
              </Section>

              {(cr.username || cr.apiKey || cr.portalUrl) && (
                <Section icon={Lock} title="Credentials">
                  <DRow label="Username"   value={show(cr.username)} />
                  <DRow label="Portal URL" value={cr.portalUrl} link={cr.portalUrl} />
                  {cr.apiKey && <DRow label="API Key" value={cr.apiKey} copy mono />}
                </Section>
              )}
            </div>
          )}

          {/* ── SYSTEM ── */}
          {activeTab === "system" && (
            <div className="pd-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Section icon={Shield} title="System Information">
                
                <DRow label="Created At"  value={partner.createdAt ? new Date(partner.createdAt).toLocaleString() : null} />
                <DRow label="Updated At"  value={partner.updatedAt ? new Date(partner.updatedAt).toLocaleString() : null} />
                <DRow label="Active"      value={boolLabel(partner.isActive)} highlight={partner.isActive} />
                <DRow label="Verified"    value={boolLabel(partner.isVerified)} highlight={partner.isVerified} />
                {partner.verifiedAt && <DRow label="Verified At" value={new Date(partner.verifiedAt).toLocaleString()} />}
                {partner.verifiedBy  && <DRow label="Verified By" value={partner.verifiedBy} />}
                
              </Section>

              <Section icon={Activity} title="Account Flags">
                <FlagRow label="Account Active"  value={partner.isActive}   icon={CheckCircle} />
                <FlagRow label="Verified"        value={partner.isVerified} icon={BadgeCheck}  />
                <FlagRow label="Bank Verified"   value={bk.verified}        icon={Landmark}    />
                <FlagRow label="Agreement Signed" value={ag.signedByXoto && ag.signedByPartner} icon={FileCheck} />
                <FlagRow label="Auto Renew"      value={ag.autoRenew}       icon={RefreshCw}   />
              </Section>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Sub-components ──────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

// Section wrapper
function Section({ icon: Icon, title, children }) {
  return (
    <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.grayBord}`, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "13px 20px", background: C.grayLight, borderBottom: `1px solid ${C.grayBord}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: C.primarySoft, border: `1px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={14} color={C.primary} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.text, letterSpacing: "-.2px" }}>{title}</span>
      </div>
      <div style={{ padding: "14px 20px" }}>{children}</div>
    </div>
  );
}

// Data row
function DRow({ label, value, copy, link, badge, highlight, expired, mono }) {
  const [copied, setCopied] = useState(false);
  const display   = value ?? "—";
  const isMissing = display === "—" || value === null || value === undefined;

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pd-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.grayLight}` }}>
      <span style={{ fontSize: 12, color: C.gray, fontWeight: 500, minWidth: 130, flexShrink: 0 }}>{label}</span>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
        {badge && !isMissing ? (
          <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: badge.bg, color: badge.color }}>
            {display}
          </span>
        ) : link && !isMissing ? (
          <a href={link} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.primary, fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            {display} <ExternalLink size={11} />
          </a>
        ) : (
          <span style={{
            fontSize    : 13,
            fontWeight  : isMissing ? 400 : 500,
            color       : expired ? C.red : highlight ? C.green : isMissing ? C.textMuted : C.text,
            fontFamily  : mono && !isMissing ? "'Courier New', monospace" : undefined,
            wordBreak   : "break-all",
            textAlign   : "right",
          }}>
            {expired && !isMissing ? (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <AlertTriangle size={12} color={C.red} /> {display}
              </span>
            ) : display}
          </span>
        )}

        {copy && value && (
          <button
            className="pd-copy"
            onClick={handleCopy}
            title="Copy"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "3px 5px", borderRadius: 5, color: copied ? C.green : C.textMuted, display: "flex", alignItems: "center", transition: "all .2s" }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        )}
      </div>
    </div>
  );
}

// Stats tile
function StatTile({ icon: Icon, label, value, color }) {
  return (
    <div
      className="pd-stat"
      style={{ background: C.white, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.grayBord}`, transition: "all .2s", cursor: "default" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={13} color={color} />
        </div>
        <span style={{ fontSize: 10, color: C.gray, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.text, wordBreak: "break-all" }}>{value}</div>
    </div>
  );
}

// Status pill
function StatusPill({ bg, color, icon: Icon, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: bg, color }}>
      {Icon && <Icon size={11} />}
      {label}
    </span>
  );
}

// Info chip (header row)
function InfoChip({ icon: Icon, value, link }) {
  if (!value) return null;
  const inner = (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.gray }}>
      <Icon size={13} color={C.textMuted} />
      {value}
    </div>
  );
  return link
    ? <a href={link} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>{inner}</a>
    : inner;
}

// Copy chip (partner ID)
function CopyChip({ label, value }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <div style={{ background: C.grayLight, borderRadius: 10, padding: "8px 12px", border: `1px solid ${C.grayBord}`, display: "flex", alignItems: "center", gap: 10, minWidth: 180 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 10, color: C.gray, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", margin: "0 0 3px" }}>{label}</p>
        <p style={{ fontSize: 11, fontFamily: "'Courier New', monospace", color: C.textSub, wordBreak: "break-all", margin: 0 }}>{value}</p>
      </div>
      <button
        onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        style={{ background: "none", border: "none", cursor: "pointer", color: copied ? C.green : C.gray, flexShrink: 0, padding: 4, borderRadius: 6 }}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}

// Group label (inside section)
function GroupLabel({ label }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ height: 1, width: 16, background: C.grayBord }} />
      {label}
      <div style={{ height: 1, flex: 1, background: C.grayBord }} />
    </p>
  );
}

// Empty note
function EmptyNote({ msg }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, color: C.textMuted, fontSize: 13, padding: "10px 0", fontStyle: "italic" }}>
      <Info size={14} color={C.textMuted} /> {msg}
    </div>
  );
}

// Flag row (system tab)
function FlagRow({ label, value, icon: Icon }) {
  const isTrue = value === true;
  const isFalse = value === false;
  const isNull = !isTrue && !isFalse;
  return (
    <div className="pd-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.grayLight}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.textSub, fontWeight: 500 }}>
        <Icon size={14} color={C.gray} /> {label}
      </div>
      {isNull ? (
        <span style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>—</span>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: isTrue ? C.greenSoft : C.redSoft }}>
          {isTrue
            ? <CheckCircle size={12} color={C.green} />
            : <XCircle    size={12} color={C.red}   />}
          <span style={{ fontSize: 11, fontWeight: 700, color: isTrue ? C.green : C.red }}>{isTrue ? "Yes" : "No"}</span>
        </div>
      )}
    </div>
  );
}