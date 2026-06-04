import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  User, Mail, Phone, Lock, Building2, Briefcase,
  ChevronLeft, ChevronRight, Check, ArrowRight,
  Edit, ShieldCheck, TrendingUp, Home, DollarSign, FileCheck
} from "lucide-react";
import {
  Form, Input, Select, Button, Checkbox, message, Spin,
  Space, Typography, Tag, Radio, Divider, Card, Row, Col, notification
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

import { Country } from 'country-state-city';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const { Option } = Select;
const { Title, Text } = Typography;

const maritalStatusOptions = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
  { value: "Widowed", label: "Widowed" },
];

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const nationalityOptions = [
  { value: "AE", label: "UAE National" },
  { value: "IN", label: "Indian" },
  { value: "PK", label: "Pakistani" },
  { value: "US", label: "American" },
  { value: "GB", label: "British" },
  { value: "SA", label: "Saudi" },
  { value: "EG", label: "Egyptian" },
  { value: "JO", label: "Jordanian" },
  { value: "LB", label: "Lebanese" },
  { value: "SY", label: "Syrian" },
  { value: "IQ", label: "Iraqi" },
  { value: "YE", label: "Yemeni" },
  { value: "OM", label: "Omani" },
  { value: "QA", label: "Qatari" },
  { value: "KW", label: "Kuwaiti" },
  { value: "BH", label: "Bahraini" },
];

const VaultRegister = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState({
    partners: true,
    submitting: false,
    otpSending: false,
    otpVerifying: false,
    emailOtpSending: false,
    emailOtpVerifying: false,
  });

  const [partners, setPartners] = useState([]);
  const [selectedAgentMode, setSelectedAgentMode] = useState("freelance");

  const [countryCode, setCountryCode] = useState("971");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [emailOtpValue, setEmailOtpValue] = useState("");

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    watch,
    register,
    setError,
    clearErrors,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      agentMode: "freelance",
      maritalStatus: null,
      nationality: null,
      dateOfBirth: "",
      gender: null,
    },
  });

  const watchEmail = watch("email");
  const watchAgentMode = watch("agentMode");

  useEffect(() => {
    setSelectedAgentMode(watchAgentMode || "freelance");
  }, [watchAgentMode]);

  const countryOptions = useMemo(() => {
    const priorityIsoCodes = ["AE", "IN", "SA", "US", "GB"];
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

  useEffect(() => {
    register("mobile_number", {
      required: "Mobile number is required",
      validate: (value) => {
        if (!value) return "Mobile number is required";
        const fullNum = `+${countryCode}${value}`;
        const phoneNumber = parsePhoneNumberFromString(fullNum);
        if (phoneNumber && phoneNumber.isValid()) return true;
        return `Invalid mobile number format for +${countryCode}`;
      },
    });
  }, [register, countryCode]);

  useEffect(() => {
    const fetchPartners = async () => {
      setLoading((prev) => ({ ...prev, partners: true }));
      try {
        const response = await apiService.get("/vault/partner/dropdown");
        if (response.success && response.data) {
          setPartners(response.data);
        } else if (response.data && Array.isArray(response.data)) {
          setPartners(response.data);
        } else {
          setPartners([]);
        }
      } catch (error) {
        setPartners([]);
      } finally {
        setLoading((prev) => ({ ...prev, partners: false }));
      }
    };
    fetchPartners();
  }, []);

  const handleSendEmailOtp = async () => {
    const isEmailValid = await trigger("email");
    if (!isEmailValid) return;
    setLoading((prev) => ({ ...prev, emailOtpSending: true }));
    try {
      await apiService.post("https://xoto.ae/api/otp/email-otp/send", { email: watchEmail });
      message.success("OTP sent! Please check your email inbox.");
      setShowEmailOtpInput(true);
    } catch (error) {
      message.error("Failed to send Email OTP");
    } finally {
      setLoading((prev) => ({ ...prev, emailOtpSending: false }));
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtpValue || emailOtpValue.length < 4) return message.error("Please enter a valid OTP");
    setLoading((prev) => ({ ...prev, emailOtpVerifying: true }));
    try {
      await apiService.post("https://xoto.ae/api/otp/email-otp/verify", { email: watchEmail, otp: emailOtpValue });
      message.success("Email verified successfully!");
      setIsEmailVerified(true);
      setShowEmailOtpInput(false);
      clearErrors("email");
    } catch (error) {
      message.error("Invalid OTP. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, emailOtpVerifying: false }));
    }
  };

  const handleSendOtp = async () => {
    const isMobileValid = await trigger("mobile_number");
    if (!isMobileValid) return;
    setLoading((prev) => ({ ...prev, otpSending: true }));
    try {
      await apiService.post("/otp/send-otp", {
        country_code: `+${countryCode}`,
        phone_number: mobileNumber,
      });
      message.success(`OTP sent to +${countryCode}${mobileNumber}`);
      setShowOtpInput(true);
    } catch (error) {
      message.error("Failed to send OTP");
    } finally {
      setLoading((prev) => ({ ...prev, otpSending: false }));
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length < 4) return message.error("Please enter a valid OTP");
    setLoading((prev) => ({ ...prev, otpVerifying: true }));
    try {
      await apiService.post("/otp/verify-otp", {
        country_code: `+${countryCode}`,
        phone_number: mobileNumber,
        otp: otpValue,
      });
      message.success("Mobile number verified successfully!");
      setIsMobileVerified(true);
      setShowOtpInput(false);
      clearErrors("mobile_number");
    } catch (error) {
      message.error("Invalid OTP. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, otpVerifying: false }));
    }
  };

  const handleChangeNumber = () => {
    setIsMobileVerified(false);
    setShowOtpInput(false);
    setOtpValue("");
  };

  const handleChangeEmail = () => {
    setIsEmailVerified(false);
    setShowEmailOtpInput(false);
    setEmailOtpValue("");
  };

  const next = async () => {
    let isValid = true;
    if (step === 0) {
      const fields = ["first_name", "last_name", "email", "password", "confirmPassword", "mobile_number", "agentMode"];
      if (selectedAgentMode === "partner") fields.push("partnerId");
      const formValid = await trigger(fields);
      if (!isMobileVerified) { setError("mobile_number", { type: "manual", message: "Please verify mobile number" }); isValid = false; }
      if (!isEmailVerified) { setError("email", { type: "manual", message: "Please verify your email" }); isValid = false; }
      if (!formValid) isValid = false;
    } else if (step === 1) {
      const fields = ["maritalStatus", "nationality", "dateOfBirth", "gender"];
      const formValid = await trigger(fields);
      if (!formValid) isValid = false;
    }
    if (isValid) setStep((s) => s + 1);
  };

  const back = () => setStep((s) => s - 1);

  const onSubmit = async (data) => {
    if (!isEmailVerified || !isMobileVerified)
      return message.error("Please verify your email and mobile number");
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { type: "manual", message: "Passwords do not match" });
      return;
    }
    setLoading((prev) => ({ ...prev, submitting: true }));

    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone_number: mobileNumber.replace(/\D/g, ""),
      country_code: `+${countryCode}`,
      password: data.password,
      agentMode: data.agentMode,
      partnerId: data.agentMode === "partner" ? data.partnerId : undefined,
      maritalStatus: data.maritalStatus || null,
      nationality: data.nationality || null,
      dateOfBirth: data.dateOfBirth || null,
      gender: data.gender || null,
    };

    try {
      await apiService.post("/vault/agent/signup", payload);
      
      notification.success({
        message: 'Registration Successful!',
        description: selectedAgentMode === "partner" 
          ? 'Your application is complete. Awaiting admin approval.' 
          : 'Freelance agent registered successfully. Awaiting verification.',
        placement: 'topRight',
        duration: 5,
      });

      reset();
      setStep(0);
      setMobileNumber("");
      setIsMobileVerified(false);
      setIsEmailVerified(false);
      setCountryCode("971");

    } catch (err) {
      notification.error({
        message: 'Registration Failed',
        description: err.response?.data?.message || "Check validation rules and try again.",
        placement: 'topRight',
      });
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 font-sans overflow-x-hidden">

      <style>{`
        .agent-type-radio .ant-radio-button-wrapper {
          background: #fff;
          color: #4A027C;
          border-color: #d9d9d9;
          font-weight: 500;
        }
        .agent-type-radio .ant-radio-button-wrapper:hover {
          color: #4A027C;
          border-color: #4A027C;
        }
        .agent-type-radio .ant-radio-button-wrapper-checked {
          background: #4A027C !important;
          color: #fff !important;
          border-color: #4A027C !important;
        }
        .agent-type-radio .ant-radio-button-wrapper-checked::before {
          background: #4A027C !important;
        }
        .custom-primary-btn {
          background-color: #4A027C !important;
          border-color: #4A027C !important;
          color: #fff !important;
        }
        .custom-primary-btn:hover {
          background-color: #380160 !important;
          border-color: #380160 !important;
          color: #fff !important;
        }
        .custom-primary-btn:disabled {
          background-color: #f5f5f5 !important;
          border-color: #d9d9d9 !important;
          color: rgba(0, 0, 0, 0.25) !important;
        }
        .ant-form-item-label > label {
          font-weight: 500 !important;
          color: #374151 !important;
          font-size: 15px !important;
        }
      `}</style>

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[1200px] flex flex-col lg:flex-row border border-gray-200 overflow-hidden">

        {/* LEFT SIDEBAR */}
        <div className="w-full lg:w-[30%] bg-[#4A027C] text-white p-8 lg:p-10 flex flex-col justify-between hidden lg:flex">
          <div>
            <div className="flex items-center gap-4 mb-12">
              <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                <Home className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-widest">VAULT</h2>
                <p className="text-purple-200 text-sm mt-1">Mortgage Partners</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-white/10 p-2.5 rounded-lg"><DollarSign className="w-5 h-5 text-purple-200" /></div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Earn Commission</h3>
                  <p className="text-purple-200 text-sm mt-1 leading-relaxed">Highly competitive commission structure for all successful referrals.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-white/10 p-2.5 rounded-lg"><TrendingUp className="w-5 h-5 text-purple-200" /></div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Lead Generation</h3>
                  <p className="text-purple-200 text-sm mt-1 leading-relaxed">Get exclusive access to high-quality mortgage leads instantly.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-white/10 p-2.5 rounded-lg"><FileCheck className="w-5 h-5 text-purple-200" /></div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Fast Approval</h3>
                  <p className="text-purple-200 text-sm mt-1 leading-relaxed">Experience our streamlined, lightning-fast verification process.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/20 flex items-center gap-3 text-purple-200 text-sm">
            <ShieldCheck className="w-6 h-6" />
            <span>Secure & Verified Partner Platform</span>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="w-full lg:w-[70%] p-6 sm:p-10 flex flex-col justify-center bg-white">
          <div className="flex-none mb-6 sm:mb-8">
            <Title level={2} className="!mb-2 text-gray-800 !font-bold">Create Account</Title>
            <Text type="secondary" className="text-base">Please fill in your details to register as a Vault agent.</Text>
          </div>

          <div className="flex-1 w-full">
            <Form layout="vertical" size="large" onSubmitCapture={handleSubmit(onSubmit)} className="space-y-6">

              {/* ── SECTION 1 (Step 0) ── */}
              {step === 0 && (
                <div className="animate-fade-in space-y-6">
                  
                  {/* Row 1: Agent Mode & Partner Selection */}
                  <Row gutter={[24, 20]}>
                    <Col xs={24} lg={selectedAgentMode === "partner" ? 12 : 24}>
                      <Form.Item label="Agent Registration Type" required className="mb-0">
                        <Controller
                          name="agentMode"
                          control={control}
                          rules={{ required: "Please select an agent type" }}
                          render={({ field }) => (
                            <Radio.Group {...field} buttonStyle="solid" className="w-full agent-type-radio flex">
                              <Radio.Button value="freelance" className="flex-1 text-center flex items-center justify-center text-[13px] sm:text-base py-1">
                                <Briefcase className="inline mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Freelance Agent
                              </Radio.Button>
                              <Radio.Button value="partner" className="flex-1 text-center flex items-center justify-center text-[13px] sm:text-base py-1">
                                <Building2 className="inline mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Partner Agent
                              </Radio.Button>
                            </Radio.Group>
                          )}
                        />
                        {errors.agentMode && <div className="text-red-500 text-sm mt-1">{errors.agentMode.message}</div>}
                      </Form.Item>
                    </Col>
                    {selectedAgentMode === "partner" && (
                      <Col xs={24} lg={12}>
                        <Form.Item label="Select Partner Company" required validateStatus={errors.partnerId ? "error" : ""} help={errors.partnerId?.message} className="mb-0">
                          <Controller
                            name="partnerId"
                            control={control}
                            rules={{ required: "Partner company selection is required" }}
                            render={({ field }) => (
                              <Select {...field} placeholder="Search and select partner" loading={loading.partners} showSearch className="w-full">
                                {partners.map((partner) => (
                                  <Option key={partner._id} value={partner._id}>{partner.companyName}</Option>
                                ))}
                              </Select>
                            )}
                          />
                        </Form.Item>
                      </Col>
                    )}
                  </Row>

                  {/* Row 2: Names */}
                  <Row gutter={[24, 20]}>
                    <Col xs={24} lg={12}>
                      <Form.Item label="First Name" required validateStatus={errors.first_name ? "error" : ""} help={errors.first_name?.message} className="mb-0">
                        <Controller name="first_name" control={control} rules={{ required: "Required" }} render={({ field }) => <Input prefix={<User className="text-gray-400 w-5 h-5 mr-2" />} placeholder="John" {...field} />} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Form.Item label="Last Name" required validateStatus={errors.last_name ? "error" : ""} help={errors.last_name?.message} className="mb-0">
                        <Controller name="last_name" control={control} rules={{ required: "Required" }} render={({ field }) => <Input prefix={<User className="text-gray-400 w-5 h-5 mr-2" />} placeholder="Doe" {...field} />} />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Row 3: Email & Mobile (Responsive) */}
                  <Row gutter={[24, 20]}>
                    <Col xs={24} lg={12}>
                      <Form.Item
                        label={<Space>Email Address {isEmailVerified && <Tag color="success" className="text-sm px-2 py-0 ml-1">Verified</Tag>}</Space>}
                        required
                        validateStatus={errors.email ? "error" : ""}
                        help={errors.email?.message}
                        className="mb-0"
                      >
                        <Space.Compact block>
                          <Controller
                            name="email"
                            control={control}
                            rules={{ 
                              required: "Required", 
                              pattern: { value: /^\S+@\S+\.\S+$/i, message: "Invalid email" } 
                            }}
                            render={({ field }) => (
                              <Input 
                                {...field} 
                                placeholder="john@example.com" 
                                prefix={<Mail className="text-gray-400 w-5 h-5 mr-2" />} 
                                disabled={showEmailOtpInput || isEmailVerified} 
                                style={{ width: '100%' }}
                              />
                            )}
                          />
                          {!isEmailVerified && !showEmailOtpInput && (
                            <Button 
                              type="primary" 
                              onClick={handleSendEmailOtp} 
                              disabled={!watchEmail || !!errors.email} 
                              loading={loading.emailOtpSending} 
                              className="custom-primary-btn" 
                              style={{ width: '110px', minWidth: '110px' }}
                            >
                              Send OTP
                            </Button>
                          )}
                          {(showEmailOtpInput || isEmailVerified) && (
                            <Button icon={<Edit size={16} />} onClick={handleChangeEmail} style={{ width: '110px', minWidth: '110px' }}>Change</Button>
                          )}
                        </Space.Compact>
                        {showEmailOtpInput && (
                          <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <Text type="secondary" className="block mb-3 text-sm">Code sent to <strong className="text-gray-800">{watchEmail}</strong></Text>
                            <div className="flex gap-3">
                              <Input placeholder="6-digit OTP" maxLength={6} value={emailOtpValue} onChange={(e) => setEmailOtpValue(e.target.value)} className="flex-1" />
                              <Button type="primary" onClick={handleVerifyEmailOtp} loading={loading.emailOtpVerifying} className="custom-primary-btn px-6">Verify</Button>
                            </div>
                          </div>
                        )}
                      </Form.Item>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Form.Item
                        label={<Space>Mobile Number {isMobileVerified && <Tag color="success" className="text-sm px-2 py-0 ml-1">Verified</Tag>}</Space>}
                        required
                        validateStatus={errors.mobile_number ? "error" : ""}
                        help={errors.mobile_number?.message}
                        className="mb-0"
                      >
                        <Space.Compact block>
                          <Select
                            showSearch
                            value={countryCode}
                            onChange={(val) => { setCountryCode(val); trigger("mobile_number"); }}
                            style={{ width: '110px', minWidth: '110px' }}
                            disabled={showOtpInput || isMobileVerified}
                          >
                            {countryOptions.map((item) => (
                              <Option key={item.iso} value={item.code}>+{item.code} ({item.iso})</Option>
                            ))}
                          </Select>
                          <Input
                            placeholder="50 123 4567"
                            prefix={<Phone className="text-gray-400 w-5 h-5 mr-2" />}
                            value={mobileNumber}
                            style={{ width: '100%' }}
                            disabled={showOtpInput || isMobileVerified}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              setMobileNumber(val);
                              setValue("mobile_number", val, { shouldValidate: true });
                              trigger("mobile_number");
                            }}
                          />
                          {!isMobileVerified && !showOtpInput && (
                            <Button
                              className="custom-primary-btn"
                              onClick={handleSendOtp}
                              disabled={!mobileNumber || !!errors.mobile_number}
                              loading={loading.otpSending}
                              style={{ width: '110px', minWidth: '110px' }}
                            >
                              Send OTP
                            </Button>
                          )}
                          {(showOtpInput || isMobileVerified) && (
                            <Button icon={<Edit size={16} />} onClick={handleChangeNumber} style={{ width: '110px', minWidth: '110px' }}>Change</Button>
                          )}
                        </Space.Compact>
                        {showOtpInput && (
                          <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <Text type="secondary" className="block mb-3 text-sm">Code sent via SMS to <strong className="text-gray-800">+{countryCode} {mobileNumber}</strong></Text>
                            <div className="flex gap-3">
                              <Input placeholder="6-digit OTP" maxLength={6} value={otpValue} onChange={(e) => setOtpValue(e.target.value)} className="flex-1" />
                              <Button type="primary" onClick={handleVerifyOtp} loading={loading.otpVerifying} className="custom-primary-btn px-6">Verify</Button>
                            </div>
                          </div>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Row 4: Passwords */}
                  <Row gutter={[24, 20]}>
                    <Col xs={24} lg={12}>
                      <Form.Item label="Password" required validateStatus={errors.password ? "error" : ""} help={errors.password?.message} className="mb-0">
                        <Controller 
                          name="password" 
                          control={control} 
                          rules={{ 
                            required: "Required", 
                            minLength: { value: 6, message: "Min 6 chars" } 
                          }} 
                          render={({ field }) => <Input.Password prefix={<Lock className="text-gray-400 w-5 h-5 mr-2" />} placeholder="Password" {...field} />} 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Form.Item label="Confirm Password" required validateStatus={errors.confirmPassword ? "error" : ""} help={errors.confirmPassword?.message} className="mb-0">
                        <Controller 
                          name="confirmPassword" 
                          control={control} 
                          rules={{ 
                            required: "Required",
                            validate: (val) => val === getValues("password") || "Passwords mismatch"
                          }} 
                          render={({ field }) => <Input.Password prefix={<Lock className="text-gray-400 w-5 h-5 mr-2" />} placeholder="Repeat Password" {...field} />} 
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <div className="pt-4 flex justify-end">
                    <Button type="primary" size="large" onClick={next} className="custom-primary-btn px-10 w-full sm:w-auto">
                      Continue <ArrowRight className="inline ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ── SECTION 2 (Step 1) ── */}
              {step === 1 && (
                <div className="animate-fade-in space-y-8">
                  <Row gutter={[24, 20]}>
                    <Col xs={24} lg={12}>
                      <Form.Item label="Marital Status" className="mb-0">
                        <Controller name="maritalStatus" control={control} render={({ field }) => (
                          <Select placeholder="Select" {...field} allowClear>
                            {maritalStatusOptions.map((o) => <Option key={o.value} value={o.value}>{o.label}</Option>)}
                          </Select>
                        )} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Form.Item label="Nationality" className="mb-0">
                        <Controller name="nationality" control={control} render={({ field }) => (
                          <Select placeholder="Select" showSearch optionFilterProp="label" {...field} allowClear>
                            {nationalityOptions.map((o) => <Option key={o.value} value={o.value} label={o.label}>{o.label}</Option>)}
                          </Select>
                        )} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[24, 20]}>
                    <Col xs={24} lg={12}>
                      <Form.Item label="Date of Birth" className="mb-0">
                        <Controller name="dateOfBirth" control={control} render={({ field }) => <Input type="date" {...field} />} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Form.Item label="Gender" className="mb-0">
                        <Controller name="gender" control={control} render={({ field }) => (
                          <Radio.Group {...field} className="flex gap-4 sm:gap-6 mt-2">
                            {genderOptions.map((o) => <Radio key={o.value} value={o.value} className="text-base">{o.label}</Radio>)}
                          </Radio.Group>
                        )} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <div className="pt-10 flex flex-col sm:flex-row justify-between gap-4">
                    <Button size="large" onClick={back} className="px-8 w-full sm:w-auto"><ChevronLeft className="w-5 h-5 mr-2 inline" /> Back</Button>
                    <Button type="primary" size="large" onClick={next} className="custom-primary-btn px-10 w-full sm:w-auto">
                      Continue <ArrowRight className="w-5 h-5 ml-2 inline" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ── SECTION 3 (Step 2) ── */}
              {step === 2 && (
                <Spin spinning={loading.submitting}>
                  <div className="animate-fade-in space-y-6">
                    <Card className="bg-gray-50 border-gray-200" title={<span className="text-lg font-semibold text-gray-800">Review Details</span>} bodyStyle={{ padding: "30px" }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-base">
                        <div className="flex flex-col"><Text type="secondary" className="text-sm">Agent Type</Text> <Text className="font-medium text-gray-800">{selectedAgentMode === "freelance" ? "Freelance" : "Partner"}</Text></div>
                        {selectedAgentMode === "partner" && (
                          <div className="flex flex-col"><Text type="secondary" className="text-sm">Partner Company</Text> <Text className="font-medium text-gray-800 truncate">{partners.find((p) => p._id === watch("partnerId"))?.companyName || "Selected"}</Text></div>
                        )}
                        <div className="flex flex-col"><Text type="secondary" className="text-sm">Full Name</Text> <Text className="font-medium text-gray-800">{watch("first_name")} {watch("last_name")}</Text></div>
                        <div className="flex flex-col"><Text type="secondary" className="text-sm">Email Address</Text> <Text className="font-medium text-gray-800 truncate">{watch("email")}</Text></div>
                        <div className="flex flex-col"><Text type="secondary" className="text-sm">Mobile Number</Text> <Text className="font-medium text-gray-800">+{countryCode} {mobileNumber}</Text></div>
                        <div className="flex flex-col"><Text type="secondary" className="text-sm">Verification</Text> <div><Tag color="green" className="text-sm mt-1 border-green-500">Verified</Tag></div></div>
                        <Divider className="col-span-1 sm:col-span-2 my-2" />
                        <div className="flex flex-col"><Text type="secondary" className="text-sm">Marital Status</Text> <Text className="font-medium text-gray-800">{watch("maritalStatus") || "-"}</Text></div>
                        <div className="flex flex-col"><Text type="secondary" className="text-sm">Nationality</Text> <Text className="font-medium text-gray-800">{nationalityOptions.find((o) => o.value === watch("nationality"))?.label || "-"}</Text></div>
                        <div className="flex flex-col"><Text type="secondary" className="text-sm">Date of Birth</Text> <Text className="font-medium text-gray-800">{watch("dateOfBirth") || "-"}</Text></div>
                        <div className="flex flex-col"><Text type="secondary" className="text-sm">Gender</Text> <Text className="font-medium text-gray-800">{watch("gender") || "-"}</Text></div>
                      </div>
                    </Card>

                    <Form.Item className="mb-0 mt-4">
                      <Controller
                        name="agreed_to_terms"
                        control={control}
                        rules={{ required: "Required" }}
                        render={({ field }) => (
                          <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} className="text-base">
                            I agree to the <a href="#" className="text-[#4A027C] font-medium hover:underline">Terms of Service</a> and <a href="#" className="text-[#4A027C] font-medium hover:underline">Privacy Policy</a>
                          </Checkbox>
                        )}
                      />
                      {errors.agreed_to_terms && <div className="text-red-500 text-sm mt-2">{errors.agreed_to_terms.message}</div>}
                    </Form.Item>

                    <div className="pt-8 flex flex-col sm:flex-row justify-between gap-4">
                      <Button size="large" onClick={back} className="px-8 w-full sm:w-auto"><ChevronLeft className="w-5 h-5 mr-2 inline" /> Back</Button>
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={loading.submitting}
                        className="custom-primary-btn px-10 w-full sm:w-auto"
                      >
                        Submit Registration <Check className="ml-2 w-5 h-5 inline" />
                      </Button>
                    </div>
                  </div>
                </Spin>
              )}
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultRegister;
