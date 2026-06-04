import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../../../../manageApi/utils/custom.apiservice';
import { 
  Card, Row, Col, Typography, Button, Tag, Divider, 
  Empty, Spin, Modal, Input, Space, Descriptions, Statistic 
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  FileTextOutlined, 
  EnvironmentOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from '../../../../../../../manageApi/utils/sweetAlert';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const PURPLE_THEME = {
  primary: '#722ed1',
  success: '#52c41a',
  error: '#ff4d4f',
  bg: '#f9f0ff'
};

const ReceivedQuotation = () => {
  const [loading, setLoading] = useState(false);
  const [quotations, setQuotations] = useState([]);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Rejection States
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [respondingId, setRespondingId] = useState(null);

  const fetchMyEstimates = async () => {
    setLoading(true);
    try {
      // Endpoint based on your requirements
      const response = await apiService.get('/estimates/customer/my-estimates', {
        customer_progress: 'sent_to_customer'
      });
      if (response.success) {
        setQuotations(response.data || []);
      }
    } catch (error) {
      showErrorAlert("Error", "Failed to load received quotations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEstimates();
  }, []);

  // Accept Quotation Logic
  const accept = async (estimate) => {
    const confirm = await showConfirmDialog(
      'Accept Quotation', 
      'Are you sure you want to accept this quotation and proceed?', 
      'Yes, Accept'
    );
    if (!confirm.isConfirmed) return;

    setRespondingId(estimate._id);
    try {
      await apiService.put(`/estimates/${estimate._id}/response`, { status: 'accepted' });
      showSuccessAlert('Success', 'Quotation accepted successfully!');
      setModalVisible(false);
      fetchMyEstimates();
    } catch (err) {
      showErrorAlert('Error', 'Failed to accept quotation');
    } finally {
      setRespondingId(null);
    }
  };

  // Reject Logic
  const openRejectModal = (estimate) => {
    setSelectedEstimate(estimate);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return showErrorAlert('Reason Required', 'Please provide a reason for rejection');

    setRespondingId(selectedEstimate._id);
    try {
      await apiService.put(`/estimates/${selectedEstimate._id}/response`, { 
        status: 'rejected', 
        reason: rejectReason 
      });
      showSuccessAlert('Success', 'Quotation rejected');
      setRejectModalVisible(false);
      setModalVisible(false);
      fetchMyEstimates();
    } catch (err) {
      showErrorAlert('Error', 'Failed to reject quotation');
    } finally {
      setRespondingId(null);
    }
  };

  if (loading) return <div className="p-20 text-center"><Spin size="large" tip="Loading Offers..." /></div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Title level={3}>Final Offers from Admin</Title>
        <Text type="secondary">Review the final quotations sent by our team and choose to accept or reject.</Text>
      </div>

      {quotations.length === 0 ? (
        <Card className="rounded-xl shadow-sm">
          <Empty description="No quotations pending your response." />
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {quotations.map((est) => (
            <Col xs={24} key={est._id}>
              <Card className="shadow-sm rounded-xl border-purple-100 overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <Space>
                      <Tag color="purple">{est.service_type?.toUpperCase()}</Tag>
                      <Text type="secondary">ID: {est._id.slice(-6).toUpperCase()}</Text>
                    </Space>
                    <Title level={4} style={{ margin: '8px 0' }}>{est.subcategory?.label}</Title>
                    <Space size="large">
                       <Text><EnvironmentOutlined /> {est.customer?.location?.area || 'Location Shared'}</Text>
                       <Text strong>Area: {est.area_sqft} sq.ft</Text>
                    </Space>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg text-right border border-purple-100 min-w-[200px]">
                    <Text type="secondary" className="block text-xs uppercase">Final Quotation Amount</Text>
                    <Title level={3} style={{ margin: 0, color: PURPLE_THEME.primary }}>
                      AED {est.admin_final_quotation?.grand_total?.toLocaleString() || est.estimated_amount?.toLocaleString()}
                    </Title>
                    <Button 
                      type="link" 
                      icon={<InfoCircleOutlined />} 
                      onClick={() => { setSelectedEstimate(est); setModalVisible(true); }}
                      style={{ padding: 0 }}
                    >
                      View Breakdown
                    </Button>
                  </div>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <div className="flex justify-between items-center">
                  <Text type="secondary">Submitted on: {new Date(est.updatedAt).toLocaleDateString()}</Text>
                  <Space>
                    <Button 
                      danger 
                      icon={<CloseCircleOutlined />} 
                      onClick={() => openRejectModal(est)}
                      loading={respondingId === est._id}
                    >
                      Reject
                    </Button>
                    <Button 
                      type="primary" 
                      icon={<CheckCircleOutlined />} 
                      style={{ background: PURPLE_THEME.success, borderColor: PURPLE_THEME.success }}
                      onClick={() => accept(est)}
                      loading={respondingId === est._id}
                    >
                      Accept Quotation
                    </Button>
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* --- DETAILED QUOTATION MODAL --- */}
      <Modal
        title={<Title level={4} style={{ margin: 0 }}>Final Quotation Details</Title>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>Close</Button>,
          <Button 
            key="acc" 
            type="primary" 
            style={{ background: PURPLE_THEME.success }} 
            onClick={() => accept(selectedEstimate)}
          >
            Accept Now
          </Button>
        ]}
        width={750}
      >
        {selectedEstimate?.admin_final_quotation && (
          <div className="py-2">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="Base Work Price" value={selectedEstimate.admin_final_quotation.price} prefix="AED" />
              </Col>
              <Col span={12}>
                <Statistic title="Total Payable" value={selectedEstimate.admin_final_quotation.grand_total} prefix="AED" valueStyle={{ color: PURPLE_THEME.primary }} />
              </Col>
            </Row>
            
            <Divider orientation="left">Project Overview</Divider>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Service Type">{selectedEstimate.admin_final_quotation.estimate_type?.label}</Descriptions.Item>
              <Descriptions.Item label="Sub-Category">{selectedEstimate.admin_final_quotation.estimate_subcategory?.label}</Descriptions.Item>
              {/* <Descriptions.Item label="Margin">{selectedEstimate.admin_final_quotation.margin_percent}% included</Descriptions.Item> */}
              <Descriptions.Item label="Area">{selectedEstimate.area_sqft} sq.ft</Descriptions.Item>
            </Descriptions>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
              <Text strong className="block mb-2"><FileTextOutlined /> Final Scope of Work:</Text>
              <Paragraph className="m-0 text-gray-600 italic">
                {selectedEstimate.admin_final_quotation.scope_of_work}
              </Paragraph>
            </div>
          </div>
        )}
      </Modal>

      {/* --- REJECT REASON MODAL --- */}
      <Modal
        title="Reason for Rejection"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={handleRejectSubmit}
        okText="Confirm Reject"
        okButtonProps={{ danger: true, loading: respondingId === selectedEstimate?._id }}
      >
        <Text type="secondary" className="block mb-4">
          Please let us know why you are rejecting this quotation so we can improve our offer.
        </Text>
        <TextArea 
          rows={4} 
          placeholder="e.g. Price is too high, scope is not as discussed..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ReceivedQuotation;