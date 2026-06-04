import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Container, Box, Typography, TextField, Button, Card, Select, MenuItem, InputLabel, FormControl,
  Checkbox, FormControlLabel, CircularProgress, Modal, Alert, Chip
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import axios from 'axios';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

// Base API URLs
const API_URL = 'https://kotiboxglobaltech.online/api/vendor/b2b';
const OTP_API_URL = 'https://kotiboxglobaltech.online/api/auth/otp';

// File upload validation (only checks file type and size, no form validation)
const validateFile = (file) => {
  const isValid = file && (file.type.includes('image') || file.type.includes('pdf'));
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (!isValid) return { error: 'File must be an image or PDF' };
  if (file.size > maxSize) return { error: 'File size must be less than 5MB' };
  return { error: null };
};

// Country codes for mobile number dropdown
const countryCodes = [
  { code: '+91', label: 'India (+91)' },
  { code: '+1', label: 'USA (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+61', label: 'Australia (+61)' },
];

const Sellerb2b = () => {
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', fullName: '', mobile: '',
    businessName: '', businessDescription: '', businessType: '', businessAddress: '',
    pickupAddress: '', pincode: '', website: '', annualTurnover: 0,
    categories: [{ name: '', sub_categories: [] }],
    panNumber: '', gstin: '', companyRegistrationNumber: '',
    taxIdentificationNumber: '', importExportCode: '', businessLicenseNumber: '',
    bankAccountNumber: '', ifscCode: '', accountHolderName: '', preferredCurrency: 'INR',
    creditLimit: 0, paymentTerms: '', averagePaymentDelayDays: 0, primaryContactType: '',
    primaryContactName: '', primaryContactDesignation: '', primaryContactEmail: '',
    primaryContactMobile: '', supportContactType: '', supportContactName: '',
    supportContactDesignation: '', supportContactEmail: '', supportContactMobile: '',
    authorizedUserId: '', authorizedUserName: '', authorizedUserRole: '',
    authorizedUserEmail: '', identityProof: null, addressProof: null, businessProof: null,
    gstCertificate: null, cancelledCheque: null, complianceDocuments: [], contractDocuments: [],
    auditDocuments: [], logo: null, riskRating: '', sanctionCheckStatus: '', policyNumber: '',
    provider: '', validTill: null, coverageType: '', environmentalPolicy: false,
    socialResponsibility: false, governancePractices: false, warehouseLocation: '',
    warehouseCapacity: '', deliveryModes: [], leadTimeDays: 0, returnPolicy: '',
    agreedToTerms: false, vendorPortalAccess: false
  });
  const [serverErrors, setServerErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [mobile, setMobile] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otpSent, setOtpSent] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [newCategory, setNewCategory] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

  // Resend OTP timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Handle OTP send
  const handleSendOtp = useCallback(async () => {
    try {
      setMobile(formData.mobile);
      setOtpLoading(true);
      await axios.post(`${OTP_API_URL}/send`, {
        mobile: `${countryCode}${formData.mobile}`,
      });
      setOtpSent(true);
      setOtpModalOpen(true);
      setResendTimer(30);
      alert('OTP sent successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  }, [countryCode, formData.mobile]);

  // Handle OTP verification
  const handleVerifyOtp = useCallback(async () => {
    try {
      setOtpLoading(true);
      const response = await axios.post(`${OTP_API_URL}/verify`, {
        mobile: `${countryCode}${mobile}`,
        otp,
      });
      setIsMobileVerified(true);
      setOtpModalOpen(false);
      setAuthToken(response.data.token || null); // Assuming token is returned
      alert('Mobile number verified successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  }, [countryCode, mobile, otp]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : files ? files[0] : value
    }));
    setServerErrors([]); // Clear errors on input change
  };

  // Handle file uploads
  const handleFileChange = (name) => (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.error) {
        alert(validation.error);
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: file }));
    }
  };

  // Handle multiple file uploads
  const handleMultipleFileChange = (name) => (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => !validateFile(file).error);
    if (files.length !== validFiles.length) {
      alert('Some files were rejected due to invalid type or size');
    }
    setFormData((prev) => ({ ...prev, [name]: validFiles }));
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      alert('Category name is required');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      categories: [...prev.categories, { name: newCategory.trim(), sub_categories: [] }]
    }));
    setNewCategory('');
  };

  // Handle adding a new subcategory
  const handleAddSubCategory = () => {
    if (!newSubCategory.trim()) {
      alert('Subcategory name is required');
      return;
    }
    setFormData((prev) => {
      const updatedCategories = [...prev.categories];
      updatedCategories[selectedCategoryIndex].sub_categories = [
        ...updatedCategories[selectedCategoryIndex].sub_categories,
        newSubCategory.trim()
      ];
      return { ...prev, categories: updatedCategories };
    });
    setNewSubCategory('');
  };

  // Handle form submission
  const onSubmit = useCallback(async () => {
    setLoading(true);
    setServerErrors([]);

    const formDataToSend = new FormData();
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
        formDataToSend.append('confirmPassword', formData.confirmPassword);

    formDataToSend.append('full_name', formData.fullName);
    formDataToSend.append('mobile', `${countryCode}${formData.mobile}`);
    formDataToSend.append('is_mobile_verified', isMobileVerified);

    const businessDetails = {
      business_name: formData.businessName,
      business_description: formData.businessDescription,
      business_type: formData.businessType,
      business_address: formData.businessAddress,
      pickup_address: formData.pickupAddress,
      pincode: formData.pincode,
      website: formData.website,
      annual_turnover: Number(formData.annualTurnover),
      categories: formData.categories.filter(cat => cat.name), // Filter out empty categories
    };
    formDataToSend.append('business_details', JSON.stringify(businessDetails));

    const registration = {
      pan_number: formData.panNumber,
      gstin: formData.gstin,
      company_registration_number: formData.companyRegistrationNumber,
      tax_identification_number: formData.taxIdentificationNumber,
      import_export_code: formData.importExportCode,
      business_license_number: formData.businessLicenseNumber,
    };
    formDataToSend.append('registration', JSON.stringify(registration));

    const bankDetails = {
      bank_account_number: formData.bankAccountNumber,
      ifsc_code: formData.ifscCode,
      account_holder_name: formData.accountHolderName,
      preferred_currency: formData.preferredCurrency,
      credit_limit: Number(formData.creditLimit),
      payment_terms: formData.paymentTerms,
      average_payment_delay_days: Number(formData.averagePaymentDelayDays),
    };
    formDataToSend.append('bank_details', JSON.stringify(bankDetails));

    const contacts = {
      primary_contact: {
        type: formData.primaryContactType,
        name: formData.primaryContactName,
        designation: formData.primaryContactDesignation,
        email: formData.primaryContactEmail,
        mobile: formData.primaryContactMobile,
      },
      support_contacts: formData.supportContactName ? [{
        type: formData.supportContactType,
        name: formData.supportContactName,
        designation: formData.supportContactDesignation,
        email: formData.supportContactEmail,
        mobile: formData.supportContactMobile,
      }] : [],
      authorized_users: formData.authorizedUserName ? [{
        user_id: formData.authorizedUserId,
        name: formData.authorizedUserName,
        role: formData.authorizedUserRole,
        email: formData.authorizedUserEmail,
      }] : [],
    };
    formDataToSend.append('contacts', JSON.stringify(contacts));

    const compliance = {
      risk_rating: formData.riskRating,
      sanction_check_status: formData.sanctionCheckStatus,
      insurance_details: {
        policy_number: formData.policyNumber,
        provider: formData.provider,
        valid_till: formData.validTill ? dayjs(formData.validTill).toISOString() : null,
        coverage_type: formData.coverageType,
      },
      esg_compliance: {
        environmental_policy: formData.environmentalPolicy,
        social_responsibility: formData.socialResponsibility,
        governance_practices: formData.governancePractices,
      },
    };
    formDataToSend.append('compliance', JSON.stringify(compliance));

    const operations = {
      warehouses: formData.warehouseLocation ? [{
        location: formData.warehouseLocation,
        capacity: formData.warehouseCapacity
      }] : [],
      delivery_modes: formData.deliveryModes,
      lead_time_days: Number(formData.leadTimeDays),
      return_policy: formData.returnPolicy,
    };
    formDataToSend.append('operations', JSON.stringify(operations));

    const meta = {
      agreed_to_terms: formData.agreedToTerms,
      vendor_portal_access: formData.vendorPortalAccess,
    };
    formDataToSend.append('meta', JSON.stringify(meta));

    // Append single files
    ['identityProof', 'addressProof', 'businessProof', 'gstCertificate', 'cancelledCheque', 'logo'].forEach((field) => {
      if (formData[field]) {
        formDataToSend.append(field, formData[field]);
      }
    });

    // Append multiple files
    ['complianceDocuments', 'contractDocuments', 'auditDocuments'].forEach((field) => {
      formData[field].forEach((file) => {
        formDataToSend.append('additional', file);
      });
    });

    try {
      await axios.post(API_URL, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
      });
      alert('Vendor created successfully');
      setFormData({
        email: '', password: '', confirmPassword: '', fullName: '', mobile: '',
        businessName: '', businessDescription: '', businessType: '', businessAddress: '',
        pickupAddress: '', pincode: '', website: '', annualTurnover: 0,
        categories: [{ name: '', sub_categories: [] }],
        panNumber: '', gstin: '', companyRegistrationNumber: '',
        taxIdentificationNumber: '', importExportCode: '', businessLicenseNumber: '',
        bankAccountNumber: '', ifscCode: '', accountHolderName: '', preferredCurrency: 'INR',
        creditLimit: 0, paymentTerms: '', averagePaymentDelayDays: 0, primaryContactType: '',
        primaryContactName: '', primaryContactDesignation: '', primaryContactEmail: '',
        primaryContactMobile: '', supportContactType: '', supportContactName: '',
        supportContactDesignation: '', supportContactEmail: '', supportContactMobile: '',
        authorizedUserId: '', authorizedUserName: '', authorizedUserRole: '',
        authorizedUserEmail: '', identityProof: null, addressProof: null, businessProof: null,
        gstCertificate: null, cancelledCheque: null, complianceDocuments: [], contractDocuments: [],
        auditDocuments: [], logo: null, riskRating: '', sanctionCheckStatus: '', policyNumber: '',
        provider: '', validTill: null, coverageType: '', environmentalPolicy: false,
        socialResponsibility: false, governancePractices: false, warehouseLocation: '',
        warehouseCapacity: '', deliveryModes: [], leadTimeDays: 0, returnPolicy: '',
        agreedToTerms: false, vendorPortalAccess: false
      });
      setIsMobileVerified(false);
      setOtpSent(false);
      setOtp('');
      setMobile('');
      setAuthToken(null);
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.success === false && errorData.statusCode === 400 && Array.isArray(errorData.errors)) {
        setServerErrors(errorData.errors);
      } else {
        setServerErrors([{ field: 'general', message: errorData?.message || 'Network error occurred' }]);
      }
    } finally {
      setLoading(false);
    }
  }, [isMobileVerified, countryCode, authToken, formData]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Card sx={{ p: 4, boxShadow: 3 }}>
          <Typography variant="h5" gutterBottom>Create B2B Vendor</Typography>

          {serverErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <ul>
                {serverErrors.map((error, index) => (
                  <li key={index}>{error.field}: {error.message}</li>
                ))}
              </ul>
            </Alert>
          )}

          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Basic Information</Typography>
            <TextField label="Email" name="email" value={formData.email} onChange={handleChange} fullWidth />
            <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth />
            <TextField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} fullWidth />
            <TextField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} fullWidth />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ width: '30%' }}>
                <InputLabel>Country Code</InputLabel>
                <Select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  label="Country Code"
                >
                  {countryCodes.map((code) => (
                    <MenuItem key={code.code} value={code.code}>{code.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Mobile Number"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                sx={{ width: '50%' }}
              />
              <Button
                variant="contained"
                onClick={handleSendOtp}
                disabled={otpLoading || isMobileVerified}
                sx={{ width: '20%' }}
              >
                {otpLoading ? <CircularProgress size={24} /> : isMobileVerified ? 'Verified' : 'Send OTP'}
              </Button>
            </Box>

            <Modal
              open={otpModalOpen}
              onClose={() => setOtpModalOpen(false)}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, width: 400 }}>
                <Typography variant="h6" gutterBottom>Verify Mobile Number</Typography>
                {otpLoading ? (
                  <CircularProgress />
                ) : (
                  <TextField
                    label="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    fullWidth
                    inputProps={{ maxLength: 6 }}
                  />
                )}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={() => setOtpModalOpen(false)}>Cancel</Button>
                  <Button
                    onClick={handleSendOtp}
                    disabled={resendTimer > 0 || otpLoading}
                  >
                    {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : 'Resend OTP'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading}
                  >
                    Verify OTP
                  </Button>
                </Box>
              </Box>
            </Modal>

            <Typography variant="h6">Business Details</Typography>
            <TextField label="Business Name" name="businessName" value={formData.businessName} onChange={handleChange} fullWidth />
            <TextField label="Business Description" name="businessDescription" value={formData.businessDescription} onChange={handleChange} multiline rows={4} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Business Type</InputLabel>
              <Select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                label="Business Type"
              >
                <MenuItem value="Individual">Individual</MenuItem>
                <MenuItem value="Private Limited">Private Limited</MenuItem>
                <MenuItem value="Partnership">Partnership</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Business Address" name="businessAddress" value={formData.businessAddress} onChange={handleChange} fullWidth />
            <TextField label="Pickup Address" name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} fullWidth />
            <TextField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} fullWidth />
            <TextField label="Website" name="website" value={formData.website} onChange={handleChange} fullWidth />
            <TextField label="Annual Turnover" name="annualTurnover" type="number" value={formData.annualTurnover} onChange={handleChange} fullWidth />
            
            <Typography variant="subtitle1">Categories</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="New Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={handleAddCategory}>Add Category</Button>
            </Box>
            {formData.categories.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Select Category</InputLabel>
                <Select
                  value={selectedCategoryIndex}
                  onChange={(e) => setSelectedCategoryIndex(e.target.value)}
                  label="Select Category"
                >
                  {formData.categories.map((cat, index) => (
                    <MenuItem key={index} value={index}>{cat.name || `Category ${index + 1}`}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="New Subcategory"
                value={newSubCategory}
                onChange={(e) => setNewSubCategory(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={handleAddSubCategory}>Add Subcategory</Button>
            </Box>
            {formData.categories[selectedCategoryIndex]?.sub_categories.length > 0 && (
              <Box>
                <Typography variant="subtitle2">Subcategories:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {formData.categories[selectedCategoryIndex].sub_categories.map((sub, index) => (
                    <Chip key={index} label={sub} />
                  ))}
                </Box>
              </Box>
            )}

            <Button variant="contained" component="label" startIcon={<UploadIcon />}>
              Upload Logo
              <input type="file" hidden onChange={handleFileChange('logo')} accept="image/*,application/pdf" />
            </Button>

            <Typography variant="h6">Registration Details</Typography>
            <TextField label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} fullWidth />
            <TextField label="GSTIN" name="gstin" value={formData.gstin} onChange={handleChange} fullWidth />
            <TextField label="Company Registration Number" name="companyRegistrationNumber" value={formData.companyRegistrationNumber} onChange={handleChange} fullWidth />
            <TextField label="Tax Identification Number" name="taxIdentificationNumber" value={formData.taxIdentificationNumber} onChange={handleChange} fullWidth />
            <TextField label="Import/Export Code" name="importExportCode" value={formData.importExportCode} onChange={handleChange} fullWidth />
            <TextField label="Business License Number" name="businessLicenseNumber" value={formData.businessLicenseNumber} onChange={handleChange} fullWidth />

            <Typography variant="h6">Bank Details</Typography>
            <TextField label="Bank Account Number" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} fullWidth />
            <TextField label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} fullWidth />
            <TextField label="Account Holder Name" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} fullWidth />
            <TextField label="Preferred Currency" name="preferredCurrency" value={formData.preferredCurrency} onChange={handleChange} fullWidth />
            <TextField label="Credit Limit" name="creditLimit" type="number" value={formData.creditLimit} onChange={handleChange} fullWidth />
            <TextField label="Payment Terms" name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} fullWidth />
            <TextField label="Average Payment Delay (Days)" name="averagePaymentDelayDays" type="number" value={formData.averagePaymentDelayDays} onChange={handleChange} fullWidth />

            <Typography variant="h6">Primary Contact</Typography>
            <TextField label="Contact Type" name="primaryContactType" value={formData.primaryContactType} onChange={handleChange} fullWidth />
            <TextField label="Contact Name" name="primaryContactName" value={formData.primaryContactName} onChange={handleChange} fullWidth />
            <TextField label="Designation" name="primaryContactDesignation" value={formData.primaryContactDesignation} onChange={handleChange} fullWidth />
            <TextField label="Contact Email" name="primaryContactEmail" value={formData.primaryContactEmail} onChange={handleChange} fullWidth />
            <TextField label="Contact Mobile" name="primaryContactMobile" value={formData.primaryContactMobile} onChange={handleChange} fullWidth />

            <Typography variant="h6">Support Contact (Optional)</Typography>
            <TextField label="Support Contact Type" name="supportContactType" value={formData.supportContactType} onChange={handleChange} fullWidth />
            <TextField label="Support Contact Name" name="supportContactName" value={formData.supportContactName} onChange={handleChange} fullWidth />
            <TextField label="Support Contact Designation" name="supportContactDesignation" value={formData.supportContactDesignation} onChange={handleChange} fullWidth />
            <TextField label="Support Contact Email" name="supportContactEmail" value={formData.supportContactEmail} onChange={handleChange} fullWidth />
            <TextField label="Support Contact Mobile" name="supportContactMobile" value={formData.supportContactMobile} onChange={handleChange} fullWidth />

            <Typography variant="h6">Authorized User (Optional)</Typography>
            <TextField label="Authorized User ID" name="authorizedUserId" value={formData.authorizedUserId} onChange={handleChange} fullWidth />
            <TextField label="Authorized User Name" name="authorizedUserName" value={formData.authorizedUserName} onChange={handleChange} fullWidth />
            <TextField label="Authorized User Role" name="authorizedUserRole" value={formData.authorizedUserRole} onChange={handleChange} fullWidth />
            <TextField label="Authorized User Email" name="authorizedUserEmail" value={formData.authorizedUserEmail} onChange={handleChange} fullWidth />

            <Typography variant="h6">Documents</Typography>
            <Button variant="contained" component="label" startIcon={<UploadIcon />}>
              Upload Identity Proof
              <input type="file" hidden onChange={handleFileChange('identityProof')} accept="image/*,application/pdf" />
            </Button>
            <Button variant="contained" component="label" startIcon={<UploadIcon />}>
              Upload Address Proof
              <input type="file" hidden onChange={handleFileChange('addressProof')} accept="image/*,application/pdf" />
            </Button>
            <Button variant="contained" component="label" startIcon={<UploadIcon />}>
              Upload Business Proof
              <input type="file" hidden onChange={handleFileChange('businessProof')} accept="image/*,application/pdf" />
            </Button>
            <Button variant="contained" component="label" startIcon={<UploadIcon />}>
              Upload GST Certificate
              <input type="file" hidden onChange={handleFileChange('gstCertificate')} accept="image/*,application/pdf" />
            </Button>
            <Button variant="contained" component="label" startIcon={<UploadIcon />}>
              Upload Cancelled Cheque
              <input type="file" hidden onChange={handleFileChange('cancelledCheque')} accept="image/*,application/pdf" />
            </Button>
            <Button variant="contained" component="label" startIcon={<UploadIcon />}>
              Upload Compliance Documents
              <input type="file" multiple hidden onChange={handleMultipleFileChange('complianceDocuments')} accept="image/*,application/pdf" />
            </Button>
            <Button variant="contained" component="label" startIcon={<UploadIcon />}>
              Upload Contract Documents
              <input type="file" multiple hidden onChange={handleMultipleFileChange('contractDocuments')} accept="image/*,application/pdf" />
            </Button>
            <Button variant="contained" component="label" startIcon={<UploadIcon />}>
              Upload Audit Documents
              <input type="file" multiple hidden onChange={handleMultipleFileChange('auditDocuments')} accept="image/*,application/pdf" />
            </Button>

            <Typography variant="h6">Compliance</Typography>
            <TextField label="Risk Rating" name="riskRating" value={formData.riskRating} onChange={handleChange} fullWidth />
            <TextField label="Sanction Check Status" name="sanctionCheckStatus" value={formData.sanctionCheckStatus} onChange={handleChange} fullWidth />

            <Typography variant="subtitle1">Insurance Details</Typography>
            <TextField label="Policy Number" name="policyNumber" value={formData.policyNumber} onChange={handleChange} fullWidth />
            <TextField label="Provider" name="provider" value={formData.provider} onChange={handleChange} fullWidth />
            <DatePicker
              label="Valid Till"
              value={formData.validTill}
              onChange={(newValue) => setFormData((prev) => ({ ...prev, validTill: newValue }))}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
            <TextField label="Coverage Type" name="coverageType" value={formData.coverageType} onChange={handleChange} fullWidth />

            <Typography variant="subtitle1">ESG Compliance</Typography>
            <FormControlLabel
              control={<Checkbox name="environmentalPolicy" checked={formData.environmentalPolicy} onChange={handleChange} />}
              label="Environmental Policy"
            />
            <FormControlLabel
              control={<Checkbox name="socialResponsibility" checked={formData.socialResponsibility} onChange={handleChange} />}
              label="Social Responsibility"
            />
            <FormControlLabel
              control={<Checkbox name="governancePractices" checked={formData.governancePractices} onChange={handleChange} />}
              label="Governance Practices"
            />

            <Typography variant="h6">Operations</Typography>
            <TextField label="Warehouse Location" name="warehouseLocation" value={formData.warehouseLocation} onChange={handleChange} fullWidth />
            <TextField label="Warehouse Capacity" name="warehouseCapacity" value={formData.warehouseCapacity} onChange={handleChange} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Delivery Modes</InputLabel>
              <Select
                name="deliveryModes"
                multiple
                value={formData.deliveryModes}
                onChange={(e) => setFormData((prev) => ({ ...prev, deliveryModes: e.target.value }))}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="Air">Air</MenuItem>
                <MenuItem value="Sea">Sea</MenuItem>
                <MenuItem value="Road">Road</MenuItem>
                <MenuItem value="Rail">Rail</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Lead Time (Days)" name="leadTimeDays" type="number" value={formData.leadTimeDays} onChange={handleChange} fullWidth />
            <TextField label="Return Policy" name="returnPolicy" value={formData.returnPolicy} onChange={handleChange} fullWidth />

            <Typography variant="h6">Meta</Typography>
            <FormControlLabel
              control={<Checkbox name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} />}
              label="Agree to Terms"
            />
            <FormControlLabel
              control={<Checkbox name="vendorPortalAccess" checked={formData.vendorPortalAccess} onChange={handleChange} />}
              label="Vendor Portal Access"
            />

            <Button
              variant="contained"
              color="primary"
              onClick={onSubmit}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Vendor'}
            </Button>
          </Box>
        </Card>
      </Container>
    </LocalizationProvider>
  );
};

export default memo(Sellerb2b);