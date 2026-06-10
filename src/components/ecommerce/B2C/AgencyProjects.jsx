import {
  Typography,
  Row,
  Col,
  Input,
  Spin,
  message,
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  SearchOutlined,
  TeamOutlined,
  ExpandOutlined,
  EyeOutlined,
  FireOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@400;600;700&display=swap');

  :root {
    /* Sidebar palette extracted from screenshot */
    --sb-dark:    #1E0A3C;
    --sb-mid:     #2D1560;
    --sb-accent:  #7B2FBE;
    --sb-green:   #22C55E;
    --sb-green2:  #16A34A;

    /* Page surface */
    --bg:         #F5F4F8;
    --surface:    #FFFFFF;
    --surface2:   #F0EEF5;
    --surface3:   #E8E4F2;
    --border:     #E2DDF0;
    --border2:    #C9C0E2;

    /* Text */
    --tx:         #140D2A;
    --tx-sub:     #4B3D6E;
    --tx-muted:   #8E82AA;

    /* Purple tints */
    --pur-soft:   #EDE5F9;
    --pur-mid:    #C4A8F0;

    /* Shadows */
    --sh-sm:  0 1px 3px rgba(123,47,190,0.07), 0 1px 2px rgba(0,0,0,0.04);
    --sh-md:  0 4px 16px rgba(123,47,190,0.11), 0 2px 4px rgba(0,0,0,0.04);
    --sh-lg:  0 14px 40px rgba(123,47,190,0.15), 0 4px 8px rgba(0,0,0,0.06);
    --sh-card:0 2px 8px rgba(123,47,190,0.07);

    --rad:    12px;
    --rad-sm: 8px;
    --rad-xs: 6px;
  }

  *, *::before, *::after { box-sizing: border-box; }

  .xp-root {
    padding: 32px 36px 64px;
    background: var(--bg);
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
    color: var(--tx);
  }

  /* ── HEADER ── */
  .xp-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1.5px solid var(--border);
  }
  .xp-title {
    font-family: 'Sora', sans-serif !important;
    font-size: 26px !important;
    font-weight: 700 !important;
    color: var(--tx) !important;
    margin: 0 !important;
    line-height: 1.15 !important;
    letter-spacing: -0.4px;
  }

  /* ── FILTER BAR ── */
  .xp-filterbar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 10px;
  }
  .xp-search .ant-input-affix-wrapper {
    background: var(--surface) !important;
    border: 1.5px solid var(--border) !important;
    border-radius: var(--rad-sm) !important;
    height: 38px !important;
    box-shadow: var(--sh-sm) !important;
    transition: all 0.2s !important;
  }
  .xp-search .ant-input-affix-wrapper:hover,
  .xp-search .ant-input-affix-wrapper-focused {
    border-color: var(--sb-accent) !important;
    box-shadow: 0 0 0 3px rgba(123,47,190,0.10) !important;
  }
  .xp-search .ant-input { background: transparent !important; color: var(--tx) !important; font-family:'Inter',sans-serif !important; font-size:13px !important; }
  .xp-search .ant-input::placeholder { color: var(--tx-muted) !important; }
  .xp-search .ant-input-prefix { color: var(--tx-muted) !important; margin-right:6px; }

  /* Results bar */
  .xp-results-bar {
    display: flex;
    align-items: center;
    margin-bottom: 18px;
  }
  .xp-results-text {
    font-size: 12.5px;
    color: var(--tx-muted);
    font-family: 'Inter', sans-serif;
    margin: 0;
  }
  .xp-results-text strong { color: var(--tx-sub); font-weight: 600; }

  /* ── CARD ── */
  .xp-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--rad);
    overflow: hidden;
    cursor: pointer;
    transition: box-shadow 0.24s, transform 0.24s, border-color 0.2s;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: var(--sh-card);
    position: relative;
  }
  .xp-card:hover {
    box-shadow: var(--sh-lg);
    transform: translateY(-5px);
    border-color: var(--pur-mid);
  }

  /* Image */
  .xp-img-wrap {
    position: relative;
    height: 195px;
    overflow: hidden;
    background: var(--surface3);
    flex-shrink: 0;
  }
  .xp-img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
    display: block;
  }
  .xp-card:hover .xp-img { transform: scale(1.05); }
  .xp-img-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(20,13,42,0.50) 0%, transparent 55%);
    pointer-events: none;
  }

  /* Badges */
  .xp-badge-status {
    position: absolute; top: 11px; left: 11px;
    background: rgba(255,255,255,0.96);
    backdrop-filter: blur(6px);
    color: var(--sb-dark);
    padding: 3px 10px;
    border-radius: var(--rad-xs);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    font-family: 'Inter', sans-serif;
    border: 1px solid rgba(0,0,0,0.07);
  }
  .xp-badge-date {
    position: absolute; top: 11px; right: 11px;
    background: rgba(30,10,60,0.75);
    backdrop-filter: blur(6px);
    color: rgba(255,255,255,0.88);
    padding: 3px 9px;
    border-radius: var(--rad-xs);
    font-size: 10.5px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    border: 1px solid rgba(255,255,255,0.12);
  }
  .xp-dev-logo {
    position: absolute; bottom: -15px; left: 13px;
    width: 38px; height: 38px;
    border-radius: var(--rad-sm);
    background: var(--surface);
    border: 1.5px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    box-shadow: var(--sh-md);
    z-index: 2;
  }

  /* Body */
  .xp-body {
    padding: 22px 16px 15px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .xp-prop-name {
    font-family: 'Sora', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--tx);
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
  }
  .xp-location {
    display: flex; align-items: center; gap: 4px;
    font-size: 11.5px; color: var(--tx-muted);
    margin-bottom: 13px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .xp-location .anticon { font-size: 10px; color: var(--sb-accent); }

  /* Spec pills */
  .xp-specs { display: flex; gap: 6px; margin-bottom: 13px; flex-wrap: wrap; }
  .xp-spec {
    display: flex; align-items: center; gap: 5px;
    background: var(--pur-soft);
    border: 1px solid #DDD0F5;
    border-radius: 5px;
    padding: 3px 9px;
    font-size: 11.5px;
    color: var(--sb-accent);
    font-weight: 600;
    font-family: 'Inter', sans-serif;
  }
  .xp-spec .anticon { font-size: 10px; color: var(--sb-mid); }

  /* Divider */
  .xp-div { height: 1px; background: var(--border); margin: 11px 0; }

  /* Price */
  .xp-price-row {
    display: flex; justify-content: space-between; align-items: flex-end;
    margin-bottom: 13px;
  }
  .xp-lbl {
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--tx-muted);
    font-weight: 600;
    display: block;
    margin-bottom: 3px;
    font-family: 'Inter', sans-serif;
  }
  .xp-price {
    font-family: 'Inter', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: var(--tx);
    line-height: 1;
    letter-spacing: -0.3px;
    font-variant-numeric: tabular-nums;
  }
  .xp-currency {
    font-size: 10px;
    color: var(--tx-muted);
    font-weight: 600;
    letter-spacing: 0.8px;
    margin-right: 4px;
  }
  .xp-plan-yes {
    font-size: 12px; font-weight: 600;
    color: var(--sb-green2);
    display: flex; align-items: center; justify-content: flex-end; gap: 4px;
    font-family: 'Inter', sans-serif;
  }
  .xp-plan-no {
    font-size: 12px; font-weight: 500;
    color: var(--tx-muted);
    text-align: right;
    font-family: 'Inter', sans-serif;
  }

  /* Actions */
  .xp-actions { display: flex; gap: 7px; margin-top: auto; }
  .xp-btn-primary {
    flex: 1; height: 36px;
    border-radius: var(--rad-sm);
    border: none;
    background: #5d0f9b;
    color: #fff;
    font-size: 12.5px; font-weight: 600;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: all 0.18s;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 2px 8px rgba(30,10,60,0.22);
  }
  .xp-btn-primary:hover {
    background: var(--sb-mid);
    box-shadow: 0 4px 16px rgba(30,10,60,0.32);
    transform: translateY(-1px);
  }

  /* Animations */
  @keyframes xp-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .xp-card-wrap { animation: xp-up 0.38s ease both; height: 100%; }
  .xp-empty { text-align: center; padding: 72px 0; color: var(--tx-muted); font-family: 'Inter', sans-serif; }
  .xp-empty-ico { font-size: 36px; margin-bottom: 12px; opacity: 0.35; }
`;

export default function AgencyProjects() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [listingType, setListingType] = useState("all");

  // ── API ──────────────────────────────────────────────────────────────────
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/agency/listings");
      const data = response?.data?.data || [];
      setProperties(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load properties");
      setProperties([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ── Search + listing type filter ─────────────────────────────────────────
  useEffect(() => {
    let result = [...properties];
    if (listingType !== "all")
      result = result.filter(p => p.propertySubType === listingType || p.propertyType === listingType);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.propertyName?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.area?.toLowerCase().includes(q) ||
          (p.developer?.name || p.developerName || "").toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, listingType, properties]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getCoverImage = (p) => {
    if (p.photos?.architecture?.length > 0) return p.photos.architecture[0];
    if (p.photos?.interior?.length > 0) return p.photos.interior[0];
    if (p.mainLogo) return p.mainLogo;
    return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80";
  };

  const isOffPlan = (p) => p.propertySubType === "off_plan" || p.propertyType === "off_plan";

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className="xp-root">

        {/* HEADER */}
        <div className="xp-header">
          <div>
            <Title className="xp-title">All Properties</Title>
          </div>
        </div>

        {/* LISTING TYPE TABS */}
        <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap", borderBottom: "1.5px solid var(--border)", paddingBottom: 14 }}>
          {[
            { key: "all",       label: "All Properties" },
            { key: "off_plan",  label: "🏗️ Off-Plan" },
            { key: "secondary", label: "🏠 Secondary" },
            { key: "rental",    label: "🔑 Rental" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setListingType(tab.key)}
              style={{
                padding: "7px 18px", borderRadius: 20, border: "1px solid", cursor: "pointer",
                fontSize: 13, fontWeight: listingType === tab.key ? 700 : 400,
                fontFamily: "'Inter', sans-serif",
                background: listingType === tab.key ? "#1E0A3C" : "var(--surface)",
                color: listingType === tab.key ? "#fff" : "var(--tx-sub)",
                borderColor: listingType === tab.key ? "#1E0A3C" : "var(--border2)",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* FILTER BAR */}
        <div className="xp-filterbar">
          <div className="xp-search">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search by name, area, city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 300 }}
            />
          </div>
        </div>

        {/* RESULTS BAR */}
        <div className="xp-results-bar">
          <p className="xp-results-text">
            Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? 'property' : 'properties'}
            {search && <> for "<strong>{search}</strong>"</>}
          </p>
        </div>

        {/* GRID */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 100 }}>
            <Spin size="large" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="xp-empty">
            <div className="xp-empty-ico">🏠</div>
            <p style={{ margin: 0, fontSize: 14 }}>No properties found</p>
          </div>
        ) : (
          <Row gutter={[20, 24]}>
            {filtered.map((p, i) => (
              <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
                <div className="xp-card-wrap" style={{ animationDelay: `${Math.min(i * 0.05, 0.42)}s` }}>
                  <div 
                    className="xp-card" 
                    onClick={() => navigate(`/dashboard/agent/secondary/${p._id}`)}
                  >
                    <div className="xp-img-wrap">
                      <img 
                        className="xp-img" 
                        src={getCoverImage(p)} 
                        alt={p.propertyName}
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80"; }}
                      />
                      <div className="xp-img-overlay"/>
                      <div className="xp-badge-status">{isOffPlan(p) ? "Off-Plan" : "Secondary"}</div>
                      
                      {(p.availableFrom || p.completionDate?.year) && (
                        <div className="xp-badge-date">
                          Handover: {p.availableFrom ? formatDate(p.availableFrom) : p.completionDate?.year}
                        </div>
                      )}
                      
                      {(p.developer?.logo || p.developerName) && (
                        <div className="xp-dev-logo">
                          {p.developer?.logo ? (
                            <img src={p.developer.logo} alt="dev" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:6 }}/>
                          ) : (
                            <span style={{ color:'#7B2FBE', fontSize:14, fontWeight:700, fontFamily:'Sora, sans-serif' }}>
                              {(p.developerName || 'D').charAt(0)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="xp-body">
                      <p className="xp-prop-name">{p.propertyName}</p>
                      <div className="xp-location">
                        <EnvironmentOutlined/>
                        <span>{p.area || p.city} {p.developerName ? `· ${p.developerName}` : ''}</span>
                      </div>

                      <div className="xp-specs">
                        {p.bedrooms > 0 && (
                          <div className="xp-spec">
                            <TeamOutlined/>{p.bedrooms} Bed{p.bedrooms > 1 ? 's' : ''}
                          </div>
                        )}
                        {(p.builtUpArea || p.builtUpArea_min) > 0 && (
                          <div className="xp-spec">
                            <ExpandOutlined/>{Number(p.builtUpArea || p.builtUpArea_min).toLocaleString()} {p.builtUpAreaUnit || 'sqft'}
                          </div>
                        )}
                      </div>

                      <div className="xp-div"/>

                      <div className="xp-price-row">
                        <div>
                          <span className="xp-lbl">Price from</span>
                          <div className="xp-price">
                            <span className="xp-currency">{p.currency || 'AED'}</span>
                            {Number(p.price || p.price_min || 0).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="xp-lbl" style={{ textAlign: 'right', display: 'block' }}>Payment Plan</span>
                          {p.paymentPlan?.length > 0 ? (
                            <div className="xp-plan-yes"><FireOutlined style={{ fontSize:10 }}/> Available</div>
                          ) : (
                            <div className="xp-plan-no">Contact Us</div>
                          )}
                        </div>
                      </div>

                      <div className="xp-actions" onClick={e => e.stopPropagation()}>
                        <button 
                          className="xp-btn-primary" 
                          onClick={() => navigate(`/dashboard/agent/secondary/${p._id}`)}
                        >
                          <EyeOutlined/> View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </>
  );
}