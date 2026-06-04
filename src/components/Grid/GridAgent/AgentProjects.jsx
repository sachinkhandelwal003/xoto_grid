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
  Tag,
  Empty
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  InfoCircleOutlined,
  SearchOutlined,
  DownOutlined,
  HomeOutlined,
  BuildOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

// ─── PROPERTY CARD ─────────────────────────────────────────────────────────────
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

  const isOffPlan  = p.propertySubType === "off_plan";
  const approval   = p.approvalStatus;   // 'approved' | 'pending' | 'rejected'
  const isActive   = p.listingStatus === "active";
  const devLogo    = p.developer?.logo;
  const devName    = p.developer?.name || p.developerName || "Developer";

  const approvalColor = { approved: "#16a34a", pending: "#d97706", rejected: "#dc2626" };
  const approvalBg    = { approved: "#dcfce7", pending: "#fef3c7", rejected: "#fee2e2" };
  const approvalLabel = { approved: "Approved", pending: "Pending", rejected: "Rejected" };
  const approvalIcon  = {
    approved: <CheckCircleOutlined />,
    pending:  <ClockCircleOutlined />,
    rejected: <CloseCircleOutlined />,
  };

  const paymentFirst = p.paymentPlan?.[0]?.stages?.[0]?.percentage;

  return (
    <div
      onClick={onClick}
      style={{
        background:    "#fff",
        borderRadius:  14,
        border:        "1px solid #e8e8e8",
        boxShadow:     "0 2px 10px rgba(0,0,0,0.05)",
        overflow:      "hidden",
        cursor:        "pointer",
        display:       "flex",
        flexDirection: "column",
        transition:    "transform 0.18s, box-shadow 0.18s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform  = "translateY(-3px)";
        e.currentTarget.style.boxShadow  = "0 8px 24px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform  = "translateY(0)";
        e.currentTarget.style.boxShadow  = "0 2px 10px rgba(0,0,0,0.05)";
      }}
    >
      {/* ── IMAGE SECTION ── */}
      <div style={{ position: "relative", height: 200, overflow: "hidden", flexShrink: 0, background: "#f3f4f6" }}>
        <img
          src={imgSrc}
          alt={p.propertyName}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800"; }}
        />

        {/* Dark gradient overlay at bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)", pointerEvents: "none" }} />

        {/* ── TOP-LEFT: Property type tag ── */}
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <span style={{
            display:      "inline-flex",
            alignItems:   "center",
            gap:          4,
            padding:      "4px 10px",
            borderRadius: 20,
            fontSize:     11,
            fontWeight:   700,
            letterSpacing: "0.3px",
            background:   isOffPlan ? "rgba(124,58,237,0.92)" : "rgba(37,99,235,0.92)",
            color:        "#fff",
            backdropFilter: "blur(4px)",
          }}>
            {isOffPlan ? "🏗️ Off-Plan" : "🏠 Secondary"}
          </span>
        </div>

        {/* ── TOP-RIGHT: Approval status (secondary only) ── */}
        {!isOffPlan && approval && (
          <div style={{ position: "absolute", top: 10, right: 10 }}>
            <span style={{
              display:      "inline-flex",
              alignItems:   "center",
              gap:          4,
              padding:      "4px 10px",
              borderRadius: 20,
              fontSize:     11,
              fontWeight:   700,
              background:   approvalBg[approval] || "#f3f4f6",
              color:        approvalColor[approval] || "#374151",
              border:       `1px solid ${approvalColor[approval]}30`,
            }}>
              {approvalIcon[approval]} {approvalLabel[approval] || approval}
            </span>
          </div>
        )}

        {/* ── BOTTOM ROW: Active Listing (left) + Dev Logo (right) ── */}
        <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Active Listing badge */}
          {isActive ? (
            <span style={{
              display:      "inline-flex",
              alignItems:   "center",
              gap:          4,
              padding:      "3px 9px",
              borderRadius: 20,
              fontSize:     11,
              fontWeight:   700,
              background:   "rgba(22,163,74,0.92)",
              color:        "#fff",
              backdropFilter: "blur(4px)",
            }}>
              ● Active Listing
            </span>
          ) : (
            <span /> /* spacer so dev logo stays right */
          )}

          {/* Developer Logo */}
          {devLogo ? (
            <div style={{
              width:        36,
              height:       36,
              borderRadius: 8,
              background:   "#fff",
              border:       "2px solid rgba(255,255,255,0.9)",
              boxShadow:    "0 2px 8px rgba(0,0,0,0.18)",
              overflow:     "hidden",
              flexShrink:   0,
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
            }}>
              <img src={devLogo} alt={devName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          ) : (
            <div style={{
              width:         36,
              height:        36,
              borderRadius:  8,
              background:    "rgba(255,255,255,0.9)",
              border:        "2px solid rgba(255,255,255,0.9)",
              boxShadow:     "0 2px 8px rgba(0,0,0,0.18)",
              display:       "flex",
              alignItems:    "center",
              justifyContent:"center",
              fontWeight:    700,
              fontSize:      14,
              color:         "#5c039b",
              flexShrink:    0,
            }}>
              {devName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>

        {/* Title */}
        <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {p.propertyName}
        </div>

        {/* Location + Developer */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6b7280", marginBottom: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <EnvironmentOutlined style={{ fontSize: 11, flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {[p.area, p.city].filter(Boolean).join(", ")}
          </span>
          <span style={{ color: "#d1d5db", flexShrink: 0 }}>•</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#9ca3af" }}>
            {devName}
          </span>
        </div>

        {/* Specs chips */}
        {(p.bedrooms > 0 || p.bathrooms > 0 || p.builtUpArea || p.builtUpArea_min) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {p.bedrooms > 0 && (
              <span style={{ padding: "3px 10px", background: "#f3f4f6", borderRadius: 20, fontSize: 12, color: "#374151", fontWeight: 500 }}>
                {p.bedrooms} {p.bedrooms === 1 ? "Bed" : "Beds"}
              </span>
            )}
            {p.bathrooms > 0 && (
              <span style={{ padding: "3px 10px", background: "#f3f4f6", borderRadius: 20, fontSize: 12, color: "#374151", fontWeight: 500 }}>
                {p.bathrooms} {p.bathrooms === 1 ? "Bath" : "Baths"}
              </span>
            )}
            {(p.builtUpArea || p.builtUpArea_min) && (
              <span style={{ padding: "3px 10px", background: "#f3f4f6", borderRadius: 20, fontSize: 12, color: "#374151", fontWeight: 500 }}>
                {(p.builtUpArea || p.builtUpArea_min).toLocaleString()} sqft
              </span>
            )}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: "#f3f4f6", marginBottom: 12 }} />

        {/* Price + Payment */}
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px" }}>Price from</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>
              {getPriceDisplay(p)} <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>{p.currency || "AED"}</span>
            </div>
          </div>
          {paymentFirst && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px" }}>Payment</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#5c039b" }}>
                {paymentFirst}% <InfoCircleOutlined style={{ color: "#c4b5fd", fontSize: 11 }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function AgentProjects() {
  const navigate = useNavigate();

  const [properties,   setProperties]   = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [developers,   setDevelopers]   = useState([]);
  const [stats,        setStats]        = useState({
    secondaryTotal: 0, secondaryPending: 0, secondaryApproved: 0,
    secondaryRejected: 0, secondaryActive: 0, offplanTotal: 0,
    featuredSecondary: 0, featuredOffplan: 0
  });

  const [page,      setPage]      = useState(1);
  const [hasMore,   setHasMore]   = useState(true);
  const [totalItems,setTotalItems]= useState(0);

  const [search,          setSearch]          = useState("");
  const [propertyType,    setPropertyType]    = useState("all");
  const [approvalStatus,  setApprovalStatus]  = useState("all");
  const [listingStatus,   setListingStatus]   = useState("all");

  const [devPopoverOpen,    setDevPopoverOpen]    = useState(false);
  const [devSearchText,     setDevSearchText]     = useState("");
  const [selectedDevelopers,setSelectedDevelopers]= useState([]);

  const [pricePopoverOpen,setPricePopoverOpen] = useState(false);
  const [priceMin,        setPriceMin]         = useState(null);
  const [priceMax,        setPriceMax]         = useState(null);

  const [unitTypePopoverOpen,  setUnitTypePopoverOpen]   = useState(false);
  const [selectedUnitTypes,    setSelectedUnitTypes]     = useState([]);

  const [bedroomPopoverOpen, setBedroomPopoverOpen] = useState(false);
  const [selectedBedrooms,   setSelectedBedrooms]   = useState([]);

  const [areaPopoverOpen, setAreaPopoverOpen] = useState(false);
  const [minArea,         setMinArea]         = useState(null);
  const [maxArea,         setMaxArea]         = useState(null);

  const [sortBy,    setSortBy]    = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const unitTypeOptions  = ["apartment","villa","townhouse","duplex","penthouse"];
  const bedroomOptions   = ["studio","1bed","2bed","3bed","4bed","5bed","6bed","7bed","8plus"];

  const fetchProperties = async (pageNo = 1, append = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", pageNo);
      params.append("limit", 12);
      if (propertyType !== 'all') params.append("propertySubType", propertyType);
      if (approvalStatus !== "all") params.append("approvalStatus", approvalStatus);
      if (listingStatus !== "all") params.append("listingStatus", listingStatus);
      if (search) params.append("search", search);
      if (priceMin) params.append("minPrice", priceMin);
      if (priceMax) params.append("maxPrice", priceMax);
      if (minArea)  params.append("minArea", minArea);
      if (maxArea)  params.append("maxArea", maxArea);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
      if (selectedUnitTypes.length > 0) params.append("unitType", selectedUnitTypes[0]);
      if (selectedBedrooms.length > 0)  params.append("bedroomType", selectedBedrooms[0]);

      const res  = await apiService.get(`/properties?${params.toString()}`);
      const list = Array.isArray(res?.data) ? res.data : [];
      setProperties(prev => append ? [...prev, ...list] : list);
      setFiltered(list);
      setTotalItems(res?.pagination?.totalItems || list.length);
      setHasMore(pageNo < (res?.pagination?.totalPages || 1));
      if (res?.stats) setStats(res.stats);
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
  }, [propertyType, approvalStatus, listingStatus, sortBy, sortOrder]);

  useEffect(() => {
    if (page > 1) fetchProperties(page, true);
  }, [page]);

  useEffect(() => {
    let results = [...properties];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(p =>
        p.propertyName?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.area?.toLowerCase().includes(q) ||
        p.developerName?.toLowerCase().includes(q)
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

  // ── Popover contents ──────────────────────────────────────────────────────
  const devPopoverContent = (
    <div style={{ width: 300, padding: '12px 0 0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 16px 12px' }}>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Filter by developer</Text>
        <Input prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} placeholder="Search..." value={devSearchText} onChange={e => setDevSearchText(e.target.value)} style={{ borderRadius: 6 }} allowClear />
      </div>
      <div style={{ maxHeight: 220, overflowY: 'auto', padding: '8px 16px', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        {developers.filter(d => d.name?.toLowerCase().includes(devSearchText.toLowerCase())).map(dev => (
          <div key={dev._id} style={{ padding: '7px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Checkbox checked={selectedDevelopers.includes(dev._id)} onChange={e => setSelectedDevelopers(e.target.checked ? [...selectedDevelopers, dev._id] : selectedDevelopers.filter(i => i !== dev._id))} />
            <Avatar shape="square" src={dev.logo} style={{ background: '#f3e8ff', color: '#5c039b' }} size="small">{!dev.logo && dev.name?.charAt(0)}</Avatar>
            <Text style={{ fontSize: 13 }}>{dev.name}</Text>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex' }}>
        <Button type="text" style={{ flex: 1, borderRadius: 0, height: 40 }} onClick={() => setSelectedDevelopers([])}>Clear</Button>
        <div style={{ width: 1, background: '#f0f0f0' }} />
        <Button type="text" style={{ flex: 1, borderRadius: 0, height: 40 }} onClick={() => setDevPopoverOpen(false)}>Close</Button>
      </div>
    </div>
  );

  const pricePopoverContent = (
    <div style={{ width: 320, padding: 16 }}>
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Min price</Text>
          <InputNumber style={{ width: '100%' }} placeholder="From" value={priceMin} onChange={setPriceMin} suffix="AED" />
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Max price</Text>
          <InputNumber style={{ width: '100%' }} placeholder="To" value={priceMax} onChange={setPriceMax} suffix="AED" />
        </Col>
      </Row>
      <Button type="primary" block style={{ height: 38, background: '#111827' }} onClick={() => setPricePopoverOpen(false)}>Apply</Button>
    </div>
  );

  const chipStyle = (selected) => ({
    padding: '5px 12px', background: selected ? '#111827' : '#f3f4f6',
    color: selected ? '#fff' : '#4b5563', borderRadius: 6, cursor: 'pointer',
    fontWeight: 500, fontSize: 13, transition: 'all 0.15s', userSelect: 'none',
  });

  const unitTypePopoverContent = (
    <div style={{ width: 360, padding: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {unitTypeOptions.map(t => (
          <div key={t} style={chipStyle(selectedUnitTypes.includes(t))}
            onClick={() => setSelectedUnitTypes(selectedUnitTypes.includes(t) ? selectedUnitTypes.filter(x => x !== t) : [...selectedUnitTypes, t])}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>
    </div>
  );

  const bedroomPopoverContent = (
    <div style={{ width: 360, padding: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {bedroomOptions.map(b => (
          <div key={b} style={chipStyle(selectedBedrooms.includes(b))}
            onClick={() => setSelectedBedrooms(selectedBedrooms.includes(b) ? selectedBedrooms.filter(x => x !== b) : [...selectedBedrooms, b])}>
            {b === "8plus" ? "8+ Bed" : b === "studio" ? "Studio" : `${b.replace('bed', '')} Bed`}
          </div>
        ))}
      </div>
    </div>
  );

  const areaPopoverContent = (
    <div style={{ width: 300, padding: 16 }}>
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Min (sqft)</Text>
          <InputNumber style={{ width: '100%' }} placeholder="Min" value={minArea} onChange={setMinArea} />
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Max (sqft)</Text>
          <InputNumber style={{ width: '100%' }} placeholder="Max" value={maxArea} onChange={setMaxArea} />
        </Col>
      </Row>
      <Button type="primary" block style={{ height: 38, background: '#111827' }} onClick={() => setAreaPopoverOpen(false)}>Apply</Button>
    </div>
  );

  const filterBtnStyle = (active) => ({
    height: 38, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
    background: active ? '#f3e8ff' : '#fff',
    borderColor: active ? '#c4b5fd' : '#e5e7eb',
    color: active ? '#5c039b' : '#374151',
    fontWeight: active ? 600 : 400,
  });

  return (
    <div style={{ padding: "28px 32px", background: "#f8f9fa", minHeight: "100vh" }}>

      {/* ── TYPE TABS ── */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 8, borderBottom: '1px solid #e8e8e8', paddingBottom: 14 }}>
        {[
          { key: 'all',       label: 'All Properties' },
          { key: 'off_plan',  label: '🏗️ Off-Plan' },
          { key: 'secondary', label: '🏠 Secondary' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setPropertyType(tab.key)} style={{
            padding:       "6px 18px",
            borderRadius:  20,
            border:        "1px solid",
            cursor:        "pointer",
            fontSize:      13,
            fontWeight:    propertyType === tab.key ? 700 : 400,
            background:    propertyType === tab.key ? "#111827" : "#fff",
            color:         propertyType === tab.key ? "#fff" : "#6b7280",
            borderColor:   propertyType === tab.key ? "#111827" : "#e5e7eb",
            transition:    "all 0.15s",
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          placeholder="Search by name, city, area..."
          style={{ width: 260, borderRadius: 8, height: 38 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
        />

        <Select style={{ width: 155, height: 38 }} value={sortBy} onChange={setSortBy}>
          <Option value="createdAt">Newest First</Option>
          <Option value="price">Price: Low–High</Option>
          <Option value="updatedAt">Recently Updated</Option>
        </Select>

        <Popover content={devPopoverContent} trigger="click" open={devPopoverOpen} onOpenChange={setDevPopoverOpen} placement="bottomLeft" overlayInnerStyle={{ padding: 0, borderRadius: 10 }}>
          <Button style={filterBtnStyle(selectedDevelopers.length > 0)}>
            Developer {selectedDevelopers.length > 0 && `(${selectedDevelopers.length})`} <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Popover>

        <Popover content={pricePopoverContent} trigger="click" open={pricePopoverOpen} onOpenChange={setPricePopoverOpen} placement="bottomLeft" overlayInnerStyle={{ borderRadius: 10 }}>
          <Button style={filterBtnStyle(!!(priceMin || priceMax))}>
            Price {(priceMin || priceMax) && "●"} <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Popover>

        <Popover content={unitTypePopoverContent} trigger="click" open={unitTypePopoverOpen} onOpenChange={setUnitTypePopoverOpen} placement="bottomLeft" overlayInnerStyle={{ borderRadius: 10 }}>
          <Button style={filterBtnStyle(selectedUnitTypes.length > 0)}>
            Unit Type {selectedUnitTypes.length > 0 && `(${selectedUnitTypes.length})`} <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Popover>

        <Popover content={bedroomPopoverContent} trigger="click" open={bedroomPopoverOpen} onOpenChange={setBedroomPopoverOpen} placement="bottomLeft" overlayInnerStyle={{ borderRadius: 10 }}>
          <Button style={filterBtnStyle(selectedBedrooms.length > 0)}>
            Bedrooms {selectedBedrooms.length > 0 && `(${selectedBedrooms.length})`} <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Popover>

        <Popover content={areaPopoverContent} trigger="click" open={areaPopoverOpen} onOpenChange={setAreaPopoverOpen} placement="bottomLeft" overlayInnerStyle={{ borderRadius: 10 }}>
          <Button style={filterBtnStyle(!!(minArea || maxArea))}>
            Area {(minArea || maxArea) && "●"} <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Popover>

        {/* Total count */}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>
          {filtered.length} {filtered.length === 1 ? "property" : "properties"}
        </span>
      </div>

      {/* ── GRID ── */}
      {filtered.length === 0 && !loading ? (
        <Empty description="No properties found" style={{ marginTop: 60 }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 20 }}>
          {filtered.map(p => (
            <PropertyCard
              key={p._id}
              p={p}
              onClick={() => navigate(`/dashboard/agent/projects/${p._id}`)}
            />
          ))}
        </div>
      )}

      {/* ── LOAD MORE ── */}
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
            Show More
          </button>
        ) : filtered.length > 0 ? (
          <Text type="secondary" style={{ fontSize: 13 }}>All properties loaded</Text>
        ) : null}
      </div>
    </div>
  );
}