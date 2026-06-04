import { Skeleton, Switch, Select, Slider, Drawer, Button as AntButton } from "antd";
import { useSelector } from "react-redux";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  PlusOutlined, SearchOutlined, EnvironmentOutlined,
  ExpandOutlined, EyeOutlined, EditOutlined, AppstoreOutlined,
  CheckCircleFilled, ClockCircleFilled, CloseCircleFilled,
  FireFilled, BuildFilled, ApartmentOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const { Option } = Select;

const UAE_LOCALITIES = [
  "Dubai Marina", "Downtown Dubai", "JVC", "Business Bay",
  "Palm Jumeirah", "Dubai Hills", "Abu Dhabi", "Sharjah",
  "Al Barsha", "Al Reem Island", "Saadiyat Island",
];

const SALE_STATUSES = ["All", "Available", "Reserved", "Sold"];
const DEVELOPMENT_STATUSES = ["All", "Planned", "Under Construction", "Completed"];
const UNIT_TYPES = ["Apartment", "Villa & Townhouse", "Penthouse", "Commercial", "Plot"];

const generateQuarterlyOptions = () => {
  const options = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year <= 2030; year++) {
    for (let q = 1; q <= 4; q++) {
      options.push(`Q${q} ${year}`);
    }
  }
  return options;
};

const STATUS_CONFIG = {
  approved: { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", icon: <CheckCircleFilled />, label: "Approved" },
  pending: { color: "#92400e", bg: "#fffbeb", border: "#fde68a", icon: <ClockCircleFilled />, label: "Pending" },
  rejected: { color: "#991b1b", bg: "#fef2f2", border: "#fecaca", icon: <CloseCircleFilled />, label: "Rejected" },
  draft: { color: "#475569", bg: "#f8fafc", border: "#cbd5e1", icon: <EditOutlined />, label: "Draft" },
};

const projectStatusLabel = (s) => ({
  presale: "Pre-Sale",
  under_construction: "Under Construction",
  ready: "Ready",
  sold_out: "Sold Out",
  planned: "Planned",
  completed: "Completed",
}[s] || s);

const saleStatusLabel = (s) => ({
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
}[s] || "Available");

export default function DeveloperProjects() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Quick Filters
  const [postHandover, setPostHandover] = useState(false);
  const [quickLocation, setQuickLocation] = useState("All");
  const [quickSaleStatus, setQuickSaleStatus] = useState("All");

  // Status Filter (Live/Pending/Rejected/Draft)
  const [statusFilter, setStatusFilter] = useState("All");

  // Advanced Filters
  const [advancedDrawerOpen, setAdvancedDrawerOpen] = useState(false);
  const [advDevelopmentStatus, setAdvDevelopmentStatus] = useState("All");
  const [advLocation, setAdvLocation] = useState("All");
  const [advUnitType, setAdvUnitType] = useState("All");
  const [advCompletionBy, setAdvCompletionBy] = useState(null);
  const [advSaleStatus, setAdvSaleStatus] = useState("All");
  const [advPriceRange, setAdvPriceRange] = useState([0, 10000000]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await apiService.get("/properties/", { page: 1, limit: 50 });

      // Backend returns: { status, count, pagination, data: [properties] }
      // But keep this defensive since older versions sometimes returned arrays directly.
      const list =
        (Array.isArray(res) && res) ||
        (Array.isArray(res?.data) && res.data) ||
        (Array.isArray(res?.data?.data) && res.data.data) ||
        (Array.isArray(res?.data?.properties) && res.data.properties) ||
        [];

      console.log("Property data for mapping:", list[0]);
      
      const mapped = list.map((p, i) => {
        // Get the first available image with proper fallbacks
        let imageUrl = "";
        
        // Check all possible image sources
        if (p.media?.architectureImages?.length > 0) imageUrl = p.media.architectureImages[0];
        else if (p.media?.interiorImages?.length > 0) imageUrl = p.media.interiorImages[0];
        else if (p.media?.lobbyImages?.length > 0) imageUrl = p.media.lobbyImages[0];
        else if (p.media?.otherImages?.length > 0) imageUrl = p.media.otherImages[0];
        
        console.log(`Property ${p.propertyName || p.projectName} imageUrl:`, imageUrl);
        
        return {
          key: p._id || `row-${i}`,
          propertyName: p.projectName || p.propertyName || "Untitled Project",
          location: p.location?.address || p.locality || p.area || "Location not added",
          units: p.floorPlans?.length > 0
            ? `${p.floorPlans[0]?.areaFrom || 0} - ${p.floorPlans[0]?.areaTo || 0} sqft`
            : null,
          status: p.approvalStatus || p.status || "draft",
          image: imageUrl,
          price: (p.priceRange?.from && p.priceRange?.to)
            ? `AED ${Number(p.priceRange.from).toLocaleString()} - AED ${Number(p.priceRange.to).toLocaleString()}`
            : (p.price_min && p.price_max)
              ? `AED ${Number(p.price_min).toLocaleString()} - AED ${Number(p.price_max).toLocaleString()}`
              : null,
        priceMin: p.priceRange?.from || p.price_min || 0,
        priceMax: p.priceRange?.to || p.price_max || 0,
        projectStatus: p.projectStatus || "",
        developmentStatus: p.developmentStatus || "Planned",
        isFeatured: p.isFeatured || false,
        bedroomType: p.inventory?.[0]?.unitType || "",
        unitType: p.propertyType || "Apartment",
        completionDate: p.completionDate,
        constructionProgress: p.constructionProgress || 0,
        furnishingStatus: p.furnishingStatus || "",
        totalBuildings: p.buildings?.length || 0,
        totalUnitTypes: p.inventory?.length || 0,
        saleStatus: p.saleStatus || "Available",
        isPostHandover: p.projectStatus === "ready" || p.developmentStatus === "Completed",
        };
      });

      setProjects(mapped);
      setFiltered(mapped);
    } catch (err) {
      // errors are surfaced via global apiService interceptor toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    let base = [...projects];

    // Status Filter (Live/Pending/Rejected/Draft)
    if (statusFilter !== "All") {
      if (statusFilter === "Live") {
        base = base.filter(p => p.status === "approved");
      } else {
        base = base.filter(p => p.status === statusFilter.toLowerCase());
      }
    }

    if (postHandover) {
      base = base.filter(p => p.isPostHandover);
    }

    if (quickLocation !== "All") {
      base = base.filter(p => p.location.toLowerCase().includes(quickLocation.toLowerCase()));
    }

    if (quickSaleStatus !== "All") {
      base = base.filter(p => p.saleStatus === quickSaleStatus);
    }

    // Advanced Filters
    if (advDevelopmentStatus !== "All") {
      base = base.filter(p => p.developmentStatus === advDevelopmentStatus);
    }

    if (advLocation !== "All") {
      base = base.filter(p => p.location.toLowerCase().includes(advLocation.toLowerCase()));
    }

    if (advUnitType !== "All") {
      base = base.filter(p => {
        if (advUnitType === "Villa & Townhouse") {
          return p.unitType.toLowerCase().includes("villa") || p.unitType.toLowerCase().includes("townhouse");
        }
        return p.unitType === advUnitType;
      });
    }

    if (advSaleStatus !== "All") {
      base = base.filter(p => p.saleStatus === advSaleStatus);
    }

    if (advPriceRange[0] > 0 || advPriceRange[1] < 10000000) {
      base = base.filter(p =>
        (p.priceMin >= advPriceRange[0] && p.priceMin <= advPriceRange[1]) ||
        (p.priceMax >= advPriceRange[0] && p.priceMax <= advPriceRange[1])
      );
    }

    setFiltered(base.filter(p =>
      p.propertyName?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q)
    ));
  }, [
    search, projects, statusFilter, postHandover, quickLocation, quickSaleStatus,
    advDevelopmentStatus, advLocation, advUnitType, advCompletionBy, advSaleStatus, advPriceRange
  ]);

  return (
    <div style={S.page}>
      {/* HEADER */}
      <div style={S.topBar}>
        <div>
          <h1 style={S.pageTitle}>Property Management</h1>
          <p style={S.pageSubtitle}>
            {projects.length} listings total · {projects.filter(p => p.status === "approved").length} live · {projects.filter(p => p.status === "pending").length} pending
          </p>
        </div>
        <button style={S.addBtn} onClick={() => navigate("/dashboard/developer/developer-properties/add")}>
          <PlusOutlined style={{ fontSize: 13 }} /> Add Listing
        </button>
      </div>

      {/* STATUS FILTER TABS */}
      <div style={S.statusTabs}>
        {["All", "Live", "Pending", "Rejected", "Draft"].map(tab => (
          <button
            key={tab}
            style={{
              ...S.statusTab,
              ...(statusFilter === tab ? S.statusTabActive : {})
            }}
            onClick={() => setStatusFilter(tab)}
          >
            {tab}
            {tab === "All" ? "" : tab === "Live" ? ` (${projects.filter(p => p.status === "approved").length})` : ` (${projects.filter(p => p.status === tab.toLowerCase()).length})`}
          </button>
        ))}
      </div>

      {/* FILTER BAR */}
      <div style={S.filterBar}>
        <div style={S.filterRow}>
          <div style={S.filterGroup}>
            <span style={S.filterLabel}>Post Handover</span>
            <Switch checked={postHandover} onChange={setPostHandover} />
          </div>

          <div style={S.filterGroup}>
            <span style={S.filterLabel}>Location</span>
            <Select
              value={quickLocation}
              onChange={setQuickLocation}
              style={{ width: 180 }}
              size="small"
            >
              <Option value="All">All</Option>
              {UAE_LOCALITIES.map(loc => (
                <Option key={loc} value={loc}>{loc}</Option>
              ))}
            </Select>
          </div>

          <div style={S.filterGroup}>
            <span style={S.filterLabel}>Sale Status</span>
            <Select
              value={quickSaleStatus}
              onChange={setQuickSaleStatus}
              style={{ width: 140 }}
              size="small"
            >
              {SALE_STATUSES.map(status => (
                <Option key={status} value={status}>{status}</Option>
              ))}
            </Select>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <AntButton
              icon={<FilterOutlined />}
              onClick={() => setAdvancedDrawerOpen(true)}
              style={{ borderRadius: 8 }}
            >
              Advanced Filter
            </AntButton>
          </div>
        </div>

        {/* SEARCH */}
        <div style={S.searchRow}>
          <div style={S.searchBox}>
            <SearchOutlined style={S.searchIco} />
            <input
              style={S.searchInput}
              placeholder="Search by name or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button style={S.clearBtn} onClick={() => setSearch("")}>✕</button>}
          </div>
          <span style={S.resultTxt}>{filtered.length} {filtered.length === 1 ? "listing" : "listings"}</span>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div style={S.grid}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0" }}>
              <div style={{ height: 196, background: "#f1f5f9" }} />
              <div style={{ padding: 16 }}><Skeleton active paragraph={{ rows: 2 }} /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={S.empty}>
          <div style={S.emptyIcon}><ApartmentOutlined style={{ fontSize: 28, color: "#94a3b8" }} /></div>
          <p style={S.emptyTitle}>No listings found</p>
          <p style={S.emptySub}>{search ? "Try a different search term" : "Add your first listing to get started"}</p>
          {!search && (
            <button style={S.addBtn} onClick={() => navigate("/dashboard/developer/developer-properties/add")}>
              <PlusOutlined /> Add Listing
            </button>
          )}
        </div>
      ) : (
        <div style={S.grid}>
          {filtered.map(item => {
            const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            return (
              <div key={item.key} style={S.card}>
                <div style={S.imgWrap}>
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=220&fit=crop"}
                    alt={item.propertyName}
                    style={S.img}
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=220&fit=crop";
                    }}
                  />
                  <div style={S.badgeLeft}>
                    {item.isFeatured && (
                      <span style={S.featuredBadge}><FireFilled style={{ fontSize: 9 }} /> Featured</span>
                    )}
                    {item.developmentStatus && (
                      <span style={S.projectBadge}>{item.developmentStatus}</span>
                    )}
                  </div>
                  <span style={{ ...S.statusBadge, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                    <span style={{ fontSize: 10, lineHeight: 1 }}>{sc.icon}</span> {sc.label}
                  </span>
                </div>

                <div style={S.cardBody}>
                  <h3 style={S.cardTitle}>{item.propertyName}</h3>
                  {item.location && (
                    <div style={S.cardLoc}>
                      <EnvironmentOutlined style={{ color: "#6d28d9", fontSize: 11, flexShrink: 0 }} />
                      <span style={S.cardLocTxt}>{item.location}</span>
                    </div>
                  )}

                  <div style={S.tagsRow}>
                    {item.unitType && <span style={S.tag}>{item.unitType}</span>}
                    {item.bedroomType && <span style={S.tag}>{item.bedroomType}</span>}
                    {item.saleStatus && (
                      <span style={{
                        ...S.tag,
                        backgroundColor: item.saleStatus === "Sold" ? "#fef2f2" : item.saleStatus === "Reserved" ? "#fffbeb" : "#f0fdf4",
                        color: item.saleStatus === "Sold" ? "#991b1b" : item.saleStatus === "Reserved" ? "#92400e" : "#15803d",
                        borderColor: item.saleStatus === "Sold" ? "#fecaca" : item.saleStatus === "Reserved" ? "#fde68a" : "#bbf7d0",
                      }}>
                        {item.saleStatus}
                      </span>
                    )}
                  </div>

                  {item.price && <div style={S.price}>{item.price}</div>}

                  
                  <div style={S.divider} />

                  <div style={S.actions}>
                    <button style={S.btnPrimary} onClick={() => navigate(`/dashboard/developer/developer-properties/${item.key}`)}>
                      <EyeOutlined style={{ fontSize: 11 }} /> View
                    </button>
                    <button style={S.btnOutline} onClick={() => navigate(`/dashboard/developer/edit-property/${item.key}`)}>
                      <EditOutlined style={{ fontSize: 11 }} /> Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Advanced Filter Drawer */}
      <Drawer
        title="Advanced Filters"
        placement="right"
        onClose={() => setAdvancedDrawerOpen(false)}
        open={advancedDrawerOpen}
        width={400}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 13 }}>Development Status</label>
            <Select value={advDevelopmentStatus} onChange={setAdvDevelopmentStatus} style={{ width: "100%" }}>
              {DEVELOPMENT_STATUSES.map(status => (
                <Option key={status} value={status}>{status}</Option>
              ))}
            </Select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 13 }}>Location</label>
            <Select value={advLocation} onChange={setAdvLocation} style={{ width: "100%" }}>
              <Option value="All">All</Option>
              {UAE_LOCALITIES.map(loc => (
                <Option key={loc} value={loc}>{loc}</Option>
              ))}
            </Select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 13 }}>Unit Type</label>
            <Select value={advUnitType} onChange={setAdvUnitType} style={{ width: "100%" }}>
              {UNIT_TYPES.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 13 }}>Project Completion By</label>
            <Select value={advCompletionBy} onChange={setAdvCompletionBy} style={{ width: "100%" }} allowClear>
              {generateQuarterlyOptions().map(q => (
                <Option key={q} value={q}>{q}</Option>
              ))}
            </Select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 13 }}>Sale Status</label>
            <Select value={advSaleStatus} onChange={setAdvSaleStatus} style={{ width: "100%" }}>
              {SALE_STATUSES.map(status => (
                <Option key={status} value={status}>{status}</Option>
              ))}
            </Select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 13 }}>
              Price Range (AED): {advPriceRange[0].toLocaleString()} - {advPriceRange[1].toLocaleString()}
            </label>
            <Slider
              range
              min={0}
              max={50000000}
              step={100000}
              value={advPriceRange}
              onChange={setAdvPriceRange}
            />
          </div>

          <AntButton
            type="primary"
            onClick={() => setAdvancedDrawerOpen(false)}
            style={{ marginTop: 20, backgroundColor: "#6d28d9", borderColor: "#6d28d9" }}
            block
          >
            Apply Filters
          </AntButton>

          <AntButton
            onClick={() => {
              setAdvDevelopmentStatus("All");
              setAdvLocation("All");
              setAdvUnitType("All");
              setAdvCompletionBy(null);
              setAdvSaleStatus("All");
              setAdvPriceRange([0, 10000000]);
            }}
            block
          >
            Reset Filters
          </AntButton>
        </div>
      </Drawer>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#f8fafc", padding: "28px 24px", fontFamily: "'Inter','Segoe UI',sans-serif" },

  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 12 },
  pageTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px" },
  pageSubtitle: { margin: "3px 0 0", fontSize: 13, color: "#64748b" },

  statusTabs: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  statusTab: {
    padding: "8px 20px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b",
    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.2s ease"
  },
  statusTabActive: {
    background: "#6d28d9", borderColor: "#6d28d9", color: "#fff"
  },

  addBtn: {
    display: "inline-flex", alignItems: "center", gap: 7,
    background: "#6d28d9", color: "#fff", border: "none", borderRadius: 8,
    padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  },

  filterBar: {
    background: "#fff",
    borderRadius: 10,
    padding: "16px 20px",
    border: "1.5px solid #e2e8f0",
    marginBottom: 20,
  },

  filterRow: { display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginBottom: 12 },
  filterGroup: { display: "flex", alignItems: "center", gap: 10 },
  filterLabel: { fontSize: 12, fontWeight: 600, color: "#475569" },

  searchRow: { display: "flex", alignItems: "center", gap: 12 },
  searchBox: { position: "relative", flex: 1 },
  searchIco: { position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14, zIndex: 1 },
  searchInput: {
    width: "100%", padding: "10px 36px 10px 38px", border: "1.5px solid #e2e8f0",
    borderRadius: 8, fontSize: 13, background: "#fff", color: "#0f172a",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  },
  clearBtn: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 12, padding: "2px 4px" },
  resultTxt: { fontSize: 12, color: "#64748b", whiteSpace: "nowrap", fontWeight: 500 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(272px,1fr))", gap: 16 },

  card: { background: "#fff", borderRadius: 10, overflow: "hidden", border: "1.5px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  imgWrap: { position: "relative", height: 196, overflow: "hidden", background: "#f1f5f9" },
  img: { width: "100%", height: "100%", objectFit: "contain", display: "block", backgroundColor: "#f1f5f9" },
  badgeLeft: { position: "absolute", top: 10, left: 10, display: "flex", gap: 6, flexWrap: "wrap" },
  featuredBadge: { display: "inline-flex", alignItems: "center", gap: 4, background: "#78350f", color: "#fef3c7", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4 },
  projectBadge: { background: "rgba(15,23,42,0.6)", color: "#f8fafc", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4 },
  statusBadge: { position: "absolute", top: 10, right: 10, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: 6 },

  cardBody: { padding: "14px 16px 12px" },
  cardTitle: { margin: "0 0 5px", fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardLoc: { display: "flex", alignItems: "center", gap: 5, marginBottom: 10 },
  cardLocTxt: { fontSize: 12, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  tagsRow: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 },
  tag: { display: "inline-flex", alignItems: "center", gap: 4, background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 4, border: "1px solid #e2e8f0" },
  price: { fontSize: 13, fontWeight: 700, color: "#6d28d9", marginBottom: 10 },
  divider: { height: 1, background: "#f1f5f9", marginBottom: 10 },

  actions: { display: "flex", gap: 6 },
  btnPrimary: { flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, background: "#6d28d9", color: "#fff", border: "none", borderRadius: 6, padding: "7px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  btnOutline: { flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, background: "#fff", color: "#374151", border: "1.5px solid #d1d5db", borderRadius: 6, padding: "7px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },

  progressWrap: { marginBottom: 12 },
  progressHeader: { display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6, color: "#475569", fontWeight: 600 },
  progressBar: { width: "100%", height: 7, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", background: "#6d28d9", borderRadius: 999 },

  empty: { textAlign: "center", padding: "64px 20px", background: "#fff", borderRadius: 10, border: "1.5px dashed #e2e8f0" },
  emptyIcon: { width: 60, height: 60, background: "#f8fafc", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "1px solid #e2e8f0" },
  emptyTitle: { margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#0f172a" },
  emptySub: { margin: "0 0 20px", fontSize: 13, color: "#64748b" },
};
