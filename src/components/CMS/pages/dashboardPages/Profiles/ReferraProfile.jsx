import { useState, useEffect, useRef } from "react";
import {
  Tabs, Form, Input, Select, Button, Progress, message, Spin,
  Tag, Tooltip, DatePicker, Row, Col, Divider,
} from "antd";
import {
  UserOutlined, BankOutlined, IdcardOutlined, LockOutlined,
  SaveOutlined, CameraOutlined, CheckCircleFilled, CloseCircleFilled,
  ClockCircleFilled, MailOutlined, PhoneOutlined,
  LoadingOutlined, UploadOutlined,
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";
import { AuthContext } from "../../../../../manageApi/context/AuthContext";
import moment from "moment";

const { Option } = Select;

// ─── Theme ────────────────────────────────────────────────────────────────
const T = {
  primary: "#5c039b",
  primaryLight: "#f3e8ff",
  primaryMid: "#9333ea",
  success: "#16a34a",
  successLight: "#dcfce7",
  warning: "#b45309",
  warningLight: "#fef3c7",
  error: "#b91c1c",
  errorLight: "#fee2e2",
  gray: "#64748b",
  border: "#ede9fe",
};

// ─── Styled card ──────────────────────────────────────────────────────────
const cardStyle = {
  background: "#fff",
  borderRadius: 16,
  border: `1px solid ${T.border}`,
  boxShadow: "0 2px 8px rgba(92,3,155,0.04)",
  padding: "32px 32px",
};

// ─── Upload Helper ────────────────────────────────────────────────────────
const uploadToS3 = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiService.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // ✅ res is the response directly, not { data }
  if (!res.success || !res.file?.url) {
    throw new Error(res.message || "Upload failed");
  }
  return res.file.url;
};

// ─── Image Upload Box ─────────────────────────────────────────────────────
const ImageUploadBox = ({ label, value, onChange, hint }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
      message.error("Only JPG, PNG, WEBP allowed"); return;
    }
    if (file.size > 5 * 1024 * 1024) { message.error("Max 5MB"); return; }
    try {
      setUploading(true);
      const url = await uploadToS3(file);
      onChange(url);
      message.success("Uploaded ✓");
    } catch (err) {
      message.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div style={{ marginBottom: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>{label}</div>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          width: "100%",
          minHeight: 120,
          border: `2px dashed ${value ? T.primary : "#d1d5db"}`,
          borderRadius: 12,
          cursor: uploading ? "wait" : "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: value ? "#faf5ff" : "#f9fafb",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.2s",
        }}
      >
        {uploading ? (
          <>
            <LoadingOutlined style={{ fontSize: 24, color: T.primary }} spin />
            <span style={{ fontSize: 12, color: T.gray }}>Uploading...</span>
          </>
        ) : value ? (
          <>
            <img
              src={value}
              alt={label}
              style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10 }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div style={{
              position: "absolute", bottom: 6, right: 6,
              background: T.primary, color: "#fff",
              borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600,
            }}>
              Change
            </div>
          </>
        ) : (
          <>
            <UploadOutlined style={{ fontSize: 24, color: T.gray }} />
            <span style={{ fontSize: 12, color: T.gray }}>Click to upload</span>
            {hint && <span style={{ fontSize: 11, color: "#9ca3af" }}>{hint}</span>}
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleFile} />
      {value && (
        <div style={{ marginTop: 6, fontSize: 11, color: T.gray, wordBreak: "break-all", background: "#f9fafb", borderRadius: 6, padding: "4px 8px" }}>
          ✅ {value.length > 60 ? value.substring(0, 60) + "..." : value}
        </div>
      )}
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    verified: { icon: <CheckCircleFilled />, color: T.success, bg: T.successLight, label: "Verified" },
    pending: { icon: <ClockCircleFilled />, color: T.warning, bg: T.warningLight, label: "Pending verification" },
    unverified: { icon: <ClockCircleFilled />, color: T.gray, bg: "#f1f5f9", label: "Not submitted" },
  };
  const s = map[status] || map.unverified;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
      background: s.bg, color: s.color,
    }}>
      {s.icon} {s.label}
    </span>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, subtitle }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, background: T.primaryLight,
        display: "flex", alignItems: "center", justifyContent: "center", color: T.primary, fontSize: 18,
      }}>
        {icon}
      </div>
      <div>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#1f2937" }}>{title}</span>
        {subtitle && <p style={{ margin: 0, fontSize: 12, color: T.gray }}>{subtitle}</p>}
      </div>
    </div>
  </div>
);

// ─── Completion Bar ────────────────────────────────────────────────────────
const CompletionBar = ({ steps, percentage }) => {
  const items = [
    { label: "Basic Info", done: steps.basicInfo },
    { label: "ID Verified", done: steps.idVerified },
    { label: "Bank Added", done: steps.bankAdded },
  ];
  return (
    <div style={{
      background: percentage === 100 ? T.successLight : T.primaryLight,
      border: `1px solid ${percentage === 100 ? "#bbf7d0" : T.border}`,
      borderRadius: 16, padding: "24px", marginBottom: 28,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: percentage === 100 ? T.success : T.primary }}>Profile Completion</span>
        <span style={{ fontSize: 24, fontWeight: 800, color: percentage === 100 ? T.success : T.primary }}>{percentage}%</span>
      </div>
      <Progress percent={percentage} showInfo={false}
        strokeColor={percentage === 100 ? T.success : T.primary}
        trailColor={percentage === 100 ? "#bbf7d0" : "#ddd6fe"}
        strokeWidth={8} style={{ marginBottom: 16 }}
      />
      <Row gutter={[16, 16]}>
        {items.map(item => (
          <Col key={item.label} xs={24} sm={8}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {item.done ? <CheckCircleFilled style={{ color: T.success, fontSize: 16 }} /> : <CloseCircleFilled style={{ color: "#d1d5db", fontSize: 16 }} />}
              <span style={{ fontSize: 13, color: item.done ? T.success : T.gray, fontWeight: 500 }}>{item.label}</span>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

// ─── Save Button ──────────────────────────────────────────────────────────
const SaveBtn = ({ onClick, loading }) => (
  <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={onClick}
    style={{
      background: T.primary, borderColor: T.primary, borderRadius: 8,
      fontWeight: 600, height: 44, paddingInline: 32,
      boxShadow: "0 2px 6px rgba(92,3,155,0.2)",
    }}>
    Save Changes
  </Button>
);

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const ReferralProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partner, setPartner] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [idDocumentUrl, setIdDocumentUrl] = useState("");
  const avatarInputRef = useRef();

  const [personalForm] = Form.useForm();
  const [identityForm] = Form.useForm();
  const [bankForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.get("/referral/profile");
const partnerData = res.data;
        setPartner(partnerData);
        setProfilePhotoUrl(partnerData.profilePhotoUrl || "");
        setIdDocumentUrl(partnerData.idDocumentUrl || "");

        personalForm.setFieldsValue({
          firstName: partnerData.firstName,
          lastName: partnerData.lastName,
          email: partnerData.email,
          phone: partnerData.phone,
          dateOfBirth: partnerData.dateOfBirth ? moment(partnerData.dateOfBirth) : null,
        });
        identityForm.setFieldsValue({
          idDocumentType: partnerData.idDocumentType || "emirates_id",
        });
        bankForm.setFieldsValue({
          bankName: partnerData.bankDetails?.bankName || "",
          accountNumber: partnerData.bankDetails?.accountNumber || "",
          iban: partnerData.bankDetails?.iban || "",
          accountHolderName: partnerData.bankDetails?.accountHolderName || "",
        });
      } catch (err) {
        message.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
const refetchProfile = async () => {
  const res = await apiService.get("/referral/profile");
  const partnerData = res.data;
  setPartner(partnerData);
  personalForm.setFieldsValue({
    firstName:   partnerData.firstName,
    lastName:    partnerData.lastName,
    email:       partnerData.email,
    phone:       partnerData.phone,
    dateOfBirth: partnerData.dateOfBirth ? moment(partnerData.dateOfBirth) : null,
  });
  identityForm.setFieldsValue({
    idDocumentType: partnerData.idDocumentType || "emirates_id",
  });
  bankForm.setFieldsValue({
    bankName:          partnerData.bankDetails?.bankName          || "",
    accountNumber:     partnerData.bankDetails?.accountNumber     || "",
    iban:              partnerData.bankDetails?.iban              || "",
    accountHolderName: partnerData.bankDetails?.accountHolderName || "",
  });
  setProfilePhotoUrl(partnerData.profilePhotoUrl || "");
  setIdDocumentUrl(partnerData.idDocumentUrl     || "");
};
  // Avatar upload
const handleAvatarUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { message.error("Max 5MB"); return; }
  try {
    setSaving(true);
    const url = await uploadToS3(file);
    setProfilePhotoUrl(url); // ✅ update local state immediately for instant preview
    await apiService.put("/referral/profile/basic", { profilePhotoUrl: url });
    await refetchProfile(); // ✅ re-fetch so header card also updates
    message.success("Profile photo updated ✓");
  } catch (err) {
    message.error(err.message || "Upload failed");
  } finally {
    setSaving(false);
    e.target.value = "";
  }
};

  // Save basic info
  const handleSaveBasicInfo = async () => {
    try {
      const values = await personalForm.validateFields();
      setSaving(true);
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : undefined,
        profilePhotoUrl,
      };
      await apiService.put("/referral/profile/basic", payload);
      setPartner(prev => ({ ...prev, ...payload }));
      message.success("Basic info updated ✓");
    } catch (err) {
      if (err?.errorFields) message.error("Please fix the errors");
      else message.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // Save identity
  const handleSaveIdentity = async () => {
    try {
      const values = await identityForm.validateFields();
      if (!idDocumentUrl) {
        message.error("Please upload an ID document first");
        return;
      }
      setSaving(true);
      const payload = {
        idDocumentType: values.idDocumentType,
        idDocumentUrl,
      };
      await apiService.put("/referral/profile/id-document", payload);
      setPartner(prev => ({
        ...prev,
        idDocumentType: payload.idDocumentType,
        idDocumentUrl: payload.idDocumentUrl,
        isPayoutEligible: prev.bankDetails?.iban && prev.bankDetails?.accountNumber,
        isProfileComplete: prev.bankDetails?.iban && prev.bankDetails?.accountNumber,
      }));
      message.success("ID document saved ✓");
    } catch (err) {
      if (err?.errorFields) message.error("Please select a document type");
      else message.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // Save bank details
  const handleSaveBank = async () => {
    try {
      const values = await bankForm.validateFields();
      setSaving(true);
      await apiService.put("/referral/profile/bank", values);
      setPartner(prev => ({
        ...prev,
        bankDetails: values,
        isPayoutEligible: !!prev.idDocumentUrl,
        isProfileComplete: !!prev.idDocumentUrl,
      }));
      message.success("Bank details saved ✓");
    } catch (err) {
      if (err?.errorFields) message.error("Please fill all required fields");
      else message.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      setSaving(true);
      await apiService.put("/referral/profile/password", {
  oldPassword: values.oldPassword,
  newPassword: values.newPassword,
});
      message.success("Password changed ✓");
      passwordForm.resetFields();
    } catch (err) {
      if (err?.errorFields) message.error("Please fix the errors");
      else message.error(err?.response?.data?.message || "Password change failed – check backend route");
    } finally {
      setSaving(false);
    }
  };

  // Completion calculations
  const completionSteps = partner?.profileCompletionSteps || {
    basicInfo: true,
    idVerified: !!partner?.idDocumentUrl,
    bankAdded: !!(partner?.bankDetails?.iban && partner?.bankDetails?.accountNumber),
  };
  const completionPercentage = partner?.completionPercentage ||
    Math.round(
      ((completionSteps.basicInfo ? 1 : 0) +
        (completionSteps.idVerified ? 1 : 0) +
        (completionSteps.bankAdded ? 1 : 0)) *
      100 / 3
    );

  const identityStatus = partner?.idDocumentUrl
    ? partner?.isPayoutEligible ? "verified" : "pending"
    : "unverified";
  const bankStatus = partner?.bankDetails?.iban && partner?.bankDetails?.accountNumber
    ? partner?.isPayoutEligible ? "verified" : "pending"
    : "unverified";

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 32px", background: "#faf5ff", minHeight: "100vh" }}>
      {/* Page Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: T.primary,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <UserOutlined style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.primary }}>My Profile</h2>
          <p style={{ margin: 0, fontSize: 13, color: T.gray }}>Manage your personal info, documents, and bank details</p>
        </div>
      </div>

      {/* Profile Header Card */}
      <div style={{
        ...cardStyle,
        display: "flex", alignItems: "center", flexWrap: "wrap",
        gap: 24, marginBottom: 24,
        background: "linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)",
      }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 96, height: 96, borderRadius: "50%", background: T.primary,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 34, fontWeight: 800, color: "#fff",
            border: "3px solid #fff", boxShadow: "0 6px 16px rgba(92,3,155,0.2)", overflow: "hidden",
          }}>
            {saving ? (
              <LoadingOutlined style={{ fontSize: 32, color: "#fff" }} spin />
            ) : profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { e.target.style.display = "none"; }} />
            ) : (
              `${partner?.firstName?.[0] || ""}${partner?.lastName?.[0] || ""}`
            )}
          </div>
          <Tooltip title="Change profile photo">
            <div
              onClick={() => avatarInputRef.current?.click()}
              style={{
                position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderRadius: "50%",
                background: T.primary, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", border: "2px solid #fff", boxShadow: "0 2px 8px rgba(92,3,155,0.3)",
              }}
            >
              <CameraOutlined style={{ color: "#fff", fontSize: 14 }} />
            </div>
          </Tooltip>
          <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleAvatarUpload} />
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1f2937" }}>
            {partner?.firstName} {partner?.lastName}
          </h3>
          <p style={{ margin: "4px 0 12px", fontSize: 13, color: T.gray }}>
            {partner?.email}{partner?.phone && ` · ${partner.phone}`}
          </p>
          <Row gutter={[8, 8]}>
            <Col>
              <Tag color={partner?.status === "active" ? "green" : "orange"} style={{ borderRadius: 20, fontSize: 11, padding: "2px 10px" }}>
                {partner?.status}
              </Tag>
            </Col>
            {partner?.referralCode && (
              <Col>
                <Tag color="purple" style={{ borderRadius: 20, fontSize: 11, padding: "2px 10px" }}>
                  {partner.referralCode}
                </Tag>
              </Col>
            )}
          </Row>
        </div>
      </div>

      {/* Completion Bar */}
      <CompletionBar steps={completionSteps} percentage={completionPercentage} />

      {/* Tabs */}
      <Tabs
        defaultActiveKey="personal"
        tabBarStyle={{ marginBottom: 20, borderBottom: `1px solid ${T.border}` }}
        tabBarGutter={16}
      >
        {/* Personal Info Tab */}
        <Tabs.TabPane
          tab={<span style={{ display: "flex", alignItems: "center", gap: 6 }}><UserOutlined />Personal Info</span>}
          key="personal"
        >
          <div style={cardStyle}>
            <SectionHeader icon={<UserOutlined />} title="Personal Information" subtitle="Update your name, email, and date of birth." />
            <Form form={personalForm} layout="vertical" requiredMark={false} size="large">
              <Row gutter={[24, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                    <Input placeholder="First name" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                    <Input placeholder="Last name" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[24, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item name="email" label="Email">
                    <Input prefix={<MailOutlined />} disabled style={{ borderRadius: 8, background: "#f9fafb" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="phone" label="Phone">
                    <Input prefix={<PhoneOutlined />} disabled style={{ borderRadius: 8, background: "#f9fafb" }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[24, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item name="dateOfBirth" label="Date of Birth">
                    <DatePicker style={{ width: "100%", borderRadius: 8 }} format="YYYY-MM-DD" />
                  </Form.Item>
                </Col>
              </Row>
              <Divider style={{ margin: "12px 0 24px" }} />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <SaveBtn onClick={handleSaveBasicInfo} loading={saving} />
              </div>
            </Form>
          </div>
        </Tabs.TabPane>

        {/* Identity Tab */}
        <Tabs.TabPane
          tab={<span style={{ display: "flex", alignItems: "center", gap: 6 }}><IdcardOutlined />Identity</span>}
          key="identity"
        >
          <div style={cardStyle}>
            <SectionHeader icon={<IdcardOutlined />} title="Identity Document" subtitle="Upload your Emirates ID or Passport for verification." />
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 12, background: "#faf5ff", borderRadius: 12,
              padding: "16px 20px", marginBottom: 24,
            }}>
              <span style={{ fontSize: 14, color: T.primary, fontWeight: 600 }}>Verification Status</span>
              <StatusBadge status={identityStatus} />
            </div>
            <Form form={identityForm} layout="vertical" requiredMark={false} size="large">
              <Form.Item name="idDocumentType" label="Document Type" rules={[{ required: true }]}>
                <Select placeholder="Select document type" style={{ borderRadius: 8 }}>
                  <Option value="emirates_id">Emirates ID</Option>
                  <Option value="passport">Passport</Option>
                </Select>
              </Form.Item>
              <ImageUploadBox
                label="Document Image"
                value={idDocumentUrl}
                onChange={setIdDocumentUrl}
                hint="JPG / PNG / WEBP · Max 5MB"
              />
              <Divider style={{ margin: "24px 0 24px" }} />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <SaveBtn onClick={handleSaveIdentity} loading={saving} />
              </div>
            </Form>
          </div>
        </Tabs.TabPane>

        {/* Bank Details Tab */}
        <Tabs.TabPane
          tab={<span style={{ display: "flex", alignItems: "center", gap: 6 }}><BankOutlined />Bank Details</span>}
          key="bank"
        >
          <div style={cardStyle}>
            <SectionHeader icon={<BankOutlined />} title="Bank Details" subtitle="Add your bank account for seamless payouts." />
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 12, background: "#faf5ff", borderRadius: 12,
              padding: "16px 20px", marginBottom: 24,
            }}>
              <span style={{ fontSize: 14, color: T.primary, fontWeight: 600 }}>Verification Status</span>
              <StatusBadge status={bankStatus} />
            </div>
            <Form form={bankForm} layout="vertical" requiredMark={false} size="large">
              <Row gutter={[24, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item name="bankName" label="Bank Name">
                    <Input placeholder="e.g. Emirates NBD" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="accountHolderName" label="Account Holder Name">
                    <Input placeholder="Full name on account" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[24, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item name="accountNumber" label="Account Number">
                    <Input placeholder="Account number" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="iban" label="IBAN" rules={[{
  validator(_, value) {
    if (!value) return Promise.resolve();
    if (value.startsWith("AE")) return Promise.resolve();
    return Promise.reject(new Error("IBAN should start with AE"));
  }}]}>
                    <Input placeholder="AE000000000000000000000" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
              </Row>
              <Divider style={{ margin: "12px 0 24px" }} />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <SaveBtn onClick={handleSaveBank} loading={saving} />
              </div>
            </Form>
          </div>
        </Tabs.TabPane>

        {/* Password Tab */}
        <Tabs.TabPane
          tab={<span style={{ display: "flex", alignItems: "center", gap: 6 }}><LockOutlined />Password</span>}
          key="password"
        >
          <div style={{ ...cardStyle, maxWidth: 520, margin: "0 auto" }}>
            <SectionHeader icon={<LockOutlined />} title="Change Password" subtitle="Use a strong password that you haven't used before." />
            <Form form={passwordForm} layout="vertical" requiredMark={false} size="large">
              <Form.Item name="oldPassword" label="Current Password" rules={[{ required: true }]}>
                <Input.Password placeholder="Enter current password" style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item name="newPassword" label="New Password" rules={[{ required: true, min: 8 }]}>
                <Input.Password placeholder="At least 8 characters" style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={["newPassword"]}
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                      return Promise.reject(new Error("Passwords do not match"));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Re-enter new password" style={{ borderRadius: 8 }} />
              </Form.Item>
              <Divider style={{ margin: "12px 0 24px" }} />
              <div style={{ display: "flex", justifyContent: "center" }}>
                <SaveBtn onClick={handleChangePassword} loading={saving} />
              </div>
            </Form>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default ReferralProfile;