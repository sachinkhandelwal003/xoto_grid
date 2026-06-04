import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  Card, Typography, Tag, Button, Row, Col, Statistic, 
  Input, Select, Space, message, Spin, Empty,Avatar ,Divider 
} from "antd";
import { 
  CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, 
  EyeOutlined, ClockCircleOutlined, UserOutlined, 
  PhoneOutlined, MailOutlined, EnvironmentOutlined, 
  SearchOutlined, SyncOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AgentSiteVisits() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Helper: Image URL Builder (Vite safe)
  const placeholderImg = "https://via.placeholder.com/400x250?text=No+Image+Available";
  const backendBaseUrl = import.meta.env?.VITE_API_URL || "http://localhost:5000";

  const getImageUrl = (property) => {
    let imageUrl = property?.image || property?.photos?.[0] || property?.mainLogo;
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${backendBaseUrl}${imageUrl}`;
    }
    return imageUrl || placeholderImg;
  };

  // ── Fetch visits ────────────────────────────────────────────
  const fetchVisits = async () => {
    try {
      setLoading(true);
      const res = await apiService.get("/agent/lead/get-all-site-visits?page=1&limit=100");
      // Handle nested structure based on JSON response
      const list = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      setVisits(list);
    } catch (error) {
      console.error("Fetch Error:", error);
      message.error("Failed to fetch site visits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVisits(); }, []);

  // ── Derived State & Filtering ────────────────────────────────
  const filteredVisits = visits.filter(v => {
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    const searchLower = searchQuery.toLowerCase();
    
    // Safely grab names for searching
    const leadFirstName = v.lead?.name?.first_name || "";
    const leadLastName = v.lead?.name?.last_name || "";
    const clientNameFallback = v.clientName || "";
    const fullName = `${leadFirstName} ${leadLastName} ${clientNameFallback}`.toLowerCase();
    
    const propName = v.property?.propertyName?.toLowerCase() || "";
    
    const matchesSearch = fullName.includes(searchLower) || propName.includes(searchLower);
    
    return matchesStatus && matchesSearch;
  });

  // Calculate Stats
  const totalVisits = visits.length;
  const completed = visits.filter((v) => v.status === "completed").length;
  const scheduled = visits.filter((v) => v.status === "scheduled").length;
  const requested = visits.filter((v) => v.status === "requested").length;
  const cancelled = visits.filter((v) => v.status === "cancelled").length;

  const getStatusProps = (status) => {
    switch (status?.toLowerCase()) {
      case "scheduled": return { color: "geekblue", text: "SCHEDULED", icon: <ClockCircleOutlined />, bg: "bg-blue-50", border: "border-blue-200" };
      case "completed": return { color: "success", text: "COMPLETED", icon: <CheckCircleOutlined />, bg: "bg-emerald-50", border: "border-emerald-200" };
      case "cancelled": return { color: "volcano", text: "CANCELLED", icon: <CloseCircleOutlined />, bg: "bg-red-50", border: "border-red-200" };
      case "requested": return { color: "warning", text: "REQUESTED", icon: <SyncOutlined spin />, bg: "bg-orange-50", border: "border-orange-200" };
      default: return { color: "default", text: status?.toUpperCase() || "UNKNOWN", icon: null, bg: "bg-gray-50", border: "border-gray-200" };
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6 bg-[#f6f7fb] min-h-screen">

      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <Title level={2} className="!mb-1 text-gray-800 flex items-center gap-3">
            <CalendarOutlined className="text-indigo-600" /> Site Visit Management
          </Title>
          <Text type="secondary" className="text-base">Track, manage, and coordinate your property viewings</Text>
        </div>
      </div>

      {/* ---------------- SUMMARY CARDS ---------------- */}
      <Row gutter={[20, 20]}>
        <Col xs={12} md={6}>
          <Card className="shadow-sm rounded-2xl border-none h-full bg-white">
            <Statistic 
              title={<Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-1">Total Visits</Text>}
              value={totalVisits} 
              prefix={<CalendarOutlined className="text-gray-400 mr-2" />} 
              valueStyle={{ color: "#1f2937", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="shadow-sm rounded-2xl border-none h-full bg-blue-50/50 border border-blue-100">
            <Statistic 
              title={<Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-1 text-blue-500">Scheduled / Requested</Text>}
              value={scheduled + requested} 
              prefix={<ClockCircleOutlined className="text-blue-400 mr-2" />}
              valueStyle={{ color: "#3b82f6", fontWeight: 700 }} 
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="shadow-sm rounded-2xl border-none h-full bg-emerald-50/50 border border-emerald-100">
            <Statistic 
              title={<Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-1 text-emerald-600">Completed</Text>}
              value={completed}
              prefix={<CheckCircleOutlined className="text-emerald-400 mr-2" />} 
              valueStyle={{ color: "#10b981", fontWeight: 700 }} 
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="shadow-sm rounded-2xl border-none h-full bg-red-50/50 border border-red-100">
            <Statistic 
              title={<Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-1 text-red-500">Cancelled</Text>}
              value={cancelled}
              prefix={<CloseCircleOutlined className="text-red-400 mr-2" />} 
              valueStyle={{ color: "#ef4444", fontWeight: 700 }} 
            />
          </Card>
        </Col>
      </Row>

      {/* ---------------- FILTER BAR ---------------- */}
      <Card className="shadow-sm rounded-2xl border-none bg-white p-2">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search by client or property name..."
            size="large"
            className="rounded-xl max-w-md bg-gray-50 border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />
          <Select 
            value={statusFilter} 
            onChange={setStatusFilter} 
            size="large" 
            className="w-full sm:w-48 rounded-xl"
            dropdownStyle={{ borderRadius: '12px' }}
          >
            <Option value="all">Show All Status</Option>
            <Option value="requested">Requested</Option>
            <Option value="scheduled">Scheduled</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </div>
      </Card>

      {/* ---------------- HORIZONTAL CARDS LIST ---------------- */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-24 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
             <Spin size="large" />
             <Text type="secondary" className="block mt-4 text-lg font-medium">Loading your schedule...</Text>
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
             <CalendarOutlined className="text-6xl text-gray-200 mb-5 block" />
             <Title level={4} className="text-gray-400 !mb-2">No Visits Found</Title>
             <Text type="secondary" className="text-base">Try adjusting your search or status filters.</Text>
          </div>
        ) : (
          filteredVisits.map((visit) => {
            const prop = visit.property;
            const lead = visit.lead;
            const imgUrl = getImageUrl(prop);
            const statusProps = getStatusProps(visit.status);
            
            // Format Schedule Data
            const visitDate = visit.scheduledDate || visit.requestedDate;
            const dateStr = visitDate ? dayjs(visitDate).format("dddd, MMM DD, YYYY") : "Pending Date";
            const timeStr = visit.time12hr || visit.visitTime || "TBD";
            
            // Client Name logic
            const clientFullName = visit.clientName || `${lead?.name?.first_name || ""} ${lead?.name?.last_name || ""}`.trim() || "Unknown Client";

            return (
              <Card 
                key={visit._id} 
                className="rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white"
                bodyStyle={{ padding: '0' }}
              >
                <div className="flex flex-col lg:flex-row items-stretch">
                  
                  {/* 1. LEFT: Property Image & Overlay */}
                  <div className="relative w-full lg:w-80 h-64 lg:h-auto flex-shrink-0 bg-gray-100 border-b lg:border-b-0 lg:border-r border-gray-100">
                    <img 
                      src={imgUrl} 
                      alt={prop?.propertyName} 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" 
                      onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    {/* Status Tag on Image */}
                    <div className="absolute top-4 right-4">
                      <Tag color={statusProps.color} className="m-0 rounded-full px-3 py-1 border-white/20 shadow-lg font-bold backdrop-blur-md">
                        {statusProps.icon} <span className="ml-1">{statusProps.text}</span>
                      </Tag>
                    </div>
                    
                    {/* Property Title & Price */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <Title level={4} className="!mb-1 !text-white drop-shadow-md line-clamp-1" title={prop?.propertyName}>
                        {prop?.propertyName || "Property Not Specified"}
                      </Title>
                      <Text className="text-white/90 drop-shadow-md font-medium text-sm">
                        {prop?.price ? `${prop.price.toLocaleString()} ${prop.currency || 'AED'}` : "Price N/A"}
                      </Text>
                    </div>
                  </div>

                  {/* 2. MIDDLE: Content Grid */}
                  <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
                    
                    {/* Column A: Client Details */}
                    <div className="flex-1 flex flex-col justify-center">
                      <Text type="secondary" className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-3 block">
                        Client Information
                      </Text>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar size={48} icon={<UserOutlined />} className="bg-indigo-50 text-indigo-500 border border-indigo-100" />
                        <div>
                          <Text strong className="text-base text-gray-800 block leading-tight capitalize">
                            {clientFullName}
                          </Text>
                          <Text type="secondary" className="text-xs">Prospect Lead</Text>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <PhoneOutlined className="text-gray-400" />
                          <Text strong className="text-sm">{visit.clientPhone || lead?.phone_number || "No Phone"}</Text>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MailOutlined className="text-gray-400" />
                          <Text className="text-sm truncate w-48">{lead?.email || "No Email"}</Text>
                        </div>
                      </div>
                    </div>

                    <Divider type="vertical" className="hidden md:block h-auto mx-0 border-gray-100" />

                    {/* Column B: Schedule Details */}
                    <div className="flex-1 flex flex-col justify-center">
                      <Text type="secondary" className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-3 block">
                        Appointment Details
                      </Text>
                      
                      <div className={`p-4 rounded-2xl border ${statusProps.border} ${statusProps.bg} flex flex-col gap-3`}>
                        <div className="flex items-start gap-3">
                          <CalendarOutlined className={`text-xl mt-0.5 ${visit.status === 'cancelled' ? 'text-red-400' : 'text-indigo-500'}`} />
                          <div>
                            <Text type="secondary" className="text-[10px] uppercase font-bold block mb-0.5">Date</Text>
                            <Text strong className="text-[15px] text-gray-800">{dateStr}</Text>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <ClockCircleOutlined className={`text-xl mt-0.5 ${visit.status === 'cancelled' ? 'text-red-400' : 'text-emerald-500'}`} />
                          <div>
                            <Text type="secondary" className="text-[10px] uppercase font-bold block mb-0.5">Time</Text>
                            <Text strong className="text-[15px] text-gray-800">{timeStr}</Text>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* 3. RIGHT: Actions Panel */}
                  <div className="w-full lg:w-48 p-6 flex flex-col gap-3 justify-center bg-gray-50/50 border-t lg:border-t-0 lg:border-l border-gray-100">
                    <Button 
                      type="primary" 
                      icon={<EyeOutlined />}
                      size="large"
                      onClick={() => navigate(`/dashboard/agent/site-visits/${visit._id}`)}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700 border-none shadow-md font-medium w-full"
                    >
                      View Details
                    </Button>
                    
                    {visit.status === "scheduled" && (
                       <Button 
                         type="default" 
                         size="large"
                         icon={<EnvironmentOutlined />}
                         className="rounded-xl font-medium text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 w-full"
                       >
                         Get Directions
                       </Button>
                    )}
                  </div>

                </div>
              </Card>
            );
          })
        )}
      </div>

    </div>
  );
}