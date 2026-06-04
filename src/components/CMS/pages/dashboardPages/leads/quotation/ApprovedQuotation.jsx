import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiService } from '../../../../../../manageApi/utils/custom.apiservice';
import CustomTable from '../../../../pages/custom/CustomTable';
import {
  Card,
  Tag,
  Typography,
  Space,
  Button,
  Modal,
  Descriptions,
  Divider,
  Statistic,
  Row,
  Col,
  Timeline
} from 'antd';
import {
  CheckCircleOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import { showErrorAlert } from '../../../../../../manageApi/utils/sweetAlert';

const { Title, Text, Paragraph } = Typography;

// Purple Theme Colors
const PURPLE_THEME = {
  primary: '#722ed1',
  success: '#52c41a',
  info: '#1890ff',
  bg: '#f9f0ff'
};

const ApprovedQuotation = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ visible: false, record: null });
  const [pagination, setPagination] = useState({ currentPage: 1, totalItems: 0, itemsPerPage: 10 });

  const { user } = useSelector((state) => state.auth);
  const freelancerId = user?._id || user?.id;

  const fetchApprovedQuotations = async (page = 1) => {
    if (!freelancerId) return;
    
    setLoading(true);
    try {
      // API call with is_selected_by_supervisor=true
      const response = await apiService.get('/estimates/quotation', {
        freelancer_id: freelancerId,
        page: page,
        limit: pagination.itemsPerPage,
        is_selected_by_supervisor: true
      });

      if (response.success) {
        setData(response.data || []);
        setPagination(prev => ({
          ...prev,
          currentPage: response.pagination?.page || page,
          totalItems: response.pagination?.total || 0
        }));
      }
    } catch (error) {
      showErrorAlert("Error", "Failed to load approved quotations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedQuotations();
  }, [freelancerId]);

  const formatCurrency = (val) => `AED ${Number(val || 0).toLocaleString()}`;

  const columns = [
    {
      title: 'Project / Service',
      key: 'service',
      render: (_, r) => (
        <div>
          <Text strong>{r.estimate_type?.label?.toUpperCase() || "GENERAL SERVICE"}</Text>
          <div className="text-xs text-gray-500">{r.estimate_subcategory?.label || r.scope_of_work?.substring(0, 20)}</div>
        </div>
      )
    },
    {
      title: 'Quoted Price',
      dataIndex: 'price',
      render: (price) => <Text strong>{formatCurrency(price)}</Text>
    },
    {
      title: 'Final Amount',
      dataIndex: 'grand_total',
      render: (total, r) => (
        <Text strong style={{ color: PURPLE_THEME.primary }}>
            {total > 0 ? formatCurrency(total) : formatCurrency(r.price)}
        </Text>
      )
    },
    {
      title: 'Selection Status',
      key: 'selection',
      render: () => (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          SELECTED BY SUPERVISOR
        </Tag>
      )
    },
    {
        title: 'Project Status',
        key: 'status',
        render: (_, r) => {
            const status = r.estimate?.status || 'pending';
            return <Tag color="blue">{status.replace(/_/g, ' ').toUpperCase()}</Tag>
        }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          size="small"
          style={{ background: PURPLE_THEME.primary, borderColor: PURPLE_THEME.primary }}
          onClick={() => setViewModal({ visible: true, record: r })}
        >
          View Details
        </Button>
      )
    }
  ];

  return (
    <div className="p-6">
      <Card className="shadow-sm rounded-lg border-t-4 border-purple-600">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={4} style={{ margin: 0 }}>
              <SafetyCertificateOutlined className="mr-2" style={{ color: PURPLE_THEME.success }} />
              Approved & Selected Quotations
            </Title>
            <Text type="secondary">Quotations that have been shortlisted and approved by project supervisors</Text>
          </div>
          <Statistic title="Active Projects" value={pagination.totalItems} prefix={<ProjectOutlined />} />
        </div>

        <CustomTable
          columns={columns}
          data={data}
          loading={loading}
          totalItems={pagination.totalItems}
          currentPage={pagination.currentPage}
          onPageChange={(p) => fetchApprovedQuotations(p)}
        />
      </Card>

      {/* Detail View Modal */}
      <Modal
        title={<span><CheckCircleOutlined style={{ color: PURPLE_THEME.success }} /> Approved Quotation Details</span>}
        open={viewModal.visible}
        onCancel={() => setViewModal({ visible: false, record: null })}
        footer={[<Button key="close" onClick={() => setViewModal({ visible: false, record: null })}>Close</Button>]}
        width={800}
      >
        {viewModal.record && (
          <div>
            <div className="bg-purple-50 p-4 rounded-lg mb-4 border border-purple-100">
                <Row gutter={16}>
                    <Col span={12}>
                        <Statistic title="Contract Value" value={viewModal.record.grand_total || viewModal.record.price} prefix="AED" valueStyle={{ color: PURPLE_THEME.primary }} />
                    </Col>
                    <Col span={12}>
                        <Statistic title="Selection Date" value={new Date(viewModal.record.updatedAt).toLocaleDateString()} />
                    </Col>
                </Row>
            </div>

            <Descriptions title="Estimate Information" bordered size="small" column={2}>
              <Descriptions.Item label="Service">{viewModal.record.estimate_type?.label}</Descriptions.Item>
              <Descriptions.Item label="Subcategory">{viewModal.record.estimate_subcategory?.label}</Descriptions.Item>
              <Descriptions.Item label="Supervisor Status">
                <Tag color="green">Shortlisted</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Area">{viewModal.record.estimate?.area_sqft || 'N/A'} sq.ft</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Scope & Work Description</Divider>
            <Card size="small" className="bg-gray-50">
                <Paragraph italic>"{viewModal.record.scope_of_work}"</Paragraph>
            </Card>

            {viewModal.record.estimate && (
                <>
                    <Divider orientation="left">Workflow Timeline</Divider>
                    <Timeline mode="left" className="mt-4">
                        <Timeline.Item label="Created" color="gray">Quotation submitted by you</Timeline.Item>
                        <Timeline.Item label="Approved" color="green">Selected by Supervisor</Timeline.Item>
                        {viewModal.record.estimate.status === 'superadmin_approved' && (
                            <Timeline.Item label="Finalized" color="purple">Approved by Super Admin</Timeline.Item>
                        )}
                        {viewModal.record.estimate.customer_progress === 'sent_to_customer' && (
                            <Timeline.Item label="Customer" color="blue" dot={<GlobalOutlined />}>Sent to Customer for acceptance</Timeline.Item>
                        )}
                    </Timeline>
                </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApprovedQuotation;