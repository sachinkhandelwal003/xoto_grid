import React, { useState, useMemo, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Grid,
  ConfigProvider,
  Divider,
  Select,
  Upload,
  message,
  Space // ✅ Added Space
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import axios from "axios";
import { Country } from "country-state-city";
import { parsePhoneNumberFromString } from "libphonenumber-js";

import {
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  UploadOutlined,
  ApartmentOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined,
  UserOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

// --- Styled Components (Same as before) ---
const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  font-family: "Poppins", sans-serif;
  background: #f0f2f5 center/cover no-repeat fixed;
  overflow-y: auto;
  padding: 40px 0;
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(79, 70, 229, 0.9),
    rgba(67, 56, 202, 0.85)
  );
  backdrop-filter: blur(4px);
  z-index: 1;
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const GlassCard = styled(Card)`
  width: 100%;
  max-width: 850px;
  border-radius: 24px !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

  .ant-card-body {
    padding: ${(props) => (props.$isMobile ? "30px 20px" : "50px")} !important;
  }
`;

const RegistrationAgency = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // --- OTP States ---
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  
  // --- Timer State ---
  const [timer, setTimer] = useState(0);

  const themeColor = "#4F46E5";
  const themeGradient = "linear-gradient(135deg, #4F46E5, #4338ca)";
  
  const BASE_URL = "https://xoto.ae"; 

  // Watch inputs
  const watchedMobileNumber = Form.useWatch('mobile_number', form);
  const watchedCountryCode = Form.useWatch('country_code', form);

  // --- Timer Logic ---
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // --- Country Data ---
  const countryPhoneData = useMemo(() => {
    const allCountries = Country.getAllCountries();
    return allCountries.map((c) => ({
      iso: c.isoCode.toLowerCase(),
      name: c.name,
      phone: `+${c.phonecode}`,
      value: `+${c.phonecode}`,
      searchStr: `${c.name} ${c.phonecode}`,
    }));
  }, []);

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  // --- File Validation ---
  const beforeUploadCheck = (file) => {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('File must be smaller than 2MB!');
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  // --- Phone Validation ---
  const isPhoneValid = useMemo(() => {
    if (!watchedMobileNumber || !watchedCountryCode) return false;
    try {
      const fullNumber = `${watchedCountryCode}${watchedMobileNumber}`;
      const phoneNumber = parsePhoneNumberFromString(fullNumber);
      return phoneNumber && phoneNumber.isValid();
    } catch (e) {
      return false;
    }
  }, [watchedMobileNumber, watchedCountryCode]);

  // --- 🟢 MOCKED Send OTP ---
  const handleSendOtp = async () => {
    try {
      // Validate field pehle
      await form.validateFields(['country_code', 'mobile_number']);
      
      setOtpLoading(true);

      // --- MOCK API CALL START ---
      // Asli API call hata di hai.
      
      setTimeout(() => {
        // Fake success response
        toast.success("OTP Sent! (Use 000033 to verify)");
        setOtpSent(true);
        setOtpVerified(false);
        setTimer(60); 
        setOtpLoading(false);
      }, 1000); // 1 sec ka fake delay
      
      // --- MOCK API CALL END ---

    } catch (error) {
      console.error("❌ Validation Error:", error);
      setOtpLoading(false);
    }
  };

  // --- 🟢 MOCKED Verify OTP ---
  const handleVerifyOtp = async () => {
    if (!otpValue) {
      toast.error("Please enter the OTP");
      return;
    }

    setOtpLoading(true);

    // --- MOCK VERIFICATION LOGIC ---
    setTimeout(() => {
        if (otpValue === "000033") {
            // Success Case
            toast.success("Mobile Number Verified!");
            setOtpVerified(true);
            setOtpSent(false); // Hide OTP box
            setTimer(0);
        } else {
            // Failure Case
            toast.error("Invalid OTP. Try 000033");
        }
        setOtpLoading(false);
    }, 800); // 0.8 sec fake delay
  };

  // --- Handle Mobile Change ---
  const handleMobileChange = (e) => {
    const { value } = e.target;
    if (/^\d*$/.test(value)) {
      form.setFieldsValue({ mobile_number: value });
      if (otpVerified || otpSent) {
        setOtpVerified(false);
        setOtpSent(false);
        setOtpValue("");
        setTimer(0);
      }
    }
  };

  // --- Submit (Asli Registration API) ---
 const onFinish = async (values) => {
  if (!otpVerified) {
    toast.error("Please verify mobile number");
    return;
  }

  setLoading(true);

  try {
    const payload = {
      agency_name: values.agency_name,
      email: values.email,
      password: values.password,
      country_code: values.country_code,
      mobile_number: values.mobile_number,

      // send dummy or uploaded URL
      profile_photo: "https://picsum.photos/200/201",
      letter_of_authority: "https://example.com/docs/authority10.pdf",
    };

    const response = await axios.post(
      "http://localhost:5000/api/agency/agency-signup",
      payload
    );

    if (response.data?.success) {
      toast.success(response.data.message);
      navigate("/");
    }

  } catch (error) {
    
    toast.error(error.response?.data?.message || "Failed");
  } finally {
    setLoading(false);
  }
};




  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: themeColor,
          borderRadius: 8,
          fontFamily: "Poppins, sans-serif",
        },
        components: {
            Button: { fontWeight: 600 }
        }
      }}
    >
      <PageWrapper>
        <GradientOverlay />
        <ContentLayer>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ width: "100%", maxWidth: 850 }}
          >
            <GlassCard bordered={false} $isMobile={isMobile}>
              
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                 <div style={{ 
                    width: 72, height: 72, borderRadius: "50%", 
                    background: themeGradient, color: "#fff", 
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px auto",
                    boxShadow: "0 10px 25px rgba(79, 70, 229, 0.3)"
                 }}>
                    <ApartmentOutlined style={{ fontSize: "36px" }} />
                 </div>

                <Title level={2} style={{ margin: 0, color: "#333", fontWeight: 800 }}>
                  Agency Partner Registration
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  Join us to manage your properties efficiently
                </Text>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
                scrollToFirstError
                initialValues={{ country_code: "+971" }}
              >
                {/* --- Account Info --- */}
                <Divider orientation="left" style={{ borderColor: "#e5e7eb" }}>
                    <span style={{ color: themeColor, fontSize: 12, fontWeight: "800", letterSpacing: 1.2 }}>
                        AGENCY DETAILS
                    </span>
                </Divider>

                <Row gutter={24}>
                  <Col xs={24}>
                    <Form.Item
                      name="agency_name"
                      label="Agency Name"
                      rules={[{ required: true, message: "Please enter Agency Name" }]}
                    >
                      <Input prefix={<ApartmentOutlined style={{color: "#aaa"}} />} placeholder="e.g. Skyline Properties LLC" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="Official Email"
                      rules={[
                        { required: true, message: "Email is required" },
                        { type: "email", message: "Invalid email format" }
                      ]}
                    >
                      <Input prefix={<MailOutlined style={{color: "#aaa"}} />} placeholder="agency@example.com" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[{ required: true, message: "Password is required" }, { min: 6, message: "Min 6 characters" }]}
                    >
                      <Input.Password prefix={<LockOutlined style={{color: "#aaa"}} />} placeholder="Create strong password" />
                    </Form.Item>
                  </Col>
                </Row>

                {/* --- Contact Details --- */}
                <Divider orientation="left" style={{ borderColor: "#e5e7eb", marginTop: 30 }}>
                    <span style={{ color: themeColor, fontSize: 12, fontWeight: "800", letterSpacing: 1.2 }}>
                        CONTACT VERIFICATION
                    </span>
                </Divider>

                <Row gutter={16}>
                    <Col xs={10} md={6}>
                        <Form.Item
                            name="country_code"
                            label="Code"
                            rules={[{ required: true, message: "Required" }]}
                        >
                            <Select 
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) => 
                                    (option['data-search'] || "").toLowerCase().includes(input.toLowerCase())
                                }
                                onChange={() => {
                                    setOtpVerified(false);
                                    setOtpSent(false);
                                    setTimer(0);
                                }}
                                dropdownStyle={{ minWidth: 250 }}
                            >
                                {countryPhoneData.map((country, index) => (
                                    <Option 
                                      key={`${country.iso}-${index}`} 
                                      value={country.value}
                                      data-search={country.searchStr}
                                    >
                                      <Space>
                                        <img 
                                          src={`https://flagcdn.com/w20/${country.iso}.png`} 
                                          srcSet={`https://flagcdn.com/w40/${country.iso}.png 2x`}
                                          width="20" 
                                          alt={country.name} 
                                          style={{ borderRadius: 2 }} 
                                        />
                                        {country.phone}
                                      </Space>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    
                    <Col xs={14} md={10}>
                        <Form.Item
                            name="mobile_number"
                            label="Mobile Number"
                            dependencies={['country_code']}
                            rules={[
                                { required: true, message: "Required" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const countryCode = getFieldValue('country_code');
                                        if (!value || !countryCode) return Promise.resolve();
                                        const fullNumber = `${countryCode}${value}`;
                                        const phoneNumber = parsePhoneNumberFromString(fullNumber);
                                        if (phoneNumber && phoneNumber.isValid()) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Invalid mobile number"));
                                    },
                                }),
                            ]}
                        >
                            <Input 
                                prefix={<PhoneOutlined style={{color: "#aaa"}} />} 
                                placeholder="50 123 4567" 
                                maxLength={15}
                                disabled={otpVerified}
                                onChange={handleMobileChange}
                                suffix={otpVerified ? <CheckCircleFilled style={{ color: "#52c41a" }} /> : null}
                            />
                        </Form.Item>
                    </Col>

                    {/* --- OTP Button --- */}
                    <Col xs={24} md={8} style={{ display: 'flex', alignItems: 'flex-start', paddingTop: isMobile ? 0 : '30px' }}>
                        {!otpVerified ? (
                            <Button 
                                type="primary" 
                                disabled={!isPhoneValid || timer > 0}
                                onClick={handleSendOtp}
                                loading={otpLoading && !otpSent}
                                block
                                style={{ 
                                    background: (!isPhoneValid || timer > 0) ? undefined : "#1677ff",
                                }}
                            >
                                {timer > 0 ? `Resend in ${timer}s` : (otpSent ? "Resend OTP" : "Send OTP")}
                            </Button>
                        ) : (
                            <Button 
                                type="dashed" 
                                block
                                style={{ 
                                    borderColor: '#52c41a', 
                                    color: '#52c41a', 
                                    background: '#f6ffed',
                                    cursor: 'default'
                                }}
                                icon={<CheckCircleFilled />}
                            >
                                Verified
                            </Button>
                        )}
                    </Col>
                </Row>

                {/* --- OTP Input Area (Appears after "Send OTP" is clicked) --- */}
                <AnimatePresence>
                    {otpSent && !otpVerified && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            style={{ overflow: "hidden" }}
                        >
                            <div style={{ background: "#f9fafb", padding: 20, borderRadius: 8, border: "1px dashed #d9d9d9" }}>
                                <Row gutter={16} align="middle">
                                    <Col xs={24} sm={16}>
                                        <Text style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
                                            Mock OTP Sent (Check Console or use <b>000033</b>)
                                        </Text>
                                        <Input 
                                            placeholder="Enter 000033"
                                            value={otpValue}
                                            onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                                            prefix={<SafetyCertificateOutlined />}
                                            maxLength={6}
                                            size="large"
                                            onPressEnter={handleVerifyOtp}
                                        />
                                    </Col>
                                    <Col xs={24} sm={8} style={{ marginTop: isMobile ? 10 : 26 }}>
                                        <Button 
                                            type="primary" 
                                            onClick={handleVerifyOtp} 
                                            loading={otpLoading}
                                            block
                                            style={{ background: "#000" }}
                                        >
                                            Verify
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- Documents --- */}
                <Divider orientation="left" style={{ borderColor: "#e5e7eb", marginTop: 30 }}>
                    <span style={{ color: themeColor, fontSize: 12, fontWeight: "800", letterSpacing: 1.2 }}>
                        REQUIRED DOCUMENTS
                    </span>
                </Divider>

                <Row gutter={24}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="profile_photo"
                            label="Agency Logo / Profile"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            rules={[{ required: true, message: "Logo is required" }]}
                        >
                            <Upload 
                                name="logo" 
                                listType="picture-card"
                                maxCount={1}
                                beforeUpload={beforeUploadCheck}
                                accept="image/png, image/jpeg, image/jpg"
                                showUploadList={{ showPreviewIcon: false }}
                            >
                                <div>
                                    <UserOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            </Upload>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="letter_of_authority"
                            label="Trade License / Authority Letter"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            rules={[{ required: true, message: "Document is required" }]}
                            extra="PDF or Image (Max 2MB)"
                        >
                            <Upload 
                                name="doc" 
                                maxCount={1}
                                beforeUpload={beforeUploadCheck}
                                accept=".pdf,.png,.jpg,.jpeg"
                            >
                                <Button icon={<UploadOutlined />}>Select Document</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>

                <div style={{ marginTop: 40 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        size="large"
                        style={{
                            height: 56,
                            borderRadius: 12,
                            fontWeight: "bold",
                            fontSize: "16px",
                            background: themeGradient,
                            border: "none",
                            boxShadow: "0 10px 25px rgba(79, 70, 229, 0.4)",
                        }}
                    >
                        COMPLETE REGISTRATION
                    </Button>
                    
                    <div style={{ textAlign: "center", marginTop: 24 }}>
                        <Text type="secondary">Already registered? </Text>
                        <Button 
                            type="link" 
                            onClick={() => navigate("/")} 
                            style={{ padding: 0, fontWeight: "bold", color: themeColor }}
                        >
                            Login Here
                        </Button>
                    </div>
                </div>

              </Form>
            </GlassCard>
          </motion.div>
        </ContentLayer>
      </PageWrapper>
    </ConfigProvider>
  );
};

export default RegistrationAgency;