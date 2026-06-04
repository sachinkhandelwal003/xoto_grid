import React, { useEffect, useState } from "react";
import {
  Card,
  Avatar,
  Badge,
  Descriptions,
  Tag,
  Space,
  Divider,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  StopOutlined,
  EnvironmentOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

const FreelancerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProfile = async () => {
    try {
      const response = await apiService.get("profile/get-profile-data");
      setProfile(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const currencySymbol =
    profile?.payment?.preferred_currency?.symbol || "₹";

  return (
    <div className="flex justify-center">
      <Card
        loading={loading}
        className="w-full max-w-6xl rounded-xl overflow-hidden shadow-lg"
        cover={<div className="h-32 bg-gradient-to-br from-purple-600 to-black" />}
      >
        {/* HEADER */}
        <div className="text-center -mt-16 mb-6">
          <Badge
            dot
            status={profile?.isActive ? "success" : "error"}
            offset={[-10, 80]}
          >
            <Avatar
              size={100}
              icon={<UserOutlined />}
              className="border-4 border-white shadow-md"
            />
          </Badge>

          <h2 className="mt-4 text-xl font-semibold">
            {profile?.full_name}
          </h2>

          <Tag color="purple" className="mt-2">
            Freelancer
          </Tag>
        </div>

        {/* BASIC INFO */}
        <Descriptions title="Basic Information" bordered column={2}>
          <Descriptions.Item label={<><MailOutlined /> Email</>}>
            {profile?.email}
          </Descriptions.Item>

          <Descriptions.Item label={<><PhoneOutlined /> Mobile</>}>
            {profile?.mobile?.country_code} {profile?.mobile?.number}
            {profile?.is_mobile_verified && (
              <Tag color="green" className="ml-2">Verified</Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label={<><EnvironmentOutlined /> Location</>}>
            {profile?.location?.city}, {profile?.location?.state},{" "}
            {profile?.location?.country}
          </Descriptions.Item>

          <Descriptions.Item label="Account Status">
            <Tag color={profile?.isActive ? "green" : "red"}>
              {profile?.isActive ? "Active" : "Inactive"}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* PROFESSIONAL INFO */}
        <Descriptions title="Professional Details" bordered column={2}>
          <Descriptions.Item label="Experience">
            {profile?.professional?.experience_years} Years
          </Descriptions.Item>

          <Descriptions.Item label="Availability">
            {profile?.professional?.availability}
          </Descriptions.Item>

          <Descriptions.Item label="Bio" span={2}>
            {profile?.professional?.bio}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* LANGUAGES */}
        <div>
          <h3 className="font-semibold mb-2">Languages</h3>
          <Space wrap>
            {profile?.languages?.map((lang) => (
              <Tag key={lang} color="blue">
                {lang.toUpperCase()}
              </Tag>
            ))}
          </Space>
        </div>

        <Divider />

        {/* SERVICES */}
        <div>
          <h3 className="font-semibold mb-2">Services Offered</h3>

          {profile?.services_offered?.length ? (
            profile.services_offered.map((service) => (
              <Card key={service._id} className="mb-4" size="small">
                <Tag color="purple" className="mb-2">
                  {service?.category?.label}
                </Tag>

                <p className="font-medium mb-2">
                  {service?.description}
                </p>

                <Space wrap>
                  {service?.subcategories?.map((sub) => (
                    <Tag key={sub._id} color="green">
                      {sub?.type?.label} • {currencySymbol}
                      {sub.price_range} / {sub.unit}
                    </Tag>
                  ))}
                </Space>
              </Card>
            ))
          ) : (
            <Tag>No services added</Tag>
          )}
        </div>

        <Divider />

        {/* DOCUMENTS */}
        <div>
          <h3 className="font-semibold mb-2">Documents</h3>
          <Space direction="vertical" className="w-full">
            {profile?.documents?.map((doc) => (
              <Card key={doc._id} size="small">
                <Space>
                  <FileOutlined />
                  <span className="capitalize">{doc.type}</span>
                  <Tag color={doc.verified ? "green" : "orange"}>
                    {doc.verified ? "Verified" : "Pending"}
                  </Tag>
                  <a
                    href={doc.path}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500"
                  >
                    View
                  </a>
                </Space>
              </Card>
            ))}
          </Space>
        </div>

        <Divider />

        {/* META */}
        <Descriptions title="Account Info" bordered column={2}>
          <Descriptions.Item label="Onboarding Status">
            <Tag color="green">
              {profile?.onboarding_status}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Joined">
            {new Date(profile?.createdAt).toLocaleDateString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default FreelancerProfile;
