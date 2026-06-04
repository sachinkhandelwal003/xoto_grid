import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import CustomTable from '../../../pages/custom/CustomTable';
import logo from "../../../../../assets/img/logoNew.png";
import { 
  Card, Tag, Typography, Button, Modal, Row, Col, 
  Statistic, Divider, Descriptions, Space, Spin, Table,
  Alert
} from 'antd';
import { 
  EyeOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  PrinterOutlined,
  HistoryOutlined,
  DollarOutlined,
  PercentageOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined,PhoneOutlined,EnvironmentOutlined 
} from '@ant-design/icons';
import { showErrorAlert } from '../../../../../manageApi/utils/sweetAlert';

const { Title, Text, Paragraph } = Typography;

const PURPLE_THEME = {
  primary: '#722ed1',
  success: '#52c41a',
  error: '#ff4d4f',
  warning: '#faad14',
  info: '#1890ff',
  bg: '#f9f0ff'
};

const Myestimates = () => {
  const [loading, setLoading] = useState(false);
  const [estimates, setEstimates] = useState([]);
  const [viewModal, setViewModal] = useState({ visible: false, data: null });
  const [pagination, setPagination] = useState({ currentPage: 1, totalItems: 0, itemsPerPage: 10 });

  const fetchRespondedHistory = async (page = 1) => {
    setLoading(true);
    try {
      const response = await apiService.get('/estimates/customer/my-estimates', {
        customer_progress: 'customer_responded',
        page: page,
        limit: pagination.itemsPerPage
      });

      if (response.success) {
        setEstimates(response.data || []);
        setPagination(prev => ({
          ...prev,
          currentPage: response.pagination?.page || page,
          totalItems: response.pagination?.total || 0
        }));
      }
    } catch (error) {
      showErrorAlert("Error", "Failed to load response history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRespondedHistory();
  }, []);

  const formatCurrency = (val) => `AED ${Number(val || 0).toLocaleString()}`;
  const formatDate = (date) => date ? new Date(date).toLocaleString() : 'N/A';

  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'accepted': return <CheckOutlined />;
      case 'rejected': return <CloseOutlined />;
      default: return null;
    }
  };

  const columns = [
    {
      title: 'Quotation Details',
      key: 'quotation_info',
      width: 300,
      render: (_, r) => (
        <div style={{ 
          borderLeft: `4px solid ${r.customer_response?.status === 'accepted' ? PURPLE_THEME.success : PURPLE_THEME.error}`,
          paddingLeft: '12px' 
        }}>
          <div className="flex items-center gap-2 mb-1">
            <FileTextOutlined style={{ color: PURPLE_THEME.primary }} />
            <Text strong>{r.subcategory?.label}</Text>
          </div>
          <div className="text-xs text-gray-400 mb-1">
            {r.service_type?.toUpperCase()} • {r.type?.label}
          </div>
          <div className="text-xs text-gray-500">
            <CalendarOutlined /> {new Date(r.createdAt).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      title: 'Final Quote',
      key: 'amount',
      width: 150,
      render: (_, r) => (
        <div className="text-center">
          <Text strong style={{ color: PURPLE_THEME.primary, fontSize: '16px' }}>
            {formatCurrency(r.admin_final_quotation?.grand_total)}
          </Text>
     
        </div>
      )
    },
    {
      title: 'Your Response',
      key: 'status',
      width: 150,
      render: (_, r) => {
        const status = r.customer_response?.status;
        const isAccepted = status === 'accepted';
        return (
          <div className="text-center">
            <Tag 
              icon={getStatusIcon(status)}
              color={getStatusColor(status)}
              style={{ 
                borderRadius: '20px', 
                padding: '4px 16px', 
                fontWeight: '600',
                fontSize: '12px'
              }}
            >
              {status?.toUpperCase()}
            </Tag>
            {r.customer_response?.reason && (
              <div className="text-xs text-gray-500 mt-1">
                {r.customer_response.reason}
              </div>
            )}
          </div>
        );
      }
    },
    {
      title: 'Responded On',
      key: 'responded_at',
      width: 150,
      render: (_, r) => (
        <div className="text-center">
          <div className="text-sm font-medium">
            {new Date(r.customer_response?.responded_at).toLocaleDateString('en-GB', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(r.customer_response?.responded_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      width: 120,
      render: (_, r) => (
        <Button 
          icon={<EyeOutlined />} 
          type="primary"
          size="small"
          style={{ background: PURPLE_THEME.primary }}
          onClick={() => setViewModal({ visible: true, data: r })}
          block
        >
          View
        </Button>
      )
    }
  ];

  // Invoice columns for detailed breakdown
  const invoiceColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatCurrency(amount),
      align: 'right',
    },
  ];

  return (
    <div className=" ">
      <Card 
        title={
          <div className="flex items-center gap-2 pt-2">
            <div className="p-2 rounded-full" style={{ background: PURPLE_THEME.bg }}>
              <HistoryOutlined style={{ color: PURPLE_THEME.primary, fontSize: '20px' }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>Quotation History</Title>
              <Text type="secondary">View all your accepted and rejected quotations</Text>
            </div>
          </div>
        } 
        className="shadow-sm rounded-xl border-0"
      >
        <CustomTable
          columns={columns}
          data={estimates}
          loading={loading}
          totalItems={pagination.totalItems}
          currentPage={pagination.currentPage}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={(p) => fetchRespondedHistory(p)}
        />
      </Card>

      {/* DETAILED QUOTATION INVOICE MODAL */}
      <Modal
        title="Quotation Invoice"
        open={viewModal.visible}
        onCancel={() => setViewModal({ visible: false, data: null })}
        footer={[
          <Button 
            key="print" 
            icon={<PrinterOutlined />} 
            onClick={() => window.print()}
            style={{ borderColor: PURPLE_THEME.primary, color: PURPLE_THEME.primary }}
          >
            Print / PDF
          </Button>,
          <Button 
            key="close" 
            onClick={() => setViewModal({ visible: false, data: null })}
            type="primary"
            style={{ background: PURPLE_THEME.primary }}
          >
            Close
          </Button>
        ]}
        width={1000}
        className="invoice-modal"
      >
        {viewModal.data && (
          <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b pb-6">
              <div>
                <img src={logo} alt="logo" style={{ height: 60, marginBottom: 10 }} />
                <div className="text-gray-500 text-sm">
                  Xoto Landscape Services<br />
                  Dubai, UAE<br />
                  contact@xoto.ae
                </div>
              </div>
              <div className="text-right">
                <Title level={3} style={{ color: PURPLE_THEME.primary, margin: 0 }}>QUOTATION INVOICE</Title>
                <Text type="secondary">REF: {viewModal.data._id.slice(-8).toUpperCase()}</Text>
                <div className="mt-2">
                  <Tag color={getStatusColor(viewModal.data.customer_response?.status)} style={{ fontSize: '12px', padding: '4px 12px' }}>
                    {getStatusIcon(viewModal.data.customer_response?.status)}
                    <span className="ml-1">{viewModal.data.customer_response?.status?.toUpperCase()}</span>
                  </Tag>
                </div>
              </div>
            </div>

            {/* Customer and Response Info */}
            <Row gutter={24} className="mb-8">
              <Col span={12}>
                <Card size="small" title="Customer Information" className="h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-full" style={{ background: PURPLE_THEME.bg }}>
                      <UserOutlined style={{ color: PURPLE_THEME.primary }} />
                    </div>
                    <div>
                      <Text strong>{viewModal.data.customer?.name?.first_name} {viewModal.data.customer?.name?.last_name}</Text><br/>
                      <Text type="secondary">{viewModal.data.customer?.email}</Text>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-600 mb-1">
                      <PhoneOutlined /> {viewModal.data.customer?.mobile?.country_code} {viewModal.data.customer?.mobile?.number}
                    </div>
                    <div className="text-gray-600">
                      <EnvironmentOutlined /> {viewModal.data.customer?.location?.address}
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Response Details" className="h-full">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Tag color={getStatusColor(viewModal.data.customer_response?.status)}>
                        {viewModal.data.customer_response?.status?.toUpperCase()}
                      </Tag>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Responded On:</span>
                      <span>{formatDate(viewModal.data.customer_response?.responded_at)}</span>
                    </div>
                    {viewModal.data.customer_response?.reason && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reason:</span>
                        <span className="text-red-500">{viewModal.data.customer_response.reason}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Service Details */}
            <Card size="small" title="Service Information" className="mb-6">
              <Row gutter={16}>
                <Col span={8}>
                  <div className="mb-2">
                    <Text type="secondary">Service Type:</Text>
                    <div className="font-medium">{viewModal.data.service_type?.toUpperCase()}</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="mb-2">
                    <Text type="secondary">Category:</Text>
                    <div className="font-medium">{viewModal.data.subcategory?.label}</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="mb-2">
                    <Text type="secondary">Type:</Text>
                    <div className="font-medium">{viewModal.data.type?.label}</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="mb-2">
                    <Text type="secondary">Area:</Text>
                    <div className="font-medium">{viewModal.data.area_sqft} sq.ft</div>
                  </div>
                </Col>
                <Col span={16}>
                  <div className="mb-2">
                    <Text type="secondary">Description:</Text>
                    <div className="font-medium">{viewModal.data.description}</div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Admin Final Quotation Details */}
            {viewModal.data.admin_final_quotation && (
              <Card size="small" title="Final Quotation Details" className="mb-6">
                {/* Scope of Work */}
                {viewModal.data.admin_final_quotation.scope_of_work && (
                  <div className="mb-4">
                    <Text strong>Scope of Work:</Text>
                    <Paragraph className="mt-1 bg-gray-50 p-3 rounded">
                      {viewModal.data.admin_final_quotation.scope_of_work}
                    </Paragraph>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="border rounded-lg p-4">
                  <Text strong className="block mb-3">Price Breakdown:</Text>
                  
                  <div className="space-y-3">
                    {/* Base Price */}
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span className="font-medium">
                        {formatCurrency(viewModal.data.admin_final_quotation.price)}
                      </span>
                    </div>
                    
                    {/* Discount */}
                    {viewModal.data.admin_final_quotation.discount_percent > 0 && (
                      <div className="flex justify-between text-red-500">
                        <span>Discount ({viewModal.data.admin_final_quotation.discount_percent}%):</span>
                        <span>-{formatCurrency(viewModal.data.admin_final_quotation.discount_amount)}</span>
                      </div>
                    )}
                    
                    {/* Margin */}
                    {/* {viewModal.data.admin_final_quotation.margin_percent > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>Admin Margin ({viewModal.data.admin_final_quotation.margin_percent}%):</span>
                        <span>+{formatCurrency(viewModal.data.admin_final_quotation.margin_amount)}</span>
                      </div>
                    )} */}
                    
                    {/* Grand Total */}
                    <div className="flex justify-between text-xl font-bold text-purple-800 border-t pt-3">
                      <span>Grand Total:</span>
                      <span>{formatCurrency(viewModal.data.admin_final_quotation.grand_total)}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <Text type="secondary">Approved At:</Text>
                    <div className="font-medium">
                      {formatDate(viewModal.data.admin_final_quotation.superadmin_approved_at)}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Customer Response Alert */}
            {viewModal.data.customer_response?.status === 'accepted' ? (
              <Alert
                message="Quotation Accepted"
                description="You have accepted this quotation. The project will proceed as per the agreed terms."
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
                className="mb-4"
              />
            ) : viewModal.data.customer_response?.status === 'rejected' ? (
              <Alert
                message="Quotation Rejected"
                description="You have rejected this quotation. Please contact support if you need further assistance."
                type="error"
                showIcon
                icon={<CloseCircleOutlined />}
                className="mb-4"
              />
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Myestimates;