// src/pages/admin/CustomerList.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Button, Card, Tag, Space, Typography,
  Avatar, Tooltip, Popconfirm, Input, Drawer, Divider,
} from "antd";
import {
  UserOutlined, PhoneOutlined, MailOutlined,
  CheckCircleOutlined, StopOutlined, EnvironmentOutlined, TeamOutlined,
} from "@ant-design/icons";
import {
  FiEye, FiToggleLeft, FiToggleRight,
  FiSearch, FiRefreshCw, FiUser, FiMail,
  FiPhone, FiMapPin, FiCalendar, FiShield,
} from "react-icons/fi";
import CustomTable from '../../pages/custom/CustomTable';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../manageApi/utils/toast';

const { Title, Text } = Typography;

const THEME = {
  primary: "#722ed1",
  success: "#52c41a",
  error: "#ff4d4f",
};

const CustomerList = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // ✅ debounce ref for server-side search
  const searchTimeout = useRef(null);

  // ── Fetch with optional server-side search ──────────────────────
  const fetchCustomers = useCallback(async (page = 1, limit = 10, searchVal = "") => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (searchVal?.trim()) params.search = searchVal.trim();

      const res = await apiService.get("users/customers", params);
      const allUsers = res.data || [];

      const data = allUsers.map((c, i) => ({
        ...c,
        key: c._id,
        sno: (page - 1) * limit + i + 1,
        full_name: c.name
          ? `${c.name.first_name || ""} ${c.name.last_name || ""}`.trim()
          : c.full_name || c.email?.split("@")[0] || "—",
        mobile_str: c.mobile
          ? typeof c.mobile === "object"
            ? `${c.mobile.country_code || ""} ${c.mobile.number || ""}`.trim()
            : String(c.mobile)
          : "—",
      }));

      setCustomers(data);
      setTotalCount(res.pagination?.total || data.length);
      setPagination({
        currentPage: res.pagination?.page || page,
        totalPages: res.pagination?.totalPages || 1,
        totalResults: res.pagination?.total || data.length,
        itemsPerPage: res.pagination?.limit || limit,
      });
    } catch (err) {
      showToast("Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers(1, 10, "");
  }, [fetchCustomers]);

  // ── Search handler with 500ms debounce ──────────────────────────
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchCustomers(1, pagination.itemsPerPage, val);
    }, 500);
  };

  const handleClearSearch = () => {
    setSearch("");
    fetchCustomers(1, pagination.itemsPerPage, "");
  };

  // ── Toggle active/inactive ───────────────────────────────────────
  const toggleStatus = async (id, currentStatus) => {
    try {
      await apiService.put(`users/customers/${id}/toggle`, {});
      showToast(
        `Customer ${currentStatus ? "deactivated" : "activated"} successfully`,
        "success"
      );
      setCustomers((prev) =>
        prev.map((c) => c._id === id ? { ...c, isActive: !currentStatus } : c)
      );
      if (selected?._id === id) {
        setSelected((prev) => ({ ...prev, isActive: !currentStatus }));
      }
    } catch (err) {
      showToast(err?.response?.data?.message || "Operation failed", "error");
    }
  };

  const getLocation = (c) => {
    if (!c?.location) return "—";
    if (typeof c.location === "string") return c.location;
    const { city, state, country } = c.location;
    return [city, state, country].filter(Boolean).join(", ") || "—";
  };

  // ── Table columns ────────────────────────────────────────────────
  const columns = [

    {
      title: "Customer",
      width: 280,
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={45}
            icon={<UserOutlined />}
            src={r.avatar || r.profile_pic || r.profile}
            style={{ background: THEME.primary }}
          />
          <div>
            <div className="font-bold text-gray-800">{r.full_name}</div>
            <div className="text-xs text-gray-400">
              <MailOutlined /> {r.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      width: 180,
      render: (_, r) => (
        <div className="text-sm"><PhoneOutlined /> {r.mobile_str}</div>
      ),
    },
   
    {
      title: "Joined",
      width: 130,
      render: (_, r) => (
        <Text type="secondary" className="text-xs">
          {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : "—"}
        </Text>
      ),
    },
    {
      title: "Status",
      width: 110,
      render: (_, r) =>
        r.isActive
          ? <Tag color="green" icon={<CheckCircleOutlined />}>Active</Tag>
          : <Tag color="red" icon={<StopOutlined />}>Inactive</Tag>,
    },
    {
      title: "Actions",
      fixed: "right",
      width: 110,
      render: (_, r) => (
        <Space size="middle">
          <Tooltip title="View Profile">
            <Button
              type="text"
              icon={<FiEye style={{ color: THEME.primary, fontSize: 18 }} />}
              onClick={() => { setSelected(r); setDrawerOpen(true); }}
            />
          </Tooltip>
          <Tooltip title={r.isActive ? "Deactivate" : "Activate"}>
            <Popconfirm
              title={`${r.isActive ? "Deactivate" : "Activate"} this customer?`}
              onConfirm={() => toggleStatus(r._id, r.isActive)}
            >
              <Button
                type="text"
                icon={
                  r.isActive
                    ? <FiToggleRight style={{ color: THEME.success, fontSize: 20 }} />
                    : <FiToggleLeft style={{ color: THEME.error, fontSize: 20 }} />
                }
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Customer Management</Title>
          <Text type="secondary">View and manage all registered customers.</Text>
        </div>
        {/* Single total count card */}
        <Card bordered={false} className="shadow-sm rounded-xl" bodyStyle={{ padding: "12px 24px" }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: `${THEME.primary}15`, color: THEME.primary,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            }}>
              <TeamOutlined />
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Total Customers</div>
              <div className="text-2xl font-bold" style={{ color: THEME.primary }}>{totalCount}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Table Card ── */}
      <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          {/* ✅ Server-side search — searches ALL customers across all pages */}
          <Input
            placeholder="Search by name, email or mobile..."
            prefix={<FiSearch className="text-gray-400" />}
            value={search}
            onChange={handleSearch}
            allowClear
            onClear={handleClearSearch}
            style={{ maxWidth: 360, borderRadius: 8 }}
          />
          <Button
            icon={<FiRefreshCw />}
            onClick={() => fetchCustomers(pagination.currentPage, pagination.itemsPerPage, search)}
          >
            Refresh
          </Button>
        </div>

        <div className="bg-white">
         <CustomTable
  columns={columns}
  data={customers}
  loading={loading}
  totalItems={pagination.totalResults}
  currentPage={pagination.currentPage}
  onPageChange={(page, limit) => fetchCustomers(page, limit, search)}
  scroll={{ x: 1000 }}
  showSearch={false}  
/>
        </div>
      </Card>

      {/* ── Rich Profile Drawer ── */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
        title={null}
        bodyStyle={{ padding: 0 }}
      >
        {selected && (
          <div>
            {/* Purple gradient banner */}
            <div style={{
              background: `linear-gradient(135deg, ${THEME.primary}, #9b59b6)`,
              padding: "32px 24px 60px",
            }}>
              <div className="flex flex-col items-center">
                <Avatar
                  size={80}
                  icon={<UserOutlined />}
                  src={selected.avatar || selected.profile_pic || selected.profile}
                  style={{ border: "3px solid white", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                />
              </div>
            </div>

            {/* Floating name card */}
            <div style={{ padding: "0 24px", marginTop: -30 }}>
              <Card
                bordered={false}
                bodyStyle={{ padding: "16px 20px", textAlign: "center" }}
                style={{ borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
              >
                <Title level={4} style={{ margin: 0 }}>{selected.full_name}</Title>
                <Text type="secondary" style={{ fontSize: 13 }}>{selected.email}</Text>
                <div className="mt-2">
                  {selected.isActive
                    ? <Tag color="green" icon={<CheckCircleOutlined />}>Active</Tag>
                    : <Tag color="red" icon={<StopOutlined />}>Inactive</Tag>
                  }
                </div>
              </Card>
            </div>

            {/* Detail rows */}
            <div style={{ padding: "20px 24px" }}>
              <Text className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                Customer Details
              </Text>
              <div className="mt-3 space-y-4">
                {[
                  { icon: <FiUser />, label: "Full Name", value: selected.full_name },
                  { icon: <FiMail />, label: "Email", value: selected.email || "—" },
                  { icon: <FiPhone />, label: "Mobile", value: selected.mobile_str || "—" },
                  { icon: <FiMapPin />, label: "Location", value: getLocation(selected) },
                  {
                    icon: <FiCalendar />, label: "Joined",
                    value: selected.createdAt
                      ? new Date(selected.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric", month: "long", day: "numeric",
                        })
                      : "—",
                  },
                  { icon: <FiShield />, label: "Role", value: selected.role?.name || "Customer" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: `${THEME.primary}12`, color: THEME.primary,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, fontSize: 15,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">{item.label}</div>
                      <div className="text-sm font-medium text-gray-800">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Divider />

              {/* Toggle button */}
              <Popconfirm
                title={`${selected.isActive ? "Deactivate" : "Activate"} this customer?`}
                onConfirm={() => toggleStatus(selected._id, selected.isActive)}
              >
                <Button
                  block danger={selected.isActive}
                  type={selected.isActive ? "default" : "primary"}
                  size="large"
                  style={{ borderRadius: 10, fontWeight: 600 }}
                  icon={selected.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
                >
                  {selected.isActive ? "Deactivate Customer" : "Activate Customer"}
                </Button>
              </Popconfirm>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CustomerList;