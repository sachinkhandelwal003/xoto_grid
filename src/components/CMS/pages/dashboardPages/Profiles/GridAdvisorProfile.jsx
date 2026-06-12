import React, { useEffect, useState } from "react";
import { 
  Card, Avatar, Badge, Descriptions, Tag, Space, Row, Col, 
  Divider, Typography, Button, Modal, Form, Input, 
  message, Upload, Tooltip, Tabs, Alert, Skeleton
} from "antd"; 
import {
  UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined,
  GlobalOutlined, FileProtectOutlined, InfoCircleOutlined, 
  CheckCircleOutlined, EditOutlined, CameraOutlined, 
  LoadingOutlined, UploadOutlined, SafetyCertificateOutlined,
  BankOutlined, VerifiedOutlined, ClockCircleOutlined, 
  CloseCircleOutlined, EyeOutlined, DownloadOutlined, InboxOutlined,
  FilePdfOutlined, DeleteOutlined, IdcardOutlined,
  CheckCircleFilled, WarningOutlined, SyncOutlined, LockOutlined
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

const { Text, Title, Paragraph } = Typography;

const THEME = {
  primary:     '#5c039b',
  primaryLight:'#f3e8ff',
  primaryMid:  '#9333ea',
  success:     '#16a34a',
  successLight:'#dcfce7',
  info:        '#0369a1',
  infoLight:   '#e0f2fe',
  warning:     '#b45309',
  warningLight:'#fef3c7',
  error:       '#b91c1c',
  errorLight:  '#fee2e2',
  gray:        '#64748b',
  grayLight:   '#f8fafc',
};

const GridAdvisorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [imageUploading, setImageUploading] = useState(false);

  const getProfile = async () => {
    try {
      const response = await apiService.get("gridadvisor/me");
      const data = response?.data?.data?.advisor || response?.data?.advisor || response?.data;
      setProfile(data);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch profile data");
    }
  };

  useEffect(() => { getProfile(); }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await getProfile();
    setIsRefreshing(false);
    message.success("Data refreshed successfully!");
  };

  const beforeImageUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) message.error('You can only upload JPG/PNG file!');
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) message.error('Image must be smaller than 2MB!');
    return isJpgOrPng && isLt2M;
  };

const handleImageUploadRequest = async ({ file, onSuccess, onError }) => {
  const formData = new FormData();
  formData.append("file", file);
  setImageUploading(true);
  try {
    const res  = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload`, {
      method: "POST",
      body:   formData,
    });
    const data = await res.json();

    const fileUrl =
      data?.file?.url       ||
      data?.data?.file?.url ||
      data?.url             ||
      data?.data?.url       ||
      null;

    if (!fileUrl) throw new Error("No URL in upload response");

    await apiService.patch("gridadvisor/me", { profilePhotoUrl: fileUrl });

    // ✅ YAHAN ADD KARO — patch ke baad, onSuccess se pehle
    message.success("Profile photo updated successfully!");
    window.dispatchEvent(
      new CustomEvent("gridAdvisorPhotoUpdated", {
        detail: { photoUrl: fileUrl },
      })
    );
    onSuccess("ok");
    getProfile();

  } catch (error) {
    console.error("Upload error:", error);
    onError(error);
    message.error("Failed to upload photo.");
  } finally {
    setImageUploading(false);
  }
};

  const showEditModal = () => {
    form.setFieldsValue({
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      phone: profile?.phone,
      nationality: profile?.nationality,
      location: profile?.location,
      bio: profile?.bio,
      languages: profile?.languages?.join(", "),
      "identity.type": profile?.identity?.type,
      "identity.idNumber": profile?.identity?.idNumber,
      "identity.expiryDate": profile?.identity?.expiryDate ? new Date(profile.identity.expiryDate).toISOString().split('T')[0] : "",
      "bankDetails.bankName": profile?.bankDetails?.bankName,
      "bankDetails.accountNumber": profile?.bankDetails?.accountNumber,
      "bankDetails.iban": profile?.bankDetails?.iban,
      "bankDetails.accountHolderName": profile?.bankDetails?.accountHolderName,
    });
    setIsEditModalVisible(true);
  };

  const handleUpdate = async (values) => {
    setUpdating(true);
    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        nationality: values.nationality,
        location: values.location,
        bio: values.bio,
        languages: values.languages ? values.languages.split(",").map(lang => lang.trim()).filter(Boolean) : [],
        identity: {
          type: values["identity.type"],
          idNumber: values["identity.idNumber"],
          expiryDate: values["identity.expiryDate"]
        },
        bankDetails: {
          bankName: values["bankDetails.bankName"],
          accountNumber: values["bankDetails.accountNumber"],
          iban: values["bankDetails.iban"],
          accountHolderName: values["bankDetails.accountHolderName"]
        }
      };
      await apiService.patch("gridadvisor/me", payload);
      message.success("Profile updated successfully!");
      setIsEditModalVisible(false);
      getProfile(); 
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }
    setChangingPassword(true);
    try {
      await apiService.post("gridadvisor/me/change-password", {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      message.success("Password changed successfully!");
      setIsPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const tabItems = [
    {
      key: "1",
      label: <span className="text-base font-medium"><UserOutlined className="mr-2" />Personal Details</span>,
      children: (
        <div className="pt-6">
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle" labelStyle={{ fontWeight: 600, background: "#FAFAFA", width: '180px' }}>
            <Descriptions.Item label={<><UserOutlined className="mr-2 text-purple-500" /> First Name</>}><Text className="text-gray-700">{profile?.firstName || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><UserOutlined className="mr-2 text-purple-500" /> Last Name</>}><Text className="text-gray-700">{profile?.lastName || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><MailOutlined className="mr-2 text-purple-500" /> Email</>}><Text copyable className="text-gray-700">{profile?.email || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><PhoneOutlined className="mr-2 text-purple-500" /> Phone</>}><Text className="text-gray-700">{profile?.phone || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><IdcardOutlined className="mr-2 text-purple-500" /> Employee ID</>}><Text className="text-gray-700">{profile?.employeeId || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><BankOutlined className="mr-2 text-purple-500" /> Department</>}><Text className="text-gray-700">{profile?.department || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><GlobalOutlined className="mr-2 text-purple-500" /> Nationality</>}><Text className="text-gray-700">{profile?.nationality || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><EnvironmentOutlined className="mr-2 text-purple-500" /> Location</>}><Text className="text-gray-700">{profile?.location || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><ClockCircleOutlined className="mr-2 text-purple-500" /> Joined At</>}><Text className="text-gray-700">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><GlobalOutlined className="mr-2 text-purple-500" /> Languages</>}><Text className="text-gray-700">{profile?.languages?.join(", ") || "N/A"}</Text></Descriptions.Item>
            {profile?.bio && (
              <Descriptions.Item label={<><InfoCircleOutlined className="mr-2 text-purple-500" /> Bio</>} span={2}><Text className="text-gray-700">{profile.bio}</Text></Descriptions.Item>
            )}
          </Descriptions>
        </div>
      ),
    },
    {
      key: "2",
      label: <span className="text-base font-medium"><IdcardOutlined className="mr-2" />ID Details</span>,
      children: (
        <div className="pt-6">
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle" labelStyle={{ fontWeight: 600, background: "#FAFAFA", width: '180px' }}>
            <Descriptions.Item label={<><FileProtectOutlined className="mr-2 text-purple-500" /> ID Type</>}>
              <Tag color={profile?.identity?.type ? "purple" : "default"}>
                {profile?.identity?.type ? profile.identity.type.replace("_", " ").toUpperCase() : "Not provided"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={<><IdcardOutlined className="mr-2 text-purple-500" /> ID Number</>}><Text className="text-gray-700">{profile?.identity?.idNumber || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><ClockCircleOutlined className="mr-2 text-purple-500" /> Expiry Date</>}><Text className="text-gray-700">{profile?.identity?.expiryDate ? new Date(profile.identity.expiryDate).toLocaleDateString() : "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><SafetyCertificateOutlined className="mr-2 text-purple-500" /> Verification Status</>}>
              <Tag color={profile?.identity?.isVerified ? "success" : "warning"}>
                {profile?.identity?.isVerified ? "Verified" : "Pending"}
              </Tag>
            </Descriptions.Item>
            {profile?.identity?.frontUrl && (
              <Descriptions.Item label={<><EyeOutlined className="mr-2 text-purple-500" /> Front Side</>} span={2}>
                <Button type="link" icon={<EyeOutlined />} onClick={() => window.open(profile.identity.frontUrl, '_blank')}>View Document</Button>
              </Descriptions.Item>
            )}
            {profile?.identity?.backUrl && (
              <Descriptions.Item label={<><EyeOutlined className="mr-2 text-purple-500" /> Back Side</>} span={2}>
                <Button type="link" icon={<EyeOutlined />} onClick={() => window.open(profile.identity.backUrl, '_blank')}>View Document</Button>
              </Descriptions.Item>
            )}
            {profile?.identity?.passportUrl && (
              <Descriptions.Item label={<><EyeOutlined className="mr-2 text-purple-500" /> Passport</>} span={2}>
                <Button type="link" icon={<EyeOutlined />} onClick={() => window.open(profile.identity.passportUrl, '_blank')}>View Document</Button>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>
      ),
    },
    {
      key: "3",
      label: <span className="text-base font-medium"><BankOutlined className="mr-2" />Bank Details</span>,
      children: (
        <div className="pt-6">
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle" labelStyle={{ fontWeight: 600, background: "#FAFAFA", width: '180px' }}>
            <Descriptions.Item label={<><BankOutlined className="mr-2 text-purple-500" /> Bank Name</>}><Text className="text-gray-700">{profile?.bankDetails?.bankName || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><UserOutlined className="mr-2 text-purple-500" /> Account Holder Name</>}><Text className="text-gray-700">{profile?.bankDetails?.accountHolderName || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><IdcardOutlined className="mr-2 text-purple-500" /> Account Number</>}><Text className="text-gray-700">{profile?.bankDetails?.accountNumber || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><FileProtectOutlined className="mr-2 text-purple-500" /> IBAN</>}><Text className="text-gray-700">{profile?.bankDetails?.iban || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><SafetyCertificateOutlined className="mr-2 text-purple-500" /> Verification Status</>} span={2}>
              <Tag color={profile?.bankDetails?.isVerified ? "success" : "warning"}>
                {profile?.bankDetails?.isVerified ? "Verified" : "Pending"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: "4",
      label: <span className="text-base font-medium"><LockOutlined className="mr-2" />Security</span>,
      children: (
        <div className="pt-6">
          <Card className="shadow-sm rounded-lg">
            <Title level={4} className="!mb-4">Change Password</Title>
            <Paragraph type="secondary">Update your password to keep your account secure.</Paragraph>
            <Button type="primary" icon={<LockOutlined />} onClick={() => setIsPasswordModalVisible(true)} className="mt-4 bg-purple-600 hover:bg-purple-700 border-purple-600">
              Change Password
            </Button>
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
    <div style={{ background: THEME.primaryLight, minHeight: '100vh', padding: '20px' }}>
      <div className="max-w-6xl mx-auto">
        <Card className="w-full rounded-2xl overflow-hidden shadow-lg border-0 mb-8" cover={<div className="h-48 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 relative"><div className="absolute inset-0 bg-black/10" /></div>} bodyStyle={{ padding: 0 }}>
          <div className="relative px-8 pt-2 pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div className="relative -mt-16">
                <Badge dot status={profile?.status === 'active' ? "success" : "warning"} offset={[-5, 85]}>
                  <Upload showUploadList={false} beforeUpload={beforeImageUpload} customRequest={handleImageUploadRequest} disabled={imageUploading}>
                    <Tooltip title="Change Photo">
                      <div className="relative group cursor-pointer">
                        {imageUploading && (<div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-20"><LoadingOutlined className="text-white text-3xl" spin /></div>)}
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"><CameraOutlined className="text-white text-3xl" /></div>
                        <Avatar size={128} icon={<UserOutlined />} src={profile?.profilePhotoUrl} className="border-4 border-white shadow-xl bg-white" />
                      </div>
                    </Tooltip>
                  </Upload>
                </Badge>
              </div>

              <div className="flex-1 mt-4 md:mt-0">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <Title level={2} className="mb-2 !text-gray-800">{profile?.firstName || ""} {profile?.lastName || "Advisor"}</Title>
                    <Space size={12} wrap>
                      <Tag color="purple" icon={<UserOutlined />} className="rounded-full px-4 py-1.5 text-sm font-medium border-0 bg-purple-100 text-purple-700">Grid Advisor</Tag>
                      {profile?.status === 'active' ? (
                        <Tag color="success" icon={<VerifiedOutlined />} className="rounded-full px-4 py-1.5 text-sm font-medium border-0 bg-green-100 text-green-700">Active</Tag>
                      ) : (
                        <Tag color="warning" icon={<ClockCircleOutlined />} className="rounded-full px-4 py-1.5 text-sm font-medium border-0 bg-yellow-100 text-yellow-700">{profile?.status || "Inactive"}</Tag>
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

      <Modal title={<div className="flex items-center gap-2"><EditOutlined className="text-purple-500 text-xl" /><span className="text-xl font-semibold">Edit Profile Information</span></div>} open={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} footer={null} width={800} destroyOnClose className="edit-profile-modal">
        <Form form={form} layout="vertical" onFinish={handleUpdate} className="mt-4" initialValues={profile}>
          <Divider orientation="left" className="!text-sm !mt-0"><Space><UserOutlined /> Personal Details</Space></Divider>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Please enter first name' }]}><Input size="large" placeholder="First Name" /></Form.Item></Col>
            <Col span={12}><Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Please enter last name' }]}><Input size="large" placeholder="Last Name" /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone" label="Phone Number"><Input size="large" placeholder="Phone Number" /></Form.Item></Col>
            <Col span={12}><Form.Item name="nationality" label="Nationality"><Input size="large" placeholder="Nationality" /></Form.Item></Col>
            <Col span={12}><Form.Item name="location" label="Location"><Input size="large" placeholder="Location" /></Form.Item></Col>
            <Col span={12}><Form.Item name="languages" label="Languages (comma separated)"><Input size="large" placeholder="e.g., English, Hindi, Arabic" /></Form.Item></Col>
            <Col span={24}><Form.Item name="bio" label="Bio"><Input.TextArea rows={3} size="large" placeholder="Tell us about yourself" /></Form.Item></Col>
          </Row>
          
          <Divider orientation="left" className="!text-sm !mt-6"><Space><IdcardOutlined /> ID Details</Space></Divider>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="identity.type" label="ID Type"><Input size="large" placeholder="e.g., emirates_id, passport" /></Form.Item></Col>
            <Col span={12}><Form.Item name="identity.idNumber" label="ID Number"><Input size="large" placeholder="ID Number" /></Form.Item></Col>
            <Col span={24}><Form.Item name="identity.expiryDate" label="Expiry Date"><Input type="date" size="large" placeholder="Expiry Date" /></Form.Item></Col>
          </Row>
          
          <Divider orientation="left" className="!text-sm !mt-6"><Space><BankOutlined /> Bank Details</Space></Divider>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="bankDetails.bankName" label="Bank Name"><Input size="large" placeholder="Bank Name" /></Form.Item></Col>
            <Col span={12}><Form.Item name="bankDetails.accountHolderName" label="Account Holder Name"><Input size="large" placeholder="Account Holder Name" /></Form.Item></Col>
            <Col span={12}><Form.Item name="bankDetails.accountNumber" label="Account Number"><Input size="large" placeholder="Account Number" /></Form.Item></Col>
            <Col span={12}><Form.Item name="bankDetails.iban" label="IBAN"><Input size="large" placeholder="IBAN" /></Form.Item></Col>
          </Row>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button size="large" onClick={() => setIsEditModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updating} size="large" icon={<EditOutlined />} className="bg-purple-600 hover:bg-purple-700 border-purple-600">Update Profile</Button>
          </div>
        </Form>
      </Modal>

      <Modal title={<div className="flex items-center gap-2"><LockOutlined className="text-purple-500 text-xl" /><span className="text-xl font-semibold">Change Password</span></div>} open={isPasswordModalVisible} onCancel={() => setIsPasswordModalVisible(false)} footer={null} width={600} destroyOnClose className="password-modal">
        <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword} className="mt-4">
          <Form.Item name="oldPassword" label="Current Password" rules={[{ required: true, message: 'Please enter current password' }]}><Input.Password size="large" placeholder="Enter current password" /></Form.Item>
          <Form.Item name="newPassword" label="New Password" rules={[{ required: true, message: 'Please enter new password' }, { min: 8, message: 'Password must be at least 8 characters' }]}><Input.Password size="large" placeholder="Enter new password" /></Form.Item>
          <Form.Item name="confirmPassword" label="Confirm New Password" rules={[{ required: true, message: 'Please confirm new password' }]}><Input.Password size="large" placeholder="Confirm new password" /></Form.Item>
          <div className="flex justify-end gap-3 mt-6">
            <Button size="large" onClick={() => setIsPasswordModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={changingPassword} size="large" icon={<LockOutlined />} className="bg-purple-600 hover:bg-purple-700 border-purple-600">Change Password</Button>
          </div>
        </Form>
      </Modal>

      <style jsx="true">{`
        .profile-tabs :global(.ant-tabs-tab) { padding: 16px 24px; margin: 0 !important; font-weight: 500; font-size: 15px; }
        .profile-tabs :global(.ant-tabs-tab:hover) { color: #7C3AED; }
        .profile-tabs :global(.ant-tabs-tab-active) { color: #7C3AED; font-weight: 600; }
        .profile-tabs :global(.ant-tabs-tab-active .ant-tabs-tab-btn) { color: #7C3AED; }
        .profile-tabs :global(.ant-tabs-ink-bar) { background: #7C3AED; height: 3px !important; border-radius: 2px; }
        .edit-profile-modal :global(.ant-modal-header), .password-modal :global(.ant-modal-header) { border-bottom: 2px solid #f0f0f0; padding: 20px 24px; border-radius: 12px 12px 0 0; }
        .edit-profile-modal :global(.ant-modal-body), .password-modal :global(.ant-modal-body) { padding: 24px; max-height: 70vh; overflow-y: auto; }
      `}</style>
    </div>
  );
};

export default GridAdvisorProfile;
