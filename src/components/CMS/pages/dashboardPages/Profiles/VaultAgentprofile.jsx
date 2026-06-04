import React, { useEffect, useState, useMemo } from "react";
import {
  Avatar, Badge, Tag, Space, Row, Col,
  Typography, Button, Modal, Form, Input,
  message, Upload, Switch, Spin, Tooltip, Divider, Select, Progress, DatePicker
} from "antd";
import {
  UserOutlined, MailOutlined, PhoneOutlined,
  CheckCircleOutlined, TrophyOutlined,
  FileDoneOutlined, EditOutlined,
  CameraOutlined, LoadingOutlined, FilePdfOutlined, EyeOutlined,
  UploadOutlined, WhatsAppOutlined, MessageOutlined,
  BankOutlined, EnvironmentOutlined, IdcardOutlined,
  SafetyCertificateOutlined, StarOutlined,
  TeamOutlined, CalendarOutlined, ManOutlined, HeartOutlined,
  GlobalOutlined, HomeOutlined, DollarOutlined, LockOutlined
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";
import { Country } from "country-state-city";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { Option } = Select;
const THEME = "#5C039B";

// Nationality mapping
const NATIONALITY_MAP = {
  AE: "UAE National", IN: "Indian", PK: "Pakistani", US: "American",
  GB: "British", SA: "Saudi", EG: "Egyptian", JO: "Jordanian",
  LB: "Lebanese", SY: "Syrian", IQ: "Iraqi", YE: "Yemeni",
  OM: "Omani", QA: "Qatari", KW: "Kuwaiti", BH: "Bahraini",
};
const getNationalityLabel = (code) => NATIONALITY_MAP[code] || code || null;

// Country options for phone
const getCountryOptions = () => {
  const priorityIsoCodes = ["AE", "IN", "SA", "US", "GB", "PK"];
  return Country.getAllCountries()
    .map((country) => ({
      name: country.name,
      code: country.phonecode,
      iso: country.isoCode,
    }))
    .sort((a, b) => {
      const aPriority = priorityIsoCodes.includes(a.iso);
      const bPriority = priorityIsoCodes.includes(b.iso);
      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;
      return a.name.localeCompare(b.name);
    });
};

// Stat Card Component
const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: "#fff", border: "1px solid #f0e8ff", borderRadius: 16,
    padding: "16px 20px", display: "flex", alignItems: "center", gap: 14,
    boxShadow: "0 2px 12px rgba(92,3,155,0.06)",
  }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {React.cloneElement(icon, { style: { fontSize: 20, color } })}
    </div>
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#1a0533" }}>{value ?? "—"}</div>
      <div style={{ fontSize: 11, color: "#9b8ab0", fontWeight: 500 }}>{label}</div>
    </div>
  </div>
);

// Info Row Component
const InfoRow = ({ icon, label, value, extra, isLast }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 0", borderBottom: isLast ? "none" : "1px solid #f5f0ff",
  }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f5f0ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {React.cloneElement(icon, { style: { fontSize: 14, color: THEME } })}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 10, color: "#a392b8", fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 13, color: "#2d1045", fontWeight: 500, marginTop: 2 }}>
        {value ? value : <span style={{ color: "#c9b8dc" }}>Not provided</span>}
      </div>
    </div>
    {extra && <div>{extra}</div>}
  </div>
);

// Document Card Component
const DocumentCard = ({ title, icon, uploaded, verified, url, onUpload, uploading, onView }) => (
  <div style={{
    background: uploaded ? "#f5f0ff" : "#faf8ff",
    border: `1.5px solid ${uploaded ? "#d8c5ff" : "#ede5ff"}`,
    borderRadius: 12, padding: "12px 16px",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: uploaded ? `${THEME}15` : "#ede5ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {React.cloneElement(icon, { style: { fontSize: 18, color: uploaded ? THEME : "#c0aad8" } })}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#2d1045" }}>{title}</div>
        <div style={{ fontSize: 11, marginTop: 2 }}>
          {uploaded ? (
            <span style={{ color: verified ? "#10b981" : "#f59e0b" }}>
              {verified ? "✓ Verified" : "⏳ Pending Verification"}
            </span>
          ) : (
            <span style={{ color: "#c0aad8" }}>Not uploaded</span>
          )}
        </div>
      </div>
      <Space size={8}>
        {url && (
          <Tooltip title="View">
            <Button size="small" icon={<EyeOutlined />} onClick={onView} style={{ borderRadius: 8 }} />
          </Tooltip>
        )}
        <Upload showUploadList={false} customRequest={({ file }) => onUpload(file)}>
          <Tooltip title="Upload">
            <Button size="small" icon={uploading ? <LoadingOutlined spin /> : <UploadOutlined />} style={{ borderRadius: 8, background: THEME, borderColor: THEME, color: "#fff" }} />
          </Tooltip>
        </Upload>
      </Space>
    </div>
  </div>
);

// Section Header
const SectionHeader = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
    <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f0e8ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {React.cloneElement(icon, { style: { fontSize: 13, color: THEME } })}
    </div>
    <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: THEME }}>{title}</span>
  </div>
);

// Main Component
const VaultAgentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [profilePicUploading, setProfilePicUploading] = useState(false);
  const [form] = Form.useForm();
  const countryOptions = useMemo(() => getCountryOptions(), []);

  // Fetch profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await apiService.get("profile/get-profile-data");
      const data = response?.data?.data || response?.data || response;
      setProfile(data);
    } catch (error) {
      message.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Upload profile picture
  const handleProfilePicUpload = async (file) => {
    setProfilePicUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiService.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = response?.data?.file?.url || response?.file?.url || response?.data?.url || response?.url || "";
      if (uploadedUrl) {
        await apiService.put("/vault/agent/profile", { profilePic: uploadedUrl });
        message.success("Profile photo updated successfully!");
        fetchProfile();
      } else {
        message.error("Upload failed: no URL returned.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      message.error("Failed to upload profile photo.");
    } finally {
      setProfilePicUploading(false);
    }
    return false;
  };

  // Upload document
  const handleDocumentUpload = async (file, documentType, subField = null) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);
    if (subField) formData.append("subField", subField);

    setUploading(true);
    try {
      const uploadResponse = await apiService.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const uploadedUrl = uploadResponse?.data?.file?.url || uploadResponse?.file?.url || uploadResponse?.data?.url || "";
      
      if (uploadedUrl) {
        const updatePayload = {
          [documentType]: {
            ...profile?.[documentType],
            [subField]: uploadedUrl
          }
        };
        
        await apiService.put("/vault/agent/profile", updatePayload);
        message.success(`${documentType} uploaded successfully`);
        fetchProfile();
      } else {
        message.error("Upload failed: no URL returned.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      message.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Update profile
  const handleUpdateProfile = async (values) => {
    setUpdating(true);
    try {
      const payload = {
        name: {
          first_name: values.first_name,
          last_name: values.last_name,
        },
        gender: values.gender,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null,
        maritalStatus: values.maritalStatus,
        nationality: values.nationality,
        numberOfDependents: values.numberOfDependents,
        languagePreference: values.languagePreference || "English",
        communicationPreference: values.communicationPreference || "WhatsApp",
        operating_city: values.operating_city,
        country: values.country || "UAE",
        phone: {
          country_code: values.country_code,
          number: values.phone_number,
        },
        bankDetails: {
          beneficiaryName: values.beneficiaryName,
          bankName: values.bankName,
          iban: values.iban,
          accountNumber: values.accountNumber,
          swiftCode: values.swiftCode,
          accountType: values.accountType,
        },
      };

      const response = await apiService.put("/vault/agent/profile", payload);
      if (response?.success) {
        message.success("Profile updated successfully");
        setIsModalVisible(false);
        fetchProfile();
      } else {
        message.error(response?.message || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      message.error("Update failed");
    } finally {
      setUpdating(false);
    }
  };

  // Open edit modal
  const openEditModal = () => {
    form.setFieldsValue({
      first_name: profile?.name?.first_name || "",
      last_name: profile?.name?.last_name || "",
      gender: profile?.gender,
      dateOfBirth: profile?.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
      maritalStatus: profile?.maritalStatus,
      nationality: profile?.nationality,
      numberOfDependents: profile?.numberOfDependents,
      languagePreference: profile?.languagePreference || "English",
      communicationPreference: profile?.communicationPreference || "WhatsApp",
      operating_city: profile?.operating_city,
      country: profile?.country || "UAE",
      country_code: profile?.phone?.country_code?.replace("+", "") || "971",
      phone_number: profile?.phone?.number || "",
      beneficiaryName: profile?.bankDetails?.beneficiaryName,
      bankName: profile?.bankDetails?.bankName,
      iban: profile?.bankDetails?.iban,
      accountNumber: profile?.bankDetails?.accountNumber,
      swiftCode: profile?.bankDetails?.swiftCode,
      accountType: profile?.bankDetails?.accountType,
    });
    setIsModalVisible(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  const fullName = `${profile?.name?.first_name || ""} ${profile?.name?.last_name || ""}`.trim();
  const commissionEligible = profile?.commissionEligible || false;
  const completionPercentage = profile?.profileCompletionPercentage || 0;

  return (
    <div style={{ background: "#f7f3ff", minHeight: "100vh", padding: "28px 24px" }}>
      {/* Hero Banner */}
      <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 24, boxShadow: "0 8px 32px rgba(92,3,155,0.12)" }}>
        <div style={{ height: 120, background: "linear-gradient(135deg, #5C039B 0%, #3a0266 100%)", position: "relative" }}>
          <Button
            icon={<EditOutlined />}
            onClick={openEditModal}
            style={{ position: "absolute", top: 16, right: 20, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8 }}
          >
            Edit Profile
          </Button>
        </div>
        <div style={{ background: "#fff", padding: "0 28px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: -50, flexWrap: "wrap" }}>
            <Badge dot status={profile?.isVerified ? "success" : "warning"} offset={[-8, 88]}>
              <Upload showUploadList={false} customRequest={({ file }) => handleProfilePicUpload(file)}>
                <div style={{ position: "relative", cursor: "pointer" }}>
                  <Avatar size={100} icon={<UserOutlined />} src={profile?.profilePic || null} style={{ border: "4px solid #fff", boxShadow: "0 4px 20px rgba(92,3,155,0.2)" }} />
                  {profilePicUploading && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <LoadingOutlined style={{ color: "#fff", fontSize: 20 }} spin />
                    </div>
                  )}
                  <div style={{ position: "absolute", bottom: 0, right: 0, background: THEME, borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                    <CameraOutlined style={{ fontSize: 12, color: "#fff" }} />
                  </div>
                </div>
              </Upload>
            </Badge>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <Title level={3} style={{ margin: 0, fontWeight: 700 }}>{fullName || "Agent"}</Title>
                {profile?.isVerified && <CheckCircleOutlined style={{ fontSize: 18, color: "#22c55e" }} />}
                <Tag color={commissionEligible ? "green" : "orange"} style={{ borderRadius: 20 }}>
                  {commissionEligible ? "Commission Eligible" : "Pending Verification"}
                </Tag>
              </div>
             
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <StatCard icon={<FileDoneOutlined />} label="Total Leads" value={profile?.earnings?.totalLeadsSubmitted || 0} color="#7c3aed" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard icon={<TrophyOutlined />} label="Disbursals" value={profile?.earnings?.successfulDisbursals || 0} color="#f59e0b" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard icon={<DollarOutlined />} label="Commission" value={`AED ${(profile?.earnings?.totalCommissionEarned || 0).toLocaleString()}`} color="#10b981" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard icon={<UserOutlined />} label="Agent Type" value={profile?.agentType === "FreelanceAgent" ? "Freelance" : "Partner Affiliated"} color="#3b82f6" />
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        {/* Left Column - Personal Info */}
        <Col xs={24} lg={14}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px", border: "1px solid #f0e8ff", marginBottom: 20 }}>
            <SectionHeader icon={<UserOutlined />} title="Personal Information" />
            <InfoRow icon={<MailOutlined />} label="Email" value={profile?.email} extra={profile?.isEmailVerified && <Tag color="success">Verified</Tag>} />
            <InfoRow icon={<PhoneOutlined />} label="Mobile" value={`${profile?.phone?.country_code || ""} ${profile?.phone?.number || ""}`.trim()} extra={profile?.isPhoneVerified && <Tag color="success">Verified</Tag>} />
            <InfoRow icon={<GlobalOutlined />} label="Nationality" value={getNationalityLabel(profile?.nationality)} />
            <InfoRow icon={<CalendarOutlined />} label="Date of Birth" value={profile?.dateOfBirth ? dayjs(profile.dateOfBirth).format("DD MMM YYYY") : null} />
            <InfoRow icon={<ManOutlined />} label="Gender" value={profile?.gender} />
            <InfoRow icon={<HeartOutlined />} label="Marital Status" value={profile?.maritalStatus} />
            <InfoRow icon={<TeamOutlined />} label="Dependents" value={profile?.numberOfDependents > 0 ? `${profile.numberOfDependents} dependents` : "None"} />
            <InfoRow icon={<GlobalOutlined />} label="Language" value={profile?.languagePreference} />
            <InfoRow icon={<MessageOutlined />} label="Communication" value={profile?.communicationPreference} isLast />
          </div>

          {/* Documents Section */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px", border: "1px solid #f0e8ff" }}>
            <SectionHeader icon={<FileDoneOutlined />} title="Documents" />
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <DocumentCard
                  title="Emirates ID (Front)"
                  icon={<IdcardOutlined />}
                  uploaded={!!profile?.emiratesId?.frontImageUrl}
                  verified={profile?.emiratesId?.verified || false}
                  url={profile?.emiratesId?.frontImageUrl}
                  onUpload={(file) => handleDocumentUpload(file, "emiratesId", "frontImageUrl")}
                  uploading={uploading}
                  onView={() => window.open(profile?.emiratesId?.frontImageUrl, "_blank")}
                />
              </Col>
              <Col span={12}>
                <DocumentCard
                  title="Emirates ID (Back)"
                  icon={<IdcardOutlined />}
                  uploaded={!!profile?.emiratesId?.backImageUrl}
                  verified={profile?.emiratesId?.verified || false}
                  url={profile?.emiratesId?.backImageUrl}
                  onUpload={(file) => handleDocumentUpload(file, "emiratesId", "backImageUrl")}
                  uploading={uploading}
                  onView={() => window.open(profile?.emiratesId?.backImageUrl, "_blank")}
                />
              </Col>
              <Col span={12}>
                <DocumentCard
                  title="Passport"
                  icon={<FilePdfOutlined />}
                  uploaded={!!profile?.passport?.imageUrl}
                  verified={profile?.passport?.verified || false}
                  url={profile?.passport?.imageUrl}
                  onUpload={(file) => handleDocumentUpload(file, "passport", "imageUrl")}
                  uploading={uploading}
                  onView={() => window.open(profile?.passport?.imageUrl, "_blank")}
                />
              </Col>
              <Col span={12}>
                <DocumentCard
                  title="Visa"
                  icon={<FilePdfOutlined />}
                  uploaded={!!profile?.visa?.imageUrl}
                  verified={profile?.visa?.verified || false}
                  url={profile?.visa?.imageUrl}
                  onUpload={(file) => handleDocumentUpload(file, "visa", "imageUrl")}
                  uploading={uploading}
                  onView={() => window.open(profile?.visa?.imageUrl, "_blank")}
                />
              </Col>
            </Row>
          </div>
        </Col>

        {/* Right Column - Bank Details & Status */}
        <Col xs={24} lg={10}>
          {/* Bank Details */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px", border: "1px solid #f0e8ff", marginBottom: 20 }}>
            <SectionHeader icon={<BankOutlined />} title="Bank Details" />
            <InfoRow icon={<UserOutlined />} label="Beneficiary Name" value={profile?.bankDetails?.beneficiaryName} />
            <InfoRow icon={<BankOutlined />} label="Bank Name" value={profile?.bankDetails?.bankName} />
            <InfoRow icon={<IdcardOutlined />} label="Account Number" value={profile?.bankDetails?.accountNumber} />
            <InfoRow icon={<IdcardOutlined />} label="IBAN" value={profile?.bankDetails?.iban} />
            <InfoRow icon={<GlobalOutlined />} label="SWIFT Code" value={profile?.bankDetails?.swiftCode} />
            <InfoRow icon={<BankOutlined />} label="Account Type" value={profile?.bankDetails?.accountType} isLast />
            {!profile?.bankDetails?.iban && (
              <Button type="link" onClick={openEditModal} style={{ padding: 0, marginTop: 12 }}>Add Bank Details</Button>
            )}
          </div>

          {/* Verification Status */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px", border: "1px solid #f0e8ff" }}>
            <SectionHeader icon={<SafetyCertificateOutlined />} title="Verification Status" />
            <div style={{ background: "#f9f7ff", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 500 }}>Profile Verification</span>
                <Tag color={profile?.isVerified ? "success" : "warning"}>{profile?.isVerified ? "Verified" : "Pending"}</Tag>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 500 }}>Commission Eligibility</span>
                <Tag color={commissionEligible ? "success" : "warning"}>{commissionEligible ? "Eligible" : "Not Eligible"}</Tag>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 500 }}>Account Status</span>
                <Tag color={profile?.isActive ? "success" : "error"}>{profile?.isActive ? "Active" : "Inactive"}</Tag>
              </div>
            </div>
            {!commissionEligible && (
              <div style={{ background: "#fef3c7", padding: "12px", borderRadius: 10 }}>
                <Text style={{ fontSize: 12, color: "#92400e" }}>
                  <SafetyCertificateOutlined /> To become commission eligible, please upload Emirates ID and Bank Details.
                </Text>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal
        title={<><EditOutlined style={{ marginRight: 8, color: THEME }} /> Edit Profile</>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
          <Divider orientation="left" style={{ fontSize: 12, color: THEME }}>Personal Information</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} size="large" placeholder="Enter first name" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} size="large" placeholder="Enter last name" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="gender" label="Gender">
                <Select placeholder="Select" size="large" style={{ borderRadius: 8 }} allowClear>
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dateOfBirth" label="Date of Birth">
                <DatePicker style={{ width: "100%", borderRadius: 8 }} size="large" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maritalStatus" label="Marital Status">
                <Select placeholder="Select" size="large" style={{ borderRadius: 8 }} allowClear>
                  <Option value="Single">Single</Option>
                  <Option value="Married">Married</Option>
                  <Option value="Divorced">Divorced</Option>
                  <Option value="Widowed">Widowed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="nationality" label="Nationality">
                <Select placeholder="Select" showSearch size="large" style={{ borderRadius: 8 }} allowClear>
                  {Object.entries(NATIONALITY_MAP).map(([code, label]) => (
                    <Option key={code} value={code}>{label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="numberOfDependents" label="Number of Dependents">
                <Select placeholder="Select" size="large" style={{ borderRadius: 8 }} allowClear>
                  {[0,1,2,3,4,5,6,7,8,9,10].map(i => <Option key={i} value={i}>{i === 0 ? "None" : i}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="languagePreference" label="Language Preference">
                <Select placeholder="Select" size="large" style={{ borderRadius: 8 }}>
                  <Option value="English">English</Option>
                  <Option value="Arabic">Arabic</Option>
                  <Option value="Both">Both</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ fontSize: 12, color: THEME }}>Contact Information</Divider>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="country_code" label="Country Code" rules={[{ required: true }]}>
                <Select showSearch size="large" style={{ borderRadius: 8 }}>
                  {countryOptions.map((item) => (
                    <Option key={item.iso} value={item.code}>+{item.code}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={18}>
              <Form.Item name="phone_number" label="Phone Number" rules={[{ required: true }]}>
                <Input placeholder="Enter mobile number" size="large" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="operating_city" label="Operating City">
                <Input placeholder="e.g., Dubai" size="large" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="country" label="Country" initialValue="UAE">
                <Input placeholder="Country" size="large" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ fontSize: 12, color: THEME }}>Bank Details</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="beneficiaryName" label="Beneficiary Name">
                <Input placeholder="Account holder name" size="large" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bankName" label="Bank Name">
                <Input placeholder="e.g., Emirates NBD" size="large" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="iban" label="IBAN">
                <Input placeholder="AEXX..." size="large" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="accountNumber" label="Account Number">
                <Input placeholder="Account number" size="large" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="swiftCode" label="SWIFT Code">
                <Input placeholder="SWIFT/BIC code" size="large" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="accountType" label="Account Type">
                <Select placeholder="Select" size="large" style={{ borderRadius: 8 }} allowClear>
                  <Option value="Current">Current</Option>
                  <Option value="Savings">Savings</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
            <Button onClick={() => setIsModalVisible(false)} size="large" style={{ borderRadius: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updating} size="large" style={{ background: THEME, borderColor: THEME, borderRadius: 8, paddingInline: 32 }}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default VaultAgentProfile;