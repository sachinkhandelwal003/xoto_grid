// src/components/Vault/AgentOnboard.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form, Input, Button, Card, Row, Col, DatePicker,
  Upload, message, Space, Typography, Divider, Select, Modal, Descriptions
} from "antd";
import {
  DeleteOutlined, CheckOutlined, UploadOutlined, PlusOutlined, EyeOutlined
} from "@ant-design/icons";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import moment from "moment";
import { Country, State, City } from "country-state-city";

// NOTE: Make sure this path is exactly correct for your project folder structure!
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

const BRAND_PURPLE = "#5C039B";

/* -------------------------------------------------------------------------- */
/*  FILE UPLOAD COMPONENT (No more Base64)                                    */
/* -------------------------------------------------------------------------- */
const FileUploadPreview = ({ file, onChange, label }) => {
  const [preview, setPreview] = useState(null);

  // Generate preview URL when file changes
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl); // cleanup
  }, [file]);

  const handleFile = (newFile) => {
    if (!newFile || !newFile.type.startsWith('image/')) {
      message.error('Please upload an image file (JPG, PNG, WEBP)');
      return false;
    }
    onChange(newFile);
    message.success(`${label} selected`);
    return false; // Prevent default auto-upload from AntD
  };

  return (
    <div style={{ width: "100%" }}>
      {file && preview ? (
        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          <img 
            src={preview} 
            alt={label} 
            style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} 
          />
          <Button 
            type="primary" 
            danger 
            shape="circle" 
            icon={<DeleteOutlined />} 
            style={{ position: 'absolute', top: -10, right: -10 }} 
            onClick={() => onChange(null)} 
          />
        </div>
      ) : (
        <Upload.Dragger 
          beforeUpload={handleFile} 
          showUploadList={false} 
          accept="image/jpeg,image/png,image/webp"
          style={{ padding: '16px 0', background: '#fafafa', borderRadius: 8 }}
        >
          <p className="ant-upload-drag-icon"><UploadOutlined style={{ color: BRAND_PURPLE }} /></p>
          <p style={{ margin: '8px 0 0', fontWeight: 500 }}>Upload {label}</p>
          <p style={{ fontSize: 12, color: '#9ca3af' }}>JPG, PNG up to 10MB</p>
        </Upload.Dragger>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  MAIN COMPONENT                                                            */
/* -------------------------------------------------------------------------- */
export default function VaultAgentOnboard() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dependents, setDependents] = useState([]);
  const navigate = useNavigate();

  // Location States
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);

  // Preview State
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Image states (Now storing File objects, NOT Base64)
  const [emiratesFront, setEmiratesFront] = useState(null);
  const [emiratesBack, setEmiratesBack] = useState(null);
  const [passportImage, setPassportImage] = useState(null);
  const [visaImage, setVisaImage] = useState(null);

  // Location Data Fetching
  const countries = useMemo(() => Country.getAllCountries() || [], []);
  const states = useMemo(() => selectedCountry ? State.getStatesOfCountry(selectedCountry) || [] : [], [selectedCountry]);
  const cities = useMemo(() => selectedState && selectedCountry ? City.getCitiesOfState(selectedCountry, selectedState) || [] : [], [selectedCountry, selectedState]);

  const addDependent = () => {
    setDependents([...dependents, { name: "", age: "", relationship: undefined, location: "" }]);
  };
  
  const removeDependent = (index) => {
    const newList = [...dependents];
    newList.splice(index, 1);
    setDependents(newList);
  };

  const validateImages = () => {
    if (!emiratesFront) { message.error("Emirates ID Front Image is required"); return false; }
    if (!emiratesBack) { message.error("Emirates ID Back Image is required"); return false; }
    if (!passportImage) { message.error("Passport Image is required"); return false; }
    if (!visaImage) { message.error("Visa Image is required"); return false; }
    return true;
  };

  const handlePreview = async () => {
    try {
      await form.validateFields();
      if (!validateImages()) return;

      const values = form.getFieldsValue(true);
      const address = values.address || {};
      
      const countryName = address.countryCode ? Country.getCountryByCode(address.countryCode)?.name : "";
      const stateName = address.stateCode && address.countryCode ? State.getStateByCodeAndCountry(address.stateCode, address.countryCode)?.name : "";
      
      setPreviewData({
        ...values,
        displayCountry: countryName || "",
        displayState: stateName || ""
      });
      setPreviewVisible(true);
    } catch (error) {
      message.error("Please fill all required fields correctly before previewing.");
    }
  };

  // Helper function to upload a single file
  const uploadSingleImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file); // Backend me jo multer field name ho (jaise "file", "image"), wo yahan daalein

      // Make API call to /upload
      const res = await apiService.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      // Assume backend returns URL like: { data: { url: "https://..." } }
      // Apne backend ke hisaab se is response key ko change kar lena (e.g., res.data.fileUrl)
      return res.data?.url || res.data?.fileUrl || res.data; 
    } catch (error) {
      console.error("Image upload failed:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      if (!validateImages()) return;

      setLoading(true);
      message.loading({ content: 'Uploading documents...', key: 'uploading' });

      // 1. Upload all 4 images simultaneously to /upload API
      const [frontUrl, backUrl, passportUrl, visaUrl] = await Promise.all([
        uploadSingleImage(emiratesFront),
        uploadSingleImage(emiratesBack),
        uploadSingleImage(passportImage),
        uploadSingleImage(visaImage)
      ]);

      message.success({ content: 'Documents uploaded successfully!', key: 'uploading', duration: 2 });

      // 2. Prepare final payload with returned URLs
      const values = form.getFieldsValue(true);
      const address = values.address || {};
      const emergencyContact = values.emergencyContact || {};
      
      const countryName = address.countryCode ? Country.getCountryByCode(address.countryCode)?.name : "";
      const stateName = address.stateCode && address.countryCode ? State.getStateByCodeAndCountry(address.stateCode, address.countryCode)?.name : "";

      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone_number: values.phone_number,
        password: values.password,
        maritalStatus: values.maritalStatus,
        numberOfDependents: dependents.length,
        nationality: values.nationality,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
        gender: values.gender,
        dependents: dependents.map(d => ({ ...d, age: Number(d.age) || 0 })),
        address: {
          building: address.building || "",
          apartment: address.apartment || "",
          area: address.area || "",
          city: address.city || "", 
          state: stateName || "",
          country: countryName || "",
        },
        emergencyContact: {
          name: emergencyContact.name || "",
          relationship: emergencyContact.relationship || "",
          phone: emergencyContact.phone || "",
        },
        emiratesIdNumber: values.emiratesIdNumber,
        emiratesIdExpiryDate: values.emiratesIdExpiryDate ? values.emiratesIdExpiryDate.toISOString() : null,
        
        // Pass URLs returned from /upload API
        emiratesIdFrontImage: frontUrl,
        emiratesIdBackImage: backUrl,
        passportImage: passportUrl,
        visaImage: visaUrl,
        
        passportNumber: values.passportNumber || "",
        passportExpiryDate: values.passportExpiryDate ? values.passportExpiryDate.toISOString() : null,
        visaNumber: values.visaNumber || "",
        visaExpiryDate: values.visaExpiryDate ? values.visaExpiryDate.toISOString() : null,
        beneficiaryName: values.beneficiaryName,
        bankName: values.bankName,
        accountNumber: values.accountNumber,
        iban: values.iban,
        swiftCode: values.swiftCode || "",
        accountType: values.accountType,
      };
      
      // 3. Submit final Agent Onboarding payload
      await apiService.post("/vault/agent/admin/onboard-freelance", payload);
      
      setSuccess(true);
      setPreviewVisible(false);
    } catch (err) {
      console.error(err);
      if (err.errorFields) {
        message.error("Please resolve the errors in the form fields.");
      } else {
        message.error(err?.response?.data?.message || "Failed to onboard agent. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const phoneValidator = (_, value) => {
    if (!value || String(value).length < 10) {
      return Promise.reject(new Error("Please enter a valid phone number"));
    }
    return Promise.resolve();
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Card style={{ maxWidth: 500, width: "100%", textAlign: "center", borderRadius: 20, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
          <div style={{ width: 80, height: 80, background: BRAND_PURPLE, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 4px 12px rgba(92, 3, 155, 0.3)" }}>
            <CheckOutlined style={{ fontSize: 40, color: "#fff" }} />
          </div>
          <Title level={3} style={{ color: "#000" }}>Agent Onboarded!</Title>
          <Text type="secondary" style={{ fontSize: 16 }}>The agent has been successfully registered.</Text>
          <Divider />
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Button size="large" block onClick={() => { 
              setSuccess(false); 
              form.resetFields(); 
              setDependents([]); 
              setEmiratesFront(null); 
              setEmiratesBack(null); 
              setPassportImage(null); 
              setVisaImage(null); 
              setSelectedCountry(null); 
              setSelectedState(null); 
            }}>
              Onboard Another
            </Button>
            <Button size="large" type="primary" block onClick={() => navigate("/dashboard/vault-admin/agent-list")} style={{ background: BRAND_PURPLE }}>
              View Agents
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", padding: "32px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: 24, textAlign: "left" }}>
          <Title level={2} style={{ color: "#000", marginBottom: 8 }}>Onboard New Agent</Title>
          <Text type="secondary" style={{ fontSize: 16 }}>Fill in all required details below to register a new freelance agent.</Text>
        </div>

        <Card style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", padding: "24px 0 0" }}>
          <Form form={form} layout="vertical">
            
            {/* --- SECTION: Personal Info --- */}
            <div style={{ padding: "0 24px" }}>
              <Title level={4} style={{ color: "#000", marginBottom: 24 }}>Personal Information</Title>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Required" }]}>
                    <Input size="large" placeholder="Ahmed" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Required" }]}>
                    <Input size="large" placeholder="Al Mansoori" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Valid email required" }]}>
                    <Input size="large" placeholder="agent@example.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="password" label="Password" rules={[{ required: true, min: 6, message: "Min 6 characters" }]}>
                    <Input.Password size="large" placeholder="Min 6 characters" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="phone_number" label="Phone Number" rules={[{ required: true }, { validator: phoneValidator }]}>
                    <PhoneInput country="ae" preferredCountries={["ae","sa","us","gb","in"]} enableSearch inputStyle={{ width: "100%", borderRadius: 8, height: 40 }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="gender" label="Gender" rules={[{ required: true, message: "Required" }]}>
                    <Select size="large" placeholder="Select gender">
                      <Option value="Male">Male</Option>
                      <Option value="Female">Female</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true, message: "Required" }]}>
                    <DatePicker size="large" style={{ width: "100%" }} format="DD-MMM-YYYY" disabledDate={(current) => current && current > moment().endOf("day")} />
                  </Form.Item>
                </Col>
                
                {/* Dynamically populated Nationality from the country-state-city list */}
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="nationality" label="Nationality" rules={[{ required: true, message: "Required" }]}>
                    <Select 
                      showSearch 
                      size="large" 
                      placeholder="Select Nationality" 
                      optionFilterProp="children"
                    >
                      {countries.map(c => <Option key={c.isoCode} value={c.name}>{c.name}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="maritalStatus" label="Marital Status" rules={[{ required: true, message: "Required" }]}>
                    <Select size="large" placeholder="Select status">
                      <Option value="Single">Single</Option>
                      <Option value="Married">Married</Option>
                      <Option value="Divorced">Divorced</Option>
                      <Option value="Widowed">Widowed</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* Dependents */}
              <Divider orientation="left" style={{ margin: "16px 0 24px" }}><Text strong style={{ fontSize: 16, color: "#000" }}>Dependents</Text></Divider>
              {dependents.map((dep, idx) => (
                <Card key={idx} size="small" style={{ marginBottom: 16, background: "#f8fafc", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                      <Input size="large" placeholder="Name" value={dep.name} onChange={e => { const newDeps = [...dependents]; newDeps[idx].name = e.target.value; setDependents(newDeps); }} />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Input size="large" placeholder="Age" type="number" min={0} value={dep.age} onChange={e => { const newDeps = [...dependents]; newDeps[idx].age = e.target.value; setDependents(newDeps); }} />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Select 
                        size="large" 
                        style={{ width: '100%' }}
                        placeholder="Relationship" 
                        value={dep.relationship || undefined} 
                        onChange={val => { const newDeps = [...dependents]; newDeps[idx].relationship = val; setDependents(newDeps); }}
                      >
                        <Option value="Son">Son</Option>
                        <Option value="Daughter">Daughter</Option>
                        <Option value="Spouse">Spouse</Option>
                        <Option value="Other">Other</Option>
                      </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Input size="large" placeholder="Location" value={dep.location} onChange={e => { const newDeps = [...dependents]; newDeps[idx].location = e.target.value; setDependents(newDeps); }} />
                    </Col>
                  </Row>
                  <div style={{ textAlign: "right", marginTop: 12 }}>
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeDependent(idx)}>Remove Dependent</Button>
                  </div>
                </Card>
              ))}
              <Button type="dashed" onClick={addDependent} icon={<PlusOutlined />} block size="large" style={{ borderRadius: 8 }}>
                Add Dependent
              </Button>
            </div>

            <Divider style={{ borderWidth: 2 }} />

            {/* --- SECTION: Address & Emergency --- */}
            <div style={{ padding: "0 24px" }}>
              <Title level={4} style={{ color: "#000", marginBottom: 24 }}>Address & Emergency Contact</Title>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name={["address", "building"]} label="Building"><Input size="large" placeholder="Marina Heights" /></Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name={["address", "apartment"]} label="Apartment"><Input size="large" placeholder="Apartment 1204" /></Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name={["address", "area"]} label="Area"><Input size="large" placeholder="Dubai Marina" /></Form.Item>
                </Col>
                
                {/* Dynamic Country, State, City */}
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name={["address", "countryCode"]} label="Country" rules={[{ required: true, message: "Select Country" }]}>
                    <Select 
                      showSearch 
                      size="large" 
                      placeholder="Select Country" 
                      optionFilterProp="children"
                      onChange={(val) => {
                        setSelectedCountry(val);
                        setSelectedState(null);
                        form.setFieldsValue({ address: { stateCode: undefined, city: undefined } });
                      }}
                    >
                      {countries.map(c => <Option key={c.isoCode} value={c.isoCode}>{c.name}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name={["address", "stateCode"]} label="State / Province" rules={[{ required: true, message: "Select State" }]}>
                    <Select 
                      showSearch 
                      size="large" 
                      placeholder="Select State" 
                      disabled={!selectedCountry}
                      optionFilterProp="children"
                      onChange={(val) => {
                        setSelectedState(val);
                        form.setFieldsValue({ address: { city: undefined } });
                      }}
                    >
                      {states.map(s => <Option key={s.isoCode} value={s.isoCode}>{s.name}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name={["address", "city"]} label="City" rules={[{ required: true, message: "Select City" }]}>
                    <Select showSearch size="large" placeholder="Select City" disabled={!selectedState} optionFilterProp="children">
                      {cities.map(c => <Option key={c.name} value={c.name}>{c.name}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left" style={{ margin: "16px 0 24px" }}><Text strong style={{ fontSize: 16, color: "#000" }}>Emergency Contact</Text></Divider>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name={["emergencyContact", "name"]} label="Contact Name" rules={[{ required: true, message: "Required" }]}><Input size="large" placeholder="Khalid Al Mansoori" /></Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name={["emergencyContact", "relationship"]} label="Relationship" rules={[{ required: true, message: "Required" }]}>
                    <Select size="large" placeholder="Select Relationship">
                      <Option value="Father">Father</Option>
                      <Option value="Mother">Mother</Option>
                      <Option value="Brother">Brother</Option>
                      <Option value="Sister">Sister</Option>
                      <Option value="Spouse">Spouse</Option>
                      <Option value="Son">Son</Option>
                      <Option value="Daughter">Daughter</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name={["emergencyContact", "phone"]} label="Phone" rules={[{ required: true }, { validator: phoneValidator }]}>
                    <PhoneInput country="ae" enableSearch inputStyle={{ width: "100%", borderRadius: 8, height: 40 }} />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider style={{ borderWidth: 2 }} />

            {/* --- SECTION: Identity Documents --- */}
            <div style={{ padding: "0 24px" }}>
              <Title level={4} style={{ color: "#000", marginBottom: 24 }}>Identity Documents</Title>
              
              <Divider orientation="left" style={{ marginTop: 0 }}><Text strong style={{ fontSize: 16, color: "#000" }}>Emirates ID</Text></Divider>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item 
                    name="emiratesIdNumber" 
                    label="Emirates ID Number" 
                    rules={[
                      { required: true, message: "Required" },
                      { pattern: /^784-\d{4}-\d{7}-\d{1}$/, message: "Format: 784-XXXX-XXXXXXX-X" }
                    ]}
                  >
                    <Input size="large" placeholder="784-1990-1234567-8" />
                  </Form.Item>
                  <Form.Item name="emiratesIdExpiryDate" label="Expiry Date" rules={[{ required: true, message: "Required" }]}>
                    <DatePicker size="large" style={{ width: "100%" }} format="DD-MMM-YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Front Side Image (Required)" required>
                    <FileUploadPreview file={emiratesFront} onChange={setEmiratesFront} label="Emirates ID Front" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Back Side Image (Required)" required>
                    <FileUploadPreview file={emiratesBack} onChange={setEmiratesBack} label="Emirates ID Back" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left" style={{ margin: "24px 0" }}><Text strong style={{ fontSize: 16, color: "#000" }}>Passport</Text></Divider>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="passportNumber" label="Passport Number" rules={[{ required: true, message: "Required" }]}><Input size="large" placeholder="A12345678" /></Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="passportExpiryDate" label="Expiry Date" rules={[{ required: true, message: "Required" }]}><DatePicker size="large" style={{ width: "100%" }} format="DD-MMM-YYYY" /></Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Passport Image (Required)" required>
                    <FileUploadPreview file={passportImage} onChange={setPassportImage} label="Passport" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left" style={{ margin: "24px 0" }}><Text strong style={{ fontSize: 16, color: "#000" }}>Visa</Text></Divider>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="visaNumber" label="Visa Number"><Input size="large" placeholder="VISA-987654" /></Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="visaExpiryDate" label="Expiry Date"><DatePicker size="large" style={{ width: "100%" }} format="DD-MMM-YYYY" /></Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Visa Image (Required)" required>
                    <FileUploadPreview file={visaImage} onChange={setVisaImage} label="Visa" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider style={{ borderWidth: 2 }} />

            {/* --- SECTION: Bank Details --- */}
            <div style={{ padding: "0 24px" }}>
              <Title level={4} style={{ color: "#000", marginBottom: 24 }}>Bank Details</Title>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="beneficiaryName" label="Beneficiary Name" rules={[{ required: true, message: "Required" }]}><Input size="large" placeholder="Ahmed Al Mansoori" /></Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="bankName" label="Bank Name" rules={[{ required: true, message: "Required" }]}><Input size="large" placeholder="ADCB" /></Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="accountNumber" label="Account Number" rules={[{ required: true, message: "Required" }]}><Input size="large" placeholder="98765432109876" /></Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="iban" label="IBAN" rules={[{ required: true, message: "Required" }]}><Input size="large" placeholder="AE123456789012345678902" /></Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="swiftCode" label="SWIFT Code"><Input size="large" placeholder="ADCBAEAD" /></Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="accountType" label="Account Type" rules={[{ required: true, message: "Required" }]}>
                    <Select size="large" placeholder="Select type">
                      <Option value="Savings">Savings</Option>
                      <Option value="Current">Current</Option>
                      <Option value="Fixed Deposit">Fixed Deposit</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider style={{ margin: "24px 0 0" }} />
            
            {/* Actions: ADDED flexWrap: "wrap" HERE FOR RESPONSIVENESS */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: "16px", padding: "24px", background: "#fafafa", borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
              <Button size="large" onClick={handlePreview} icon={<EyeOutlined />} style={{ borderColor: BRAND_PURPLE, color: BRAND_PURPLE }}>
                Preview Details
              </Button>
              <Button size="large" type="primary" onClick={handleSubmit} loading={loading} icon={<CheckOutlined />} style={{ background: BRAND_PURPLE, borderRadius: 8 }}>
                Submit & Onboard Agent
              </Button>
            </div>
            
          </Form>
        </Card>
      </div>

      {/* --- PREVIEW MODAL --- */}
      <Modal
        title="Preview Agent Details"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="back" onClick={() => setPreviewVisible(false)}>
            Edit Details
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleSubmit} style={{ background: BRAND_PURPLE }}>
            Confirm & Submit
          </Button>,
        ]}
        width={800}
      >
        {previewData && (
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="Full Name">{previewData.first_name} {previewData.last_name}</Descriptions.Item>
            <Descriptions.Item label="Email">{previewData.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{previewData.phone_number}</Descriptions.Item>
            <Descriptions.Item label="Nationality">{previewData.nationality}</Descriptions.Item>
            <Descriptions.Item label="Location">
              {previewData.address?.city || 'N/A'}, {previewData.displayState || 'N/A'}, {previewData.displayCountry || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Emergency Contact">{previewData.emergencyContact?.name} ({previewData.emergencyContact?.phone})</Descriptions.Item>
            <Descriptions.Item label="Emirates ID">{previewData.emiratesIdNumber}</Descriptions.Item>
            <Descriptions.Item label="Bank Name">{previewData.bankName}</Descriptions.Item>
            <Descriptions.Item label="IBAN">{previewData.iban}</Descriptions.Item>
            <Descriptions.Item label="Dependents Count">{dependents.length}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

    </div>
  );
}