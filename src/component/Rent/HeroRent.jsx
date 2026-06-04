import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiCheck, FiMapPin, FiUsers, FiZap } from "react-icons/fi";
import { MdOutlineElectricBolt, MdOutlineBalcony } from "react-icons/md";
import { BiFridge, BiBuildingHouse } from "react-icons/bi";
import { TbTrees, TbSwimming, TbBarbell, TbParking, TbMountain, TbBuildingSkyscraper } from "react-icons/tb";
import { RiHome4Line } from "react-icons/ri";
import { PiBuildingsBold, PiStar, PiHandCoins } from "react-icons/pi";
import { message } from "antd";

import houseImage from "../../../src/assets/img/buy/house.png";
import bgImage    from "../../../src/assets/img/buy/rent.png";

const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK", "Fujairah", "UAQ"];

const POPULAR_AREAS = {
  Dubai: ["Dubai Marina", "Downtown Dubai", "JBR", "Palm Jumeirah", "Business Bay", "DIFC", "JVC", "Al Barsha", "Deira", "Bur Dubai"],
  "Abu Dhabi": ["Corniche", "Al Reem Island", "Yas Island", "Saadiyat Island", "Khalifa City A", "Al Raha Beach"],
  Sharjah: ["Al Nahda", "Al Majaz", "Al Taawun", "Muwaileh Commercial", "Al Khan"],
  Ajman: ["Al Nuaimiya 1", "Emirates City", "Garden City", "Al Rawda 1"],
  RAK: ["Al Nakheel", "Al Hamra Village", "Mina Al Arab"],
  Fujairah: ["Fujairah City Centre", "Dibba Al Fujairah", "Khor Fakkan"],
  UAQ: ["UAQ City Centre", "Al Salama", "Al Hayl"],
};

const BEDROOMS       = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR", "5+ BR"];
const PROPERTY_TYPES = ["Apartment", "Villa", "Penthouse", "Townhouse"];

const RENT_BUDGETS = [
  "Any Budget", "Below AED 3,000/mo", "AED 3,000 – 6,000/mo",
  "AED 6,000 – 10,000/mo", "AED 10,000 – 20,000/mo", "Above AED 20,000/mo",
];
const BUY_BUDGETS = [
  "Any Budget", "Below AED 500K", "AED 500K – 1M",
  "AED 1M – 2M", "AED 2M – 5M", "AED 5M – 10M", "Above AED 10M",
];
const COMPLETION_STATUS = ["Any", "Ready", "Off-Plan", "Resale"];

const RENT_AMENITIES = [
  { label: "Chiller Free",   Icon: FiZap },
  { label: "DEWA Included",  Icon: MdOutlineElectricBolt },
  { label: "Furnished",      Icon: BiFridge },
  { label: "Pet Friendly",   Icon: TbTrees },
  { label: "Pool",           Icon: TbSwimming },
  { label: "Gym",            Icon: TbBarbell },
  { label: "Parking",        Icon: TbParking },
  { label: "Sea View",       Icon: TbMountain },
  { label: "Balcony",        Icon: RiHome4Line },
  { label: "Maid's Room",    Icon: FiUsers },
  { label: "Near Metro",     Icon: PiBuildingsBold },
  { label: "Kids Play Area", Icon: PiStar },
];

const BUY_AMENITIES = [
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

// ─── SearchBar ────────────────────────────────────────────────────────────────
function SearchBar({ emirate, setEmirate, tags, setTags, locVal, setLocVal, onSearch, searching }) {
  const [showSugg, setShowSugg] = useState(false);

  const suggestions = emirate
    ? (POPULAR_AREAS[emirate] || []).filter(
        (a) => a.toLowerCase().includes(locVal.toLowerCase()) && !tags.includes(a)
      )
    : [];

  const addTag = (name) => {
    if (tags.includes(name)) return;
    setTags([...tags, name]);
    setLocVal("");
    setShowSugg(false);
  };
  const removeTag = (name) => setTags(tags.filter((t) => t !== name));

  return (
    <div style={{ position: "relative", marginBottom: 20 }}>
      <div className="hero-search-row">
        {/* Inner bordered container */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          border: "1px solid #547593",
          borderRadius: 5,
          background: "white",
          padding: 2,
          gap: 4,
          flex: 1,
          minWidth: 0,
        }}>
          {/* Emirate select */}
          <select
            value={emirate}
            onChange={(e) => { setEmirate(e.target.value); setTags([]); setLocVal(""); }}
            style={{
              border: "none",
              borderRight: "2px solid #f5edff",
              outline: "none",
              background: "transparent",
              padding: "10px 8px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              flexShrink: 0,
              alignSelf: "flex-start",
              marginTop: 2,
              color: emirate ? "#334155" : "#94a3b8",
              minWidth: 110,
              maxWidth: 130,
            }}
          >
            <option value="" disabled>Emirate</option>
            {EMIRATES.map((em) => <option key={em} value={em}>{em}</option>)}
          </select>

          {/* Tags + input */}
          <div style={{
            flex: 1,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 6,
            padding: "6px 8px",
            minWidth: 0,
            minHeight: 40,
          }}>
            {tags.map((tag) => (
              <div key={tag} style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "#ede9fe",
                color: "#547593",
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 20,
                flexShrink: 0,
              }}>
                {tag}
                <span
                  onClick={() => removeTag(tag)}
                  style={{ cursor: "pointer", color: "#9b5cf6", fontSize: 15, lineHeight: 1 }}
                >×</span>
              </div>
            ))}

            <input
              value={locVal}
              onChange={(e) => { setLocVal(e.target.value); setShowSugg(true); }}
              onFocus={() => setShowSugg(true)}
              onBlur={() => setTimeout(() => setShowSugg(false), 180)}
              placeholder={
                !emirate ? "Select emirate first..." :
                tags.length === 0 ? "Area, building, landmark..." :
                "Add more areas..."
              }
              disabled={!emirate}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                padding: "4px 4px",
                fontSize: 14,
                color: "#334155",
                minWidth: 80,
                flex: 1,
                fontFamily: "inherit",
                cursor: !emirate ? "not-allowed" : "text",
                opacity: !emirate ? 0.5 : 1,
              }}
            />
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={onSearch}
          className="hero-search-btn"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "10px 20px",
            borderRadius: 8,
            border: "1px solid #5C039B",
            backgroundColor: searching ? "#3b0275" : "#5C039B",
            color: "white",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: "pointer",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(92,3,156,0.25)",
            transition: "all 0.2s ease",
            height: 43,
            minWidth: 110,
            alignSelf: "flex-start",
            marginTop: 2,
          }}
        >
          {searching ? <><FiCheck size={16} /> Searching…</> : <><FiSearch size={16} /> Search</>}
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSugg && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
          background: "white", border: "1px solid #e9d5ff",
          borderRadius: 14, zIndex: 200,
          boxShadow: "0 12px 40px rgba(92,3,156,0.15)",
          maxHeight: 220, overflowY: "auto",
        }}>
          {suggestions.slice(0, 8).map((s) => (
            <div key={s} onMouseDown={() => addTag(s)} style={{
              padding: "11px 18px", fontSize: 13, color: "#334155",
              fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              borderBottom: "1px solid #f5edff",
            }}>
              <FiMapPin size={14} color="#a855f7" /> {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PropertyTypeRow ──────────────────────────────────────────────────────────
function PropertyTypeRow({ activeType, setActiveType }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#020202", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
        Property Type
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {PROPERTY_TYPES.map((t) => (
          <button key={t} onClick={() => setActiveType((prev) => prev === t ? "" : t)} style={{
            padding: "7px 16px",
            border: `1px solid ${activeType === t ? "#5C039B" : "#547593"}`,
            borderRadius: 5, cursor: "pointer", fontSize: 13, fontWeight: 600,
            color: activeType === t ? "white" : "#64748b",
            background: activeType === t ? "#5C039B" : "white",
            fontFamily: "inherit", transition: "all 0.15s",
          }}>{t}</button>
        ))}
      </div>
    </div>
  );
}

// ─── BedsAndBudget ────────────────────────────────────────────────────────────
function BedsAndBudget({ beds, setBeds, budget, setBudget, budgetList }) {
  const selectStyle = {
    flex: 1, border: "1px solid #547593", borderRadius: 10,
    padding: "10px 12px", fontSize: 13, fontWeight: 700,
    color: "#547593", background: "white", outline: "none",
    cursor: "pointer", fontFamily: "inherit", minWidth: 0,
  };
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
      <select value={beds} onChange={(e) => setBeds(e.target.value)} style={selectStyle}>
        <option value="Any">Any Beds</option>
        {BEDROOMS.map((b) => <option key={b}>{b}</option>)}
      </select>
      <select value={budget} onChange={(e) => setBudget(e.target.value)} style={selectStyle}>
        {budgetList.map((b) => <option key={b}>{b}</option>)}
      </select>
    </div>
  );
}

// ─── AmenityChips ─────────────────────────────────────────────────────────────
function AmenityChips({ amenities, chips, setChips }) {
  const toggle = (c) => setChips((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  return (
    <div style={{ paddingTop: 14, borderTop: "2px solid #f5f3ff", marginBottom: 14 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#020202", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
        Must-have Amenities
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {amenities.map(({ label, Icon }) => (
          <button key={label} onClick={() => toggle(label)} style={{
            padding: "6px 12px", borderRadius: 5,
            border: `1px solid ${chips.includes(label) ? "#5C039B" : "#547593"}`,
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
            background: chips.includes(label) ? "#5C039B" : "white",
            color: chips.includes(label) ? "white" : "#547593",
            fontFamily: "inherit", transition: "all 0.15s",
          }}>
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── RentForm ─────────────────────────────────────────────────────────────────
function RentForm() {
  const navigate = useNavigate();
  const [emirate,    setEmirate]    = useState("");
  const [tags,       setTags]       = useState([]);
  const [locVal,     setLocVal]     = useState("");
  const [activeType, setActiveType] = useState("");
  const [beds,       setBeds]       = useState("Any");
  const [budget,     setBudget]     = useState("Any Budget");
  const [chips,      setChips]      = useState([]);
  const [searching,  setSearching]  = useState(false);

  const handleSearch = () => {
    let finalTags = [...tags];
    if (locVal.trim()) finalTags.push(locVal.trim());
    if (!emirate) { message.warning("Please select an emirate first"); return; }
    if (finalTags.length === 0) { message.warning("Please enter or select a location"); return; }
    setSearching(true);
    navigate("/results", {
      state: { emirate, tags: finalTags, activeType, beds, budget, amenities: chips, mode: "rent" },
    });
  };

  return (
    <>
      <SearchBar emirate={emirate} setEmirate={setEmirate} tags={tags} setTags={setTags}
        locVal={locVal} setLocVal={setLocVal} onSearch={handleSearch} searching={searching} />
      <PropertyTypeRow activeType={activeType} setActiveType={setActiveType} />
      <BedsAndBudget beds={beds} setBeds={setBeds} budget={budget} setBudget={setBudget} budgetList={RENT_BUDGETS} />
      <AmenityChips amenities={RENT_AMENITIES} chips={chips} setChips={setChips} />
    </>
  );
}

// ─── BuyForm ──────────────────────────────────────────────────────────────────
function BuyForm() {
  const navigate = useNavigate();
  const [emirate,    setEmirate]    = useState("");
  const [tags,       setTags]       = useState([]);
  const [locVal,     setLocVal]     = useState("");
  const [activeType, setActiveType] = useState("");
  const [beds,       setBeds]       = useState("Any");
  const [budget,     setBudget]     = useState("Any Budget");
  const [completion, setCompletion] = useState("Any");
  const [chips,      setChips]      = useState([]);
  const [searching,  setSearching]  = useState(false);

  const handleSearch = () => {
    let finalTags = [...tags];
    if (locVal.trim()) finalTags.push(locVal.trim());
    if (!emirate) { message.warning("Please select an emirate first"); return; }
    if (finalTags.length === 0) { message.warning("Please enter or select a location"); return; }
    setSearching(true);
    navigate("/buy-results", {
      state: { emirate, tags: finalTags, activeType, beds, budget, completion, amenities: chips, mode: "buy" },
    });
  };

  return (
    <>
      <SearchBar emirate={emirate} setEmirate={setEmirate} tags={tags} setTags={setTags}
        locVal={locVal} setLocVal={setLocVal} onSearch={handleSearch} searching={searching} />
      <PropertyTypeRow activeType={activeType} setActiveType={setActiveType} />
      <BedsAndBudget beds={beds} setBeds={setBeds} budget={budget} setBudget={setBudget} budgetList={BUY_BUDGETS} />

      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#020202", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Completion Status
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {COMPLETION_STATUS.map((s) => (
            <button key={s} onClick={() => setCompletion(s)} style={{
              padding: "7px 14px",
              border: `1px solid ${completion === s ? "#5C039B" : "#547593"}`,
              borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 600,
              color: completion === s ? "white" : "#64748b",
              background: completion === s ? "#5C039B" : "white",
              fontFamily: "inherit", transition: "all 0.15s",
            }}>{s}</button>
          ))}
        </div>
      </div>

      <AmenityChips amenities={BUY_AMENITIES} chips={chips} setChips={setChips} />
    </>
  );
}

// ─── Main Hero ────────────────────────────────────────────────────────────────
export default function HeroSearch({ onSellClick }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("buy");

  const TAB_BTN = (label, value) => (
    <button
      key={value}
      onClick={() => setMode(value)}
      className="hero-tab-btn"
      style={{
        flex: 1,
        height: 43,
        background: mode === value ? "#5C039B" : "transparent",
        color: mode === value ? "white" : "#547593",
        border: mode === value ? "none" : "1px solid #547593",
        fontWeight: 700, fontSize: 14,
        borderRadius: 6, cursor: "pointer",
        fontFamily: "inherit", transition: "all 0.15s",
      }}
    >{label}</button>
  );

  return (
    <>
      <style>{`
        .hero-outer {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 16px;
          background-image: url(${bgImage});
          background-size: cover;
          background-position: center;
          background-color: #4C1D95;
          font-family: 'DM Sans', sans-serif;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(76,29,149,0.7), rgba(49,46,129,0.6), rgba(30,58,138,0.7));
        }
        .hero-grid {
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
          position: relative;
          z-index: 10;
          padding-top: 80px;
          padding-bottom: 40px;
        }
        .hero-left {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .hero-house-img {
          width: min(577px, 100%);
          height: auto;
        }
        .hero-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0px 20px 50px rgba(92,3,155,0.38);
          padding: 32px;
          width: 100%;
          box-sizing: border-box;
        }
        .hero-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        .hero-sell-btn {
          margin-left: auto;
          height: 43px;
          background: #5C039B;
          color: white;
          border: none;
          font-weight: 700;
          font-size: 14px;
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
          padding: 0 16px;
          white-space: nowrap;
        }
        .hero-search-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          flex-wrap: nowrap;
        }

        /* ── Tablet (≤ 1024px) ── */
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr 1fr;
            gap: 28px;
            padding-top: 90px;
          }
          .hero-card {
            padding: 24px;
          }
        }

        /* ── Mobile (≤ 768px) ── */
        @media (max-width: 768px) {
          .hero-outer {
            padding: 16px 12px;
            align-items: flex-start;
          }
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 24px;
            padding-top: 70px;
            padding-bottom: 32px;
          }
          .hero-left {
            gap: 16px;
            align-items: center;
            text-align: center;
          }
          .hero-house-img {
            width: min(320px, 90%);
          }
          .hero-card {
            padding: 20px 16px;
          }
          .hero-tabs {
            gap: 8px;
          }
          .hero-search-row {
            flex-wrap: wrap;
          }
          .hero-search-btn {
            width: 100% !important;
            margin-top: 6px !important;
            align-self: stretch !important;
          }
        }

        /* ── Small mobile (≤ 480px) ── */
        @media (max-width: 480px) {
          .hero-grid {
            padding-top: 64px;
          }
          .hero-card {
            padding: 16px 12px;
          }
          .hero-sell-btn {
            font-size: 12px;
            padding: 0 10px;
          }
          .hero-tabs {
            gap: 6px;
          }
        }
      `}</style>

      <div id="rent" className="hero-outer">
        <div className="hero-overlay" />

        <div className="hero-grid">

          {/* ── LEFT: Headline + house image ── */}
          <div className="hero-left">
            <div>
              <h1 className="font-dm text-white font-semibold text-[36px] md:text-[48px] lg:text-[60px] leading-[42px] md:leading-[56px] lg:leading-[68px] tracking-[-0.03em]">
                Your Property<br />Journey starts here!!
              </h1>
              <p style={{
                color: "white", fontWeight: 600,
                fontSize: "clamp(16px, 2vw, 24px)",
                lineHeight: 1.38, marginTop: 16, marginBottom: 0,
              }}>
                Buy, Rent or Sell – all in one place
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
              <img src={houseImage} alt="Property House" className="hero-house-img" />
            </div>
          </div>

          {/* ── RIGHT: Search card ── */}
          <div className="hero-card">

            <div className="mb-6">
              <h2 className="font-dm font-semibold text-[32px] leading-[38px] md:text-[40px] md:leading-[44px] text-[#020202]">
                Search Properties <br />
                <span className="text-[18px] md:text-[24px] leading-[28px] text-[#020202]">
                  Verified homes • Immediate move-in
                </span>
              </h2>
            </div>

            {/* Tabs */}
            <div className="hero-tabs">
              {TAB_BTN("Buy",  "buy")}
              {TAB_BTN("Rent", "rent")}
              <button onClick={onSellClick} className="hero-sell-btn">
                Want to sell?
              </button>
            </div>

            {/* Dynamic form */}
            {mode === "rent" ? <RentForm /> : <BuyForm />}
          </div>
        </div>
      </div>
    </>
  );
}