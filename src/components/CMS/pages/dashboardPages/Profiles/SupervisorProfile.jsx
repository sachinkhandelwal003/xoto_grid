import React, { useEffect, useState } from "react";
import { 
  Card, Avatar, Badge, Descriptions, Tag, Space, Button, 
  Upload, message, Spin, Modal, Form, Input, Row, Col 
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  StopOutlined,
  CameraOutlined,
  EditOutlined
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

const SupervisorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  // Edit Modal States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();

  const getProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("profile/get-profile-data");
      // Adjusting based on your data structure
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

  // --- Photo Upload Logic ---
  const handleAvatarUpload = async ({ file }) => {
    const formData = new FormData();
    // Apne backend route (update-profile-picture) ke liye 'profilePicture' use kar rahe hain
    formData.append("profilePicture", file); 

    try {
      setAvatarUploading(true);
      await apiService.post("profile/update-profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Profile photo updated successfully!");
      getProfile(); // Naya data fetch karne ke liye
    } catch (error) {
      console.error("Photo upload failed:", error);
      message.error("Failed to update profile photo");
    } finally {
      setAvatarUploading(false);
    }
  };

  const uploadProps = {
    showUploadList: false,
    customRequest: handleAvatarUpload,
    accept: "image/*",
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) { message.error("Only images allowed!"); return false; }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) { message.error("Image must be smaller than 5MB!"); return false; }
      return true;
    },
  };

  // --- Profile Text Update Logic ---
  const showEditModal = () => {
    form.setFieldsValue(profile);
    setIsModalVisible(true);
  };

  const handleUpdate = async (values) => {
    setUpdating(true);
    try {
      await apiService.put("profile/update-profile", values);
      message.success("Supervisor profile updated!");
      setIsModalVisible(false);
      getProfile();
    } catch (error) {
      console.error(error);
      message.error("Failed to update profile details");
    } finally {
      setUpdating(false);
    }
  };

  const fullName = profile?.name 
    ? `${profile.name.first_name || ""} ${profile.name.last_name || ""}`.trim() 
    : "Supervisor";

  return (
    <div className="flex justify-center p-6">
      <Card
        loading={loading}
        className="w-full max-w-4xl rounded-xl overflow-hidden shadow-lg border-0"
        cover={<div className="h-40 bg-gradient-to-br from-purple-600 to-black" />}
      >
        {/* Header Section */}
        <div className="relative -mt-20 mb-8 px-6">
          
          <div className="flex justify-between items-end">
            {/* Avatar & Upload */}
            <Badge
              dot
              status={profile?.isActive ? "success" : "error"}
              offset={[-15, 100]}
              title={profile?.isActive ? "Active" : "Inactive"}
            >
              <Upload {...uploadProps}>
                <div className="relative group cursor-pointer rounded-full border-4 border-white shadow-xl bg-white">
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-20">
                      <Spin size="small" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <CameraOutlined className="text-white text-2xl" />
                  </div>
                  <Avatar
                    size={130}
                    icon={<UserOutlined />}
                    src={profile?.logo || profile?.profilePic} // Fallback support
                    className="object-cover"
                  />
                </div>
              </Upload>
            </Badge>

            {/* Edit Button Shifted to Right */}
            <Button 
              icon={<EditOutlined />} 
              onClick={showEditModal}
              className="mb-2 font-medium border-gray-300 shadow-sm rounded-md"
            >
              Edit Profile
            </Button>
          </div>

          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-800 m-0">
              {fullName}
            </h2>
            <div className="mt-2">
              <Tag color="purple" className="px-4 py-1 rounded-full border-none bg-purple-100 text-purple-700">
                Supervisor
              </Tag>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="px-6 pb-6">
          <Descriptions bordered column={1} size="middle" className="bg-white rounded-lg">
            <Descriptions.Item label={<span className="font-semibold text-gray-600 flex items-center gap-2"><MailOutlined /> Email</span>}>
              {profile?.email || "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label={<span className="font-semibold text-gray-600 flex items-center gap-2"><PhoneOutlined /> Mobile</span>}>
              {profile?.mobile || "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label={<span className="font-semibold text-gray-600 flex items-center gap-2"><CheckCircleOutlined /> Status</span>}>
              <Tag color={profile?.isActive ? "green" : "red"}>
                {profile?.isActive ? "Active" : "Inactive"}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label={<span className="font-semibold text-gray-600 flex items-center gap-2"><CalendarOutlined /> Joined</span>}>
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label={<span className="font-semibold text-gray-600">Account Type</span>}>
              <Space>
                {profile?.isActive ? (
                  <CheckCircleOutlined className="text-green-500" />
                ) : (
                  <StopOutlined className="text-red-500" />
                )}
                <span className="font-medium">
                  {profile?.isActive ? "Verified Active" : "Suspended"}
                </span>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal 
        title="Edit Supervisor Profile" 
        open={isModalVisible} 
        onCancel={() => setIsModalVisible(false)} 
        footer={null} 
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate} className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              {/* Nested object fields ['name', 'first_name'] */}
              <Form.Item name={['name', 'first_name']} label="First Name" rules={[{ required: true }]}>
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={['name', 'last_name']} label="Last Name" rules={[{ required: true }]}>
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="email" label="Email Address">
            <Input disabled placeholder="supervisor@example.com" />
          </Form.Item>

          <Form.Item name="mobile" label="Mobile Number">
            <Input placeholder="Enter mobile number" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updating} className="bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

    </div>
  );
};

export default SupervisorProfile;