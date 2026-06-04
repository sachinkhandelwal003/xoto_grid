import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import { toast } from "react-toastify";
import { FiMapPin, FiUser, FiMail, FiCreditCard, FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

// ── UAE Areas Data ────────────────────────────────────────
const UAE_DATA = {
  "Dubai": [
    "Downtown Dubai","Dubai Marina","Jumeirah","Deira","Bur Dubai","Al Barsha",
    "Business Bay","JBR — Jumeirah Beach Residence","Palm Jumeirah","Al Quoz",
    "Mirdif","Al Nahda","Karama","Satwa","Oud Metha","Al Wasl","Jumeirah Village Circle (JVC)",
    "Dubai Silicon Oasis","Dubai Hills Estate","Al Rigga","Al Rashidiya","Al Mizhar",
    "International City","Dragon Mart Area","Al Warqa","Al Khawaneej","Dubai Sports City",
    "Motor City","Arabian Ranches","Emirates Hills","Al Furjan","Discovery Gardens",
    "The Greens","Dubailand","Al Jaddaf","Dubai Healthcare City","DIFC",
    "Al Mankhool","Jumeirah Lake Towers (JLT)","Al Sufouh","Port Saeed",
  ],
  "Abu Dhabi": [
    "Al Reem Island","Khalidiyah","Al Nahyan","Corniche","Al Khalidiyah","Yas Island",
    "Saadiyat Island","Al Mushrif","Al Muroor","Mohammed Bin Zayed City",
    "Khalifa City","Al Raha Beach","Al Reef","Masdar City","Al Shamkha",
    "Al Bahia","Al Wathba","Madinat Zayed","Al Karamah","Tourist Club Area",
    "Al Manhal","Airport Road Area","Al Zaab","Electra Street Area",
    "Al Mina","Officers City","Shakhbout City","Al Falah","Capital Centre",
  ],
  "Sharjah": [
    "Al Majaz","Al Nahda","Al Qasimia","Al Taawun","Al Khan","Muwaileh",
    "Al Yarmook","Al Qadisiya","Al Wahda","Bu Tina","Al Manakh","Al Nud",
    "Al Suyoh","University City","Al Ramla","Halwan","Al Rifaah","Samnan",
    "Al Jazzat","Al Sharq","Al Ghuwair","Al Layyeh","Al Azra","Maysaloon",
  ],
  "Ajman": [
    "Al Nuaimia","Al Rashidiya","Al Jurf","Al Rumailah","Al Hamidiya",
    "Al Mowaihat","Mushairef","Al Sawan","Al Karama","Al Raqaib",
    "Al Tallah","Al Bustan","Al Jerf Industrial","Ajman Free Zone",
  ],
  "Ras Al Khaimah": [
    "Al Nakheel","Al Hamra Village","Mina Al Arab","Al Marjan Island",
    "Al Qusaidat","Al Dhait","Al Rams","Khuzam","Al Uraibi","Al Jazirah Al Hamra",
    "Al Mairid","Al Quwain","Sidroh","Dafan Al Nakheel",
  ],
  "Fujairah": [
    "Fujairah City","Dibba Al Fujairah","Khor Fakkan","Kalba","Al Bithnah",
    "Masafi","Qidfa","Al Hayl","Al Faseel","Mirbah",
  ],
  "Umm Al Quwain": [
    "UAQ City Centre","Al Salama","Al Raas","Al Khor","Falaj Al Mualla",
    "Al Raudah","Al Haditha","Al Salam City",
  ],
};

const EMIRATES = Object.keys(UAE_DATA);

// ── UAE Area Autocomplete Component ──────────────────────
const UAEAddressInput = ({ value, onChange, emirate, placeholder, inputClass }) => {
  const [query, setQuery]           = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop]     = useState(false);
  const wrapperRef                  = useRef(null);

  // Close on outside click
  useEffect(() => {
    const fn = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setShowDrop(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Sync value from outside (reset)
  useEffect(() => { setQuery(value || ""); }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    if (!val.trim()) { setSuggestions([]); setShowDrop(false); return; }

    // Search in selected emirate first, then all UAE
    const pool = emirate && UAE_DATA[emirate]
      ? [
          ...UAE_DATA[emirate].map(a => ({ area: a, emirate })),
          ...EMIRATES
            .filter(em => em !== emirate)
            .flatMap(em => UAE_DATA[em].map(a => ({ area: a, emirate: em }))),
        ]
      : EMIRATES.flatMap(em => UAE_DATA[em].map(a => ({ area: a, emirate: em })));

    const q = val.toLowerCase();
    const results = pool
      .filter(({ area }) => area.toLowerCase().includes(q))
      .slice(0, 8);

    setSuggestions(results);
    setShowDrop(results.length > 0);
  };

  const handleSelect = ({ area, emirate: em }) => {
    const full = `${area}, ${em}, UAE`;
    setQuery(full);
    onChange(full, em);
    setShowDrop(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    setSuggestions([]);
    setShowDrop(false);
  };

  // Highlight matching text
  const highlight = (text, q) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <strong style={{ color: "#7c3aed" }}>{text.slice(idx, idx + q.length)}</strong>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <FiSearch size={15} style={{
          position: "absolute", left: 14, top: "50%",
          transform: "translateY(-50%)", color: "#9ca3af", zIndex: 1,
        }} />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowDrop(true)}
          placeholder={placeholder}
          className={inputClass}
          style={{ paddingLeft: 40, paddingRight: query ? 36 : 14 }}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)",
              background: "#e5e7eb", border: "none", borderRadius: "50%",
              width: 20, height: 20, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <FiX size={11} color="#6b7280" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDrop && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
          boxShadow: "0 10px 40px rgba(0,0,0,.1)", zIndex: 9999,
          overflow: "hidden", maxHeight: 280, overflowY: "auto",
        }}>
          {suggestions.map(({ area, emirate: em }, i) => (
            <button
              key={`${em}-${area}`}
              type="button"
              onMouseDown={() => handleSelect({ area, emirate: em })}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", textAlign: "left",
                padding: "10px 14px", background: "none", border: "none",
                borderBottom: i < suggestions.length - 1 ? "1px solid #f3f4f6" : "none",
                cursor: "pointer", transition: "background .12s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <FiMapPin size={13} style={{ color: "#a78bfa", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", margin: 0 }}>
                  {highlight(area, query)}
                </p>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: "1px 0 0" }}>
                  {em}, UAE
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Checkout Component ──────────────────────────────
const CheckoutPage = () => {
  const navigate    = useNavigate();
  const { user, token } = useSelector((s) => s.auth);
  const customerId  = user?._id || user?.id;

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [step, setStep]           = useState(1);
  const [placing, setPlacing]     = useState(false);

  const [address, setAddress] = useState({
    fullName:    user?.name?.first_name
                   ? `${user.name.first_name} ${user.name.last_name || ""}`.trim()
                   : "",
    email:       user?.email || "",
    phone:       user?.mobile?.number
                   ? `+${(user.mobile.country_code || "971").replace("+", "")}${user.mobile.number}`
                   : "+971",
    addressLine: "",
    city:        "",
    emirate:     "",
    country:     "UAE",
    zipCode:     "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  useEffect(() => {
    if (!token || !customerId) navigate("/user/login");
  }, [token, customerId]);

  useEffect(() => {
    if (!customerId) return;
    const fetchCart = async () => {
      setLoading(true);
      try {
        const res = await apiService.get(`/products/cart/get?customerId=${customerId}`);
        const items = res?.data?.items || res?.items || [];
        if (items.length === 0) {
          toast.error("Your cart is empty");
          navigate("/ecommerce/cart");
          return;
        }
        setCartItems(items);
      } catch {
        toast.error("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [customerId]);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1), 0
  );

  const validateAddress = () => {
    const fields = ["fullName", "email", "phone", "addressLine", "city", "emirate"];
    for (let f of fields) {
      const val = address[f];
      if (!val || (typeof val === "string" && !val.trim())) {
        toast.error(`Please fill in ${f.replace(/([A-Z])/g, " $1").toLowerCase()}`);
        return false;
      }
    }
    if (!address.phone || address.phone.length < 8) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    return true;
  };

  // When area is selected from dropdown — auto fill emirate + city
  const handleAreaSelect = (fullAddress, emirate) => {
    if (emirate) {
      setAddress(prev => ({
        ...prev,
        addressLine: fullAddress,
        emirate: emirate,
        city: fullAddress.split(",")[0]?.trim() || prev.city,
      }));
    } else {
      setAddress(prev => ({ ...prev, addressLine: fullAddress }));
    }
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      if (paymentMethod === "cod") {
        await apiService.post(`/products/cart/cod?customerId=${customerId}`, { address });
        toast.success("Order placed! Pay on delivery. 🎉");
        navigate("/ecommerce/payment/success");
        return;
      }
      if (paymentMethod === "tabby") {
        const res = await apiService.post("/products/cart/tabby-session", {
          customerId, address, amount: totalPrice, currency: "AED",
          items: cartItems.map(item => ({
            title: item.productId?.name || "Product",
            quantity: item.quantity, unit_price: item.price,
            category: item.productId?.category?.name || "General",
          })),
          buyer: { name: address.fullName, email: address.email, phone: address.phone },
        });
        const url = res?.data?.checkout_url || res?.checkout_url;
        if (url) { window.location.href = url; return; }
        toast.error("Failed to initialize Tabby payment");
        return;
      }
      if (paymentMethod === "tamara") {
        const res = await apiService.post("/products/cart/tamara-session", {
          customerId, address, amount: totalPrice, currency: "AED",
          items: cartItems.map(item => ({
            name: item.productId?.name || "Product",
            quantity: item.quantity, unit_price: item.price, type: "Physical",
          })),
          consumer: {
            first_name: address.fullName.split(" ")[0],
            last_name: address.fullName.split(" ")[1] || "",
            email: address.email, phone_number: address.phone,
          },
          shipping_address: {
            first_name: address.fullName.split(" ")[0],
            last_name: address.fullName.split(" ")[1] || "",
            line1: address.addressLine, city: address.city, country_code: "AE",
          },
        });
        const url = res?.data?.checkout_url || res?.checkout_url;
        if (url) { window.location.href = url; return; }
        toast.error("Failed to initialize Tamara payment");
        return;
      }
    } catch (err) {
      toast.error(err?.message || "Order placement failed");
    } finally {
      setPlacing(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-purple-400 transition bg-white";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <style>{`
        /* ── react-phone-number-input ── */
        .phone-input-wrapper {
          display: flex; align-items: center;
          border: 1px solid #e5e7eb; border-radius: 12px;
          overflow: hidden; height: 48px; background: #fff;
          transition: box-shadow .2s, border-color .2s;
        }
        .phone-input-wrapper:focus-within {
          border-color: #a78bfa;
          box-shadow: 0 0 0 2px rgba(167,139,250,.25);
        }
        .phone-input-wrapper .PhoneInputCountry {
          padding: 0 10px 0 14px; background: #f9fafb;
          border-right: 1px solid #e5e7eb; height: 100%;
          display: flex; align-items: center; gap: 6px; flex-shrink: 0;
        }
        .phone-input-wrapper .PhoneInputCountrySelect {
          border: none; background: transparent; font-size: 13px;
          color: #374151; cursor: pointer; outline: none;
          max-width: 28px; appearance: none; -webkit-appearance: none;
        }
        .phone-input-wrapper .PhoneInputCountrySelectArrow { display: none; }
        .phone-input-wrapper .PhoneInputInput {
          flex: 1; border: none; outline: none; padding: 0 14px;
          font-size: 14px; color: #111827; font-family: inherit;
          background: transparent; height: 100%;
        }
        .phone-input-wrapper .PhoneInputCountryIcon {
          width: 22px; height: 15px; border-radius: 2px;
          overflow: hidden; flex-shrink: 0;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <button onClick={() => navigate("/ecommerce/cart")}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium mb-4 flex items-center gap-1">
              ← Back to Cart
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 font-semibold text-sm ${step >= 1 ? "text-purple-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
                ${step > 1 ? "bg-green-500 text-white" : step === 1 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > 1 ? "✓" : "1"}
              </div>
              Delivery Address
            </div>
            <div className="flex-1 h-0.5 bg-gray-200">
              <div className={`h-full bg-purple-600 transition-all duration-500 ${step >= 2 ? "w-full" : "w-0"}`} />
            </div>
            <div className={`flex items-center gap-2 font-semibold text-sm ${step >= 2 ? "text-purple-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
                ${step >= 2 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                2
              </div>
              Payment
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">

              {/* ── STEP 1 — Address ── */}
              {step === 1 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FiMapPin className="text-purple-600" /> Delivery Address
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                        {address.fullName && <span className="ml-2 text-xs text-green-600 font-normal"></span>}
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                        <input type="text" value={address.fullName}
                          onChange={e => setAddress({...address, fullName: e.target.value})}
                          placeholder="John Doe" className={`${inputCls} pl-10`} />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                        {user?.email && <span className="ml-2 text-xs text-green-600 font-normal"></span>}
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                        <input type="email" value={address.email}
                          onChange={e => setAddress({...address, email: e.target.value})}
                          placeholder="john@example.com" className={`${inputCls} pl-10`} />
                      </div>
                    </div>

                    {/* Phone — react-phone-number-input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                        {user?.mobile?.number && <span className="ml-2 text-xs text-green-600 font-normal"></span>}
                      </label>
                      <PhoneInput
                        defaultCountry="AE"
                        value={address.phone}
                        onChange={phone => setAddress({...address, phone: phone || ""})}
                        international
                        countryCallingCodeEditable={false}
                        className="phone-input-wrapper"
                      />
                    </div>

                    {/* Emirate — select first */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emirate *
                        {address.emirate && <span className="ml-2 text-xs text-green-600 font-normal"></span>}
                      </label>
                      <div className="relative">
                        <select
                          value={address.emirate}
                          onChange={e => setAddress({...address, emirate: e.target.value, addressLine: "", city: ""})}
                          className={inputCls}
                          style={{ appearance: "none", paddingRight: 36 }}
                        >
                          <option value="">Select Emirate</option>
                          {EMIRATES.map(e => <option key={e}>{e}</option>)}
                        </select>
                        <FiChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Area / Address Line — UAE dropdown */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Area / Address *
                        <span className="ml-2 text-xs text-purple-500 font-normal">
                          
                          {address.emirate && ` in ${address.emirate}`}
                        </span>
                      </label>
                      <UAEAddressInput
                        value={address.addressLine}
                        onChange={(val, em) => {
                          if (em) {
                            setAddress(prev => ({
                              ...prev,
                              addressLine: val,
                              emirate: em,
                              city: val.split(",")[0]?.trim() || prev.city,
                            }));
                          } else {
                            setAddress(prev => ({ ...prev, addressLine: val }));
                          }
                        }}
                        emirate={address.emirate}
                        placeholder={
                          address.emirate
                            ? `Search area in ${address.emirate}...`
                            : "Search area e.g. Downtown Dubai, Al Reem Island..."
                        }
                        inputClass={inputCls}
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                        {address.city && <span className="ml-2 text-xs text-green-600 font-normal"></span>}
                      </label>
                      <input type="text" value={address.city}
                        onChange={e => setAddress({...address, city: e.target.value})}
                        placeholder="Dubai" className={inputCls} />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input type="text" value={address.country} disabled
                        className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-400 text-sm" />
                    </div>

                    {/* ZIP */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP / PO Box <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input type="text" value={address.zipCode}
                        onChange={e => setAddress({...address, zipCode: e.target.value})}
                        placeholder="00000" className={inputCls} />
                    </div>

                  </div>

                  <button
                    onClick={() => { if (validateAddress()) setStep(2); }}
                    className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition duration-200"
                  >
                    Continue to Payment →
                  </button>
                </div>
              )}

              {/* ── STEP 2 — Payment ── */}
              {step === 2 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FiCreditCard className="text-purple-600" /> Payment Method
                  </h2>

                  <div className="space-y-4">
                    {[
                      { value:"cod",    logo:<div className="w-16 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-gray-900 font-bold text-xs px-1">💵 COD</div>, title:"Cash on Delivery", sub:"Pay when your order arrives" },
                      { value:"tabby",  logo:<div className="w-16 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">tabby</div>, title:"Tabby — Buy Now, Pay Later", sub:"Split into 4 payments, 0% interest" },
                      { value:"tamara", logo:<div className="w-16 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">tamara</div>, title:"Tamara — Pay in 3", sub:"Split into 3 easy payments" },
                    ].map(pm => (
                      <label key={pm.value}
                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition
                          ${paymentMethod === pm.value ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300"}`}>
                        <input type="radio" value={pm.value} checked={paymentMethod === pm.value}
                          onChange={() => setPaymentMethod(pm.value)} className="accent-purple-600" />
                        <div className="flex items-center gap-3 flex-1">
                          {pm.logo}
                          <div>
                            <p className="font-semibold text-gray-800">{pm.title}</p>
                            <p className="text-xs text-gray-500">{pm.sub}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(1)}
                      className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-4 rounded-xl transition">
                      ← Back
                    </button>
                    <button onClick={handlePlaceOrder} disabled={placing}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {placing ? (
                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</>
                      ) : `Place Order — AED ${totalPrice.toFixed(2)}`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Order Summary ── */}
            <div className="lg:w-80">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cartItems.map(item => {
                    const image = item.productColorId?.photos?.[0] || item.productId?.images?.[0] || null;
                    return (
                      <div key={item._id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {image ? <img src={image} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{item.productId?.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-800 flex-shrink-0">
                          AED {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span><span>AED {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span><span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-100 text-lg">
                    <span>Total</span>
                    <span className="text-purple-600">AED {totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                {step === 2 && address.addressLine && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-xs font-semibold text-purple-700 mb-1">📍 Delivering to:</p>
                    <p className="text-xs text-gray-600">
                      {address.fullName}, {address.addressLine},<br />
                      {address.city}, {address.emirate}, {address.country}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;