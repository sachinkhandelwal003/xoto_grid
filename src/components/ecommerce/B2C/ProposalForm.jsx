// src/ecommerce/B2C/ProposalForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import {
  ArrowLeft, ArrowRight, Loader2, Send, User, Building2, DollarSign,
  Percent, Calendar, FileText, ChevronRight, CheckCircle, X,
  Calculator, TrendingUp, CreditCard, Shield, AlertCircle, Info,
  Sparkles, Eye, BadgeCheck, Mail, Phone, Briefcase,
} from 'lucide-react';

/* ══════════════════════════════════════════════
   THEME
══════════════════════════════════════════════ */
const T = {
  brand:        '#5C039B',
  brandDark:    '#45027A',
  brandMid:     '#7C3AED',
  brandLight:   '#F3E8FF',
  brandBorder:  '#E9D5FF',
  bg:           '#F7F4FC',
  card:         '#FFFFFF',
  border:       '#EDE9F4',
  text:         '#1E0B3B',
  textSub:      '#6B5B87',
  textMute:     '#A89BC2',
  success:      '#059669',
  successBg:    '#ECFDF5',
  successBdr:   '#A7F3D0',
  error:        '#DC2626',
  errorBg:      '#FEF2F2',
  warning:      '#D97706',
  warningBg:    '#FFF7ED',
};

/* ── Fonts + Global CSS ── */
const GStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .pf-root { font-family: 'DM Sans', sans-serif; }

    @keyframes pf-spin   { to { transform: rotate(360deg); } }
    @keyframes pf-fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pf-slideR { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
    @keyframes pf-slideL { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
    @keyframes pf-pop    { 0%{transform:scale(0.7);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
    @keyframes pf-blink  { 0%,100%{opacity:1} 50%{opacity:0.4} }

    .step-enter-right { animation: pf-slideR 0.32s cubic-bezier(0.22,1,0.36,1) both; }
    .step-enter-left  { animation: pf-slideL 0.32s cubic-bezier(0.22,1,0.36,1) both; }
    .fade-up          { animation: pf-fadeUp 0.28s ease both; }
    .pop-in           { animation: pf-pop    0.25s cubic-bezier(0.34,1.56,0.64,1) both; }

    .pf-input {
      width: 100%;
      padding: 11px 13px;
      border: 1.5px solid ${T.border};
      border-radius: 10px;
      font-size: 13px;
      font-family: 'DM Sans', sans-serif;
      color: ${T.text};
      background: ${T.bg};
      transition: border-color 0.15s, box-shadow 0.15s;
      outline: none;
    }
    .pf-input:focus {
      border-color: ${T.brand};
      box-shadow: 0 0 0 3px rgba(92,3,155,0.10);
      background: #fff;
    }
    .pf-textarea {
      width: 100%;
      padding: 11px 13px;
      border: 1.5px solid ${T.border};
      border-radius: 10px;
      font-size: 13px;
      font-family: 'DM Sans', sans-serif;
      color: ${T.text};
      background: ${T.bg};
      resize: vertical;
      line-height: 1.65;
      transition: border-color 0.15s, box-shadow 0.15s;
      outline: none;
    }
    .pf-textarea:focus {
      border-color: ${T.brand};
      box-shadow: 0 0 0 3px rgba(92,3,155,0.10);
      background: #fff;
    }

    .bank-opt { transition: border-color 0.18s, box-shadow 0.18s, transform 0.15s; cursor: pointer; }
    .bank-opt:hover { border-color: ${T.brandBorder} !important; box-shadow: 0 4px 18px rgba(92,3,155,0.09) !important; transform: translateY(-1px); }

    .pf-next-btn:hover  { background: ${T.brandDark} !important; transform: translateY(-1px); box-shadow: 0 6px 22px rgba(92,3,155,0.32) !important; }
    .pf-back-btn:hover  { border-color: ${T.brandBorder} !important; color: ${T.brand} !important; background: ${T.brandLight} !important; }

    /* Layout */
    .pf-layout { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }
    @media(max-width:1024px) { .pf-layout { grid-template-columns: 1fr !important; } }
    @media(max-width:600px)  { .pf-root  { padding: 14px !important; } }
  `}</style>
);

/* ══ Helpers ══ */
const fmtAED = (n) =>
  n ? `AED ${Number(n).toLocaleString('en-AE', { maximumFractionDigits: 0 })}` : '—';
const fmtPct = (n) => (n ? `${Number(n).toFixed(2)}%` : '—');
const calcEMI = (principal, annualRate, years) => {
  const P = Number(principal), r = Number(annualRate) / 100 / 12, n = Number(years) * 12;
  if (!P || !r || !n) return 0;
  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

/* ══ Step Config ══ */
const STEPS = [
  { id: 1, label: 'Lead Info',    icon: User,       desc: 'Review customer details'     },
  { id: 2, label: 'Bank Product', icon: Building2,  desc: 'Choose a bank offer'         },
  { id: 3, label: 'Loan Details', icon: Calculator, desc: 'Set loan parameters'          },
  { id: 4, label: 'Cover Note',   icon: FileText,   desc: 'Write your message'           },
  { id: 5, label: 'Review',       icon: Eye,        desc: 'Confirm & submit'             },
];

/* ══ Stepper Header ══ */
const StepperHeader = ({ current }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
    {STEPS.map((step, idx) => {
      const done    = current > step.id;
      const active  = current === step.id;
      const pending = current < step.id;
      const Icon    = step.icon;
      return (
        <React.Fragment key={step.id}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {/* Circle */}
            <div
              className={active ? 'pop-in' : ''}
              style={{
                width: 42, height: 42, borderRadius: '50%',
                background: done   ? T.success
                          : active ? `linear-gradient(135deg, ${T.brand}, ${T.brandMid})`
                          : T.bg,
                border: `2px solid ${done ? T.success : active ? T.brand : T.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: active ? '0 4px 16px rgba(92,3,155,0.28)' : 'none',
                transition: 'all 0.25s',
              }}
            >
              {done
                ? <CheckCircle size={18} color="#fff" strokeWidth={2.5} />
                : <Icon size={16} color={active ? '#fff' : T.textMute} strokeWidth={1.8} />
              }
            </div>
            {/* Label */}
            <span style={{
              fontSize: 11, fontWeight: active ? 700 : 500,
              color: active ? T.brand : done ? T.success : T.textMute,
              fontFamily: "'Sora', sans-serif",
              whiteSpace: 'nowrap', letterSpacing: '0.01em',
              transition: 'color 0.2s',
            }}>
              {step.label}
            </span>
          </div>
          {/* Connector */}
          {idx < STEPS.length - 1 && (
            <div style={{
              flex: 1, height: 2, margin: '-14px 6px 0',
              background: current > step.id
                ? `linear-gradient(90deg, ${T.success}, ${T.success})`
                : T.border,
              borderRadius: 2, minWidth: 20,
              transition: 'background 0.3s',
            }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ══ Field Label ══ */
const Label = ({ children, required }) => (
  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.textSub, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Sora', sans-serif" }}>
    {children}{required && <span style={{ color: T.error, marginLeft: 3 }}>*</span>}
  </label>
);

/* ══ Input with icon / suffix ══ */
const Field = ({ label, required, icon: Icon, suffix, type = 'text', style: wrapStyle = {}, ...inp }) => (
  <div style={wrapStyle}>
    {label && <Label required={required}>{label}</Label>}
    <div style={{ position: 'relative' }}>
      {Icon && <Icon size={14} color={T.textMute} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />}
      <input
        type={type}
        className="pf-input"
        {...inp}
        style={{ paddingLeft: Icon ? 34 : 13, paddingRight: suffix ? 44 : 13, ...inp.style }}
      />
      {suffix && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: T.textMute, fontWeight: 600, pointerEvents: 'none' }}>{suffix}</span>}
    </div>
  </div>
);

/* ══ Info pair inside review rows ══ */
const Pair = ({ label, value, accent }) => (
  <div style={{ padding: '9px 0', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
    <span style={{ fontSize: 12, color: T.textMute, fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: accent || T.text, textAlign: 'right' }}>{value || '—'}</span>
  </div>
);

/* ══ Section wrapper ══ */
const Section = ({ title, icon: Icon, accent = T.brand, children, style: s = {} }) => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 6px rgba(92,3,155,0.04)', ...s }}>
    {title && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${accent}18`, border: `1.5px solid ${accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={accent} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'Sora', sans-serif" }}>{title}</span>
      </div>
    )}
    {children}
  </div>
);

/* ══ Nav Buttons ══ */
const NavRow = ({ onBack, onNext, nextLabel = 'Continue', nextIcon: NIcon = ArrowRight, loading, disabled, isFirst, isLast }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, gap: 12 }}>
    {!isFirst
      ? <button className="pf-back-btn" onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 20px', background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 11, fontSize: 13, fontWeight: 600, fontFamily: "'Sora', sans-serif", color: T.textSub, cursor: 'pointer', transition: 'all 0.15s' }}>
          <ArrowLeft size={15} /> Back
        </button>
      : <div />
    }
    <button
      className="pf-next-btn"
      onClick={onNext}
      disabled={disabled || loading}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '11px 26px',
        background: disabled ? T.textMute : `linear-gradient(135deg, ${T.brand}, ${T.brandMid})`,
        border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 700,
        fontFamily: "'Sora', sans-serif", color: '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 4px 16px rgba(92,3,155,0.28)',
        transition: 'all 0.18s',
      }}
    >
      {loading
        ? <><Loader2 size={15} style={{ animation: 'pf-spin 0.7s linear infinite' }} /> Processing…</>
        : <>{nextLabel} <NIcon size={15} strokeWidth={2.3} /></>
      }
    </button>
  </div>
);

/* ══ Live EMI Sidebar ══ */
const EMISidebar = ({ form, lead, selectedBank, currentStep }) => {
  const emi          = calcEMI(form.loanAmount, form.interestRate, form.tenureYears);
  const totalPayable = emi * Number(form.tenureYears) * 12;
  const totalInt     = totalPayable - Number(form.loanAmount || 0);
  const ltv          = lead?.propertyDetails?.propertyValue && form.loanAmount
    ? ((form.loanAmount / lead.propertyDetails.propertyValue) * 100).toFixed(1) : null;

  // Checklist
  const checks = [
    { label: 'Lead selected',         done: !!lead },
    { label: 'Bank product chosen',   done: !!selectedBank },
    { label: 'Loan amount set',       done: !!form.loanAmount },
    { label: 'Interest rate set',     done: !!form.interestRate },
    { label: 'Cover note written',    done: form.coverNote?.length > 20 },
  ];
  const score = checks.filter(c => c.done).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 20 }}>

      {/* EMI Card */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 6px rgba(92,3,155,0.04)' }}>
        <div style={{ background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandMid} 100%)`, padding: '20px 20px 18px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Sora', sans-serif" }}>Monthly EMI</p>
          <p style={{ margin: '8px 0 4px', fontSize: 30, fontWeight: 800, color: '#fff', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em' }}>
            {emi ? `AED ${Math.round(emi).toLocaleString('en-AE')}` : '—'}
          </p>
          {form.tenureYears && emi > 0 && (
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
              {form.tenureYears} yrs · {Number(form.tenureYears) * 12} months
            </p>
          )}
        </div>
        <div style={{ padding: '4px 16px 12px' }}>
          {[
            { label: 'Principal',      value: form.loanAmount   ? fmtAED(form.loanAmount)   : '—'                    },
            { label: 'Interest Rate',  value: form.interestRate ? fmtPct(form.interestRate) : '—'                    },
            { label: 'Total Interest', value: totalInt > 0      ? fmtAED(totalInt)          : '—', accent: T.warning },
            { label: 'Total Payable',  value: totalPayable > 0  ? fmtAED(totalPayable)      : '—', accent: T.brand, bold: true },
          ].map(({ label, value, accent, bold }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 12, color: T.textMute }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: accent || T.text }}>{value}</span>
            </div>
          ))}
        </div>

        {/* LTV bar */}
        {ltv && (
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: T.textMute, fontWeight: 500 }}>Loan-to-Value</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: Number(ltv) > 80 ? T.error : T.success }}>{ltv}%</span>
            </div>
            <div style={{ height: 7, background: T.border, borderRadius: 99 }}>
              <div style={{ height: 7, borderRadius: 99, width: `${Math.min(Number(ltv), 100)}%`, background: Number(ltv) > 80 ? T.error : `linear-gradient(90deg, ${T.success}, ${T.brand})`, transition: 'width 0.4s ease' }} />
            </div>
            {Number(ltv) > 80 && <p style={{ fontSize: 11, color: T.error, marginTop: 5, fontWeight: 500 }}>⚠ LTV exceeds 80%</p>}
          </div>
        )}
      </div>

      {/* Progress Checklist */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 6px rgba(92,3,155,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'Sora', sans-serif" }}>Completion</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.brand, background: T.brandLight, padding: '3px 10px', borderRadius: 20, fontFamily: "'Sora', sans-serif" }}>{score}/{checks.length}</span>
        </div>
        {/* Progress bar */}
        <div style={{ height: 6, background: T.border, borderRadius: 99, marginBottom: 14 }}>
          <div style={{ height: 6, borderRadius: 99, width: `${(score / checks.length) * 100}%`, background: `linear-gradient(90deg, ${T.brand}, ${T.brandMid})`, transition: 'width 0.4s ease' }} />
        </div>
        {checks.map(({ label, done }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 0', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: done ? T.successBg : T.bg, border: `1.5px solid ${done ? T.success : T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
              {done
                ? <CheckCircle size={11} color={T.success} strokeWidth={2.5} />
                : <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.border }} />
              }
            </div>
            <span style={{ fontSize: 12, color: done ? T.text : T.textMute, fontWeight: done ? 500 : 400 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Selected bank mini-card */}
      {selectedBank && (
        <div className="fade-up" style={{ background: T.brandLight, border: `1.5px solid ${T.brandBorder}`, borderRadius: 14, padding: '14px 16px' }}>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: T.brand, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'Sora', sans-serif" }}>Selected Bank</p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'Sora', sans-serif" }}>{selectedBank.bankName || 'Bank'}</p>
          <p style={{ margin: '2px 0 10px', fontSize: 12, color: T.textSub }}>{selectedBank.productName || 'Mortgage'}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { k: 'Rate', v: fmtPct(selectedBank.interestRate) },
              { k: 'LTV',  v: selectedBank.maxLtv ? `${selectedBank.maxLtv}%` : '—' },
            ].map(({ k, v }) => (
              <div key={k} style={{ flex: 1, background: '#fff', borderRadius: 8, padding: '8px 10px', textAlign: 'center', border: `1px solid ${T.brandBorder}` }}>
                <p style={{ margin: 0, fontSize: 10, color: T.textMute, fontWeight: 600, textTransform: 'uppercase' }}>{k}</p>
                <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 700, color: T.brand }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════
   STEP VIEWS
════════════════════════════════════════════════════ */

/* ── Step 1: Lead Info Review ── */
const StepLeadInfo = ({ lead, dir }) => {
  const ci = lead?.customerInfo    || {};
  const pd = lead?.propertyDetails || {};
  const lr = lead?.loanRequirements || {};
  return (
    <div className={dir > 0 ? 'step-enter-right' : 'step-enter-left'}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: T.brand, textTransform: 'uppercase', letterSpacing: '0.09em', fontFamily: "'Sora', sans-serif" }}>Step 1 of 5</p>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: T.text, fontFamily: "'Sora', sans-serif" }}>Lead Information</h2>
        <p style={{ margin: 0, fontSize: 13, color: T.textSub }}>Review the customer and property details before proceeding.</p>
      </div>

      {!lead ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: T.warningBg, border: `1px solid #FED7AA`, borderRadius: 12 }}>
          <AlertCircle size={18} color={T.warning} />
          <p style={{ margin: 0, fontSize: 13, color: T.warning, fontWeight: 500 }}>Lead details could not be loaded. You may proceed manually.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Customer avatar strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', background: `linear-gradient(135deg, ${T.brandLight}, #fff)`, border: `1.5px solid ${T.brandBorder}`, borderRadius: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${T.brand}, ${T.brandMid})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: "'Sora', sans-serif" }}>
                {(ci.fullName || 'L').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.text, fontFamily: "'Sora', sans-serif" }}>{ci.fullName || '—'}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                <BadgeCheck size={13} color={T.success} />
                <span style={{ fontSize: 12, fontWeight: 600, color: T.success, fontFamily: "'Sora', sans-serif" }}>Qualified Lead</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Section title="Customer Details" icon={User} accent="#2563EB">
              <Pair label="Email"      value={ci.email} />
              <Pair label="Mobile"     value={ci.mobileNumber} />
              <Pair label="Employer"   value={ci.employer} />
              <Pair label="Monthly Salary" value={fmtAED(ci.monthlySalary)} accent={T.brand} />
            </Section>

            <Section title="Property & Loan" icon={Building2} accent={T.warning}>
              <Pair label="Property Value"  value={fmtAED(pd.propertyValue)} />
              <Pair label="Loan Required"   value={fmtAED(pd.loanAmountRequired)} accent={T.brand} />
              <Pair label="Down Payment"    value={fmtAED(pd.downPaymentAmount)} />
              <Pair label="Tenure Pref."    value={lr.preferredTenureYears ? `${lr.preferredTenureYears} Yrs` : '—'} />
              <Pair label="Rate Type"       value={lr.preferredInterestRateType} />
            </Section>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Step 2: Bank Selection ── */
const StepBankProduct = ({ bankProducts, selectedBank, setSelectedBank, dir }) => (
  <div className={dir > 0 ? 'step-enter-right' : 'step-enter-left'}>
    <div style={{ marginBottom: 24 }}>
      <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: T.brand, textTransform: 'uppercase', letterSpacing: '0.09em', fontFamily: "'Sora', sans-serif" }}>Step 2 of 5</p>
      <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: T.text, fontFamily: "'Sora', sans-serif" }}>Select Bank Product</h2>
      <p style={{ margin: 0, fontSize: 13, color: T.textSub }}>{bankProducts.length} available offers — pick the best fit for your client.</p>
    </div>

    {bankProducts.length === 0 ? (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <Building2 size={40} color={T.brandBorder} style={{ margin: '0 auto 12px' }} />
        <p style={{ fontSize: 14, color: T.textMute, fontWeight: 500 }}>No bank products found.</p>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {bankProducts.map((bank) => {
          const sel = (selectedBank?._id || selectedBank?.id) === (bank._id || bank.id);
          const features = Array.isArray(bank.features) ? bank.features : Array.isArray(bank.snapshotFeatures) ? bank.snapshotFeatures : [];
          return (
            <div
              key={bank._id || bank.id}
              className="bank-opt"
              onClick={() => setSelectedBank(sel ? null : bank)}
              style={{
                border: `2px solid ${sel ? T.brand : T.border}`,
                borderRadius: 16, padding: '18px 20px',
                background: sel ? T.brandLight : T.card,
                position: 'relative', overflow: 'hidden',
                boxShadow: sel ? `0 0 0 4px ${T.brandLight}, 0 4px 18px rgba(92,3,155,0.10)` : '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              {/* Selected checkmark */}
              {sel && (
                <div className="pop-in" style={{ position: 'absolute', top: 14, right: 14 }}>
                  <CheckCircle size={20} color={T.brand} fill={T.brandLight} />
                </div>
              )}

              {/* Top accent bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${T.brand}, ${T.brandMid})`, opacity: sel ? 1 : 0, transition: 'opacity 0.2s' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: sel ? T.brand : T.brandLight, border: `1.5px solid ${T.brandBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s', overflow: 'hidden' }}>
                  {bank.logo
                    ? <img src={bank.logo} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                    : <Building2 size={18} color={sel ? '#fff' : T.brand} />}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.text, fontFamily: "'Sora', sans-serif" }}>{bank.bankName || 'Bank'}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: T.textMute }}>{bank.productName || 'Mortgage'}{bank.productType ? ` · ${bank.productType}` : ''}</p>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: features.length ? 14 : 0 }}>
                {[
                  { label: 'Interest Rate', value: fmtPct(bank.interestRate) },
                  { label: 'Max LTV',       value: bank.maxLtv ? `${bank.maxLtv}%` : '—' },
                  { label: 'Min Loan',      value: fmtAED(bank.minLoanAmount) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: sel ? 'rgba(255,255,255,0.65)' : T.bg, borderRadius: 10, padding: '10px 12px', textAlign: 'center', border: `1px solid ${T.border}` }}>
                    <p style={{ margin: 0, fontSize: 10, color: T.textMute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                    <p style={{ margin: '5px 0 0', fontSize: 14, fontWeight: 700, color: T.brand, fontFamily: "'Sora', sans-serif" }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Features */}
              {features.slice(0, 3).map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: i === 0 ? 0 : 5 }}>
                  <CheckCircle size={12} color={T.success} strokeWidth={2.5} />
                  <span style={{ fontSize: 12, color: T.textSub }}>{f}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    )}
  </div>
);

/* ── Step 3: Loan Details ── */
const StepLoanDetails = ({ form, handleChange, dir }) => (
  <div className={dir > 0 ? 'step-enter-right' : 'step-enter-left'}>
    <div style={{ marginBottom: 24 }}>
      <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: T.brand, textTransform: 'uppercase', letterSpacing: '0.09em', fontFamily: "'Sora', sans-serif" }}>Step 3 of 5</p>
      <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: T.text, fontFamily: "'Sora', sans-serif" }}>Loan Details</h2>
      <p style={{ margin: 0, fontSize: 13, color: T.textSub }}>Configure the financial parameters of this proposal.</p>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Loan amount — full width, prominent */}
      <Section title="Primary Details" icon={DollarSign} accent={T.brand}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Loan Amount" required icon={DollarSign} type="number" name="loanAmount" value={form.loanAmount} onChange={handleChange} suffix="AED" placeholder="e.g. 2,000,000" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Interest Rate" required icon={Percent} type="number" step="0.01" name="interestRate" value={form.interestRate} onChange={handleChange} suffix="%" placeholder="e.g. 4.50" />
            <Field label="Tenure" icon={Calendar} type="number" name="tenureYears" value={form.tenureYears} onChange={handleChange} suffix="Yrs" placeholder="25" />
          </div>
        </div>
      </Section>

      {/* Additional costs */}
      <Section title="Additional Costs" icon={CreditCard} accent={T.warning}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Processing Fee" icon={CreditCard} type="number" name="processingFee" value={form.processingFee} onChange={handleChange} suffix="AED" placeholder="0" />
          <Field label="Insurance Amount" icon={Shield} type="number" name="insuranceAmount" value={form.insuranceAmount} onChange={handleChange} suffix="AED" placeholder="0" />
        </div>
        {(form.processingFee || form.insuranceAmount) && (
          <div style={{ marginTop: 14, padding: '12px 14px', background: T.warningBg, borderRadius: 10, border: `1px solid #FED7AA`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: T.warning }}>Total Upfront Cost</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.warning, fontFamily: "'Sora', sans-serif" }}>
              {fmtAED((Number(form.processingFee) || 0) + (Number(form.insuranceAmount) || 0))}
            </span>
          </div>
        )}
      </Section>
    </div>
  </div>
);

/* ── Step 4: Cover Note ── */
const StepCoverNote = ({ form, handleChange, lead, selectedBank, dir }) => {
  const generate = () => {
    const name    = lead?.customerInfo?.fullName || 'Valued Customer';
    const bank    = selectedBank?.bankName || 'our banking partner';
    const propVal = fmtAED(lead?.propertyDetails?.propertyValue);
    const salary  = fmtAED(lead?.customerInfo?.monthlySalary);
    handleChange({ target: { name: 'coverNote', value:
      `Dear ${name},\n\nThank you for choosing Xoto Vault. Based on your requirements (property value ${propVal}, monthly salary ${salary}), we have secured an excellent mortgage option for you with ${bank}.\n\nThis proposal outlines the recommended financing structure tailored specifically for your situation. Please review the details carefully and feel free to reach out if you have any questions.\n\nWarm regards,\nXoto Vault Team`
    }});
  };

  return (
    <div className={dir > 0 ? 'step-enter-right' : 'step-enter-left'}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: T.brand, textTransform: 'uppercase', letterSpacing: '0.09em', fontFamily: "'Sora', sans-serif" }}>Step 4 of 5</p>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: T.text, fontFamily: "'Sora', sans-serif" }}>Cover Note</h2>
        <p style={{ margin: 0, fontSize: 13, color: T.textSub }}>Craft a personal message to accompany this proposal.</p>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 6px rgba(92,3,155,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Label>Message to Customer</Label>
          <button
            onClick={generate}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px',
              background: `linear-gradient(135deg, ${T.brand}, ${T.brandMid})`,
              border: 'none', borderRadius: 8,
              fontSize: 12, fontWeight: 700,
              fontFamily: "'Sora', sans-serif",
              color: '#fff', cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(92,3,155,0.22)',
            }}
          >
            <Sparkles size={13} strokeWidth={2} />
            Auto Generate
          </button>
        </div>

        <textarea
          className="pf-textarea"
          name="coverNote"
          value={form.coverNote}
          onChange={handleChange}
          rows={9}
          placeholder="Dear [Customer Name],&#10;&#10;Start typing your personalised message…"
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <span style={{ fontSize: 11, color: T.textMute }}>{form.coverNote?.length || 0} characters</span>
          {form.coverNote?.length > 20 && (
            <span className="pop-in" style={{ fontSize: 11, fontWeight: 600, color: T.success, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={12} strokeWidth={2.5} /> Looks good!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Step 5: Final Review ── */
const StepReview = ({ form, lead, selectedBank, dir }) => {
  const emi          = calcEMI(form.loanAmount, form.interestRate, form.tenureYears);
  const totalPayable = emi * Number(form.tenureYears) * 12;
  const totalInt     = totalPayable - Number(form.loanAmount || 0);

  const reviewSections = [
    {
      title: 'Customer', icon: User, accent: '#2563EB',
      rows: [
        { label: 'Name',   value: lead?.customerInfo?.fullName },
        { label: 'Email',  value: lead?.customerInfo?.email },
        { label: 'Salary', value: fmtAED(lead?.customerInfo?.monthlySalary) },
      ],
    },
    {
      title: 'Bank Product', icon: Building2, accent: T.warning,
      rows: [
        { label: 'Bank',    value: selectedBank?.bankName || '—' },
        { label: 'Product', value: selectedBank?.productName || '—' },
        { label: 'Rate',    value: fmtPct(selectedBank?.interestRate) },
        { label: 'Max LTV', value: selectedBank?.maxLtv ? `${selectedBank.maxLtv}%` : '—' },
      ],
    },
    {
      title: 'Loan Details', icon: Calculator, accent: T.brand,
      rows: [
        { label: 'Loan Amount',   value: fmtAED(form.loanAmount),   accent: T.brand },
        { label: 'Interest Rate', value: fmtPct(form.interestRate) },
        { label: 'Tenure',        value: form.tenureYears ? `${form.tenureYears} Years` : '—' },
        { label: 'Processing Fee',value: fmtAED(form.processingFee) },
        { label: 'Insurance',     value: fmtAED(form.insuranceAmount) },
      ],
    },
    {
      title: 'Financials', icon: TrendingUp, accent: T.success,
      rows: [
        { label: 'Monthly EMI',     value: emi ? `AED ${Math.round(emi).toLocaleString('en-AE')}` : '—', accent: T.brand },
        { label: 'Total Interest',  value: totalInt > 0 ? fmtAED(totalInt) : '—', accent: T.warning },
        { label: 'Total Payable',   value: totalPayable > 0 ? fmtAED(totalPayable) : '—', accent: T.brand },
      ],
    },
  ];

  return (
    <div className={dir > 0 ? 'step-enter-right' : 'step-enter-left'}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: T.brand, textTransform: 'uppercase', letterSpacing: '0.09em', fontFamily: "'Sora', sans-serif" }}>Step 5 of 5</p>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: T.text, fontFamily: "'Sora', sans-serif" }}>Review & Create</h2>
        <p style={{ margin: 0, fontSize: 13, color: T.textSub }}>Everything looks right? Submit the proposal below.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {reviewSections.map(({ title, icon, accent, rows }) => (
          <Section key={title} title={title} icon={icon} accent={accent}>
            {rows.map(({ label, value, accent: a }, i) => (
              <div key={label} style={{ padding: '8px 0', borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: T.textMute, fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: a || T.text, textAlign: 'right' }}>{value || '—'}</span>
              </div>
            ))}
          </Section>
        ))}
      </div>

      {/* Cover note preview */}
      {form.coverNote && (
        <div style={{ marginTop: 16, background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '18px 22px', boxShadow: '0 1px 6px rgba(92,3,155,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <FileText size={15} color={T.brand} />
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'Sora', sans-serif" }}>Cover Note Preview</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: T.textSub, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>{form.coverNote}</p>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════ */
const ProposalForm = () => {
  const { leadId } = useParams();
  const navigate   = useNavigate();

  const [lead,         setLead]         = useState(null);
  const [bankProducts, setBankProducts] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [submitMsg,    setSubmitMsg]    = useState(null);
  const [step,         setStep]         = useState(1);
  const [dir,          setDir]          = useState(1); // 1=forward -1=backward

  const [form, setForm] = useState({
    loanAmount: '', interestRate: '', tenureYears: 25,
    processingFee: '', insuranceAmount: '', coverNote: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /* ── Init ── */
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const leadRes = await apiService.get(`/vault/lead/partner/get?page=1&limit=100`);
        const data = leadRes?.data || leadRes;
        const list =
          Array.isArray(data)        ? data :
          Array.isArray(data?.leads) ? data.leads :
          Array.isArray(data?.data)  ? data.data :
          Array.isArray(data?.docs)  ? data.docs : [];
        const found = list.find(l => (l._id || l.id) === leadId);
        setLead(found || null);
        if (found) {
          setForm(prev => ({
            ...prev,
            loanAmount:  found.propertyDetails?.loanAmountRequired || '',
            tenureYears: found.loanRequirements?.preferredTenureYears || 25,
          }));
        }
        try {
          const bankRes = await apiService.get('/bank/products/get-all-bank-products?page=1&limit=10');
          const raw =
            Array.isArray(bankRes?.data)                     ? bankRes.data :
            Array.isArray(bankRes?.data?.data)               ? bankRes.data.data :
            Array.isArray(bankRes?.data?.data?.bankProducts) ? bankRes.data.data.bankProducts :
            Array.isArray(bankRes?.data?.bankProducts)       ? bankRes.data.bankProducts : [];
          const normalize = (b) => ({
            ...b,
            bankName:     b.bankInfo?.bankName      || b.bankName || b.name || '',
            productName:  b.offerSummary?.title     || b.productName || 'Mortgage',
            interestRate: b.offerSummary?.initialRate ?? b.interestRate ?? '',
            maxLtv:       b.eligibility?.maxLTV      ?? b.maxLtv ?? '',
            minLoanAmount:b.eligibility?.minLoanAmount ?? b.minLoanAmount ?? '',
            productType:  b.offerSummary?.productType || '',
            logo:         b.bankInfo?.logo || '',
            features:     Array.isArray(b.features?.keyFeatures) ? b.features.keyFeatures :
                          Array.isArray(b.features?.benefits)    ? b.features.benefits :
                          Array.isArray(b.features)              ? b.features : [],
          });
          setBankProducts(raw.map(normalize));
        } catch { setBankProducts([]); }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    init();
  }, [leadId]);

  /* Auto-fill rate from bank */
  useEffect(() => {
    if (selectedBank) {
      setForm(prev => ({ ...prev, interestRate: selectedBank.interestRate || prev.interestRate }));
    }
  }, [selectedBank]);

  const goNext = () => { setDir(1); setStep(s => Math.min(s + 1, 5)); };
  const goBack = () => { setDir(-1); setStep(s => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    if (!form.loanAmount || !form.interestRate) {
      setSubmitMsg({ type: 'error', text: 'Loan amount and interest rate are required.' });
      setTimeout(() => setSubmitMsg(null), 4000);
      return;
    }
    try {
      setSubmitting(true);
      const emi = calcEMI(form.loanAmount, form.interestRate, form.tenureYears);
      const payload = {
        leadId,
        selectedBankProducts: selectedBank ? [{
          bankProductId:    selectedBank._id || selectedBank.id,
          snapshotRate:     Number(form.interestRate),
          snapshotFeatures: selectedBank.features || [],
          snapshotMaxLtv:   selectedBank.maxLtv || 80,
        }] : [],
        coverNote:          form.coverNote,
        loanAmount:         Number(form.loanAmount),
        interestRate:       Number(form.interestRate),
        tenureYears:        Number(form.tenureYears),
        processingFee:      Number(form.processingFee)   || 0,
        insuranceAmount:    Number(form.insuranceAmount)  || 0,
        monthlyInstallment: emi ? Math.round(emi) : 0,
        status:             'sent',
      };
      await apiService.post('/vault/lead/proposals', payload);
      setSubmitMsg({ type: 'success', text: 'Proposal created successfully!' });
      setTimeout(() => navigate(-1), 1800);
    } catch (err) {
      setSubmitMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to submit proposal.' });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="pf-root" style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <GStyle />
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid ${T.brandBorder}`, borderTopColor: T.brand, animation: 'pf-spin 0.7s linear infinite', margin: '0 auto 14px' }} />
        <p style={{ fontSize: 13, color: T.textMute, fontWeight: 500, fontFamily: "'Sora', sans-serif" }}>Loading proposal form…</p>
      </div>
    </div>
  );

  return (
    <div className="pf-root" style={{ minHeight: '100vh', background: T.bg, padding: '24px 28px' }}>
      <GStyle />

      {/* ── Top Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
       {step === 1 && (
  <button
    onClick={() => navigate(-1)}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px',
      background: 'transparent',
      border: 'none',
      fontSize: 15,
      fontWeight: 600,
      color: '#000',
      cursor: 'pointer'
    }}
  >
    <ArrowLeft size={20} />
  </button>
)}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.text, fontFamily: "'Sora', sans-serif" }}>Create Proposal</h1>
          {lead?.customerInfo?.fullName && (
            <p style={{ margin: '2px 0 0', fontSize: 12, color: T.textMute }}>For :-  <strong style={{ color: T.brand }}>{lead.customerInfo.fullName}</strong></p>
          )}
        </div>
      </div>

      {/* ── Stepper ── */}
      <StepperHeader current={step} />

      {/* ── Body Layout ── */}
      <div className="pf-layout">
        {/* ── Left: Step Content ── */}
        <div>
          {/* Feedback toast */}
          {submitMsg && (
            <div className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', marginBottom: 20, borderRadius: 12, background: submitMsg.type === 'success' ? T.successBg : T.errorBg, border: `1px solid ${submitMsg.type === 'success' ? T.successBdr : '#FECACA'}` }}>
              {submitMsg.type === 'success' ? <CheckCircle size={16} color={T.success} /> : <AlertCircle size={16} color={T.error} />}
              <span style={{ fontSize: 13, fontWeight: 500, color: submitMsg.type === 'success' ? '#065F46' : '#991B1B' }}>{submitMsg.text}</span>
            </div>
          )}

          {/* Step panels */}
          {step === 1 && <StepLeadInfo lead={lead} dir={dir} />}
          {step === 2 && <StepBankProduct bankProducts={bankProducts} selectedBank={selectedBank} setSelectedBank={setSelectedBank} dir={dir} />}
          {step === 3 && <StepLoanDetails form={form} handleChange={handleChange} dir={dir} />}
          {step === 4 && <StepCoverNote form={form} handleChange={handleChange} lead={lead} selectedBank={selectedBank} dir={dir} />}
          {step === 5 && <StepReview form={form} lead={lead} selectedBank={selectedBank} dir={dir} />}

          {/* Navigation */}
          <NavRow
            isFirst={step === 1}
            isLast={step === 5}
            onBack={goBack}
            onNext={step < 5 ? goNext : handleSubmit}
            nextLabel={step === 5 ? 'Create Proposal' : 'Continue'}
            
            loading={submitting}
            disabled={
              (step === 3 && (!form.loanAmount || !form.interestRate))
            }
          />
        </div>

        {/* ── Right: Sticky Sidebar ── */}
        <EMISidebar form={form} lead={lead} selectedBank={selectedBank} currentStep={step} />
      </div>
    </div>
  );
};

export default ProposalForm;