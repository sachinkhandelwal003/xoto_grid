import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Routing ke liye add kiya hai
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { useSelector } from "react-redux";
import { Card, Typography, Avatar, Row, Col, Space, message, Tag } from "antd";
import {
  EnvironmentOutlined, TeamOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ApartmentOutlined, MailOutlined, PhoneOutlined, EyeOutlined
} from "@ant-design/icons";
import CustomTable from "../../../components/CMS/pages/custom/CustomTable";

const { Title, Text } = Typography;

const DeveloperList = () => {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate(); // ✅ Hook initialize kiya

  // ✅ Sirf list aur table ke states yahan bache hain
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  // ✅ FETCH DEVELOPERS LIST
  const fetchDevelopers = async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    try {
      const resData = await apiService.get("/developer/get-all-developers", {
        page, limit, search: search || undefined
      });
      const rawList = resData?.data || resData || [];
      setDevelopers(Array.isArray(rawList) ? rawList : []);
      const count = resData?.pagination?.totalItems || resData?.total || 0;
      setTotal(count);
    } catch (err) {
      message.error("Failed to load developers list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchDevelopers(currentPage, pageSize, searchText);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [currentPage, pageSize, searchText]);

  // ✅ TABLE HANDLERS
  const handleTableFilter = (filters) => {
    setSearchText(filters.search || '');
    setCurrentPage(1);
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // ✅ STATS CALCULATION
  const verifiedDevs = developers.filter(d => d.isVerifiedByAdmin).length;
  const unverifiedDevs = developers.filter(d => !d.isVerifiedByAdmin).length;

  const stats = [
    { title: "Total Developers", value: total || 0, icon: <TeamOutlined />, color: "#2563eb", bg: "#dbeafe" },
    { title: "Verified Developers", value: verifiedDevs, icon: <CheckCircleOutlined />, color: "#059669", bg: "#d1fae5" },
    { title: "Unverified Developers", value: unverifiedDevs, icon: <ClockCircleOutlined />, color: "#d97706", bg: "#fef3c7" },
  ];

  const getKycStatusColor = (status) => {
    if (status === "approved") return "green";
    if (status === "rejected") return "red";
    return "orange";
  };

  // ✅ TABLE COLUMNS
  const tableColumns = [
    {
      title: "Developer",
      key: "name",
      sortable: true,
      render: (value, record) => (
        <Space size="middle">
          <Avatar
            size={42}
            src={record.logo}
            style={{ backgroundColor: "#f3e8ff", color: "#5c039b", fontWeight: "bold", borderRadius: "8px" }}
            icon={!record.logo && !record.name && <ApartmentOutlined />}
          >
            {!record.logo && record.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong style={{ fontSize: "14px", color: "#1f2937" }}>{record.name || "Unnamed Developer"}</Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>RERA: {record.reraNumber || "N/A"}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact Info",
      key: "email",
      sortable: true,
      render: (value, record) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: "13px" }}>
            <MailOutlined style={{ color: "#6b7280", marginRight: "6px" }} />{record.email}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            <PhoneOutlined style={{ color: "#6b7280", marginRight: "6px" }} />
            {record.country_code} {record.phone_number}
          </Text>
        </Space>
      ),
    },
    {
      title: "Location",
      key: "city",
      sortable: true,
      render: (value, record) => (
        <Space>
          <EnvironmentOutlined style={{ color: "#9ca3af" }} />
          <Text>{record.city ? `${record.city}, ${record.country || ''}` : 'N/A'}</Text>
        </Space>
      ),
    },
    {
      title: "KYC Status",
      key: "kycStatus",
      sortable: true,
      render: (value, record) => (
        <Tag color={getKycStatusColor(record.kycStatus)} style={{ borderRadius: "20px", padding: "2px 10px" }}>
          {record.kycStatus?.toUpperCase() || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Account Status",
      key: "accountStatus",
      sortable: true,
      render: (value, record) => (
        <Tag color={record.accountStatus === "active" ? "green" : "red"} style={{ borderRadius: "20px", padding: "2px 10px" }}>
          {record.accountStatus === "active" ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (value, record) => (
       <button
  onClick={() => {
    // Ye line automatically aapke current path (/dashboard/admin ya jo bhi ho) ko detect karegi
    const currentPath = window.location.pathname; 
    const newPath = currentPath.replace('developer-list', `developer/view/${record._id || record.id}`);
    navigate(newPath);
  }}
  title="View Profile"
  style={{
    background: "#f3e8ff", border: "none", borderRadius: "8px",
    padding: "8px 10px", cursor: "pointer", color: "#5c039b",
    display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600"
  }}
>
  <EyeOutlined style={{ fontSize: "15px" }} /> View
</button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ padding: "10px", background: "#f3e8ff", borderRadius: "10px", color: "#5c039b" }}>
          <ApartmentOutlined style={{ fontSize: "24px" }} />
        </div>
        <div>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>Developer Management</Title>
          <Text type="secondary" style={{ fontSize: "15px" }}>Verify, approve, and monitor all property developers on the platform.</Text>
        </div>
      </div>

      {/* QUICK STATS */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card bordered={false} style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} bodyStyle={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: stat.bg, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                  {stat.icon}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: "13px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.title}</Text>
                  <Title level={2} style={{ margin: "4px 0 0 0", color: "#1f2937" }}>{stat.value}</Title>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* CUSTOM TABLE */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ padding: "20px 0 12px 0" }}>
          <Title level={5} style={{ margin: 0, color: "#374151" }}>Registered Developers Directory</Title>
        </div>
        <CustomTable
          columns={tableColumns}
          data={developers}
          totalItems={total}
          currentPage={currentPage}
          itemsPerPage={pageSize}
          onPageChange={handlePageChange}
          onFilter={handleTableFilter}
          loading={loading}
          showSearch={true}
        />
      </div>
    </div>
  );
};

export default DeveloperList;