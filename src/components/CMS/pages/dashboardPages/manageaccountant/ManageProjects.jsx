// src/pages/accountant/ManageProjects.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Tabs,
  Table,
  Tag,
  Button,
  Collapse,
  Card,
  Space,
  Progress,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
  Popconfirm,
  Alert,
  Row,
  Col,
  Statistic,
  Badge,
  Descriptions,
  Avatar,
  Tooltip,
  Typography,
  Divider,
  Timeline,
  Image,
  List,
} from "antd";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";
import CustomTable from '../../../pages/custom/CustomTable';
import {
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  Plus,
  Eye,
  FileCheck,
  Send,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Receipt,
  FileSearch,
  ExternalLink,
} from "lucide-react";

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const XOTO_LOGO = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTUwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMjg3NEE2Ii8+CjxwYXRoIGQ9Ik0zMCAxNUw0MDMgzNUw1MCAxNUg2MEw0NSw0MEg1NUwzMCwxNVoiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9Ijc1IiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSI+WFBPVE8gQ09SUDwvdGV4dD4KPC9zdmc+";

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [billModalVisible, setBillModalVisible] = useState(false);
  const [billDetailsModalVisible, setBillDetailsModalVisible] = useState(false);
  const [invoiceType, setInvoiceType] = useState("tax"); // "po" or "tax"
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [milestoneBills, setMilestoneBills] = useState({});
  const [form] = Form.useForm();
  const [billForm] = Form.useForm();
  const [sendingBill, setSendingBill] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });

  // Flatten projects for CustomTable
  const flattenProjectsForSearch = (list = []) => {
    const normalize = (str) => (str || "").toString().trim();
    
    return list.map((project) => {
      const title = project?.title || "";
      const budget = project?.budget || 0;
      const status = project?.status || "";
      const clientName = project?.customer?.name 
        ? `${project.customer.name.first_name || ""} ${project.customer.name.last_name || ""}`.trim()
        : "";
      const clientEmail = project?.customer?.email || "";
      
      const totalMilestones = project.milestones?.length || 0;
      const completedMilestones = project.completed_milestones || 0;
      const progressPercentage = project.progress_percentage || 0;
      
      return {
        ...project,
        __search_title: normalize(title),
        __search_budget: normalize(budget),
        __search_status: normalize(status),
        __search_client: normalize(clientName),
        __search_email: normalize(clientEmail),
        __search_milestones: normalize(`${completedMilestones}/${totalMilestones}`),
        __search_progress: normalize(`${progressPercentage}%`),
      };
    });
  };

  // Fetch Accountant's Assigned Projects
  const fetchProjects = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await apiService.get("freelancer/projects/my/get", { page, limit });
      
      if (response.success) {
        const flattenedProjects = flattenProjectsForSearch(response.projects || []);
        setProjects(flattenedProjects);
        
        if (response.pagination) {
          setPagination({
            currentPage: response.pagination.page || 1,
            totalPages: response.pagination.totalPages || 1,
            totalResults: response.pagination.total || response.projects?.length || 0,
            itemsPerPage: response.pagination.limit || limit,
          });
        }
        
        // Fetch bills for all milestones
        await fetchAllMilestoneBills(flattenedProjects);
      } else {
        throw new Error(response.message || "Failed to load projects");
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.message || "Failed to load assigned projects");
      message.error("Could not load projects");
    } finally {
      setLoading(false);
    }
  };

  // Fetch bills for all milestones
  const fetchAllMilestoneBills = async (projectsData) => {
    const billsMap = {};
    
    for (const project of projectsData) {
      if (project.milestones && Array.isArray(project.milestones)) {
        for (const milestone of project.milestones) {
          try {
            const response = await apiService.get(
              "/freelancer/projects/get-milestone-bill-by-milestoneid",
              { milestone_id: milestone._id }
            );
            
            if (response && response.data && response.data.length > 0) {
              billsMap[milestone._id] = response.data[0];
              // Update milestone with bill_sent status
              milestone.bill_sent = true;
              milestone.bill_id = response.data[0]._id;
              milestone.is_paid = response.data[0].is_paid;
              milestone.paid_by_customer = response.data[0].paid_by_customer;
            }
          } catch (err) {
            console.error(`Error fetching bill for milestone ${milestone._id}:`, err);
            // Don't show error to user, just skip
          }
        }
      }
    }
    
    setMilestoneBills(billsMap);
  };

  // Fetch bill for specific milestone
  const fetchMilestoneBill = async (milestoneId) => {
    try {
      const response = await apiService.get(
        "/freelancer/projects/get-milestone-bill-by-milestoneid",
        { milestone_id: milestoneId }
      );
      
      if (response && response.data && response.data.length > 0) {
        setMilestoneBills(prev => ({
          ...prev,
          [milestoneId]: response.data[0]
        }));
        return response.data[0];
      }
      return null;
    } catch (err) {
      console.error(`Error fetching bill for milestone ${milestoneId}:`, err);
      message.error("Failed to load bill details");
      return null;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // API to send milestone bill to customer
  const sendMilestoneBill = async (values) => {
    if (!selectedProject || !selectedMilestone) return;
    
    setSendingBill(true);
    try {
      const payload = {
        project_id: selectedProject._id,
        customer_id: selectedProject.customer?._id,
        milestone_id: selectedMilestone._id,
        price: values.price,
        estimate_id: selectedProject.estimate_reference?._id || null,
        notes: values.notes || "",
      };

      const response = await apiService.post(
        "/freelancer/projects/send-milestone-bill-to-customer",
        payload
      );
      
      if (response.message) {
        message.success(response.message);
        setBillModalVisible(false);
        billForm.resetFields();
        
        // Fetch updated bill
        await fetchMilestoneBill(selectedMilestone._id);
        
        // Refresh projects list
        fetchProjects();
      }
    } catch (err) {
      console.error("Error sending bill:", err);
      message.error(err.response?.data?.message || "Failed to send bill");
    } finally {
      setSendingBill(false);
    }
  };

  // Open Bill Modal
  const openBillModal = (project, milestone) => {
    setSelectedProject(project);
    setSelectedMilestone(milestone);
    setBillModalVisible(true);
    
    billForm.setFieldsValue({
      project: project.title,
      milestone: milestone.title,
      customer: `${project.customer?.name?.first_name} ${project.customer?.name?.last_name}`,
      price: milestone.amount,
      notes: "",
    });
  };

  // Open Bill Details Modal
  const openBillDetailsModal = async (project, milestone) => {
    setSelectedProject(project);
    setSelectedMilestone(milestone);
    
    // Fetch bill details
    const bill = await fetchMilestoneBill(milestone._id);
    if (bill) {
      setSelectedBill(bill);
      setBillDetailsModalVisible(true);
    } else {
      message.info("No bill found for this milestone");
    }
  };

  // Download bill as PDF
  const downloadBillPDF = async (bill) => {
    if (!bill) {
      message.error("No bill data available");
      return;
    }
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Logo & Header
      doc.addImage(XOTO_LOGO, "PNG", 14, y, 40, 15);
      doc.setFontSize(18);
      doc.setTextColor(40, 116, 166);
      doc.text("MILESTONE INVOICE", pageWidth / 2, y + 10, { align: "center" });

      y += 30;

      // Bill Details
      doc.setFontSize(10);
      doc.text(`Bill #: ${bill._id.slice(-8).toUpperCase()}`, 14, y);
      doc.text(`Date: ${dayjs(bill.createdAt).format("DD MMM YYYY")}`, 14, y + 6);
      doc.text(`Status: ${bill.paid_by_customer ? "PAID" : "PENDING"}`, 14, y + 12);

      doc.text(`Project: ${selectedProject?.title || "N/A"}`, pageWidth / 2 + 10, y);
      doc.text(`Milestone: ${selectedMilestone?.title || "N/A"}`, pageWidth / 2 + 10, y + 6);
      doc.text(`Amount: AED${Number(bill.price || 0).toLocaleString()}`, pageWidth / 2 + 10, y + 12);

      y += 30;

      // Customer Details
      doc.setFontSize(12);
      doc.setTextColor(40, 116, 166);
      doc.text("Customer Information", 14, y);
      doc.setFontSize(10);
      doc.setTextColor(0);
      
      if (bill.customer_id) {
        y += 10;
        doc.text(`Name: ${bill.customer_id.name?.first_name} ${bill.customer_id.name?.last_name}`, 14, y);
        y += 6;
        doc.text(`Email: ${bill.customer_id.email}`, 14, y);
        y += 6;
        doc.text(`Phone: ${bill.customer_id.mobile?.country_code} ${bill.customer_id.mobile?.number}`, 14, y);
      }

      y += 15;

      // Payment Status
      doc.setFontSize(12);
      doc.setTextColor(40, 116, 166);
      doc.text("Payment Status", 14, y);
      doc.setFontSize(10);
      doc.setTextColor(0);
      
      y += 10;
      doc.text(`Paid: ${bill.paid_by_customer ? "YES" : "NO"}`, 14, y);
      y += 6;
      doc.text(`Payment Date: ${bill.paid_by_customer ? dayjs(bill.updatedAt).format("DD MMM YYYY") : "Pending"}`, 14, y);
      y += 6;
      doc.text(`Amount: AED${Number(bill.price || 0).toLocaleString()}`, 14, y);

      y += 15;

      // Bill Timeline
      doc.setFontSize(12);
      doc.setTextColor(40, 116, 166);
      doc.text("Bill Timeline", 14, y);
      doc.setFontSize(9);
      doc.setTextColor(0);
      
      y += 10;
      doc.text(`• Created: ${dayjs(bill.createdAt).format("DD MMM YYYY, hh:mm A")}`, 14, y);
      y += 6;
      if (bill.updatedAt !== bill.createdAt) {
        doc.text(`• Updated: ${dayjs(bill.updatedAt).format("DD MMM YYYY, hh:mm A")}`, 14, y);
        y += 6;
      }
      if (bill.paid_by_customer) {
        doc.text(`• Paid: ${dayjs(bill.updatedAt).format("DD MMM YYYY, hh:mm A")}`, 14, y);
        y += 6;
      }

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text("Bank: HDFC Bank | A/c: 50200078901234 | IFSC: HDFC0000123", 14, doc.internal.pageSize.getHeight() - 30);
      doc.text("UPI: xoto.corp@okhdfcbank", 14, doc.internal.pageSize.getHeight() - 20);
      doc.text("This is a computer-generated invoice", pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

      doc.save(`Bill-${bill._id.slice(-8).toUpperCase()}.pdf`);
      message.success("Bill downloaded successfully!");
    } catch (err) {
      console.error("Error generating PDF:", err);
      message.error("Failed to download bill");
    }
  };

  const getStatusColor = (status) => {
    const map = {
      completed: "green",
      in_progress: "blue",
      pending: "orange",
      approved: "green",
      release_requested: "gold",
      draft: "gray",
      assigned: "purple",
    };
    return map[status] || "default";
  };

  const formatStatus = (s) => {
    const map = {
      completed: "Completed",
      in_progress: "In Progress",
      pending: "Pending",
      approved: "Approved",
      release_requested: "Payment Requested",
      draft: "Draft",
      assigned: "Assigned",
    };
    return map[s] || s.replace(/_/g, " ").toUpperCase();
  };

  // Table Columns for CustomTable
  const columns = useMemo(
    () => [
      {
        key: "project_info",
        title: "Project Details",
        width: 300,
        render: (_, record) => (
          <div className="flex items-center gap-3">
            <Avatar
              shape="square"
              size="large"
              icon={<Briefcase size={16} />}
              style={{ backgroundColor: THEME.bgLight, color: THEME.primary }}
            />
            <div>
              <div className="font-semibold text-gray-800 text-base">{record.title}</div>
              <div className="flex items-center gap-2 mt-1">
                <Text type="secondary">Client: {record.customer?.name?.first_name} {record.customer?.name?.last_name}</Text>
                <Badge 
                  count={record.milestones?.length || 0} 
                  style={{ backgroundColor: THEME.primary }}
                  title="Total Milestones"
                />
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "budget",
        title: "Budget",
        width: 140,
        render: (_, record) => (
          <span className="font-semibold text-gray-700">
            AED{Number(record.budget || 0).toLocaleString()}
          </span>
        ),
      },
     {
  key: "progress",
  title: "Progress",
  width: 180,
  render: (_, record) => {
    const milestones = (record.milestones || []).filter(m => !m.is_deleted);

    let totalWeight = 0;
    let weightedProgress = 0;
    let completedCount = 0;

    milestones.forEach((m) => {
      const weight = m.milestone_weightage || 0;
      const progress = m.progress || 0;

      totalWeight += weight;
      weightedProgress += (progress * weight) / 100;

      if (["approved", "completed"].includes(m.status)) {
        completedCount += 1;
      }
    });

    const percent =
      totalWeight > 0
        ? Math.round((weightedProgress / totalWeight) * 100)
        : 0;

    const total = milestones.length;

    return (
      <div className="w-full">
        <div className="flex justify-between text-xs mb-1 text-gray-500">
          <span>
            {completedCount}/{total} Milestones
          </span>
          <span>{percent}%</span>
        </div>

        <Progress
          percent={percent}
          size="small"
          status={percent === 100 ? "success" : "active"}
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
        render: (_, record) => {
          const status = record.status;
          const color = getStatusColor(status);
          
          return (
            <Tag color={color} style={{ borderRadius: 12, padding: "2px 10px" }}>
              {formatStatus(status)}
            </Tag>
          );
        },
      },
      {
        key: "milestone_status",
        title: "Milestone Status",
        width: 180,
        render: (_, record) => {
          const milestones = record.milestones || [];
          const pendingBills = milestones.filter(m => 
            m.status === "approved" && !m.bill_sent
          ).length;
          
          const sentBills = milestones.filter(m => 
            m.bill_sent
          ).length;
          
          const paidBills = milestones.filter(m => 
            m.paid_by_customer
          ).length;
          
          return (
            <Space direction="vertical" size="small">
              <div className="flex items-center">
                <Badge count={pendingBills} style={{ backgroundColor: THEME.warning }} />
                <Text type="secondary" className="ml-2">Pending Bills</Text>
              </div>
              <div className="flex items-center">
                <Badge count={sentBills} style={{ backgroundColor: THEME.secondary }} />
                <Text type="secondary" className="ml-2">Sent Bills</Text>
              </div>
              <div className="flex items-center">
                <Badge count={paidBills} style={{ backgroundColor: THEME.success }} />
                <Text type="secondary" className="ml-2">Paid Bills</Text>
              </div>
            </Space>
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
                icon={<Eye size={14} />}
                onClick={() => setExpandedProject(expandedProject === record._id ? null : record._id)}
                style={{ borderColor: THEME.primary, color: THEME.primary }}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [THEME, expandedProject]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProjects = pagination.totalResults;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const pendingBills = projects.reduce((sum, p) => {
      const milestones = p.milestones || [];
      return sum + milestones.filter(m => 
        m.status === "approved" && !m.bill_sent
      ).length;
    }, 0);
    const sentBills = projects.reduce((sum, p) => {
      const milestones = p.milestones || [];
      return sum + milestones.filter(m => m.bill_sent).length;
    }, 0);
    const paidBills = projects.reduce((sum, p) => {
      const milestones = p.milestones || [];
      return sum + milestones.filter(m => m.paid_by_customer).length;
    }, 0);
    const completedProjects = projects.filter(p => p.status === "completed").length;

    return {
      totalProjects,
      totalBudget,
      pendingBills,
      sentBills,
      paidBills,
      completedProjects,
    };
  }, [projects, pagination.totalResults]);

  const handlePageChange = (page, limit) => {
    fetchProjects(page, limit);
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading your projects..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert 
        message="Error Loading Projects" 
        description={error} 
        type="error" 
        showIcon 
        className="m-6"
      />
    );
  }

  if (projects.length === 0 && !loading) {
    return (
      <Empty 
        description="No projects assigned yet" 
        className="mt-20"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="flex items-center gap-3">
              <Briefcase className="text-green-600" /> Accountant Projects Management
            </Title>
            <Text type="secondary">Manage finances, generate bills, POs & Tax Invoices</Text>
          </div>
          <Button 
            icon={<RefreshCw size={16} />} 
            onClick={() => fetchProjects()}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={6}>
          <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
            <Statistic 
              title="Total Projects" 
              value={stats.totalProjects} 
              prefix={<Briefcase style={{ color: THEME.primary }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.secondary }}>
            <Statistic
              title="Pending Bills"
              value={stats.pendingBills}
              prefix={<AlertCircle style={{ color: THEME.secondary }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.warning }}>
            <Statistic
              title="Sent Bills"
              value={stats.sentBills}
              prefix={<Send style={{ color: THEME.warning }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.success }}>
            <Statistic
              title="Paid Bills"
              value={stats.paidBills}
              prefix={<CheckCircle style={{ color: THEME.success }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* CustomTable */}
      <Card bordered={false} className="shadow-md rounded-lg mb-6" bodyStyle={{ padding: 0 }}>
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
      </Card>

      {/* Expanded Project Details */}
      {expandedProject && projects.find(p => p._id === expandedProject) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <Title level={4} className="mb-0">
                {projects.find(p => p._id === expandedProject)?.title}
              </Title>
              <Button
                type="text"
                size="large"
                icon={<ChevronUp />}
                onClick={() => setExpandedProject(null)}
              />
            </div>
            
            <Tabs defaultActiveKey="milestones">
              <TabPane tab={`Milestones (${projects.find(p => p._id === expandedProject)?.milestones?.length || 0})`} key="milestones">
                <Collapse accordion>
                  {projects.find(p => p._id === expandedProject)?.milestones?.map((milestone) => {
                    const bill = milestoneBills[milestone._id];
                    const hasBill = bill && bill._id;
                    const isPaid = bill?.paid_by_customer || false;
                    const isSent = milestone.bill_sent || false;
                    
                    return (
                      <Panel
                        key={milestone._id}
                        header={
                          <div className="flex justify-between items-center w-full">
                            <Space>
                              <Text strong>{milestone.title}</Text>
                              <Tag color={getStatusColor(milestone.status)}>
                                {formatStatus(milestone.status)}
                              </Tag>
                              {isSent && (
                                <Tag color={isPaid ? "green" : "blue"} icon={<CheckCircle size={12} />}>
                                  {isPaid ? "Paid" : "Bill Sent"}
                                </Tag>
                              )}
                            </Space>
                            <Space>
                              <Text strong>AED{milestone.amount?.toLocaleString()}</Text>
                              {milestone.status === "approved" && !isSent && (
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<Send size={12} />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openBillModal(
                                      projects.find(p => p._id === expandedProject),
                                      milestone
                                    );
                                  }}
                                >
                                  Send Bill
                                </Button>
                              )}
                              {isSent && (
                                <Button
                                  type="default"
                                  size="small"
                                  icon={<FileSearch size={12} />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openBillDetailsModal(
                                      projects.find(p => p._id === expandedProject),
                                      milestone
                                    );
                                  }}
                                >
                                  View Bill
                                </Button>
                              )}
                            </Space>
                          </div>
                        }
                      >
                        <Descriptions column={2} bordered size="small" className="mb-4">
                          <Descriptions.Item label="Description" span={2}>
                            {milestone.description}
                          </Descriptions.Item>
                          <Descriptions.Item label="Amount">
                            AED{milestone.amount?.toLocaleString()}
                          </Descriptions.Item>
                          <Descriptions.Item label="Progress">
                            {milestone.progress}%
                          </Descriptions.Item>
                          <Descriptions.Item label="Start Date">
                            {dayjs(milestone.start_date).format("DD MMM YYYY")}
                          </Descriptions.Item>
                          <Descriptions.Item label="End Date">
                            {dayjs(milestone.end_date).format("DD MMM YYYY")}
                          </Descriptions.Item>
                          {hasBill && (
                            <>
                              <Descriptions.Item label="Bill Status">
                                <Tag color={isPaid ? "green" : "orange"}>
                                  {isPaid ? "Paid" : "Pending Payment"}
                                </Tag>
                              </Descriptions.Item>
                              <Descriptions.Item label="Bill Amount">
                                AED{Number(bill.price || 0).toLocaleString()}
                              </Descriptions.Item>
                            </>
                          )}
                        </Descriptions>
                        
                        <div className="my-3">
                          <Progress percent={milestone.progress} status={milestone.progress === 100 ? 'success' : 'active'} />
                        </div>
                        
                        {hasBill && (
                          <div className="mb-4">
                            <Alert
                              message="Bill Information"
                              description={
                                <Space direction="vertical" size="small" className="w-full">
                                  <div className="flex justify-between">
                                    <Text strong>Bill ID:</Text>
                                    <Text>{bill._id.slice(-8).toUpperCase()}</Text>
                                  </div>
                                  <div className="flex justify-between">
                                    <Text strong>Created:</Text>
                                    <Text>{dayjs(bill.createdAt).format('DD MMM YYYY, hh:mm A')}</Text>
                                  </div>
                                  <div className="flex justify-between">
                                    <Text strong>Last Updated:</Text>
                                    <Text>{dayjs(bill.updatedAt).format('DD MMM YYYY, hh:mm A')}</Text>
                                  </div>
                                  <div className="flex justify-between">
                                    <Text strong>Paid by Customer:</Text>
                                    <Tag color={isPaid ? "green" : "orange"}>
                                      {isPaid ? "Yes" : "No"}
                                    </Tag>
                                  </div>
                                </Space>
                              }
                              type="info"
                              showIcon
                              action={
                                <Button
                                  type="link"
                                  icon={<Download size={14} />}
                                  onClick={() => downloadBillPDF(bill)}
                                >
                                  Download
                                </Button>
                              }
                            />
                          </div>
                        )}
                        
                        {milestone.daily_updates?.length > 0 && (
                          <div className="bg-gray-50 p-3 rounded mt-3">
                            <Text strong>Recent Updates:</Text>
                            {milestone.daily_updates.slice(0, 3).map((update) => (
                              <div key={update._id} className="text-sm mt-1">
                                • {dayjs(update.date).format("DD MMM YYYY")}: {update.work_done}
                                {update.approval_status && (
                                  <Tag color="green" className="ml-2 text-xs">APPROVED</Tag>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </Panel>
                    );
                  })}
                </Collapse>
              </TabPane>
            </Tabs>
          </Card>
        </motion.div>
      )}

      {/* Send Bill Modal */}
      <Modal
        title="Send Milestone Bill to Customer"
        open={billModalVisible}
        onCancel={() => {
          setBillModalVisible(false);
          billForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={billForm} layout="vertical" onFinish={sendMilestoneBill}>
          <Alert
            message="Bill Information"
            description="This will send a bill notification to the customer for the selected milestone."
            type="info"
            showIcon
            className="mb-4"
          />
          
          <Form.Item label="Project" name="project">
            <Input disabled />
          </Form.Item>
          
          <Form.Item label="Milestone" name="milestone">
            <Input disabled />
          </Form.Item>
          
          <Form.Item label="Customer" name="customer">
            <Input disabled />
          </Form.Item>
          
          <Form.Item 
            label="Price" 
            name="price"
            rules={[
              { required: true, message: 'Please enter the price' },
              { type: 'number', min: 1, message: 'Price must be greater than 0' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              prefix="AED"
              placeholder="Enter bill amount"
            />
          </Form.Item>
          
          <Form.Item label="Notes (Optional)" name="notes">
            <TextArea
              rows={3}
              placeholder="Add any notes for the customer..."
              maxLength={500}
              showCount
            />
          </Form.Item>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setBillModalVisible(false)}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={sendingBill}
              icon={<Send size={16} />}
            >
              Send Bill to Customer
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Bill Details Modal */}
      <Modal
        title="Bill Details"
        open={billDetailsModalVisible}
        onCancel={() => {
          setBillDetailsModalVisible(false);
          setSelectedBill(null);
        }}
        footer={[
          <Button key="close" onClick={() => setBillDetailsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
        destroyOnClose
      >
        {selectedBill && selectedProject && selectedMilestone && (
          <div className="p-4">
            {/* Bill Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <Title level={4} className="mb-1">
                  Bill #{selectedBill._id.slice(-8).toUpperCase()}
                </Title>
                <Tag color={selectedBill.paid_by_customer ? "green" : "orange"}>
                  {selectedBill.paid_by_customer ? "Paid" : "Pending"}
                </Tag>
              </div>
              <div className="text-right">
                <Text strong className="text-2xl">
                  AED{Number(selectedBill.price || 0).toLocaleString()}
                </Text>
                <div className="text-sm text-gray-500">
                  Issued: {dayjs(selectedBill.createdAt).format('DD MMM YYYY')}
                </div>
              </div>
            </div>

            <Divider />

            {/* Project & Milestone Info */}
            <Row gutter={[16, 16]} className="mb-6">
              <Col span={12}>
                <Card size="small" title="Project Information">
                  <Text strong>{selectedProject.title}</Text>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center">
                      <Briefcase size={14} className="mr-2 text-gray-400" />
                      <Text type="secondary">{selectedProject.Code}</Text>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Milestone Information">
                  <Text strong>{selectedMilestone.title}</Text>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2 text-gray-400" />
                      <Text type="secondary">
                        {dayjs(selectedMilestone.start_date).format('DD MMM')} - 
                        {dayjs(selectedMilestone.end_date).format('DD MMM YYYY')}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Bill Details */}
            <Card size="small" title="Bill Information" className="mb-6">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Bill ID">
                  <Text copyable>{selectedBill._id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Milestone ID">
                  <Text copyable>{selectedBill.milestone_id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Customer">
                  {selectedBill.customer_id?.name?.first_name} {selectedBill.customer_id?.name?.last_name}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedBill.customer_id?.email}
                </Descriptions.Item>
                <Descriptions.Item label="Amount">
                  <Text strong>AED{Number(selectedBill.price || 0).toLocaleString()}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Status">
                  <Tag color={selectedBill.paid_by_customer ? "green" : "orange"}>
                    {selectedBill.paid_by_customer ? "Paid" : "Pending"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Is Paid">
                  <Tag color={selectedBill.is_paid ? "green" : "red"}>
                    {selectedBill.is_paid ? "Yes" : "No"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created Date">
                  {dayjs(selectedBill.createdAt).format('DD MMM YYYY, hh:mm A')}
                </Descriptions.Item>
                <Descriptions.Item label="Updated Date">
                  {dayjs(selectedBill.updatedAt).format('DD MMM YYYY, hh:mm A')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Bill Timeline */}
            <Card size="small" title="Bill Timeline">
              <Timeline>
                <Timeline.Item color="blue" dot={<Calendar size={14} />}>
                  <div className="flex justify-between">
                    <div>
                      <Text strong>Bill Created</Text>
                      <div className="text-sm text-gray-500">
                        {dayjs(selectedBill.createdAt).format('DD MMM YYYY, hh:mm A')}
                      </div>
                    </div>
                  </div>
                </Timeline.Item>
                {selectedBill.updatedAt !== selectedBill.createdAt && (
                  <Timeline.Item 
                    color={selectedBill.paid_by_customer ? "green" : "gray"} 
                    dot={selectedBill.paid_by_customer ? <CheckCircle size={14} /> : <Clock size={14} />}
                  >
                    <div className="flex justify-between">
                      <div>
                        <Text strong>
                          {selectedBill.paid_by_customer ? "Payment Received" : "Bill Updated"}
                        </Text>
                        <div className="text-sm text-gray-500">
                          {dayjs(selectedBill.updatedAt).format('DD MMM YYYY, hh:mm A')}
                        </div>
                      </div>
                    </div>
                  </Timeline.Item>
                )}
              </Timeline>
            </Card>

            {/* Customer Details */}
            {selectedBill.customer_id && (
              <Card size="small" title="Customer Details" className="mt-6">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Name">
                    {selectedBill.customer_id.name?.first_name} {selectedBill.customer_id.name?.last_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {selectedBill.customer_id.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    {selectedBill.customer_id.mobile?.country_code} {selectedBill.customer_id.mobile?.number}
                  </Descriptions.Item>
                  <Descriptions.Item label="Location">
                    {selectedBill.customer_id.location?.city}, {selectedBill.customer_id.location?.state}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageProjects;