// src/components/Vault/AgentOnboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form, Input, Select, Button, Card, Steps, Row, Col, DatePicker,
  Upload, message, Space, Typography, Divider, Alert
} from "antd";
import {
  UserOutlined, MailOutlined, LockOutlined, PhoneOutlined,
  HomeOutlined, EnvironmentOutlined, HeartOutlined, GlobalOutlined,
  BankOutlined, FileTextOutlined, CreditCardOutlined, PlusOutlined,
  DeleteOutlined, CheckOutlined, ArrowLeftOutlined, ArrowRightOutlined,
  UploadOutlined, IdcardOutlined, SafetyOutlined, TeamOutlined
} from "@ant-design/icons";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import moment from "moment";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

/* -------------------------------------------------------------------------- */
/*  CONSTANTS                                                                 */
/* -------------------------------------------------------------------------- */
const COUNTRIES = [
  "United Arab Emirates","Afghanistan","Albania","Algeria","Argentina","Australia",
  "Austria","Bahrain","Bangladesh","Belgium","Brazil","Canada","China","Denmark",
  "Egypt","Ethiopia","Finland","France","Germany","Ghana","Greece","India",
  "Indonesia","Iran","Iraq","Ireland","Italy","Japan","Jordan","Kenya","Kuwait",
  "Lebanon","Libya","Malaysia","Maldives","Morocco","Myanmar","Nepal","Netherlands",
  "New Zealand","Nigeria","Norway","Oman","Pakistan","Palestine","Philippines",
  "Poland","Portugal","Qatar","Romania","Russia","Saudi Arabia","Singapore",
  "Somalia","South Africa","South Korea","Spain","Sri Lanka","Sudan","Sweden",
  "Switzerland","Syria","Tanzania","Thailand","Tunisia","Turkey","Uganda",
  "Ukraine","United Kingdom","United States","Vietnam","Yemen","Zimbabwe","Other",
];

const NATIONALITIES = [
  "Emirati","Afghan","Albanian","Algerian","American","Argentinian","Australian",
  "Austrian","Bahraini","Bangladeshi","Belgian","Brazilian","British","Canadian",
  "Chinese","Danish","Egyptian","Ethiopian","Filipino","Finnish","French","German",
  "Ghanaian","Greek","Indian","Indonesian","Iranian","Iraqi","Irish","Italian",
  "Japanese","Jordanian","Kenyan","Kuwaiti","Lebanese","Libyan","Malaysian",
  "Maldivian","Moroccan","Nepali","Nigerian","Norwegian","Omani","Pakistani",
  "Palestinian","Polish","Portuguese","Qatari","Romanian","Russian","Saudi",
  "Singaporean","Somali","South African","South Korean","Spanish","Sri Lankan",
  "Sudanese","Swedish","Swiss","Syrian","Thai","Tunisian","Turkish","Ukrainian",
  "Vietnamese","Yemeni","Zimbabwean","Other",
];

const BANKS = [
  "Emirates NBD","Abu Dhabi Commercial Bank (ADCB)","First Abu Dhabi Bank (FAB)",
  "Dubai Islamic Bank (DIB)","Mashreq Bank","RAKBANK","Union National Bank (UNB)",
  "Commercial Bank of Dubai (CBD)","Abu Dhabi Islamic Bank (ADIB)",
  "Sharjah Islamic Bank","Ajman Bank","Bank of Sharjah","Emirates Islamic Bank",
  "HSBC UAE","Standard Chartered UAE","Citibank UAE","Lloyds Bank","Barclays",
  "ICICI Bank","HDFC Bank","State Bank of India","Axis Bank","National Bank of Fujairah","Other"
];

/* -------------------------------------------------------------------------- */
/*  CUSTOM PHONE INPUT WRAPPER (safe string conversion)                       */
/* -------------------------------------------------------------------------- */
const AntPhoneInput = ({ value, onChange, ...props }) => {
  return (
    <PhoneInput
      {...props}
      value={value || ""}
      onChange={(value) => {
        onChange(value); // direct value (string)
      }}
      inputStyle={{ width: "100%" }}
    />
  );
};

/* -------------------------------------------------------------------------- */
/*  IMAGE UPLOAD FIELD (Base64 – no backend upload)                          */
/* -------------------------------------------------------------------------- */
const ImageUploadField = ({ value, onChange, label, required }) => {
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      message.error('Please upload an image file (JPG, PNG, WEBP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target.result); // store Base64 data URL
      message.success('Image uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {value ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img 
            src={value} 
            alt="preview" 
            style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} 
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            style={{ position: 'absolute', top: -8, right: -8 }}
            onClick={() => onChange('')}
          />
        </div>
      ) : (
        <Upload.Dragger
          beforeUpload={(file) => {
            handleFile(file);
            return false; // prevent actual HTTP upload
          }}
          showUploadList={false}
          accept="image/jpeg,image/png,image/webp"
        >
          <p className="ant-upload-drag-icon"><UploadOutlined /></p>
          <p>Click or drag to upload</p>
          <p style={{ fontSize: 12, color: '#9ca3af' }}>JPG, PNG, WEBP up to 10MB</p>
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
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dependents, setDependents] = useState([]);
  const navigate = useNavigate();

  const steps = [
    { title: "Personal Info", icon: <UserOutlined /> },
    { title: "Address & Emergency", icon: <HomeOutlined /> },
    { title: "Identity Documents", icon: <IdcardOutlined /> },
    { title: "Bank Details", icon: <BankOutlined /> },
  ];

  const addDependent = () => {
    setDependents([...dependents, { name: "", age: "", relationship: "", location: "" }]);
  };
  const removeDependent = (index) => {
    const newList = [...dependents];
    newList.splice(index, 1);
    setDependents(newList);
  };

  // Step validation
  const validateStep = async () => {
    try {
      let fieldsToValidate = [];
      if (currentStep === 0) {
        fieldsToValidate = [
          "first_name", "last_name", "email", "phone_number", "password", "confirmPassword",
          "gender", "dateOfBirth", "nationality", "maritalStatus"
        ];
      } else if (currentStep === 1) {
       fieldsToValidate = [
  ["address", "building"],
  ["address", "city"],
  ["address", "country"],
  ["emergencyContact", "name"],
  ["emergencyContact", "relationship"],
  ["emergencyContact", "phone"],
];
      } else if (currentStep === 2) {
        fieldsToValidate = [
          "emiratesId.number", "emiratesId.issuanceDate", "emiratesId.expiryDate",
          "emiratesId.frontImageUrl", "emiratesId.backImageUrl",
          "passport.number", "passport.countryOfIssue", "passport.issueDate", "passport.expiryDate"
        ];
      } else if (currentStep === 3) {
        fieldsToValidate = [
          "bankDetails.beneficiaryName", "bankDetails.bankName", "bankDetails.accountNumber",
          "bankDetails.iban", "bankDetails.accountType"
        ];
      }
      await form.validateFields(fieldsToValidate);
      return true;
    } catch (error) {
      message.error("Please fill all required fields correctly.");
      return false;
    }
  };

  const handleNext = async () => {
    if (await validateStep()) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!await validateStep()) return;
    setLoading(true);
    try {
      const values = form.getFieldsValue(true);
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
        languagePreference: values.languagePreference,
        communicationPreference: values.communicationPreference,
        dependents: dependents.map(d => ({ ...d, age: Number(d.age) })),
        address: {
          building: values.address?.building,
          apartment: values.address?.apartment,
          area: values.address?.area,
          city: values.address?.city,
          poBox: values.address?.poBox,
          country: values.address?.country,
        },
        emergencyContact: {
          name: values.emergencyContact?.name,
          relationship: values.emergencyContact?.relationship,
          phone: values.emergencyContact?.phone,
        },
        emiratesId: {
          number: values.emiratesId?.number,
          issuanceDate: values.emiratesId?.issuanceDate ? values.emiratesId.issuanceDate.toISOString() : null,
          expiryDate: values.emiratesId?.expiryDate ? values.emiratesId.expiryDate.toISOString() : null,
          frontImageUrl: values.emiratesId?.frontImageUrl,
          backImageUrl: values.emiratesId?.backImageUrl,
        },
        passport: {
          number: values.passport?.number,
          countryOfIssue: values.passport?.countryOfIssue,
          issueDate: values.passport?.issueDate ? values.passport.issueDate.toISOString() : null,
          expiryDate: values.passport?.expiryDate ? values.passport.expiryDate.toISOString() : null,
          imageUrl: values.passport?.imageUrl,
        },
        visa: {
          number: values.visa?.number,
          residencyStatus: values.visa?.residencyStatus,
          sponsor: values.visa?.sponsor,
          expiryDate: values.visa?.expiryDate ? values.visa.expiryDate.toISOString() : null,
          imageUrl: values.visa?.imageUrl,
        },
        bankDetails: {
          beneficiaryName: values.bankDetails?.beneficiaryName,
          bankName: values.bankDetails?.bankName,
          accountNumber: values.bankDetails?.accountNumber,
          iban: values.bankDetails?.iban,
          swiftCode: values.bankDetails?.swiftCode,
          accountType: values.bankDetails?.accountType,
        },
        agentType: "PartnerAffiliatedAgent",
        commissionEligible: true,
        commissionPercentage: 45,
        isProfileComplete: true,
        isPhoneVerified: true,
        isEmailVerified: true,
        isActive: true,
        affiliationStatus: "verified",
        affiliationVerifiedAt: new Date().toISOString(),
      };
      await apiService.post("/vault/agent/partner/onboard-affiliate", payload);
      setSuccess(true);
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to onboard agent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F7FA", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Card style={{ maxWidth: 500, width: "100%", textAlign: "center", borderRadius: 20 }}>
          <div style={{ width: 70, height: 70, background: "#5C039B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckOutlined style={{ fontSize: 32, color: "#fff" }} />
          </div>
          <Title level={3}>Agent Onboarded!</Title>
          <Text type="secondary">The affiliated agent has been successfully registered.</Text>
          <Divider />
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button block onClick={() => { setSuccess(false); setCurrentStep(0); form.resetFields(); setDependents([]); }}>Onboard Another</Button>
            <Button type="primary" block onClick={() => navigate("/dashboard/vault-admin/agent-list")} style={{ background: "#5C039B" }}>View Agents</Button>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ background: "#F5F7FA", minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Card style={{ borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <Title level={2} style={{ marginBottom: 4 }}>Onboard Affiliated Agent</Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>Register a new agent under your partnership network.</Text>

          {/* Steps */}
          <Steps current={currentStep} style={{ marginBottom: 32 }}>
            {steps.map((step, idx) => (
              <Step key={idx} title={step.title} icon={step.icon} />
            ))}
          </Steps>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              languagePreference: "English",
              communicationPreference: "WhatsApp",
              phone_number: "",
              emergencyContact: { phone: "" }
            }}
          >
            {/* -------------------- STEP 0: Personal Info -------------------- */}
            {currentStep === 0 && (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "First name required" }]}>
                    <Input placeholder="e.g. Fatima" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Last name required" }]}>
                    <Input placeholder="e.g. Hassan" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="email" label="Email Address" rules={[{ required: true, type: "email" }]}>
                    <Input placeholder="agent@example.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
            <Form.Item
  name="phone_number"
  label="Phone Number"
  valuePropName="value"
  getValueFromEvent={(value) => value}
  rules={[{ required: true, message: "Phone number required" }]}
>
  <AntPhoneInput country="ae" enableSearch />
</Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="password" label="Password" rules={[{ required: true, min: 6, message: "Minimum 6 characters" }]}>
                    <Input.Password placeholder="••••••" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={["password"]}
                    rules={[
                      { required: true, message: "Please confirm password" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) return Promise.resolve();
                          return Promise.reject("Passwords do not match");
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="••••••" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="gender" label="Gender" rules={[{ required: true, message: "Select gender" }]}>
                    <Select placeholder="Select gender">
                      <Option value="Male">Male</Option>
                      <Option value="Female">Female</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true, message: "Date of birth required" }]}>
                    <DatePicker style={{ width: "100%" }} format="DD-MMM-YYYY" disabledDate={(current) => current && current > moment().endOf("day")} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="nationality" label="Nationality" rules={[{ required: true, message: "Nationality required" }]}>
                    <Select showSearch filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                      {NATIONALITIES.map(n => <Option key={n} value={n}>{n}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="maritalStatus" label="Marital Status" rules={[{ required: true, message: "Marital status required" }]}>
                    <Select>
                      <Option value="Single">Single</Option>
                      <Option value="Married">Married</Option>
                      <Option value="Divorced">Divorced</Option>
                      <Option value="Widowed">Widowed</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="languagePreference" label="Language Preference">
                    <Select>
                      <Option value="English">English</Option>
                      <Option value="Arabic">Arabic</Option>
                      <Option value="Hindi">Hindi</Option>
                      <Option value="Urdu">Urdu</Option>
                      <Option value="Tagalog">Tagalog</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="communicationPreference" label="Communication Preference">
                    <Select>
                      <Option value="WhatsApp">WhatsApp</Option>
                      <Option value="Email">Email</Option>
                      <Option value="Phone Call">Phone Call</Option>
                      <Option value="SMS">SMS</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Divider orientation="left">Dependents</Divider>
                  {dependents.map((dep, idx) => (
                    <Card key={idx} style={{ marginBottom: 12, background: "#FAFAFA" }} size="small">
                      <Row gutter={16}>
                        <Col xs={12} md={6}>
                          <Input placeholder="Full Name" value={dep.name} onChange={(e) => {
                            const newDeps = [...dependents];
                            newDeps[idx].name = e.target.value;
                            setDependents(newDeps);
                          }} />
                        </Col>
                        <Col xs={12} md={6}>
                          <Input placeholder="Age" type="number" value={dep.age} onChange={(e) => {
                            const newDeps = [...dependents];
                            newDeps[idx].age = e.target.value;
                            setDependents(newDeps);
                          }} />
                        </Col>
                        <Col xs={12} md={6}>
                          <Select placeholder="Relationship" value={dep.relationship} onChange={(val) => {
                            const newDeps = [...dependents];
                            newDeps[idx].relationship = val;
                            setDependents(newDeps);
                          }} style={{ width: "100%" }}>
                            <Option value="Spouse">Spouse</Option>
                            <Option value="Son">Son</Option>
                            <Option value="Daughter">Daughter</Option>
                            <Option value="Parent">Parent</Option>
                            <Option value="Sibling">Sibling</Option>
                            <Option value="Other">Other</Option>
                          </Select>
                        </Col>
                        <Col xs={12} md={6}>
                          <Select placeholder="Location" value={dep.location} onChange={(val) => {
                            const newDeps = [...dependents];
                            newDeps[idx].location = val;
                            setDependents(newDeps);
                          }} style={{ width: "100%" }}>
                            <Option value="In UAE">In UAE</Option>
                            <Option value="Outside UAE">Outside UAE</Option>
                          </Select>
                        </Col>
                      </Row>
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeDependent(idx)} style={{ marginTop: 8 }}>Remove</Button>
                    </Card>
                  ))}
                  <Button type="dashed" onClick={addDependent} icon={<PlusOutlined />} block>Add Dependent</Button>
                </Col>
              </Row>
            )}

            {/* -------------------- STEP 1: Address & Emergency -------------------- */}
            {currentStep === 1 && (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item name={["address", "building"]} label="Building / Tower Name" rules={[{ required: true, message: "Required" }]}>
                    <Input placeholder="e.g. Al Shafa Towers" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["address", "apartment"]} label="Apartment / Unit No.">
                    <Input placeholder="e.g. Apartment 805" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["address", "area"]} label="Area / District">
                    <Input placeholder="e.g. Al Nahda" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["address", "city"]} label="City" rules={[{ required: true, message: "Required" }]}>
                    <Input placeholder="e.g. Dubai" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["address", "poBox"]} label="PO Box">
                    <Input placeholder="e.g. 12345" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["address", "country"]} label="Country" rules={[{ required: true, message: "Required" }]}>
                    <Select showSearch filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                      {COUNTRIES.map(c => <Option key={c} value={c}>{c}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>

                <Divider orientation="left">Emergency Contact</Divider>
                <Col xs={24} sm={12}>
                  <Form.Item name={["emergencyContact", "name"]} label="Full Name" rules={[{ required: true, message: "Required" }]}>
                    <Input placeholder="e.g. Ahmed Hassan" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["emergencyContact", "relationship"]} label="Relationship" rules={[{ required: true, message: "Required" }]}>
                    <Select>
                      <Option value="Spouse">Spouse</Option>
                      <Option value="Parent">Parent</Option>
                      <Option value="Sibling">Sibling</Option>
                      <Option value="Child">Child</Option>
                      <Option value="Friend">Friend</Option>
                      <Option value="Colleague">Colleague</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                   <Form.Item
  name={["emergencyContact", "phone"]}
  label="Phone Number"
  valuePropName="value"
  getValueFromEvent={(value) => value}
  rules={[{ required: true, message: "Required" }]}
>
  <AntPhoneInput country="ae" enableSearch />
</Form.Item>
                </Col>
              </Row>
            )}

            {/* -------------------- STEP 2: Identity Documents -------------------- */}
            {currentStep === 2 && (
              <Row gutter={[16, 16]}>
                <Divider orientation="left">Emirates ID</Divider>
                <Col xs={24} sm={12}>
                  <Form.Item name={["emiratesId", "number"]} label="Emirates ID Number" rules={[{ required: true, message: "Required" }]}>
                    <Input placeholder="784-1995-8765432-1" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["emiratesId", "issuanceDate"]} label="Issuance Date" rules={[{ required: true, message: "Required" }]}>
                    <DatePicker style={{ width: "100%" }} format="DD-MMM-YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["emiratesId", "expiryDate"]} label="Expiry Date" rules={[{ required: true, message: "Required" }]}>
                    <DatePicker style={{ width: "100%" }} format="DD-MMM-YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["emiratesId", "frontImageUrl"]} label="Front Side Image" rules={[{ required: true, message: "Required" }]}>
                    <ImageUploadField
                      value={form.getFieldValue(["emiratesId", "frontImageUrl"])}
                      onChange={(val) => form.setFieldValue(["emiratesId", "frontImageUrl"], val)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["emiratesId", "backImageUrl"]} label="Back Side Image" rules={[{ required: true, message: "Required" }]}>
                    <ImageUploadField
                      value={form.getFieldValue(["emiratesId", "backImageUrl"])}
                      onChange={(val) => form.setFieldValue(["emiratesId", "backImageUrl"], val)}
                    />
                  </Form.Item>
                </Col>

                <Divider orientation="left">Passport</Divider>
                <Col xs={24} sm={12}>
                  <Form.Item name={["passport", "number"]} label="Passport Number" rules={[{ required: true, message: "Required" }]}>
                    <Input placeholder="P98765432" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["passport", "countryOfIssue"]} label="Country of Issue" rules={[{ required: true, message: "Required" }]}>
                    <Select showSearch filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                      {COUNTRIES.map(c => <Option key={c} value={c}>{c}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["passport", "issueDate"]} label="Issue Date" rules={[{ required: true, message: "Required" }]}>
                    <DatePicker style={{ width: "100%" }} format="DD-MMM-YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["passport", "expiryDate"]} label="Expiry Date" rules={[{ required: true, message: "Required" }]}>
                    <DatePicker style={{ width: "100%" }} format="DD-MMM-YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name={["passport", "imageUrl"]} label="Passport Photo Page">
                    <ImageUploadField
                      value={form.getFieldValue(["passport", "imageUrl"])}
                      onChange={(val) => form.setFieldValue(["passport", "imageUrl"], val)}
                    />
                  </Form.Item>
                </Col>

                <Divider orientation="left">UAE Visa (Optional)</Divider>
                <Col xs={24} sm={12}>
                  <Form.Item name={["visa", "number"]} label="Visa / File Number">
                    <Input placeholder="202/2023/1234567" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["visa", "residencyStatus"]} label="Residency Status">
                    <Select>
                      <Option value="">Select status</Option>
                      <Option value="Resident">Resident</Option>
                      <Option value="Employment Visa">Employment Visa</Option>
                      <Option value="Investor Visa">Investor Visa</Option>
                      <Option value="Dependent Visa">Dependent Visa</Option>
                      <Option value="Visit Visa">Visit Visa</Option>
                      <Option value="GCC National">GCC National</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["visa", "sponsor"]} label="Sponsor / Employer Name">
                    <Input placeholder="e.g. Elite Financial Services LLC" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["visa", "expiryDate"]} label="Visa Expiry Date">
                    <DatePicker style={{ width: "100%" }} format="DD-MMM-YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name={["visa", "imageUrl"]} label="Visa / Residency Page Image">
                    <ImageUploadField
                      value={form.getFieldValue(["visa", "imageUrl"])}
                      onChange={(val) => form.setFieldValue(["visa", "imageUrl"], val)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}

            {/* -------------------- STEP 3: Bank Details -------------------- */}
            {currentStep === 3 && (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item name={["bankDetails", "beneficiaryName"]} label="Beneficiary Full Name" rules={[{ required: true, message: "Required" }]}>
                    <Input placeholder="e.g. Fatima Hassan" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["bankDetails", "bankName"]} label="Bank Name" rules={[{ required: true, message: "Required" }]}>
                    <Select showSearch>
                      {BANKS.map(b => <Option key={b} value={b}>{b}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["bankDetails", "accountNumber"]} label="Account Number" rules={[{ required: true, message: "Required" }]}>
                    <Input placeholder="12345678901234" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["bankDetails", "iban"]} label="IBAN" rules={[{ required: true, message: "Required" }]}>
                    <Input placeholder="AE380440123456789012345" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["bankDetails", "swiftCode"]} label="SWIFT / BIC Code">
                    <Input placeholder="EBILAEAD" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["bankDetails", "accountType"]} label="Account Type" rules={[{ required: true, message: "Required" }]}>
                    <Select>
                      <Option value="Savings">Savings Account</Option>
                      <Option value="Current">Current Account</Option>
                      <Option value="Fixed Deposit">Fixed Deposit</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Alert
                    message="Confirmation"
                    description="By submitting, you confirm that all information provided is accurate. The agent will be onboarded as a Partner Affiliated Agent with a 45% commission structure."
                    type="info"
                    showIcon
                    icon={<SafetyOutlined />}
                  />
                </Col>
              </Row>
            )}

            {/* Navigation Buttons */}
            <Divider />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {currentStep > 0 && (
                <Button onClick={handleBack} icon={<ArrowLeftOutlined />}>Back</Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button type="primary" onClick={handleNext} icon={<ArrowRightOutlined />} style={{ marginLeft: "auto", background: "#5C039B" }}>Continue</Button>
              ) : (
                <Button type="primary" onClick={handleSubmit} loading={loading} icon={<CheckOutlined />} style={{ marginLeft: "auto", background: "#5C039B" }}>Onboard Agent</Button>
              )}
            </div>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Fields marked with * are required</Text>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}