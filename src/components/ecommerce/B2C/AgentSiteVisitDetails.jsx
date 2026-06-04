import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card, Typography, Button, Tag, Row, Col, Divider, 
  Space, Spin, message, Progress, Avatar
} from "antd";
import {
  ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  CalendarOutlined, FireOutlined, RobotOutlined, PhoneOutlined, 
  MailOutlined, EnvironmentOutlined, DollarCircleOutlined, 
  BankOutlined, CloseCircleOutlined, EyeOutlined, SyncOutlined,UserOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { apiService } from "../../../manageApi/utils/custom.apiservice"; 

const { Title, Text } = Typography;

export default function AgentSiteVisitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const placeholderImg = "https://via.placeholder.com/800x400?text=No+Image+Available";
  const backendBaseUrl = import.meta.env?.VITE_API_URL || "http://localhost:5000";

  const getImageUrl = (property) => {
    let imageUrl = property?.image || property?.photos?.[0] || property?.mainLogo;
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${backendBaseUrl}${imageUrl}`;
    }
    return imageUrl || placeholderImg;
  };

  // ================= 1. FETCH SITE VISIT DETAILS =================
  const fetchVisitDetails = async () => {
    try {
      setLoading(true);
      const res = await apiService.get(`/agent/lead/site-visit/${id}`); 
      const fetchedVisit = res?.data?.data || res?.data || res;

      if (!fetchedVisit) {
        message.warning("No data found in API response.");
      }
      setVisit(fetchedVisit);
    } catch (error) {
      console.error("Fetch Visit Error:", error);
      message.error("Failed to load site visit details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVisitDetails();
    }
  }, [id]);

  // ================= 2. MARK AS COMPLETED =================
  const handleMarkCompleted = async () => {
    try {
      setActionLoading(true);
      await apiService.post(`/agent/lead/update-site-visit/${id}`, {
        status: "completed"
      });
      message.success("Site visit marked as completed!");
      fetchVisitDetails(); 
    } catch (error) {
      console.error(error);
      message.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#f6f7fb]">
        <Spin size="large" />
        <Text type="secondary" className="mt-4 text-lg font-medium">Loading Appointment Intelligence...</Text>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="p-10 text-center bg-[#f6f7fb] min-h-screen flex flex-col items-center justify-center">
        <CalendarOutlined className="text-6xl text-gray-300 mb-4" />
        <Title level={4} className="text-gray-500">Visit Record Not Found</Title>
        <Button type="primary" size="large" className="mt-4 rounded-xl" onClick={() => navigate(-1)}>Return to Schedule</Button>
      </div>
    );
  }

  // Derived Variables
  const isCompleted = visit.status?.toLowerCase() === "completed";
  const isScheduled = visit.status?.toLowerCase() === "scheduled";
  const prop = visit.property;
  const lead = visit.lead;
  const interest = visit.interestId;
  const aiMatch = interest?.ai_match;
  const imgUrl = getImageUrl(prop);

  // Status Badge Helper
  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case "requested": return { color: "warning", icon: <SyncOutlined spin />, text: "Requested / Pending" };
      case "scheduled": return { color: "geekblue", icon: <CalendarOutlined />, text: "Confirmed Schedule" };
      case "completed": return { color: "success", icon: <CheckCircleOutlined />, text: "Visit Completed" };
      case "cancelled": return { color: "volcano", icon: <CloseCircleOutlined />, text: "Cancelled" };
      default: return { color: "default", icon: null, text: status?.toUpperCase() };
    }
  };
  const statusConfig = getStatusDisplay(visit.status);

  return (
    <div className="p-6 md:p-10 space-y-6 bg-[#f6f7fb] min-h-screen">
      
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="mb-2 text-gray-500 hover:text-indigo-600 -ml-3 font-medium transition-colors"
          >
            Back to Pipeline
          </Button>
          <Title level={3} className="!mb-1 text-gray-800 flex items-center gap-3">
            Site Visit Dossier
          </Title>
          <Text type="secondary">Comprehensive details for your upcoming property viewing</Text>
        </div>
        <div>
          <Tag color={statusConfig.color} className="px-4 py-1.5 rounded-full font-bold text-sm m-0 border-none shadow-sm">
            {statusConfig.icon} <span className="ml-1">{statusConfig.text}</span>
          </Tag>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        
        {/* ================= LEFT COLUMN ================= */}
        <Col xs={24} lg={16} className="space-y-6">
          
          {/* 1. Hero Property Card */}
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white p-0" bodyStyle={{ padding: 0 }}>
            <div className="relative h-64 md:h-80 w-full bg-gray-200">
              <img src={imgUrl} alt={prop?.propertyName} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              {/* AI Match Overlay */}
              {aiMatch?.score && (
                <div className="absolute top-4 right-4">
                  <Tag color="success" className="m-0 rounded-full px-4 py-1.5 border-none shadow-lg font-extrabold backdrop-blur-md bg-green-500/90 text-white text-sm">
                    {aiMatch.score}% AI Match
                  </Tag>
                </div>
              )}

              {/* Property Details Overlay */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <Text className="text-white/80 font-bold uppercase tracking-widest text-[10px] mb-1 block">
                  Target Property
                </Text>
                <Title level={2} className="!mb-1 !text-white drop-shadow-md">
                  {prop?.propertyName || "N/A"}
                </Title>
                <div className="flex items-center gap-4 mt-2">
                  <Text className="text-white font-medium text-lg bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg">
                    {prop?.price ? `${prop.price.toLocaleString()} ${prop.currency || 'AED'}` : "Price N/A"}
                  </Text>
                  <Text className="text-white/90 font-medium">
                    <BankOutlined className="mr-1" /> {prop?.developer?.name || "Developer N/A"}
                  </Text>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. Schedule & Time Overview */}
          <Card className="shadow-sm rounded-3xl border border-gray-100 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><ClockCircleOutlined className="text-xl" /></div>
              <Title level={4} className="!mb-0 text-gray-800">Appointment Schedule</Title>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider block mb-1">Viewing Date</Text>
                <Text strong className="text-lg text-gray-800">
                  {visit.scheduledDate 
                    ? dayjs(visit.scheduledDate).format("dddd, MMM DD, YYYY") 
                    : visit.requestedDate 
                      ? dayjs(visit.requestedDate).format("dddd, MMM DD, YYYY") 
                      : "Pending"}
                </Text>
              </div>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider block mb-1">Time</Text>
                <Text strong className="text-lg text-gray-800">{visit.time12hr || visit.visitTime || "TBD"}</Text>
              </div>
              <div className={`p-5 rounded-2xl border ${visit.hoursUntilVisit > 0 && isScheduled ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
                <Text type="secondary" className={`text-[10px] uppercase font-bold tracking-wider block mb-1 ${visit.hoursUntilVisit > 0 ? 'text-indigo-500' : ''}`}>
                  Countdown
                </Text>
                <Text strong className={`text-lg ${visit.hoursUntilVisit > 0 && isScheduled ? 'text-indigo-600' : 'text-gray-800'}`}>
                  {visit.hoursUntilVisit > 0 && isScheduled 
                    ? `In ${visit.hoursUntilVisit} Hours` 
                    : isCompleted ? "Completed" : "Pending"}
                </Text>
              </div>
            </div>
          </Card>

          {/* 3. AI Match Intelligence */}
          {aiMatch?.reasons && aiMatch.reasons.length > 0 && (
            <Card className="shadow-sm rounded-3xl border border-gray-100 bg-gradient-to-br from-indigo-900 to-purple-900 text-white relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2.5 bg-white/10 text-indigo-300 rounded-xl"><RobotOutlined className="text-2xl" /></div>
                <Title level={4} className="!mb-0 !text-white">AI Match Intelligence</Title>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                {aiMatch.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                    <CheckCircleOutlined className="text-emerald-400 mt-1" />
                    <Text className="text-white/90 text-sm leading-snug">{reason}</Text>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Col>


        {/* ================= RIGHT COLUMN ================= */}
        <Col xs={24} lg={8} className="space-y-6">
          
          {/* Action Center Card */}
          <Card className="shadow-md rounded-3xl border-none bg-white">
            <Title level={5} className="!mb-5 text-gray-800 uppercase tracking-widest text-xs">Action Center</Title>
            
            <Button
              type="primary"
              size="large"
              block
              disabled={isCompleted || !isScheduled} 
              loading={actionLoading}
              onClick={handleMarkCompleted}
              icon={isCompleted ? <CheckCircleOutlined /> : null}
              className={`rounded-2xl h-14 font-bold text-base shadow-md transition-all ${
                isCompleted 
                  ? 'bg-emerald-500 border-none hover:bg-emerald-500 opacity-100 text-white' 
                  : !isScheduled 
                    ? 'bg-gray-200 text-gray-400 border-none shadow-none cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 border-none hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-0.5'
              }`}
            >
              {isCompleted ? "Visit Successfully Completed" : "Mark Visit as Completed"}
            </Button>
            
            {visit?.status?.toLowerCase() === "requested" && (
              <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                <Text className="text-orange-600 text-xs font-medium text-center block">
                  Waiting for Admin approval. You can mark this complete once the schedule is confirmed.
                </Text>
              </div>
            )}
          </Card>

          {/* Client Profile Card */}
          <Card className="shadow-sm rounded-3xl border border-gray-100 bg-white">
            <Title level={5} className="!mb-5 text-gray-800 uppercase tracking-widest text-xs">Client Profile</Title>
            
            <div className="flex flex-col items-center text-center mb-6">
              <Avatar size={80} icon={<UserOutlined />} className="bg-indigo-50 text-indigo-500 border-2 border-indigo-100 mb-3" />
              <Title level={4} className="!mb-0 capitalize text-gray-800">{visit?.clientName}</Title>
              <Text type="secondary" className="text-sm">Prospect Lead</Text>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <PhoneOutlined className="text-indigo-500 text-lg" />
                <Text strong className="text-gray-700">{visit?.clientPhone || "No Phone"}</Text>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <MailOutlined className="text-indigo-500 text-lg" />
                <Text strong className="text-gray-700 truncate">{lead?.email || "No Email"}</Text>
              </div>
            </div>

            <Divider className="my-4 border-gray-100" />
            
            <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider mb-3 block">Base Requirements</Text>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <Text type="secondary" className="text-[10px] uppercase block mb-0.5">Budget</Text>
                <Text strong className="text-indigo-600 text-xs">{lead?.budget ? `${lead.budget} AED` : "N/A"}</Text>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <Text type="secondary" className="text-[10px] uppercase block mb-0.5">Layout</Text>
                <Text strong className="text-gray-700 text-xs">{lead?.bedrooms ? `${lead.bedrooms} BHK` : "N/A"}</Text>
              </div>
            </div>
          </Card>

          {/* Lead Engagement Analytics */}
          {interest && (
            <Card className="shadow-sm rounded-3xl border border-gray-100 bg-white">
              <Title level={5} className="!mb-5 text-gray-800 uppercase tracking-widest text-xs">Engagement Analytics</Title>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Text type="secondary" className="text-xs font-bold uppercase tracking-wider">Conversion Probability</Text>
                    <Text strong className="text-indigo-600 text-sm bg-indigo-50 px-2 py-0.5 rounded-md">
                      {interest.conversion_probability || 0}%
                    </Text>
                  </div>
                  <Progress 
                    percent={interest.conversion_probability || 0} 
                    strokeColor={{ '0%': '#818cf8', '100%': '#4f46e5' }} 
                    showInfo={false} 
                    size="small" 
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-500 rounded-lg"><FireOutlined className="text-xl" /></div>
                    <Text className="font-bold text-orange-800 text-xs uppercase tracking-wider">Engagement Score</Text>
                  </div>
                  <Title level={3} className="!mb-0 !text-orange-600">{interest.engagement_score || 0}</Title>
                </div>

                <div className="flex gap-2">
                  <Tag color={interest.brochure?.sent ? "success" : "default"} className="flex-1 text-center py-1.5 rounded-lg border-none font-medium m-0">
                    Brochure: {interest.brochure?.sent ? "Sent" : "Pending"}
                  </Tag>
                  <Tag color={interest.brochure?.viewed ? "purple" : "default"} className="flex-1 text-center py-1.5 rounded-lg border-none font-medium m-0">
                    <EyeOutlined className="mr-1"/> {interest.brochure?.viewed ? "Viewed" : "Unseen"}
                  </Tag>
                </div>
              </div>
            </Card>
          )}

        </Col>
      </Row>
    </div>
  );
}