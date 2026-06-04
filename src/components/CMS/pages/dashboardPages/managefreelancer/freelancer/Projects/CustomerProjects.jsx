// src/pages/customer/Projects.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Progress,
  Button,
  Tag,
  Typography,
  Space,
  Alert,
  message,
  Spin,
  Descriptions,
  Image,
  Collapse,
  Timeline,
  Badge,
  Row,
  Col,
  Statistic,
  Modal,
  Empty,
  Avatar,
  Tooltip,
  Popover,
  Form,
  Input,
  Upload,
  List,
  Tabs
} from "antd";
import {
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  ReloadOutlined,
  EyeOutlined,
  ProjectOutlined,
  PercentageOutlined,
  FieldTimeOutlined,
  UploadOutlined,
  ArrowRightOutlined
} from "@ant-design/icons";
import moment from "moment";
import { apiService } from "../../../../../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../../../custom/CustomTable"; // Import your CustomTable

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

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
  return map[s] || s;
};

const getActiveMilestones = (milestones = []) => {
  return milestones.filter(m => !m.is_deleted);
};

const calculateProjectProgress = (project) => {
  if (!project?.milestones?.length) return 0;

  const activeMilestones = project.milestones.filter(
    (m) => !m.is_deleted
  );

  const totalWeightage = activeMilestones.reduce(
    (sum, m) => sum + (m.milestone_weightage || 0),
    0
  );

  const approvedWeightage = activeMilestones
    .filter((m) => ["approved", "completed"].includes(m.status))
    .reduce((sum, m) => sum + (m.milestone_weightage || 0), 0);

  return totalWeightage > 0
    ? Math.round((approvedWeightage / totalWeightage) * 100)
    : 0;
};


const getClientName = (project) => {
  if (project?.client_name) return project.client_name;
  if (project?.customer) {
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
const CustomerProjects = () => {
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

  // View Project Modal
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Review Modal
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewingMilestone, setReviewingMilestone] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm] = Form.useForm();

  /* --------------------------- Flatten Projects for Search ----------------- */
  const normalize = (str) => (str || "").toString().trim();

  const flattenProjectsForSearch = useCallback((list = []) => {
    return list.map((p) => {
      const title = p?.title || "";
      const code = p?.Code || p?.code || "";
      const clientName = getClientName(p);
      const categoryName = p?.category?.name || p?.estimate_reference?.service_type || "";
      const status = p?.status || "";
      const budget = p?.budget !== undefined && p?.budget !== null ? String(p?.budget) : "";
      
      const freelancerName = p?.assigned_freelancer?.name 
        ? `${p.assigned_freelancer.name.first_name || ""} ${p.assigned_freelancer.name.last_name || ""}`.trim()
        : "";
      
      const progress = calculateProjectProgress(p);

      return {
        ...p,
        __search_title: normalize(title),
        __search_code: normalize(code),
        __search_client: normalize(clientName),
        __search_category: normalize(categoryName),
        __search_status: normalize(status),
        __search_budget: normalize(budget),
        __search_freelancer: normalize(freelancerName),
        __search_progress: normalize(`${progress}%`),
      };
    });
  }, []);

  /* --------------------------- API Calls ----------------------------------- */
  const fetchMyProjects = useCallback(
    async (page = 1, limit = 10, ) => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          customer: user?.id, // Or customer ID
        };
        

        // Adjust API endpoint as needed
        const response = await apiService.get("freelancer/projects", params);
        
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
    await fetchMyProjects(pagination.currentPage, pagination.itemsPerPage);
    setRefreshing(false);
    message.success("Projects refreshed");
  };

  const fetchProjectDetails = async (projectId) => {
    setModalLoading(true);
    try {
const response = await apiService.get(
  `/freelancer/projects?id=${projectId}`
);      
      if (response && response.project) {
        setSelectedProject(response.project);
      } else {
        message.error("Failed to load project details");
      }
    } catch (err) {
      console.error("Error fetching project details:", err);
      message.error("Failed to load project details");
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchMyProjects();
    }
  }, [fetchMyProjects, user?.id]);

  const handleApproveCompletion = async (milestone) => {
  try {
   await apiService.post(
  `/freelancer/projects/update-milestone?milestoneId=${milestone._id}&projectId=${selectedProject._id}`,
  {
    customer_approval_after_completion: true,
  }
);


    message.success("Milestone approved successfully");

    fetchMyProjects();
    fetchProjectDetails(selectedProject._id);
  } catch (err) {
    console.error("Approval failed", err);
    message.error("Failed to approve milestone");
  }
};

  /* -------------------------- Event Handlers ------------------------------- */
  const viewProjectDetails = (project) => {
    setSelectedProject(project);
    setViewModalVisible(true);
  };

  const closeViewModal = () => {
    setViewModalVisible(false);
    setSelectedProject(null);
  };

  const openReviewModal = (milestone) => {
    setReviewingMilestone(milestone);
    reviewForm.resetFields();
    setReviewModalVisible(true);
  };

  const closeReviewModal = () => {
    setReviewModalVisible(false);
    setReviewingMilestone(null);
    reviewForm.resetFields();
  };

  const submitReview = async (values) => {
    if (!selectedProject || !reviewingMilestone) return;
    
    setSubmittingReview(true);
    try {
      const payload = {
        milestoneId: reviewingMilestone._id,
        projectId: selectedProject._id,
        review: values.review,
        rating: values.rating,
        photos: values.photos || [],
      };

      const res = await apiService.post("/customer/projects/review", payload);
      
      if (res.success) {
        message.success("Review submitted successfully!");
        closeReviewModal();
        fetchMyProjects();
        if (selectedProject) {
          fetchProjectDetails(selectedProject._id);
        }
      } else {
        message.error(res.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Review submission error:", err);
      message.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleApproveMilestone = async (milestoneId) => {
    const ok = await new Promise((resolve) => {
      Modal.confirm({
        title: "Approve Milestone?",
        content: "Are you sure you want to approve this milestone? This will release payment to the freelancer.",
        okText: "Yes, Approve",
        cancelText: "Cancel",
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });

    if (!ok) return;

    try {
      const res = await apiService.post(`/customer/projects/${selectedProject._id}/milestones/${milestoneId}/approve`);
      
      if (res.success) {
        message.success("Milestone approved successfully!");
        fetchMyProjects();
        if (selectedProject) {
          fetchProjectDetails(selectedProject._id);
        }
      } else {
        message.error(res.message || "Failed to approve milestone");
      }
    } catch (err) {
      console.error("Approve error:", err);
      message.error("Failed to approve milestone");
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handlePageChange = (page, limit) => {
    fetchMyProjects(page, limit, activeTab);
  };
const serviceTypeColor = {
  landscape: "green",
  interior: "blue",
  exterior: "volcano",
};

  /* --------------------------- Table Columns ------------------------------- */
  const columns = useMemo(
    () => [
      {
  key: "budget",
  title: "Category",
  width: 160,
  render: (_, record) => {
    const ref = record?.estimate_reference;

    return (
      <div className="flex flex-col gap-1">
        {ref?.service_type && (
          <Tag color={serviceTypeColor[ref.service_type] || "default"} className="text-xs">
            {ref.service_type}
          </Tag>
        )}

     
      </div>
    );
  },
}
,
    {
  key: "project_info",
  title: "Project Details",
  width: 250,
  render: (_, record) => {
    const ref = record?.estimate_reference;
    const projectCode = record.Code || record.code || "—";

    return (
      <div className="flex flex-col gap-1">
        <Tooltip title="Project Code">
          <Tag color="gold" className="text-xs">
            {projectCode}
          </Tag>
        </Tooltip>

        {ref?.subcategory?.label && (
          <Tooltip title="Subcategory">
            <Tag color="cyan" className="text-xs">
              {ref.subcategory.label}
            </Tag>
          </Tooltip>
        )}

        {ref?.type?.label && (
          <Tooltip title="Type">
            <Tag color="purple" className="text-xs">
              {ref.type.label}
            </Tag>
          </Tooltip>
        )}
      </div>
    );
  },
}
,
      {
        key: "budget",
        title: "Budget",
        width: 120,
        render: (_, record) => (
          <Text strong>AED{record.budget}</Text>
        ),
      },
   
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
        key: "actions",
        title: "Actions",
        width: 120,
        align: "center",
        render: (_, record) => (
          <Space>
            <Tooltip title="View Details">
              <Button
                type="primary"
                ghost
                size="small"
                shape="circle"
                icon={<EyeOutlined />}
                onClick={() => viewProjectDetails(record)}
                style={{ borderColor: THEME.primary, color: THEME.primary }}
              />
            </Tooltip>
            
          </Space>
        ),
      },
    ],
    [THEME]
  );

  /* --------------------------- Tab Items ----------------------------------- */
  const tabItems = [
    { key: "all", label: <span><ProjectOutlined /> All Projects</span> },
    { key: "in_progress", label: <span><ClockCircleOutlined /> In Progress</span> },
    { key: "completed", label: <span><CheckCircleOutlined /> Completed</span> },
    { key: "pending", label: <span><ClockCircleOutlined /> Pending</span> },
    { key: "assigned", label: <span><ArrowRightOutlined /> Assigned</span> },
  ];

  /* --------------------------- Milestone Details --------------------------- */
  const renderMilestoneCard = (milestone, project) => {
    const isActive = moment().isBetween(
      moment(milestone.start_date),
      moment(milestone.end_date),
      'day',
      '[]'
    );
    const dueDays = moment(milestone.due_date).diff(moment(), 'days');
    const isOverdue = dueDays < 0;
    const dailyUpdates = milestone.daily_updates || [];
    const hasCustomerApproval = milestone.customer_approval_after_completion;

    return (
      <Card
        key={milestone._id}
        size="small"
        className="mb-4"
        style={{ borderLeft: `4px solid ${getStatusColor(milestone.status)}` }}
        title={
          <Space direction="vertical" size={2}>
            <Space wrap>
              <Text strong>Milestone {milestone.milestone_number}: {milestone.title}</Text>
              <Tag color={getStatusColor(milestone.status)}>
                {formatStatus(milestone.status)}
              </Tag>
              {isActive && <Tag color="green">Active</Tag>}
              {isOverdue && <Tag color="red">Overdue</Tag>}
              {milestone.milestone_weightage && (
                <Tag color="purple">Weight: {milestone.milestone_weightage}%</Tag>
              )}
            </Space>
            <Space>
              <CalendarOutlined />
              <Text type="secondary">
                {moment(milestone.start_date).format('DD MMM YYYY')} - {moment(milestone.end_date).format('DD MMM YYYY')}
              </Text>
            </Space>
          </Space>
        }
      extra={
  <Space>
    <Text strong>AED{milestone.amount}</Text>

    {Number(milestone.progress) === 100 &&
      !milestone.customer_approval_after_completion && (
        <Button
          type="primary"
          size="small"
          onClick={() => handleApproveCompletion(milestone)}
        >
          Approve
        </Button>
      )}

    {milestone.customer_approval_after_completion && (
      <Tag color="green">Approved</Tag>
    )}
  </Space>
}

      >
        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <Text>Progress</Text>
            <Text strong>{milestone.progress || 0}%</Text>
          </div>
          <Progress 
            percent={milestone.progress || 0} 
            status={milestone.progress === 100 ? 'success' : 'active'}
          />
        </div>

        {/* Description */}
        {milestone.description && (
          <Paragraph type="secondary" className="mb-4">
            {milestone.description}
          </Paragraph>
        )}

        {/* Due Date Status */}
        <Alert
          message={
            <Space>
              <CalendarOutlined />
              <Text>
                Due: {moment(milestone.due_date).format('DD MMM YYYY')}
                {dueDays >= 0 ? ` (${dueDays} days left)` : ` (${Math.abs(dueDays)} days overdue)`}
              </Text>
            </Space>
          }
          type={isOverdue ? 'error' : dueDays <= 3 ? 'warning' : 'info'}
          showIcon
        />
      </Card>
    );
  };

  /* --------------------------- Calculate Stats ----------------------------- */
  const stats = useMemo(() => {
    return {
      total: pagination.totalResults,
      inProgress: projects.filter(p => p.status === 'in_progress').length,
      totalInvestment: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      avgProgress: projects.length > 0 ? 
        Math.round(projects.reduce((sum, p) => sum + calculateProjectProgress(p), 0) / projects.length) : 0,
    };
  }, [projects, pagination.totalResults]);

  /* ------------------------------ UI --------------------------------------- */
  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>My Projects</Title>
          <Text type="secondary">Track and manage your projects with freelancers.</Text>
        </div>
        
      </div>


      {/* Main Content */}
      <Card bordered={false} className="shadow-md rounded-lg" bodyStyle={{ padding: 0 }}>
        {/* Tabs */}
        {/* <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          type="card"
          size="large"
          tabBarStyle={{ margin: 0, paddingLeft: 16, paddingTop: 16, background: "#fafafa" }}
        /> */}

        {/* CustomTable */}
        <div className="p-0">
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
        </div>
      </Card>

    {/* View Project Modal */}
      <Modal
        title={
         <Space wrap>
 

  {/* Status */}
  

  {/* Service */}
  {selectedProject?.estimate_reference?.service_type && (
    <Tag color="green">
      {selectedProject.estimate_reference.service_type}
    </Tag>
  )}

  {/* Subcategory */}
  {selectedProject?.estimate_reference?.subcategory?.label && (
    <Tag color="cyan">
      {selectedProject.estimate_reference.subcategory.label}
    </Tag>
  )}

  {/* Type */}
  {selectedProject?.estimate_reference?.type?.label && (
    <Tag color="purple">
      {selectedProject.estimate_reference.type.label}
    </Tag>
  )}
</Space>

        }
        open={viewModalVisible}
        onCancel={closeViewModal}
        width={1000}
        footer={[
          <Button key="close" onClick={closeViewModal}>
            Close
          </Button>,
        ]}
        destroyOnClose
      >
        {modalLoading ? (
          <div className="flex justify-center items-center p-8">
            <Spin size="large" />
          </div>
        ) : selectedProject ? (
          <div className="p-4">
            {/* Project Overview */}
            <Card className="mb-6">
              <Descriptions title="Project Overview" bordered column={2}>
                <Descriptions.Item label="Project Code">
                  <Tag color="blue">{selectedProject.Code}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Budget">
                  <Text strong>AED{selectedProject.budget}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {moment(selectedProject.start_date).format('DD MMM YYYY')} - {moment(selectedProject.end_date).format('DD MMM YYYY')}
                </Descriptions.Item>
              
                {/* <Descriptions.Item label="Supervisor" span={2}>
                  {selectedProject.assigned_supervisor?.name?.first_name} {selectedProject.assigned_supervisor?.name?.last_name}
                  {selectedProject.assigned_supervisor?.email && (
                    <Text type="secondary"> ({selectedProject.assigned_supervisor.email})</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Freelancer" span={2}>
                  {selectedProject.assigned_freelancer ? (
                    <Space>
                      <Avatar size="small" icon={<UserOutlined />} />
                      <Text>
                        {selectedProject.assigned_freelancer.name?.first_name} {selectedProject.assigned_freelancer.name?.last_name}
                      </Text>
                      <Text type="secondary">({selectedProject.assigned_freelancer.email})</Text>
                    </Space>
                  ) : (
                    <Text type="secondary">Not assigned</Text>
                  )}
                </Descriptions.Item> */}
                {selectedProject.overview && (
                  <Descriptions.Item label="Overview" span={2}>
                    {selectedProject.overview}
                  </Descriptions.Item>
                )}
                {selectedProject.scope_details && (
                  <Descriptions.Item label="Scope Details" span={2}>
                    {selectedProject.scope_details}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Project Progress */}
            <Card className="mb-6">
              <Title level={5}>Project Progress</Title>
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <Text strong>Overall Progress</Text>
                  <Text strong>{calculateProjectProgress(selectedProject)}%</Text>
                </div>
                <Progress 
                  percent={calculateProjectProgress(selectedProject)} 
                  status={calculateProjectProgress(selectedProject) === 100 ? 'success' : 'active'}
                />
              </div>

              <Row gutter={16}>
                <Col span={8}>
                  <Statistic 
                    title="Total Milestones" 
                    value={getActiveMilestones(selectedProject.milestones).length}
                    prefix={<FileTextOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Completed"
                    value={getActiveMilestones(selectedProject.milestones).filter(m => 
                      ['completed', 'approved'].includes(m.status)
                    ).length}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="In Progress"
                    value={getActiveMilestones(selectedProject.milestones).filter(m => 
                      m.status === 'in_progress'
                    ).length}
                    prefix={<PlayCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
              </Row>
            </Card>

            {/* Milestones */}
            <Card>
              <Title level={5}>
                Milestones ({getActiveMilestones(selectedProject.milestones).length})
              </Title>
              {getActiveMilestones(selectedProject.milestones).length === 0 ? (
                <Empty description="No milestones defined" />
              ) : (
                <Timeline>
                  {getActiveMilestones(selectedProject.milestones)
                    .sort((a, b) => a.milestone_number - b.milestone_number)
                    .map((milestone) => (
                      <Timeline.Item
                        key={milestone._id}
                        dot={
                          milestone.status === 'approved' || milestone.status === 'completed' ? (
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          ) : milestone.status === 'in_progress' ? (
                            <PlayCircleOutlined style={{ color: '#1890ff' }} />
                          ) : (
                            <ClockCircleOutlined style={{ color: '#d9d9d9' }} />
                          )
                        }
                      >
                        {renderMilestoneCard(milestone, selectedProject)}
                      </Timeline.Item>
                    ))}
                </Timeline>
              )}
            </Card>

            {/* Estimate Reference */}
            {selectedProject.estimate_reference && (
              <Card className="mt-6">
                <Title level={5}>Estimate Reference</Title>
                <Descriptions column={2}>
                  <Descriptions.Item label="Service Type">
                    {selectedProject.estimate_reference.service_type}
                  </Descriptions.Item>
                  <Descriptions.Item label="Area">
                    {selectedProject.estimate_reference.area_sqft} sqft
                  </Descriptions.Item>
                  <Descriptions.Item label="Subcategory">
                    {selectedProject.estimate_reference.subcategory?.label}
                  </Descriptions.Item>
                  <Descriptions.Item label="Type">
                    {selectedProject.estimate_reference.type?.label}
                  </Descriptions.Item>
               
                  <Descriptions.Item label="Status">
                    <Tag color={selectedProject.estimate_reference.status === 'deal' ? 'green' : 'blue'}>
                      {selectedProject.estimate_reference.status}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </div>
        ) : (
          <Empty description="No project data available" />
        )}
      </Modal>

      {/* Review Modal */}
      <Modal
        title="Submit Milestone Review"
        open={reviewModalVisible}
        onCancel={closeReviewModal}
        footer={null}
        destroyOnClose
      >
        {reviewingMilestone && (
          <Form form={reviewForm} layout="vertical" onFinish={submitReview}>
            <Alert
              message="Your review will help improve service quality"
              type="info"
              showIcon
              className="mb-4"
            />

            <Descriptions size="small" bordered column={1}>
              <Descriptions.Item label="Milestone">
                {reviewingMilestone.title}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                {formatCurrency(reviewingMilestone.amount)}
              </Descriptions.Item>
            </Descriptions>

            <Form.Item
              name="review"
              label="Your Review"
              rules={[{ required: true, message: 'Please provide your review' }]}
            >
              <TextArea rows={4} placeholder="Share your experience with this milestone..." />
            </Form.Item>

            <Form.Item
              name="rating"
              label="Rating (1-5)"
              rules={[
                { required: true, message: 'Please provide a rating' },
                { min: 1, max: 5, message: 'Rating must be between 1 and 5' },
              ]}
            >
              <Input type="number" min={1} max={5} />
            </Form.Item>

            <Form.Item
              name="photos"
              label="Photos (Optional)"
              extra="Upload photos if you have any"
            >
              <Upload
                listType="picture-card"
                multiple
                beforeUpload={() => false}
                accept="image/*"
                maxCount={5}
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={closeReviewModal}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submittingReview}
                >
                  Submit Review
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default CustomerProjects;