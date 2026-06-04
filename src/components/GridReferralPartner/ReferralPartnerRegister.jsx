import React, { useState, useMemo } from 'react';
import { UserAddOutlined, ArrowLeftOutlined, MobileOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Form, Input, Button, Card, Typography, Row, Col, Grid, ConfigProvider, Select, DatePicker, message, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Country } from 'country-state-city';

import loginimage from '../../assets/img/one.png';
import logoNew from '../../assets/img/xotothelogo.png';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

const PHONE_LENGTH_RULES = { "AE": 9, "IN": 10, "SA": 9, "US": 10, "CA": 10, "GB": 10, "AU": 9 };

/* --- STYLED COMPONENTS --- */
const PageWrapper = styled.div`min-height: 100vh; position: relative; font-family: 'Poppins', sans-serif; background: url(${props => props.$bgImage}) center/cover no-repeat fixed; overflow: hidden;`;
const GradientOverlay = styled.div`position: absolute; inset: 0; background: linear-gradient(135deg, rgba(3, 164, 244, 0.8), rgba(0, 31, 63, 0.85)); backdrop-filter: blur(3px); z-index: 1;`;
const ContentLayer = styled.div`position: relative; z-index: 2; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px 0;`;
const GlassCard = styled(Card)`width: 100%; border-radius: 24px !important; background: rgba(255, 255, 255, 0.9) !important; backdrop-filter: blur(20px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); .ant-card-body { padding: ${props => (props.$isMobile ? '30px 20px' : '40px')} !important; }`;

const ReferralPartnerRegister = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [countryIso, setCountryIso] = useState('IN'); 

  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map((country) => ({
      name: country.name, code: country.phonecode, iso: country.isoCode,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  /* ---------------- FORM SUBMIT API ---------------- */
  const onFinish = async (values) => {
    setLoading(true);
    setGeneralError("");
    
    const selectedCountryData = Country.getCountryByCode(countryIso);
    const phoneCode = selectedCountryData ? `+${selectedCountryData.phonecode}` : '+91';
    const fullPhoneNumber = `${phoneCode}${values.mobile}`;

    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      phone: fullPhoneNumber,
      email: values.email,
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
      password: values.password 
    };

    try {
      const response = await fetch('http://localhost:5000/api/referral/register-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === 'success') {
        message.success('Registration successful! Please login with your credentials.');
        setTimeout(() => navigate('/referral-partner/login'), 1500); 
      } else {
        setGeneralError(data.message || 'Registration failed');
      }
    } catch (err) {
      setGeneralError('Server connection failed. Please try again later.');
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
            <Col xs={0} lg={12} style={{ padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <img src={logoNew} alt="Logo" style={{ width: 250 }} />
              <Title style={{ color: '#fff', marginTop: 24 }}>Join <span style={{ color: '#03A4F4' }}>Xoto GRID</span></Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>Become a Referral Partner and start earning today.</Text>
            </Col>
            
            <Col xs={24} lg={12} style={{ display: 'flex', justifyContent: 'center' }}>
              <GlassCard bordered={false} $isMobile={isMobile}>
                <div style={{ textAlign: 'center', marginBottom: 20, position: 'relative' }}>
                  <div onClick={() => navigate('/referral-partner/login')} style={{ position: 'absolute', left: 0, top: 0, cursor: 'pointer', fontSize: 20, color: '#595959', display: 'flex', alignItems: 'center' }}>
                    <ArrowLeftOutlined />
                  </div>
                  <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: 'linear-gradient(135deg,#03A4F4,#0077b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28 }}>
                    <UserAddOutlined />
                  </div>
                  <Title level={3} style={{ marginBottom: 0 }}>Apply Now</Title>
                </div>

                {generalError && (
                  <Alert
                    message={generalError}
                    type="error"
                    showIcon
                    style={{ marginBottom: 20, borderRadius: 12 }}
                    closable
                    onClose={() => setGeneralError("")}
                  />
                )}

                <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item name="firstName" rules={[{ required: true, message: 'First name required' }]}>
                        <Input placeholder="First Name" style={{ borderRadius: 12 }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="lastName" rules={[{ required: true, message: 'Last name required' }]}>
                        <Input placeholder="Last Name" style={{ borderRadius: 12 }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
                    <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} placeholder="Email Address" style={{ borderRadius: 12 }} />
                  </Form.Item>

                  <Form.Item name="mobile" rules={[{ required: true, message: 'Mobile number required' }]}>
                    <Input
                      addonBefore={
                        <Select value={countryIso} onChange={(val) => { setCountryIso(val); form.setFieldsValue({ mobile: '' }); }} style={{ width: 100 }}>
                          {countryOptions.map((item) => (
                            <Option key={item.iso} value={item.iso} label={`+${item.code}`}>
                              {item.name} (+{item.code})
                            </Option>
                          ))}
                        </Select>
                      }
                      prefix={<MobileOutlined style={{ color: '#bfbfbf' }} />}
                      placeholder="Mobile Number"
                      maxLength={PHONE_LENGTH_RULES[countryIso] || 15}
                      style={{ borderRadius: 12 }}
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item name="dateOfBirth" rules={[{ required: true, message: 'Select DOB' }]}>
                        <DatePicker style={{ width: '100%', borderRadius: 12 }} placeholder="Date of Birth" format="YYYY-MM-DD" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="password" rules={[{ required: true, message: 'Password required' }, { min: 6, message: 'Min 6 chars' }]}>
                        <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Password" style={{ borderRadius: 12 }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 50, borderRadius: 12, fontWeight: 'bold' }}>
                    Create Account
                  </Button>
                </Form>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Text>Already a partner? </Text>
                  <span onClick={() => navigate('/referral-partner/login')} style={{ color: '#03A4F4', fontWeight: 'bold', cursor: 'pointer' }}>
                    Sign In Here
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

export default ReferralPartnerRegister;