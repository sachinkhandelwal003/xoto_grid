import {
  Card,
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
  Slider,
  Switch,
  InputNumber,
  Tag,
  Empty
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { 
  InfoCircleOutlined, 
  SearchOutlined, 
  SlidersOutlined,
  DownOutlined,
  CloseCircleOutlined,
  HomeOutlined,
  BuildOutlined,ClockCircleOutlined 
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AgentProjects() {
  const navigate = useNavigate();

  // ================= STATES =================
  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [developers, setDevelopers] = useState([]);
  const [stats, setStats] = useState({
    secondaryTotal: 0,
    secondaryPending: 0,
    secondaryApproved: 0,
    secondaryRejected: 0,
    secondaryActive: 0,
    offplanTotal: 0,
    featuredSecondary: 0,
    featuredOffplan: 0
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // --- FILTER STATES ---
  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState("all"); // 'all', 'secondary', 'off_plan'
  
  // Status Filters
  const [approvalStatus, setApprovalStatus] = useState("all");
  const [listingStatus, setListingStatus] = useState("all");
  
  // Developer
  const [devPopoverOpen, setDevPopoverOpen] = useState(false);
  const [devSearchText, setDevSearchText] = useState("");
  const [selectedDevelopers, setSelectedDevelopers] = useState([]);

  // Price
  const [pricePopoverOpen, setPricePopoverOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);

  // Unit Type
  const [unitTypePopoverOpen, setUnitTypePopoverOpen] = useState(false);
  const [selectedUnitTypes, setSelectedUnitTypes] = useState([]);

  // Bedroom Type
  const [bedroomPopoverOpen, setBedroomPopoverOpen] = useState(false);
  const [selectedBedrooms, setSelectedBedrooms] = useState([]);

  // Area Filters
  const [areaPopoverOpen, setAreaPopoverOpen] = useState(false);
  const [minArea, setMinArea] = useState(null);
  const [maxArea, setMaxArea] = useState(null);

  // Sort
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const unitTypeOptions = ["apartment", "villa", "townhouse", "duplex", "penthouse"];
  const bedroomOptions = ["studio", "1bed", "2bed", "3bed", "4bed", "5bed", "6bed", "7bed", "8plus"];
  const priceOptions = [500000, 1000000, 1500000, 3000000, 5000000];

  // ================= API CALLS =================
  const fetchProperties = async (pageNo = 1, append = false) => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      params.append("page", pageNo);
      params.append("limit", 12);
      if (propertyType !== 'all') params.append("propertySubType", propertyType);
      
      if (approvalStatus !== "all") params.append("approvalStatus", approvalStatus);
     if (listingStatus !== "all") {
  params.append("listingStatus", listingStatus);
}
      if (search) params.append("search", search);
      if (priceMin) params.append("minPrice", priceMin);
      if (priceMax) params.append("maxPrice", priceMax);
      if (minArea) params.append("minArea", minArea);
      if (maxArea) params.append("maxArea", maxArea);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortOrder", sortOrder);
      
      // Unit Type filter
      if (selectedUnitTypes.length > 0) {
        params.append("unitType", selectedUnitTypes[0]);
      }
      
      // Bedroom filter
      if (selectedBedrooms.length > 0) {
        params.append("bedroomType", selectedBedrooms[0]);
      }

      const res = await apiService.get(`/properties?${params.toString()}`);
      
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
      const res = await apiService.get("/developer/get-all-developers");
      const list = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      setDevelopers(list);
    } catch (err) {
      
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProperties(1, false);
    fetchDevelopers();
  }, [propertyType, approvalStatus, listingStatus, sortBy, sortOrder]);

  useEffect(() => {
    if (page > 1) {
      fetchProperties(page, true);
    }
  }, [page]);

  // Apply filters
  useEffect(() => {
    let results = [...properties];
    
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(p => 
        p.propertyName?.toLowerCase().includes(q) || 
        p.city?.toLowerCase().includes(q) || 
        p.area?.toLowerCase().includes(q) ||
        p.developerName?.toLowerCase().includes(q)
      );
    }
    
    // Developer filter
    if (selectedDevelopers.length > 0) {
      results = results.filter(p => {
        const devId = p.developer?._id;
        return selectedDevelopers.includes(devId);
      });
    }
    
    // Price filter
    if (priceMin) {
      results = results.filter(p => {
        const propPrice = p.price || p.price_min || 0;
        return propPrice >= priceMin;
      });
    }
    if (priceMax) {
      results = results.filter(p => {
        const propPrice = p.price || p.price_min || 0;
        return propPrice <= priceMax;
      });
    }
    
    // Unit Type filter
    if (selectedUnitTypes.length > 0) {
      results = results.filter(p => 
        selectedUnitTypes.some(ut => p.unitType?.toLowerCase().includes(ut.toLowerCase()))
      );
    }
    
    // Bedroom filter
    if (selectedBedrooms.length > 0) {
      results = results.filter(p => 
        selectedBedrooms.includes(p.bedroomType)
      );
    }
    
    // Area filter
    if (minArea) {
      results = results.filter(p => {
        const propArea = p.builtUpArea || p.builtUpArea_min || 0;
        return propArea >= minArea;
      });
    }
    if (maxArea) {
      results = results.filter(p => {
        const propArea = p.builtUpArea || p.builtUpArea_min || 0;
        return propArea <= maxArea;
      });
    }
    
    setFiltered(results);
  }, [search, selectedDevelopers, priceMin, priceMax, selectedUnitTypes, selectedBedrooms, minArea, maxArea, properties]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
  };

  // Date Format Helper
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Price Display Helper
  const getPriceDisplay = (property) => {
    if (property.price_min && property.price_max) {
      return `${property.price_min.toLocaleString()} - ${property.price_max.toLocaleString()}`;
    }
    if (property.price) {
      return property.price.toLocaleString();
    }
    return "Contact Us";
  };

  // ================= POPOVER CONTENTS =================

  const devPopoverContent = (
    <div style={{ width: 320, padding: '12px 0 0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 16px 12px' }}>
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Filter by developer</Text>
        <Input prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} placeholder="Search..." value={devSearchText} onChange={e => setDevSearchText(e.target.value)} style={{ borderRadius: 6 }} allowClear />
      </div>
      <div style={{ maxHeight: 250, overflowY: 'auto', padding: '8px 16px', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        {developers.filter(d => d.name?.toLowerCase().includes(devSearchText.toLowerCase())).map(dev => (
          <div key={dev._id} style={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
            <Checkbox 
              checked={selectedDevelopers.includes(dev._id)} 
              onChange={(e) => {
                setSelectedDevelopers(e.target.checked 
                  ? [...selectedDevelopers, dev._id] 
                  : selectedDevelopers.filter(item => item !== dev._id)
                );
              }}
            />
            <Avatar shape="square" src={dev.logo} style={{ margin: '0 12px', background: '#f3e8ff', color: '#5c039b' }} size="small">
              {!dev.logo && dev.name?.charAt(0)}
            </Avatar>
            <Text>{dev.name}</Text>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex' }}>
        <Button type="text" style={{ flex: 1, borderRadius: 0, height: 44 }} onClick={() => setSelectedDevelopers([])}>Clear</Button>
        <div style={{ width: 1, background: '#f0f0f0' }} />
        <Button type="text" style={{ flex: 1, borderRadius: 0, height: 44 }} onClick={() => setDevPopoverOpen(false)}>Close</Button>
      </div>
    </div>
  );

  const pricePopoverContent = (
    <div style={{ width: 350, padding: '16px' }}>
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Minimum price</Text>
          <InputNumber style={{ width: '100%' }} placeholder="From" value={priceMin} onChange={setPriceMin} suffix="AED" />
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Maximum price</Text>
          <InputNumber style={{ width: '100%' }} placeholder="To" value={priceMax} onChange={setPriceMax} suffix="AED" />
        </Col>
      </Row>
      <Button type="primary" block style={{ marginTop: 16, height: 40, background: '#111827' }} onClick={() => setPricePopoverOpen(false)}>
        Apply filter
      </Button>
    </div>
  );

  const unitTypePopoverContent = (
    <div style={{ width: 380, padding: '12px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {unitTypeOptions.map(type => {
          const isSelected = selectedUnitTypes.includes(type);
          return (
            <div 
              key={type}
              onClick={() => {
                if(isSelected) setSelectedUnitTypes(selectedUnitTypes.filter(t => t !== type));
                else setSelectedUnitTypes([...selectedUnitTypes, type]);
              }}
              style={{
                padding: '6px 12px',
                background: isSelected ? '#111827' : '#f3f4f6',
                color: isSelected ? '#fff' : '#4b5563',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 13,
                transition: 'all 0.2s'
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
          );
        })}
      </div>
    </div>
  );

  const bedroomPopoverContent = (
    <div style={{ width: 380, padding: '12px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {bedroomOptions.map(bed => {
          const isSelected = selectedBedrooms.includes(bed);
          return (
            <div 
              key={bed}
              onClick={() => {
                if(isSelected) setSelectedBedrooms(selectedBedrooms.filter(b => b !== bed));
                else setSelectedBedrooms([...selectedBedrooms, bed]);
              }}
              style={{
                padding: '6px 12px',
                background: isSelected ? '#111827' : '#f3f4f6',
                color: isSelected ? '#fff' : '#4b5563',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 13,
                transition: 'all 0.2s'
              }}
            >
              {bed === "8plus" ? "8+ Bed" : bed === "studio" ? "Studio" : `${bed.replace('bed', '')} Bed`}
            </div>
          );
        })}
      </div>
    </div>
  );

  const areaPopoverContent = (
    <div style={{ width: 320, padding: '16px' }}>
      <Row gutter={12}>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Min Area (sqft)</Text>
          <InputNumber style={{ width: '100%' }} placeholder="Min" value={minArea} onChange={setMinArea} />
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Max Area (sqft)</Text>
          <InputNumber style={{ width: '100%' }} placeholder="Max" value={maxArea} onChange={setMaxArea} />
        </Col>
      </Row>
      <Button type="primary" block style={{ marginTop: 16, height: 40, background: '#111827' }} onClick={() => setAreaPopoverOpen(false)}>
        Apply filter
      </Button>
    </div>
  );

  const getFilterBtnStyle = (isActive) => ({
    height: 40, 
    borderRadius: 8, 
    display: 'flex', 
    alignItems: 'center', 
    gap: 8,
    background: isActive ? '#f3e8ff' : '#fff',
    borderColor: isActive ? '#d8b4fe' : '#d9d9d9',
  });

  // Stats Cards
  const statsCards = [
    { title: "Total Properties", value: totalItems, icon: <HomeOutlined />, color: "#2563eb", bg: "#dbeafe" },
    { title: "Off-Plan Projects", value: stats.offplanTotal, icon: <BuildOutlined />, color: "#059669", bg: "#d1fae5" },
    { title: "Secondary Properties", value: stats.secondaryTotal, icon: <HomeOutlined />, color: "#d97706", bg: "#fef3c7" },
    { title: "Pending Approval", value: stats.secondaryPending, icon: <ClockCircleOutlined />, color: "#ef4444", bg: "#fee2e2" },
  ];

  return (
    <div style={{ padding: "32px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* Stats Cards */}
      {/* <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              bodyStyle={{ padding: "24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ 
                  width: "56px", height: "56px", borderRadius: "12px", 
                  background: stat.bg, color: stat.color,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px"
                }}>
                  {stat.icon}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: "13px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {stat.title}
                  </Text>
                  <Title level={2} style={{ margin: "4px 0 0 0", color: "#1f2937" }}>
                    {stat.value}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row> */}

      {/* Property Type Tabs */}
      <div style={{ marginBottom: 24, display: 'flex', gap: '12px', borderBottom: '1px solid #e8e8e8', paddingBottom: 12 }}>
        <Button 
          type={propertyType === 'all' ? 'primary' : 'default'}
          onClick={() => setPropertyType('all')}
          style={{ borderRadius: 20 }}
        >
          All Properties
        </Button>
        <Button 
          type={propertyType === 'off_plan' ? 'primary' : 'default'}
          onClick={() => setPropertyType('off_plan')}
          style={{ borderRadius: 20 }}
        >
          Off-Plan Projects
        </Button>
        <Button 
          type={propertyType === 'secondary' ? 'primary' : 'default'}
          onClick={() => setPropertyType('secondary')}
          style={{ borderRadius: 20 }}
        >
          Secondary Properties
        </Button>
      </div>

      {/* Status Filter Tabs (for secondary only) */}
      {/* {propertyType !== 'off_plan' && (
        <div style={{ marginBottom: 24, display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button 
            size="small"
            type={approvalStatus === 'all' ? 'primary' : 'default'}
            onClick={() => setApprovalStatus('all')}
          >
            All Status
          </Button>
          <Button 
            size="small"
            type={approvalStatus === 'pending' ? 'primary' : 'default'}
            onClick={() => setApprovalStatus('pending')}
          >
            Pending
          </Button>
          <Button 
            size="small"
            type={approvalStatus === 'approved' ? 'primary' : 'default'}
            onClick={() => setApprovalStatus('approved')}
          >
            Approved
          </Button>
          <Button 
            size="small"
            type={approvalStatus === 'rejected' ? 'primary' : 'default'}
            onClick={() => setApprovalStatus('rejected')}
          >
            Rejected
          </Button>
          <Button 
            size="small"
            type={listingStatus === 'active' ? 'primary' : 'default'}
            onClick={() => setListingStatus(listingStatus === 'active' ? 'all' : 'active')}
          >
            Active Listings
          </Button>
        </div>
      )} */}
      
      {/* FILTER BAR */}
      <div style={{ marginBottom: 24, display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Basic Search */}
        <Input
          prefix={<SearchOutlined />} 
          placeholder="Search by name, city, area..."
          style={{ width: 260, borderRadius: 8, height: 40 }}
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          allowClear 
        />
        
        {/* Sort Dropdown */}
        <Select
          style={{ width: 140, height: 40 }}
          value={sortBy}
          onChange={setSortBy}
        >
          <Option value="createdAt">Newest First</Option>
          <Option value="price">Price: Low to High</Option>
          <Option value="updatedAt">Recently Updated</Option>
        </Select>
        
        {/* Developer Filter */}
        <Popover content={devPopoverContent} trigger="click" open={devPopoverOpen} onOpenChange={setDevPopoverOpen} placement="bottomLeft" overlayInnerStyle={{ padding: 0 }}>
          <Button style={getFilterBtnStyle(selectedDevelopers.length > 0)}>
            Developer {selectedDevelopers.length > 0 && `(${selectedDevelopers.length})`} <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Popover>

        {/* Price Filter */}
        <Popover content={pricePopoverContent} trigger="click" open={pricePopoverOpen} onOpenChange={setPricePopoverOpen} placement="bottomLeft" overlayInnerStyle={{ borderRadius: 12 }}>
          <Button style={getFilterBtnStyle(priceMin || priceMax)}>
            Price {(priceMin || priceMax) && "•"} <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Popover>

        {/* Unit Type Filter */}
        <Popover content={unitTypePopoverContent} trigger="click" open={unitTypePopoverOpen} onOpenChange={setUnitTypePopoverOpen} placement="bottomLeft" overlayInnerStyle={{ borderRadius: 12 }}>
          <Button style={getFilterBtnStyle(selectedUnitTypes.length > 0)}>
            Unit Type {selectedUnitTypes.length > 0 && `(${selectedUnitTypes.length})`} <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Popover>

        {/* Bedroom Filter */}
        <Popover content={bedroomPopoverContent} trigger="click" open={bedroomPopoverOpen} onOpenChange={setBedroomPopoverOpen} placement="bottomLeft" overlayInnerStyle={{ borderRadius: 12 }}>
          <Button style={getFilterBtnStyle(selectedBedrooms.length > 0)}>
            Bedrooms {selectedBedrooms.length > 0 && `(${selectedBedrooms.length})`} <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Popover>

        {/* Area Filter */}
        <Popover content={areaPopoverContent} trigger="click" open={areaPopoverOpen} onOpenChange={setAreaPopoverOpen} placement="bottomLeft" overlayInnerStyle={{ borderRadius: 12 }}>
          <Button style={getFilterBtnStyle(minArea || maxArea)}>
            Area {(minArea || maxArea) && "•"} <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Popover>
      </div>

      {/* CARDS GRID */}
      {filtered.length === 0 && !loading ? (
        <Empty description="No properties found" style={{ marginTop: 60 }} />
      ) : (
        <Row gutter={[20, 24]}>
          {filtered.map(p => (
            <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
              <Card 
                hoverable 
                onClick={() => navigate(`/dashboard/agent/projects/${p._id}`)} 
                style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e8e8e8", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: "100%", display: "flex", flexDirection: "column" }} 
                bodyStyle={{ padding: "20px 16px 16px", flex: 1 }}
              >
                <div style={{ position: "relative", height: 200, margin: "-20px -16px 16px -16px", borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
                  <img 
                    src={p?.photos?.architecture?.[0] || p?.mainLogo || "https://images.unsplash.com/photo-1560518883-ce09059eeffa"} 
                    alt={p.propertyName} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                  
                  {/* Property Type Tag */}
                  <div style={{ position: "absolute", top: 12, left: 12 }}>
                    <Tag color={p.propertySubType === "off_plan" ? "purple" : "blue"} style={{ fontWeight: 600, borderRadius: 6 }}>
                      {p.propertySubType === "off_plan" ? "🏗️ Off-Plan" : "🏠 Secondary"}
                    </Tag>
                  </div>
                  
                  {/* Approval Status Tag (for secondary) */}
                  {p.propertySubType === "secondary" && p.approvalStatus && (
                    <div style={{ position: "absolute", top: 12, right: 12 }}>
                      <Tag 
                        color={
                          p.approvalStatus === "approved" ? "green" : 
                          p.approvalStatus === "rejected" ? "red" : "orange"
                        } 
                        style={{ fontWeight: 600, borderRadius: 6 }}
                      >
                        {p.approvalStatus === "approved" ? "✓ Approved" : 
                         p.approvalStatus === "rejected" ? "✗ Rejected" : "⏳ Pending"}
                      </Tag>
                    </div>
                  )}
                  
                  {/* Listing Status Tag */}
                  {p.listingStatus === "active" && (
                    <div style={{ position: "absolute", bottom: 12, left: 12 }}>
                      <Tag color="green" style={{ background: "#dcfce7", color: "#166534", border: "none", borderRadius: 6 }}>
                        Active Listing
                      </Tag>
                    </div>
                  )}

                  {/* Developer Logo */}
                  {p.developer?.logo && (
                    <div style={{ position: "absolute", bottom: -16, left: 16, width: 44, height: 44, backgroundColor: "#fff", borderRadius: 8, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                      <img src={p.developer.logo} alt="dev" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                </div>

                <Title level={5} style={{ margin: "8px 0 4px", fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.propertyName}
                </Title>
                <Text type="secondary" style={{ display: "block", marginBottom: 12, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.area || p.city} • {p.developer?.name || p.developerName || "Developer"}
                </Text>

                {/* Property Details */}
                <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 13 }}>
                  {p.bedrooms > 0 && (
                    <span>{p.bedrooms} {p.bedrooms === 1 ? "Bed" : "Beds"}</span>
                  )}
                  {p.bathrooms > 0 && (
                    <span>{p.bathrooms} {p.bathrooms === 1 ? "Bath" : "Baths"}</span>
                  )}
                  {(p.builtUpArea || p.builtUpArea_min) && (
                    <span>{p.builtUpArea || p.builtUpArea_min} sqft</span>
                  )}
                </div>

                <div style={{ marginTop: "auto" }}>
                  <Row justify="space-between" align="bottom">
                    <Col>
                      <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 2 }}>Price from</Text>
                      <Text strong style={{ fontSize: 16 }}>
                        {getPriceDisplay(p)} {p.currency || "AED"}
                      </Text>
                    </Col>
                    {p.paymentPlan && p.paymentPlan.length > 0 && (
                      <Col style={{ textAlign: "right" }}>
                        <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 2 }}>Payment plan</Text>
                        <Text strong style={{ fontSize: 12 }}>
                          {p.paymentPlan[0]?.stages?.[0]?.percentage || "Contact Us"}% 
                          <InfoCircleOutlined style={{ color: "#bfbfbf", marginLeft: 4 }} />
                        </Text>
                      </Col>
                    )}
                  </Row>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div style={{ textAlign: "center", marginTop: 40 }}>
        {loading ? (
          <Spin size="large" />
        ) : hasMore && filtered.length > 0 ? (
          <Button size="large" onClick={loadMore} style={{ borderRadius: 8, height: 44, padding: "0 32px", fontWeight: 600 }}>
            Show More
          </Button>
        ) : filtered.length > 0 ? (
          <Text type="secondary">No more properties found</Text>
        ) : null}
      </div>
    </div>
  );
}