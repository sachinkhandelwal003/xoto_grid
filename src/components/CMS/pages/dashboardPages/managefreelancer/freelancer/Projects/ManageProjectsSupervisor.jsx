// src/pages/freelancer/Projects.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRightOutlined,
  EyeOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarCircleOutlined
} from "@ant-design/icons";
import {
  Button,
  Card,
  Tag,
  Tooltip,
  Typography,
  Tabs,
  Progress,
  Row,
  Col,
  Statistic,
  Avatar
} from "antd";
import { showToast } from "../../../../../../../manageApi/utils/toast";
import { apiService } from "../../../../../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../../../custom/CustomTable";

const { Title, Text } = Typography;

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

const ManageProjectsSupervisor = () => {
  const { token, user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  // Role Mapping for URL navigation
  const roleSlugMap = {
    0: "superadmin",
    1: "admin",
    5: "vendor-b2c",
    6: "vendor-b2b",
    7: "freelancer",
    11: "accountant",
        12: "supervisor",

  };
  const roleSlug = roleSlugMap[user?.role?.code] ?? "dashboard";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });

  // ✅ helper: normalize string
  const normalize = (str) => (str || "").toString().trim();

  /**
   * ✅ MAIN FIX FOR SEARCH (CustomTable objects ignore karta hai)
   * Projects ko flat searchable keys me convert kar rahe hain
   */
  const flattenProjectsForSearch = (list = []) => {
    return list.map((p) => {
      const title = p?.title || "";
      const code = p?.Code || p?.code || "";
      const clientName = p?.client_name || "";
      const clientCompany = p?.client_company || "";
      const categoryName = p?.category?.name || "";
      const status = p?.status || "";
      const budget = p?.budget !== undefined && p?.budget !== null ? String(p?.budget) : "";

      const milestonesActive = Array.isArray(p?.milestones)
        ? p.milestones.filter((m) => !m?.is_deleted)
        : [];
      const milestonesCompleted = milestonesActive.filter((m) => m?.status === "approved").length;
      const milestonesTotal = milestonesActive.length;

      return {
        ...p,
        __search_title: normalize(title),
        __search_code: normalize(code),
        __search_client: normalize(`${clientName} ${clientCompany}`),
        __search_category: normalize(categoryName),
        __search_status: normalize(status),
        __search_budget: normalize(budget),
        __search_milestones: normalize(`${milestonesCompleted}/${milestonesTotal}`),
      };
    });
  };

  // Calculate client-side stats for the visible page
  const stats = useMemo(() => {
    return {
      total: pagination.totalResults,
      active: projects.filter((p) => p.status === "in_progress" || p.status === "assigned").length,
      completed: projects.filter((p) => p.status === "completed").length,
      budget: projects.reduce((acc, curr) => acc + (Number(curr.budget) || 0), 0),
    };
  }, [projects, pagination.totalResults]);

 const fetchProjects = useCallback(
  async (page = 1, limit = 10, tab = activeTab) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        supervisor: user?.id, // ✅ ADD THIS
      };

      if (tab !== "all") {
        params.status = tab;
      }

      const response = await apiService.get("/freelancer/projects", params);

      setProjects(flattenProjectsForSearch(response.projects || []));

      setPagination({
        currentPage: response.pagination?.page || 1,
        totalPages: response.pagination?.totalPages || 1,
        totalResults: response.pagination?.total || 0,
        itemsPerPage: response.pagination?.limit || 10,
      });
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  },
  [activeTab, user?.id] // ✅ include user.id in deps
);


  useEffect(() => {
    if (token) {
      fetchProjects(1, 10, activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeTab]);

  const handlePageChange = (page, limit) => fetchProjects(page, limit, activeTab);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // --- CONFIG ---
  const statusConfig = {
    assigned: { color: "blue", icon: <ClockCircleOutlined />, label: "Assigned" },
    in_progress: { color: "orange", icon: <ClockCircleOutlined />, label: "In Progress" },
    completed: { color: "green", icon: <CheckCircleOutlined />, label: "Completed" },
    cancelled: { color: "red", icon: <ClockCircleOutlined />, label: "Cancelled" },
    default: { color: "default", icon: <ProjectOutlined />, label: "Unknown" },
  };

  // --- COLUMNS ---
  const columns = useMemo(
    () => [
      {
        key: "project_info",
        title: "Project Details",
        width: 250,
        render: (_, record) => (
          <div className="flex items-center gap-3">
            <Avatar
              shape="square"
              size="large"
              icon={<ProjectOutlined />}
              style={{ backgroundColor: THEME.bgLight, color: THEME.primary }}
            />
            <div>
              <div className="font-semibold text-gray-800 text-base">{record.estimate_reference.service_type}</div>
                            <div className="font-semibold text-gray-800 text-base">{record.estimate_reference.subcategory.label}</div>
              <div className="font-semibold text-gray-800 text-base">{record.estimate_reference.type.label}</div>

              <Tooltip title="Project Code">
                <Tag className="mt-1 mr-0 text-xs">{record.Code || record.code || "—"}</Tag>
              </Tooltip>
            </div>
          </div>
        ),
      },
      {
        key: "client",
        title: "Client Info",
        width: 200,
        render: (_, r) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-700">{r.customer.name.first_name}{r.customer.name.last_name}</span>
                        <span className="font-medium text-gray-700">{r.customer.email}</span>

          </div>
        ),
      },
      {
        key: "budget",
        title: "Budget",
        width: 150,
        render: (v) => (
          <span className="font-semibold text-gray-700">
            AED{Number(v || 0).toLocaleString()}
          </span>
        ),
      },
   {
  key: "progress",
  title: "Progress",
  width: 180,
  render: (_, r) => {
    const milestones = (r.milestones || []).filter(m => !m.is_deleted);

    const totalWeight = milestones.reduce(
      (sum, m) => sum + (m.milestone_weightage || 0),
      0
    );

    const completedWeight = milestones
      .filter(m => m.status === "approved")
      .reduce((sum, m) => sum + (m.milestone_weightage || 0), 0);

    const percent =
      totalWeight > 0
        ? Math.round((completedWeight / totalWeight) * 100)
        : 0;

    return (
      <div className="w-full">
        <div className="flex justify-between text-xs mb-1 text-gray-500">
          <span>
            {completedWeight}/{totalWeight}%
          </span>
          {/* <span>{percent}%</span> */}
        </div>

        <Progress
          percent={percent}
          size="small"
          showInfo={false}
          strokeColor={THEME.primary}
        />
      </div>
    );
  },
}
,
      {
        key: "status",
        title: "Status",
        width: 140,
        render: (_, r) => {
          return (
            <Tag  style={{ borderRadius: 12, padding: "2px 10px" }}>
              {r.status}
            </Tag>
          );
        },
      },
      {
        key: "actions",
        title: "Actions",
        width: 100,
        align: "center",
        render: (_, r) => (
          <Tooltip title="View Project Details">
            <Button
              type="primary"
              ghost
              size="small"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/dashboard/${roleSlug}/projects/${r._id}`)}
              style={{ borderColor: THEME.primary, color: THEME.primary }}
            />
          </Tooltip>
        ),
      },
    ],
    [navigate, roleSlug]
  );

  const tabItems = [
    { key: "all", label: <span><ProjectOutlined /> All Projects</span> },
    { key: "in_progress", label: <span><ClockCircleOutlined /> In Progress</span> },
    { key: "completed", label: <span><CheckCircleOutlined /> Completed</span> },
    { key: "assigned", label: <span><ArrowRightOutlined /> Assigned</span> },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 1. Header & Stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={3} style={{ margin: 0 }}>Projects Management</Title>
            <Text type="secondary">Track and manage your ongoing and completed projects.</Text>
          </div>
          
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
              <Statistic
                title="Total Projects"
                value={stats.total}
                prefix={<ProjectOutlined style={{ color: THEME.primary }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.warning }}>
              <Statistic
                title="Active Projects"
                value={stats.active}
                prefix={<ClockCircleOutlined style={{ color: THEME.warning }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.success }}>
              <Statistic
                title="Completed"
                value={stats.completed}
                prefix={<CheckCircleOutlined style={{ color: THEME.success }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.secondary }}>
              <Statistic
                title="Page Budget"
                value={stats.budget}
                precision={2}
               
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* 2. Main Content */}
      <Card bordered={false} className="shadow-md rounded-lg" bodyStyle={{ padding: 0 }}>
        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          type="card"
          size="large"
          tabBarStyle={{ margin: 0, paddingLeft: 16, paddingTop: 16, background: "#fafafa" }}
        />

        {/* Table (Only ONE search bar from CustomTable) */}
        <div className="p-0">
          <CustomTable
            columns={columns}
            data={projects}
            loading={loading}
            totalItems={pagination.totalResults}
            currentPage={pagination.currentPage}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            scroll={{ x: 1000 }}
          />
        </div>
      </Card>
    </div>
  );
};

export default ManageProjectsSupervisor;
