import { useState } from "react";

// ─── UAE DATA ────────────────────────────────────────────────────────────────

const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK", "Fujairah", "UAQ"];

const POPULAR_AREAS = {
  Dubai: ["Dubai Marina", "Downtown Dubai", "JBR", "Palm Jumeirah", "Business Bay", "DIFC", "JVC", "Al Barsha", "Deira", "Bur Dubai", "MBR City", "Dubai Hills"],
  "Abu Dhabi": ["Corniche", "Al Reem Island", "Yas Island", "Saadiyat Island", "Al Khalidiyah", "Khalifa City"],
  Sharjah: ["Al Nahda", "Al Majaz", "Al Taawun", "Muwaileh", "Al Khan"],
  Ajman: ["Ajman Corniche", "Al Nuaimiya", "Emirates City"],
  RAK: ["Al Marjan Island", "Al Hamra Village", "RAK City"],
  Fujairah: ["Fujairah City", "Dibba"],
  UAQ: ["UAQ Corniche"],
};

const PROPERTY_TYPES = ["Apartment", "Villa", "Studio", "Penthouse", "Townhouse", "Duplex"];

const BEDROOMS = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR", "5+ BR"];

const AMENITY_CHIPS = [
  { label: "Chiller Free", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5l-5 5-5-5M17 19l-5-5-5 5"/></svg> },
  { label: "DEWA Included", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  { label: "Furnished", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 9V7a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2V9m16 0H4"/></svg> },
  { label: "Pet Friendly", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-5 1c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-5 6c-3 0-5.5 1.5-6.5 4-.3.8-.5 1.7-.5 2.5 0 1.4 1.1 2.5 2.5 2.5h9c1.4 0 2.5-1.1 2.5-2.5 0-.8-.2-1.7-.5-2.5-1-2.5-3.5-4-6.5-4z"/></svg> },
  { label: "Pool", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20M2 16h20M2 8h20"/></svg> },
  { label: "Gym", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 5v14M18 5v14M2 9h4M18 9h4M2 15h4M18 15h4M6 12h12"/></svg> },
  { label: "Parking", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 8h4a2 2 0 010 4H9v4"/></svg> },
  { label: "Sea View", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20M2 18h20M7 6a5 5 0 0110 0"/></svg> },
  { label: "Balcony", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10zm0 0l4-8h10l4 8M10 10v12M14 10v12"/></svg> },
  { label: "Maid's Room", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10"/></svg> },
  { label: "Near Metro", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 15h.01M16 15h.01M4 8h16"/></svg> },
  { label: "Kids Play Area", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg> },
];

const BUDGET_RANGES = [
  "Any Budget",
  "Below AED 3,000/mo",
  "AED 3,000 – 6,000/mo",
  "AED 6,000 – 10,000/mo",
  "AED 10,000 – 20,000/mo",
  "Above AED 20,000/mo",
];

const RENT_FREQUENCY = ["Monthly", "Quarterly", "Bi-Annual", "Annual"];

const FURNISHING_OPTS = ["Any", "Furnished", "Semi Furnished", "Unfurnished"];

// ─── SAMPLE LISTINGS ─────────────────────────────────────────────────────────

const LISTINGS = [
  {
    id: 1,
    title: "Luxury 2 BR in Dubai Marina",
    location: "Marina Walk, near Dubai Marina Mall",
    area: "Dubai Marina",
    emirate: "Dubai",
    priceAnnual: 102000,
    priceMonthly: 8500,
    deposit: 8500,
    cheques: 4,
    size: 1150,
    type: "Apartment",
    beds: "2 BR",
    baths: 2,
    furnishing: "Fully Furnished",
    tenants: "Family / Couples",
    available: "Immediate",
    amenities: ["Pool", "Gym", "Parking", "Sea View", "Balcony", "Chiller Free"],
    images: 6,
    verified: true,
    ejari: true,
    badge: "Zero Brokerage",
    imgColor: "#d0eaf8",
    emoji: "🏙️",
    floor: "22nd",
    buildYear: 2019,
  },
  {
    id: 2,
    title: "Spacious 1 BR in JBR The Walk",
    location: "Jumeirah Beach Residence, Rimal 3",
    area: "JBR",
    emirate: "Dubai",
    priceAnnual: 74400,
    priceMonthly: 6200,
    deposit: 6200,
    cheques: 2,
    size: 780,
    type: "Apartment",
    beds: "1 BR",
    baths: 1,
    furnishing: "Semi Furnished",
    tenants: "Family",
    available: "15-May-2026",
    amenities: ["Balcony", "Parking", "DEWA Included", "Near Metro"],
    images: 4,
    verified: true,
    ejari: true,
    badge: "Owner Direct",
    imgColor: "#d1fae5",
    emoji: "🌊",
    floor: "8th",
    buildYear: 2008,
  },
  {
    id: 3,
    title: "Premium Studio in Downtown Dubai",
    location: "Burj Khalifa District, near Dubai Mall",
    area: "Downtown Dubai",
    emirate: "Dubai",
    priceAnnual: 69600,
    priceMonthly: 5800,
    deposit: 5800,
    cheques: 1,
    size: 520,
    type: "Studio",
    beds: "Studio",
    baths: 1,
    furnishing: "Fully Furnished",
    tenants: "Singles / Couples",
    available: "Immediate",
    amenities: ["Gym", "Pool", "Parking", "Near Metro"],
    images: 8,
    verified: false,
    ejari: false,
    badge: null,
    imgColor: "#ede8fb",
    emoji: "🌆",
    floor: "15th",
    buildYear: 2015,
  },
  {
    id: 4,
    title: "4 BR Villa with Private Pool – Palm Jumeirah",
    location: "Frond K, Palm Jumeirah",
    area: "Palm Jumeirah",
    emirate: "Dubai",
    priceAnnual: 264000,
    priceMonthly: 22000,
    deposit: 22000,
    cheques: 6,
    size: 3200,
    type: "Villa",
    beds: "4 BR",
    baths: 5,
    furnishing: "Furnished",
    tenants: "Family",
    available: "01-Jun-2026",
    amenities: ["Sea View", "Pool", "Parking", "Balcony", "Maid's Room", "Chiller Free"],
    images: 12,
    verified: true,
    ejari: true,
    badge: "Zero Brokerage",
    imgColor: "#fce8e0",
    emoji: "🌴",
    floor: "Ground",
    buildYear: 2017,
  },
  {
    id: 5,
    title: "1 BR in Business Bay – Canal View",
    location: "Executive Bay Tower, Business Bay",
    area: "Business Bay",
    emirate: "Dubai",
    priceAnnual: 62400,
    priceMonthly: 5200,
    deposit: 5200,
    cheques: 2,
    size: 680,
    type: "Apartment",
    beds: "1 BR",
    baths: 1,
    furnishing: "Semi Furnished",
    tenants: "Family / Singles",
    available: "Immediate",
    amenities: ["Gym", "Parking", "Near Metro"],
    images: 5,
    verified: true,
    ejari: false,
    badge: "Owner Direct",
    imgColor: "#fef3c7",
    emoji: "🏢",
    floor: "18th",
    buildYear: 2013,
  },
  {
    id: 6,
    title: "3 BR Penthouse in DIFC",
    location: "Index Tower, DIFC",
    area: "DIFC",
    emirate: "Dubai",
    priceAnnual: 300000,
    priceMonthly: 25000,
    deposit: 25000,
    cheques: 4,
    size: 2800,
    type: "Penthouse",
    beds: "3 BR",
    baths: 4,
    furnishing: "Fully Furnished",
    tenants: "Family",
    available: "Immediate",
    amenities: ["Pool", "Gym", "Parking", "Sea View", "Balcony", "Maid's Room", "Chiller Free"],
    images: 10,
    verified: true,
    ejari: true,
    badge: "Zero Brokerage",
    imgColor: "#f0e4ff",
    emoji: "👑",
    floor: "38th",
    buildYear: 2011,
  },
];

const SORT_OPTIONS = ["Best Match", "Price: Low to High", "Price: High to Low", "Newest First", "Largest First"];

const TAG_COLORS = {
  "Pool": { bg: "#e0f2fe", color: "#0369a1" },
  "Gym": { bg: "#dcfce7", color: "#15803d" },
  "Parking": { bg: "#f3e8ff", color: "#7e22ce" },
  "Sea View": { bg: "#dbeafe", color: "#1d4ed8" },
  "Balcony": { bg: "#fef9c3", color: "#854d0e" },
  "DEWA Included": { bg: "#d1fae5", color: "#065f46" },
  "Chiller Free": { bg: "#e0f7fa", color: "#006064" },
  "Furnished": { bg: "#ede9fe", color: "#5b21b6" },
  "Maid's Room": { bg: "#fce7f3", color: "#9d174d" },
  "Near Metro": { bg: "#e8f5e9", color: "#2e7d32" },
  "Pet Friendly": { bg: "#fff3e0", color: "#e65100" },
  "Kids Play Area": { bg: "#fbe9e7", color: "#bf360c" },
};

// ─── ICONS ───────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "#9ca3af"} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const ShareIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const VerifiedBadge = () => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#ecfdf5", color: "#065f46", fontSize: 10, fontWeight: 700, borderRadius: 5, padding: "2px 6px" }}>
    <svg width="10" height="10" viewBox="0 0 24 24" fill="#10b981"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    Verified
  </span>
);
const EjariIcon = () => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#fffbeb", color: "#92400e", fontSize: 10, fontWeight: 700, borderRadius: 5, padding: "2px 6px" }}>
    📋 Ejari Ready
  </span>
);

// ─── LISTING CARD ─────────────────────────────────────────────────────────────

function ListingCard({ listing, saved, onSave }) {
  const [contacted, setContacted] = useState(false);

  return (
    <div
      style={{
        background: "white",
        border: "1.5px solid #f0ebff",
        borderRadius: 16,
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        transition: "box-shadow 0.2s, transform 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 28px rgba(92,3,156,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex" }}>
        {/* IMAGE PANEL */}
        <div style={{ width: 190, minHeight: 200, background: listing.imgColor, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", fontSize: 52 }}>
          {listing.emoji}
          {listing.badge && (
            <div style={{ position: "absolute", top: 10, left: 10, background: listing.badge === "Zero Brokerage" ? "#5c039c" : "#0f766e", color: "white", fontSize: 9, fontWeight: 800, borderRadius: 6, padding: "3px 8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {listing.badge}
            </div>
          )}
          <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.45)", color: "white", fontSize: 10, fontWeight: 600, borderRadius: 6, padding: "2px 7px" }}>
            📷 {listing.images} Photos
          </div>
          <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.45)", color: "white", fontSize: 10, fontWeight: 600, borderRadius: 6, padding: "2px 7px" }}>
            {listing.floor} Fl.
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 9, minWidth: 0 }}>

          {/* HEADER */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#1e1b4b" }}>{listing.title}</span>
                {listing.verified && <VerifiedBadge />}
                {listing.ejari && <EjariIcon />}
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9b5cf6" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {listing.location}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 8 }}>
              <button onClick={() => onSave(listing.id)} style={{ background: "none", border: "1px solid #e9d5ff", borderRadius: 8, padding: "5px 7px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <HeartIcon filled={saved} />
              </button>
              <button style={{ background: "none", border: "1px solid #e9d5ff", borderRadius: 8, padding: "5px 7px", cursor: "pointer", color: "#7c3aed", display: "flex", alignItems: "center" }}>
                <ShareIcon />
              </button>
            </div>
          </div>

          {/* PRICE + STATS */}
          <div style={{ display: "flex", background: "#faf8ff", borderRadius: 10, overflow: "hidden", border: "1px solid #f0ebff" }}>
            {[
              ["AED " + listing.priceMonthly.toLocaleString() + "/mo", "AED " + listing.priceAnnual.toLocaleString() + "/yr", "#3b0764"],
              ["AED " + listing.deposit.toLocaleString(), listing.cheques + " Cheque" + (listing.cheques > 1 ? "s" : ""), "#374151"],
              [listing.size + " sqft", "Built-up Area", "#374151"],
              [listing.beds, listing.baths + " Bath" + (listing.baths > 1 ? "s" : ""), "#374151"],
            ].map(([main, sub, col], i) => (
              <div key={i} style={{ flex: 1, padding: "8px 10px", borderRight: i < 3 ? "1px solid #f0ebff" : "none" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: col }}>{main}</div>
                <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* DETAILS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px 12px" }}>
            {[
              ["🛋️", "Furnishing", listing.furnishing],
              ["👥", "Tenants", listing.tenants],
              ["📅", "Available", listing.available],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>{val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* AMENITY CHIPS + CTA */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", flex: 1 }}>
              {listing.amenities.slice(0, 5).map((tag) => {
                const c = TAG_COLORS[tag] || { bg: "#f3f4f6", color: "#4b5563" };
                return (
                  <span key={tag} style={{ background: c.bg, color: c.color, fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 7px" }}>{tag}</span>
                );
              })}
              {listing.amenities.length > 5 && (
                <span style={{ background: "#f3f4f6", color: "#6b7280", fontSize: 10, fontWeight: 600, borderRadius: 6, padding: "2px 7px" }}>
                  +{listing.amenities.length - 5} more
                </span>
              )}
            </div>
            <button
              onClick={() => setContacted(true)}
              style={{
                background: contacted ? "#10b981" : "#5c039c",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "9px 16px",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
                flexShrink: 0,
                transition: "background 0.2s",
                letterSpacing: "0.03em",
                whiteSpace: "nowrap",
              }}
            >
              {contacted ? "✓ Owner Notified" : "Get Owner Details"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

function Sidebar({ filters, setFilters }) {
  const toggle = (key, val) => {
    setFilters(f => {
      const arr = f[key] || [];
      return { ...f, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
  };

  return (
    <div style={{ width: 220, flexShrink: 0 }}>
      <div style={{ background: "white", border: "1.5px solid #f0ebff", borderRadius: 14, padding: "16px 14px", position: "sticky", top: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b" }}>Filters</span>
          <span onClick={() => setFilters({})} style={{ fontSize: 11, color: "#7c3aed", cursor: "pointer", fontWeight: 700 }}>Reset All</span>
        </div>

        {/* PROPERTY TYPE */}
        <FilterSection title="Property Type">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {PROPERTY_TYPES.map(t => (
              <button key={t} onClick={() => toggle("types", t)} style={{
                border: "1.5px solid " + ((filters.types || []).includes(t) ? "#5c039c" : "#e9d5ff"),
                background: (filters.types || []).includes(t) ? "#5c039c" : "white",
                color: (filters.types || []).includes(t) ? "white" : "#7c3aed",
                borderRadius: 7, padding: "3px 9px", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>{t}</button>
            ))}
          </div>
        </FilterSection>

        {/* BEDROOMS */}
        <FilterSection title="Bedrooms">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {BEDROOMS.map(b => (
              <button key={b} onClick={() => toggle("beds", b)} style={{
                border: "1.5px solid " + ((filters.beds || []).includes(b) ? "#5c039c" : "#e9d5ff"),
                background: (filters.beds || []).includes(b) ? "#5c039c" : "white",
                color: (filters.beds || []).includes(b) ? "white" : "#7c3aed",
                borderRadius: 7, padding: "3px 9px", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>{b}</button>
            ))}
          </div>
        </FilterSection>

        {/* FURNISHING */}
        <FilterSection title="Furnishing">
          {FURNISHING_OPTS.map(f => (
            <label key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#374151", cursor: "pointer", marginBottom: 5 }}>
              <input type="radio" name="furnish" style={{ accentColor: "#5c039c" }} onChange={() => setFilters(prev => ({ ...prev, furnishing: f }))} checked={(filters.furnishing || "Any") === f} />
              {f}
            </label>
          ))}
        </FilterSection>

        {/* RENT FREQUENCY */}
        <FilterSection title="Payment Frequency">
          {RENT_FREQUENCY.map(r => (
            <label key={r} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#374151", cursor: "pointer", marginBottom: 5 }}>
              <input type="radio" name="freq" style={{ accentColor: "#5c039c" }} onChange={() => setFilters(prev => ({ ...prev, frequency: r }))} checked={(filters.frequency || "Monthly") === r} />
              {r}
            </label>
          ))}
        </FilterSection>

        {/* AVAILABILITY */}
        <FilterSection title="Availability">
          {["Immediate", "Within 15 Days", "Within 30 Days", "After 30 Days"].map(a => (
            <label key={a} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#374151", cursor: "pointer", marginBottom: 5 }}>
              <input type="checkbox" style={{ accentColor: "#5c039c" }} onChange={() => toggle("avail", a)} checked={(filters.avail || []).includes(a)} />
              {a}
            </label>
          ))}
        </FilterSection>

        {/* UAE SPECIFIC */}
        <FilterSection title="UAE Specific">
          {["Chiller Free", "DEWA Included", "Ejari Ready", "Near Metro", "Pet Friendly"].map(u => (
            <label key={u} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#374151", cursor: "pointer", marginBottom: 5 }}>
              <input type="checkbox" style={{ accentColor: "#5c039c" }} onChange={() => toggle("uae", u)} checked={(filters.uae || []).includes(u)} />
              {u}
            </label>
          ))}
        </FilterSection>

        {/* PREFERRED TENANTS */}
        <FilterSection title="Preferred Tenants">
          {["Family", "Couples", "Singles", "Bachelor Male", "Bachelor Female", "Any"].map(t => (
            <label key={t} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#374151", cursor: "pointer", marginBottom: 5 }}>
              <input type="checkbox" style={{ accentColor: "#5c039c" }} onChange={() => toggle("tenants", t)} checked={(filters.tenants || []).includes(t)} />
              {t}
            </label>
          ))}
        </FilterSection>

        <button style={{ width: "100%", background: "#5c039c", color: "white", border: "none", borderRadius: 10, padding: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", marginTop: 6 }}>
          Apply Filters
        </button>
      </div>
    </div>
  );
}

function FilterSection({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{title}</div>
      {children}
      <div style={{ borderBottom: "1px solid #f5f3ff", marginTop: 10 }} />
    </div>
  );
}

// ─── HERO SEARCH ─────────────────────────────────────────────────────────────

function HeroSearch({ onSearch }) {
  const [emirate, setEmirate] = useState("Dubai");
  const [tags, setTags] = useState([]);
  const [locVal, setLocVal] = useState("");
  const [showSugg, setShowSugg] = useState(false);
  const [activeType, setActiveType] = useState("Apartment");
  const [beds, setBeds] = useState("Any");
  const [budget, setBudget] = useState("Any Budget");
  const [frequency, setFrequency] = useState("Monthly");
  const [furnishing, setFurnishing] = useState("Any");
  const [chips, setChips] = useState(["Furnished", "Pool", "Chiller Free"]);
  const [searching, setSearching] = useState(false);

  const suggestions = (POPULAR_AREAS[emirate] || []).filter(a =>
    a.toLowerCase().includes(locVal.toLowerCase()) && !tags.includes(a)
  );

  const addTag = (name) => {
    if (tags.length >= 3 || tags.includes(name)) return;
    setTags([...tags, name]);
    setLocVal("");
    setShowSugg(false);
  };
  const removeTag = (name) => setTags(tags.filter(t => t !== name));
  const toggleChip = (c) => setChips(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const handleKeyDown = (e) => {
    if ((e.key === "," || e.key === "Enter") && locVal.trim()) {
      e.preventDefault();
      addTag(locVal.trim());
    }
  };

  const handleSearch = () => {
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      onSearch({ emirate, areas: tags, type: activeType, beds, budget, frequency, furnishing, amenities: chips });
    }, 1000);
  };

  return (
    <>
<style>{`
  /* DM Sans ko URL me add kiya gaya hai */
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  
  .pj { font-family:'Plus Jakarta Sans',sans-serif; }
  .syne { font-family:'Syne',sans-serif; }
  .msrow:focus-within { border-color:#5c039c!important; box-shadow:0 0 0 3px rgba(92,3,156,0.1); }
  .chip-active { background:#5c039c!important; color:white!important; border-color:#5c039c!important; }
  .chip-btn:hover { border-color:#9b5cf6; color:#5c039c; background:#f5edff; }
  .type-active { border-color:#5c039c!important; background:#f5edff!important; color:#5c039c!important; }
  .sugg-item:hover { background:#f5f3ff; }
  select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%235c039c' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 8px center; padding-right:26px!important; }
`}</style>

      <div className="pj relative overflow-hidden" style={{ background: "linear-gradient(160deg, #0f0c29 0%, #1c77c7 55%, #ffffff 100%)" }}>
        {/* decorative circles */}
        <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", top: -60, right: -40, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", top: 20, right: 100, pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>

          {/* LEFT: HERO COPY */}
          <div style={{ paddingBottom: 60 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "5px 14px", marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Zero Brokerage · UAE</span>
            </div>
            <h1 className="syne" style={{ fontSize: 56, fontWeight: 800, color: "white", lineHeight: 1.1, marginBottom: 16 }}>
              Find Your<br />
              <span style={{ color: "#c084fc" }}>Perfect</span> Home<br />
              in the UAE
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 28, maxWidth: 340 }}>
              Premium rentals across Dubai, Abu Dhabi & beyond.<br />
              No brokerage. Direct owner connect. Ejari-ready.
            </p>

            {/* STATS */}
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              {[["12,400+", "Listings"], ["0%", "Brokerage"], ["98K+", "Happy Tenants"]].map(([n, l], i) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <div>
                    <div className="syne" style={{ fontSize: 22, fontWeight: 800, color: "#c084fc" }}>{n}</div>
                    <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(192,132,252,0.45)", marginTop: 2 }}>{l}</div>
                  </div>
                  {i < 2 && <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.1)" }} />}
                </div>
              ))}
            </div>

            {/* EJARI NOTE */}
            <div style={{ marginTop: 28, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 14px" }}>
              <span style={{ fontSize: 14 }}>📋</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Ejari & RERA Compliant</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>All listings follow Dubai Land Department guidelines</div>
              </div>
            </div>
          </div>

          {/* RIGHT: SEARCH PANEL */}
<div style={{ 
  background: "white", 
  borderRadius: "20px 20px 0 0", 
  padding: "26px 28px", 
  boxShadow: "0 24px 80px rgba(15,12,41,0.35)",
  fontFamily: "'DM Sans', sans-serif", // DM Sans Font Apply Kiya
  letterSpacing: "0.025em",            // Fonts ko thoda relax kiya
  lineHeight: "1.65"                   // Saans lene ki jagah (Breathing room)
}}>
  
  <div style={{ marginBottom: 20 }}>
    <h2 style={{ fontSize: 26, fontWeight: 700, color: "#1e1b4b", lineHeight: 1.3, margin: 0, letterSpacing: "0.01em" }}>
      Search <span style={{ borderBottom: "3px solid #c084fc", paddingBottom: 2, color: "#7c3aed" }}>Rental Properties</span>
    </h2>
    <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8, fontWeight: 400, letterSpacing: "0.03em" }}>
      Verified homes · Zero brokerage · Ejari ready
    </p>
  </div>

            {/* MAIN SEARCH BAR */}
            <div className="msrow" style={{ display: "flex", alignItems: "center", border: "2px solid #e9d5ff", borderRadius: 14, overflow: "hidden", marginBottom: 12, background: "#faf8ff", transition: "all 0.2s", position: "relative" }}>
              <select
                value={emirate}
                onChange={e => { setEmirate(e.target.value); setTags([]); }}
                style={{ border: "none", outline: "none", background: "transparent", padding: "12px 26px 12px 12px", fontSize: 13, fontWeight: 700, color: "#374151", minWidth: 110, cursor: "pointer", borderRight: "1.5px solid #e9d5ff", fontFamily: "inherit" }}
              >
                {EMIRATES.map(em => <option key={em}>{em}</option>)}
              </select>

              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, padding: "0 12px", minWidth: 0, flexWrap: "wrap" }}>
                {tags.map(tag => (
                  <div key={tag} style={{ display: "flex", alignItems: "center", gap: 4, background: "#ede9fe", color: "#5c039c", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, flexShrink: 0 }}>
                    {tag}
                    <span onClick={() => removeTag(tag)} style={{ cursor: "pointer", color: "#9b5cf6", fontSize: 12, lineHeight: 1 }}>×</span>
                  </div>
                ))}
                <input
                  value={locVal}
                  onChange={e => { setLocVal(e.target.value); setShowSugg(true); }}
                  onFocus={() => setShowSugg(true)}
                  onBlur={() => setTimeout(() => setShowSugg(false), 180)}
                  onKeyDown={handleKeyDown}
                  placeholder={tags.length === 0 ? "Area, community or landmark..." : tags.length < 3 ? "Add another area..." : ""}
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "12px 0", fontSize: 13, color: "#374151", minWidth: 100, fontFamily: "inherit" }}
                />
              </div>

              <button
                onClick={handleSearch}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 20px", background: searching ? "#3b0275" : "#5c039c", color: "white", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", flexShrink: 0, transition: "background 0.2s", fontFamily: "inherit" }}
              >
                {searching ? "✓ Searching..." : <><SearchIcon /> Search</>}
              </button>

              {/* AUTOCOMPLETE */}
              {showSugg && suggestions.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: "1.5px solid #e9d5ff", borderRadius: "0 0 12px 12px", zIndex: 100, boxShadow: "0 8px 24px rgba(92,3,156,0.1)", overflow: "hidden" }}>
                  {suggestions.slice(0, 6).map(s => (
                    <div key={s} className="sugg-item" onMouseDown={() => addTag(s)} style={{ padding: "9px 16px", fontSize: 12, color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9b5cf6" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PROPERTY TYPE + KEY FILTERS */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {PROPERTY_TYPES.slice(0, 4).map(t => (
                <button key={t} onClick={() => setActiveType(t)} className={activeType === t ? "type-active" : ""} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", border: "1.5px solid #e9d5ff", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: activeType === t ? "#5c039c" : "#6b7280", background: "white", fontFamily: "inherit", transition: "all 0.15s" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", border: "2px solid " + (activeType === t ? "#5c039c" : "#d1d5db"), display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {activeType === t && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#5c039c" }} />}
                  </div>
                  {t}
                </button>
              ))}

              <div style={{ width: 1, height: 20, background: "#e9d5ff" }} />

              {/* BEDS */}
              <select value={beds} onChange={e => setBeds(e.target.value)} style={{ border: "1.5px solid #e9d5ff", borderRadius: 8, padding: "5px 8px", fontSize: 11, fontWeight: 700, color: "#5c039c", background: "white", outline: "none", cursor: "pointer", fontFamily: "inherit" }}>
                <option value="Any">Any BR</option>
                {BEDROOMS.map(b => <option key={b}>{b}</option>)}
              </select>

              {/* BUDGET */}
              <select value={budget} onChange={e => setBudget(e.target.value)} style={{ border: "1.5px solid #e9d5ff", borderRadius: 8, padding: "5px 8px", fontSize: 11, fontWeight: 700, color: "#5c039c", background: "white", outline: "none", cursor: "pointer", fontFamily: "inherit" }}>
                {BUDGET_RANGES.map(b => <option key={b}>{b}</option>)}
              </select>

              {/* RENT FREQUENCY */}
              <select value={frequency} onChange={e => setFrequency(e.target.value)} style={{ border: "1.5px solid #e9d5ff", borderRadius: 8, padding: "5px 8px", fontSize: 11, fontWeight: 700, color: "#5c039c", background: "white", outline: "none", cursor: "pointer", fontFamily: "inherit" }}>
                {RENT_FREQUENCY.map(r => <option key={r}>{r}</option>)}
              </select>

              {/* FURNISHING */}
              <select value={furnishing} onChange={e => setFurnishing(e.target.value)} style={{ border: "1.5px solid #e9d5ff", borderRadius: 8, padding: "5px 8px", fontSize: 11, fontWeight: 700, color: "#5c039c", background: "white", outline: "none", cursor: "pointer", fontFamily: "inherit" }}>
                {FURNISHING_OPTS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>

            {/* AMENITY CHIPS */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 10, borderTop: "1px solid #f5f3ff" }}>
              {AMENITY_CHIPS.map(({ label, icon }) => (
                <button
                  key={label}
                  onClick={() => toggleChip(label)}
                  className={chips.includes(label) ? "chip-active chip-btn" : "chip-btn"}
                  style={{ padding: "4px 10px", borderRadius: 20, border: "1.5px solid " + (chips.includes(label) ? "#5c039c" : "#e9d5ff"), fontSize: 10, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, background: chips.includes(label) ? "#5c039c" : "white", color: chips.includes(label) ? "white" : "#9b5cf6", transition: "all 0.15s", fontFamily: "inherit" }}
                >
                  <span style={{ fontSize: 11 }}>{icon}</span>{label}
                </button>
              ))}
            </div>

            {/* POPULAR AREAS */}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f5f3ff" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 8 }}>Popular:</span>
              {(POPULAR_AREAS[emirate] || []).slice(0, 5).map(area => (
                <button key={area} onClick={() => addTag(area)} style={{ background: "none", border: "none", color: "#7c3aed", fontSize: 11, fontWeight: 700, cursor: "pointer", marginRight: 10, padding: 0, fontFamily: "inherit", textDecoration: "underline", textDecorationColor: "#e9d5ff" }}>
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── RESULTS PAGE ─────────────────────────────────────────────────────────────

function ResultsPage({ searchParams, onBack }) {
  const [sort, setSort] = useState("Best Match");
  const [savedIds, setSavedIds] = useState([]);
  const [filters, setFilters] = useState({});
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(30000);

  const toggleSave = id => setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const filtered = LISTINGS
    .filter(l => !verifiedOnly || l.verified)
    .filter(l => l.priceMonthly <= maxPrice)
    .filter(l => !(filters.types?.length) || filters.types.includes(l.type))
    .filter(l => !(filters.beds?.length) || filters.beds.includes(l.beds))
    .sort((a, b) => {
      if (sort === "Price: Low to High") return a.priceMonthly - b.priceMonthly;
      if (sort === "Price: High to Low") return b.priceMonthly - a.priceMonthly;
      if (sort === "Largest First") return b.size - a.size;
      return 0;
    });

  return (
    <div style={{ background: "#fafafa", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* RESULTS TOPBAR */}
      <div style={{ background: "white", borderBottom: "1.5px solid #f0ebff", padding: "11px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "1.5px solid #e9d5ff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "#5c039c", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}>
          ← New Search
        </button>

        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: "#1e1b4b" }}>{filtered.length} Properties</span>
          <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>
            for Rent in {searchParams.emirate}
            {searchParams.areas?.length > 0 ? " · " + searchParams.areas.join(", ") : ""}
          </span>
        </div>

        {/* QUICK FILTERS */}
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#5c039c", fontWeight: 700, cursor: "pointer" }}>
          <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} style={{ accentColor: "#5c039c" }} />
          Verified Only
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b7280" }}>
          Max AED {maxPrice.toLocaleString()}/mo
          <input type="range" min={3000} max={30000} step={1000} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={{ width: 90, accentColor: "#5c039c" }} />
        </label>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ border: "1.5px solid #e9d5ff", borderRadius: 8, padding: "6px 26px 6px 10px", fontSize: 11, fontWeight: 700, color: "#5c039c", background: "white", outline: "none", cursor: "pointer", fontFamily: "inherit", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%235c039c' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}>
          {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      {/* BREADCRUMB + CONTENT */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 20px", display: "flex", gap: 20 }}>
        <Sidebar filters={filters} setFilters={setFilters} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 14 }}>
            Home &nbsp;/&nbsp; UAE &nbsp;/&nbsp; {searchParams.emirate} &nbsp;/&nbsp;
            <span style={{ color: "#5c039c", fontWeight: 700 }}>{searchParams.areas?.[0] || "All Areas"}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af", background: "white", borderRadius: 14, border: "1.5px solid #f0ebff" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#374151" }}>No listings match your filters</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>Try adjusting the price range or removing some filters</div>
              </div>
            ) : (
              filtered.map(listing => (
                <ListingCard key={listing.id} listing={listing} saved={savedIds.includes(listing.id)} onSave={toggleSave} />
              ))
            )}
          </div>

          {/* QUICK LINKS */}
          <div style={{ background: "white", border: "1.5px solid #f0ebff", borderRadius: 14, padding: "14px 18px", marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#374151", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>People also searched for</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Apartments in JBR", "Villas in Palm Jumeirah", "Chiller Free in Business Bay", "Studios in Downtown", "1 BR near Metro", "Pet Friendly in JVC", "Furnished in DIFC"].map(s => (
                <span key={s} style={{ background: "#f5f3ff", color: "#5c039c", fontSize: 11, fontWeight: 700, borderRadius: 7, padding: "4px 10px", cursor: "pointer" }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function UAERentalApp() {
  const [view, setView] = useState("hero"); // "hero" | "results"
  const [searchParams, setSearchParams] = useState({});

  const handleSearch = (params) => {
    setSearchParams(params);
    setView("results");
  };

  return (
    <>
      {view === "hero" && <HeroSearch onSearch={handleSearch} />}
      {view === "results" && <ResultsPage searchParams={searchParams} onBack={() => setView("hero")} />}
    </>
  );
}