import React from 'react';
import { Modal, Typography, Button } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ActionRequiredModal = ({ isOpen }) => {
  const navigate = useNavigate();

  return (
    <Modal
      open={isOpen}
      closable={false}
      maskClosable={false}
      keyboard={false}
      centered
      footer={null}
    >
      <div className="text-center py-6 px-4">
        
        <SafetyCertificateOutlined
          style={{
            color: '#5C039b',
            fontSize: '64px',
            marginBottom: '16px'
          }}
        />

        <Title level={3} style={{ marginBottom: 8 }}>
          Verification Required
        </Title>

        <Text
          type="secondary"
          style={{
            display: 'block',
            marginBottom: '24px',
            fontSize: 14,
            lineHeight: 1.6
          }}
        >
          To access your dashboard, please complete your profile details,
          finish the KYC verification, and sign the required agreement.
        </Text>

        <Button
          type="primary"
          block
          size="large"
          style={{
            backgroundColor: '#5C039b',
            borderColor: '#5C039b',
            height: '48px',
            fontWeight: '600',
            borderRadius: 8
          }}
          onClick={() => navigate('/dashboard/dashboard/myprofile')}
        >
          Complete Verification
        </Button>

      </div>
    </Modal>
  );
};

export default ActionRequiredModal;