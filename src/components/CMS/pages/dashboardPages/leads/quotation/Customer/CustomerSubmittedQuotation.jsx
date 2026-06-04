import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../../../../manageApi/utils/custom.apiservice';
import CustomTable from '../../../../../pages/custom/CustomTable';
import { Card, Tag, Typography, Button, Modal, Descriptions, Statistic, Row, Col, Empty,Space,Divider  } from 'antd';
import { EyeOutlined, ClockCircleOutlined, EnvironmentOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { showErrorAlert } from '../../../../../../../manageApi/utils/sweetAlert';

const { Title, Text } = Typography;

const CustomerSubmittedQuotation = () => {
  const [loading, setLoading] = useState(false);
  const [estimates, setEstimates] = useState([]);
  const [viewModal, setViewModal] = useState({ visible: false, data: null });
  const [pagination, setPagination] = useState({ currentPage: 1, totalItems: 0, itemsPerPage: 10 });

  const fetchMyEstimates = async (page = 1) => {
    setLoading(true);
    try {
      // Endpoint provided by you
      const response = await apiService.get('/estimates/customer/my-estimates', {
        customer_progress: 'none',
        page: page,
        limit: pagination.itemsPerPage
      });

      if (response.success) {
        setEstimates(response.data || []);
        setPagination(prev => ({
          ...prev,
          currentPage: response.pagination?.page || page,
          totalItems: response.pagination?.total || response.count || 0
        }));
      }
    } catch (error) {
      showErrorAlert("Error", "Could not fetch your submitted requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEstimates();
  }, []);

  const columns = [
    {
      title: 'Service Type',
      render: (_, r) => (
        <div>
          <Text strong className="uppercase">{r.service_type}</Text>
          <div className="text-xs text-gray-400">{r.subcategory?.label}</div>
        </div>
      )
    },
    {
      title: 'Area Size',
      dataIndex: 'area_sqft',
      render: (area) => <Tag color="purple">{area} sq.ft</Tag>
    },
    {
      title: 'Estimated Budget',
      dataIndex: 'estimated_amount',
      render: (amt) => <Text strong>AED {amt?.toLocaleString()}</Text>
    },
    {
      title: 'Status',
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Tag color="orange" icon={<ClockCircleOutlined />}>ESTIMATE PENDING</Tag>
          <Text type="secondary" style={{ fontSize: '10px' }}>Admin is reviewing</Text>
        </Space>
      )
    },
    {
      title: 'Action',
      render: (_, r) => (
        <Button 
          icon={<EyeOutlined />} 
          type="primary" 
          size="small"
          style={{ background: '#722ed1' }}
          onClick={() => setViewModal({ visible: true, data: r })}
        >
          View Request
        </Button>
      )
    }
  ];

  return (
    <div className="p-6">
      <Card title={<Title level={4}>My Request History</Title>} className="shadow-sm rounded-xl">
        <CustomTable
          columns={columns}
          data={estimates}
          loading={loading}
          totalItems={pagination.totalItems}
          onPageChange={(p) => fetchMyEstimates(p)}
        />
      </Card>

      <Modal
        title="Request Details"
        open={viewModal.visible}
        onCancel={() => setViewModal({ visible: false, data: null })}
        footer={null}
        width={700}
      >
        {viewModal.data && (
          <div className="space-y-6">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="Requested Area" value={viewModal.data.area_sqft} suffix="sq.ft" />
              </Col>
              <Col span={12}>
                <Statistic title="System Estimate" value={viewModal.data.estimated_amount} prefix="AED" />
              </Col>
            </Row>
            
            <Divider />
            
            <Descriptions title="Service Information" bordered column={1}>
              <Descriptions.Item label="Subcategory">{viewModal.data.subcategory?.label}</Descriptions.Item>
              <Descriptions.Item label="Style">{viewModal.data.type?.label}</Descriptions.Item>
              <Descriptions.Item label="Location">
                <EnvironmentOutlined className="mr-2" />
                {viewModal.data.customer?.location?.address}
              </Descriptions.Item>
            </Descriptions>

            <div className="bg-gray-50 p-4 rounded-lg">
              <Text strong><InfoCircleOutlined className="mr-2" /> Your Requirements:</Text>
              <p className="mt-2 text-gray-600 italic">"{viewModal.data.description}"</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerSubmittedQuotation;