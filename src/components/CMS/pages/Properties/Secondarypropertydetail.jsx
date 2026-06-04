import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import { Spin, Tag, Divider, message } from "antd";
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  HomeOutlined,
  CarOutlined,
  GlobalOutlined,
  LinkOutlined,
  FileOutlined,
  VideoCameraOutlined,
  CheckCircleFilled,
  StarFilled,
  BankOutlined,
  ExpandOutlined,
  AppstoreOutlined,
  ColumnWidthOutlined,
  BuildOutlined,
  NumberOutlined,
  FormatPainterOutlined,
  ProfileOutlined,
  LeftOutlined,
  RightOutlined,
  CloseOutlined,
} from "@ant-design/icons";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString();

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const getAllPhotos = (photos = {}) => {
  const all = [];
  ["architecture", "interior", "lobby", "other"].forEach((g) => {
    (photos[g] || []).forEach((url) => all.push({ url, group: g }));
  });
  return all;
};

// ─── Stat icon map — all Ant Design icons ─────────────────────────────────────
const STAT_DEFS = [
  { key: "bedrooms",   label: "Bedrooms",   Icon: AppstoreOutlined,      getValue: (p) => p.bedrooms ?? "—" },
  { key: "bathrooms",  label: "Bathrooms",  Icon: HomeOutlined,          getValue: (p) => p.bathrooms ?? "—" },
  { key: "builtUp",    label: "Built-up",   Icon: ColumnWidthOutlined,   getValue: (p) => p.builtUpArea ? `${fmt(p.builtUpArea)} ${p.builtUpAreaUnit || "sqft"}` : "—" },
  { key: "floor",      label: "Floor",      Icon: BuildOutlined,         getValue: (p) => p.floorNumber ?? "—" },
  { key: "unitNo",     label: "Unit No.",   Icon: NumberOutlined,        getValue: (p) => p.unitNumber || "—" },
  { key: "parking",    label: "Parking",    Icon: CarOutlined,           getValue: (p) => p.parkingSpaces ?? "—" },
  { key: "furnishing", label: "Furnishing", Icon: FormatPainterOutlined, getValue: (p) => capitalize(p.furnishing || "—") },
  { key: "type",       label: "Unit Type",  Icon: ProfileOutlined,       getValue: (p) => capitalize(p.unitType || "—") },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function SecondaryPropertyDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [property, setProperty]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [activeImg, setActiveImg]   = useState(0);
  const [lightbox, setLightbox]     = useState(false);
  const galleryRef = useRef(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res  = await apiService.get(`/properties/agent/property/secondary/${id}`);
        const data = res?.data?.data || res?.data || res;
        if (data && typeof data === "object" && (data._id || data.id || data.propertyName)) {
          setProperty(data);
        } else {
          message.error("Property data is empty.");
        }
      } catch (err) {
        console.error("Detail fetch error:", err);
        message.error(err?.response?.data?.message || "Failed to load property details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div style={S.loaderWrap}>
        <Spin size="large" />
        <p style={{ color: "#64748b", marginTop: 16, fontSize: 16, fontWeight: 500 }}>Fetching details…</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={S.loaderWrap}>
        <p style={{ color: "#64748b", fontSize: 18, fontWeight: 500 }}>Property not found.</p>
        <button style={{ ...S.backBtn, marginTop: 16 }} onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> Go Back
        </button>
      </div>
    );
  }

  const p         = property;
  const allPhotos = getAllPhotos(p.photos);
  const coverImg  = allPhotos[0]?.url || p.mainLogo 
    || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200";

  return (
    <div style={S.page}>
      {/* ── TOP NAV ── */}
      <div style={S.topNav}>
        <div style={S.navInner}>
          <button style={S.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeftOutlined style={{ marginRight: 6 }} /> Back
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            {p.isFeatured && (
              <span style={{ ...S.badge, background: "#FEF3C7", color: "#B45309", border: "1px solid #FDE68A" }}>
                <StarFilled style={{ marginRight: 4, fontSize: 12 }} /> Featured
              </span>
            )}
            {p.ownershipType && (
              <span style={{ ...S.badge, background: "#F3E8FF", color: "#6B21A8", border: "1px solid #E9D5FF" }}>
                {p.ownershipType}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={S.container}>
        {/* ── HERO GALLERY ── */}
        <div style={S.heroSection}>
          <div style={S.mainImageWrap} onClick={() => setLightbox(true)}>
            <img
              src={allPhotos[activeImg]?.url || coverImg}
              alt={p.propertyName}
              style={S.mainImage}
            />
            <div style={S.imageOverlay}></div>
            <div style={S.expandHint}>
              <ExpandOutlined style={{ marginRight: 6 }} /> View Gallery
              {allPhotos.length > 0 && <span style={S.photoCount}>{allPhotos.length}</span>}
            </div>
            {allPhotos[activeImg]?.group && (
              <span style={S.groupTag}>{allPhotos[activeImg].group}</span>
            )}
          </div>

          {allPhotos.length > 1 && (
            <div style={S.thumbStrip} ref={galleryRef}>
              {allPhotos.map((img, i) => (
                <div
                  key={i}
                  style={{
                    ...S.thumb,
                    borderColor: activeImg === i ? PURPLE : "transparent",
                    opacity: activeImg === i ? 1 : 0.6,
                  }}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img.url} alt="" style={S.thumbImg} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── LIGHTBOX ── */}
        {lightbox && (
          <div style={S.lightboxOverlay} onClick={() => setLightbox(false)}>
            <div style={S.lightboxBox} onClick={(e) => e.stopPropagation()}>
              <button style={S.lightboxClose} onClick={() => setLightbox(false)}>
                <CloseOutlined />
              </button>
              <img src={allPhotos[activeImg]?.url || coverImg} alt="" style={S.lightboxImg} />
              <div style={S.lightboxNav}>
                <button
                  style={S.lightboxArrow}
                  onClick={() => setActiveImg((prev) => (prev - 1 + allPhotos.length) % allPhotos.length)}
                >
                  <LeftOutlined />
                </button>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 500, letterSpacing: 1 }}>
                  {activeImg + 1} / {allPhotos.length}
                </span>
                <button
                  style={S.lightboxArrow}
                  onClick={() => setActiveImg((prev) => (prev + 1) % allPhotos.length)}
                >
                  <RightOutlined />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── BODY ── */}
        <div style={S.body}>
          {/* ── LEFT COL ── */}
          <div style={S.leftCol}>
            {/* Title block */}
<div style={S.headerBlock}>
  {(p.developer || p.developerName) ? (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
      <div style={S.devAvatar}>
        {p.developer?.logo
          ? <img src={p.developer.logo} alt="dev" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ color: "#fff", fontWeight: 700, fontSize: 20 }}>{(p.developerName).charAt(0)}</span>
        }
      </div>
      <div>
        {p.developerName && <p style={S.devName}>{p.developerName}</p>}
        <p style={S.projectLabel}>Secondary Property</p>
      </div>
    </div>
  ) : (
    <p style={{ ...S.projectLabel, marginBottom: 12 }}>Secondary Property</p>
  )}
  <h1 style={S.propertyTitle}>{p.propertyName}</h1>
              <p style={S.locationLine}>
                <EnvironmentOutlined style={{ marginRight: 6, color: PURPLE }} />
                {[p.area, p.city, p.country].filter(Boolean).join(", ")}
              </p>
            </div>

            <Divider style={{ margin: "32px 0", borderColor: "#E2E8F0" }} />

{/* ── STATS GRID ── */}
<div style={S.statsGrid}>
  {STAT_DEFS.map(({ key, label, Icon, getValue }) => (
    <div key={key} style={S.statCard}>
      <div style={S.statIconWrap}>
        <Icon style={{ fontSize: 20, color: PURPLE }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
        <span style={S.statValue}>{getValue(p)}</span>
        <span style={S.statLabel}>{label}</span>
      </div>
    </div>
  ))}
</div>

            <Divider style={{ margin: "32px 0", borderColor: "#E2E8F0" }} />

            {/* Description */}
            {p.description && (
              <div style={S.section}>
                <h3 style={S.sectionTitle}>About this property</h3>
                <p style={S.description}>{p.description}</p>
              </div>
            )}

            {/* Amenities */}
            {p.amenities?.length > 0 && (
              <div style={S.section}>
                <h3 style={S.sectionTitle}>Amenities</h3>
                <div style={S.amenitiesGrid}>
                  {p.amenities.map((a) => (
                    <div key={a} style={S.amenityItem}>
                      <div style={S.checkWrap}><CheckCircleFilled style={{ color: "#10B981" }} /></div>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities */}
            {p.facilities && Object.values(p.facilities).some(Boolean) && (
              <div style={S.section}>
                <h3 style={S.sectionTitle}>Facilities</h3>
                <div style={S.amenitiesGrid}>
                  {Object.entries(p.facilities)
                    .filter(([, v]) => v)
                    .map(([k]) => (
                      <div key={k} style={S.amenityItem}>
                        <div style={S.checkWrap}><CheckCircleFilled style={{ color: PURPLE }} /></div>
                        <span>{facilityLabel(k)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Views */}
            {p.hasView && p.viewType?.length > 0 && (
              <div style={S.section}>
                <h3 style={S.sectionTitle}>Views</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {p.viewType.map((v) => (
                    <Tag key={v} color="blue" style={S.viewTag}>
                      {capitalize(v)} View
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Photo groups */}
            {Object.entries(p.photos || {}).map(([group, urls]) =>
              urls?.length > 0 ? (
                <div key={group} style={S.section}>
                  <h3 style={S.sectionTitle}>{capitalize(group)} Photos</h3>
                  <div style={S.photoGroupGrid}>
                    {urls.map((url, i) => (
                      <div
                        key={i}
                        style={S.photoGroupThumb}
                        onClick={() => {
                          const idx = allPhotos.findIndex((ph) => ph.url === url);
                          setActiveImg(idx >= 0 ? idx : 0);
                          setLightbox(true);
                        }}
                      >
                        <img src={url} alt="" style={S.thumbImg} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>

          {/* ── RIGHT COL — sticky price card ── */}
          <div style={S.rightCol}>
            <div style={S.priceCard}>
              <div style={S.priceHeader}>
                <p style={S.priceLabel}>Asking Price</p>
                <h2 style={S.priceValue}>
                  {fmt(p.price)} <span style={S.priceCurrency}>{p.currency || "AED"}</span>
                </h2>
              </div>

              {p.shareCommission && (
                <div style={S.commissionBadge}>
                  <span style={S.commissionDot}></span>
                  Commission: {p.shareCommissionPercentage}%
                </div>
              )}

              <div style={S.detailList}>
                <DetailRow icon={<CalendarOutlined />} label="Available From"  value={formatDate(p.availableFrom)} />
                <DetailRow icon={<HomeOutlined />}      label="Bedroom Type"   value={p.bedroomType || "—"} />
                <DetailRow icon={<BankOutlined />}      label="Ownership"      value={capitalize(p.ownershipType || "—")} />
                <DetailRow icon={<CarOutlined />}       label="Parking Spaces" value={p.parkingSpaces ?? "—"} />
                {p.reraNumber && (
                  <DetailRow icon={<GlobalOutlined />}  label="RERA No."       value={p.reraNumber} />
                )}
              </div>

              <div style={S.actionButtons}>
                {p.websiteUrl && (
                  <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" style={S.btnPrimary}>
                    <LinkOutlined /> Visit Website
                  </a>
                )}
                <div style={{ display: 'flex', gap: 12 }}>
                  {p.brochure && (
                    <a href={p.brochure} target="_blank" rel="noopener noreferrer" style={S.btnSecondary}>
                      <FileOutlined /> Brochure
                    </a>
                  )}
                  {p.videoUrl && (
                    <a href={p.videoUrl} target="_blank" rel="noopener noreferrer" style={S.btnSecondary}>
                      <VideoCameraOutlined /> Video Tour
                    </a>
                  )}
                </div>
              </div>

              <p style={S.contactPrompt}>
                {p.showContactOnlyVerified
                  ? "🔒 Contact available for verified agents only."
                  : "Reach out to the developer for more info."}
              </p>
            </div>

            {p.coordinates?.lat && p.coordinates?.lng && (
              <div style={S.mapCard}>
                <div style={S.mapHeader}>
                  <EnvironmentOutlined style={{ color: PURPLE, fontSize: 18 }} />
                  <h4 style={S.mapTitle}>Location Pin</h4>
                </div>
                <div style={S.mapCoordsBox}>
                  <span>Lat: {p.coordinates.lat}</span>
                  <span>Lng: {p.coordinates.lng}</span>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${p.coordinates.lat},${p.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={S.mapLinkBtn}
                >
                  Open in Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const DetailRow = ({ icon, label, value }) => (
  <div style={S.detailRow}>
    <div style={S.detailIconBg}>{icon}</div>
    <span style={S.detailLabel}>{label}</span>
    <span style={S.detailValue}>{value}</span>
  </div>
);

// ─── Pure helpers ─────────────────────────────────────────────────────────────
const capitalize = (str = "") => str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, " ");

const facilityLabel = (key) => ({
  swimmingPool: "Swimming Pool",
  gym: "Gym",
  parking: "Parking",
  childrenPlayArea: "Children's Play Area",
  gardens: "Gardens",
  security: "24/7 Security",
  concierge: "Concierge",
}[key] || capitalize(key));

// ─── Styles ───────────────────────────────────────────────────────────────────
const PURPLE = "#6366F1"; // Switched to a more modern Indigo/Purple (Tailwind Indigo-500)

const S = {
  page: { 
    background: "#F8FAFC", 
    minHeight: "100vh", 
    fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    color: "#0F172A"
  },
  loaderWrap: { 
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" 
  },
  container: { 
    maxWidth: 1280, margin: "0 auto", padding: "24px", boxSizing: "border-box" 
  },

  // Nav
  topNav: {
    background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(12px)",
    borderBottom: "1px solid #E2E8F0", position: "sticky", top: 0, zIndex: 100,
  },
  navInner: {
    maxWidth: 1280, margin: "0 auto", padding: "16px 24px",
    display: "flex", alignItems: "center", justifyContent: "space-between"
  },
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 4,
    background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8,
    padding: "8px 16px", cursor: "pointer", fontSize: 14,
    color: "#475569", fontWeight: 600, transition: "all 0.2s",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
  },
  badge: {
    display: "inline-flex", alignItems: "center", padding: "6px 12px", 
    borderRadius: 20, fontSize: 13, fontWeight: 600,
  },

  // Hero
  heroSection: { marginBottom: 32 },
  mainImageWrap: {
    position: "relative", cursor: "pointer", overflow: "hidden",
    height: "clamp(300px, 50vw, 560px)", borderRadius: 24,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
  },
  mainImage: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  imageOverlay: {
    position: "absolute", inset: 0, 
    background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%)", pointerEvents: "none"
  },
  expandHint: {
    position: "absolute", bottom: 20, right: 20,
    background: "rgba(255,255,255,0.9)", color: "#0F172A",
    padding: "10px 18px", borderRadius: 12, fontSize: 14, fontWeight: 600,
    display: "flex", alignItems: "center", backdropFilter: "blur(8px)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", transition: "transform 0.2s"
  },
  photoCount: {
    marginLeft: 8, background: "#E2E8F0", color: "#334155",
    padding: "2px 8px", borderRadius: 6, fontSize: 12,
  },
  groupTag: {
    position: "absolute", top: 20, left: 20,
    background: "rgba(15, 23, 42, 0.7)", color: "#fff",
    padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
    textTransform: "capitalize", backdropFilter: "blur(4px)",
  },
  thumbStrip: {
    display: "flex", gap: 12, overflowX: "auto",
    padding: "16px 4px", scrollbarWidth: "none",
  },
  thumb: {
    width: 100, height: 70, borderRadius: 12, overflow: "hidden",
    cursor: "pointer", flexShrink: 0, transition: "all 0.2s ease-in-out",
    border: "2px solid transparent"
  },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },

  // Lightbox
  lightboxOverlay: {
    position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.95)",
    zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(8px)"
  },
  lightboxBox: {
    position: "relative", width: "100%", height: "100%",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  },
  lightboxClose: {
    position: "absolute", top: 24, right: 24,
    background: "rgba(255,255,255,0.1)", border: "none", color: "#fff",
    fontSize: 20, width: 44, height: 44, borderRadius: "50%",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background 0.2s"
  },
  lightboxImg: { maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain" },
  lightboxNav: { display: "flex", alignItems: "center", gap: 32, marginTop: 24 },
  lightboxArrow: {
    background: "rgba(255,255,255,0.15)", border: "none", color: "#fff",
    fontSize: 20, width: 48, height: 48, borderRadius: "50%",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  },

  // Body Layout
  body: { display: "flex", gap: 40, flexWrap: "wrap" },
  leftCol:  { flex: "1 1 65%", minWidth: 320 },
  rightCol: { flex: "1 1 30%", minWidth: 320 },

  // Header Details
  headerBlock: { paddingRight: 16 },
  devAvatar: {
    width: 56, height: 56, borderRadius: 14, background: PURPLE, overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.3)"
  },
  devName:      { margin: 0, fontSize: 15, fontWeight: 700, color: "#334155" },
  projectLabel: { margin: 0, fontSize: 13, color: "#64748B", fontWeight: 500, letterSpacing: "0.5px" },
  propertyTitle: {
    fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 800,
    color: "#0F172A", margin: "0 0 12px 0", lineHeight: 1.1, letterSpacing: "-0.5px"
  },
  locationLine: { color: "#475569", fontSize: 16, display: "flex", alignItems: "center", margin: 0, fontWeight: 500 },

  // Stats Grid
statsGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: 16,
},
statCard: {
  background: "#fff",
  borderRadius: 16,
  padding: "16px",
  display: "flex",
  alignItems: "flex-start",   // ✅ was "center" — now text won't overflow
  gap: 12,
  border: "1px solid #E2E8F0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  minWidth: 0,                 // ✅ critical for grid overflow fix
},
statIconWrap: {
  width: 44,
  height: 44,
  borderRadius: 12,
  background: "#EEF2FF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,               // ✅ icon never shrinks
},
statValue: {
  fontSize: 15,
  fontWeight: 700,
  color: "#0F172A",
  lineHeight: 1.3,
  textTransform: "capitalize",
  wordBreak: "break-word",     // ✅ no more cutoff
  whiteSpace: "normal",        // ✅ allow wrapping
},
statLabel: {
  fontSize: 12,
  color: "#64748B",
  marginTop: 3,
  fontWeight: 500,
},

  // Sections
  section: { marginBottom: 40 },
  sectionTitle: { fontSize: 20, fontWeight: 700, color: "#0F172A", marginBottom: 16, marginTop: 0 },
  description:  { color: "#334155", lineHeight: 1.8, fontSize: 16, margin: 0 },

  // Amenities
  amenitiesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 },
  amenityItem: {
    display: "flex", alignItems: "center", gap: 12,
    background: "#fff", borderRadius: 12, padding: "12px 16px",
    border: "1px solid #E2E8F0", color: "#334155", fontSize: 15, fontWeight: 500,
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
  },
  checkWrap: { display: "flex", alignItems: "center", fontSize: 16 },

  // Views
  viewTag: { borderRadius: 8, padding: "6px 14px", fontSize: 14, fontWeight: 500, border: "none", background: "#DBEAFE", color: "#1D4ED8" },

  // Photo Groups
  photoGroupGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 },
  photoGroupThumb: {
    height: 100, borderRadius: 12, overflow: "hidden", cursor: "pointer",
    border: "1px solid #E2E8F0", transition: "transform 0.2s",
  },

  // Price Card (Sticky)
  priceCard: {
    background: "#fff", borderRadius: 24, padding: 28,
    border: "1px solid #E2E8F0", 
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
    position: "sticky", top: 100, marginBottom: 24,
  },
  priceHeader: { marginBottom: 16 },
  priceLabel:  { fontSize: 13, color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, margin: "0 0 4px 0" },
  priceValue:  { fontSize: 32, fontWeight: 800, color: "#0F172A", margin: 0, lineHeight: 1.1 },
  priceCurrency: { fontSize: 18, fontWeight: 600, color: "#475569" },
  commissionBadge: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "#ECFDF5", color: "#047857", 
    borderRadius: 8, padding: "6px 12px", fontSize: 14, fontWeight: 600,
  },
  commissionDot: { width: 6, height: 6, borderRadius: "50%", background: "#10B981" },

  // Detail List in Price Card
  detailList: { marginTop: 24, display: "flex", flexDirection: "column", gap: 14 },
  detailRow:  { display: "flex", alignItems: "center", gap: 12 },
  detailIconBg: {
    width: 32, height: 32, borderRadius: 8, background: "#F1F5F9",
    display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", fontSize: 14
  },
  detailLabel: { fontSize: 14, color: "#475569", flex: 1, fontWeight: 500 },
  detailValue: { fontSize: 14, fontWeight: 600, color: "#0F172A", textTransform: "capitalize" },

  // Buttons
  actionButtons: { marginTop: 32, display: "flex", flexDirection: "column", gap: 12 },
  btnPrimary: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    background: PURPLE, color: "#fff", padding: "14px", borderRadius: 12,
    fontWeight: 600, fontSize: 15, textDecoration: "none", transition: "background 0.2s",
    boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.3)"
  },
  btnSecondary: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    background: "#F8FAFC", color: "#334155", padding: "12px", borderRadius: 12,
    fontWeight: 600, fontSize: 14, textDecoration: "none", border: "1px solid #E2E8F0",
  },
  contactPrompt: { marginTop: 20, fontSize: 13, color: "#64748B", textAlign: "center", fontWeight: 500 },

  // Map Card
  mapCard: { 
    background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
  },
  mapHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 },
  mapTitle:  { fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 },
  mapCoordsBox: { 
    background: "#F8FAFC", padding: "10px 14px", borderRadius: 8, 
    display: "flex", flexDirection: "column", gap: 4, marginBottom: 16,
    fontSize: 13, color: "#475569", fontFamily: "monospace" 
  },
  mapLinkBtn: { 
    display: "block", textAlign: "center", background: "#EEF2FF", color: PURPLE, 
    padding: "10px", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" 
  },
};