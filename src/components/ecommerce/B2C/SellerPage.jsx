import React, { useState, useEffect, useMemo } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Steps,
  Card,
  Row,
  Col,
  Checkbox,
  Typography,
  message,
  Spin,
  notification,
  Upload,
  Divider,
  Space
} from "antd";
import {
  UserOutlined,
  ShopOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  BankOutlined,
  TeamOutlined,
  CloudUploadOutlined,
  PlusOutlined,
  LinkOutlined,
  LoadingOutlined,
  DeleteOutlined,
  EditOutlined
} from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { Country, State, City } from "country-state-city";
// ✅ IMPORTED parsePhoneNumberFromString for strict validation
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// --- UPDATED GENERIC UPLOADER (Fixed Width Issue) ---
const GenericUploader = ({ value, onChange, label, listType = "text" }) => {
  const [loading, setLoading] = useState(false);

  const handleCustomRequest = async ({ file, onSuccess, onError }) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      
      const response = await apiService.post(`/upload`, formData);
      const responseBody = response.data || response;
      const url =
        responseBody.url ||
        responseBody.secure_url ||
        responseBody.file?.url ||
        responseBody.file?.location ||
        responseBody.file?.path ||
        responseBody.data?.url ||
        (typeof responseBody === "string" ? responseBody : null);

      if (url) {
        onChange(url);
        onSuccess("ok");
        message.success(`${label} uploaded!`);
      } else {
        throw new Error("Server returned success, but image URL was missing.");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      onError(err);
      message.error(`Failed to upload ${label}.`);
    } finally {
      setLoading(false);
    }
  };

  // 1. IMAGE CARD VIEW (Logo etc)
  if (listType === "picture-card") {
    return (
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        customRequest={handleCustomRequest}
      >
        {value ? (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <img
              src={value}
              alt={label}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: 5,
                borderRadius: 8,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                background: "white",
                borderRadius: "50%",
                padding: 4,
                cursor: "pointer",
                border: "1px solid #eee",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
            >
              <DeleteOutlined className="text-red-500" />
            </div>
          </div>
        ) : (
          <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>
              {loading ? "Uploading" : "Upload"}
            </div>
          </div>
        )}
      </Upload>
    );
  }
  return (
    <div className="w-full" style={{ width: "100%" }}>
      <Upload.Dragger
        showUploadList={false}
        customRequest={handleCustomRequest}
        style={{
          backgroundColor: value ? "#f6ffed" : "#fff",
          border: value ? "1px dashed #52c41a" : "1px dashed #d9d9d9",
          borderRadius: 12,
          padding: "20px 0",
          width: "100% !important", // Forces full width
          display: "block",
        }}
        className="w-full block"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          {loading ? (
            <>
              <Spin
                indicator={
                  <LoadingOutlined
                    style={{ fontSize: 28, color: "#1890ff" }}
                    spin
                  />
                }
              />
              <p style={{ marginTop: 10, color: "#666" }}>Uploading...</p>
            </>
          ) : value ? (
            <>
              <CheckCircleFilled
                style={{ fontSize: 32, color: "#52c41a", marginBottom: 8 }}
              />
              <p className="font-semibold text-green-700 text-sm">Uploaded</p>
              <p className="text-xs text-gray-500 max-w-[150px] truncate mb-2">
                {value.split("/").pop()}
              </p>
              <Button
                size="small"
                danger
                type="dashed"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
              >
                Change File
              </Button>
            </>
          ) : (
            <>
              <p className="ant-upload-drag-icon" style={{ marginBottom: 8 }}>
                <CloudUploadOutlined
                  style={{ color: "var(--color-primary)", fontSize: 32 }}
                />
              </p>
              <p
                className="ant-upload-text"
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                Click to Upload
              </p>
              <p
                className="ant-upload-hint"
                style={{ fontSize: "11px", color: "#999" }}
              >
                {label.replace("(Mandatory)", "").trim()}
              </p>
            </>
          )}
        </div>
      </Upload.Dragger>
    </div>
  );
};

const SellerPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  // --- OTP STATES ---
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // --- EMAIL OTP STATES ---
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [enteredEmailOtp, setEnteredEmailOtp] = useState("");
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);

  const themeColor = "var(--color-primary)";

  const {
    control,
    handleSubmit,
    trigger,
    setError,
    clearErrors, 
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      mobile: { country_code: "971" }, // UAE Default (Without + for visual match)
      store_details: {
        country: "AE", 
        social_links: {
          facebook: "",
          instagram: "",
          twitter: "",
          linkedin: "",
          youtube: "",
        },
      },
      operations: { delivery_modes: [], avg_delivery_time_days: 3 },
      contacts: {
        primary_contact: { designation: "Owner" },
        support_contact: { designation: "Support Manager" },
      },
      documents: {
        trade_license: "",
        vat_certificate: "",
        emirates_id: "",
        bank_letter: "",
        moa_document: "",
      },
      meta: {
        agreed_to_terms: false,
      },
    },
  });

  const selectedCountry = watch("store_details.country");
  const selectedState = watch("store_details.state");
  const watchMobileNumber = watch("mobile.number");

  // 🔥 CUSTOM COUNTRY OPTIONS WITH FLAGCDN LOGIC
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

  useEffect(() => {
    if (selectedCountry) {
      const updatedStates = State.getStatesOfCountry(selectedCountry);
      setStatesList(updatedStates);
    } else {
      setStatesList([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState && selectedCountry) {
      const updatedCities = City.getCitiesOfState(
        selectedCountry,
        selectedState,
      );
      setCitiesList(updatedCities);
    } else {
      setCitiesList([]);
    }
  }, [selectedState, selectedCountry]);

  const businessTypes = [
    {
      label: "Individual / Sole Proprietor",
      value: "Individual / Sole Proprietor",
    },
    { label: "Private Limited", value: "Private Limited" },
    { label: "Partnership", value: "Partnership" },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(
        "/products/get-all-category?limit=100",
      );
      const categoryData = response.data?.data || response.data || response;
      if (Array.isArray(categoryData)) {
        setCategories(
          categoryData.map((c) => ({ label: c.name, value: c._id })),
        );
      } else if (categoryData.categories) {
        setCategories(
          categoryData.categories.map((c) => ({
            label: c.parent ? `${c.name} (${c.parent.name})` : c.name,
            value: c._id,
          })),
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: "Personal", icon: <UserOutlined /> },
    { title: "Store Info", icon: <ShopOutlined /> },
    { title: "Business & Bank", icon: <BankOutlined /> },
    { title: "Contacts", icon: <TeamOutlined /> },
    { title: "Documents", icon: <CloudUploadOutlined /> },
  ];

  // --- OTP HANDLERS (LIVE API) ---
  const handleSendOtp = async () => {
    const isMobileValid = await trigger("mobile.number");
    if (!isMobileValid) return;

    let countryCode = getValues("mobile.country_code");
    const number = getValues("mobile.number");
    
    // Ensure country code has '+' for API
    if (!countryCode.startsWith("+")) countryCode = `+${countryCode}`;

    setOtpLoading(true);
    try {
      await apiService.post("/otp/send-otp", {
        country_code: countryCode,
        phone_number: number,
      });
      message.success("OTP sent successfully!");
      setOtpSent(true); // ✅ FIXED
      setOtpVerified(false);
    } catch (error) {
      const errData = error.response?.data;
      if (errData?.errors && errData.errors.length > 0) {
        errData.errors.forEach(err => {
          const fieldName = (err.field === 'mobile' || err.field === 'mobile.number') ? 'mobile.number' : err.field;
          setError(fieldName, { type: "manual", message: err.message });
        });
      } else if (errData?.message && /(mobile|number|phone)/i.test(errData.message)) {
        setError("mobile.number", { type: "manual", message: errData.message });
      } else {
        notification.error({
          message: "OTP Error",
          description: errData?.message || "Failed to send OTP",
        });
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!enteredOtp) {
      message.error("Please enter the OTP");
      return;
    }
    
    let countryCode = getValues("mobile.country_code");
    if (!countryCode.startsWith("+")) countryCode = `+${countryCode}`;

    setOtpLoading(true);
    try {
      await apiService.post("/otp/verify-otp", {
        country_code: countryCode,
        phone_number: getValues("mobile.number"),
        otp: enteredOtp,
      });
      message.success("Mobile Verified Successfully!");
      setOtpVerified(true);
      setOtpSent(false); // ✅ FIXED
    } catch (error) {
      message.error(error?.response?.data?.message || "Invalid Mobile OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setOtpSent(false); // ✅ FIXED
    setOtpVerified(false);
    setEnteredOtp("");
  };

  // --- EMAIL OTP HANDLERS (LIVE API) ---
  const handleSendEmailOtp = async () => {
    const isEmailValid = await trigger("email");
    if (!isEmailValid) return;

    const email = getValues("email");
    setEmailOtpLoading(true);
    try {
      await apiService.post("/otp/email-otp/send", { email });
      message.success("OTP sent successfully! Please check your mail.");
      setEmailOtpSent(true); // ✅ FIXED
      setEmailOtpVerified(false);
    } catch (error) {
      const errData = error.response?.data;
      if (errData?.errors && errData.errors.length > 0) {
        errData.errors.forEach(err => {
          if (err.field === 'email') setError("email", { type: "manual", message: err.message });
        });
      } else if (errData?.message && /email/i.test(errData.message)) {
        setError("email", { type: "manual", message: errData.message });
      } else {
        notification.error({
          message: "OTP Error",
          description: errData?.message || "Failed to send OTP",
        });
      }
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!enteredEmailOtp) {
      message.error("Please enter the OTP");
      return;
    }
    setEmailOtpLoading(true);
    try {
      await apiService.post("/otp/email-otp/verify", {
        email: getValues("email"),
        otp: enteredEmailOtp,
      });
      message.success("Email Verified Successfully!");
      setEmailOtpVerified(true);
      setEmailOtpSent(false); // ✅ FIXED
    } catch (error) {
      message.error(error?.response?.data?.message || "Invalid Email OTP");
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setEmailOtpSent(false); // ✅ FIXED
    setEmailOtpVerified(false);
    setEnteredEmailOtp("");
  };

  // --- NAVIGATION ---
  const handleNext = async () => {
    let fieldsToValidate = [];

    if (currentStep === 0) {
      if (!otpVerified || !emailOtpVerified) {
        message.error("Please verify mobile and email first.");
        return;
      }

      fieldsToValidate = [
        "first_name",
        "last_name",
        "email",
        "mobile.number",
        "password",
        "confirmPassword",
      ];
    } else if (currentStep === 1) {
      fieldsToValidate = [
        "store_details.store_name",
        "store_details.store_type",
        "store_details.categories",
        "store_details.store_address",
        "store_details.country",
        "store_details.state",
        "store_details.city",
        "store_details.pincode",
      ];
    } else if (currentStep === 2) {
      fieldsToValidate = [
        "registration.trade_license_number",
        "registration.trn_number",
        "bank_details.bank_account_number",
        "bank_details.iban",
        "bank_details.account_holder_name",
        "bank_details.bank_name",
      ];
    } else if (currentStep === 3) {
      fieldsToValidate = [
        "contacts.primary_contact.name",
        "contacts.primary_contact.mobile",
        "contacts.primary_contact.email",
      ];
    }

    else if (currentStep === 4) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    const valid = await trigger(fieldsToValidate);

    if (valid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) window.history.back();
    else setCurrentStep((prev) => prev - 1);
  };

  const onError = (errors) => {
    
    if (Object.keys(errors).length > 0) {
      if (errors.bank_details || errors.registration) {
        message.error("Please fix errors in Business & Bank Details (Step 3)");
        setCurrentStep(2);
      } else if (errors.documents && currentStep === steps.length - 1) {
        message.error("Please upload all mandatory documents.");
      } else if (errors.store_details) {
        message.error("Please fix errors in Store Info (Step 2)");
        setCurrentStep(1);
      } else {
        message.error("Please fill all required fields.");
      }
    }
  };

  // --- SUBMIT ---
  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      message.error("Passwords do not match");
      return;
    }
    if (!data.meta?.agreed_to_terms) {
      message.error("You must agree to the terms.");
      return;
    }

    setSubmitting(true);
    const countryObj = Country.getCountryByCode(data.store_details.country);
    const stateObj = State.getStateByCodeAndCountry(
      data.store_details.state,
      data.store_details.country,
    );

    let submitCountryCode = data.mobile.country_code;
    if (!submitCountryCode.startsWith("+")) submitCountryCode = `+${submitCountryCode}`;

    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      mobile: {
        country_code: submitCountryCode,
        number: data.mobile.number,
      },
      password: data.password,
      confirmPassword: data.confirmPassword,
      is_email_verified: emailOtpVerified,
      is_mobile_verified: otpVerified,
      store_details: {
        ...data.store_details,
        country: countryObj ? countryObj.name : data.store_details.country,
        state: stateObj ? stateObj.name : data.store_details.state,
      },
      registration: data.registration,
      bank_details: data.bank_details,
      contacts: data.contacts,
      documents: {
        trade_license: {
          type: "Trade License",
          path: data.documents.trade_license,
        },
        vat_certificate: {
          type: "VAT Certificate",
          path: data.documents.vat_certificate,
        },
        emirates_id: { type: "Emirates ID", path: data.documents.emirates_id },
        bank_letter: {
          type: "Bank Letter/Cheque",
          path: data.documents.bank_letter,
        },
        moa_document: { type: "MOA", path: data.documents.moa_document },
      },
      operations: {
        ...data.operations,
        avg_delivery_time_days: Number(data.operations.avg_delivery_time_days),
      },
      meta: { agreed_to_terms: data.meta.agreed_to_terms },
    };

    try {
      await apiService.post("/vendor/register", payload);
      setSuccess(true);
      message.success("Registration successful! Awaiting approval.");
    } catch (err) {
      const res = err.response?.data;
      
      if (res?.errors && Array.isArray(res.errors) && res.errors.length > 0) {
        let isStep0Error = false;

        res.errors.forEach((e) => {
          let fieldName = e.field;
          if (fieldName === "mobile.number" || fieldName === "mobile") fieldName = "mobile.number";
          
          setError(fieldName, { type: "server", message: e.message });
          if (["email", "mobile", "mobile.number"].includes(fieldName)) {
            isStep0Error = true;
          }
        });

        if (isStep0Error) setCurrentStep(0);

      } else if (res?.message) {
        const msg = res.message.toLowerCase();
        let isSet = false;
        
        if (msg.includes("email")) {
          setError("email", { type: "server", message: res.message });
          isSet = true;
        }
        if (msg.includes("mobile") || msg.includes("phone") || msg.includes("number")) {
          setError("mobile.number", { type: "server", message: res.message });
          isSet = true;
        }
        
        if (isSet) {
          setCurrentStep(0); 
        } else {
          message.error(res.message || "Registration failed.");
        }
      } else {
        message.error("Registration failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleFilled style={{ fontSize: "48px", color: "#52c41a" }} />
          </div>
          <Title level={2}>Registration Successful!</Title>
          <Text
            type="secondary"
            style={{ display: "block", marginBottom: "32px" }}
          >
            Your account is under review.
          </Text>
          <Button
            type="primary"
            size="large"
            href="/login"
            block
            style={{ background: themeColor, borderColor: themeColor }}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center py-10 px-4">
      <div style={{ maxWidth: 1200, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40, color: "white" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              background: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              marginBottom: 20,
              backdropFilter: "blur(10px)",
            }}
          >
            <ShopOutlined style={{ fontSize: 36, color: "#fff" }} />
          </div>
          <Title level={2} style={{ color: "#fff", margin: 0 }}>
            Vendor Registration (UAE)
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>
            Join the UAE's leading marketplace
          </Text>
        </div>

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={6}>
            <Card
              bordered={false}
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                height: "100%",
              }}
              bodyStyle={{ padding: 32 }}
            >
              <Steps direction="vertical" current={currentStep}>
                {steps.map((s, index) => (
                  <Steps.Step
                    key={index}
                    title={
                      <span
                        style={{
                          color:
                            currentStep >= index
                              ? "#fff"
                              : "rgba(255,255,255,0.5)",
                          fontWeight: "bold",
                        }}
                      >
                        {s.title}
                      </span>
                    }
                    icon={
                      <div
                        style={{
                          background:
                            currentStep >= index ? "#fff" : "transparent",
                          color:
                            currentStep >= index
                              ? themeColor
                              : "rgba(255,255,255,0.5)",
                          border: `1px solid ${currentStep >= index ? "#fff" : "rgba(255,255,255,0.5)"}`,
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {currentStep > index ? <CheckCircleOutlined /> : s.icon}
                      </div>
                    }
                  />
                ))}
              </Steps>
            </Card>
          </Col>

          <Col xs={24} lg={18}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              }}
              bodyStyle={{ padding: 40 }}
            >
              <Form
                layout="vertical"
                onFinish={handleSubmit(onSubmit, onError)}
                className="ant-form"
              >
                <Spin spinning={submitting}>
                  {/* STEP 0: PERSONAL */}
                  <div
                    style={{ display: currentStep === 0 ? "block" : "none" }}
                  >
                    <Title level={4} className="mb-6 text-gray-700">
                      <UserOutlined /> Personal Information
                    </Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="First Name"
                          required
                          validateStatus={errors.first_name ? "error" : ""}
                          help={errors.first_name?.message}
                        >
                          <Controller
                            name="first_name"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Last Name"
                          required
                          validateStatus={errors.last_name ? "error" : ""}
                          help={errors.last_name?.message}
                        >
                          <Controller
                            name="last_name"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      label="Email"
                      required
                      validateStatus={errors.email ? "error" : ""}
                      help={errors.email?.message}
                    >
                      <div className="flex gap-2">
                        <Controller
                          name="email"
                          control={control}
                          rules={{
                            required: "Required",
                            pattern: {
                              value: /^\S+@\S+$/i,
                              message: "Invalid email",
                            },
                          }}
                          render={({ field }) => (
                            <Input
                              size="large"
                              {...field}
                              disabled={emailOtpVerified}
                              onChange={(e) => {
                                field.onChange(e);
                                clearErrors("email"); 
                              }}
                            />
                          )}
                        />
                        <Button
                          onClick={
                            emailOtpVerified
                              ? handleChangeEmail
                              : handleSendEmailOtp
                          }
                          type={emailOtpVerified ? "default" : "primary"}
                          loading={emailOtpLoading}
                          style={!emailOtpVerified ? { backgroundColor: '#5C039B', borderColor: '#5C039B' } : {}}
                        >
                          {emailOtpVerified ? "Change" : "Send OTP"}
                        </Button>
                      </div>
                      {emailOtpSent && !emailOtpVerified && ( // ✅ FIXED
                        <div className="mt-2 flex gap-2">
                          <Input
                            placeholder="Enter Email OTP"
                            value={enteredEmailOtp}
                            onChange={(e) => setEnteredEmailOtp(e.target.value)}
                          />
                          <Button onClick={handleVerifyEmailOtp} type="primary" style={{ backgroundColor: '#5C039B', borderColor: '#5C039B' }}>
                            Verify
                          </Button>
                        </div>
                      )}
                      {emailOtpVerified && (
                        <span className="text-green-500 mt-2 inline-block">
                          <CheckCircleFilled /> Verified
                        </span>
                      )}
                    </Form.Item>

                    {/* 🔥 FLAGCDN MOBILE INPUT WITH STRICT VALIDATION */}
                    <Form.Item
                      label="Mobile Number"
                      required
                      validateStatus={errors.mobile?.number ? "error" : ""}
                      help={errors.mobile?.number?.message}
                    >
                      <Space.Compact style={{ width: '100%' }}>
                        <Controller
                          name="mobile.country_code"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              showSearch
                              optionFilterProp="children"
                              disabled={otpVerified || otpSent} // ✅ FIXED
                              className="custom-phone-select"
                              style={{ width: '30%', minWidth: '120px' }}
                              popupMatchSelectWidth={300}
                              onChange={(val) => {
                                field.onChange(val);
                                trigger("mobile.number");
                              }}
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
                          )}
                        />
                        <Controller
                          name="mobile.number"
                          control={control}
                          rules={{
                            required: "Mobile number is required",
                            validate: (value) => {
                              if (!value) return "Mobile number is required";
                              const code = getValues("mobile.country_code");
                              const fullNum = `+${code}${value}`;
                              const phoneNumber = parsePhoneNumberFromString(fullNum);
                              return (phoneNumber && phoneNumber.isValid()) || `Invalid mobile number format for +${code}`;
                            }
                          }}
                          render={({ field }) => (
                            <Input
                              size="large"
                              {...field}
                              disabled={otpVerified || otpSent} // ✅ FIXED
                              className="w-full"
                              style={{ width: '50%', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                              placeholder="501234567"
                              onChange={(e) => {
                                field.onChange(e.target.value.replace(/\D/g, ""));
                                clearErrors("mobile.number");
                                trigger("mobile.number");
                              }}
                            />
                          )}
                        />
                        {!otpVerified && !otpSent && ( // ✅ FIXED
                          <Button
                            type="primary"
                            size="large"
                            onClick={handleSendOtp}
                            disabled={!watchMobileNumber || errors.mobile?.number}
                            loading={otpLoading}
                            style={{ backgroundColor: '#5C039B', borderColor: '#5C039B', color: '#fff', width: '20%', minWidth: '100px' }}
                          >
                            Send OTP
                          </Button>
                        )}
                        {(otpSent || otpVerified) && ( // ✅ FIXED
                          <Button
                            size="large"
                            icon={<EditOutlined />}
                            onClick={handleChangeNumber}
                            style={{ width: '20%', minWidth: '100px' }}
                          >
                            Change
                          </Button>
                        )}
                      </Space.Compact>

                      {otpSent && ( // ✅ FIXED
                        <div className="mt-4 p-4 bg-gray-50 border border-purple-100 rounded-lg">
                          <Text type="secondary" className="block mb-3">
                            Enter the 6-digit code sent to <strong>+{getValues("mobile.country_code")} {watchMobileNumber}</strong>
                          </Text>
                          <div className="flex gap-3 items-center">
                            <Input
                              placeholder="Enter OTP"
                              maxLength={6}
                              value={enteredOtp}
                              onChange={(e) => setEnteredOtp(e.target.value)}
                              size="large"
                              style={{ width: '200px' }}
                            />
                            <Button
                              type="primary"
                              onClick={handleVerifyOtp}
                              loading={otpLoading}
                              size="large"
                              style={{ backgroundColor: '#5C039B', borderColor: '#5C039B' }}
                            >
                              Verify OTP
                            </Button>
                          </div>
                        </div>
                      )}
                      {otpVerified && (
                        <span className="text-green-500 mt-2 inline-block">
                          <CheckCircleFilled /> Verified
                        </span>
                      )}
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Password"
                          required
                          help={errors.password?.message}
                          validateStatus={errors.password ? "error" : ""}
                        >
                          <Controller
                            name="password"
                            control={control}
                            rules={{
                              required: "Required",
                              minLength: { value: 6, message: "Min 6 chars" },
                            }}
                            render={({ field }) => (
                              <Input.Password size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Confirm Password"
                          required
                          help={errors.confirmPassword?.message}
                          validateStatus={errors.confirmPassword ? "error" : ""}
                        >
                          <Controller
                            name="confirmPassword"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Input.Password size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>

                  {/* STEP 1: STORE */}
                  <div
                    style={{ display: currentStep === 1 ? "block" : "none" }}
                  >
                    <Title level={4} className="mb-6 text-gray-700">
                      <ShopOutlined /> Store Details
                    </Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Store Name"
                          required
                          help={errors.store_details?.store_name?.message}
                          validateStatus={
                            errors.store_details?.store_name ? "error" : ""
                          }
                        >
                          <Controller
                            name="store_details.store_name"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Business Type" required>
                          <Controller
                            name="store_details.store_type"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Select
                                size="large"
                                options={businessTypes}
                                {...field}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item label="Website">
                      <Controller
                        name="store_details.website"
                        control={control}
                        render={({ field }) => (
                          <Input
                            size="large"
                            prefix={<LinkOutlined />}
                            placeholder="https://"
                            {...field}
                          />
                        )}
                      />
                    </Form.Item>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Store Logo">
                          <Controller
                            name="store_details.logo"
                            control={control}
                            render={({ field }) => (
                              <GenericUploader
                                value={field.value}
                                onChange={field.onChange}
                                label="Store Logo"
                                listType="picture-card"
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Description">
                          <Controller
                            name="store_details.store_description"
                            control={control}
                            render={({ field }) => (
                              <TextArea rows={4} {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      label="Categories"
                      required
                      help={errors.store_details?.categories?.message}
                      validateStatus={
                        errors.store_details?.categories ? "error" : ""
                      }
                    >
                      <Controller
                        name="store_details.categories"
                        control={control}
                        rules={{ required: "Required" }}
                        render={({ field }) => (
                          <Select
                            mode="multiple"
                            size="large"
                            options={categories}
                            {...field}
                          />
                        )}
                      />
                    </Form.Item>
                    <Divider>Location</Divider>
                    <Form.Item
                      label="Address"
                      required
                      help={errors.store_details?.store_address?.message}
                      validateStatus={
                        errors.store_details?.store_address ? "error" : ""
                      }
                    >
                      <Controller
                        name="store_details.store_address"
                        control={control}
                        rules={{ required: "Required" }}
                        render={({ field }) => (
                          <Input size="large" {...field} />
                        )}
                      />
                    </Form.Item>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Country" required>
                          <Controller
                            name="store_details.country"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Select
                                size="large"
                                showSearch
                                optionFilterProp="children"
                                onChange={(val) => {
                                  field.onChange(val);
                                  setValue("store_details.state", null);
                                }}
                                value={field.value}
                              >
                                {Country.getAllCountries().map((c) => (
                                  <Option key={c.isoCode} value={c.isoCode}>
                                    {c.name}
                                  </Option>
                                ))}
                              </Select>
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="State / Emirate" required>
                          <Controller
                            name="store_details.state"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Select
                                size="large"
                                showSearch
                                optionFilterProp="children"
                                onChange={(val) => {
                                  field.onChange(val);
                                  setValue("store_details.city", null);
                                }}
                                value={field.value}
                              >
                                {statesList.map((s) => (
                                  <Option key={s.isoCode} value={s.isoCode}>
                                    {s.name}
                                  </Option>
                                ))}
                              </Select>
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="City" required>
                          <Controller
                            name="store_details.city"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Select
                                size="large"
                                showSearch
                                optionFilterProp="children"
                                {...field}
                              >
                                {citiesList.map((c) => (
                                  <Option key={c.name} value={c.name}>
                                    {c.name}
                                  </Option>
                                ))}
                              </Select>
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="PO Box / Zip Code"
                          required
                          help={errors.store_details?.pincode?.message}
                          validateStatus={
                            errors.store_details?.pincode ? "error" : ""
                          }
                        >
                          <Controller
                            name="store_details.pincode"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Divider>Social Media</Divider>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Facebook">
                          <Controller
                            name="store_details.social_links.facebook"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Instagram">
                          <Controller
                            name="store_details.social_links.instagram"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Divider>Operations</Divider>
                    <Form.Item label="Delivery Modes">
                      <Controller
                        name="operations.delivery_modes"
                        control={control}
                        render={({ field }) => (
                          <Checkbox.Group
                            options={["self", "courier", "pickup"]}
                            {...field}
                          />
                        )}
                      />
                    </Form.Item>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Return Policy">
                          <Controller
                            name="operations.return_policy"
                            control={control}
                            render={({ field }) => (
                              <Input
                                placeholder="e.g. 7 days return"
                                {...field}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Avg Delivery (Days)">
                          <Controller
                            name="operations.avg_delivery_time_days"
                            control={control}
                            render={({ field }) => (
                              <Input type="number" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>

                  {/* STEP 2: BUSINESS & BANK */}
                  <div
                    style={{ display: currentStep === 2 ? "block" : "none" }}
                  >
                    <Title level={4} className="mb-6 text-gray-700">
                      <FileTextOutlined /> Business Registration (UAE)
                    </Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Trade License Number"
                          required
                          help={
                            errors.registration?.trade_license_number?.message
                          }
                          validateStatus={
                            errors.registration?.trade_license_number
                              ? "error"
                              : ""
                          }
                        >
                          <Controller
                            name="registration.trade_license_number"
                            control={control}
                            rules={{
                              required: "Trade License Number is required",
                              minLength: {
                                value: 5,
                                message: "Minimum 5 characters",
                              },
                              pattern: {
                                value: /^[A-Za-z0-9\-\/]+$/,
                                message:
                                  "Only letters, numbers, - and / allowed",
                              },
                            }}
                            render={({ field }) => (
                              <Input
                                size="large"
                                placeholder="License No."
                                {...field}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="VAT / TRN Number"
                          required
                          help={errors.registration?.trn_number?.message}
                          validateStatus={
                            errors.registration?.trn_number ? "error" : ""
                          }
                        >
                          <Controller
                            name="registration.trn_number"
                            control={control}
                            rules={{
                              required: "TRN number is required",
                              pattern: {
                                value: /^\d{15}$/,
                                message: "TRN must be exactly 15 digits",
                              },
                            }}
                            render={({ field }) => (
                              <Input
                                size="large"
                                placeholder="Tax Registration No."
                                {...field}
                                maxLength={15}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value.replace(/\D/g, ""),
                                  )
                                }
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Title level={4} className="mt-6 mb-6 text-gray-700">
                      <BankOutlined /> Bank Details (UAE)
                    </Title>
                    <Form.Item
                      label="Account Holder Name"
                      required
                      help={errors.bank_details?.account_holder_name?.message}
                      validateStatus={
                        errors.bank_details?.account_holder_name ? "error" : ""
                      }
                    >
                      <Controller
                        name="bank_details.account_holder_name"
                        control={control}
                        rules={{
                          required: "Account holder name is required",
                          pattern: {
                            value: /^[A-Za-z ]+$/,
                            message: "Only letters and spaces allowed",
                          },
                        }}
                        render={({ field }) => (
                          <Input size="large" {...field} />
                        )}
                      />
                    </Form.Item>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Bank Name"
                          required
                          help={errors.bank_details?.bank_name?.message}
                          validateStatus={
                            errors.bank_details?.bank_name ? "error" : ""
                          }
                        >
                          <Controller
                            name="bank_details.bank_name"
                            control={control}
                            rules={{
                              required: "Bank name is required",
                              pattern: {
                                value: /^[A-Za-z ]+$/,
                                message: "Invalid bank name",
                              },
                            }}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Account Number"
                          required
                          help={
                            errors.bank_details?.bank_account_number?.message
                          }
                          validateStatus={
                            errors.bank_details?.bank_account_number
                              ? "error"
                              : ""
                          }
                        >
                          <Controller
                            name="bank_details.bank_account_number"
                            control={control}
                            rules={{
                              required: "Account number is required",
                              pattern: {
                                value: /^\d{6,20}$/,
                                message: "Account number must be 6–20 digits",
                              },
                            }}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="IBAN"
                          required
                          help={errors.bank_details?.iban?.message}
                          validateStatus={
                            errors.bank_details?.iban ? "error" : ""
                          }
                        >
                          <Controller
                            name="bank_details.iban"
                            control={control}
                            rules={{
                              required: "IBAN is required",
                              pattern: {
                                value: /^AE\d{21}$/,
                                message:
                                  "Invalid UAE IBAN (must start with AE)",
                              },
                            }}
                            render={({ field }) => (
                              <Input
                                size="large"
                                placeholder="AE..."
                                {...field}
                                onChange={(e) =>
                                  field.onChange(e.target.value.toUpperCase())
                                }
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Swift / BIC Code"
                          help={errors.bank_details?.swift_code?.message}
                          validateStatus={
                            errors.bank_details?.swift_code ? "error" : ""
                          }
                        >
                          <Controller
                            name="bank_details.swift_code"
                            control={control}
                            rules={{
                              validate: (value) => {
                                if (!value) return true; 
                                return (
                                  /^[A-Z0-9]{8,11}$/.test(value) ||
                                  "Invalid SWIFT/BIC (8-11 alphanum)"
                                );
                              },
                            }}
                            render={({ field }) => (
                              <Input
                                size="large"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(e.target.value.toUpperCase())
                                }
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>

                  {/* STEP 3: CONTACTS */}
                  <div
                    style={{ display: currentStep === 3 ? "block" : "none" }}
                  >
                    <Title level={4} className="mb-6 text-gray-700">
                      <TeamOutlined /> Primary Contact
                    </Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Name"
                          required
                          help={errors.contacts?.primary_contact?.name?.message}
                          validateStatus={
                            errors.contacts?.primary_contact?.name
                              ? "error"
                              : ""
                          }
                        >
                          <Controller
                            name="contacts.primary_contact.name"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Designation">
                          <Controller
                            name="contacts.primary_contact.designation"
                            control={control}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Mobile"
                          required
                          help={
                            errors.contacts?.primary_contact?.mobile?.message
                          }
                          validateStatus={
                            errors.contacts?.primary_contact?.mobile
                              ? "error"
                              : ""
                          }
                        >
                          <Controller
                            name="contacts.primary_contact.mobile"
                            control={control}
                            rules={{
                              required: "Required",
                              minLength: { value: 9, message: "Min 9 digits" },
                            }}
                            render={({ field }) => (
                              <Input
                                size="large"
                                {...field}
                                maxLength={15}
                                placeholder="Enter mobile number"
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value.replace(/\D/g, ""),
                                  )
                                }
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Email"
                          required
                          help={
                            errors.contacts?.primary_contact?.email?.message
                          }
                          validateStatus={
                            errors.contacts?.primary_contact?.email
                              ? "error"
                              : ""
                          }
                        >
                          <Controller
                            name="contacts.primary_contact.email"
                            control={control}
                            rules={{
                              required: "Required",
                              pattern: {
                                value: /^\S+@\S+$/i,
                                message: "Invalid email address",
                              },
                            }}
                            render={({ field }) => (
                              <Input
                                size="large"
                                placeholder="Enter email address"
                                {...field}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Divider />
                    <Title level={4} className="mb-6 text-gray-700">
                      Support Contact
                    </Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Name">
                          <Controller
                            name="contacts.support_contact.name"
                            control={control}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Designation">
                          <Controller
                            name="contacts.support_contact.designation"
                            control={control}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Mobile"
                          help={
                            errors.contacts?.support_contact?.mobile?.message
                          }
                          validateStatus={
                            errors.contacts?.support_contact?.mobile
                              ? "error"
                              : ""
                          }
                        >
                          <Controller
                            name="contacts.support_contact.mobile"
                            control={control}
                            rules={{
                              minLength: { value: 9, message: "Min 9 digits" },
                            }}
                            render={({ field }) => (
                              <Input
                                size="large"
                                {...field}
                                maxLength={15}
                                placeholder="Enter mobile number"
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value.replace(/\D/g, ""),
                                  )
                                }
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Email"
                          help={
                            errors.contacts?.support_contact?.email?.message
                          }
                          validateStatus={
                            errors.contacts?.support_contact?.email
                              ? "error"
                              : ""
                          }
                        >
                          <Controller
                            name="contacts.support_contact.email"
                            control={control}
                            rules={{
                              pattern: {
                                value: /^\S+@\S+$/i,
                                message: "Invalid email address",
                              },
                            }}
                            render={({ field }) => (
                              <Input
                                size="large"
                                placeholder="Enter email address"
                                {...field}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>

                  {/* STEP 4: DOCUMENTS */}
                  <div
                    style={{ display: currentStep === 4 ? "block" : "none" }}
                  >
                    <Title
                      level={4}
                      className="mb-6 text-gray-700 flex items-center gap-2"
                    >
                      <CloudUploadOutlined /> Document Uploads (UAE)
                    </Title>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          name: "documents.trade_license",
                          label: "Trade License Copy (Mandatory)",
                        },
                        {
                          name: "documents.vat_certificate",
                          label: "VAT Certificate (TRN) (Mandatory)",
                        },
                        {
                          name: "documents.emirates_id",
                          label: "Emirates ID (Owner/Manager) (Mandatory)",
                        },
                        {
                          name: "documents.bank_letter",
                          label: "Bank Confirmation Letter (with IBAN)",
                        },
                        {
                          name: "documents.moa_document",
                          label: "Memorandum of Association (MOA)",
                        },
                      ].map((doc) => (
                        <div key={doc.name} className="w-full">
                          <Form.Item
                            label={
                              <span className="font-semibold text-gray-600">
                                {doc.label}
                              </span>
                            }
                            required={doc.label.includes("Mandatory")}
                            help={
                              errors.documents?.[doc.name.split(".")[1]]
                                ?.message
                            }
                            validateStatus={
                              errors.documents?.[doc.name.split(".")[1]]
                                ? "error"
                                : ""
                            }
                            style={{ marginBottom: 0, width: "100%" }}
                            className="w-full"
                          >
                            <Controller
                              name={doc.name}
                              control={control}
                              rules={{
                                validate: (value) => {
                                  if (currentStep !== 4) return true;
                                  if (doc.label.includes("Mandatory")) {
                                    return value
                                      ? true
                                      : "Document is required";
                                  }
                                  return true;
                                },
                              }}
                              render={({ field }) => (
                                <GenericUploader
                                  value={field.value}
                                  onChange={field.onChange}
                                  label={doc.label}
                                />
                              )}
                            />
                          </Form.Item>
                        </div>
                      ))}
                    </div>

                    <Divider className="my-8" />

                    <Form.Item>
                      <Controller
                        name="meta.agreed_to_terms"
                        control={control}
                        rules={{ required: "You must agree to terms" }}
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          >
                            I agree to the Terms and Conditions
                          </Checkbox>
                        )}
                      />
                      {errors.meta?.agreed_to_terms && (
                        <p style={{ color: "red", marginTop: 5 }}>
                          You must agree to the terms
                        </p>
                      )}
                    </Form.Item>
                  </div>

                  {/* NAVIGATION BUTTONS */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 32,
                      paddingTop: 24,
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <Button
                      size="large"
                      onClick={handleBack}
                      icon={<ArrowLeftOutlined />}
                      disabled={currentStep === 0}
                    >
                      Back
                    </Button>
                    {currentStep < steps.length - 1 ? (
                      <Button
                        type="primary"
                        size="large"
                        onClick={handleNext}
                        style={{
                          background: themeColor,
                          borderColor: themeColor,
                        }}
                        icon={<ArrowRightOutlined />}
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={submitting}
                        style={{
                          background: themeColor,
                          borderColor: themeColor,
                        }}
                        icon={<CheckCircleOutlined />}
                      >
                        Complete Registration
                      </Button>
                    )}
                  </div>
                </Spin>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
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

export default SellerPage;