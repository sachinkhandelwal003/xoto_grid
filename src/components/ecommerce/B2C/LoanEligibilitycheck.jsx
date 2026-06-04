// src/pages/Leads/VaultAgentLeadEditEligibility.jsx
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spin, message, Slider, InputNumber, Tabs, Modal, Form, Input, Select, DatePicker, Button, Progress, Alert, Row, Col } from "antd";
import dayjs from "dayjs";
import { Country } from "country-state-city";
import {
  ChevronLeft, User, Mail, Phone, Home, DollarSign,
  AlertCircle, RefreshCw, CheckCircle, XCircle,
  MapPin, Calendar, Target, Edit2, Save, X,
  Calculator, Heart, Building2, Briefcase, CreditCard,
  FileText, TrendingUp, Percent, ShieldCheck, Globe, Activity
} from "lucide-react";
import { Info } from 'lucide-react'; 

import { apiService } from "../../../manageApi/utils/custom.apiservice";

// ─── Premium Design Tokens ───────────────────────────────────────────────
const C = {
  primary: "#5C039B",
  primaryMid: "#7C3AED",
  primaryDark: "#3B0066",
  primarySoft: "#F5F0FF",
  primaryBord: "#E9D5FF",
  green: "#10B981",
  greenSoft: "#ECFDF5",
  greenBord: "#A7F3D0",
  red: "#EF4444",
  redSoft: "#FEF2F2",
  redBord: "#FECACA",
  amber: "#F59E0B",
  amberSoft: "#FFFBEB",
  amberBord: "#FDE68A",
  gray: "#6B7280",
  grayLight: "#F9FAFB",
  grayBord: "#E5E7EB",
  text: "#111827",
  textSub: "#374151",
  textMuted: "#9CA3AF",
  white: "#FFFFFF",
  bg: "#F4F0FA",
};

const roleSlugMap = {
  '0': 'superadmin',
  '1': 'admin',
  '18': "vault-admin",
  '22': "vaultagent",
  '21': "vaultpartner",
  '23': "vault-ops",
  '26': "vault-advisor",
  '25': "gridReferralPartner",
};

export default function VaultAgentLeadEditEligibility() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s?.auth || {});

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState("edit");
  const [saving, setSaving] = useState(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [flashMsg, setFlashMsg] = useState({ type: "", text: "" });

  // Form States
  const [basicInfo, setBasicInfo] = useState({
    fullName: "", email: "", mobileNumber: "", nationality: "", dateOfBirth: null,
    maritalStatus: "", numberOfDependents: 0, occupation: "", employer: "", gender: ""
  });
  const [propertyInfo, setPropertyInfo] = useState({
    propertyType: "", propertyValue: "", loanAmountRequired: "", downPaymentAmount: "",
    propertyAddress: { building: "", area: "", city: "Dubai" }, propertyAgeYears: "", isOffPlan: false
  });
  const [loanRequirementsInfo, setLoanRequirementsInfo] = useState({
    preferredTenureYears: 25, preferredInterestRateType: "Fixed", feeFinancingPreference: false,
    lifeInsurancePreference: false, propertyInsurancePreference: false, specialRequirements: ""
  });
  const [financialInfo, setFinancialInfo] = useState({
    monthlySalary: 0, otherIncome: 0, existingLoanEMIs: 0, creditCardPayments: 0,
    interestRate: 4.0
  });

  // Eligibility Results
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [eligibilityData, setEligibilityData] = useState(null);

  // Modal States for Edit
  const [editModal, setEditModal] = useState({ visible: false, type: "", title: "", fields: [] });
  const [modalForm] = Form.useForm();

  const roleSlug = roleSlugMap[user?.role?.code] ?? "dashboard";
  
  // Nationality options
  const nationalityOptions = useMemo(() => {
    return Country.getAllCountries()
      .map((c) => ({ name: c.name, iso: c.isoCode, flag: `https://flagcdn.com/w20/${c.isoCode.toLowerCase()}.png` }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const flash = (type, text) => {
    setFlashMsg({ type, text });
    setTimeout(() => setFlashMsg({ type: "", text: "" }), 4000);
  };

  const getNationalityDisplay = (nationality) => {
    const found = nationalityOptions.find(n => n.name === nationality);
    if (found) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src={found.flag} alt="" style={{ width: 20, height: 14, borderRadius: 2, objectFit: "cover" }} />
          <span>{found.name}</span>
        </div>
      );
    }
    return nationality || "—";
  };

  const getGenderDisplay = (gender) => {
    if (!gender) return "—";
    const genderMap = { Male: "Male", Female: "Female", Other: "Other" };
    return genderMap[gender] || gender;
  };

  const fetchLead = async () => {
    try {
      setLoading(true);
      const res = await apiService.get(`/vault/lead/${id}`);
      const data = res?.data?.data || res?.data || null;
      setLead(data);
      
      const ci = data?.customerInfo || {};
      const pd = data?.propertyDetails || {};
      const lr = data?.loanRequirements || {};
      
      setBasicInfo({
        fullName: ci.fullName || "", email: ci.email || "", mobileNumber: ci.mobileNumber || "",
        nationality: ci.nationality || "", dateOfBirth: ci.dateOfBirth ? dayjs(ci.dateOfBirth) : null,
        maritalStatus: ci.maritalStatus || "", numberOfDependents: ci.numberOfDependents || 0,
        occupation: ci.occupation || "", employer: ci.employer || "", gender: ci.gender || ""
      });
      
      setPropertyInfo({
        propertyType: pd.propertyType || "", propertyValue: pd.propertyValue || "",
        loanAmountRequired: pd.loanAmountRequired || "", downPaymentAmount: pd.downPaymentAmount || "",
        propertyAddress: pd.propertyAddress || { building: "", area: "", city: "Dubai" },
        propertyAgeYears: pd.propertyAgeYears || "", isOffPlan: pd.isOffPlan || false
      });
      
      setLoanRequirementsInfo({
        preferredTenureYears: lr.preferredTenureYears || 25,
        preferredInterestRateType: lr.preferredInterestRateType || "Fixed",
        feeFinancingPreference: lr.feeFinancingPreference || false,
        lifeInsurancePreference: lr.lifeInsurancePreference || false,
        propertyInsurancePreference: lr.propertyInsurancePreference || false,
        specialRequirements: lr.specialRequirements || ""
      });
      
      setFinancialInfo({
        monthlySalary: ci.monthlySalary || 0,
        otherIncome: 0,
        existingLoanEMIs: 0,
        creditCardPayments: 0,
        interestRate: 4.0
      });
      
    } catch (err) { 
      flash("error", "Failed to load lead details."); 
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchLead(); }, [id]);

  const checkEligibility = async () => {
    setEligibilityLoading(true);
    try {
      const payload = {
        monthlySalary: financialInfo.monthlySalary,
        otherIncome: financialInfo.otherIncome,
        existingLoanEMIs: financialInfo.existingLoanEMIs,
        creditCardPayments: financialInfo.creditCardPayments,
        propertyValue: propertyInfo.propertyValue || 0,
        requestedLoanAmount: propertyInfo.loanAmountRequired || 0,
        tenureYears: loanRequirementsInfo.preferredTenureYears
      };
      
      const response = await apiService.post(`/vault/lead/${id}/calculate-eligibility`, payload);
      
      if (response.success) {
        setEligibilityData(response.data);
        setEligibilityResult(response.data);
        setShowEligibilityModal(true);
        flash("success", response.message || "Eligibility calculated successfully!");
      } else {
        flash("error", response.message || "Failed to calculate eligibility");
      }
    } catch (err) {
      flash("error", err?.response?.data?.message || "Failed to calculate eligibility");
    } finally {
      setEligibilityLoading(false);
    }
  };

  const handleSectionUpdate = async (values) => {
    setSaving(true);
    try {
      let payload = {};
      
      if (editModal.type === "basic") {
        payload.customerInfo = { ...values, dateOfBirth: values.dateOfBirth ? dayjs(values.dateOfBirth).toISOString() : null };
        setBasicInfo(values);
        if (values.monthlySalary) setFinancialInfo(prev => ({ ...prev, monthlySalary: values.monthlySalary }));
      }
      else if (editModal.type === "property") {
        payload.propertyDetails = {
          ...values,
          propertyAddress: { building: values.building, area: values.area, city: values.city || "Dubai" },
          completionDate: values.completionDate ? dayjs(values.completionDate).toISOString() : null
        };
        setPropertyInfo(values);
      }
      else if (editModal.type === "loan") {
        payload.loanRequirements = {
          ...values,
          preferredBanks: values.preferredBanks ? values.preferredBanks.split(",").map(b => b.trim()) : []
        };
        setLoanRequirementsInfo(values);
      }

      const response = await apiService.put(`/vault/lead/advisor/lead/${id}/info`, payload);
      
      if (response?.success) {
        flash("success", `${editModal.title} updated beautifully!`);
        setEditModal({ visible: false, type: "", title: "", fields: [] });
        modalForm.resetFields();
        await fetchLead();
      } else {
        flash("error", response?.message || "Update failed");
      }
    } catch (err) {
      flash("error", err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (type, title, fields) => {
    let initialValues = {};
    if (type === "basic") initialValues = basicInfo;
    else if (type === "property") initialValues = { ...propertyInfo, building: propertyInfo.propertyAddress?.building, area: propertyInfo.propertyAddress?.area, city: propertyInfo.propertyAddress?.city };
    else if (type === "loan") initialValues = loanRequirementsInfo;
    
    modalForm.setFieldsValue(initialValues);
    setEditModal({ visible: true, type, title, fields });
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: C.primarySoft, border: `2px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <RefreshCw size={28} color={C.primary} style={{ animation: "spin 1s linear infinite" }} />
      </div>
      <p style={{ color: C.primary, fontSize: 15, fontWeight: 600 }}>Loading Premium Workspace...</p>
    </div>
  );

  // Field configurations omitted for brevity (kept standard from your original code)
  const basicFields = [
    { name: "fullName", label: "Full Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email" },
    { name: "mobileNumber", label: "Mobile Number", type: "text", required: true },
    { name: "nationality", label: "Nationality", type: "country_select" },
    { name: "dateOfBirth", label: "Date of Birth", type: "date" },
    { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
    { name: "maritalStatus", label: "Marital Status", type: "select", options: ["Single", "Married", "Divorced", "Widowed"] },
    { name: "occupation", label: "Occupation", type: "text" },
    { name: "employer", label: "Employer", type: "text" },
    { name: "monthlySalary", label: "Monthly Salary (AED)", type: "number" },
  ];

  const propertyFields = [
    { name: "propertyType", label: "Property Type", type: "select", options: ["Ready", "Off-plan", "Commercial"] },
    { name: "propertyValue", label: "Property Value (AED)", type: "number" },
    { name: "loanAmountRequired", label: "Loan Amount Required (AED)", type: "number" },
    { name: "downPaymentAmount", label: "Down Payment (AED)", type: "number" },
    { name: "area", label: "Area", type: "text" },
    { name: "isOffPlan", label: "Is Off-Plan?", type: "boolean" },
  ];

  const loanFields = [
    { name: "preferredTenureYears", label: "Preferred Tenure (Years)", type: "number" },
    { name: "preferredInterestRateType", label: "Rate Type", type: "select", options: ["Fixed", "Variable"] },
    { name: "feeFinancingPreference", label: "Include Fee Financing", type: "boolean" },
    { name: "lifeInsurancePreference", label: "Include Life Insurance", type: "boolean" },
  ];

  const renderModalField = (field) => {
    if (field.type === "select") return <Select size="large" className="premium-input"><Select.Option value="">Select...</Select.Option>{field.options.map(o => <Select.Option key={o} value={o}>{o}</Select.Option>)}</Select>;
    if (field.type === "country_select") return <Select size="large" showSearch className="premium-input">{nationalityOptions.map(c => <Select.Option key={c.iso} value={c.name}>{c.name}</Select.Option>)}</Select>;
    if (field.type === "boolean") return <Select size="large" className="premium-input"><Select.Option value={true}>Yes</Select.Option><Select.Option value={false}>No</Select.Option></Select>;
    if (field.type === "date") return <DatePicker size="large" style={{ width: "100%" }} className="premium-input" format="DD-MMM-YYYY" />;
    if (field.type === "number") return <Input type="number" size="large" className="premium-input" />;
    return <Input size="large" className="premium-input" />;
  };

  // Reusable Detail Row Component
  const DetailRow = ({ label, value, highlight = false }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: highlight ? 700 : 500, color: highlight ? C.primary : C.text, wordBreak: "break-word" }}>{value}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "32px 24px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        
        {/* Header Section */}
        <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", background: C.white, border: `1px solid ${C.grayBord}`, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <ChevronLeft size={16} /> Return to Lead Details
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: C.text, letterSpacing: "-0.5px" }}>Eligibility Workspace</h1>
        </div>

        {/* Flash Message */}
        {flashMsg.text && (
          <div className="fade-up" style={{ marginBottom: 24, padding: "14px 20px", borderRadius: 12, background: flashMsg.type === "success" ? C.greenSoft : C.redSoft, color: flashMsg.type === "success" ? "#065F46" : "#991B1B", border: `1px solid ${flashMsg.type === "success" ? C.greenBord : C.redBord}`, display: "flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
            {flashMsg.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {flashMsg.text}
          </div>
        )}

        {/* Custom Modern Tabs */}
        <div className="fade-up custom-tabs" style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.grayBord}`, padding: "6px", display: "inline-flex", gap: 4, marginBottom: 24 }}>
          <button onClick={() => setActiveMainTab("edit")} className={activeMainTab === "edit" ? "active-tab" : "inactive-tab"}>
            <Edit2 size={16} /> Edit Lead Information
          </button>
          <button onClick={() => setActiveMainTab("eligibility")} className={activeMainTab === "eligibility" ? "active-tab" : "inactive-tab"}>
            <Calculator size={16} /> Calculate Eligibility
          </button>
        </div>

        {/* Tab Content */}
        <div className="fade-up-delayed">
          {activeMainTab === "edit" ? (
            <Row gutter={[24, 24]}>
              {/* Basic Info Card */}
              <Col xs={24} md={8}>
                <div className="premium-card">
                  <div className="card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="icon-box"><User size={18} color={C.primary} /></div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>Customer</h3>
                    </div>
                    <button onClick={() => openEditModal("basic", "Customer Information", basicFields)} className="edit-btn"><Edit2 size={14} /> Edit</button>
                  </div>
                  <div className="card-body">
                    <DetailRow label="Full Name" value={basicInfo.fullName || "—"} highlight />
                    <DetailRow label="Email" value={basicInfo.email || "—"} />
                    <DetailRow label="Mobile" value={basicInfo.mobileNumber || "—"} />
                    <DetailRow label="Nationality" value={getNationalityDisplay(basicInfo.nationality)} />
                    <DetailRow label="Date of Birth" value={basicInfo.dateOfBirth ? dayjs(basicInfo.dateOfBirth).format("DD MMM YYYY") : "—"} />
                    <DetailRow label="Gender" value={getGenderDisplay(basicInfo.gender)} />
                    <DetailRow label="Occupation" value={basicInfo.occupation || "—"} />
                  </div>
                </div>
              </Col>

              {/* Property Info Card */}
              <Col xs={24} md={8}>
                <div className="premium-card">
                  <div className="card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="icon-box"><Home size={18} color={C.primary} /></div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>Property</h3>
                    </div>
                    <button onClick={() => openEditModal("property", "Property Details", propertyFields)} className="edit-btn"><Edit2 size={14} /> Edit</button>
                  </div>
                  <div className="card-body">
                    <DetailRow label="Property Type" value={propertyInfo.propertyType || "—"} />
                    <DetailRow label="Property Value" value={`AED ${propertyInfo.propertyValue?.toLocaleString() || 0}`} highlight />
                    <DetailRow label="Loan Required" value={`AED ${propertyInfo.loanAmountRequired?.toLocaleString() || 0}`} highlight />
                    <DetailRow label="Down Payment" value={`AED ${propertyInfo.downPaymentAmount?.toLocaleString() || 0}`} />
                    <DetailRow label="Location Area" value={propertyInfo.propertyAddress?.area || "—"} />
                    <DetailRow label="Off-Plan Status" value={propertyInfo.isOffPlan ? "Yes" : "No"} />
                  </div>
                </div>
              </Col>

              {/* Loan Requirements Card */}
              <Col xs={24} md={8}>
                <div className="premium-card">
                  <div className="card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="icon-box"><CreditCard size={18} color={C.primary} /></div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>Requirements</h3>
                    </div>
                    <button onClick={() => openEditModal("loan", "Loan Requirements", loanFields)} className="edit-btn"><Edit2 size={14} /> Edit</button>
                  </div>
                  <div className="card-body">
                    <DetailRow label="Preferred Tenure" value={`${loanRequirementsInfo.preferredTenureYears} years`} highlight />
                    <DetailRow label="Rate Type" value={loanRequirementsInfo.preferredInterestRateType || "—"} />
                    <DetailRow label="Fee Financing" value={loanRequirementsInfo.feeFinancingPreference ? "Included" : "Not Included"} />
                    <DetailRow label="Life Insurance" value={loanRequirementsInfo.lifeInsurancePreference ? "Included" : "Not Included"} />
                    <DetailRow label="Property Insurance" value={loanRequirementsInfo.propertyInsurancePreference ? "Included" : "Not Included"} />
                  </div>
                </div>
              </Col>
            </Row>
          ) : (
            // Eligibility Tab
            <div className="premium-card" style={{ padding: 0, overflow: "hidden" }}>
              <Row>
                {/* Left Side - Interactive Calculator */}
                <Col xs={24} md={14} style={{ padding: 32 }}>
                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{ margin: "0 0 24px", display: "flex", alignItems: "center", gap: 10, fontSize: 18, color: C.text, fontWeight: 800 }}>
                      <div className="icon-box"><DollarSign size={18} color={C.primary} /></div> Income & Liabilities
                    </h3>
                    <Row gutter={[24, 24]}>
                      <Col xs={24} sm={12}>
                        <label className="input-label">Monthly Salary (AED)</label>
                        <InputNumber value={financialInfo.monthlySalary} onChange={(v) => setFinancialInfo(prev => ({ ...prev, monthlySalary: v || 0 }))} size="large" className="premium-input-num" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                      </Col>
                      <Col xs={24} sm={12}>
                        <label className="input-label">Other Monthly Income (AED)</label>
                        <InputNumber value={financialInfo.otherIncome} onChange={(v) => setFinancialInfo(prev => ({ ...prev, otherIncome: v || 0 }))} size="large" className="premium-input-num" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                      </Col>
                      <Col xs={24} sm={12}>
                        <label className="input-label">Existing Loan EMIs (AED)</label>
                        <InputNumber value={financialInfo.existingLoanEMIs} onChange={(v) => setFinancialInfo(prev => ({ ...prev, existingLoanEMIs: v || 0 }))} size="large" className="premium-input-num text-red" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                      </Col>
                      <Col xs={24} sm={12}>
                        <label className="input-label">Credit Card Payments (AED)</label>
                        <InputNumber value={financialInfo.creditCardPayments} onChange={(v) => setFinancialInfo(prev => ({ ...prev, creditCardPayments: v || 0 }))} size="large" className="premium-input-num text-red" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                      </Col>
                    </Row>
                  </div>

                  <div>
                    <h3 style={{ margin: "0 0 24px", display: "flex", alignItems: "center", gap: 10, fontSize: 18, color: C.text, fontWeight: 800 }}>
                      <div className="icon-box"><Home size={18} color={C.primary} /></div> Property Configuration
                    </h3>
                    <Row gutter={[24, 24]}>
                      <Col xs={24} sm={12}>
                        <label className="input-label">Property Value (AED)</label>
                        <InputNumber value={propertyInfo.propertyValue} onChange={(v) => setPropertyInfo(prev => ({ ...prev, propertyValue: v || 0 }))} size="large" className="premium-input-num" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                      </Col>
                      <Col xs={24} sm={12}>
                        <label className="input-label">Loan Required (AED)</label>
                        <InputNumber value={propertyInfo.loanAmountRequired} onChange={(v) => setPropertyInfo(prev => ({ ...prev, loanAmountRequired: v || 0 }))} size="large" className="premium-input-num" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                      </Col>
                      <Col xs={24} sm={12}>
                        <label className="input-label">Tenure: <span style={{ color: C.primary, fontWeight: 700 }}>{loanRequirementsInfo.preferredTenureYears} Years</span></label>
                        <Slider min={5} max={30} value={loanRequirementsInfo.preferredTenureYears} onChange={(v) => setLoanRequirementsInfo(prev => ({ ...prev, preferredTenureYears: v }))} trackStyle={{ background: C.primary }} handleStyle={{ borderColor: C.primary, boxShadow: "none" }} />
                      </Col>
                      <Col xs={24} sm={12}>
                        <label className="input-label">Interest Rate: <span style={{ color: C.primary, fontWeight: 700 }}>{financialInfo.interestRate}%</span></label>
                        <Slider min={1} max={10} step={0.1} value={financialInfo.interestRate} onChange={(v) => setFinancialInfo(prev => ({ ...prev, interestRate: v }))} trackStyle={{ background: C.primary }} handleStyle={{ borderColor: C.primary, boxShadow: "none" }} />
                      </Col>
                    </Row>
                  </div>

                  <button 
                    onClick={checkEligibility} 
                    disabled={eligibilityLoading} 
                    className="run-eligibility-btn"
                  >
                    {eligibilityLoading ? <RefreshCw size={20} className="spin" /> : <ShieldCheck size={20} />}
                    {eligibilityLoading ? "Running Algorithms..." : "Run Eligibility Engine"}
                  </button>
                </Col>

                {/* Right Side - Dark Premium Overview */}
                <Col xs={24} md={10}>
                  <div className="dark-preview-panel">
                    <div style={{ position: "relative", zIndex: 2 }}>
                      <h3 style={{ margin: "0 0 32px", fontSize: 20, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
                        <Activity size={22} color={C.primaryBord} /> Live Preview
                      </h3>

                      <div className="dark-stat-box">
                        <div className="stat-label">Total Monthly Income</div>
                        <div className="stat-value text-green">AED {(financialInfo.monthlySalary + financialInfo.otherIncome).toLocaleString()}</div>
                      </div>

                      <div className="dark-stat-box">
                        <div className="stat-label">Total Monthly Liabilities</div>
                        <div className="stat-value text-red">AED {(financialInfo.existingLoanEMIs + financialInfo.creditCardPayments).toLocaleString()}</div>
                      </div>

                      <div className="dark-stat-box" style={{ marginBottom: 32 }}>
                        <div className="stat-label">Current LTV Ratio</div>
                        <div className="stat-value text-white">{propertyInfo.propertyValue > 0 ? Math.round((propertyInfo.loanAmountRequired / propertyInfo.propertyValue) * 100) : 0}%</div>
                      </div>

                      <div style={{ padding: 20, background: "rgba(255,255,255,0.05)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <Info size={20} color={C.primaryBord} style={{ marginTop: 2 }} />
                          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                            Update the parameters on the left and run the engine to calculate Debt Burden Ratio (DBR), max loan amount, and generate the official eligibility report.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </div>

        {/* Unified Premium Styling Block */}
        <style>{`
          @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
          @keyframes spin { to { transform: rotate(360deg) } }
          
          .fade-up { animation: fadeUp 0.4s ease forwards; }
          .fade-up-delayed { opacity: 0; animation: fadeUp 0.4s ease 0.1s forwards; }
          .spin { animation: spin 1s linear infinite; }

          /* Premium Tabs */
          .custom-tabs button {
            padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s ease;
            display: flex; align-items: center; gap: 8px; border: none; background: transparent; color: ${C.gray};
          }
          .custom-tabs button:hover { color: ${C.primary}; }
          .custom-tabs .active-tab { background: ${C.primarySoft}; color: ${C.primary}; box-shadow: 0 2px 8px rgba(92,3,155,0.1); }

          /* Premium Cards */
          .premium-card {
            background: ${C.white}; border-radius: 20px; border: 1px solid ${C.grayBord}; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.03); height: 100%; transition: 0.3s ease;
          }
          .premium-card:hover { box-shadow: 0 8px 30px rgba(92,3,155,0.06); border-color: ${C.primaryBord}; }
          .card-header { padding: 20px 24px; border-bottom: 1px solid ${C.grayLight}; display: flex; justify-content: space-between; align-items: center; }
          .icon-box { width: 36px; height: 36px; border-radius: 10px; background: ${C.primarySoft}; display: flex; align-items: center; justify-content: center; }
          .edit-btn { padding: 6px 14px; background: transparent; border: 1px solid ${C.grayBord}; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; color: ${C.textSub}; transition: 0.2s; }
          .edit-btn:hover { background: ${C.primarySoft}; color: ${C.primary}; border-color: ${C.primaryBord}; }
          .card-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }

          /* Inputs & Form */
          .input-label { display: block; font-size: 13px; font-weight: 700; color: ${C.textSub}; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
          .premium-input-num { width: 100%; border-radius: 12px; }
          .premium-input-num .ant-input-number-input { height: 48px; font-size: 16px; font-weight: 600; }
          .text-red .ant-input-number-input { color: ${C.red}; }
          .premium-input { border-radius: 10px !important; }
          .premium-input:focus, .premium-input-num:focus-within { border-color: ${C.primary} !important; box-shadow: 0 0 0 2px ${C.primarySoft} !important; }

          /* Action Buttons */
          .run-eligibility-btn {
            width: 100%; margin-top: 32px; padding: 18px; 
            background: linear-gradient(135deg, ${C.primary}, ${C.primaryMid});
            color: #fff; border: none; border-radius: 16px; font-weight: 800; font-size: 16px; 
            cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
            box-shadow: 0 8px 24px rgba(92,3,155,0.3); transition: 0.3s ease;
          }
          .run-eligibility-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(92,3,155,0.4); }
          .run-eligibility-btn:disabled { background: ${C.grayBord}; color: ${C.textMuted}; box-shadow: none; cursor: not-allowed; }

          /* Dark Preview Panel */
          .dark-preview-panel {
            background: linear-gradient(135deg, ${C.primaryDark} 0%, ${C.primary} 100%);
            height: 100%; padding: 40px; position: relative; overflow: hidden;
          }
          .dark-preview-panel::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle at top right, rgba(255,255,255,0.1), transparent 50%); z-index: 1;
          }
          .dark-stat-box { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px dashed rgba(255,255,255,0.15); }
          .dark-stat-box:last-child { border-bottom: none; }
          .stat-label { font-size: 13px; color: rgba(255,255,255,0.6); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
          .stat-value { font-size: 32px; font-weight: 800; letter-spacing: -1px; }
          .text-green { color: #34D399; }
          .text-red { color: #F87171; }
          .text-white { color: #FFFFFF; }
        `}</style>

        {/* Output Modals (Styling handled globally mostly, inline where needed) */}
        <Modal
          title={<div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: 800, color: C.text }}><Edit2 size={20} color={C.primary} /> {editModal.title}</div>}
          open={editModal.visible}
          onCancel={() => { setEditModal({ visible: false, type: "", title: "", fields: [] }); modalForm.resetFields(); }}
          footer={[
            <Button key="cancel" onClick={() => { setEditModal({ visible: false, type: "", title: "", fields: [] }); modalForm.resetFields(); }} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>Cancel</Button>,
            <Button key="submit" type="primary" onClick={() => modalForm.submit()} loading={saving} size="large" style={{ background: C.primary, borderRadius: 10, fontWeight: 600, border: "none" }}>Save Information</Button>
          ]}
          width={700}
          style={{ top: 40 }}
        >
          <div style={{ padding: "10px 0" }}>
            <Form form={modalForm} layout="vertical" onFinish={handleSectionUpdate}>
              <Row gutter={16}>
                {editModal.fields.map((field) => (
                  <Col span={field.type === "textarea" ? 24 : 12} key={typeof field.name === "string" ? field.name : field.name.join(".")}>
                    <Form.Item name={field.name} label={<span style={{ fontWeight: 600, color: C.textSub }}>{field.label}</span>} rules={field.required ? [{ required: true, message: `${field.label} is required` }] : []}>
                      {renderModalField(field)}
                    </Form.Item>
                  </Col>
                ))}
              </Row>
            </Form>
          </div>
        </Modal>

        {/* Eligibility Result Modal */}
        <Modal
          title={<div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: 800, color: C.text }}><ShieldCheck size={24} color={C.primary} /> Official Report</div>}
          open={showEligibilityModal}
          onCancel={() => setShowEligibilityModal(false)}
          footer={[<Button key="close" onClick={() => setShowEligibilityModal(false)} size="large" style={{ borderRadius: 10, fontWeight: 600, background: C.primarySoft, color: C.primary, border: "none" }}>Dismiss</Button>]}
          width={650}
          centered
        >
          {eligibilityData && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 10 }}>
              
              <div style={{ padding: 24, borderRadius: 16, textAlign: "center", background: eligibilityData.isEligible ? C.greenSoft : eligibilityData.dbrStatus === 'Borderline' ? C.amberSoft : C.redSoft, border: `2px solid ${eligibilityData.isEligible ? C.greenBord : eligibilityData.dbrStatus === 'Borderline' ? C.amberBord : C.redBord}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: C.textSub, letterSpacing: 1 }}>Decision</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: eligibilityData.isEligible ? '#065F46' : eligibilityData.dbrStatus === 'Borderline' ? '#B45309' : '#991B1B' }}>
                  {eligibilityData.isEligible ? '✓ ELIGIBLE' : eligibilityData.dbrStatus === 'Borderline' ? '⚠ BORDERLINE' : '✗ NOT ELIGIBLE'}
                </div>
                {eligibilityData.eligibilityNotes && <div style={{ fontSize: 14, marginTop: 8, color: C.textSub, fontWeight: 500 }}>{eligibilityData.eligibilityNotes}</div>}
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ background: C.grayLight, borderRadius: 16, padding: 20, border: `1px solid ${C.grayBord}`, height: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, color: C.text }}>DBR Ratio</span>
                      <span style={{ fontWeight: 800, color: eligibilityData.dbrStatus === 'Eligible' ? C.green : C.amber }}>{eligibilityData.dbrStatus}</span>
                    </div>
                    <Progress percent={Math.min(eligibilityData.dbrPercentage, 100)} strokeColor={eligibilityData.dbrStatus === 'Eligible' ? C.green : C.amber} showInfo={false} strokeWidth={8} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13, fontWeight: 600, color: C.textSub }}>
                      <span>{eligibilityData.dbrPercentage}%</span>
                      <span>Max: {eligibilityData.maxAllowedDBR}%</span>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ background: C.grayLight, borderRadius: 16, padding: 20, border: `1px solid ${C.grayBord}`, height: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, color: C.text }}>LTV Ratio</span>
                      <span style={{ fontWeight: 800, color: eligibilityData.ltvStatus === 'Eligible' ? C.green : C.amber }}>{eligibilityData.ltvStatus || 'N/A'}</span>
                    </div>
                    <Progress percent={Math.min(eligibilityData.ltvPercentage, 100)} strokeColor={eligibilityData.ltvStatus === 'Eligible' ? C.green : C.amber} showInfo={false} strokeWidth={8} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13, fontWeight: 600, color: C.textSub }}>
                      <span>{eligibilityData.ltvPercentage}%</span>
                      <span>Max: {eligibilityData.maxLTV}%</span>
                    </div>
                  </div>
                </Col>
              </Row>

              <div style={{ background: C.primarySoft, borderRadius: 16, padding: 20, border: `1px solid ${C.primaryBord}`, textAlign: "center" }}>
                <div style={{ fontSize: 13, color: C.textSub, fontWeight: 700, textTransform: "uppercase" }}>Proposed Monthly EMI</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.primary }}>AED {eligibilityData.proposedEMI?.toLocaleString() || 0}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>*Based on stress test rate of 7%</div>
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ background: C.white, borderRadius: 12, padding: 16, border: `1px solid ${C.grayBord}`, textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, textTransform: "uppercase" }}>Score</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{eligibilityData.eligibilityScore || 0}/100</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ background: C.white, borderRadius: 12, padding: 16, border: `1px solid ${C.grayBord}`, textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, textTransform: "uppercase" }}>Risk Grade</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{eligibilityData.riskGrade || "N/A"}</div>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
}