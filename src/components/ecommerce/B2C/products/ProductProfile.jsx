// src/pages/vendor/ProductProfile.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiArrowLeft, FiFile, FiDownload, FiZoomIn, FiCheckCircle, 
  FiXCircle, FiUpload, FiBox, FiTag, FiDollarSign, FiImage 
} from 'react-icons/fi';
import { ShopOutlined, SafetyCertificateFilled } from '@ant-design/icons';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../manageApi/utils/toast';
import { 
  Button, Card, Spin, Row, Col, Descriptions, Empty, Tag, Modal, 
  Divider, Space, Progress, Alert, Tabs, Typography, Collapse, Upload, Statistic, Image, Badge, Tooltip 
} from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

const ProductProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get product_id from query params if not in route params
  const query = new URLSearchParams(location.search);
  const queryProductId = query.get('productId');
  const { id: routeProductId } = useParams();
  
  const productId = queryProductId || routeProductId;
  

  // --- STATE ---
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadingAssetId, setUploadingAssetId] = useState(null);
  
  // --- HELPER: GET IMAGE URL ---
  const getImageUrl = (path) => {
    if (!path) return null;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `http://localhost:5000/${cleanPath}`;
  };

  // --- FETCH DATA ---
  const fetchProduct = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      // API call using product_id in query
      const response = await apiService.get(`/products/vendor/my-products`, {
        params: { product_id: productId }
      });
      
      if (response.success && response.product) {
        setProduct(response.product);
      } else if (response.success && response.products && response.products.length > 0) {
         setProduct(response.products[0]);
      } else {
        showToast('Product not found', 'error');
        navigate(-1);
      }
    } catch (error) {
       console.error(error);
       showToast('Failed to load product details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && productId) {
      fetchProduct();
    }
  }, [user?.id, productId]);

  // --- HANDLERS ---

  // Handle asset re-upload (Vendor Action)
  const handleAssetUpload = async (assetId, file, type) => {
    if (!file || !assetId) {
      showToast('Invalid file or asset ID', 'error');
      return;
    }

    setUploadingAssetId(assetId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (type) formData.append('type', type);

      const response = await apiService.put(`/products/${productId}/update-asset/${assetId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.success) {
        showToast('Asset updated successfully', 'success');
        fetchProduct(); // Refresh data
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update asset', 'error');
    } finally {
      setUploadingAssetId(null);
    }
  };

  // Handle product resubmit (Vendor Action)
  const handleResubmit = async () => {
    try {
      await apiService.put(`/products/${productId}`, { status: 'pending_verification' });
      showToast('Product resubmitted for verification', 'success');
      fetchProduct();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to resubmit product', 'error');
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* 1. HEADER */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
                <Button 
                    type="text" 
                    icon={<FiArrowLeft size={24} />} 
                    onClick={() => navigate(-1)} 
                    className="text-gray-500 hover:text-blue-600 p-0 mr-2"
                />
                <div className="relative">
                    <img 
                        src={mainImageUrl || 'https://via.placeholder.com/80'} 
                        alt="Product"
                        className="w-20 h-20 object-cover rounded border border-gray-200 bg-white"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-purple-100 text-purple-600 p-1 rounded-full border border-white">
                        <FiBox size={14} />
                    </div>
                </div>
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
            
            {/* Vendor Actions: Resubmit if Rejected */}
            {product.verification_status?.status === 'rejected' && (
                <Button 
                    type="primary" 
                    size="large"
                    onClick={handleResubmit}
                    className="bg-indigo-600 border-indigo-600 hover:bg-indigo-700"
                >
                    Resubmit for Verification
                </Button>
            )}
        </div>
      </div>

      {/* 2. VERIFICATION ALERT (If Rejected/Pending) */}
      <div className="mb-6">
         {product.verification_status?.status === 'rejected' && (
             <Alert
                message="Product Rejected"
                description={
                    <div className="mt-1">
                        <Paragraph className="text-red-600 mb-1">
                            <strong>Reason:</strong> {product.verification_status.rejection_reason || 'No reason provided.'}
                        </Paragraph>
                        {product.verification_status.suggestion && (
                            <Paragraph type="secondary" className="mb-0">
                                <strong>Suggestion:</strong> {product.verification_status.suggestion}
                            </Paragraph>
                        )}
                    </div>
                }
                type="error"
                showIcon
                className="border-l-4 border-l-red-500"
             />
         )}
         {product.verification_status?.status === 'pending_verification' && (
             <Alert
                message="Verification In Progress"
                description="Your product is currently being reviewed by the admin team. You will be notified once the review is complete."
                type="info"
                showIcon
                className="border-l-4 border-l-blue-500"
             />
         )}
      </div>

      <Row gutter={[24, 24]}>
        
        {/* LEFT COLUMN: DETAILS */}
        <Col xs={24} lg={16}>
             <Tabs type="card" defaultActiveKey="overview" className="custom-tabs">
                
                {/* TAB 1: OVERVIEW */}
                <TabPane tab="Overview" key="overview">
                    <Card className="shadow-sm rounded-lg mb-6">
                        <Descriptions title="Basic Information" bordered column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}>
                             <Descriptions.Item label="Material">{product.material?.name || 'N/A'}</Descriptions.Item>
                             <Descriptions.Item label="Brand">{product.brand?.name || 'N/A'}</Descriptions.Item>
                             <Descriptions.Item label="Short Description" span={2}>{product.short_description || 'N/A'}</Descriptions.Item>
                             <Descriptions.Item label="Created At">{new Date(product.createdAt).toLocaleDateString()}</Descriptions.Item>
                             <Descriptions.Item label="Last Updated">{new Date(product.updatedAt).toLocaleDateString()}</Descriptions.Item>
                        </Descriptions>
                        
                        <Divider orientation="left">Detailed Description</Divider>
                        <div className="px-4 py-2 bg-gray-50 rounded border border-gray-100">
                            {product.description ? (
                                <ReactQuill
                                    value={product.description}
                                    readOnly
                                    theme="bubble"
                                    className="readonly-quill"
                                />
                            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No description" />}
                        </div>
                    </Card>

                    {/* SEO */}
                    <Card title="SEO & Metadata" size="small" className="shadow-sm rounded-lg">
                        <Descriptions column={1} size="small" bordered>
                            <Descriptions.Item label="Meta Title">{product.category?.metaTitle || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Meta Keywords">
                                {product.category?.metaKeywords?.length > 0 ? (
                                    <Space wrap>
                                        {product.category.metaKeywords.map((k, i) => <Tag key={i}>{k}</Tag>)}
                                    </Space>
                                ) : 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </TabPane>

                {/* TAB 2: VISUAL ASSETS (Vendor View - Shows Status & Re-upload) */}
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
                                                    <div className="h-48 overflow-hidden flex items-center justify-center bg-gray-50">
                                                        <Image 
                                                            src={fileUrl} 
                                                            height="100%" 
                                                            width="100%"
                                                            className="object-cover"
                                                            preview={false} 
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
                                                            
                                                            {/* Re-upload Button if Rejected/Pending & Not Approved Product */}
                                                            {!img.verified && product.verification_status?.status !== 'approved' && (
                                                                <Upload
                                                                    accept="image/*"
                                                                    showUploadList={false}
                                                                    beforeUpload={(file) => {
                                                                        handleAssetUpload(img._id, file, 'image');
                                                                        return false;
                                                                    }}
                                                                >
                                                                    <Button 
                                                                        type="primary" 
                                                                        icon={<FiUpload />} 
                                                                        loading={uploadingAssetId === img._id}
                                                                        className="bg-blue-500 border-none"
                                                                    >
                                                                        Re-upload
                                                                    </Button>
                                                                </Upload>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Footer Info (Rejection Reason) */}
                                                    {(img.reason || img.uploaded_at) && (
                                                        <div className="p-3 bg-white border-t">
                                                            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                                                                <span>Uploaded: {new Date(img.uploaded_at).toLocaleDateString()}</span>
                                                            </div>
                                                            {img.reason && (
                                                                <Alert 
                                                                    message={img.reason} 
                                                                    type="error" 
                                                                    showIcon 
                                                                    className="mt-1 text-xs py-1" 
                                                                    style={{ border: 'none', background: '#fff1f0' }}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
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

                {/* TAB 3: PRICING & STOCK */}
                <TabPane tab={<Space><FiDollarSign /> Pricing & Stock</Space>} key="pricing">
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                             <Card className="shadow-sm rounded-lg bg-white h-full">
                                <Statistic 
                                    title="Final Selling Price" 
                                    value={product.pricing?.final_price} 
                                    prefix={currencySymbol} 
                                    precision={2}
                                    valueStyle={{ color: THEME.primary, fontWeight: 'bold' }}
                                />
                                <Divider />
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <Text type="secondary">Base Price:</Text>
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
                                 <Row gutter={16}>
                                     <Col span={12}>
                                         <Statistic 
                                            title="Total Stock" 
                                            value={product.stock?.total_quantity} 
                                            prefix={<FiBox />} 
                                         />
                                     </Col>
                                     <Col span={12}>
                                         <Statistic 
                                            title="Available" 
                                            value={product.stock?.total_available} 
                                            valueStyle={{ color: THEME.success }}
                                         />
                                     </Col>
                                 </Row>
                                 <Divider />
                                 <div className="space-y-3">
                                     <div className="flex justify-between text-sm">
                                         <Text type="secondary">Reserved Stock:</Text>
                                         <Text>{product.stock?.total_reserved || 0}</Text>
                                     </div>
                                     <div className="flex justify-between text-sm">
                                         <Text type="secondary">Profit Margin:</Text>
                                         <Text type="success">{currencySymbol} {product.pricing?.margin}</Text>
                                     </div>
                                     <div className="flex justify-between text-sm">
                                         <Text type="secondary">Cost Price:</Text>
                                         <Text>{currencySymbol} {product.pricing?.cost_price}</Text>
                                     </div>
                                 </div>
                             </Card>
                        </Col>
                    </Row>
                </TabPane>
             </Tabs>
        </Col>

        {/* RIGHT COLUMN: DOCUMENTS & 3D MODEL */}
        <Col xs={24} lg={8}>
            <div className="space-y-6">
                
                {/* Documents */}
                <Card title="Product Documents" className="shadow-sm rounded-lg">
                    {Object.keys(product.documents || {}).length > 0 ? (
                        <div className="space-y-3">
                             {Object.entries(product.documents || {}).map(([key, doc]) => {
                                 if(!doc) return null;
                                 return (
                                     <div key={key} className="p-3 border rounded bg-gray-50">
                                         <div className="flex justify-between items-center mb-2">
                                             <div className="flex items-center gap-2">
                                                 <FiFile className="text-gray-500"/>
                                                 <span className="text-sm capitalize font-medium">{key.replace('_', ' ')}</span>
                                             </div>
                                             <div className="flex gap-2">
                                                 {doc.path && (
                                                     <Button 
                                                         size="small" 
                                                         icon={<FiDownload />} 
                                                         onClick={() => window.open(getImageUrl(doc.path), '_blank')}
                                                      />
                                                 )}
                                                 {!doc.verified && product.verification_status?.status !== 'approved' && (
                                                     <Upload
                                                         accept=".pdf,image/*"
                                                         showUploadList={false}
                                                         beforeUpload={(file) => { handleAssetUpload(doc._id, file, 'document'); return false; }}
                                                     >
                                                         <Button size="small" icon={<FiUpload />} loading={uploadingAssetId === doc._id} />
                                                     </Upload>
                                                 )}
                                             </div>
                                         </div>
                                         <div className="flex items-center gap-2">
                                             {doc.verified ? <Tag color="success">Verified</Tag> : doc.reason ? <Tag color="error">Rejected</Tag> : <Tag color="warning">Pending</Tag>}
                                         </div>
                                         {doc.reason && (
                                             <Alert message={doc.reason} type="error" className="mt-2 text-xs py-1" showIcon style={{border:'none', background: '#fff1f0'}} />
                                         )}
                                     </div>
                                 )
                             })}
                        </div>
                    ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No documents" />}
                </Card>

                {/* 3D Model */}
                {product.three_d_model?.url && (
                    <Card title="3D Model" className="shadow-sm rounded-lg">
                        <div className="p-3 border rounded bg-gray-50">
                             <div className="flex justify-between items-center mb-2">
                                 <div className="flex items-center gap-2">
                                     <FiBox className="text-purple-500"/>
                                     <span className="text-sm">3D Asset</span>
                                 </div>
                                 <div className="flex gap-2">
                                     <Button 
                                         size="small" 
                                         icon={<FiDownload />} 
                                         onClick={() => window.open(getImageUrl(product.three_d_model.url), '_blank')}
                                      />
                                     {!product.three_d_model.verified && product.verification_status?.status !== 'approved' && (
                                         <Upload
                                             accept=".glb,.gltf,.obj,.fbx"
                                             showUploadList={false}
                                             beforeUpload={(file) => { handleAssetUpload(product.three_d_model._id, file, 'three_d_model'); return false; }}
                                         >
                                             <Button size="small" icon={<FiUpload />} loading={uploadingAssetId === product.three_d_model._id} />
                                         </Upload>
                                     )}
                                 </div>
                             </div>
                             <div className="flex items-center gap-2">
                                 {product.three_d_model.verified ? <Tag color="success">Verified</Tag> : product.three_d_model.reason ? <Tag color="error">Rejected</Tag> : <Tag color="warning">Pending</Tag>}
                             </div>
                             {product.three_d_model.reason && (
                                 <Alert message={product.three_d_model.reason} type="error" className="mt-2 text-xs py-1" showIcon style={{border:'none', background: '#fff1f0'}} />
                             )}
                        </div>
                    </Card>
                )}

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

    </div>
  );
};

export default ProductProfile;