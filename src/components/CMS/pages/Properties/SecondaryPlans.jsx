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
  InputNumber
} from "antd";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import { 
  InfoCircleOutlined, 
  SearchOutlined, 
  SlidersOutlined,
  DownOutlined,
  CloseCircleOutlined,
  TeamOutlined,        // Beds icon
  ExpandOutlined       // Area icon
} from "@ant-design/icons";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

export default function SecondaryPlans() {
  const navigate = useNavigate();

  // ================= STATES =================
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [developers, setDevelopers] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // --- FILTER STATES ---
  const [search, setSearch] = useState("");
  
  // Developer
  const [devPopoverOpen, setDevPopoverOpen] = useState(false);
  const [devSearchText, setDevSearchText] = useState("");
  const [selectedDevelopers, setSelectedDevelopers] = useState([]);

  // Price
  const [pricePopoverOpen, setPricePopoverOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);

  // Payments (Pre-handover / Post-handover)
  const [paymentPopoverOpen, setPaymentPopoverOpen] = useState(false);
  const [preHandoverPct, setPreHandoverPct] = useState(100);
  const [postHandoverOnly, setPostHandoverOnly] = useState(false);

  // Handover
  const [handoverPopoverOpen, setHandoverPopoverOpen] = useState(false);
  const [handoverFrom, setHandoverFrom] = useState(null);
  const [handoverTo, setHandoverTo] = useState(null);

  // Unit Type
  const [unitTypePopoverOpen, setUnitTypePopoverOpen] = useState(false);
  const [selectedUnitTypes, setSelectedUnitTypes] = useState([]);

  const unitTypeOptions = ["Apartments", "Villa", "Townhouse", "Duplex", "Penthouse"];
  const priceOptions = [500000, 1000000, 1500000, 3000000, 5000000];

  // ================= API CALLS =================
  const fetchProjects = async (pageNo = 1, append = false) => {
    try {
      setLoading(true);
      // ✅ propertyType=secondary query param added
      const res = await apiService.get(
        `/properties/agent/property/secondary?propertyType=secondary&page=${pageNo}&limit=20`
      );

      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data) ? res.data : [];

      if (!list.length) setHasMore(false);

      setProjects(prev => append ? [...prev, ...list] : list);
    } catch (err) {
      console.error(err);
      message.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const fetchDevelopers = async () => {
    try {
      const res = await apiService.get("/property/get-all-developers");
      const list = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      setDevelopers(list);
    } catch (err) {
      
    }
  };

  useEffect(() => {
    fetchProjects(1, false);
    fetchDevelopers(); 
  }, []);

  // ================= CORE FILTER LOGIC =================
  useEffect(() => {
    const q = search.toLowerCase();
    
    const result = projects.filter(p => {
      // 1. Search Box
      const matchSearch = !q || p.propertyName?.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q) || p.area?.toLowerCase().includes(q);
      
      // 2. Developer
      const matchDeveloper = selectedDevelopers.length === 0 || 
        selectedDevelopers.includes(p.developer?._id) || 
        selectedDevelopers.some(devId => {
          const devObj = developers.find(d => d._id === devId);
          return devObj && devObj.name === p.developerName;
        });

      // 3. Price
      const propertyPrice = Number(p.price || p.price_min || 0);
      const matchPriceMin = !priceMin || propertyPrice >= priceMin;
      const matchPriceMax = !priceMax || propertyPrice <= priceMax;

      // 4. Unit Type
      const pType = p.unitType ? p.unitType.toLowerCase() : "";
      const matchUnitType = selectedUnitTypes.length === 0 || selectedUnitTypes.some(ut => pType.includes(ut.toLowerCase().replace('s', '')));

      // 5. Payment Plan
      const initialPct = Number(p.paymentPlan_initialPercentage || 100);
      const laterPct = Number(p.paymentPlan_laterPercentage || 0);
      const matchPaymentPct = initialPct <= preHandoverPct;
      const matchPostHandover = !postHandoverOnly || laterPct > 0;

      // 6. Handover
      let matchHandover = true;
      if (handoverFrom || handoverTo) {
        let propYear = 0;
        if (p.completionDate?.year) {
          propYear = parseInt(p.completionDate.year);
        } else if (p.availableFrom) {
          propYear = new Date(p.availableFrom).getFullYear();
        }
        
        if (propYear) {
          if (handoverFrom && propYear < parseInt(handoverFrom)) matchHandover = false;
          if (handoverTo && propYear > parseInt(handoverTo)) matchHandover = false;
        }
      }

      return matchSearch && matchDeveloper && matchPriceMin && matchPriceMax && matchUnitType && matchPaymentPct && matchPostHandover && matchHandover;
    });

    setFiltered(result);
  }, [search, selectedDevelopers, priceMin, priceMax, selectedUnitTypes, preHandoverPct, postHandoverOnly, handoverFrom, handoverTo, projects, developers]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchProjects(next, true);
  };

  // ✅ Date Format Helper
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

  // ✅ Image Extraction Helper
  const getCoverImage = (p) => {
    if (p.photos?.architecture?.length > 0) return p.photos.architecture[0];
    if (p.photos?.interior?.length > 0) return p.photos.interior[0];
    if (p.mainLogo) return p.mainLogo;
    return "https://images.unsplash.com/photo-1560518883-ce09059eeffa";
  };

  // ================= POPOVER CONTENTS =================
  const devPopoverContent = (
    <div style={{ width: 320, padding: '12px 0 0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 16px 12px' }}>
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Filter by developer</Text>
        <Input prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} placeholder="Search..." value={devSearchText} onChange={e => setDevSearchText(e.target.value)} style={{ borderRadius: 6 }} allowClear />
      </div>
      <div style={{ maxHeight: 250, overflowY: 'auto', padding: '8px 16px', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        {developers.filter(d => d.name.toLowerCase().includes(devSearchText.toLowerCase())).map(dev => (
            <div key={dev._id || dev.id} style={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
              <Checkbox checked={selectedDevelopers.includes(dev._id || dev.id)} onChange={(e) => {
                  const id = dev._id || dev.id;
                  setSelectedDevelopers(e.target.checked ? [...selectedDevelopers, id] : selectedDevelopers.filter(item => item !== id));
                }}/>
              <Avatar shape="square" src={dev.logo} style={{ margin: '0 12px', background: '#f3e8ff', color: '#5c039b' }} size="small">
                {!dev.logo && dev.name.charAt(0)}
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
          <InputNumber style={{ width: '100%' }} placeholder="From" value={priceMin} onChange={setPriceMin} suffix="AED" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} />
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Maximum price</Text>
          <InputNumber style={{ width: '100%' }} placeholder="To" value={priceMax} onChange={setPriceMax} suffix="AED" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={12}>
          {priceOptions.map(val => (
            <div key={`min-${val}`} style={{ padding: '6px 0', cursor: 'pointer' }} onClick={() => setPriceMin(val)}>
              <Text style={{ fontWeight: 500 }}>{val.toLocaleString()} AED</Text>
            </div>
          ))}
        </Col>
        <Col span={12}>
          {priceOptions.map(val => (
            <div key={`max-${val}`} style={{ padding: '6px 0', cursor: 'pointer' }} onClick={() => setPriceMax(val)}>
              <Text style={{ fontWeight: 500 }}>{val.toLocaleString()} AED</Text>
            </div>
          ))}
        </Col>
      </Row>
      <Button type="primary" block style={{ marginTop: 16, height: 40, background: '#111827' }} onClick={() => setPricePopoverOpen(false)}>Apply filter</Button>
    </div>
  );

  const paymentPopoverContent = (
    <div style={{ width: 320, padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16 }}>Projects payment plan</Text>
        <Text type="secondary" style={{ cursor: 'pointer', fontSize: 12 }} onClick={() => { setPreHandoverPct(100); setPostHandoverOnly(false); }}>Reset <CloseCircleOutlined /></Text>
      </div>
      <div style={{ marginBottom: 24 }}>
        <Slider min={0} max={100} value={preHandoverPct} onChange={setPreHandoverPct} trackStyle={{ background: '#111827' }} handleStyle={{ borderColor: '#111827' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 16 }}>
        <Switch checked={postHandoverOnly} onChange={setPostHandoverOnly} />
        <Text type="secondary" style={{ fontSize: 13, lineHeight: '1.2' }}>Search projects only with post handover payment plans</Text>
      </div>
    </div>
  );

  const handoverPopoverContent = (
    <div style={{ width: 300, padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16 }}>Project handover by</Text>
        <Text type="secondary" style={{ cursor: 'pointer', fontSize: 12 }} onClick={() => { setHandoverFrom(null); setHandoverTo(null); }}>Reset <CloseCircleOutlined /></Text>
      </div>
      <Row gutter={12}>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>From</Text>
          <Select style={{ width: '100%' }} placeholder="Not selected" value={handoverFrom} onChange={setHandoverFrom} allowClear>
            <Option value="2024">2024</Option>
            <Option value="2025">2025</Option>
            <Option value="2026">2026</Option>
            <Option value="2027">2027</Option>
          </Select>
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>To</Text>
          <Select style={{ width: '100%' }} placeholder="Not selected" value={handoverTo} onChange={setHandoverTo} allowClear>
            <Option value="2025">2025</Option>
            <Option value="2026">2026</Option>
            <Option value="2027">2027</Option>
            <Option value="2028">2028</Option>
            <Option value="2029">2029</Option>
          </Select>
        </Col>
      </Row>
    </div>
  );

  const unitTypePopoverContent = (
    <div style={{ width: 380, padding: '12px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {unitTypeOptions.map(type => {
          const isSelected = selectedUnitTypes.includes(type);
          return (
            <div key={type} onClick={() => { isSelected ? setSelectedUnitTypes(selectedUnitTypes.filter(t => t !== type)) : setSelectedUnitTypes([...selectedUnitTypes, type]); }}
              style={{
                padding: '6px 12px', background: isSelected ? '#111827' : '#f3f4f6', color: isSelected ? '#fff' : '#4b5563',
                borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontSize: 13, transition: 'all 0.2s'
              }}>
              {type}
            </div>
          )
        })}
      </div>
    </div>
  );

  const getFilterBtnStyle = (isActive) => ({
    height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8,
    background: isActive ? '#f3e8ff' : '#fff', borderColor: isActive ? '#d8b4fe' : '#d9d9d9',
  });

  return (
    <div style={{ padding: "32px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* FILTER BAR */}
      <div style={{ marginBottom: 24, display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Input prefix={<SearchOutlined />} placeholder="Search & filters" style={{ width: 220, borderRadius: 8, height: 40 }}
          value={search} onChange={(e) => setSearch(e.target.value)} allowClear suffix={<SlidersOutlined style={{color: '#888'}}/>} />
        
        <Popover content={devPopoverContent} trigger="click" open={devPopoverOpen} onOpenChange={setDevPopoverOpen} placement="bottomLeft" overlayInnerStyle={{ padding: 0 }}>
          <Button style={getFilterBtnStyle(selectedDevelopers.length > 0)}>Developer {selectedDevelopers.length > 0 && `(${selectedDevelopers.length})`} <DownOutlined style={{ fontSize: 10 }} /></Button>
        </Popover>

        <Popover content={pricePopoverContent} trigger="click" open={pricePopoverOpen} onOpenChange={setPricePopoverOpen} placement="bottomLeft" overlayInnerStyle={{ borderRadius: 12 }}>
          <Button style={getFilterBtnStyle(priceMin || priceMax)}>Price {(priceMin || priceMax) && "•"} <DownOutlined style={{ fontSize: 10 }} /></Button>
        </Popover>

        <Popover content={paymentPopoverContent} trigger="click" open={paymentPopoverOpen} onOpenChange={setPaymentPopoverOpen} placement="bottomLeft" overlayInnerStyle={{ borderRadius: 12 }}>
          <Button style={getFilterBtnStyle(preHandoverPct < 100 || postHandoverOnly)}>Payments {(preHandoverPct < 100 || postHandoverOnly) && "•"} <DownOutlined style={{ fontSize: 10 }} /></Button>
        </Popover>

        <Popover content={handoverPopoverContent} trigger="click" open={handoverPopoverOpen} onOpenChange={setHandoverPopoverOpen} placement="bottomLeft" overlayInnerStyle={{ borderRadius: 12 }}>
          <Button style={getFilterBtnStyle(handoverFrom || handoverTo)}>Handover {(handoverFrom || handoverTo) && "•"} <DownOutlined style={{ fontSize: 10 }} /></Button>
        </Popover>

        <Popover content={unitTypePopoverContent} trigger="click" open={unitTypePopoverOpen} onOpenChange={setUnitTypePopoverOpen} placement="bottomLeft" overlayInnerStyle={{ borderRadius: 12 }}>
          <Button style={getFilterBtnStyle(selectedUnitTypes.length > 0)}>Unit type {selectedUnitTypes.length > 0 && `(${selectedUnitTypes.length})`} <DownOutlined style={{ fontSize: 10 }} /></Button>
        </Popover>
      </div>

      {/* CARDS GRID */}
      <Row gutter={[20, 24]}>
        {filtered.map(p => (
          <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
            <Card hoverable onClick={() => navigate(`/dashboard/agent/secondary/${p._id}`)}
              style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e8e8e8", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} 
              bodyStyle={{ padding: "20px 16px 16px" }}>
              
              <div style={{ position: "relative", height: 210, margin: "-20px -16px 16px -16px" }}>
                <img src={getCoverImage(p)} alt={p.propertyName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                
                <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 8, flexWrap: "wrap", right: 12 }}>
                  <span style={{ background: "#fff", color: "#333", padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600, boxShadow: "0 2px 4px rgba(0,0,0,0.1)", textTransform: 'capitalize' }}>
                    {p.projectStatus || p.propertySubType || "Secondary"}
                  </span>
                  
                  {(p.availableFrom || p.completionDate?.year) && (
                    <span style={{ background: "#fff", color: "#333", padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                      Handover: {p.availableFrom ? formatDate(p.availableFrom) : p.completionDate?.year}
                    </span>
                  )}
                </div>

{(p.developer?.logo || p.developerName) && (
  <div style={{ position: "absolute", bottom: -16, left: 16, width: 44, height: 44, backgroundColor: "#000", borderRadius: 6, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
    {p.developer?.logo 
      ? <img src={p.developer.logo} alt="dev" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> 
      : <span style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>{p.developerName.charAt(0)}</span>
    }
  </div>
)}
              </div>

              <Title level={5} style={{ margin: "4px 0 2px", fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.propertyName}</Title>
              
              <Text type="secondary" style={{ display: "block", marginBottom: 8, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
               {p.area || p.city}{p.developerName ? ` • by ${p.developerName}` : ""}
              </Text>

              {/* ✅ Emoji hataaye, Ant Design Icons laaye */}
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 13, background: "#f3f4f6", padding: "2px 8px", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <TeamOutlined style={{ fontSize: 13, color: "#6b7280" }} />
                  {p.bedrooms} Beds
                </Text>
                <Text type="secondary" style={{ fontSize: 13, background: "#f3f4f6", padding: "2px 8px", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <ExpandOutlined style={{ fontSize: 13, color: "#6b7280" }} />
                  {p.builtUpArea} {p.builtUpAreaUnit || 'sqft'}
                </Text>
              </div>

              <Row justify="space-between" align="bottom" style={{ marginBottom: 12 }}>
  <Col>
    <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 2 }}>Price from</Text>
    <Text strong style={{ fontSize: 16 }}>{Number(p.price || 0).toLocaleString()} {p.currency || "AED"}</Text>
  </Col>
  <Col style={{ textAlign: "right" }}>
    <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 2 }}>Payment plan</Text>
    <Text strong style={{ fontSize: 14 }}>
      {/* {p.paymentPlan?.length > 0 ? "Available" : "Contact Us"} <InfoCircleOutlined style={{ color: "#bfbfbf", marginLeft: 4 }} /> */}
    </Text>
  </Col>
</Row>

{/* Edit Button */}
<div
  style={{ borderTop: "1px solid #f3f4f6", paddingTop: 12, display: "flex", gap: 8 }}
  onClick={(e) => e.stopPropagation()}
>
  <Button
  icon={<EyeOutlined />}
    block
    style={{ borderRadius: 8, height: 36, fontWeight: 500, fontSize: 13 }}
    onClick={() => navigate(`/dashboard/agent/secondary/${p._id}`)}
  >
    View
  </Button>
  <Button
  icon={<EditOutlined />}
    block
    type="primary"
    style={{ borderRadius: 8, height: 36, fontWeight: 500, fontSize: 13, background: "#7c3aed", borderColor: "#7c3aed" }}
    onClick={() => navigate(`/dashboard/agent/create-secondary-plans/${p._id}`)}
  >
    Edit
  </Button>
</div>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{textAlign:"center",marginTop:40}}>
        {loading ? <Spin size="large" /> : hasMore ? <Button size="large" onClick={loadMore} style={{ borderRadius: 8, height: 44, padding: "0 32px", fontWeight: 600 }}>Show More</Button> : <Text type="secondary">No more projects found</Text>}
      </div>

    </div>
  );
}