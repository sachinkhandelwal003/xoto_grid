import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../../manageApi/utils/toast';
import { FiArrowLeft, FiCheck, FiX, FiDownload, FiFile, FiZoomIn, FiXCircle } from 'react-icons/fi';

const VendorProfile = () => {
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
      const response = await apiService.get(`/vendor?vendorId=${id}`);
      setVendor(response.vendor);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch vendor details', 'error');
      // navigate('/sawtar/cms/vendors');
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
      await apiService.post('/vendor/update-document-verification', {
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
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Vendor not found</p>
          <button
            // onClick={() => navigate('/sawtar/cms/vendors')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Vendors
          </button>
        </div>
      </div>
    );
  }

  const documentTypes = {
    identityProof: 'Identity Proof',
    addressProof: 'Address Proof',
    businessProof: 'Business Proof',
    gstCertificate: 'GST Certificate',
    cancelledCheque: 'Cancelled Cheque',
    additional: 'Additional Document',
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <button
          // onClick={() => navigate('/sawtar/cms/vendors')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Vendors
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">Vendor Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Business Name</label>
              <p className="text-gray-900">{vendor.businessName || '--'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Owner Name</label>
              <p className="text-gray-900">{vendor.fullName || '--'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{vendor.email || '--'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Mobile</label>
              <p className="text-gray-900">
                {vendor.mobile || '--'}{' '}
                {vendor.isMobileVerified && <span className="ml-2 text-xs text-green-600">Verified</span>}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Business Type</label>
              <p className="text-gray-900">{vendor.businessType || '--'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p
                className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                  vendor.status === 0
                    ? 'bg-yellow-100 text-yellow-800'
                    : vendor.status === 1
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {vendor.status === 0 ? 'Pending' : vendor.status === 1 ? 'Approved' : 'Rejected'}
              </p>
              {vendor.status === 2 && vendor.rejectionReason && (
                <p className="text-sm text-gray-600 mt-1">Reason: {vendor.rejectionReason}</p>
              )}
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Business Details</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Business Description</label>
              <p className="text-gray-900">{vendor.businessDescription || '--'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Business Address</label>
              <p className="text-gray-900">{vendor.businessAddress || '--'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Pickup Address</label>
              <p className="text-gray-900">{vendor.pickupAddress || '--'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Pincode</label>
              <p className="text-gray-900">{vendor.pincode || '--'}</p>
            </div>
          </div>
        </div>

        {/* Tax & Bank Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Tax & Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">PAN Number</label>
              <p className="text-gray-900">{vendor.panNumber || '--'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">GSTIN</label>
              <p className="text-gray-900">{vendor.gstin || '--'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Bank Account Number</label>
              <p className="text-gray-900">{vendor.bankAccountNumber || '--'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">IFSC Code</label>
              <p className="text-gray-900">{vendor.ifscCode || '--'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Account Holder Name</label>
              <p className="text-gray-900">{vendor.accountHolderName || '--'}</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Categories</h2>
          {vendor.categories && vendor.categories.length > 0 ? (
            <div className="space-y-3">
              {vendor.categories.map((category, index) => (
                <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="mt-1">
                      <span className="text-sm text-gray-500">Subcategories: </span>
                      {category.subcategories.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No categories added</p>
          )}
        </div>

        {/* Documents */}
        <div className="bg-white p-6 rounded-lg shadow col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Documents</h2>
          {vendor.documents && vendor.documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendor.documents.map((doc) => {
                const isImage = isImageFile(doc.path);
                return (
                  <div key={doc._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {documentTypes[doc.type] || doc.type}
                        </h3>
                        <div className="mt-2 flex items-center">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              doc.verified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {doc.verified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </div>
                        {(doc.reason || doc.suggestion) && (
                          <div className="mt-2">
                            {doc.reason && (
                              <p className="text-sm text-red-600">Reason: {doc.reason}</p>
                            )}
                            {doc.suggestion && (
                              <p className="text-sm text-gray-600 mt-1">
                                Suggestion: {doc.suggestion}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {isImage && (
                          <button
                            onClick={() => openImageModal(doc)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="View Document"
                          >
                            <FiZoomIn className="text-lg" />
                          </button>
                        )}
                        <button
                          onClick={() => downloadDocument(doc.path)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Download Document"
                        >
                          <FiDownload className="text-lg" />
                        </button>
                        {!doc.verified && (
                          <>
                            <button
                              onClick={() => openVerificationModal(doc._id, true)}
                              disabled={verifyingDoc === doc._id}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Approve Document"
                            >
                              <FiCheck className="text-lg" />
                            </button>
                            <button
                              onClick={() => openVerificationModal(doc._id, false)}
                              disabled={verifyingDoc === doc._id}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Reject Document"
                            >
                              <FiX className="text-lg" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Document thumbnail for images */}
                    {isImage && (
                      <div className="mt-3">
                        <div
                          className="w-full h-40 bg-gray-100 rounded-md cursor-pointer overflow-hidden flex items-center justify-center"
                          onClick={() => openImageModal(doc)}
                        >
                          <img
                            src={`http://localhost:5000/${doc.path}`}
                            alt={documentTypes[doc.type] || doc.type}
                            className="object-contain max-h-full max-w-full"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const fallback = e.target.nextSibling;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="hidden items-center justify-center text-gray-400 flex-col">
                            <FiFile className="text-3xl mb-2" />
                            <span>Preview not available</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">Click to view full size</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No documents uploaded</p>
          )}
        </div>
      </div>

      {/* Image Viewer Modal */}
      {imageViewerOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                {documentTypes[selectedDocument.type] || selectedDocument.type}
              </h3>
              <button
                onClick={closeImageModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiXCircle className="text-2xl" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center flex-col">
              <img
                src={`http://localhost:5000/${selectedDocument.path}`}
                alt={documentTypes[selectedDocument.type] || selectedDocument.type}
                className="max-w-full max-h-[60vh] object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'text-center text-gray-500 p-8';
                  errorDiv.innerHTML = `
                    <FiFile class="text-4xl mx-auto mb-2" />
                    <p>Unable to load document preview</p>
                    <p class="text-sm mt-2">Please download the document to view it</p>
                  `;
                  e.target.parentNode.insertBefore(errorDiv, e.target.nextSibling);
                }}
              />
              {(selectedDocument.reason || selectedDocument.suggestion) && (
                <div className="mt-4 w-full max-w-md">
                  {selectedDocument.reason && (
                    <p className="text-sm text-red-600">Reason: {selectedDocument.reason}</p>
                  )}
                  {selectedDocument.suggestion && (
                    <p className="text-sm text-gray-600 mt-2">
                      Suggestion: {selectedDocument.suggestion}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-between">
              <span
                className={`px-3 py-1 text-xs font-medium rounded ${
                  selectedDocument.verified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {selectedDocument.verified ? 'Verified' : 'Pending Verification'}
              </span>
              <button
                onClick={() => downloadDocument(selectedDocument.path)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <FiDownload className="mr-1" /> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {verificationModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {isApproving ? 'Approve Document' : 'Reject Document'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={isApproving ? 'Optional' : 'Required'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Suggestion</label>
                <input
                  type="text"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setVerificationModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitVerification}
                disabled={verifyingDoc === selectedDocId}
                className={`px-4 py-2 text-white rounded-md ${
                  isApproving
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } ${verifyingDoc === selectedDocId ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {verifyingDoc === selectedDocId ? 'Processing...' : isApproving ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProfile;