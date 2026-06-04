import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Card, Typography, Tag, Button, Space, 
  message, Spin, Modal, Tooltip, Avatar, Divider, Progress, Empty
} from "antd";
import { 
  CopyOutlined, EyeOutlined, LinkOutlined, 
  ClockCircleOutlined, DesktopOutlined, MobileOutlined,
  GlobalOutlined, ArrowLeftOutlined, FireOutlined, FilePdfOutlined,
  RiseOutlined, CheckCircleOutlined, SyncOutlined, CompassOutlined
} from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

const getApiBaseUrl = () => {
  const base = import.meta.env?.VITE_API_URL || "http://localhost:5000";
  return base.endsWith("/api") ? base : `${base}/api`;
};

const normalizePresentation = (presentation) => {
  const apiBaseUrl = getApiBaseUrl();
  const trackingToken = presentation?.trackingToken || presentation?.trackingId;
  const trackingUrl =
    presentation?.trackingUrl ||
    presentation?.shareLink ||
    (trackingToken ? `${apiBaseUrl}/presentation/track/${trackingToken}` : "");
  const views = Array.isArray(presentation?.views)
    ? presentation.views.map((view) => ({
        ...view,
        viewedAt: view.viewedAt || view.timestamp,
      }))
    : [];
  const lastView = views[views.length - 1];

  return {
    ...presentation,
    trackingId: trackingToken || presentation?._id,
    shareLink: trackingUrl,
    fileUrl:
      presentation?.fileUrl ||
      presentation?.s3Url ||
      (trackingToken ? `${apiBaseUrl}/presentation/pdf/${trackingToken}` : trackingUrl),
    viewCount: presentation?.viewCount ?? views.length,
    lastViewedAt: presentation?.lastViewedAt || lastView?.viewedAt,
    views,
    propertyId: presentation?.propertyId || presentation?.property || null,
    interestId: presentation?.interestId || {
      conversion_stage: presentation?.status,
      engagement_score: presentation?.engagementScore || 0,
      conversion_probability: Math.min(presentation?.engagementScore || 0, 100),
    },
  };
};

const getLeadPresentations = (lead) =>
  Array.isArray(lead?.presentations)
    ? lead.presentations.map((presentation) =>
        normalizePresentation({
          ...presentation,
          _id: presentation?._id || presentation?.presentation_id,
          leadId: lead,
          trackingId: presentation?.tracking_link,
          shareLink: presentation?.tracking_link,
          viewCount: presentation?.engagement?.view_count,
          lastViewedAt: presentation?.engagement?.viewed_at,
          views: presentation?.engagement?.viewed_at
            ? [
                {
                  viewedAt: presentation.engagement.viewed_at,
                  device: presentation.engagement.device_type,
                },
              ]
            : [],
        })
      )
    : [];

const getPresentationPropertyName = (brochure, property) => {
  const titleName = brochure?.title?.split("—")?.[0]?.trim();
  return (
    property?.propertyName ||
    property?.projectName ||
    brochure?.propertyName ||
    titleName ||
    "Unknown Property"
  );
};

const getPresentationPrice = (property) =>
  property?.price ||
  property?.price_min ||
  property?.priceRange?.from ||
  null;

export default function TrackBrochure() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract lead info from navigation state
  const navLead = location.state?.lead;
  const leadId = navLead?._id || location.state?.leadId;

  const [loading, setLoading] = useState(true);
  const [brochures, setBrochures] = useState([]);
  
  // Modal state for detailed viewing history
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

  // Dynamic Image URL Builder
  const placeholderImg = "https://via.placeholder.com/400x250?text=No+Image+Available";
  const backendBaseUrl = import.meta.env?.VITE_API_URL || "http://localhost:5000";

  const getImageUrl = (property) => {
    const photos = property?.photos;
    let imageUrl = property?.image || property?.mainLogo || property?.media?.mainLogo;
    if (!imageUrl && Array.isArray(photos)) {
      imageUrl = photos[0];
    }
    if (!imageUrl && photos && typeof photos === "object") {
      imageUrl =
        photos.architecture?.[0] ||
        photos.interior?.[0] ||
        photos.lobby?.[0] ||
        photos.other?.[0];
    }
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${backendBaseUrl}${imageUrl}`;
    }
    return imageUrl || placeholderImg;
  };

  useEffect(() => {
    const fetchTrackingData = async () => {
      if (!leadId) {
        message.error("No lead context provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.get("/presentation/my", { leadId, limit: 100 });
        const list = response?.data?.data || response?.data || response?.data?.presentations || [];
        setBrochures((Array.isArray(list) ? list : []).map(normalizePresentation));
      } catch (error) {
        console.error("Failed to fetch tracking data:", error);
        const fallbackList = getLeadPresentations(navLead);
        setBrochures(fallbackList);
        if (fallbackList.length === 0) {
          message.error("Could not load brochure tracking data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [leadId, navLead]);

  // Utility: Copy link to clipboard
  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    message.success("Tracking link copied to clipboard!");
  };

  // Utility: Format Dates securely
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', 
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const formatStageString = (str) => {
    if (!str) return "N/A";
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Open detailed history modal
  const handleViewHistory = (brochure) => {
    setSelectedHistory(brochure);
    setIsHistoryModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#faf5ff]">
        <Spin size="large" />
        <Text className="mt-4 text-lg font-medium text-[#8a70a8]">Fetching tracking intelligence...</Text>
      </div>
    );
  }

  const displayLead = brochures.length > 0 ? brochures[0].leadId : navLead;

  return (
    <div className="agency-track-page p-6 md:p-10 space-y-6 min-h-screen">
      <style>{`
        .agency-track-page {
          --agency-primary: #5c039b;
          --agency-primary-2: #7c3aed;
          --agency-soft: #f3e8ff;
          --agency-bg: #faf5ff;
          --agency-surface: #ffffff;
          --agency-border: #e9d5ff;
          --agency-border-strong: #d8b4fe;
          --agency-text: #140d2a;
          --agency-muted: #8a70a8;
          background: var(--agency-bg);
          color: var(--agency-text);
          font-family: 'Inter', sans-serif;
        }

        .agency-track-header,
        .agency-empty-state,
        .agency-presentation-card {
          border: 1.5px solid var(--agency-border) !important;
          border-radius: 14px !important;
          box-shadow: 0 2px 8px rgba(92, 3, 155, 0.07) !important;
          background: var(--agency-surface) !important;
        }

        .agency-back-btn {
          color: var(--agency-primary) !important;
          font-weight: 700 !important;
          padding-left: 0 !important;
        }

        .agency-track-title {
          color: var(--agency-text) !important;
          font-family: 'Sora', sans-serif !important;
          font-weight: 800 !important;
        }

        .agency-track-stat {
          background: var(--agency-soft) !important;
          border: 1.5px solid var(--agency-border) !important;
          border-radius: 14px !important;
          box-shadow: inset 0 1px 8px rgba(92, 3, 155, 0.05) !important;
        }

        .agency-track-stat-green {
          background: rgba(16, 185, 129, 0.08) !important;
          border-color: rgba(16, 185, 129, 0.22) !important;
        }

        .agency-card-heading,
        .agency-metric-column,
        .agency-action-column {
          border-color: var(--agency-border) !important;
        }

        .agency-track-id,
        .agency-interaction-box,
        .agency-log-chip {
          background: #fbf7ff !important;
          border: 1px solid var(--agency-border) !important;
          color: var(--agency-text) !important;
        }

        .agency-secondary-btn {
          border-color: var(--agency-border-strong) !important;
          color: var(--agency-primary) !important;
          background: var(--agency-surface) !important;
          font-weight: 700 !important;
        }

        .agency-secondary-btn:hover {
          border-color: var(--agency-primary) !important;
          background: var(--agency-soft) !important;
          color: var(--agency-primary) !important;
        }

        .agency-primary-btn {
          background: var(--agency-primary) !important;
          border-color: var(--agency-primary) !important;
          color: #fff !important;
          font-weight: 700 !important;
        }

        .agency-primary-btn:hover {
          background: var(--agency-primary-2) !important;
          border-color: var(--agency-primary-2) !important;
        }

        .agency-history-modal .ant-modal-content,
        .agency-history-modal .ant-modal-header {
          border-radius: 14px !important;
        }

        .agency-history-modal .ant-modal-body {
          padding: 0 !important;
        }
      `}</style>
      
      {/* ---------------- HEADER ---------------- */}
      <div className="agency-track-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6">
        <div>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)} 
            className="agency-back-btn mb-2 -ml-3 transition-colors"
          >
            Back to Lead Details
          </Button>
          <Title level={3} className="agency-track-title !mb-1 flex items-center gap-3">
            <FireOutlined className="text-[#5c039b]" /> Client Engagement Matrix
          </Title>
          {displayLead && (
             <div className="flex items-center gap-3 mt-2">
               <Text className="text-base text-[#8a70a8]">
                 Tracking analytics for <Text strong className="text-[#5c039b] text-base">{displayLead?.name?.first_name} {displayLead?.name?.last_name}</Text>
               </Text>
               <Tag className="rounded-full px-3 py-0.5 border-none font-bold uppercase tracking-wider text-[10px] shadow-sm bg-[#f3e8ff] text-[#5c039b]">
                 Global Status: {displayLead?.status}
               </Tag>
             </div>
          )}
        </div>
        
        {/* Quick summary stats */}
        <div className="flex gap-4">
          <div className="agency-track-stat px-6 py-4 text-center min-w-[130px]">
            <Text className="text-[10px] font-extrabold uppercase tracking-widest block mb-1 text-[#8a70a8]">Total Sent</Text>
            <Title level={3} className="!mb-0 !text-[#5c039b]">{brochures.length}</Title>
          </div>
          <div className="agency-track-stat agency-track-stat-green px-6 py-4 text-center min-w-[130px]">
            <Text className="text-[10px] font-extrabold uppercase tracking-widest block mb-1 text-[#059669]">Total Opens</Text>
            <Title level={3} className="!mb-0 !text-[#059669]">
              {brochures.reduce((acc, curr) => acc + (curr.viewCount || 0), 0)}
            </Title>
          </div>
        </div>
      </div>

      {/* ---------------- MAIN DASHBOARD CARDS ---------------- */}
      <div className="space-y-6">
        {brochures.length === 0 ? (
          <div className="agency-empty-state py-24 text-center">
            <FilePdfOutlined className="text-7xl text-[#d8b4fe] mb-5 block" />
            <Title level={4} className="!text-[#140d2a] !mb-2">No Brochures Found</Title>
            <Text className="text-base text-[#8a70a8]">This lead hasn't been sent any AI property presentations yet.</Text>
          </div>
        ) : (
          brochures.map((brochure) => {
            const prop = typeof brochure.propertyId === "object" ? brochure.propertyId : null;
            const interest = brochure.interestId;
            const aiMatch = interest?.ai_match;
            const imgUrl = getImageUrl(prop);
            const propertyName = getPresentationPropertyName(brochure, prop);
            const propertyPrice = getPresentationPrice(prop);

            return (
              <Card 
                key={brochure._id} 
                className="agency-presentation-card transition-all duration-300 overflow-hidden"
                bodyStyle={{ padding: '0' }}
              >
                {/* Changed to lg:flex-row to ensure it stays horizontal on larger screens without squishing */}
                <div className="flex flex-col lg:flex-row items-stretch">
                  
                  {/* 1. LEFT: Fixed-Width Property Image & Title */}
                  <div className="relative w-full lg:w-80 h-64 lg:h-auto flex-shrink-0 bg-[#f3e8ff] border-r border-[#e9d5ff]">
                    <img 
                      src={imgUrl} 
                      alt={propertyName} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                    />
                    
                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    {/* Top Right Match Tag */}
                    {aiMatch?.score && (
                      <div className="absolute top-4 right-4">
                        <Tag className="m-0 rounded-full px-3 py-1 border-white/20 shadow-lg font-bold backdrop-blur-md bg-white/90 text-[#5c039b]">
                          {aiMatch.score}% Match
                        </Tag>
                      </div>
                    )}
                    
                    {/* Bottom Property Info overlaid on image */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <Title level={4} className="!mb-1 !text-white drop-shadow-md line-clamp-1" title={propertyName}>
                        {propertyName}
                      </Title>
                      <Text className="text-white/90 drop-shadow-md font-medium text-sm">
                        {propertyPrice ? `${propertyPrice.toLocaleString()} AED` : "Price N/A"}
                      </Text>
                    </div>
                  </div>

                  {/* 2. RIGHT: Content Grid Container */}
                  <div className="flex-1 p-6 flex flex-col">
                    
                    {/* Top Header Row */}
                    <div className="agency-card-heading flex justify-between items-center mb-6 pb-4 border-b">
                      <Text className="text-xs font-bold uppercase tracking-widest text-[#8a70a8]">
                        Tracking Intelligence
                      </Text>
                      <div className="agency-track-id px-3 py-1.5 rounded-lg flex items-center">
                        <Text className="text-[10px] uppercase font-bold tracking-wider mr-2 text-[#8a70a8]">Track ID:</Text>
                        <Text strong className="font-mono text-[#140d2a] text-xs">{brochure.trackingId}</Text>
                      </div>
                    </div>

                    {/* 3-Column Stats Grid (This guarantees it won't squish) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                       
                       {/* Column 1: Pipeline Health */}
                       <div className="flex flex-col gap-4">
                          <div>
                            <Text className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-[#8a70a8]">Current Stage</Text>
                            <Tag className="rounded-md px-3 py-1 border-none font-semibold m-0 text-sm w-max bg-[#f3e8ff] text-[#5c039b]">
                              <CheckCircleOutlined className="mr-1"/> {formatStageString(interest?.conversion_stage)}
                            </Tag>
                          </div>
                          
                          <div className="flex gap-4 items-center">
                            <div className="flex-1">
                              <Text className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-[#8a70a8]">Engagement</Text>
                              <div className="flex items-center gap-1.5">
                                <FireOutlined className="text-[#5c039b] text-lg" />
                                <Text strong className="text-lg text-[#140d2a]">{interest?.engagement_score || 0} pts</Text>
                              </div>
                            </div>
                            
                            <div className="agency-metric-column flex-1 border-l pl-4">
                              <Text className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-[#8a70a8]">AI Prob.</Text>
                              <Progress percent={interest?.conversion_probability || 0} size="small" strokeColor="#5c039b" className="m-0" />
                            </div>
                          </div>
                       </div>

                       {/* Column 2: Brochure Metrics */}
                       <div className="agency-metric-column flex flex-col gap-4 md:border-l md:pl-6">
                        <div>
  <Text
    className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-[#8a70a8]"
  >
    Total Opens
  </Text>

  <Tag
    className={`rounded-lg px-3 py-1 border-none shadow-sm m-0 font-bold text-sm ${brochure.viewCount > 0 ? "bg-[#dcfce7] text-[#059669]" : "bg-[#f3e8ff] text-[#8a70a8]"}`}
  >
    <EyeOutlined className="mr-1.5" />
    {brochure.viewCount || 0} Views
  </Tag>
</div>
                          <div>
                            <Text className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-[#8a70a8]">Last Interaction</Text>
                            {brochure.viewCount > 0 ? (
                              <div className="agency-interaction-box px-3 py-2 rounded-lg flex items-center gap-2">
                                <ClockCircleOutlined className="text-[#5c039b]" />
                                <Text strong className="text-xs text-[#140d2a]">{formatDate(brochure.lastViewedAt)}</Text>
                              </div>
                            ) : (
                              <Text className="text-xs italic text-[#8a70a8]">No interactions yet</Text>
                            )}
                          </div>
                       </div>

                       {/* Column 3: Action Buttons */}
                       <div className="agency-action-column flex flex-col gap-3 justify-center md:border-l md:pl-6">
                         <Button 
                           type="dashed" 
                           icon={<CopyOutlined />} 
                           onClick={() => handleCopyLink(brochure.shareLink)}
                           className="agency-secondary-btn rounded-xl"
                         >
                           Copy Track Link
                         </Button>
                         <Button 
                           icon={<LinkOutlined />} 
                           href={brochure.fileUrl} 
                           target="_blank" 
                           className="agency-secondary-btn rounded-xl"
                         >
                           Open Live PDF
                         </Button>
                         <Button 
                           type="primary" 
                           icon={<RiseOutlined />}
                           onClick={() => handleViewHistory(brochure)} 
                           disabled={brochure.viewCount === 0} 
                           className="agency-primary-btn rounded-xl border-none shadow-sm"
                         >
                           View Access Logs
                         </Button>
                       </div>
                       
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* ---------------- DETAILED HISTORY MODAL (CARD LAYOUT) ---------------- */}
      <Modal
        title={
          <div className="flex items-center gap-3 py-3">
            <Avatar size={48} className="bg-[#f3e8ff] text-[#5c039b] border border-[#e9d5ff]" icon={<EyeOutlined />} />
            <div>
              <Title level={4} className="!mb-0 !text-[#140d2a]">Access History Log</Title>
              <Text className="text-sm font-medium text-[#8a70a8]">
                {getPresentationPropertyName(selectedHistory, selectedHistory?.propertyId)}
              </Text>
            </div>
          </div>
        }
        open={isHistoryModalOpen}
        onCancel={() => setIsHistoryModalOpen(false)}
        footer={null}
        width={750}
        centered
        destroyOnClose
        className="agency-history-modal"
      >
        <Divider className="my-0" />
        
        {/* Modal Stats Header */}
        <div className="bg-[#fbf7ff] p-5 border-b border-[#e9d5ff] flex flex-wrap gap-6 justify-between">
          <div>
            <Text className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-[#8a70a8]">First Opened</Text>
            <Text strong className="text-[#140d2a]">
              {selectedHistory?.views?.length > 0 ? formatDate(selectedHistory.views[0].viewedAt) : "—"}
            </Text>
          </div>
          <div>
            <Text className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-[#8a70a8]">Last Opened</Text>
            <Text strong className="text-[#5c039b]">
              {formatDate(selectedHistory?.lastViewedAt)}
            </Text>
          </div>
          <div className="text-right">
            <Text className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-[#059669]">Total Opens</Text>
            <Tag className="m-0 rounded-lg px-3 font-bold border-none bg-[#dcfce7] text-[#059669]">
              {selectedHistory?.viewCount} Views
            </Tag>
          </div>
        </div>

        {/* History Log Cards */}
        <div className="p-5 max-h-[500px] overflow-y-auto space-y-4 bg-white">
          {selectedHistory?.views?.length > 0 ? (
            [...selectedHistory.views].reverse().map((view, index) => {
              const isMobile = view.device?.toLowerCase().includes('mobile');
              
              return (
                <div key={view._id} className="flex items-start gap-4 p-4 bg-white border border-[#e9d5ff] rounded-2xl shadow-sm hover:border-[#d8b4fe] transition-colors group">
                  
                  <div className={`p-4 rounded-xl flex-shrink-0 ${isMobile ? 'bg-[#eef2ff] text-[#5c039b]' : 'bg-[#f3e8ff] text-[#5c039b]'}`}>
                    {isMobile ? <MobileOutlined className="text-2xl" /> : <DesktopOutlined className="text-2xl" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Text strong className="text-[#140d2a] text-base block">{formatDate(view.viewedAt)}</Text>
                        <Text className="text-xs uppercase font-bold tracking-wider text-[#8a70a8]">{view.device || 'Unknown Device'}</Text>
                      </div>
                      <Tag className="rounded-full border-[#e9d5ff] bg-[#f3e8ff] text-[#5c039b] font-bold m-0">
                        Log #{selectedHistory.views.length - index}
                      </Tag>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-3">
                      <div className="agency-log-chip flex items-center gap-1.5 px-2.5 py-1 rounded-lg w-max">
                        <GlobalOutlined className="text-[#8a70a8]" />
                        <Text className="font-mono text-xs text-[#140d2a]">{view.ip}</Text>
                      </div>
                      
                      <Tooltip title={view.userAgent}>
                        <div className="agency-log-chip flex items-center gap-1.5 px-2.5 py-1 rounded-lg overflow-hidden flex-1 cursor-help">
                          <CompassOutlined className="text-[#8a70a8] flex-shrink-0" />
                          <Text className="text-xs text-[#140d2a] truncate">{view.userAgent}</Text>
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <Empty description="No tracking logs recorded yet." className="py-10" />
          )}
        </div>
      </Modal>

    </div>
  );
}
