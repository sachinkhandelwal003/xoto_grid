import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form, Input, Button, Card, Row, Col, Typography, Upload, Space,
  message, Select, InputNumber, Divider, Modal, Spin
} from "antd";
import {
  ArrowLeftOutlined, UploadOutlined, BankOutlined,
  EnvironmentOutlined, SafetyCertificateOutlined,
  FileTextOutlined, FileDoneOutlined
} from "@ant-design/icons";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Country, City } from "country-state-city";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const BRAND_PURPLE = "#5C039B";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const DeveloperForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Location states
  const [citiesList, setCitiesList] = useState([]);
  const selectedCountry = Form.useWatch("country", form);

  // Preview modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // Country options
  const countryOptions = useMemo(() => {
    const priorityIsoCodes = ["AE", "IN", "SA", "US", "GB", "AU"];
    return Country.getAllCountries()
      .map((c) => ({ name: c.name, code: c.phonecode, iso: c.isoCode }))
      .sort((a, b) => {
        const aPriority = priorityIsoCodes.includes(a.iso);
        const bPriority = priorityIsoCodes.includes(b.iso);
        if (aPriority && !bPriority) return -1;
        if (!aPriority && bPriority) return 1;
        return a.name.localeCompare(b.name);
      });
  }, []);

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

  // Fetch developer data if editing
  useEffect(() => {
    if (isEditMode) {
      const fetchDeveloper = async () => {
        setFetching(true);
        try {
          const res = await apiService.get(`/developer/get-developer-by-id?id=${id}`);
          const dev = res?.data?.data || res?.data || res;
          if (dev) {
            form.setFieldsValue({
              name: dev.name || dev.companyName,
              companyName: dev.companyName || dev.name,
              email: dev.email,
              phone: dev.phone_number?.replace(dev.country_code, '') || '',
              country_code: dev.country_code?.replace('+', '') || '971',
              websiteUrl: dev.websiteUrl,
              description: dev.description,
              country: dev.country,
              city: dev.city,
              address: dev.address,
              reraNumber: dev.reraNumber,
              developerLicenseNumber: dev.developerLicenseNumber,
              dldNumber: dev.dldNumber,
              dldRegistrationNumber: dev.dldRegistrationNumber,
              operatingYears: dev.operatingYears,
              authorizedPersonName: dev.authorizedPersonName || dev.primaryContactName,
              primaryContactName: dev.primaryContactName,
              officialEmailId: dev.officialEmailId,
            });

            if (dev.logo) {
              form.setFieldsValue({
                logoUpload: [{ uid: '-1', name: 'logo', status: 'done', url: dev.logo }]
              });
            }
            if (dev.kycDocuments?.length) {
              const tradeLicense = dev.kycDocuments.find(d => d.type === 'trade_license');
              const emiratesId = dev.kycDocuments.find(d => d.type === 'emirates_id');
              const passport = dev.kycDocuments.find(d => d.type === 'passport');
              if (tradeLicense) form.setFieldsValue({ tradeLicense: [{ uid: '-2', name: tradeLicense.name, status: 'done', url: tradeLicense.url }] });
              if (emiratesId) form.setFieldsValue({ emiratesId: [{ uid: '-3', name: emiratesId.name, status: 'done', url: emiratesId.url }] });
              if (passport) form.setFieldsValue({ passport: [{ uid: '-4', name: passport.name, status: 'done', url: passport.url }] });
            }
            if (dev.agreementDocuments?.length) {
              const mainAgreement = dev.agreementDocuments.find(d => d.type === 'main_agreement');
              const commissionSchedule = dev.agreementDocuments.find(d => d.type === 'commission_schedule');
              const addendum = dev.agreementDocuments.find(d => d.type === 'addendum');
              const other = dev.agreementDocuments.find(d => d.type === 'other');
              if (mainAgreement) form.setFieldsValue({ main_agreement: [{ uid: '-5', name: mainAgreement.name, status: 'done', url: mainAgreement.url }] });
              if (commissionSchedule) form.setFieldsValue({ commission_schedule: [{ uid: '-6', name: commissionSchedule.name, status: 'done', url: commissionSchedule.url }] });
              if (addendum) form.setFieldsValue({ addendum: [{ uid: '-7', name: addendum.name, status: 'done', url: addendum.url }] });
              if (other) form.setFieldsValue({ other_agreement: [{ uid: '-8', name: other.name, status: 'done', url: other.url }] });
            }
          }
        } catch (err) {
          message.error("Failed to load developer details");
        } finally {
          setFetching(false);
        }
      };
      fetchDeveloper();
    }
  }, [id, isEditMode, form]);

  // File upload handler
// ✅ Fix 1 — customUploadRequest: pass name in onSuccess
const customUploadRequest = async ({ file, onSuccess, onError, onProgress }) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await apiService.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        onProgress({ percent: Math.floor((event.loaded / event.total) * 100) });
      },
    });

  console.log("🔍 UPLOAD RESPONSE:", response);

const uploadedUrl =
    response?.url ||
    response?.fileUrl ||
    response?.data?.url ||
    response?.file?.url ||
    response?.file?.location ||
    response?.location ||
    "";

if (!uploadedUrl) {
    console.log("❌ URL not found:", response?.data);

    message.error(
      "Upload succeeded but URL could not be read"
    );

    onError(new Error("No URL in response"));

    return;
}

message.success(`${file.name} uploaded`);

onSuccess(
{
   url: uploadedUrl,
   name: file.name
},
file);
  } catch (error) {
    message.error(`${file.name} upload failed`);
    onError(error);
  }
};

// ✅ Fix 2 — getUploadedDoc: handle both new uploads AND pre-existing files
const getUploadedDoc = (fileList) => {
  if (!fileList || fileList.length === 0) return null;
  const file = fileList[0];
  // New upload → file.response.url | Edit mode pre-existing → file.url
  const url  = file.response?.url  || file.url  || '';
  const name = file.response?.name || file.name || '';
  return url ? { url, name } : null;
};

// getUploadedUrl stays the same — it calls getUploadedDoc internally
const getUploadedUrl = (fileList) => getUploadedDoc(fileList)?.url || '';

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const fullPhoneNumber = `+${values.country_code}${values.phone}`;
      const extractedCountryCode = `+${values.country_code}`;

      const kycDocuments = [];
      const tradeLicense = getUploadedDoc(values.tradeLicense);
      if (tradeLicense) kycDocuments.push({ type: 'trade_license', name: tradeLicense.name, url: tradeLicense.url });
      const emiratesId = getUploadedDoc(values.emiratesId);
      if (emiratesId) kycDocuments.push({ type: 'emirates_id', name: emiratesId.name, url: emiratesId.url });
      const passport = getUploadedDoc(values.passport);
      if (passport) kycDocuments.push({ type: 'passport', name: passport.name, url: passport.url });

      const agreementDocuments = [];
      const mainAgreement = getUploadedDoc(values.main_agreement);
      if (mainAgreement) agreementDocuments.push({ type: 'main_agreement', name: mainAgreement.name, url: mainAgreement.url, uploadedBy: 'admin' });
      const commissionSchedule = getUploadedDoc(values.commission_schedule);
      if (commissionSchedule) agreementDocuments.push({ type: 'commission_schedule', name: commissionSchedule.name, url: commissionSchedule.url, uploadedBy: 'admin' });
      const addendum = getUploadedDoc(values.addendum);
      if (addendum) agreementDocuments.push({ type: 'addendum', name: addendum.name, url: addendum.url, uploadedBy: 'admin' });
      const otherAgreement = getUploadedDoc(values.other_agreement);
      if (otherAgreement) agreementDocuments.push({ type: 'other', name: otherAgreement.name, url: otherAgreement.url, uploadedBy: 'admin' });

      const payload = {
        name: values.name || values.companyName,
        companyName: values.companyName || values.name,
        email: values.email,
        password: values.password || undefined,
        country_code: extractedCountryCode,
        phone_number: fullPhoneNumber,
        officialEmailId: values.officialEmailId,
        country: values.country,
        city: values.city,
        address: values.address,
        reraNumber: values.reraNumber,
        developerLicenseNumber: values.developerLicenseNumber,
        dldNumber: values.dldNumber,
        dldRegistrationNumber: values.dldRegistrationNumber,
        operatingYears: values.operatingYears || 0,
        authorizedPersonName: values.authorizedPersonName,
        primaryContactName: values.primaryContactName,
        websiteUrl: values.websiteUrl,
        description: values.description,
        logo: getUploadedUrl(values.logoUpload),
        kycDocuments,
        agreementDocuments,
      };

      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      if (isEditMode) {
        payload._id = id;
        await apiService.post("/developer/edit-developer", payload);
        message.success("Developer updated successfully");
      } else {
        await apiService.post("/developer/create-developer", payload);
        message.success("Developer created successfully");
        form.resetFields(); // clear form for next entry
      }
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || "Failed to save developer");
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) file.preview = await getBase64(file.originFileObj);
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf("/") + 1));
  };

  if (fetching) return <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>;

  return (
 <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
  <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}
      style={{ border: "none", background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", borderRadius: "8px" }} />
    <div>
      <Title level={3} style={{ margin: 0, color: "#1f2937" }}>
        {isEditMode ? "Edit Developer" : "Onboard New Developer"}
      </Title>
      <Text type="secondary">
        {isEditMode ? "Update developer information and documents" : "Fill in the details to register a new property developer."}
      </Text>
    </div>
  </div>

  <Form
    form={form}
    layout="vertical"
    onFinish={onFinish}
    initialValues={{ country: "United Arab Emirates", country_code: "971" }}
    scrollToFirstError
  >
    <Row gutter={[24, 24]}>
      {/* Left column */}
      <Col xs={24} lg={16}>
        <Card 
          title={<Space><BankOutlined style={{ color: BRAND_PURPLE }} /> Basic Company Info</Space>}
          bordered={false}
          style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item 
                name="name" 
                label="Company Name"
                rules={[{ required: true, message: "Please enter company name" }]}
              >
                <Input placeholder="e.g. Emaar Properties" size="large" style={{ borderRadius: "8px" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="websiteUrl" label="Website URL">
                <Input placeholder="https://www.example.com" size="large" style={{ borderRadius: "8px" }} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="description" label="Company Description">
                <TextArea rows={4} placeholder="Brief description about the developer..." style={{ borderRadius: "8px" }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card 
          title={<Space><SafetyCertificateOutlined style={{ color: BRAND_PURPLE }} /> Account Credentials</Space>}
          bordered={false}
          style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item 
                name="email" 
                label="Login Email"
                rules={[{ required: true, type: 'email', message: "Valid email required" }]}
              >
                <Input placeholder="developer@xoto.com" size="large" style={{ borderRadius: "8px" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item 
                name="officialEmailId" 
                label="Official Contact Email (Public)"
              >
                <Input placeholder="info@developer.com" size="large" style={{ borderRadius: "8px" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Mobile Number" style={{ marginBottom: 0 }} required>
                <Space.Compact style={{ width: '100%' }}>
                  <Form.Item name="country_code" noStyle rules={[{ required: true, message: 'Code is required' }]}>
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
                    rules={[
                      { required: true, message: "Phone number is required" },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          const code = form.getFieldValue('country_code');
                          const fullNumber = `+${code}${value}`;
                          const phoneNumber = parsePhoneNumberFromString(fullNumber);
                          if (phoneNumber && phoneNumber.isValid()) return Promise.resolve();
                          return Promise.reject(new Error("Invalid mobile number"));
                        }
                      }
                    ]}
                  >
                    <Input 
                      placeholder="Mobile Number"
                      style={{ width: '100%', height: '40px', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        form.setFieldsValue({ phone: val });
                      }} 
                    />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card 
          title={<Space><EnvironmentOutlined style={{ color: BRAND_PURPLE }} /> Location Details</Space>}
          bordered={false}
          style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item 
                name="country" 
                label="Country" 
                rules={[{ required: true, message: "Country is required" }]}
              >
                <Select 
                  size="large" 
                  showSearch 
                  placeholder="Select Country" 
                  optionFilterProp="children"
                  style={{ borderRadius: "8px" }}
                  onChange={() => form.setFieldsValue({ city: undefined })}
                >
                  {Country.getAllCountries().map((c) => (
                    <Option key={c.isoCode} value={c.name}>{c.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item 
                name="city" 
                label="City" 
                rules={[{ required: true, message: "City is required" }]}
              >
                <Select 
                  size="large" 
                  showSearch 
                  placeholder="Select City" 
                  optionFilterProp="children"
                  style={{ borderRadius: "8px" }} 
                  disabled={citiesList.length === 0}
                >
                  {citiesList.map((city, idx) => (
                    <Option key={`${city.name}-${idx}`} value={city.name}>{city.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="address" label="Full Address">
                <Input placeholder="Building, Street, Area..." size="large" style={{ borderRadius: "8px" }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>

      {/* Right column */}
      <Col xs={24} lg={8}>
        <Card 
          title={<Space><FileTextOutlined style={{ color: BRAND_PURPLE }} /> Legal Details</Space>}
          bordered={false}
          style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
        >
          <Form.Item
            name="reraNumber"
            label="RERA Number"
            rules={[{ required: true, message: "RERA Number is required" }]}
          >
            <Input placeholder="Enter RERA registration number" size="large" style={{ borderRadius: "8px" }} />
          </Form.Item>
          
          <Form.Item
            name="developerLicenseNumber"
            label="Developer License Number"
            rules={[{ required: true, message: "Developer License Number is required" }]}
          >
            <Input placeholder="License number" size="large" style={{ borderRadius: "8px" }} />
          </Form.Item>
          
          <Form.Item name="dldNumber" label="DLD Number">
            <Input placeholder="Dubai Land Department number" size="large" style={{ borderRadius: "8px" }} />
          </Form.Item>
          
          <Form.Item name="dldRegistrationNumber" label="DLD Registration Number">
            <Input placeholder="Registration number" size="large" style={{ borderRadius: "8px" }} />
          </Form.Item>
          
          <Form.Item
            name="authorizedPersonName"
            label="Authorized Person Name"
            rules={[{ required: true, message: "Authorized Person Name is required" }]}
          >
            <Input placeholder="Name of the signatory" size="large" style={{ borderRadius: "8px" }} />
          </Form.Item>
          
          <Form.Item
            name="primaryContactName"
            label="Primary Contact Name"
            rules={[{ required: true, message: "Primary Contact Name is required" }]}
          >
            <Input placeholder="Main contact person" size="large" style={{ borderRadius: "8px" }} />
          </Form.Item>
          
          <Form.Item name="operatingYears" label="Years of Operation">
            <InputNumber 
              min={0} 
              placeholder="e.g. 10" 
              size="large" 
              style={{ width: "100%", borderRadius: "8px" }} 
            />
          </Form.Item>
        </Card>

        <Card 
          title="Media & KYC Documents" 
          bordered={false}
          style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
        >
          <Form.Item name="logoUpload" label="Company Logo" valuePropName="fileList" getValueFromEvent={normFile}>
            <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
              <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Upload Logo</Button>
            </Upload>
          </Form.Item>
          
          <Divider style={{ margin: "16px 0" }} />
          
          <Text strong style={{ display: "block", marginBottom: "8px" }}>KYC Documents</Text>
          
          <Form.Item name="tradeLicense" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "12px" }}>
            <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
              <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Trade License</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item name="emiratesId" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "12px" }}>
            <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
              <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Emirates ID</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item name="passport" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "0" }}>
            <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
              <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Passport Copy</Button>
            </Upload>
          </Form.Item>
        </Card>

        <Card 
          title={<Space><FileDoneOutlined style={{ color: BRAND_PURPLE }} /> Agreement Documents</Space>}
          bordered={false}
          style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <Form.Item name="main_agreement" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "12px" }}>
            <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
              <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Main Agreement</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item name="commission_schedule" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "12px" }}>
            <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
              <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Commission Schedule</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item name="addendum" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "12px" }}>
            <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
              <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Addendum (If any)</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item name="other_agreement" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "0" }}>
            <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
              <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Other Documents</Button>
            </Upload>
          </Form.Item>
        </Card>
      </Col>
    </Row>

    <div style={{
      marginTop: "24px", 
      padding: "16px 24px", 
      background: "#fff",
      borderRadius: "12px", 
      boxShadow: "0 -2px 10px rgba(0,0,0,0.02)",
      display: "flex", 
      justifyContent: "flex-end", 
      gap: "12px",
      position: "sticky",
      bottom: 0,
      zIndex: 10
    }}>
      <Button size="large" onClick={() => navigate(-1)} style={{ borderRadius: "8px", fontWeight: "600" }}>
        Cancel
      </Button>
      <Button 
        type="primary" 
        htmlType="submit" 
        size="large" 
        loading={loading}
        style={{ background: BRAND_PURPLE, borderColor: BRAND_PURPLE, borderRadius: "8px", fontWeight: "600", padding: "0 32px" }}
      >
        {isEditMode ? "Update Developer" : "Register Developer"}
      </Button>
    </div>
  </Form>

  <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)} centered>
    <img alt="Preview" style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: "8px" }} src={previewImage} />
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

export default DeveloperForm;