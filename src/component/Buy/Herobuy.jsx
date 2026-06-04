import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiCheck, FiMapPin, FiUsers } from "react-icons/fi";
import { MdOutlineBalcony } from "react-icons/md";
import { TbSwimming, TbBarbell, TbParking, TbMountain, TbBuildingSkyscraper } from "react-icons/tb";
import { RiGovernmentLine, RiHome4Line } from "react-icons/ri";
import { PiBuildingsBold, PiStar, PiHandCoins } from "react-icons/pi";
import { BiBuildingHouse } from "react-icons/bi";
import { message } from "antd";

const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK", "Fujairah", "UAQ"];

const POPULAR_AREAS = {
  Dubai: ["Dubai Marina", "Downtown Dubai", "JBR", "Palm Jumeirah", "Business Bay", "DIFC", "JVC", "Al Barsha"],
  "Abu Dhabi": ["Corniche", "Al Reem Island", "Yas Island", "Saadiyat Island"],
  Sharjah: ["Al Nahda", "Al Majaz", "Al Taawun"],
  Ajman: ["Al Nuaimiya 1", "Emirates City", "Garden City"],
  RAK: ["Al Nakheel", "Al Hamra Village", "Mina Al Arab"],
  Fujairah: ["Fujairah City Centre", "Dibba Al Fujairah", "Khor Fakkan"],
  UAQ: ["UAQ City Centre", "Al Salama", "Al Hayl"],
};

const BEDROOMS          = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR", "5+ BR"];
const PROPERTY_TYPES    = ["Apartment", "Villa", "Penthouse", "Townhouse"];
const BUDGET_RANGES     = ["Any Budget", "Below AED 500K", "AED 500K – 1M", "AED 1M – 2M", "AED 2M – 5M", "AED 5M – 10M", "Above AED 10M"];
const COMPLETION_STATUS = ["Any", "Ready", "Off-Plan", "Resale"];

const AMENITY_CHIPS_DATA = [
  { label: "Pool",           Icon: TbSwimming },
  { label: "Gym",            Icon: TbBarbell },
  { label: "Parking",        Icon: TbParking },
  { label: "Sea View",       Icon: TbMountain },
  { label: "Balcony",        Icon: RiHome4Line },
  { label: "Maid's Room",    Icon: FiUsers },
  { label: "Near Metro",     Icon: PiBuildingsBold },
  { label: "Kids Play Area", Icon: PiStar },
  { label: "Payment Plan",   Icon: PiHandCoins },
  { label: "Mortgage Ready", Icon: BiBuildingHouse },
  { label: "High ROI",       Icon: TbBuildingSkyscraper },
  { label: "Corner Unit",    Icon: MdOutlineBalcony },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=DM+Sans:wght@400;500;600;700&display=swap');

  .hero-buy-root {
    background: linear-gradient(160deg, #0f0c29 0%, #1c77c7 58%, #e8f4fd 100%);
    font-family: 'DM Sans', sans-serif;
  }

  .hero-buy-grid {
    max-width: 1200px;
    margin: 0 auto;
    padding: 52px 32px 80px;
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 56px;
    align-items: start;
  }

.hero-buy-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 66px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -1px;
  color: white;
}

  .hero-buy-card {
    background: white;
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 32px 100px rgba(15,12,41,0.4);
    width: 100%;
    box-sizing: border-box;
  }

  .hero-buy-stats {
    display: flex;
    gap: 32px;
    align-items: center;
    margin-bottom: 40px;
  }

  .hero-buy-searchbar {
    display: flex;
    align-items: center;
    border: 2px solid #e9d5ff;
    border-radius: 20px;
    background: white;
    box-shadow: 0 8px 24px rgba(92,3,156,0.06);
    margin-bottom: 24px;
    position: relative;
    padding: 3px;
    flex-wrap: wrap;
    gap: 0;

  }

  .hero-buy-emirate-select {
    border: none;
    border-right: 2px solid #f5edff;
    outline: none;
    background: transparent;
    padding: 12px 16px;
    font-size: 15px;
    font-weight: 700;
    color: #334155;
    cursor: pointer;
    font-family: inherit;
    flex-shrink: 0;
  }

  .hero-buy-quick-dropdowns {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .hero-buy-quick-dropdowns select {
    flex: 1;
  }

  .hero-buy-completion {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  /* ── TABLET ── */
  @media (max-width: 900px) {
    .hero-buy-grid {
      grid-template-columns: 1fr;
      padding: 40px 24px 60px;
      gap: 36px;
    }
    .hero-buy-title {
      font-size: 46px;
    }
    .hero-buy-card {
      height: auto !important;
    }
    .hero-buy-hero-left {
      padding-bottom: 0 !important;
    }
  }

  /* ── MOBILE ── */
  @media (max-width: 600px) {
    .hero-buy-grid {
      padding: 28px 16px 48px;
      gap: 28px;
    }
    .hero-buy-title {
      font-size: 34px;
      margin-bottom: 14px;
    }
    .hero-buy-stats {
      gap: 20px;
      margin-bottom: 28px;
    }
    .hero-buy-stats-num {
      font-size: 20px !important;
    }
    .hero-buy-card {
      padding: 18px 16px;
      border-radius: 18px;
      height: auto !important;
    }
    .hero-buy-card h2 {
      font-size: 20px !important;
    }
    .hero-buy-emirate-select {
      font-size: 12px;
      padding: 10px 10px;
      min-width: unset !important;
    }
      .hero-buy-emirate-select {
  align-self: flex-start;
  margin-top: 2px;
}
    .hero-buy-searchbtn {
      padding: 12px 18px !important;
      font-size: 13px !important;
      width: 100%;
      justify-content: center;
      border-radius: 12px !important;
      margin-top: 4px;
    }
    .hero-buy-searchbar {
      flex-wrap: wrap;
    }
    .hero-buy-quick-dropdowns {
      flex-direction: column;
    }
    .hero-buy-quick-dropdowns select {
      width: 100%;
    }
    .hero-buy-badge {
      padding: 10px 14px !important;
    }
    .hero-buy-badge-title {
      font-size: 12px !important;
    }
    .hero-buy-badge-sub {
      font-size: 11px !important;
    }
  }
`;

export default function HeroBuy() {
  const navigate = useNavigate();

  const [emirate, setEmirate] = useState("");
  const [tags,       setTags]       = useState([]);
  const [locVal,     setLocVal]     = useState("");
  const [showSugg,   setShowSugg]   = useState(false);
  const [activeType, setActiveType] = useState("");
  const [beds,       setBeds]       = useState("Any");
  const [budget,     setBudget]     = useState("Any Budget");
  const [completion, setCompletion] = useState("Any");
  const [chips,      setChips]      = useState([]);
  const [searching,  setSearching]  = useState(false);

  const suggestions = (POPULAR_AREAS[emirate] || []).filter(
    (a) => a.toLowerCase().includes(locVal.toLowerCase()) && !tags.includes(a)
  );

const addTag = (name) => {
  if (tags.includes(name)) return;
  setTags([...tags, name]);
  setLocVal("");
  setShowSugg(false);
};
  const removeTag  = (name) => setTags(tags.filter((t) => t !== name));
  const toggleChip = (c) =>
    setChips((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const handleSearch = () => {
    let finalTags = [...tags];
    if (locVal.trim()) finalTags.push(locVal.trim()); finalTags.push(locVal.trim());
   if (!emirate) {
  message.warning("Please select an emirate first");
  return;
}

if (finalTags.length === 0) {
  message.warning("Please enter or select a location");
  return;
}
    navigate("/buy-results", {
      state: { emirate, tags: finalTags, activeType, beds, budget, completion, amenities: chips },
    });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="hero-buy-root">
        <div className="hero-buy-grid">

          {/* ── LEFT HERO COPY ── */}
          <div className="hero-buy-hero-left" style={{ paddingBottom: 60 }}>
            <h1 className="hero-buy-title">
              Buy Your<br />
              <span style={{ color: "#c084fc" }}>Dream</span> Home<br />
              in the UAE
            </h1>

            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 36, maxWidth: 380 }}>
              Invest in Dubai, Abu Dhabi &amp; beyond.<br />
              Direct developer connect. DLD-approved.
            </p>

            {/* <div className="hero-buy-stats">
              {[["18,200+", "Listings"], ["54K+", "Investors"]].map(([n, l], i) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 32 }}>
                  <div>
                    <div
                      className="hero-buy-stats-num"
                      style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "#c084fc" }}
                    >
                      {n}
                    </div>
                    <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(192,132,252,0.6)", marginTop: 4 }}>
                      {l}
                    </div>
                  </div>
                  {i < 1 && (
                    <div style={{ width: 1, height: 44, background: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div> */}

            <div
              className="hero-buy-badge"
              style={{
                display: "inline-flex", alignItems: "center", gap: 12,
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 14, padding: "12px 20px",
              }}
            >
              <RiGovernmentLine size={24} color="#a78bfa" style={{ flexShrink: 0 }} />
              <div>
                <div className="hero-buy-badge-title" style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.95)" }}>
                  DLD &amp; RERA Approved
                </div>
                <div className="hero-buy-badge-sub" style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  All listings verified with Dubai Land Department
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT SEARCH PANEL ── */}
          <div className="hero-buy-card">
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1e1b4b", lineHeight: 1.3, marginBottom: 6, letterSpacing: "-0.5px" }}>
                Search <span style={{ borderBottom: "4px solid #c084fc", paddingBottom: 2, color: "#7c3aed" }}>Properties</span>
              </h2>
              <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Verified listings · Mortgage assistance</p>
            </div>

            {/* Search Bar */}
            <div style={{ position: "relative", marginBottom: 24 }}>
              <div className="hero-buy-searchbar">
                <div style={{ borderRight: "2px solid #f5edff", paddingRight: 8, display: "flex", alignItems: "center", alignSelf: "stretch" }}>
<select
  value={emirate}
  onChange={(e) => { setEmirate(e.target.value); setTags([]); setLocVal(""); }}
  className="hero-buy-emirate-select"
  style={{ minWidth: 110, color: emirate ? "#334155" : "#94a3b8" }}
>
  <option value="" disabled>Select Emirate</option> {/* 🔥 ADD THIS */}
  {EMIRATES.map((em) => (
    <option key={em} value={em}>{em}</option>
  ))}
</select>
                </div>

                <div style={{
                  flex: 1, display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 12px", flexWrap: "wrap", minHeight: 48, minWidth: 0,
                }}>
                  {tags.map((tag) => (
                    <div key={tag} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: "#ede9fe", color: "#5c039c",
                      fontSize: 12, fontWeight: 700,
                      padding: "4px 12px", borderRadius: 20, flexShrink: 0,
                    }}>
                      {tag}
                      <span onClick={() => removeTag(tag)} style={{ cursor: "pointer", color: "#9b5cf6", fontSize: 15, lineHeight: 1 }}>×</span>
                    </div>
                  ))}
<input
  value={locVal}
  onChange={(e) => { setLocVal(e.target.value); setShowSugg(true); }}
  onFocus={() => setShowSugg(true)}
  onBlur={() => setTimeout(() => setShowSugg(false), 180)}
  placeholder={
    !emirate ? "Select emirate first..." :
    tags.length === 0 ? "Enter area, building, landmark..." :
    "Add more areas..."
  }
  disabled={!emirate}
  style={{
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "6px 4px",
    fontSize: 14,
    color: "#334155",
    minWidth: 100,
    fontFamily: "inherit",
    cursor: !emirate ? "not-allowed" : "text",
    opacity: !emirate ? 0.5 : 1,
  }}
/>
                </div>

                <button
                  onClick={handleSearch}
                  className="hero-buy-searchbtn"
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "14px 24px", background: searching ? "#3b0275" : "#5c039c",
                    color: "white", border: "none", fontSize: 14, fontWeight: 700,
                    cursor: "pointer", flexShrink: 0, fontFamily: "inherit",
                    borderRadius: "14px", boxShadow: "0 6px 16px rgba(92,3,156,0.25)",
                    transition: "all 0.2s",
                  }}
                >
                  {searching ? <><FiCheck size={16} /> Searching…</> : <><FiSearch size={16} /> Search</>}
                </button>
              </div>

              {showSugg && suggestions.length > 0 && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
                  background: "white", border: "2px solid #e9d5ff",
                  borderRadius: 16, zIndex: 200,
                  boxShadow: "0 12px 40px rgba(92,3,156,0.15)",
                  maxHeight: 220, overflowY: "auto",
                }}>
                  {suggestions.slice(0, 6).map((s) => (
                    <div key={s} onMouseDown={() => addTag(s)} style={{
                      padding: "12px 18px", fontSize: 13, color: "#334155",
                      fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 10,
                      borderBottom: "1px solid #f5edff",
                    }}>
                      <FiMapPin size={14} color="#a855f7" /> {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Property Types */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Property Type
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {PROPERTY_TYPES.map((t) => (
                  <button key={t} onClick={() => setActiveType((prev) => prev === t ? "" : t)} style={{
                    padding: "7px 16px",
                    border: `2px solid ${activeType === t ? "#5c039c" : "#e9d5ff"}`,
                    borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
                    color: activeType === t ? "white" : "#64748b",
                    background: activeType === t ? "#5c039c" : "white",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Beds + Budget */}
            <div className="hero-buy-quick-dropdowns" style={{ marginBottom: 16 }}>
              
              <select value={beds} onChange={(e) => setBeds(e.target.value)} style={{
                flex: 1, border: "2px solid #e9d5ff", borderRadius: 10,
                padding: "10px 12px", fontSize: 13, fontWeight: 700,
                color: "#5c039c", background: "white", outline: "none",
                cursor: "pointer", fontFamily: "inherit",
              }}>
                <option value="Any">Any Beds</option>
                {BEDROOMS.map((b) => <option key={b}>{b}</option>)}
              </select>
              <select value={budget} onChange={(e) => setBudget(e.target.value)} style={{
                flex: 1, border: "2px solid #e9d5ff", borderRadius: 10,
                padding: "10px 12px", fontSize: 13, fontWeight: 700,
                color: "#5c039c", background: "white", outline: "none",
                cursor: "pointer", fontFamily: "inherit",
              }}>
                {BUDGET_RANGES.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>

            {/* Completion Status */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Completion Status
              </div>
              <div className="hero-buy-completion">
                {COMPLETION_STATUS.map((s) => (
                  <button key={s} onClick={() => setCompletion(s)} style={{
                    padding: "7px 14px",
                    border: `2px solid ${completion === s ? "#5c039c" : "#e9d5ff"}`,
                    borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600,
                    color: completion === s ? "white" : "#64748b",
                    background: completion === s ? "#5c039c" : "white",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenity Chips */}
            <div style={{ paddingTop: 16, borderTop: "2px solid #f5f3ff", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Must-have Features
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {AMENITY_CHIPS_DATA.map(({ label, Icon }) => (
                  <button key={label} onClick={() => toggleChip(label)} style={{
                    padding: "6px 12px", borderRadius: 20,
                    border: `2px solid ${chips.includes(label) ? "#5c039c" : "#e9d5ff"}`,
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 5,
                    background: chips.includes(label) ? "#5c039c" : "white",
                    color: chips.includes(label) ? "white" : "#9b5cf6",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}>
                    <Icon size={12} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Areas */}
            <div style={{ paddingTop: 14, borderTop: "2px solid #f5f3ff" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginRight: 8 }}>
                Popular in {emirate}:
              </span>
              <div style={{ display: "inline", flexWrap: "wrap" }}>
                {(POPULAR_AREAS[emirate] || []).slice(0, 4).map((area) => (
                  <button key={area} onClick={() => addTag(area)} style={{
                    background: "none", border: "none", color: "#7c3aed",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    marginRight: 10, padding: 0, fontFamily: "inherit",
                    textDecoration: "underline", textDecorationColor: "#e9d5ff",
                  }}>
                    {area}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}