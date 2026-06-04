import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const STATIC_LISTINGS = [
  {
    _id: "buy001",
    title: "Luxurious 2BR Apartment | Sea View | Furnished",
    emirate: "Dubai",
    location: { area: "Dubai Marina" },
    price: 2200000,
    size: 1420,
    bhk: "2 BR",
    baths: 2,
    furnishing: "Furnished",
    verified: true,
    paymentPlan: true,
    offPlan: false,
    secondaryPlans: false,
    isReady: true,
    completion: "Ready",
    roi: 6.8,
    developer: "Emaar",
    serviceCharge: 28000,
    amenities: ["Pool", "Gym", "Parking", "Sea View", "Balcony"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80",
    ],
  },
  {
    _id: "buy002",
    title: "Stunning 4BR Villa | Private Pool | Smart Home",
    emirate: "Dubai",
    location: { area: "Palm Jumeirah" },
    price: 9500000,
    size: 5800,
    bhk: "4 BR",
    baths: 5,
    furnishing: "Unfurnished",
    verified: true,
    paymentPlan: false,
    offPlan: false,
    isReady: true,
    completion: "Ready",
    roi: 5.2,
    developer: "Nakheel",
    serviceCharge: 95000,
    amenities: ["Pool", "Gym", "Parking", "Sea View", "Maid's Room"],
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
    ],
  },
  {
    _id: "buy003",
    title: "Off-Plan 1BR | High ROI | Handover Q4 2026",
    emirate: "Dubai",
    location: { area: "Business Bay" },
    price: 980000,
    size: 780,
    bhk: "1 BR",
    baths: 1,
    furnishing: "Semi Furnished",
    verified: true,
    paymentPlan: true,
    offPlan: false,
    secondaryPlans: true,
    isReady: false,
    completion: "Q4 2026",
    roi: 8.5,
    developer: "Damac",
    serviceCharge: 14000,
    paymentPlanDetails: "60/40 — 60% during construction, 40% on handover",
    amenities: ["Pool", "Gym", "Parking", "Near Metro"],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    ],
  },
  {
    _id: "buy004",
    title: "Penthouse 3BR | Burj Khalifa View | Ultra Luxury",
    emirate: "Dubai",
    location: { area: "Downtown Dubai" },
    price: 7800000,
    size: 3200,
    bhk: "3 BR",
    baths: 4,
    furnishing: "Furnished",
    verified: true,
    paymentPlan: false,
    offPlan: false,
    isReady: true,
    completion: "Ready",
    roi: 5.9,
    developer: "Emaar",
    serviceCharge: 85000,
    amenities: ["Pool", "Gym", "Parking", "Sea View", "Balcony", "Maid's Room"],
    images: [
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&q=80",
    ],
  },
  {
    _id: "buy005",
    title: "Studio Apartment | Metro Access | Payment Plan",
    emirate: "Dubai",
    location: { area: "JVC" },
    price: 520000,
    size: 420,
    bhk: "Studio",
    baths: 1,
    furnishing: "Furnished",
    verified: false,
    paymentPlan: true,
    offPlan: false,
    isReady: true,
    completion: "Ready",
    roi: 7.2,
    developer: "Azizi",
    serviceCharge: 8500,
    paymentPlanDetails: "5% Down | 1% Monthly | No Interest",
    amenities: ["Gym", "Parking", "Near Metro", "Pool"],
    images: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&q=80",
      "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=600&q=80",
    ],
  },
  {
    _id: "buy006",
    title: "Spacious Townhouse 3BR | Community Living | Garden",
    emirate: "Dubai",
    location: { area: "Al Barsha" },
    price: 3100000,
    size: 2800,
    bhk: "3 BR",
    baths: 3,
    furnishing: "Unfurnished",
    verified: true,
    paymentPlan: false,
    offPlan: false,
    isReady: true,
    completion: "Ready",
    roi: 4.8,
    developer: "Meraas",
    serviceCharge: 32000,
    amenities: ["Parking", "Kids Play Area", "Pool", "Gym"],
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
    ],
  },
];

const BEDROOMS        = ["Any", "Studio", "1 BR", "2 BR", "3 BR", "4 BR", "5+ BR"];
const PROP_TYPES      = ["All", "Apartment", "Villa", "Penthouse", "Townhouse"];
const AMENITY_LIST    = ["Pool", "Gym", "Parking", "Sea View", "Balcony", "Near Metro", "Payment Plan", "Mortgage Ready"];
const COMPLETION_OPTS = ["Any", "Ready", "Off-Plan", "Under Construction"];

// ─── LIGHTBOX ────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length);
      if (e.key === "ArrowLeft")  setCurrent((c) => (c - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div onClick={onClose} className="bp-lightbox-overlay">
      <button onClick={onClose} className="bp-lightbox-close">✕</button>
      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600 }}>{current + 1} / {images.length}</div>
      <div onClick={(e) => e.stopPropagation()} className="bp-lightbox-inner">
        <button onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)} className="bp-lightbox-nav">‹</button>
        <img src={images[current]} alt="" className="bp-lightbox-img" />
        <button onClick={() => setCurrent((c) => (c + 1) % images.length)} className="bp-lightbox-nav">›</button>
      </div>
      <div className="bp-lightbox-thumbs">
        {images.map((img, i) => (
          <img key={i} src={img} alt="" onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
            className={`bp-thumb${i === current ? " active" : ""}`} />
        ))}
      </div>
    </div>
  );
}

// ─── IMAGE GRID ───────────────────────────────────────────────────────────────
function ImageGrid({ images, onOpen }) {
  const imgs = images?.length ? images : ["https://placehold.co/600x400/ede9fe/7c3aed?text=No+Image"];
  return (
    <div className="bp-img-grid-wrap">
      <div className="bp-img-grid">
        <div className="bp-img-main" onClick={() => onOpen(0)}>
          <img src={imgs[0]} alt="" className="bp-img" />
        </div>
        <div className="bp-img-sub" onClick={() => onOpen(1)}>
          <img src={imgs[1] || imgs[0]} alt="" className="bp-img" />
        </div>
        <div className="bp-img-sub bp-img-last" onClick={() => onOpen(2)}>
          <img src={imgs[2] || imgs[0]} alt="" className="bp-img" />
          {imgs.length > 3 && <div className="bp-img-more">+{imgs.length - 3} photos</div>}
        </div>
      </div>
    </div>
  );
}

// ─── LISTING CARD ─────────────────────────────────────────────────────────────
function ListingCard({ listing, saved, onSave }) {
  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);
  const [expanded,      setExpanded]      = useState(false);
  const [contacted,     setContacted]     = useState(false);

  const openLightbox = (idx) => { setLightboxStart(idx); setLightboxOpen(true); };
  const isReady = listing.isReady || listing.completion === "Ready";

  return (
    <>
      {lightboxOpen && <Lightbox images={listing.images || []} startIndex={lightboxStart} onClose={() => setLightboxOpen(false)} />}

      <div className="bp-card">
        <div className="bp-card-inner">

          {/* Image column */}
          <div className="bp-card-img-col">
            <ImageGrid images={listing.images} onOpen={openLightbox} />
            <div className="bp-card-badges">
              {listing.verified    && <div className="bp-badge bp-badge-verified">✦ Verified</div>}
              {listing.paymentPlan && <div className="bp-badge bp-badge-plan">💳 Payment Plan</div>}
            </div>
            <button onClick={() => onSave(listing._id)} className={`bp-save-btn${saved ? " saved" : ""}`}>
              {saved ? "♥" : "♡"}
            </button>
          </div>

          {/* Content column */}
          <div className="bp-card-content">

            {/* Title row */}
            <div className="bp-title-row">
              <div className="bp-title-block">
                <h3 className="bp-title">{listing.title}</h3>
                <div className="bp-location">
                  <span style={{ color: "#a78bfa" }}>⌖</span>
                  {listing.location?.area && `${listing.location.area}, `}{listing.emirate}
                </div>
              </div>
              <div className="bp-price-block">
                <div className="bp-price">AED {(listing.price || 0).toLocaleString()}</div>
                <div className="bp-price-label">total price</div>
              </div>
            </div>

            {/* Stats */}
            <div className="bp-stats">
              {[
                { icon: "⬛", label: (listing.size || "—") + " sqft" },
                { icon: "🛏", label: listing.bhk || "—" },
                { icon: "🚿", label: (listing.baths || "—") + " Bath" },
                { icon: "✦",  label: (listing.furnishing || "—").split(" ")[0] },
              ].map((s, i) => (
                <div key={i} className="bp-stat">
                  <span>{s.icon}</span><span>{s.label}</span>
                  {i < 3 && <span className="bp-stat-dot">·</span>}
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="bp-tags">
              {listing.completion && (
                <span className={`bp-tag bp-tag-completion${isReady ? " ready" : ""}`}>
                  {isReady ? "✓ Ready" : "🏗 " + listing.completion}
                </span>
              )}
              {listing.roi && (
                <span className="bp-tag bp-tag-roi">📈 ROI: {listing.roi}%</span>
              )}
              {listing.developer && (
                <span className="bp-tag bp-tag-dev">🏢 {listing.developer}</span>
              )}
            </div>

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <div className="bp-amenities">
                {listing.amenities.map((a) => <span key={a} className="bp-amenity">{a}</span>)}
              </div>
            )}

            <div className="bp-divider" />

            {/* Actions */}
            <div className="bp-actions">
              <button onClick={() => setExpanded(!expanded)} className="bp-details-btn">
                {expanded ? "▲ Less" : "▼ Details"}
              </button>
              <button onClick={() => setContacted(true)} className={`bp-enquire-btn${contacted ? " done" : ""}`}>
                {contacted ? <><span>✓</span> Interest Sent</> : <><span>📞</span> Enquire</>}
              </button>
            </div>

            {/* Expanded */}
            {expanded && (
              <div className="bp-expanded">
                <div className="bp-expanded-grid">
                  {[
                    { label: "Price",          value: `AED ${(listing.price || 0).toLocaleString()}` },
                    { label: "Service Charge", value: listing.serviceCharge ? `AED ${listing.serviceCharge.toLocaleString()}/yr` : "—" },
                    { label: "Property Type",  value: listing.type || "Apartment" },
                    { label: "Floor Size",     value: `${listing.size || "—"} sqft` },
                    { label: "Completion",     value: listing.completion || "—" },
                    { label: "Developer",      value: listing.developer || "—" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="bp-exp-label">{item.label}</div>
                      <div className="bp-exp-value">{item.value}</div>
                    </div>
                  ))}
                </div>
                {listing.paymentPlanDetails && (
                  <div className="bp-plan-detail">💳 Payment Plan: {listing.paymentPlanDetails}</div>
                )}
                <button onClick={() => openLightbox(0)} className="bp-view-photos">
                  ⊞ View All Photos ({(listing.images || []).length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── FILTER CONTENT ───────────────────────────────────────────────────────────
function FilterContent({ filterBeds, setFilterBeds, maxPrice, setMaxPrice, filterType, setFilterType, filterCompletion, setFilterCompletion, verifiedOnly, setVerifiedOnly, paymentPlanOnly, setPaymentPlanOnly, amenityFilters, toggleAmenity, resetFilters, setPage }) {
  return (
    <div>
      <div className="bp-filter-hd">
        <span className="bp-filter-title">Filters</span>
        <span onClick={resetFilters} className="bp-filter-reset">Reset all</span>
      </div>

      <div className="bp-filter-sec">
        <div className="bp-filter-label">Bedrooms</div>
        <div className="bp-beds-grid">
          {BEDROOMS.map((b) => (
            <button key={b} onClick={() => { setFilterBeds(b); setPage(1); }} className={`pill${filterBeds === b ? " on" : ""}`}>{b}</button>
          ))}
        </div>
      </div>

      <div className="bp-filter-sec">
        <div className="bp-filter-label">Max Price</div>
        <div className="bp-price-display">AED {maxPrice >= 10000000 ? "10M+" : (maxPrice / 1000000).toFixed(1) + "M"}</div>
        <input type="range" min={500000} max={10000000} step={100000} value={maxPrice}
          onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }} />
        <div className="bp-range-bounds"><span>AED 500K</span><span>AED 10M+</span></div>
      </div>

      <div className="bp-filter-sec">
        <div className="bp-filter-label">Property Type</div>
        <div className="bp-radio-group">
          {PROP_TYPES.map((t) => (
            <label key={t} className="bp-radio-label">
              <input type="radio" name="ptype" className="chk" checked={filterType === t} onChange={() => { setFilterType(t); setPage(1); }} />{t}
            </label>
          ))}
        </div>
      </div>

      <div className="bp-filter-sec">
        <div className="bp-filter-label">Completion</div>
        <div className="bp-radio-group">
          {COMPLETION_OPTS.map((c) => (
            <label key={c} className="bp-radio-label">
              <input type="radio" name="completion" className="chk" checked={filterCompletion === c} onChange={() => { setFilterCompletion(c); setPage(1); }} />{c}
            </label>
          ))}
        </div>
      </div>

      <div className="bp-filter-sec">
        <div className="bp-filter-label" style={{ marginBottom: 2 }}>Quick Filters</div>
        {[
          { label: "Verified Only", val: verifiedOnly,    set: setVerifiedOnly    },
          { label: "Payment Plan",  val: paymentPlanOnly, set: setPaymentPlanOnly },
        ].map((item, i) => (
          <label key={i} className="bp-checkbox-label">
            <input type="checkbox" className="chk" checked={item.val} onChange={(e) => { item.set(e.target.checked); setPage(1); }} />{item.label}
          </label>
        ))}
      </div>

      <div className="bp-filter-sec" style={{ marginBottom: 0 }}>
        <div className="bp-filter-label">Amenities</div>
        <div className="bp-amenity-pills">
          {AMENITY_LIST.map((a) => (
            <button key={a} onClick={() => { toggleAmenity(a); setPage(1); }} className={`pill${amenityFilters.includes(a) ? " on" : ""}`}>{a}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── RIGHT SIDEBAR ────────────────────────────────────────────────────────────
function SidebarContent({ savedIds, navigate }) {
  return (
    <div className="bp-sidebar-right">
      <div className={`bp-saved-widget${savedIds.length ? " has-saved" : ""}`}>
        <div className="bp-saved-title">♥ Saved Properties</div>
        {savedIds.length === 0
          ? <div className="bp-saved-empty">Click the heart to shortlist properties.</div>
          : <div className="bp-saved-count">{savedIds.length} <span className="bp-saved-label">shortlisted</span></div>}
      </div>

      <div className="bp-dld-widget">
        <div style={{ fontSize: 28, marginBottom: 10 }}>🏛</div>
        <div className="bp-dld-title">DLD Transfer</div>
        <div className="bp-dld-desc">Dubai Land Department approved. Fast title deed transfer.</div>
        <button className="bp-dld-btn">Get Transfer Help</button>
      </div>

      <div className="bp-mortgage-widget">
        <div style={{ fontSize: 28, marginBottom: 8 }}>🏦</div>
        <div className="bp-mortgage-title">Mortgage Calculator</div>
        <div className="bp-mortgage-desc">Find out your monthly payments &amp; eligibility in seconds.</div>
        <button onClick={() => navigate("/mortgages/calculator")} className="bp-mortgage-btn">Calculate Now</button>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function BuyResultsPage() {
  const location = useLocation();
  const navigate  = useNavigate();

  const [sort,             setSort]             = useState("Recommended");
  const [savedIds,         setSavedIds]         = useState([]);
  const [filterBeds,       setFilterBeds]       = useState("Any");
  const [filterType,       setFilterType]       = useState("All");
  const [maxPrice,         setMaxPrice]         = useState(10000000);
  const [filterCompletion, setFilterCompletion] = useState("Any");
  const [amenityFilters,   setAmenityFilters]   = useState([]);
  const [verifiedOnly,     setVerifiedOnly]     = useState(false);
  const [paymentPlanOnly,  setPaymentPlanOnly]  = useState(false);
  const [page,             setPage]             = useState(1);
  const [filterOpen,       setFilterOpen]       = useState(false);
  const [screenSize,       setScreenSize]       = useState("desktop");

  const LIMIT = 4;

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setScreenSize(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isMobile  = screenSize === "mobile";
  const isTablet  = screenSize === "tablet";
  const isDesktop = screenSize === "desktop";

  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e) => {
      if (!e.target.closest("#bp-filter-drawer") && !e.target.closest("#bp-filter-toggle")) setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  const heroState    = location.state || {};
  const emirateLabel = heroState.emirate || "UAE";
  const areaLabel    = heroState.tags?.join(", ") || "";

  const filtered = STATIC_LISTINGS.filter((l) => {
    if (filterBeds !== "Any" && l.bhk !== filterBeds) return false;
    if (filterType !== "All" && !l.title.toLowerCase().includes(filterType.toLowerCase())) return false;
    if (l.price > maxPrice) return false;
    if (filterCompletion !== "Any") {
      if (filterCompletion === "Ready"              && !l.isReady)  return false;
      if (filterCompletion === "Off-Plan"           && !l.offPlan)  return false;
      if (filterCompletion === "Under Construction" &&  l.isReady)  return false;
    }
    if (verifiedOnly    && !l.verified)    return false;
    if (paymentPlanOnly && !l.paymentPlan) return false;
    if (amenityFilters.length > 0 && !amenityFilters.every((a) => l.amenities.includes(a))) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "Price: Low to High") return a.price - b.price;
    if (sort === "Price: High to Low") return b.price - a.price;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / LIMIT);
  const paginated  = sorted.slice((page - 1) * LIMIT, page * LIMIT);

  const toggleSave    = (id) => setSavedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAmenity = (a)  => setAmenityFilters((p) => p.includes(a) ? p.filter((x) => x !== a) : [...p, a]);

  const resetFilters = () => {
    setFilterBeds("Any"); setFilterType("All"); setMaxPrice(10000000);
    setAmenityFilters([]); setVerifiedOnly(false); setPaymentPlanOnly(false);
    setFilterCompletion("Any"); setPage(1);
  };

  const filterProps = {
    filterBeds, setFilterBeds, maxPrice, setMaxPrice,
    filterType, setFilterType, filterCompletion, setFilterCompletion,
    verifiedOnly, setVerifiedOnly, paymentPlanOnly, setPaymentPlanOnly,
    amenityFilters, toggleAmenity, resetFilters, setPage,
  };

  const activeFilterCount = [
    filterBeds !== "Any", filterType !== "All", maxPrice < 10000000,
    filterCompletion !== "Any", verifiedOnly, paymentPlanOnly, amenityFilters.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="bp-root">
      <style>{`
        /* ── Base ── */
        .bp-root { background: #f7f6fb; min-height: 100vh; font-family: system-ui, sans-serif; }

        /* ── Layout grid ── */
        .bp-layout { display: grid; max-width: 1400px; margin: 0 auto; box-sizing: border-box; gap: 20px; }
        .bp-layout.desktop { grid-template-columns: 256px 1fr 272px; padding: 24px; }
        .bp-layout.tablet  { grid-template-columns: 1fr; padding: 16px; }
        .bp-layout.mobile  { grid-template-columns: 1fr; padding: 12px; gap: 14px; }

        /* ── Desktop filter panel ── */
        .bp-filter-panel { background: white; border: 1.5px solid #f0f0f0; border-radius: 18px; padding: 20px; max-height: calc(100vh - 96px); position: sticky; top: 82px; overflow-y: auto; }

        /* ── Drawer (mobile + tablet) ── */
        .bp-drawer-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 998; }
        .bp-drawer { position: fixed; top: 0; left: 0; bottom: 0; width: min(85vw, 340px); background: white; z-index: 999; padding: 20px; overflow-y: auto; box-sizing: border-box; transition: transform 0.3s ease, opacity 0.3s ease; }
        .bp-drawer.open   { transform: translateX(0);    opacity: 1; box-shadow: 4px 0 24px rgba(0,0,0,0.15); }
        .bp-drawer.closed { transform: translateX(-100%); opacity: 0; }
        .bp-drawer-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .bp-drawer-close { background: #f1f5f9; border: none; border-radius: 8px; width: 32px; height: 32px; cursor: pointer; font-size: 16px; color: #475569; display: flex; align-items: center; justify-content: center; }

        /* ── Tablet inline filter ── */
        .bp-inline-filter { background: white; border: 1.5px solid #f0f0f0; border-radius: 14px; padding: 14px 16px; margin-bottom: 4px; animation: bpFadeIn 0.2s ease; }

        /* ── Topbar ── */
        .bp-topbar { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
        .bp-breadcrumb { font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 4px; }
        .bp-count { font-size: 22px; font-weight: 900; color: #1e1b4b; letter-spacing: -0.5px; }
        .bp-topbar-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

        /* ── Filter toggle button ── */
        .bp-filter-toggle { display: flex; align-items: center; gap: 6px; border-radius: 10px; padding: 8px 14px; font-size: 13px; font-weight: 700; cursor: pointer; border: 1.5px solid; font-family: inherit; transition: all 0.2s; }
        .bp-filter-toggle.inactive { background: white;   color: #1e1b4b; border-color: #e2e8f0; }
        .bp-filter-toggle.active   { background: #6d28d9; color: white;   border-color: #6d28d9; }

        /* ── Card ── */
        .bp-card { background: #fff; border: 1.5px solid #f0f0f0; border-radius: 20px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.04); transition: all 0.25s ease; margin-bottom: 16px; }
        .bp-card:hover { border-color: #c4b5fd; box-shadow: 0 12px 40px rgba(109,40,217,0.1); transform: translateY(-2px); }
        .bp-card-inner { display: flex; flex-direction: row; }

        /* ── Card image ── */
        .bp-card-img-col { width: 300px; flex-shrink: 0; padding: 12px; position: relative; box-sizing: border-box; }
        .bp-card-badges  { position: absolute; top: 20px; left: 20px; display: flex; flex-direction: column; gap: 6px; pointer-events: none; }
        .bp-badge { font-size: 10px; font-weight: 700; border-radius: 6px; padding: 4px 10px; text-transform: uppercase; }
        .bp-badge-verified { background: #6d28d9; color: #fff; }
        .bp-badge-plan     { background: rgba(0,0,0,0.72); backdrop-filter: blur(6px); color: #fff; }
        .bp-save-btn { position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.9); border: 1.5px solid rgba(0,0,0,0.1); border-radius: 10px; width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #94a3b8; transition: all 0.2s; }
        .bp-save-btn.saved { background: #6d28d9; border-color: #6d28d9; color: #fff; }

        /* ── Image grid ── */
        .bp-img-grid-wrap { border-radius: 12px; overflow: hidden; cursor: pointer; }
        .bp-img-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 150px 90px; gap: 3px; }
        .bp-img-main { grid-row: 1 / 3; overflow: hidden; }
        .bp-img-sub  { overflow: hidden; }
        .bp-img-last { position: relative; }
        .bp-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
        .bp-img:hover { transform: scale(1.04); }
        .bp-img-more { position: absolute; inset: 0; background: rgba(0,0,0,0.52); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: 700; }

        /* ── Card content ── */
        .bp-card-content { flex: 1; padding: 18px 20px 14px 10px; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
        .bp-title-row   { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
        .bp-title-block { flex: 1; min-width: 0; }
        .bp-title       { font-size: 16px; font-weight: 800; color: #1e1b4b; margin: 0 0 4px; letter-spacing: -0.3px; line-height: 1.3; }
        .bp-location    { font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 5px; }
        .bp-price-block { text-align: right; flex-shrink: 0; }
        .bp-price       { font-size: 19px; font-weight: 900; color: #6d28d9; letter-spacing: -0.5px; }
        .bp-price-label { font-size: 11px; color: #94a3b8; font-weight: 600; }

        /* ── Stats ── */
        .bp-stats   { display: flex; gap: 10px; background: #f8f4ff; border-radius: 10px; padding: 9px 11px; border: 1px solid #ede9fe; flex-wrap: wrap; }
        .bp-stat    { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: #475569; }
        .bp-stat-dot { color: #d8b4fe; margin-left: 8px; }

        /* ── Tags ── */
        .bp-tags    { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .bp-tag     { border-radius: 6px; font-size: 11px; font-weight: 700; padding: 3px 10px; }
        .bp-tag-completion       { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; }
        .bp-tag-completion.ready { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
        .bp-tag-roi { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .bp-tag-dev { background: #f1f5f9; color: #475569; border: none; }

        /* ── Amenities ── */
        .bp-amenities { display: flex; gap: 6px; flex-wrap: wrap; }
        .bp-amenity   { background: #fafafa; color: #64748b; border: 1px solid #e9e9e9; border-radius: 6px; font-size: 11px; font-weight: 600; padding: 3px 9px; }
        .bp-divider   { height: 1px; background: #f1f5f9; }

        /* ── Actions ── */
        .bp-actions     { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
        .bp-details-btn { background: #f5f3ff; color: #6d28d9; border: 1.5px solid #ddd6fe; border-radius: 10px; padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; font-family: inherit; }
        .bp-enquire-btn { background: #6d28d9; color: white; border: 1.5px solid transparent; border-radius: 10px; padding: 8px 20px; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 14px rgba(109,40,217,0.35); display: flex; align-items: center; gap: 6px; transition: all 0.2s; white-space: nowrap; font-family: inherit; }
        .bp-enquire-btn.done { background: #f5f3ff; color: #6d28d9; border-color: #c4b5fd; box-shadow: none; cursor: default; }

        /* ── Expanded ── */
        .bp-expanded      { background: #fafafa; border-radius: 12px; padding: 14px; border: 1px solid #f0f0f0; margin-top: 4px; }
        .bp-expanded-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        .bp-exp-label     { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px; }
        .bp-exp-value     { font-size: 13px; font-weight: 700; color: #1e1b4b; }
        .bp-plan-detail   { background: #f5f3ff; border-radius: 8px; padding: 10px 14px; border: 1px solid #ddd6fe; font-size: 12px; color: #6d28d9; font-weight: 600; margin-bottom: 10px; }
        .bp-view-photos   { background: white; color: #6d28d9; border: 1.5px solid #c4b5fd; border-radius: 8px; padding: 8px 16px; font-size: 12px; font-weight: 700; cursor: pointer; width: 100%; font-family: inherit; }

        /* ── Filter UI ── */
        .bp-filter-hd    { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .bp-filter-title { font-size: 15px; font-weight: 900; color: #1e1b4b; }
        .bp-filter-reset { font-size: 12px; font-weight: 700; color: #ef4444; cursor: pointer; }
        .bp-filter-sec   { margin-bottom: 22px; }
        .bp-filter-label { font-size: 11px; font-weight: 800; color: #1e1b4b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
        .bp-beds-grid    { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
        .bp-price-display { font-size: 17px; font-weight: 900; color: #6d28d9; margin-bottom: 10px; }
        .bp-range-bounds  { display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; font-weight: 600; margin-top: 4px; }
        .bp-radio-group   { display: flex; flex-direction: column; gap: 8px; }
        .bp-radio-label   { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: #475569; font-weight: 600; }
        .bp-checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: #475569; font-weight: 600; margin-top: 10px; }
        .bp-amenity-pills { display: flex; flex-wrap: wrap; gap: 6px; }

        /* ── Right sidebar ── */
        .bp-sidebar-right  { display: flex; flex-direction: column; gap: 20px; }
        .bp-saved-widget   { background: white; border: 1.5px solid #f0f0f0; border-radius: 16px; padding: 18px 20px; transition: all 0.3s; }
        .bp-saved-widget.has-saved { background: #f5f3ff; border-color: #c4b5fd; }
        .bp-saved-title    { font-size: 13px; font-weight: 800; color: #1e1b4b; margin-bottom: 6px; }
        .bp-saved-empty    { font-size: 13px; color: #94a3b8; }
        .bp-saved-count    { font-size: 28px; font-weight: 900; color: #6d28d9; }
        .bp-saved-label    { font-size: 14px; color: #64748b; font-weight: 600; }
        .bp-dld-widget     { background: linear-gradient(145deg,#1e1b4b 0%,#4c1d95 100%); border-radius: 16px; padding: 22px 20px; color: white; text-align: center; box-shadow: 0 8px 28px rgba(109,40,217,0.22); }
        .bp-dld-title      { font-size: 17px; font-weight: 900; margin-bottom: 6px; }
        .bp-dld-desc       { font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 18px; line-height: 1.6; }
        .bp-dld-btn        { width: 100%; background: white; color: #6d28d9; border: none; border-radius: 10px; padding: 11px; font-size: 13px; font-weight: 800; cursor: pointer; }
        .bp-mortgage-widget { background: white; border: 1.5px solid #e9d5ff; border-radius: 16px; padding: 20px; text-align: center; }
        .bp-mortgage-title  { font-size: 14px; font-weight: 800; color: #1e1b4b; margin-bottom: 8px; }
        .bp-mortgage-desc   { font-size: 12px; color: #94a3b8; margin-bottom: 16px; }
        .bp-mortgage-btn    { width: 100%; background: #6d28d9; color: white; border: none; border-radius: 10px; padding: 11px; font-size: 13px; font-weight: 800; cursor: pointer; }

        /* ── Pagination ── */
        .bp-pagination { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 24px; flex-wrap: wrap; }
        .bp-page-btn   { width: 36px; height: 36px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: white; color: #475569; font-weight: 700; cursor: pointer; font-size: 13px; font-family: inherit; transition: all 0.15s; }
        .bp-page-btn.active { background: #6d28d9; border-color: #6d28d9; color: white; }
        .bp-page-nav   { width: 36px; height: 36px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #475569; font-size: 18px; }
        .bp-page-nav:disabled { opacity: 0.4; cursor: default; }

        /* ── Empty state ── */
        .bp-empty       { background: white; border-radius: 20px; padding: 80px 20px; text-align: center; color: #94a3b8; border: 1.5px dashed #e2e8f0; }
        .bp-empty-title { font-size: 18px; font-weight: 800; color: #1e1b4b; margin-bottom: 8px; margin-top: 16px; }

        /* ── Lightbox ── */
        .bp-lightbox-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); display: flex; align-items: center; justify-content: center; z-index: 9999; flex-direction: column; gap: 14px; padding: 20px; box-sizing: border-box; }
        .bp-lightbox-close   { position: absolute; top: 20px; right: 24px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: white; width: 40px; height: 40px; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; }
        .bp-lightbox-inner   { display: flex; align-items: center; gap: 14px; }
        .bp-lightbox-nav     { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; color: white; width: 48px; height: 48px; cursor: pointer; font-size: 22px; display: flex; align-items: center; justify-content: center; }
        .bp-lightbox-img     { max-width: min(860px,80vw); max-height: 68vh; border-radius: 14px; object-fit: cover; }
        .bp-lightbox-thumbs  { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; max-width: 700px; }
        .bp-thumb            { width: 60px; height: 44px; object-fit: cover; border-radius: 7px; cursor: pointer; opacity: 0.45; border: 2px solid transparent; }
        .bp-thumb.active     { opacity: 1; border-color: #a78bfa; }

        /* ── Utilities ── */
        @keyframes bpFadeIn { from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:none;} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 10px; }
        input[type="range"] { -webkit-appearance: none; width: 100%; height: 5px; background: #e8e0fd; border-radius: 4px; outline: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #6d28d9; cursor: pointer; border: 2px solid white; box-shadow: 0 2px 6px rgba(109,40,217,0.4); }
        .pill { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 7px 10px; font-size: 12px; font-weight: 700; color: #64748b; background: white; cursor: pointer; transition: all 0.18s; font-family: inherit; text-align: center; }
        .pill:hover { border-color: #a78bfa; color: #6d28d9; background: #f5f3ff; }
        .pill.on    { border-color: #6d28d9; background: #6d28d9; color: white; }
        select.fselect { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 8px 32px 8px 12px; font-size: 13px; font-weight: 700; color: #1e1b4b; background: white; outline: none; cursor: pointer; font-family: inherit; }
        select.fselect:focus { border-color: #6d28d9; }
        .chk { width: 16px; height: 16px; accent-color: #6d28d9; cursor: pointer; }

        /* ── Responsive overrides ── */

        /* Tablet + Mobile: card stacks vertically */
        @media (max-width: 1023px) {
          .bp-card-img-col { width: 100%; }
          .bp-card-inner   { flex-direction: column; }
          .bp-card-content { padding: 0 16px 16px; }
          .bp-img-grid     { grid-template-rows: 170px 110px; }
          .bp-expanded-grid { grid-template-columns: 1fr 1fr; }
        }

        /* Mobile */
        @media (max-width: 639px) {
          .bp-count        { font-size: 17px; }
          .bp-title        { font-size: 14px; }
          .bp-price        { font-size: 16px; }
          .bp-img-grid     { grid-template-rows: 140px 88px; }
          .bp-card-content { gap: 8px; }
          .bp-stats        { gap: 6px; }
          .bp-stat         { font-size: 11px; }
          .bp-stat-dot     { margin-left: 4px; }
          .bp-enquire-btn  { padding: 8px 14px; font-size: 12px; }
          .bp-topbar-actions { width: 100%; justify-content: space-between; }
          select.fselect   { flex: 1; }
          .bp-page-btn     { width: 32px; height: 32px; font-size: 12px; }
          .bp-page-nav     { width: 32px; height: 32px; }
          .bp-beds-grid    { grid-template-columns: 1fr 1fr; }
        }

        /* Very small */
        @media (max-width: 380px) {
          .bp-img-grid { grid-template-rows: 120px 76px; }
        }
      `}</style>

      {/* Drawer backdrop (mobile + tablet) */}
      {!isDesktop && filterOpen && (
        <div className="bp-drawer-backdrop" onClick={() => setFilterOpen(false)} />
      )}

      {/* Slide-in filter drawer (mobile + tablet) */}
      {!isDesktop && (
        <div id="bp-filter-drawer" className={`bp-drawer${filterOpen ? " open" : " closed"}`}>
          <div className="bp-drawer-hd">
            <span style={{ fontSize: 16, fontWeight: 900, color: "#1e1b4b" }}>Filters</span>
            <button className="bp-drawer-close" onClick={() => setFilterOpen(false)}>✕</button>
          </div>
          <FilterContent {...filterProps} />
        </div>
      )}

      <div className={`bp-layout ${screenSize}`}>

        {/* Desktop: sticky left filter */}
        {isDesktop && (
          <div className="bp-filter-panel">
            <FilterContent {...filterProps} />
          </div>
        )}

        {/* Main column */}
        <div>
          {/* Topbar */}
          <div className="bp-topbar">
            <div>
              <div className="bp-breadcrumb">Home / UAE / {emirateLabel}{areaLabel ? ` / ${areaLabel}` : ""} / Buy</div>
              <div className="bp-count">{sorted.length} Properties for Sale</div>
            </div>
            <div className="bp-topbar-actions">
              {!isDesktop && (
                <button id="bp-filter-toggle"
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`bp-filter-toggle${activeFilterCount > 0 ? " active" : " inactive"}`}>
                  ⚙ Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
              )}
              <select className="fselect" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Tablet: inline filter panel (opens below topbar) */}
          {isTablet && filterOpen && (
            <div className="bp-inline-filter">
              <FilterContent {...filterProps} />
            </div>
          )}

          {/* Listings */}
          {paginated.length === 0 ? (
            <div className="bp-empty">
              <div style={{ fontSize: 48 }}>⊘</div>
              <div className="bp-empty-title">No properties match your filters</div>
              <div style={{ fontSize: 14 }}>Try adjusting your budget or filter criteria.</div>
            </div>
          ) : (
            paginated.map((l) => (
              <ListingCard key={l._id} listing={l} saved={savedIds.includes(l._id)} onSave={toggleSave} />
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bp-pagination">
              <button className="bp-page-nav" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= (isMobile ? 1 : 2))
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`d${i}`} style={{ color: "#94a3b8", padding: "0 4px" }}>…</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p)} className={`bp-page-btn${page === p ? " active" : ""}`}>{p}</button>
                  )
                )}
              <button className="bp-page-nav" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          )}

          {/* Mobile + Tablet: sidebar below listings */}
          {!isDesktop && (
            <div style={{ marginTop: 24 }}>
              <SidebarContent savedIds={savedIds} navigate={navigate} />
            </div>
          )}
        </div>

        {/* Desktop: right sidebar */}
        {isDesktop && <SidebarContent savedIds={savedIds} navigate={navigate} />}
      </div>
    </div>
  );
}