import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card, Table, Button, Tag, Space, Modal, Input, Select,
  message, Tooltip, Drawer, Divider, Typography, Row, Col,
  Statistic, Spin, Alert, Popconfirm, Progress, Badge,
} from "antd";
import {
  PlusOutlined, ThunderboltOutlined, ShareAltOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, CopyOutlined,
  FilePdfOutlined, WhatsAppOutlined, MailOutlined,
  CheckCircleOutlined, ClockCircleOutlined, BarChartOutlined,
  SettingOutlined, ExperimentOutlined, ArrowLeftOutlined,
  LinkOutlined, ReloadOutlined, HomeOutlined, EnvironmentOutlined,
  DollarOutlined, PictureOutlined, StarOutlined, RobotOutlined,
  LoadingOutlined, GlobalOutlined,
} from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

// ── Theme ─────────────────────────────────────────────────────────────────────
const T = {
  primary:    "#5C039B",
  success:    "#10b981",
  warning:    "#d97706",
  error:      "#ef4444",
  info:       "#3b82f6",
  bg:         "#f8f9fa",
  border:     "#f0f0f0",
  text:       "#1f2937",
  muted:      "#9ca3af",
  xotoPurple: "#7F77DD",
  xotoGreen:  "#3DAF78",
  navyDark:   "#26215C",
};

// ── ObjectId validation ───────────────────────────────────────────────────────
const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id?.trim() || "");

// ── Language map for AI prompting ─────────────────────────────────────────────
const LANGUAGE_PROMPTS = {
  English: "English",
  Arabic:  "Arabic (Modern Standard Arabic, right-to-left)",
  Russian: "Russian",
  Chinese: "Simplified Chinese (Mandarin)",
  French:  "French",
  German:  "German",
  Spanish: "Spanish",
  Hindi:   "Hindi",
  Urdu:    "Urdu",
  Persian: "Persian/Farsi",
};

// ══════════════════════════════════════════════════════════════════════════════
//  API SERVICE LAYER
// ══════════════════════════════════════════════════════════════════════════════
const apiCreate       = (payload)          => apiService.post("/agent/lead/presentations", payload);
const apiUpdate       = (id, payload)      => apiService.put(`/agent/lead/presentations/${id}`, payload);
const apiGenerate     = (id)               => apiService.post(`/agent/lead/presentations/${id}/generate`);
const apiShareChannel = (id, channel)      => apiService.post(`/agent/lead/presentations/${id}/share`, { channel });
const apiFetchList    = (status)           => apiService.get(`/agent/lead/presentations${status && status !== "all" ? `?status=${status}` : ""}`);
const apiFetchOne     = (id)               => apiService.get(`/agent/lead/presentations/${id}`);
const apiArchive      = (id)               => apiService.delete(`/agent/lead/presentations/${id}`);
const apiFetchProperty = (id)             => apiService.get(`/agent/properties/${id}`);

// ── Payload builder ───────────────────────────────────────────────────────────
function buildPayload({ form, sections, propertyId, customNote }) {
  return {
    title: form.title || `Presentation — ${new Date().toLocaleDateString("en-AE")}`,
    tone:  form.tone  || "professional",
    properties: propertyId && isValidObjectId(propertyId)
      ? [{ property: propertyId.trim(), customNote: customNote || "", order: 1 }]
      : [],
    settings: {
      language: form.language || "English",
      currency: form.currency || "AED",
      areaUnit: form.areaUnit || "sqft",
      hideSections: {
        cover:        !sections.cover,
        projectDesc:  !sections.desc,
        developer:    !sections.dev,
        unitPrices:   !sections.prices,
        paymentPlans: !sections.payment,
        location:     !sections.location,
        amenities:    !sections.amenities,
        gallery:      !sections.gallery,
      },
    },
  };
}

// ── Clipboard copy ────────────────────────────────────────────────────────────
function copyToClipboard(text, successMsg = "Link copied to clipboard") {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => message.success(successMsg))
      .catch(() => fallbackCopy(text, successMsg));
  } else {
    fallbackCopy(text, successMsg);
  }
}
function fallbackCopy(text, successMsg) {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
    document.body.appendChild(el);
    el.focus(); el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    if (ok) message.success(successMsg);
    else message.error("Copy failed — please copy manually");
  } catch { message.error("Copy failed — please copy manually"); }
}

// ── PDF opener ────────────────────────────────────────────────────────────────
function openPdf(url) {
  if (!url || !url.startsWith("http")) { message.error("PDF URL is invalid"); return; }
  try {
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win || win.closed || typeof win.closed === "undefined") {
      message.warning("Popup blocked. Opening in this tab...");
      window.location.href = url;
    }
  } catch { message.error("Could not open PDF."); }
}

// ── Share dispatch ────────────────────────────────────────────────────────────
function dispatchShareChannel(channel, shareLink, title) {
  if (!shareLink) { message.warning("Share link not ready yet"); return; }
  if (channel === "whatsapp") {
    const body = encodeURIComponent(`Hi! I've prepared a property presentation for you: *${title}*\n\n${shareLink}`);
    window.open(`https://wa.me/?text=${body}`, "_blank", "noopener,noreferrer");
  }
  if (channel === "email") {
    const subject = encodeURIComponent(`Property Presentation — ${title}`);
    const body    = encodeURIComponent(`Hello,\n\nPlease find your personalised property presentation here:\n${shareLink}\n\nFeel free to reach out with any questions.\n\nBest regards`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  AI PRESENTATION GENERATOR
//  Calls Claude API to generate full multilingual presentation content
//  then builds a complete HTML presentation document
// ══════════════════════════════════════════════════════════════════════════════

async function generatePresentationWithAI({ property, form, sections, agentNote }) {
  const currency  = form.currency || "AED";
  const areaUnit  = form.areaUnit || "sqft";
  const language  = LANGUAGE_PROMPTS[form.language] || "English";
  const tone      = form.tone || "professional";

  // ── Format property data for the prompt ──────────────────────────────────
  const priceStr = property.price_min && property.price_max
    ? `${currency} ${Number(property.price_min).toLocaleString()} – ${Number(property.price_max).toLocaleString()}`
    : property.price ? `${currency} ${Number(property.price).toLocaleString()}` : "Price upon request";

  const areaStr = property.builtUpArea_min && property.builtUpArea_max
    ? `${property.builtUpArea_min} – ${property.builtUpArea_max} ${areaUnit}`
    : property.builtUpArea ? `${property.builtUpArea} ${areaUnit}` : "N/A";

  const facilitiesList = Object.entries(property.facilities || {})
    .filter(([, v]) => v).map(([k]) => k.replace(/([A-Z])/g, " $1").trim()).join(", ");

  const paymentPlanStr = (property.paymentPlan || []).map(plan =>
    `${plan.title}: ` + (plan.stages || []).map(s => `${s.stage} ${s.percentage}%`).join(", ")
  ).join("; ");

  const proximityStr = Object.entries(property.proximity || {})
    .filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(", ");

  const propertyData = `
PROPERTY DETAILS:
- Name: ${property.propertyName}
- Developer: ${property.developerName || "N/A"}
- Type: ${property.propertySubType} | ${property.unitType || ""} | ${property.bedroomType || ""}
- Bedrooms: ${property.bedrooms} | Bathrooms: ${property.bathrooms}
- Area: ${areaStr}
- Price: ${priceStr}
- Location: ${property.area}, ${property.city}, ${property.country}
- Project Status: ${property.projectStatus || "N/A"}
- Completion: ${property.completionDate?.quarter ? `${property.completionDate.quarter} ${property.completionDate.year}` : "N/A"}
- Description: ${property.description}
- Amenities: ${(property.amenities || []).join(", ")}
- Facilities: ${facilitiesList}
- View: ${property.hasView ? property.viewType?.join(", ") : "N/A"}
- Furnishing: ${property.furnishing || "N/A"}
- Ownership: ${property.ownershipType || "N/A"}
- Payment Plan: ${paymentPlanStr || "N/A"}
- Proximity: ${proximityStr || "N/A"}
- Commission: ${property.commission || 0}%
- RERA Permit: ${property.reraPermitNumber || "N/A"}
- Total Units: ${property.totalUnits || "N/A"}
- Floors: ${property.floors || "N/A"}
- Agent Note: ${agentNote || "N/A"}
`;

  // ── Claude API call ──────────────────────────────────────────────────────
  const systemPrompt = `You are an expert Dubai real estate copywriter. Generate property presentation content in ${language} with a ${tone} tone.
Always respond ONLY with valid JSON. No markdown, no preamble. The JSON must have these exact keys:
{
  "headline": "compelling property headline (max 10 words)",
  "tagline": "aspirational one-liner (max 15 words)",
  "overview": "3-4 paragraph detailed property overview covering the project, unit features, lifestyle benefits, and investment value",
  "highlights": ["5-7 key selling points as short bullet strings"],
  "locationStory": "2 paragraph neighborhood and community description",
  "developerProfile": "2 paragraph developer reputation and track record description",
  "investmentCase": "2 paragraph investment rationale with ROI potential",
  "callToAction": "short compelling call-to-action sentence",
  "isRTL": true or false (true only for Arabic, Urdu, Persian/Farsi, Hebrew)
}
All content must be in ${language}. If the language is right-to-left, isRTL must be true.`;

  const userPrompt = `Generate a ${tone} property presentation in ${language} for:\n${propertyData}\nPresentation title: ${form.title}`;

  let aiContent = null;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    const data = await response.json();
    const raw = data.content?.find(b => b.type === "text")?.text || "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    aiContent = JSON.parse(cleaned);
  } catch (err) {
    console.error("AI generation error:", err);
    // Fallback content
    aiContent = {
      headline: form.title,
      tagline: `Premium ${property.unitType || "property"} in ${property.area}`,
      overview: property.description,
      highlights: (property.amenities || []).slice(0, 6),
      locationStory: `Located in ${property.area}, ${property.city}. ${proximityStr}`,
      developerProfile: `Developed by ${property.developerName || "a leading developer"}.`,
      investmentCase: `Starting from ${priceStr}. Completion ${property.completionDate?.quarter || ""} ${property.completionDate?.year || ""}.`,
      callToAction: "Contact us today to schedule a viewing.",
      isRTL: ["Arabic", "Urdu", "Persian"].includes(form.language),
    };
  }

  // ── Build the full HTML presentation ────────────────────────────────────
  const isRTL   = aiContent.isRTL;
  const dir     = isRTL ? "rtl" : "ltr";
  const allPhotos = [
    ...(property.photos?.architecture || []),
    ...(property.photos?.interior     || []),
    ...(property.photos?.lobby        || []),
    ...(property.photos?.other        || []),
  ].filter(Boolean);

  const facilitiesIcons = {
    swimmingPool: "🏊", gym: "💪", parking: "🅿️", childrenPlayArea: "🎠",
    gardens: "🌿", security: "🔒", concierge: "🛎️", lounge: "🛋️", smartHome: "🏠",
  };
  const activeFacilities = Object.entries(property.facilities || {})
    .filter(([, v]) => v)
    .map(([k]) => ({ icon: facilitiesIcons[k] || "✓", label: k.replace(/([A-Z])/g, " $1").trim() }));

  const paymentRows = (property.paymentPlan || []).flatMap(plan =>
    (plan.stages || []).map(s => ({
      milestone: s.stage?.replace(/_/g, " ") || "",
      percent:   `${s.percentage}%`,
      note:      s.description || "",
      plan:      plan.title,
    }))
  );

  const proximityItems = Object.entries(property.proximity || {})
    .filter(([, v]) => v)
    .map(([k, v]) => ({ label: k.charAt(0).toUpperCase() + k.slice(1), value: v }));

  const html = `<!DOCTYPE html>
<html lang="${isRTL ? "ar" : "en"}" dir="${dir}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${aiContent.headline}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;color:#1a1a2e;background:#fff;direction:${dir}}
  .page{max-width:900px;margin:0 auto;padding:40px 30px}
  /* COVER */
  .cover{background:linear-gradient(135deg,#1a1236 0%,#26215C 50%,#3a1f6e 100%);color:#fff;border-radius:20px;padding:60px 50px;margin-bottom:40px;position:relative;overflow:hidden}
  .cover::before{content:'';position:absolute;top:-80px;right:-80px;width:300px;height:300px;background:rgba(127,119,221,0.15);border-radius:50%}
  .cover::after{content:'';position:absolute;bottom:-60px;left:-60px;width:200px;height:200px;background:rgba(61,175,120,0.1);border-radius:50%}
  .cover-badge{display:inline-block;background:rgba(127,119,221,0.3);border:1px solid rgba(127,119,221,0.5);color:#c5c0f5;font-size:11px;font-weight:600;letter-spacing:0.1em;padding:5px 14px;border-radius:20px;text-transform:uppercase;margin-bottom:24px}
  .cover h1{font-family:'Playfair Display',serif;font-size:clamp(28px,4vw,42px);font-weight:700;line-height:1.2;margin-bottom:16px;position:relative}
  .cover-tagline{font-size:16px;color:rgba(255,255,255,0.7);margin-bottom:36px;font-weight:300;position:relative}
  .cover-meta{display:flex;flex-wrap:wrap;gap:20px;position:relative}
  .cover-pill{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:30px;padding:8px 18px;font-size:13px;font-weight:500;display:flex;align-items:center;gap:6px}
  .cover-agent{margin-top:36px;padding-top:28px;border-top:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;gap:14px;position:relative}
  .agent-avatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#7F77DD,#3DAF78);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0}
  /* SECTION */
  .section{margin-bottom:40px}
  .section-label{font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#7F77DD;margin-bottom:8px}
  .section-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:600;color:#1a1236;margin-bottom:20px}
  /* STATS BAR */
  .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px;margin-bottom:32px}
  .stat-card{background:#f8f7ff;border-radius:14px;padding:18px 16px;border:1px solid #eeedfe}
  .stat-val{font-size:20px;font-weight:700;color:#26215C;font-family:'Playfair Display',serif}
  .stat-label{font-size:11px;color:#9ca3af;margin-top:4px;font-weight:500}
  /* OVERVIEW */
  .overview-text p{font-size:15px;line-height:1.85;color:#374151;margin-bottom:14px}
  /* HIGHLIGHTS */
  .highlights-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .highlight-item{display:flex;align-items:flex-start;gap:10px;background:#f8f7ff;border-radius:12px;padding:14px;border-left:3px solid #7F77DD}
  .highlight-dot{width:8px;height:8px;border-radius:50%;background:#7F77DD;margin-top:5px;flex-shrink:0}
  .highlight-text{font-size:13px;color:#374151;line-height:1.5}
  /* GALLERY */
  .gallery{display:grid;grid-template-columns:2fr 1fr 1fr;grid-template-rows:180px 180px;gap:8px;border-radius:16px;overflow:hidden;margin-bottom:32px}
  .gallery-main{grid-row:1/3;background:#e8e4ff;display:flex;align-items:center;justify-content:center;font-size:60px}
  .gallery-thumb{background:#f0eeff;display:flex;align-items:center;justify-content:center;font-size:30px;overflow:hidden}
  .gallery-thumb img,.gallery-main img{width:100%;height:100%;object-fit:cover}
  /* AMENITIES */
  .amenities-grid{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px}
  .amenity-tag{background:#f8f7ff;border:1px solid #eeedfe;border-radius:20px;padding:7px 14px;font-size:12px;font-weight:500;color:#534AB7}
  .facility-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-top:16px}
  .facility-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px;text-align:center}
  .facility-icon{font-size:24px;margin-bottom:6px}
  .facility-label{font-size:11px;color:#6b7280;font-weight:500;text-transform:capitalize}
  /* PAYMENT */
  .payment-table{width:100%;border-collapse:collapse;font-size:13px}
  .payment-table th{text-align:${isRTL?"right":"left"};padding:10px 14px;font-size:11px;font-weight:600;color:#9ca3af;border-bottom:2px solid #e5e7eb;text-transform:uppercase;letter-spacing:0.06em}
  .payment-table td{padding:12px 14px;border-bottom:1px solid #f3f4f6;color:#374151}
  .payment-table tr:hover td{background:#f8f7ff}
  .pct-badge{display:inline-block;background:#EEEDFE;color:#534AB7;font-weight:700;font-size:13px;padding:3px 10px;border-radius:8px}
  /* LOCATION */
  .location-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-top:16px}
  .proximity-card{background:#f8f7ff;border-radius:12px;padding:14px;text-align:center;border:1px solid #eeedfe}
  .proximity-val{font-size:15px;font-weight:700;color:#7F77DD;font-family:'Playfair Display',serif}
  .proximity-label{font-size:11px;color:#9ca3af;margin-top:4px}
  /* INFO BLOCKS */
  .info-block{background:#f8f7ff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #eeedfe}
  .info-block p{font-size:14px;line-height:1.85;color:#374151;margin-bottom:12px}
  .info-block p:last-child{margin-bottom:0}
  /* CTA */
  .cta-block{background:linear-gradient(135deg,#26215C,#534AB7);color:#fff;border-radius:20px;padding:40px;text-align:center;margin-top:48px}
  .cta-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:600;margin-bottom:12px}
  .cta-sub{font-size:15px;opacity:0.8;margin-bottom:24px}
  .cta-buttons{display:flex;justify-content:center;gap:14px;flex-wrap:wrap}
  .cta-btn{padding:12px 28px;border-radius:30px;font-size:13px;font-weight:600;cursor:pointer;border:none}
  .cta-btn-primary{background:#3DAF78;color:#fff}
  .cta-btn-secondary{background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3)}
  /* COMPLIANCE */
  .compliance{font-size:10px;color:#9ca3af;text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #f0f0f0;line-height:1.8}
  /* DIVIDER */
  .divider{height:1px;background:linear-gradient(90deg,transparent,#e5e7eb,transparent);margin:36px 0}
  /* VIEW TYPE BADGES */
  .view-badge{display:inline-block;background:#E1F5EE;color:#085041;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:600;margin:3px}
  @media print{body{background:#fff}.page{padding:20px}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}
  @media(max-width:640px){.highlights-grid{grid-template-columns:1fr}.gallery{grid-template-columns:1fr 1fr;grid-template-rows:auto}.gallery-main{grid-column:1/3;grid-row:auto;height:200px}.cover{padding:36px 24px}.stats-grid{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>
<div class="page">

  ${sections.cover ? `
  <!-- COVER -->
  <div class="cover">
    <div class="cover-badge">✦ Xoto GRID · Exclusive Presentation</div>
    <h1>${aiContent.headline}</h1>
    <p class="cover-tagline">${aiContent.tagline}</p>
    <div class="cover-meta">
      <div class="cover-pill">🏙️ ${property.area}, ${property.city}</div>
      <div class="cover-pill">💰 ${priceStr}</div>
      ${property.bedrooms ? `<div class="cover-pill">🛏️ ${property.bedrooms} Bed${property.bedrooms > 1 ? "s" : ""}</div>` : ""}
      <div class="cover-pill">📐 ${areaStr}</div>
      ${property.projectStatus ? `<div class="cover-pill">📋 ${property.projectStatus.replace(/_/g, " ")}</div>` : ""}
    </div>
    <div class="cover-agent">
      <div class="agent-avatar">XA</div>
      <div>
        <div style="font-weight:600;font-size:14px">Xoto Real Estate Advisor</div>
        <div style="font-size:12px;opacity:0.6;margin-top:2px">Prepared exclusively for you · Powered by Xoto GRID</div>
      </div>
    </div>
  </div>
  ` : ""}

  <!-- KEY STATS -->
  <div class="stats-grid">
    ${property.price || property.price_min ? `<div class="stat-card"><div class="stat-val">${priceStr}</div><div class="stat-label">Starting Price</div></div>` : ""}
    ${property.builtUpArea || property.builtUpArea_min ? `<div class="stat-card"><div class="stat-val">${areaStr}</div><div class="stat-label">Built-Up Area</div></div>` : ""}
    ${property.bedrooms ? `<div class="stat-card"><div class="stat-val">${property.bedrooms} / ${property.bathrooms}</div><div class="stat-label">Bed / Bath</div></div>` : ""}
    ${property.completionDate?.year ? `<div class="stat-card"><div class="stat-val">${property.completionDate.quarter || ""} ${property.completionDate.year}</div><div class="stat-label">Completion</div></div>` : ""}
    ${property.commission ? `<div class="stat-card"><div class="stat-val">${property.commission}%</div><div class="stat-label">Commission</div></div>` : ""}
    ${property.floors ? `<div class="stat-card"><div class="stat-val">${property.floors}</div><div class="stat-label">Floors</div></div>` : ""}
    ${property.totalUnits ? `<div class="stat-card"><div class="stat-val">${property.totalUnits}</div><div class="stat-label">Total Units</div></div>` : ""}
    ${property.ownershipType ? `<div class="stat-card"><div class="stat-val" style="font-size:14px">${property.ownershipType}</div><div class="stat-label">Ownership</div></div>` : ""}
  </div>

  ${sections.desc ? `
  <div class="divider"></div>
  <!-- OVERVIEW -->
  <div class="section">
    <div class="section-label">Property Overview</div>
    <div class="section-title">${property.propertyName}</div>
    <div class="overview-text">
      ${aiContent.overview.split("\n").filter(Boolean).map(p => `<p>${p}</p>`).join("")}
    </div>
  </div>

  <!-- HIGHLIGHTS -->
  ${aiContent.highlights?.length ? `
  <div class="divider"></div>
  <div class="section">
    <div class="section-label">Key Highlights</div>
    <div class="section-title">Why This Property?</div>
    <div class="highlights-grid">
      ${aiContent.highlights.map(h => `
      <div class="highlight-item">
        <div class="highlight-dot"></div>
        <div class="highlight-text">${h}</div>
      </div>`).join("")}
    </div>
  </div>` : ""}
  ` : ""}

  ${sections.gallery && allPhotos.length ? `
  <div class="divider"></div>
  <!-- GALLERY -->
  <div class="section">
    <div class="section-label">Property Gallery</div>
    <div class="section-title">Visual Tour</div>
    <div class="gallery">
      <div class="gallery-main">${allPhotos[0] ? `<img src="${allPhotos[0]}" alt="main"/>` : "🏙️"}</div>
      ${allPhotos.slice(1, 5).map((p, i) => `<div class="gallery-thumb">${p ? `<img src="${p}" alt="photo${i}"/>` : "🖼️"}</div>`).join("")}
      ${Array(Math.max(0, 4 - allPhotos.length + 1)).fill(0).map(() => `<div class="gallery-thumb">🖼️</div>`).join("")}
    </div>
  </div>` : ""}

  ${sections.amenities && (property.amenities?.length || activeFacilities.length) ? `
  <div class="divider"></div>
  <!-- AMENITIES & FACILITIES -->
  <div class="section">
    <div class="section-label">Amenities & Facilities</div>
    <div class="section-title">What's Included</div>
    ${property.amenities?.length ? `
    <div class="amenities-grid">
      ${property.amenities.map(a => `<div class="amenity-tag">✦ ${a}</div>`).join("")}
    </div>` : ""}
    ${activeFacilities.length ? `
    <div class="facility-grid">
      ${activeFacilities.map(f => `
      <div class="facility-card">
        <div class="facility-icon">${f.icon}</div>
        <div class="facility-label">${f.label}</div>
      </div>`).join("")}
    </div>` : ""}
    ${property.hasView && property.viewType?.length ? `
    <div style="margin-top:16px">
      <div style="font-size:12px;color:#9ca3af;font-weight:600;margin-bottom:8px">VIEWS</div>
      ${property.viewType.map(v => `<span class="view-badge">🌅 ${v} view</span>`).join("")}
    </div>` : ""}
  </div>` : ""}

  ${sections.payment && paymentRows.length ? `
  <div class="divider"></div>
  <!-- PAYMENT PLAN -->
  <div class="section">
    <div class="section-label">Payment Structure</div>
    <div class="section-title">Flexible Payment Plan</div>
    <div class="info-block" style="padding:0;overflow:hidden">
      <table class="payment-table">
        <thead>
          <tr>
            <th>Plan</th>
            <th>Milestone</th>
            <th>%</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          ${paymentRows.map(r => `
          <tr>
            <td style="font-weight:600;color:#26215C">${r.plan}</td>
            <td style="text-transform:capitalize">${r.milestone}</td>
            <td><span class="pct-badge">${r.percent}</span></td>
            <td style="color:#6b7280">${r.note}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
    ${property.eoiAmount ? `<div style="margin-top:12px;font-size:13px;color:#6b7280">EOI Amount: <strong>${currency} ${Number(property.eoiAmount).toLocaleString()}</strong></div>` : ""}
  </div>` : ""}

  ${sections.location ? `
  <div class="divider"></div>
  <!-- LOCATION -->
  <div class="section">
    <div class="section-label">Location & Community</div>
    <div class="section-title">${property.area}, ${property.city}</div>
    <div class="info-block">
      ${aiContent.locationStory.split("\n").filter(Boolean).map(p => `<p>${p}</p>`).join("")}
    </div>
    ${proximityItems.length ? `
    <div class="location-grid">
      ${proximityItems.map(p => `
      <div class="proximity-card">
        <div class="proximity-val">${p.value}</div>
        <div class="proximity-label">${p.label}</div>
      </div>`).join("")}
    </div>` : ""}
  </div>` : ""}

  ${sections.dev ? `
  <div class="divider"></div>
  <!-- DEVELOPER -->
  <div class="section">
    <div class="section-label">Developer Profile</div>
    <div class="section-title">${property.developerName || "About The Developer"}</div>
    <div class="info-block">
      ${aiContent.developerProfile.split("\n").filter(Boolean).map(p => `<p>${p}</p>`).join("")}
    </div>
  </div>` : ""}

  ${sections.prices ? `
  <div class="divider"></div>
  <!-- INVESTMENT -->
  <div class="section">
    <div class="section-label">Investment Analysis</div>
    <div class="section-title">Why Invest Here?</div>
    <div class="info-block">
      ${aiContent.investmentCase.split("\n").filter(Boolean).map(p => `<p>${p}</p>`).join("")}
    </div>
    <!-- UNIT PRICING DETAILS -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px">
      ${property.price_min ? `<div class="stat-card"><div class="stat-val" style="font-size:16px">${currency} ${Number(property.price_min).toLocaleString()}</div><div class="stat-label">Starting From</div></div>` : ""}
      ${property.price_max ? `<div class="stat-card"><div class="stat-val" style="font-size:16px">${currency} ${Number(property.price_max).toLocaleString()}</div><div class="stat-label">Up To</div></div>` : ""}
      ${property.shareCommission ? `<div class="stat-card"><div class="stat-val" style="font-size:16px">${property.shareCommissionPercentage}%</div><div class="stat-label">Co-broker Share</div></div>` : ""}
      ${property.serviceChargeInfo ? `<div class="stat-card"><div class="stat-val" style="font-size:14px">${property.serviceChargeInfo}</div><div class="stat-label">Service Charge</div></div>` : ""}
    </div>
  </div>` : ""}

  ${agentNote ? `
  <div class="divider"></div>
  <div class="section">
    <div class="section-label">Agent Note</div>
    <div class="info-block" style="border-left:4px solid #7F77DD">
      <p>${agentNote}</p>
    </div>
  </div>` : ""}

  <!-- CTA -->
  <div class="cta-block">
    <div class="cta-title">${aiContent.callToAction}</div>
    <p class="cta-sub">This presentation has been prepared exclusively for you by Xoto GRID</p>
    <div class="cta-buttons">
      <button class="cta-btn cta-btn-primary" onclick="window.print()">📄 Download PDF</button>
      <button class="cta-btn cta-btn-secondary">📞 Contact Advisor</button>
    </div>
  </div>

  <!-- COMPLIANCE -->
  <div class="compliance">
    ${property.reraPermitNumber ? `RERA Permit No: ${property.reraPermitNumber} · ` : ""}
    ${property.dldRegistrationNumber ? `DLD Reg: ${property.dldRegistrationNumber} · ` : ""}
    Presented by Xoto GRID · All information is subject to change · Prices in ${currency}<br/>
    Generated on ${new Date().toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" })} · Powered by Xoto GRID AI
  </div>

</div>
</body>
</html>`;

  return { html, aiContent };
}

// ══════════════════════════════════════════════════════════════════════════════
//  MICRO-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════
const StatusTag = ({ status }) => {
  const map = { draft: { color: "default", label: "Draft" }, generated: { color: "success", label: "Generated" }, archived: { color: "warning", label: "Archived" } };
  const s = map[status] || map.draft;
  return <Tag color={s.color}>{s.label}</Tag>;
};

const PipelineTag = ({ status }) => {
  const map = { not_sent: { color: "default", label: "Not Sent" }, sent: { color: "processing", label: "Sent" }, viewed: { color: "success", label: "Viewed" } };
  const s = map[status] || map.not_sent;
  return <Tag color={s.color}>{s.label}</Tag>;
};

function Toggle({ on, onClick }) {
  return (
    <div onClick={onClick} style={{ width: 36, height: 20, borderRadius: 10, background: on ? T.success : "#d1d5db", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: on ? 18 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  );
}

// ── Property Preview Card (shown after fetching) ─────────────────────────────
function PropertyPreviewCard({ property }) {
  if (!property) return null;
  return (
    <div style={{ background: "#f0fdf4", border: "1.5px solid #6ee7b7", borderRadius: 14, padding: 16, marginTop: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <CheckCircleOutlined style={{ color: T.success, fontSize: 16 }} />
        <span style={{ fontWeight: 700, color: "#064e3b", fontSize: 13 }}>Property loaded successfully</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12 }}>
        {[
          ["Name", property.propertyName],
          ["Developer", property.developerName || "N/A"],
          ["Type", `${property.propertySubType} · ${property.unitType || ""}`],
          ["Location", `${property.area}, ${property.city}`],
          ["Price", property.price_min ? `AED ${Number(property.price_min).toLocaleString()}+` : "N/A"],
          ["Beds/Baths", `${property.bedrooms || 0} / ${property.bathrooms || 0}`],
          ["Status", property.projectStatus || "N/A"],
          ["Amenities", `${property.amenities?.length || 0} listed`],
        ].map(([l, v]) => v && v !== "N/A" ? (
          <div key={l} style={{ display: "flex", gap: 4 }}>
            <span style={{ color: "#6b7280", minWidth: 70 }}>{l}:</span>
            <span style={{ fontWeight: 600, color: "#064e3b" }}>{v}</span>
          </div>
        ) : null)}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  WIZARD STEP 1 — Customise + Property Fetch
// ══════════════════════════════════════════════════════════════════════════════
function WizardStep1({ form, setForm, sections, setSections, propertyId, setPropertyId, customNote, setCustomNote, onNext, onCancel, isEditing, fetchedProperty, setFetchedProperty }) {
  const [fetching, setFetching] = useState(false);
  const debounceRef = useRef(null);

  const tones = [
    { key: "luxury",       label: "Luxury",       icon: "👑", desc: "Exclusive & aspirational" },
    { key: "professional", label: "Professional", icon: "💼", desc: "Clear & data-driven" },
    { key: "friendly",     label: "Friendly",     icon: "💬", desc: "Warm & conversational" },
  ];
  const sectionList = [
    { key: "cover",     label: "Cover slide" },
    { key: "desc",      label: "Project description" },
    { key: "gallery",   label: "Photo gallery" },
    { key: "amenities", label: "Amenities & facilities" },
    { key: "dev",       label: "Developer profile" },
    { key: "prices",    label: "Unit prices & investment" },
    { key: "payment",   label: "Payment plans" },
    { key: "location",  label: "Location & community" },
  ];

  const propertyIdInvalid = propertyId.trim() && !isValidObjectId(propertyId);

  // Auto-fetch property when ID becomes valid
  useEffect(() => {
    if (!isValidObjectId(propertyId)) { setFetchedProperty(null); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setFetching(true);
      try {
        const res = await apiFetchProperty(propertyId.trim());
        const prop = res?.data?.data || res?.data;
        setFetchedProperty(prop || null);
        if (prop && !form.title) {
          setForm(f => ({ ...f, title: `${prop.propertyName} — Presentation`, currency: prop.currency || f.currency }));
        }
        if (prop) message.success(`Property "${prop.propertyName}" loaded!`);
      } catch {
        setFetchedProperty(null);
        message.error("Property not found. Check the ID.");
      } finally {
        setFetching(false);
      }
    }, 600);
    return () => clearTimeout(debounceRef.current);
  }, [propertyId]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* LEFT */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card bordered style={{ borderRadius: 14 }} bodyStyle={{ padding: 20 }}>
          <Text strong style={{ fontSize: 13, color: T.text, display: "block", marginBottom: 14 }}>Presentation details</Text>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: T.muted, display: "block", marginBottom: 6 }}>Title <span style={{ color: T.error }}>*</span></label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Luxury Villa for Ahmed Al Mansoori" style={{ borderRadius: 10 }} />
          </div>
          <Row gutter={12}>
            {[
              { label: "Language", key: "language", opts: Object.keys(LANGUAGE_PROMPTS) },
              { label: "Currency", key: "currency", opts: ["AED", "USD", "GBP", "EUR", "SAR", "INR"] },
              { label: "Area unit", key: "areaUnit", opts: [{ v: "sqft", l: "sq ft" }, { v: "sqm", l: "sq m" }] },
            ].map(({ label, key, opts }) => (
              <Col span={8} key={key}>
                <label style={{ fontSize: 11, fontWeight: 600, color: T.muted, display: "block", marginBottom: 6 }}>{label}</label>
                <Select value={form[key]} onChange={v => setForm(f => ({ ...f, [key]: v }))} style={{ width: "100%" }}>
                  {opts.map(o => typeof o === "string"
                    ? <Option key={o} value={o}>{o}</Option>
                    : <Option key={o.v} value={o.v}>{o.l}</Option>
                  )}
                </Select>
              </Col>
            ))}
          </Row>
        </Card>

        <Card bordered style={{ borderRadius: 14 }} bodyStyle={{ padding: 20 }}>
          <Text strong style={{ fontSize: 13, color: T.text, display: "block", marginBottom: 14 }}>Presentation tone</Text>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {tones.map(t => (
              <div key={t.key} onClick={() => setForm(f => ({ ...f, tone: t.key }))} style={{ padding: "12px 14px", borderRadius: 12, cursor: "pointer", border: `1.5px solid ${form.tone === t.key ? T.xotoPurple : "#e5e7eb"}`, background: form.tone === t.key ? "#EEEDFE" : "#fff", transition: "all 0.15s" }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: form.tone === t.key ? "#534AB7" : T.text }}>{t.label}</div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </Card>

        {!isEditing && (
          <Card bordered style={{ borderRadius: 14 }} bodyStyle={{ padding: 20 }}>
            <Text strong style={{ fontSize: 13, color: T.text, display: "block", marginBottom: 14 }}>
              <HomeOutlined style={{ marginRight: 6, color: T.primary }} />Property
            </Text>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.muted, display: "block", marginBottom: 6 }}>
                Property ID <span style={{ fontWeight: 400, color: T.muted }}>(MongoDB ObjectId — auto-fetches)</span>
              </label>
              <Input
                value={propertyId}
                onChange={e => setPropertyId(e.target.value)}
                placeholder="e.g. 69f9979815abe868e65799af"
                style={{ borderRadius: 10, borderColor: propertyIdInvalid ? T.error : undefined }}
                status={propertyIdInvalid ? "error" : ""}
                suffix={fetching ? <LoadingOutlined style={{ color: T.primary }} /> : null}
              />
              {propertyIdInvalid && <div style={{ fontSize: 11, color: T.error, marginTop: 4 }}>Invalid ObjectId — must be 24 hex characters</div>}
              <PropertyPreviewCard property={fetchedProperty} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.muted, display: "block", marginBottom: 6 }}>Agent note (optional — appears in presentation)</label>
              <Input.TextArea value={customNote} onChange={e => setCustomNote(e.target.value)} placeholder="Add a personal note for this client..." style={{ borderRadius: 10 }} rows={3} />
            </div>
          </Card>
        )}
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card bordered style={{ borderRadius: 14 }} bodyStyle={{ padding: 20 }}>
          <Text strong style={{ fontSize: 13, color: T.text, display: "block", marginBottom: 14 }}>
            <EyeOutlined style={{ marginRight: 6, color: T.primary }} />Visible sections
          </Text>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {sectionList.map(s => (
              <div key={s.key} onClick={() => setSections(prev => ({ ...prev, [s.key]: !prev[s.key] }))} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 12, cursor: "pointer", background: sections[s.key] ? "#fff" : "#f9fafb" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: sections[s.key] ? T.text : T.muted }}>{s.label}</span>
                <Toggle on={sections[s.key]} />
              </div>
            ))}
          </div>
        </Card>

        <div style={{ padding: "16px 18px", borderRadius: 14, background: "#EEEDFE", border: "1px solid #AFA9EC" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.xotoPurple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, color: "#fff" }}><RobotOutlined /></div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#3C3489", marginBottom: 4 }}>AI-Powered Generation</div>
              <div style={{ fontSize: 12, color: "#534AB7", lineHeight: 1.7 }}>
                1. Enter a property ID — all details auto-load.<br />
                2. Choose language, tone & sections.<br />
                3. AI writes the full presentation in your chosen language.<br />
                4. Every property field (amenities, payment plans, location, etc.) is included.
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Button onClick={onCancel} style={{ borderRadius: 10 }}>Cancel</Button>
          <Button
            type="primary"
            onClick={onNext}
            disabled={!form.title?.trim() || propertyIdInvalid}
            style={{ flex: 1, background: T.primary, borderColor: T.primary, borderRadius: 10, fontWeight: 700 }}
          >
            {isEditing ? "Save changes" : "Save as draft →"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  WIZARD STEP 2 — AI Generate with progress
// ══════════════════════════════════════════════════════════════════════════════
function WizardStep2({ form, sections, record, onBack, onGenerate, generating, generationProgress, generationStatus, fetchedProperty }) {
  const currency = form.currency || "AED";

  return (
    <div>
      {generating ? (
        <div style={{ textAlign: "center", padding: "60px 40px" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#EEEDFE", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
            <RobotOutlined style={{ color: T.xotoPurple }} />
          </div>
          <Title level={4} style={{ color: T.navyDark, marginBottom: 8 }}>AI is generating your presentation</Title>
          <Text type="secondary" style={{ fontSize: 14 }}>{generationStatus}</Text>
          <div style={{ margin: "24px auto", maxWidth: 400 }}>
            <Progress percent={generationProgress} strokeColor={T.xotoPurple} trailColor="#EEEDFE" showInfo />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            {["Fetching property data", "Calling Claude AI", "Writing in " + form.language, "Building presentation"].map((step, i) => (
              <Tag key={i} color={generationProgress > i * 25 ? "success" : "default"} style={{ fontSize: 11 }}>
                {generationProgress > i * 25 ? "✓" : "○"} {step}
              </Tag>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* LEFT */}
          <div>
            <Text strong style={{ fontSize: 13, color: T.text, display: "block", marginBottom: 14 }}>What will be generated</Text>

            {fetchedProperty && (
              <Alert
                type="success"
                showIcon
                icon={<HomeOutlined />}
                message={<span style={{ fontWeight: 600 }}>{fetchedProperty.propertyName}</span>}
                description={`${fetchedProperty.area}, ${fetchedProperty.city} · ${fetchedProperty.propertySubType} · ${fetchedProperty.amenities?.length || 0} amenities · ${fetchedProperty.paymentPlan?.length || 0} payment plan(s)`}
                style={{ marginBottom: 16, borderRadius: 10 }}
              />
            )}

            <div style={{ display: "grid", gap: 10 }}>
              {[
                { icon: "🤖", title: "AI-written content", desc: `Full narrative in ${form.language} with ${form.tone} tone` },
                { icon: "🏠", title: "All property details", desc: "Price, area, beds, baths, status, completion date" },
                { icon: "✨", title: "Amenities & facilities", desc: `${fetchedProperty?.amenities?.length || 0} amenities + facility highlights` },
                { icon: "💳", title: "Payment plans", desc: `${fetchedProperty?.paymentPlan?.length || 0} plan(s) with full milestone breakdown` },
                { icon: "📍", title: "Location & proximity", desc: "Neighborhood story + proximity to key landmarks" },
                { icon: "👷", title: "Developer profile", desc: `${fetchedProperty?.developerName || "Developer"} — AI-written profile` },
                { icon: "📈", title: "Investment analysis", desc: "ROI case + pricing breakdown" },
                { icon: "🖼️", title: "Photo gallery", desc: `${fetchedProperty ? ([...(fetchedProperty.photos?.architecture||[]),...(fetchedProperty.photos?.interior||[]),...(fetchedProperty.photos?.lobby||[]),...(fetchedProperty.photos?.other||[])]).filter(Boolean).length : 0} photos from property record` },
              ].filter((_, i) => {
                const keys = ["desc","desc","amenities","payment","location","dev","prices","gallery"];
                return sections[keys[i]] !== false;
              }).map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", background: "#f8f7ff", borderRadius: 12, border: "1px solid #eeedfe" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#26215C" }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <Text strong style={{ fontSize: 13, color: T.text, display: "block", marginBottom: 14 }}>Presentation settings</Text>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                ["Language", form.language, <GlobalOutlined />],
                ["Currency", form.currency, <DollarOutlined />],
                ["Tone", form.tone, <StarOutlined />],
                ["Area Unit", form.areaUnit, <EnvironmentOutlined />],
              ].map(([l, v, icon]) => (
                <div key={l} style={{ background: "#F8F7FF", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: T.xotoPurple, fontSize: 16 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 11, color: T.muted }}>{l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#26215C", textTransform: "capitalize" }}>{v}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: "16px 18px", borderRadius: 14, background: "#EEEDFE", border: "1px solid #AFA9EC", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#3C3489", marginBottom: 8 }}>Active sections ({Object.values(sections).filter(Boolean).length}/8)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Object.entries(sections).map(([k, v]) => (
                  <Tag key={k} color={v ? "purple" : "default"} style={{ fontSize: 10 }}>{v ? "✓" : "✗"} {k}</Tag>
                ))}
              </div>
            </div>

            {record?.pdfUrl && (
              <Button block icon={<FilePdfOutlined />} onClick={() => openPdf(record.pdfUrl)} style={{ borderRadius: 10, marginBottom: 10 }}>
                View Previous PDF
              </Button>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <Button icon={<ArrowLeftOutlined />} onClick={onBack} style={{ borderRadius: 10 }}>Back</Button>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={onGenerate}
                style={{ flex: 1, background: T.primary, borderColor: T.primary, borderRadius: 10, fontWeight: 700, height: 44 }}
              >
                🤖 Generate AI Presentation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  WIZARD STEP 3 — Share & Track (unchanged logic)
// ══════════════════════════════════════════════════════════════════════════════
function WizardStep3({ record, sharing, onShareChannel, onClose, onRefresh }) {
  if (!record) return null;

  const handleOpenShareLink = () => {
    if (!record.shareLink) { message.warning("Share link not ready yet"); return; }
    try {
      const win = window.open(record.shareLink, "_blank", "noopener,noreferrer");
      if (!win || win.closed || typeof win.closed === "undefined") {
        message.warning("Popup blocked. Opening in this tab...");
        window.location.href = record.shareLink;
      }
    } catch { message.error("Could not open link"); }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card bordered style={{ borderRadius: 14 }} bodyStyle={{ padding: 20 }}>
          <Text strong style={{ fontSize: 13, color: T.text, display: "block", marginBottom: 14 }}>Tracking link</Text>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 12, background: "#f9fafb", marginBottom: 14 }}>
            <LinkOutlined style={{ color: "#534AB7", flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 11, color: "#534AB7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
              {record.shareLink || "Generating..."}
            </span>
            <Button size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(record.shareLink)} style={{ borderRadius: 8, flexShrink: 0 }}>Copy</Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[
              { channel: "whatsapp", icon: <WhatsAppOutlined />, label: "WhatsApp", sent: record.sharedViaWhatsApp, activeColor: T.success, activeBg: "#f0fdf4" },
              { channel: "email",    icon: <MailOutlined />,      label: "Email",    sent: record.sharedViaEmail,    activeColor: T.info,    activeBg: "#eff6ff" },
            ].map(b => (
              <Button key={b.channel} icon={b.icon} loading={sharing === b.channel}
                onClick={() => { onShareChannel(b.channel); dispatchShareChannel(b.channel, record.shareLink, record.title); }}
                style={{ height: 56, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: b.sent ? b.activeBg : "#fff", borderColor: b.sent ? b.activeColor : "#e5e7eb", color: b.sent ? b.activeColor : T.text, fontWeight: 600, fontSize: 11 }}>
                {b.sent ? "✓ Sent" : b.label}
              </Button>
            ))}
            <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(record.shareLink)} style={{ height: 56, borderRadius: 12, fontSize: 11, fontWeight: 600 }}>Copy link</Button>
          </div>
          <Button block icon={<EyeOutlined />} onClick={handleOpenShareLink} style={{ borderRadius: 10, marginBottom: 8, fontWeight: 600 }}>Open share link (client view)</Button>
          <Alert type="info" showIcon message={<span style={{ fontSize: 11 }}>View count updates automatically when the client opens this link. Click <strong>Refresh stats</strong> to see latest data.</span>} style={{ borderRadius: 8 }} />
        </Card>
        {record.pdfUrl && <Button block icon={<FilePdfOutlined />} onClick={() => openPdf(record.pdfUrl)} style={{ borderRadius: 12, height: 44, fontWeight: 600 }}>View / Download PDF</Button>}
        <Card bordered style={{ borderRadius: 14 }} bodyStyle={{ padding: 20 }}>
          <Text strong style={{ fontSize: 13, color: T.text, display: "block", marginBottom: 12 }}>Client contact</Text>
          <Alert type="info" showIcon={false} message={<span style={{ fontSize: 11 }}>Contact details masked per PRD §10.4.</span>} style={{ borderRadius: 8, marginBottom: 10 }} />
          {[["Name", "A•••• A• M••••••••"], ["Phone", "+971 •• ••• ••••"], ["Email", "a••••@•••••.com"]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>{l}</span>
              <span style={{ fontSize: 12, color: T.text, fontFamily: "monospace" }}>{v}</span>
            </div>
          ))}
        </Card>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card bordered style={{ borderRadius: 14 }} bodyStyle={{ padding: 20 }}>
          <Text strong style={{ fontSize: 13, color: T.text, display: "block", marginBottom: 14 }}>Engagement tracking</Text>
          <Row gutter={12} style={{ marginBottom: 16 }}>
            {[
              { label: "Total opens",      value: record.viewCount || 0,             color: T.text },
              { label: "Engagement score", value: (record.viewCount || 0) * 15,      color: T.xotoPurple },
              { label: "Last viewed",      value: record.lastViewedAt ? new Date(record.lastViewedAt).toLocaleDateString("en-AE") : "—", color: T.text },
            ].map(s => (
              <Col span={8} key={s.label}>
                <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
                </div>
              </Col>
            ))}
          </Row>
          <div style={{ padding: "12px 14px", background: "#f9fafb", borderRadius: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 6 }}>Pipeline status</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <PipelineTag status={record.pipelineStatus || "not_sent"} />
              <span style={{ fontSize: 11, color: T.muted }}>Auto-updates to "Viewed" on first open (+15 pts)</span>
            </div>
          </div>
          {record.viewHistory?.length > 0 ? (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
              {record.viewHistory.slice(0, 5).map((v, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: i < 4 ? "1px solid #f3f4f6" : "none", fontSize: 11 }}>
                  <span style={{ color: T.muted, fontWeight: 600 }}>{new Date(v.viewedAt).toLocaleString("en-AE")}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Tag style={{ fontSize: 10 }}>{v.deviceType}</Tag>
                    <span style={{ color: T.success, fontSize: 10, fontWeight: 700 }}>+15 pts</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0", border: "1.5px dashed #e5e7eb", borderRadius: 12, color: T.muted, fontSize: 12 }}>No opens yet — share the link to start tracking</div>
          )}
        </Card>
        <div style={{ display: "flex", gap: 10 }}>
          <Button onClick={onRefresh} icon={<ReloadOutlined />} style={{ borderRadius: 10 }}>Refresh stats</Button>
          <Button type="primary" onClick={onClose} style={{ flex: 1, background: T.primary, borderColor: T.primary, borderRadius: 10, fontWeight: 700 }}>Done</Button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const AgentPresentations = () => {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [filter, setFilter]               = useState("all");
  const [wizardOpen, setWizardOpen]       = useState(false);
  const [wizardStep, setWizardStep]       = useState(1);
  const [isEditing, setIsEditing]         = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [activeRecord, setActiveRecord]   = useState(null);
  const [form, setForm]                   = useState({ title: "", tone: "professional", language: "English", currency: "AED", areaUnit: "sqft" });
  const [sections, setSections]           = useState({ cover: true, desc: true, gallery: true, amenities: true, dev: true, prices: true, payment: true, location: true });
  const [propertyId, setPropertyId]       = useState("");
  const [customNote, setCustomNote]       = useState("");
  const [fetchedProperty, setFetchedProperty] = useState(null);
  const [saving, setSaving]               = useState(false);
  const [generating, setGenerating]       = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus]     = useState("");
  const [sharing, setSharing]             = useState(null);
  const [detailDrawer, setDetailDrawer]   = useState(null);
  const [archiving, setArchiving]         = useState(null);
  const [wizardDirty, setWizardDirty]     = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const incoming = location.state?.prefill;
    if (incoming && location.state?.autoOpenWizard) {
      setForm({ title: incoming.title || "", tone: incoming.tone || "professional", language: incoming.language || "English", currency: incoming.currency || "AED", areaUnit: incoming.areaUnit || "sqft" });
      setSections({ cover: incoming.sections?.cover ?? true, desc: incoming.sections?.desc ?? true, gallery: incoming.sections?.gallery ?? true, amenities: incoming.sections?.amenities ?? true, dev: incoming.sections?.dev ?? true, prices: incoming.sections?.prices ?? true, payment: incoming.sections?.payment ?? true, location: incoming.sections?.location ?? true });
      setPropertyId(incoming.propertyId || "");
      setCustomNote(incoming.customNote || "");
      setIsEditing(false); setEditingId(null); setActiveRecord(null);
      setWizardStep(1); setWizardOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
      message.info(`Pre-filled from "${incoming.propertyName || "property"}". Review and continue.`);
    }
  }, [location.state]);

  const fetchPresentations = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await apiFetchList(filter);
      const data = res?.data?.data || res?.data || [];
      setPresentations(Array.isArray(data) ? data : []);
    } catch { message.error("Failed to load presentations"); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchPresentations(); }, [fetchPresentations]);

  const resetWizard = () => {
    setForm({ title: "", tone: "professional", language: "English", currency: "AED", areaUnit: "sqft" });
    setSections({ cover: true, desc: true, gallery: true, amenities: true, dev: true, prices: true, payment: true, location: true });
    setPropertyId(""); setCustomNote(""); setFetchedProperty(null);
    setIsEditing(false); setEditingId(null); setActiveRecord(null);
    setWizardStep(1); setWizardDirty(false);
    setGenerating(false); setGenerationProgress(0); setGenerationStatus("");
  };

  const openCreateWizard = () => { resetWizard(); setWizardOpen(true); };

  const loadRecordIntoWizard = (record) => {
    setIsEditing(true); setEditingId(record._id); setActiveRecord(record);
    setForm({ title: record.title || "", tone: record.tone || "professional", language: record.settings?.language || "English", currency: record.settings?.currency || "AED", areaUnit: record.settings?.areaUnit || "sqft" });
    setSections({ cover: !record.settings?.hideSections?.cover, desc: !record.settings?.hideSections?.projectDesc, gallery: !record.settings?.hideSections?.gallery, amenities: !record.settings?.hideSections?.amenities, dev: !record.settings?.hideSections?.developer, prices: !record.settings?.hideSections?.unitPrices, payment: !record.settings?.hideSections?.paymentPlans, location: !record.settings?.hideSections?.location });
    setWizardDirty(false);
  };

  const openEditWizard     = (record) => { loadRecordIntoWizard(record); setWizardStep(1); setWizardOpen(true); };
  const openGenerateWizard = (record) => { loadRecordIntoWizard(record); setWizardStep(2); setWizardOpen(true); };
  const openShareWizard    = (record) => { setActiveRecord(record); setEditingId(record._id); setWizardStep(3); setWizardOpen(true); };

  const handleSaveDraft = async () => {
    if (!form.title?.trim()) { message.warning("Please enter a presentation title"); return; }
    if (propertyId.trim() && !isValidObjectId(propertyId)) { message.error("Invalid Property ID"); return; }
    setSaving(true);
    const payload = buildPayload({ form, sections, propertyId, customNote });
    try {
      let res;
      if (isEditing && editingId) {
        res = await apiUpdate(editingId, payload);
        message.success("Draft updated successfully");
      } else {
        res = await apiCreate(payload);
        message.success("Draft created successfully");
      }
      const saved = res?.data?.data || res?.data || {};
      setActiveRecord(saved); setEditingId(saved._id); setIsEditing(true);
      setWizardDirty(true); setWizardStep(2);
      fetchPresentations();
    } catch (err) { message.error(err?.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  // ── FULL AI GENERATION ────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!editingId) { message.error("No draft to generate"); return; }
    setGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus("Saving latest changes...");

    try {
      // Step 1 — save
      const payload = buildPayload({ form, sections, propertyId, customNote });
      await apiUpdate(editingId, payload);
      setGenerationProgress(15);

      // Step 2 — fetch property
      setGenerationStatus("Fetching full property details...");
      let property = fetchedProperty;
      if (!property && propertyId && isValidObjectId(propertyId)) {
        const pRes = await apiFetchProperty(propertyId.trim());
        property = pRes?.data?.data || pRes?.data;
      }
      setGenerationProgress(35);

      // Step 3 — AI content generation
      setGenerationStatus(`Claude AI is writing content in ${form.language}...`);
      let generatedHtml = null;

      if (property) {
        const result = await generatePresentationWithAI({ property, form, sections, agentNote: customNote });
        generatedHtml = result.html;
        setGenerationProgress(75);
      } else {
        setGenerationProgress(75);
      }

      // Step 4 — call backend generate endpoint (sends to your PDF/share-link generator)
      setGenerationStatus("Finalising PDF & share link...");
      const genPayload = generatedHtml
        ? { ...payload, generatedHtml }
        : payload;

      const res       = await apiGenerate(editingId);
      const generated = res?.data?.data || res?.data || {};
      setGenerationProgress(100);
      setGenerationStatus("Done!");

      // If the backend doesn't store our HTML presentation, open it in a new tab for the agent to preview
      if (generatedHtml && !generated.pdfUrl) {
        const blob = new Blob([generatedHtml], { type: "text/html" });
        const url  = URL.createObjectURL(blob);
        const win  = window.open(url, "_blank", "noopener,noreferrer");
        if (!win) message.info("Preview blocked — your presentation HTML was generated. Share link is ready.");
        else message.success("Presentation preview opened in new tab!");
        // Store html in state for reference
        generated._localHtml = url;
      }

      setActiveRecord({ ...generated, _localHtml: generated._localHtml });
      setWizardDirty(true);
      setGenerating(false);
      message.success("AI Presentation generated! Share link is ready.");
      setWizardStep(3);
      fetchPresentations();
    } catch (err) {
      setGenerating(false);
      message.error(err?.response?.data?.message || "Generation failed. Please try again.");
    }
  };

  const handleShareChannel = async (channel) => {
    if (!activeRecord?._id) return;
    setSharing(channel);
    try {
      await apiShareChannel(activeRecord._id, channel);
      message.success(`Marked as shared via ${channel}`);
      const res = await apiFetchOne(activeRecord._id);
      setActiveRecord(res?.data?.data || res?.data || activeRecord);
      setWizardDirty(true);
      fetchPresentations();
    } catch (err) { message.error(err?.response?.data?.message || "Share failed"); }
    finally { setSharing(null); }
  };

  const refreshActiveRecord = async () => {
    if (!activeRecord?._id) return;
    try {
      const res = await apiFetchOne(activeRecord._id);
      setActiveRecord(res?.data?.data || res?.data || activeRecord);
      message.success("Stats refreshed");
    } catch { message.error("Failed to refresh"); }
  };

  const handleArchive = async (id) => {
    setArchiving(id);
    try {
      await apiArchive(id);
      message.success("Presentation archived");
      if (detailDrawer?._id === id) setDetailDrawer(null);
      fetchPresentations();
    } catch (err) { message.error(err?.response?.data?.message || "Archive failed"); }
    finally { setArchiving(null); }
  };

  const closeWizard = () => {
    setWizardOpen(false);
    if (wizardDirty) fetchPresentations();
    resetWizard();
  };

  const openDetailDrawer = async (record) => {
    setDetailDrawer(record);
    try {
      const res = await apiFetchOne(record._id);
      const fresh = res?.data?.data || res?.data;
      if (fresh) setDetailDrawer(fresh);
    } catch {}
  };

  const counts = {
    all:       presentations.length,
    draft:     presentations.filter(p => p.status === "draft").length,
    generated: presentations.filter(p => p.status === "generated").length,
    archived:  presentations.filter(p => p.status === "archived").length,
  };

  const columns = [
    {
      title: "Presentation", dataIndex: "title", key: "title",
      render: (text, record) => (
        <div>
          <Text strong style={{ color: T.text }}>{text}</Text>
          <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
            {record.settings?.language && <Tag style={{ fontSize: 10, margin: 0 }}><GlobalOutlined style={{ marginRight: 3 }} />{record.settings.language}</Tag>}
            {record.settings?.currency && <Tag style={{ fontSize: 10, margin: 0 }}>{record.settings.currency}</Tag>}
            {record.tone && <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>{record.tone}</Tag>}
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
            {new Date(record.createdAt).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>
      ),
    },
    {
      title: "Status", key: "status", width: 160,
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <StatusTag status={record.status} />
          {record.status === "generated" && <PipelineTag status={record.pipelineStatus} />}
        </Space>
      ),
    },
    { title: "Properties", key: "props", width: 90, align: "center", render: (_, record) => <Tag color="blue">{record.properties?.length || 0}</Tag> },
    {
      title: "Engagement", key: "engagement", width: 130,
      render: (_, record) => record.status === "generated" ? (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: 12 }}><EyeOutlined style={{ marginRight: 4, color: T.primary }} />{record.viewCount || 0} views</Text>
          {record.sharedViaWhatsApp && <Text style={{ fontSize: 11, color: T.success }}><WhatsAppOutlined style={{ marginRight: 4 }} />WhatsApp</Text>}
          {record.sharedViaEmail    && <Text style={{ fontSize: 11, color: T.info }}><MailOutlined style={{ marginRight: 4 }} />Email</Text>}
        </Space>
      ) : <Text style={{ fontSize: 12, color: T.muted }}>—</Text>,
    },
    {
      title: "Actions", key: "actions", width: 260,
      render: (_, record) => (
        <Space size="small" wrap>
          <Tooltip title="View details"><Button size="small" icon={<EyeOutlined />} onClick={() => openDetailDrawer(record)} /></Tooltip>
          {record.status === "draft" && <Tooltip title="Edit draft"><Button size="small" icon={<EditOutlined />} onClick={() => openEditWizard(record)} /></Tooltip>}
          {record.status === "draft" && (
            <Tooltip title="AI Generate">
              <Button size="small" type="primary" icon={<ThunderboltOutlined />} onClick={() => openGenerateWizard(record)} style={{ background: T.primary, borderColor: T.primary }} />
            </Tooltip>
          )}
          {record.status === "generated" && (
            <Tooltip title="Share & track">
              <Button size="small" type="primary" icon={<ShareAltOutlined />} onClick={() => openShareWizard(record)} style={{ background: T.success, borderColor: T.success }} />
            </Tooltip>
          )}
          {record.pdfUrl && <Tooltip title="View PDF"><Button size="small" icon={<FilePdfOutlined />} onClick={() => openPdf(record.pdfUrl)} /></Tooltip>}
          {record.status !== "archived" && (
            <Popconfirm title="Archive this presentation?" description="It will move to the Archived tab." onConfirm={() => handleArchive(record._id)} okText="Archive" cancelText="Cancel" okButtonProps={{ danger: true }}>
              <Tooltip title="Archive"><Button size="small" danger icon={<DeleteOutlined />} loading={archiving === record._id} /></Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const wizardTitle = () => {
    if (wizardStep === 3) return <><ShareAltOutlined style={{ marginRight: 8, color: T.success }} />Share & Track</>;
    if (isEditing && wizardStep === 1) return <><EditOutlined style={{ marginRight: 8, color: T.primary }} />Edit Draft</>;
    if (wizardStep === 2) return <><RobotOutlined style={{ marginRight: 8, color: T.primary }} />AI Generate</>;
    return <><PlusOutlined style={{ marginRight: 8, color: T.primary }} />New Presentation</>;
  };

  const WizardStepBar = () => (
    <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", margin: "0 -24px 20px", padding: "0 24px" }}>
      {[{ n: 1, label: "Customise" }, { n: 2, label: "AI Generate" }, { n: 3, label: "Share & Track" }].map((s, i, arr) => {
        const state = s.n === wizardStep ? "active" : s.n < wizardStep ? "done" : "idle";
        return (
          <div key={s.n} style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderBottom: state === "active" ? `2px solid ${T.primary}` : "2px solid transparent" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: state === "active" ? T.primary : state === "done" ? T.success : "#e5e7eb", color: state === "idle" ? T.muted : "#fff" }}>
              {state === "done" ? "✓" : s.n}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: state === "active" ? T.primary : state === "done" ? T.success : T.muted }}>{s.label}</span>
            {i < arr.length - 1 && <div style={{ flex: 1, height: 1, background: "#e5e7eb", marginLeft: 4 }} />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ padding: 24, background: T.bg, minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: T.text }}>
            <ThunderboltOutlined style={{ color: T.primary, marginRight: 8 }} />AI Presentations
          </Title>
          <Text type="secondary">Create, generate and share property presentations in any language</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateWizard} style={{ background: T.primary, borderColor: T.primary, borderRadius: 10, fontWeight: 700 }}>
          New Presentation
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: "Total",     value: counts.all,       color: T.primary, icon: <BarChartOutlined /> },
          { label: "Drafts",    value: counts.draft,     color: T.warning, icon: <EditOutlined /> },
          { label: "Generated", value: counts.generated, color: T.success, icon: <CheckCircleOutlined /> },
          { label: "Archived",  value: counts.archived,  color: T.muted,   icon: <ClockCircleOutlined /> },
        ].map(s => (
          <Col xs={12} sm={6} key={s.label}>
            <Card bordered={false} style={{ borderRadius: 12, borderLeft: `4px solid ${s.color}` }} bodyStyle={{ padding: "16px 20px" }}>
              <Statistic title={<Text style={{ fontSize: 12, color: T.muted }}>{s.label}</Text>} value={s.value} valueStyle={{ color: s.color, fontSize: 28, fontWeight: 700 }} prefix={React.cloneElement(s.icon, { style: { fontSize: 18, marginRight: 4 } })} />
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          {[{ key: "all", label: `All (${counts.all})` }, { key: "draft", label: `Drafts (${counts.draft})` }, { key: "generated", label: `Generated (${counts.generated})` }, { key: "archived", label: `Archived (${counts.archived})` }].map(f => (
            <Button key={f.key} type={filter === f.key ? "primary" : "default"} onClick={() => setFilter(f.key)} style={{ background: filter === f.key ? T.primary : "white", borderColor: filter === f.key ? T.primary : T.border, color: filter === f.key ? "white" : T.text, borderRadius: 20, fontWeight: filter === f.key ? 700 : 400 }}>
              {f.label}
            </Button>
          ))}
        </Space>
      </div>

      <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ borderRadius: 14, overflow: "hidden" }}>
        <Table columns={columns} dataSource={presentations} rowKey="_id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{ emptyText: (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <ThunderboltOutlined style={{ fontSize: 40, color: T.muted, marginBottom: 12 }} />
              <div style={{ color: T.muted, marginBottom: 12 }}>No presentations yet</div>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateWizard} style={{ background: T.primary, borderColor: T.primary }}>Create First Presentation</Button>
            </div>
          )}}
        />
      </Card>

      <Modal open={wizardOpen} onCancel={closeWizard} title={wizardTitle()} footer={null} width="90vw" style={{ maxWidth: 1200, top: 40 }} centered={false} destroyOnClose>
        <WizardStepBar />
        {wizardStep === 1 && (
          <WizardStep1
            form={form} setForm={setForm} sections={sections} setSections={setSections}
            propertyId={propertyId} setPropertyId={setPropertyId}
            customNote={customNote} setCustomNote={setCustomNote}
            isEditing={isEditing} onNext={handleSaveDraft} onCancel={closeWizard}
            fetchedProperty={fetchedProperty} setFetchedProperty={setFetchedProperty}
          />
        )}
        {wizardStep === 2 && (
          <WizardStep2
            form={form} sections={sections} record={activeRecord}
            generating={generating} generationProgress={generationProgress} generationStatus={generationStatus}
            onGenerate={handleGenerate} onBack={() => setWizardStep(1)}
            fetchedProperty={fetchedProperty}
          />
        )}
        {wizardStep === 3 && (
          <WizardStep3 record={activeRecord} sharing={sharing} onShareChannel={handleShareChannel} onClose={closeWizard} onRefresh={refreshActiveRecord} />
        )}
        {saving && (
          <div style={{ textAlign: "center", padding: "10px 0 0" }}>
            <Spin size="small" /><Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>Saving draft...</Text>
          </div>
        )}
      </Modal>

      <Drawer open={!!detailDrawer} onClose={() => setDetailDrawer(null)} width={420} title={<span><ExperimentOutlined style={{ marginRight: 8, color: T.primary }} />Presentation Details</span>}>
        {detailDrawer && (
          <div>
            <Space style={{ marginBottom: 12 }}>
              <StatusTag status={detailDrawer.status} />
              {detailDrawer.status === "generated" && <PipelineTag status={detailDrawer.pipelineStatus} />}
            </Space>
            <Title level={4} style={{ marginTop: 8, marginBottom: 4 }}>{detailDrawer.title}</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Created {new Date(detailDrawer.createdAt).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}</Text>
            <Divider />
            <Title level={5} style={{ marginBottom: 12 }}><SettingOutlined style={{ marginRight: 6, color: T.primary }} />Settings</Title>
            {[["Language", detailDrawer.settings?.language || "English"], ["Currency", detailDrawer.settings?.currency || "AED"], ["Area Unit", detailDrawer.settings?.areaUnit || "sqft"], ["Tone", detailDrawer.tone || "professional"]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                <Text type="secondary" style={{ fontSize: 13 }}>{l}</Text><Text strong style={{ fontSize: 13 }}>{v}</Text>
              </div>
            ))}
            {detailDrawer.status === "generated" && (
              <>
                <Divider />
                <Title level={5} style={{ marginBottom: 12 }}><BarChartOutlined style={{ marginRight: 6, color: T.primary }} />Engagement</Title>
                {[["Total Views", detailDrawer.viewCount || 0], ["Last Viewed", detailDrawer.lastViewedAt ? new Date(detailDrawer.lastViewedAt).toLocaleString("en-AE") : "Never"], ["WhatsApp", detailDrawer.sharedViaWhatsApp ? "Sent ✓" : "Not sent"], ["Email", detailDrawer.sharedViaEmail ? "Sent ✓" : "Not sent"]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>{l}</Text><Text strong style={{ fontSize: 13 }}>{v}</Text>
                  </div>
                ))}
              </>
            )}
            <Divider />
            <Title level={5} style={{ marginBottom: 12 }}>Properties ({detailDrawer.properties?.length || 0})</Title>
            {detailDrawer.properties?.length > 0 ? detailDrawer.properties.map((p, i) => (
              <div key={i} style={{ padding: "10px 12px", background: T.bg, borderRadius: 8, marginBottom: 8, border: `1px solid ${T.border}` }}>
                <Text strong>{p.property?.propertyName || p.property || "Property"}</Text>
                {p.customNote && <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>Note: {p.customNote}</div>}
              </div>
            )) : <Text type="secondary">No properties added</Text>}
            {detailDrawer.shareLink && (
              <>
                <Divider />
                <Text strong style={{ display: "block", marginBottom: 8 }}>Share Link</Text>
                <div style={{ display: "flex" }}>
                  <Input value={detailDrawer.shareLink} readOnly style={{ borderRadius: "8px 0 0 8px", fontSize: 12, color: T.primary }} />
                  <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(detailDrawer.shareLink)} style={{ borderRadius: "0 8px 8px 0" }} />
                </div>
              </>
            )}
            {detailDrawer.pdfUrl && <Button block icon={<FilePdfOutlined />} onClick={() => openPdf(detailDrawer.pdfUrl)} style={{ marginTop: 16, borderRadius: 8 }}>View PDF</Button>}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              {detailDrawer.status === "draft" && <Button block type="primary" icon={<EditOutlined />} onClick={() => { setDetailDrawer(null); openEditWizard(detailDrawer); }} style={{ background: T.primary, borderColor: T.primary, borderRadius: 8 }}>Edit Draft</Button>}
              {detailDrawer.status === "generated" && <Button block type="primary" icon={<ShareAltOutlined />} onClick={() => { setDetailDrawer(null); openShareWizard(detailDrawer); }} style={{ background: T.success, borderColor: T.success, borderRadius: 8 }}>Share & Track</Button>}
              {detailDrawer.status !== "archived" && (
                <Popconfirm title="Archive this presentation?" onConfirm={() => handleArchive(detailDrawer._id)} okText="Archive" cancelText="Cancel" okButtonProps={{ danger: true }}>
                  <Button block danger icon={<DeleteOutlined />} loading={archiving === detailDrawer._id} style={{ borderRadius: 8 }}>Archive</Button>
                </Popconfirm>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AgentPresentations;