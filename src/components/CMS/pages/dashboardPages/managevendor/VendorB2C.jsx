// src/pages/admin/VendorB2C.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiEye, FiCheck, FiX, FiSlash, FiRotateCcw } from "react-icons/fi";
import { 
  Button, Card, Tabs, Tag, Space, Typography, 
  Badge, Avatar, Tooltip, Popconfirm 
} from "antd";
import {
  UserOutlined, ShopOutlined, PhoneOutlined, MailOutlined,
  ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined,
  StopOutlined
} from "@ant-design/icons";
import CustomTable from "../../custom/CustomTable";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";
import { showToast } from "../../../../../manageApi/utils/toast";

const { Title, Text } = Typography;

const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  suspended: "#eb2f96",
  bgLight: "#f9f0ff",
};

const roleSlugMap = {
  '0': 'superadmin', '1': 'admin', '2': "customer",
  '5': 'vendor-b2c', '6': 'vendor-b2b', '7': 'freelancer',
  '11': 'accountant', '12': 'supervisor',
};



const VendorB2C = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "dashboard";

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("approved"); 
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState({ total: 0, registered: 0, approved: 0, rejected: 0, suspended: 0 });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });

  const fetchVendors = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const statusValue = activeTab === "pending" ? "registered" : activeTab;

      const res = await apiService.get("vendor", {
        page,
        limit,
        status: statusValue, 
      });

      const data = (res.vendors || []).map((v, i) => ({
        ...v,
        key: v._id,
        sno: (page - 1) * limit + i + 1,
        full_name: `${v.name?.first_name || ""} ${v.name?.last_name || ""}`.trim(),
        mobile_str: v.mobile ? `${v.mobile.country_code} ${v.mobile.number}` : "—",
        store_name: v.store_details?.store_name || "—",
        created_at: v.meta?.created_at || v.createdAt,
      }));

      setVendors(data);
      setPagination({
        currentPage: res.pagination?.current_page || 1,
        totalPages: res.pagination?.total_pages || 1,
        totalResults: res.pagination?.total_vendors || 0,
        itemsPerPage: res.pagination?.limit || 10,
      });

      if (res.stats) {
        setStats({
          total: res.stats.total || 0,
          registered: res.stats.registered || 0,
          approved: res.stats.approved || 0,
          rejected: res.stats.rejected || 0,
          suspended: res.stats.suspended || 0,
        });
      }
    } catch (err) {
      showToast("Failed to load vendors", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchVendors(pagination.currentPage, pagination.itemsPerPage);
  }, [activeTab, fetchVendors]);

  const updateStatus = async (id, status) => {
    try {
      await apiService.put(`vendor/${id}/status`, { status });
      showToast(`Vendor ${status} successfully`, "success");
      fetchVendors(pagination.currentPage, pagination.itemsPerPage);
    } catch (err) {
      showToast(err.response?.data?.message || "Operation failed", "error");
    }
  };

  const columns = useMemo(() => [

    {
      title: "Vendor Profile",
      width: 280,
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <Avatar size={45} icon={<ShopOutlined />} src={r.store_details?.logo} />
          <div>
            <div className="font-bold text-gray-800">{r.store_name}</div>
            <div className="text-xs text-gray-500"><UserOutlined /> {r.full_name}</div>
            <div className="text-xs text-gray-400"><MailOutlined /> {r.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      width: 160,
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <div className="text-sm"><PhoneOutlined /> {r.mobile_str}</div>
          {r.is_mobile_verified && <Tag color="green" className="text-[10px]">Verified</Tag>}
        </Space>
      ),
    },
    {
      title: "Status",
      width: 130,
      render: (_, r) => {
        const config = {
          registered: { color: 'orange', icon: <ClockCircleOutlined />, label: 'Pending' },
          approved: { color: 'green', icon: <CheckCircleOutlined />, label: 'Approved' },
          rejected: { color: 'red', icon: <CloseCircleOutlined />, label: 'Rejected' },
          suspended: { color: 'magenta', icon: <StopOutlined />, label: 'Suspended' }
        }[r.status] || { color: 'default', label: r.status };

        return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
      },
    },
    {
      title: "Actions",
      fixed: "right",
      width: 180,
      render: (_, r) => (
        <Space size="middle">
          <Tooltip title="View Profile">
            <Button 
              type="text" 
              className="flex items-center justify-center"
              icon={<FiEye style={{color: THEME.primary, fontSize: 18}} />} 
              onClick={() => navigate(`/dashboard/${roleSlug}/seller/${r._id}`)} 
            />
          </Tooltip>
          
          {r.status === "registered" && (
            <>
              <Tooltip title="Approve Vendor">
                <Popconfirm title="Approve this vendor?" onConfirm={() => updateStatus(r._id, "approved")}>
                  <Button type="text" className="flex items-center justify-center" icon={<FiCheck style={{color: THEME.success, fontSize: 18}} />} />
                </Popconfirm>
              </Tooltip>

              <Tooltip title="Reject Vendor">
                <Popconfirm title="Reject this vendor application?" onConfirm={() => updateStatus(r._id, "rejected")}>
                  <Button type="text" className="flex items-center justify-center" icon={<FiX style={{color: THEME.error, fontSize: 18}} />} />
                </Popconfirm>
              </Tooltip>
            </>
          )}

          {r.status === "approved" && (
            <Tooltip title="Suspend Vendor">
              <Popconfirm title="Are you sure you want to suspend this vendor?" onConfirm={() => updateStatus(r._id, "suspended")}>
                <Button type="text" className="flex items-center justify-center" icon={<FiSlash style={{color: THEME.error, fontSize: 18}} />} />
              </Popconfirm>
            </Tooltip>
          )}

          {(r.status === "suspended" || r.status === "rejected") && (
            <Tooltip title="Restore / Approve">
              <Popconfirm title="Restore this vendor to Approved status?" onConfirm={() => updateStatus(r._id, "approved")}>
                <Button type="text" className="flex items-center justify-center" icon={<FiRotateCcw style={{color: THEME.success, fontSize: 18}} />} />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ], [roleSlug, navigate]);

  const tabItems = [
    { key: 'approved', label: <span>Approved <Badge count={stats.approved} offset={[10, -5]} style={{backgroundColor: THEME.success}} /></span> },
    { key: 'pending', label: <span>Pending <Badge count={stats.registered} offset={[10, -5]} style={{backgroundColor: THEME.warning}} /></span> },
    { key: 'rejected', label: <span>Rejected <Badge count={stats.rejected} offset={[10, -5]} style={{backgroundColor: THEME.error}} /></span> },
    { key: 'suspended', label: <span>Suspended <Badge count={stats.suspended} offset={[10, -5]} style={{backgroundColor: THEME.suspended}} /></span> },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <Title level={3} style={{margin: 0}}>Vendor Management (B2C)</Title>
        <Text type="secondary">Review and manage vendor account statuses across the platform.</Text>
      </div>

      <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          type="card"
          className="bg-gray-100 "
          items={tabItems}
        />
        <div className="bg-white">
            <CustomTable
              columns={columns}
              data={vendors}
              loading={loading}
              totalItems={pagination.totalResults}
              currentPage={pagination.currentPage}
              onPageChange={fetchVendors}
              scroll={{ x: 1000 }}
            />
        </div>
      </Card>
    </div>
  );
};

export default VendorB2C;