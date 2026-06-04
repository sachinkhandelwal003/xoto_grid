import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row, Col, Typography, Button, Tag, Spin, message,
  Card, Divider, Avatar, Space, Modal, Image, Select, Checkbox, Input, Alert, Table, Tabs, Statistic
} from "antd";
import {
  EnvironmentOutlined, PictureOutlined, FilePdfOutlined,
  TagOutlined, WalletOutlined, BankOutlined,
  ShareAltOutlined, ExportOutlined, MessageOutlined,
  AppstoreOutlined, ArrowLeftOutlined, EditOutlined, RobotOutlined, MoneyCollectOutlined,
  EyeOutlined, DownloadOutlined, RightOutlined, HomeOutlined, BuildOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, UnorderedListOutlined, PieChartOutlined,
    ThunderboltOutlined,FileTextOutlined,

} from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const PDF_WIDTH_PX = 1240;
const PDF_HEIGHT_PX = 1754;

// ─────────────────────────────────────────────
// TRANSLATION
// ─────────────────────────────────────────────
const translateText = async (text, targetLang) => {
  if (targetLang === 'EN' || targetLang === 'English') return text;
  try {
    const response = await apiService.post("aiii/translate", { text, targetLang });
    if (response.data?.success && response.data?.translatedText) return response.data.translatedText;
    return text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};

const useTranslation = () => {
  const [translations, setTranslations] = useState({
    EN: {
      lookWhatWeFound: "Look what we found for you",
      developer: "Developer",
      aboutProject: "ABOUT THE PROJECT",
      priceFrom: "Price from",
      paymentPlan: "Payment Plan",
      location: "Location description and benefits",
      amenities: "Features & Amenities",
      theVisionaryBehind: "The Visionary Behind",
      luxuryLiving: "Luxury Living",
      typicalUnits: "Typical Units",
      pricingAvailability: "Project general facts",
      primeLocation: "PRIME LOCATION",
      unitType: "Unit type",
      bedrooms: "Bedrooms",
      amount: "Amount",
      area: "Area, sqft",
      priceFromTable: "Price from",
      onBooking: "On booking",
      duringConstruction: "During construction",
      uponHandover: "Upon Handover",
      handover: "Handover",
      paymentPlanOption: "Payment Plan Option",
      allOptions: "All options",
      dateOfCreation: "Date of creation",
      finishing: "Finishing and materials",
      architecture: "ARCHITECTURE",
      advisor: "XOTO Real Estate Advisor",
      availableUnits: "Available Units",
      unitDetails: "Unit Details",
      status: "Status",
      view: "View",
      parking: "Parking"
    }
  });

  const [currentLang, setCurrentLang] = useState('EN');
  const [isTranslating, setIsTranslating] = useState(false);

  const translateAll = async (langCode) => {
    if (langCode === 'EN') { setCurrentLang('EN'); return; }
    if (translations[langCode]) { setCurrentLang(langCode); return; }
    setIsTranslating(true);
    try {
      const translated = {};
      for (const [key, value] of Object.entries(translations.EN)) {
        translated[key] = await translateText(value, langCode);
      }
      setTranslations(prev => ({ ...prev, [langCode]: translated }));
      setCurrentLang(langCode);
      message.success(`Content translated to ${langCode}`);
    } catch (error) {
      message.error(`Translation failed for ${langCode}. Using English.`);
    } finally {
      setIsTranslating(false);
    }
  };

  const t = (key) => translations[currentLang]?.[key] || translations.EN[key];
  return { t, translateAll, currentLang, isTranslating, translations };
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const getSafeUrl = (url) => {
  if (!url || typeof url !== 'string' || url.trim() === '')
    return "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1773392643245-15.jpg";
  if (url.includes('unsplash.com')) return url.split('?')[0];
  if (url.includes('amazonaws.com')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}cb=${Date.now()}`;
  }
  return url;
};

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
  if (property?.mainLogo && !photos.includes(property.mainLogo)) photos.push(property.mainLogo);
  if (photos.length === 0) photos.push("https://xotostaging.s3.me-central-1.amazonaws.com/properties/1773392643245-15.jpg");
  return photos;
};

const getAmenityImage = (amenityName) => {
  const n = amenityName.toLowerCase();
  if (n.includes('pool') || n.includes('water')) return "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=800&auto=format&fit=crop";
  if (n.includes('gym') || n.includes('fitness')) return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop";
  if (n.includes('cinema') || n.includes('theater')) return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop";
  if (n.includes('bbq') || n.includes('barbecue')) return "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=800&auto=format&fit=crop";
  if (n.includes('spa') || n.includes('sauna')) return "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop";
  if (n.includes('lounge') || n.includes('club')) return "https://images.unsplash.com/photo-1574643033501-1b0780287f3b?q=80&w=800&auto=format&fit=crop";
  if (n.includes('work') || n.includes('office')) return "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop";
  if (n.includes('garden') || n.includes('park')) return "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop";
  if (n.includes('kids') || n.includes('play')) return "https://images.unsplash.com/photo-1598346762291-aee88549193f?q=80&w=800&auto=format&fit=crop";
  return "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800&auto=format&fit=crop";
};

// ─────────────────────────────────────────────
// HTML TEMPLATE GENERATOR (keep the same as previous)
// ─────────────────────────────────────────────
const generateHTMLTemplate = (property, agent, preferences, translations, currentLang, customDescription, inventoryUnits = []) => {
  // ... (keep the same HTML template generation code from previous version)
  // To save space, I'm not repeating it here, but you should include the full generateHTMLTemplate function
  return `<!DOCTYPE html>...</html>`;
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function AgentProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryUnits, setInventoryUnits] = useState([]);
  const [inventoryCounts, setInventoryCounts] = useState({
    total: 0,
    available: 0,
    reserved: 0,
    booked: 0,
    sold: 0
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [customDescription, setCustomDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isImprovingAI, setIsImprovingAI] = useState(false);
  const [allPhotos, setAllPhotos] = useState([]);
  const [activeUnitTab, setActiveUnitTab] = useState("all");

  const [pdfPreferences, setPdfPreferences] = useState({
    language: 'EN',
    currency: 'AED',
    measureUnit: 'sqft',
    slides: ['Cover slide', 'Project description', 'Developer', 'Unit prices', 'Payment plans', 'Location']
  });

  const { t, translateAll, currentLang, isTranslating, translations } = useTranslation();

  useEffect(() => {
    if (pdfPreferences.language !== currentLang) {
      translateAll(pdfPreferences.language);
    }
  }, [pdfPreferences.language]);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      let res = await apiService.get(`/properties/${id}`);
      let responseData = res?.data || res;
    
      if (responseData) {
        const propertyData = responseData;
        setProperty(propertyData);
        setCustomDescription(propertyData.description || "Detailed description for this property is not available yet.");
        setAllPhotos(getAllPhotos(propertyData));
        
        // If it's an off-plan property, fetch inventory units
        if (propertyData.propertySubType === "off_plan") {
          await fetchInventoryUnits(propertyData._id || id);
        }
      } else {
        message.error("Failed to load property details");
      }
    } catch (err) {
      console.error("Error fetching property:", err);
      message.error("API error while fetching property");
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryUnits = async (propertyId) => {
    try {
      setInventoryLoading(true);
// const res = await apiService.get(
//   `/properties/inventory?propertyId=${propertyId}&status=available`
// );
      const responseData = res?.data || res;
      
      if (responseData) {
        setInventoryUnits(responseData || []);
        setInventoryCounts(responseData.counts || {
          total: 0, 
          available: 0,
          reserved: 0,
          booked: 0,
          sold: 0
        });
      }
    } catch (err) {
      console.error("Error fetching inventory:", err);
      // Don't show error message, just log
    } finally {
      setInventoryLoading(false);
    }
  };

  const handleImproveWithAI = async () => {
    if (!customDescription.trim()) {
      message.warning("Please enter some description first!");
      return;
    }
    setIsImprovingAI(true);
    message.loading({ content: "XOTO AI is enhancing the description...", key: "ai_load" });
    try {
      const response = await apiService.post("aiii/improve-description", { description: customDescription });
      const responseData = response.data ? response.data : response;
      const improvedText = responseData?.improvedDescription || responseData?.data;
      if (improvedText) {
        setCustomDescription(improvedText);
        message.success({ content: "Description perfectly enhanced!", key: "ai_load", duration: 2 });
      } else {
        message.error({ content: "AI responded, but format was wrong.", key: "ai_load" });
      }
    } catch (error) {
      message.error({ content: "Backend error. Make sure server is running!", key: "ai_load", duration: 5 });
    } finally {
      setIsImprovingAI(false);
    }
  };

  const handleGenerateOffer = async (actionType = 'download') => {
    setIsGenerating(true);
    const key = "updatable";

    try {
      const storedUser = JSON.parse(localStorage.getItem("user_data") || localStorage.getItem("user") || "{}");
      const agentInfo = {
        name: storedUser?.first_name ? `${storedUser.first_name} ${storedUser.last_name || ''}`.trim() : "XOTO Agent",
        email: storedUser?.email || "agent@xoto.ae",
        phone: storedUser?.phone_number ? `${storedUser.country_code || '+971'} ${storedUser.phone_number}` : "+971 50 000 0000",
        photo: storedUser?.profile_photo || ""
      };

      const updatedProperty = { ...property, description: customDescription };
      const activeLang = pdfPreferences.language;
      const currentTranslations = {
        EN: translations.EN,
        [activeLang]: translations[activeLang] || translations.EN
      };

      const htmlContent = generateHTMLTemplate(updatedProperty, agentInfo, pdfPreferences, currentTranslations, activeLang, customDescription, inventoryUnits);

      if (actionType === 'view') {
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(htmlContent);
        previewWindow.document.close();
        message.success({ content: "Preview opened in new tab!", key });
      } else {
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        container.style.position = 'fixed';
        container.style.top = '-10000px';
        container.style.left = '0';
        container.style.width = '1200px';
        container.style.zIndex = '-9999';
        container.style.backgroundColor = '#ffffff';
        document.body.appendChild(container);

        await new Promise(resolve => setTimeout(resolve, 2000));

        const pages = container.querySelectorAll('.page');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

        for (let i = 0; i < pages.length; i++) {
          if (i > 0) pdf.addPage();
          pages[i].style.height = '1697px';
          pages[i].style.minHeight = '1697px';
          pages[i].style.maxHeight = '1697px';
          pages[i].style.overflow = 'hidden';

          try {
            const canvas = await html2canvas(pages[i], {
              scale: 2,
              logging: false,
              useCORS: true,
              allowTaint: true,
              windowWidth: 1200,
              backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
          } catch (pageError) {
            console.error(`Error rendering page ${i}:`, pageError);
          }
        }

        document.body.removeChild(container);
        const fileName = `${updatedProperty.propertyName?.replace(/\s+/g, '_') || 'Sales_Offer'}_${Date.now()}.pdf`;
        pdf.save(fileName);
        message.success({ content: "PDF Downloaded Successfully!", key });
        setIsOfferModalOpen(false);
      }
    } catch (error) {
      console.error("PDF Generation Error: ", error);
      message.error({ content: "Failed to generate PDF. Please try again.", key });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAIPresentation = () => {
  // Build prefill payload from current property
  const prefill = {
    propertyId: property._id || id,
    propertyName: property.propertyName,
    title: `${property.propertyName} — Presentation`,
    language: pdfPreferences.language === "EN" ? "English"
            : pdfPreferences.language === "AR" ? "Arabic"
            : pdfPreferences.language === "RU" ? "Russian"
            : pdfPreferences.language === "ZH" ? "Chinese"
            : pdfPreferences.language === "FR" ? "French"
            : "English",
    currency: pdfPreferences.currency || property.currency || "AED",
    areaUnit: pdfPreferences.measureUnit === "m2" ? "sqm" : "sqft",
    customNote: customDescription || property.description || "",
    tone: "professional",
    // Section toggles derived from pdfPreferences.slides
    sections: {
      cover:    pdfPreferences.slides.includes("Cover slide"),
      desc:     pdfPreferences.slides.includes("Project description"),
      dev:      pdfPreferences.slides.includes("Developer"),
      prices:   pdfPreferences.slides.includes("Unit prices"),
      payment:  pdfPreferences.slides.includes("Payment plans"),
      location: pdfPreferences.slides.includes("Location"),
    },
  };

  // Navigate to AgentPresentations with prefill in router state
  navigate("/dashboard/agent/presentations", { state: { prefill, autoOpenWizard: true } });
};


  // Filter units based on active tab
  const getFilteredUnits = () => {
    if (activeUnitTab === "all") return inventoryUnits;
    return inventoryUnits.filter(unit => unit.status === activeUnitTab);
  };

  // Units Table Columns
  const unitColumns = [
    {
      title: "Unit Number",
      dataIndex: "unitNumber",
      key: "unitNumber",
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>{text}</Text>
          {record.buildingName && <Text type="secondary" style={{ fontSize: 12, display: "block" }}>{record.buildingName}</Text>}
        </div>
      )
    },
    {
      title: "Type",
      key: "type",
      render: (_, record) => (
        <div>
          <Text>{record.unitType?.charAt(0).toUpperCase() + record.unitType?.slice(1)}</Text>
          <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
            {record.bedroomType?.replace('bed', ' Bed') || `${record.bedrooms} Bed`}
          </Text>
        </div>
      )
    },
    {
      title: "Area",
      key: "area",
      render: (_, record) => (
        <Text>{record.area} {record.areaUnit || "sqft"}</Text>
      )
    },
    {
      title: "Price",
      key: "price",
      render: (_, record) => (
        <Text strong style={{ color: "#16a34a" }}>
          {record.price.toLocaleString()} {record.currency || "AED"}
        </Text>
      )
    },
    {
      title: "Floor",
      dataIndex: "floorNumber",
      key: "floorNumber",
      render: (floor) => <Text>{floor}</Text>
    },
    {
      title: "Features",
      key: "features",
      render: (_, record) => (
        <Space size={4}>
          {record.hasView && <Tag color="blue" style={{ margin: 0 }}>View</Tag>}
          {record.parkingSpaces > 0 && <Tag color="green" style={{ margin: 0 }}>{record.parkingSpaces} Parking</Tag>}
          {record.furnishing && record.furnishing !== "unfurnished" && (
            <Tag color="orange" style={{ margin: 0 }}>{record.furnishing}</Tag>
          )}
        </Space>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          available: { color: "green", text: "Available" },
          reserved: { color: "orange", text: "Reserved" },
          booked: { color: "blue", text: "Booked" },
          sold: { color: "red", text: "Sold" }
        };
        const config = statusConfig[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        record.status === "available" ? (
          <Button type="primary" size="small" style={{ borderRadius: 6 }}>
            Book Now
          </Button>
        ) : (
          <Button disabled size="small">Unavailable</Button>
        )
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" />
      </div>
    );
  }
  
  if (!property) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Title level={4}>Project not found!</Title>
        <Button type="primary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const getImage = () => allPhotos[0] || "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1773392643245-15.jpg";
  const getPaymentPlan = () => {
    if (property.paymentPlan && property.paymentPlan.length > 0) {
      const plan = property.paymentPlan[0];
      if (plan.stages && plan.stages.length > 0) {
        return plan.stages.map(s => `${s.percentage}% ${s.stage.replace('_', ' ')}`).join(' • ');
      }
    }
    if (property.paymentPlan_initialPercentage && property.paymentPlan_laterPercentage) {
      return `${property.paymentPlan_initialPercentage}/${property.paymentPlan_laterPercentage}%`;
    }
    return "Contact us for payment plan";
  };

  const getCommissionText = () => {
    if (property.shareCommission && property.shareCommissionPercentage) {
      return `${property.shareCommissionPercentage}% Commission Shared`;
    }
    if (property.commission) {
      return `${property.commission}% Commission`;
    }
    if (property.commissionType) {
      const val = property.commissionValue || 0;
      return property.commissionType === "percentage" ? `${val}%` : `${property.currency || "AED"} ${val.toLocaleString()}`;
    }
    return "Contact us for commission details";
  };

  const getStatusTag = () => {
    const status = property.approvalStatus;
    const listing = property.listingStatus;
    
    if (property.propertySubType === "off_plan") {
      return <Tag color="purple" style={{ borderRadius: 8, fontWeight: 600 }}>🏗️ Off-Plan Project</Tag>;
    }
    
    if (status === "approved" && listing === "active") {
      return <Tag color="green" icon={<CheckCircleOutlined />} style={{ borderRadius: 8, fontWeight: 600 }}>Active Listing</Tag>;
    }
    if (status === "pending") {
      return <Tag color="orange" icon={<ClockCircleOutlined />} style={{ borderRadius: 8, fontWeight: 600 }}>Pending Approval</Tag>;
    }
    if (status === "rejected") {
      return <Tag color="red" icon={<CloseCircleOutlined />} style={{ borderRadius: 8, fontWeight: 600 }}>Rejected</Tag>;
    }
    return <Tag color="default" style={{ borderRadius: 8 }}>Draft</Tag>;
  };

  const developerName = property?.developer?.name || property?.developerName || "Developer";
  const fullAddress = `${property?.country || "UAE"}, ${property?.city || "Dubai"}, ${property?.area || "Area"}`;
  const displayAmenitiesUI = property?.amenities?.length > 0 ? property.amenities : ["Infinity Pool", "Outdoor Gym", "BBQ Area", "Rooftop Terraces", "Co-working Space", "Water Lounges", "Cinema", "Club House", "Spa"];

  const languages = [
    { code: 'EN', name: 'English' }, { code: 'HI', name: 'Hindi' }, { code: 'AR', name: 'Arabic' },
    { code: 'RU', name: 'Russian' }, { code: 'ZH', name: 'Chinese' }, { code: 'FA', name: 'Persian' },
    { code: 'FR', name: 'French' }, { code: 'ES', name: 'Spanish' }, { code: 'DE', name: 'German' }, { code: 'IT', name: 'Italian' }
  ];
  const currencies = [
    { code: 'AED', name: 'United Arab Emirates Dirham' }, { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' }, { code: 'GBP', name: 'British Pound' }, { code: 'INR', name: 'Indian Rupee' }
  ];

  return (
    <div style={{ padding: "24px 40px", background: "#fff", minHeight: "100vh" }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ paddingLeft: 0, marginBottom: 16, color: "#555" }}>
        Back to Projects
      </Button>

      <Row gutter={[32, 32]}>
        {/* LEFT COLUMN */}
        <Col xs={24} lg={16}>
          {/* Hero Image */}
          <div style={{ position: "relative", height: 500, borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
            <img src={getImage()} alt={property.propertyName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", top: 20, left: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {getStatusTag()}
              {property.completionDate?.year && (
                <Tag style={{ padding: "4px 12px", borderRadius: 8, fontSize: 14, fontWeight: "bold", background: "#fff", color: "#333", border: "none" }}>
                  Handover: {property.completionDate.quarter} {property.completionDate.year}
                </Tag>
              )}
              {property.readinessProgress && (
                <Tag style={{ padding: "4px 12px", borderRadius: 8, fontSize: 14, fontWeight: "bold", background: "#fff", color: "#333", border: "none" }}>
                  Progress: {property.readinessProgress}
                </Tag>
              )}
            </div>
            <div style={{ position: "absolute", bottom: 20, left: 20, display: "flex", gap: 12 }}>
              <Button icon={<PictureOutlined />} onClick={() => setIsPhotoModalOpen(true)} style={{ borderRadius: 8, fontWeight: 500, border: "none" }}>
                {allPhotos.length} Photos
              </Button>
              {property.brochure && (
                <Button icon={<FilePdfOutlined />} href={property.brochure} target="_blank" style={{ borderRadius: 8, fontWeight: 500, border: "none" }}>
                  Brochure
                </Button>
              )}
            </div>
          </div>

          {/* Info Banner for Pending Properties */}
          {property.approvalStatus === "pending" && (
            <Alert
              message="Pending Approval"
              description="This property is awaiting admin approval. Some features may be limited until approved."
              type="warning"
              showIcon
              style={{ marginBottom: 24, borderRadius: 12 }}
            />
          )}

          {/* Description */}
          <Title level={3} style={{ marginBottom: 16 }}>Description</Title>
          <Text type="secondary" strong style={{ display: "block", marginBottom: 12 }}>Project general facts</Text>
          <Paragraph ellipsis={{ rows: 4, expandable: true, symbol: 'Read More' }} style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.8 }}>
            {customDescription}
          </Paragraph>

          <Divider style={{ margin: "40px 0" }} />

          {/* Amenities */}
          <Title level={3} style={{ marginBottom: 24 }}>Amenities</Title>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {displayAmenitiesUI.map((amenity, index) => (
              <div key={index} style={{
                padding: "10px 16px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#fff",
                fontSize: "14px", fontWeight: 500, color: "#374151", display: "flex", alignItems: "center", gap: "8px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
              }}>
                <span style={{ color: "#6366f1", fontSize: "16px", fontWeight: "bold" }}>✓</span>{amenity}
              </div>
            ))}
          </div>

          <Divider style={{ margin: "40px 0" }} />

          {/* Units & Availability - Enhanced with Inventory Data */}
          <Title level={3} style={{ marginBottom: 24 }}>
            <UnorderedListOutlined style={{ marginRight: 8 }} /> Units & Availability
          </Title>

 {property.propertySubType === "off_plan" && inventoryUnits.length > 0 ? (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    
    {getFilteredUnits().map((unit) => (
      <div
        key={unit._id}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          background: "#fff"
        }}
      >

        {/* Unit */}
        <div style={{ flex: 1 }}>
          <Text strong>{unit.unitNumber}</Text>
          {unit.buildingName && (
            <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
              {unit.buildingName}
            </Text>
          )}
        </div>

        {/* Type */}
        <div style={{ flex: 1 }}>
          <Text>
            {unit.unitType} • {unit.bedroomType}
          </Text>
        </div>

        {/* Area */}
        <div style={{ flex: 1 }}>
          <Text>
            {unit.area} {unit.areaUnit || "sqft"}
          </Text>
        </div>

        {/* Price */}
        <div style={{ flex: 1, textAlign: "right" }}>
          <Text strong style={{ color: "#16a34a" }}>
            {unit.price.toLocaleString()} {unit.currency}
          </Text>
        </div>

      </div>
    ))}

  </div>
) : (
            // Fallback for secondary properties or when no inventory data
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px",
                background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb"
              }}>
                <div style={{ flex: 1.5 }}>
                  <Text strong style={{ fontSize: 15, color: "#111827" }}>
                    {property.unitType ? property.unitType.charAt(0).toUpperCase() + property.unitType.slice(1) : "Unit"}
                  </Text>
                </div>
                <div style={{ flex: 1 }}>
                  <Text style={{ color: "#374151", fontWeight: 500 }}>
                    {property.bedroomType?.replace('bed', ' Bed') || `${property.bedrooms} Bed`}
                  </Text>
                </div>
                <div style={{ flex: 1.5 }}>
                  <Text style={{ color: "#374151", fontWeight: 500 }}>
                    {property.builtUpArea || property.builtUpArea_min || 0} {property.builtUpAreaUnit || "sqft"}
                  </Text>
                </div>
                <div style={{ flex: 1.5, textAlign: "right", paddingRight: 16 }}>
                  <Text strong style={{ fontSize: 15, color: "#111827" }}>
                    {Number(property.price || property.price_min || 0).toLocaleString()} {property.currency || "AED"}
                  </Text>
                </div>
              </div>
            </div>
          )}

          <Divider style={{ margin: "40px 0" }} />

          {/* Location */}
          <Title level={3} style={{ marginBottom: 16 }}>Location</Title>
          <div style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, color: "#374151", fontWeight: 500 }}>
              <EnvironmentOutlined style={{ color: "#6366f1", marginRight: 8, fontSize: 18 }} />
              {fullAddress}
            </Text>
          </div>
          <div style={{ width: "100%", height: 400, borderRadius: 16, overflow: "hidden", border: "1px solid #e5e7eb" }}>
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(property.propertyName + ' ' + fullAddress)}&t=m&z=14&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
        </Col>

        {/* RIGHT COLUMN - Sticky Sidebar (keep the same) */}
        {/* ... (right column code remains the same) ... */}
        <Col xs={24} lg={8}>
          <div style={{ position: "sticky", top: 24 }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              <EnvironmentOutlined /> {property.city}, {property.country || "UAE"}
            </Text>
            <Title level={2} style={{ marginTop: 8, marginBottom: 24 }}>
              {property.propertyName} by {developerName}
            </Title>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <TagOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Price from:</Text>
                  <Text strong style={{ fontSize: 18 }}>
                    {Number(property.price || property.price_min || 0).toLocaleString()} {property.currency || "AED"}
                  </Text>
                  {property.price_max && property.price_max !== property.price_min && (
                    <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                      up to {Number(property.price_max).toLocaleString()} {property.currency || "AED"}
                    </Text>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <AppstoreOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                <div>
                  <Text strong style={{ fontSize: 16, display: "block" }}>Available Units</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {inventoryCounts.available > 0 ? inventoryCounts.available : (property.totalUnits || property.totalInventory || "Contact for availability")}
                  </Text>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <WalletOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Payment plan:</Text>
                  <Text strong style={{ fontSize: 16 }}>{getPaymentPlan()}</Text>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <BankOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Developer:</Text>
                  <Text strong style={{ fontSize: 16 }}>{developerName}</Text>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <MoneyCollectOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Agent Commission:</Text>
                  <Text strong style={{ fontSize: 16, color: "#16a34a" }}>{getCommissionText()}</Text>
                </div>
              </div>

              {property.builtUpArea && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <HomeOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Area:</Text>
                    <Text strong style={{ fontSize: 16 }}>
                      {property.builtUpArea} {property.builtUpAreaUnit || "sqft"}
                    </Text>
                  </div>
                </div>
              )}

              {property.furnishing && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <BuildOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Furnishing:</Text>
                    <Text strong style={{ fontSize: 16 }}>
                      {property.furnishing.charAt(0).toUpperCase() + property.furnishing.slice(1)}
                    </Text>
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: "#fffbe6", border: "1px solid #ffe58f", padding: "8px", borderRadius: "8px 8px 0 0", textAlign: "center" }}>
              <Text strong style={{ fontSize: 13 }}>🔑 Your customised personal offer. Try it!</Text>
            </div>
           <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    width: "100%",
    marginTop: 12,
    marginBottom: 14,
  }}
>
  {/* Generate Sales Offer */}
  <Button
    type="primary"
    icon={<FileTextOutlined />}
    onClick={() => setIsOfferModalOpen(true)}
    style={{
      height: 52,
      width: "100%",
      borderRadius: 10,
      background: "#5B45FF",
      border: "none",
      fontWeight: 600,
      fontSize: 14,
      padding: "0 14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 12px rgba(91,69,255,0.18)",
      whiteSpace: "normal",
      textAlign: "center",
      lineHeight: "1.2",
    }}
  >
    Generate Sales Offer
  </Button>

  {/* Generate AI Presentation */}
  <Button
    type="primary"
    icon={<ThunderboltOutlined />}
    onClick={handleGenerateAIPresentation}
    style={{
      height: 52,
      width: "100%",
      borderRadius: 10,
      background: "linear-gradient(90deg, #5C039B 0%, #A855F7 100%)",
      border: "none",
      fontWeight: 600,
      fontSize: 14,
      padding: "0 14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 12px rgba(92,3,155,0.18)",
      whiteSpace: "normal",
      textAlign: "center",
      lineHeight: "1.2",
    }}
  >
    Generate AI Presentation
  </Button>
</div>

{/* Transfer Client Button */}
<Button
  icon={<ShareAltOutlined />}
  style={{
    width: "100%",
    height: 52,
    borderRadius: 10,
    background: "#111827",
    color: "#fff",
    border: "none",
    fontWeight: 600,
    fontSize: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
    marginBottom: 16,
  }}
>
  Transfer Client
</Button> 

            

            <Card style={{ borderRadius: 12, border: "1px solid #e5e7eb" }} bodyStyle={{ padding: "16px 20px" }}>
              <div style={{ textAlign: "center", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f3f4f6" }}>
                <Text strong>Sales Office</Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Space>
                  <Avatar size={48} src={property.developer?.logo} style={{ background: "#f3f4f6" }}>
                    {!property.developer?.logo && developerName?.charAt(0)}
                  </Avatar>
                  <div>
                    <Text strong style={{ display: "block" }}>{developerName} Team</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>English • Arabic</Text>
                  </div>
                </Space>
                <Button shape="round" icon={<MessageOutlined />} style={{ background: "#d9f99d", color: "#3f6212", border: "none", fontWeight: 600 }}>
                  Support
                </Button>
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Photo Modal (keep the same) */}
      <Modal
        title={<Title level={5} style={{ margin: 0 }}>Property Gallery</Title>}
        open={isPhotoModalOpen}
        onCancel={() => setIsPhotoModalOpen(false)}
        footer={null}
        width={900}
        centered
      >
        <div style={{ marginTop: 20 }}>
          <Image.PreviewGroup>
            <Row gutter={[16, 16]}>
              {allPhotos.map((photo, index) => (
                <Col xs={12} sm={8} md={6} key={index}>
                  <Image
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8, cursor: "pointer", border: "1px solid #f0f0f0" }}
                  />
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        </div>
      </Modal>

      {/* Offer Modal (keep the same) */}
      <Modal
        title={<div style={{ textAlign: 'center', width: '100%', fontSize: '18px', fontWeight: 'bold' }}>Generate Sales Offer</div>}
        open={isOfferModalOpen}
        onCancel={() => setIsOfferModalOpen(false)}
        footer={null}
        width={750}
        centered
        bodyStyle={{ padding: '10px 24px 24px' }}
      >
        {/* ... (offer modal content remains the same) ... */}
        <div style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '5px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>PDF Preferences</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Configure your presentation before generation</div>

          <div style={{ marginTop: 20 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Language</Text>
            <Select
              value={pdfPreferences.language}
              style={{ width: '100%' }}
              size="large"
              onChange={val => setPdfPreferences({ ...pdfPreferences, language: val })}
              loading={isTranslating}
            >
              {languages.map(l => (
                <Select.Option key={l.code} value={l.code}>
                  <strong style={{ marginRight: 8 }}>{l.code}</strong>{l.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ marginTop: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Currency</Text>
            <Select
              value={pdfPreferences.currency}
              style={{ width: '100%' }}
              size="large"
              showSearch
              optionFilterProp="children"
              onChange={val => setPdfPreferences({ ...pdfPreferences, currency: val })}
            >
              {currencies.map(c => (
                <Select.Option key={c.code} value={c.code}>
                  <strong style={{ marginRight: 8 }}>{c.code}</strong>{c.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ marginTop: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Measure units</Text>
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 4 }}>
              {['ft2', 'm2'].map(u => (
                <div
                  key={u}
                  onClick={() => setPdfPreferences({ ...pdfPreferences, measureUnit: u })}
                  style={{
                    flex: 1, textAlign: 'center', padding: '6px 0', cursor: 'pointer', borderRadius: 6,
                    background: pdfPreferences.measureUnit === u ? '#fff' : 'transparent',
                    fontWeight: pdfPreferences.measureUnit === u ? 'bold' : 'normal',
                    color: pdfPreferences.measureUnit === u ? '#5C039B' : '#6b7280',
                    boxShadow: pdfPreferences.measureUnit === u ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {u === 'ft2' ? 'ft²' : 'm²'}
                </div>
              ))}
            </div>
          </div>

          <Divider />

          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>Display Settings</div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Cover slide', 'Project description', 'Developer', 'Unit prices', 'Payment plans', 'Location'].map(item => (
              <Checkbox
                key={item}
                defaultChecked={pdfPreferences.slides.includes(item)}
                onChange={e => {
                  let s = [...pdfPreferences.slides];
                  if (e.target.checked) {
                    if (!s.includes(item)) s.push(item);
                  } else {
                    s = s.filter(x => x !== item);
                  }
                  setPdfPreferences({ ...pdfPreferences, slides: s });
                }}
              >
                {item}
              </Checkbox>
            ))}
          </div>

          <Divider />

          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>Personalised description</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Adapt the project description yourself or with the help of XOTO AI.</div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold' }}>Description</Text>
            {isEditingDesc ? (
              <Input.TextArea
                rows={4}
                value={customDescription}
                onChange={e => setCustomDescription(e.target.value)}
                style={{ borderRadius: 8, marginBottom: 12, marginTop: 8 }}
              />
            ) : (
              <div style={{ maxHeight: 100, overflowY: 'auto', fontSize: 13, color: '#4b5563', marginBottom: 12, marginTop: 8 }}>
                {customDescription}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <Button style={{ flex: 1 }} icon={<EditOutlined />} onClick={() => setIsEditingDesc(!isEditingDesc)}>
                {isEditingDesc ? 'Save' : 'Edit'}
              </Button>
              <Button
                type="primary"
                style={{ flex: 1, background: 'linear-gradient(90deg,#5C039B 0%,#a855f7 100%)', border: 'none' }}
                icon={<RobotOutlined />}
                loading={isImprovingAI}
                onClick={handleImproveWithAI}
              >
                Improve with AI
              </Button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 15, marginTop: 24 }}>
            <Button
              size="large"
              icon={<EyeOutlined />}
              loading={isGenerating}
              onClick={() => handleGenerateOffer('view')}
              style={{ flex: 1, height: 50, borderRadius: 10, fontWeight: 'bold' }}
            >
              Preview
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<DownloadOutlined />}
              loading={isGenerating}
              onClick={() => handleGenerateOffer('download')}
              style={{ flex: 1, height: 50, borderRadius: 10, background: '#1f1f1f', fontWeight: 'bold', color: '#fff' }}
            >
              Download
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}