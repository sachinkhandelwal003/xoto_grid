import React, { useEffect, useMemo, useState } from "react";
import {
  Form, Input, Button, Card, Typography, Row, Col, Grid,
  ConfigProvider, Divider, Select, Upload, message, Steps
} from "antd";
import { useNavigate } from "react-router-dom";
import { Country } from "country-state-city";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  MailOutlined, LockOutlined, UploadOutlined, UserOutlined,
  EnvironmentOutlined, IdcardOutlined, CheckCircleFilled, ArrowLeftOutlined
} from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

const RegistrationAgent = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  // ── OTP States ───────────────────────────────────────────────────
  const [mobileOtpSent, setMobileOtpSent]       = useState(false);
  const [mobileOtpVerified, setMobileOtpVerified] = useState(false);
  const [mobileOtp, setMobileOtp]               = useState("");

  const [emailOtpSent, setEmailOtpSent]         = useState(false);
  const [emailOtpVerified, setEmailOtpVerified]   = useState(false);
  const [emailOtp, setEmailOtp]                 = useState("");

  // ── Phone ────────────────────────────────────────────────────────
  const [countryCode, setCountryCode] = useState("971");
  const [phoneNumber, setPhoneNumber] = useState("");

  // ── Agencies ─────────────────────────────────────────────────────
  const [agencies, setAgencies]           = useState([]);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  const [selectedAgency, setSelectedAgency]   = useState("");   // persisted across steps
const [verifiedEmail, setVerifiedEmail] = useState(""); 
  // ── Uploads ──────────────────────────────────────────────────────
  const [uploading, setUploading] = useState({
    profile_photo: false,
    emiratesIdUrl: false,
    reraCardUrl:   false,
  });
  const [urls, setUrls] = useState({
    profile_photo: "",
    emiratesIdUrl: "",
    reraCardUrl:   "",
  });

  // ── Step ─────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting]   = useState(false);

  // ── Country codes ─────────────────────────────────────────────────
  const countryOptions = useMemo(() =>
    Country.getAllCountries()
      .map(c => ({ name: c.name, code: c.phonecode, iso: c.isoCode }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  []);

  // ── Fetch agencies ────────────────────────────────────────────────
  useEffect(() => { fetchAgencies(); }, []);

  const fetchAgencies = async () => {
    setLoadingAgencies(true);
    try {
      const res = await apiService.get("/agency/public/agencies");
      setAgencies(res?.data || []);
    } catch {
      message.error("Failed to load agencies");
    } finally {
      setLoadingAgencies(false);
    }
  };

  // ── OTP Handlers ──────────────────────────────────────────────────
  const sendMobileOtp = async () => {
    const full   = `+${countryCode}${phoneNumber}`;
    const parsed = parsePhoneNumberFromString(full);
    if (!parsed || !parsed.isValid()) { message.error("Invalid phone number"); return; }
    try {
      await apiService.post("/otp/send-otp", {
        country_code: `+${countryCode}`,
        phone_number: phoneNumber,
      });
      setMobileOtpSent(true);
      message.success("OTP sent to your mobile");
    } catch { message.error("Failed to send OTP"); }
  };

  const verifyMobileOtp = async () => {
    try {
      await apiService.post("/otp/verify-otp", {
        country_code: `+${countryCode}`,
        phone_number: phoneNumber,
        otp: mobileOtp,
      });
      setMobileOtpVerified(true);
      message.success("Mobile verified ✓");
    } catch { message.error("Invalid OTP. Try again."); }
  };

  const sendEmailOtp = async () => {
    const email = form.getFieldValue("email");
    if (!email) return message.error("Enter email first");
    try {
      await apiService.post("/otp/email-otp/send", { email });
      setEmailOtpSent(true);
      message.success("OTP sent to your email");
    } catch { message.error("Failed to send email OTP"); }
  };

  const verifyEmailOtp = async () => {
    try {
      await apiService.post("/otp/email-otp/verify", {
        email: form.getFieldValue("email"),
        otp: emailOtp,
      });   
       setVerifiedEmail(form.getFieldValue("email")); 
      setEmailOtpVerified(true);
      message.success("Email verified ✓");
    } catch { message.error("Invalid OTP. Try again."); }
  };

  // ── Upload ────────────────────────────────────────────────────────
  const handleUpload = async (file, field) => {
    setUploading(prev => ({ ...prev, [field]: true }));
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await apiService.upload("/upload", formData);
      const uploadedUrl =
        res?.file?.url ||
        res?.url ||
        res?.data?.file?.url ||
        res?.data?.url ||
        "";
      if (!uploadedUrl) {
        throw new Error("Upload completed but no file URL was returned");
      }
      setUrls(prev => ({ ...prev, [field]: uploadedUrl }));
      message.success("File uploaded successfully");
    } catch {
      message.error("Upload failed. Please try again.");
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
    return false; // prevent auto-upload
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleFinish = async (values) => {
    const firstName = values.first_name?.trim() || "";
    const lastName  = values.last_name?.trim()  || "";

    const payload = {
      // Schema fields — exact match
      first_name:     firstName,
      last_name:      lastName,
  email:          verifiedEmail,
        country_code:   `+${countryCode}`,
      phone_number:   phoneNumber,
      password:       values.password,
      country:        values.country        || "UAE",
      operating_city: values.operating_city,
      specialization: values.specialization || "",
      agency:         selectedAgency,
      // Documents
      profile_photo:  urls.profile_photo || "",
      emiratesIdUrl:  urls.emiratesIdUrl || "",
      reraCardUrl:    urls.reraCardUrl   || "",
      reraCardNumber: values.reraCardNumber || "",
      // Status
      onboarding_status: "pending",
    };

    // Pre-flight check
    const required = [
      'first_name', 'last_name', 'email',
      'phone_number', 'country_code', 'password',
      'operating_city', 'agency',
    ];
    const missing = required.filter(k => !payload[k]);
    if (missing.length > 0) {
      message.error(`Missing required fields: ${missing.join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      await apiService.post("/agency/public/register-agent", payload);
      message.success("Registration submitted for approval!");
      navigate("/waiting-approval");
    } catch (err) {
      message.error(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Steps config ──────────────────────────────────────────────────
  const steps = [
    { title: "Mobile"    },
    { title: "Email"     },
    { title: "Agency"    },
    { title: "Details"   },
  ];

  // ── Render ────────────────────────────────────────────────────────
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#5C039B" } }}>
      <div style={{ minHeight: "100vh", background: "#f8f9fa", padding: isMobile ? 20 : 40 }}>
        <Card
          style={{ maxWidth: 800, margin: "0 auto", borderRadius: 16 }}
          bodyStyle={{ padding: isMobile ? 24 : 40 }}
        >
          <Title level={2} style={{ textAlign: "center", marginBottom: 8 }}>
            <IdcardOutlined style={{ marginRight: 8 }} />
            Agent Registration
          </Title>
          <Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: 24 }}>
            Join Xoto Network – verify your phone, email, choose your agency, and complete your profile.
          </Text>

          <Steps current={currentStep} size="small" style={{ marginBottom: 32 }}>
            {steps.map(s => <Steps.Step key={s.title} title={s.title} />)}
          </Steps>

          <Form form={form} layout="vertical" onFinish={handleFinish}>

            {/* ── STEP 0: Mobile Verification ─────────────────────────── */}
            {currentStep === 0 && (
              <>
                <Divider>Phone Verification</Divider>
                <Row gutter={12} align="middle">
                  <Col span={8}>
                    <Form.Item label="Country Code">
                      <Select
                        value={countryCode}
                        onChange={setCountryCode}
                        showSearch
                        optionFilterProp="children"
                        style={{ width: "100%" }}
                      >
                        {countryOptions.map(c => (
                          <Option key={c.iso} value={c.code}>+{c.code} ({c.iso})</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item label="Phone Number">
                      <Input
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="501234567"
                        suffix={mobileOtpVerified
                          ? <CheckCircleFilled style={{ color: "#52c41a" }} />
                          : null
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {mobileOtpSent && !mobileOtpVerified && (
                  <Input.Search
                    placeholder="Enter OTP"
                    enterButton="Verify OTP"
                    value={mobileOtp}
                    onChange={e => setMobileOtp(e.target.value)}
                    onSearch={verifyMobileOtp}
                    style={{ marginBottom: 16 }}
                  />
                )}

                {mobileOtpVerified ? (
                  <div style={{ color: "#52c41a", fontWeight: 600, textAlign: "center", marginBottom: 8 }}>
                    <CheckCircleFilled style={{ marginRight: 6 }} />
                    Mobile number verified
                  </div>
                ) : (
                  <Button type="primary" block onClick={sendMobileOtp} disabled={!phoneNumber}>
                    {mobileOtpSent ? "Resend OTP" : "Send OTP"}
                  </Button>
                )}
              </>
            )}

            {/* ── STEP 1: Email Verification ──────────────────────────── */}
            {currentStep === 1 && (
              <>
                <Divider>Email Verification</Divider>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: "Email is required" },
                    { type: "email",  message: "Enter a valid email" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="you@example.com"
                    disabled={emailOtpVerified}
                  />
                </Form.Item>

                {emailOtpSent && !emailOtpVerified && (
                  <Input.Search
                    placeholder="Enter Email OTP"
                    enterButton="Verify OTP"
                    value={emailOtp}
                    onChange={e => setEmailOtp(e.target.value)}
                    onSearch={verifyEmailOtp}
                    style={{ marginBottom: 16 }}
                  />
                )}

                {emailOtpVerified ? (
                  <div style={{ color: "#52c41a", fontWeight: 600, textAlign: "center", marginBottom: 8 }}>
                    <CheckCircleFilled style={{ marginRight: 6 }} />
                    Email verified
                  </div>
                ) : (
                  <Button type="primary" block onClick={sendEmailOtp} disabled={emailOtpVerified}>
                    {emailOtpSent ? "Resend OTP" : "Send OTP"}
                  </Button>
                )}
              </>
            )}

            {/* ── STEP 2: Agency Selection ────────────────────────────── */}
            {currentStep === 2 && (
              <>
                <Divider>Choose Your Agency</Divider>
                <Form.Item
                  name="agency"
                  label="Agency Affiliation"
                  rules={[{ required: true, message: "Please select your agency" }]}
                >
                  <Select
                    placeholder="Search and select an agency"
                    loading={loadingAgencies}
                    showSearch
                    optionFilterProp="children"
                    notFoundContent="No agencies found"
                    onChange={(val) => setSelectedAgency(val)}
                  >
                    {agencies.map(a => (
                      <Option key={a._id} value={a._id}>{a.companyName}</Option>
                    ))}
                  </Select>
                </Form.Item>
                {selectedAgency && (
                  <div style={{ color: "#52c41a", fontWeight: 600 }}>
                    <CheckCircleFilled style={{ marginRight: 6 }} />
                    Agency selected
                  </div>
                )}
                <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                  Your agency manages your listings, leads, and commissions.
                </Text>
              </>
            )}

            {/* ── STEP 3: Personal Details + Documents ────────────────── */}
            {currentStep === 3 && (
              <>
                <Divider>Personal Information</Divider>

                {/* Name */}
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="first_name"
                      label="First Name"
                      rules={[{ required: true, message: "First name is required" }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="John" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="last_name"
                      label="Last Name"
                      rules={[{ required: true, message: "Last name is required" }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Doe" />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Location + Country */}
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="operating_city"
                      label="Operating City"
                      rules={[{ required: true, message: "City is required" }]}
                    >
                      <Input prefix={<EnvironmentOutlined />} placeholder="Dubai" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="country" label="Country" initialValue="UAE">
                      <Input prefix={<EnvironmentOutlined />} placeholder="UAE" />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Specialization */}
                <Form.Item
                  name="specialization"
                  label="Specialization"
                >
                  <Select placeholder="Select your specialization">
                    <Option value="Residential">Residential</Option>
                    <Option value="Commercial">Commercial</Option>
                    <Option value="Industrial">Industrial</Option>
                    <Option value="Land">Land</Option>
                    <Option value="General">General</Option>
                  </Select>
                </Form.Item>

                {/* Password */}
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: "Password is required" },
                    { min: 6, message: "At least 6 characters" },
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="At least 6 characters" />
                </Form.Item>

                <Divider>Documents</Divider>

                {/* RERA Card Number */}
                <Form.Item name="reraCardNumber" label="RERA Card Number (optional)">
                  <Input placeholder="e.g. 12345678" />
                </Form.Item>

                {/* Profile Photo */}
                <Form.Item label="Profile Photo">
                  <Upload
                    beforeUpload={file => handleUpload(file, "profile_photo")}
                    showUploadList={false}
                    accept="image/*"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={uploading.profile_photo}
                      block
                      style={urls.profile_photo ? { borderColor: "#52c41a", color: "#52c41a" } : {}}
                    >
                      {urls.profile_photo ? "✓ Profile Photo Uploaded" : "Upload Profile Photo"}
                    </Button>
                  </Upload>
                </Form.Item>

                {/* Emirates ID */}
                <Form.Item label="Emirates ID">
                  <Upload
                    beforeUpload={file => handleUpload(file, "emiratesIdUrl")}
                    showUploadList={false}
                    accept="image/*,.pdf"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={uploading.emiratesIdUrl}
                      block
                      style={urls.emiratesIdUrl ? { borderColor: "#52c41a", color: "#52c41a" } : {}}
                    >
                      {urls.emiratesIdUrl ? "✓ Emirates ID Uploaded" : "Upload Emirates ID"}
                    </Button>
                  </Upload>
                </Form.Item>

                {/* RERA Certificate */}
                <Form.Item label="RERA Certificate">
                  <Upload
                    beforeUpload={file => handleUpload(file, "reraCardUrl")}
                    showUploadList={false}
                    accept="image/*,.pdf"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={uploading.reraCardUrl}
                      block
                      style={urls.reraCardUrl ? { borderColor: "#52c41a", color: "#52c41a" } : {}}
                    >
                      {urls.reraCardUrl ? "✓ RERA Certificate Uploaded" : "Upload RERA Certificate"}
                    </Button>
                  </Upload>
                </Form.Item>
              </>
            )}

            {/* ── Navigation ───────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(prev => prev - 1)}>
                  <ArrowLeftOutlined /> Previous
                </Button>
              )}

              {currentStep < 3 ? (
                <Button
                  type="primary"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={
                    (currentStep === 0 && !mobileOtpVerified) ||
                    (currentStep === 1 && !emailOtpVerified)  ||
                    (currentStep === 2 && !selectedAgency)
                  }
                  style={{ marginLeft: "auto" }}
                >
                  Next →
                </Button>
              ) : (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  disabled={!mobileOtpVerified || !emailOtpVerified || !selectedAgency}
                  style={{ marginLeft: "auto", height: 48, paddingInline: 32 }}
                >
                  Submit Registration
                </Button>
              )}
            </div>

          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default RegistrationAgent;
