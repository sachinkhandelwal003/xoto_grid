// src/pages/freelancer/MyProjects.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Progress,
  Button,
  Tag,
  Typography,
  Empty,
  Row,
  Col,
  Statistic,
  Space,
  message,
  Spin,
  Avatar,
  Tooltip,
  Tabs,
} from "antd";
import {
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  ProjectOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { apiService } from "../../../../../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../../../custom/CustomTable"; // Import CustomTable

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

/* -------------------------------------------------------------------------- */
/*                              UTILITY FUNCTIONS                             */
/* -------------------------------------------------------------------------- */
const getStatusColor = (s) => {
  const map = {
    completed: "green",
    in_progress: "blue",
    pending: "orange",
    release_requested: "gold",
    approved: "cyan",
    draft: "gray",
    assigned: "purple",
  };
  return map[s] || "default";
};

const formatStatus = (s) => {
  const map = {
    completed: "Completed",
    in_progress: "In Progress",
    pending: "Pending",
    release_requested: "Payment Requested",
    approved: "Approved",
    draft: "Draft",
    assigned: "Assigned",
  };
  return map[s] || s.replace("_", " ").toUpperCase();
};

const getActiveMilestones = (milestones = []) => {
  return milestones.filter(m => !m.is_deleted);
};

const calculateProjectProgress = (project) => {
  const activeMilestones = getActiveMilestones(project.milestones);
  if (!activeMilestones.length) return 0;
  
  const completed = activeMilestones.filter((m) => 
    ["approved", "completed"].includes(m.status)
  ).length;
  return Math.round((completed / activeMilestones.length) * 100);
};

const getClientName = (project) => {
  if (project.client_name) return project.client_name;
  if (project.customer) {
    const firstName = project.customer.name?.first_name || "";
    const lastName = project.customer.name?.last_name || "";
    return `${firstName} ${lastName}`.trim();
  }
  return "Unknown Client";
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */
const MyProjects = () => {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  /* ------------------------------- State ----------------------------------- */
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });

  // Role Mapping for URL navigation
  const roleSlugMap = {
    0: "superadmin",
    1: "admin",
    5: "vendor-b2c",
    6: "vendor-b2b",
    7: "freelancer",
    11: "accountant",
  };
  const roleSlug = roleSlugMap[user?.role] || "freelancer";

  /* --------------------------- Flatten Projects for Search ----------------- */
  const normalize = (str) => (str || "").toString().trim();

  const flattenProjectsForSearch = useCallback((list = []) => {
    return list.map((p) => {
      const title = p?.title || "";
      const code = p?.Code || p?.code || "";
      const clientName = getClientName(p);
      const status = p?.status || "";
      const budget = p?.budget !== undefined && p?.budget !== null ? String(p?.budget) : "";
      const city = p?.city || "";
      const progress = calculateProjectProgress(p);
      
      const startDate = p?.start_date ? moment(p.start_date).format('DD/MM/YY') : "";
      const duration = p?.start_date && p?.end_date 
        ? `${moment(p.start_date).format('MMM DD')} to ${moment(p.end_date).format('MMM DD, YYYY')}`
        : "";
      
      const activeMilestones = getActiveMilestones(p.milestones || []);

      return {
        ...p,
        __search_title: normalize(title),
        __search_code: normalize(code),
        __search_client: normalize(clientName),
        __search_status: normalize(status),
        __search_budget: normalize(budget),
        __search_city: normalize(city),
        __search_progress: normalize(`${progress}%`),
        __search_start_date: normalize(startDate),
        __search_duration: normalize(duration),
        __search_milestones: normalize(`${activeMilestones.length}`),
      };
    });
  }, []);

  /* --------------------------- API Calls ----------------------------------- */
  const fetchMyProjects = useCallback(
    async (page = 1, limit = 10) => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          freelancer: user?.id,
        };
        

        const response = await apiService.get("/freelancer/projects", params);

        let projectsData = [];
        let paginationData = {};
        
        if (response && response.projects) {
          projectsData = response.projects;
        } else if (response && response.data?.projects) {
          projectsData = response.data.projects;
        } else if (Array.isArray(response)) {
          projectsData = response;
        }

        if (response && response.pagination) {
          paginationData = response.pagination;
        } else if (response && response.data?.pagination) {
          paginationData = response.data.pagination;
        }

        setProjects(flattenProjectsForSearch(projectsData));

        setPagination({
          currentPage: paginationData.page || 1,
          totalPages: paginationData.totalPages || 1,
          totalResults: paginationData.total || projectsData.length,
          itemsPerPage: paginationData.limit || limit,
        });
      } catch (err) {
        console.error("Error fetching projects:", err);
        message.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    },
    [user?.id, flattenProjectsForSearch]
  );

  const refreshProjects = async () => {
    setRefreshing(true);
    await fetchMyProjects(pagination.currentPage, pagination.itemsPerPage, activeTab);
    setRefreshing(false);
    message.success("Projects refreshed");
  };

  const viewProjectDetails = (projectId) => {
    navigate(`/dashboard/${roleSlug}/projects/manage/${projectId}`);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handlePageChange = (page, limit) => {
    fetchMyProjects(page, limit, activeTab);
  };

  useEffect(() => {
    if (user?.id) {
      fetchMyProjects();
    }
  }, [fetchMyProjects, user?.id]);

  /* --------------------------- Table Columns ------------------------------- */
  const columns = useMemo(
    () => [
    {
  key: "project_info",
  title: "Project Details",
  width: 280,
  render: (_, record) => {
    const estimate = record.estimate_reference;

    return (
      <div className="flex items-start gap-3">
        <div>
          {/* MAIN LINE: Service Type + Subcategory + Type */}
          <div className="font-semibold text-gray-800 text-sm">
            {estimate?.service_type || "—"}{" "}
            {estimate?.subcategory?.label && (
              <>• {estimate.subcategory.label}</>
            )}{" "}
            {estimate?.type?.label && (
              <>• {estimate.type.label}</>
            )}
          </div>

          {/* SECOND LINE: Project Code */}
          <div className="flex items-center gap-2 mt-1">
            <Tooltip title="Project Code">
              <Tag className="text-xs">
                {record.Code || record.code || "—"}
              </Tag>
            </Tooltip>

         
          </div>
        </div>
      </div>
    );
  },
}
,
    {
  key: "client",
  title: "Client Info",
  width: 180,
  render: (_, record) => {
    const customer = record.customer;

    return (
      <div className="flex flex-col">
        {/* CUSTOMER NAME */}
        <span className="font-medium text-gray-700">
          {customer?.name
            ? `${customer.name.first_name} ${customer.name.last_name}`
            : "—"}
        </span>

        {/* START DATE */}
        <span className="text-xs text-gray-500">
     {customer.email}
        </span>
      </div>
    );
  },
}
,
  
      {
        key: "status",
        title: "Status",
        width: 140,
        render: (_, record) => {
          const status = record.status;
          const color = getStatusColor(status);
          const label = formatStatus(status);
          
          return (
            <Tag color={color} style={{ borderRadius: 12, padding: "2px 10px" }}>
              {label}
            </Tag>
          );
        },
      },
    {
  key: "duration",
  title: "Duration",
  width: 200,
  render: (_, record) => {
    const start = record.start_date
      ? moment(record.start_date).format("DD MMM")
      : "—";

    const end = record.end_date
      ? moment(record.end_date).format("DD MMM YYYY")
      : "—";

    return (
      <div className="flex flex-col gap-1">
        {/* MAIN DURATION */}
        <Text strong className="text-sm text-gray-800">
          {start} <span className="text-gray-400 mx-1">→</span> {end}
        </Text>

        {/* CREATED DATE */}
        {record.createdAt && (
          <Text type="secondary" className="text-xs">
            Created on {moment(record.createdAt).format("DD MMM YYYY")}
          </Text>
        )}
      </div>
    );
  },
}
,
      {
        key: "actions",
        title: "Actions",
        width: 100,
        align: "center",
        render: (_, record) => (
          <div className="flex gap-2">
            
            <Tooltip title="Go to Project">
              <Button
                type="primary"
                size="small"
                shape="circle"
                icon={<ArrowRightOutlined />}
                onClick={() => viewProjectDetails(record._id)}
                style={{ background: THEME.primary, borderColor: THEME.primary }}
              />
            </Tooltip>
          </div>
        ),
      },
    ],
    [THEME, roleSlug]
  );



  /* --------------------------- Calculate Stats ----------------------------- */
  const stats = useMemo(() => {
    const totalRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const inProgress = projects.filter(p => p.status === 'in_progress').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const assigned = projects.filter(p => p.status === 'assigned').length;
    
    return {
      total: pagination.totalResults,
      inProgress,
      completed,
      assigned,
      totalRevenue,
    };
  }, [projects, pagination.totalResults]);

  /* ------------------------------ UI --------------------------------------- */
  if (loading && !refreshing && projects.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={3} style={{ margin: 0 }}>My Assigned Projects</Title>
            <Text type="secondary">Manage and track your assigned projects</Text>
          </div>
        
        </div>

      
      </div>

      {/* Main Content */}
      <Card bordered={false} className="shadow-md rounded-lg" bodyStyle={{ padding: 0 }}>
      

        {/* CustomTable */}
        <div className="p-0">
          {projects.length === 0 ? (
            <div className="p-8 text-center">
              <Empty 
                description={
                  <div>
                    <Title level={4}>No Projects Found</Title>
                    <Text type="secondary">You haven't been assigned any projects yet.</Text>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <CustomTable
              columns={columns}
              data={projects}
              loading={loading}
              totalItems={pagination.totalResults}
              currentPage={pagination.currentPage}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={handlePageChange}
              scroll={{ x: 1200 }}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default MyProjects;