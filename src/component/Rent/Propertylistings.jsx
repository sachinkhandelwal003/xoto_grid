import { useState } from "react";
import {
  FiHeart, FiShare2, FiMapPin, FiSearch, FiSliders,
  FiChevronDown, FiCheck, FiList,
  FiCamera, FiPhone, FiCalendar, FiMaximize2,
  FiStar, FiZap, FiShield, FiArrowRight, FiX,
  FiTrendingUp, FiVideo, FiEye
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { BiBed, BiFridge } from "react-icons/bi";
import { HiOutlineUsers, HiOutlineSparkles } from "react-icons/hi2";
import { TbParking, TbSwimming, TbWifi, TbBarbell, TbTrees } from "react-icons/tb";
import { PiBuildingsBold } from "react-icons/pi";
import { LuMap } from "react-icons/lu";
import { RiSave3Line, RiHome4Line } from "react-icons/ri";

const LISTINGS = [
  {
    id: 1,
    title: "Luxury 3 BHK Apartment in Indiranagar",
    location: "100ft Road, Near Metro Station, Indiranagar",
    price: 65000,
    deposit: 300000,
    size: 1850,
    type: "Apartment",
    bhk: "3 BHK",
    furnishing: "Fully Furnished",
    tenants: "Family",
    available: "Immediate",
    amenities: ["Pool", "Gym", "Parking", "Balcony"],
    photoCount: 15,
    verified: true,
    badge: "Zero Brokerage",
    badgeColor: "#0f766e",
    rating: 4.8,
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    agentName: "Ravi Kumar",
    agentAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    tour: "Property tour at 12:00 PM Today",
  },
  {
    id: 2,
    title: "Spacious 2 BHK in Koramangala 4th Block",
    location: "Near Sony World Signal, Koramangala",
    price: 42000,
    deposit: 200000,
    size: 1200,
    type: "Apartment",
    bhk: "2 BHK",
    furnishing: "Semi Furnished",
    tenants: "Family / Singles",
    available: "15-May-2026",
    amenities: ["Balcony", "Parking", "Power Backup"],
    photoCount: 8,
    verified: true,
    badge: "Owner Direct",
    badgeColor: "#1d4ed8",
    rating: 4.5,
    img: "https://images.unsplash.com/photo-1502672260266-1c1e5250ce07?w=800&q=80",
    agentName: "Meera Shah",
    agentAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    tour: null,
  },
  {
    id: 3,
    title: "Premium Studio Apartment in Whitefield",
    location: "ITPL Main Road, Whitefield",
    price: 22000,
    deposit: 100000,
    size: 550,
    type: "Studio",
    bhk: "1 RK",
    furnishing: "Fully Furnished",
    tenants: "Singles / Couples",
    available: "Immediate",
    amenities: ["Gym", "WiFi", "Parking"],
    photoCount: 12,
    verified: false,
    badge: null,
    badgeColor: null,
    rating: 4.2,
    img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    agentName: "Arjun Nair",
    agentAvatar: "https://randomuser.me/api/portraits/men/55.jpg",
    tour: "Property tour at 3:00 PM Today",
  },
  {
    id: 4,
    title: "4 BHK Independent Villa in HSR Layout",
    location: "Sector 2, Near NIFT, HSR Layout",
    price: 85000,
    deposit: 400000,
    size: 3200,
    type: "Villa",
    bhk: "4 BHK",
    furnishing: "Furnished",
    tenants: "Family",
    available: "01-Jun-2026",
    amenities: ["Garden", "Parking", "Power Backup"],
    photoCount: 24,
    verified: true,
    badge: "Zero Brokerage",
    badgeColor: "#0f766e",
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    agentName: "Priya Menon",
    agentAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
    tour: null,
  },
  {
    id: 5,
    title: "Modern 1 BHK in Jayanagar 9th Block",
    location: "Near Central Mall, Jayanagar",
    price: 28000,
    deposit: 120000,
    size: 680,
    type: "Apartment",
    bhk: "1 BHK",
    furnishing: "Semi Furnished",
    tenants: "Family / Singles",
    available: "Immediate",
    amenities: ["Parking", "Balcony"],
    photoCount: 6,
    verified: true,
    badge: "Owner Direct",
    badgeColor: "#1d4ed8",
    rating: 4.3,
    img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    agentName: "Karan Verma",
    agentAvatar: "https://randomuser.me/api/portraits/men/71.jpg",
    tour: "Property tour at 5:00 PM Today",
  },
];

const AMENITY_ICONS = {
  "Pool":          <TbSwimming size={11} />,
  "Gym":           <TbBarbell size={11} />,
  "Parking":       <TbParking size={11} />,
  "Garden":        <TbTrees size={11} />,
  "Balcony":       <RiHome4Line size={11} />,
  "Power Backup":  <FiZap size={11} />,
  "WiFi":          <TbWifi size={11} />,
};

const AMENITY_COLORS = {
  "Pool":          { bg: "#e0f2fe", color: "#0369a1" },
  "Gym":           { bg: "#dcfce7", color: "#15803d" },
  "Parking":       { bg: "#f3e8ff", color: "#7e22ce" },
  "Garden":        { bg: "#fef3c7", color: "#b45309" },
  "Balcony":       { bg: "#ffe4e6", color: "#be123c" },
  "Power Backup":  { bg: "#d1fae5", color: "#047857" },
  "WiFi":          { bg: "#dbeafe", color: "#1d4ed8" },
};

function ListingCard({ listing, saved, onSave }) {
  const [contacted, setContacted] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      style={{
        background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20,
        overflow: "hidden", display: "flex",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.25s, transform 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 40px rgba(15,118,110,0.13)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* IMAGE */}
      <div style={{ width: 248, flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <img
          src={imgError ? "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=85" : listing.img}
          alt={listing.title}
          onError={() => setImgError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: 210 }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,0.62) 100%)" }} />

        {listing.badge && (
          <div style={{
            position: "absolute", top: 12, left: 12, background: listing.badgeColor,
            color: "white", fontSize: 9.5, fontWeight: 700, borderRadius: 8,
            padding: "4px 10px", letterSpacing: "0.07em", textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <FiShield size={9} /> {listing.badge}
          </div>
        )}

        <div style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(255,255,255,0.93)", backdropFilter: "blur(8px)",
          borderRadius: 8, padding: "3px 8px",
          display: "flex", alignItems: "center", gap: 4,
          fontSize: 11, fontWeight: 700, color: "#b45309",
        }}>
          <FiStar size={10} fill="#f59e0b" stroke="#f59e0b" /> {listing.rating}
        </div>

        <div style={{
          position: "absolute", bottom: 10, left: 10,
          background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)",
          color: "white", fontSize: 10, fontWeight: 600,
          borderRadius: 6, padding: "3px 9px",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <FiCamera size={10} /> {listing.photoCount} Photos
        </div>

        {listing.tour && (
          <div style={{
            position: "absolute", bottom: 10, right: 10,
            background: "rgba(15,118,110,0.92)", backdropFilter: "blur(4px)",
            color: "white", fontSize: 9.5, fontWeight: 700,
            borderRadius: 6, padding: "3px 9px",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <FiVideo size={10} /> Tour
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Title */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.35 }}>{listing.title}</span>
              {listing.verified && <MdVerified size={16} color="#0f766e" />}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b", fontSize: 12 }}>
              <FiMapPin size={12} color="#0f766e" /> {listing.location}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 12 }}>
            <button onClick={() => onSave(listing.id)} style={{
              background: saved ? "#fff0f0" : "#f8fafc",
              border: `1.5px solid ${saved ? "#fca5a5" : "#e2e8f0"}`,
              borderRadius: 10, padding: "7px", cursor: "pointer",
              display: "flex", alignItems: "center", transition: "all 0.2s",
            }}>
              <FiHeart size={14} color={saved ? "#ef4444" : "#94a3b8"} fill={saved ? "#ef4444" : "none"} />
            </button>
            <button style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "7px", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <FiShare2 size={14} color="#94a3b8" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", padding: "10px 0" }}>
          {[
            { value: `₹${listing.price.toLocaleString()}/mo`, label: "Monthly Rent",     icon: <FiTrendingUp size={11} /> },
            { value: `₹${listing.deposit.toLocaleString()}`,  label: "Security Deposit", icon: <FiShield size={11} /> },
            { value: `${listing.size} sqft`,                  label: "Builtup Area",     icon: <FiMaximize2 size={11} /> },
          ].map((s, i) => (
            <div key={i} style={{ borderRight: i < 2 ? "1px solid #f1f5f9" : "none", paddingLeft: i > 0 ? 16 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                <span style={{ color: "#0f766e" }}>{s.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{s.value}</span>
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.09em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
          {[
            { icon: <BiBed size={14} />,         label: "Property Type",    value: `${listing.bhk} ${listing.type}` },
            { icon: <BiFridge size={14} />,       label: "Furnishing",       value: listing.furnishing },
            { icon: <HiOutlineUsers size={14} />, label: "Preferred Tenants", value: listing.tenants },
            { icon: <FiCalendar size={14} />,     label: "Available From",   value: listing.available },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, background: "#f0fdf4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#0f766e", flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 9.5, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Amenities + CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 2 }}>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", flex: 1 }}>
            {listing.amenities.map(tag => {
              const c = AMENITY_COLORS[tag] || { bg: "#f1f5f9", color: "#475569" };
              return (
                <span key={tag} style={{ background: c.bg, color: c.color, fontSize: 10, fontWeight: 600, borderRadius: 7, padding: "3px 9px", display: "flex", alignItems: "center", gap: 4 }}>
                  {AMENITY_ICONS[tag]} {tag}
                </span>
              );
            })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
            <button onClick={() => setContacted(true)} style={{
              background: contacted ? "#0f766e" : "#0f172a", color: "white", border: "none",
              borderRadius: 11, padding: "10px 22px", fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
              transition: "background 0.2s", letterSpacing: "0.02em",
            }}>
              {contacted ? <><FiCheck size={13} /> Owner Contacted</> : <><FiPhone size={12} /> Get Owner Details</>}
            </button>
            {listing.tour && (
              <div style={{ fontSize: 9.5, color: "#0f766e", fontWeight: 600, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0f766e", display: "inline-block", animation: "livePulse 1.5s infinite" }} />
                {listing.tour}
              </div>
            )}
          </div>
        </div>

        {/* Agent */}
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src={listing.agentAvatar} alt={listing.agentName} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#334155" }}>{listing.agentName}</div>
              <div style={{ fontSize: 9.5, color: "#94a3b8" }}>Property Owner</div>
            </div>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#0f766e", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
            <FiEye size={12} /> View Details <FiArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PropertyListings() {
  const [sort, setSort]               = useState("Relevance");
  const [savedIds, setSavedIds]       = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxPrice, setMaxPrice]       = useState(100000);
  const [searchInput, setSearchInput] = useState("Indiranagar");
  const [activeCity]                  = useState("Bangalore");

  const toggleSave = id =>
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const filtered = LISTINGS
    .filter(l => !verifiedOnly || l.verified)
    .filter(l => l.price <= maxPrice)
    .sort((a, b) => {
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      return 0;
    });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f1f5f9; }

        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(0.8); }
        }

        .bhk-btn {
          border: 1.5px solid #e2e8f0; background: white; border-radius: 9px;
          padding: 5px 10px; font-size: 11.5px; font-weight: 600; color: #475569;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .bhk-btn:hover { border-color: #0f766e; color: #0f766e; background: #f0fdf4; }

        .sort-select {
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          padding: 7px 32px 7px 12px; font-size: 12px; font-weight: 600;
          color: #0f172a; background: white; outline: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%230f766e' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 10px center;
        }

        input[type="range"] { accent-color: #0f766e; }
        .fc { accent-color: #0f766e; width: 14px; height: 14px; cursor: pointer; }

        .snav {
          background: white; border-bottom: 1px solid #e8f0fe;
          padding: 11px 28px; display: flex; align-items: center;
          gap: 10px; flex-wrap: wrap; position: sticky; top: 0; z-index: 100;
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
        }
        .logo { font-family: 'DM Serif Display', serif; font-size: 20px; color: #0f172a; letter-spacing: -0.5px; }
        .logo span { color: #0f766e; }
        .cpill {
          background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 10px;
          padding: 6px 12px; font-size: 12px; font-weight: 700; color: #0f766e;
          display: flex; align-items: center; gap: 6px;
        }
        .topinput {
          flex: 1; border: 1.5px solid #e2e8f0; border-radius: 12px 0 0 12px;
          padding: 9px 14px 9px 36px; font-size: 13px; font-family: 'DM Sans', sans-serif;
          outline: none; color: #0f172a;
        }
        .topinput:focus { border-color: #0f766e; box-shadow: 0 0 0 3px rgba(15,118,110,0.08); }
        .sbtn {
          background: #0f766e; color: white; border: none; border-radius: 0 12px 12px 0;
          padding: 10px 22px; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 6px;
        }
        .gbtn {
          background: none; border: 1.5px solid #e2e8f0; border-radius: 10px;
          padding: 7px 14px; font-size: 12px; font-weight: 600; color: #475569;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 5px;
        }
        .fls { margin-bottom: 18px; }
        .fll { display: flex; align-items: center; gap: 6px; font-size: 10.5px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.09em; margin-bottom: 9px; }
      `}</style>

      <div style={{ background: "#f1f5f9", minHeight: "100vh" }}>

        {/* NAV */}
        <div className="snav">
          <div className="logo">No<span>Broker</span></div>

          <div className="cpill">
            <FiMapPin size={11} /> {activeCity}
            <FiX size={10} style={{ cursor: "pointer", opacity: 0.5 }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", flex: 1, maxWidth: 440, position: "relative" }}>
            <FiSearch size={14} style={{ position: "absolute", left: 12, color: "#94a3b8", zIndex: 1 }} />
            <input className="topinput" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search by locality, city..." />
            <button className="sbtn"><FiSearch size={13} /> Search</button>
          </div>

          <div style={{ display: "flex", gap: 7, marginLeft: 6 }}>
            {["Location", "Metro"].map(t => (
              <button key={t} className="gbtn">{t} <FiChevronDown size={10} /></button>
            ))}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button className="gbtn"><RiSave3Line size={13} /> Save Search</button>
            <button style={{ background: "#0f172a", color: "white", border: "none", borderRadius: 10, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
              <FiList size={12} /> List
            </button>
            <button style={{ background: "#f0fdf4", color: "#0f766e", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
              <LuMap size={13} /> Map
            </button>
          </div>
        </div>

        {/* RESULTS BAR */}
        <div style={{ background: "white", borderBottom: "1px solid #f1f5f9", padding: "10px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{filtered.length} Properties</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>for Rent in {activeCity} · {searchInput}</span>
            {verifiedOnly && (
              <span style={{ background: "#f0fdf4", color: "#0f766e", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 8px", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 4 }}>
                <MdVerified size={10} /> Verified Only
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#0f766e", fontWeight: 600, cursor: "pointer" }}>
              <input className="fc" type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} /> Verified Only
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>Max: ₹{maxPrice.toLocaleString()}/mo</span>
              <input type="range" min={10000} max={150000} step={5000} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={{ width: 100 }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "#64748b" }}>Sort:</span>
              <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                {["Relevance", "Price: Low to High", "Price: High to Low", "Newest First"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* BREADCRUMB */}
        <div style={{ padding: "9px 28px", fontSize: 11.5, color: "#94a3b8" }}>
          Home &nbsp;/&nbsp; India &nbsp;/&nbsp; {activeCity} &nbsp;/&nbsp;
          <span style={{ color: "#0f766e", fontWeight: 600 }}>{searchInput}</span>
        </div>

        {/* LAYOUT */}
        <div style={{ display: "flex", maxWidth: 1300, margin: "0 auto", padding: "0 20px 48px", gap: 22 }}>

          {/* SIDEBAR */}
          <div style={{ width: 232, flexShrink: 0 }}>
            <div style={{ background: "white", border: "1px solid #f1f5f9", borderRadius: 18, padding: "20px 18px", position: "sticky", top: 68, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 800, color: "#0f172a" }}>
                  <FiSliders size={14} color="#0f766e" /> Filters
                </span>
                <span style={{ fontSize: 11, color: "#0f766e", cursor: "pointer", fontWeight: 700 }}>Reset All</span>
              </div>

              <div className="fls">
                <div className="fll"><BiBed size={14} color="#64748b" /> BHK Type</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"].map(b => <button key={b} className="bhk-btn">{b}</button>)}
                </div>
              </div>

              <div className="fls">
                <div className="fll"><FiTrendingUp size={14} color="#64748b" /> Rent Range</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 6 }}>
                  <span>₹0</span><span>₹1.5L+</span>
                </div>
                <input type="range" min={10000} max={150000} step={5000} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={{ width: "100%" }} />
                <div style={{ fontSize: 11, color: "#0f766e", fontWeight: 600, marginTop: 4 }}>Up to ₹{maxPrice.toLocaleString()}/mo</div>
              </div>

              <div className="fls">
                <div className="fll"><FiCalendar size={14} color="#64748b" /> Availability</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Immediate", "Within 15 Days", "Within 30 Days", "After 30 Days"].map(opt => (
                    <label key={opt} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#475569", cursor: "pointer" }}>
                      <input type="radio" name="avail" style={{ accentColor: "#0f766e" }} /> {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="fls">
                <div className="fll"><HiOutlineUsers size={14} color="#64748b" /> Preferred Tenants</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                  {["Family", "Company", "Bachelor Male", "Bachelor Female"].map(opt => (
                    <label key={opt} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#475569", cursor: "pointer" }}>
                      <input type="checkbox" className="fc" /> {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="fls">
                <div className="fll"><PiBuildingsBold size={14} color="#64748b" /> Property Type</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {["Gated Society", "Apartment", "Independent House / Villa", "Gated Community Villa"].map(opt => (
                    <label key={opt} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#475569", cursor: "pointer" }}>
                      <input type="checkbox" className="fc" /> {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="fls">
                <div className="fll"><BiFridge size={14} color="#64748b" /> Furnishing</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {["Full", "Semi", "None"].map(opt => (
                    <label key={opt} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#475569", cursor: "pointer" }}>
                      <input type="checkbox" className="fc" /> {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="fls">
                <div className="fll"><TbParking size={14} color="#64748b" /> Parking</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {["2 Wheeler", "4 Wheeler"].map(opt => (
                    <label key={opt} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#475569", cursor: "pointer" }}>
                      <input type="checkbox" className="fc" /> {opt}
                    </label>
                  ))}
                </div>
              </div>

              <button style={{ width: "100%", background: "#0f172a", color: "white", border: "none", borderRadius: 12, padding: "11px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <FiCheck size={13} /> Apply Filters
              </button>

              <div style={{ marginTop: 16, background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)", borderRadius: 12, padding: "14px", color: "white" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <HiOutlineSparkles size={14} color="#fbbf24" />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Premium Filters</span>
                  <span style={{ background: "#fbbf24", color: "#0f172a", fontSize: 8, fontWeight: 800, borderRadius: 5, padding: "1px 6px" }}>NEW</span>
                </div>
                <p style={{ fontSize: 10.5, color: "#94a3b8", lineHeight: 1.5, marginBottom: 10 }}>Owner-hosted visits, verified listings & advanced search.</p>
                <button style={{ width: "100%", background: "#fbbf24", color: "#0f172a", border: "none", borderRadius: 8, padding: "7px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  Unlock Premium
                </button>
              </div>
            </div>
          </div>

          {/* LISTINGS */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.length === 0 ? (
              <div style={{ background: "white", borderRadius: 18, padding: "60px 20px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                <PiBuildingsBold size={40} style={{ marginBottom: 10, opacity: 0.25 }} />
                <div>No listings match your filters. Try adjusting the price range.</div>
              </div>
            ) : (
              filtered.map(listing => (
                <ListingCard key={listing.id} listing={listing} saved={savedIds.includes(listing.id)} onSave={toggleSave} />
              ))
            )}

            <div style={{ background: "white", border: "1px solid #f1f5f9", borderRadius: 16, padding: "18px 22px", marginTop: 6, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                <FiSearch size={13} color="#0f766e" /> People also searched for
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {["Apartments in Indiranagar", "Villas in Whitefield", "Flats in Koramangala", "Studios in HSR Layout", "Rooms in BTM", "Apartments in Jayanagar"].map(s => (
                  <button key={s} style={{ background: "#f8fafc", color: "#0f766e", border: "1.5px solid #e2e8f0", fontSize: 11, fontWeight: 600, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.borderColor = "#86efac"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                  >{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}