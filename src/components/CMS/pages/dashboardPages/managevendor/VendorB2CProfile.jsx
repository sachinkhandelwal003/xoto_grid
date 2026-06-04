import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, Col, Row, Typography, Tag, Avatar, 
  Divider, Descriptions, Image, Space, Button, 
  Skeleton, Empty, Badge 
} from "antd";
import { 
  ArrowLeftOutlined, ShopOutlined, UserOutlined, 
  PhoneOutlined, MailOutlined, GlobalOutlined,
  EnvironmentOutlined, CheckCircleTwoTone, CloseCircleTwoTone,
  FileTextOutlined, BankOutlined, WhatsAppOutlined
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

const VendorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        const res = await apiService.get(`/vendor?vendorId=${id}`);
        if (res.success) setVendor(res.vendor);
      } catch (err) {
        console.error("Failed to fetch vendor details");
      } finally {
        setLoading(false);
      }
    };
    fetchVendorDetails();
  }, [id]);

  if (loading) return <div className="p-8"><Skeleton active avatar paragraph={{ rows: 10 }} /></div>;
  if (!vendor) return <Empty className="mt-20" description="Vendor not found" />;

  const { store_details, name, mobile, registration, bank_details, contacts, documents, meta } = vendor;

  // Helper for empty data
  const val = (data) => data || <Text type="secondary">--</Text>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Space size="middle">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
          <div>
            <Title level={3} style={{ margin: 0 }}>Vendor Profile</Title>
            <Text type="secondary">View complete details for {store_details?.store_name}</Text>
          </div>
        </Space>
        <Tag color={vendor.status === 'approved' ? 'green' : 'orange'} style={{ padding: '4px 12px', borderRadius: 12 }}>
          {vendor.status?.toUpperCase()}
        </Tag>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column: Store & Personal */}
        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-sm rounded-xl mb-6">
            <div className="flex items-start gap-6 mb-6">
              <Avatar size={100} shape="square" src={store_details?.logo} icon={<ShopOutlined />} className="shadow-sm" />
              <div className="flex-1">
                <Title level={4} className="mb-1">{val(store_details?.store_name)}</Title>
                <Text type="secondary" block className="mb-2">{val(store_details?.store_description)}</Text>
                <Space split={<Divider type="vertical" />}>
                  <Tag color="blue">{val(store_details?.store_type)}</Tag>
                  <Text type="secondary"><UserOutlined /> {name.first_name} {name.last_name}</Text>
                  <Text type="secondary"><EnvironmentOutlined /> {store_details?.city}, {store_details?.state}</Text>
                </Space>
              </div>
            </div>

            <Descriptions title="Business Information" bordered column={2}>
              <Descriptions.Item label="Email"><MailOutlined /> {val(vendor.email)}</Descriptions.Item>
              <Descriptions.Item label="Mobile"><PhoneOutlined /> {mobile.country_code} {mobile.number}</Descriptions.Item>
              <Descriptions.Item label="Website" span={2}>
                <GlobalOutlined /> <a href={store_details?.website} target="_blank" rel="noreferrer">{val(store_details?.website)}</a>
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>{val(store_details?.store_address)}</Descriptions.Item>
              <Descriptions.Item label="Categories">
                <Space wrap>
                  {store_details?.categories?.map(c => <Tag key={c._id}>{c.name}</Tag>) || "--"}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Joined On">
                {new Date(meta?.created_at).toLocaleDateString("en-GB")}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Document Section */}
          <Card bordered={false} title={<><FileTextOutlined /> Compliance Documents</>} className="shadow-sm rounded-xl">
            <Row gutter={[16, 16]}>
              {Object.keys(documents || {}).map((key) => {
                const doc = documents[key];
                return (
                  <Col span={8} key={key}>
                    <Card size="small" className="text-center bg-gray-50 border-dashed">
                      <div className="mb-2">
                        <Image
                          width={60}
                          height={60}
                          style={{ objectFit: 'cover', borderRadius: 4 }}
                          src={doc.path}
                          fallback="https://via.placeholder.com/60?text=PDF"
                        />
                      </div>
                      <Text strong block style={{ fontSize: 12 }}>{doc.type}</Text>
                      {doc.verified ? (
                        <Badge status="success" text="Verified" />
                      ) : (
                        <Badge status="warning" text="Pending" />
                      )}
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>

        {/* Right Column: Financial & Contact */}
        <Col xs={24} lg={8}>
          <Card bordered={false} title={<><BankOutlined /> Bank Details</>} className="shadow-sm rounded-xl mb-6">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Account Holder">{val(bank_details?.account_holder_name)}</Descriptions.Item>
              <Descriptions.Item label="Bank Name">{val(bank_details?.bank_name)}</Descriptions.Item>
              <Descriptions.Item label="Account No.">{val(bank_details?.bank_account_number)}</Descriptions.Item>
             <Descriptions.Item label="IBAN">
  {val(bank_details?.iban)}
</Descriptions.Item>

<Descriptions.Item label="SWIFT Code">
  {val(bank_details?.swift_code)}
</Descriptions.Item>

            
            </Descriptions>
            <Divider orientation="left" plain><Text type="secondary" style={{fontSize: 12}}>Tax Info</Text></Divider>
            <Space direction="vertical" className="w-full">
             <div className="flex justify-between">
  <span>TRN Number:</span>
  <b>{val(registration?.trn_number)}</b>
</div>

<div className="flex justify-between">
  <span>Trade License:</span>
  <b>{val(registration?.trade_license_number)}</b>
</div>

            </Space>
          </Card>

          <Card bordered={false} title={<><UserOutlined /> Point of Contacts</>} className="shadow-sm rounded-xl">
            <Title level={5}>Primary Contact</Title>
            <Space direction="vertical" className="mb-4">
              <Text strong>{val(contacts?.primary_contact?.name)} ({contacts?.primary_contact?.designation})</Text>
              <Text type="secondary"><MailOutlined /> {val(contacts?.primary_contact?.email)}</Text>
              <Text type="secondary"><PhoneOutlined /> {val(contacts?.primary_contact?.mobile)}</Text>
              <Text type="success"><WhatsAppOutlined /> {val(contacts?.primary_contact?.whatsapp)}</Text>
            </Space>
            <Divider />
            <Title level={5}>Support Contact</Title>
            <Space direction="vertical">
              <Text strong>{val(contacts?.support_contact?.name)}</Text>
              <Text type="secondary"><MailOutlined /> {val(contacts?.support_contact?.email)}</Text>
              <Text type="secondary"><PhoneOutlined /> {val(contacts?.support_contact?.mobile)}</Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VendorDetails;