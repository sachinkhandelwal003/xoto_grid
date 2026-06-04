// src/pages/admin/ProductReview.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../../manageApi/utils/toast';
import { 
  Button, Card, Spin, Row, Col, Descriptions, Empty, Tag, Modal, Input, 
  Divider, Tooltip, Space, Progress, Alert, Tabs, Typography, Image, Statistic, Avatar, Badge 
} from 'antd';
import { 
  FiCheck, FiX, FiBox, FiDollarSign, 
  FiImage, FiTag, FiFileText, FiZoomIn, FiDownload, FiCheckCircle, FiXCircle 
} from 'react-icons/fi';
import { 
  ShopOutlined, 
  SafetyCertificateFilled 
} from '@ant-design/icons';
import 'react-quill/dist/quill.snow.css';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

const ProductReview = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const productId = query.get('productId');

  // --- STATE ---
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Verification States
  const [verifying, setVerifying] = useState(false);
  const [verificationModal, setVerificationModal] = useState({
    open: false,
    targetId: null,      // ID of product or specific asset (image _id)
    targetType: null,    // 'product' or 'asset'
    targetImage: null,   // URL of the image being verified (for preview in modal)
    approving: false,
    reason: '',
    suggestion: ''
  });

  // Image Preview
  const [previewImage, setPreviewImage] = useState(null);

  // --- HELPER: GET IMAGE URL ---
  const getImageUrl = (path) => {
    if (!path) return null;
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `http://localhost:5000/${cleanPath}`;
  };

  // --- FETCH DATA ---
  const fetchProduct = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const response = await apiService.get('/products', {
        params: { product_id: productId },
      });
      if (response.success && response.products?.length > 0) {
        setProduct(response.products[0]);
      } else {
        showToast('Product not found', 'error');
        navigate(-1);
      }
    } catch (error) {
      showToast('Failed to load product', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  // --- HANDLERS ---

  // Open Modal - UPDATED to accept imageUrl
  const openVerificationModal = (targetId, targetType, approving, imageUrl = null) => {
    setVerificationModal({
      open: true,
      targetId,
      targetType, // 'product' or 'asset'
      targetImage: imageUrl, // Store the image URL for the modal
      approving,
      reason: '',
      suggestion: ''
    });
  };

  // Submit Verification (Product or Asset)
  const submitVerification = async () => {
    const { targetId, targetType, approving, reason, suggestion } = verificationModal;

    if (!approving && !reason.trim()) {
      showToast('Reason is required for rejection', 'error');
      return;
    }

    setVerifying(true);
    try {
      let endpoint = '';
      let payload = {};

      if (targetType === 'product') {
        // Product Level Status Update
        endpoint = `/products/${productId}/verify-all`;
        payload = { 
            status: approving ? 'approved' : 'rejected', 
            rejection_reason: reason,
            suggestion: suggestion
        };
      } else if (targetType === 'asset') {
        // Asset Level Verification (Image)
        endpoint = `/products/${productId}/verify-asset/${targetId}`;
        payload = { 
            verified: approving,
            reason: reason,
            suggestion: suggestion
        };
      }

      await apiService.put(endpoint, payload);
      
      showToast(`${targetType === 'product' ? 'Product' : 'Asset'} ${approving ? 'approved' : 'rejected'}`, 'success');
      setVerificationModal({ ...verificationModal, open: false });
      fetchProduct(); // Refresh data to show new status
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setVerifying(false);
    }
  };

  // Helper to calculate status color
  const getStatusColor = (status) => {
    const map = {
      active: 'green',
      approved: 'green',
      pending: 'orange',
      pending_verification: 'orange',
      draft: 'blue',
      rejected: 'red'
    };
    return map[status] || 'default';
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Spin size="large" /></div>;
  if (!product) return <Empty description="Product not found" className="mt-20" />;

  // Derived Data
  const currencySymbol = product.pricing?.currency?.symbol || '$';
  const mainImageRaw = product.color_variants?.[0]?.images?.find(img => img.is_primary)?.url || product.color_variants?.[0]?.images?.[0]?.url;
  const mainImageUrl = getImageUrl(mainImageRaw);
  
  // Check if product is pending verification
  const isProductPending = product.verification_status?.status === 'pending';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* 1. HEADER */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
                <Avatar 
                    shape="square" 
                    size={80} 
                    src={mainImageUrl} 
                    icon={<FiBox />} 
                    className="border border-gray-200 bg-white text-purple-200"
                />
                <div>
                    <div className="flex items-center gap-3">
                        <Title level={2} style={{ margin: 0 }}>{product.name}</Title>
                        <Tag color={getStatusColor(product.verification_status?.status)} className="px-3 py-1 text-sm rounded-full capitalize">
                            {product.verification_status?.status?.replace('_', ' ')}
                        </Tag>
                    </div>
                    <Text type="secondary" className="flex items-center gap-2 mt-1">
                        <FiTag /> {product.category?.name} &bull; <ShopOutlined /> {product.brand?.name} &bull; Code: {product.product_code}
                    </Text>
                </div>
            </div>
            
            {/* Main Action Buttons - Only Show if Pending */}
            {isProductPending && (
                <Space>
                    <Button 
                        size="large" 
                        danger 
                        icon={<FiX />} 
                        onClick={() => openVerificationModal(product._id, 'product', false)}
                    >
                        Reject Product
                    </Button>
                    <Button 
                        size="large" 
                        type="primary" 
                        icon={<FiCheck />} 
                        style={{ backgroundColor: THEME.success, borderColor: THEME.success }}
                        onClick={() => openVerificationModal(product._id, 'product', true)}
                    >
                        Approve Product
                    </Button>
                </Space>
            )}
            
        </div>
      </div>

      <Row gutter={[24, 24]}>
        
        {/* LEFT COLUMN: DETAILS */}
        <Col xs={24} lg={16}>
             <Tabs type="card" defaultActiveKey="overview" className="custom-tabs">
                
                {/* TAB 1: OVERVIEW */}
                <TabPane tab="Overview" key="overview">
                    <Card className="shadow-sm rounded-lg mb-6">
                        <Descriptions title="Basic Information" bordered column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}>
                             <Descriptions.Item label="Vendor">
                                <Space>
                                    <Avatar size="small" style={{ backgroundColor: THEME.secondary }}>{product.vendor?.email?.[0]?.toUpperCase()}</Avatar>
                                    <span className="font-medium">{product.vendor?.email}</span>
                                </Space>
                             </Descriptions.Item>
                             <Descriptions.Item label="Material">{product.material?.name}</Descriptions.Item>
                             <Descriptions.Item label="Short Description" span={2}>{product.short_description || 'N/A'}</Descriptions.Item>
                        </Descriptions>
                        
                        <Divider orientation="left">Detailed Description</Divider>
                        <div 
                            className="p-4 bg-gray-50 rounded border border-gray-100"
                            dangerouslySetInnerHTML={{ __html: product.description || 'No description provided.' }} 
                        />
                    </Card>

                    {/* SEO */}
                    <Card title="SEO & Metadata" size="small" className="shadow-sm rounded-lg">
                        <Descriptions column={1} size="small" bordered>
                            <Descriptions.Item label="Meta Title">{product.category?.metaTitle || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Meta Keywords">
                                {product.category?.metaKeywords?.map(k => <Tag key={k}>{k}</Tag>) || 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </TabPane>

                {/* TAB 2: VISUAL ASSETS (Verification Heavy) */}
                <TabPane tab={<Space><FiImage /> Visual Assets</Space>} key="assets">
                    <div className="space-y-6">
                        {product.color_variants?.length > 0 ? (
                            product.color_variants.map((variant, idx) => (
                                <Card 
                                    key={variant._id || idx}
                                    title={
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-6 h-6 rounded-full border border-gray-300 shadow-sm" 
                                                style={{ backgroundColor: variant.color_code }} 
                                            />
                                            <span>{variant.color_name} Variant</span>
                                            <Badge count={variant.images?.length} style={{ backgroundColor: THEME.primary }} />
                                        </div>
                                    }
                                    className="shadow-sm rounded-lg border-t-4"
                                    style={{ borderColor: variant.color_code || THEME.primary }}
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {variant.images?.map((img) => {
                                            const fileUrl = getImageUrl(img.url);
                                            return (
                                                <div key={img._id} className="group relative border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                                                    
                                                    {/* Status Badge */}
                                                    <div className="absolute top-2 left-2 z-10">
                                                        {img.verified ? (
                                                            <Tag color="success" icon={<SafetyCertificateFilled />}>Verified</Tag>
                                                        ) : img.reason ? (
                                                            <Tooltip title={img.reason}><Tag color="error">Rejected</Tag></Tooltip>
                                                        ) : (
                                                            <Tag color="warning">Pending</Tag>
                                                        )}
                                                    </div>

                                                    {/* Primary Badge */}
                                                    {img.is_primary && (
                                                        <div className="absolute top-2 right-2 z-10">
                                                            <Tag color="blue">Primary</Tag>
                                                        </div>
                                                    )}

                                                    {/* Image Display */}
                                                    <div className="h-56 overflow-hidden flex items-center justify-center bg-gray-50">
                                                        <Image 
                                                            src={fileUrl} 
                                                            height="100%" 
                                                            width="100%"
                                                            className="object-cover"
                                                            preview={false} // Custom preview
                                                            fallback="https://via.placeholder.com/200?text=Error"
                                                        />
                                                        {/* Hover Overlay */}
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                                            <Button 
                                                                shape="circle" 
                                                                icon={<FiZoomIn />} 
                                                                onClick={() => setPreviewImage(fileUrl)} 
                                                                className="border-none"
                                                            />
                                                            
                                                            {/* Show Approve/Reject ONLY if not verified AND Product is Pending */}
                                                           
                                                                <Space>
                                                                    <Button 
                                                                        type="primary" 
                                                                        icon={<FiCheck />} 
                                                                        className="bg-green-500 border-none"
                                                                        onClick={() => openVerificationModal(img._id, 'asset', true, fileUrl)}
                                                                    >
                                                                        Approve
                                                                    </Button>
                                                                    <Button 
                                                                        danger 
                                                                        icon={<FiX />} 
                                                                        onClick={() => openVerificationModal(img._id, 'asset', false, fileUrl)}
                                                                    >
                                                                        Reject
                                                                    </Button>
                                                                </Space>
                                                         
                                                        </div>
                                                    </div>

                                                    {/* Footer Info */}
                                                    <div className="p-3 bg-white border-t">
                                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                                            <span>Uploaded: {new Date(img.uploaded_at).toLocaleDateString()}</span>
                                                        </div>
                                                        {img.reason && (
                                                            <Alert 
                                                                message={img.reason} 
                                                                type="error" 
                                                                showIcon 
                                                                className="mt-2 text-xs py-1" 
                                                                style={{ border: 'none', background: '#fff1f0' }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <Empty description="No visual assets found" />
                        )}
                    </div>
                </TabPane>

                {/* TAB 3: PRICING */}
                <TabPane tab={<Space><FiDollarSign /> Pricing & Stock</Space>} key="pricing">
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                             <Card className="shadow-sm rounded-lg bg-white h-full">
                                <Statistic 
                                    title="Final Customer Price" 
                                    value={product.pricing?.final_price} 
                                    prefix={currencySymbol} 
                                    precision={2}
                                    valueStyle={{ color: THEME.primary, fontWeight: 'bold' }}
                                />
                                <Divider />
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <Text type="secondary">Base Price (Vendor):</Text>
                                        <Text strong>{currencySymbol} {product.pricing?.base_price}</Text>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <Text type="secondary">Tax ({product.pricing?.tax?.rate || 0}%):</Text>
                                        <Text type="success">+ {currencySymbol} {((product.pricing?.base_price || 0) * ((product.pricing?.tax?.rate || 0) / 100)).toFixed(2)}</Text>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <Text type="secondary">Discount:</Text>
                                        <Text type="danger">
                                            - {product.pricing?.discount?.type === 'percentage' 
                                                ? `${product.pricing?.discount?.value}%` 
                                                : `${currencySymbol} ${product.pricing?.discount?.value}`}
                                        </Text>
                                    </div>
                                </div>
                             </Card>
                        </Col>
                        <Col xs={24} md={12}>
                             <Card className="shadow-sm rounded-lg bg-white h-full">
                                 <Statistic 
                                    title="Profit Margin" 
                                    value={product.pricing?.margin} 
                                    prefix={currencySymbol} 
                                    precision={2}
                                    valueStyle={{ color: THEME.success }}
                                 />
                                 <Progress 
                                    percent={product.pricing?.final_price > 0 ? Math.round((product.pricing?.margin / product.pricing?.final_price) * 100) : 0} 
                                    size="small" 
                                    strokeColor={THEME.success} 
                                    className="mt-4"
                                 />
                                 <Text type="secondary" className="text-xs block mt-1">Margin Percentage based on Final Price</Text>
                                 
                                 <Divider />
                                 <div className="flex justify-between items-center">
                                     <Text type="secondary">Cost Price:</Text>
                                     <Text>{currencySymbol} {product.pricing?.cost_price}</Text>
                                 </div>
                             </Card>
                        </Col>
                    </Row>
                </TabPane>
             </Tabs>
        </Col>

        {/* RIGHT COLUMN: STATUS & ADMIN ACTIONS */}
        <Col xs={24} lg={8}>
            <div className="space-y-6">
                
                {/* Verification Summary Card */}
                <Card title="Verification Status" className="shadow-sm rounded-lg">
                      <Alert 
                        message={product.verification_status?.status?.toUpperCase()}
                        description={product.verification_status?.rejection_reason || "Product status overview."}
                        type={product.verification_status?.status === 'rejected' ? 'error' : product.verification_status?.status === 'approved' ? 'success' : 'info'}
                        showIcon
                        className="mb-4"
                      />
                      {product.verification_status?.suggestion && (
                          <div className="bg-orange-50 p-3 rounded text-orange-700 text-sm mb-4 border border-orange-100">
                             <strong>Suggestion:</strong> {product.verification_status.suggestion}
                          </div>
                      )}

                      {product.verification_status?.verified_at && (
                          <div className="text-xs text-gray-400 mt-2 text-right">
                              Last Updated: {new Date(product.verification_status.verified_at).toLocaleString()}
                          </div>
                      )}
                </Card>

                {/* Stock Info */}
                <Card title="Inventory" className="shadow-sm rounded-lg">
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Statistic title="Available" value={product.stock?.total_available} valueStyle={{ color: THEME.secondary }} />
                        </Col>
                        <Col span={12}>
                            <Statistic title="Reserved" value={product.stock?.total_reserved} valueStyle={{ color: 'gray' }} />
                        </Col>
                    </Row>
                </Card>

                {/* Documents */}
                <Card title="Product Documents" className="shadow-sm rounded-lg">
                    {Object.keys(product.documents || {}).length > 0 ? (
                        <div className="space-y-3">
                             {/* Iterate generic docs or specific if schema varies */}
                             {Object.entries(product.documents || {}).map(([key, doc]) => {
                                 if(!doc) return null;
                                 return (
                                     <div key={key} className="flex justify-between items-center p-3 border rounded bg-gray-50">
                                         <div className="flex items-center gap-2">
                                             <FiFileText className="text-gray-500"/>
                                             <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                                         </div>
                                         {doc.path && (
                                             <Button 
                                                 size="small" 
                                                 icon={<FiDownload />} 
                                                 onClick={() => window.open(getImageUrl(doc.path), '_blank')}
                                              />
                                         )}
                                     </div>
                                 )
                             })}
                        </div>
                    ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No documents" />}
                </Card>

            </div>
        </Col>
      </Row>

      {/* Full Image Viewer */}
      <Image.PreviewGroup
        preview={{
          visible: !!previewImage,
          onVisibleChange: (vis) => !vis && setPreviewImage(null),
        }}
      >
        <Image src={previewImage} style={{ display: 'none' }} />
      </Image.PreviewGroup>

      {/* Verification / Rejection Modal */}
      <Modal
        open={verificationModal.open}
        title={
           <div className={`flex items-center gap-2 ${verificationModal.approving ? 'text-green-600' : 'text-red-600'}`}>
              {verificationModal.approving ? <FiCheckCircle /> : <FiXCircle />}
              {verificationModal.approving ? 'Approve' : 'Reject'} {verificationModal.targetType === 'product' ? 'Product' : 'Asset'}
           </div>
        }
        onCancel={() => setVerificationModal({...verificationModal, open: false})}
        footer={null}
      >
         <div className="pt-2 space-y-4">
             {/* --- NEW: IMAGE PREVIEW INSIDE MODAL --- */}
             {verificationModal.targetType === 'asset' && verificationModal.targetImage && (
                 <div className="flex justify-center bg-gray-100 p-4 rounded-lg border border-gray-200">
                    <Image 
                        src={verificationModal.targetImage} 
                        height={180} 
                        className="object-contain rounded shadow-sm"
                        alt="Asset being verified"
                    />
                 </div>
             )}

             <Alert 
                message={`You are about to ${verificationModal.approving ? 'approve' : 'reject'} this item.`}
                type={verificationModal.approving ? 'success' : 'warning'}
                showIcon
             />
             
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {verificationModal.approving ? 'Note (Optional)' : 'Reason for Rejection *'}
                </label>
                <TextArea 
                    rows={3}
                    placeholder={verificationModal.approving ? "Add internal note..." : "Please specify why..."}
                    value={verificationModal.reason}
                    onChange={(e) => setVerificationModal({...verificationModal, reason: e.target.value})}
                    status={!verificationModal.approving && !verificationModal.reason ? 'error' : ''}
                />
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suggestion (Optional)</label>
                <TextArea 
                    rows={2}
                    placeholder="Tips for the vendor to improve..."
                    value={verificationModal.suggestion}
                    onChange={(e) => setVerificationModal({...verificationModal, suggestion: e.target.value})}
                />
             </div>

             <div className="flex justify-end gap-3 pt-2">
                 <Button onClick={() => setVerificationModal({...verificationModal, open: false})}>Cancel</Button>
                 <Button 
                    type="primary" 
                    danger={!verificationModal.approving}
                    className={verificationModal.approving ? 'bg-green-600' : ''}
                    loading={verifying}
                    disabled={!verificationModal.approving && !verificationModal.reason.trim()}
                    onClick={submitVerification}
                 >
                    Confirm {verificationModal.approving ? 'Approval' : 'Rejection'}
                 </Button>
             </div>
         </div>
      </Modal>

    </div>
  );
};

export default ProductReview;