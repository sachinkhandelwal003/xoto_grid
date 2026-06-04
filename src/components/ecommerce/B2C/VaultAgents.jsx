import React, { useState, useMemo } from "react";
import {
  Card,
  Typography,
  Avatar,
  Space,
  Tag,
  Input,
  Drawer,
  Divider,
  Dropdown,
  Segmented,
  Button
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  StopOutlined,
  MoreOutlined,
  BankOutlined,
  TrophyOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import { FiEye, FiSearch, FiRefreshCw } from "react-icons/fi";

// Custom components
import CustomTable from '../../../components/CMS/pages/custom/CustomTable';

const { Title, Text } = Typography;

const THEME = {
  primary: "#5c039b",
  success: "#10b981",
  error: "#ef4444",
  warning: "#d97706",
  blue: "#0ea5e9"
};

// Mock Data
const mockAgents = [
  { _id: "1", name: { first_name: "Ahmed", last_name: "Al Mansoori" }, phone: { number: "501234567" }, email: "ahmed@example.com", agentType: "FreelanceAgent", partnerId: null, totalLeads: 12, createdAt: "2025-01-15T10:00:00Z", isActive: true },
  { _id: "2", name: { first_name: "Fatima", last_name: "Hassan" }, phone: { number: "559876543" }, email: "fatima@example.com", agentType: "PartnerAffiliatedAgent", partnerId: { companyName: "Dubai Properties" }, totalLeads: 8, createdAt: "2025-02-20T14:30:00Z", isActive: true },
  { _id: "3", name: { first_name: "Mohammed", last_name: "Al Rashidi" }, phone: { number: "562223333" }, email: "mohammed@example.com", agentType: "FreelanceAgent", partnerId: null, totalLeads: 5, createdAt: "2025-03-10T09:15:00Z", isActive: false },
  { _id: "4", name: { first_name: "Layla", last_name: "Mahmoud" }, phone: { number: "504445555" }, email: "layla@example.com", agentType: "PartnerAffiliatedAgent", partnerId: { companyName: "Emaar Properties" }, totalLeads: 15, createdAt: "2025-01-05T11:20:00Z", isActive: true },
  { _id: "5", name: { first_name: "Khalid", last_name: "Al Suwaidi" }, phone: { number: "521112222" }, email: "khalid@example.com", agentType: "FreelanceAgent", partnerId: null, totalLeads: 22, createdAt: "2024-12-01T08:00:00Z", isActive: true },
];

const getFullName = (a) => `${a.name?.first_name || ""} ${a.name?.last_name || ""}`.trim() || "Unknown";

const VaultAgents = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'freelance', 'affiliated'
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Pagination state (simulated for mock data)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
  });

  // Filter Data
  const filteredAgents = useMemo(() => {
    return mockAgents.filter(a => {
      const nameMatch = getFullName(a).toLowerCase().includes(search.toLowerCase());
      const emailMatch = (a.email || "").toLowerCase().includes(search.toLowerCase());
      const phoneMatch = (a.phone?.number || "").includes(search);
      
      const tabMatch = 
        activeTab === "all" ? true :
        activeTab === "freelance" ? a.agentType === "FreelanceAgent" :
        a.agentType === "PartnerAffiliatedAgent";

      return (nameMatch || emailMatch || phoneMatch) && tabMatch;
    }).map((a, i) => ({ ...a, key: a._id, sno: i + 1 }));
  }, [search, activeTab]);

  const handleSearch = (e) => setSearch(e.target.value);
  const handleClearSearch = () => setSearch("");

  const openViewDrawer = (record) => {
    setSelectedAgent(record);
    setDrawerOpen(true);
  };

  const getDropdownItems = (record) => [
    {
      key: 'view',
      icon: <FiEye style={{ color: THEME.primary, fontSize: 16 }} />,
      label: 'View Details',
      onClick: () => openViewDrawer(record),
    }
  ];

  // TABLE COLUMNS
  const columns = [
    {
      title: "Agent Name",
      width: 250,
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={45}
            icon={<UserOutlined />}
            style={{ background: `${THEME.primary}20`, color: THEME.primary, fontWeight: 'bold' }}
          >
            {r.name?.first_name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <div className="font-bold text-gray-800" style={{ fontSize: "14px" }}>
              {getFullName(r)}
            </div>
            <div className="text-xs text-gray-400">
              <MailOutlined /> {r.email || "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      width: 150,
      render: (_, r) => (
        <div className="text-sm text-gray-600">
          <PhoneOutlined /> +971 {r.phone?.number || "—"}
        </div>
      ),
    },
    {
      title: "Type",
      width: 140,
      render: (_, r) => (
        r.agentType === "FreelanceAgent" 
          ? <Tag color="blue">Freelance</Tag> 
          : <Tag color="purple">Affiliated</Tag>
      ),
    },
    {
      title: "Partner",
      width: 180,
      render: (_, r) => (
        <div className="text-sm text-gray-600">
          {r.partnerId?.companyName || "—"}
        </div>
      ),
    },
    {
      title: "Leads",
      width: 100,
      render: (_, r) => (
        <span className="font-semibold" style={{ color: THEME.primary }}>
          {r.totalLeads || 0}
        </span>
      ),
    },
    {
      title: "Status",
      width: 120,
      render: (_, r) => (
        r.isActive 
          ? <Tag color="success" icon={<CheckCircleOutlined />}>Active</Tag> 
          : <Tag color="error" icon={<StopOutlined />}>Suspended</Tag>
      ),
    },
    {
      title: "Actions",
      fixed: "right",
      width: 80,
      align: 'center',
      render: (_, r) => (
        <Dropdown menu={{ items: getDropdownItems(r) }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined style={{ fontSize: '20px' }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Agent Management</Title>
          <Text type="secondary">Manage freelance and affiliated agents on the Vault platform.</Text>
        </div>
      </div>

      {/* TABLE CARD */}
      <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        
        {/* SEGMENTED TABS & SEARCH */}
        <div className="flex flex-wrap items-center justify-between px-4 py-4 border-b border-gray-100 gap-4">
          <Segmented
            options={[
              { label: 'All Agents', value: 'all' },
              { label: 'Freelance', value: 'freelance' },
              { label: 'Affiliated', value: 'affiliated' },
            ]}
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val);
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
            className="custom-segmented-theme"
            size="large"
          />

          <div className="flex gap-3">
            <Input
              placeholder="Search by name, email or phone..."
              prefix={<FiSearch className="text-gray-400" />}
              value={search}
              onChange={handleSearch}
              allowClear
              onClear={handleClearSearch}
              style={{ width: 300, borderRadius: 8 }}
            />
            <Button icon={<FiRefreshCw />} onClick={() => setSearch("")}>
              Refresh
            </Button>
          </div>
        </div>

        {/* CUSTOM TABLE */}
        <div className="bg-white">
          <CustomTable
            columns={columns}
            data={filteredAgents}
            loading={false}
            totalItems={filteredAgents.length}
            currentPage={pagination.currentPage}
            onPageChange={(page, limit) => setPagination({ currentPage: page, itemsPerPage: limit })}
            scroll={{ x: 1000 }}
            showSearch={false}
          />
        </div>
      </Card>

      {/* RICH DRAWER VIEW */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
        title={null}
        styles={{ body: { padding: 0 } }}
      >
        {selectedAgent && (
          <div>
            {/* Purple banner */}
            <div style={{
              background: `linear-gradient(135deg, ${THEME.primary}, #9b59b6)`,
              padding: "32px 24px 60px",
            }}>
              <div className="flex flex-col items-center">
                <Avatar
                  size={80}
                  icon={<UserOutlined />}
                  style={{ border: "3px solid white", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", color: THEME.primary, background: "#fff", fontSize: "30px", fontWeight: "bold" }}
                >
                  {selectedAgent.name?.first_name?.charAt(0)?.toUpperCase()}
                </Avatar>
              </div>
            </div>

            {/* Floating name card */}
            <div style={{ padding: "0 24px", marginTop: -30 }}>
              <Card
                bordered={false}
                styles={{ body: { padding: "16px 20px", textAlign: "center" } }}
                style={{ borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
              >
                <Title level={4} style={{ margin: 0 }}>{getFullName(selectedAgent)}</Title>
                <Text type="secondary" style={{ fontSize: 13 }}>{selectedAgent.email}</Text>
                
                <div className="mt-3 flex justify-center gap-2">
                  <Tag color={selectedAgent.agentType === "FreelanceAgent" ? "blue" : "purple"}>
                    {selectedAgent.agentType === "FreelanceAgent" ? "Freelance" : "Partner Affiliated"}
                  </Tag>
                  {selectedAgent.isActive 
                    ? <Tag color="success" icon={<CheckCircleOutlined />}>Active</Tag>
                    : <Tag color="error" icon={<StopOutlined />}>Suspended</Tag>
                  }
                </div>
              </Card>
            </div>

            {/* Detail rows */}
            <div style={{ padding: "20px 24px" }}>
              <Text className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                Agent Details
              </Text>
              
              <div className="mt-4 space-y-4">
                {[
                  { icon: <MailOutlined />, label: "Email Address", value: selectedAgent.email || "—" },
                  { icon: <PhoneOutlined />, label: "Phone Number", value: `+971 ${selectedAgent.phone?.number || ''}` },
                  { icon: <BankOutlined />, label: "Associated Partner", value: selectedAgent.partnerId?.companyName || "Independent (None)" },
                  { icon: <TrophyOutlined />, label: "Total Leads", value: selectedAgent.totalLeads || 0 },
                  { icon: <CalendarOutlined />, label: "Joined Date", value: new Date(selectedAgent.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 mb-4">
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: `${THEME.primary}12`, color: THEME.primary,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, fontSize: 16,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">{item.label}</div>
                      <div className="text-sm font-medium text-gray-800 mt-0.5">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Divider style={{ margin: '24px 0' }} />

              {/* Action Buttons */}
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  block
                  danger={selectedAgent.isActive}
                  type={selectedAgent.isActive ? "default" : "primary"}
                  size="large"
                  style={!selectedAgent.isActive ? { background: THEME.primary, borderRadius: 10, fontWeight: 600 } : { borderRadius: 10, fontWeight: 600 }}
                  icon={selectedAgent.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
                >
                  {selectedAgent.isActive ? "Suspend Agent Access" : "Activate Agent Access"}
                </Button>
              </Space>

            </div>
          </div>
        )}
      </Drawer>

      {/* CUSTOM CSS FOR SEGMENTED THEME & UTILITIES */}
      <style>
{`
.custom-segmented-theme {
  background: #f3f4f6;
  padding: 4px;
  border-radius: 10px;
}

.custom-segmented-theme .ant-segmented-item-selected {
  background-color: #5c039b !important;
  color: #fff !important;
}

.custom-segmented-theme .ant-segmented-item-selected:hover {
  background-color: #5c039b !important;
}

.custom-segmented-theme .ant-segmented-item {
  border-radius: 8px;
  font-weight: 500;
}
`}
      </style>
    </div>
  );
};

export default VaultAgents;