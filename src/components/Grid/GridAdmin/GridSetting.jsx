import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  Tabs,
  Switch,
  Select,
  message,
  Spin,
  Row,
  Col,
  Divider,
  Typography,
  Table,
  Tag,
  Space,
  Modal,
  InputNumber,
  Popconfirm,
  Badge,
  Alert,
  Tooltip,
  DatePicker,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  BellOutlined,
  SettingOutlined,
  UploadOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  EyeOutlined,
  DollarOutlined,
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  MessageOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice"; // adjust path

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// --- Mock data (replace with API calls) ---
const initialUsers = {
  agents: [
    { id: 1, name: "John Smith", email: "john@agency.com", agency: "Premier RE", status: "active", rera: "R12345", profileComplete: true },
    { id: 2, name: "Sarah Johnson", email: "sarah@agency.com", agency: "Premier RE", status: "pending", rera: "R67890", profileComplete: false },
  ],
  agencies: [
    { id: 1, name: "Premier Real Estate", contact: "contact@premier.com", status: "active", subscription: "Pro", subscriptionCredits: 250 },
    { id: 2, name: "Luxury Homes Dubai", contact: "info@luxury.ae", status: "active", subscription: "Basic", subscriptionCredits: 50 },
  ],
  developers: [
    { id: 1, name: "Emaar Properties", licence: "DLD-001", contact: "developers@emaar.com", status: "active" },
    { id: 2, name: "Damac", licence: "DLD-002", contact: "partners@damac.ae", status: "active" },
  ],
  advisors: [
    { id: 1, name: "Alice Cooper", email: "alice@xoto.com", status: "active", leadsAssigned: 12, conversionRate: 32 },
    { id: 2, name: "Bob White", email: "bob@xoto.com", status: "active", leadsAssigned: 8, conversionRate: 45 },
  ],
  referralPartners: [
    { id: 1, name: "Mike Chen", phone: "+97150123456", leadsSubmitted: 5, commissionEarned: 1250, status: "active", idVerified: true },
    { id: 2, name: "Lisa Ray", phone: "+97150789456", leadsSubmitted: 2, commissionEarned: 500, status: "active", idVerified: false },
  ],
};

const initialCommission = {
  referralBase: 25,
  referralTiers: [
    { minLeads: 0, maxLeads: 10, percent: 25 },
    { minLeads: 11, maxLeads: 30, percent: 28 },
    { minLeads: 31, maxLeads: 100, percent: 30 },
  ],
  agencyDefaultSplit: 70, // agency gets 70%, Xoto 30%
  advisorSpecialIncentive: 5,
};

const initialDeals = [
  { id: 1, listingRef: "XOT-1001", agentName: "John Smith", clientName: "Ahmed R.", value: 1250000, commissionTotal: 37500, xotoShare: 11250, agentShare: 26250, status: "Confirmed" },
  { id: 2, listingRef: "DEV-2050", agentName: "Sarah Johnson", clientName: "Lina K.", value: 890000, commissionTotal: 26700, xotoShare: 8010, agentShare: 18690, status: "Pending" },
];

const initialListingsQueue = [
  { id: 1, propertyName: "Ocean Heights Apt", developer: "Emaar", submitter: "John Smith", submittedAt: "2025-04-10", status: "pending", type: "Off-Plan" },
  { id: 2, propertyName: "Downtown Villa", developer: "Damac", submitter: "Damac Dev", submittedAt: "2025-04-09", status: "pending", type: "Secondary" },
];

const initialFeatured = [
  { id: 1, name: "Burj Royale - 3BR", priority: 1, active: true },
  { id: 2, name: "Emaar Beachfront", priority: 2, active: true },
];

const initialBanners = [
  { id: 1, title: "Spring Sale", imageUrl: "/banner1.jpg", active: true, placement: "homepage" },
];

const initialAgreements = [
  { id: 1, partnerName: "Premier Real Estate", type: "Agency", signedDate: "2025-01-15", expiryDate: "2026-01-15", commissionSplit: 70, status: "active" },
  { id: 2, partnerName: "John Smith", type: "Agent", signedDate: "2025-02-01", expiryDate: "2026-02-01", commissionSplit: 70, status: "active" },
];

const initialEnquiries = [
  { id: 1, name: "Omar F.", phone: "+97150111222", listing: "Marina Gate 1BR", submittedAt: "2025-04-11T10:30:00", status: "new", assignedTo: null },
  { id: 2, name: "Nadia K.", phone: "+97150333444", listing: "Downtown 2BR", submittedAt: "2025-04-11T09:15:00", status: "new", assignedTo: null },
];

const initialSystemConfig = {
  aiRateLimitPerHour: 50,
  leadAssignmentMode: "performance_based",
  autoAssignHotLeads: true,
  whatsappBusinessNumber: "+971501234567",
  defaultOTPExpiry: 5,
  enableWhiteLabel: true,
};

// --- Main Component ---
const GridSetting = () => {
  // State for each section
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState(initialUsers);
  const [commission, setCommission] = useState(initialCommission);
  const [deals, setDeals] = useState(initialDeals);
  const [listingsQueue, setListingsQueue] = useState(initialListingsQueue);
  const [featured, setFeatured] = useState(initialFeatured);
  const [banners, setBanners] = useState(initialBanners);
  const [agreements, setAgreements] = useState(initialAgreements);
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [systemConfig, setSystemConfig] = useState(initialSystemConfig);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalData, setModalData] = useState({});
  const [adminProfile, setAdminProfile] = useState({ name: "Admin User", email: "admin@xoto.com", avatar: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // Simulate fetch profile
  useEffect(() => {
    // In real app: apiService.get("/admin/profile")
    setAdminProfile({ name: "Alex Johnson", email: "alex@xoto.com", avatar: "" });
  }, []);

  const showToast = (msg, type = "success") => {
    message[type](msg);
  };

  // --- User Management Handlers ---
  const handleApproveAgent = (id) => {
    setUsers(prev => ({
      ...prev,
      agents: prev.agents.map(a => a.id === id ? { ...a, status: "active" } : a)
    }));
    showToast("Agent approved");
  };

  const handleSuspendUser = (id, type) => {
    setUsers(prev => ({
      ...prev,
      [type]: prev[type].map(u => u.id === id ? { ...u, status: "suspended" } : u)
    }));
    showToast("User suspended");
  };

  // --- Commission Handlers ---
  const handleUpdateCommission = (field, value) => {
    setCommission(prev => ({ ...prev, [field]: value }));
    showToast("Commission rule updated");
  };

  const handleAddDeal = (deal) => {
    setDeals(prev => [{ ...deal, id: prev.length + 1, status: "Pending" }, ...prev]);
    showToast("Deal record created");
  };

  const handleUpdateDealStatus = (id, status) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    showToast(`Deal marked as ${status}`);
  };

  // --- Listing Approval ---
  const handleApproveListing = (id) => {
    setListingsQueue(prev => prev.filter(l => l.id !== id));
    showToast("Listing approved and published");
  };

  const handleRejectListing = (id, reason) => {
    Modal.confirm({
      title: "Rejection Reason",
      content: <Input.TextArea placeholder="Provide reason for rejection..." rows={3} id="rejectReason" />,
      onOk: () => {
        const reason = document.getElementById("rejectReason")?.value;
        setListingsQueue(prev => prev.filter(l => l.id !== id));
        showToast(`Listing rejected: ${reason || "No reason provided"}`, "error");
      }
    });
  };

  // --- Content Management ---
  const handleAddFeatured = () => {
    const newName = prompt("Property name:");
    if (newName) {
      setFeatured(prev => [...prev, { id: Date.now(), name: newName, priority: prev.length + 1, active: true }]);
      showToast("Featured property added");
    }
  };

  const handleToggleFeatured = (id) => {
    setFeatured(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f));
  };

  // --- Agreements ---
  const handleExtendAgreement = (id) => {
    Modal.confirm({
      title: "Extend Agreement",
      content: <DatePicker placeholder="New expiry date" style={{ width: "100%" }} />,
      onOk: (date) => {
        if (date) {
          setAgreements(prev => prev.map(a => a.id === id ? { ...a, expiryDate: date.format("YYYY-MM-DD") } : a));
          showToast("Agreement extended");
        }
      }
    });
  };

  // --- Enquiry Handling ---
  const handleAssignEnquiry = (id, advisorName) => {
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: "assigned", assignedTo: advisorName } : e));
    showToast(`Enquiry assigned to ${advisorName}`);
  };

  // --- System Config ---
  const handleSaveSystemConfig = () => {
    // In real app, call API
    showToast("System configuration saved");
  };

  // --- Profile Update (for admin self) ---
  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      // await apiService.put("/admin/profile", values);
      setAdminProfile(prev => ({ ...prev, ...values }));
      showToast("Profile updated");
    } catch (err) {
      showToast("Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setLoading(true);
    try {
      // await apiService.put("/admin/change-password", values);
      showToast("Password changed");
    } catch (err) {
      showToast("Password change failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // Table columns for users, deals, etc.
  const agentColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Agency", dataIndex: "agency", key: "agency" },
    { title: "RERA", dataIndex: "rera", key: "rera" },
    { title: "Status", dataIndex: "status", key: "status", render: (s) => <Tag color={s === "active" ? "green" : "orange"}>{s}</Tag> },
    { title: "Actions", key: "actions", render: (_, rec) => (
        <Space>
          {rec.status !== "active" && <Button size="small" type="link" onClick={() => handleApproveAgent(rec.id)}>Approve</Button>}
          <Button size="small" danger type="link" onClick={() => handleSuspendUser(rec.id, "agents")}>Suspend</Button>
        </Space>
      ) }
  ];

  const dealColumns = [
    { title: "Listing Ref", dataIndex: "listingRef" },
    { title: "Agent", dataIndex: "agentName" },
    { title: "Client", dataIndex: "clientName" },
    { title: "Value (AED)", dataIndex: "value", render: (v) => v.toLocaleString() },
    { title: "Xoto Share", dataIndex: "xotoShare", render: (v) => `AED ${v.toLocaleString()}` },
    { title: "Status", dataIndex: "status", render: (s) => <Tag color={s === "Confirmed" ? "green" : s === "Paid" ? "blue" : "gold"}>{s}</Tag> },
    { title: "Actions", render: (_, rec) => (
        <Space>
          {rec.status === "Pending" && <Button size="small" onClick={() => handleUpdateDealStatus(rec.id, "Confirmed")}>Confirm</Button>}
          {rec.status === "Confirmed" && <Button size="small" onClick={() => handleUpdateDealStatus(rec.id, "Paid")}>Mark Paid</Button>}
        </Space>
      ) }
  ];

  const enquiryColumns = [
    { title: "Name", dataIndex: "name" },
    { title: "Phone", dataIndex: "phone" },
    { title: "Listing", dataIndex: "listing" },
    { title: "Submitted", dataIndex: "submittedAt", render: (d) => new Date(d).toLocaleString() },
    { title: "Status", dataIndex: "status", render: (s) => <Badge status={s === "new" ? "processing" : "success"} text={s} /> },
    { title: "Actions", render: (_, rec) => (
        rec.status === "new" ? (
          <Select placeholder="Assign to Advisor" style={{ width: 150 }} onChange={(val) => handleAssignEnquiry(rec.id, val)}>
            {users.advisors.map(adv => <Option key={adv.id} value={adv.name}>{adv.name}</Option>)}
          </Select>
        ) : <Tag>{rec.assignedTo}</Tag>
      ) }
  ];

  return (
    <div style={{ padding: "28px 24px", background: "#F4F0FA", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ color: "#5C039B", marginBottom: 4 }}>
              <SettingOutlined /> GRID Admin Settings
            </Title>
            <Text type="secondary">Full platform control – users, commissions, listings, and system configuration</Text>
          </div>
          <div>
            <Avatar src={adminProfile.avatar} icon={<UserOutlined />} style={{ marginRight: 8 }} />
            <Text strong>{adminProfile.name}</Text>
          </div>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #ede9f6" }}>
          {/* ========== USER MANAGEMENT TAB ========== */}
          <Tabs.TabPane tab={<span><TeamOutlined /> User Management</span>} key="users">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Card title="Licensed Agents" extra={<Button icon={<PlusOutlined />} onClick={() => { setModalType("addAgent"); setModalVisible(true); }}>Add Agent</Button>}>
                <Table dataSource={users.agents} columns={agentColumns} rowKey="id" pagination={false} />
              </Card>
              <Card title="Agencies" extra={<Button icon={<PlusOutlined />}>Add Agency</Button>}>
                <Table dataSource={users.agencies} columns={[
                  { title: "Name", dataIndex: "name" }, { title: "Contact", dataIndex: "contact" },
                  { title: "Plan", dataIndex: "subscription" }, { title: "Credits", dataIndex: "subscriptionCredits" },
                  { title: "Status", dataIndex: "status", render: (s) => <Tag color={s === "active" ? "green" : "red"}>{s}</Tag> },
                ]} rowKey="id" pagination={false} />
              </Card>
              <Card title="Developers" extra={<Button icon={<PlusOutlined />}>Add Developer</Button>}>
                <Table dataSource={users.developers} columns={[
                  { title: "Name", dataIndex: "name" }, { title: "Licence", dataIndex: "licence" },
                  { title: "Contact", dataIndex: "contact" }, { title: "Status", dataIndex: "status", render: (s) => <Tag color="green">{s}</Tag> },
                ]} rowKey="id" pagination={false} />
              </Card>
              <Card title="Xoto Advisors (Internal)">
                <Table dataSource={users.advisors} columns={[
                  { title: "Name", dataIndex: "name" }, { title: "Email", dataIndex: "email" },
                  { title: "Leads Assigned", dataIndex: "leadsAssigned" }, { title: "Conversion %", dataIndex: "conversionRate" },
                ]} rowKey="id" pagination={false} />
              </Card>
              <Card title="Referral Partners">
                <Table dataSource={users.referralPartners} columns={[
                  { title: "Name", dataIndex: "name" }, { title: "Phone", dataIndex: "phone" },
                  { title: "Leads", dataIndex: "leadsSubmitted" }, { title: "Commission Earned", dataIndex: "commissionEarned", render: (v) => `$${v}` },
                  { title: "ID Verified", dataIndex: "idVerified", render: (v) => v ? <CheckOutlined style={{ color: "green" }} /> : <CloseOutlined style={{ color: "red" }} /> },
                ]} rowKey="id" pagination={false} />
              </Card>
            </Space>
          </Tabs.TabPane>

          {/* ========== COMMISSION & DEALS TAB ========== */}
          <Tabs.TabPane tab={<span><DollarOutlined /> Commission & Deals</span>} key="commission">
            <Row gutter={24}>
              <Col span={12}>
                <Card title="Commission Rules">
                  <Form layout="vertical">
                    <Form.Item label="Referral Partner Base (%)">
                      <InputNumber min={0} max={100} value={commission.referralBase} onChange={(v) => handleUpdateCommission("referralBase", v)} />
                    </Form.Item>
                    <Form.Item label="Agency Default Split (Agency %)">
                      <InputNumber min={0} max={100} value={commission.agencyDefaultSplit} onChange={(v) => handleUpdateCommission("agencyDefaultSplit", v)} />
                    </Form.Item>
                    <Form.Item label="Top Advisor Bonus (%)">
                      <InputNumber min={0} max={100} value={commission.advisorSpecialIncentive} onChange={(v) => handleUpdateCommission("advisorSpecialIncentive", v)} />
                    </Form.Item>
                    <Divider>Referral Tiers</Divider>
                    {commission.referralTiers.map((tier, idx) => (
                      <div key={idx} style={{ marginBottom: 8 }}>Leads {tier.minLeads}-{tier.maxLeads}: {tier.percent}%</div>
                    ))}
                  </Form>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Deal Records" extra={<Button icon={<PlusOutlined />} onClick={() => { setModalType("addDeal"); setModalVisible(true); }}>Record New Deal</Button>}>
                  <Table dataSource={deals} columns={dealColumns} rowKey="id" pagination={false} />
                </Card>
              </Col>
            </Row>
          </Tabs.TabPane>

          {/* ========== LISTING APPROVAL QUEUE TAB ========== */}
          <Tabs.TabPane tab={<span><HomeOutlined /> Listing Approval</span>} key="listings">
            <Card title="Pending Listings">
              {listingsQueue.length === 0 ? <Alert message="No pending listings" type="info" /> : (
                <Table dataSource={listingsQueue} columns={[
                  { title: "Property", dataIndex: "propertyName" }, { title: "Developer", dataIndex: "developer" },
                  { title: "Submitter", dataIndex: "submitter" }, { title: "Type", dataIndex: "type" },
                  { title: "Submitted", dataIndex: "submittedAt" },
                  { title: "Actions", render: (_, rec) => (
                      <Space>
                        <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleApproveListing(rec.id)}>Approve</Button>
                        <Button danger size="small" icon={<CloseOutlined />} onClick={() => handleRejectListing(rec.id)}>Reject</Button>
                        <Button size="small">Request Changes</Button>
                      </Space>
                    ) }
                ]} rowKey="id" pagination={false} />
              )}
            </Card>
            <Card title="Quick Create Listing (Admin)" style={{ marginTop: 24 }}>
              <Button icon={<PlusOutlined />} onClick={() => showToast("Create listing form would open")}>Create New Listing</Button>
            </Card>
          </Tabs.TabPane>

          {/* ========== CONTENT MANAGEMENT TAB ========== */}
          <Tabs.TabPane tab={<span><FileTextOutlined /> Content Management</span>} key="content">
            <Row gutter={24}>
              <Col span={12}>
                <Card title="Featured Properties" extra={<Button icon={<PlusOutlined />} onClick={handleAddFeatured}>Add</Button>}>
                  {featured.map(f => (
                    <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span>{f.name} (Priority {f.priority})</span>
                      <Space>
                        <Switch checked={f.active} onChange={() => handleToggleFeatured(f.id)} />
                        <Button size="small" danger icon={<DeleteOutlined />} />
                      </Space>
                    </div>
                  ))}
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Homepage Banners" extra={<Button icon={<PlusOutlined />}>New Banner</Button>}>
                  {banners.map(b => (
                    <div key={b.id} style={{ marginBottom: 12 }}>{b.title} - {b.placement} <Button size="small" icon={<EditOutlined />} style={{ marginLeft: 8 }}>Edit</Button></div>
                  ))}
                </Card>
              </Col>
            </Row>
            <Card title="Bulk Property Management" style={{ marginTop: 24 }}>
              <Text>Admin can edit any property – changes trigger re-approval workflow.</Text>
              <Button style={{ marginTop: 12 }}>Manage All Properties</Button>
            </Card>
          </Tabs.TabPane>

          {/* ========== AGREEMENTS TAB ========== */}
          <Tabs.TabPane tab={<span><FileTextOutlined /> Agreements</span>} key="agreements">
            <Card title="Partner Agreements">
              <Table dataSource={agreements} columns={[
                { title: "Partner", dataIndex: "partnerName" }, { title: "Type", dataIndex: "type" },
                { title: "Signed", dataIndex: "signedDate" }, { title: "Expiry", dataIndex: "expiryDate", render: (d) => <span style={{ color: new Date(d) < new Date() ? "red" : "inherit" }}>{d}</span> },
                { title: "Split", dataIndex: "commissionSplit", render: (v) => `${v}%` },
                { title: "Actions", render: (_, rec) => <Button size="small" onClick={() => handleExtendAgreement(rec.id)}>Extend</Button> }
              ]} rowKey="id" pagination={false} />
            </Card>
            <Alert message="⚠️ Expiring soon: Premier Real Estate expires 2026-01-15" type="warning" style={{ marginTop: 16 }} />
          </Tabs.TabPane>

          {/* ========== ENQUIRY QUEUE TAB ========== */}
          <Tabs.TabPane tab={<span><MessageOutlined /> Enquiry Queue</span>} key="enquiries">
            <Card title="Public Enquiries (Admin Assignment)">
              <Table dataSource={enquiries} columns={enquiryColumns} rowKey="id" />
            </Card>
            <Card title="Bulk Lead Import" style={{ marginTop: 24 }}>
              <Upload beforeUpload={() => false} accept=".csv,.xlsx">
                <Button icon={<UploadOutlined />}>Upload CSV / Excel</Button>
              </Upload>
              <Text type="secondary" style={{ marginLeft: 12 }}>Template: name, phone, listing_ref, notes</Text>
            </Card>
          </Tabs.TabPane>

          {/* ========== SYSTEM CONFIGURATION TAB ========== */}
          <Tabs.TabPane tab={<span><ApiOutlined /> System Config</span>} key="system">
            <Row gutter={24}>
              <Col span={12}>
                <Card title="AI & Limits">
                  <Form layout="vertical" initialValues={systemConfig}>
                    <Form.Item label="AI Presentations Rate Limit (per hour)" name="aiRateLimitPerHour">
                      <InputNumber min={1} max={500} style={{ width: "100%" }} onChange={(v) => setSystemConfig(prev => ({ ...prev, aiRateLimitPerHour: v }))} />
                    </Form.Item>
                    <Form.Item label="WhatsApp Business Number" name="whatsappBusinessNumber">
                      <Input onChange={(e) => setSystemConfig(prev => ({ ...prev, whatsappBusinessNumber: e.target.value }))} />
                    </Form.Item>
                    <Form.Item label="Default OTP Expiry (minutes)" name="defaultOTPExpiry">
                      <InputNumber min={1} max={30} onChange={(v) => setSystemConfig(prev => ({ ...prev, defaultOTPExpiry: v }))} />
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Lead Assignment Rules">
                  <Form layout="vertical">
                    <Form.Item label="Assignment Mode">
                      <Select value={systemConfig.leadAssignmentMode} onChange={(v) => setSystemConfig(prev => ({ ...prev, leadAssignmentMode: v }))}>
                        <Option value="performance_based">Performance Based (Leaderboard)</Option>
                        <Option value="round_robin">Round Robin</Option>
                        <Option value="manual_only">Manual Admin Only</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item label="Auto-assign Hot Leads">
                      <Switch checked={systemConfig.autoAssignHotLeads} onChange={(v) => setSystemConfig(prev => ({ ...prev, autoAssignHotLeads: v }))} />
                    </Form.Item>
                    <Form.Item label="Enable White-label for Agencies">
                      <Switch checked={systemConfig.enableWhiteLabel} onChange={(v) => setSystemConfig(prev => ({ ...prev, enableWhiteLabel: v }))} />
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
            </Row>
            <Card style={{ marginTop: 24 }}>
              <Button type="primary" onClick={handleSaveSystemConfig} loading={loading}>Save All System Settings</Button>
              <Button style={{ marginLeft: 12 }}>Download Audit Log (Last 30 days)</Button>
            </Card>
          </Tabs.TabPane>
        </Tabs>

        {/* Modal for adding records */}
        <Modal
          title={modalType === "addAgent" ? "Add New Agent" : "Record New Deal"}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          {modalType === "addAgent" && (
            <Form onFinish={(vals) => { setUsers(prev => ({ ...prev, agents: [...prev.agents, { id: Date.now(), ...vals, status: "pending" }] })); setModalVisible(false); showToast("Agent added"); }}>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="agency" label="Agency"><Input /></Form.Item>
              <Form.Item name="rera" label="RERA Card"><Input /></Form.Item>
              <Button htmlType="submit" type="primary">Save</Button>
            </Form>
          )}
          {modalType === "addDeal" && (
            <Form onFinish={(vals) => { handleAddDeal(vals); setModalVisible(false); }}>
              <Form.Item name="listingRef" label="Listing Ref"><Input /></Form.Item>
              <Form.Item name="agentName" label="Agent Name"><Input /></Form.Item>
              <Form.Item name="clientName" label="Client Name"><Input /></Form.Item>
              <Form.Item name="value" label="Transaction Value (AED)"><InputNumber style={{ width: "100%" }} /></Form.Item>
              <Button htmlType="submit" type="primary">Create Deal Record</Button>
            </Form>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default GridSetting;