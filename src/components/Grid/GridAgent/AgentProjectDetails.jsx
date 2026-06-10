import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Button,
  Spin,
  message,
  Divider,
  Popover,
  Modal,
  Image,
  Card,
  Empty,
  Tag
} from "antd";
import {
  EnvironmentOutlined, PictureOutlined, FilePdfOutlined,
  WalletOutlined, BankOutlined, ArrowLeftOutlined, MoneyCollectOutlined,
  CheckCircleOutlined, ThunderboltOutlined, UserOutlined, QrcodeOutlined, SafetyCertificateOutlined
} from "@ant-design/icons";
import { FiMapPin } from "react-icons/fi";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Paragraph } = Typography;

// ─── THEME & HELPERS ────────────────────────────────────────────────────────
const PRIMARY = '#5c039b';

const getAllPhotos = (property) => {
  const photos = [];
  if (property?.photos) {
    if (Array.isArray(property.photos)) {
      photos.push(...property.photos);
    } else if (typeof property.photos === 'object') {
      Object.values(property.photos).forEach(category => {
        if (Array.isArray(category)) photos.push(...category);
      });
    }
  }
  // Media object handling (Architecture, Interior, etc.)
  if (property?.media) {
    ['architectureImages', 'interiorImages', 'lobbyImages', 'otherImages'].forEach(key => {
      if (Array.isArray(property.media[key])) photos.push(...property.media[key].filter(Boolean));
    });
  }
  
  if (property?.mainLogo && !photos.includes(property.mainLogo)) photos.unshift(property.mainLogo);
  if (property?.media?.mainLogo && !photos.includes(property.media.mainLogo)) photos.unshift(property.media.mainLogo);
  
  if (photos.length === 0) photos.push("https://xotostaging.s3.me-central-1.amazonaws.com/properties/1773392643245-15.jpg");
  return [...new Set(photos)]; // Remove duplicates
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AgentProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inventoryCounts, setInventoryCounts] = useState({ total: 0, available: 0, reserved: 0, booked: 0, sold: 0 });
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [customDescription, setCustomDescription] = useState("");
  const [allPhotos, setAllPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);

useEffect(() => {
  fetchPropertyDetails();
  fetchDocuments();
}, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      let res = await apiService.get(`/properties/${id}`);
      let responseData = res?.data?.data || res?.data || res;
       console.log("PROPERTY DETAILS:", responseData);
      if (responseData) {
        setProperty(responseData);
        setCustomDescription(responseData.description || responseData.overview || "Detailed description for this property is not available yet.");
        setAllPhotos(getAllPhotos(responseData));
        if (responseData.propertySubType === "off_plan") {
          await fetchInventoryUnits(responseData._id || id);
        }
      } else {
        message.error("Failed to load property details");
      }
    } catch (err) {
      message.error("API error while fetching property");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
  try {
    const res = await apiService.get(
      `/property-documents/${id}`
    );

    const docs =
      res?.data?.data ||
      [];

    setDocuments(docs);
  } catch (err) {
    console.error("Documents Error:", err);
  }
};

  const fetchInventoryUnits = async (propertyId) => {
    try {
      const res = await apiService.get(`properties/inventory?propertyId=${propertyId}`);
      const responseData = res?.data?.data || res?.data || res;
      if (responseData) {
        const data = Array.isArray(responseData) ? responseData : [];
        setInventoryCounts({
          total: data.length || 0,
          available: data.filter(u => u.status === "available").length,
          reserved: data.filter(u => u.status === "reserved").length,
          booked: data.filter(u => u.status === "booked").length,
          sold: data.filter(u => u.status === "sold").length,
        });
      }
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <Spin size="large" />
    </div>
  );

  if (!property) return (
    <div className="p-10 text-center bg-slate-50 h-screen">
      <Title level={4}>Project not found!</Title>
      <Button type="primary" onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  const getImage = () => allPhotos[0];
  
  const getPaymentPlan = () => {
    if (property.paymentPlan?.length > 0 && property.paymentPlan[0].stages?.length > 0) {
      return property.paymentPlan[0].stages.filter(s => s != null).map(s => `${s.percentage ?? 0}% ${s.stage?.replace(/_/g, ' ') || ''}`).join(' • ');
    }
    if (property.paymentPlan_initialPercentage && property.paymentPlan_laterPercentage)
      return `${property.paymentPlan_initialPercentage}/${property.paymentPlan_laterPercentage}%`;
    return "Contact us for payment plan";
  };

  const getCommissionText = () => {
    if (property.shareCommission && property.shareCommissionPercentage) return `${property.shareCommissionPercentage}% Shared`;
    if (property.commission) return `${property.commission}%`;
    if (property.commissionType) {
      return property.commissionType === "percentage" ? `${property.commissionValue || 0}%` : `${property.currency || "AED"} ${(property.commissionValue || 0).toLocaleString()}`;
    }
    return "Contact for details";
  };

  const getStatusTag = () => {
    const status = property.approvalStatus;
    const listing = property.listingStatus;
    if (property.propertySubType === "off_plan") return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">🏗️ Off-Plan</span>;
    if (status === "approved" && listing === "active") return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">Active Listing</span>;
    if (status === "pending") return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">Pending Approval</span>;
    if (status === "rejected") return <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full border border-red-200">Rejected</span>;
    return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">Draft</span>;
  };

  const developerName = property?.developer?.name || property?.developerName || "Premium Developer";
  const fullAddress = `${property?.area || property?.locality || "Area"}, ${property?.city || "Dubai"}, ${property?.country || "UAE"}`;
  const displayAmenitiesUI = property?.amenities?.length > 0 ? property.amenities : ["Infinity Pool", "Outdoor Gym", "BBQ Area", "Rooftop Terraces", "Co-working Space", "Water Lounges"];

  // DLD QR Code Popover Content
  const qrContent = (
    <div className="p-2 text-center w-48">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Dubai REST Verification</div>
      {property.qrCode ? (
        <div className="border border-slate-100 p-2 rounded-xl bg-slate-50 shadow-inner">
          <img src={property.qrCode} alt="DLD QR Code" className="w-full h-auto object-contain rounded-lg mix-blend-multiply" />
        </div>
      ) : (
        <div className="text-xs text-orange-500 font-semibold py-4 bg-orange-50 rounded-xl border border-orange-100">
          QR Code Unavailable
        </div>
      )}
      <div className="text-[10px] font-medium text-slate-500 mt-2 leading-tight">
        Scan using Dubai REST app to verify authenticity.
      </div>
    </div>
  );

  // EXACT MAP PIN LOGIC: Use exact Lat/Lng if available, fallback to Address String
  const lat = property?.location?.latitude;
  const lng = property?.location?.longitude;
  const mapQuery = (lat && lng) 
    ? `${lat},${lng}` 
    : encodeURIComponent(`${property?.propertyName} ${fullAddress}`);
  
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&t=m&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 pb-20">
      
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm px-8 py-4 mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeftOutlined /> Back to Catalogue
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        <Row gutter={[40, 40]}>
          
          {/* LEFT COLUMN */}
          <Col xs={24} lg={16}>
            
            {/* Hero Section */}
            <div className="relative h-[480px] rounded-3xl overflow-hidden shadow-lg border border-gray-200 mb-10 group bg-slate-100">
              <img src={getImage()} alt={property.propertyName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40"></div>
              
              <div className="absolute top-6 left-6 flex gap-3 flex-wrap">
                {getStatusTag()}
                {property.completionDate?.year && (
                  <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Handover: {property.completionDate.quarter} {property.completionDate.year}
                  </span>
                )}
                {/* Trakheesi Compliance Badge */}
                {property.trakheesiPermitId && (
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-emerald-400">
                    <SafetyCertificateOutlined /> Trakheesi: {property.trakheesiPermitId}
                  </span>
                )}
              </div>
              
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

              {/* DLD QR Hover Verification */}
              <div className="absolute bottom-6 right-6">
                <Popover content={qrContent} placement="topRight" trigger="hover" overlayInnerStyle={{ borderRadius: '16px' }}>
                  <button className="bg-white text-[#5c039b] hover:bg-purple-50 text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 border border-white/20 hover:scale-105">
                    <QrcodeOutlined className="text-lg" /> Verify Listing
                  </button>
                </Popover>
              </div>
            </div>

            {/* Description */}
            <div className="mb-12">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Project Overview</h2>
              <p className="text-sm font-semibold text-purple-600 uppercase tracking-widest mb-4">The Vision & Facts</p>
              <Paragraph className="text-[15px] leading-relaxed text-gray-600 font-medium whitespace-pre-wrap">
                {customDescription}
              </Paragraph>
            </div>

            <Divider className="my-10 border-gray-100" />

            {/* Amenities */}
            <div className="mb-12">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Premium Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayAmenitiesUI.map((amenity, index) => (
                  <div key={index} className="bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                      <CheckCircleOutlined />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <Divider className="my-10 border-gray-100" />

            {/* Off-Plan Units Details */}
            {property.propertySubType === "off_plan" && (
              <div className="mb-12">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Inventory Availability</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  {[
                    { label: "Total", value: inventoryCounts.total, bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-900" },
                    { label: "Available", value: inventoryCounts.available, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
                    { label: "Reserved", value: inventoryCounts.reserved, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
                    { label: "Booked", value: inventoryCounts.booked, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
                    { label: "Sold", value: inventoryCounts.sold, bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
                  ].map(({ label, value, bg, border, text }) => (
                    <div key={label} className={`${bg} border ${border} rounded-2xl p-4 text-center`}>
                      <div className={`text-2xl font-black ${text}`}>{value}</div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Divider className="my-10 border-gray-100" />

            <div className="mb-12">
  <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">
    Document Library
  </h2>

  {documents.length === 0 ? (
    <Empty description="No documents available" />
  ) : (
    <div className="grid md:grid-cols-2 gap-4">
      {documents.map((doc) => (
        <Card
          key={doc._id}
          className="rounded-2xl border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <FilePdfOutlined
              style={{
                fontSize: 28,
                color: "#dc2626",
              }}
            />

            <div>
              <div className="font-bold">
                {doc.title}
              </div>

              <Tag color="purple">
                {doc.documentCategory}
              </Tag>
            </div>
          </div>

          <Button
            type="primary"
            block
            href={doc.fileUrl}
            target="_blank"
          >
            View Document
          </Button>
        </Card>
      ))}
    </div>
  )}
</div>

<Divider className="my-10 border-gray-100" />

            {/* Location Map - Exact Pinning */}
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Location Map</h2>
              <div className="flex items-center gap-2 mb-4 bg-gray-50 border border-gray-100 p-3 rounded-xl w-fit">
                <EnvironmentOutlined className="text-purple-600 text-lg" />
                <span className="text-sm font-bold text-gray-700">{fullAddress}</span>
              </div>
              <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen title="Property Location Map"
                  src={mapSrc}
                />
              </div>
            </div>

          </Col>

          {/* RIGHT COLUMN (Sticky Actions) */}
          <Col xs={24} lg={8}>
            <div className="sticky top-28">
              
              {/* Main Summary Card */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-100">
                  <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Project Valuation</div>
                  <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">{property.propertyName}</h1>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                    <FiMapPin size={14}/> {[property.locality || property.area, property.city].filter(Boolean).join(", ")}
                  </p>
                  <div className="mt-6 mb-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Starting Price</p>
                    <div className="text-3xl font-black text-[#5c039b]">
                      AED {Number(property.price || property.price_min || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50/50 flex flex-col gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500"><BankOutlined size={18}/></div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Developer</p>
                      <p className="text-sm font-extrabold text-gray-800">{developerName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500"><WalletOutlined size={18}/></div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Payment Plan</p>
                      <p className="text-sm font-extrabold text-gray-800">{getPaymentPlan()}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm flex items-center justify-center text-emerald-600"><MoneyCollectOutlined size={18}/></div>
                    <div>
                      <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-wider mb-0.5">Agent Commission Split</p>
                      <p className="text-sm font-extrabold text-emerald-700">{getCommissionText()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-[#5c039b] text-white h-14 rounded-2xl text-sm font-bold shadow-lg shadow-purple-900/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-900/30 transition-all flex items-center justify-center gap-2">
                  <ThunderboltOutlined /> Generate AI Presentation
                </button>
                <button className="w-full bg-white border border-gray-200 text-[#5c039b] h-14 rounded-2xl text-sm font-bold hover:bg-purple-50 hover:border-purple-200 transition-all flex items-center justify-center gap-2">
                  <UserOutlined /> Link to Client Requirement
                </button>
              </div>

            </div>
          </Col>
        </Row>
      </div>

      {/* ── IMAGE GALLERY MODAL (Ant Design PreviewGroup) ── */}
      <Modal
        title={<span className="font-extrabold text-xl text-slate-800">Property Gallery</span>}
        open={isPhotoModalOpen}
        onCancel={() => setIsPhotoModalOpen(false)}
        footer={null}
        width={1000}
        centered
        styles={{ body: { padding: '20px 24px' } }}
      >
        <div className="mt-2 max-h-[70vh] overflow-y-auto scrollbar-thin pr-2">
          <Image.PreviewGroup>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allPhotos.map((photo, index) => (
                <div key={index} className="rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-zoom-in bg-slate-50 h-36">
                  <Image
                    src={photo}
                    alt={`Property Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{ height: '144px', objectFit: 'cover' }}
                    fallback="https://placehold.co/600x400?text=Image+Unavailable"
                  />
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
        </div>
      </Modal>

    </div>
  );
}