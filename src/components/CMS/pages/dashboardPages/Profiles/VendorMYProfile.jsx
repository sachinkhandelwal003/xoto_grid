import React, { useEffect, useState } from "react";
import { Card, Avatar, Badge, Descriptions, Tag, Space, Row, Col, Typography, Divider, Image } from "antd";
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  StopOutlined,
  PhoneOutlined,
  ShopOutlined,
  BankOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

const VendorMYProfile = () => {
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

  const val = (data) => data || <Text type="secondary">--</Text>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card
        loading={loading}
        className="max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-sm border-0"
        cover={<div className="h-40 bg-gradient-to-r from-purple-700 via-purple-900 to-black" />}
      >
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-20 mb-8 px-6">
          <Badge
            dot
            status={profile?.isActive ? "success" : "error"}
            offset={[-15, 105]}
            style={{ width: 20, height: 20 }}
          >
            <Avatar
              size={140}
              src={profile?.store_details?.logo}
              icon={<UserOutlined />}
              className="border-4 border-white shadow-xl bg-white"
            />
          </Badge>
          <div className="text-center md:text-left pb-2 flex-1">
            <Title level={2} className="m-0 leading-tight">
              {profile?.store_details?.store_name || "Vendor Store"}
            </Title>
            <Space className="mt-2">
              <Text type="secondary" className="text-lg">
                <UserOutlined /> {profile?.full_name}
              </Text>
              <Tag color="purple" className="rounded-full px-3">
                {profile?.store_details?.store_type}
              </Tag>
            </Space>
          </div>
          <div className="pb-2">
             <Tag color={profile?.status === 'approved' ? 'green' : 'orange'} className="text-sm px-4 py-1 rounded-md">
                {profile?.status?.toUpperCase()}
             </Tag>
          </div>
        </div>

        <Row gutter={[24, 24]}>
          {/* Left Column: Store & Registration */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" className="w-full" size="large">
              
              {/* Store Details Section */}
              <Descriptions title={<><ShopOutlined /> Store Overview</>} bordered column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Email">{val(profile?.email)}</Descriptions.Item>
                <Descriptions.Item label="Mobile">{profile?.mobile?.country_code} {profile?.mobile?.number}</Descriptions.Item>
                <Descriptions.Item label="Website" span={2}>
                  <a href={profile?.store_details?.website} target="_blank" rel="noreferrer">
                    <GlobalOutlined /> {val(profile?.store_details?.website)}
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="Store Address" span={2}>
                  <EnvironmentOutlined /> {profile?.store_details?.store_address}, {profile?.store_details?.city}, {profile?.store_details?.state}, {profile?.store_details?.country} - {profile?.store_details?.pincode}
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>{val(profile?.store_details?.store_description)}</Descriptions.Item>
                <Descriptions.Item label="Categories" span={2}>
                  <Space wrap>
                    {profile?.store_details?.categories?.map((cat) => (
                      <Tag key={cat._id} color="blue" className="m-0">{cat.name}</Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              </Descriptions>

              {/* Registration Section */}
             <Descriptions
  title={<><FileTextOutlined /> Compliance & Registration</>}
  bordered
  column={2}
>
  <Descriptions.Item label="TRN Number">
    <Text strong>{val(profile?.registration?.trn_number)}</Text>
  </Descriptions.Item>

  <Descriptions.Item label="Trade License Number">
    <Text strong>{val(profile?.registration?.trade_license_number)}</Text>
  </Descriptions.Item>
</Descriptions>


              {/* Document Preview Grid */}
              <div className="bg-gray-50 p-4 rounded-xl border">
                <Text strong className="block mb-4"><FileTextOutlined /> Uploaded Documents</Text>
                <Row gutter={[16, 16]}>
                  {profile?.documents && Object.keys(profile.documents).map((key) => (
                    <Col xs={12} md={8} key={key}>
                      <Card size="small" className="text-center shadow-xs">
                        <Image
                          width="100%"
                          height={80}
                          src={profile.documents[key].path}
                          className="object-cover rounded"
                          fallback="https://via.placeholder.com/150?text=Document"
                        />
                        <div className="mt-2 text-[12px] font-medium truncate">{profile.documents[key].type}</div>
                        {profile.documents[key].verified ? <Badge status="success" text="Verified" /> : <Badge status="default" text="Uploaded" />}
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </Space>
          </Col>

          {/* Right Column: Bank & Contact */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" className="w-full" size="large">
              
              {/* Bank Details */}
           <Card
  size="small"
  title={<><BankOutlined /> Banking Details</>}
  className="rounded-xl shadow-xs border"
>
  <Descriptions column={1} size="small">
    <Descriptions.Item label="Account Holder">
      {val(profile?.bank_details?.account_holder_name)}
    </Descriptions.Item>

    <Descriptions.Item label="Bank Name">
      {val(profile?.bank_details?.bank_name)}
    </Descriptions.Item>

    <Descriptions.Item label="Account Number">
      {val(profile?.bank_details?.bank_account_number)}
    </Descriptions.Item>

    <Descriptions.Item label="IBAN">
      {val(profile?.bank_details?.iban)}
    </Descriptions.Item>

    <Descriptions.Item label="SWIFT Code">
      {val(profile?.bank_details?.swift_code)}
    </Descriptions.Item>

    <Descriptions.Item label="Branch">
      {val(profile?.bank_details?.branch_name)}
    </Descriptions.Item>
  </Descriptions>
</Card>


              {/* Contacts */}
              <Card size="small" title={<><UserOutlined /> Points of Contact</>} className="rounded-xl shadow-xs border">
                <div className="mb-4">
                  <Text strong className="text-purple-700">Primary Contact (Owner)</Text>
                  <div className="mt-2 text-sm">
                    <div>{val(profile?.contacts?.primary_contact?.name)}</div>
                    <div className="text-gray-500"><MailOutlined /> {val(profile?.contacts?.primary_contact?.email)}</div>
                    <div className="text-gray-500"><PhoneOutlined /> {val(profile?.contacts?.primary_contact?.mobile)}</div>
                    <div className="text-green-600"><WhatsAppOutlined /> {val(profile?.contacts?.primary_contact?.whatsapp)}</div>
                  </div>
                </div>
                <Divider className="my-2" />
                <div>
                  <Text strong className="text-blue-600">Support Contact</Text>
                  <div className="mt-2 text-sm">
                    <div>{val(profile?.contacts?.support_contact?.name)}</div>
                    <div className="text-gray-500"><MailOutlined /> {val(profile?.contacts?.support_contact?.email)}</div>
                    <div className="text-gray-500"><PhoneOutlined /> {val(profile?.contacts?.support_contact?.mobile)}</div>
                  </div>
                </div>
              </Card>

              {/* Meta Stats */}
              <Card size="small" className="rounded-xl bg-purple-50 border-purple-100">
                <Space direction="vertical" className="w-full">
                  <div className="flex justify-between">
                    <Text type="secondary">Joined On</Text>
                    <Text strong>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "--"}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Portal Access</Text>
                    <Tag color={profile?.meta?.vendor_portal_access ? "success" : "error"}>
                      {profile?.meta?.vendor_portal_access ? "Granted" : "Denied"}
                    </Tag>
                  </div>
                </Space>
              </Card>

            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default VendorMYProfile;