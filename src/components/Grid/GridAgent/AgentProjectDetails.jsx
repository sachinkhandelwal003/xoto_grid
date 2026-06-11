import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row, Col, Typography, Button, Spin, message,
  Divider, Popover, Modal, Image, Card, Empty, Tag, Progress
} from "antd";
import {
  EnvironmentOutlined, PictureOutlined, FilePdfOutlined,
  WalletOutlined, BankOutlined, ArrowLeftOutlined, MoneyCollectOutlined,
  CheckCircleOutlined, ThunderboltOutlined, UserOutlined, QrcodeOutlined,
  SafetyCertificateOutlined, BuildOutlined, HomeOutlined, ApartmentOutlined,
  ToolOutlined, CarOutlined, ScheduleOutlined, AppstoreOutlined,
  PaperClipOutlined, StarOutlined, InfoCircleOutlined,
} from "@ant-design/icons";
import { FiMapPin, FiLayers, FiFileText, FiUsers, FiGlobe, FiDownload } from "react-icons/fi";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Paragraph } = Typography;

const PRIMARY = '#5c039b';
const PRIMARY2 = '#7c3aed';
const GR = `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY2} 100%)`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getAllPhotos = (property) => {
  const photos = [];
  if (property?.media) {
    ['architectureImages', 'interiorImages', 'lobbyImages', 'otherImages'].forEach(key => {
      if (Array.isArray(property.media[key])) photos.push(...property.media[key].filter(Boolean));
    });
  }
  if (property?.photos) {
    if (Array.isArray(property.photos)) photos.push(...property.photos);
    else if (typeof property.photos === 'object') {
      Object.values(property.photos).forEach(cat => { if (Array.isArray(cat)) photos.push(...cat); });
    }
  }
  if (property?.mainLogo && !photos.includes(property.mainLogo)) photos.unshift(property.mainLogo);
  if (property?.media?.mainLogo && !photos.includes(property.media?.mainLogo)) photos.unshift(property.media.mainLogo);
  if (photos.length === 0) photos.push("https://xotostaging.s3.me-central-1.amazonaws.com/properties/1773392643245-15.jpg");
  return [...new Set(photos)];
};

const fmt = (n) => (Number(n) || 0).toLocaleString();

const CATEGORY_LABELS = {
  brochure: 'Brochure', floor_plan: 'Floor Plan', payment_plan: 'Payment Plan',
  noc: 'NOC', title_deed_template: 'Title Deed Template', developer_profile: 'Developer Profile', other: 'Other',
};

const CAT_COLORS = {
  brochure: '#6d28d9', floor_plan: '#0369a1', payment_plan: '#166534',
  noc: '#b45309', title_deed_template: '#991b1b', developer_profile: '#7e22ce', other: '#475569',
};

// ─── Safe label extractor (handles string OR object amenity/facility items) ──
const getLabel = (item) => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return item.title || item.name || item.label || item.amenity || '';
};

// ─── Section Title ────────────────────────────────────────────────────────────
const SectionTitle = ({ children, icon: Icon }) => (
  <div className="flex items-center gap-3 mb-6">
    {Icon && <div className="w-9 h-9 rounded-xl flex items-center justify-center text-purple-600 bg-purple-50"><Icon /></div>}
    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight m-0">{children}</h2>
  </div>
);

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    {Icon && <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0 mt-0.5"><Icon style={{ fontSize: 14 }} /></div>}
    <div className="flex-1">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider m-0">{label}</p>
      <p className="text-sm font-bold text-gray-800 m-0 mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgentProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [inventoryCounts, setInventoryCounts] = useState({ total: 0, available: 0, reserved: 0, booked: 0, sold: 0 });
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoTab, setPhotoTab]   = useState('all');
  const [allPhotos, setAllPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchPropertyDetails();
    fetchDocuments();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const res = await apiService.get(`/properties/${id}`);
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setProperty(data);
        setAllPhotos(getAllPhotos(data));
        if (data.propertySubType === "off_plan") await fetchInventoryUnits(data._id || id);
      } else {
        message.error("Failed to load property details");
      }
    } catch {
      message.error("API error while fetching property");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await apiService.get(`/property-documents/${id}`);
      setDocuments(res?.data?.data || res?.data || []);
    } catch (err) {
      console.error("Documents Error:", err);
    }
  };

  const fetchInventoryUnits = async (propertyId) => {
    try {
      const res = await apiService.get(`properties/inventory?propertyId=${propertyId}`);
      const data = Array.isArray(res?.data?.data || res?.data || res) ? (res?.data?.data || res?.data || res) : [];
      setInventoryCounts({
        total: data.length,
        available: data.filter(u => u.status === "available").length,
        reserved:  data.filter(u => u.status === "reserved").length,
        booked:    data.filter(u => u.status === "booked").length,
        sold:      data.filter(u => u.status === "sold").length,
      });
    } catch { /* silent */ }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50"><Spin size="large" /></div>
  );
  if (!property) return (
    <div className="p-10 text-center bg-slate-50 h-screen">
      <Title level={4}>Project not found!</Title>
      <Button type="primary" onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  // ── Derived values ──────────────────────────────────────────────────────────
  const projectName  = property.projectName || property.propertyName || "Project";
  const developerName = property?.developer?.name || property?.developerDetails?.name || property?.developerName || "Premium Developer";
  const developerLogo = property?.developer?.logo || property?.developerDetails?.logo;
  const developerDesc = property?.developerDetails?.description || property?.developer?.description || "";
  const fullAddress  = [property.locality || property.area, property.city || "Dubai", property.country || "UAE"].filter(Boolean).join(", ");

  const priceMin = property.priceRange?.min || property.price || property.price_min || 0;
  const priceMax = property.priceRange?.max || property.price_max || 0;
  const currency = property.priceRange?.currency || property.currency || "AED";
  const priceDisplay = priceMax && priceMax !== priceMin
    ? `${currency} ${fmt(priceMin)} – ${fmt(priceMax)}`
    : `${currency} ${fmt(priceMin)}`;

  const completionDisplay = property.completionDate?.quarter && property.completionDate?.year
    ? `${property.completionDate.quarter} ${property.completionDate.year}`
    : null;

  const constructionPct = Number(property.constructionProgress) || 0;

  const getPaymentPlan = () => {
    if (property.paymentPlan?.length > 0 && property.paymentPlan[0].stages?.length > 0) {
      return property.paymentPlan[0].stages.filter(Boolean).map(s =>
        `${s.percentage ?? 0}% ${(s.milestoneTitle || s.title || s.stage || '').replace(/_/g, ' ')}`.trim()
      ).join(' • ');
    }
    if (property.paymentPlan_initialPercentage && property.paymentPlan_laterPercentage)
      return `${property.paymentPlan_initialPercentage}/${property.paymentPlan_laterPercentage}%`;
    return null;
  };

  const getCommissionText = () => {
    if (property.shareCommission && property.shareCommissionPercentage) return `${property.shareCommissionPercentage}% Shared Commission`;
    if (property.commission) return `${property.commission}%`;
    if (property.commissionType) {
      return property.commissionType === "percentage"
        ? `${property.commissionValue || 0}%`
        : `${currency} ${fmt(property.commissionValue || 0)}`;
    }
    return null;
  };

  const getStatusTag = () => {
    if (property.propertySubType === "off_plan") return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">🏗️ Off-Plan</span>;
    if (property.approvalStatus === "approved" && property.listingStatus === "active") return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">✓ Active Listing</span>;
    return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">Draft</span>;
  };

  const amenitiesList = property?.amenities?.length > 0 ? property.amenities : [];
  const facilitiesList = property?.facilities?.length > 0 ? property.facilities : [];
  // Normalize to strings, remove empty/duplicates
  const displayFeatures = [...new Set(
    [...amenitiesList, ...facilitiesList].map(getLabel).filter(Boolean)
  )];

  const lat = property?.location?.latitude;
  const lng = property?.location?.longitude;
  const mapQuery = (lat && lng) ? `${lat},${lng}` : encodeURIComponent(`${projectName} ${fullAddress}`);
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&t=m&z=15&ie=UTF8&iwloc=&output=embed`;

  // Media categories for gallery
  const mediaCategories = {
    all: getAllPhotos(property),
    architecture: (property.media?.architectureImages || []).filter(Boolean),
    interior: (property.media?.interiorImages || []).filter(Boolean),
    lobby: (property.media?.lobbyImages || []).filter(Boolean),
  };
  const galleryPhotos = mediaCategories[photoTab]?.length > 0 ? mediaCategories[photoTab] : mediaCategories.all;

  // Payment plan stages
  const paymentStages = property.paymentPlan?.[0]?.stages?.filter(Boolean) || [];

  // ── DLD QR Popover (keep as-is per user request) ──────────────────────────
  const qrContent = (
    <div className="p-2 text-center w-48">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Dubai REST Verification</div>
      {property.qrCode ? (
        <div className="border border-slate-100 p-2 rounded-xl bg-slate-50 shadow-inner">
          <img src={property.qrCode} alt="DLD QR Code" className="w-full h-auto object-contain rounded-lg mix-blend-multiply" />
        </div>
      ) : (
        <div className="text-xs text-orange-500 font-semibold py-4 bg-orange-50 rounded-xl border border-orange-100">QR Code Unavailable</div>
      )}
      <div className="text-[10px] font-medium text-slate-500 mt-2 leading-tight">Scan using Dubai REST app to verify authenticity.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 pb-20">

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm px-8 py-4 mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeftOutlined /> Back to Catalogue
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Row gutter={[40, 40]}>

          {/* ══════════════ LEFT COLUMN ══════════════ */}
          <Col xs={24} lg={16}>

            {/* ── Hero ── */}
            <div className="relative h-[480px] rounded-3xl overflow-hidden shadow-lg border border-gray-200 mb-10 group bg-slate-100">
              <img src={allPhotos[0]} alt={projectName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />

              {/* Top badges */}
              <div className="absolute top-6 left-6 flex gap-3 flex-wrap">
                {getStatusTag()}
                {completionDisplay && (
                  <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Handover: {completionDisplay}
                  </span>
                )}
                {/* ── Trakheesi Compliance Badge (kept per user request) ── */}
                {property.trakheesiPermitId && (
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-emerald-400">
                    <SafetyCertificateOutlined /> Trakheesi: {property.trakheesiPermitId}
                  </span>
                )}
              </div>

              {/* Bottom left buttons */}
              <div className="absolute bottom-6 left-6 flex gap-3">
                <button onClick={() => setIsPhotoModalOpen(true)} className="bg-white/90 backdrop-blur-md hover:bg-white text-gray-900 text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2">
                  <PictureOutlined /> {allPhotos.length} Photos
                </button>
                {property.brochure && (
                  <a href={property.brochure} target="_blank" rel="noreferrer" className="bg-black/60 backdrop-blur-md hover:bg-black/80 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 border border-white/20">
                    <FilePdfOutlined /> Brochure
                  </a>
                )}
              </div>

              {/* ── DLD QR Hover Verification (kept per user request) ── */}
              <div className="absolute bottom-6 right-6">
                <Popover content={qrContent} placement="topRight" trigger="hover" overlayInnerStyle={{ borderRadius: '16px' }}>
                  <button className="bg-white text-[#5c039b] hover:bg-purple-50 text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 border border-white/20 hover:scale-105">
                    <QrcodeOutlined className="text-lg" /> Verify Listing
                  </button>
                </Popover>
              </div>
            </div>

            {/* ── Project Overview ── */}
            <div className="mb-10">
              <SectionTitle icon={InfoCircleOutlined}>Project Overview</SectionTitle>
              <Paragraph className="text-[15px] leading-relaxed text-gray-600 font-medium whitespace-pre-wrap">
                {property.description || property.overview || "Detailed description for this property is not available yet."}
              </Paragraph>
            </div>

            <Divider className="my-8 border-gray-100" />

            {/* ── Property Details ── */}
            <div className="mb-10">
              <SectionTitle icon={HomeOutlined}>Property Details</SectionTitle>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  <InfoRow label="Property Type" value={property.propertyType} icon={AppstoreOutlined} />
                  <InfoRow label="Sub Type" value={property.propertySubType?.replace('_', ' ')?.toUpperCase()} icon={BuildOutlined} />
                  <InfoRow label="Locality" value={property.locality || property.area} icon={EnvironmentOutlined} />
                  {completionDisplay && <InfoRow label="Completion Date" value={completionDisplay} icon={ScheduleOutlined} />}
                  {property.numberOfFloors && <InfoRow label="Number of Floors" value={property.numberOfFloors} icon={ApartmentOutlined} />}
                  {property.furnishingStatus && <InfoRow label="Furnishing Status" value={property.furnishingStatus} icon={HomeOutlined} />}
                  {property.parkingAllocation && <InfoRow label="Parking" value={property.parkingAllocation} icon={CarOutlined} />}
                  {property.serviceCharge && <InfoRow label="Service Charge" value={`AED ${fmt(property.serviceCharge)} / sqft / year`} icon={ToolOutlined} />}
                </div>
              </div>
            </div>

            {/* ── Construction Progress ── */}
            {property.propertySubType === "off_plan" && constructionPct > 0 && (
              <>
                <Divider className="my-8 border-gray-100" />
                <div className="mb-10">
                  <SectionTitle icon={BuildOutlined}>Construction Progress</SectionTitle>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-gray-700">Overall Completion</span>
                      <span className="text-lg font-black" style={{ color: PRIMARY }}>{constructionPct}%</span>
                    </div>
                    <Progress
                      percent={constructionPct}
                      strokeColor={{ from: PRIMARY, to: PRIMARY2 }}
                      trailColor="#f1f5f9"
                      strokeWidth={12}
                      showInfo={false}
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-400 font-semibold">Foundation</span>
                      <span className="text-xs text-gray-400 font-semibold">Handover</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Divider className="my-8 border-gray-100" />

            {/* ── Inventory Availability ── */}
            {property.propertySubType === "off_plan" && (
              <div className="mb-10">
                <SectionTitle icon={ApartmentOutlined}>Inventory Availability</SectionTitle>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  {[
                    { label: "Total",     value: inventoryCounts.total,     bg: "bg-gray-50",    border: "border-gray-200",    text: "text-gray-900" },
                    { label: "Available", value: inventoryCounts.available, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
                    { label: "Reserved",  value: inventoryCounts.reserved,  bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700" },
                    { label: "Booked",    value: inventoryCounts.booked,    bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700" },
                    { label: "Sold",      value: inventoryCounts.sold,      bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700" },
                  ].map(({ label, value, bg, border, text }) => (
                    <div key={label} className={`${bg} border ${border} rounded-2xl p-4 text-center`}>
                      <div className={`text-2xl font-black ${text}`}>{value}</div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Buildings breakdown */}
                {property.buildings?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mt-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Buildings / Towers</p>
                    <div className="flex flex-wrap gap-2">
                      {property.buildings.map((b, i) => {
                        const bName = typeof b === 'string' ? b : (b?.name || b?.title || `Tower ${i + 1}`);
                        const bUnits = typeof b === 'object' ? b?.units || b?.totalUnits : null;
                        return (
                          <div key={i} className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-2 text-sm font-bold text-purple-800">
                            {bName} {bUnits ? <span className="text-purple-500 font-medium ml-1">({bUnits} units)</span> : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Payment Plan ── */}
            {(paymentStages.length > 0 || getPaymentPlan()) && (
              <>
                <Divider className="my-8 border-gray-100" />
                <div className="mb-10">
                  <SectionTitle icon={WalletOutlined}>Payment Plan</SectionTitle>
                  {paymentStages.length > 0 ? (
                    <div className="space-y-3">
                      {paymentStages.map((stage, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0" style={{ background: GR }}>
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-800 m-0 capitalize">
                              {stage.milestoneTitle || stage.title || (typeof stage.stage === 'string' ? stage.stage : getLabel(stage.stage)) || `Stage ${paymentStages.indexOf(stage) + 1}`}
                            </p>
                            {stage.description && typeof stage.description === 'string' && (
                              <p className="text-xs text-gray-500 m-0 mt-0.5">{stage.description}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xl font-black" style={{ color: PRIMARY }}>{stage.percentage ?? 0}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <p className="text-gray-700 font-semibold m-0">{getPaymentPlan()}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            <Divider className="my-8 border-gray-100" />

            {/* ── Amenities & Facilities ── */}
            {displayFeatures.length > 0 && (
              <div className="mb-10">
                <SectionTitle icon={StarOutlined}>Amenities & Facilities</SectionTitle>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {displayFeatures.map((item, i) => (
                    <div key={i} className="bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                        <CheckCircleOutlined />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Floor Plans ── */}
            {property.floorPlans?.length > 0 && (
              <>
                <Divider className="my-8 border-gray-100" />
                <div className="mb-10">
                  <SectionTitle icon={AppstoreOutlined}>Floor Plans</SectionTitle>
                  <Image.PreviewGroup>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {property.floorPlans.map((fp, i) => (
                        <div key={i} className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 h-48 cursor-zoom-in">
                          <Image
                            src={fp?.imageUrl || fp?.url || fp}
                            alt={fp?.label || `Floor Plan ${i + 1}`}
                            className="w-full h-full object-contain"
                            style={{ height: 192, objectFit: 'contain' }}
                            fallback="https://placehold.co/400x300?text=Floor+Plan"
                          />
                          {fp?.label && (
                            <div className="px-3 py-2 bg-white border-t border-gray-100">
                              <p className="text-xs font-bold text-gray-700 m-0">{fp.label}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Image.PreviewGroup>
                </div>
              </>
            )}

            {/* ── Developer Details ── */}
            {(developerName || developerDesc) && (
              <>
                <Divider className="my-8 border-gray-100" />
                <div className="mb-10">
                  <SectionTitle icon={BankOutlined}>Developer Details</SectionTitle>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {developerLogo ? (
                        <img src={developerLogo} alt={developerName} className="w-16 h-16 rounded-2xl object-contain border border-gray-100 p-1 bg-gray-50" />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black" style={{ background: GR }}>
                          {developerName?.[0] || 'D'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-extrabold text-gray-900 m-0">{developerName}</h3>
                        {property?.developerDetails?.established && (
                          <p className="text-xs text-gray-500 font-semibold m-0 mt-1">Est. {property.developerDetails.established}</p>
                        )}
                      </div>
                    </div>
                    {developerDesc && <p className="text-sm text-gray-600 leading-relaxed m-0">{developerDesc}</p>}
                    {property?.developerDetails?.experience && (
                      <div className="mt-4 flex gap-6">
                        <div className="text-center">
                          <p className="text-xl font-black m-0" style={{ color: PRIMARY }}>{property.developerDetails.experience}</p>
                          <p className="text-xs text-gray-500 font-semibold m-0">Years Experience</p>
                        </div>
                        {property?.developerDetails?.projectsDelivered && (
                          <div className="text-center">
                            <p className="text-xl font-black m-0" style={{ color: PRIMARY }}>{property.developerDetails.projectsDelivered}</p>
                            <p className="text-xs text-gray-500 font-semibold m-0">Projects Delivered</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Divider className="my-8 border-gray-100" />

            {/* ── Document Library ── */}
            <div className="mb-10">
              <SectionTitle icon={FilePdfOutlined}>Document Library</SectionTitle>
              {documents.length === 0 ? (
                <Empty description="No documents available for this property" />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div key={doc._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f3e8ff' }}>
                        {doc.fileType === 'image'
                          ? <PictureOutlined style={{ fontSize: 22, color: PRIMARY }} />
                          : <FilePdfOutlined style={{ fontSize: 22, color: '#dc2626' }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 m-0 truncate">{doc.title}</p>
                        <span style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 12,
                          background: '#f3e8ff', color: CAT_COLORS[doc.documentCategory] || '#475569',
                          fontWeight: 600, display: 'inline-block', marginTop: 4,
                        }}>
                          {CATEGORY_LABELS[doc.documentCategory] || doc.documentCategory}
                        </span>
                        <div className="flex gap-2 mt-1">
                          {doc.isAgentVisible && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Agent</span>
                          )}
                          {doc.isPublic && (
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Public</span>
                          )}
                        </div>
                      </div>
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:text-purple-700 hover:border-purple-200 transition-colors flex-shrink-0"
                      >
                        <FiDownload size={15} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Divider className="my-8 border-gray-100" />

            {/* ── Location Map ── */}
            <div className="mb-4">
              <SectionTitle icon={EnvironmentOutlined}>Location</SectionTitle>
              <div className="flex items-center gap-2 mb-4 bg-gray-50 border border-gray-100 p-3 rounded-xl w-fit">
                <FiMapPin size={14} className="text-purple-600" />
                <span className="text-sm font-bold text-gray-700">{fullAddress}</span>
              </div>
              {property.projectPlan && (
                <a href={property.projectPlan} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold mb-4 px-4 py-2 rounded-xl border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors">
                  <PaperClipOutlined /> View Site Plan
                </a>
              )}
              <div className="w-full h-[360px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen title="Property Location Map" src={mapSrc} />
              </div>
            </div>

          </Col>

          {/* ══════════════ RIGHT COLUMN (Sticky) ══════════════ */}
          <Col xs={24} lg={8}>
            <div className="sticky top-28 space-y-5">

              {/* Price & Summary Card */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.05)] overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Project Valuation</div>
                  <h1 className="text-xl font-black text-gray-900 leading-tight mb-1">{projectName}</h1>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mb-4">
                    <FiMapPin size={13} /> {[property.locality || property.area, property.city].filter(Boolean).join(", ")}
                  </p>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {priceMax && priceMax !== priceMin ? 'Price Range' : 'Starting Price'}
                    </p>
                    <div className="text-2xl font-black" style={{ color: PRIMARY }}>{priceDisplay}</div>
                  </div>
                </div>

                <div className="p-5 bg-gray-50/50 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 flex-shrink-0">
                      <BankOutlined />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider m-0">Developer</p>
                      <p className="text-sm font-extrabold text-gray-800 m-0">{developerName}</p>
                    </div>
                  </div>

                  {property.propertyType && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 flex-shrink-0">
                        <HomeOutlined />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider m-0">Property Type</p>
                        <p className="text-sm font-extrabold text-gray-800 m-0">{property.propertyType}</p>
                      </div>
                    </div>
                  )}

                  {getPaymentPlan() && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 flex-shrink-0">
                        <WalletOutlined />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider m-0">Payment Plan</p>
                        <p className="text-sm font-extrabold text-gray-800 m-0">{getPaymentPlan()}</p>
                      </div>
                    </div>
                  )}

                  {getCommissionText() && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <MoneyCollectOutlined />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-emerald-600/70 uppercase tracking-wider m-0">Agent Commission</p>
                        <p className="text-sm font-extrabold text-emerald-700 m-0">{getCommissionText()}</p>
                      </div>
                    </div>
                  )}

                  {completionDisplay && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 flex-shrink-0">
                        <ScheduleOutlined />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider m-0">Handover</p>
                        <p className="text-sm font-extrabold text-gray-800 m-0">{completionDisplay}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              {property.propertySubType === "off_plan" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Inventory Snapshot</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Available', val: inventoryCounts.available, color: '#16a34a' },
                      { label: 'Reserved',  val: inventoryCounts.reserved,  color: '#b45309' },
                      { label: 'Booked',    val: inventoryCounts.booked,    color: '#0369a1' },
                      { label: 'Total',     val: inventoryCounts.total,     color: PRIMARY },
                    ].map(s => (
                      <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-xl font-black" style={{ color: s.color }}>{s.val}</div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full text-white h-14 rounded-2xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                  style={{ background: GR }}>
                  <ThunderboltOutlined /> Generate AI Presentation
                </button>
                <button className="w-full bg-white border border-gray-200 text-[#5c039b] h-14 rounded-2xl text-sm font-bold hover:bg-purple-50 hover:border-purple-200 transition-all flex items-center justify-center gap-2">
                  <UserOutlined /> Link to Client Requirement
                </button>
              </div>

              {/* Compliance Card */}
              {(property.trakheesiPermitId || property.qrCode) && (
                <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <SafetyCertificateOutlined style={{ color: '#16a34a', fontSize: 16 }} />
                    <p className="text-sm font-extrabold text-emerald-800 m-0">Regulatory Compliance</p>
                  </div>
                  {property.trakheesiPermitId && (
                    <div className="mb-2">
                      <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider m-0">Trakheesi Permit ID</p>
                      <p className="text-sm font-bold text-emerald-900 m-0 font-mono">{property.trakheesiPermitId}</p>
                    </div>
                  )}
                  {property.qrCode && (
                    <div className="mt-3">
                      <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-2">DLD QR Code</p>
                      <div className="bg-white rounded-xl p-2 border border-emerald-100 w-24">
                        <img src={property.qrCode} alt="DLD QR" className="w-full h-auto" />
                      </div>
                      <p className="text-[10px] text-emerald-600 mt-1 font-medium">Scan via Dubai REST app</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </Col>
        </Row>
      </div>

      {/* ── Photo Gallery Modal ── */}
      <Modal
        title={<span className="font-extrabold text-xl text-slate-800">Property Gallery</span>}
        open={isPhotoModalOpen}
        onCancel={() => setIsPhotoModalOpen(false)}
        footer={null}
        width={1000}
        centered
        styles={{ body: { padding: '16px 24px' } }}
      >
        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {Object.entries({ all: 'All', architecture: 'Architecture', interior: 'Interior', lobby: 'Lobby' }).map(([key, label]) => {
            const count = mediaCategories[key]?.length || 0;
            if (key !== 'all' && count === 0) return null;
            return (
              <button key={key} onClick={() => setPhotoTab(key)}
                className="px-4 py-1.5 rounded-full text-sm font-bold transition-all border"
                style={{
                  background: photoTab === key ? GR : '#fff',
                  color: photoTab === key ? '#fff' : '#374151',
                  borderColor: photoTab === key ? 'transparent' : '#e2e8f0',
                }}>
                {label} {key !== 'all' && count > 0 && <span className="ml-1 opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>
        <div className="max-h-[65vh] overflow-y-auto">
          <Image.PreviewGroup>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {galleryPhotos.map((photo, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-slate-100 shadow-sm cursor-zoom-in bg-slate-50 h-36">
                  <Image src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" style={{ height: 144, objectFit: 'cover' }} fallback="https://placehold.co/600x400?text=Unavailable" />
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
        </div>
      </Modal>

    </div>
  );
}
