import {
  Card,
  Typography,
  Tag,
  Button,
  Input,
  Row,
  Col,
  Statistic,
  Select,
  Space,
  Tabs,
} from "antd";
import {
  SearchOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { showToast } from "../../../manageApi/utils/toast";
import CustomTable from "./custom/CustomTable";

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_COLOR = {
  pending: "orange",
  approved: "green",
  rejected: "red",
};

export default function AdminPropertyListings() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [typeFilter, setTypeFilter] = useState(null);

  // ================= FETCH =================
  const fetchProperties = async () => {
  try {
    setLoading(true);

    const url = activeTab === "all"
      ? "/property/admin"
      : `/property/admin?status=${activeTab}`;

    const res = await apiService.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    // ✅ The array is directly in res.data
    const list = res.data || [];

    const mapped = list.map((p) => ({
      key: p._id,
      project: p.projectName || "Untitled",
      developer: p.developerName || "—",
      location: p.location || "—",
      type: p.unitType || "—",
      bedrooms: p.bedrooms || "—",
      price: p.price || 0,
      area: p.area || 0,
      status: (p.approvalStatus || "pending").toLowerCase().trim(),
      createdAt: p.createdAt,
    }));

    setProperties(mapped);
    setFiltered(mapped);
  } catch (err) {
    console.error(err);
    showToast("error", "Failed to fetch properties");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProperties();
  }, [activeTab]);

  // ================= FILTER =================
 useEffect(() => {
  let list = [...properties];

  // ✅ type filter
  if (typeFilter && typeFilter !== "all") {
    list = list.filter((p) => p.type === typeFilter);
  }

  // ✅ search filter
  if (search && search.trim() !== "") {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.project.toLowerCase().includes(q) ||
        p.developer.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }

  setFiltered(list);
}, [search, typeFilter, properties]);

  // ================= UPDATE STATUS =================
  const updateStatus = async (id, status) => {
    try {
      await apiService.put(
        `/property/status/${id}`,
        { approvalStatus: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      showToast("success", `Property ${status}`);
      fetchProperties();
    } catch (err) {
     
      showToast("error", "Failed to update status");
    }
  };

  // ================= STATS =================
  const stats = {
    total: properties.length,
    pending: properties.filter((p) => p.status === "pending").length,
    approved: properties.filter((p) => p.status === "approved").length,
    rejected: properties.filter((p) => p.status === "rejected").length,
  };

  // ================= TABLE =================
  const columns = [
    {
      title: "Property",
      render: (_, r) => (
        <div>
          <Text strong>{r.project}</Text>
          <br />
          <Text type="secondary">{r.location}</Text>
        </div>
      ),
    },
    {
      title: "Developer",
      dataIndex: "developer",
    },
    {
      title: "Type",
      render: (_, r) => (
        <>
          <Tag color="purple">{r.type}</Tag>
          <div style={{ fontSize: 12 }}>{r.bedrooms} BR</div>
        </>
      ),
    },
    {
      title: "Price (AED)",
      render: (_, r) => (
        <Text strong>
          AED {Number(r.price).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Status",
      render: (_, r) => (
        <Tag color={STATUS_COLOR[r.status]}>
          {r.status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      render: (_, r) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => updateStatus(r.key, "approved")}
          >
            Approve
          </Button>

          <Button
            danger
            size="small"
            onClick={() => updateStatus(r.key, "rejected")}
          >
            Reject
          </Button>

          <Button
            size="small"
            onClick={() =>
              navigate(`/dashboard/admin/properties/${r.key}`)
            }
          >
            Review
          </Button>
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: "all", label: `All (${stats.total})` },
    { key: "pending", label: `Moderation (${stats.pending})` },
    { key: "approved", label: `Published (${stats.approved})` },
    { key: "rejected", label: `Archived (${stats.rejected})` },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3}>Secondary Property Listings</Title>
          <Text type="secondary">
            Review and approve agent submitted properties
          </Text>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}><Card><Statistic title="Total" value={stats.total} prefix={<HomeOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Pending" value={stats.pending} valueStyle={{ color: "#d97706" }} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Approved" value={stats.approved} valueStyle={{ color: "#16a34a" }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Rejected" value={stats.rejected} valueStyle={{ color: "#dc2626" }} prefix={<CloseCircleOutlined />} /></Card></Col>
      </Row>

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col span={10}>
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined />}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>

          <Col span={6}>
            <Select
              placeholder="Property Type"
              allowClear
              style={{ width: "100%" }}
              onChange={(v) => setTypeFilter(v)}
            >
              <Option value="Apartment">Apartment</Option>
              <Option value="Villa">Villa</Option>
              <Option value="Townhouse">Townhouse</Option>
            </Select>
          </Col>

          <Col span={4}>
            <Button onClick={fetchProperties}>Refresh</Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

     <CustomTable
  columns={columns}
  data={filtered}                // ✅ use "data" instead of "dataSource"
  loading={loading}
  showSearch={false}             // ✅ disable internal search bar (you already have one)
  itemsPerPage={10}              // ✅ control rows per page
/>
      </Card>
    </div>
  );
}