import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import {
  Card, Space, Tag, Typography, Row, Col, Avatar, 
  Button, Modal, Descriptions, Badge, Divider, Spin, Rate
} from 'antd';
import {
  BankOutlined, EyeOutlined, InfoCircleOutlined,
  SafetyCertificateOutlined, FileTextOutlined,
  GlobalOutlined, PhoneOutlined, CalculatorOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// BRAND COLOR - Modern Dark Purple
const THEME_COLOR = "#5C039B";
const MORTGAGE_PATH = "bank/products";

// Role slug mapping for navigation

const roleSlugMap = {
  '0': 'superadmin',
  '1': 'admin',
  '2': "customer",
  '5': 'vendor-b2c',
  '6': 'vendor-b2b',
  '7': 'freelancer',
  '11': 'accountant',
  '12': 'supervisor',
  '15': "agency",        // Agency
  '16': "agent",         // Agent
  '17': "developer",
  '18': "vault-admin", //vault
  '22': "vaultagent",
  '21': "vaultpartner",
  '24': "GridAdvisor",
  // '23': "vault-advisor",
  // '26': "vault-ops",
  // '26': "vault-advisor",
  '23': "vault-ops",
  '25': "gridReferralPartner",
  '26': "vault-advisor",
  // '23': "vault-ops",
  
   
 


};

const BankProductListVault = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  


  // Get role slug for navigation
  const roleSlug = roleSlugMap[user?.role?.code] ?? "dashboard";

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiService.get(`${MORTGAGE_PATH}/get-all-bank-products`, {
        page,
        limit: 10,
      });
      if (res?.success) {
        setProducts(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, fetchProducts]);

  const openDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Navigate to product details page
  const handleViewProductDetails = (productId) => {
    navigate(`/dashboard/${roleSlug}/bank/products/view/${productId}`);
  };
    const handleViewProductDocuments = (productId) => {
    navigate(`/dashboard/${roleSlug}/bank/products/documents/${productId}`);
  };

  // Navigate to apply page
  const handleApplyForLoan = (productId) => {
    navigate(`/dashboard/${roleSlug}/vault/apply-loan/${productId}`);
  };

  // Navigate back to dashboard
  const handleGoBack = () => {
    navigate(`/dashboard/${roleSlug}`);
  };

  return (
    <div style={{ padding: '24px', background: '#fdfbff', minHeight: '100vh' }}>
      
      {/* Header Area with Back Button */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleGoBack}
            style={{ borderRadius: 8, borderColor: THEME_COLOR, color: THEME_COLOR }}
          >
            Back to Dashboard
          </Button>
        </div>
        <Title level={2} style={{ color: THEME_COLOR, margin: 0, fontWeight: 800 }}>
          Bank Products by XOTO
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Explore premium mortgage and home loan offerings from our partners
        </Text>
      </div>

      {loading && products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
      ) : (
        <>
          {/* Card Grid - 2 Columns */}
          <Row gutter={[24, 24]}>
            {products.map((item) => (
              <Col xs={24} lg={12} key={item._id}>
                <Card
                  hoverable
                  style={{ borderRadius: 16, border: '1px solid #efeaff', overflow: 'hidden', cursor: 'pointer' }}
                  bodyStyle={{ padding: 0 }}
                  onClick={() => handleViewProductDetails(item._id)}
                >
                  <Row align="middle">
                    {/* Left side: Bank Identity */}
                    <Col span={8} style={{ 
                      background: '#F8F5FF', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      padding: '20px',
                      minHeight: '200px',
                      height: '100%'
                    }}>
                      <Avatar 
                        src={item.bankInfo?.logo} 
                        size={80} 
                        shape="square" 
                        style={{ marginBottom: 12, borderRadius: 12, border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} 
                        icon={<BankOutlined />}
                      />
                      <Text strong style={{ textAlign: 'center', color: '#1e1b4b' }}>{item.bankInfo?.bankName}</Text>
                      {item.offerSummary?.popularityTag && (
                        <Tag color="orange" style={{ marginTop: 8, borderRadius: 10, border: 0, fontWeight: 'bold' }}>
                          {item.offerSummary.popularityTag}
                        </Tag>
                      )}
                    </Col>

                    {/* Right side: Offer Summary */}
                    <Col span={16} style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Title level={4} style={{ margin: 0 }}>{item.offerSummary?.title}</Title>
                        <Tag color={item.offerSummary?.productType === 'FIXED' ? THEME_COLOR : 'blue'} style={{ borderRadius: 6 }}>
                          {item.offerSummary?.productType}
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4, minHeight: 20 }}>
                        {item.offerSummary?.shortDescription || "Premium financing option tailored for your needs."}
                      </Text>
                      
                      <div style={{ margin: '16px 0', background: '#faf9ff', padding: '12px 16px', borderRadius: 12 }}>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Initial Rate</Text>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: THEME_COLOR }}>
                              {item.offerSummary?.initialRate}%
                            </div>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Monthly EMI</Text>
                            <div style={{ fontSize: 18, fontWeight: '600', color: '#1e1b4b' }}>
                              {item.offerSummary?.currency} {item.offerSummary?.monthlyEMI?.toLocaleString()}
                            </div>
                          </Col>
                        </Row>
                      </div>

                    <Space direction="vertical" style={{ width: "100%" }} size={10}>
  
  <Button 
    type="primary" 
    block 
    icon={<EyeOutlined />}
    style={{ 
      backgroundColor: THEME_COLOR, 
      borderColor: THEME_COLOR, 
      borderRadius: 8,
      height: 44,
      fontWeight: 600,
      boxShadow: '0 4px 14px rgba(92, 3, 155, 0.2)'
    }}
    onClick={(e) => {
      e.stopPropagation();
      handleViewProductDetails(item._id);
    }}
  >
    View Full Details
  </Button>

  <Button 
    block
    icon={<FileTextOutlined />}
    style={{ 
      borderRadius: 8,
      height: 44,
      fontWeight: 600,
      borderColor: THEME_COLOR,
      color: THEME_COLOR
    }}
    onClick={(e) => {
      e.stopPropagation();
      handleViewProductDocuments(item._id);
    }}
  >
    View Documents
  </Button>

</Space>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Showing page <b style={{ color: THEME_COLOR }}>{currentPage}</b> of {totalPages} ({total} total items)
            </Text>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
                style={{ 
                  padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, 
                  background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1, fontWeight: 500
                }}
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    style={{
                      padding: '8px 16px', borderRadius: 8, border: '1px solid',
                      cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600,
                      backgroundColor: currentPage === p ? THEME_COLOR : '#fff',
                      color: currentPage === p ? '#fff' : '#4b5563',
                      borderColor: currentPage === p ? THEME_COLOR : '#e5e7eb'
                    }}
                  >
                    {p}
                  </button>
                ))}

              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages}
                style={{ 
                  padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, 
                  background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1, fontWeight: 500
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Full Detail Modal */}
    
    </div>
  );
};

export default BankProductListVault;