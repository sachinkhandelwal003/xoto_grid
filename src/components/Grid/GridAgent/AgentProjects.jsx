import {
  Typography,
  Row,
  Col,
  Input,
  Select,
  Button,
  Spin,
  message,
  Popover,
  Checkbox,
  Avatar,
  InputNumber,
  Empty,
  Tag,
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  InfoCircleOutlined,
  SearchOutlined,
  DownOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;
const { Option } = Select;

// ── Constants ────────────────────────────────────────────────────────────────
const UAE_AREAS = [
  "Dubai Marina", "Downtown Dubai", "JVC", "Business Bay", "Palm Jumeirah",
  "Dubai Hills", "Al Barsha", "Jumeirah", "DIFC", "Meydan", "Creek Harbour",
  "Al Reem Island", "Saadiyat Island", "Abu Dhabi", "Sharjah", "Yas Island",
];

const UNIT_TYPES    = ["apartment", "villa", "townhouse", "duplex", "penthouse", "studio", "plot"];
const BEDROOM_OPTS  = ["studio", "1bed", "2bed", "3bed", "4bed", "5bed", "6bed", "7bed", "8plus"];
const AVAILABILITY_OPTS = [
  { value: "all",       label: "All" },
  { value: "available", label: "Available" },
  { value: "reserved",  label: "Reserved" },
  { value: "booked",    label: "Booked" },
  { value: "sold",      label: "Sold" },
];

// Combined sort → API params mapping
const SORT_OPTIONS = [
  { value: "newest",           label: "Recently Added",         sortBy: "createdAt",   sortOrder: "desc" },
  { value: "price_asc",        label: "Price (Low–High)",        sortBy: "price",       sortOrder: "asc"  },
  { value: "price_desc",       label: "Price (High–Low)",        sortBy: "price",       sortOrder: "desc" },
  { value: "downpay_asc",      label: "Down-payment (Low–High)", sortBy: "downPayment", sortOrder: "asc"  },
  { value: "downpay_desc",     label: "Down-payment (High–Low)", sortBy: "downPayment", sortOrder: "desc" },
];

// ── PropertyCard ─────────────────────────────────────────────────────────────
function PropertyCard({ p, onClick }) {
  const getPriceDisplay = (property) => {
    if (property.price_min && property.price_max)
      return `${Number(property.price_min).toLocaleString()} – ${Number(property.price_max).toLocaleString()}`;
    if (property.price) return Number(property.price).toLocaleString();
    return "Contact Us";
  };

  const imgSrc =
    p?.photos?.architecture?.[0] ||
    p?.mainLogo ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800";

  const listingType = p.propertySubType;
  const isOffPlan   = listingType === "off_plan";
  const isRental    = listingType === "rental";
  const approval    = p.approvalStatus;
  const isActive    = p.listingStatus === "active";
  const devLogo     = p.developer?.logo;
  const devName     = p.developer?.name || p.developerName || "Developer";

  const approvalColor = { approved: "#16a34a", pending: "#d97706", rejected: "#dc2626" };
  const approvalBg    = { approved: "#dcfce7", pending: "#fef3c7", rejected: "#fee2e2" };
  const approvalLabel = { approved: "Approved", pending: "Pending", rejected: "Rejected" };
  const approvalIcon  = { approved: <CheckCircleOutlined />, pending: <ClockCircleOutlined />, rejected: <CloseCircleOutlined /> };

  const listingBadge = isOffPlan
    ? { bg: "rgba(124,58,237,0.92)", label: "🏗️ Off-Plan" }
    : isRental
    ? { bg: "rgba(5,150,105,0.92)", label: "🔑 Rental" }
    : { bg: "rgba(37,99,235,0.92)", label: "🏠 Secondary" };

  const paymentFirst = p.paymentPlan?.[0]?.stages?.[0]?.percentage;

  return (
    <div
      onClick={onClick}
      style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e8e8", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", transition: "transform 0.18s, box-shadow 0.18s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)"; }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 200, overflow: "hidden", flexShrink: 0, background: "#f3f4f6" }}>
        <img src={imgSrc} alt={p.propertyName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800"; }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)", pointerEvents: "none" }} />

        {/* Listing type badge */}
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.3px", background: listingBadge.bg, color: "#fff", backdropFilter: "blur(4px)" }}>
            {listingBadge.label}
          </span>
        </div>

        {/* Approval badge (secondary/rental) */}
        {!isOffPlan && approval && (
          <div style={{ position: "absolute", top: 10, right: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: approvalBg[approval] || "#f3f4f6", color: approvalColor[approval] || "#374151", border: `1px solid ${approvalColor[approval]}30` }}>
              {approvalIcon[approval]} {approvalLabel[approval] || approval}
            </span>
          </div>
        )}

        {/* Bottom row */}
        <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {isActive ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "rgba(22,163,74,0.92)", color: "#fff", backdropFilter: "blur(4px)" }}>● Active Listing</span>
          ) : <span />}
          <div style={{ width: 36, height: 36, borderRadius: 8, background: devLogo ? "#fff" : "rgba(255,255,255,0.9)", border: "2px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 8px rgba(0,0,0,0.18)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#5c039b" }}>
            {devLogo ? <img src={devLogo} alt={devName} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : devName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.propertyName}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6b7280", marginBottom: 12, overflow: "hidden" }}>
          <EnvironmentOutlined style={{ fontSize: 11, flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{[p.area, p.city].filter(Boolean).join(", ")}</span>
          <span style={{ color: "#d1d5db", flexShrink: 0 }}>•</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#9ca3af" }}>{devName}</span>
        </div>
        {(p.bedrooms > 0 || p.bathrooms > 0 || p.builtUpArea || p.builtUpArea_min) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {p.bedrooms > 0 && <span style={{ padding: "3px 10px", background: "#f3f4f6", borderRadius: 20, fontSize: 12, color: "#374151", fontWeight: 500 }}>{p.bedrooms} {p.bedrooms === 1 ? "Bed" : "Beds"}</span>}
            {p.bathrooms > 0 && <span style={{ padding: "3px 10px", background: "#f3f4f6", borderRadius: 20, fontSize: 12, color: "#374151", fontWeight: 500 }}>{p.bathrooms} {p.bathrooms === 1 ? "Bath" : "Baths"}</span>}
            {(p.builtUpArea || p.builtUpArea_min) && <span style={{ padding: "3px 10px", background: "#f3f4f6", borderRadius: 20, fontSize: 12, color: "#374151", fontWeight: 500 }}>{(p.builtUpArea || p.builtUpArea_min).toLocaleString()} sqft</span>}
          </div>
        )}
        <div style={{ height: 1, background: "#f3f4f6", marginBottom: 12 }} />
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px" }}>Price from</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>
              {getPriceDisplay(p)} <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>{p.currency || "AED"}</span>
            </div>
          </div>
          {paymentFirst && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px" }}>Down-payment</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#5c039b" }}>{paymentFirst}% <InfoCircleOutlined style={{ color: "#c4b5fd", fontSize: 11 }} /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Active filter tags ────────────────────────────────────────────────────────
function ActiveFilters({ filters, onClear }) {
  const tags = filters.filter(f => f.active);
  if (tags.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, alignItems: "center" }}>
      <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Active filters:</span>
      {tags.map(f => (
        <Tag key={f.key} closable onClose={() => f.onClear()}
          style={{ borderRadius: 20, padding: "2px 10px", fontSize: 12, border: "1px solid #c4b5fd", background: "#f5f3ff", color: "#5c039b" }}>
          {f.label}
        </Tag>
      ))}
      <button onClick={onClear} style={{ fontSize: 12, color: "#9ca3af", cursor: "pointer", background: "none", border: "none", textDecoration: "underline" }}>Clear all</button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AgentProjects() {
  const navigate = useNavigate();

  const [properties,  setProperties]  = useState([]);
  const [filtered,    setFiltered]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [developers,  setDevelopers]  = useState([]);

  const [page,     setPage]     = useState(1);
  const [hasMore,  setHasMore]  = useState(true);

  // ── Filter state ──
  const [search,            setSearch]            = useState("");
  const [listingType,       setListingType]       = useState("all");       // off_plan / secondary / rental
  const [propertyType,      setPropertyType]      = useState("all");       // apartment / villa / …
  const [locationArea,      setLocationArea]      = useState("All");       // geographic area
  const [availability,      setAvailability]      = useState("all");       // available / reserved / sold
  const [priceMin,          setPriceMin]          = useState(null);
  const [priceMax,          setPriceMax]          = useState(null);
  const [minSizeSqft,       setMinSizeSqft]       = useState(null);
  const [maxSizeSqft,       setMaxSizeSqft]       = useState(null);
  const [selectedBedrooms,  setSelectedBedrooms]  = useState([]);
  const [selectedDevelopers,setSelectedDevelopers]= useState([]);
  const [sortValue,         setSortValue]         = useState("newest");

  // ── Popover open state ──
  const [devOpen,      setDevOpen]      = useState(false);
  const [priceOpen,    setPriceOpen]    = useState(false);
  const [bedroomOpen,  setBedroomOpen]  = useState(false);
  const [sizeOpen,     setSizeOpen]     = useState(false);
  const [devSearch,    setDevSearch]    = useState("");

  const sortParams = SORT_OPTIONS.find(o => o.value === sortValue) || SORT_OPTIONS[0];

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchProperties = async (pageNo = 1, append = false) => {
    try {
      setLoading(true);
      const p = new URLSearchParams();
      p.append("page", pageNo);
      p.append("limit", 12);
      p.append("sortBy",    sortParams.sortBy);
      p.append("sortOrder", sortParams.sortOrder);
      if (listingType !== "all")   p.append("propertySubType", listingType);
      if (propertyType !== "all")  p.append("unitType", propertyType);
      if (locationArea !== "All")  p.append("area", locationArea);
      if (availability !== "all")  p.append("availabilityStatus", availability);
      if (search)    p.append("search", search);
      if (priceMin)  p.append("minPrice", priceMin);
      if (priceMax)  p.append("maxPrice", priceMax);
      if (minSizeSqft) p.append("minArea", minSizeSqft);
      if (maxSizeSqft) p.append("maxArea", maxSizeSqft);
      if (selectedBedrooms.length > 0)  p.append("bedroomType", selectedBedrooms[0]);
      if (selectedDevelopers.length > 0) p.append("developerId", selectedDevelopers[0]);

      const res  = await apiService.get(`/properties?${p.toString()}`);
      const list = Array.isArray(res?.data) ? res.data : [];
      setProperties(prev => append ? [...prev, ...list] : list);
      setFiltered(list);
      setHasMore(pageNo < (res?.pagination?.totalPages || 1));
    } catch {
      message.error("Failed to load properties");
      setProperties([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevelopers = async () => {
    try {
      const res  = await apiService.get("/developer/get-all-developers");
      const list = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      setDevelopers(list);
    } catch {}
  };

  useEffect(() => {
    setPage(1);
    fetchProperties(1, false);
    fetchDevelopers();
  }, [listingType, propertyType, locationArea, availability, sortValue]);

  useEffect(() => {
    if (page > 1) fetchProperties(page, true);
  }, [page]);

  // Client-side search + filter (applied on top of server results)
  useEffect(() => {
    let r = [...properties];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(p =>
        p.propertyName?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.area?.toLowerCase().includes(q) ||
        p.developerName?.toLowerCase().includes(q)
      );
    }
    if (selectedDevelopers.length > 0)
      r = r.filter(p => selectedDevelopers.includes(p.developer?._id));
    if (priceMin) r = r.filter(p => (p.price || p.price_min || 0) >= priceMin);
    if (priceMax) r = r.filter(p => (p.price || p.price_min || 0) <= priceMax);
    if (minSizeSqft) r = r.filter(p => (p.builtUpArea || p.builtUpArea_min || 0) >= minSizeSqft);
    if (maxSizeSqft) r = r.filter(p => (p.builtUpArea || p.builtUpArea_min || 0) <= maxSizeSqft);
    if (selectedBedrooms.length > 0)
      r = r.filter(p => selectedBedrooms.includes(p.bedroomType));
    setFiltered(r);
  }, [search, selectedDevelopers, priceMin, priceMax, minSizeSqft, maxSizeSqft, selectedBedrooms, properties]);

  const clearAll = () => {
    setSearch(""); setListingType("all"); setPropertyType("all");
    setLocationArea("All"); setAvailability("all");
    setPriceMin(null); setPriceMax(null);
    setMinSizeSqft(null); setMaxSizeSqft(null);
    setSelectedBedrooms([]); setSelectedDevelopers([]);
    setSortValue("newest"); setPage(1);
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const filterBtn = (active) => ({
    height: 38, borderRadius: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 13,
    background: active ? "#f5f3ff" : "#fff",
    borderColor: active ? "#c4b5fd" : "#e5e7eb",
    color: active ? "#5c039b" : "#374151",
    fontWeight: active ? 600 : 400,
  });

  const chip = (sel) => ({
    padding: "5px 12px", background: sel ? "#111827" : "#f3f4f6",
    color: sel ? "#fff" : "#4b5563", borderRadius: 6, cursor: "pointer",
    fontWeight: 500, fontSize: 13, transition: "all 0.15s", userSelect: "none",
    border: "none",
  });

  // ── Popover contents ──────────────────────────────────────────────────────
  const developerPopover = (
    <div style={{ width: 300, padding: "12px 0 0", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "0 16px 12px" }}>
        <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8 }}>Filter by developer</Text>
        <Input prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />} placeholder="Search..." value={devSearch} onChange={e => setDevSearch(e.target.value)} style={{ borderRadius: 6 }} allowClear />
      </div>
      <div style={{ maxHeight: 220, overflowY: "auto", padding: "8px 16px", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
        {developers.filter(d => d.name?.toLowerCase().includes(devSearch.toLowerCase())).map(dev => (
          <div key={dev._id} style={{ padding: "7px 0", display: "flex", alignItems: "center", gap: 10 }}>
            <Checkbox checked={selectedDevelopers.includes(dev._id)} onChange={e => setSelectedDevelopers(e.target.checked ? [...selectedDevelopers, dev._id] : selectedDevelopers.filter(i => i !== dev._id))} />
            <Avatar shape="square" src={dev.logo} style={{ background: "#f3e8ff", color: "#5c039b" }} size="small">{!dev.logo && dev.name?.charAt(0)}</Avatar>
            <Text style={{ fontSize: 13 }}>{dev.name}</Text>
          </div>
        ))}
        {developers.length === 0 && <Text type="secondary" style={{ fontSize: 12 }}>No developers found</Text>}
      </div>
      <div style={{ display: "flex" }}>
        <Button type="text" style={{ flex: 1, borderRadius: 0, height: 40 }} onClick={() => setSelectedDevelopers([])}>Clear</Button>
        <div style={{ width: 1, background: "#f0f0f0" }} />
        <Button type="text" style={{ flex: 1, borderRadius: 0, height: 40 }} onClick={() => setDevOpen(false)}>Close</Button>
      </div>
    </div>
  );

  const pricePopover = (
    <div style={{ width: 300, padding: 16 }}>
      <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 10 }}>Price range (AED)</Text>
      <Row gutter={10} style={{ marginBottom: 12 }}>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>Min</Text>
          <InputNumber style={{ width: "100%" }} placeholder="From" value={priceMin} onChange={setPriceMin} formatter={v => v ? Number(v).toLocaleString() : ""} />
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>Max</Text>
          <InputNumber style={{ width: "100%" }} placeholder="To" value={priceMax} onChange={setPriceMax} formatter={v => v ? Number(v).toLocaleString() : ""} />
        </Col>
      </Row>
      <Row gutter={8}>
        <Col span={12}><Button block onClick={() => { setPriceMin(null); setPriceMax(null); }}>Clear</Button></Col>
        <Col span={12}><Button type="primary" block style={{ background: "#111827" }} onClick={() => setPriceOpen(false)}>Apply</Button></Col>
      </Row>
    </div>
  );

  const bedroomPopover = (
    <div style={{ width: 340, padding: 14 }}>
      <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 10 }}>Select bedrooms</Text>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {BEDROOM_OPTS.map(b => (
          <button key={b} style={chip(selectedBedrooms.includes(b))}
            onClick={() => setSelectedBedrooms(selectedBedrooms.includes(b) ? selectedBedrooms.filter(x => x !== b) : [...selectedBedrooms, b])}>
            {b === "8plus" ? "8+ Beds" : b === "studio" ? "Studio" : `${b.replace("bed", "")} Bed`}
          </button>
        ))}
      </div>
      {selectedBedrooms.length > 0 && (
        <Button type="text" size="small" style={{ marginTop: 10, color: "#9ca3af" }} onClick={() => setSelectedBedrooms([])}>Clear selection</Button>
      )}
    </div>
  );

  const sizePopover = (
    <div style={{ width: 280, padding: 16 }}>
      <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 10 }}>Size range (sqft)</Text>
      <Row gutter={10} style={{ marginBottom: 12 }}>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>Min</Text>
          <InputNumber style={{ width: "100%" }} placeholder="Min" value={minSizeSqft} onChange={setMinSizeSqft} />
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>Max</Text>
          <InputNumber style={{ width: "100%" }} placeholder="Max" value={maxSizeSqft} onChange={setMaxSizeSqft} />
        </Col>
      </Row>
      <Row gutter={8}>
        <Col span={12}><Button block onClick={() => { setMinSizeSqft(null); setMaxSizeSqft(null); }}>Clear</Button></Col>
        <Col span={12}><Button type="primary" block style={{ background: "#111827" }} onClick={() => setSizeOpen(false)}>Apply</Button></Col>
      </Row>
    </div>
  );

  // ── Active filter tags data ───────────────────────────────────────────────
  const activeFilters = [
    { key: "listing",     active: listingType !== "all",            label: `Listing: ${listingType.replace("_", " ")}`,              onClear: () => setListingType("all") },
    { key: "proptype",    active: propertyType !== "all",           label: `Type: ${propertyType}`,                                  onClear: () => setPropertyType("all") },
    { key: "area",        active: locationArea !== "All",           label: `Area: ${locationArea}`,                                  onClear: () => setLocationArea("All") },
    { key: "avail",       active: availability !== "all",           label: `Availability: ${availability}`,                          onClear: () => setAvailability("all") },
    { key: "price",       active: !!(priceMin || priceMax),         label: `Price: ${priceMin || 0}–${priceMax || "∞"} AED`,         onClear: () => { setPriceMin(null); setPriceMax(null); } },
    { key: "size",        active: !!(minSizeSqft || maxSizeSqft),   label: `Size: ${minSizeSqft || 0}–${maxSizeSqft || "∞"} sqft`,   onClear: () => { setMinSizeSqft(null); setMaxSizeSqft(null); } },
    { key: "bedrooms",    active: selectedBedrooms.length > 0,      label: `Beds: ${selectedBedrooms.join(", ")}`,                   onClear: () => setSelectedBedrooms([]) },
    { key: "developers",  active: selectedDevelopers.length > 0,    label: `Developer (${selectedDevelopers.length})`,               onClear: () => setSelectedDevelopers([]) },
  ];

  return (
    <div style={{ padding: "24px 28px", background: "#f8f9fa", minHeight: "100vh" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>Property Catalogue</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}>{filtered.length} {filtered.length === 1 ? "property" : "properties"} found</p>
      </div>

      {/* ── Listing Type Tabs ── */}
      <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap", borderBottom: "1px solid #e8e8e8", paddingBottom: 14 }}>
        {[
          { key: "all",       label: "All Listings" },
          { key: "off_plan",  label: "🏗️ Off-Plan" },
          { key: "secondary", label: "🏠 Secondary" },
          { key: "rental",    label: "🔑 Rental" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setListingType(tab.key); setPage(1); }}
            style={{
              padding: "7px 18px", borderRadius: 20, border: "1px solid", cursor: "pointer",
              fontSize: 13, fontWeight: listingType === tab.key ? 700 : 400,
              background: listingType === tab.key ? "#111827" : "#fff",
              color: listingType === tab.key ? "#fff" : "#6b7280",
              borderColor: listingType === tab.key ? "#111827" : "#e5e7eb",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Filter card ── */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "16px 20px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>

        {/* Row 1: Search + Sort */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <Input
            prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
            placeholder="Search by name, city or developer..."
            style={{ flex: 1, minWidth: 220, borderRadius: 8, height: 38 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
          />
          <Select
            style={{ width: 210, height: 38 }}
            value={sortValue}
            onChange={val => { setSortValue(val); setPage(1); }}
            placeholder="Sort by"
          >
            {SORT_OPTIONS.map(o => (
              <Option key={o.value} value={o.value}>{o.label}</Option>
            ))}
          </Select>
        </div>

        {/* Row 2: Filter dropdowns + popover buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>

          {/* Property Type */}
          <Select style={{ width: 150, height: 36 }} value={propertyType} onChange={val => { setPropertyType(val); setPage(1); }} placeholder="Property Type">
            <Option value="all">All Types</Option>
            {UNIT_TYPES.map(t => <Option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</Option>)}
          </Select>

          {/* Area / Location */}
          <Select
            showSearch
            style={{ width: 170, height: 36 }}
            value={locationArea}
            onChange={val => { setLocationArea(val); setPage(1); }}
            placeholder="Area"
            optionFilterProp="children"
          >
            <Option value="All">All Areas</Option>
            {UAE_AREAS.map(a => <Option key={a} value={a}>{a}</Option>)}
          </Select>

          {/* Availability */}
          <Select style={{ width: 140, height: 36 }} value={availability} onChange={val => { setAvailability(val); setPage(1); }} placeholder="Availability">
            {AVAILABILITY_OPTS.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
          </Select>

          {/* Price popover */}
          <Popover content={pricePopover} trigger="click" open={priceOpen} onOpenChange={setPriceOpen} placement="bottomLeft" overlayInnerStyle={{ borderRadius: 10 }}>
            <Button style={filterBtn(!!(priceMin || priceMax))}>
              Price {(priceMin || priceMax) ? "●" : ""} <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Popover>

          {/* Bedrooms popover */}
          <Popover content={bedroomPopover} trigger="click" open={bedroomOpen} onOpenChange={setBedroomOpen} placement="bottomLeft" overlayInnerStyle={{ borderRadius: 10 }}>
            <Button style={filterBtn(selectedBedrooms.length > 0)}>
              Bedrooms {selectedBedrooms.length > 0 ? `(${selectedBedrooms.length})` : ""} <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Popover>

          {/* Developer popover */}
          <Popover content={developerPopover} trigger="click" open={devOpen} onOpenChange={setDevOpen} placement="bottomLeft" overlayInnerStyle={{ padding: 0, borderRadius: 10 }}>
            <Button style={filterBtn(selectedDevelopers.length > 0)}>
              Developer {selectedDevelopers.length > 0 ? `(${selectedDevelopers.length})` : ""} <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Popover>

          {/* Size popover */}
          <Popover content={sizePopover} trigger="click" open={sizeOpen} onOpenChange={setSizeOpen} placement="bottomLeft" overlayInnerStyle={{ borderRadius: 10 }}>
            <Button style={filterBtn(!!(minSizeSqft || maxSizeSqft))}>
              Size {(minSizeSqft || maxSizeSqft) ? "●" : ""} <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Popover>

          {/* Clear all */}
          {activeFilters.some(f => f.active) && (
            <Button type="text" icon={<CloseOutlined />} onClick={clearAll} style={{ color: "#9ca3af", fontSize: 12 }}>Clear all</Button>
          )}
        </div>
      </div>

      {/* Active filter tags */}
      <ActiveFilters filters={activeFilters} onClear={clearAll} />

      {/* ── Grid ── */}
      {filtered.length === 0 && !loading ? (
        <Empty description="No properties match your filters" style={{ marginTop: 60 }} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20 }}>
          {filtered.map(p => (
            <PropertyCard key={p._id} p={p} onClick={() => navigate(`/dashboard/agent/projects/${p._id}`)} />
          ))}
        </div>
      )}

      {/* ── Load more ── */}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        {loading ? (
          <Spin size="large" />
        ) : hasMore && filtered.length > 0 ? (
          <button
            onClick={() => setPage(p => p + 1)}
            style={{ padding: "10px 36px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#374151", transition: "all 0.15s" }}
            onMouseEnter={e => { e.target.style.background = "#111827"; e.target.style.color = "#fff"; }}
            onMouseLeave={e => { e.target.style.background = "#fff";    e.target.style.color = "#374151"; }}
          >
            Load More
          </button>
        ) : filtered.length > 0 ? (
          <Text type="secondary" style={{ fontSize: 13 }}>All properties loaded</Text>
        ) : null}
      </div>
    </div>
  );
}
