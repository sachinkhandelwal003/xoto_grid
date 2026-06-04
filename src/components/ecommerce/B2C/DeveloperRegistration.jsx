import React, { useState, useEffect, useMemo } from "react";
import { Form, Input, Button, Select, Spin, message, notification, ConfigProvider, Modal } from "antd";
import { CheckCircleFilled, EnvironmentOutlined, PhoneOutlined, LockOutlined, UserOutlined, ArrowLeftOutlined, ArrowRightOutlined, MailOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { Country, City } from "country-state-city";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Option } = Select;
const PURPLE = "#5a0099";

export default function DeveloperRegistration() {
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [citiesList, setCitiesList] = useState([]);
  const [success, setSuccess] = useState(false);
  
  // Phone OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  
  // Email OTP
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [enteredEmailOtp, setEnteredEmailOtp] = useState("");
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);

  const { control, handleSubmit, watch, setValue, getValues, trigger, clearErrors, setError, formState: { errors } } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "", email: "", password: "", confirmPassword: "",
      phone_number: "", country_code: "971",
      country: "AE", city: "", address: "",
    },
  });

  const selectedCountry = watch("country");
  const watchedCountryCode = watch("country_code");

  const countryOptions = useMemo(() => {
    const priority = ["AE", "IN", "SA", "US", "GB", "AU"];
    return Country.getAllCountries()
      .map(c => ({ name: c.name, code: c.phonecode, iso: c.isoCode }))
      .sort((a, b) => {
        const ap = priority.includes(a.iso), bp = priority.includes(b.iso);
        if (ap && !bp) return -1;
        if (!ap && bp) return 1;
        return a.name.localeCompare(b.name);
      });
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const obj = Country.getAllCountries().find(c => c.isoCode === selectedCountry);
      setCitiesList(obj ? City.getCitiesOfCountry(obj.isoCode) : []);
    } else setCitiesList([]);
  }, [selectedCountry]);

  const validateStep = async (step) => {
    if (step === 0) {
      const nameOk = await trigger("name");
      const emailOk = await trigger("email");
      const passOk = await trigger("password");
      const confirmOk = await trigger("confirmPassword");
      if (getValues("password") !== getValues("confirmPassword")) {
        setError("confirmPassword", { type: "manual", message: "Passwords don't match" });
        return false;
      }
      if (nameOk && emailOk && passOk && confirmOk && emailOtpVerified) return true;
      if (!emailOtpVerified) message.warning("Verify your email first");
      return false;
    }
    if (step === 1) {
      const phoneOk = await trigger("phone_number");
      if (phoneOk && otpVerified) return true;
      if (!otpVerified) message.warning("Verify your phone first");
      return false;
    }
    if (step === 2) return trigger(["country", "city", "address"]);
    return true;
  };

  const nextStep = async () => {
    if (await validateStep(currentStep)) setCurrentStep(p => p + 1);
  };
  const prevStep = () => setCurrentStep(p => p - 1);

  // Phone OTP handlers
  const handleSendOtp = async () => {
    if (!await trigger("phone_number")) return;
    let cc = getValues("country_code");
    if (!cc.startsWith("+")) cc = `+${cc}`;
    setOtpLoading(true);
    try {
      await apiService.post("/otp/send-otp", { country_code: cc, phone_number: getValues("phone_number") });
      message.success("OTP sent!");
      setOtpSent(true);
      setOtpVerified(false);
    } catch (err) {
      const d = err.response?.data;
      if (d?.errors?.length) d.errors.forEach(e => setError("phone_number", { type: "manual", message: e.message }));
      else if (d?.message && /(mobile|number|phone)/i.test(d.message)) setError("phone_number", { type: "manual", message: d.message });
      else notification.error({ message: "OTP Error", description: d?.message || "Failed to send OTP" });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!enteredOtp || enteredOtp.length < 4) {
      message.error("Enter valid OTP");
      return;
    }
    let cc = getValues("country_code");
    if (!cc.startsWith("+")) cc = `+${cc}`;
    setOtpLoading(true);
    try {
      await apiService.post("/otp/verify-otp", { country_code: cc, phone_number: getValues("phone_number"), otp: enteredOtp });
      message.success("Phone verified!");
      setOtpVerified(true);
      setOtpSent(false);
      setEnteredOtp("");
    } catch (err) {
      message.error(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setEnteredOtp("");
  };

  // Email OTP handlers
  const handleSendEmailOtp = async () => {
    if (!await trigger("email")) return;
    setEmailOtpLoading(true);
    try {
      await apiService.post("/otp/email-otp/send", { email: getValues("email") });
      message.success("OTP sent to email!");
      setEmailOtpSent(true);
      setEmailOtpVerified(false);
    } catch (err) {
      const d = err.response?.data;
      if (d?.errors?.length) d.errors.forEach(e => setError("email", { type: "manual", message: e.message }));
      else if (d?.message && /email/i.test(d.message)) setError("email", { type: "manual", message: d.message });
      else notification.error({ message: "OTP Error", description: d?.message || "Failed to send OTP" });
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!enteredEmailOtp || enteredEmailOtp.length < 4) {
      message.error("Enter valid OTP");
      return;
    }
    setEmailOtpLoading(true);
    try {
      await apiService.post("/otp/email-otp/verify", { email: getValues("email"), otp: enteredEmailOtp });
      message.success("Email verified!");
      setEmailOtpVerified(true);
      setEmailOtpSent(false);
      setEnteredEmailOtp("");
    } catch (err) {
      message.error(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setEmailOtpSent(false);
    setEmailOtpVerified(false);
    setEnteredEmailOtp("");
  };

  /* ── Submit ── */
  const onSubmit = async (data) => {
    if (!otpVerified) return message.error("Verify your phone number");
    if (!emailOtpVerified) return message.error("Verify your email");
    
    setSubmitting(true);
    try {
      const countryObj = Country.getAllCountries().find(c => c.isoCode === data.country);
      let cc = data.country_code || "971";
      if (!cc.startsWith("+")) cc = `+${cc}`;
      
      await apiService.post("/developer/create-developer", {
        name: data.name,
        email: data.email,
        password: data.password,
        phone_number: `${cc}${data.phone_number}`,
        country_code: cc,
        country: countryObj ? countryObj.name : data.country,
        city: data.city,
        address: data.address,
      });
      setSuccess(true);
    } catch (err) {
      const res = err?.response?.data;
      if (res?.errors?.length) {
        let step0Err = false, step1Err = false;
        res.errors.forEach(e => {
          let f = e.field;
          if (["mobile.number", "mobile", "phone_number"].includes(f)) f = "phone_number";
          setError(f, { type: "server", message: e.message });
          if (["email", "name", "password"].includes(f)) step0Err = true;
          if (f === "phone_number") step1Err = true;
        });
        if (step0Err) setCurrentStep(0);
        else if (step1Err) setCurrentStep(1);
      } else if (res?.message) {
        const m = res.message.toLowerCase();
        if (m.includes("email")) {
          setError("email", { type: "server", message: res.message });
          setCurrentStep(0);
        } else if (/(mobile|phone|number)/.test(m)) {
          setError("phone_number", { type: "server", message: res.message });
          setCurrentStep(1);
        } else {
          message.error(res.message);
        }
      } else {
        message.error("Registration failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5a0099] to-[#3d006b] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-12 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleFilled className="text-5xl text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#3d006b] mb-3">Registration Successful!</h2>
          <p className="text-gray-600 mb-8">Your developer account is under review. We'll notify you once approved.</p>
          <button onClick={() => window.location.href = "/login"} className="w-full bg-[#5a0099] text-white py-3 rounded-xl font-bold hover:bg-[#3d006b] transition">
            Go to Login →
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { key: "personal", label: "Personal", icon: <UserOutlined /> },
    { key: "contact", label: "Contact", icon: <PhoneOutlined /> },
    { key: "location", label: "Location", icon: <EnvironmentOutlined /> },
  ];

  /* ════════════════════════
     RENDER
  ════════════════════════ */
  return (
    <ConfigProvider theme={{ token: { colorPrimary: PURPLE, borderRadius: 10 } }}>
      <div className="min-h-screen bg-gradient-to-br from-[#5a0099] to-[#3d006b] py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Developer Registration</h1>
            <p className="text-white/70">Join our developer ecosystem and start building</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8">
              {/* Step Indicators */}
              <div className="flex gap-3 mb-8 border-b pb-6">
                {steps.map((step, i) => (
                  <div
                    key={step.key}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition cursor-pointer ${
                      i === currentStep
                        ? "bg-[#5a0099] text-white shadow-lg"
                        : i < currentStep
                        ? "bg-gray-100 text-gray-700"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    <span>{step.icon}</span>
                    <span>{step.label}</span>
                    {i < currentStep && <CheckCircleFilled className="text-green-500 text-xs" />}
                  </div>
                ))}
              </div>

              <Spin spinning={submitting}>
                <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                  {/* Step 0 - Personal */}
                  {currentStep === 0 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Company Name *</label>
                        <Controller
                          name="name"
                          control={control}
                          rules={{ required: "Company name is required" }}
                          render={({ field }) => (
                            <Input {...field} size="large" placeholder="Acme Technologies" className="border-2 border-gray-200 rounded-xl h-11" />
                          )}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email Address *</label>
                        <div className="flex gap-3">
                          <Controller
                            name="email"
                            control={control}
                            rules={{ required: "Required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } }}
                            render={({ field }) => (
                              <Input
                                {...field}
                                size="large"
                                placeholder="info@company.com"
                                prefix={<MailOutlined className="text-gray-400" />}
                                disabled={emailOtpVerified || emailOtpSent}
                                className="flex-1 border-2 border-gray-200 rounded-xl h-11"
                              />
                            )}
                          />
                          <Button
                            onClick={emailOtpVerified ? handleChangeEmail : handleSendEmailOtp}
                            loading={emailOtpLoading}
                            className={emailOtpVerified ? "border-2 border-gray-300" : "bg-[#5a0099] text-white"}
                            style={emailOtpVerified ? { background: "white", color: "#5a0099" } : {}}
                          >
                            {emailOtpVerified ? "Change" : emailOtpSent ? "Resend" : "Send OTP"}
                          </Button>
                        </div>
                        {emailOtpSent && !emailOtpVerified && (
                          <div className="flex gap-3 mt-3">
                            <Input
                              placeholder="Enter OTP"
                              value={enteredEmailOtp}
                              onChange={e => setEnteredEmailOtp(e.target.value)}
                              maxLength={6}
                              className="flex-1 border-2 border-gray-200 rounded-xl h-11"
                            />
                            <Button onClick={handleVerifyEmailOtp} loading={emailOtpLoading} className="bg-[#5a0099] text-white">
                              Verify
                            </Button>
                          </div>
                        )}
                        {emailOtpVerified && (
                          <div className="flex items-center gap-2 mt-2 text-green-600 text-sm font-semibold">
                            <CheckCircleFilled /> Email verified
                          </div>
                        )}
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Password *</label>
                          <Controller
                            name="password"
                            control={control}
                            rules={{ required: "Required", minLength: { value: 6, message: "Min 6 characters" } }}
                            render={({ field }) => (
                              <Input.Password {...field} size="large" placeholder="••••••••" prefix={<LockOutlined />} className="border-2 border-gray-200 rounded-xl h-11" />
                            )}
                          />
                          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Confirm Password *</label>
                          <Controller
                            name="confirmPassword"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Input.Password {...field} size="large" placeholder="••••••••" prefix={<LockOutlined />} className="border-2 border-gray-200 rounded-xl h-11" />
                            )}
                          />
                          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 1 - Contact */}
                  {currentStep === 1 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number *</label>
                        <div className="flex gap-3">
                          <div className="flex-1 flex border-2 border-gray-200 rounded-xl overflow-hidden">
                            <Controller
                              name="country_code"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  className="w-28"
                                  dropdownMatchSelectWidth={250}
                                  disabled={otpVerified || otpSent}
                                  onChange={val => { field.onChange(val); trigger("phone_number"); }}
                                >
                                  {countryOptions.map(item => (
                                    <Option key={item.iso} value={item.code}>+{item.code}</Option>
                                  ))}
                                </Select>
                              )}
                            />
                            <Controller
                              name="phone_number"
                              control={control}
                              rules={{
                                required: "Mobile number required",
                                validate: (value) => {
                                  if (!value) return "Required";
                                  let code = (getValues("country_code") || "971").replace("+", "");
                                  if (code === "971") {
                                    if (value.length !== 9) return "UAE numbers must be 9 digits";
                                    if (!value.startsWith("5")) return "UAE numbers must start with 5";
                                  }
                                  const ph = parsePhoneNumberFromString(`+${code}${value}`);
                                  return (ph && ph.isValid()) || "Invalid mobile format";
                                }
                              }}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  className="flex-1 px-3 outline-none"
                                  placeholder={watchedCountryCode === "971" ? "501234567" : "Mobile number"}
                                  disabled={otpVerified || otpSent}
                                  maxLength={watchedCountryCode === "971" ? 9 : 15}
                                  onChange={e => { field.onChange(e.target.value.replace(/\D/g, "")); clearErrors("phone_number"); }}
                                />
                              )}
                            />
                          </div>
                          <Button
                            onClick={otpVerified ? handleChangeNumber : handleSendOtp}
                            loading={otpLoading}
                            className={otpVerified ? "border-2 border-gray-300" : "bg-[#5a0099] text-white"}
                            style={otpVerified ? { background: "white", color: "#5a0099" } : {}}
                          >
                            {otpVerified ? "Change" : otpSent ? "Resend" : "Send OTP"}
                          </Button>
                        </div>
                        {otpSent && !otpVerified && (
                          <div className="flex gap-3 mt-3">
                            <Input
                              placeholder="Enter 6-digit OTP"
                              maxLength={6}
                              value={enteredOtp}
                              onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                              className="flex-1 border-2 border-gray-200 rounded-xl h-11"
                            />
                            <Button onClick={handleVerifyOtp} loading={otpLoading} className="bg-[#5a0099] text-white">
                              Verify
                            </Button>
                          </div>
                        )}
                        {otpVerified && (
                          <div className="flex items-center gap-2 mt-2 text-green-600 text-sm font-semibold">
                            <CheckCircleFilled /> Phone verified
                          </div>
                        )}
                        {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number.message}</p>}
                      </div>
                    </div>
                  )}

                  {/* Step 2 - Location */}
                  {currentStep === 2 && (
                    <div className="space-y-5">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Country *</label>
                          <Controller
                            name="country"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Select
                                {...field}
                                size="large"
                                showSearch
                                placeholder="Select Country"
                                className="w-full border-2 border-gray-200 rounded-xl"
                                onChange={val => { field.onChange(val); setValue("city", null); }}
                              >
                                {Country.getAllCountries().map(c => (
                                  <Option key={c.isoCode} value={c.isoCode}>{c.name}</Option>
                                ))}
                              </Select>
                            )}
                          />
                          {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">City *</label>
                          <Controller
                            name="city"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Select {...field} size="large" showSearch placeholder="Select City" className="w-full border-2 border-gray-200 rounded-xl">
                                {citiesList.map(c => <Option key={c.name} value={c.name}>{c.name}</Option>)}
                              </Select>
                            )}
                          />
                          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Address *</label>
                        <Controller
                          name="address"
                          control={control}
                          rules={{ required: "Required" }}
                          render={({ field }) => (
                            <Input.TextArea rows={3} placeholder="Building No, Street Name, Area..." {...field} className="border-2 border-gray-200 rounded-xl" />
                          )}
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t">
                    {currentStep > 0 ? (
                      <button type="button" onClick={prevStep} className="px-8 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:border-[#5a0099] hover:text-[#5a0099] transition">
                        <ArrowLeftOutlined /> Back
                      </button>
                    ) : <div />}
                    {currentStep < 2 ? (
                      <button type="button" onClick={nextStep} className="px-8 py-3 bg-[#5a0099] text-white rounded-xl font-bold shadow-lg hover:bg-[#3d006b] transition">
                        Continue <ArrowRightOutlined />
                      </button>
                    ) : (
                      <button type="submit" disabled={!otpVerified || !emailOtpVerified || submitting} className="px-8 py-3 bg-[#5a0099] text-white rounded-xl font-bold shadow-lg hover:bg-[#3d006b] transition disabled:opacity-50">
                        {submitting ? "Submitting..." : "Submit Registration →"}
                      </button>
                    )}
                  </div>
                </Form>
              </Spin>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}