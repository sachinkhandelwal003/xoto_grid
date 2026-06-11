import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, MapPin, Bed, Bath, Maximize2, Trash2 } from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
const bedicon = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'><path d='M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4'/><path d='M2 9h20v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z'/><path d='M6 9V7a2 2 0 0 1 4 0v2'/></svg>`;
const tubicon = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'><path d='M9 6L9 2'/><path d='M2 12h20v2a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-2z'/><path d='M7 18v2'/><path d='M17 18v2'/><circle cx='9' cy='6' r='2'/></svg>`;
const layouticon = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'><rect x='3' y='3' width='18' height='18' rx='2'/><path d='M3 9h18'/><path d='M9 21V9'/></svg>`;

const transformProperty = (item) => ({
  id: item._id || item.id,
  imgUrl:
    // Page2/OurProperty format — photos seedha array hai
    (Array.isArray(item.photos) && item.photos[0]) ||
    // Hot property format — photos object ke andar nested arrays
    item.photos?.architecture?.[0] ||
    item.photos?.interior?.[0] ||
    item.photos?.other?.[0] ||
    item.mainLogo ||
    "https://via.placeholder.com/400x300?text=No+Image",

  title: item.propertyName || "Unnamed Property",
  price: item.price
    ? `${item.currency || "AED"} ${Number(item.price).toLocaleString()}`
    : "Price on Request",
  location: item.area && item.city ? `${item.area}, ${item.city}` : "Dubai, UAE",
  bedrooms: item.bedrooms || 0,
  bathrooms: item.bathrooms || 0,
  bedroomType: item.bedroomType || "",
  area: item.builtUpArea
    ? `${item.builtUpArea} ${item.builtUpAreaUnit || "sqft"}`
    : item.builtUpArea_max
    ? `${item.builtUpArea_max} ${item.builtUpAreaUnit || "sqft"}`
    : "N/A",
  tag: item.propertySubType || item.transactionType || item.propertyType || "Property",
});

const FavouriteProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/user/login"); return; }
    fetchFavourites();
  }, []);

const fetchFavourites = async () => {
  setLoading(true);
  try {
    // timestamp add karo — cache bust karta hai
    const res = await apiService.get(`/properties/favourites?t=${Date.now()}`);
    console.log("FAV API response:", res);

    const raw = res?.data;
    const list = Array.isArray(raw)       ? raw
               : Array.isArray(raw?.data) ? raw.data
               : [];

    setProperties(list.map(transformProperty));
  } catch (err) {
    console.error("Failed to fetch favourites:", err);
    setProperties([]);
  } finally {
    setLoading(false);
  }
};

  const handleRemove = async (propertyId) => {
    if (removingId) return;
    setRemovingId(propertyId);
    try {
      await apiService.post("/properties/favourites/toggle", { property_id: propertyId });
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      const savedFavs = JSON.parse(localStorage.getItem("customer_favourites") || "[]");
      localStorage.setItem("customer_favourites", JSON.stringify(savedFavs.filter((id) => id !== propertyId)));
    } catch (err) {
      console.error("Failed to remove:", err);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f7ff" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-[#ede9fe]" />
            <div className="absolute inset-0 rounded-full border-2 border-t-[#5C039B] animate-spin" />
          </div>
          <p style={{ color: "#5C039B", fontSize: "13px", fontWeight: 500, letterSpacing: "0.04em" }}>
            Loading favourites...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8f7ff", fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Top Bar ── */}
      <div style={{
        background: "white",
        borderBottom: "1px solid #ede9fe",
        padding: "0 24px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            color: "#5C039B", fontSize: "13px", fontWeight: 500,
            background: "none", border: "none", cursor: "pointer", padding: "6px 0",
          }}
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Heart size={16} fill="#5C039B" stroke="#5C039B" />
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>My Favourites</span>
          {properties.length > 0 && (
            <span style={{
              background: "#5C039B", color: "white",
              fontSize: "11px", fontWeight: 600,
              padding: "2px 7px", borderRadius: "20px",
            }}>
              {properties.length}
            </span>
          )}
        </div>

        <div style={{ width: "60px" }} />
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" }}>

        {/* ── Empty State ── */}
        {properties.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "80px 24px", gap: "20px",
          }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center",
              border: "1.5px dashed #c084fc",
            }}>
              <Heart size={28} stroke="#9333ea" fill="none" />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a2e", margin: "0 0 6px" }}>
                No favourites saved
              </p>
              <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0, maxWidth: "260px", lineHeight: 1.6 }}>
                Browse properties and tap the heart icon to save them here
              </p>
            </div>
            <button
              onClick={() => navigate("/Property")}
              style={{
                padding: "10px 24px", background: "#5C039B", color: "white",
                border: "none", borderRadius: "30px", fontSize: "13px",
                fontWeight: 600, cursor: "pointer", marginTop: "4px",
              }}
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <>
            {/* ── Subtitle ── */}
            <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "20px", fontWeight: 500 }}>
              {properties.length} saved {properties.length === 1 ? "property" : "properties"}
            </p>

            {/* ── Grid ── */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}>
              {properties.map((deal) => (
                <FavCard
                  key={deal.id}
                  deal={deal}
                  removing={removingId === deal.id}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Compact Fav Card ─────────────────────────────────────────────────────────
function FavCard({ deal, removing, onRemove }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{
      background: "white",
      borderRadius: "12px",
      overflow: "hidden",
      border: "1px solid #d5d2dd",
      boxShadow: "0 2px 12px rgba(92,3,155,0.06)",
      transition: "all 0.2s ease",
      opacity: removing ? 0.5 : 1,
      transform: removing ? "scale(0.97)" : "scale(1)",
      position: "relative",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(92,3,155,0.13)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(92,3,155,0.06)"}
    >
      {/* Image */}
      <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
        <img
          src={imgError ? "https://via.placeholder.com/400x300?text=No+Image" : deal.imgUrl}
          alt={deal.title}
          onError={() => setImgError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)",
        }} />

        {/* Tag — top left */}
        <div style={{
          position: "absolute", top: "10px", left: "10px",
          background: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)",
          color: "#5C039B", fontSize: "10px", fontWeight: 700,
          padding: "3px 8px", borderRadius: "4px",
          textTransform: "uppercase", letterSpacing: "0.04em",
        }}>
          {deal.tag?.replace("_", " ") || "Property"}
        </div>

        {/* Remove button — top right */}
        <button
          onClick={() => onRemove(deal.id)}
          disabled={removing}
          style={{
            position: "absolute", top: "10px", right: "10px",
            background: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)",
            border: "none", borderRadius: "6px",
            width: "28px", height: "28px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: removing ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#fff0f0"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.92)"}
        >
          {removing ? (
            <div style={{
              width: "12px", height: "12px",
              border: "2px solid #5C039B",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }} />
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#e11d48" stroke="#e11d48" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          )}
        </button>

        {/* Price — bottom left over image */}
        <div style={{
          position: "absolute", bottom: "10px", left: "10px",
          color: "white", fontSize: "13px", fontWeight: 700,
          textShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }}>
          {deal.price}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "12px 14px" }}>

        {/* Title */}
        <h3 style={{
          fontSize: "13px", fontWeight: 600, color: "#1a1a2e",
          margin: "0 0 5px", lineHeight: 1.4,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {deal.title}
        </h3>

        {/* Location */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "10px" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 400 }}>
            {deal.location}
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "#f3f4f6", marginBottom: "10px" }} />

        {/* Stats Row */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {deal.bedroomType === "studio" ? (
            <StatChip icon={bedicon} label="Studio" purple />
          ) : (
            <>
              <StatChip icon={bedicon} label={`${deal.bedrooms} Bed`} />
              <StatChip icon={tubicon} label={`${deal.bathrooms} Bath`} />
            </>
          )}
          <StatChip icon={layouticon} label={deal.area} />
        </div>
      </div>
    </div>
  );
}

function StatChip({ icon, label, purple }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <img src={icon} alt="" style={{ width: "13px", height: "13px", opacity: 0.7 }} />
      <span style={{
        fontSize: "11px",
        color: purple ? "#5C039B" : "#6b7280",
        fontWeight: purple ? 600 : 400,
      }}>
        {label}
      </span>
    </div>
  );
}

export default FavouriteProperties;