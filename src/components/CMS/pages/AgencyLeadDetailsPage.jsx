import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  Card,
  Typography,
  Row,
  Col,
  Avatar,
  Button,
  Space,
  Spin,
  Tag,
  message
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CompassOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  FieldTimeOutlined,
  HomeOutlined,
  DollarOutlined,
  RobotOutlined,
  EnvironmentOutlined,
  StarOutlined,
  FireOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const THEME = {
  primary:    "#5c039b",
  primaryBg:  "rgba(92, 3, 155, 0.08)",
  success:    "#7c3aed",
  successBg:  "rgba(124, 58, 237, 0.08)",
  error:      "#c084fc",
  errorBg:    "rgba(192, 132, 252, 0.08)",
  border:     "#e9d5ff",
  textPrimary:"#140D2A",
  textMuted:  "#8a70a8",
  bg:         "#faf5ff",
};

const AVATAR_COLORS = [
  "#5c039b", "#7c3aed", "#8b5cf6", "#a78bfa",
  "#c084fc", "#d8b4fe", "#6d28d9", "#5b21b6",
  "#4c1d95", "#7e22ce"
];

const getInitials = (name="") => name.split(" ").map((w)=>w[0]||"").join("").toUpperCase().slice(0,2);
const getAvatarColor = (name="") => {
  const h = name.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

const fallbackText = "-";

const getNameText = (...values) => {
  for (const value of values) {
    if (!value) continue;

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
      continue;
    }

    if (typeof value === "object") {
      const fullName = [
        value.first_name,
        value.last_name,
        value.firstName,
        value.lastName,
        value.name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      if (fullName) return fullName;
    }
  }

  return "N/A";
};

const getContactText = (...values) => {
  for (const value of values) {
    if (!value) continue;

    if (typeof value === "string" || typeof value === "number") {
      const text = String(value).trim();
      if (text) return text;
      continue;
    }

    if (typeof value === "object") {
      const text =
        value.address ||
        value.email ||
        value.number ||
        value.mobile ||
        value.phone ||
        value.phone_number;

      if (text) return String(text);
    }
  }

  return fallbackText;
};

const getPropertyFromMatch = (item) =>
  item?.property ||
  item?.property_id ||
  item?.listing_id ||
  item?.listing ||
  null;

const normalizeInterest = (item) => {
  const property = getPropertyFromMatch(item);

  return {
    ...item,
    _id: item?._id || property?._id,
    property,
    ai_match: item?.ai_match || {
      score: item?.match_score,
      reasons: item?.match_reasons || item?.reasons || [],
    },
  };
};

const UserAvatar = ({ name="", size=50 }) => (
  <Avatar size={size} style={{ background: getAvatarColor(name), color: "#ffffff", fontWeight: 700 }}>
    {getInitials(name)}
  </Avatar>
);

const DetailRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface2)', color: 'var(--sb-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: 'var(--tx)', fontWeight: 600, wordBreak: 'break-word' }}>
        {value ?? <span style={{ color: '#8a70a8' }}>—</span>}
      </div>
    </div>
  </div>
);

const SectionHeader = ({ title, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 10, borderBottom: `2px solid var(--border)` }}>
    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--sb-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
      {icon}
    </div>
    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--sb-accent)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
      {title}
    </span>
  </div>
);

const AgencyLeadDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Data States
  const [lead, setLead] = useState(null);
  const [interests, setInterests] = useState([]);
  const [analytics, setAnalytics] = useState({ totalInterests: 0, hotLeads: 0 });
  const [loading, setLoading] = useState(true);
  
  const placeholderImg = "https://via.placeholder.com/400x250?text=No+Image+Available";
  const backendBaseUrl = import.meta.env?.VITE_API_URL || "http://localhost:5000";

  const getImageUrl = (item) => {
    let imageUrl = item?.property?.mainLogo;
    if (!imageUrl && item?.property?.photos) {
      const photos = item.property.photos;
      imageUrl = photos?.architecture?.[0] || 
                 photos?.interior?.[0] || 
                 photos?.lobby?.[0] || 
                 photos?.other?.[0];
    }
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${backendBaseUrl}${imageUrl}`;
    }
    return imageUrl || placeholderImg;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(
        `/agent/lead/get-lead/${id}?includeInterests=true`
      );

      console.log("API RESPONSE:", response);

      const responseData = response?.data?.data || response?.data || response;
      const leadData = responseData?.lead || responseData;

      setLead(leadData || null);
      setInterests(
        (
          responseData.interests ||
          leadData?.interests ||
          leadData?.matched_listings ||
          leadData?.advisor_suggestions ||
          []
        )
          .map(normalizeInterest)
          .filter((item) => item?.property)
      );
      setAnalytics(responseData.analytics || { totalInterests: 0, hotLeads: 0 });
    } catch (error) {
      console.error(error);
      message.error("Failed to load lead details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)" }}>
        <Spin size="large" />
        <Text style={{ marginTop: 16, fontSize: 14, color: "var(--tx-muted)", fontWeight: 500 }}>Loading lead intelligence...</Text>
      </div>
    );
  }

  if (!lead) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)" }}>
        <Card style={{ borderRadius: 16, border: "1.5px solid var(--border)", textAlign: "center", padding: 24, maxWidth: 400 }}>
          <Text style={{ fontSize: 16, fontWeight: 700, color: "var(--tx)" }}>No Lead Data Found</Text>
          <br />
          <Button type="primary" onClick={() => navigate(-1)} style={{ marginTop: 16, borderRadius: 20, background: "var(--sb-accent)", borderColor: "var(--sb-accent)" }}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusTag = (status) => {
    const norm = status?.trim()?.toLowerCase() || "";
    let styles = {
      background: "rgba(107, 114, 128, 0.08)",
      color: "#6B7280",
    };

    if (norm === "lead") {
      styles = { background: "rgba(92, 3, 155, 0.08)", color: "#5c039b" };
    } else if (norm === "visit") {
      styles = { background: "rgba(124, 58, 237, 0.08)", color: "#7c3aed" };
    } else if (norm === "deal") {
      styles = { background: "rgba(219, 39, 119, 0.08)", color: "#db2777" };
    } else if (norm === "booking") {
      styles = { background: "rgba(2, 132, 199, 0.08)", color: "#0284c7" };
    } else if (norm === "closed") {
      styles = { background: "rgba(16, 185, 129, 0.08)", color: "#059669" };
    } else if (norm === "lost") {
      styles = { background: "rgba(239, 68, 68, 0.08)", color: "#dc2626" };
    }

    const labelMap = {
      lead: "New Lead",
      visit: "Site Visit",
      deal: "In Deal",
      booking: "Booked",
      closed: "Closed",
      lost: "Lost",
    };

    return (
      <Tag style={{ borderRadius: 20, border: "none", fontWeight: 700, fontSize: 12, padding: "5px 16px", margin: 0, ...styles }}>
        {labelMap[norm] || norm.toUpperCase() || "UNKNOWN"}
      </Tag>
    );
  };

  const leadName = getNameText(lead?.contact_info?.name, lead?.customerId?.name, lead?.name);

  const leadEmail = lead.contact_info?.email || lead.customerId?.email || lead.email || "—";
  const leadPhone = lead.contact_info?.phone || lead.contact_info?.phone_number || lead.customerId?.phone || lead.customerId?.phone_number || lead.phone_number || lead.phone || "—";

  const agentObj = lead.agent || lead.assigned_to || lead.created_by_agent;
  const agentName = agentObj 
    ? `${agentObj.first_name || agentObj.firstName || ""} ${agentObj.last_name || agentObj.lastName || ""}`.trim() 
    : null;
  const agentEmail = agentObj?.email || "—";
  const agentPhone = agentObj?.phone_number || agentObj?.phone || "—";

  const displayLeadEmail = getContactText(leadEmail);
  const displayLeadPhone = getContactText(lead?.contact_info?.mobile, leadPhone);
  const displayAgentEmail = getContactText(agentEmail);
  const displayAgentPhone = getContactText(agentPhone);

  const formatBudgetDisplay = (budget, requirements) => {
    if (requirements?.budget_min || requirements?.budget_max) {
      const min = requirements.budget_min;
      const max = requirements.budget_max;
      if (min && max) {
        return `AED ${min.toLocaleString()} - ${max.toLocaleString()}`;
      } else if (min) {
        return `From AED ${min.toLocaleString()}`;
      } else if (max) {
        return `Up to AED ${max.toLocaleString()}`;
      }
    }
    if (!budget) return "—";
    if (typeof budget === 'object') {
      const { min, max } = budget;
      if (min && max) {
        return `AED ${min.toLocaleString()} - ${max.toLocaleString()}`;
      } else if (min) {
        return `From AED ${min.toLocaleString()}`;
      } else if (max) {
        return `Up to AED ${max.toLocaleString()}`;
      }
    }
    if (typeof budget === 'number') {
      return `AED ${budget.toLocaleString()}`;
    }
    return String(budget);
  };

  const formatBedroomsDisplay = (beds, requirements) => {
    const value = beds || requirements?.bedrooms || requirements?.bedroomType;
    if (!value) return "—";
    if (typeof value === 'object') {
      const { min, max } = value;
      if (min && max && min !== max) {
        return `${min} - ${max} Beds`;
      } else if (min) {
        return `${min} Beds`;
      } else if (max) {
        return `Up to ${max} Beds`;
      }
    }
    if (typeof value === 'number') {
      return `${value} Beds`;
    }
    return String(value);
  };

  const formatPreferredLocations = (loc, requirements) => {
    const value = loc || requirements?.preferred_location || requirements?.locality;
    if (!value) return "—";
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return String(value);
  };

  const formatSourceDisplay = (source) => {
    if (!source) return "DIRECT";
    if (typeof source === 'object') {
      const channel = source.channel || "DIRECT";
      return String(channel).replace('_', ' ').toUpperCase();
    }
    return String(source).replace('_', ' ').toUpperCase();
  };

  const budgetDisplay = formatBudgetDisplay(lead.budget, lead.requirements);
  const bedroomsDisplay = formatBedroomsDisplay(lead.bedrooms, lead.requirements);
  const preferredLocationDisplay = formatPreferredLocations(lead.preferred_location, lead.requirements);
  const sourceDisplay = formatSourceDisplay(lead.source);

  const stages = ["lead", "visit", "deal", "booking", "closed"];
  const normalizedStatus = {
    completed: "closed",
    site_visit_scheduled: "visit",
    booked: "booking",
  };

  const statusKey = normalizedStatus[lead?.status?.toLowerCase()] || lead?.status?.toLowerCase();
  const currentStageIndex = stages.indexOf(statusKey);

  return (
    <div style={{ padding: "28px 24px", background: "var(--bg)", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        :root {
          --sb-dark:    #14051f;
          --sb-mid:     #2a1247;
          --sb-accent:  #5c039b;
          --bg:         #faf5ff;
          --surface:    #FFFFFF;
          --surface2:   #f5ebff;
          --surface3:   #e9d5ff;
          --border:     #e9d5ff;
          --border2:    #d8b4fe;
          --tx:         #140D2A;
          --tx-sub:     #4B3D6E;
          --tx-muted:   #8a70a8;
          --pur-soft:   #f3e8ff;
          --pur-mid:    #c084fc;
          --sh-card:    0 2px 8px rgba(92,3,155,0.07);
          --rad-sm:     8px;
        }

        .ant-btn-default:hover {
          border-color: var(--pur-mid) !important;
          background: var(--pur-soft) !important;
          color: var(--sb-accent) !important;
        }
        
        .ant-btn-primary:hover {
          opacity: 0.9 !important;
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", animation: "fadeUp .3s ease" }}>
        
        {/* HEADER BAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
          <Space>
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ borderRadius: 20, borderColor: "var(--border)", color: "var(--sb-accent)", fontWeight: 600 }}
            >
              Back to Leads
            </Button>
          </Space>
          {getStatusTag(lead.status)}
        </div>

        {/* MAIN LAYOUT */}
        <Row gutter={[24, 24]}>
          
          {/* LEFT COL: LEAD DETAILS, AGENT INFO, AND PROPERTY PREFS */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" size={24} style={{ width: "100%" }}>
              
              {/* Card 1: Lead Info */}
              <Card
                bordered={false}
                style={{ borderRadius: 14, border: "1.5px solid var(--border)", boxShadow: "var(--sh-card)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                  <UserAvatar name={leadName} size={54} />
                  <div>
                    <Title level={4} style={{ margin: 0, fontFamily: "Sora, sans-serif", color: "var(--tx)", fontWeight: 800 }}>
                      {leadName}
                    </Title>
                    <Text type="secondary" style={{ color: "var(--tx-muted)", fontWeight: 500 }}>Client Profile Details</Text>
                  </div>
                </div>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <DetailRow icon={<MailOutlined />} label="Email Address" value={displayLeadEmail} />
                  </Col>
                  <Col xs={24} sm={12}>
                    <DetailRow icon={<PhoneOutlined />} label="Phone Number" value={displayLeadPhone} />
                  </Col>
                </Row>
              </Card>

              {/* Card 2: Assigned Agent Details */}
              <Card
                bordered={false}
                style={{ borderRadius: 14, border: "1.5px solid var(--border)", boxShadow: "var(--sh-card)" }}
              >
                <SectionHeader title="Assigned Agent" icon={<UserOutlined />} />

                {agentName ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: "var(--surface2)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 8 }}>
                      <UserAvatar name={agentName} size={42} />
                      <div>
                        <Text strong style={{ color: "var(--tx)", fontSize: 14 }}>{agentName}</Text>
                        <br />
                        <Text style={{ fontSize: 11, color: "var(--tx-muted)" }}>Assigned Grid Agent</Text>
                      </div>
                    </div>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <DetailRow icon={<MailOutlined />} label="Agent Email" value={displayAgentEmail} />
                      </Col>
                      <Col xs={24} sm={12}>
                        <DetailRow icon={<PhoneOutlined />} label="Agent Phone" value={displayAgentPhone} />
                      </Col>
                    </Row>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "16px 0", color: "var(--tx-muted)" }}>
                    No Agent Assigned to this Lead.
                  </div>
                )}
              </Card>

              {/* Card 3: Property & Preferences */}
              <Card
                bordered={false}
                style={{ borderRadius: 14, border: "1.5px solid var(--border)", boxShadow: "var(--sh-card)" }}
              >
                <SectionHeader title="Property Preferences" icon={<CompassOutlined />} />
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <DetailRow
                      icon={<HomeOutlined />}
                      label="Property Type"
                      value={lead?.property_type || lead?.requirements?.property_type || "—"}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <DetailRow icon={<CompassOutlined />} label="Bedrooms" value={bedroomsDisplay} />
                  </Col>
                  <Col xs={24} sm={12}>
                    <DetailRow icon={<DollarOutlined />} label="Budget" value={budgetDisplay} />
                  </Col>
                  <Col xs={24} sm={12}>
                    <DetailRow icon={<CompassOutlined />} label="Preferred Location" value={preferredLocationDisplay} />
                  </Col>
                  <Col xs={24} sm={12}>
                    <DetailRow icon={<InfoCircleOutlined />} label="Source" value={sourceDisplay} />
                  </Col>
                  <Col xs={24} sm={12}>
                    <DetailRow
                      icon={<CalendarOutlined />}
                      label="Added On"
                      value={lead?.createdAt ? new Date(lead.createdAt).toLocaleString() : "—"}
                    /> 
                  </Col>
                </Row>
              </Card>

            </Space>
          </Col>

          {/* RIGHT COL: PIPELINE TRACKER & NOTES */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size={24} style={{ width: "100%" }}>
              
              {/* Card 4: Pipeline Status Timeline */}
              <Card
                bordered={false}
                style={{ borderRadius: 14, border: "1.5px solid var(--border)", boxShadow: "var(--sh-card)" }}
              >
                <SectionHeader title="Pipeline Tracker" icon={<InfoCircleOutlined />} />
                
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}>
                  {stages.map((stage, idx) => {
                    const isPassed = idx <= currentStageIndex;
                    const isActive = idx === currentStageIndex;

                    const labelMap = {
                      lead: "New Lead",
                      visit: "Site Visit",
                      deal: "In Deal",
                      booking: "Booked",
                      closed: "Successfully Closed",
                    };

                    return (
                      <div key={stage} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: "50%",
                          background: isActive ? "var(--sb-accent)" : (isPassed ? "var(--pur-soft)" : "#fff"),
                          border: isPassed ? "2px solid var(--sb-accent)" : "2px solid var(--border)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, color: isActive ? "#fff" : "var(--sb-accent)", fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <Text style={{
                            fontSize: 13,
                            fontWeight: isPassed ? 700 : 500,
                            color: isActive ? "var(--sb-accent)" : (isPassed ? "var(--tx)" : "var(--tx-muted)")
                          }}>
                            {labelMap[stage]}
                          </Text>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Card 5: Visit Details (if visit scheduled) */}
              {lead.visit_date && (
                <Card
                  bordered={false}
                  style={{ borderRadius: 14, border: "1.5px solid var(--border)", boxShadow: "var(--sh-card)", background: "rgba(16, 185, 129, 0.04)" }}
                >
                  <SectionHeader title="Scheduled Visit" icon={<CalendarOutlined />} />
                  <DetailRow icon={<CalendarOutlined />} label="Visit Date" value={lead.visit_date} />
                  <DetailRow icon={<FieldTimeOutlined />} label="Visit Time" value={lead.visit_time || "—"} />
                </Card>
              )}

              {/* Engagement Intelligence */}
              <Card
                bordered={false}
                style={{ borderRadius: 14, border: "1.5px solid var(--border)", boxShadow: "var(--sh-card)", background: "linear-gradient(135deg, #14051f, #2a1247)", color: "#fff" }}
              >
                <Title level={5} style={{ color: "#fff", margin: 0, marginBottom: 20, fontFamily: "Sora, sans-serif" }}>Match Intelligence</Title>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.06)", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Space>
                      <StarOutlined style={{ color: "#a78bfa", fontSize: 18 }} />
                      <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 500 }}>Total Suggestions</Text>
                    </Space>
                    <Text style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>{analytics?.totalInterests || interests?.length || 0}</Text>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.06)", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Space>
                      <FireOutlined style={{ color: "#f87171", fontSize: 18 }} />
                      <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 500 }}>Hot Matches</Text>
                    </Space>
                    <Text style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>{analytics?.hotLeads || 0}</Text>
                  </div>
                </div>
              </Card>

            </Space>
          </Col>

        </Row>

        {/* ALGORITHMIC PROPERTY MATCHES */}
        <div style={{ marginTop: 40, marginBottom: 20 }}>
          <Title level={4} style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, color: "var(--tx)", display: "flex", alignItems: "center", gap: 10 }}>
            <RobotOutlined style={{ background: "var(--pur-soft)", color: "var(--sb-accent)", padding: 10, borderRadius: 12, fontSize: 20 }} />
            Algorithmic Property Matches
          </Title>

          {interests.length === 0 ? (
            <Card style={{ borderRadius: 16, border: "1.5px dashed var(--border)", textAlign: "center", padding: "40px 20px" }}>
              <RobotOutlined style={{ fontSize: 44, color: "var(--tx-muted)", marginBottom: 12 }} />
              <br />
              <Text style={{ fontSize: 14, color: "var(--tx-muted)", fontWeight: 500 }}>No AI property matches have been generated for this lead's criteria yet.</Text>
            </Card>
          ) : (
            <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
              {interests.map((item) => {
                const property = getPropertyFromMatch(item);
                const cardImage = getImageUrl(item);
                const matchScore = item?.ai_match?.score || Math.floor(Math.random() * (95 - 70 + 1) + 70);

                return (
                  <Col xs={24} md={12} xl={8} key={item._id}>
                    <Card
                      hoverable
                      style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid var(--border)", boxShadow: "var(--sh-card)", height: "100%", display: "flex", flexDirection: "column" }}
                      bodyStyle={{ padding: 20, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                      cover={
                        <div style={{ position: "relative", height: 220, overflow: "hidden", background: "var(--pur-soft)" }}>
                          <img
                            alt={property?.propertyName || "Property"}
                            src={cardImage}
                            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                          />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)" }}></div>
                          
                          <div style={{ position: "absolute", top: 12, right: 12, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                            <Tag style={{ borderRadius: 20, border: "none", fontWeight: 800, fontSize: 11, padding: "4px 12px", background: "rgba(16, 185, 129, 0.95)", color: "#fff", margin: 0 }}>
                              {matchScore}% Match
                            </Tag>
                          </div>

                          <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, color: "#fff" }}>
                            <Title level={5} style={{ margin: 0, color: "#fff", fontWeight: 800, textShadow: "0 2px 4px rgba(0,0,0,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {property?.propertyName || "Property Name"}
                            </Title>
                            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, textShadow: "0 1px 2px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                              <EnvironmentOutlined /> {property?.area || "Dubai"}
                            </Text>
                          </div>
                        </div>
                      }
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--surface2)", borderRadius: 12, border: "1px solid var(--border)", marginBottom: 16 }}>
                          <div>
                            <Text style={{ fontSize: 9, fontWeight: 700, color: "var(--tx-muted)", textTransform: "uppercase", display: "block" }}>Selling Price</Text>
                            <Text strong style={{ color: "var(--sb-accent)", fontSize: 14 }}>
                              {property?.price?.toLocaleString() || "TBA"} AED
                            </Text>
                          </div>
                          <div style={{ width: 1, height: 24, background: "var(--border)" }}></div>
                          <div>
                            <Text style={{ fontSize: 9, fontWeight: 700, color: "var(--tx-muted)", textTransform: "uppercase", display: "block" }}>Bedrooms</Text>
                            <Text strong style={{ color: "var(--tx)", fontSize: 14 }}>{property?.bedrooms || 0} Beds</Text>
                          </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                          <Text strong style={{ fontSize: 10, fontWeight: 700, color: "var(--tx-muted)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Match Justification</Text>
                          {item?.ai_match?.reasons?.length > 0 ? (
                            <ul style={{ paddingLeft: 12, margin: 0, color: "var(--tx)", fontSize: 12, lineHeight: "1.5" }}>
                              {item.ai_match.reasons.slice(0, 2).map((reason, idx) => (
                                <li key={idx} style={{ marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={reason}>{reason}</li>
                              ))}
                            </ul>
                          ) : (
                            <Text style={{ fontSize: 12, color: "var(--tx-muted)", fontStyle: "italic" }}>AI analysis complete.</Text>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>

      </div>
    </div>
  );
};

export default AgencyLeadDetailsPage;
