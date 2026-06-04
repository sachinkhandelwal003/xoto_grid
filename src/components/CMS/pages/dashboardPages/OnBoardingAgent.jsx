import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Upload,
  Space,
  message,
  Select,
  InputNumber,
  Divider
} from "antd";
import {
  ArrowLeftOutlined,
  UploadOutlined,
  UserOutlined,
  ContactsOutlined,
  IdcardOutlined,
  SolutionOutlined,
  CheckOutlined
} from "@ant-design/icons";

// ✅ Imported required packages for Country/City and Phone Validation
import { Country, City } from "country-state-city";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// ✅ Import apiService
import { apiService } from "../../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

const BRAND_PURPLE = "#5C039B";

const AddAgent = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // --- LOCATION STATES ---
  const [citiesList, setCitiesList] = useState([]);
  const selectedCountry = Form.useWatch("country", form);

  // 🔥 INSTANT UPLOAD STATES
  const [urls, setUrls] = useState({ profile: "", idProof: "", rera: "" });
  const [uploading, setUploading] = useState({ profile: false, idProof: false, rera: false });

  // --- COUNTRY OPTIONS LOGIC ---
  const countryOptions = useMemo(() => {
    const priorityIsoCodes = ["AE", "IN", "SA", "US", "GB", "AU"]; 
    return Country.getAllCountries().map((country) => ({
      name: country.name, code: country.phonecode, iso: country.isoCode,
    })).sort((a, b) => {
      const aPriority = priorityIsoCodes.includes(a.iso);
      const bPriority = priorityIsoCodes.includes(b.iso);
      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  // ==========================================
  // ✅ DYNAMIC CITIES BASED ON COUNTRY
  // ==========================================
  useEffect(() => {
    if (selectedCountry) {
      const countryObj = Country.getAllCountries().find(c => c.name === selectedCountry);
      if (countryObj) {
        setCitiesList(City.getCitiesOfCountry(countryObj.isoCode));
      } else {
        setCitiesList([]);
      }
    } else {
      setCitiesList([]);
    }
  }, [selectedCountry]);

// ==========================================
  // 🔥 THE MAGIC FIX: BULLETPROOF INSTANT UPLOAD 
  // ==========================================
  const handleInstantUpload = async (file, type) => {
    setUploading((prev) => ({ ...prev, [type]: true }));
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiService.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      

      // 🔥 BULLETPROOF URL EXTRACTION 🔥
      // Ye har possible format se URL nikal lega chahe apiService kuch bhi return kare
      const uploadedUrl = 
        response?.data?.file?.url || 
        response?.file?.url ||        // <-- Agar interceptor direct data bhej raha hai
        response?.data?.url || 
        response?.url || 
        response?.data?.fileUrl ||
        "";

     

      if (uploadedUrl) {
        setUrls((prev) => ({ ...prev, [type]: uploadedUrl }));
        message.success(`${type} uploaded successfully!`);
      } else {
        message.error("Upload failed: no URL returned. Check console.");
      }
    } catch (error) {
      console.error(`❌ Upload Error for ${type}:`, error);
      message.error(`Failed to upload ${type}.`);
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }

    // ⛔ This stops Ant Design's default upload tracking
    return false;
  };

  // ==========================================
  // ✅ EXACT JSON PAYLOAD SUBMIT HANDLER
  // ==========================================
  const onFinish = async (values) => {
    // Check if required images are uploaded manually
    if (!urls.profile) return message.error("Please upload Profile Photo");
    if (!urls.idProof) return message.error("Please upload ID Proof");

    setLoading(true);
    
    try {
      // ✅ Formats exactly as your JSON requires
      const fullPhoneNumber = `+${values.country_code}${values.phone}`;
      const extractedCountryCode = `+${values.country_code}`;

      // 🔥 EXACT JSON STRUCTURE 🔥
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
        phone_number: fullPhoneNumber, 
        country_code: extractedCountryCode, 
        operating_city: values.operating_city,
        specialization: values.specialization,
        country: values.country,
        experience_years: Number(values.experience_years) || 0,
        rera_number: values.rera_number || "",
        profile_photo: urls.profile,
        id_proof: urls.idProof,
        rera_certificate: urls.rera || ""
      };

      

      const response = await apiService.post("/agent/agent-signup", payload);
      
      message.success(response?.data?.message || "Agent onboarded successfully!");
      form.resetFields();
      setUrls({ profile: "", idProof: "", rera: "" });
      
      // 🔥 SUCCESS REDIRECT
      navigate("/dashboard/admin/agent-list");
      
    } catch (error) {
      console.error("Agent Onboarding Error:", error);
      message.error(error?.response?.data?.message || "Failed to onboard agent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ border: "none", background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", borderRadius: "8px" }}
        />
        <div>
          <Title level={3} style={{ margin: 0, color: "#1f2937" }}>Onboard New Agent</Title>
          <Text type="secondary">Fill in the details to register a new real estate agent.</Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ country: "United Arab Emirates", country_code: "971" }}
      >
        <Row gutter={[24, 24]}>
          
          {/* ========================================== */}
          {/* LEFT COLUMN - MAIN DETAILS                 */}
          {/* ========================================== */}
          <Col xs={24} lg={16}>
            
            {/* 1. PERSONAL & ACCOUNT INFO */}
            <Card 
              title={<Space><UserOutlined style={{ color: BRAND_PURPLE }}/> Personal & Account Info</Space>} 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Please enter first name" }]}>
                    <Input placeholder="e.g. John" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Please enter last name" }]}>
                    <Input placeholder="e.g. Doe" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="email" label="Login Email" rules={[{ required: true, type: 'email' }]}>
                    <Input placeholder="agent@xoto.com" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="password" label=" Password" rules={[{ required: true, min: 6 }]}>
                    <Input.Password placeholder="Enter secure password" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 2. CONTACT & LOCATION */}
            <Card 
              title={<Space><ContactsOutlined style={{ color: BRAND_PURPLE }}/> Contact & Location</Space>} 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
            >
              <Row gutter={16}>
                {/* ✅ STRICT VALIDATED PHONE INPUT WITH COUNTRY DROPDOWN */}
                <Col xs={24} md={12}>
                  <Form.Item label="Phone Number" style={{ marginBottom: 0 }} required>
                    <Space.Compact style={{ width: '100%' }}>
                      <Form.Item
                        name="country_code"
                        noStyle
                        rules={[{ required: true, message: 'Code is required' }]}
                      >
                        <Select
                          showSearch
                          optionFilterProp="children"
                          className="custom-phone-select"
                          style={{ width: '120px', height: '40px' }}
                          popupMatchSelectWidth={300}
                        >
                          {countryOptions.map((item) => (
                            <Option key={item.iso} value={item.code}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img 
                                  src={`https://flagcdn.com/w20/${item.iso.toLowerCase()}.png`} 
                                  width="20" 
                                  alt={item.name} 
                                  style={{ marginRight: 8, borderRadius: 2 }} 
                                />
                                <span>+{item.code}</span>
                              </div>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        name="phone"
                        noStyle
                        getValueFromEvent={(e) => e.target.value.replace(/\D/g, "")}
                        rules={[
                          { required: true, message: "Phone number is required" },
                          {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve();
                              const code = form.getFieldValue('country_code');
                              const fullNumber = `+${code}${value}`;
                              const phoneNumber = parsePhoneNumberFromString(fullNumber);
                              if (phoneNumber && phoneNumber.isValid()) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error("Invalid mobile number"));
                            }
                          }
                        ]}
                      >
                        <Input 
                          placeholder="Mobile Number" 
                          style={{ width: '100%', height: '40px', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} 
                        />
                      </Form.Item>
                    </Space.Compact>
                  </Form.Item>
                </Col>
                
                {/* ✅ WORLDWIDE COUNTRY DROPDOWN */}
                <Col xs={24} md={12}>
                  <Form.Item name="country" label="Country" rules={[{ required: true, message: "Select a country" }]}>
                    <Select 
                      size="large" 
                      showSearch 
                      placeholder="Select Country" 
                      optionFilterProp="children"
                      style={{ borderRadius: "8px" }}
                      onChange={() => form.setFieldsValue({ operating_city: undefined })}
                    >
                      {Country.getAllCountries().map((c) => (
                        <Option key={c.isoCode} value={c.name}>{c.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                {/* ✅ CITIES DROPDOWN BASED ON COUNTRY */}
                <Col xs={24} md={12}>
                  <Form.Item name="operating_city" label="Operating City" rules={[{ required: true, message: "Select a city" }]}>
                    <Select 
                      size="large" 
                      showSearch 
                      placeholder="Select City" 
                      optionFilterProp="children"
                      style={{ borderRadius: "8px" }}
                      disabled={citiesList.length === 0}
                    >
                      {citiesList.map((city, index) => (
                        <Option key={`${city.name}-${index}`} value={city.name}>{city.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 3. PROFESSIONAL DETAILS */}
            <Card 
              title={<Space><SolutionOutlined style={{ color: BRAND_PURPLE }}/> Professional Details</Space>} 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="specialization" label="Specialization" rules={[{ required: true }]}>
                    <Input placeholder="e.g. Residential Properties, Villas" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="experience_years" label="Experience (Years)" rules={[{ required: true }]}>
                    <InputNumber min={0} placeholder="e.g. 5" size="large" style={{ width: "100%", borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="rera_number" label="RERA Number">
                    <Input placeholder="Enter RERA registration number" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* ========================================== */}
          {/* RIGHT COLUMN - MEDIA & DOCS                */}
          {/* ========================================== */}
          <Col xs={24} lg={8}>
            
            <Card 
              title={<Space><IdcardOutlined style={{ color: BRAND_PURPLE }}/> Media & Documents</Space>} 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
            >
              {/* 🔥 MAGIC UPLOAD BUTTONS */}
              <Form.Item label="Profile Photo" required>
                <Upload showUploadList={false} beforeUpload={(file) => handleInstantUpload(file, 'profile')}>
                  <Button
                    icon={urls.profile ? <CheckOutlined /> : <UploadOutlined />}
                    block
                    style={{ height: 45, borderColor: urls.profile ? '#52c41a' : '#d9d9d9', color: urls.profile ? '#52c41a' : 'inherit' }}
                    loading={uploading.profile}
                  >
                    {urls.profile ? "Uploaded" : "Upload Photo"}
                  </Button>
                </Upload>
                {urls.profile && <div style={{ marginTop: 5, fontSize: 12, color: '#52c41a' }}>Image saved!</div>}
              </Form.Item>

              <Divider style={{ margin: "16px 0" }} />

              <Text strong style={{ display: "block", marginBottom: "8px" }}>KYC & Certifications</Text>
              
              <Form.Item label="ID Proof (Emirates ID/Passport)" style={{ marginBottom: "12px" }} required>
                <Upload showUploadList={false} beforeUpload={(file) => handleInstantUpload(file, 'idProof')}>
                  <Button
                    icon={urls.idProof ? <CheckOutlined /> : <UploadOutlined />}
                    block
                    style={{ height: 45, borderColor: urls.idProof ? '#52c41a' : '#d9d9d9', color: urls.idProof ? '#52c41a' : 'inherit' }}
                    loading={uploading.idProof}
                  >
                    {urls.idProof ? "Uploaded" : "Upload ID Proof"}
                  </Button>
                </Upload>
                {urls.idProof && <div style={{ marginTop: 5, fontSize: 12, color: '#52c41a' }}>ID saved!</div>}
              </Form.Item>

              <Form.Item label="RERA Certificate" style={{ marginBottom: "0" }}>
                <Upload showUploadList={false} beforeUpload={(file) => handleInstantUpload(file, 'rera')}>
                  <Button
                    icon={urls.rera ? <CheckOutlined /> : <UploadOutlined />}
                    block
                    style={{ height: 45, borderColor: urls.rera ? '#52c41a' : '#d9d9d9', color: urls.rera ? '#52c41a' : 'inherit' }}
                    loading={uploading.rera}
                  >
                    {urls.rera ? "Uploaded" : "Upload RERA"}
                  </Button>
                </Upload>
                {urls.rera && <div style={{ marginTop: 5, fontSize: 12, color: '#52c41a' }}>Certificate saved!</div>}
              </Form.Item>
            </Card>

          </Col>
        </Row>

        {/* BOTTOM ACTION BAR */}
        <div style={{
          marginTop: "24px",
          padding: "16px 24px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.02)",
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px"
        }}>
          <Button 
            size="large" 
            onClick={() => navigate(-1)} 
            style={{ borderRadius: "8px", fontWeight: "600" }}
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            size="large" 
            loading={loading}
            style={{ 
              background: BRAND_PURPLE, 
              borderColor: BRAND_PURPLE, 
              borderRadius: "8px", 
              fontWeight: "600",
              padding: "0 32px"
            }}
          >
            {loading ? "Onboarding..." : "Register Agent"}
          </Button>
        </div>
      </Form>

      <style jsx global>{`
        /* Make sure custom phone select matches Ant Design inputs */
        .custom-phone-select .ant-select-selector {
          border-top-left-radius: 8px !important;
          border-bottom-left-radius: 8px !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
        }
        .custom-phone-select .ant-select-selection-item {
          display: flex !important;
          align-items: center !important;
          line-height: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default AddAgent;