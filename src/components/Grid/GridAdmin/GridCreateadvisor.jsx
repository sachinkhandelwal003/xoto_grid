import React, { useState, useCallback } from "react";
import { notification } from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

// ─── Constants ────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = [
  "Apartment", "Villa", "Townhouse", "Penthouse",
  "Commercial", "Plot", "Retail", "Office", "Warehouse",
];

const LISTING_TYPES = [
  { value: "off-plan", label: "Off-Plan" },
  { value: "secondary", label: "Secondary" },
  { value: "rental", label: "Rental" },
  { value: "commercial", label: "Commercial" },
];

const LOCATIONS = [
  "Dubai Marina", "Downtown Dubai", "JVC", "Business Bay",
  "Palm Jumeirah", "Dubai Hills Estate", "Emirates Living",
  "Abu Dhabi", "Sharjah", "Al Furjan", "Mohammed Bin Rashid City",
];

const COUNTRY_CODES = [
  { code: "+971", flag: "🇦🇪", label: "UAE" },
  { code: "+91",  flag: "🇮🇳", label: "India" },
  { code: "+1",   flag: "🇺🇸", label: "USA" },
  { code: "+44",  flag: "🇬🇧", label: "UK" },
  { code: "+966", flag: "🇸🇦", label: "Saudi Arabia" },
  { code: "+974", flag: "🇶🇦", label: "Qatar" },
  { code: "+965", flag: "🇰🇼", label: "Kuwait" },
  { code: "+968", flag: "🇴🇲", label: "Oman" },
  { code: "+973", flag: "🇧🇭", label: "Bahrain" },
  { code: "+92",  flag: "🇵🇰", label: "Pakistan" },
];

const DEPARTMENTS = [
  "Off-Plan Sales", "Secondary Market", "Rentals", "Commercial", "Leasing",
];

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "",
  phone: "",
  department: "",
  specialisation: {
    propertyTypes: [],
    listingTypes: [],
    locations: [],
  },
};

// ─── Colors ───────────────────────────────────────────────────────────────────

const COLORS = {
  primary: "#7C3AED",
  primaryDark: "#5B21B6",
  primaryLight: "#A78BFA",
  bg: "#FAF8FF",
  border: "#E9E2FF",
  text: "#1E1B3B",
  textMuted: "#6B5B9B",
  textLight: "#C4B5FD",
  success: "#10B981",
  error: "#EF4444",
  white: "#FFFFFF",
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  page: {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${COLORS.bg} 0%, #F5F3FF 100%)`,
    padding: "40px 24px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  container: { maxWidth: 840, margin: "0 auto" },
  header: { marginBottom: 32 },
  title: {
    fontSize: 32, fontWeight: 700, color: COLORS.text,
    letterSpacing: "-0.02em", marginBottom: 8, margin: 0,
  },
  description: {
    fontSize: 14, color: COLORS.textMuted, lineHeight: 1.5,
    marginTop: 8, marginBottom: 0,
  },
  card: {
    background: COLORS.white, border: `1px solid ${COLORS.border}`,
    borderRadius: 20, marginBottom: 20, overflow: "hidden",
    boxShadow: "0 2px 12px rgba(124, 58, 237, 0.06)",
  },
  cardHeader: { padding: "20px 24px 16px 24px", borderBottom: `1px solid ${COLORS.border}` },
  cardTitle: { fontSize: 15, fontWeight: 600, color: COLORS.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: COLORS.textMuted },
  cardBody: { padding: "24px" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: 12, fontWeight: 600, color: COLORS.text,
    display: "flex", alignItems: "center", gap: 4, userSelect: "none",
  },
  required: { color: COLORS.error, fontSize: 12 },
  input: {
    height: 44, padding: "0 14px", border: `1.5px solid ${COLORS.border}`,
    borderRadius: 12, fontSize: 14, fontFamily: "inherit", color: COLORS.text,
    background: COLORS.white, transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    outline: "none", width: "100%", boxSizing: "border-box",
  },
  inputFocus: { borderColor: COLORS.primary, boxShadow: `0 0 0 3px rgba(124, 58, 237, 0.1)` },
  inputError: { borderColor: COLORS.error, background: "#FEF2F2" },
  select: {
    height: 44, padding: "0 36px 0 14px", border: `1.5px solid ${COLORS.border}`,
    borderRadius: 12, fontSize: 14, fontFamily: "inherit", color: COLORS.text,
    background: COLORS.white, cursor: "pointer", outline: "none", width: "100%",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236B5B9B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease", boxSizing: "border-box",
  },
  selectFocus: { borderColor: COLORS.primary, boxShadow: `0 0 0 3px rgba(124, 58, 237, 0.1)` },
  errorMessage: { fontSize: 11, color: COLORS.error, marginTop: 2 },

  // Chip group
  chipGroup: { marginBottom: 20 },
  chipGroupHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 10,
  },
  chipLabel: {
    fontSize: 12, fontWeight: 600, color: COLORS.textMuted,
    textTransform: "uppercase", letterSpacing: "0.05em",
  },
  selectAllBtn: {
    fontSize: 11, fontWeight: 600, color: COLORS.primary,
    background: "#F3E8FF", border: `1px solid ${COLORS.border}`,
    borderRadius: 20, padding: "3px 12px", cursor: "pointer",
    fontFamily: "inherit", outline: "none", transition: "all 0.15s ease",
    lineHeight: 1.5,
  },
  chipContainer: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: {
    padding: "6px 16px", borderRadius: 30, fontSize: 12, fontWeight: 500,
    border: `1.5px solid ${COLORS.border}`, background: COLORS.white,
    color: COLORS.textMuted, cursor: "pointer", transition: "all 0.15s ease",
    fontFamily: "inherit", outline: "none", lineHeight: 1.5,
  },
  chipActive: {
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
    border: `1.5px solid ${COLORS.primary}`, color: COLORS.white,
  },

  // Location multi-picker
  locationPicker: {
    border: `1.5px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden",
    background: COLORS.white,
  },
  locationSearch: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}`,
    background: "#FAFAFF",
  },
  locationSearchInput: {
    flex: 1, border: "none", outline: "none", fontSize: 13,
    fontFamily: "inherit", color: COLORS.text, background: "transparent",
  },
  locationList: {
    maxHeight: 180, overflowY: "auto", padding: "8px",
    display: "flex", flexWrap: "wrap", gap: 6,
  },
  locationChip: {
    padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
    border: `1.5px solid ${COLORS.border}`, background: COLORS.white,
    color: COLORS.textMuted, cursor: "pointer", transition: "all 0.15s ease",
    fontFamily: "inherit", outline: "none", lineHeight: 1.5,
    display: "flex", alignItems: "center", gap: 5,
  },
  locationChipActive: {
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
    border: `1.5px solid ${COLORS.primary}`, color: COLORS.white,
  },
  locationSelectedBar: {
    padding: "8px 14px", borderTop: `1px solid ${COLORS.border}`,
    background: "#FAFAFF", display: "flex", alignItems: "center",
    gap: 6, flexWrap: "wrap", minHeight: 40,
  },
  locationSelectedTag: {
    display: "inline-flex", alignItems: "center", gap: 4,
    background: "#EDE9FE", color: COLORS.primaryDark,
    fontSize: 11, fontWeight: 600, padding: "3px 10px",
    borderRadius: 20, border: `1px solid ${COLORS.border}`,
  },
  locationClearAll: {
    marginLeft: "auto", fontSize: 11, color: COLORS.error,
    background: "none", border: "none", cursor: "pointer",
    fontFamily: "inherit", fontWeight: 600, padding: "2px 6px",
  },

  infoBox: {
    background: `linear-gradient(135deg, ${COLORS.bg} 0%, #F3E8FF 100%)`,
    border: `1px solid ${COLORS.border}`, borderRadius: 16,
    padding: "16px 20px", marginBottom: 24,
    display: "flex", gap: 12, alignItems: "flex-start",
  },
  infoText: { fontSize: 13, color: COLORS.primaryDark, lineHeight: 1.7, margin: 0 },
  actions: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    gap: 16, marginTop: 8,
  },
  phoneWrapper: { display: "flex", gap: 8 },
  countrySelect: {
    height: 44, padding: "0 8px 0 12px", border: `1.5px solid ${COLORS.border}`,
    borderRadius: 12, fontSize: 13, fontFamily: "inherit", color: COLORS.text,
    background: COLORS.white, cursor: "pointer", outline: "none",
    appearance: "none", flexShrink: 0, width: 110,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease", boxSizing: "border-box",
  },
  buttonClear: {
    height: 44, padding: "0 24px", borderRadius: 12,
    border: `1.5px solid ${COLORS.border}`, background: COLORS.white,
    fontSize: 13, fontWeight: 600, color: COLORS.textMuted, cursor: "pointer",
    fontFamily: "inherit", transition: "all 0.2s ease", outline: "none",
  },
  buttonSubmit: {
    height: 44, padding: "0 28px", borderRadius: 12, border: "none",
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
    fontSize: 13, fontWeight: 600, color: COLORS.white, cursor: "pointer",
    display: "flex", alignItems: "center", gap: 8,
    fontFamily: "inherit", transition: "all 0.2s ease", outline: "none",
  },
  buttonDisabled: { opacity: 0.6, cursor: "not-allowed" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path d="M10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10Z" stroke={COLORS.primary} strokeWidth="1.5"/>
    <path d="M2 18C2 14.6863 4.68629 12 8 12H12C15.3137 12 18 14.6863 18 18" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconBriefcase = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="6" width="16" height="12" rx="2" stroke={COLORS.primary} strokeWidth="1.5"/>
    <path d="M6 6V4C6 2.89543 6.89543 2 8 2H12C13.1046 2 14 2.89543 14 4V6" stroke={COLORS.primary} strokeWidth="1.5"/>
    <path d="M2 10H18" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconTarget = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke={COLORS.primary} strokeWidth="1.5"/>
    <circle cx="10" cy="10" r="4" stroke={COLORS.primary} strokeWidth="1.5"/>
    <circle cx="10" cy="10" r="1.5" fill={COLORS.primary}/>
  </svg>
);

const IconInfo = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
    <circle cx="10" cy="10" r="8" stroke={COLORS.primaryDark} strokeWidth="1.5"/>
    <path d="M10 9V14" stroke={COLORS.primaryDark} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="10" cy="6.5" r="0.75" fill={COLORS.primaryDark}/>
  </svg>
);

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1V13M1 7H13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
    <circle cx="9" cy="9" r="6" stroke={COLORS.textMuted} strokeWidth="1.5"/>
    <path d="M13.5 13.5L17 17" stroke={COLORS.textMuted} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconX = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const SpinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
    style={{ animation: "spin 0.75s linear infinite", flexShrink: 0 }}>
    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
    <path d="M8 2C11.3137 2 14 4.68629 14 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ─── FormField Component ──────────────────────────────────────────────────────

const FormField = ({ label, name, required, type = "text", placeholder, value, onChange, onFocus, onBlur, style, error }) => (
  <div style={S.field}>
    <label htmlFor={name} style={S.label}>
      {label}
      {required && <span style={S.required}>*</span>}
    </label>
    <input
      id={name} type={type} name={name} value={value}
      onChange={onChange} onFocus={onFocus} onBlur={onBlur}
      placeholder={placeholder} style={style} autoComplete="off"
    />
    {error && <span style={S.errorMessage}>{error}</span>}
  </div>
);

// ─── ChipGroupWithSelectAll ───────────────────────────────────────────────────

const ChipGroupWithSelectAll = ({ label, items, selected, onToggle, onSelectAll, onClearAll, getValue, getLabel }) => {
  const allSelected = items.length > 0 && items.every(item => selected.includes(getValue(item)));
  return (
    <div style={S.chipGroup}>
      <div style={S.chipGroupHeader}>
        <div style={S.chipLabel}>{label}</div>
        <button
          type="button"
          style={S.selectAllBtn}
          className="select-all-btn"
          onClick={allSelected ? onClearAll : onSelectAll}
        >
          {allSelected ? "Clear All" : "Select All"}
        </button>
      </div>
      <div style={S.chipContainer}>
        {items.map(item => {
          const val = getValue(item);
          const isActive = selected.includes(val);
          return (
            <button
              key={val}
              type="button"
              className={`chip-btn${isActive ? " chip-active" : ""}`}
              onClick={() => onToggle(val)}
              style={{ ...S.chip, ...(isActive ? S.chipActive : {}) }}
            >
              {getLabel(item)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── LocationMultiPicker ──────────────────────────────────────────────────────

const LocationMultiPicker = ({ locations, selected, onToggle, onClearAll }) => {
  const [search, setSearch] = useState("");
  const filtered = locations.filter(loc =>
    loc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={S.chipGroup}>
      <div style={S.chipGroupHeader}>
        <div style={S.chipLabel}>Preferred Locations</div>
        <span style={{ fontSize: 11, color: COLORS.textMuted }}>
          {selected.length} selected
        </span>
      </div>

      <div style={S.locationPicker}>
        {/* Search bar */}
        <div style={S.locationSearch}>
          <IconSearch />
          <input
            type="text"
            placeholder="Search locations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={S.locationSearchInput}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted, padding: 0, display: "flex" }}
            >
              <IconX />
            </button>
          )}
        </div>

        {/* Location chips list */}
        <div style={S.locationList}>
          {filtered.length === 0 ? (
            <span style={{ fontSize: 12, color: COLORS.textMuted, padding: "8px 4px" }}>
              No locations found
            </span>
          ) : (
            filtered.map(loc => {
              const isActive = selected.includes(loc);
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => onToggle(loc)}
                  style={{ ...S.locationChip, ...(isActive ? S.locationChipActive : {}) }}
                  className={`chip-btn${isActive ? " chip-active" : ""}`}
                >
                  {isActive && <span style={{ fontSize: 10 }}>✓</span>}
                  {loc}
                </button>
              );
            })
          )}
        </div>

        {/* Selected tags bar */}
        <div style={S.locationSelectedBar}>
          {selected.length === 0 ? (
            <span style={{ fontSize: 11, color: COLORS.textMuted }}>No locations selected</span>
          ) : (
            <>
              {selected.map(loc => (
                <span key={loc} style={S.locationSelectedTag}>
                  {loc}
                  <button
                    type="button"
                    onClick={() => onToggle(loc)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.primaryDark, padding: 0, display: "flex", lineHeight: 1 }}
                  >
                    <IconX />
                  </button>
                </span>
              ))}
              <button type="button" style={S.locationClearAll} onClick={onClearAll}>
                Clear all
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const GridCreateadvisor = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);

  const [api, contextHolder] = notification.useNotification();

  const notify = (type, message, description) => {
    api[type]({ message, description, placement: "topRight", duration: 4 });
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => (prev[name] ? { ...prev, [name]: "" } : prev));
  }, []);

  const toggleChip = useCallback((category, value) => {
    setForm(prev => {
      const current = prev.specialisation[category];
      const newValue = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, specialisation: { ...prev.specialisation, [category]: newValue } };
    });
  }, []);

  // ── Select All / Clear All helpers ──
  const selectAll = useCallback((category, allValues) => {
    setForm(prev => ({
      ...prev,
      specialisation: { ...prev.specialisation, [category]: allValues },
    }));
  }, []);

  const clearAll = useCallback((category) => {
    setForm(prev => ({
      ...prev,
      specialisation: { ...prev.specialisation, [category]: [] },
    }));
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.firstName?.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName?.trim()) newErrors.lastName = "Last name is required";
    if (!form.email?.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Enter a valid email address";
    if (!form.phone?.trim()) newErrors.phone = "Phone number is required";
    else if (form.phone.replace(/\D/g, "").length < 7) newErrors.phone = "Enter a valid phone number";
    if (!form.countryCode) newErrors.countryCode = "Country code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        firstName:   form.firstName.trim(),
        lastName:    form.lastName.trim(),
        email:       form.email.toLowerCase().trim(),
        countryCode: form.countryCode,
        phone:       form.phone.trim(),
        ...(form.department && { department: form.department }),
        specialisation: form.specialisation,
      };
      await apiService.post("/gridadvisor", payload);
      notify("success", "Advisor Created Successfully", `Login credentials have been sent to ${payload.email}`);
      setForm(INITIAL_FORM);
      setErrors({});
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong. Please try again.";
      notify("error", "Creation Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => { setForm(INITIAL_FORM); setErrors({}); };

  const inputStyle = (fieldName) => ({
    ...S.input,
    ...(focused === fieldName ? S.inputFocus : {}),
    ...(errors[fieldName] ? S.inputError : {}),
  });

  const selectStyle = (fieldName) => ({
    ...S.select,
    ...(focused === fieldName ? S.selectFocus : {}),
  });

  return (
    <>
      {contextHolder}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .btn-clear:hover  { background: #F9F7FF !important; }
        .btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, ${COLORS.primaryDark} 0%, #4C1D95 100%) !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.35);
        }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .chip-btn:hover:not(.chip-active) {
          border-color: ${COLORS.primaryLight} !important;
          color: ${COLORS.primary} !important;
          background: #F5F3FF !important;
        }
        .select-all-btn:hover {
          background: ${COLORS.primary} !important;
          color: white !important;
        }
        .location-chip:hover:not(.chip-active) {
          border-color: ${COLORS.primaryLight} !important;
          color: ${COLORS.primary} !important;
          background: #F5F3FF !important;
        }
      `}</style>

      <div style={S.page}>
        <div style={S.container}>

          <div style={S.header}>
            <h1 style={S.title}>Create Xoto Advisor</h1>
            <p style={S.description}>
              Xoto Advisors are internal employees or contractors.
              They do not self-register — only Super Admin can create accounts.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* Identity & Contact */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <IconUser />
                  <div style={S.cardTitle}>Identity & Contact</div>
                </div>
                <div style={S.cardSubtitle}>Login credentials are auto-generated and sent to the advisor's email</div>
              </div>
              <div style={S.cardBody}>
                <div style={S.grid2}>
                  <FormField label="First Name" name="firstName" required placeholder="Ahmed"
                    value={form.firstName} onChange={handleChange}
                    onFocus={() => setFocused("firstName")} onBlur={() => setFocused("")}
                    style={inputStyle("firstName")} error={errors.firstName} />
                  <FormField label="Last Name" name="lastName" required placeholder="Al Mansoori"
                    value={form.lastName} onChange={handleChange}
                    onFocus={() => setFocused("lastName")} onBlur={() => setFocused("")}
                    style={inputStyle("lastName")} error={errors.lastName} />
                  <FormField label="Email Address" name="email" type="email" required placeholder="ahmed@xoto.ae"
                    value={form.email} onChange={handleChange}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                    style={inputStyle("email")} error={errors.email} />
                  <div style={S.field}>
                    <label style={S.label}>Phone Number <span style={S.required}>*</span></label>
                    <div style={S.phoneWrapper}>
                      <select name="countryCode" value={form.countryCode} onChange={handleChange}
                        onFocus={() => setFocused("countryCode")} onBlur={() => setFocused("")}
                        style={{ ...S.countrySelect, ...(focused === "countryCode" ? S.inputFocus : {}) }}>
                        <option value="">Code</option>
                        {COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                        ))}
                      </select>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                        onFocus={() => setFocused("phone")} onBlur={() => setFocused("")}
                        placeholder="50 000 0000"
                        style={{ ...S.input, flex: 1, ...(focused === "phone" ? S.inputFocus : {}), ...(errors.phone ? S.inputError : {}) }}
                        autoComplete="off" />
                    </div>
                    {errors.phone && <span style={S.errorMessage}>{errors.phone}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Department */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <IconBriefcase />
                  <div style={S.cardTitle}>Department</div>
                </div>
                <div style={S.cardSubtitle}>Optional — helps with team organisation</div>
              </div>
              <div style={S.cardBody}>
                <div style={S.field}>
                  <label htmlFor="department" style={S.label}>Select Department</label>
                  <select id="department" name="department" value={form.department} onChange={handleChange}
                    onFocus={() => setFocused("department")} onBlur={() => setFocused("")}
                    style={selectStyle("department")}>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Specialisation */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <IconTarget />
                  <div style={S.cardTitle}>Specialisation</div>
                </div>
              </div>
              <div style={S.cardBody}>

                {/* ✅ Property Types — with Select All */}
                <ChipGroupWithSelectAll
                  label="Property Types"
                  items={PROPERTY_TYPES}
                  selected={form.specialisation.propertyTypes}
                  onToggle={(val) => toggleChip("propertyTypes", val)}
                  onSelectAll={() => selectAll("propertyTypes", PROPERTY_TYPES)}
                  onClearAll={() => clearAll("propertyTypes")}
                  getValue={(item) => item}
                  getLabel={(item) => item}
                />

                {/* ✅ Listing Types — with Select All */}
                <ChipGroupWithSelectAll
                  label="Listing Types"
                  items={LISTING_TYPES}
                  selected={form.specialisation.listingTypes}
                  onToggle={(val) => toggleChip("listingTypes", val)}
                  onSelectAll={() => selectAll("listingTypes", LISTING_TYPES.map(t => t.value))}
                  onClearAll={() => clearAll("listingTypes")}
                  getValue={(item) => item.value}
                  getLabel={(item) => item.label}
                />

                {/* ✅ Locations — Multi-picker with search */}
                <LocationMultiPicker
                  locations={LOCATIONS}
                  selected={form.specialisation.locations}
                  onToggle={(val) => toggleChip("locations", val)}
                  onClearAll={() => clearAll("locations")}
                />

              </div>
            </div>

            {/* Info Box */}
            <div style={S.infoBox}>
              <IconInfo />
              <p style={S.infoText}>
                <strong>What happens next?</strong><br />
                • A temporary password is auto-generated and emailed to{" "}
                <strong>{form.email || "the advisor"}</strong><br />
                • Employee ID (XA-XXXX) is assigned automatically<br />
                • Advisor must reset password on first login (PRD §3.4)
              </p>
            </div>

            {/* Actions */}
            <div style={S.actions}>
              <button type="button" className="btn-clear" style={S.buttonClear} onClick={handleClear}>
                Clear Form
              </button>
              <button type="submit" disabled={loading} className="btn-submit"
                style={{ ...S.buttonSubmit, ...(loading ? S.buttonDisabled : {}) }}>
                {loading ? <><SpinIcon /> Creating Advisor...</> : <><IconPlus /> Create Advisor</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default GridCreateadvisor;