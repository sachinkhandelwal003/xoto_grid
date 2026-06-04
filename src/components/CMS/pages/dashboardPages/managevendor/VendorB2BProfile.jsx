import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../../manageApi/utils/toast';
import { FiArrowLeft, FiFile, FiDownload, FiZoomIn, FiCheck, FiX, FiUser } from 'react-icons/fi';
import { Button, Card, Spin, Avatar, Tag, Modal, Input, Divider, List, Table, Space, Tooltip } from 'antd';

const { TextArea } = Input;

const VendorB2BProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [vendor, setVendor] = useState(null);
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
    fetchVendor();
  }, [id, token]);

  const fetchVendor = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`/vendor/b2b?vendorId=${id}`);
      setVendor(response.vendor);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch vendor details', 'error');
      // navigate('/sawtar/cms/vendors');} finally {
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
      await apiService.put('/vendor/b2b/document/verification/check', {
        vendorId: id,
        documentId: selectedDocId,
        verified: isApproving,
        reason: reason.trim(),
        suggestion: suggestion.trim(),
      });
      showToast(`Document ${isApproving ? 'approved' : 'rejected'} successfully`, 'success');
      fetchVendor();
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
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">Loading vendor details...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Vendor not found</p>
          {/* <Button type="primary" className="mt-4" onClick={() => navigate('/sawtar/cms/vendors')}>
            Back to Vendors
          </Button> */}
        </div>
      </div>
    );
  }

  const documentTypes = {
    identity_proof: 'Identity Proof',
    compliance_documents: 'Compliance Documents',
    contract_documents: 'Contract Documents',
    audit_documents: 'Audit Documents',
  };

  const getDocumentsByType = () => {
    const docs = {
      identity_proof: vendor.documents.identity_proof ? [{ ...vendor.documents.identity_proof, type: 'identity_proof' }] : [],
      compliance_documents: vendor.documents.compliance_documents?.map(doc => ({ ...doc, type: 'compliance_documents' })) || [],
      contract_documents: vendor.documents.contract_documents?.map(doc => ({ ...doc, type: 'contract_documents' })) || [],
      audit_documents: vendor.documents.audit_documents?.map(doc => ({ ...doc, type: 'audit_documents' })) || [],
    };
    return docs;
  };

  const groupedDocuments = getDocumentsByType();

  const columns = [
    {
      title: 'Updated By',
      dataIndex: 'updated_by',
      key: 'updated_by',
    },
    {
      title: 'Changes',
      dataIndex: 'changes',
      key: 'changes',
      render: (changes) => changes.join(', '),
    },
    {
      title: 'Updated At',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <Button
            icon={<FiArrowLeft />}
            type="link"
            onClick={() => navigate('/sawtar/cms/vendors')}
            className="text-blue-600"
          >
            Back to Vendors
          </Button>
          <h1 className="mt-2 text-2xl font-bold">Vendor Profile</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card className="shadow-md">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="flex justify-center mb-4">
              {vendor.business_details?.logo ? (
                <Avatar src={`http://localhost:5000/${vendor.business_details.logo}`} size={96} />
              ) : (
                <Avatar icon={<FiUser />} size={96} className="bg-gray-200" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Business Name</p>
                <p>{vendor.business_details?.business_name || '--'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Owner Name</p>
                <p>{vendor.full_name || '--'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{vendor.email || '--'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="flex items-center">
                  {vendor.mobile || '--'}
                  {vendor.is_mobile_verified && <Tag color="green" className="ml-2">Verified</Tag>}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Business Type</p>
                <p>{vendor.business_details?.business_type || '--'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Tag
                  color={
                    vendor.status_info?.status === 0
                      ? 'orange'
                      : vendor.status_info?.status === 1
                      ? 'green'
                      : 'red'
                  }
                >
                  {vendor.status_info?.status === 0 ? 'Pending' : vendor.status_info?.status === 1 ? 'Approved' : 'Rejected'}
                </Tag>
                {vendor.status_info?.status === 2 && vendor.status_info?.rejection_reason && (
                  <p className="text-sm text-gray-500 mt-1">Reason: {vendor.status_info.rejection_reason}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Business Details */}
          <Card className="shadow-md">
            <h2 className="text-lg font-semibold mb-4">Business Details</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-500">Business Address</p>
                <p>{vendor.business_details?.business_address || '--'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pickup Address</p>
                <p>{vendor.business_details?.pickup_address || '--'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pincode</p>
                <p>{vendor.business_details?.pincode || '--'}</p>
              </div>
            </div>
          </Card>

          {/* Tax & Bank Details */}
          <Card className="shadow-md">
            <h2 className="text-lg font-semibold mb-4">Tax & Bank Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">PAN Number</p>
                <p>{vendor.registration?.pan_number || '--'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">GSTIN</p>
                <p>{vendor.registration?.gstin || '--'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bank Account Number</p>
                <p>{vendor.bank_details?.bank_account_number || '--'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">IFSC Code</p>
                <p>{vendor.bank_details?.ifsc_code || '--'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Holder Name</p>
                <p>{vendor.bank_details?.account_holder_name || '--'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preferred Currency</p>
                <p>{vendor.bank_details?.preferred_currency || '--'}</p>
              </div>
            </div>
          </Card>

          {/* Categories */}
          <Card className="shadow-md">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            {vendor.business_details?.categories && vendor.business_details.categories.length > 0 ? (
              <List
                dataSource={vendor.business_details.categories}
                renderItem={(category, index) => (
                  <List.Item>
                    <List.Item.Meta
                      title={category.name}
                      description={category.sub_categories?.length > 0 ? `Subcategories: ${category.sub_categories.join(', ')}` : null}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <p className="text-gray-500">No categories added</p>
            )}
          </Card>

          {/* Compliance Information */}
          <Card className="shadow-md">
            <h2 className="text-lg font-semibold mb-4">Compliance Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-500">Blacklist Status</p>
                <p>{vendor.compliance?.blacklist_status ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Insurance Policy Number</p>
                <p>{vendor.compliance?.insurance_details?.policy_number || '--'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ESG Compliance</p>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Environmental Policy: {vendor.compliance?.esg_compliance?.environmental_policy ? 'Yes' : 'No'}</p>
                  <p className="text-sm text-gray-600">Social Responsibility: {vendor.compliance?.esg_compliance?.social_responsibility ? 'Yes' : 'No'}</p>
                  <p className="text-sm text-gray-600">Governance Practices: {vendor.compliance?.esg_compliance?.governance_practices ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Meta Information */}
          <Card className="shadow-md">
            <h2 className="text-lg font-semibold mb-4">Meta Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p>{vendor.meta?.created_at ? new Date(vendor.meta.created_at).toLocaleString() : '--'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Updated At</p>
                <p>{vendor.meta?.updated_at ? new Date(vendor.meta.updated_at).toLocaleString() : '--'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Agreed to Terms</p>
                <p>{vendor.meta?.agreed_to_terms ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vendor Portal Access</p>
                <p>{vendor.meta?.vendor_portal_access ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </Card>

          {/* Documents - Grouped by Type */}
          <Card className="shadow-md col-span-1 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(documentTypes).map(([type, label]) => (
                <div key={type}>
                  <h3 className="text-base font-medium mb-2">{label}</h3>
                  {groupedDocuments[type].length > 0 ? (
                    groupedDocuments[type].map((doc) => {
                      const isImage = doc.path && isImageFile(doc.path);
                      return (
                        <Card key={doc._id} className="mb-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <Tag color={doc.verified ? 'green' : 'orange'} className="mb-2">
                                {doc.verified ? 'Verified' : 'Pending Verification'}
                              </Tag>
                              {(doc.reason || doc.suggestion) && (
                                <div className="mt-2">
                                  {doc.reason && <p className="text-red-500">Reason: {doc.reason}</p>}
                                  {doc.suggestion && <p className="text-gray-500">Suggestion: {doc.suggestion}</p>}
                                </div>
                              )}
                              {doc.uploaded_at && (
                                <p className="text-sm text-gray-500 mt-2">
                                  Uploaded At: {new Date(doc.uploaded_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <Space>
                              {isImage && (
                                <Tooltip title="View Document">
                                  <Button
                                    type="text"
                                    icon={<FiZoomIn />}
                                    onClick={() => openImageModal(doc)}
                                    className="text-blue-600"
                                  />
                                </Tooltip>
                              )}
                              <Tooltip title="Download Document">
                                <Button
                                  type="text"
                                  icon={<FiDownload />}
                                  onClick={() => downloadDocument(doc.path)}
                                  disabled={!doc.path}
                                  className="text-blue-600"
                                />
                              </Tooltip>
                              {!doc.verified && (
                                <>
                                  <Tooltip title="Approve Document">
                                    <Button
                                      type="text"
                                      icon={<FiCheck />}
                                      onClick={() => openVerificationModal(doc._id, true)}
                                      disabled={verifyingDoc === doc._id}
                                      className="text-green-600"
                                    />
                                  </Tooltip>
                                  <Tooltip title="Reject Document">
                                    <Button
                                      type="text"
                                      icon={<FiX />}
                                      onClick={() => openVerificationModal(doc._id, false)}
                                      disabled={verifyingDoc === doc._id}
                                      className="text-red-600"
                                    />
                                  </Tooltip>
                                </>
                              )}
                            </Space>
                          </div>
                          {isImage && doc.path && (
                            <div
                              className="mt-4 cursor-pointer"
                              onClick={() => openImageModal(doc)}
                            >
                              <img
                                src={`http://localhost:5000/${doc.path}`}
                                alt={label}
                                className="max-w-full max-h-48 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div
                                className="hidden items-center justify-center h-48 bg-gray-100 flex-col"
                              >
                                <FiFile size={32} className="text-gray-500" />
                                <p className="text-xs text-gray-500">Preview not available</p>
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })
                  ) : (
                    <Card>
                      <p className="text-center text-gray-500">No documents uploaded</p>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Change History */}
          <Card className="shadow-md col-span-1 md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold mb-4">Change History</h2>
            {vendor.meta?.change_history && vendor.meta.change_history.length > 0 ? (
              <Table
                columns={columns}
                dataSource={vendor.meta.change_history}
                rowKey="_id"
                pagination={false}
              />
            ) : (
              <p className="text-gray-500">No change history available</p>
            )}
          </Card>
        </div>

        {/* Image Viewer Modal */}
        <Modal
          open={imageViewerOpen}
          onCancel={closeImageModal}
          footer={null}
          width={800}
          centered
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {documentTypes[selectedDocument?.type] || selectedDocument?.type}
            </h2>
            <Button type="text" icon={<FiX />} onClick={closeImageModal} />
          </div>
          <div className="flex justify-center mb-4">
            <img
              src={`http://localhost:5000/${selectedDocument?.path}`}
              alt={documentTypes[selectedDocument?.type]}
              className="max-w-full max-h-[60vh] object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.className = 'text-center text-gray-500 p-8';
                errorDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="grey" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M12 18v-6M9 15h6"/></svg><p>Unable to load document preview</p><p className="text-sm mt-2">Please download the document to view it</p>';
                e.target.parentNode.appendChild(errorDiv);
              }}
            />
          </div>
          {(selectedDocument?.reason || selectedDocument?.suggestion) && (
            <div className="mb-4">
              {selectedDocument.reason && <p className="text-red-500">Reason: {selectedDocument.reason}</p>}
              {selectedDocument.suggestion && <p className="text-gray-500">Suggestion: {selectedDocument.suggestion}</p>}
            </div>
          )}
          <Divider />
          <div className="flex justify-between items-center mt-4">
            <Tag color={selectedDocument?.verified ? 'green' : 'orange'}>
              {selectedDocument?.verified ? 'Verified' : 'Pending Verification'}
            </Tag>
            <Button
              icon={<FiDownload />}
              type="primary"
              onClick={() => downloadDocument(selectedDocument?.path)}
            >
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
        >
          <h2 className="text-lg font-semibold mb-4">
            {isApproving ? 'Approve Document' : 'Reject Document'}
          </h2>
          <Input
            placeholder={isApproving ? 'Optional' : 'Reason (Required)'}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mb-4"
            status={!isApproving && !reason.trim() ? 'error' : ''}
          />
          {!isApproving && !reason.trim() && (
            <p className="text-red-500 text-sm mb-4">Reason is required for rejection</p>
          )}
          <TextArea
            placeholder="Suggestion (Optional)"
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            className="mb-4"
          />
          <div className="flex justify-end gap-4">
            <Button onClick={() => setVerificationModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              danger={!isApproving}
              onClick={handleSubmitVerification}
              disabled={verifyingDoc === selectedDocId}
            >
              {verifyingDoc === selectedDocId ? 'Processing...' : isApproving ? 'Approve' : 'Reject'}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default VendorB2BProfile;