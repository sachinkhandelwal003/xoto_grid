import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";

// ── Confetti ──────────────────────────────────────────────
const COLORS = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ec4899","#3b82f6","#f97316"];

function Particle({ x, y, color, angle, speed, size, shape, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    let frame, px = x, py = y;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed - 3;
    let alpha = 1, rot = Math.random() * 360;
    const tick = () => {
      vy += 0.22; px += vx; py += vy; vx *= 0.99;
      alpha -= 0.012; rot += vx * 4;
      if (ref.current) {
        ref.current.style.transform = `translate(${px}px,${py}px) rotate(${rot}deg)`;
        ref.current.style.opacity = Math.max(0, alpha);
      }
      if (alpha > 0) frame = requestAnimationFrame(tick);
      else onDone?.();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div ref={ref} style={{
      position:"fixed", left:0, top:0, pointerEvents:"none", zIndex:9999,
      width: shape==="circle" ? size : size*1.4,
      height: shape==="circle" ? size : size*0.5,
      borderRadius: shape==="circle" ? "50%" : 3,
      background: color, willChange:"transform,opacity",
    }}/>
  );
}

function Confetti({ origin }) {
  const [parts, setParts] = useState([]);
  useEffect(() => {
    const burst = (ox, oy, n=60) => {
      const ps = Array.from({length:n},(_,i)=>({
        id: Math.random()+i+Date.now(),
        x:ox, y:oy,
        color: COLORS[Math.floor(Math.random()*COLORS.length)],
        angle: (Math.PI*2*i)/n + (Math.random()-.5)*.5,
        speed: 4+Math.random()*6,
        size: 5+Math.random()*7,
        shape: Math.random()>.5?"rect":"circle",
      }));
      setParts(p=>[...p,...ps]);
    };
    burst(origin.x, origin.y, 70);
    setTimeout(()=>burst(origin.x-120, origin.y+40, 35), 400);
    setTimeout(()=>burst(origin.x+120, origin.y+40, 35), 700);
  }, []);
  return parts.map(p=>(
    <Particle key={p.id} {...p} onDone={()=>setParts(ps=>ps.filter(x=>x.id!==p.id))}/>
  ));
}

// ── Check SVG ─────────────────────────────────────────────
function CheckAnim() {
  return (
    <svg viewBox="0 0 56 56" width="56" height="56">
      <defs>
        <linearGradient id="og" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#059669"/>
        </linearGradient>
      </defs>
      <circle cx="28" cy="28" r="26" fill="url(#og)"
        style={{animation:"oc_scale .4s cubic-bezier(.34,1.56,.64,1) forwards", transformOrigin:"center"}}/>
      <polyline points="15,28 23,37 41,20" fill="none" stroke="white" strokeWidth="3.5"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="40" strokeDashoffset="40"
        style={{animation:"oc_check .35s ease .35s forwards"}}/>
    </svg>
  );
}

const REDIRECT_SECS = 8;

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const customerId = user?._id || user?.id;
  

  const [show, setShow]           = useState(false);
  const [origin, setOrigin]       = useState(null);
  const [countdown, setCountdown] = useState(REDIRECT_SECS);
  const [orderData, setOrderData] = useState(null);
  const headerRef = useRef(null);

  const orderId = `XTO-${Date.now().toString().slice(-8)}`;
  const deliveryDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    .toLocaleDateString("en-AE", { weekday:"long", month:"long", day:"numeric" });

  // Fetch latest purchase for order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!customerId) return;
      try {
        // Fetch cart to get last items (already purchased, so converted_to_deal=true)
        // We just show a generic success — real order data comes from Purchase model
        // You can extend this to fetch purchase by customerId if you have that API
      } catch {}
    };
    fetchOrder();
  }, [customerId]);

  // Show animation
  useEffect(() => {
    const t = setTimeout(() => {
      setShow(true);
      const r = headerRef.current?.getBoundingClientRect();
      if (r) setOrigin({ x: r.left + r.width/2, y: r.top + 60 });
    }, 100);
    return () => clearTimeout(t);
  }, []);

  // Countdown
  useEffect(() => {
    const iv = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(iv); navigate("/ecommerce/b2c"); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [navigate]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        @keyframes oc_scale {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes oc_check { to { stroke-dashoffset: 0; } }
        @keyframes oc_fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes oc_slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes oc_pulse {
          0%,100% { opacity: 1; }
          50%     { opacity: .6; }
        }

        .oc-page {
          min-height: 100vh;
          background: #f3f4f6;
          font-family: 'Inter', sans-serif;
          padding: 24px 16px 48px;
        }
        .oc-wrap {
          max-width: 680px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* ── Header card ── */
        .oc-header {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          padding: 28px 28px 24px;
          display: flex;
          align-items: flex-start;
          gap: 18px;
          opacity: 0;
          animation: oc_fadeIn .5s ease .1s forwards;
        }
        .oc-header-text h1 {
          font-size: 22px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 6px;
          line-height: 1.3;
        }
        .oc-header-text p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
          line-height: 1.6;
        }
        .oc-header-text strong { color: #111827; }

        /* ── Card base ── */
        .oc-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        .oc-card-header {
          padding: 14px 20px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          background: #fafafa;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .oc-card-body { padding: 20px; }

        /* ── Delivery timeline ── */
        .oc-timeline {
          display: flex;
          align-items: center;
          gap: 0;
          margin: 4px 0 16px;
        }
        .oc-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }
        .oc-step-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          z-index: 1;
          margin-bottom: 6px;
        }
        .oc-step-dot.active { background: #10b981; color: white; }
        .oc-step-dot.pending { background: #e5e7eb; color: #9ca3af; }
        .oc-step-line {
          position: absolute;
          top: 14px;
          left: 50%;
          width: 100%;
          height: 2px;
          z-index: 0;
        }
        .oc-step-line.done { background: #10b981; }
        .oc-step-line.pending { background: #e5e7eb; }
        .oc-step-label {
          font-size: 11px;
          color: #6b7280;
          text-align: center;
          font-weight: 500;
        }
        .oc-step-label.active { color: #059669; font-weight: 700; }

        /* ── Order meta row ── */
        .oc-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 14px;
        }
        .oc-meta-row:last-child { border-bottom: none; padding-bottom: 0; }
        .oc-meta-label { color: #6b7280; }
        .oc-meta-value { color: #111827; font-weight: 600; text-align: right; }

        /* ── Action buttons ── */
        .oc-btn-primary {
          width: 100%;
          padding: 13px;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background .15s;
          margin-bottom: 10px;
        }
        .oc-btn-primary:hover { background: #4f46e5; }
        .oc-btn-secondary {
          width: 100%;
          padding: 12px;
          background: #fff;
          color: #374151;
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color .15s, background .15s;
          margin-bottom: 10px;
        }
        .oc-btn-secondary:hover { border-color: #6366f1; color: #6366f1; background: #f5f3ff; }

        /* ── Countdown bar ── */
        .oc-countdown-bar {
          height: 3px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 12px;
        }
        .oc-countdown-fill {
          height: 100%;
          background: #6366f1;
          border-radius: 2px;
          transition: width 1s linear;
        }

        /* ── Info chips ── */
        .oc-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .oc-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 12px;
          color: #374151;
          font-weight: 500;
          flex: 1;
          min-width: 120px;
          justify-content: center;
        }

        /* Animation delays */
        .oc-d1 { opacity:0; animation: oc_fadeIn .4s ease .25s forwards; }
        .oc-d2 { opacity:0; animation: oc_fadeIn .4s ease .4s forwards; }
        .oc-d3 { opacity:0; animation: oc_fadeIn .4s ease .55s forwards; }
        .oc-d4 { opacity:0; animation: oc_fadeIn .4s ease .7s forwards; }
        .oc-d5 { opacity:0; animation: oc_fadeIn .4s ease .85s forwards; }
      `}</style>

      <div className="oc-page">
        {origin && <Confetti origin={origin} />}

        <div className="oc-wrap">

          {/* ── Header — Order confirmed ── */}
          <div className="oc-header" ref={headerRef}>
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              <CheckAnim />
            </div>
            <div className="oc-header-text">
              <h1>Order Confirmed! 🎉</h1>
              <p>
                Thank you, <strong>{user?.name?.first_name || "there"}</strong>!
                Your order has been placed successfully.<br />
                A confirmation email has been sent to{" "}
                <strong>{user?.email || "your registered email"}</strong>.
              </p>
            </div>
          </div>

          {/* ── Order ID + Delivery date ── */}
          <div className="oc-card oc-d1">
            <div className="oc-card-header">
              📦 Order Details
            </div>
            <div className="oc-card-body">
              <div className="oc-meta-row">
                <span className="oc-meta-label">Order ID</span>
                <span className="oc-meta-value" style={{ color:"#6366f1", fontFamily:"monospace", fontSize:15 }}>
                  #{orderId}
                </span>
              </div>
              <div className="oc-meta-row">
                <span className="oc-meta-label">Order Date</span>
                <span className="oc-meta-value">
                  {new Date().toLocaleDateString("en-AE", { day:"numeric", month:"long", year:"numeric" })}
                </span>
              </div>
              <div className="oc-meta-row">
                <span className="oc-meta-label">Estimated Delivery</span>
                <span className="oc-meta-value" style={{ color:"#059669" }}>
                  {deliveryDate}
                </span>
              </div>
              {/* <div className="oc-meta-row">
                <span className="oc-meta-label">Delivery</span>
                <span className="oc-meta-value" style={{ color:"#059669" }}>
                  FREE
                </span>
              </div> */}
            </div>
          </div>

          {/* ── Delivery Progress ── */}
          <div className="oc-card oc-d2">
            <div className="oc-card-header">
              🚚 Delivery Status
            </div>
            <div className="oc-card-body">
              <div className="oc-timeline">
                {[
                  { label: "Order\nPlaced", done: true, active: true },
                  { label: "Processing", done: false, active: false },
                  { label: "Shipped", done: false, active: false },
                  { label: "Delivered", done: false, active: false },
                ].map((step, i, arr) => (
                  <div className="oc-step" key={i}>
                    {/* Line before dot (except first) */}
                    {i > 0 && (
                      <div className={`oc-step-line ${step.done ? "done" : "pending"}`}
                        style={{ right:"50%", left:"auto", width:"100%" }} />
                    )}
                    <div className={`oc-step-dot ${step.active ? "active" : "pending"}`}>
                      {step.active ? "✓" : i + 1}
                    </div>
                    <span className={`oc-step-label ${step.active ? "active" : ""}`}
                      style={{ whiteSpace:"pre-line" }}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery note */}
              <div style={{
                background:"#f0fdf4", border:"1px solid #bbf7d0",
                borderRadius:8, padding:"10px 14px",
                fontSize:13, color:"#15803d", fontWeight:500,
              }}>
                ✅ Your order is confirmed and will be processed shortly.
              </div>
            </div>
          </div>

          {/* ── Trust + Info chips ── */}
          {/* <div className="oc-card oc-d3">
            <div className="oc-card-body" style={{ paddingBottom:16 }}>
              <div className="oc-chips">
                <div className="oc-chip">🚚 Free Delivery</div>
                <div className="oc-chip">🔒 Secure Payment</div>
                <div className="oc-chip">🔄 Easy Returns</div>
              </div>
            </div>
          </div> */}

          {/* ── Actions ── */}
          <div className="oc-card oc-d4">
            <div className="oc-card-header">What would you like to do?</div>
            <div className="oc-card-body">
              <button className="oc-btn-primary"
                onClick={() => navigate("/ecommerce/b2c")}>
                🛍️ Continue Shopping
              </button>
              <button className="oc-btn-secondary"
                onClick={() => navigate("/ecommerce/orders")}>
                📦 Track My Order
              </button>
              <button className="oc-btn-secondary"
                onClick={() => navigate("/ecommerce/cart")}>
                🛒 View Cart
              </button>
            </div>
          </div>

          {/* ── Auto redirect ── */}
          <div className="oc-card oc-d5">
            <div className="oc-card-body" style={{ padding:"14px 20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, color:"#6b7280" }}>
                  Redirecting to shop in{" "}
                  <strong style={{ color:"#6366f1" }}>{countdown}s</strong>
                </span>
                <button
                  onClick={() => navigate("/ecommerce/b2c")}
                  style={{
                    fontSize:12, color:"#6366f1", fontWeight:600,
                    background:"none", border:"none", cursor:"pointer", padding:0,
                  }}
                >
                  Go now →
                </button>
              </div>
              <div className="oc-countdown-bar">
                <div className="oc-countdown-fill"
                  style={{ width:`${(countdown / REDIRECT_SECS) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{
            textAlign:"center", fontSize:12, color:"#9ca3af",
            padding:"8px 0",
            animation:"oc_fadeIn .4s ease 1s both",
          }}>
            Need help?{" "}
            <span style={{ color:"#6366f1", fontWeight:600, cursor:"pointer" }}>
              support@xoto.ae
            </span>
            {" · "}
            <span style={{ color:"#6366f1", fontWeight:600, cursor:"pointer" }}>
              xoto.ae
            </span>
          </div>

        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;