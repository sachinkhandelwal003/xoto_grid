import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../../manageApi/utils/toast';
import { FaArrowLeft, FaFile, FaBuilding, FaPhone, FaEnvelope, FaGlobe, FaClock, FaStar, FaChartLine, FaUsers, FaBox, FaServicestack, FaInfoCircle, FaHistory } from 'react-icons/fa';
import { ArrowDownOutlined } from '@ant-design/icons';
import {
  Card,
  Modal,
  Button,
  Input,
  Spin,
  Avatar,
  Tag,
  Divider,
  List,
  Tooltip,
  Table,
  Collapse,
  Typography,
  Image,
  Space,
  Row,
  Col,
  Empty,
  Badge,
} from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const BusinessProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyingDoc, setVerifyingDoc] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [reason, setReason] = useState('');
  const [suggestion, setSuggestion] = useState('');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
    fetchBusiness();
  }, [id, token]);

  const fetchBusiness = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`/business?businessId=${id}`);
      setBusiness(response.business);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch business details', 'error');
      // navigate('/sawtar/cms/business');
    } finally {
      setLoading(false);
    }
  };

  const openVerificationModal = (docId, approving) => {
    setSelectedDocId(docId);
    setIsApproving(approving);
    setReason('');
    setSuggestion('');
    setVerificationModalOpen(true);
  };

  const handleSubmitVerification = async () => {
    if (!isApproving && !reason.trim()) {
      showToast('Reason is required for rejection', 'error');
      return;
    }

    setVerifyingDoc(selectedDocId);
    try {
      await apiService.put('/business/document/verification/check', {
        businessId: id,
        documentId: selectedDocId,
        verified: isApproving,
        reason: reason.trim(),
        suggestion: suggestion.trim(),
      });
      showToast(`Document ${isApproving ? 'approved' : 'rejected'} successfully`, 'success');
      fetchBusiness();
      setVerificationModalOpen(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update document', 'error');
    } finally {
      setVerifyingDoc(null);
    }
  };

  const downloadDocument = (path) => {
    window.open(`http://localhost:5000/${path}`, '_blank');
  };

  const openImageModal = (document) => {
    setSelectedDocument(document);
    setImageViewerOpen(true);
  };

  const closeImageModal = () => {
    setImageViewerOpen(false);
    setSelectedDocument(null);
  };

  const isImageFile = (filename) => {
    if (!filename) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-4 bg-gray-100 min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Loading business details..." />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-7xl mx-auto py-4 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Text type="danger">Business not found</Text>
          <Button type="primary" onClick={() => navigate('/sawtar/cms/business')} className="mt-2">
            Back to Businesses
          </Button>
        </div>
      </div>
    );
  }

  const documentTypes = {
    identity_proof: 'Identity Proof',
    address_proof: 'Address Proof',
    gst_certificate: 'GST Certificate',
    business_license: 'Business License',
  };

  const getDocumentsByType = () => {
    const docs = {};
    Object.keys(documentTypes).forEach((type) => {
      if (business.documents && business.documents[type]) {
        docs[type] = { ...business.documents[type], type };
      }
    });
    return docs;
  };

  const groupedDocuments = getDocumentsByType();

  const statusColor = {
    0: 'orange',
    1: 'green',
    2: 'red',
    3: 'gray',
  };

  const statusLabel = {
    0: 'Pending',
    1: 'Approved',
    2: 'Rejected',
    3: 'Suspended',
  };

  const reviewColumns = [
    {
      title: 'User Name',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (text) => text || '--',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (text) => text || '--',
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      render: (text) => text || '--',
    },
    {
      title: 'Reply',
      dataIndex: 'reply',
      key: 'reply',
      render: (text) => text || '--',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => (text ? new Date(text).toLocaleString() : '--'),
    },
  ];

  const historyColumns = [
    {
      title: 'Updated By',
      dataIndex: 'updated_by',
      key: 'updated_by',
      render: (text) => text || '--',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text) => text || '--',
    },
    {
      title: 'Changes',
      dataIndex: 'changes',
      key: 'changes',
      render: (changes) => (changes ? changes.join(', ') : '--'),
    },
    {
      title: 'Updated At',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (text) => (text ? new Date(text).toLocaleString() : '--'),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-4 bg-gray-50 min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button icon={<FaArrowLeft />} type="link" onClick={() => navigate('/sawtar/cms/business')}>
          Back to Businesses
        </Button>
        <Title level={3} className="mt-2 text-teal-600">
          Business Profile
        </Title>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="shadow-md">
          <Title level={4} className="text-teal-600 mb-4 flex items-center">
            <FaBuilding className="mr-2" /> Basic Information
          </Title>
          <div className="flex justify-center mb-4">
            {business.store_details?.logo ? (
              <Avatar size={96} src={`http://localhost:5000/${business.store_details.logo}`} />
            ) : (
              <Avatar size={96} className="bg-teal-500">
                <FaBuilding className="text-white text-3xl" />
              </Avatar>
            )}
          </div>
          <Space direction="vertical" className="w-full">
            <div>
              <Text type="secondary">Email</Text>
              <Paragraph>{business.email || '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">Full Name</Text>
              <Paragraph>{business.full_name || '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">Mobile</Text>
              <Paragraph>
                {business.mobile || '--'}
                {business.is_mobile_verified && <Tag color="green" className="ml-2">Verified</Tag>}
              </Paragraph>
            </div>
            <div>
              <Text type="secondary">Status</Text>
              <Paragraph>
                <Tag color={statusColor[business.status_info?.status]}>
                  {statusLabel[business.status_info?.status] || 'Unknown'}
                </Tag>
                {business.status_info?.remarks && (
                  <div className="mt-1 text-gray-600">Remarks: {business.status_info.remarks}</div>
                )}
              </Paragraph>
            </div>
          </Space>
        </Card>

        {/* Store Details */}
        <Card className="shadow-md lg:col-span-2">
          <Title level={4} className="text-teal-600 mb-4 flex items-center">
            <FaInfoCircle className="mr-2" /> Store / Business Details
          </Title>
          <Row gutter={16}>
            <Col span={12}>
              <Text type="secondary">Store Name</Text>
              <Paragraph>{business.store_details?.store_name || '--'}</Paragraph>
            </Col>
            <Col span={12}>
              <Text type="secondary">Tagline</Text>
              <Paragraph>{business.store_details?.tagline || '--'}</Paragraph>
            </Col>
            <Col span={24}>
              <Text type="secondary">Description</Text>
              <Paragraph>{business.store_details?.store_description || '--'}</Paragraph>
            </Col>
            <Col span={12}>
              <Text type="secondary">Store Type</Text>
              <Paragraph>{business.store_details?.store_type || '--'}</Paragraph>
            </Col>
            <Col span={12}>
              <Text type="secondary">Year of Establishment</Text>
              <Paragraph>{business.store_details?.year_of_establishment || '--'}</Paragraph>
            </Col>
            <Col span={12}>
              <Text type="secondary">Employee Count</Text>
              <Paragraph>{business.store_details?.employee_count || '--'}</Paragraph>
            </Col>
            <Col span={24}>
              <Text type="secondary">Address</Text>
              <Paragraph>
                {business.store_details?.store_address || '--'}, {business.store_details?.landmark || '--'},{' '}
                {business.store_details?.pincode || '--'}, {business.store_details?.city || '--'},{' '}
                {business.store_details?.state || '--'}, {business.store_details?.country || 'India'}
              </Paragraph>
            </Col>
            <Col span={24}>
              <Text type="secondary">Geo Location</Text>
              <Paragraph>
                Lat: {business.store_details?.geo_location?.lat || '--'}, Lng:{' '}
                {business.store_details?.geo_location?.lng || '--'}
              </Paragraph>
            </Col>
            <Col span={24}>
              <Text type="secondary">Website</Text>
              <Paragraph>{business.store_details?.website || '--'}</Paragraph>
            </Col>
            <Col span={24}>
              <Text type="secondary">Social Links</Text>
              <Paragraph>
                Facebook: {business.store_details?.social_links?.facebook || '--'} <br />
                Twitter: {business.store_details?.social_links?.twitter || '--'} <br />
                Instagram: {business.store_details?.social_links?.instagram || '--'} <br />
                LinkedIn: {business.store_details?.social_links?.linkedin || '--'} <br />
                YouTube: {business.store_details?.social_links?.youtube || '--'}
              </Paragraph>
            </Col>
            <Col span={24}>
              <Collapse accordion>
                <Panel header={`Gallery (${business.store_details?.gallery?.length || 0})`} key="gallery">
                  {business.store_details?.gallery?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {business.store_details.gallery.map((img, index) => (
                        <Image
                          key={index}
                          width={100}
                          height={100}
                          src={`http://localhost:5000/${img}`}
                          alt={`Gallery ${index}`}
                          className="object-cover"
                        />
                      ))}
                    </div>
                  ) : (
                    <Empty description="No gallery items" />
                  )}
                </Panel>
                <Panel header={`Videos (${business.store_details?.videos?.length || 0})`} key="videos">
                  {business.store_details?.videos?.length > 0 ? (
                    <List
                      dataSource={business.store_details.videos}
                      renderItem={(video) => <List.Item>{video}</List.Item>}
                    />
                  ) : (
                    <Empty description="No videos" />
                  )}
                </Panel>
                <Panel header={`Categories (${business.store_details?.categories?.length || 0})`} key="categories">
                  {business.store_details?.categories?.length > 0 ? (
                    <List
                      dataSource={business.store_details.categories}
                      renderItem={(category) => (
                        <List.Item>
                          <List.Item.Meta
                            title={category.name}
                            description={
                              category.subcategories?.length > 0
                                ? `Subcategories: ${category.subcategories.join(', ')}`
                                : '--'
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="No categories" />
                  )}
                </Panel>
              </Collapse>
            </Col>
          </Row>
        </Card>

        {/* Registration Details */}
        <Card className="shadow-md">
          <Title level={4} className="text-teal-600 mb-4 flex items-center">
            <FaFile className="mr-2" /> Registration Details
          </Title>
          <Space direction="vertical" className="w-full">
            <div>
              <Text type="secondary">PAN Number</Text>
              <Paragraph>{business.registration?.pan_number || '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">GSTIN</Text>
              <Paragraph>{business.registration?.gstin || '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">Business License Number</Text>
              <Paragraph>{business.registration?.business_license_number || '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">Shop Act License</Text>
              <Paragraph>{business.registration?.shop_act_license || '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">MSME Number</Text>
              <Paragraph>{business.registration?.msme_number || '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">FSSAI Number</Text>
              <Paragraph>{business.registration?.fssai_number || '--'}</Paragraph>
            </div>
          </Space>
        </Card>

        {/* Bank & Payment Details */}
        <Card className="shadow-md">
          <Title level={4} className="text-teal-600 mb-4 flex items-center">
            <FaChartLine className="mr-2" /> Bank & Payment Details
          </Title>
          <Space direction="vertical" className="w-full">
            <div>
              <Text type="secondary">Bank Account Number</Text>
              <Paragraph>{business.bank_details?.bank_account_number || '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">IFSC Code</Text>
              <Paragraph>{business.bank_details?.ifsc_code || '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">Account Holder Name</Text>
              <Paragraph>{business.bank_details?.account_holder_name || '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">UPI ID</Text>
              <Paragraph>{business.bank_details?.upi_id || '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">Preferred Currency</Text>
              <Paragraph>{business.bank_details?.preferred_currency || '--'}</Paragraph>
            </div>
          </Space>
        </Card>

        {/* Contact Persons */}
        <Card className="shadow-md">
          <Title level={4} className="text-teal-600 mb-4 flex items-center">
            <FaUsers className="mr-2" /> Contact Persons
          </Title>
          <Collapse accordion>
            <Panel header="Primary Contact" key="primary">
              <Space direction="vertical">
                <Text>Name: {business.contacts?.primary_contact?.name || '--'}</Text>
                <Text>Designation: {business.contacts?.primary_contact?.designation || '--'}</Text>
                <Text>Email: {business.contacts?.primary_contact?.email || '--'}</Text>
                <Text>Mobile: {business.contacts?.primary_contact?.mobile || '--'}</Text>
                <Text>WhatsApp: {business.contacts?.primary_contact?.whatsapp || '--'}</Text>
                <Text>Primary: {business.contacts?.primary_contact?.is_primary ? 'Yes' : 'No'}</Text>
              </Space>
            </Panel>
            <Panel header="Support Contact" key="support">
              <Space direction="vertical">
                <Text>Name: {business.contacts?.support_contact?.name || '--'}</Text>
                <Text>Designation: {business.contacts?.support_contact?.designation || '--'}</Text>
                <Text>Email: {business.contacts?.support_contact?.email || '--'}</Text>
                <Text>Mobile: {business.contacts?.support_contact?.mobile || '--'}</Text>
                <Text>WhatsApp: {business.contacts?.support_contact?.whatsapp || '--'}</Text>
                <Text>Primary: {business.contacts?.support_contact?.is_primary ? 'Yes' : 'No'}</Text>
              </Space>
            </Panel>
            <Panel header="Sales Contact" key="sales">
              <Space direction="vertical">
                <Text>Name: {business.contacts?.sales_contact?.name || '--'}</Text>
                <Text>Designation: {business.contacts?.sales_contact?.designation || '--'}</Text>
                <Text>Email: {business.contacts?.sales_contact?.email || '--'}</Text>
                <Text>Mobile: {business.contacts?.sales_contact?.mobile || '--'}</Text>
                <Text>WhatsApp: {business.contacts?.sales_contact?.whatsapp || '--'}</Text>
                <Text>Primary: {business.contacts?.sales_contact?.is_primary ? 'Yes' : 'No'}</Text>
              </Space>
            </Panel>
          </Collapse>
        </Card>

        {/* Documents */}
        <Card className="shadow-md col-span-1 md:col-span-2 lg:col-span-3">
          <Title level={4} className="text-teal-600 mb-4 flex items-center">
            <FaFile className="mr-2" /> Documents
          </Title>
          <Row gutter={16}>
            {Object.entries(documentTypes).map(([type, label]) => (
              <Col xs={24} md={12} key={type}>
                <Title level={5} className="text-teal-600 mb-2">
                  {label}
                </Title>
                {groupedDocuments[type] ? (
                  <Card bordered>
                    <div className="flex justify-between items-start">
                      <Space direction="vertical">
                        <Tag color={groupedDocuments[type].verified ? 'green' : 'orange'}>
                          {groupedDocuments[type].verified ? 'Verified' : 'Pending Verification'}
                        </Tag>
                        {(groupedDocuments[type].reason || groupedDocuments[type].suggestion) && (
                          <Space direction="vertical" size="small">
                            {groupedDocuments[type].reason && (
                              <Text type="danger">Reason: {groupedDocuments[type].reason}</Text>
                            )}
                            {groupedDocuments[type].suggestion && (
                              <Text type="secondary">Suggestion: {groupedDocuments[type].suggestion}</Text>
                            )}
                          </Space>
                        )}
                        {groupedDocuments[type].uploaded_at && (
                          <Text type="secondary">
                            Uploaded At: {new Date(groupedDocuments[type].uploaded_at).toLocaleString()}
                          </Text>
                        )}
                      </Space>
                      <Space>
                        {groupedDocuments[type].path && isImageFile(groupedDocuments[type].path) && (
                          <Tooltip title="View Document">
                            <Button icon={<ArrowDownOutlined />} onClick={() => openImageModal(groupedDocuments[type])} />
                          </Tooltip>
                        )}
                        <Tooltip title="Download Document">
                          <Button
                            icon={<ArrowDownOutlined />}
                            onClick={() => downloadDocument(groupedDocuments[type].path)}
                            disabled={!groupedDocuments[type].path}
                          />
                        </Tooltip>
                        {!groupedDocuments[type].verified && (
                          <>
                            <Tooltip title="Approve Document">
                              <Button
                                type="primary"
                                icon={<FaArrowLeft />} // Replace with check icon if needed
                                onClick={() => openVerificationModal(groupedDocuments[type]._id, true)}
                                disabled={verifyingDoc === groupedDocuments[type]._id}
                              />
                            </Tooltip>
                            <Tooltip title="Reject Document">
                              <Button
                                danger
                                icon={<FaArrowLeft />} // Replace with clear icon
                                onClick={() => openVerificationModal(groupedDocuments[type]._id, false)}
                                disabled={verifyingDoc === groupedDocuments[type]._id}
                              />
                            </Tooltip>
                          </>
                        )}
                      </Space>
                    </div>
                    {groupedDocuments[type].path && isImageFile(groupedDocuments[type].path) && (
                      <div className="mt-4 cursor-pointer" onClick={() => openImageModal(groupedDocuments[type])}>
                        <Image
                          src={`http://localhost:5000/${groupedDocuments[type].path}`}
                          alt={label}
                          preview={false}
                          className="max-h-48 object-contain"
                          fallback={<div className="h-48 bg-gray-100 flex flex-col items-center justify-center"><FaFile size={32} className="text-gray-500" /><Text type="secondary">Preview not available</Text></div>}
                        />
                      </div>
                    )}
                  </Card>
                ) : (
                  <Card bordered>
                    <Empty description="No document uploaded" />
                  </Card>
                )}
              </Col>
            ))}
          </Row>
        </Card>

        {/* Operations */}
        <Card className="shadow-md">
          <Title level={4} className="text-teal-600 mb-4 flex items-center">
            <FaClock className="mr-2" /> Operations
          </Title>
          <Space direction="vertical" className="w-full">
            <div>
              <Text type="secondary">Operational Hours</Text>
              <Paragraph>
                Monday: {business.operations?.operational_hours?.monday || '--'} <br />
                Tuesday: {business.operations?.operational_hours?.tuesday || '--'} <br />
                Wednesday: {business.operations?.operational_hours?.wednesday || '--'} <br />
                Thursday: {business.operations?.operational_hours?.thursday || '--'} <br />
                Friday: {business.operations?.operational_hours?.friday || '--'} <br />
                Saturday: {business.operations?.operational_hours?.saturday || '--'} <br />
                Sunday: {business.operations?.operational_hours?.sunday || '--'}
              </Paragraph>
            </div>
            <div>
              <Text type="secondary">Return Policy</Text>
              <Paragraph>{business.operations?.return_policy || '--'}</Paragraph>
            </div>
          </Space>
        </Card>

        {/* Performance & Analytics */}
        <Card className="shadow-md">
          <Title level={4} className="text-teal-600 mb-4 flex items-center">
            <FaChartLine className="mr-2" /> Performance & Analytics
          </Title>
          <Row gutter={16}>
            <Col span={12}>
              <Text type="secondary">Ratings</Text>
              <Paragraph>{business.performance?.ratings || '--'}</Paragraph>
            </Col>
            <Col span={12}>
              <Text type="secondary">Reviews Count</Text>
              <Paragraph>{business.performance?.reviews_count || '--'}</Paragraph>
            </Col>
            <Col span={12}>
              <Text type="secondary">Total Views</Text>
              <Paragraph>{business.performance?.total_views || '--'}</Paragraph>
            </Col>
            <Col span={12}>
              <Text type="secondary">Total Leads</Text>
              <Paragraph>{business.performance?.total_leads || '--'}</Paragraph>
            </Col>
            <Col span={12}>
              <Text type="secondary">Conversion Rate</Text>
              <Paragraph>{business.performance?.conversion_rate || '--'}%</Paragraph>
            </Col>
            <Col span={24}>
              <Text type="secondary">Top Selling Products</Text>
              <Paragraph>{business.performance?.top_selling_products?.join(', ') || '--'}</Paragraph>
            </Col>
          </Row>
        </Card>

        {/* Reviews */}
        <Card className="shadow-md col-span-1 md:col-span-2 lg:col-span-3">
          <Title level={4} className="text-teal-600 mb-4 flex items-center">
            <FaStar className="mr-2" /> Reviews
          </Title>
          {business.reviews?.length > 0 ? (
            <Table columns={reviewColumns} dataSource={business.reviews} rowKey="review_id" pagination={false} />
          ) : (
            <Empty description="No reviews available" />
          )}
        </Card>

        {/* Products */}
        <Card className="shadow-md">
          <Title level={4} className="text-teal-600 mb-4 flex items-center">
            <FaBox className="mr-2" /> Products
          </Title>
          {business.products?.length > 0 ? (
            <List
              dataSource={business.products}
              renderItem={(product, index) => (
                <List.Item key={index}>
                  <List.Item.Meta
                    title={product.name || '--'}
                    description={
                      <>
                        Description: {product.description || '--'} <br />
                        Price: {product.price || '--'} <br />
                        Stock Status: {product.stock_status || '--'} <br />
                        Images: {product.images?.join(', ') || '--'}
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No products added" />
          )}
        </Card>

        {/* Services */}
        <Card className="shadow-md">
          <Title level={4} className="text-teal-600 mb-4 flex items-center">
            <FaServicestack className="mr-2" /> Services
          </Title>
          {business.services?.length > 0 ? (
            <List
              dataSource={business.services}
              renderItem={(service, index) => (
                <List.Item key={index}>
                  <List.Item.Meta
                    title={service.name || '--'}
                    description={
                      <>
                        Description: {service.description || '--'} <br />
                        Price Range: {service.price_range || '--'} <br />
                        Images: {service.images?.join(', ') || '--'}
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No services added" />
          )}
        </Card>

        {/* SEO */}
        <Card className="shadow-md">
          <Title level={4} className="text-teal-600 mb-4 flex items-center">
            <FaGlobe className="mr-2" /> SEO Details
          </Title>
          <Space direction="vertical" className="w-full">
            <div>
              <Text type="secondary">Meta Title</Text>
              <Paragraph>{business.seo?.meta_title || '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">Meta Description</Text>
              <Paragraph>{business.seo?.meta_description || '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">Keywords</Text>
              <Paragraph>{business.seo?.keywords?.join(', ') || '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">Slug</Text>
              <Paragraph>{business.seo?.slug || '--'}</Paragraph>
            </div>
          </Space>
        </Card>

        {/* AI Insights */}
        <Card className="shadow-md">
          <Title level={4} className="text-teal-600 mb-4 flex items-center">
            <FaInfoCircle className="mr-2" /> AI Insights
          </Title>
          <Space direction="vertical" className="w-full">
            <div>
              <Text type="secondary">Recommended Category</Text>
              <Paragraph>{business.ai_insights?.recommended_category || '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">Sentiment Score</Text>
              <Paragraph>{business.ai_insights?.sentiment_score || '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">Fraud Risk Score</Text>
              <Paragraph>{business.ai_insights?.fraud_risk_score || '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">Priority Score</Text>
              <Paragraph>{business.ai_insights?.priority_score || '--'}</Paragraph>
            </div>
          </Space>
        </Card>

        {/* Meta Information */}
        <Card className="shadow-md">
          <Title level={4} className="text-teal-600 mb-4 flex items-center">
            <FaInfoCircle className="mr-2" /> Meta Information
          </Title>
          <Space direction="vertical" className="w-full">
            <div>
              <Text type="secondary">Agreed to Terms</Text>
              <Paragraph>{business.meta?.agreed_to_terms ? 'Yes' : 'No'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">Vendor Portal Access</Text>
              <Paragraph>{business.meta?.vendor_portal_access ? 'Yes' : 'No'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">Created At</Text>
              <Paragraph>{business.meta?.created_at ? new Date(business.meta.created_at).toLocaleString() : '--'}</Paragraph>
            </div>
            <div>
              <Text type="secondary">Updated At</Text>
              <Paragraph>{business.meta?.updated_at ? new Date(business.meta.updated_at).toLocaleString() : '--'}</Paragraph>
            </div>
          </Space>
        </Card>

        {/* Change History */}
        <Card className="shadow-md col-span-1 md:col-span-2 lg:col-span-3">
          <Title level={4} className="text-teal-600 mb-4 flex items-center">
            <FaHistory className="mr-2" /> Change History
          </Title>
          {business.meta?.change_history && business.meta.change_history.length > 0 ? (
            <Table columns={historyColumns} dataSource={business.meta.change_history} rowKey={(record, index) => index} pagination={false} />
          ) : (
            <Empty description="No change history available" />
          )}
        </Card>
      </div>

      {/* Image Viewer Modal */}
      <Modal
        open={imageViewerOpen}
        onCancel={closeImageModal}
        footer={null}
        centered
        width={600}
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
      >
        <Title level={4} className="text-teal-600">
          {documentTypes[selectedDocument?.type] || selectedDocument?.type}
        </Title>
        <div className="flex justify-center mb-4">
          <Image
            src={`http://localhost:5000/${selectedDocument?.path}`}
            alt={documentTypes[selectedDocument?.type]}
            className="max-h-96 object-contain"
            fallback={
              <div className="h-96 bg-gray-100 flex flex-col items-center justify-center">
                <FaFile size={32} className="text-gray-500" />
                <Text type="secondary">Unable to load document preview</Text>
                <Text type="secondary" className="text-sm mt-2">Please download the document to view it</Text>
              </div>
            }
          />
        </div>
        {(selectedDocument?.reason || selectedDocument?.suggestion) && (
          <Space direction="vertical" className="mb-4">
            {selectedDocument.reason && <Text type="danger">Reason: {selectedDocument.reason}</Text>}
            {selectedDocument.suggestion && <Text type="secondary">Suggestion: {selectedDocument.suggestion}</Text>}
          </Space>
        )}
        <Divider />
        <div className="flex justify-between items-center">
          <Tag color={selectedDocument?.verified ? 'green' : 'orange'}>
            {selectedDocument?.verified ? 'Verified' : 'Pending Verification'}
          </Tag>
          <Button icon={<ArrowDownOutlined />} type="primary" onClick={() => downloadDocument(selectedDocument?.path)}>
            Download
          </Button>
        </div>
      </Modal>

      {/* Verification Modal */}
      <Modal
        open={verificationModalOpen}
        onCancel={() => setVerificationModalOpen(false)}
        footer={null}
        centered
        width={600}
      >
        <Title level={4} className="text-teal-600 mb-4">
          {isApproving ? 'Approve Document' : 'Reject Document'}
        </Title>
        <Input
          placeholder={isApproving ? 'Optional' : 'Required'}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          status={!isApproving && !reason.trim() ? 'error' : ''}
          className="mb-4"
        />
        {!isApproving && !reason.trim() && <Text type="danger" className="mb-2">Reason is required for rejection</Text>}
        <TextArea
          placeholder="Optional"
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          rows={4}
          className="mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button onClick={() => setVerificationModalOpen(false)}>Cancel</Button>
          <Button
            type="primary"
            danger={!isApproving}
            onClick={handleSubmitVerification}
            loading={verifyingDoc === selectedDocId}
          >
            {isApproving ? 'Approve' : 'Reject'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default BusinessProfile;