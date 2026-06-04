// import React, { useState, useEffect } from 'react';
// import { apiService } from "../../manageApi/utils/custom.apiservice";
// import toast, { Toaster } from 'react-hot-toast';
// import {
//   FaMoneyBillWave, FaPhoneAlt, FaWhatsapp, FaEnvelope,
//   FaCheckCircle, FaInfoCircle, FaTimes, FaCalendarAlt,
//   FaArrowRight, FaCalculator
// } from 'react-icons/fa';

// const PRODUCTS = [
//   { id: '3yr', label: '3yr Fixed', rate: 3.99 },
//   { id: '5yr', label: '5yr Fixed', rate: 4.19 },
//   { id: 'var', label: 'Variable', rate: 7.0 },
// ];

// const LOCATIONS = [
//   'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman',
//   'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Al Ain',
// ];

// const COUNTRIES = [
//   { code: 'AE', dialCode: '+971', maxLength: 9, name: 'UAE' },
//   { code: 'IN', dialCode: '+91', maxLength: 10, name: 'India' },
//   { code: 'SA', dialCode: '+966', maxLength: 9, name: 'Saudi Arabia' },
//   { code: 'US', dialCode: '+1', maxLength: 10, name: 'USA' },
//   { code: 'GB', dialCode: '+44', maxLength: 10, name: 'UK' },
//   { code: 'PK', dialCode: '+92', maxLength: 10, name: 'Pakistan' },
//   { code: 'QA', dialCode: '+974', maxLength: 8, name: 'Qatar' },
// ];

// const MIN_SALARY = 10000;
// const DSR = 0.5;
// const getStressRate = (years) => {
//   if (years <= 15) return 3.17;
//   if (years <= 17) return 3.41;
//   if (years <= 20) return 3.68;
//   return 3.98;
// };

// const formatCurrency = (value) =>
//   new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

// const calculateEMI = (principal, annualRate, years) => {
//   if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
//   const r = annualRate / 100 / 12;
//   const n = years * 12;
//   return Math.round(principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
// };

// const calculatePropertyPrice = (maxEMI, annualRate, years) => {
//   if (maxEMI <= 0) return 0;
//   const r = annualRate / 100 / 12;
//   const n = years * 12;
//   const loanAmount = maxEMI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
//   return Math.round((loanAmount / 0.85) * 0.92);
// };

// // ─── Modal Wrapper ───────────────────────────────────────────────────────────
// const ModalWrapper = ({ isOpen, onClose, title, subtitle, children }) => {
//   useEffect(() => {
//     document.body.style.overflow = isOpen ? 'hidden' : 'unset';
//     return () => { document.body.style.overflow = 'unset'; };
//   }, [isOpen]);

//   if (!isOpen) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} style={{ fontFamily: '"DM Sans", sans-serif' }}>
//       <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
//         <div className="relative p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
//           <div>
//             <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
//             {subtitle && <p className="text-sm text-slate-500 font-medium mt-1">{subtitle}</p>}
//           </div>
//           <button onClick={onClose} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition"><FaTimes size={20} /></button>
//         </div>
//         <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
//       </div>
//     </div>
//   );
// };

// // ─── Loan Summary Modal ──────────────────────────────────────────────────────
// const LoanSummaryModal = ({ isOpen, onClose, data }) => {
//   const downpayment = data.affordability * 0.15;
//   const transactionCosts = data.affordability * 0.055;
//   return (
//     <ModalWrapper isOpen={isOpen} onClose={onClose} title="Cost & Affordability Breakdown" subtitle="Detailed breakdown of your costs">
//       <div className="space-y-5">
//         <div className="space-y-3">
//           <div className="flex justify-between text-slate-600 font-medium"><span>Downpayment (15%)</span><span className="font-semibold text-slate-800">{formatCurrency(downpayment)}</span></div>
//           <div className="flex justify-between text-slate-600 font-medium"><span>Transaction costs (5.5%)</span><span className="font-semibold text-slate-800">{formatCurrency(transactionCosts)}</span></div>
//           <div className="pt-3 border-t border-slate-200 flex justify-between text-lg font-bold text-purple-900"><span>Total Upfront Cost</span><span>{formatCurrency(downpayment + transactionCosts)}</span></div>
//         </div>
//         <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 text-center">
//           <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Maximum Home Price</p>
//           <p className="text-3xl font-bold text-purple-700 tracking-tight">{formatCurrency(data.affordability * 0.85)}</p>
//         </div>
//         <div className="flex justify-between items-center py-3 px-4 bg-slate-50 rounded-xl border border-slate-100">
//           <span className="text-slate-600 font-medium">Estimated Monthly EMI</span>
//           <span className="font-bold text-xl text-emerald-600">{formatCurrency(data.monthly)}</span>
//         </div>
//         <div className="space-y-2">
//           <div className="flex gap-3 items-start p-3 bg-blue-50 text-blue-800 rounded-xl text-xs font-medium leading-relaxed"><FaInfoCircle className="mt-0.5 shrink-0" /><p>Includes a buffer for potential rate increases.</p></div>
//           <div className="flex gap-3 items-start p-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-medium leading-relaxed"><span className="shrink-0 font-bold">ⓘ</span><p>Most home loans in the UAE have terms up to 25 years, based on your age.</p></div>
//         </div>
//         <button onClick={onClose} className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-200">Got it</button>
//       </div>
//     </ModalWrapper>
//   );
// };

// // ─── Pre-Approval Modal ──────────────────────────────────────────────────────
// const PreApprovalModal = ({ isOpen, onClose, calculatorData }) => {
//   const [step, setStep] = useState('form');
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', selectedCountry: COUNTRIES[0], email: '', foundProperty: 'no', location: '' });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (formData.phone.length !== formData.selectedCountry.maxLength) { toast.error(`Please enter a valid ${formData.selectedCountry.maxLength}-digit number for ${formData.selectedCountry.name}.`); return; }
//     setLoading(true);
//     const toastId = toast.loading('Submitting your application...');
//     try {
//       const payload = { type: "mortgage", lead_sub_type: "pre_approval", name: { first_name: formData.firstName, last_name: formData.lastName }, mobile: { country_code: formData.selectedCountry.dialCode, number: formData.phone }, email: formData.email, has_property: formData.foundProperty === 'yes', preferred_city: formData.location || "", mortgage: { monthly_income: calculatorData.monthlyIncome, monthly_debt: calculatorData.monthlyDebt } };
//       const res = await apiService.post('/property/lead/', payload);
//       if (res.success || res.status === 200 || res.status === 201) { toast.success('Application submitted!', { id: toastId }); setStep('success'); }
//       else toast.error(res.message || "Something went wrong.", { id: toastId });
//     } catch { toast.error("Network error. Please check your connection.", { id: toastId }); }
//     finally { setLoading(false); }
//   };

//   if (step === 'success') return (
//     <ModalWrapper isOpen={isOpen} onClose={onClose} title="Request Sent!">
//       <div className="text-center py-6">
//         <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"><FaCheckCircle size={40} /></div>
//         <h2 className="text-xl font-bold text-slate-800 mb-2">Thank You!</h2>
//         <p className="text-slate-500 mb-8 font-medium px-4 leading-relaxed">Your pre-approval request has been submitted. Our advisors will contact you within 24 hours.</p>
//         <button onClick={onClose} className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold">Return to Dashboard</button>
//       </div>
//     </ModalWrapper>
//   );

//   return (
//     <ModalWrapper isOpen={isOpen} onClose={onClose} title="Get Pre-Approved" subtitle="Start your property journey today.">
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div><label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">First Name *</label><input required type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} placeholder="e.g. Rahul" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition font-medium" /></div>
//           <div><label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Last Name *</label><input required type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} placeholder="e.g. Sharma" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition font-medium" /></div>
//         </div>
//         <div>
//           <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Phone *</label>
//           <div className="flex border border-slate-200 rounded-xl bg-slate-50 focus-within:ring-2 focus-within:ring-purple-500 transition overflow-hidden">
//             <div className="flex items-center pl-3 pr-2 bg-slate-100/80 border-r border-slate-200">
//               <img src={`https://flagcdn.com/w20/${formData.selectedCountry.code.toLowerCase()}.png`} alt={formData.selectedCountry.code} className="w-5 h-auto mr-1.5 rounded-[2px]" />
//               <select value={formData.selectedCountry.code} onChange={e => setFormData({ ...formData, selectedCountry: COUNTRIES.find(c => c.code === e.target.value), phone: '' })} className="bg-transparent font-semibold text-slate-700 outline-none text-sm cursor-pointer w-[54px]">{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.dialCode}</option>)}</select>
//             </div>
//             <input required type="tel" value={formData.phone} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= formData.selectedCountry.maxLength) setFormData({ ...formData, phone: v }); }} placeholder="XX XXX XXXX" className="w-full p-4 bg-transparent outline-none font-medium" />
//           </div>
//         </div>
//         <div><label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Email *</label><input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition font-medium" /></div>
//         <div>
//           <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1 uppercase tracking-wide">Found a property? *</label>
//           <div className="flex gap-4">
//             <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition font-medium text-sm"><input type="radio" name="fp" checked={formData.foundProperty === 'yes'} onChange={() => setFormData({ ...formData, foundProperty: 'yes' })} className="accent-purple-600" /> Yes</label>
//             <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition font-medium text-sm"><input type="radio" name="fp" checked={formData.foundProperty === 'no'} onChange={() => setFormData({ ...formData, foundProperty: 'no' })} className="accent-purple-600" /> No</label>
//           </div>
//         </div>
//         {formData.foundProperty === 'yes' && (
//           <div><label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Location *</label><select required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition font-medium"><option value="">Select emirate</option>{LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}</select></div>
//         )}
//         <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer mt-4"><input required type="checkbox" className="mt-1 accent-purple-600" /><span className="text-xs text-slate-500 leading-relaxed font-medium">I agree to receive newsletters and marketing communications. I accept the Terms of Service and Privacy Policy.</span></label>
//         <button type="submit" disabled={loading} className="w-full bg-[#5C039B] text-white py-4 rounded-xl font-semibold hover:bg-[#4a027d] transition shadow-lg shadow-purple-200 mt-2 disabled:opacity-70 flex justify-center items-center">{loading ? 'Submitting...' : 'Submit Application →'}</button>
//       </form>
//     </ModalWrapper>
//   );
// };

// // ─── Contact Modal ───────────────────────────────────────────────────────────
// const ContactModal = ({ isOpen, onClose }) => {
//   const [step, setStep] = useState('schedule');
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedTime, setSelectedTime] = useState(null);
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [phone, setPhone] = useState('');
//   const [country, setCountry] = useState(COUNTRIES[0]);
//   const dates = [{ day: 'MON' }, { day: 'TUE' }, { day: 'WED' }, { day: 'THU' }, { day: 'FRI' }];
//   const times = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];

//   if (step === 'success') return (
//     <ModalWrapper isOpen={isOpen} onClose={onClose} title="Meeting Booked!">
//       <div className="text-center py-6">
//         <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"><FaCalendarAlt size={32} /></div>
//         <p className="text-slate-500 font-medium mb-8 px-4 leading-relaxed">Your consultation has been secured. We've sent a calendar invite to your email.</p>
//         <button onClick={onClose} className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold">Done</button>
//       </div>
//     </ModalWrapper>
//   );

//   if (step === 'details') return (
//     <ModalWrapper isOpen={isOpen} onClose={() => setStep('schedule')} title="Your Details" subtitle="Step 2 of 2">
//       <form onSubmit={e => { e.preventDefault(); if (phone.length !== country.maxLength) { toast.error(`Please enter a valid ${country.maxLength}-digit number`); return; } setStep('success'); }} className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div><label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">First Name</label><input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium" /></div>
//           <div><label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Last Name</label><input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium" /></div>
//         </div>
//         <div>
//           <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Phone</label>
//           <div className="flex border border-slate-200 rounded-xl bg-slate-50 focus-within:ring-2 focus-within:ring-purple-500 transition overflow-hidden">
//             <div className="flex items-center pl-3 pr-2 bg-slate-100/80 border-r border-slate-200">
//               <img src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} alt={country.code} className="w-5 h-auto mr-1.5 rounded-[2px]" />
//               <select value={country.code} onChange={e => { setCountry(COUNTRIES.find(c => c.code === e.target.value)); setPhone(''); }} className="bg-transparent font-semibold text-slate-700 outline-none text-sm cursor-pointer w-[54px]">{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.dialCode}</option>)}</select>
//             </div>
//             <input required type="tel" value={phone} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= country.maxLength) setPhone(v); }} placeholder="XX XXX XXXX" className="w-full p-4 bg-transparent outline-none font-medium" />
//           </div>
//         </div>
//         <div className="flex gap-3 pt-4">
//           <button type="button" onClick={() => setStep('schedule')} className="flex-1 py-4 rounded-xl font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Back</button>
//           <button type="submit" className="flex-1 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-200">Confirm →</button>
//         </div>
//       </form>
//     </ModalWrapper>
//   );

//   return (
//     <ModalWrapper isOpen={isOpen} onClose={onClose} title="Book a Call" subtitle="Step 1 of 2 - Choose a time">
//       <div className="space-y-6">
//         <div>
//           <p className="text-xs font-semibold text-slate-500 mb-3 ml-1 uppercase tracking-wide">Select Date</p>
//           <div className="grid grid-cols-5 gap-2">
//             {dates.map((d, i) => (
//               <button key={i} onClick={() => setSelectedDate(i)} className={`p-3 text-center border-2 rounded-xl transition ${selectedDate === i ? 'border-purple-600 bg-purple-50' : 'border-slate-100 hover:border-purple-200'}`}>
//                 <div className={`text-sm font-bold ${selectedDate === i ? 'text-purple-600' : 'text-slate-600'}`}>{d.day}</div>
//               </button>
//             ))}
//           </div>
//         </div>
//         <div>
//           <p className="text-xs font-semibold text-slate-500 mb-3 ml-1 uppercase tracking-wide">Select Time</p>
//           <div className="grid grid-cols-3 gap-3">
//             {times.map((t, i) => (
//               <button key={i} onClick={() => setSelectedTime(i)} className={`py-3 text-sm font-semibold text-center border-2 rounded-xl transition ${selectedTime === i ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-100 text-slate-600 hover:border-purple-200'}`}>{t}</button>
//             ))}
//           </div>
//         </div>
//         <button onClick={() => setStep('details')} disabled={selectedDate === null || selectedTime === null} className={`w-full py-4 rounded-xl font-semibold transition ${selectedDate !== null && selectedTime !== null ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>Continue →</button>
//       </div>
//     </ModalWrapper>
//   );
// };

// // ─── Main Component ──────────────────────────────────────────────────────────
// export default function PerfectMortgageCalculator() {
//   const [activeTab, setActiveTab] = useState('affordability');
//   const [residency, setResidency] = useState('UAE Resident');
//   const [employment, setEmployment] = useState('');
//   const [monthlyIncome, setMonthlyIncome] = useState(25000);
//   const [monthlyDebt, setMonthlyDebt] = useState('');
//   const [loanTenure, setLoanTenure] = useState(25);
//   const [propertyValue, setPropertyValue] = useState(1500000);
//   const [downpayment, setDownpayment] = useState(300000);
//   const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
//   const [loanDuration, setLoanDuration] = useState(25);
//   const [modals, setModals] = useState({ summary: false, preapproval: false, contact: false });

//   const openModal = (type) => setModals({ ...modals, [type]: true });
//   const closeModal = (type) => setModals({ ...modals, [type]: false });

//   const safeIncome = Number(monthlyIncome) || 0;
//   const safeDebt = Number(monthlyDebt) || 0;
//   const safePropVal = Number(propertyValue) || 0;
//   const safeDownpayment = Number(downpayment) || 0;
//   const maxEMI = safeIncome * DSR - safeDebt;
//   const isEligible = safeIncome >= MIN_SALARY && maxEMI > 0;
//   const stressRate = getStressRate(loanTenure);
//   const affordability = isEligible ? calculatePropertyPrice(maxEMI, stressRate, loanTenure) : 0;
//   const monthlyPayment = isEligible ? Math.round(maxEMI) : 0;
//   const loanAmount = Math.max(0, safePropVal - safeDownpayment);
//   const monthlyEMI = calculateEMI(loanAmount, selectedProduct.rate, loanDuration);
//   const calculatorData = { monthlyIncome: safeIncome, monthlyDebt: safeDebt, loanTenure, propertyValue: safePropVal, downpayment: safeDownpayment, loanAmount, rate: selectedProduct.rate, loanDuration, affordability, monthlyEMI, employment, residency };

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 md:p-10 text-slate-800" style={{ fontFamily: '"DM Sans", sans-serif' }}>
//       <Toaster position="top-center" reverseOrder={false} />
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
//         input[type=range] { -webkit-appearance: none; appearance: none; height: 6px; border-radius: 999px; background: #E2E8F0; outline: none; cursor: pointer; }
//         input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #7C3AED; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(124,58,237,0.4); cursor: pointer; }
//         input[type=range]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #7C3AED; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(124,58,237,0.4); cursor: pointer; border: 3px solid white; }
//         input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
//         .field-input { width: 100%; padding: 13px 16px; background: #F8FAFC; border: 1.5px solid #E9EEF5; border-radius: 14px; font-size: 15px; font-weight: 600; color: #1E293B; outline: none; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit; }
//         .field-input:focus { border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
//         select.field-input { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%2394A3B8' d='M6 8L0 0h12z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; }
//       `}</style>

//       <div className="max-w-6xl mx-auto">
//         {/* ── FIX 1: 3-col grid, items-stretch so all columns same height ── */}
//         <div className="grid lg:grid-cols-12 gap-8 items-stretch">

//           {/* Col 1 — Heading: flex column, justify-center so text vertically centers inside card height */}
//           <div className="lg:col-span-5 flex flex-col justify-center">
//             {/* FIX: text-4xl + leading-tight makes heading fit in ~2 lines */}
//             <h1 className="text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
//               Discover Your True Buying Power
//             </h1>
//             <p className="text-slate-500 mt-4 text-base font-medium leading-relaxed">
//               Smart property financing for the UAE market.
//             </p>
//           </div>

//           {/* Col 2 — Form Card */}
//           {/* FIX 2: More padding (p-8), bigger gap between sections */}
//           <div className="lg:col-span-4 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">

//             {/* Tab Toggle */}
//             <div className="flex p-1.5 bg-slate-100 rounded-[1.25rem] mb-8">
//               <button onClick={() => setActiveTab('affordability')} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'affordability' ? 'bg-white text-[#5C039B] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
//                 <FaCalculator size={13} /> Buying Power
//               </button>
//               <button onClick={() => setActiveTab('mortgage')} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'mortgage' ? 'bg-white text-[#5C039B] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
//                 <FaMoneyBillWave size={13} /> EMI Planner
//               </button>
//             </div>

//             {/* ── Buying Power Tab ── */}
//             {activeTab === 'affordability' && (
//               <div className="space-y-5">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Residency</label>
//                     <select value={residency} onChange={e => setResidency(e.target.value)} className="field-input">
//                       <option>UAE Resident</option><option>UAE National</option><option>Non-Resident</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Employment</label>
//                     <select value={employment} onChange={e => setEmployment(e.target.value)} className="field-input">
//                       <option value="">Select type</option>
//                       <option value="salaried">Salaried</option>
//                       <option value="self_employed">Self-Employed</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Income (AED)</label>
//                     <input type="number" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} placeholder="0" className="field-input" />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Debts (AED)</label>
//                     <input type="number" value={monthlyDebt} onChange={e => setMonthlyDebt(e.target.value)} placeholder="Optional" className="field-input" />
//                   </div>
//                 </div>

//                 {/* Slider */}
//                 <div className="pt-2">
//                   <div className="flex justify-between items-center mb-3">
//                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loan Tenure</label>
//                     <span className="text-lg font-bold text-purple-600">{loanTenure} <span className="text-sm font-medium text-slate-400">Yrs</span></span>
//                   </div>
//                   <input type="range" min={5} max={25} value={loanTenure} onChange={e => setLoanTenure(Number(e.target.value))} className="w-full" style={{ accentColor: '#7C3AED' }} />
//                   <div className="flex justify-between text-xs font-medium text-slate-300 mt-2"><span>5 Yrs</span><span>25 Yrs</span></div>
//                 </div>
//               </div>
//             )}

//             {/* ── EMI Planner Tab ── */}
//             {activeTab === 'mortgage' && (
//               <div className="space-y-5">

//                 {/* FIX 3: Rate buttons — 3 in a row, bigger & cleaner */}
//                 <div>
//                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Rate Type</label>
//                   <div className="grid grid-cols-3 gap-3">
//                     {PRODUCTS.map(p => (
//                       <button key={p.id} onClick={() => setSelectedProduct(p)}
//                         style={{ padding: '14px 8px', border: selectedProduct.id === p.id ? '2px solid #7C3AED' : '1.5px solid #E9EEF5', borderRadius: 14, background: selectedProduct.id === p.id ? '#F5F0FF' : '#F8FAFC', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', transition: 'all 0.15s' }}>
//                         <div style={{ fontSize: 17, fontWeight: 800, color: selectedProduct.id === p.id ? '#7C3AED' : '#475569', lineHeight: 1.2 }}>{p.rate}%</div>
//                         <div style={{ fontSize: 11, fontWeight: 600, color: selectedProduct.id === p.id ? '#9061F9' : '#94A3B8', marginTop: 3 }}>{p.label}</div>
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Property Value (AED)</label>
//                     <input type="number" value={propertyValue} onChange={e => setPropertyValue(e.target.value)} placeholder="0" className="field-input" />
//                   </div>
//                   <div>
//                     <div className="flex justify-between items-center mb-2">
//                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Downpayment</label>
//                       <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
//                         {safePropVal > 0 ? ((safeDownpayment / safePropVal) * 100).toFixed(0) : 0}%
//                       </span>
//                     </div>
//                     <input type="number" value={downpayment} onChange={e => setDownpayment(e.target.value)} placeholder="0" className="field-input" />
//                   </div>
//                 </div>

//                 <div className="pt-2">
//                   <div className="flex justify-between items-center mb-3">
//                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loan Duration</label>
//                     <span className="text-lg font-bold text-purple-600">{loanDuration} <span className="text-sm font-medium text-slate-400">Yrs</span></span>
//                   </div>
//                   <input type="range" min={1} max={25} value={loanDuration} onChange={e => setLoanDuration(Number(e.target.value))} className="w-full" style={{ accentColor: '#7C3AED' }} />
//                   <div className="flex justify-between text-xs font-medium text-slate-300 mt-2"><span>1 Yr</span><span>25 Yrs</span></div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Col 3 — Result Card */}
//           <div className="lg:col-span-3">
//             <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-purple-900/20 relative overflow-hidden flex flex-col justify-between h-full">
//               <div className="absolute -top-20 -right-20 w-56 h-56 bg-white opacity-[0.04] rounded-full" />
//               <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white opacity-[0.03] rounded-full" />

//               <div className="relative z-10">
//                 <p className="text-purple-300 font-bold uppercase tracking-widest text-xs mb-6">
//                   {activeTab === 'affordability' ? 'Your Buying Power' : 'Cost Breakdown'}
//                 </p>

//                 {activeTab === 'affordability' ? (
//                   isEligible ? (
//                     <div>
//                       <p className="text-purple-200 text-sm font-medium mb-1">Max Property Price</p>
//                       <h2 className="text-2xl font-bold mb-2 tracking-tight">{formatCurrency(affordability)}</h2>
//                       <p className="text-purple-400 text-xs font-medium mb-8">Based on 50% DSR stress rate</p>
//                       <div className="border-t border-purple-800/50 pt-6  justify-between items-center">
//                         <div>
//                           <p className="text-purple-300 text-xs font-semibold mb-1 uppercase tracking-wide">Monthly EMI</p>
//                           <p className="text-2xl font-bold">{formatCurrency(monthlyPayment)}</p>
//                         </div>
//                         <button onClick={() => openModal('summary')} className="bg-white/10 hover:bg-white/20 px-4 py-2.5 mt-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 border border-white/10">
//                           Breakdown <FaArrowRight size={11} />
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
//                       <div className="font-bold mb-2 text-sm">⚠️ Eligibility Issue</div>
//                       <p className="text-sm text-purple-100 font-medium">Minimum salary of AED {MIN_SALARY.toLocaleString()} is required.</p>
//                     </div>
//                   )
//                 ) : (
//                   <div>
//                     <p className="text-purple-200 text-sm font-medium mb-1">Monthly Installment</p>
//                     <h2 className="text-4xl font-bold mb-2 tracking-tight">{formatCurrency(monthlyEMI)}</h2>
//                     <p className="text-purple-400 text-xs font-medium mb-8">At {selectedProduct.rate}% interest rate</p>
//                     <div className="border-t border-purple-800/50 pt-6 grid grid-cols-2 gap-4">
//                       <div>
//                         <p className="text-purple-300 text-xs font-semibold mb-1 uppercase tracking-wide">Total Loan</p>
//                         <p className="text-xl font-bold">{formatCurrency(loanAmount)}</p>
//                       </div>
//                       <div>
//                         <p className="text-purple-300 text-xs font-semibold mb-1 uppercase tracking-wide">Rate</p>
//                         <p className="text-xl font-bold">{selectedProduct.rate}%</p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <button onClick={() => openModal('preapproval')}
//                 className="relative z-10 mt-8 w-full bg-white text-[#5C039B] py-4 rounded-xl font-bold text-base hover:bg-slate-50 transition shadow-lg flex justify-center items-center gap-2">
//                 Get Pre-Approved <FaArrowRight size={13} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <LoanSummaryModal isOpen={modals.summary} onClose={() => closeModal('summary')} data={{ affordability, monthly: monthlyPayment }} />
//       <PreApprovalModal isOpen={modals.preapproval} onClose={() => closeModal('preapproval')} calculatorData={calculatorData} />
//       <ContactModal isOpen={modals.contact} onClose={() => closeModal('contact')} />
//     </div>
//   );
// }








import React, { useState, useEffect } from 'react';
import { apiService } from "../../manageApi/utils/custom.apiservice";
import toast, { Toaster } from 'react-hot-toast';
import wave1 from "../../assets/img/wave/waveint2.png";
import {
  FaMoneyBillWave, FaCheckCircle, FaInfoCircle, FaTimes,
  FaCalendarAlt, FaArrowRight, FaCalculator, FaChevronRight
} from 'react-icons/fa';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODUCTS = [
  { id: '3yr', label: '3yr Fixed', rate: 3.99 },
  { id: '5yr', label: '5yr Fixed', rate: 4.19 },
  { id: 'var', label: 'Variable',  rate: 7.0  },
];

const LOCATIONS = [
  'Abu Dhabi','Dubai','Sharjah','Ajman',
  'Ras Al Khaimah','Fujairah','Umm Al Quwain','Al Ain',
];

const COUNTRIES = [
  { code: 'AE', dialCode: '+971', maxLength: 9,  name: 'UAE'          },
  { code: 'IN', dialCode: '+91',  maxLength: 10, name: 'India'        },
  { code: 'SA', dialCode: '+966', maxLength: 9,  name: 'Saudi Arabia' },
  { code: 'US', dialCode: '+1',   maxLength: 10, name: 'USA'          },
  { code: 'GB', dialCode: '+44',  maxLength: 10, name: 'UK'           },
  { code: 'PK', dialCode: '+92',  maxLength: 10, name: 'Pakistan'     },
  { code: 'QA', dialCode: '+974', maxLength: 8,  name: 'Qatar'        },
];

const MIN_SALARY = 10000;
const DSR = 0.5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStressRate = (y) => y <= 15 ? 3.17 : y <= 17 ? 3.41 : y <= 20 ? 3.68 : 3.98;

const fmt = (v) =>
  new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED',
    minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const calcEMI = (principal, rate, years) => {
  if (!principal || !rate || !years) return 0;
  const r = rate / 100 / 12, n = years * 12;
  return Math.round(principal * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1));
};

const calcAffordability = (maxEMI, rate, years) => {
  if (maxEMI <= 0) return 0;
  const r = rate / 100 / 12, n = years * 12;
  return Math.round((maxEMI * (Math.pow(1+r,n)-1) / (r * Math.pow(1+r,n)) / 0.85) * 0.92);
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..800;1,9..40,300..800&display=swap');

  .pmc * { box-sizing: border-box; }
  .pmc {
    font-family: 'DM Sans', sans-serif;
    --p: #5C039B;
    --p2: #7C3AED;
    --pl: #EDE9FE;
    --pl2: #F5F0FF;
    --pd: #4a027d;
    --border: #E9EEF5;
    --text: #1E293B;
    --muted: #64748B;
    --surface: #F8FAFC;
  }

  /* slider */
  .pmc input[type=range] {
    -webkit-appearance:none; appearance:none;
    height:5px; border-radius:999px; background:#E2E8F0;
    outline:none; cursor:pointer; width:100%;
  }
  .pmc input[type=range]::-webkit-slider-thumb {
    -webkit-appearance:none; appearance:none;
    width:18px; height:18px; border-radius:50%;
    background:#7C3AED; border:2.5px solid #fff;
    box-shadow:0 2px 6px rgba(124,58,237,.35); cursor:pointer;
  }
  .pmc input[type=range]::-moz-range-thumb {
    width:18px; height:18px; border-radius:50%;
    background:#7C3AED; border:2.5px solid #fff;
    box-shadow:0 2px 6px rgba(124,58,237,.35); cursor:pointer;
  }
  .pmc input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }

  /* field */
  .pmc-field {
    width:100%; padding:10px 13px;
    background:#F8FAFC; border:1.5px solid #E9EEF5;
    border-radius:11px; font-size:13px; font-weight:600;
    color:#1E293B; outline:none; font-family:inherit;
    transition:border-color .2s, box-shadow .2s;
  }
  .pmc-field:focus { border-color:#7C3AED; box-shadow:0 0 0 3px rgba(124,58,237,.1); background:#fff; }
  .pmc-sel {
    appearance:none; cursor:pointer;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath fill='%2394A3B8' d='M5 7L0 0h10z'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:right 12px center;
  }

  /* label */
  .pmc-lbl {
    display:block; font-size:10px; font-weight:700;
    text-transform:uppercase; letter-spacing:.07em;
    color:#64748B; margin-bottom:6px;
  }

  /* tabs */
  .pmc-tab {
    flex:1; display:flex; align-items:center; justify-content:center; gap:6px;
    padding:9px 8px; border:none; cursor:pointer; font-family:inherit;
    font-weight:600; font-size:12px; border-radius:10px; transition:all .2s;
    background:transparent; color:#94A3B8;
  }
  .pmc-tab.active { background:#fff; color:#5C039B; box-shadow:0 1px 6px rgba(92,3,155,.1); }
  .pmc-tab:hover:not(.active) { color:#475569; }

  /* product btn */
  .pmc-prod {
    border-radius:12px; border:1.5px solid #E9EEF5;
    background:#F8FAFC; text-align:center; cursor:pointer;
    padding:12px 6px; font-family:inherit; transition:all .15s;
  }
  .pmc-prod:hover { border-color:#C4B5FD; }
  .pmc-prod.on { border-color:#7C3AED; background:#F5F0FF; }

  /* result card */
  .pmc-result {
    background:linear-gradient(145deg,#3b0764 0%,#5C039B 45%,#4a027d 100%);
    border-radius:20px; padding:22px;
    box-shadow:0 16px 48px rgba(92,3,155,.3);
    display:flex; flex-direction:column; justify-content:space-between;
    position:relative; overflow:hidden;
  }
  .pmc-result::before {
    content:''; position:absolute; top:-50px; right:-50px;
    width:160px; height:160px; border-radius:50%;
    background:radial-gradient(circle,rgba(255,255,255,.07) 0%,transparent 70%);
    pointer-events:none;
  }
  .pmc-result::after {
    content:''; position:absolute; bottom:-40px; left:-40px;
    width:130px; height:130px; border-radius:50%;
    background:radial-gradient(circle,rgba(255,255,255,.04) 0%,transparent 70%);
    pointer-events:none;
  }

  /* CTA */
  .pmc-cta {
    width:100%; background:#fff; color:#5C039B;
    border:none; padding:13px 16px; border-radius:11px;
    font-weight:700; font-size:13px; cursor:pointer; font-family:inherit;
    display:flex; align-items:center; justify-content:center; gap:7px;
    transition:all .2s; box-shadow:0 2px 12px rgba(255,255,255,.15); margin-top:20px;
  }
  .pmc-cta:hover { background:#F5F0FF; transform:translateY(-1px); }

  /* modal */
  .pmc-backdrop {
    position:fixed; inset:0; z-index:9999;
    display:flex; align-items:center; justify-content:center; padding:14px;
    background:rgba(15,5,30,.5); backdrop-filter:blur(5px);
  }
  .pmc-modal {
    background:#fff; width:100%; max-width:460px;
    border-radius:24px; overflow:hidden;
    box-shadow:0 24px 64px rgba(15,5,30,.22);
    font-family:'DM Sans',sans-serif;
    animation:pmcFU .22s ease both;
  }
  .pmc-modal-hd {
    padding:20px 24px 16px; border-bottom:1px solid #F1F5F9;
    display:flex; justify-content:space-between; align-items:flex-start;
    background:#FAFCFF;
  }
  .pmc-modal-bd { padding:20px 24px; max-height:80vh; overflow-y:auto; }

  @keyframes pmcFU {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* responsive */
  @media (max-width: 1023px) {
    .pmc-grid { grid-template-columns: 1fr 1fr !important; }
    .pmc-col-heading { grid-column: 1 / -1; }
  }
  @media (max-width: 639px) {
    .pmc-grid { grid-template-columns: 1fr !important; }
    .pmc-col-heading { grid-column: unset; }
    .pmc-result { border-radius:16px; padding:18px; }
  }
`;

// ─── Modal Wrapper ────────────────────────────────────────────────────────────

const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="pmc-backdrop" onClick={onClose}>
      <div className="pmc-modal" onClick={e => e.stopPropagation()}>
        <div className="pmc-modal-hd">
          <div>
            <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:'#1E293B', letterSpacing:'-.01em' }}>{title}</h2>
            {subtitle && <p style={{ margin:'3px 0 0', fontSize:12, color:'#64748B', fontWeight:500 }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#94A3B8', padding:4, borderRadius:7, display:'flex', lineHeight:1 }}
            onMouseOver={e=>{e.currentTarget.style.color='#5C039B';e.currentTarget.style.background='#EDE9FE';}}
            onMouseOut={e=>{e.currentTarget.style.color='#94A3B8';e.currentTarget.style.background='none';}}>
            <FaTimes size={16}/>
          </button>
        </div>
        <div className="pmc-modal-bd">{children}</div>
      </div>
    </div>
  );
};

// ─── Shared mini-styles for modals ───────────────────────────────────────────

const mInp = { width:'100%', padding:'10px 13px', background:'#F8FAFC', border:'1.5px solid #E9EEF5', borderRadius:10, fontSize:13, fontWeight:600, color:'#1E293B', outline:'none', fontFamily:'inherit', boxSizing:'border-box' };
const mSel = { ...mInp, appearance:'none', cursor:'pointer', backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath fill='%2394A3B8' d='M5 7L0 0h10z'/%3E%3C/svg%3E\")", backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center' };
const mLbl = { display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'#64748B', marginBottom:5 };
const mBtn = (active=true) => ({ background: active ? 'linear-gradient(135deg,#5C039B,#7C3AED)' : '#E2E8F0', color: active ? '#fff' : '#94A3B8', border:'none', width:'100%', padding:'13px 16px', borderRadius:11, fontWeight:700, fontSize:13, cursor: active ? 'pointer' : 'not-allowed', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:7, boxShadow: active ? '0 6px 20px rgba(92,3,155,.25)' : 'none', transition:'all .2s' });
const mPhoneWrap = { display:'flex', border:'1.5px solid #E9EEF5', borderRadius:10, background:'#F8FAFC', overflow:'hidden' };
const mPhoneFlag = { display:'flex', alignItems:'center', padding:'0 10px', background:'#F1F5F9', borderRight:'1.5px solid #E9EEF5', gap:5 };

// ─── Loan Summary Modal ───────────────────────────────────────────────────────

const LoanSummaryModal = ({ isOpen, onClose, data }) => {
  const dp = data.affordability * 0.15, tx = data.affordability * 0.055;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Affordability Breakdown" subtitle="Your costs at a glance">
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {[[`Downpayment (15%)`, fmt(dp)],[`Transaction Costs (5.5%)`, fmt(tx)]].map(([l,v])=>(
          <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'11px 14px', background:'#F8FAFC', borderRadius:10, border:'1px solid #E9EEF5' }}>
            <span style={{ fontSize:13, color:'#64748B', fontWeight:500 }}>{l}</span>
            <span style={{ fontSize:13, fontWeight:700, color:'#1E293B' }}>{v}</span>
          </div>
        ))}
        <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 14px', background:'linear-gradient(135deg,#EDE9FE,#DDD6FE)', borderRadius:10 }}>
          <span style={{ fontSize:13, fontWeight:700, color:'#4C1D95' }}>Total Upfront</span>
          <span style={{ fontSize:14, fontWeight:800, color:'#4C1D95' }}>{fmt(dp+tx)}</span>
        </div>
        <div style={{ background:'linear-gradient(145deg,#3b0764,#5C039B)', borderRadius:13, padding:'16px 18px', textAlign:'center' }}>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'#C4B5FD', margin:'0 0 5px' }}>Max Home Price</p>
          <p style={{ fontSize:26, fontWeight:800, color:'#fff', margin:0, letterSpacing:'-.02em' }}>{fmt(data.affordability*0.85)}</p>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 14px', background:'#F0FDF4', borderRadius:10, border:'1px solid #D1FAE5' }}>
          <span style={{ fontSize:12, fontWeight:600, color:'#065F46' }}>Monthly EMI</span>
          <span style={{ fontSize:16, fontWeight:800, color:'#059669' }}>{fmt(data.monthly)}</span>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'flex-start', padding:'10px 13px', background:'#EFF6FF', borderRadius:9, border:'1px solid #BFDBFE' }}>
          <FaInfoCircle size={12} style={{ color:'#3B82F6', marginTop:2, flexShrink:0 }}/>
          <p style={{ margin:0, fontSize:11, color:'#1D4ED8', fontWeight:500, lineHeight:1.6 }}>Includes a buffer for rate increases. Most UAE loans go up to 25 years based on age.</p>
        </div>
        <button onClick={onClose} style={mBtn()}>Got it</button>
      </div>
    </Modal>
  );
};

// ─── Pre-Approval Modal ───────────────────────────────────────────────────────

const PreApprovalModal = ({ isOpen, onClose, calculatorData }) => {
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [fd, setFd] = useState({
    firstName:'', lastName:'', phone:'', selectedCountry:COUNTRIES[0], email:'',
    foundProperty:'no', location:'', gender:'Male', dateOfBirth:'',
    nationality:COUNTRIES[0].name, maritalStatus:'Single'
  });
  const upd = p => setFd(s=>({...s,...p}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fd.phone.length !== fd.selectedCountry.maxLength) {
      toast.error(`Please enter a valid ${fd.selectedCountry.maxLength}-digit number for ${fd.selectedCountry.name}.`); return;
    }
    if (!fd.dateOfBirth) { toast.error('Please enter your date of birth'); return; }
    setLoading(true);
    const tid = toast.loading('Submitting your application...');
    try {
      const payload = {
        customerInfo: { fullName:`${fd.firstName} ${fd.lastName}`, email:fd.email, mobileNumber:fd.phone, gender:fd.gender, dateOfBirth:fd.dateOfBirth, nationality:fd.nationality, maritalStatus:fd.maritalStatus, occupation:calculatorData.employment||'Not specified', monthlySalary:calculatorData.monthlyIncome, numberOfDependents:0 },
        propertyDetails: { propertyType:fd.foundProperty==='yes'?'Ready':'Off-plan', propertySubtype:'Apartment', propertyValue:calculatorData.propertyValue||0, downPaymentAmount:calculatorData.downpayment||0, loanAmountRequired:calculatorData.loanAmount||0, propertyAddress:{area:fd.location||'',city:fd.location||'Dubai'}, isOffPlan:fd.foundProperty==='no' },
        loanRequirements: { preferredTenureYears:calculatorData.loanDuration||25, preferredInterestRateType:calculatorData.rate===3.99||calculatorData.rate===4.19?'Fixed':'Variable', feeFinancingPreference:true, lifeInsurancePreference:true, propertyInsurancePreference:true },
        notesToXoto:`Lead from mortgage calculator. Residency:${calculatorData.residency}. Employment:${calculatorData.employment||'Not specified'}. Income:${calculatorData.monthlyIncome} AED. Debt:${calculatorData.monthlyDebt} AED. Property:${calculatorData.propertyValue} AED. Downpayment:${calculatorData.downpayment} AED.`
      };
      const res = await apiService.post('/vault/lead/website', payload);
      if (res.success||res.status===200||res.status===201) { toast.success(res.message||'Submitted!',{id:tid}); setStep('success'); }
      else toast.error(res.message||'Something went wrong.',{id:tid});
    } catch (err) { toast.error(err.response?.data?.message||'Network error.',{id:tid}); }
    finally { setLoading(false); }
  };

  if (step==='success') return (
    <Modal isOpen={isOpen} onClose={onClose} title="Application Received!">
      <div style={{ textAlign:'center', padding:'16px 0 6px' }}>
        <div style={{ width:60,height:60,background:'#D1FAE5',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
          <FaCheckCircle size={26} style={{ color:'#059669' }}/>
        </div>
        <h3 style={{ fontWeight:700,fontSize:16,color:'#1E293B',margin:'0 0 8px' }}>Thank You, {fd.firstName}!</h3>
        <p style={{ color:'#64748B',fontSize:13,lineHeight:1.7,margin:'0 0 22px',fontWeight:500 }}>Your application is received. A mortgage advisor will contact you within 24 hours.</p>
        <button onClick={onClose} style={mBtn()}>Back to Calculator</button>
      </div>
    </Modal>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Get Pre-Approved" subtitle="Start your UAE property journey today">
      <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:12 }}>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
          <div><label style={mLbl}>First Name *</label><input required type="text" value={fd.firstName} onChange={e=>upd({firstName:e.target.value})} placeholder="John" style={mInp}/></div>
          <div><label style={mLbl}>Last Name *</label><input required type="text" value={fd.lastName} onChange={e=>upd({lastName:e.target.value})} placeholder="Smith" style={mInp}/></div>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
          <div>
            <label style={mLbl}>Gender *</label>
            <select value={fd.gender} onChange={e=>upd({gender:e.target.value})} style={mSel}>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          <div><label style={mLbl}>Date of Birth *</label><input required type="date" value={fd.dateOfBirth} onChange={e=>upd({dateOfBirth:e.target.value})} style={mInp}/></div>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
          <div>
            <label style={mLbl}>Nationality *</label>
            <select value={fd.nationality} onChange={e=>upd({nationality:e.target.value})} style={mSel}>
              {COUNTRIES.map(c=><option key={c.code} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={mLbl}>Marital Status *</label>
            <select value={fd.maritalStatus} onChange={e=>upd({maritalStatus:e.target.value})} style={mSel}>
              <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
            </select>
          </div>
        </div>
        <div>
          <label style={mLbl}>Phone *</label>
          <div style={mPhoneWrap}>
            <div style={mPhoneFlag}>
              <img src={`https://flagcdn.com/w20/${fd.selectedCountry.code.toLowerCase()}.png`} alt="" style={{ width:18,borderRadius:2 }}/>
              <select value={fd.selectedCountry.code} onChange={e=>upd({selectedCountry:COUNTRIES.find(c=>c.code===e.target.value),phone:''})}
                style={{ background:'transparent',border:'none',outline:'none',fontWeight:700,fontSize:12,cursor:'pointer',color:'#4C1D95',width:48,fontFamily:'inherit' }}>
                {COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.dialCode}</option>)}
              </select>
            </div>
            <input required type="tel" value={fd.phone}
              onChange={e=>{const v=e.target.value.replace(/\D/g,'');if(v.length<=fd.selectedCountry.maxLength)upd({phone:v});}}
              placeholder="XX XXX XXXX" style={{ flex:1,padding:'10px 13px',background:'transparent',border:'none',outline:'none',fontWeight:600,fontSize:13,fontFamily:'inherit',color:'#1E293B' }}/>
          </div>
        </div>
        <div><label style={mLbl}>Email *</label><input required type="email" value={fd.email} onChange={e=>upd({email:e.target.value})} placeholder="you@example.com" style={mInp}/></div>
        <div>
          <label style={{ ...mLbl,marginBottom:8 }}>Found a property? *</label>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
            {['yes','no'].map(v=>(
              <label key={v} style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:7,padding:'10px',border:`1.5px solid ${fd.foundProperty===v?'#7C3AED':'#E9EEF5'}`,background:fd.foundProperty===v?'#F5F0FF':'#F8FAFC',borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:12,color:fd.foundProperty===v?'#5C039B':'#64748B' }}>
                <input type="radio" name="fp" checked={fd.foundProperty===v} onChange={()=>upd({foundProperty:v})} style={{ display:'none' }}/>
                {v==='yes'?'✓ Yes':'✗ Not yet'}
              </label>
            ))}
          </div>
        </div>
        {fd.foundProperty==='yes'&&(
          <div>
            <label style={mLbl}>Preferred Location *</label>
            <select required value={fd.location} onChange={e=>upd({location:e.target.value})} style={mSel}>
              <option value="">Select emirate</option>
              {LOCATIONS.map(l=><option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        )}
        {/* Snapshot */}
        <div style={{ background:'linear-gradient(145deg,#3b0764,#5C039B)',borderRadius:12,padding:'14px 16px' }}>
          <p style={{ fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:'#C4B5FD',margin:'0 0 10px' }}>Your Snapshot</p>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'7px 14px' }}>
            {[['Income',fmt(calculatorData.monthlyIncome)],['Property',fmt(calculatorData.propertyValue)],['Downpayment',fmt(calculatorData.downpayment)],['Monthly EMI',fmt(calculatorData.monthlyEMI)]].map(([k,v])=>(
              <div key={k}>
                <div style={{ fontSize:9,color:'#C4B5FD',fontWeight:600,textTransform:'uppercase',letterSpacing:'.08em' }}>{k}</div>
                <div style={{ fontSize:13,fontWeight:700,color:'#fff',marginTop:2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <label style={{ display:'flex',alignItems:'flex-start',gap:10,padding:'10px 12px',background:'#F8FAFC',borderRadius:10,border:'1px solid #E9EEF5',cursor:'pointer' }}>
          <input required type="checkbox" style={{ marginTop:2,accentColor:'#7C3AED',width:14,height:14,flexShrink:0 }}/>
          <span style={{ fontSize:11,color:'#64748B',lineHeight:1.6,fontWeight:500 }}>I agree to receive newsletters and marketing communications. I accept the Terms of Service and Privacy Policy.</span>
        </label>
        <button type="submit" disabled={loading} style={mBtn(!loading)}>
          {loading?'Submitting…':<>Submit Application <FaChevronRight size={11}/></>}
        </button>
      </form>
    </Modal>
  );
};

// ─── Contact / Book a Call Modal ──────────────────────────────────────────────

const ContactModal = ({ isOpen, onClose }) => {
  const [step, setStep]         = useState('schedule');
  const [selDate, setSelDate]   = useState(null);
  const [selTime, setSelTime]   = useState(null);
  const [firstName, setFirst]   = useState('');
  const [lastName,  setLast]    = useState('');
  const [phone, setPhone]       = useState('');
  const [country, setCountry]   = useState(COUNTRIES[0]);
  const days  = ['MON','TUE','WED','THU','FRI'];
  const times = ['9:00 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM','4:00 PM'];

  if (step==='success') return (
    <Modal isOpen={isOpen} onClose={onClose} title="Meeting Confirmed!">
      <div style={{ textAlign:'center',padding:'16px 0 6px' }}>
        <div style={{ width:60,height:60,background:'#EDE9FE',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
          <FaCalendarAlt size={24} style={{ color:'#7C3AED' }}/>
        </div>
        <p style={{ color:'#64748B',fontSize:13,lineHeight:1.7,margin:'0 0 22px',fontWeight:500 }}>Your consultation is booked. We've sent a calendar invite to your email.</p>
        <button onClick={onClose} style={mBtn()}>Done</button>
      </div>
    </Modal>
  );

  if (step==='details') return (
    <Modal isOpen={isOpen} onClose={()=>setStep('schedule')} title="Your Details" subtitle="Step 2 of 2">
      <form onSubmit={e=>{e.preventDefault();if(phone.length!==country.maxLength){toast.error(`Please enter a valid ${country.maxLength}-digit number`);return;}setStep('success');}}
        style={{ display:'flex',flexDirection:'column',gap:12 }}>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
          <div><label style={mLbl}>First Name</label><input required type="text" value={firstName} onChange={e=>setFirst(e.target.value)} style={mInp}/></div>
          <div><label style={mLbl}>Last Name</label><input required type="text" value={lastName} onChange={e=>setLast(e.target.value)} style={mInp}/></div>
        </div>
        <div>
          <label style={mLbl}>Phone</label>
          <div style={mPhoneWrap}>
            <div style={mPhoneFlag}>
              <img src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} alt="" style={{ width:18,borderRadius:2 }}/>
              <select value={country.code} onChange={e=>{setCountry(COUNTRIES.find(c=>c.code===e.target.value));setPhone('');}}
                style={{ background:'transparent',border:'none',outline:'none',fontWeight:700,fontSize:12,cursor:'pointer',color:'#4C1D95',width:48,fontFamily:'inherit' }}>
                {COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.dialCode}</option>)}
              </select>
            </div>
            <input required type="tel" value={phone}
              onChange={e=>{const v=e.target.value.replace(/\D/g,'');if(v.length<=country.maxLength)setPhone(v);}}
              placeholder="XX XXX XXXX" style={{ flex:1,padding:'10px 13px',background:'transparent',border:'none',outline:'none',fontWeight:600,fontSize:13,fontFamily:'inherit',color:'#1E293B' }}/>
          </div>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:4 }}>
          <button type="button" onClick={()=>setStep('schedule')} style={{ padding:'12px',borderRadius:10,border:'1.5px solid #E9EEF5',background:'#F8FAFC',fontWeight:600,fontSize:13,cursor:'pointer',color:'#64748B',fontFamily:'inherit' }}>← Back</button>
          <button type="submit" style={mBtn()}>Confirm →</button>
        </div>
      </form>
    </Modal>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book a Consultation" subtitle="Step 1 of 2 — Choose a time slot">
      <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
        <div>
          <p style={{ ...mLbl,marginBottom:10 }}>Select Day</p>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:7 }}>
            {days.map((d,i)=>(
              <button key={i} onClick={()=>setSelDate(i)}
                style={{ padding:'11px 4px',textAlign:'center',border:`2px solid ${selDate===i?'#7C3AED':'#E9EEF5'}`,background:selDate===i?'#F5F0FF':'#F8FAFC',borderRadius:10,cursor:'pointer',fontFamily:'inherit',fontWeight:700,fontSize:11,color:selDate===i?'#5C039B':'#94A3B8',transition:'all .15s' }}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p style={{ ...mLbl,marginBottom:10 }}>Select Time</p>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8 }}>
            {times.map((t,i)=>(
              <button key={i} onClick={()=>setSelTime(i)}
                style={{ padding:'10px 6px',textAlign:'center',border:`2px solid ${selTime===i?'#7C3AED':'#E9EEF5'}`,background:selTime===i?'#7C3AED':'#F8FAFC',borderRadius:10,cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:12,color:selTime===i?'#fff':'#64748B',transition:'all .15s' }}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <button onClick={()=>setStep('details')} disabled={selDate===null||selTime===null} style={mBtn(selDate!==null&&selTime!==null)}>
          Continue →
        </button>
      </div>
    </Modal>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PerfectMortgageCalculator({
  initialTab       = 'affordability',
  singleCalculator = false,
  backgroundVariant = 'default',
  heading,
  subtitle,
}) {
  const [activeTab,       setActiveTab]       = useState(initialTab);
  const [residency,       setResidency]       = useState('UAE Resident');
  const [employment,      setEmployment]      = useState('');
  const [monthlyIncome,   setMonthlyIncome]   = useState(25000);
  const [monthlyDebt,     setMonthlyDebt]     = useState('');
  const [loanTenure,      setLoanTenure]      = useState(25);
  const [propertyValue,   setPropertyValue]   = useState(1500000);
  const [downpayment,     setDownpayment]     = useState(300000);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [loanDuration,    setLoanDuration]    = useState(25);
  const [modals, setModals] = useState({ summary:false, preapproval:false, contact:false });

  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);

  const isSep = backgroundVariant !== 'default';
  const pageBg = isSep
    ? (backgroundVariant === 'eligibility'
        ? 'linear-gradient(160deg,#FAFAFA 0%,#F5F0FF 60%,#FAFAFF 100%)'
        : 'linear-gradient(160deg,#FAFAFA 0%,#F0FDF4 60%,#FAFAFF 100%)')
    : undefined;

  const pageHeading = heading || (activeTab==='mortgage' ? 'Plan Your\nMortgage Payments' : 'Discover Your\nTrue Buying Power');
  const pageSub     = subtitle || 'Smart property financing for the UAE market.';

  const open  = (k) => setModals(m=>({...m,[k]:true}));
  const close = (k) => setModals(m=>({...m,[k]:false}));

  const safeIncome = Number(monthlyIncome)||0;
  const safeDebt   = Number(monthlyDebt)||0;
  const safeProp   = Number(propertyValue)||0;
  const safeDp     = Number(downpayment)||0;
  const maxEMI     = safeIncome * DSR - safeDebt;
  const isEligible = safeIncome >= MIN_SALARY && maxEMI > 0;
  const stressRate = getStressRate(loanTenure);
  const affordability  = isEligible ? calcAffordability(maxEMI, stressRate, loanTenure) : 0;
  const monthlyPayment = isEligible ? Math.round(maxEMI) : 0;
  const loanAmount     = Math.max(0, safeProp - safeDp);
  const monthlyEMI     = calcEMI(loanAmount, selectedProduct.rate, loanDuration);
  const dpPct          = safeProp > 0 ? ((safeDp/safeProp)*100).toFixed(0) : 0;

  const calcData = { monthlyIncome:safeIncome, monthlyDebt:safeDebt, loanTenure, propertyValue:safeProp, downpayment:safeDp, loanAmount, rate:selectedProduct.rate, loanDuration, affordability, monthly:monthlyPayment, monthlyEMI, employment, residency };

  /* shared field sizing */
  const fieldPad = isSep ? '13px 15px' : '10px 13px';
  const fieldFs  = isSep ? 14 : 13;
  const lblFs    = isSep ? 11 : 10;
  const gap      = isSep ? 20 : 14;
  const cardPad  = isSep ? '28px 30px' : '22px 24px';

  const fieldStyle = {
    width:'100%', padding:fieldPad, background:'#F8FAFC',
    border:'1.5px solid #E9EEF5', borderRadius:11,
    fontSize:fieldFs, fontWeight:600, color:'#1E293B',
    outline:'none', fontFamily:'inherit',
  };
  const selStyle = {
    ...fieldStyle, appearance:'none', cursor:'pointer',
    backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath fill='%2394A3B8' d='M5 7L0 0h10z'/%3E%3C/svg%3E\")",
    backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center',
  };
  const lbl = { display:'block', fontSize:lblFs, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'#64748B', marginBottom:6 };

  return (
    <div className="pmc" style={{
      position:'relative', overflow:'hidden',
      padding: isSep ? '36px 20px 56px' : '28px 16px 44px',
      background:pageBg,
      minHeight: isSep ? '100vh' : undefined,
    }}>
      <style>{CSS}</style>
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ style:{ fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13 } }}/>

      {/* Wave — embedded only */}
      {!isSep && (
        <img src={wave1} alt="" aria-hidden="true"
          style={{ position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%) translateY(30%)',width:'100vw',minWidth:'100%',pointerEvents:'none',zIndex:0 }}/>
      )}

      {/* Subtle blobs — separate page only */}
      {isSep && <>
        <div style={{ position:'absolute',top:-80,right:-80,width:320,height:320,background:'radial-gradient(circle,rgba(92,3,155,.07) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none' }}/>
        <div style={{ position:'absolute',bottom:-60,left:-60,width:260,height:260,background:'radial-gradient(circle,rgba(92,3,155,.05) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none' }}/>
      </>}

      <div style={{ maxWidth:isSep?1280:1180, margin:'0 auto', position:'relative', zIndex:1 }}>
        <div className="pmc-grid" style={{
          display:'grid',
          gridTemplateColumns:'5fr 4fr 3fr',
          gap: isSep ? 28 : 20,
          alignItems:'stretch',
        }}>

          {/* ── Col 1: Heading ─────────────────────────────────────────── */}
          <div className="pmc-col-heading" style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
            {isSep && (
              <div style={{ display:'inline-flex',alignItems:'center',gap:7,padding:'5px 12px',background:'#fff',border:'1px solid #DDD6FE',borderRadius:999,marginBottom:20,width:'fit-content',boxShadow:'0 1px 6px rgba(92,3,155,.08)' }}>
                <span style={{ width:5,height:5,background:'#7C3AED',borderRadius:'50%',display:'inline-block' }}/>
                <span style={{ fontSize:10,fontWeight:700,color:'#5C039B',letterSpacing:'.07em',textTransform:'uppercase' }}>Xoto Mortgage Tools</span>
              </div>
            )}
            <h1 style={{
              fontFamily:"'DM Sans',sans-serif",
              fontSize: isSep ? 'clamp(28px,3.5vw,52px)' : 'clamp(24px,3vw,42px)',
              fontWeight:800, color:'#1E293B', lineHeight:1.1,
              letterSpacing:'-.025em', margin:0, whiteSpace:'pre-line',
            }}>{pageHeading}</h1>
            <p style={{ fontSize: isSep ? 14 : 13, color:'#64748B', marginTop:14, fontWeight:500, lineHeight:1.7, maxWidth:400 }}>
              {pageSub}
            </p>
            {isSep && (
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:24,maxWidth:340 }}>
                {[['Market','UAE'],['Currency','AED'],['Max LTV','85%'],['Min Salary','AED 10K']].map(([k,v])=>(
                  <div key={k} style={{ padding:'14px 16px',background:'rgba(255,255,255,.85)',border:'1px solid rgba(92,3,155,.1)',borderRadius:12 }}>
                    <div style={{ fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:'#94A3B8' }}>{k}</div>
                    <div style={{ fontSize:17,fontWeight:800,color:'#1E293B',marginTop:3 }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Col 2: Form Card ──────────────────────────────────────── */}
          <div style={{
            background:'#fff', border:'1px solid #E9EEF5',
            borderRadius:20, padding:cardPad,
            boxShadow:'0 4px 20px rgba(26,10,46,.06)',
          }}>
            {/* Tab Toggle */}
            {!singleCalculator && (
              <div style={{ display:'flex',background:'#F3F0FB',borderRadius:13,padding:4,marginBottom: isSep ? 22 : 18 }}>
                {[{id:'affordability',icon:<FaCalculator size={11}/>,label:'Buying Power'},{id:'mortgage',icon:<FaMoneyBillWave size={11}/>,label:'EMI Planner'}].map(t=>(
                  <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`pmc-tab${activeTab===t.id?' active':''}`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            )}

            {/* Affordability */}
            {activeTab==='affordability' && (
              <div style={{ display:'flex',flexDirection:'column',gap }}>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                  <div>
                    <label style={lbl}>Residency</label>
                    <select value={residency} onChange={e=>setResidency(e.target.value)} style={selStyle}>
                      <option>UAE Resident</option><option>UAE National</option><option>Non-Resident</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Employment</label>
                    <select value={employment} onChange={e=>setEmployment(e.target.value)} style={selStyle}>
                      <option value="">Select type</option>
                      <option value="salaried">Salaried</option>
                      <option value="self_employed">Self-Employed</option>
                    </select>
                  </div>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                  <div>
                    <label style={lbl}>Monthly Income (AED)</label>
                    <input type="number" value={monthlyIncome} onChange={e=>setMonthlyIncome(e.target.value)} placeholder="0" style={fieldStyle}/>
                  </div>
                  <div>
                    <label style={lbl}>Monthly Debts (AED)</label>
                    <input type="number" value={monthlyDebt} onChange={e=>setMonthlyDebt(e.target.value)} placeholder="Optional" style={fieldStyle}/>
                  </div>
                </div>
                <div>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
                    <label style={{ ...lbl,marginBottom:0 }}>Loan Tenure</label>
                    <span style={{ fontSize: isSep?20:17, fontWeight:800, color:'#5C039B', letterSpacing:'-.02em' }}>
                      {loanTenure}<span style={{ fontSize:12,fontWeight:600,color:'#94A3B8',marginLeft:3 }}>yrs</span>
                    </span>
                  </div>
                  <input type="range" min={5} max={25} value={loanTenure} onChange={e=>setLoanTenure(Number(e.target.value))}/>
                  <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,fontWeight:600,color:'#CBD5E1',marginTop:6 }}>
                    <span>5 yrs</span><span>25 yrs</span>
                  </div>
                </div>
              </div>
            )}

            {/* EMI Planner */}
            {activeTab==='mortgage' && (
              <div style={{ display:'flex',flexDirection:'column',gap }}>
                <div>
                  <label style={{ ...lbl,marginBottom:10 }}>Rate Type</label>
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8 }}>
                    {PRODUCTS.map(p=>(
                      <button key={p.id} onClick={()=>setSelectedProduct(p)} className={`pmc-prod${selectedProduct.id===p.id?' on':''}`}>
                        <div style={{ fontSize: isSep?20:17, fontWeight:800, color:selectedProduct.id===p.id?'#5C039B':'#475569', letterSpacing:'-.02em', lineHeight:1.1 }}>{p.rate}%</div>
                        <div style={{ fontSize:10, fontWeight:700, color:selectedProduct.id===p.id?'#7C3AED':'#94A3B8', marginTop:4, textTransform:'uppercase', letterSpacing:'.04em' }}>{p.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                  <div>
                    <label style={lbl}>Property Value (AED)</label>
                    <input type="number" value={propertyValue} onChange={e=>setPropertyValue(e.target.value)} placeholder="0" style={fieldStyle}/>
                  </div>
                  <div>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6 }}>
                      <label style={{ ...lbl,marginBottom:0 }}>Downpayment</label>
                      <span style={{ fontSize:10,fontWeight:700,color:'#5C039B',background:'#EDE9FE',padding:'2px 7px',borderRadius:999 }}>{dpPct}%</span>
                    </div>
                    <input type="number" value={downpayment} onChange={e=>setDownpayment(e.target.value)} placeholder="0" style={fieldStyle}/>
                  </div>
                </div>
                <div>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
                    <label style={{ ...lbl,marginBottom:0 }}>Loan Duration</label>
                    <span style={{ fontSize: isSep?20:17, fontWeight:800, color:'#5C039B', letterSpacing:'-.02em' }}>
                      {loanDuration}<span style={{ fontSize:12,fontWeight:600,color:'#94A3B8',marginLeft:3 }}>yrs</span>
                    </span>
                  </div>
                  <input type="range" min={1} max={25} value={loanDuration} onChange={e=>setLoanDuration(Number(e.target.value))}/>
                  <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,fontWeight:600,color:'#CBD5E1',marginTop:6 }}>
                    <span>1 yr</span><span>25 yrs</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Col 3: Result Card ────────────────────────────────────── */}
          <div className="pmc-result">
            <div style={{ position:'relative',zIndex:1 }}>
              <p style={{ fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em',color:'#C4B5FD',margin:'0 0 18px' }}>
                {activeTab==='affordability' ? 'Your Buying Power' : 'Cost Breakdown'}
              </p>

              {activeTab==='affordability' ? (
                isEligible ? (<>
                  <p style={{ fontSize:11,color:'#C4B5FD',fontWeight:600,margin:'0 0 5px' }}>Max Property Price</p>
                  <h2 style={{ fontSize: isSep?'clamp(20px,2.5vw,32px)':22, fontWeight:800, color:'#fff', margin:'0 0 3px', letterSpacing:'-.025em', lineHeight:1.1, wordBreak:'break-word' }}>{fmt(affordability)}</h2>
                  <p style={{ fontSize:10,color:'rgba(196,181,253,.7)',fontWeight:600,margin:'0 0 20px' }}>50% DSR stress rate</p>
                  <div style={{ borderTop:'1px solid rgba(255,255,255,.12)',paddingTop:18,display:'flex',flexDirection:'column',gap:14 }}>
                    <div>
                      <p style={{ fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:'#A78BFA',margin:'0 0 3px' }}>Monthly EMI</p>
                      <p style={{ fontSize: isSep?22:18, fontWeight:800, color:'#fff', margin:0, letterSpacing:'-.02em', wordBreak:'break-word' }}>{fmt(monthlyPayment)}</p>
                    </div>
                    <button onClick={()=>open('summary')}
                      style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'8px 13px',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.15)',borderRadius:9,color:'#C4B5FD',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',width:'fit-content',transition:'all .15s' }}
                      onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.18)'}
                      onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,.1)'}>
                      Full Breakdown <FaChevronRight size={9}/>
                    </button>
                  </div>
                </>) : (
                  <div style={{ background:'rgba(251,113,133,.15)',border:'1px solid rgba(251,113,133,.3)',borderRadius:13,padding:'16px 15px' }}>
                    <p style={{ fontWeight:700,fontSize:13,color:'#FCA5A5',margin:'0 0 6px' }}>⚠️ Eligibility Issue</p>
                    <p style={{ fontSize:12,color:'#FCD7D7',fontWeight:500,margin:0,lineHeight:1.6 }}>Minimum monthly salary of AED {MIN_SALARY.toLocaleString()} required.</p>
                  </div>
                )
              ) : (<>
                <p style={{ fontSize:11,color:'#C4B5FD',fontWeight:600,margin:'0 0 5px' }}>Monthly Installment</p>
                <h2 style={{ fontSize: isSep?'clamp(20px,2.5vw,32px)':22, fontWeight:800, color:'#fff', margin:'0 0 3px', letterSpacing:'-.025em', lineHeight:1.1, wordBreak:'break-word' }}>{fmt(monthlyEMI)}</h2>
                <p style={{ fontSize:10,color:'rgba(196,181,253,.7)',fontWeight:600,margin:'0 0 20px' }}>At {selectedProduct.rate}% p.a.</p>
                <div style={{ borderTop:'1px solid rgba(255,255,255,.12)',paddingTop:18,display:'flex',flexDirection:'column',gap:14 }}>
                  {[['Total Loan',fmt(loanAmount)],['Rate',`${selectedProduct.rate}%`]].map(([k,v])=>(
                    <div key={k}>
                      <p style={{ fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:'#A78BFA',margin:'0 0 3px' }}>{k}</p>
                      <p style={{ fontSize:17,fontWeight:800,color:'#fff',margin:0,letterSpacing:'-.02em',wordBreak:'break-word' }}>{v}</p>
                    </div>
                  ))}
                </div>
              </>)}
            </div>

            <button onClick={()=>open('preapproval')} className="pmc-cta">
              Get Pre-Approved <FaChevronRight size={11}/>
            </button>
          </div>

        </div>
      </div>

      <LoanSummaryModal   isOpen={modals.summary}     onClose={()=>close('summary')}     data={{ affordability, monthly:monthlyPayment }}/>
      <PreApprovalModal   isOpen={modals.preapproval} onClose={()=>close('preapproval')} calculatorData={calcData}/>
      <ContactModal       isOpen={modals.contact}     onClose={()=>close('contact')}/>
    </div>
  );
}
