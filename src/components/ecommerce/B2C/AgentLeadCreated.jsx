import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card, Typography, Input, Button, Tag, Tooltip, message,
  Tabs, Modal, Form, Select, InputNumber, Row, Col,
  AutoComplete, Space, Statistic, Divider, Avatar
} from "antd";
import {
  SearchOutlined, EditOutlined, DeleteOutlined,
  CheckCircleOutlined, EyeOutlined, TrophyOutlined,
  TeamOutlined, UserOutlined, FireOutlined, UserAddOutlined,
  MailOutlined, PhoneOutlined, DollarOutlined 
} from "@ant-design/icons";
import CustomTable from "../../CMS/pages/custom/CustomTable";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { showConfirmDialog, showSuccessAlert, showErrorAlert } from "../../../manageApi/utils/sweetAlert";

const { Title, Text } = Typography;
const { Option } = Select;

const PIPELINE_STATUSES = [
  { key: "all", label: "All Leads" },
  { key: "customer", label: "Customer" },
  { key: "lead", label: "Lead" },
  { key: "visit", label: "Site Visit" },
  { key: "deal", label: "Deal" },
  { key: "booking", label: "Booking" },
  { key: "closed", label: "Closed" },
  { key: "lost", label: "Lost" }
];

export default function AgentLeadDashboard() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // States
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, customers: 0, activeLeads: 0 });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);

  // ================= FETCH DATA =================
  const fetchLeads = async (page = 1, limit = 10, status = activeTab, search = searchQuery) => {
    setLoading(true);
    try {
      // Backend automatically gets Agent ID from Token
      let url = `/agent/lead/get-all-leads?page=${page}&limit=${limit}`;
      if (status !== "all") url += `&status=${status}`;
      if (search) url += `&search=${search}`;

      const response = await apiService.get(url);
      const list = response?.data || [];
      
      setLeads(list);
      setPagination({
        currentPage: response?.pagination?.currentPage || page,
        totalPages: response?.pagination?.totalPages || 1,
        totalResults: response?.pagination?.totalItems || 0,
        itemsPerPage: limit,
      });

      // Update Stats based on full counts if available, otherwise use pagination total
      if (status === "all") {
        setStats(prev => ({
          ...prev,
          total: response?.pagination?.totalItems || 0,
        }));
      }
    } catch (err) {
      message.error("Failed to fetch pipeline data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await apiService.get("/property/get-all-properties?limit=1000");
      setProjects(res?.data?.data || res?.data || []);
    } catch (error) {
      console.error("Projects fetch failed");
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchLeads();
  }, []);

  // ================= HANDLERS =================
  const handleTabChange = (key) => {
    setActiveTab(key);
    fetchLeads(1, pagination.itemsPerPage, key, searchQuery);
  };

  const handlePageChange = (page, pageSize) => {
    fetchLeads(page, pageSize, activeTab, searchQuery);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchLeads(1, pagination.itemsPerPage, activeTab, val);
  };

  const updateLeadStatus = async (id, status) => {
    try {
      await apiService.post(`/agent/lead/update-status/${id}`, { status });
      message.success(`Moved to ${status}`);
      fetchLeads(pagination.currentPage, pagination.itemsPerPage, activeTab, searchQuery);
    } catch (error) {
      message.error("Update failed");
    }
  };

  const deleteLead = async (id) => {
    const result = await showConfirmDialog('Remove Lead', 'Permanently delete this lead?', 'Delete');
    if (result.isConfirmed) {
      try {
        await apiService.delete(`/agent/lead/delete-lead/${id}`);
        showSuccessAlert('Deleted', 'Lead removed.');
        fetchLeads(pagination.currentPage, pagination.itemsPerPage, activeTab, searchQuery);
      } catch (err) {
        showErrorAlert('Error', 'Failed to delete.');
      }
    }
  };

  // ================= FORM LOGIC =================
  const handleEditClick = (item) => {
    setSelectedLead(item);
    form.setFieldsValue({
      first_name: item?.customer?.name?.first_name,
      last_name: item?.customer?.name?.last_name,
      email: item?.customer?.email,
      phone_number: item?.customer?.mobile?.number,
      budget_max: item?.budget?.max,
      property_type: item?.property_type?.[0], // Assuming single select in UI
      status: item?.status,
      requirement_description: item?.requirement_description
    });
    setIsModalOpen(true);
  };

  const onFormFinish = async (values) => {
    setFormLoading(true);
    try {
      const payload = {
        name: { first_name: values.first_name, last_name: values.last_name },
        email: values.email,
        phone_number: values.phone_number,
        budget: { min: 0, max: values.budget_max },
        property_type: [values.property_type],
        status: values.status,
        requirement_description: values.requirement_description
      };

      if (selectedLead?._id) {
        await apiService.post(`/agent/lead/update-lead/${selectedLead._id}`, payload);
        message.success("Updated!");
      } else {
        await apiService.post("/agent/lead/create-lead", payload);
        message.success("Lead Created!");
      }

      setIsModalOpen(false);
      fetchLeads(pagination.currentPage, pagination.itemsPerPage, activeTab, searchQuery);
    } catch (error) {
      message.error("Operation failed");
    } finally {
      setFormLoading(false);
    }
  };

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      key: "applicant",
      title: "Client Profile",
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} className="bg-indigo-100 text-indigo-600 font-bold">
            {item?.customer?.name?.first_name?.charAt(0) || 'U'}
          </Avatar>
          <div>
            <Text strong className="block">{`${item?.customer?.name?.first_name || ""} ${item?.customer?.name?.last_name || ""}`}</Text>
            <Text type="secondary" className="text-xs"><MailOutlined /> {item?.customer?.email || '--'}</Text>
          </div>
        </div>
      ),
    },
 {
  key: "contact",
  title: "Contact",
  render: (_, item) => {
    const countryCode = item?.customer?.mobile?.country_code;
    const number = item?.customer?.mobile?.number;

    return (
      <Text className="text-gray-600">
        <PhoneOutlined className="mr-1.5 text-gray-400" />
        {countryCode && number
          ? `${countryCode} ${number}`
          : "--"}
      </Text>
    );
  },
},
    {
      key: "budget",
      title: "Budget (AED)",
      render: (_, item) => (
        <Text strong className="text-emerald-600">
          <DollarOutlined /> {item?.budget?.max?.toLocaleString() || "N/A"}
        </Text>
      ),
    },
    {
      key: "status",
      title: "Stage",
      render: (_, item) => {
        const colors = { customer: "cyan", lead: "gold", visit: "blue", deal: "purple", booking: "magenta", closed: "success", lost: "error" };
        return <Tag color={colors[item.status] || "default"} className="rounded-full">{item.status.toUpperCase()}</Tag>;
      },
    },
    {
      key: "actions",
      title: "Actions",
      align: "right",
      render: (_, item) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`../lead-details/${item._id}`)} />
          </Tooltip>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEditClick(item)} />
          <Button danger type="text" icon={<DeleteOutlined />} onClick={() => deleteLead(item._id)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-[#f6f7fb] min-h-screen">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl mb-6 shadow-sm">
        <div>
          <Title level={2} className="!mb-0"><TeamOutlined className="text-indigo-600" /> Pipeline</Title>
        </div>
        {/* <div className="flex gap-3">
          <Input 
            prefix={<SearchOutlined />} 
            placeholder="Search leads..." 
            className="w-64 rounded-xl"
            onChange={handleSearch}
            allowClear
          />
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => { setSelectedLead(null); form.resetFields(); setIsModalOpen(true); }} className="bg-indigo-600 rounded-xl">
            Add Client
          </Button>
        </div> */}
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col span={8}><Card><Statistic title="Total Pipeline" value={stats.total} /></Card></Col>
      </Row>

      <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          className="custom-pro-tabs"
          items={PIPELINE_STATUSES.map(s => ({
            key: s.key,
            label: s.label,
            children: (
              <CustomTable 
                columns={columns} 
                data={leads} 
                totalItems={pagination.totalResults}
                currentPage={pagination.currentPage}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={handlePageChange}
                loading={loading} 
              />
            )
          }))}
        />
      </Card>

      <Modal 
        title={selectedLead ? "Edit Client" : "New Client"} 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        footer={null} 
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={onFormFinish} className="mt-4">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="first_name" label="First Name" rules={[{required: true}]}><Input className="rounded-lg" /></Form.Item></Col>
            <Col span={12}><Form.Item name="last_name" label="Last Name" rules={[{required: true}]}><Input className="rounded-lg" /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone_number" label="Phone" rules={[{required: true}]}><Input className="rounded-lg" /></Form.Item></Col>
            <Col span={12}><Form.Item name="email" label="Email"><Input className="rounded-lg" /></Form.Item></Col>
            <Col span={12}><Form.Item name="budget_max" label="Budget (Max)"><InputNumber className="w-full rounded-lg" /></Form.Item></Col>
            <Col span={12}>
                <Form.Item name="status" label="Stage">
                    <Select className="rounded-lg">
                        {PIPELINE_STATUSES.filter(x => x.key !== 'all').map(x => <Option key={x.key} value={x.key}>{x.label}</Option>)}
                    </Select>
                </Form.Item>
            </Col>
          </Row>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={formLoading} className="bg-indigo-600">Save</Button>
          </div>
        </Form>
      </Modal>

      <style>{`
        .custom-pro-tabs .ant-tabs-nav { background: #fafafa; padding: 10px 10px 0; margin: 0 !important; }
        .custom-pro-tabs .ant-tabs-tab-active { background: white !important; border-top: 2px solid #4f46e5 !important; }
      `}</style>
    </div>
  );
}