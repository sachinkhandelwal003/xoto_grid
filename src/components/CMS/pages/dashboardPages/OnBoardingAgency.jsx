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
  Divider,
  Modal
} from "antd";
import {
  ArrowLeftOutlined,
  UploadOutlined,
  BankOutlined,
  ContactsOutlined,
  IdcardOutlined,
  WalletOutlined,
  CheckOutlined
} from "@ant-design/icons";

import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Country, State, City } from "country-state-city";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

const BRAND_PURPLE = "#5C039B";

// Base64 converter for Image Preview
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const AddAgency = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // --- PREVIEW MODAL STATE ---
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // ✅ LOCATION STATES
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [opCitiesList, setOpCitiesList] = useState([]);

  // 🔥 BULLETPROOF UPLOAD STATES
  const [urls, setUrls] = useState({
    logo: "",
    profile_photo: "",
    trade_license: "",
    rera_license: "",
    letter_of_authority: ""
  });
  const [uploading, setUploading] = useState({
    logo: false,
    profile_photo: false,
    trade_license: false,
    rera_license: false,
    letter_of_authority: false
  });

  // --- COUNTRY OPTIONS LOGIC WITH FLAGS ---
  const countryOptions = useMemo(() => {
    const priorityIsoCodes = ["AE", "IN", "SA", "US", "GB", "AU"];
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
  }, []);

  // Watch fields for cascading dropdowns
  const addressCountry = Form.useWatch("address_country", form);
  const addressState = Form.useWatch("address_state", form);
  const operatingCountry = Form.useWatch("operating_country", form);

  useEffect(() => {
    if (addressCountry) {
      setStatesList(State.getStatesOfCountry(addressCountry));
    } else {
      setStatesList([]);
      setCitiesList([]);
    }
  }, [addressCountry]);

  useEffect(() => {
    if (addressCountry && addressState) {
      setCitiesList(City.getCitiesOfState(addressCountry, addressState));
    } else {
      setCitiesList([]);
    }
  }, [addressCountry, addressState]);

  useEffect(() => {
    if (operatingCountry) {
      setOpCitiesList(City.getCitiesOfCountry(operatingCountry));
    } else {
      setOpCitiesList([]);
    }
  }, [operatingCountry]);

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
      let uploadedUrl = "";
      if (response?.data?.file?.url) uploadedUrl = response.data.file.url;
      else if (response?.file?.url) uploadedUrl = response.file.url;
      else if (response?.data?.url) uploadedUrl = response.data.url;
      else if (response?.url) uploadedUrl = response.url;
      else if (response?.data?.fileUrl) uploadedUrl = response.data.fileUrl;
      else if (typeof response?.data === "string") uploadedUrl = response.data;

     

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
  setLoading(true);

  // ✅ Validate trade license upload
  if (!urls.trade_license) {
    message.error('Please upload Trade License before submitting.');
    setLoading(false);
    return;
  }

  try {
    const countryCode = `+${values.country_code}`;
    const fullPhone = `${countryCode}${values.phone}`;

    const payload = {
      // ── Core ──────────────────────────────
      companyName:              values.agency_name,
      primaryContactName:       values.primaryContactName,
      primaryContactEmail:      values.email,
      primaryContactPhone:      fullPhone,
      reraRegistrationNumber:   values.reraRegistrationNumber,

      // ── Subscription ──────────────────────
      subscriptionTier:         values.subscriptionTier || 'basic',
      presentationQuota:        values.presentationQuota || 100,

      // ── Documents & Media ─────────────────
      tradeLicenceUrl:          urls.trade_license,
      reraLicenceUrl:           urls.rera_license,
      letterOfAuthorityUrl:     urls.letter_of_authority,
      logo:                     urls.logo,
      profilePhoto:             urls.profile_photo,

      // ── Address ───────────────────────────
      address: {
        country:     values.address_country,
        state:       values.address_state,
        city:        values.address_city,
        zipCode:     values.zip_code     || '',
        addressLine: values.address_line || '',
      },

      // ── Operating Location ────────────────
      operatingLocation: {
        country: values.operating_country,
        city:    values.operating_city,
      },
    };

    console.log('🚀 Payload:', payload);

    const response = await apiService.post('/agency/admin/create-agency', payload);

    message.success(response?.data?.message || 'Agency created successfully!');
    form.resetFields();
    setUrls({
      logo:                '',
      profile_photo:       '',
      trade_license:       '',
      rera_license:        '',
      letter_of_authority: '',
    });
    navigate('/dashboard/admin/agency-list');
  } catch (error) {
    console.error(error);
    message.error(error?.response?.data?.message || 'Failed to create agency.');
  } finally {
    setLoading(false);
  }
};

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf("/") + 1));
  };

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      {/* HEADER SECTION */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{
            border: "none",
            background: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            borderRadius: "8px",
          }}
        />
        <div>
          <Title level={3} style={{ margin: 0, color: "#1f2937" }}>
            Onboard New Partner
          </Title>
          <Text type="secondary">Fill in the details to register a new real estate agency.</Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          country_code: "971",
          operating_country: "AE",
          address_country: "AE",
          subscriptionTier: "basic",
          presentationQuota: 100,
        }}
      >
        <Row gutter={[24, 24]}>
          {/* LEFT COLUMN - MAIN DETAILS */}
          <Col xs={24} lg={16}>
            {/* 1. AGENCY & ACCOUNT INFO */}
            <Card
              title={
                <Space>
                  <BankOutlined style={{ color: BRAND_PURPLE }} /> Agency & Account Info
                </Space>
              }
              bordered={false}
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                marginBottom: "24px",
              }}
            >
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    name="agency_name"
                    label="Agency Name"
                    rules={[{ required: true, message: "Please enter agency name" }]}
                  >
                    <Input placeholder="e.g. Nexus Real Estate" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>

                {/* NEW REQUIRED FIELDS */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="primaryContactName"
                    label="Primary Contact Name"
                    rules={[{ required: true, message: "Please enter contact name" }]}
                  >
                    <Input placeholder="Full name" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="reraRegistrationNumber"
                    label="RERA Registration Number"
                    rules={[{ required: true, message: "Please enter RERA number" }]}
                  >
                    <Input placeholder="e.g. RERA12345" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Login Email"
                    rules={[{ required: true, type: "email" }]}
                  >
                    <Input placeholder="agency@xoto.com" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                {/* Subscription Tier */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="subscriptionTier"
                    label="Subscription Tier"
                    initialValue="basic"
                  >
                    <Select size="large" style={{ borderRadius: "8px" }}>
                      <Option value="basic">Basic</Option>
                      <Option value="standard">Standard</Option>
                      <Option value="premium">Premium</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="presentationQuota"
                    label="Presentation Quota"
                  >
                    <InputNumber min={0} size="large" style={{ width: "100%", borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 2. CONTACT & OPERATING LOCATION */}
            <Card
              title={
                <Space>
                  <ContactsOutlined style={{ color: BRAND_PURPLE }} /> Contact & Operating Location
                </Space>
              }
              bordered={false}
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                marginBottom: "24px",
              }}
            >
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item label="Mobile Number" style={{ marginBottom: 0 }} required>
                    <Space.Compact style={{ width: "100%" }}>
                      <Form.Item
                        name="country_code"
                        noStyle
                        rules={[{ required: true, message: "Code is required" }]}
                      >
                        <Select
                          showSearch
                          optionFilterProp="children"
                          className="custom-phone-select"
                          style={{ width: "120px", height: "40px" }}
                          popupMatchSelectWidth={300}
                        >
                          {countryOptions.map((item) => (
                            <Option key={item.iso} value={item.code}>
                              <div style={{ display: "flex", alignItems: "center" }}>
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
                              const code = form.getFieldValue("country_code");
                              const fullNumber = `+${code}${value}`;
                              const phoneNumber = parsePhoneNumberFromString(fullNumber);
                              if (phoneNumber && phoneNumber.isValid()) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error("Invalid mobile number for this country"));
                            },
                          },
                        ]}
                      >
                        <Input
                          placeholder="Mobile Number"
                          style={{
                            width: "100%",
                            height: "40px",
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                          }}
                        />
                      </Form.Item>
                    </Space.Compact>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12} style={{ marginTop: "24px" }}>
                  <Form.Item name="operating_country" label="Operating Country" rules={[{ required: true }]}>
                    <Select
                      size="large"
                      showSearch
                      placeholder="Select Country"
                      optionFilterProp="children"
                      style={{ borderRadius: "8px" }}
                      onChange={() => form.setFieldsValue({ operating_city: undefined })}
                    >
                      {Country.getAllCountries().map((c) => (
                        <Option key={c.isoCode} value={c.isoCode}>
                          {c.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} style={{ marginTop: "24px" }}>
                  <Form.Item name="operating_city" label="Operating City" rules={[{ required: true }]}>
                    <Select
                      size="large"
                      showSearch
                      placeholder="Select City"
                      optionFilterProp="children"
                      style={{ borderRadius: "8px" }}
                      disabled={opCitiesList.length === 0}
                    >
                      {opCitiesList.map((city, idx) => (
                        <Option key={`${city.name}-${idx}`} value={city.name}>
                          {city.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 3. COMMISSION STRUCTURE — removed, not in model */}

            {/* 4. HEAD OFFICE ADDRESS */}
            <Card
              title={
                <Space>
                  <BankOutlined style={{ color: BRAND_PURPLE }} /> Head Office Address
                </Space>
              }
              bordered={false}
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="address_country" label="Country" rules={[{ required: true }]}>
                    <Select
                      size="large"
                      showSearch
                      placeholder="Select Country"
                      optionFilterProp="children"
                      onChange={() => {
                        form.setFieldsValue({ address_state: undefined, address_city: undefined });
                      }}
                    >
                      {Country.getAllCountries().map((c) => (
                        <Option key={c.isoCode} value={c.isoCode}>
                          {c.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="address_state" label="State/Emirate" rules={[{ required: true }]}>
                    <Select
                      size="large"
                      showSearch
                      placeholder="Select State"
                      optionFilterProp="children"
                      disabled={statesList.length === 0}
                      onChange={() => form.setFieldsValue({ address_city: undefined })}
                    >
                      {statesList.map((s) => (
                        <Option key={s.isoCode} value={s.isoCode}>
                          {s.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="address_city" label="City" rules={[{ required: true }]}>
                    <Select
                      size="large"
                      showSearch
                      placeholder="Select City"
                      optionFilterProp="children"
                      disabled={citiesList.length === 0}
                    >
                      {citiesList.map((city, idx) => (
                        <Option key={`${city.name}-${idx}`} value={city.name}>
                          {city.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="zip_code" label="Zip / Postal Code">
                    <Input size="large" placeholder="e.g. 00000" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="address_line" label="Street Address" rules={[{ required: true }]}>
                <Input.TextArea placeholder="Office 123, Business Bay..." rows={2} style={{ borderRadius: "8px" }} />
              </Form.Item>
            </Card>
          </Col>

          {/* RIGHT COLUMN - MEDIA & DOCS */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <IdcardOutlined style={{ color: BRAND_PURPLE }} /> Media & Documents
                </Space>
              }
              bordered={false}
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                marginBottom: "24px",
              }}
            >
              <Form.Item label="Agency Logo">
                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => handleInstantUpload(file, "logo")}
                  onPreview={handlePreview}
                >
                  <Button
                    icon={urls.logo ? <CheckOutlined /> : <UploadOutlined />}
                    block
                    style={{
                      borderRadius: "8px",
                      height: 40,
                      borderColor: urls.logo ? "#52c41a" : "#d9d9d9",
                      color: urls.logo ? "#52c41a" : "inherit",
                    }}
                    loading={uploading.logo}
                  >
                    {urls.logo ? "Logo Uploaded" : "Upload Logo"}
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item label="Profile Photo">
                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => handleInstantUpload(file, "profile_photo")}
                  onPreview={handlePreview}
                >
                  <Button
                    icon={urls.profile_photo ? <CheckOutlined /> : <UploadOutlined />}
                    block
                    style={{
                      borderRadius: "8px",
                      height: 40,
                      borderColor: urls.profile_photo ? "#52c41a" : "#d9d9d9",
                      color: urls.profile_photo ? "#52c41a" : "inherit",
                    }}
                    loading={uploading.profile_photo}
                  >
                    {urls.profile_photo ? "Photo Uploaded" : "Upload Photo"}
                  </Button>
                </Upload>
              </Form.Item>

              <Divider style={{ margin: "16px 0" }} />
              <Text strong style={{ display: "block", marginBottom: "16px" }}>
                Legal Documents
              </Text>

              <Form.Item label="Trade License" required>
                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => handleInstantUpload(file, "trade_license")}
                  onPreview={handlePreview}
                >
                  <Button
                    icon={urls.trade_license ? <CheckOutlined /> : <UploadOutlined />}
                    block
                    style={{
                      borderRadius: "8px",
                      height: 40,
                      borderColor: urls.trade_license ? "#52c41a" : "#d9d9d9",
                      color: urls.trade_license ? "#52c41a" : "inherit",
                    }}
                    loading={uploading.trade_license}
                  >
                    {urls.trade_license ? "Uploaded" : "Trade License"}
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item label="RERA License">
                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => handleInstantUpload(file, "rera_license")}
                  onPreview={handlePreview}
                >
                  <Button
                    icon={urls.rera_license ? <CheckOutlined /> : <UploadOutlined />}
                    block
                    style={{
                      borderRadius: "8px",
                      height: 40,
                      borderColor: urls.rera_license ? "#52c41a" : "#d9d9d9",
                      color: urls.rera_license ? "#52c41a" : "inherit",
                    }}
                    loading={uploading.rera_license}
                  >
                    {urls.rera_license ? "Uploaded" : "RERA License"}
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item label="Letter of Authority" style={{ marginBottom: "0" }}>
                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => handleInstantUpload(file, "letter_of_authority")}
                  onPreview={handlePreview}
                >
                  <Button
                    icon={urls.letter_of_authority ? <CheckOutlined /> : <UploadOutlined />}
                    block
                    style={{
                      borderRadius: "8px",
                      height: 40,
                      borderColor: urls.letter_of_authority ? "#52c41a" : "#d9d9d9",
                      color: urls.letter_of_authority ? "#52c41a" : "inherit",
                    }}
                    loading={uploading.letter_of_authority}
                  >
                    {urls.letter_of_authority ? "Uploaded" : "Letter of Authority"}
                  </Button>
                </Upload>
              </Form.Item>
            </Card>
          </Col>
        </Row>

        {/* BOTTOM ACTION BAR */}
        <div
          style={{
            marginTop: "24px",
            padding: "16px 24px",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.02)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
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
              padding: "0 32px",
            }}
          >
            {loading ? "Creating…" : "Create Agency"}
          </Button>
        </div>
      </Form>

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
        style={{ padding: "16px", textAlign: "center" }}
      >
        <img
          alt="Preview"
          style={{
            maxWidth: "100%",
            maxHeight: "70vh",
            objectFit: "contain",
            borderRadius: "8px",
          }}
          src={previewImage}
        />
      </Modal>

      <style jsx global>{`
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

export default AddAgency;