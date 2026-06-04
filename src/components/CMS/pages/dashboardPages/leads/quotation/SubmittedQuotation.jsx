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
  Col
} from 'antd';
import {
  EyeOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { showErrorAlert } from '../../../../../../manageApi/utils/sweetAlert';

const { Title, Text, Paragraph } = Typography;

// Purple Theme Colors
const PURPLE_THEME = {
  primary: '#722ed1',
  success: '#52c41a',
  warning: '#faad14',
  gray: '#8c8c8c'
};

const SubmittedQuotation = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ visible: false, record: null });
  const [pagination, setPagination] = useState({ currentPage: 1, totalItems: 0, itemsPerPage: 10 });

  // Get freelancer ID from Redux auth state
  const { user } = useSelector((state) => state.auth);
  const freelancerId = user?._id || user?.id;

  const fetchQuotations = async (page = 1) => {
    if (!freelancerId) return;
    
    setLoading(true);
    try {
      // API call with your provided endpoint structure
      const response = await apiService.get('/estimates/quotation', {
        freelancer_id: freelancerId,
        page: page,
        limit: pagination.itemsPerPage,
        is_selected_by_supervisor: false
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
      console.error("Error fetching quotations:", error);
      showErrorAlert("Error", "Failed to load submitted quotations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [freelancerId]);

  const formatCurrency = (val) => `AED ${Number(val).toLocaleString()}`;

  const columns = [
    {
      title: 'Estimate Type',
      key: 'type',
      render: (_, r) => (
        <div>
          <Text strong>{r.estimate_type?.label?.toUpperCase()}</Text>
          <div className="text-xs text-gray-500">{r.estimate_subcategory?.label}</div>
        </div>
      )
    },
    {
      title: 'Quoted Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <Text strong style={{ color: PURPLE_THEME.primary }}>{formatCurrency(price)}</Text>
    },
    {
      title: 'Discount',
      key: 'discount',
      render: (_, r) => r.discount_percent ? <Tag color="red">-{r.discount_percent}%</Tag> : '-'
    },
    {
      title: 'Grand Total',
      dataIndex: 'grand_total',
      key: 'grand_total',
      render: (total) => <Text strong className="text-lg">{formatCurrency(total)}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag icon={<ClockCircleOutlined />} color="processing">
          {status.replace(/_/g, ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Date Submitted',
      dataIndex: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
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
          View details
        </Button>
      )
    }
  ];

  return (
    <div className="p-6">
      <Card className="shadow-sm rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={4} style={{ margin: 0 }}>
              <FileTextOutlined className="mr-2" style={{ color: PURPLE_THEME.primary }} />
              My Submitted Quotations
            </Title>
            <Text type="secondary">View and track status of quotations sent to supervisors</Text>
          </div>
          <Statistic title="Total Submissions" value={pagination.totalItems} />
        </div>

        <CustomTable
          columns={columns}
          data={data}
          loading={loading}
          totalItems={pagination.totalItems}
          currentPage={pagination.currentPage}
          onPageChange={(p) => fetchQuotations(p)}
        />
      </Card>

      {/* Detail View Modal */}
      <Modal
        title="Quotation Detailed View"
        open={viewModal.visible}
        onCancel={() => setViewModal({ visible: false, record: null })}
        footer={[
            <Button key="close" onClick={() => setViewModal({ visible: false, record: null })}>Close</Button>
        ]}
        width={700}
      >
        {viewModal.record && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic title="Base Price" value={viewModal.record.price} prefix="AED" />
              </Col>
              <Col span={12}>
                <Statistic 
                    title="Grand Total" 
                    value={viewModal.record.grand_total} 
                    prefix="AED" 
                    valueStyle={{ color: PURPLE_THEME.primary }} 
                />
              </Col>
            </Row>
            
            <Divider orientation="left">Service Info</Divider>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Category">{viewModal.record.estimate_subcategory?.label}</Descriptions.Item>
              <Descriptions.Item label="Style/Type">{viewModal.record.estimate_type?.label}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color="purple">{viewModal.record.status.toUpperCase()}</Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Scope of Work</Divider>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <Paragraph>
                {viewModal.record.scope_of_work || "No specific scope provided."}
              </Paragraph>
            </div>
            
            {viewModal.record.items?.length > 0 && (
                <>
                    <Divider orientation="left">Line Items</Divider>
                    {/* Add mapping here if items array has data */}
                </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubmittedQuotation;