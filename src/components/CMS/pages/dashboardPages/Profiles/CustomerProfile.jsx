import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, Avatar, Badge, Descriptions, Tag, Space, Row, Col,
  Divider, Typography, Button, Modal, Form, Input, Select,
  message, Upload, Tooltip, Tabs, Skeleton
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CameraOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
  GlobalOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { Country } from "country-state-city";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

const { Text, Title } = Typography;
const { Option } = Select;

const GENDER_LABELS = { male: "Male", female: "Female", other: "Other" };
const RESIDENCY_LABELS = { national: "National", resident: "Resident", non_resident: "Non Resident" };

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Edit Modal States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();

  // All countries for nationality dropdown
  const nationalityOptions = useMemo(() => {
    return Country.getAllCountries()
      .map((c) => ({ name: c.name, iso: c.isoCode }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("profile/get-profile-data");
      setProfile(response?.data?.data || response?.data || response);
    } catch (error) {
      console.error(error);
      message.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const handleAvatarUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setAvatarUploading(true);
      const uploadRes = await apiService.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageUrl = uploadRes?.data?.file?.url || uploadRes?.file?.url;
      if (!imageUrl) { message.error("Image URL not found in server response"); onError("Failed"); return; }
      await apiService.put("users/edit/customer", { profilePic: imageUrl });
      await getProfile();
      message.success("Profile photo updated successfully!");
      onSuccess("ok");
    } catch (error) {
      console.error("❌ Auto-update failed:", error);
      message.error("Failed to update profile photo");
      onError(error);
    } finally {
      setAvatarUploading(false);
    }
  };

  const beforeImageUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) { message.error("Only images allowed"); return false; }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) { message.error("Max 5MB allowed"); return false; }
    return isImage && isLt5M;
  };

  const showEditModal = () => {
    form.setFieldsValue({
      ...profile,
      gender: profile?.gender || "other",
      nationality: profile?.nationality || undefined,
      residencyStatus: profile?.residencyStatus || "non_resident",
    });
    setIsModalVisible(true);
  };

  const handleUpdate = async (values) => {
    setUpdating(true);
    try {
      await apiService.put("profile/update-profile", values);
      message.success("Customer profile updated!");
      setIsModalVisible(false);
      getProfile();
    } catch (error) {
      console.error(error);
      message.error("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const fullName = profile?.name
    ? `${profile?.name?.first_name || ""} ${profile?.name?.last_name || ""}`
    : "Customer";

  const phoneNumber = profile?.mobile?.number
    ? `${profile?.mobile?.country_code || ""} ${profile?.mobile?.number}`
    : "Not provided";

  const tabItems = [
    {
      key: "1",
      label: <span className="text-base font-medium"><InfoCircleOutlined className="mr-2" />Profile Details</span>,
      children: (
        <div className="pt-6">
          <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            size="middle"
            labelStyle={{ fontWeight: 600, background: "#FAFAFA", width: "180px" }}
          >
            <Descriptions.Item label={<><MailOutlined className="mr-2 text-purple-500" />Email</>}>
              <Text className="text-gray-700">{profile?.email || "N/A"}</Text>
            </Descriptions.Item>

            {/* Gender */}
            <Descriptions.Item label={<><UserOutlined className="mr-2 text-purple-500" />Gender</>}>
              <Tag color="purple" className="border-0 rounded-full px-3">
                {GENDER_LABELS[profile?.gender] || profile?.gender || "N/A"}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label={<><PhoneOutlined className="mr-2 text-purple-500" />Mobile</>}>
              <Text className="text-gray-700">{phoneNumber}</Text>
            </Descriptions.Item>

            {/* Nationality */}
            <Descriptions.Item label={<><GlobalOutlined className="mr-2 text-purple-500" />Nationality</>}>
              <Text className="text-gray-700">{profile?.nationality || "N/A"}</Text>
            </Descriptions.Item>

            {/* Residency Status */}
            <Descriptions.Item label={<><IdcardOutlined className="mr-2 text-purple-500" />Residency Status</>}>
              <Tag
                color={
                  profile?.residencyStatus === "national" ? "green"
                  : profile?.residencyStatus === "resident" ? "blue"
                  : "default"
                }
                className="border-0 rounded-full px-3"
              >
                {RESIDENCY_LABELS[profile?.residencyStatus] || profile?.residencyStatus || "N/A"}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label={<><EnvironmentOutlined className="mr-2 text-purple-500" />Location</>} span={2}>
              <div>
                <Text strong className="text-gray-700">{profile?.location?.city || "Not Provided"}</Text>
                {profile?.location?.country && (
                  <div className="text-gray-500 text-sm mt-1">{profile.location.country}</div>
                )}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={<><CheckCircleOutlined className="mr-2 text-purple-500" />Status</>}>
              <Tag color={profile?.isActive ? "green" : "red"} className="m-0 border-0">
                {profile?.isActive ? "Active User" : "Inactive"}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label={<><CalendarOutlined className="mr-2 text-purple-500" />Member Since</>}>
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
            </Descriptions.Item>
          </Descriptions>
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
    <div className="bg-gray-50 min-h-screen py-8 px-4 relative">

      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-4">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate("/dashboard/customer")}
          className="text-[#5C039B] hover:bg-purple-50 font-medium px-0">
          Back to Dashboard
        </Button>
      </div>

      <div className="max-w-6xl mx-auto">

        {/* Top Banner Card */}
        <Card
          className="w-full rounded-2xl overflow-hidden shadow-lg border-0 mb-8"
          cover={<div className="h-48 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 relative"><div className="absolute inset-0 bg-black/10" /></div>}
          bodyStyle={{ padding: 0 }}
        >
          <div className="relative px-8 pt-2 pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">

              {/* Avatar */}
              <div className="relative -mt-16">
                <Badge dot status={profile?.isActive ? "success" : "warning"} offset={[-5, 85]}>
                  <Upload showUploadList={false} beforeUpload={beforeImageUpload} customRequest={handleAvatarUpload} disabled={avatarUploading}>
                    <Tooltip title="Change Photo">
                      <div className="relative group cursor-pointer">
                        {avatarUploading && (<div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-20"><LoadingOutlined className="text-white text-3xl" spin /></div>)}
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"><CameraOutlined className="text-white text-3xl" /></div>
                        <Avatar size={128} icon={<UserOutlined />} src={profile?.profilePic} className="border-4 border-white shadow-xl bg-gray-100 object-cover" />
                      </div>
                    </Tooltip>
                  </Upload>
                </Badge>
              </div>

              {/* Header Info */}
              <div className="flex-1 mt-4 md:mt-0">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <Title level={2} className="mb-2 !text-gray-800">{fullName}</Title>
                    <Space size={12} wrap>
                      <Tag color="purple" icon={<UserOutlined />} className="rounded-full px-4 py-1.5 text-sm font-medium border-0 bg-purple-100 text-purple-700">
                        Customer Account
                      </Tag>
                    </Space>
                  </div>
                  <Space>
                    <Button icon={<EditOutlined />} onClick={showEditModal} size="large" className="font-medium shadow-sm rounded-lg h-10 px-6">
                      Edit Profile
                    </Button>
                  </Space>
                </div>
              </div>

            </div>
          </div>
        </Card>

        {/* Tabs Card */}
        <Card className="w-full rounded-xl shadow-sm border-0" bodyStyle={{ padding: "0 24px 24px 24px" }}>
          <Tabs defaultActiveKey="1" items={tabItems} size="large" className="profile-tabs"
            tabBarStyle={{ borderBottom: "2px solid #f0f0f0", paddingTop: "10px", marginBottom: "0" }} />
        </Card>
      </div>

      {/* ── EDIT MODAL ── */}
      <Modal
        title={<div className="flex items-center gap-2"><EditOutlined className="text-purple-500 text-xl" /><span className="text-xl font-semibold">Edit Customer Profile</span></div>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
        className="edit-profile-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate} className="mt-4" initialValues={profile}>

          {/* Basic Info */}
          <Divider orientation="left" className="!text-sm !mt-0"><Space><UserOutlined /> Basic Information</Space></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name={["name", "first_name"]} label="First Name" rules={[{ required: true, message: "Required" }]}>
                <Input size="large" placeholder="John" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={["name", "last_name"]} label="Last Name" rules={[{ required: true, message: "Required" }]}>
                <Input size="large" placeholder="Doe" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="email" label="Email Address">
            <Input size="large" disabled placeholder="customer@example.com" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name={["mobile", "country_code"]} label="Code">
                <Input size="large" disabled placeholder="+91" />
              </Form.Item>
            </Col>
            <Col span={18}>
              <Form.Item name={["mobile", "number"]} label="Mobile Number" extra="Mobile number cannot be changed as it is used for login.">
                <Input size="large" disabled placeholder="1234567890" />
              </Form.Item>
            </Col>
          </Row>

          {/* Gender, Nationality, Residency */}
          <Divider orientation="left" className="!text-sm"><Space><IdcardOutlined /> Personal Details</Space></Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="gender" label="Gender" rules={[{ required: true, message: "Required" }]}>
                <Select size="large" placeholder="Select gender">
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="nationality" label="Nationality" rules={[{ required: true, message: "Required" }]}>
                <Select size="large" placeholder="Select nationality" showSearch
                  filterOption={(input, option) =>
                    option?.children?.toLowerCase().includes(input.toLowerCase())
                  }>
                  {nationalityOptions.map((c) => (
                    <Option key={c.iso} value={c.name}>{c.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="residencyStatus" label="Residency Status" rules={[{ required: true, message: "Required" }]}>
                <Select size="large" placeholder="Select status">
                  <Option value="national">National</Option>
                  <Option value="resident">Resident</Option>
                  <Option value="non_resident">Non Resident</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Location */}
          <Divider orientation="left" className="!text-sm"><Space><EnvironmentOutlined /> Location</Space></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name={["location", "city"]} label="City">
                <Input size="large" placeholder="e.g. Mumbai" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={["location", "country"]} label="Country">
                <Input size="large" placeholder="e.g. India" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button size="large" onClick={() => setIsModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updating} size="large" icon={<EditOutlined />}
              className="bg-purple-600 hover:bg-purple-700 border-purple-600">
              Save Changes
            </Button>
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

export default CustomerProfile;