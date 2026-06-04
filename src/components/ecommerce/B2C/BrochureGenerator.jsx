import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card, Typography, Button, message, Select, Checkbox, Input, Tabs, Spin,
  Row, Col, Divider, Tag, Space, Avatar
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  ArrowLeftOutlined,
  FilePdfOutlined,
  DownloadOutlined,
  EyeOutlined,
  SettingOutlined,
  GlobalOutlined,
  DollarCircleOutlined,
  HomeOutlined,
  EditOutlined,
  RobotOutlined,
  EnvironmentOutlined,
  BankOutlined,
  CalendarOutlined, 
  UploadOutlined, 
  WhatsAppOutlined, 
  MailOutlined,
  CopyOutlined,
  CheckCircleFilled,
  InfoCircleOutlined,LinkOutlined 
} from "@ant-design/icons";

// Import the brochure template generator
import { generateBrochureHTML } from "./BrochureTemplate";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

export default function BrochureGenerator() {
  const location = useLocation();
  const navigate = useNavigate();
  const property = location.state?.property;
  const lead = location.state?.lead;
  const matchScore = location.state?.matchScore;
  
  const [uploading, setUploading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [brochureId, setBrochureId] = useState('');
  
  // States
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [activeTab, setActiveTab] = useState('customize');
  
  // Brochure preferences
  const [preferences, setPreferences] = useState({
    language: 'EN',
    currency: 'AED',
    areaUnit: 'sqft',
    slides: ['Cover slide', 'Project description', 'Developer', 'Unit prices', 'Payment plans', 'Location']
  });
  
  const [customDescription, setCustomDescription] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isImprovingAI, setIsImprovingAI] = useState(false);

  // Redirect if no property
  useEffect(() => {
    if (!property) {
      message.error("No property selected");
      navigate(-1);
    }
  }, [property, navigate]);

  // Set initial description
  useEffect(() => {
    if (property?.description) {
      setCustomDescription(property.description);
    } else {
      setCustomDescription(`Experience luxury living in this exquisite ${property?.propertyType || 'property'} located in the heart of ${property?.city || 'Dubai'}. This stunning residence offers premium finishes, intelligent design, and world-class amenities that redefine modern living.`);
    }
  }, [property]);

  if (!property) return null;

  const handleUploadAndShare = async () => {
    if (!lead?._id || !property?._id) {
      message.error('Lead or Property information missing');
      return;
    }

    setUploading(true);
    message.loading({ content: 'Generating and uploading brochure...', key: 'upload' });

    try {
      // 1. Generate HTML
      const html = generateBrochureHTML(property, lead, preferences, customDescription);

      // 2. Convert HTML → File (VERY IMPORTANT 🔥)
      const blob = new Blob([html], { type: "text/html" });
      const file = new File([blob], `${property?.propertyName || "brochure"}.html`, {
        type: "text/html"
      });

      // 3. Prepare FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("leadId", lead._id);
      formData.append("propertyId", property._id);

      const interestId = lead?.interests?.find(
        i => i.property?._id === property._id
      )?._id;

      if (interestId) {
        formData.append("interestId", interestId);
      }

      // 4. API Call (multipart)
      const response = await apiService.post(
        "/brochure/upload-brochure",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      // 5. Handle response
      if (response?.success) {
        setShareLink(response.data.shareLink);
        setBrochureId(response.data.brochureId);

        message.success({
          content: '✅ Brochure uploaded! Share link created.',
          key: 'upload'
        });
      } else {
        throw new Error(response?.message || "Upload failed");
      }

    } catch (error) {
      console.error('Upload error:', error);

      message.error({
        content: error.message || 'Failed to upload brochure',
        key: 'upload'
      });
    } finally {
      setUploading(false);
    }
  };

  // Languages
  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'AR', name: 'Arabic' },
    { code: 'HI', name: 'Hindi' },
    { code: 'RU', name: 'Russian' },
    { code: 'ZH', name: 'Chinese' },
    { code: 'FA', name: 'Persian' }
  ];

  // Currencies
  const currencies = [
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'INR', name: 'Indian Rupee' }
  ];

  // Handle preview
  const handlePreview = () => {
    setLoading(true);
    setTimeout(() => {
      const html = generateBrochureHTML(property, lead, preferences, customDescription);
      setPreviewHtml(html);
      setActiveTab('preview');
      setLoading(false);
    }, 500);
  };

  // Handle download
  const handleDownload = () => {
    setGenerating(true);
    setTimeout(() => {
      const html = generateBrochureHTML(property, lead, preferences, customDescription);
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${property?.propertyName || 'property'}_brochure.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setGenerating(false);
      message.success('Brochure downloaded successfully!');
    }, 1000);
  };

  // Improve with AI
  const handleImproveWithAI = () => {
    if (!customDescription) {
      message.warning('Please enter some description first!');
      return;
    }

    setIsImprovingAI(true);
    message.loading({ content: 'AI is enhancing the description...', key: 'ai' });

    setTimeout(() => {
      const developerName = property?.developer?.name || 'the developer';
      const propertyType = property?.propertyType || 'property';
      const location = property?.city || 'Dubai';
      
      const improved = `✨ **Luxury Redefined in the Heart of ${location}**\n\n${customDescription}\n\n**Key Highlights:**\n• 🏗️ Developed by renowned ${developerName}\n• 📍 Prime location in ${property?.area || location}\n• 🏠 Spacious ${property?.bedrooms || ''} bedroom ${propertyType}\n• 💎 Premium finishes throughout\n• 🌊 Breathtaking views\n• 🏊 World-class amenities\n\nThis exceptional residence represents the perfect blend of sophisticated design, uncompromising quality, and unparalleled lifestyle. Every detail has been meticulously crafted to create a home that exceeds expectations.\n\n**Why You'll Love It:**\n✓ Exclusive community\n✓ State-of-the-art facilities\n✓ Smart home technology\n✓ 24/7 security and concierge\n✓ Easy access to major attractions\n\nDon't miss this opportunity to own a piece of paradise in one of Dubai's most sought-after locations.`;
      
      setCustomDescription(improved);
      setIsImprovingAI(false);
      message.success({ content: 'Description enhanced!', key: 'ai', duration: 2 });
    }, 2000);
  };

  // Get main image
  const getMainImage = () => {
    return property?.photos?.[0] || 
           property?.mainLogo || 
           'https://via.placeholder.com/1200x800?text=Property+Image';
  };

  return (
    <div className="p-6 md:p-10 bg-[#f6f7fb] min-h-screen">
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)} 
            className="mb-2 text-gray-500 hover:text-indigo-600 -ml-3"
          >
            Back to Lead
          </Button>
          <Title level={3} className="!mb-1 text-gray-800 flex items-center gap-2">
            <FilePdfOutlined className="text-indigo-600" /> Brochure Factory
          </Title>
          <Text type="secondary">Craft and track personalized presentations</Text>
        </div>
      </div>

      {/* ---------------- PROPERTY SUMMARY CARD ---------------- */}
      <Card className="mb-6 shadow-sm rounded-2xl border-none overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 h-56 md:h-auto relative bg-gray-100">
            <img 
              src={getMainImage()} 
              alt={property?.propertyName}
              className="w-full h-full object-cover"
            />
            {matchScore && (
              <div className="absolute top-4 left-4">
                <Tag color="success" className="px-3 py-1 rounded-full font-bold text-sm border-none shadow-md backdrop-blur-md bg-green-500/90 text-white m-0">
                  {matchScore}% Match for {lead?.name?.first_name}
                </Tag>
              </div>
            )}
          </div>
          <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col justify-center bg-white">
            <div className="mb-6">
              <Title level={3} className="!mb-1 text-gray-800">{property?.propertyName}</Title>
              <Text type="secondary" className="text-base flex items-center gap-1">
                <EnvironmentOutlined /> {property?.city}, {property?.country || 'UAE'}
              </Text>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <Text type="secondary" className="text-[11px] uppercase font-bold tracking-wider block mb-1">Price</Text>
                <Text strong className="text-indigo-600 text-lg">
                  {property?.price?.toLocaleString()} {property?.currency || 'AED'}
                </Text>
              </div>
              <div>
                <Text type="secondary" className="text-[11px] uppercase font-bold tracking-wider block mb-1">Developer</Text>
                <Text strong className="text-gray-700 text-base">{property?.developer?.name || 'Developer'}</Text>
              </div>
              <div>
                <Text type="secondary" className="text-[11px] uppercase font-bold tracking-wider block mb-1">Bedrooms</Text>
                <Text strong className="text-gray-700 text-base">{property?.bedrooms || property?.unitType?.[0] || 'N/A'}</Text>
              </div>
              <div>
                <Text type="secondary" className="text-[11px] uppercase font-bold tracking-wider block mb-1">Handover</Text>
                <Text strong className="text-gray-700 text-base">{property?.handover ? new Date(property.handover).toLocaleDateString() : 'TBA'}</Text>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ---------------- MAIN EDITOR & PREVIEW ---------------- */}
      <Card className="shadow-sm rounded-2xl border-none custom-brochure-tabs">
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          
          {/* CUSTOMIZE TAB */}
          <TabPane tab={<span className="font-medium px-2"><SettingOutlined /> Customize Design</span>} key="customize">
            <div className="p-2 md:p-4 space-y-8">
              
              {/* Grid 1: Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                <div>
                  <label className="font-bold text-gray-700 block mb-2 text-sm uppercase tracking-wide">
                    <GlobalOutlined className="mr-2 text-indigo-500" /> Language
                  </label>
                  <Select 
                    value={preferences.language}
                    onChange={(val) => setPreferences({...preferences, language: val})}
                    className="w-full" size="large"
                  >
                    {languages.map(lang => <Option key={lang.code} value={lang.code}>{lang.name}</Option>)}
                  </Select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-2 text-sm uppercase tracking-wide">
                    <DollarCircleOutlined className="mr-2 text-indigo-500" /> Currency
                  </label>
                  <Select 
                    value={preferences.currency}
                    onChange={(val) => setPreferences({...preferences, currency: val})}
                    className="w-full" size="large"
                  >
                    {currencies.map(curr => <Option key={curr.code} value={curr.code}>{curr.name}</Option>)}
                  </Select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-2 text-sm uppercase tracking-wide">
                    <HomeOutlined className="mr-2 text-indigo-500" /> Area Unit
                  </label>
                  <Select 
                    value={preferences.areaUnit}
                    onChange={(val) => setPreferences({...preferences, areaUnit: val})}
                    className="w-full" size="large"
                  >
                    <Option value="sqft">Square Feet (sqft)</Option>
                    <Option value="sqm">Square Meters (m²)</Option>
                  </Select>
                </div>
              </div>

              {/* Grid 2: Included Sections */}
              <div>
                <label className="font-bold text-gray-800 block mb-4 text-base">
                  <FilePdfOutlined className="mr-2 text-indigo-500" /> Include Sections
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  {['Cover slide', 'Project description', 'Developer', 'Unit prices', 'Payment plans', 'Location'].map(slide => (
                    <Checkbox
                      key={slide}
                      checked={preferences.slides.includes(slide)}
                      onChange={(e) => {
                        const newSlides = e.target.checked
                          ? [...preferences.slides, slide]
                          : preferences.slides.filter(s => s !== slide);
                        setPreferences({...preferences, slides: newSlides});
                      }}
                      className="text-gray-700 text-sm font-medium"
                    >
                      {slide}
                    </Checkbox>
                  ))}
                </div>
              </div>

              {/* Grid 3: Description Editor */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="font-bold text-gray-800 block text-base">
                    <EditOutlined className="mr-2 text-indigo-500" /> Property Narrative
                  </label>
                  <Button 
                    type="primary"
                    icon={<RobotOutlined />}
                    onClick={handleImproveWithAI}
                    loading={isImprovingAI}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 border-none shadow-md"
                  >
                    Magic Enhance (AI)
                  </Button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  {isEditingDesc ? (
                    <TextArea
                      rows={8}
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Write a compelling property description..."
                      className="border-none shadow-none focus:ring-0 p-4 text-gray-700 text-base"
                    />
                  ) : (
                    <div className="bg-gray-50 p-6 max-h-64 overflow-y-auto text-gray-700 text-base whitespace-pre-wrap">
                      {customDescription}
                    </div>
                  )}
                  <div className="bg-gray-100 px-4 py-3 flex justify-end border-t border-gray-200">
                    <Button 
                      type={isEditingDesc ? "primary" : "default"}
                      onClick={() => setIsEditingDesc(!isEditingDesc)}
                      className={isEditingDesc ? "bg-indigo-600" : ""}
                    >
                      {isEditingDesc ? 'Save Description' : 'Edit Text Manually'}
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </TabPane>

          {/* PREVIEW TAB */}
          <TabPane tab={<span className="font-medium px-2"><EyeOutlined /> Live Preview</span>} key="preview">
            <div className="p-2 md:p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-xl border border-gray-100">
                  <Spin size="large" />
                  <p className="mt-4 text-gray-500 font-medium">Rendering your masterpiece...</p>
                </div>
              ) : previewHtml ? (
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-inner bg-white" style={{ height: '70vh' }}>
                  <iframe
                    srcDoc={previewHtml}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Brochure Preview"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <FilePdfOutlined className="text-6xl text-gray-300 mb-4" />
                  <Text type="secondary" className="text-lg">Click "Preview" below to compile the brochure.</Text>
                </div>
              )}
            </div>
          </TabPane>
        </Tabs>

        <Divider className="my-0" />

        {/* ---------------- ACTIONS & EXPORT FOOTER ---------------- */}
        <div className="p-6 bg-white rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="large" icon={<EyeOutlined />} onClick={handlePreview} loading={loading} className="flex-1 font-medium rounded-xl h-12">
              Generate Preview
            </Button>
            <Button size="large" icon={<DownloadOutlined />} onClick={handleDownload} loading={generating} className="flex-1 font-medium rounded-xl h-12 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
              Download PDF Offline
            </Button>
            
            {!shareLink && (
              <Button 
                type="primary" 
                size="large" 
                icon={<UploadOutlined />} 
                onClick={handleUploadAndShare} 
                loading={uploading} 
                className="flex-1 font-medium rounded-xl h-12 bg-emerald-500 hover:bg-emerald-600 border-none shadow-md"
              >
                {uploading ? 'Publishing...' : 'Upload & Generate Tracking Link'}
              </Button>
            )}
          </div>

          {/* ---------------- SHARE SUCCESS BOX ---------------- */}
          {shareLink && (
            <div className="mt-6 p-6 md:p-8 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircleFilled className="text-3xl text-emerald-500" />
                  <div>
                    <Title level={4} className="!mb-0 text-emerald-900">Brochure Published & Ready!</Title>
                    <Text className="text-emerald-700 font-medium">Tracking is active. You will see analytics when the client opens it.</Text>
                  </div>
                </div>
                <Tag color="success" className="px-4 py-1.5 rounded-full text-sm font-bold border-emerald-300">
                  <EyeOutlined className="mr-1" /> Live Tracking On
                </Tag>
              </div>
              
              <div className="bg-white p-2 pl-4 rounded-xl border border-emerald-200 flex items-center gap-3 mb-6 shadow-inner">
                <LinkOutlined className="text-emerald-500 text-lg" />
                <Input 
                  value={shareLink} 
                  readOnly 
                  bordered={false}
                  className="flex-1 text-base font-medium text-gray-700 bg-transparent cursor-pointer"
                  onClick={(e) => e.target.select()}
                />
                <Button 
                  type="primary"
                  icon={<CopyOutlined />}
                  size="large"
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-600 border-none px-6"
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    message.success('Tracking Link copied to clipboard!');
                  }}
                >
                  Copy Link
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Information Panel */}
                <div className="bg-white/60 p-5 rounded-xl border border-emerald-100">
                  <Text strong className="text-emerald-800 flex items-center gap-2 mb-3">
                    <InfoCircleOutlined /> What gets tracked?
                  </Text>
                  <ul className="space-y-2 text-sm text-emerald-700/90 font-medium">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Exact time they open the brochure</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Device type (Mobile vs Desktop)</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Automatic +15 Engagement Score boost</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Pipeline status updates to "Viewed"</li>
                  </ul>
                  <Divider className="my-3 border-emerald-200" />
                  <Text className="text-xs text-emerald-600 font-mono">Sys ID: {brochureId?.slice(-8)}</Text>
                </div>

                {/* Share Actions */}
                <div className="flex flex-col gap-3 justify-center">
                  <Button 
                    size="large"
                    icon={<WhatsAppOutlined className="text-xl" />} 
                    onClick={() => {
                      const phone = lead?.phone_number?.replace(/\D/g, '');
                      const msgText = encodeURIComponent(
                        `🏠 *${property?.propertyName}* - Exclusive Brochure\n\nHi ${lead?.name?.first_name}, here is your personalized presentation:\n\n🔗 ${shareLink}\n\nLet me know your thoughts!`
                      );
                      window.open(`https://wa.me/${phone}?text=${msgText}`, '_blank');
                    }}
                    className="w-full h-14 rounded-xl text-white font-bold text-base hover:opacity-90 flex items-center justify-center border-none shadow-md"
                    style={{ background: '#25D366' }}
                    disabled={!lead?.phone_number}
                  >
                    Send via WhatsApp
                  </Button>
                  
                  <Button 
                    size="large"
                    icon={<MailOutlined className="text-xl" />} 
                    onClick={() => {
                      const subject = encodeURIComponent(`Exclusive Property Brochure: ${property?.propertyName}`);
                      const body = encodeURIComponent(
                        `Hi ${lead?.name?.first_name},\n\nI have prepared a detailed brochure for ${property?.propertyName} specifically for you.\n\nYou can view it here:\n${shareLink}\n\nPlease let me know if you have any questions!\n\nBest regards.`
                      );
                      window.open(`mailto:${lead?.email}?subject=${subject}&body=${body}`, '_blank');
                    }}
                    className="w-full h-14 rounded-xl text-white font-bold text-base hover:opacity-90 flex items-center justify-center border-none shadow-md"
                    style={{ background: '#4F46E5' }}
                    disabled={!lead?.email}
                  >
                    Send via Email
                  </Button>
                  
                  {(!lead?.phone_number || !lead?.email) && (
                    <Text className="text-center text-xs font-semibold text-emerald-600 mt-1">
                      ⚠️ Lead profile is missing phone or email data.
                    </Text>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </Card>

      {/* Global Style overrides to make Tabs look clean */}
      <style>{`
        .custom-brochure-tabs .ant-tabs-nav {
          padding: 0 24px;
          margin-bottom: 0 !important;
          border-bottom: 1px solid #f0f0f0;
        }
        .custom-brochure-tabs .ant-tabs-tab {
          padding: 16px 0 !important;
        }
      `}</style>
    </div>
  );
}