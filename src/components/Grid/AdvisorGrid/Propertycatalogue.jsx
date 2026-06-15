import { useState, useEffect, useCallback,useRef } from "react";
import {
  MapPin, Bed, Bath, Square, Building2, Flame, Calendar,
  Eye, Heart, CheckCircle2, Lock, ArrowLeft, Search,
  FileText, ChevronLeft, ChevronRight, Home, Sparkles,
  TrendingUp, Grid3X3, Plus, LayoutGrid, Layers,
  X, Loader2, Copy, Mail,
   Key, Briefcase, ChevronDown , QrCode 
} from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

// ─── helpers ──────────────────────────────────────────────────────────────────
const getThumb = (photos, mainLogo) => {
  if (mainLogo) return mainLogo;
  const all = [
    ...(photos?.architecture || []),
    ...(photos?.interior || []),
    ...(photos?.lobby || []),
    ...(photos?.other || []),
  ];
  return all[0] || null;
};

const formatPrice = (price, type, currency = "AED") => {
  if (!price) return `${currency} —`;
  if (type === "rental") return `${currency} ${Number(price).toLocaleString()}/yr`;
  return `${currency} ${Number(price).toLocaleString()}`;
};

const typeLabel = (t) =>
  ({ off_plan: "Off-Plan", secondary: "Secondary", rental: "Rental", commercial: "Commercial" }[t] || t);

const typeColor = (t) =>
({
  off_plan: { bg: "#6d28d9", text: "#fff" },
  secondary: { bg: "#065f46", text: "#fff" },
  rental: { bg: "#1e40af", text: "#fff" },
  commercial: { bg: "#92400e", text: "#fff" },
}[t] || { bg: "#374151", text: "#fff" });

const bedroomLabel = (type, count) => {
  if (type === "studio") return "Studio";
  if (!count || count === 0) return "Studio";
  return `${count} Bed`;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={styles.card}>
    <div style={{ height: 180, background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
    <div style={{ padding: "16px 18px" }}>
      <div style={{ height: 11, width: "35%", background: "#eee", borderRadius: 6, marginBottom: 10 }} />
      <div style={{ height: 17, width: "75%", background: "#eee", borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 11, width: "55%", background: "#eee", borderRadius: 6 }} />
    </div>
  </div>
);

// ─── Property Card ────────────────────────────────────────────────────────────
const Btn = ({ children, onClick, variant = "primary", loading, disabled }) => {
  const variants = {
    primary: { background: "#6d28d9", color: "#fff", border: "none" },
    ghost: { background: "#fff", color: "#52525b", border: "1px solid #e5e7eb" },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...variants[variant],
        borderRadius: 10,
        padding: "10px 16px",
        fontSize: 13,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        opacity: disabled || loading ? 0.65 : 1,
      }}
    >
      {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : children}
    </button>
  );
};

const normalizeApi = (res) => (res?.data?.success !== undefined || res?.data?.status ? res.data : res);

const buildPresentationProperty = (property) => ({
  propertyName: property.propertyName || property.projectName || "",
  projectName: property.projectName || property.propertyName || "",
  type: property.propertyType || "Residential",
  propertySubType: property.propertySubType || "",
  area: property.area || property.locality || "",
  city: property.city || "Dubai",
  country: property.country || "UAE",
  price: property.price || property.price_min || 0,
  price_min: property.price_min || property.price || 0,
  price_max: property.price_max || 0,
  currency: property.currency || "AED",
  bedrooms: property.bedrooms || 0,
  bathrooms: property.bathrooms || 0,
  builtUpArea: property.builtUpArea || property.builtUpArea_min || 0,
  floors: property.floors || property.numberOfFloors || 0,
  furnishingStatus: property.furnishingStatus || property.furnishing || "",
  ownershipType: property.ownershipType || "",
  parkingAllocation: property.parkingAllocation || "",
  mainLogo: property.mainLogo || property.media?.mainLogo || "",
  documents: (() => {
    const docs = [];
    if (property.brochure || property.brochureUrl) docs.push({ label: "Project Brochure", url: property.brochure || property.brochureUrl, type: "brochure" });
    if (property.floorPlan || property.floorPlanUrl) docs.push({ label: "Floor Plan", url: property.floorPlan || property.floorPlanUrl, type: "floor_plan" });
    if (property.factSheet || property.factSheetUrl) docs.push({ label: "Fact Sheet", url: property.factSheet || property.factSheetUrl, type: "fact_sheet" });
    if (property.paymentPlanDoc || property.paymentPlanUrl) docs.push({ label: "Payment Plan PDF", url: property.paymentPlanDoc || property.paymentPlanUrl, type: "payment_plan" });
    if (property.masterplan || property.masterplanUrl) docs.push({ label: "Masterplan", url: property.masterplan || property.masterplanUrl, type: "masterplan" });
    if (property.noc || property.nocUrl) docs.push({ label: "NOC / Title Deed", url: property.noc || property.nocUrl, type: "noc" });
    if (Array.isArray(property.documents)) {
      property.documents.forEach((d) => {
        if (d?.url) docs.push({ label: d.label || d.name || "Document", url: d.url, type: d.type || "other" });
      });
    }
    return docs;
  })(),
  photos: (() => {
    const allPhotos = [];
    const mainLogo = property.mainLogo || property.media?.mainLogo;
    if (mainLogo) allPhotos.push(mainLogo);

    const ph = property.photos;
    if (ph && typeof ph === "object" && !Array.isArray(ph)) {
      Object.values(ph).forEach((arr) => {
        if (Array.isArray(arr)) allPhotos.push(...arr.filter(Boolean));
      });
    } else if (Array.isArray(ph)) {
      allPhotos.push(...ph.filter(Boolean));
    }

    const med = property.media;
    if (med && typeof med === "object") {
      ["architectureImages", "interiorImages", "lobbyImages", "otherImages"].forEach((key) => {
        if (Array.isArray(med[key])) allPhotos.push(...med[key].filter(Boolean));
      });
    }
    return [...new Set(allPhotos)];
  })(),
  developer: property.developerName || property.developer?.name || "",
  developerDetails: {
    name: property.developer?.name || property.developerName || property.developerDetails?.name || "",
    logo: property.developer?.logo || property.developerDetails?.logo || "",
    description: property.developerDetails?.description || property.developer?.description || "",
    email: property.developer?.email || property.developerDetails?.email || "",
    phone: property.developer?.phone_number || property.developerDetails?.phone || "",
    websiteUrl: property.developer?.websiteUrl || property.developerDetails?.websiteUrl || "",
  },
  developerName: property.developer?.name || property.developerName || "",
  completionDate: property.completionDate || "",
  projectStatus: property.projectStatus || "",
  developmentStatus: property.developmentStatus || "",
  constructionProgress: property.constructionProgress || 0,
  readinessProgress: property.readinessProgress || "",
  serviceCharge: property.serviceCharge || "",
  totalUnits: property.totalUnits || 0,
  soldUnits: property.soldUnits || property.inventoryStats?.sold || 0,
  reservedUnits: property.reservedUnits || property.inventoryStats?.reserved || 0,
  availableUnits: property.availableUnits || property.inventoryStats?.available ||
    Math.max(0, (property.totalUnits || 0) - (property.soldUnits || property.inventoryStats?.sold || 0) - (property.reservedUnits || property.inventoryStats?.reserved || 0)),
  description: property.description || property.overview || "",
  overview: property.overview || property.description || "",
  locality: property.locality || property.area || "",
  location: property.location || {},
  proximity: property.proximity || {},
  isFeatured: property.isFeatured || false,
  saleStatus: property.saleStatus || "Available",
  facilities: (() => {
    const f = property.facilities;
    if (!f) return [];
    if (Array.isArray(f)) return f;
    return Object.entries(f)
      .filter(([, value]) => value === true)
      .map(([key]) => key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim());
  })(),
  amenities: Array.isArray(property.amenities) ? property.amenities : [],
  paymentPlan: (() => {
    const pp = property.paymentPlan;
    if (!Array.isArray(pp)) return [];
    return pp.flatMap((plan) => {
      if (Array.isArray(plan.stages)) {
        return plan.stages.map((stage) => ({
          milestone: stage.stage?.replace(/_/g, " ") || stage.description || "",
          percentage: stage.percentage || 0,
          description: stage.description || "",
        }));
      }
      return plan ? [plan] : [];
    });
  })(),
  unitTypes: (() => {
    if (Array.isArray(property.inventory) && property.inventory.length > 0) {
      return property.inventory.map((inv) => ({
        type: inv.unitType || inv.bedroomType || "",
        area: inv.sqft || inv.sqm || inv.area || 0,
        price: inv.price || property.price_min || property.price || 0,
        status: inv.status || "available",
      }));
    }
    if (Array.isArray(property.unitTypes) && property.unitTypes.length > 0) {
      return property.unitTypes.map((unit) => (
        typeof unit === "string" ? { type: unit, area: 0, price: 0 } : unit
      ));
    }
    return [];
  })(),
});

const PresentationModal = ({ property: initialProperty, onClose }) => {
  const [step, setStep] = useState(1);
  const [property, setProperty] = useState(initialProperty);
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [narrative, setNarrative] = useState(null);
  const [trackingUrl, setTrackingUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const [settings, setSettings] = useState({
    language: "English",
    currency: "AED",
    areaUnit: "sqft",
    tone: "professional",
    sections: {
      cover: true,
      projectDescription: true,
      developer: true,
      unitPrices: true,
      paymentPlan: true,
      location: true,
      gallery: true,
      keyHighlights: true,
    },
  });
  const [clientNotes, setClientNotes] = useState({
    clientName: "",
    budget: "",
    requirements: "",
  });

  useEffect(() => {
    if (!initialProperty?._id) return;
    setPropertyLoading(true);
    apiService.get(`/properties/${initialProperty._id}`)
      .then((res) => {
        const data = normalizeApi(res);
        if (data?.data) setProperty(data.data);
      })
      .catch(() => setError("Full property fetch failed. Using catalogue data."))
      .finally(() => setPropertyLoading(false));
  }, [initialProperty?._id]);

  const cleanProperty = buildPresentationProperty(property || {});

  const toggleSection = (key) => {
    setSettings((prev) => ({
      ...prev,
      sections: { ...prev.sections, [key]: !prev.sections[key] },
    }));
  };

  const handleGenerate = async () => {
    if (!clientNotes.clientName || clientNotes.clientName.trim() === "") {
      setError("Client Name is mandatory to generate the presentation.");
      return; // Execution yahan ruk jayegi
    }
    setGenerating(true);
    setError("");
    try {
      const res = await apiService.post("/presentation/generate-narrative", {
        property: cleanProperty,
        clientNotes,
        settings,
      });
      const data = normalizeApi(res);
      if (data?.success) {
        setNarrative(data.data);
        setStep(2);
      } else {
        setError(data?.message || "Generation failed");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await apiService.post("/presentation/save", {
        propertyId: property._id,
        property: cleanProperty,
        narrative,
        settings,
        clientNotes,
        agentProfile: {},
      });
      const data = normalizeApi(res);
      if (data?.success) {
        setTrackingUrl(data.data.trackingUrl);
        setPreviewUrl(`${data.data.trackingUrl}?preview=true`);
        setStep(3);
      } else {
        setError(data?.message || "Save failed");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const waMessage = encodeURIComponent(
    `Hi${clientNotes.clientName ? ` ${clientNotes.clientName}` : ""},\n\nPlease find the property presentation for *${property?.propertyName || property?.projectName}* here:\n${trackingUrl}\n\n_Powered by Xoto GRID_`
  );
  const mailBody = encodeURIComponent(
    `Hello${clientNotes.clientName ? ` ${clientNotes.clientName}` : ""},\n\nPlease find the property presentation here:\n${trackingUrl}\n\nBest regards`
  );

  return (
    <div style={styles.modalOverlay}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div>
            <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 800, margin: 0 }}>AI Presentation Generator</h3>
            <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 12, margin: "3px 0 0" }}>
              {step === 1 && "Customize your presentation"}
              {step === 2 && "Review AI content"}
              {step === 3 && "Share with your client"}
            </p>
          </div>
          <button type="button" onClick={onClose} style={styles.modalClose}><X size={16} /></button>
        </div>

        <div style={styles.modalBody}>
          {error && <div style={styles.modalError}>{error}</div>}
          {propertyLoading && (
            <div style={styles.modalInfo}><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Loading full property data...</div>
          )}

          {step === 1 && (
            <>
              <div style={styles.modalProperty}>
                {cleanProperty.mainLogo
                  ? <img src={cleanProperty.mainLogo} alt="" style={styles.modalThumb} />
                  : <div style={styles.modalThumbFallback}><Home size={20} color="#6d28d9" /></div>}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#18181b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {cleanProperty.propertyName || "Property"}
                  </div>
                  <div style={{ fontSize: 12, color: "#71717a" }}>{[cleanProperty.area, cleanProperty.city].filter(Boolean).join(", ")}</div>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Client Name <span style={{ color: "#dc2626", fontSize: 12 }}>*</span>
                </label>
                <input 
                  value={clientNotes.clientName} 
                  onChange={(e) => setClientNotes((p) => ({ ...p, clientName: e.target.value }))} 
                  placeholder="Enter client name" 
                  style={styles.input} 
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Budget</label>
                  <input value={clientNotes.budget} onChange={(e) => setClientNotes((p) => ({ ...p, budget: e.target.value }))} placeholder="AED 1,500,000" style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Requirement</label>
                  <input value={clientNotes.requirements} onChange={(e) => setClientNotes((p) => ({ ...p, requirements: e.target.value }))} placeholder="2BR, waterfront..." style={styles.input} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Language</label>
                  <select value={settings.language} onChange={(e) => setSettings((p) => ({ ...p, language: e.target.value }))} style={styles.input}>
                    {["English", "Arabic", "Hindi", "Urdu", "Russian"].map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Currency</label>
                  <select value={settings.currency} onChange={(e) => setSettings((p) => ({ ...p, currency: e.target.value }))} style={styles.input}>
                    {["AED", "USD", "GBP", "EUR", "INR"].map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Area Unit</label>
                  <select value={settings.areaUnit} onChange={(e) => setSettings((p) => ({ ...p, areaUnit: e.target.value }))} style={styles.input}>
                    <option value="sqft">sqft</option>
                    <option value="sqm">sqm</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={styles.formLabel}>Tone</label>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  {["professional", "luxury", "friendly"].map((tone) => (
                    <button key={tone} type="button" onClick={() => setSettings((p) => ({ ...p, tone }))}
                      style={{ ...styles.segmentBtn, ...(settings.tone === tone ? styles.segmentBtnActive : {}) }}>
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={styles.formLabel}>Include Sections</label>
                <div style={styles.sectionGrid}>
                  {Object.entries({
                    cover: "Cover",
                    projectDescription: "Description",
                    developer: "Developer",
                    unitPrices: "Prices",
                    paymentPlan: "Payment",
                    location: "Location",
                    gallery: "Gallery",
                    keyHighlights: "Highlights",
                  }).map(([key, label]) => (
                    <button key={key} type="button" onClick={() => toggleSection(key)}
                      style={{ ...styles.sectionBtn, ...(settings.sections[key] ? styles.sectionBtnActive : {}) }}>
                      <CheckCircle2 size={12} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && narrative && (
            <>
              <div style={styles.modalInfo}><CheckCircle2 size={14} /> AI narrative generated. Review and edit if needed.</div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Property Overview</label>
                <textarea rows={4} value={narrative.propertyOverview || ""} onChange={(e) => setNarrative((p) => ({ ...p, propertyOverview: e.target.value }))} style={styles.textarea} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Key Highlights</label>
                {(narrative.keyHighlights || []).map((item, index) => (
                  <input key={index} value={item} onChange={(e) => {
                    const next = [...(narrative.keyHighlights || [])];
                    next[index] = e.target.value;
                    setNarrative((p) => ({ ...p, keyHighlights: next }));
                  }} style={{ ...styles.input, marginBottom: 8 }} />
                ))}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Location & Community</label>
                <textarea rows={3} value={narrative.locationCommunity || ""} onChange={(e) => setNarrative((p) => ({ ...p, locationCommunity: e.target.value }))} style={styles.textarea} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Next Steps</label>
                <textarea rows={2} value={narrative.nextSteps || ""} onChange={(e) => setNarrative((p) => ({ ...p, nextSteps: e.target.value }))} style={styles.textarea} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div style={styles.readyBox}><CheckCircle2 size={20} /> Presentation ready. Share the tracked client link.</div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Client Link</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input readOnly value={trackingUrl} style={{ ...styles.input, flex: 1 }} />
                  <button type="button" onClick={handleCopy} style={styles.copyBtn}>{copied ? "Copied" : <Copy size={14} />}</button>
                </div>
              </div>
              {previewUrl && (
                <a href={previewUrl} target="_blank" rel="noreferrer" style={styles.previewLink}>
                  <Eye size={14} /> Open Preview
                </a>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <a href={`https://wa.me/?text=${waMessage}`} target="_blank" rel="noreferrer" style={{ ...styles.shareBtn, background: "#25D366", color: "#fff" }}>
                  WhatsApp
                </a>
                <a href={`mailto:?subject=Property Presentation - ${property?.propertyName || ""}&body=${mailBody}`} style={{ ...styles.shareBtn, background: "#fff", color: "#52525b", border: "1px solid #e5e7eb" }}>
                  <Mail size={14} /> Email
                </a>
              </div>
            </>
          )}
        </div>

        <div style={styles.modalFooter}>
          <Btn variant="ghost" onClick={onClose}>{step === 3 ? "Close" : "Cancel"}</Btn>
          <div style={{ display: "flex", gap: 8 }}>
            {step === 2 && <Btn variant="ghost" onClick={() => setStep(1)}>Back</Btn>}
            {step === 1 && <Btn onClick={handleGenerate} loading={generating} disabled={propertyLoading}>Generate with AI</Btn>}
            {step === 2 && <Btn onClick={handleSave} loading={saving}>Save & Get Link</Btn>}
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertyCard = ({ property, onView, onGeneratePresentation }) => {
  const thumb = getThumb(property.photos, property.mainLogo);
  const tc = typeColor(property.propertySubType);
  const [imgErr, setImgErr] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.card,
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        borderColor: hovered ? "rgba(109,40,217,0.3)" : "rgba(109,40,217,0.08)",
        boxShadow: hovered
          ? "0 20px 48px rgba(109,40,217,0.13), 0 4px 12px rgba(0,0,0,0.06)"
          : "0 2px 8px rgba(0,0,0,0.04)",
      }}
      onClick={() => onView(property)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={styles.cardImg}>
        {thumb && !imgErr ? (
          <img
            src={thumb}
            alt={property.propertyName}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", transform: hovered ? "scale(1.04)" : "scale(1)" }}
            onError={() => setImgErr(true)}
          />
        ) : (
          <div style={styles.cardImgFallback}>
            <Home size={40} color="#a78bfa" strokeWidth={1.5} />
          </div>
        )}

        <div style={styles.imgOverlay} />

        {/* Type badge */}
        <span style={{ ...styles.badge, background: tc.bg, color: tc.text, top: 12, left: 12 }}>
          {typeLabel(property.propertySubType)}
        </span>

        {/* HOT badge */}
        {property.isHot && (
          <span style={{ ...styles.badge, background: "#dc2626", color: "#fff", top: 12, right: 12, display: "flex", alignItems: "center", gap: 4 }}>
            <Flame size={10} /> HOT
          </span>
        )}

        {/* Completion for off-plan */}
        {property.propertySubType === "off_plan" && property.completionDate?.quarter && (
          <span style={{ ...styles.badge, background: "rgba(0,0,0,0.6)", color: "#fff", bottom: 12, left: 12, top: "auto", display: "flex", alignItems: "center", gap: 5, backdropFilter: "blur(4px)" }}>
            <Calendar size={10} />
            {property.completionDate.quarter} {property.completionDate.year}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px" }}>
        <div style={styles.cardPrice}>
          {property.propertySubType === "off_plan" && property.price_min > 0 && property.price_max > 0 && property.price_min !== property.price_max
            ? <>{formatPrice(property.price_min, "off_plan", property.currency)} <span style={{ fontSize: 13, fontWeight: 500, color: "#a1a1aa" }}>–</span> {formatPrice(property.price_max, "off_plan", property.currency)}</>
            : formatPrice(property.price || property.price_min || property.price_max, property.propertySubType, property.currency)
          }
        </div>
        <div style={styles.cardName} title={property.propertyName}>
          {property.propertyName}
        </div>
        <div style={styles.cardLoc}>
          <MapPin size={11} style={{ marginRight: 3, flexShrink: 0 }} />
          {property.area?.split(",")[0] || property.city}
          {property.developer?.name && (
            <span style={{ marginLeft: 6, color: "#c4b5d4", fontWeight: 400 }}>· {property.developer.name}</span>
          )}
        </div>

        {/* Meta */}
        <div style={styles.metaRow}>
          <span style={styles.metaItem}><Bed size={12} style={{ marginRight: 3 }} />{bedroomLabel(property.bedroomType, property.bedrooms)}</span>
          <span style={styles.metaDivider} />
          <span style={styles.metaItem}><Bath size={12} style={{ marginRight: 3 }} />{property.bathrooms} Bath</span>
          {(property.builtUpArea > 0 || property.builtUpArea_min > 0) && (
            <>
              <span style={styles.metaDivider} />
              <span style={styles.metaItem}><Square size={12} style={{ marginRight: 3 }} />{(property.builtUpArea || property.builtUpArea_min).toLocaleString()} sqft</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={styles.cardActions}>
        <button
          style={styles.btnView}
          onClick={(e) => { e.stopPropagation(); onView(property); }}
        >
          View Details
        </button>
        <button
          style={styles.btnPresentation}
          onClick={(e) => { e.stopPropagation(); onGeneratePresentation(property); }}
        >
          <Sparkles size={12} style={{ marginRight: 5 }} />
          AI Presentation
        </button>
      </div>
    </div>
  );
};

// ─── Detail Page ──────────────────────────────────────────────────────────────
const PropertyDetail = ({ property: p, onBack, onGeneratePresentation }) => {
  const thumb = getThumb(p.photos, p.mainLogo);
  const allPhotos = [
    ...(p.photos?.architecture || []),
    ...(p.photos?.interior || []),
    ...(p.photos?.lobby || []),
    ...(p.photos?.other || []),
  ];
  const tc = typeColor(p.propertySubType);
  const [selectedImage, setSelectedImage] = useState(thumb);

  const specs = [
    { icon: <Bed size={18} strokeWidth={1.5} />, val: bedroomLabel(p.bedroomType, p.bedrooms), lbl: "Bedrooms" },
    { icon: <Bath size={18} strokeWidth={1.5} />, val: p.bathrooms || 0, lbl: "Bathrooms" },
    { icon: <Square size={18} strokeWidth={1.5} />, val: `${(p.builtUpArea || p.builtUpArea_min || 0).toLocaleString()} sqft`, lbl: "Area" },
    { icon: <Building2 size={18} strokeWidth={1.5} />, val: p.floorNumber > 0 ? `Floor ${p.floorNumber}` : "—", lbl: "Floor" },
  ];

  const stats = [
    { icon: <Eye size={14} />, label: "Views", val: p.viewCount || 0 },
    { icon: <Heart size={14} />, label: "Wishlists", val: p.wishlistCount || 0 },
    { icon: <CheckCircle2 size={14} />, label: "Sold Units", val: p.soldUnits || 0 },
    { icon: <Lock size={14} />, label: "Reserved", val: p.reservedUnits || 0 },
  ];

  return (
    <div style={{ background: "#f6f5fb", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Back bar */}
      <div style={styles.backBar} onClick={onBack}>
        <ArrowLeft size={16} />
        <span>Back to Catalogue</span>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 22 }}>

          {/* ── LEFT ── */}
          <div>
            {/* Hero */}
            <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 14, height: 300, background: "#e5e7eb", position: "relative" }}>
              {thumb ? (
                <img
                  src={selectedImage || thumb}
                  alt={p.propertyName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Home size={64} color="#a78bfa" strokeWidth={1} />
                </div>
              )}
              <div style={styles.imgOverlay} />
              <span style={{ ...styles.badge, background: tc.bg, color: tc.text, top: 16, left: 16, fontSize: 12, padding: "5px 14px", position: "absolute" }}>
                {typeLabel(p.propertySubType)}
              </span>
              {p.isHot && (
                <span style={{ ...styles.badge, background: "#dc2626", color: "#fff", top: 16, right: 16, fontSize: 12, padding: "5px 14px", position: "absolute", display: "flex", alignItems: "center", gap: 5 }}>
                  <Flame size={12} /> HOT
                </span>
              )}
            </div>

            {/* Photo strip */}
            {allPhotos.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
                {allPhotos.slice(0, 7).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    onClick={() => setSelectedImage(url)}   // 🔥 MAIN FIX
                    style={{
                      width: 84,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 10,
                      cursor: "pointer",
                      border: selectedImage === url
                        ? "2px solid #6d28d9"
                        : "2px solid rgba(109,40,217,0.12)"
                    }}
                  />
                ))}
              </div>
            )}

            {/* Title */}
            <div style={styles.detailSection}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#18181b", margin: 0 }}>{p.propertyName}</h1>
              </div>
              <div style={{ fontSize: 13, color: "#71717a", marginBottom: 12, display: "flex", alignItems: "center", gap: 5 }}>
                <MapPin size={13} color="#6d28d9" />
                {p.area}, {p.city}, {p.country}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#6d28d9" }}>
                {formatPrice(p.price || p.price_min, p.propertySubType, p.currency)}
              </div>
              {p.propertySubType === "off_plan" && p.price_min !== p.price_max && p.price_max > 0 && (
                <div style={{ fontSize: 12, color: "#a1a1aa", marginTop: 4 }}>
                  Range: {formatPrice(p.price_min, p.propertySubType, p.currency)} – {formatPrice(p.price_max, p.propertySubType, p.currency)}
                </div>
              )}
            </div>

            {/* Specs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
              {specs.map((s, i) => (
                <div key={i} style={styles.specCard}>
                  <div style={{ color: "#6d28d9", marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#18181b" }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "#a1a1aa", marginTop: 2 }}>{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {p.description && p.description.trim().length > 2 && (
              <div style={styles.detailSection}>
                <div style={styles.sectionTitle}>About this Property</div>
                <div style={{ maxHeight: 96, overflowY: "auto", overflowX: "hidden", paddingRight: 6 }}>
                  <p style={{ fontSize: 13, color: "#52525b", lineHeight: 1.8, margin: 0, wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "pre-wrap" }}>{p.description}</p>
                </div>
              </div>
            )}

            {/* Amenities */}
            {p.amenities?.length > 0 && (
              <div style={styles.detailSection}>
                <div style={styles.sectionTitle}>Amenities</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {p.amenities.map((a, i) => (
                    <span key={i} style={{ padding: "5px 14px", background: "#f3e8ff", color: "#6d28d9", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities */}
            {Object.values(p.facilities || {}).some(Boolean) && (
              <div style={styles.detailSection}>
                <div style={styles.sectionTitle}>Facilities</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.entries(p.facilities).filter(([, v]) => v).map(([k]) => (
                    <span key={k} style={{ padding: "5px 14px", background: "#d1fae5", color: "#065f46", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                      {k.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Plan */}
            {p.propertySubType === "off_plan" && p.paymentPlan?.length > 0 && (
              <div style={styles.detailSection}>
                <div style={styles.sectionTitle}>Payment Plan</div>
                {p.paymentPlan.map((plan, i) => (
                  <div key={i}>
                    {plan.title && <div style={{ fontSize: 13, fontWeight: 600, color: "#18181b", marginBottom: 10 }}>{plan.title}</div>}
                    {plan.stages?.map((s, j) => (
                      <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid rgba(109,40,217,0.07)", fontSize: 13 }}>
                        <span style={{ color: "#52525b" }}>{s.description || s.stage}</span>
                        <span style={{ fontWeight: 600, color: "#6d28d9", background: "#f3e8ff", padding: "2px 12px", borderRadius: 12, fontSize: 12 }}>{s.percentage}%</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Property Inventory */}
            {(p.totalUnits > 0 || p.unitTypes?.length > 0) && (
              <div style={styles.detailSection}>
                <div style={styles.sectionTitle}>Property Inventory</div>

                {/* Availability Stats */}
                {p.totalUnits > 0 && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
                      {[
                        { label: "Total Units", val: p.totalUnits, bg: "#f3e8ff", color: "#6d28d9" },
                        { label: "Available", val: p.availableUnits, bg: "#d1fae5", color: "#059669" },
                        { label: "Sold", val: p.soldUnits, bg: "#fee2e2", color: "#dc2626" },
                        { label: "Reserved", val: p.reservedUnits, bg: "#fef3c7", color: "#d97706" },
                      ].map(({ label, val, bg, color }) => (
                        <div key={label} style={{ background: bg, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color }}>{val}</div>
                          <div style={{ fontSize: 11, color: "#71717a", marginTop: 3, fontWeight: 500 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    {/* Availability progress bar */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#71717a", marginBottom: 5, fontWeight: 500 }}>
                        <span>Availability</span>
                        <span>{p.totalUnits > 0 ? Math.round((p.availableUnits / p.totalUnits) * 100) : 0}% Available</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 8, background: "#f3e8ff", overflow: "hidden" }}>
                        <div style={{ display: "flex", height: "100%" }}>
                          <div style={{ width: `${p.totalUnits > 0 ? (p.soldUnits / p.totalUnits) * 100 : 0}%`, background: "#dc2626", transition: "width 0.5s" }} />
                          <div style={{ width: `${p.totalUnits > 0 ? (p.reservedUnits / p.totalUnits) * 100 : 0}%`, background: "#d97706", transition: "width 0.5s" }} />
                          <div style={{ flex: 1, background: "#059669", transition: "width 0.5s" }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 11, color: "#71717a" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#dc2626", display: "inline-block" }} />Sold</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#d97706", display: "inline-block" }} />Reserved</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#059669", display: "inline-block" }} />Available</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Unit Types Table */}
                {p.unitTypes?.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#52525b", marginBottom: 8 }}>Unit Types</div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "#faf5ff" }}>
                          {["Type", "Area (sqft)", "Starting Price", "Status"].map((h) => (
                            <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "#6d28d9", fontWeight: 700, fontSize: 11, borderBottom: "2px solid #f3e8ff" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {p.unitTypes.map((unit, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid rgba(109,40,217,0.06)" }}>
                            <td style={{ padding: "9px 10px", color: "#18181b", fontWeight: 600 }}>{unit.type || "—"}</td>
                            <td style={{ padding: "9px 10px", color: "#52525b" }}>{unit.area ? unit.area.toLocaleString() : "—"}</td>
                            <td style={{ padding: "9px 10px", color: "#6d28d9", fontWeight: 600 }}>{unit.price ? formatPrice(unit.price, p.propertySubType, p.currency) : "—"}</td>
                            <td style={{ padding: "9px 10px" }}>
                              <span style={{
                                padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                                background: unit.status === "available" ? "#d1fae5" : unit.status === "sold" ? "#fee2e2" : "#fef3c7",
                                color: unit.status === "available" ? "#059669" : unit.status === "sold" ? "#dc2626" : "#d97706",
                                textTransform: "capitalize",
                              }}>
                                {unit.status || "available"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}

            {/* Property details table */}
            <div style={styles.detailSection}>
              <div style={styles.sectionTitle}>Property Details</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                {[
                  ["Unit Type", p.unitType],
                  ["Furnishing", p.furnishing?.replace("_", " ")],
                  ["Ownership", p.ownershipType],
                  ["Transaction", p.transactionType === "rent" ? "For Rent" : "For Sale"],
                  p.rentalFrequency && ["Rental Frequency", p.rentalFrequency],
                  p.cheques && ["Cheques Accepted", p.cheques],
                  p.minimumContract && ["Min. Contract", `${p.minimumContract} months`],
                  p.parkingSpaces > 0 && ["Parking", `${p.parkingSpaces} space(s)`],
                  p.reraPermitNumber && ["RERA Permit", p.reraPermitNumber],
                  p.dldRegistrationNumber && ["DLD Registration", p.dldRegistrationNumber],
                  p.completionDate?.quarter && ["Handover", `${p.completionDate.quarter} ${p.completionDate.year}`],
                  p.readinessProgress && p.readinessProgress !== "0%" && ["Construction", p.readinessProgress],
                ].filter(Boolean).map(([label, val], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(109,40,217,0.06)" }}>
                    <td style={{ padding: "8px 0", color: "#a1a1aa", width: "42%", fontWeight: 500 }}>{label}</td>
                    <td style={{ padding: "8px 0", color: "#18181b", fontWeight: 600, textTransform: "capitalize" }}>{val}</td>
                  </tr>
                ))}
              </table>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* AI Presentation CTA */}
            <div style={{ ...styles.detailSection, background: "linear-gradient(135deg, #4c1d95 0%, #6d28d9 60%, #7c3aed 100%)", border: "none", boxShadow: "0 8px 32px rgba(109,40,217,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Sparkles size={15} color="#e9d5ff" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>AI Presentation</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 16, lineHeight: 1.6 }}>
                Generate a branded property presentation for your client in seconds.
              </div>
              <button
                style={{ ...styles.btnPrimary, background: "#fff", color: "#6d28d9", fontWeight: 700 }}
                onClick={() => onGeneratePresentation(p)}
              >
                Generate Presentation
              </button>
            </div>

 
            {/* Developer info */}
            {p.developer && (
              <div style={styles.detailSection}>
                <div style={styles.sectionTitle}>Developer</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {p.developer.logo ? (
                    <img src={p.developer.logo} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Layers size={20} color="#6d28d9" />
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b" }}>{p.developer.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                      <CheckCircle2 size={11} color="#059669" />
                      <span style={{ fontSize: 11, color: "#059669", fontWeight: 500 }}>Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Property Documents */}
            <div style={styles.detailSection}>
              <div style={styles.sectionTitle}>Property Documents</div>
              {p.documents?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {p.documents.map((doc, i) => (
                    <a key={i} href={doc.url} target="_blank" rel="noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#faf5ff", borderRadius: 10, border: "1px solid #ede9fe", textDecoration: "none", transition: "all 0.15s" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <FileText size={15} color="#6d28d9" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#18181b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.label}</div>
                        <div style={{ fontSize: 10, color: "#a1a1aa", marginTop: 1 }}>Tap to download</div>
                      </div>
                      <ChevronRight size={13} color="#a1a1aa" />
                    </a>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "#a1a1aa", padding: "10px 0", textAlign: "center" }}>No documents attached</div>
              )}
            </div>

  

            {/* Interest Stats */}
            <div style={styles.detailSection}>
              <div style={styles.sectionTitle}>Interest Stats</div>
              {stats.map(({ icon, label, val }, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < stats.length - 1 ? "1px solid rgba(109,40,217,0.06)" : "none", fontSize: 13 }}>
                  <span style={{ color: "#71717a", display: "flex", alignItems: "center", gap: 7 }}>{icon}{label}</span>
                  <span style={{ fontWeight: 700, color: "#18181b" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PropertyCatalogue() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [selectedProp, setSelectedProp] = useState(null);
  const [presentationProp, setPresentationProp] = useState(null);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
const typeDropdownRef = useRef(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (activeFilter !== "all") params.set("propertySubType", activeFilter);
      if (search.trim()) params.set("search", search.trim());
      if (sortBy === "price_asc") { params.set("sortBy", "price"); params.set("sortOrder", "asc"); }
      if (sortBy === "price_desc") { params.set("sortBy", "price"); params.set("sortOrder", "desc"); }

      const data = await apiService.get(`/properties?${params}`);
      setProperties(data.data || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [page, activeFilter, sortBy, search]);

  useEffect(() => {
    const t = setTimeout(fetchProperties, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchProperties, search]);
useEffect(() => {
  const handleClickOutside = (e) => {
    if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
      setTypeDropdownOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
 const typeFilters = [
  { key: "all", label: "All Properties", icon: LayoutGrid },
  { key: "off_plan", label: "Off-Plan", icon: Building2 },
  { key: "secondary", label: "Secondary", icon: Home },
  { key: "rental", label: "Rental", icon: Key },
  { key: "commercial", label: "Commercial", icon: Briefcase },
];

  if (selectedProp) {
    return (
      <>
        <PropertyDetail
          property={selectedProp}
          onBack={() => setSelectedProp(null)}
          onGeneratePresentation={setPresentationProp}
        />
        {presentationProp && (
          <PresentationModal
            property={presentationProp}
            onClose={() => setPresentationProp(null)}
          />
        )}
      </>
    );
  }

  return (
    <div style={{ background: "#f6f5fb", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", padding: "28px 28px" }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
        button { cursor: pointer; }
        select { cursor: pointer; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, background: "linear-gradient(135deg, #4c1d95, #6d28d9)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(109,40,217,0.35)" }}>
            <LayoutGrid size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#18181b", margin: 0, letterSpacing: "-0.3px" }}>Property Catalogue</h1>
            <p style={{ fontSize: 12, color: "#a1a1aa", margin: 0, marginTop: 2 }}>
              {pagination ? `${pagination.totalItems} active listings` : "Browsing all live listings"}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid rgba(109,40,217,0.12)", borderRadius: 10, padding: "0 14px", flex: 1, minWidth: 220, transition: "border-color 0.2s" }}>
          <Search size={15} color="#a1a1aa" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, area, developer..."
            style={{ border: "none", outline: "none", fontSize: 13, color: "#18181b", background: "transparent", padding: "10px 0", width: "100%" }}
          />
        </div>

        {/* Filters */}
        {/* ✅ NEW: Icon dropdown */}
<div ref={typeDropdownRef} style={{ position: "relative" }}>
  <button
    onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
    style={{
      display: "flex", alignItems: "center", gap: 8,
      background: "#fff", border: "1.5px solid rgba(109,40,217,0.12)", borderRadius: 10,
      padding: "9px 14px", fontSize: 12, fontWeight: 600, color: "#52525b",
      whiteSpace: "nowrap",
    }}
  >
    {(() => {
      const active = typeFilters.find((f) => f.key === activeFilter);
      const Icon = active?.icon || LayoutGrid;
      return <Icon size={14} />;
    })()}
    {typeFilters.find((f) => f.key === activeFilter)?.label || "All Properties"}
    <ChevronDown size={13} style={{ marginLeft: 4 }} />
  </button>

  {typeDropdownOpen && (
    <div style={{
      position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 20,
      minWidth: 180, background: "#fff", border: "1.5px solid rgba(109,40,217,0.08)",
      borderRadius: 10, boxShadow: "0 12px 32px rgba(0,0,0,0.12)", overflow: "hidden",
    }}>
      {typeFilters.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => {
            setActiveFilter(key);
            setPage(1);
            setTypeDropdownOpen(false);
          }}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", border: "none", background: activeFilter === key ? "#faf5ff" : "#fff",
            color: activeFilter === key ? "#6d28d9" : "#52525b",
            fontSize: 12, fontWeight: activeFilter === key ? 700 : 500,
            transition: "background 0.15s",
          }}
        >
          <Icon size={14} /> {label}
        </button>
      ))}
    </div>
  )}
</div>

        {/* Sort */}
        <div style={{ position: "relative" }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ border: "1.5px solid rgba(109,40,217,0.12)", borderRadius: 10, padding: "9px 14px", fontSize: 12, color: "#52525b", background: "#fff", outline: "none", fontWeight: 500, appearance: "none", paddingRight: 32 }}
          >
            <option value="newest">Recently Added</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
          <TrendingUp size={13} color="#a1a1aa" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px 18px", borderRadius: 10, marginBottom: 16, fontSize: 13, border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 8 }}>
          ⚠ {error} —{" "}
          <button onClick={fetchProperties} style={{ color: "#6d28d9", background: "none", border: "none", fontWeight: 700, padding: 0 }}>Retry</button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={styles.grid}>
          {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : properties.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#a1a1aa" }}>
          <Home size={48} color="#d4d4d8" style={{ marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: "#71717a", marginBottom: 4 }}>No properties found</div>
          <div style={{ fontSize: 13 }}>Try adjusting your search or filters</div>
        </div>
      ) : (
     <div style={styles.grid}>
          {properties.map((p) => (
            <div key={p._id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <PropertyCard
                property={p}
                onView={setSelectedProp}
                onGeneratePresentation={setPresentationProp}
              />
              {/* QR Code Button – show on hover */}
              {p.qr_code && (
                <div style={{ padding: '0 12px', marginBottom: 8 }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb',
                        background: '#fff', fontSize: 11, fontWeight: 600, color: '#374151',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        const img = e.currentTarget.nextSibling;
                        if (img) img.style.display = 'block';
                      }}
                      onMouseLeave={(e) => {
                        const img = e.currentTarget.nextSibling;
                        if (img) img.style.display = 'none';
                      }}
                    >
                      <QrCode size={14} /> QR
                    </button>
                    <div style={{
                      display: 'none', position: 'absolute', bottom: '100%', left: '50%',
                      transform: 'translateX(-50%)', marginBottom: 8, zIndex: 10,
                    }}>
                      <img
                        src={p.qr_code}
                        alt="QR"
                        style={{ width: 180, height: 180, borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
          <span style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 500 }}>
            Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalItems} total
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage}
              style={{ ...styles.pgBtn, opacity: pagination.hasPrevPage ? 1 : 0.35 }}
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              const n = i + Math.max(1, page - 2);
              if (n > pagination.totalPages) return null;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  style={{ ...styles.pgBtn, background: n === page ? "#6d28d9" : "#fff", color: n === page ? "#fff" : "#52525b", borderColor: n === page ? "#6d28d9" : "rgba(109,40,217,0.12)", fontWeight: n === page ? 700 : 500 }}
                >{n}</button>
              );
            })}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage}
              style={{ ...styles.pgBtn, opacity: pagination.hasNextPage ? 1 : 0.35 }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {presentationProp && (
        <PresentationModal
          property={presentationProp}
          onClose={() => setPresentationProp(null)}
        />
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(268px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    border: "1.5px solid rgba(109,40,217,0.08)",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease",
  },
  cardImg: {
    height: 180,
    position: "relative",
    overflow: "hidden",
    background: "#e5e7eb",
  },
  imgOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 50%)",
    pointerEvents: "none",
  },
  cardImgFallback: {
    width: "100%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
  },
  badge: {
    position: "absolute",
    fontSize: 10,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 20,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
  },
  cardPrice: { fontSize: 17, fontWeight: 800, color: "#6d28d9", marginBottom: 4, letterSpacing: "-0.3px" },
  cardName: {
    fontSize: 13, fontWeight: 600, color: "#18181b", marginBottom: 5,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  cardLoc: { fontSize: 11, color: "#a1a1aa", marginBottom: 12, display: "flex", alignItems: "center" },
  metaRow: { display: "flex", gap: 0, borderTop: "1px solid rgba(109,40,217,0.07)", paddingTop: 10, alignItems: "center" },
  metaItem: { fontSize: 11, color: "#71717a", display: "flex", alignItems: "center", fontWeight: 500 },
  metaDivider: { width: 1, height: 12, background: "rgba(109,40,217,0.1)", margin: "0 10px" },
  cardActions: { display: "flex", gap: 8, padding: "10px 16px", borderTop: "1px solid rgba(109,40,217,0.07)", background: "#fafafa" },
  btnView: {
    flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 600,
    cursor: "pointer", background: "#f3e8ff", color: "#6d28d9", border: "none",
    transition: "all 0.15s",
  },
  btnPresentation: {
    flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 600,
    cursor: "pointer", background: "#6d28d9", color: "#fff", border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s",
  },
  backBar: {
    display: "flex", alignItems: "center", gap: 10, padding: "14px 28px",
    background: "#fff", borderBottom: "1px solid rgba(109,40,217,0.08)",
    cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#6d28d9",
    transition: "background 0.15s",
  },
  detailSection: {
    background: "#fff", borderRadius: 14, padding: "18px 22px",
    marginBottom: 16, border: "1.5px solid rgba(109,40,217,0.08)",
  },
  specCard: {
    background: "#fafafa", border: "1.5px solid rgba(109,40,217,0.08)",
    borderRadius: 12, padding: "14px 10px", textAlign: "center",
  },
  sectionTitle: {
    fontSize: 10, fontWeight: 800, color: "#a1a1aa", letterSpacing: "1.2px",
    textTransform: "uppercase", marginBottom: 12, paddingBottom: 8,
    borderBottom: "2px solid #f3e8ff",
  },
  btnPrimary: {
    width: "100%", padding: "11px 0", borderRadius: 9, fontSize: 13,
    fontWeight: 600, cursor: "pointer", background: "#6d28d9",
    color: "#fff", border: "none", transition: "opacity 0.15s",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  btnOutline: {
    width: "100%", padding: "11px 0", borderRadius: 9, fontSize: 13,
    fontWeight: 600, cursor: "pointer", background: "transparent",
    color: "#6d28d9", border: "1.5px solid #6d28d9", transition: "all 0.15s",
  },
  pgBtn: {
    width: 34, height: 34, borderRadius: 8,
    border: "1.5px solid rgba(109,40,217,0.12)",
    background: "#fff", fontSize: 13, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#52525b", fontWeight: 500, transition: "all 0.15s",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    width: "min(680px, 100%)",
    maxHeight: "92vh",
    background: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    background: "linear-gradient(135deg, #4c1d95, #6d28d9)",
    padding: "18px 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.18)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    padding: 22,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  modalFooter: {
    padding: "14px 22px",
    borderTop: "1px solid #f1f1f4",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  modalError: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 600,
  },
  modalInfo: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  modalProperty: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    background: "#faf5ff",
    border: "1px solid #eadcff",
  },
  modalThumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    objectFit: "cover",
    flexShrink: 0,
  },
  modalThumbFallback: {
    width: 52,
    height: 52,
    borderRadius: 12,
    background: "#f3e8ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: 800,
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  input: {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 11,
    padding: "10px 12px",
    fontSize: 13,
    color: "#18181b",
    background: "#fafafa",
    outline: "none",
  },
  textarea: {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 11,
    padding: "11px 12px",
    fontSize: 13,
    color: "#18181b",
    background: "#fafafa",
    outline: "none",
    resize: "vertical",
    lineHeight: 1.6,
  },
  segmentBtn: {
    flex: 1,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#71717a",
    borderRadius: 10,
    padding: "9px 10px",
    fontSize: 12,
    fontWeight: 800,
    textTransform: "capitalize",
  },
  segmentBtnActive: {
    borderColor: "#a855f7",
    background: "#faf5ff",
    color: "#6d28d9",
  },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 8,
    marginTop: 8,
  },
  sectionBtn: {
    border: "1px solid #e5e7eb",
    background: "#fafafa",
    color: "#a1a1aa",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 7,
  },
  sectionBtnActive: {
    borderColor: "#c084fc",
    background: "#faf5ff",
    color: "#6d28d9",
  },
  readyBox: {
    border: "1px solid #bbf7d0",
    background: "#f0fdf4",
    color: "#166534",
    borderRadius: 14,
    padding: 14,
    fontSize: 13,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  copyBtn: {
    minWidth: 78,
    border: "1px solid #c084fc",
    background: "#faf5ff",
    color: "#6d28d9",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  previewLink: {
    border: "1px solid #e5e7eb",
    background: "#fafafa",
    color: "#52525b",
    borderRadius: 11,
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 700,
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  shareBtn: {
    borderRadius: 11,
    padding: "11px 12px",
    fontSize: 13,
    fontWeight: 800,
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
};
