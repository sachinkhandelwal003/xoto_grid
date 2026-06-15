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
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  InfoCircleOutlined,
  SearchOutlined,
  DownOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

// ─── helpers ──────────────────────────────────────────────────────────────────
const getTypeLabel = (subType) => {
  const map = { off_plan: "Off-Plan", secondary: "Secondary", rental: "Rental", commercial: "Commercial" };
  return map[subType] || subType || "Property";
};

const getTypeBg = (subType) => {
  const map = {
    off_plan:   "rgba(124,58,237,0.92)",
    secondary:  "rgba(37,99,235,0.92)",
    rental:     "rgba(5,150,105,0.92)",
    commercial: "rgba(180,83,9,0.92)",
  };
  return map[subType] || "rgba(75,85,99,0.92)";
};

const getPriceDisplay = (p) => {
  if (p.price_min && p.price_max && Number(p.price_min) !== Number(p.price_max))
    return `${Number(p.price_min).toLocaleString()} – ${Number(p.price_max).toLocaleString()}`;
  if (p.price_min) return Number(p.price_min).toLocaleString();
  if (p.price) return Number(p.price).toLocaleString();
  return "Contact Us";
};

const getPriceLabel = (subType) => {
  if (subType === "rental") return "Rent / year";
  if (subType === "secondary") return "Price";
  return "Price from";
};

// ─── PROPERTY CARD ─────────────────────────────────────────────────────────────
function PropertyCard({ p, onClick }) {
  const imgSrc =
    p?.media?.mainLogo ||
    p?.media?.architectureImages?.[0] ||
    p?.media?.interiorImages?.[0] ||
    p?.mainLogo ||
    p?.photos?.architecture?.[0] ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800";

  const approval      = p.approvalStatus;
  const isActive      = p.listingStatus === "active";
  const devLogo       = p.developerDetails?.logo || p.developer?.logo;
  const devName       = p.developerDetails?.companyName || p.developer?.name || p.developerName || "Developer";
  const paymentFirst  = p.paymentPlan?.[0]?.stages?.[0]?.percentage;

  const approvalColor = { approved: "#16a34a", pending: "#d97706", rejected: "#dc2626" };
  const approvalBg    = { approved: "#dcfce7", pending: "#fef3c7", rejected: "#fee2e2" };
  const approvalLabel = { approved: "Approved", pending: "Pending", rejected: "Rejected" };
  const approvalIcon  = {
    approved: <CheckCircleOutlined />,
    pending:  <ClockCircleOutlined />,
    rejected: <CloseCircleOutlined />,
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff", borderRadius: 14, border: "1px solid #e8e8e8",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflow: "hidden",
        cursor: "pointer", display: "flex", flexDirection: "column",
        transition: "transform 0.18s, box-shadow 0.18s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
      }}
    >
      {/* IMAGE */}
      <div style={{ position: "relative", height: 200, overflow: "hidden", flexShrink: 0, background: "#f3f4f6" }}>
        <img
          src={imgSrc}
          alt={p.propertyName}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800"; }}
        />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)", pointerEvents: "none" }} />

        {/* Type badge */}
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: getTypeBg(p.propertySubType), color: "#fff", backdropFilter: "blur(4px)" }}>
            {getTypeLabel(p.propertySubType)}
          </span>
        </div>

        {/* Approval badge (non-off-plan) */}
        {p.propertySubType !== "off_plan" && approval && (
          <div style={{ position: "absolute", top: 10, right: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: approvalBg[approval] || "#f3f4f6", color: approvalColor[approval] || "#374151", border: `1px solid ${(approvalColor[approval] || "#374151")}30` }}>
              {approvalIcon[approval]} {approvalLabel[approval] || approval}
            </span>
          </div>
        )}

        {/* Bottom row: active + dev logo */}
        <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {isActive ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "rgba(22,163,74,0.92)", color: "#fff", backdropFilter: "blur(4px)" }}>
              ● Active
            </span>
          ) : <span />}
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fff", border: "2px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 8px rgba(0,0,0,0.18)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {devLogo
              ? <img src={devLogo} alt={devName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              : <span style={{ fontWeight: 700, fontSize: 14, color: "#5c039b" }}>{devName.charAt(0).toUpperCase()}</span>}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {p.propertyName}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6b7280", marginBottom: 12, overflow: "hidden", whiteSpace: "nowrap" }}>
          <EnvironmentOutlined style={{ fontSize: 11, flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {[p.locality || p.area, p.city].filter(Boolean).join(", ")}
          </span>
          <span style={{ color: "#d1d5db", flexShrink: 0 }}>•</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", color: "#9ca3af" }}>{devName}</span>
        </div>

        {(p.bedroomType === "studio" || p.bedrooms > 0 || p.bathrooms > 0 || p.builtUpArea > 0 || p.builtUpArea_min > 0) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {(p.bedroomType === "studio" || p.bedrooms > 0) && (
              <span style={{ padding: "3px 10px", background: "#f3f4f6", borderRadius: 20, fontSize: 12, color: "#374151", fontWeight: 500 }}>
                {p.bedroomType === "studio" ? "Studio" : `${p.bedrooms} ${p.bedrooms === 1 ? "Bed" : "Beds"}`}
              </span>
            )}
            {p.bathrooms > 0 && <span style={{ padding: "3px 10px", background: "#f3f4f6", borderRadius: 20, fontSize: 12, color: "#374151", fontWeight: 500 }}>{p.bathrooms} {p.bathrooms === 1 ? "Bath" : "Baths"}</span>}
            {(p.builtUpArea > 0 || p.builtUpArea_min > 0) && <span style={{ padding: "3px 10px", background: "#f3f4f6", borderRadius: 20, fontSize: 12, color: "#374151", fontWeight: 500 }}>{(p.builtUpArea || p.builtUpArea_min).toLocaleString()} sqft</span>}
          </div>
        )}

        <div style={{ height: 1, background: "#f3f4f6", marginBottom: 12 }} />

        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px" }}>
              {getPriceLabel(p.propertySubType)}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>
              {getPriceDisplay(p)} <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>{p.currency || "AED"}</span>
            </div>
          </div>
          {paymentFirst && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px" }}>Down Payment</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#5c039b" }}>
                {paymentFirst}% <InfoCircleOutlined style={{ color: "#c4b5fd", fontSize: 11 }} />
              </div>
            </div>
          )}
        </div>

        {/* QR Code button — only when property has a QR code uploaded */}
        {p.qrCode && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f3f4f6" }} onClick={e => e.stopPropagation()}>
            <Popover
              trigger="hover"
              placement="top"
              styles={{ body: { padding: 12 } }}
              content={
                <div style={{ textAlign: "center" }}>
                  <img
                    src={p.qrCode}
                    alt="QR Code"
                    style={{ width: 220, height: 220, objectFit: "contain", display: "block" }}
                  />
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 8 }}>Scan to view listing</div>
                </div>
              }
            >
              <button
                style={{
                  width: "100%", padding: "6px 0", borderRadius: 8, border: "1px solid #e9d5ff",
                  background: "#faf5ff", color: "#7c3aed", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
                  <rect x="20" y="14" width="1" height="1"/><rect x="14" y="20" width="7" height="1"/>
                  <rect x="20" y="17" width="1" height="3"/>
                </svg>
                View QR Code
              </button>
            </Popover>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SORT KEY ──────────────────────────────────────────────────────────────────
// Encode sort as "field_direction" string so one Select drives both sortBy + sortOrder
const parseSortKey = (key) => {
  const map = {
    newest:           { sortBy: "createdAt",   sortOrder: "desc" },
    price_asc:        { sortBy: "price",        sortOrder: "asc"  },
    price_desc:       { sortBy: "price",        sortOrder: "desc" },
    downPayment_asc:  { sortBy: "downPayment",  sortOrder: "asc"  },
    downPayment_desc: { sortBy: "downPayment",  sortOrder: "desc" },
  };
  return map[key] || { sortBy: "createdAt", sortOrder: "desc" };
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function AgentProjects() {
  const navigate = useNavigate();

  const [properties,    setProperties]    = useState([]);
  const [filtered,      setFiltered]      = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [developers,    setDevelopers]    = useState([]);
  const [totalItems,    setTotalItems]    = useState(0);
  const [page,          setPage]          = useState(1);
  const [hasMore,       setHasMore]       = useState(true);

  // Filters
  const [search,             setSearch]             = useState("");
  const [propertyType,       setPropertyType]       = useState("all");
  const [sortKey,            setSortKey]            = useState("newest");
  const [availability,       setAvailability]       = useState([]);         // saleStatus values
  const [selectedDevelopers, setSelectedDevelopers] = useState([]);
  const [priceMin,           setPriceMin]           = useState(null);
  const [priceMax,           setPriceMax]           = useState(null);
  const [selectedUnitTypes,  setSelectedUnitTypes]  = useState([]);
  const [selectedBedrooms,   setSelectedBedrooms]   = useState([]);
  const [minArea,            setMinArea]            = useState(null);
  const [maxArea,            setMaxArea]            = useState(null);

  // Popover open states
  const [devOpen,          setDevOpen]          = useState(false);
  const [priceOpen,        setPriceOpen]        = useState(false);
  const [unitTypeOpen,     setUnitTypeOpen]     = useState(false);
  const [bedroomOpen,      setBedroomOpen]      = useState(false);
  const [areaOpen,         setAreaOpen]         = useState(false);
  const [availOpen,        setAvailOpen]        = useState(false);
  const [devSearch,        setDevSearch]        = useState("");

  const unitTypeOptions   = ["apartment", "villa", "townhouse", "duplex", "penthouse"];
  const bedroomOptions    = ["studio", "1bed", "2bed", "3bed", "4bed", "5bed", "6bed", "7bed", "8plus"];
  const availOptions      = [
    { value: "available",  label: "Available" },
    { value: "hold",       label: "On Hold" },
    { value: "reserved",   label: "Reserved" },
    { value: "booked",     label: "Booked" },
    { value: "sold",       label: "Sold" },
  ];

  const typeTabs = [
    { key: "all",        label: "All Properties" },
    { key: "off_plan",   label: "Off-Plan" },
    { key: "secondary",  label: "Secondary" },
    { key: "rental",     label: "Rental" },
    { key: "commercial", label: "Commercial" },
  ];

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchProperties = async (pageNo = 1, append = false) => {
    try {
      setLoading(true);
      const { sortBy, sortOrder } = parseSortKey(sortKey);
      const params = new URLSearchParams();
      params.append("page", pageNo);
      params.append("limit", 12);
      params.append("sortBy",    sortBy);
      params.append("sortOrder", sortOrder);
      if (propertyType !== "all")       params.append("propertySubType", propertyType);
      if (search)                        params.append("search", search);
      if (priceMin)                      params.append("minPrice", priceMin);
      if (priceMax)                      params.append("maxPrice", priceMax);
      if (minArea)                       params.append("minArea", minArea);
      if (maxArea)                       params.append("maxArea", maxArea);
      if (selectedUnitTypes.length > 0)  params.append("unitType", selectedUnitTypes.join(","));
      if (selectedBedrooms.length > 0)   params.append("bedroomType", selectedBedrooms.join(","));
      if (availability.length > 0)       params.append("saleStatus", availability.join(","));

      const res  = await apiService.get(`/properties?${params.toString()}`);
      const raw  = res?.data?.data || res?.data || res;
      const list = Array.isArray(raw) ? raw : [];

      // client-side downPayment sort (if API doesn't support it)
      if (sortBy === "downPayment") {
        list.sort((a, b) => {
          const aDP = a.paymentPlan?.[0]?.stages?.[0]?.percentage ?? 999;
          const bDP = b.paymentPlan?.[0]?.stages?.[0]?.percentage ?? 999;
          return sortOrder === "asc" ? aDP - bDP : bDP - aDP;
        });
      }

      setProperties(prev => append ? [...prev, ...list] : list);
      setFiltered(list);
      const pagination = res?.data?.pagination || res?.pagination || {};
      setTotalItems(pagination.totalItems || list.length);
      setHasMore(pageNo < (pagination.totalPages || 1));
    } catch (err) {
      console.error(err);
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
  }, [propertyType, sortKey, availability.join(",")]);

  useEffect(() => {
    if (page > 1) fetchProperties(page, true);
  }, [page]);

  // client-side secondary filters (developer, price range, unit type, bedrooms, area, search)
  useEffect(() => {
    let results = [...properties];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(p =>
        p.propertyName?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.area?.toLowerCase().includes(q) ||
        (p.locality || "").toLowerCase().includes(q) ||
        (p.developer?.name || p.developerName || "").toLowerCase().includes(q)
      );
    }
    if (selectedDevelopers.length > 0)
      results = results.filter(p => selectedDevelopers.includes(p.developer?._id));
    if (priceMin) results = results.filter(p => (p.price || p.price_min || 0) >= priceMin);
    if (priceMax) results = results.filter(p => (p.price || p.price_min || 0) <= priceMax);
    if (selectedUnitTypes.length > 0)
      results = results.filter(p => selectedUnitTypes.some(ut => p.unitType?.toLowerCase().includes(ut.toLowerCase())));
    if (selectedBedrooms.length > 0)
      results = results.filter(p => selectedBedrooms.includes(p.bedroomType));
    if (minArea) results = results.filter(p => (p.builtUpArea || p.builtUpArea_min || 0) >= minArea);
    if (maxArea) results = results.filter(p => (p.builtUpArea || p.builtUpArea_min || 0) <= maxArea);
    setFiltered(results);
  }, [search, selectedDevelopers, priceMin, priceMax, selectedUnitTypes, selectedBedrooms, minArea, maxArea, properties]);

  // ── chip style ──────────────────────────────────────────────────────────────
  const chip = (selected) => ({
    padding: "5px 12px", background: selected ? "#111827" : "#f3f4f6",
    color: selected ? "#fff" : "#4b5563", borderRadius: 6, cursor: "pointer",
    fontWeight: 500, fontSize: 13, transition: "all 0.15s", userSelect: "none",
  });

  const filterBtn = (active) => ({
    height: 38, borderRadius: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 13,
    background: active ? "#f3e8ff" : "#fff",
    borderColor: active ? "#c4b5fd" : "#e5e7eb",
    color: active ? "#5c039b" : "#374151",
    fontWeight: active ? 600 : 400,
  });

  // ── popovers ────────────────────────────────────────────────────────────────
  const devPopover = (
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
    <div style={{ width: 320, padding: 16 }}>
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Min price</Text>
          <InputNumber style={{ width: "100%" }} placeholder="From" value={priceMin} onChange={setPriceMin} suffix="AED" />
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Max price</Text>
          <InputNumber style={{ width: "100%" }} placeholder="To" value={priceMax} onChange={setPriceMax} suffix="AED" />
        </Col>
      </Row>
      <Button type="primary" block style={{ height: 38, background: "#111827" }} onClick={() => { setPriceOpen(false); setPage(1); fetchProperties(1, false); }}>Apply</Button>
    </div>
  );

  const unitTypePopover = (
    <div style={{ width: 360, padding: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {unitTypeOptions.map(t => (
          <div key={t} style={chip(selectedUnitTypes.includes(t))}
            onClick={() => setSelectedUnitTypes(selectedUnitTypes.includes(t) ? selectedUnitTypes.filter(x => x !== t) : [...selectedUnitTypes, t])}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>
    </div>
  );

  const bedroomPopover = (
    <div style={{ width: 360, padding: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {bedroomOptions.map(b => (
          <div key={b} style={chip(selectedBedrooms.includes(b))}
            onClick={() => setSelectedBedrooms(selectedBedrooms.includes(b) ? selectedBedrooms.filter(x => x !== b) : [...selectedBedrooms, b])}>
            {b === "8plus" ? "8+ Bed" : b === "studio" ? "Studio" : `${b.replace("bed", "")} Bed`}
          </div>
        ))}
      </div>
    </div>
  );

  const areaPopover = (
    <div style={{ width: 300, padding: 16 }}>
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Min (sqft)</Text>
          <InputNumber style={{ width: "100%" }} placeholder="Min" value={minArea} onChange={setMinArea} />
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Max (sqft)</Text>
          <InputNumber style={{ width: "100%" }} placeholder="Max" value={maxArea} onChange={setMaxArea} />
        </Col>
      </Row>
      <Button type="primary" block style={{ height: 38, background: "#111827" }} onClick={() => { setAreaOpen(false); setPage(1); fetchProperties(1, false); }}>Apply</Button>
    </div>
  );

  const availPopover = (
    <div style={{ width: 240, padding: 12 }}>
      <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 10 }}>Filter by availability</Text>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {availOptions.map(opt => (
          <div key={opt.value} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Checkbox
              checked={availability.includes(opt.value)}
              onChange={e => setAvailability(e.target.checked ? [...availability, opt.value] : availability.filter(v => v !== opt.value))}
            />
            <Text style={{ fontSize: 13 }}>{opt.label}</Text>
          </div>
        ))}
      </div>
      <Button type="text" block style={{ marginTop: 10 }} onClick={() => setAvailability([])}>Clear All</Button>
    </div>
  );

  // ── active filter count for display ────────────────────────────────────────
  const activeFiltersCount =
    selectedDevelopers.length +
    selectedUnitTypes.length +
    selectedBedrooms.length +
    availability.length +
    (priceMin || priceMax ? 1 : 0) +
    (minArea  || maxArea  ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedDevelopers([]);
    setSelectedUnitTypes([]);
    setSelectedBedrooms([]);
    setAvailability([]);
    setPriceMin(null);
    setPriceMax(null);
    setMinArea(null);
    setMaxArea(null);
    setSearch("");
  };

  return (
    <div style={{ padding: "28px 32px", background: "#f8f9fa", minHeight: "100vh" }}>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700 }}>Property Catalogue</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {totalItems > 0 ? `${totalItems} listings available` : "Browse all live listings"}
          </Text>
        </div>
        {activeFiltersCount > 0 && (
          <Button size="small" type="link" danger onClick={clearAllFilters}>
            Clear all filters ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* ── TYPE TABS ── */}
      <div style={{ marginBottom: 20, display: "flex", gap: 8, borderBottom: "1px solid #e8e8e8", paddingBottom: 14, flexWrap: "wrap" }}>
        {typeTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setPropertyType(tab.key); setPage(1); }}
            style={{
              padding: "6px 18px", borderRadius: 20, border: "1px solid", cursor: "pointer",
              fontSize: 13, fontWeight: propertyType === tab.key ? 700 : 400,
              background: propertyType === tab.key ? "#111827" : "#fff",
              color: propertyType === tab.key ? "#fff" : "#6b7280",
              borderColor: propertyType === tab.key ? "#111827" : "#e5e7eb",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{ marginBottom: 24, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <Input
          prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
          placeholder="Search by name, area, developer..."
          style={{ width: 260, borderRadius: 8, height: 38 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
        />

        {/* Sort */}
        <Select
          style={{ width: 200, height: 38 }}
          value={sortKey}
          onChange={v => { setSortKey(v); setPage(1); }}
        >
          <Option value="newest">Recently Added</Option>
          <Option value="price_asc">Price: Low → High</Option>
          <Option value="price_desc">Price: High → Low</Option>
          <Option value="downPayment_asc">Down-payment: Low → High</Option>
          <Option value="downPayment_desc">Down-payment: High → Low</Option>
        </Select>

        {/* Developer */}
        <Popover content={devPopover} trigger="click" open={devOpen} onOpenChange={setDevOpen} placement="bottomLeft" styles={{ body: { padding: 0, borderRadius: 10 } }}>
          <Button style={filterBtn(selectedDevelopers.length > 0)}>
            Developer {selectedDevelopers.length > 0 && `(${selectedDevelopers.length})`} <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Popover>

        {/* Price */}
        <Popover content={pricePopover} trigger="click" open={priceOpen} onOpenChange={setPriceOpen} placement="bottomLeft" styles={{ body: { borderRadius: 10 } }}>
          <Button style={filterBtn(!!(priceMin || priceMax))}>
            Price {(priceMin || priceMax) && "●"} <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Popover>

        {/* Unit Type */}
        <Popover content={unitTypePopover} trigger="click" open={unitTypeOpen} onOpenChange={setUnitTypeOpen} placement="bottomLeft" styles={{ body: { borderRadius: 10 } }}>
          <Button style={filterBtn(selectedUnitTypes.length > 0)}>
            Unit Type {selectedUnitTypes.length > 0 && `(${selectedUnitTypes.length})`} <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Popover>

        {/* Bedrooms */}
        <Popover content={bedroomPopover} trigger="click" open={bedroomOpen} onOpenChange={setBedroomOpen} placement="bottomLeft" styles={{ body: { borderRadius: 10 } }}>
          <Button style={filterBtn(selectedBedrooms.length > 0)}>
            Bedrooms {selectedBedrooms.length > 0 && `(${selectedBedrooms.length})`} <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Popover>

        {/* Area */}
        <Popover content={areaPopover} trigger="click" open={areaOpen} onOpenChange={setAreaOpen} placement="bottomLeft" styles={{ body: { borderRadius: 10 } }}>
          <Button style={filterBtn(!!(minArea || maxArea))}>
            Area {(minArea || maxArea) && "●"} <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Popover>

        {/* Availability */}
        <Popover content={availPopover} trigger="click" open={availOpen} onOpenChange={setAvailOpen} placement="bottomLeft" styles={{ body: { borderRadius: 10, padding: 0 } }}>
          <Button style={filterBtn(availability.length > 0)}>
            <FilterOutlined style={{ fontSize: 11 }} />
            Availability {availability.length > 0 && `(${availability.length})`} <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Popover>

        <span style={{ marginLeft: "auto", fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>
          {filtered.length} {filtered.length === 1 ? "property" : "properties"}
        </span>
      </div>

      {/* ── GRID ── */}
      {filtered.length === 0 && !loading ? (
        <Empty description="No properties found" style={{ marginTop: 60 }} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20 }}>
          {filtered.map(p => (
            <PropertyCard
              key={p._id}
              p={p}
              onClick={() => navigate(`/dashboard/agent/projects/${p._id}`)}
            />
          ))}
        </div>
      )}

      {/* ── LOAD MORE / SPINNER ── */}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        {loading ? (
          <Spin size="large" />
        ) : hasMore && filtered.length > 0 ? (
          <button
            onClick={() => setPage(prev => prev + 1)}
            style={{ padding: "10px 36px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#374151", transition: "all 0.15s" }}
            onMouseEnter={e => { e.target.style.background = "#111827"; e.target.style.color = "#fff"; }}
            onMouseLeave={e => { e.target.style.background = "#fff";    e.target.style.color = "#374151"; }}
          >
            Show More
          </button>
        ) : filtered.length > 0 ? (
          <Text type="secondary" style={{ fontSize: 13 }}>All properties loaded</Text>
        ) : null}
      </div>
    </div>
  );
}
