// src/pages/customer/BillsView.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  Table,
  Tag,
  Button,
  Typography,
  Space,
  Alert,
  message,
  Spin,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Statistic,
  Avatar,
  Tooltip,
  Badge,
  Descriptions,
  Popconfirm,
  Timeline,
  Progress,
  Select,
  Image,
  List,
  Divider,
  Collapse
} from "antd";
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  DownloadOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  UserOutlined,
  ProjectOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  FileDoneOutlined,
  FieldTimeOutlined,
  PaperClipOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../custom/CustomTable";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

const CustomerBillsView = () => {
  const { user } = useSelector((s) => s.auth);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentForm] = Form.useForm();
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });

  // Function to find matching milestone in project
  const findMatchingMilestone = useCallback((bill) => {
    if (!bill.project_id || !bill.milestone_id) return null;
    
    const project = bill.project_id;
    const milestoneId = bill.milestone_id;
    
    // If milestone_id is an object, return it
    if (typeof milestoneId === 'object') {
      return milestoneId;
    }
    
    // If milestone_id is a string, find matching milestone in project milestones array
    if (Array.isArray(project.milestones)) {
      return project.milestones.find(milestone => milestone._id === milestoneId);
    }
    
    return null;
  }, []);

  // Flatten bills for CustomTable search
  const flattenBillsForSearch = useCallback((list = []) => {
    const normalize = (str) => (str || "").toString().trim();
    
    return list.map((bill) => {
      const price = bill?.price || 0;
      const status = bill?.paid_by_customer ? "paid" : "pending";
      const projectTitle = bill?.project_id?.title || "";
      const milestone = findMatchingMilestone(bill);
      const milestoneTitle = milestone?.title || bill?.milestone_id || "Milestone";
      const customerName = bill?.customer_id?.name 
        ? `${bill.customer_id.name.first_name || ""} ${bill.customer_id.name.last_name || ""}`.trim()
        : "";
      const createdAt = bill?.createdAt ? dayjs(bill.createdAt).format('DD/MM/YYYY') : "";
      const projectCode = bill?.project_id?.Code || "";
      
      return {
        ...bill,
        __search_price: normalize(price),
        __search_status: normalize(status),
        __search_project: normalize(projectTitle),
        __search_milestone: normalize(milestoneTitle),
        __search_customer: normalize(customerName),
        __search_created: normalize(createdAt),
        __search_code: normalize(projectCode),
      };
    });
  }, [findMatchingMilestone]);

  // Fetch customer bills
  const fetchCustomerBills = useCallback(
    async (page = 1, limit = 10) => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const response = await apiService.get(
          "/freelancer/projects/get-milestone-bill-by-customerid",
          {
            customer_id: user.id,
            page,
            limit,
          }
        );

        if (response && response.data) {
          const flattenedBills = flattenBillsForSearch(response.data);
          setBills(flattenedBills);
          
          if (response.pagination) {
            setPagination({
              currentPage: response.pagination.page || 1,
              totalPages: response.pagination.totalPages || 1,
              totalResults: response.pagination.total || response.data.length,
              itemsPerPage: response.pagination.limit || limit,
            });
          } else {
            setPagination({
              currentPage: 1,
              totalPages: 1,
              totalResults: response.data.length,
              itemsPerPage: limit,
            });
          }
        } else {
          throw new Error(response.message || "Failed to load bills");
        }
      } catch (err) {
        console.error("Error fetching bills:", err);
        setError(err.response?.data?.message || err.message || "Failed to load bills");
        message.error("Could not load bills");
      } finally {
        setLoading(false);
      }
    },
    [user?.id, flattenBillsForSearch]
  );

  // Refresh bills
  const refreshBills = async () => {
    setRefreshing(true);
    await fetchCustomerBills(pagination.currentPage);
    setRefreshing(false);
    message.success("Bills refreshed");
  };

  // Update bill payment status
  const updateBillPayment = async (billId) => {
    setProcessingPayment(true);
    try {
      const payload = {
        is_paid: true,
        paid_by_customer: true,
      };

      const response = await apiService.post(
        `/freelancer/projects/update-milestone-bill?id=${billId}`,
        payload
      );
      
      if (response.message) {
        message.success(response.message);
        setPaymentModalVisible(false);
        paymentForm.resetFields();
        fetchCustomerBills(); // Refresh the list
      } else {
        message.error("Failed to update payment status");
      }
    } catch (err) {
      console.error("Payment update error:", err);
      message.error(err.response?.data?.message || "Failed to update payment status");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Open payment modal
  const openPaymentModal = (bill) => {
    setSelectedBill(bill);
    setPaymentModalVisible(true);
    paymentForm.setFieldsValue({
      bill_id: bill._id,
      amount: bill.price,
      milestone_title: findMatchingMilestone(bill)?.title || bill.milestone_id,
      project_title: bill.project_id?.title,
    });
  };

  // Open details modal
  const openDetailsModal = (bill) => {
    setSelectedBill(bill);
    setDetailsModalVisible(true);
  };

  // Close all modals
  const closeModals = () => {
    setDetailsModalVisible(false);
    setPaymentModalVisible(false);
    setSelectedBill(null);
    paymentForm.resetFields();
  };

  // Download bill as PDF
  const downloadBillPDF = (bill) => {
    message.info("PDF download functionality will be implemented");
    // Implement PDF generation logic here
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalAmount = bills.reduce((sum, bill) => sum + (bill.price || 0), 0);
    const pendingBills = bills.filter(bill => !bill.paid_by_customer).length;
    const paidBills = bills.filter(bill => bill.paid_by_customer).length;
    const totalBills = bills.length;

    return {
      totalAmount,
      pendingBills,
      paidBills,
      totalBills,
    };
  }, [bills]);

  useEffect(() => {
    if (user?.id) {
      fetchCustomerBills();
    }
  }, [fetchCustomerBills, user?.id]);

  // Get milestone details
  const getMilestoneDetails = useCallback((bill) => {
    const milestone = findMatchingMilestone(bill);
    
    if (milestone) {
      return {
        ...milestone,
        amount: milestone.amount || bill.price,
        title: milestone.title || "Milestone",
        description: milestone.description || "",
        progress: milestone.progress || 0,
        status: milestone.status || "unknown",
        start_date: milestone.start_date,
        end_date: milestone.end_date,
      };
    }
    
    return {
      title: bill.milestone_id || "Milestone",
      amount: bill.price || 0,
      status: "unknown"
    };
  }, [findMatchingMilestone]);

  // Render milestone photos
  const renderMilestonePhotos = (photos) => {
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return <Text type="secondary">No photos available</Text>;
    }
    
    return (
      <Space wrap>
        {photos.map((photo, index) => (
          <Image
            key={index}
            src={photo}
            width={80}
            height={80}
            style={{ objectFit: 'cover', borderRadius: 6 }}
            preview
          />
        ))}
      </Space>
    );
  };



  // Table Columns
  const columns = useMemo(
    () => [
      {
        key: "bill_info",
        title: "Bill Details",
        width: 280,
        render: (_, record) => {
          const milestone = getMilestoneDetails(record);
          const project = record.project_id;
          
          return (
            <div className="flex items-center gap-3">
              <Avatar
                shape="square"
                size="large"
                icon={<FileTextOutlined />}
                style={{ backgroundColor: THEME.bgLight, color: THEME.primary }}
              />
              <div>
                <div className="font-semibold text-gray-800 text-base">
                  {milestone.title}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {project?.Code && (
                    <Tag color="blue" className="text-xs">
                      {project.Code}
                    </Tag>
                  )}
                  <Text type="secondary" className="text-xs">
                    {project?.title || "Project"}
                  </Text>
                </div>
                <div className="text-xs text-gray-500">
                  Created: {dayjs(record.createdAt).format('DD MMM YYYY')}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        key: "customer_info",
        title: "Customer",
        width: 180,
        render: (_, record) => {
          const customer = record.customer_id;
          if (!customer) return <Text type="secondary">—</Text>;
          
          return (
            <div className="flex flex-col">
              <span className="font-medium text-gray-700">
                {customer.name?.first_name} {customer.name?.last_name}
              </span>
              <span className="text-xs text-gray-500">
                <MailOutlined className="mr-1" />
                {customer.email}
              </span>
              {customer.mobile?.number && (
                <span className="text-xs text-gray-500">
                  <PhoneOutlined className="mr-1" />
                  {customer.mobile.country_code} {customer.mobile.number}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "amount",
        title: "Amount",
        width: 120,
        render: (_, record) => (
          <div className="font-semibold text-gray-700">
            AED{Number(record.price || 0).toLocaleString()}
          </div>
        ),
      },
      {
        key: "status",
        title: "Payment Status",
        width: 150,
        render: (_, record) => {
          const isPaid = record.paid_by_customer;
          return (
            <Tag
              color={isPaid ? THEME.success : THEME.warning}
              icon={isPaid ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
              style={{ borderRadius: 12, padding: "2px 10px" }}
            >
              {isPaid ? "Paid" : "Pending"}
            </Tag>
          );
        },
      },
      {
        key: "created_at",
        title: "Issued Date",
        width: 120,
        render: (_, record) => (
          <div className="flex flex-col">
            <Text className="text-sm">
              {dayjs(record.createdAt).format('DD/MM/YYYY')}
            </Text>
            <Text type="secondary" className="text-xs">
              {dayjs(record.createdAt).format('hh:mm A')}
            </Text>
          </div>
        ),
      },
      {
        key: "actions",
        title: "Actions",
        width: 180,
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
                onClick={() => openDetailsModal(record)}
                style={{ borderColor: THEME.primary, color: THEME.primary }}
              />
            </Tooltip>
            {!record.paid_by_customer && (
              <Tooltip title="Make Payment">
                <Button
                  type="primary"
                  size="small"
                  shape="circle"
                  icon={<CreditCardOutlined />}
                  onClick={() => openPaymentModal(record)}
                  style={{ background: THEME.success, borderColor: THEME.success }}
                />
              </Tooltip>
            )}
            <Tooltip title="Download Bill">
              <Button
                type="default"
                size="small"
                shape="circle"
                icon={<DownloadOutlined />}
                onClick={() => downloadBillPDF(record)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [THEME, getMilestoneDetails]
  );

  const handlePageChange = (page, limit) => {
    fetchCustomerBills(page, limit);
  };

  if (loading && !refreshing && bills.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading your bills..." />
      </div>
    );
  }

  if (error && bills.length === 0) {
    return (
      <div className="p-6">
        <Alert
          message="Error Loading Bills"
          description={error}
          type="error"
          showIcon
          className="mb-6"
        />
        <Button icon={<ReloadOutlined />} onClick={() => fetchCustomerBills()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={3} style={{ margin: 0 }}>My Bills & Payments</Title>
            <Text type="secondary">View and manage your project milestone bills</Text>
          </div>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={refreshBills} 
            loading={refreshing}
          >
            Refresh Bills
          </Button>
        </div>

        {/* Summary Stats */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={6}>
            <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
              <Statistic 
                title="Total Bills" 
                value={stats.totalBills} 
                prefix={<FileTextOutlined style={{ color: THEME.primary }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.warning }}>
              <Statistic
                title="Pending Payment"
                value={stats.pendingBills}
                prefix={<ClockCircleOutlined style={{ color: THEME.warning }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.success }}>
              <Statistic
                title="Paid Bills"
                value={stats.paidBills}
                prefix={<CheckCircleOutlined style={{ color: THEME.success }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.secondary }}>
              <Statistic
                title="Total Amount"
                value={stats.totalAmount}
                precision={0}
                prefix={<DollarOutlined style={{ color: THEME.secondary }} />}
                formatter={value => `AED${value.toLocaleString()}`}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Bills Table */}
      <Card bordered={false} className="shadow-md rounded-lg" bodyStyle={{ padding: 0 }}>
        <div className="p-0">
          {bills.length === 0 ? (
            <div className="p-8 text-center">
              <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <Title level={4} className="text-gray-400">No Bills Found</Title>
              <Text type="secondary">You don't have any pending bills at the moment.</Text>
            </div>
          ) : (
            <CustomTable
              columns={columns}
              data={bills}
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

      {/* Bill Details Modal */}
      <Modal
        title="Bill Details"
        open={detailsModalVisible}
        onCancel={closeModals}
        footer={[
          <Button key="close" onClick={closeModals}>
            Close
          </Button>,
          selectedBill && !selectedBill.paid_by_customer && (
            <Button
              key="pay"
              type="primary"
              icon={<CreditCardOutlined />}
              onClick={() => {
                setDetailsModalVisible(false);
                openPaymentModal(selectedBill);
              }}
            >
              Make Payment
            </Button>
          ),
        ]}
        width={900}
        style={{ top: 20 }}
      >
        {selectedBill && (
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

            {/* Project Info */}
            {selectedBill.project_id && (
              <Card size="small" title="Project Information" className="mb-4">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Project Title">
                    <Text strong>{selectedBill.project_id.title}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Project Code">
                    <Tag color="blue">{selectedBill.project_id.Code}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Budget">
                    <Text strong>AED{Number(selectedBill.project_id.budget || 0).toLocaleString()}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={selectedBill.project_id.status === 'completed' ? 'green' : 'blue'}>
                      {selectedBill.project_id.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Duration">
                    {dayjs(selectedBill.project_id.start_date).format('DD MMM YYYY')} - 
                    {dayjs(selectedBill.project_id.end_date).format('DD MMM YYYY')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Client">
                    {selectedBill.project_id.client_name}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Milestone Details */}
            {selectedBill.milestone_id && (
              <Card size="small" title="Milestone Details" className="mb-4">
                {(() => {
                  const milestone = findMatchingMilestone(selectedBill);
                  
                  if (!milestone) {
                    return (
                      <Alert
                        message="Milestone Information"
                        description={`Milestone ID: ${selectedBill.milestone_id}`}
                        type="info"
                        showIcon
                      />
                    );
                  }
                  
                  return (
                    <>
                      <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Milestone Title" span={2}>
                          <Text strong>{milestone.title}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Description">
                          {milestone.description || "No description"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Milestone Number">
                          {milestone.milestone_number}
                        </Descriptions.Item>
                        <Descriptions.Item label="Amount">
                          <Text strong>AED{Number(milestone.amount || 0).toLocaleString()}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Weightage">
                          {milestone.milestone_weightage}%
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                          <Tag color={
                            milestone.status === 'approved' ? 'green' :
                            milestone.status === 'in_progress' ? 'blue' :
                            milestone.status === 'pending' ? 'orange' : 'default'
                          }>
                            {milestone.status}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Start Date">
                          {dayjs(milestone.start_date).format('DD MMM YYYY')}
                        </Descriptions.Item>
                        <Descriptions.Item label="End Date">
                          {dayjs(milestone.end_date).format('DD MMM YYYY')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Progress">
                          {milestone.progress}%
                        </Descriptions.Item>
                        <Descriptions.Item label="Customer Approval Required">
                          <Tag color={milestone.customer_approval_after_completion ? 'green' : 'red'}>
                            {milestone.customer_approval_after_completion ? 'Yes' : 'No'}
                          </Tag>
                        </Descriptions.Item>
                      </Descriptions>

                      {/* Progress Bar */}
                      {/* <div className="mt-4">
                        <div className="flex justify-between mb-1">
                          <Text>Milestone Progress</Text>
                          <Text strong>{milestone.progress}%</Text>
                        </div>
                        <Progress 
                          percent={milestone.progress} 
                          status={milestone.progress === 100 ? 'success' : 'active'}
                        />
                      </div> */}

                      {/* Photos */}
                 

                     
                    </>
                  );
                })()}
              </Card>
            )}

            {/* Bill Timeline */}
           
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        title="Confirm Payment"
        open={paymentModalVisible}
        onCancel={closeModals}
        footer={null}
        width={500}
        destroyOnClose
      >
        {selectedBill && (
          <Form
            form={paymentForm}
            layout="vertical"
            onFinish={() => updateBillPayment(selectedBill._id)}
          >
            <Alert
              message="Payment Confirmation"
              description="Are you sure you want to mark this bill as paid?"
              type="info"
              showIcon
              className="mb-6"
            />

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <Text strong>Bill Details</Text>
                <Tag color="blue">#{selectedBill._id.slice(-8).toUpperCase()}</Tag>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Text type="secondary">Milestone:</Text>
                  <Text strong>
                    {findMatchingMilestone(selectedBill)?.title || selectedBill.milestone_id}
                  </Text>
                </div>
                
                <div className="flex justify-between">
                  <Text type="secondary">Project:</Text>
                  <Text strong>
                    {selectedBill.project_id?.title || "Project"}
                    {selectedBill.project_id?.Code && (
                      <Tag color="blue" className="ml-2">
                        {selectedBill.project_id.Code}
                      </Tag>
                    )}
                  </Text>
                </div>
                
                <div className="flex justify-between">
                  <Text type="secondary">Amount:</Text>
                  <Text strong className="text-xl">
                    AED{Number(selectedBill.price || 0).toLocaleString()}
                  </Text>
                </div>
                
                <div className="flex justify-between">
                  <Text type="secondary">Status:</Text>
                  <Tag color="orange">Pending</Tag>
                </div>
              </div>
            </div>

            <Alert
              message="Payment Instructions"
              description={
                <div className="space-y-2">
                  <div>1. You can make payment via bank transfer or UPI</div>
                  <div>2. After payment, confirm here to update the status</div>
                  <div>3. Keep your transaction reference for records</div>
                </div>
              }
              type="warning"
              showIcon
              className="mb-6"
            />

            <div className="flex justify-end gap-3 mt-6">
              <Button onClick={closeModals}>
                Cancel
              </Button>
              <Popconfirm
                title="Confirm Payment"
                description="Are you sure you want to mark this bill as paid?"
                onConfirm={() => paymentForm.submit()}
                okText="Yes, Confirm"
                cancelText="Cancel"
              >
                <Button
                  type="primary"
                  loading={processingPayment}
                  icon={<CheckCircleOutlined />}
                >
                  Confirm Payment
                </Button>
              </Popconfirm>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default CustomerBillsView;