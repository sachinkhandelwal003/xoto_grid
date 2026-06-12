import React, { useEffect, useState } from "react";
import { 
  Card, Avatar, Badge, Descriptions, Tag, Space, Row, Col, 
  Divider, Typography, Button, Modal, Form, Input, 
  message, Upload, Tooltip, Tabs, Alert, Skeleton, 
  Steps, List, DatePicker
} from "antd"; 
import dayjs from "dayjs";
import {
  UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined,
  GlobalOutlined, FileProtectOutlined, InfoCircleOutlined, 
  CheckCircleOutlined, EditOutlined, CameraOutlined, 
  LoadingOutlined, UploadOutlined, SafetyCertificateOutlined,
  BankOutlined, VerifiedOutlined, ClockCircleOutlined, 
  CloseCircleOutlined, EyeOutlined, DownloadOutlined,
  FilePdfOutlined, DeleteOutlined, IdcardOutlined,
  CheckCircleFilled, WarningOutlined, SyncOutlined
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";
import { useSelector } from "react-redux";

const { Text, Title, Paragraph } = Typography;
const { Step } = Steps;

const ReferralPartnerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const user = useSelector((state) => state.auth?.user);
  
  // Profile Edit States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();
  const [imageUploading, setImageUploading] = useState(false);

  // ID Document States
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const [kycFiles, setKycFiles] = useState({
    passport: null,
    emirates_id: null
  });
  const [existingKycDocs, setExistingKycDocs] = useState([]);

  // Bank Details States
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);
  const [bankForm] = Form.useForm();
  const [updatingBank, setUpdatingBank] = useState(false);

  // Status Helper Functions
  const isIdVerified = () => {
    return !!profile?.idDocumentUrl;
  };
  
  const isBankAdded = () => {
    return !!(profile?.bankDetails?.iban && profile?.bankDetails?.accountNumber && profile?.bankDetails?.accountHolderName);
  };

  const hasIdDocument = () => {
    return existingKycDocs.length > 0 || !!profile?.idDocumentUrl;
  };

  // Fetch Profile
  const getProfile = async () => {
    try {
      const response = await apiService.get("referral/profile");
      const data = response?.data?.data || response?.data;
      
      const mappedData = {
        ...data,
        name: `${data?.firstName || ''} ${data?.lastName || ''}`.trim(),
        firstName: data?.firstName,
        lastName: data?.lastName,
        email: data?.email,
        phone_number: data?.phone,
        country_code: '+91',
        dateOfBirth: data?.dateOfBirth,
        idDocumentType: data?.idDocumentType,
        idDocumentUrl: data?.idDocumentUrl,
        bankDetails: data?.bankDetails,
        isPayoutEligible: data?.isPayoutEligible,
        isProfileComplete: data?.isProfileComplete,
        completionPercentage: data?.completionPercentage,
        profileCompletionSteps: data?.profileCompletionSteps,
        logo: data?.profilePhotoUrl || data?.profile_photo || data?.profilePic,
        isVerifiedByAdmin: data?.isProfileComplete
      };
      
      setProfile(mappedData);
      
      if (data?.idDocumentUrl) {
        const docType = data?.idDocumentType || 'passport';
        setExistingKycDocs([{
          type: docType,
          name: `${docType.replace('_', ' ').toUpperCase()}.pdf`,
          url: data.idDocumentUrl,
          _id: Date.now().toString(),
          uploadedAt: new Date().toISOString()
        }]);
        setKycFiles(prev => ({ 
          ...prev, 
          [docType]: { 
            type: docType, 
            name: `${docType.replace('_', ' ').toUpperCase()}.pdf`, 
            customName: docType.replace('_', ' '), 
            extension: '.pdf', 
            url: data.idDocumentUrl 
          }
        }));
      }
    } catch (error) {
      console.error(error);
      if (user) {
        setProfile({
          name: `${user?.firstName || user?.first_name || ''} ${user?.lastName || user?.last_name || ''}`.trim() || user?.name || 'Referral Partner',
          firstName: user?.firstName || user?.first_name,
          lastName: user?.lastName || user?.last_name,
          email: user?.email,
          phone_number: user?.phone,
          country_code: user?.country_code || '+91',
          isVerifiedByAdmin: false
        });
      }
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await getProfile();
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await getProfile();
    setIsRefreshing(false);
    message.success("Data refreshed successfully!");
  };

  // Profile Picture Upload
  const beforeImageUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) message.error('You can only upload JPG/PNG file!');
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) message.error('Image must be smaller than 2MB!');
    return isJpgOrPng && isLt2M;
  };

  const handleImageUploadRequest = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('profilePicture', file); 
    setImageUploading(true);
    try {
      await apiService.post("profile/update-profile-picture", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success("Profile picture updated successfully!");
      onSuccess("ok");
      getProfile(); 
    } catch (error) {
      onError(error);
      message.error("Failed to upload profile picture.");
    } finally {
      setImageUploading(false);
    }
  };

  const showEditModal = () => {
    form.setFieldsValue({
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      email: profile?.email,
      phone: profile?.phone_number || profile?.phone,
      dateOfBirth: profile?.dateOfBirth ? dayjs(profile.dateOfBirth) : null
    });
    setIsModalVisible(true);
  };

  const handleUpdate = async (values) => {
    setUpdating(true);
    try {
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null
      };
      await apiService.put("referral/profile/basic", payload);
      message.success("Profile updated successfully!");
      setIsModalVisible(false);
      getProfile(); 
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  // ID Document Upload Logic
  const handleIdDocFileChange = async (type, options) => {
    const { file, onSuccess, onError } = options;
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiService.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload`, formData);
      const resData = response?.data ?? response;
      const fileUrl = resData?.file?.url;

      if (!fileUrl) throw new Error("No URL returned from upload");

      const extension = file.name.substring(file.name.lastIndexOf('.'));
      const defaultName = file.name.substring(0, file.name.lastIndexOf('.'));

      setKycFiles(prev => ({
        ...prev,
        [type]: { type, name: file.name, customName: defaultName, extension: extension, url: fileUrl }
      }));

      onSuccess("ok");
      message.success(`${file.name} attached!`);
    } catch (err) {
      console.error(err);
      onError(err);
      message.error(`Failed to attach ${file.name}`);
    }
  };

  const submitIdDocument = async () => {
    const selectedDocType = kycFiles.passport?.url ? 'passport' : kycFiles.emirates_id?.url ? 'emirates_id' : null;
    if (!selectedDocType) {
      return message.warning("Please attach either Passport or Emirates ID.");
    }

    setSubmittingKyc(true);
    try {
      const payload = {
        idDocumentType: selectedDocType,
        idDocumentUrl: kycFiles[selectedDocType].url
      };

      await apiService.put("referral/profile/id-document", payload);
      message.success("ID Document uploaded successfully!");
      getProfile();
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to upload ID document");
    } finally {
      setSubmittingKyc(false);
    }
  };

  // Bank Details Functions
  const showBankModal = () => {
    bankForm.setFieldsValue({
      bankName: profile?.bankDetails?.bankName,
      accountNumber: profile?.bankDetails?.accountNumber,
      iban: profile?.bankDetails?.iban,
      accountHolderName: profile?.bankDetails?.accountHolderName
    });
    setIsBankModalVisible(true);
  };

  const handleUpdateBankDetails = async (values) => {
    setUpdatingBank(true);
    try {
      await apiService.put("referral/profile/bank", values);
      message.success("Bank details saved successfully!");
      setIsBankModalVisible(false);
      getProfile();
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to save bank details");
    } finally {
      setUpdatingBank(false);
    }
  };

  const renderIdDocumentsList = () => {
    const documents = existingKycDocs.length > 0 ? existingKycDocs : Object.values(kycFiles).filter(doc => doc?.url);
    if (documents.length === 0) return null;

    return (
      <div className="mt-6 text-left">
        <Text strong className="block mb-3">Uploaded ID Document:</Text>
        <List
          dataSource={documents}
          renderItem={(doc) => (
            <List.Item className="hover:bg-gray-50 rounded-lg transition-colors border px-4 mb-2 bg-white shadow-sm"
              actions={[
                <Button type="link" icon={<EyeOutlined />} onClick={() => window.open(doc.url, '_blank')} className="text-purple-600">View</Button>,
                <Button type="link" icon={<DownloadOutlined />} onClick={() => window.open(doc.url, '_blank')} className="text-purple-600">Download</Button>
              ]}
            >
              <List.Item.Meta avatar={<FilePdfOutlined style={{ fontSize: 28, color: '#ff4d4f' }} />}
                title={<Text strong className="text-sm">{doc.name}</Text>}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" className="text-xs capitalize">{doc.type?.replace('_', ' ').toUpperCase()}</Text>
                    {doc.uploadedAt && <Text type="secondary" className="text-xs">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</Text>}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </div>
    );
  };

  const renderIdUploadForm = () => {
    if (isIdVerified()) return null;
    return (
      <Card title={<div className="flex items-center gap-2"><UploadOutlined className="text-purple-500 text-lg" /><span className="font-semibold">Upload ID Document</span></div>} className="shadow-sm border rounded-lg mt-6 bg-gray-50">
        <Row gutter={[24, 24]}>
          {/* PASSPORT */}
          <Col span={24} md={12}>
            <div className="border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 bg-white">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"><UserOutlined className="text-purple-500 text-2xl" /></div>
              <Text strong className="block mb-3 text-base">Passport</Text>
              {!kycFiles.passport ? (
                <><Text type="secondary" className="text-xs block mb-3">PDF or Image (Max 5MB)</Text><Upload customRequest={(options) => handleIdDocFileChange('passport', options)} showUploadList={false} maxCount={1}><Button icon={<UploadOutlined />} size="large" className="mt-2">Select File</Button></Upload></>
              ) : (
                <div className="mt-3 text-left">
                  <div className="text-green-600 text-sm flex items-center justify-center gap-1 mb-2"><CheckCircleOutlined /> File Attached</div>
                  <Upload customRequest={(options) => handleIdDocFileChange('passport', options)} showUploadList={false} maxCount={1}><Button type="link" size="small">Change File</Button></Upload>
                </div>
              )}
            </div>
          </Col>
          {/* EMIRATES ID */}
          <Col span={24} md={12}>
            <div className="border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 bg-white">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><IdcardOutlined className="text-blue-500 text-2xl" /></div>
              <Text strong className="block mb-3 text-base">Emirates ID</Text>
              {!kycFiles.emirates_id ? (
                <><Text type="secondary" className="text-xs block mb-3">PDF or Image (Max 5MB)</Text><Upload customRequest={(options) => handleIdDocFileChange('emirates_id', options)} showUploadList={false} maxCount={1}><Button icon={<UploadOutlined />} size="large" className="mt-2">Select File</Button></Upload></>
              ) : (
                <div className="mt-3 text-left">
                  <div className="text-green-600 text-sm flex items-center justify-center gap-1 mb-2"><CheckCircleOutlined /> File Attached</div>
                  <Upload customRequest={(options) => handleIdDocFileChange('emirates_id', options)} showUploadList={false} maxCount={1}><Button type="link" size="small">Change File</Button></Upload>
                </div>
              )}
            </div>
          </Col>
        </Row>
        <Divider className="my-6" />
        <div className="text-center">
          <Button type="primary" size="large" onClick={submitIdDocument} loading={submittingKyc} icon={<SafetyCertificateOutlined />} className="bg-purple-600 hover:bg-purple-700 border-purple-600 px-8 h-12 text-base font-semibold" disabled={!kycFiles.passport?.url && !kycFiles.emirates_id?.url}>
            Upload ID Document
          </Button>
        </div>
      </Card>
    );
  };

  const tabItems = [
    {
      key: "1",
      label: <span className="text-base font-medium"><InfoCircleOutlined className="mr-2" />Profile Details</span>,
      children: (
        <div className="pt-6">
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle" labelStyle={{ fontWeight: 600, background: "#FAFAFA", width: '180px' }}>
            <Descriptions.Item label={<><MailOutlined className="mr-2 text-purple-500" /> Email</>}><Text copyable className="text-gray-700">{profile?.email || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><PhoneOutlined className="mr-2 text-purple-500" /> Phone</>}><Text className="text-gray-700">{profile?.phone_number || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><UserOutlined className="mr-2 text-purple-500" /> Date of Birth</>}>{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "N/A"}</Descriptions.Item>
            <Descriptions.Item label={<><SafetyCertificateOutlined className="mr-2 text-purple-500" /> ID Verified</>}>
              {isIdVerified() ? (
                <Tag color="success">Yes</Tag>
              ) : (
                <Tag color="warning">No</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label={<><BankOutlined className="mr-2 text-purple-500" /> Bank Details</>}>
              {isBankAdded() ? (
                <Tag color="success">Added</Tag>
              ) : (
                <Tag color="warning">Not Added</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label={<><CheckCircleOutlined className="mr-2 text-purple-500" /> Payout Eligible</>}>
              {profile?.isPayoutEligible ? (
                <Tag color="success">Yes</Tag>
              ) : (
                <Tag color="warning">No</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: "2",
      label: <span className="text-base font-medium"><SafetyCertificateOutlined className="mr-2" />ID Verification</span>,
      children: (
        <div className="pt-6">
          <Card className="shadow-sm rounded-lg" style={{ background: isIdVerified() ? '#f6ffed' : '#fff7e6', borderColor: isIdVerified() ? '#b7eb8f' : '#ffd666' }}>
            <div className="mb-6 border-b pb-6" style={{ borderColor: isIdVerified() ? '#b7eb8f' : '#ffd666' }}>
              <Steps current={isIdVerified() ? 1 : 0} size="small" className="max-w-md mx-auto">
                <Step title="Upload ID" />
                <Step title="Verified" />
              </Steps>
            </div>
            <div className="text-center pb-4">
              <div className="mx-auto mb-6" style={{ color: isIdVerified() ? '#52c41a' : '#faad14' }}>
                {isIdVerified() ? <CheckCircleFilled style={{ fontSize: 40 }} /> : <WarningOutlined style={{ fontSize: 40 }} />}
              </div>
              <Title level={4} className="mb-3">{isIdVerified() ? 'ID Verified' : 'Action Required'}</Title>
              <Text type="secondary" className="text-base block mb-6">{isIdVerified() ? 'Your ID has been verified successfully.' : 'Please upload either Passport or Emirates ID.'}</Text>
              {hasIdDocument() && renderIdDocumentsList()}
            </div>
          </Card>
          {renderIdUploadForm()}
        </div>
      ),
    },
    {
      key: "3",
      label: <span className="text-base font-medium"><BankOutlined className="mr-2" />Bank Details</span>,
      children: (
        <div className="pt-6">
          <Card className="shadow-sm rounded-lg">
            {isBankAdded() ? (
              <div>
                <Descriptions bordered column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }} size="middle" labelStyle={{ fontWeight: 600, background: "#FAFAFA", width: '200px' }}>
                  <Descriptions.Item label="Bank Name">{profile?.bankDetails?.bankName || "N/A"}</Descriptions.Item>
                  <Descriptions.Item label="Account Holder Name">{profile?.bankDetails?.accountHolderName || "N/A"}</Descriptions.Item>
                  <Descriptions.Item label="Account Number">{profile?.bankDetails?.accountNumber || "N/A"}</Descriptions.Item>
                  <Descriptions.Item label="IBAN">{profile?.bankDetails?.iban || "N/A"}</Descriptions.Item>
                </Descriptions>
                <Divider className="my-4" />
                <Button type="primary" onClick={showBankModal} icon={<EditOutlined />} className="bg-purple-600 hover:bg-purple-700 border-purple-600">
                  Edit Bank Details
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <WarningOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
                <Title level={4} className="mb-2">Bank Details Not Added</Title>
                <Text type="secondary" className="block mb-6">Please add your bank details to be eligible for payouts.</Text>
                <Button type="primary" size="large" onClick={showBankModal} icon={<EditOutlined />} className="bg-purple-600 hover:bg-purple-700 border-purple-600">
                  Add Bank Details
                </Button>
              </div>
            )}
          </Card>
        </div>
      ),
    },
  ];

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-4xl rounded-xl"><Skeleton active avatar paragraph={{ rows: 6 }} /></Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="w-full rounded-2xl overflow-hidden shadow-lg border-0 mb-8" cover={<div className="h-48 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 relative"><div className="absolute inset-0 bg-black/10" /></div>} bodyStyle={{ padding: 0 }}>
          <div className="relative px-8 pt-2 pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div className="relative -mt-16">
                <Badge dot status={profile?.isVerifiedByAdmin ? "success" : "warning"} offset={[-5, 85]}>
                  <Upload showUploadList={false} beforeUpload={beforeImageUpload} customRequest={handleImageUploadRequest} disabled={imageUploading}>
                    <Tooltip title="Change Photo">
                      <div className="relative group cursor-pointer">
                        {imageUploading && (<div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-20"><LoadingOutlined className="text-white text-3xl" spin /></div>)}
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"><CameraOutlined className="text-white text-3xl" /></div>
                        <Avatar size={128} icon={<UserOutlined />} src={profile?.logo || profile?.profile_photo || profile?.profilePic} className="border-4 border-white shadow-xl bg-white" />
                      </div>
                    </Tooltip>
                  </Upload>
                </Badge>
              </div>

              <div className="flex-1 mt-4 md:mt-0">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <Title level={2} className="mb-2 !text-gray-800">{profile?.name || "Referral Partner"}</Title>
                    <Space size={12} wrap>
                      <Tag color="purple" icon={<BankOutlined />} className="rounded-full px-4 py-1.5 text-sm font-medium border-0 bg-purple-100 text-purple-700">Referral Partner</Tag>
                      {profile?.isVerifiedByAdmin ? (
                        <Tag color="success" icon={<VerifiedOutlined />} className="rounded-full px-4 py-1.5 text-sm font-medium border-0 bg-green-100 text-green-700">Verified Partner</Tag>
                      ) : (
                        <Tag color="warning" icon={<ClockCircleOutlined />} className="rounded-full px-4 py-1.5 text-sm font-medium border-0 bg-yellow-100 text-yellow-700">Pending Verification</Tag>
                      )}
                    </Space>
                  </div>
                  <Space>
                    <Button icon={<SyncOutlined spin={isRefreshing} />} onClick={handleRefresh} size="large" className="font-medium shadow-sm rounded-lg h-10 px-4">Refresh</Button>
                    <Button icon={<EditOutlined />} onClick={showEditModal} size="large" className="font-medium shadow-sm rounded-lg h-10 px-6">Edit Profile</Button>
                  </Space>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="w-full rounded-xl shadow-sm border-0" bodyStyle={{ padding: "0 24px 24px 24px" }}>
          <Tabs defaultActiveKey="1" items={tabItems} size="large" className="profile-tabs" tabBarStyle={{ borderBottom: '2px solid #f0f0f0', paddingTop: '10px', marginBottom: '0' }} />
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Modal title={<div className="flex items-center gap-2"><EditOutlined className="text-purple-500 text-xl" /><span className="text-xl font-semibold">Edit Profile Information</span></div>} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} width={800} destroyOnClose className="edit-profile-modal">
        <Form form={form} layout="vertical" onFinish={handleUpdate} className="mt-4" initialValues={profile}>
          <Divider orientation="left" className="!text-sm !mt-0"><Space><UserOutlined /> Basic Information</Space></Divider>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Please enter first name' }]}><Input size="large" placeholder="First Name" /></Form.Item></Col>
            <Col span={12}><Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Please enter last name' }]}><Input size="large" placeholder="Last Name" /></Form.Item></Col>
            <Col span={12}><Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter email' }, { type: 'email', message: 'Please enter a valid email address' }]}><Input size="large" placeholder="Email" /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone" label="Phone Number" rules={[{ required: true, message: 'Please enter phone number' }]}><Input size="large" placeholder="Phone Number" /></Form.Item></Col>
            <Col span={12}><Form.Item name="dateOfBirth" label="Date of Birth"><DatePicker size="large" style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Select Date of Birth" /></Form.Item></Col>
          </Row>
          <div className="flex justify-end gap-3 mt-6">
            <Button size="large" onClick={() => setIsModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updating} size="large" icon={<EditOutlined />} className="bg-purple-600 hover:bg-purple-700 border-purple-600">Update Profile</Button>
          </div>
        </Form>
      </Modal>

      {/* Bank Details Modal */}
      <Modal title={<div className="flex items-center gap-2"><BankOutlined className="text-purple-500 text-xl" /><span className="text-xl font-semibold">Bank Details</span></div>} open={isBankModalVisible} onCancel={() => setIsBankModalVisible(false)} footer={null} width={800} destroyOnClose className="edit-profile-modal">
        <Form form={bankForm} layout="vertical" onFinish={handleUpdateBankDetails} className="mt-4">
          <Divider orientation="left" className="!text-sm !mt-0"><Space><BankOutlined /> Bank Information</Space></Divider>
          <Row gutter={16}>
            <Col span={24}><Form.Item name="bankName" label="Bank Name" rules={[{ required: true, message: 'Please enter bank name' }]}><Input size="large" placeholder="Bank Name" /></Form.Item></Col>
            <Col span={24}><Form.Item name="accountHolderName" label="Account Holder Name" rules={[{ required: true, message: 'Please enter account holder name' }]}><Input size="large" placeholder="Account Holder Name" /></Form.Item></Col>
            <Col span={12}><Form.Item name="accountNumber" label="Account Number" rules={[{ required: true, message: 'Please enter account number' }]}><Input size="large" placeholder="Account Number" /></Form.Item></Col>
            <Col span={12}><Form.Item name="iban" label="IBAN" rules={[{ required: true, message: 'Please enter IBAN' }]}><Input size="large" placeholder="IBAN" /></Form.Item></Col>
          </Row>
          <div className="flex justify-end gap-3 mt-6">
            <Button size="large" onClick={() => setIsBankModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updatingBank} size="large" icon={<BankOutlined />} className="bg-purple-600 hover:bg-purple-700 border-purple-600">Save Bank Details</Button>
          </div>
        </Form>
      </Modal>

      <style jsx="true">{`
        .profile-tabs :global(.ant-tabs-tab) { padding: 16px 24px; margin: 0 !important; font-weight: 500; font-size: 15px; }
        .profile-tabs :global(.ant-tabs-tab:hover) { color: #7C3AED; }
        .profile-tabs :global(.ant-tabs-tab-active) { color: #7C3AED; font-weight: 600; }
        .profile-tabs :global(.ant-tabs-tab-active .ant-tabs-tab-btn) { color: #7C3AED; }
        .profile-tabs :global(.ant-tabs-ink-bar) { background: #7C3AED; height: 3px !important; border-radius: 2px; }
        .edit-profile-modal :global(.ant-modal-header) { border-bottom: 2px solid #f0f0f0; padding: 20px 24px; border-radius: 12px 12px 0 0; }
        .edit-profile-modal :global(.ant-modal-body) { padding: 24px; max-height: 70vh; overflow-y: auto; }
      `}</style>
    </div>
  );
};

export default ReferralPartnerProfile;
