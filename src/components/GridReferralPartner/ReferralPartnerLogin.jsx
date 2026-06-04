import React, { useState, useMemo, useContext, useEffect, useRef } from 'react';
import { UserOutlined, ArrowLeftOutlined, MobileOutlined, LockOutlined } from '@ant-design/icons';
import { Form, Input, Button, Card, Typography, Row, Col, Grid, ConfigProvider, Select, Alert, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Country } from 'country-state-city';
import { AuthContext } from '../../manageApi/context/AuthContext.jsx'; // 🌟 AuthContext Import kiya 🌟

import loginimage from '../../assets/img/one.png';
import logoNew from '../../assets/img/xotothelogo.png';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

const PHONE_LENGTH_RULES = { "AE": 9, "IN": 10, "SA": 9, "US": 10, "CA": 10, "GB": 10, "AU": 9 };

/* --- STYLED COMPONENTS --- */
const PageWrapper = styled.div`min-height: 100vh; position: relative; font-family: 'Poppins', sans-serif; background: url(${props => props.$bgImage}) center/cover no-repeat fixed; overflow: hidden;`;
const GradientOverlay = styled.div`position: absolute; inset: 0; background: linear-gradient(135deg, rgba(3, 164, 244, 0.8), rgba(0, 31, 63, 0.85)); backdrop-filter: blur(3px); z-index: 1;`;
const ContentLayer = styled.div`position: relative; z-index: 2; min-height: 100vh; display: flex; align-items: center; justify-content: center;`;
const GlassCard = styled(Card)`width: 100%; border-radius: 24px !important; background: rgba(255, 255, 255, 0.9) !important; backdrop-filter: blur(20px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); .ant-card-body { padding: ${props => (props.$isMobile ? '30px 20px' : '40px')} !important; }`;

const ReferralPartnerLogin = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [countryIso, setCountryIso] = useState('IN'); 

  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // 🌟 Auth Context Hooks 🌟
  const { login, isAuthenticated, user, token } = useContext(AuthContext);
  const hasRedirected = useRef(false);

  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map((country) => ({
      name: country.name, code: country.phonecode, iso: country.isoCode,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // 🌟 Redirect Effect (Same as AdvisorLogin) 🌟
  useEffect(() => {
    if (isAuthenticated && token && !hasRedirected.current) {
      hasRedirected.current = true;

      if (user) {
        localStorage.setItem("user_data", JSON.stringify(user));
      }

      message.success("Welcome, Partner! Redirecting to your dashboard...");
      setTimeout(() => {
        navigate("/dashboard/grid-referral-partner", { replace: true });
      }, 1500);
    }
  }, [isAuthenticated, user, token, navigate]);

  /* ---------------- FORM SUBMIT API ---------------- */
  const onFinish = async (values) => {
    setLoading(true);
    setGeneralError("");
    
    const selectedCountryData = Country.getCountryByCode(countryIso);
    const phoneCode = selectedCountryData ? `+${selectedCountryData.phonecode}` : '+91';
    const fullPhoneNumber = `${phoneCode}${values.mobile}`;

    try {
      // 🌟 Calling global login function 🌟
      await login("/referral/login-partner", {
        phone: fullPhoneNumber,
        password: values.password,
      });
      // AuthContext token save aur isAuthenticated true kar dega, jisse upar wala useEffect trigger hoga
    } catch (err) {
      

      let errorMessage = "Invalid credentials";

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (typeof err === "object" && err?.message && !err.message.includes("status code")) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      const errorStr = errorMessage.toLowerCase();
      if (errorStr.includes("not approved") || errorStr.includes("pending") || errorStr.includes("approv")) {
        message.warning(errorMessage);
      } else {
        message.error(errorMessage);
      }

      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#03A4F4', borderRadius: 8, fontFamily: 'Poppins, sans-serif' } }}>
      <PageWrapper $bgImage={loginimage}>
        <GradientOverlay />
        <ContentLayer>
          <Row style={{ width: '100%', maxWidth: 1200, padding: isMobile ? 16 : 0 }}>
            <Col xs={24} lg={12} style={{ padding: 40 }}>
              <img src={logoNew} alt="Logo" style={{ width: 250 }} />
              <Title style={{ color: '#fff', marginTop: 24 }}>Referral Partner <span style={{ color: '#03A4F4' }}>Portal</span></Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>Sign in to manage your referrals and earnings.</Text>
            </Col>

            <Col xs={24} lg={12} style={{ display: 'flex', justifyContent: 'center' }}>
              <GlassCard bordered={false} $isMobile={isMobile}>
                <div style={{ textAlign: 'center', marginBottom: 20, position: 'relative' }}>
                  <div onClick={() => navigate('/')} style={{ position: 'absolute', left: 0, top: 0, cursor: 'pointer', fontSize: 20, color: '#595959', display: 'flex', alignItems: 'center', height: 28 }}>
                    <ArrowLeftOutlined />
                  </div>
                  <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: 'linear-gradient(135deg,#03A4F4,#0077b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28 }}>
                    <UserOutlined />
                  </div>
                  <Title level={3}>Welcome Back</Title>
                  <Text type="secondary">Login securely to your account</Text>
                </div>

                {/* 🌟 General Error Alert 🌟 */}
                {generalError && (
                  <Alert
                    message={generalError}
                    type={generalError.toLowerCase().includes("not approved") || generalError.toLowerCase().includes("pending") ? "warning" : "error"}
                    showIcon
                    style={{ marginBottom: 20, borderRadius: 12 }}
                    closable
                    onClose={() => setGeneralError("")}
                  />
                )}

                <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                  <Form.Item name="mobile" rules={[{ required: true, message: 'Please enter mobile number' }]}>
                    <Input
                      addonBefore={
                        <Select value={countryIso} style={{ width: 100 }} onChange={(val) => { setCountryIso(val); form.setFieldsValue({ mobile: '' }); }}>
                          {countryOptions.map((item) => (
                            <Option key={item.iso} value={item.iso} label={`+${item.code}`}>
                               {item.name} (+{item.code})
                            </Option>
                          ))}
                        </Select>
                      }
                      prefix={<MobileOutlined style={{ color: '#bfbfbf' }} />}
                      placeholder={`Mobile Number`}
                      maxLength={PHONE_LENGTH_RULES[countryIso] || 15}
                      style={{ height: 50, borderRadius: 12 }}
                    />
                  </Form.Item>

                  <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
                    <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Password" style={{ height: 50, borderRadius: 12 }} />
                  </Form.Item>

                  <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 50, borderRadius: 12, fontWeight: 'bold', marginTop: 8 }}>
                    Secure Login
                  </Button>
                </Form>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Text>Don’t have an account? </Text>
                  <span onClick={() => navigate('/referral-partner/register')} style={{ color: '#03A4F4', fontWeight: 'bold', cursor: 'pointer' }}>
                    Register Now
                  </span>
                </div>
              </GlassCard>
            </Col>
          </Row>
        </ContentLayer>
      </PageWrapper>
    </ConfigProvider>
  );
};

export default ReferralPartnerLogin;