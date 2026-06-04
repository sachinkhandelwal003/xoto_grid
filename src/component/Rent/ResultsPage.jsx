import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { message, notification, Spin } from "antd";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  FiMapPin, FiHeart, FiPhone, FiCheck, FiClock,
  FiUser, FiFileText, FiHome, FiX, FiFilter, FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import { FaBath, FaBed, FaRulerCombined } from "react-icons/fa";

const BEDROOMS     = ["Any", "Studio", "1 BR", "2 BR", "3 BR", "4 BR", "5+ BR"];
const PROP_TYPES   = ["All", "Apartment", "Villa", "Penthouse", "Townhouse", "Studio"];
const AMENITY_LIST = ["Pool", "Gym", "Parking", "Sea View", "Balcony", "Chiller Free", "WiFi", "Near Metro"];

// ─── LIGHTBOX ─────────────────────────────────────────────────────────────────
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
    <div onClick={onClose} className="rp-lightbox-overlay">
      <button onClick={onClose} className="rp-lightbox-close"><FiX size={16} /></button>
      <div style={{ color:"rgba(255,255,255,0.6)", fontSize:13, fontWeight:600, marginBottom:12 }}>
        {current + 1} / {images.length}
      </div>
      <div onClick={(e) => e.stopPropagation()} className="rp-lightbox-inner">
        <button onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)} className="rp-lightbox-nav">‹</button>
        <img src={images[current]} alt="" className="rp-lightbox-img" />
        <button onClick={() => setCurrent((c) => (c + 1) % images.length)} className="rp-lightbox-nav">›</button>
      </div>
      <div className="rp-lightbox-thumbs">
        {images.map((img, i) => (
          <img key={i} src={img} alt=""
            onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
            className={`rp-lightbox-thumb${i === current ? " active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── IMAGE GRID ───────────────────────────────────────────────────────────────
function ImageGrid({ images, onOpen }) {
  const imgs = images?.length ? images : ["https://placehold.co/600x400/ede9fe/7c3aed?text=No+Image"];
  return (
    <div className="rp-img-grid-wrap">
      <div className="rp-img-grid">
        <div className="rp-img-main" onClick={() => onOpen(0)}>
          <img src={imgs[0]} alt="" className="rp-img" />
        </div>
        <div className="rp-img-sub" onClick={() => onOpen(1)}>
          <img src={imgs[1] || imgs[0]} alt="" className="rp-img" />
        </div>
        <div className="rp-img-sub rp-img-last" onClick={() => onOpen(2)}>
          <img src={imgs[2] || imgs[0]} alt="" className="rp-img" />
          {imgs.length > 3 && (
            <div className="rp-img-more">+{imgs.length - 3} photos</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LEAD MODAL ───────────────────────────────────────────────────────────────
function LeadModal({ property, onClose, onSubmit, submitting }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  const [form, setForm] = useState({ name: "", email: "", phone: "", countryCode: "+971", message: "" });
  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) { message.warning("Name and phone are required"); return; }
    if (!form.phone || form.phone.length < 8) { message.error("Enter valid phone number"); return; }
    onSubmit(form);
  };

  return (
    <div onClick={onClose} className="rp-modal-overlay">
      <div onClick={(e) => e.stopPropagation()} className="rp-modal">
        <div className="rp-modal-header">
          <button onClick={onClose} className="rp-modal-close"><FiX size={16} /></button>
          <div className="rp-modal-label">Show Interest</div>
          <div className="rp-modal-title">{property?.title || "This Property"}</div>
          <div className="rp-modal-meta">
            <span className="rp-modal-location"><FiMapPin size={14} />{property?.location?.area && `${property.location.area}, `}{property?.emirate}</span>
            {property?.price && <span className="rp-modal-price">AED {property.price.toLocaleString()}/yr</span>}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="rp-modal-body">
          <p className="rp-modal-desc">Fill in your details and our agent will contact you shortly.</p>
          <div className="rp-modal-fields">
            <div className="rp-field">
              <label className="rp-label">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Enter your full name" className="rp-input"
                onFocus={e => e.target.style.borderColor = "#6d28d9"} onBlur={e => e.target.style.borderColor = "#e9d5ff"} />
            </div>
            <div className="rp-field">
              <label className="rp-label">Phone Number *</label>
              <PhoneInput country={"ae"} value={form.phone}
                onChange={(phone, country) => setForm(prev => ({ ...prev, phone, countryCode: "+" + country.dialCode }))}
                inputStyle={{ width: "100%", height: "44px", borderRadius: "10px", border: "2px solid #e9d5ff" }} />
            </div>
            <div className="rp-field">
              <label className="rp-label">Email</label>
              <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="your@email.com" className="rp-input"
                onFocus={e => e.target.style.borderColor = "#6d28d9"} onBlur={e => e.target.style.borderColor = "#e9d5ff"} />
            </div>
            <div className="rp-field">
              <label className="rp-label">Message</label>
              <textarea name="message" value={form.message} onChange={handleChange} placeholder="Any specific requirements..." rows={3} className="rp-input rp-textarea"
                onFocus={e => e.target.style.borderColor = "#6d28d9"} onBlur={e => e.target.style.borderColor = "#e9d5ff"} />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="rp-submit-btn">
            {submitting
              ? <><span className="rp-spinner" /> Sending...</>
              : <><FiPhone size={16} /> Send Interest</>}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── LISTING CARD ─────────────────────────────────────────────────────────────
function ListingCard({ listing, saved, onSave, onContact, leadCreating, contacted }) {
  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);
  const [expanded,      setExpanded]      = useState(false);

  const openLightbox = (idx) => { setLightboxStart(idx); setLightboxOpen(true); };

  const availLabel =
    listing.available ||
    (listing.isImmediate ? "Immediate" : listing.availableFrom
      ? new Date(listing.availableFrom).toLocaleDateString("en-GB") : "");

  return (
    <>
      {lightboxOpen && <Lightbox images={listing.images || []} startIndex={lightboxStart} onClose={() => setLightboxOpen(false)} />}
      <div className="rp-card">
        <div className="rp-card-inner">

          {/* Image column */}
          <div className="rp-card-img-col">
            <ImageGrid images={listing.images} onOpen={openLightbox} />
            <div className="rp-card-badges">
              {listing.verified && <div className="rp-badge rp-badge-verified"><FiCheck size={10} /> Verified</div>}
              {listing.ejari    && <div className="rp-badge rp-badge-ejari"><FiFileText size={10} /> Ejari</div>}
            </div>
            <button onClick={() => onSave(listing._id)} className={`rp-save-btn${saved ? " saved" : ""}`}>
              <FiHeart fill={saved ? "#fff" : "none"} />
            </button>
          </div>

          {/* Content column */}
          <div className="rp-card-content">
            {/* Title row */}
            <div className="rp-card-title-row">
              <div className="rp-card-title-block">
                <h3 className="rp-card-title">{listing.title}</h3>
                <div className="rp-card-location">
                  <FiMapPin size={13} style={{ color: "#a78bfa", flexShrink: 0 }} />
                  {listing.location?.area && `${listing.location.area}, `}{listing.emirate}
                </div>
              </div>
              <div className="rp-card-price-block">
                <div className="rp-card-price">AED {(listing.monthly || Math.round(listing.price / 12)).toLocaleString()}</div>
                <div className="rp-card-price-label">/ month</div>
              </div>
            </div>

            {/* Stats */}
            <div className="rp-card-stats">
              {[
                { icon: <FaRulerCombined />, label: (listing.size || "—") + " sqft" },
                { icon: <FaBed />,           label: listing.bhk || "—" },
                { icon: <FaBath />,          label: (listing.baths || "—") + " Bath" },
                { icon: <FiHome />,          label: (listing.furnishing || "—").split(" ")[0] },
              ].map((s, i) => (
                <div key={i} className="rp-stat">
                  <span className="rp-stat-icon">{s.icon}</span>
                  <span>{s.label}</span>
                  {i < 3 && <span className="rp-stat-dot">·</span>}
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="rp-card-tags">
              {availLabel && (
                <span className={`rp-avail-tag${availLabel === "Immediate" ? " immediate" : ""}`}>
                  {availLabel === "Immediate" ? "✓ Immediate" : "◷ " + availLabel}
                </span>
              )}
              {listing.tenants && (
                <span className="rp-tenant-tag"><FiUser size={12} />{listing.tenants}</span>
              )}
            </div>

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <div className="rp-amenities">
                {listing.amenities.map((a) => <span key={a} className="rp-amenity">{a}</span>)}
              </div>
            )}

            <div className="rp-divider" />

            {/* Actions */}
            <div className="rp-card-actions">
              <button onClick={() => setExpanded(!expanded)} className="rp-details-btn">
                {expanded ? "▲ Less" : "▼ Details"}
              </button>
              <button
                onClick={() => { if (!contacted) onContact(listing); }}
                disabled={leadCreating === listing._id}
                className={`rp-contact-btn${contacted ? " contacted" : ""}`}
              >
                {leadCreating === listing._id
                  ? <><FiClock size={14} /> Processing...</>
                  : contacted
                  ? <><FiCheck size={14} /> Interest Sent</>
                  : <><FiPhone size={16} /> Contact</>}
              </button>
            </div>

            {/* Expanded */}
            {expanded && (
              <div className="rp-expanded">
                <div className="rp-expanded-grid">
                  {[
                    { label: "Annual Rent",      value: `AED ${(listing.price || 0).toLocaleString()}` },
                    { label: "Security Deposit", value: `AED ${(listing.deposit || 0).toLocaleString()}` },
                    { label: "Property Type",    value: listing.type || "—" },
                    { label: "Floor Size",       value: `${listing.size || "—"} sqft` },
                    { label: "City",             value: listing.location?.city || "—" },
                    { label: "Tenants",          value: listing.tenants || "—" },
                  ].map((item, i) => (
                    <div key={i} className="rp-expanded-item">
                      <div className="rp-expanded-label">{item.label}</div>
                      <div className="rp-expanded-value">{item.value}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => openLightbox(0)} className="rp-view-photos-btn">
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

// ─── FILTER PANEL CONTENT ─────────────────────────────────────────────────────
function FilterContent({ filterBeds, setFilterBeds, maxPrice, setMaxPrice, filterType, setFilterType, verifiedOnly, setVerifiedOnly, immediateOnly, setImmediateOnly, amenityFilters, toggleAmenity, onReset, setPage }) {
  return (
    <div>
      <div className="rp-filter-header">
        <span className="rp-filter-title">Filters</span>
        <span onClick={onReset} className="rp-filter-reset">Reset all</span>
      </div>

      <div className="rp-filter-section">
        <div className="rp-filter-label">Bedrooms</div>
        <div className="rp-beds-grid">
          {BEDROOMS.map((b) => (
            <button key={b} onClick={() => { setFilterBeds(b); setPage(1); }} className={`pill${filterBeds === b ? " on" : ""}`}>{b}</button>
          ))}
        </div>
      </div>

      <div className="rp-filter-section">
        <div className="rp-filter-label">Max Annual Rent</div>
        <div className="rp-price-display">AED {maxPrice.toLocaleString()}</div>
        <input type="range" min={30000} max={300000} step={5000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
        <div className="rp-range-bounds"><span>AED 30K</span><span>AED 300K</span></div>
      </div>

      <div className="rp-filter-section">
        <div className="rp-filter-label">Property Type</div>
        <div className="rp-prop-types">
          {PROP_TYPES.map((t) => (
            <label key={t} className="rp-radio-label">
              <input type="radio" name="ptype" className="chk" checked={filterType === t} onChange={() => { setFilterType(t); setPage(1); }} />{t}
            </label>
          ))}
        </div>
      </div>

      <div className="rp-filter-section">
        <div className="rp-filter-label" style={{ marginBottom: 2 }}>Quick Filters</div>
        {[
          { label: "Verified Only",          val: verifiedOnly,  set: setVerifiedOnly  },
          { label: "Immediate Availability", val: immediateOnly, set: setImmediateOnly },
        ].map((item, i) => (
          <label key={i} className="rp-checkbox-label">
            <input type="checkbox" className="chk" checked={item.val} onChange={(e) => { item.set(e.target.checked); setPage(1); }} />{item.label}
          </label>
        ))}
      </div>

      <div className="rp-filter-section" style={{ marginBottom: 0 }}>
        <div className="rp-filter-label">Amenities</div>
        <div className="rp-amenity-pills">
          {AMENITY_LIST.map((a) => (
            <button key={a} onClick={() => { toggleAmenity(a); setPage(1); }} className={`pill${amenityFilters.includes(a) ? " on" : ""}`}>{a}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN RESULTS PAGE ────────────────────────────────────────────────────────
export default function ResultsPage() {
  const location = useLocation();
  const navigate  = useNavigate();
  const heroState = location.state || {};

  const [maxPrice, setMaxPrice] = useState(() => {
    const b = heroState.budget;
    if (!b || b === "Any Budget")            return 300000;
    if (b === "Below AED 3,000/mo")          return 36000;
    if (b === "AED 3,000 – 6,000/mo")        return 72000;
    if (b === "AED 6,000 – 10,000/mo")       return 120000;
    if (b === "AED 10,000 – 20,000/mo")      return 240000;
    if (b === "Above AED 20,000/mo")         return 300000;
    return 300000;
  });

  const [listings,       setListings]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [total,          setTotal]          = useState(0);
  const [page,           setPage]           = useState(1);
  const [sort,           setSort]           = useState("Recommended");
  const [savedIds,       setSavedIds]       = useState([]);
  const [filterBeds,     setFilterBeds]     = useState(() => { const b = heroState.beds; return (!b || b === "Any" || !BEDROOMS.includes(b)) ? "Any" : b; });
  const [filterType,     setFilterType]     = useState(() => { const t = heroState.activeType; return (t && PROP_TYPES.includes(t)) ? t : "All"; });
  const [debouncedPrice, setDebouncedPrice] = useState(300000);
  const [amenityFilters, setAmenityFilters] = useState(() => heroState.amenities || []);
  const [verifiedOnly,   setVerifiedOnly]   = useState(false);
  const [immediateOnly,  setImmediateOnly]  = useState(false);
  const [leadModal,      setLeadModal]      = useState(null);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadDoneIds,    setLeadDoneIds]    = useState([]);
  const [screenSize,     setScreenSize]     = useState("desktop"); // mobile | tablet | desktop
  const [filterOpen,     setFilterOpen]     = useState(false);

  const LIMIT = 10;

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setScreenSize(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isMobile = screenSize === "mobile";
  const isTablet = screenSize === "tablet";
  const isDesktop = screenSize === "desktop";

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPrice(maxPrice), 500);
    return () => clearTimeout(timer);
  }, [maxPrice]);

  useEffect(() => { fetchListings(); }, [page, sort, filterBeds, filterType, debouncedPrice, verifiedOnly, immediateOnly, amenityFilters]);

  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e) => {
      if (!e.target.closest("#filter-drawer") && !e.target.closest("#filter-toggle-btn")) setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (heroState.emirate)       params.set("emirate", heroState.emirate);
      if (heroState.tags?.length)  params.set("area", heroState.tags.join(","));
      if (filterType !== "All")    params.set("type", filterType);
      if (filterBeds !== "Any")    params.set("bhk", filterBeds);
      if (debouncedPrice < 300000) params.set("maxPrice", debouncedPrice);
      if (verifiedOnly)            params.set("verified", "true");
      if (immediateOnly)           params.set("isImmediate", "true");
      const allAmenities = [...(heroState.amenities || []), ...amenityFilters];
      if (allAmenities.length) params.set("amenities", [...new Set(allAmenities)].join(","));
      if (sort === "Price: Low to High") params.set("sort", "low");
      if (sort === "Price: High to Low") params.set("sort", "high");
      if (sort === "Top Rated")          params.set("sort", "rating");
      const res = await apiService.get(`/rental/property/search?${params.toString()}`);
      setListings(res?.data || []);
      setTotal(res?.total || 0);
    } catch {
      message.error("Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (formData) => {
    if (!leadModal?._id) { message.error("Property not selected"); return; }
    try {
      setLeadSubmitting(true);
      const nameParts = formData.name.trim().split(" ");
      const dialCode  = formData.countryCode?.replace("+", "") || "";
      const fullPhone = formData.phone || "";
      const number    = fullPhone.startsWith(dialCode) ? fullPhone.slice(dialCode.length) : fullPhone;
      if (!formData.name.trim())                    { message.warning("Name is required"); return; }
      if (!formData.phone || formData.phone.length < 8) { message.error("Enter valid phone number"); return; }
      const payload = {
        type: "rent",
        property: leadModal._id,
        name: { first_name: nameParts[0], last_name: nameParts.slice(1).join(" ") || "-" },
        mobile: { country_code: formData.countryCode || "+971", number },
        email: formData.email || "",
        message: formData.message || "",
      };
      const res = await apiService.post("/property/lead", payload);
      if (res?.data?.alreadyExists) {
        notification.info({ message: "Already Interested", description: "You already showed interest in this property.", placement: "topRight" });
      } else {
        notification.success({ message: "Interest Sent!", description: "Our agent will contact you shortly.", placement: "topRight" });
      }
      setLeadDoneIds(prev => [...prev, leadModal._id]);
      setLeadModal(null);
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to send. Please try again.");
    } finally {
      setLeadSubmitting(false);
    }
  };

  const toggleSave    = (id) => setSavedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAmenity = (a)  => setAmenityFilters((p) => p.includes(a) ? p.filter((x) => x !== a) : [...p, a]);

  const handleReset = () => {
    setFilterBeds("Any"); setFilterType("All"); setMaxPrice(300000); setDebouncedPrice(300000);
    setAmenityFilters([]); setVerifiedOnly(false); setImmediateOnly(false); setPage(1);
  };

  const emirateLabel = heroState.emirate || "UAE";
  const areaLabel    = heroState.tags?.join(", ") || "";
  const totalPages   = Math.ceil(total / LIMIT);

  const activeFilterCount = [
    filterBeds !== "Any", filterType !== "All", maxPrice < 300000,
    verifiedOnly, immediateOnly, amenityFilters.length > 0,
  ].filter(Boolean).length;

  const filterProps = {
    filterBeds, setFilterBeds, maxPrice, setMaxPrice, filterType, setFilterType,
    verifiedOnly, setVerifiedOnly, immediateOnly, setImmediateOnly,
    amenityFilters, toggleAmenity, onReset: handleReset, setPage,
  };

  const SidebarRight = () => (
    <div className="rp-sidebar-right">
      <div className={`rp-saved-widget${savedIds.length ? " has-saved" : ""}`}>
        <div className="rp-saved-title">♥ Saved Properties</div>
        {savedIds.length === 0
          ? <div className="rp-saved-empty">Click the heart to save properties.</div>
          : <div className="rp-saved-count">{savedIds.length} <span className="rp-saved-label">saved</span></div>}
      </div>
      <div className="rp-ejari-widget">
        <FiFileText size={28} style={{ marginBottom: 10 }} />
        <div className="rp-ejari-title">Ejari Registration</div>
        <div className="rp-ejari-desc">DLD-approved. Fast, online, 24hr turnaround.</div>
        <button className="rp-ejari-btn">Register Now</button>
      </div>
    </div>
  );

  return (
    <div className="rp-root">
      <style>{`
        /* ── Reset & Base ── */
        .rp-root { background: #f7f6fb; min-height: 100vh; font-family: system-ui, sans-serif; }

        /* ── Layout ── */
        .rp-layout { display: grid; max-width: 1400px; margin: 0 auto; padding: 20px 16px; box-sizing: border-box; gap: 20px; }
        .rp-layout.desktop { grid-template-columns: 256px 1fr 272px; padding: 24px 24px; }
        .rp-layout.tablet  { grid-template-columns: 1fr; }
        .rp-layout.mobile  { grid-template-columns: 1fr; padding: 12px 12px; gap: 14px; }

        /* ── Filter Panel (desktop) ── */
        .rp-filter-panel { background: white; border: 1.5px solid #f0f0f0; border-radius: 18px; padding: 20px; max-height: calc(100vh - 96px); position: sticky; top: 82px; overflow-y: auto; }

        /* ── Filter Drawer (mobile/tablet) ── */
        .rp-drawer-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 998; }
        .rp-drawer { position: fixed; top: 0; left: 0; bottom: 0; width: min(85vw, 340px); background: white; z-index: 999; padding: 20px; overflow-y: auto; box-sizing: border-box; transition: transform 0.3s ease, opacity 0.3s ease; }
        .rp-drawer.open  { transform: translateX(0); opacity: 1; box-shadow: 4px 0 24px rgba(0,0,0,0.15); }
        .rp-drawer.closed { transform: translateX(-100%); opacity: 0; }
        .rp-drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .rp-drawer-close { background: #f1f5f9; border: none; border-radius: 8px; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #475569; }

        /* ── Topbar ── */
        .rp-topbar { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
        .rp-breadcrumb { font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 4px; }
        .rp-results-count { font-size: 22px; font-weight: 900; color: #1e1b4b; letter-spacing: -0.5px; }
        .rp-results-count.sm { font-size: 17px; }
        .rp-topbar-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

        /* ── Filter toggle btn (mobile/tablet) ── */
        .rp-filter-toggle { display: flex; align-items: center; gap: 6px; border-radius: 10px; padding: 8px 14px; font-size: 13px; font-weight: 700; cursor: pointer; border: 1.5px solid; transition: all 0.2s; }
        .rp-filter-toggle.inactive { background: white; color: #1e1b4b; border-color: #e2e8f0; }
        .rp-filter-toggle.active   { background: #6d28d9; color: white; border-color: #6d28d9; }

        /* ── Tablet: inline filter bar ── */
        .rp-tablet-filter-bar { background: white; border: 1.5px solid #f0f0f0; border-radius: 14px; padding: 14px 16px; margin-bottom: 4px; animation: fadeIn 0.2s ease; }

        /* ── Card ── */
        .rp-card { background: #fff; border: 1.5px solid #f0f0f0; border-radius: 20px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.04); transition: all 0.25s ease; margin-bottom: 16px; }
        .rp-card:hover { border-color: #c4b5fd; box-shadow: 0 12px 40px rgba(109,40,217,0.1); transform: translateY(-2px); }
        .rp-card-inner { display: flex; flex-direction: row; }

        /* ── Card image column ── */
        .rp-card-img-col { width: 300px; flex-shrink: 0; padding: 12px; position: relative; box-sizing: border-box; }
        .rp-card-badges  { position: absolute; top: 20px; left: 20px; display: flex; flex-direction: column; gap: 6px; }
        .rp-badge { font-size: 10px; font-weight: 700; border-radius: 6px; padding: 4px 10px; text-transform: uppercase; display: flex; align-items: center; gap: 4px; }
        .rp-badge-verified { background: #6d28d9; color: #fff; }
        .rp-badge-ejari    { background: rgba(0,0,0,0.72); backdrop-filter: blur(6px); color: #fff; }
        .rp-save-btn { position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.9); border: 1.5px solid rgba(0,0,0,0.1); border-radius: 10px; width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; color: #94a3b8; }
        .rp-save-btn.saved { background: #6d28d9; border-color: #6d28d9; color: #fff; }

        /* ── Card image grid ── */
        .rp-img-grid-wrap { border-radius: 12px; overflow: hidden; cursor: pointer; }
        .rp-img-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 150px 90px; gap: 3px; }
        .rp-img-main { grid-row: 1 / 3; overflow: hidden; }
        .rp-img-sub  { overflow: hidden; position: relative; }
        .rp-img-last { position: relative; }
        .rp-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
        .rp-img:hover { transform: scale(1.04); }
        .rp-img-more { position: absolute; inset: 0; background: rgba(0,0,0,0.52); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: 700; }

        /* ── Card content ── */
        .rp-card-content { flex: 1; padding: 18px 20px 14px 10px; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
        .rp-card-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
        .rp-card-title-block { flex: 1; min-width: 0; }
        .rp-card-title  { font-size: 16px; font-weight: 800; color: #1e1b4b; margin: 0 0 4px; letter-spacing: -0.3px; line-height: 1.3; }
        .rp-card-location { font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 5px; }
        .rp-card-price-block { text-align: right; flex-shrink: 0; }
        .rp-card-price { font-size: 19px; font-weight: 900; color: #6d28d9; letter-spacing: -0.5px; }
        .rp-card-price-label { font-size: 11px; color: #94a3b8; font-weight: 600; }

        /* ── Card stats ── */
        .rp-card-stats { display: flex; gap: 10px; background: #f8f4ff; border-radius: 10px; padding: 9px 11px; border: 1px solid #ede9fe; flex-wrap: wrap; }
        .rp-stat { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: #475569; }
        .rp-stat-icon { display: flex; }
        .rp-stat-dot { color: #d8b4fe; margin-left: 8px; }

        /* ── Card tags ── */
        .rp-card-tags { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .rp-avail-tag { border-radius: 6px; font-size: 11px; font-weight: 700; padding: 3px 10px; text-transform: uppercase; background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
        .rp-avail-tag.immediate { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
        .rp-tenant-tag { background: #f1f5f9; color: #475569; border-radius: 6px; font-size: 11px; font-weight: 600; padding: 3px 10px; display: flex; align-items: center; gap: 4px; }

        /* ── Amenities ── */
        .rp-amenities { display: flex; gap: 6px; flex-wrap: wrap; }
        .rp-amenity { background: #fafafa; color: #64748b; border: 1px solid #e9e9e9; border-radius: 6px; font-size: 11px; font-weight: 600; padding: 3px 9px; }

        .rp-divider { height: 1px; background: #f1f5f9; }

        /* ── Card actions ── */
        .rp-card-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
        .rp-details-btn { background: #f5f3ff; color: #6d28d9; border: 1.5px solid #ddd6fe; border-radius: 10px; padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .rp-contact-btn { background: #6d28d9; color: white; border: 1.5px solid transparent; border-radius: 10px; padding: 8px 20px; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 14px rgba(109,40,217,0.35); display: flex; align-items: center; gap: 6px; transition: all 0.2s; white-space: nowrap; }
        .rp-contact-btn.contacted { background: #f5f3ff; color: #6d28d9; border-color: #c4b5fd; box-shadow: none; cursor: default; }
        .rp-contact-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* ── Expanded ── */
        .rp-expanded { background: #fafafa; border-radius: 12px; padding: 14px; border: 1px solid #f0f0f0; margin-top: 4px; }
        .rp-expanded-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        .rp-expanded-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px; }
        .rp-expanded-value { font-size: 13px; font-weight: 700; color: #1e1b4b; }
        .rp-view-photos-btn { background: white; color: #6d28d9; border: 1.5px solid #c4b5fd; border-radius: 8px; padding: 8px 16px; font-size: 12px; font-weight: 700; cursor: pointer; width: 100%; }

        /* ── Filter content ── */
        .rp-filter-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .rp-filter-title  { font-size: 15px; font-weight: 900; color: #1e1b4b; }
        .rp-filter-reset  { font-size: 12px; font-weight: 700; color: #ef4444; cursor: pointer; }
        .rp-filter-section { margin-bottom: 22px; }
        .rp-filter-label { font-size: 11px; font-weight: 800; color: #1e1b4b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
        .rp-beds-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
        .rp-price-display { font-size: 17px; font-weight: 900; color: #6d28d9; margin-bottom: 10px; }
        .rp-range-bounds { display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; font-weight: 600; margin-top: 4px; }
        .rp-prop-types { display: flex; flex-direction: column; gap: 8px; }
        .rp-radio-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: #475569; font-weight: 600; }
        .rp-checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: #475569; font-weight: 600; margin-top: 10px; }
        .rp-amenity-pills { display: flex; flex-wrap: wrap; gap: 6px; }

        /* ── Right sidebar ── */
        .rp-sidebar-right { display: flex; flex-direction: column; gap: 20px; }
        .rp-saved-widget { background: white; border: 1.5px solid #f0f0f0; border-radius: 16px; padding: 18px 20px; transition: all 0.3s; }
        .rp-saved-widget.has-saved { background: #f5f3ff; border-color: #c4b5fd; }
        .rp-saved-title { font-size: 13px; font-weight: 800; color: #1e1b4b; margin-bottom: 6px; }
        .rp-saved-empty { font-size: 13px; color: #94a3b8; }
        .rp-saved-count { font-size: 28px; font-weight: 900; color: #6d28d9; }
        .rp-saved-label { font-size: 14px; color: #64748b; font-weight: 600; }
        .rp-ejari-widget { background: linear-gradient(145deg,#1e1b4b 0%,#4c1d95 100%); border-radius: 16px; padding: 22px 20px; color: white; text-align: center; box-shadow: 0 8px 28px rgba(109,40,217,0.22); }
        .rp-ejari-title { font-size: 17px; font-weight: 900; margin-bottom: 6px; }
        .rp-ejari-desc { font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 18px; line-height: 1.6; }
        .rp-ejari-btn { width: 100%; background: white; color: #6d28d9; border: none; border-radius: 10px; padding: 11px; font-size: 13px; font-weight: 800; cursor: pointer; }

        /* ── Pagination ── */
        .rp-pagination { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 24px; flex-wrap: wrap; }
        .rp-page-btn { width: 36px; height: 36px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px; transition: all 0.15s; border: 1.5px solid #e2e8f0; background: white; color: #475569; }
        .rp-page-btn.active { background: #6d28d9; border-color: #6d28d9; color: white; }
        .rp-page-nav { width: 36px; height: 36px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #475569; }
        .rp-page-nav:disabled { opacity: 0.4; cursor: default; }

        /* ── Empty state ── */
        .rp-empty { background: white; border-radius: 20px; padding: 80px 20px; text-align: center; color: #94a3b8; border: 1.5px dashed #e2e8f0; }
        .rp-empty-title { font-size: 18px; font-weight: 800; color: #1e1b4b; margin-bottom: 8px; margin-top: 16px; }

        /* ── Modal ── */
        .rp-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box; overflow-y: auto; }
        .rp-modal { background: white; border-radius: 24px; width: 100%; max-width: 520px; box-shadow: 0 32px 80px rgba(109,40,217,0.2); overflow: hidden; }
        .rp-modal-header { background: #5c039c; padding: 22px 24px; position: relative; }
        .rp-modal-close  { position: absolute; top: 14px; right: 14px; background: rgba(255,255,255,0.15); border: none; border-radius: 8px; color: white; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .rp-modal-label  { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
        .rp-modal-title  { font-size: 20px; font-weight: 900; color: white; line-height: 1.3; padding-right: 36px; }
        .rp-modal-meta   { font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 6px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .rp-modal-location { display: flex; align-items: center; gap: 6px; }
        .rp-modal-price  { background: rgba(255,255,255,0.15); padding: 2px 10px; border-radius: 20px; font-weight: 700; color: white; }
        .rp-modal-body   { padding: 22px 24px; }
        .rp-modal-desc   { font-size: 13px; color: #64748b; margin-bottom: 18px; line-height: 1.6; }
        .rp-modal-fields { display: flex; flex-direction: column; gap: 14px; }
        .rp-field  { display: flex; flex-direction: column; }
        .rp-label  { font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 6px; }
        .rp-input  { width: 100%; padding: 11px 14px; border: 2px solid #e9d5ff; border-radius: 10px; font-size: 14px; outline: none; font-family: inherit; box-sizing: border-box; }
        .rp-textarea { resize: none; }
        .rp-submit-btn { width: 100%; margin-top: 18px; padding: 14px; background: linear-gradient(135deg,#6d28d9,#4c1d95); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: inherit; }
        .rp-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* ── Lightbox ── */
        .rp-lightbox-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); display: flex; align-items: center; justify-content: center; z-index: 9999; flex-direction: column; gap: 14px; padding: 20px; box-sizing: border-box; }
        .rp-lightbox-close   { position: absolute; top: 20px; right: 24px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: white; width: 40px; height: 40px; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; }
        .rp-lightbox-inner   { display: flex; align-items: center; gap: 14px; }
        .rp-lightbox-nav     { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; color: white; width: 48px; height: 48px; cursor: pointer; font-size: 22px; display: flex; align-items: center; justify-content: center; }
        .rp-lightbox-img     { max-width: min(860px,80vw); max-height: 68vh; border-radius: 14px; object-fit: cover; }
        .rp-lightbox-thumbs  { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; max-width: 700px; }
        .rp-lightbox-thumb   { width: 60px; height: 44px; object-fit: cover; border-radius: 7px; cursor: pointer; opacity: 0.45; border: 2px solid transparent; }
        .rp-lightbox-thumb.active { opacity: 1; border-color: #a78bfa; }

        /* ── Utility ── */
        .rp-spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:none;} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 10px; }
        input[type="range"] { -webkit-appearance: none; width: 100%; height: 5px; background: #e8e0fd; border-radius: 4px; outline: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #6d28d9; cursor: pointer; border: 2px solid white; box-shadow: 0 2px 6px rgba(109,40,217,0.4); }
        .pill { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 7px 10px; font-size: 12px; font-weight: 700; color: #64748b; background: white; cursor: pointer; transition: all 0.18s; font-family: inherit; text-align: center; }
        .pill:hover { border-color: #a78bfa; color: #6d28d9; background: #f5f3ff; }
        .pill.on    { border-color: #6d28d9; background: #6d28d9; color: white; }
        select.fselect { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 8px 32px 8px 12px; font-size: 13px; font-weight: 700; color: #1e1b4b; background: white; outline: none; cursor: pointer; font-family: inherit; }
        .chk { width: 16px; height: 16px; accent-color: #6d28d9; cursor: pointer; }

        /* ── Responsive overrides ── */

        /* Tablet (640–1023px): card goes column, image full-width */
        @media (max-width: 1023px) {
          .rp-card-img-col { width: 100%; }
          .rp-card-inner   { flex-direction: column; }
          .rp-card-content { padding: 0 16px 16px; }
          .rp-img-grid     { grid-template-rows: 170px 110px; }
          .rp-expanded-grid { grid-template-columns: 1fr 1fr; }
        }

        /* Mobile (< 640px) */
        @media (max-width: 639px) {
          .rp-results-count { font-size: 17px; }
          .rp-card-title    { font-size: 14px; }
          .rp-card-price    { font-size: 16px; }
          .rp-img-grid      { grid-template-rows: 140px 90px; }
          .rp-card-content  { gap: 8px; }
          .rp-card-stats    { gap: 6px; }
          .rp-stat          { font-size: 11px; }
          .rp-stat-dot      { margin-left: 4px; }
          .rp-contact-btn   { padding: 8px 14px; font-size: 12px; }
          .rp-expanded-grid { grid-template-columns: 1fr 1fr; }
          .rp-pagination    { gap: 4px; }
          .rp-page-btn      { width: 32px; height: 32px; font-size: 12px; }
          .rp-page-nav      { width: 32px; height: 32px; }
          .rp-modal-body    { padding: 16px; }
          .rp-modal-header  { padding: 18px 16px; }
          .rp-topbar        { gap: 8px; }
          .rp-topbar-actions { width: 100%; justify-content: space-between; }
          select.fselect    { flex: 1; }
        }

        /* Very small screens */
        @media (max-width: 380px) {
          .rp-img-grid { grid-template-rows: 120px 78px; }
          .rp-beds-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {leadModal && (
        <LeadModal property={leadModal} onClose={() => setLeadModal(null)} onSubmit={handleLeadSubmit} submitting={leadSubmitting} />
      )}

      {/* Drawer backdrop (mobile & tablet) */}
      {!isDesktop && filterOpen && (
        <div className="rp-drawer-backdrop" onClick={() => setFilterOpen(false)} />
      )}

      {/* Slide-in filter drawer (mobile & tablet) */}
      {!isDesktop && (
        <div id="filter-drawer" className={`rp-drawer${filterOpen ? " open" : " closed"}`}>
          <div className="rp-drawer-header">
            <span style={{ fontSize: 16, fontWeight: 900, color: "#1e1b4b" }}>Filters</span>
            <button className="rp-drawer-close" onClick={() => setFilterOpen(false)}><FiX size={16} /></button>
          </div>
          <FilterContent {...filterProps} />
        </div>
      )}

      <div className={`rp-layout ${screenSize}`}>

        {/* Desktop: left filter */}
        {isDesktop && (
          <div className="rp-filter-panel">
            <FilterContent {...filterProps} />
          </div>
        )}

        {/* Main listings column */}
        <div>
          {/* Topbar */}
          <div className="rp-topbar">
            <div>
              <div className="rp-breadcrumb">Home / UAE / {emirateLabel}{areaLabel ? ` / ${areaLabel}` : ""}</div>
              <div className={`rp-results-count${isMobile ? " sm" : ""}`}>
                {loading ? "Loading..." : `${total} Properties found`}
              </div>
            </div>
            <div className="rp-topbar-actions">
              {!isDesktop && (
                <button id="filter-toggle-btn"
                  onClick={() => setFilterOpen(true)}
                  className={`rp-filter-toggle${activeFilterCount > 0 ? " active" : " inactive"}`}>
                  <FiFilter size={14} />
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
              )}
              <select className="fselect" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Top Rated</option>
              </select>
            </div>
          </div>

          {/* Tablet: inline filter bar (opens below topbar) */}
          {isTablet && filterOpen && (
            <div className="rp-tablet-filter-bar">
              <FilterContent {...filterProps} />
            </div>
          )}

          {/* Listings */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
              <Spin size="large" />
            </div>
          ) : listings.length === 0 ? (
            <div className="rp-empty">
              <FiHome size={40} />
              <div className="rp-empty-title">No properties match your filters</div>
              <div style={{ fontSize: 14 }}>Try adjusting your budget or filter criteria.</div>
            </div>
          ) : (
            listings.map((l) => (
              <ListingCard
                key={l._id} listing={l}
                saved={savedIds.includes(l._id)} onSave={toggleSave}
                onContact={(listing) => setLeadModal(listing)}
                leadCreating={leadSubmitting && leadModal?._id === l._id ? l._id : null}
                contacted={leadDoneIds.includes(l._id)}
              />
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="rp-pagination">
              <button className="rp-page-nav" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <FiChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= (isMobile ? 1 : 2))
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`dot-${i}`} style={{ color: "#94a3b8", padding: "0 4px" }}>…</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p)} className={`rp-page-btn${page === p ? " active" : ""}`}>{p}</button>
                  )
                )}
              <button className="rp-page-nav" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <FiChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Mobile: sidebar stacks below listings */}
          {!isDesktop && (
            <div style={{ marginTop: 24 }}>
              <SidebarRight />
            </div>
          )}
        </div>

        {/* Desktop: right sidebar */}
        {isDesktop && <SidebarRight />}
      </div>
    </div>
  );
}