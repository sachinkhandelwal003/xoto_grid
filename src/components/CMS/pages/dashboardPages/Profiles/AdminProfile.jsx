import React, { useEffect, useState } from "react";
import { Card, Avatar, Badge, Descriptions, Tag, Space } from "antd";
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

 const getProfile = async () => {
  try {
    const res = await apiService.get("profile/get-profile-data");

    const profileData =
      res?.data?.data?.data ||
      res?.data?.data ||
      res?.data ||
      res ||
      null;

    console.log("PROFILE DATA:", profileData);

    setProfile(profileData);
  } catch (error) {
    console.error("PROFILE ERROR:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="flex justify-center ">
      <Card
        loading={loading}
        className="w-full max-w-8xl rounded-xl overflow-hidden shadow-lg"
        cover={
<div className="h-32 bg-gradient-to-br from-purple-600 to-black" />
        }
      >
        {/* Header */}
        <div className="text-center -mt-16 mb-5">
          <Badge
            dot
            status={profile?.isActive ? "success" : "error"}
            offset={[-10, 80]}
          >
            <Avatar
              size={100}
              icon={<UserOutlined />}
              src={profile?.avatarUrl}
              className="border-4 border-white shadow-md"
            />
          </Badge>

          <h2 className="mt-4 mb-0 text-xl font-semibold">
            Admin Profile
          </h2>

          <Tag color="blue" className="mt-2">
            Administrator
          </Tag>
        </div>

        {/* Details */}
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <MailOutlined /> Email
              </span>
            }
          >
            {profile?.email}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <CheckCircleOutlined /> Status
              </span>
            }
          >
            <Tag color={profile?.isActive ? "green" : "red"}>
              {profile?.isActive ? "Active" : "Inactive"}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <CalendarOutlined /> Joined
              </span>
            }
          >
            {profile?.createdAt
              ? new Date(profile.createdAt).toLocaleDateString()
              : "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Account Type">
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
      </Card>
    </div>
  );
};

export default AdminProfile;
