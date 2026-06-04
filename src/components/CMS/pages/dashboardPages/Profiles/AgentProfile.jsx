import React, { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Progress,
  Row,
  Skeleton,
  Space,
  Steps,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import {
  BankOutlined,
  CameraOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FilePdfOutlined,
  IdcardOutlined,
  InboxOutlined,
  LoadingOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
  UploadOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

const { Text, Title, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;

const P = "#5C039B";

const fileNameWithoutExt = (name = "") => name.replace(/\.[^/.]+$/, "") || "Document";

const isApproved = (profile) =>
  profile?.agencyApprovalStatus === "approved" &&
  profile?.adminApprovalStatus === "approved" &&
  profile?.isActive !== false;

const AgentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [agreements, setAgreements] = useState([]);
  const [agreementSummary, setAgreementSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState("");
  const [agreementModal, setAgreementModal] = useState({ open: false, file: null });
  const [uploadingAgreement, setUploadingAgreement] = useState(false);
  const [agreementProgress, setAgreementProgress] = useState(0);
  const [form] = Form.useForm();
  const [agreementForm] = Form.useForm();

  const fetchProfile = useCallback(async () => {
    const response = await apiService.get("profile/get-profile-data");
    const data = response?.data?.data || response?.data;
    setProfile(data);
    return data;
  }, []);

  const fetchAgreements = useCallback(async () => {
    const response = await apiService.get("agent/agreements");
    const data = response?.data || {};
    setAgreements(data.agreements || []);
    setAgreementSummary(data.summary || {});
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchProfile(), fetchAgreements()]);
    } catch (error) {
      console.error(error);
      message.error("Failed to load agent profile");
    } finally {
      setLoading(false);
    }
  }, [fetchAgreements, fetchProfile]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchProfile(), fetchAgreements()]);
      message.success("Profile refreshed");
    } catch {
      message.error("Failed to refresh profile");
    } finally {
      setRefreshing(false);
    }
  };

  const uploadProfileAsset = async (file, targetField, label, onSuccess, onError) => {
    const formData = new FormData();
    formData.append("profilePicture", file);
    formData.append("targetField", targetField);

    if (targetField === "profile_photo") setUploadingPhoto(true);
    else setUploadingDoc(targetField);

    try {
      await apiService.post("profile/update-profile-picture", formData);
      message.success(`${label} uploaded`);
      onSuccess?.("ok");
       const updatedProfile = await fetchProfile();
       if (targetField === "profile_photo") {
      const newPhotoUrl = updatedProfile?.profile_photo || updatedProfile?.data?.profile_photo;
      window.dispatchEvent(new CustomEvent("gridAdvisorPhotoUpdated", {
        detail: { photoUrl: newPhotoUrl },
      }));
    }
    } catch (error) {
      console.error(error);
      onError?.(error);
      message.error(`${label} upload failed`);
    } finally {
      setUploadingPhoto(false);
      setUploadingDoc("");
    }
  };

  const beforeImageUpload = (file) => {
    const valid = file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp";
    if (!valid) message.error("Upload JPG, PNG, or WEBP image only");
    const smallEnough = file.size / 1024 / 1024 < 5;
    if (!smallEnough) message.error("Image must be smaller than 5MB");
    return valid && smallEnough;
  };

  const openEditModal = () => {
    form.setFieldsValue({
      first_name: profile?.first_name,
      last_name: profile?.last_name,
      country_code: profile?.country_code,
      phone_number: profile?.phone_number,
      email: profile?.email,
      operating_city: profile?.operating_city,
      country: profile?.country,
      specialization: profile?.specialization,
      reraCardNumber: profile?.reraCardNumber,
      accountHolderName: profile?.bankDetails?.accountHolderName,
      bankName: profile?.bankDetails?.bankName,
      iban: profile?.bankDetails?.iban,
      accountNumber: profile?.bankDetails?.accountNumber,
    });
    setEditing(true);
  };

  const submitProfile = async (values) => {
    setSavingProfile(true);
    try {
      await apiService.put("profile/update-profile", {
        first_name: values.first_name,
        last_name: values.last_name,
        country_code: values.country_code,
        phone_number: values.phone_number,
        operating_city: values.operating_city,
        country: values.country,
        specialization: values.specialization,
        reraCardNumber: values.reraCardNumber,
        bankDetails: {
          accountHolderName: values.accountHolderName || "",
          bankName: values.bankName || "",
          iban: values.iban || "",
          accountNumber: values.accountNumber || "",
        },
      });
      message.success("Profile updated");
      setEditing(false);
      await fetchProfile();
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const stageAgreement = (file) => {
    if (file.size / 1024 / 1024 > 25) {
      message.error("Maximum agreement file size is 25MB");
      return Upload.LIST_IGNORE;
    }
    agreementForm.setFieldsValue({ documentName: fileNameWithoutExt(file.name) });
    setAgreementModal((prev) => ({ ...prev, file }));
    return Upload.LIST_IGNORE;
  };

  const submitAgreement = async () => {
    if (!agreementModal.file) {
      message.warning("Please select a signed agreement file");
      return;
    }

    try {
      const values = await agreementForm.validateFields();
      setUploadingAgreement(true);
      setAgreementProgress(5);

      const formData = new FormData();
      formData.append("file", agreementModal.file);
      const uploadResponse = await apiService.upload("upload", formData, (event) => {
        if (!event.total) return;
        setAgreementProgress(Math.max(5, Math.round((event.loaded * 88) / event.total)));
      });
      const uploaded = uploadResponse?.file || uploadResponse?.data?.file || {};
      if (!uploaded.url) throw new Error("No file URL returned");

      setAgreementProgress(94);
      await apiService.post("agent/agreements/documents", {
        name: values.documentName?.trim() || agreementModal.file.name,
        remarks: values.remarks?.trim() || "",
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,
        url: uploaded.url,
        mimeType: uploaded.mimeType || agreementModal.file.type,
        size: uploaded.size || agreementModal.file.size,
      });

      setAgreementProgress(100);
      message.success("Agreement uploaded");
      agreementForm.resetFields();
      setAgreementModal({ open: false, file: null });
      await fetchAgreements();
    } catch (error) {
      console.error(error);
      if (!error?.errorFields) message.error(error?.message || "Agreement upload failed");
    } finally {
      setUploadingAgreement(false);
      setAgreementProgress(0);
    }
  };

  const fullName = profile?.fullName || `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Agent";
  const verified = isApproved(profile);
  const docComplete = Boolean(profile?.emiratesIdUrl && profile?.reraCardUrl);
  const agreementActive = agreements.some((item) => item.status === "active");
  const profileProgress = Math.round(
    ([
      profile?.first_name,
      profile?.last_name,
      profile?.email,
      profile?.phone_number,
      profile?.operating_city,
      profile?.specialization,
      profile?.profile_photo,
      profile?.emiratesIdUrl,
      profile?.reraCardUrl,
      agreementActive,
    ].filter(Boolean).length /
      10) *
      100
  );

  const renderDocumentCard = ({ title, description, field, url, icon }) => (
    <Col xs={24} md={12}>
      <div className="agent-doc-card">
        <div className="agent-doc-icon">{icon}</div>
        <div className="min-w-0 flex-1">
          <Text strong>{title}</Text>
          <Text type="secondary" className="block text-xs">{description}</Text>
          {url ? (
            <Space className="mt-3" wrap>
              <Button size="small" icon={<EyeOutlined />} onClick={() => window.open(url, "_blank")}>Open</Button>
              <Tag color="green">Uploaded</Tag>
            </Space>
          ) : (
            <Tag color="red" className="mt-3">Missing</Tag>
          )}
        </div>
        <Upload
          showUploadList={false}
          customRequest={({ file, onSuccess, onError }) => uploadProfileAsset(file, field, title, onSuccess, onError)}
        >
          <Button icon={<UploadOutlined />} loading={uploadingDoc === field} className="theme-soft">
            {url ? "Replace" : "Upload"}
          </Button>
        </Upload>
      </div>
    </Col>
  );

  const renderAgreements = () => (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Space size={10} wrap>
          <Text strong>Signed A2A Agreements</Text>
          <Tag color="blue">{agreementSummary.total || 0} total</Tag>
          <Tag color="green">{agreementSummary.active || 0} active</Tag>
        </Space>
        <Button icon={<UploadOutlined />} className="theme-primary" onClick={() => setAgreementModal({ open: true, file: null })}>
          Upload Signed Agreement
        </Button>
      </div>

      {agreements.length ? (
        <List
          dataSource={agreements}
          renderItem={(agreement) => (
            <List.Item className="agent-list-item">
              <List.Item.Meta
                avatar={<FilePdfOutlined style={{ fontSize: 30, color: "#dc2626" }} />}
                title={
                  <Space wrap>
                    <Text strong>{agreement.agreement_type}</Text>
                    <Tag color={agreement.status === "active" ? "green" : "default"}>{agreement.status}</Tag>
                  </Space>
                }
                description={`Effective ${agreement.effective_date ? dayjs(agreement.effective_date).format("DD MMM YYYY") : "N/A"} - Expiry ${agreement.expiry_date ? dayjs(agreement.expiry_date).format("DD MMM YYYY") : "No expiry"}`}
              />
              <Space wrap>
                {(agreement.documents || []).slice(0, 3).map((doc) => (
                  <Button key={doc.id} size="small" icon={<EyeOutlined />} onClick={() => window.open(doc.url, "_blank")}>
                    {doc.name || "Open"}
                  </Button>
                ))}
              </Space>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No signed agreement uploaded yet" />
      )}
    </div>
  );

  if (loading && !profile) {
    return (
      <div className="agent-profile-page">
        <Card className="mx-auto w-full max-w-6xl rounded-xl">
          <Skeleton active avatar paragraph={{ rows: 8 }} />
        </Card>
      </div>
    );
  }

  const tabItems = [
    {
      key: "profile",
      label: <span><UserOutlined /> Profile Details</span>,
      children: (
        <div className="pt-5">
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle" labelStyle={{ fontWeight: 700, background: "#fafafa", width: 180 }}>
            <Descriptions.Item label={<><MailOutlined /> Email</>}><Text copyable>{profile?.email || "N/A"}</Text></Descriptions.Item>
            <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>{profile?.country_code} {profile?.phone_number}</Descriptions.Item>
            <Descriptions.Item label="Operating City">{profile?.operating_city || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Country">{profile?.country || "UAE"}</Descriptions.Item>
            <Descriptions.Item label="Specialization">{profile?.specialization || "General"}</Descriptions.Item>
            <Descriptions.Item label="RERA Card Number">{profile?.reraCardNumber || "N/A"}</Descriptions.Item>
            <Descriptions.Item label={<><BankOutlined /> Bank</>} span={2}>
              <Paragraph className="mb-0">
                {profile?.bankDetails?.bankName || "No bank added"} {profile?.bankDetails?.iban ? `- IBAN ${profile.bankDetails.iban}` : ""}
              </Paragraph>
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: "documents",
      label: <span><SafetyCertificateOutlined /> KYC & Documents</span>,
      children: (
        <div className="pt-5">
          <Card className="status-card" style={{ background: docComplete ? "#f6ffed" : "#fff7e6", borderColor: docComplete ? "#b7eb8f" : "#ffd666" }}>
            <Steps current={docComplete ? 2 : 0} size="small" className="mb-6">
              <Step title="Upload Documents" />
              <Step title="Admin Review" />
              <Step title="Verified" />
            </Steps>
            <div className="text-center">
              {docComplete ? <CheckCircleFilled style={{ fontSize: 40, color: "#52c41a" }} /> : <WarningOutlined style={{ fontSize: 40, color: "#faad14" }} />}
              <Title level={4} className="mt-4">{docComplete ? "Documents Uploaded" : "Action Required"}</Title>
              <Text type="secondary">Upload Emirates ID and RERA card to keep your agent profile complete.</Text>
            </div>
          </Card>

          <Row gutter={[16, 16]} className="mt-5">
            {renderDocumentCard({
              title: "Emirates ID",
              description: "Upload Emirates ID copy, PDF or image.",
              field: "emiratesIdUrl",
              url: profile?.emiratesIdUrl,
              icon: <IdcardOutlined />,
            })}
            {renderDocumentCard({
              title: "RERA Card",
              description: "Upload your RERA card or certificate.",
              field: "reraCardUrl",
              url: profile?.reraCardUrl,
              icon: <FilePdfOutlined />,
            })}
          </Row>
        </div>
      ),
    },
    {
      key: "agreement",
      label: <span><FilePdfOutlined /> Agent Agreement</span>,
      children: <div className="pt-5">{renderAgreements()}</div>,
    },
  ];

  return (
    <div className="agent-profile-page">
      <div className="mx-auto max-w-6xl">
        <Card className="profile-hero-card" cover={<div className="profile-cover" />} bodyStyle={{ padding: 0 }}>
          <div className="profile-hero-body">
            <div className="profile-identity">
              <Badge dot status={verified ? "success" : "warning"} offset={[-8, 92]}>
                <Upload
                  showUploadList={false}
                  beforeUpload={beforeImageUpload}
                  customRequest={({ file, onSuccess, onError }) => uploadProfileAsset(file, "profile_photo", "Profile photo", onSuccess, onError)}
                  disabled={uploadingPhoto}
                >
                  <Tooltip title="Change Photo">
                    <div className="avatar-shell">
                      {uploadingPhoto && <div className="avatar-loading"><LoadingOutlined spin /></div>}
                      <div className="avatar-hover"><CameraOutlined /></div>
                      <Avatar size={128} icon={<UserOutlined />} src={profile?.profile_photo} className="profile-avatar" />
                    </div>
                  </Tooltip>
                </Upload>
              </Badge>

              <div className="min-w-0 flex-1">
                <Title level={2} className="!mb-2 !text-gray-800">{fullName}</Title>
                <Space size={10} wrap>
                  <Tag color="purple" className="pill-tag">Grid Agent</Tag>
                  <Tag color={verified ? "success" : "warning"} className="pill-tag">
                    {verified ? "Approved Agent" : "Pending Verification"}
                  </Tag>
                  {profile?.agency?.agency_name && <Tag className="pill-tag">{profile.agency.agency_name}</Tag>}
                </Space>
                <div className="mt-4 max-w-lg">
                  <Text type="secondary">Profile Completion</Text>
                  <Progress percent={profileProgress} strokeColor={P} />
                </div>
              </div>
            </div>

            <Space wrap>
              <Button icon={<SyncOutlined spin={refreshing} />} onClick={handleRefresh}>Refresh</Button>
              <Button icon={<EditOutlined />} onClick={openEditModal} className="theme-primary">Edit Profile</Button>
            </Space>
          </div>
        </Card>

        <Card className="profile-tabs-card" bodyStyle={{ padding: "0 24px 24px" }}>
          <TabsLike items={tabItems} />
        </Card>
      </div>

      <Modal
        title={<Space><EditOutlined style={{ color: P }} /> Edit Agent Profile</Space>}
        open={editing}
        onCancel={() => setEditing(false)}
        footer={null}
        width={820}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={submitProfile} className="mt-4">
          <Divider orientation="left">Basic Information</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="first_name" label="First Name" rules={[{ required: true }]}><Input size="large" /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}><Input size="large" /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="email" label="Email"><Input size="large" disabled /></Form.Item></Col>
            <Col xs={8} md={6}><Form.Item name="country_code" label="Code"><Input size="large" /></Form.Item></Col>
            <Col xs={16} md={6}><Form.Item name="phone_number" label="Phone"><Input size="large" /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="operating_city" label="Operating City"><Input size="large" /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="country" label="Country"><Input size="large" /></Form.Item></Col>
            <Col xs={24}><Form.Item name="specialization" label="Specialization"><Input size="large" /></Form.Item></Col>
            <Col xs={24}><Form.Item name="reraCardNumber" label="RERA Card Number"><Input size="large" /></Form.Item></Col>
          </Row>

          <Divider orientation="left">Bank Details</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="accountHolderName" label="Account Holder"><Input size="large" /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="bankName" label="Bank Name"><Input size="large" /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="iban" label="IBAN"><Input size="large" /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="accountNumber" label="Account Number"><Input size="large" /></Form.Item></Col>
          </Row>

          <div className="flex justify-end gap-3 border-t pt-5">
            <Button size="large" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="large" type="primary" htmlType="submit" loading={savingProfile} className="theme-primary">Update Profile</Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Upload Signed Agreement"
        open={agreementModal.open}
        onCancel={() => {
          if (!uploadingAgreement) {
            agreementForm.resetFields();
            setAgreementModal({ open: false, file: null });
          }
        }}
        okText={uploadingAgreement ? "Uploading..." : "Upload Agreement"}
        okButtonProps={{ loading: uploadingAgreement, className: "theme-primary" }}
        onOk={submitAgreement}
        destroyOnClose
      >
        <Form form={agreementForm} layout="vertical" preserve={false}>
          <Form.Item label="Signed agreement file" required>
            <Upload.Dragger showUploadList={false} beforeUpload={stageAgreement} maxCount={1} disabled={uploadingAgreement}>
              <p className="ant-upload-drag-icon"><InboxOutlined style={{ color: P }} /></p>
              <p className="ant-upload-text">Click or drag signed agreement file here</p>
              <p className="ant-upload-hint">PDF, image, or document files up to 25MB.</p>
            </Upload.Dragger>
            {agreementModal.file && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <Text strong>{agreementModal.file.name}</Text>
              </div>
            )}
          </Form.Item>

          {uploadingAgreement && <Progress percent={agreementProgress} strokeColor={P} />}

          <Form.Item name="documentName" label="Document name" rules={[{ required: true, whitespace: true }]}>
            <Input placeholder="Signed A2A Agreement" />
          </Form.Item>
          <Form.Item name="expiryDate" label="Agreement expiry">
            <DatePicker style={{ width: "100%" }} placeholder="No expiry" />
          </Form.Item>
          <Form.Item name="remarks" label="Remarks">
            <TextArea rows={3} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .agent-profile-page {
          min-height: 100vh;
          background: #f6f8fb;
          padding: 24px 16px;
        }
        .profile-hero-card,
        .profile-tabs-card {
          border: 1px solid #e8edf5 !important;
          border-radius: 14px !important;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05) !important;
          overflow: hidden;
          margin-bottom: 18px;
        }
        .profile-cover {
          height: 178px;
          background: linear-gradient(135deg, #5C039B 0%, #7c3aed 52%, #251044 100%);
        }
        .profile-hero-body {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
          padding: 0 28px 24px;
        }
        .profile-identity {
          display: flex;
          align-items: flex-end;
          gap: 22px;
          min-width: 0;
          margin-top: -64px;
        }
        .avatar-shell {
          position: relative;
          cursor: pointer;
          border-radius: 999px;
          border: 4px solid #fff;
          background: #fff;
          box-shadow: 0 12px 30px rgba(92, 3, 155, 0.22);
        }
        .profile-avatar {
          background: #fff;
        }
        .avatar-hover,
        .avatar-loading {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          color: #fff;
          font-size: 28px;
          background: rgba(0, 0, 0, 0.42);
          opacity: 0;
          transition: opacity .2s ease;
        }
        .avatar-shell:hover .avatar-hover,
        .avatar-loading {
          opacity: 1;
        }
        .pill-tag {
          border: 0;
          border-radius: 999px;
          padding: 4px 12px;
          font-weight: 700;
        }
        .theme-primary {
          background: ${P} !important;
          border-color: ${P} !important;
          color: #fff !important;
          font-weight: 700;
        }
        .theme-soft {
          border-color: #d8b4fe !important;
          color: ${P} !important;
          font-weight: 700;
        }
        .status-card {
          border-radius: 12px !important;
        }
        .agent-doc-card {
          display: flex;
          align-items: center;
          gap: 14px;
          min-height: 132px;
          border: 1px solid #e8edf5;
          border-radius: 12px;
          background: #fff;
          padding: 16px;
        }
        .agent-doc-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: #f3e8ff;
          color: ${P};
          font-size: 24px;
          flex-shrink: 0;
        }
        .agent-list-item {
          border: 1px solid #e8edf5 !important;
          border-radius: 12px;
          background: #fff;
          margin-bottom: 10px;
          padding: 14px 16px !important;
        }
        .ant-tabs-tab {
          padding: 16px 18px !important;
          font-weight: 600;
        }
        .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: ${P} !important;
        }
        .ant-tabs-ink-bar {
          background: ${P} !important;
        }
        @media (max-width: 768px) {
          .profile-hero-body,
          .profile-identity {
            align-items: flex-start;
            flex-direction: column;
          }
          .profile-hero-body {
            padding: 0 18px 20px;
          }
          .agent-doc-card {
            align-items: flex-start;
            flex-direction: column;
          }
          .agent-doc-card .ant-upload,
          .agent-doc-card .ant-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

const TabsLike = ({ items }) => {
  const [active, setActive] = useState(items[0]?.key);
  const activeItem = items.find((item) => item.key === active) || items[0];

  return (
    <>
      <div className="flex flex-wrap border-b border-slate-200">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActive(item.key)}
            className={`px-5 py-4 text-sm font-semibold ${active === item.key ? "text-[#5C039B] border-b-2 border-[#5C039B]" : "text-slate-500"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div>{activeItem?.children}</div>
    </>
  );
};

export default AgentProfile;
