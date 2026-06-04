import { Typography, Tag, Button, Skeleton, Descriptions, Space, message } from "antd";
import { 
  ArrowLeftOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  BankOutlined, 
  WalletOutlined, 
  IdcardOutlined 
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

export default function DeveloperLeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLeadDetails();
    }
  }, [id]);

  // ================= FETCH LEAD DETAILS =================
  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      const res = await apiService.get(`/property/developer-lead/${id}`);
      
      if (res?.success) {
        setLead(res.data);
      } else {
        message.error(res?.message || "Lead not found");
      }
    } catch (err) {
      console.error("Lead Details Error:", err);
      message.error("Failed to load lead details");
    } finally {
      setLoading(false);
    }
  };

  // ================= DYNAMIC TAG COLOR =================
  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("convert") || s.includes("win") || s.includes("book")) return "success";
    if (s.includes("progress") || s.includes("follow")) return "processing";
    if (s.includes("lost") || s.includes("reject")) return "error";
    return "orange";
  };

  const clientName = `${lead?.name?.first_name || ""} ${lead?.name?.last_name || ""}`.trim();
  const agentName = lead?.agent ? `${lead.agent.first_name} ${lead.agent.last_name}` : "Unassigned";

  return (
    // Yahan maine background white aur minHeight add kiya hai
    <div style={{ background: "#ffffff", minHeight: "100vh", padding: "32px" }}>
      
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* --- Page Header Section --- */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <Space size="middle">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)} 
              style={{ fontSize: '18px', padding: 0 }}
            />
            <Title level={3} style={{ margin: 0 }}>Lead Information</Title>
          </Space>

          {!loading && lead && (
            <Button
              type="primary"
              size="large"
              style={{ background: "#5c039b", borderColor: "#5c039b" }}
              onClick={() => navigate(`/dashboard/developer/developer-leads/${id}/booking`)}
            >
              Convert to Booking
            </Button>
          )}
        </div>

        {/* --- Details Section (Bina Card Ke) --- */}
        <Skeleton loading={loading} active paragraph={{ rows: 8 }}>
          {lead ? (
            <Descriptions 
              bordered 
              column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              size="large" // Thoda open aur clean look ke liye size large kiya hai
              labelStyle={{ fontWeight: 600, width: "220px", background: "#fafafa" }} // Labels ke liye light grey background
              contentStyle={{ background: "#ffffff" }}
            >
              <Descriptions.Item label={<Space><UserOutlined /> Client Name</Space>}>
                <Text strong style={{ fontSize: "16px" }}>{clientName || "N/A"}</Text>
              </Descriptions.Item>

              <Descriptions.Item label={<Space><IdcardOutlined /> Status</Space>}>
                <Tag color={getStatusColor(lead?.status)} style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "14px" }}>
                  {lead?.status?.toUpperCase() || "NEW LEAD"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label={<Space><MailOutlined /> Email</Space>}>
                {lead?.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label={<Space><PhoneOutlined /> Phone</Space>}>
                {lead?.phone_number ? <a href={`tel:${lead.phone_number}`}>{lead.phone_number}</a> : "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label={<Space><BankOutlined /> Project</Space>}>
                <Text>{lead?.project?.propertyName || "N/A"}</Text>
              </Descriptions.Item>

              <Descriptions.Item label={<Space><WalletOutlined /> Budget</Space>}>
                <Text type="success" strong>{lead?.budget || "N/A"}</Text>
              </Descriptions.Item>

              <Descriptions.Item label={<Space><UserOutlined /> Assigned Agent</Space>}>
                {agentName}
              </Descriptions.Item>
              
            </Descriptions>
          ) : (
            // --- Empty State ---
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Title level={4} type="secondary">No Lead Found</Title>
              <Text type="secondary">The lead you are looking for does not exist or has been removed.</Text>
              <br /><br />
              <Button onClick={() => navigate(-1)} type="default" size="large">Go Back</Button>
            </div>
          )}
        </Skeleton>

      </div>
    </div>
  );
}