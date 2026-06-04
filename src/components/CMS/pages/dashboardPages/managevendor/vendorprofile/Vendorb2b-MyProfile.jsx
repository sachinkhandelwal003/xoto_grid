import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { apiService } from '../../../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../../../manageApi/utils/toast';
import { FiArrowLeft, FiCheck, FiX, FiDownload, FiFile, FiZoomIn, FiXCircle, FiEdit, FiPackage, FiDollarSign, FiShoppingCart, FiClock } from 'react-icons/fi';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const MyProfileb2b = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const fileInputRef = useRef(null);
  const [updatingDocument, setUpdatingDocument] = useState(false);

  // Dummy data for stats (replace with actual API call if available)
  const stats = {
    totalProducts: 120,
    totalSales: 350,
    pendingOrders: 15,
    revenue: 24500,
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
    fetchVendor();
  }, [token]);

  const fetchVendor = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/vendor/b2b/profile');
      setVendor(response.vendor);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch profile details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleTogglePasswordVisibility = (field) => {
    if (field === 'currentPassword') {
      setShowCurrentPassword(!showCurrentPassword);
    } else if (field === 'newPassword') {
      setShowNewPassword(!showNewPassword);
    } else if (field === 'confirmPassword') {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast('All fields are required', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New password and confirm password do not match', 'error');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showToast('New password must be at least 8 characters long', 'error');
      return;
    }
    setUpdatingPassword(true);
    try {
      await apiService.put('/vendor/b2b/change-password', passwordData);
      showToast('Password updated successfully', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setUpdatingPassword(false);
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

  const triggerFileUpload = (docId) => {
    setUpdatingDocument(docId);
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiService.put(`/vendor/b2b/document/${updatingDocument}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Document updated successfully', 'success');
      await fetchVendor(); // Refresh profile
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update document', 'error');
    } finally {
      setUpdatingDocument(false);
      fileInputRef.current.value = '';
    }
  };

  // Transform documents object to array for rendering
  const getDocumentsArray = () => {
    if (!vendor?.documents) return [];
    const documents = [];
    if (vendor.documents.identity_proof) {
      documents.push({ ...vendor.documents.identity_proof, _id: vendor.documents.identity_proof._id || 'identity_proof' });
    }
    ['compliance_documents', 'contract_documents', 'audit_documents'].forEach((docType) => {
      vendor.documents[docType]?.forEach((doc, index) => {
        documents.push({ ...doc, _id: doc._id || `${docType}_${index}`, type: docType });
      });
    });
    return documents;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading profile details...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium">Profile not found</p>
        </div>
      </div>
    );
  }

  const documentTypes = {
    identity_proof: 'Identity Proof',
    compliance_documents: 'Compliance Document',
    contract_documents: 'Contract Document',
    audit_documents: 'Audit Document',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-4">
              <FiPackage className="text-blue-600 text-3xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Products</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-4">
              <FiShoppingCart className="text-green-600 text-3xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Sales</h3>
                <p className="text-2xl font-bold text-green-600">{stats.totalSales}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-4">
              <FiClock className="text-yellow-600 text-3xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Pending Orders</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-4">
              <FiDollarSign className="text-purple-600 text-3xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Revenue</h3>
                <p className="text-2xl font-bold text-purple-600">${stats.revenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-6 border-b border-gray-200">
            {['profile', 'documents', 'change-password', 'seller-tab'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {tab === 'profile' && 'Profile'}
                {tab === 'documents' && 'Documents'}
                {tab === 'change-password' && 'Change Password'}
                {tab === 'seller-tab' && 'Seller Tab'}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-xl shadow-lg transition-transform duration-300 hover:scale-[1.02]">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Name</label>
                  <p className="text-gray-900 font-medium">{vendor.business_details?.business_name || '--'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Owner Name</label>
                  <p className="text-gray-900 font-medium">{vendor.full_name || '--'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 font-medium">{vendor.email || '--'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mobile</label>
                  <p className="text-gray-900 font-medium">
                    {vendor.mobile || '--'}{' '}
                    {vendor.is_mobile_verified && <span className="ml-2 text-xs text-green-600">Verified</span>}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Type</label>
                  <p className="text-gray-900 font-medium">{vendor.business_details?.business_type || '--'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      vendor.status_info?.status === 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : vendor.status_info?.status === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {vendor.status_info?.status === 0 ? 'Pending' : vendor.status_info?.status === 1 ? 'Approved' : 'Rejected'}
                  </p>
                  {vendor.status_info?.status === 2 && vendor.status_info?.rejection_reason && (
                    <p className="text-sm text-gray-600 mt-2">Reason: {vendor.status_info.rejection_reason}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-white p-6 rounded-xl shadow-lg transition-transform duration-300 hover:scale-[1.02]">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Business Details</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Address</label>
                  <p className="text-gray-900 font-medium">{vendor.business_details?.business_address || '--'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Pickup Address</label>
                  <p className="text-gray-900 font-medium">{vendor.business_details?.pickup_address || '--'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Pincode</label>
                  <p className="text-gray-900 font-medium">{vendor.business_details?.pincode || '--'}</p>
                </div>
              </div>
            </div>

            {/* Tax & Bank Details */}
            <div className="bg-white p-6 rounded-xl shadow-lg transition-transform duration-300 hover:scale-[1.02]">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Tax & Bank Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">PAN Number</label>
                  <p className="text-gray-900 font-medium">{vendor.registration?.pan_number || '--'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">GSTIN</label>
                  <p className="text-gray-900 font-medium">{vendor.registration?.gstin || '--'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Bank Account Number</label>
                  <p className="text-gray-900 font-medium">{vendor.bank_details?.bank_account_number || '--'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">IFSC Code</label>
                  <p className="text-gray-900 font-medium">{vendor.bank_details?.ifsc_code || '--'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Holder Name</label>
                  <p className="text-gray-900 font-medium">{vendor.bank_details?.account_holder_name || '--'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Preferred Currency</label>
                  <p className="text-gray-900 font-medium">{vendor.bank_details?.preferred_currency || '--'}</p>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white p-6 rounded-xl shadow-lg transition-transform duration-300 hover:scale-[1.02]">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Categories</h2>
              {vendor.business_details?.categories && vendor.business_details.categories.length > 0 ? (
                <div className="space-y-4">
                  {vendor.business_details.categories.map((category, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      {category.sub_categories && category.sub_categories.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-500">Subcategories: </span>
                          <span className="text-gray-700">{category.sub_categories.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No categories added</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Documents</h2>
            {getDocumentsArray().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getDocumentsArray().map((doc) => {
                  const isImage = isImageFile(doc.path);
                  return (
                    <div
                      key={doc._id}
                      className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{documentTypes[doc.type] || doc.type}</h3>
                          <div className="mt-2 flex items-center">
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full ${
                                doc.verified
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {doc.verified ? 'Verified' : 'Pending Verification'}
                            </span>
                          </div>
                          {(doc.reason || doc.suggestion) && (
                            <div className="mt-3">
                              {doc.reason && (
                                <p className="text-sm text-red-600">Reason: {doc.reason}</p>
                              )}
                              {doc.suggestion && (
                                <p className="text-sm text-gray-600 mt-1">Suggestion: {doc.suggestion}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-3">
                          {isImage && (
                            <button
                              onClick={() => openImageModal(doc)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                              title="View Document"
                            >
                              <FiZoomIn className="text-lg" />
                            </button>
                          )}
                          <button
                            onClick={() => downloadDocument(doc.path)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                            title="Download Document"
                          >
                            <FiDownload className="text-lg" />
                          </button>
                          {!doc.verified && (
                            <button
                              onClick={() => triggerFileUpload(doc._id)}
                              className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                              title="Update Document"
                            >
                              <FiEdit className="text-lg" />
                            </button>
                          )}
                        </div>
                      </div>
                      {isImage && (
                        <div className="mt-4">
                          <div
                            className="w-full h-48 bg-gray-100 rounded-lg cursor-pointer overflow-hidden flex items-center justify-center"
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
                          <p className="text-xs text-gray-500 mt-2 text-center">Click to view full size</p>
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
        )}

        {activeTab === 'change-password' && (
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Change Password</h2>
            <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="currentPassword"
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                id="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle current password visibility"
                        onClick={() => handleTogglePasswordVisibility('currentPassword')}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle new password visibility"
                        onClick={() => handleTogglePasswordVisibility('newPassword')}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText="Password must be at least 8 characters long"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => handleTogglePasswordVisibility('confirmPassword')}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleUpdatePassword}
                disabled={updatingPassword}
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </Box>
          </div>
        )}

        {activeTab === 'seller-tab' && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Seller Tab</h2>
            <p className="text-gray-600">Manage your seller account, view analytics, or update settings here.</p>
            {/* Add more content as needed */}
          </div>
        )}

        {/* Image Viewer Modal */}
        {imageViewerOpen && selectedDocument && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {documentTypes[selectedDocument.type] || selectedDocument.type}
                </h3>
                <button
                  onClick={closeImageModal}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiXCircle className="text-2xl" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6 flex items-center justify-center flex-col">
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
                      <p className="text-sm text-gray-600 mt-2">Suggestion: {selectedDocument.suggestion}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    selectedDocument.verified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {selectedDocument.verified ? 'Verified' : 'Pending Verification'}
                </span>
                <button
                  onClick={() => downloadDocument(selectedDocument.path)}
                  className="flex items-center text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                >
                  <FiDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept="image/*,.pdf"
        />
      </div>
    </div>
  );
};

export default MyProfileb2b;