import React, { useEffect, useState } from "react";
import { Card, Typography, Row, Col, Spin, Empty, Select, notification, Modal, Button } from "antd"; 
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import { Download, Eye, Sparkles } from "lucide-react"; 

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const BRAND_PURPLE = "#5C039B"; // Ensure we have the same brand color

const ViewLibrary = () => {
  const [displayData, setDisplayData] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Landscaping"); 

  // ✅ New Modal States
  const [showGeneratedModal, setShowGeneratedModal] = useState(false);
  const [currentResult, setCurrentResult] = useState({ 
    url: '', desc: '', styleName: '', elementsList: [], instruction: '' 
  });

  const fetchLibrary = async (category) => {
    try {
      setLoading(true);
      let endpoint = "";

      if (category === "Landscaping") {
        endpoint = "/ai/get-landscape-designs";
      } 
      else if (category === "Interior AI") {
        endpoint = "/ai/get-interior-designs";
      } 
      else if (category === "Sky Replacement") {
        endpoint = "/ai/sky-replacement/get-sky-library"; 
      } 
      else if (category === "Virtual Staging") {
        endpoint = "/ai/virtual-staging/get-staging-library"; 
      } 
      else if (category === "Image Enhancer") {
        endpoint = "/ai/enhance/get-customer-liabrary"; 
      } 
      else {
        setDisplayData([]);
        setLoading(false);
        return;
      }

      
      const res = await apiService.get(endpoint);
      

      let rawData = [];
      if (Array.isArray(res)) {
        rawData = res; 
      } else if (res?.data && Array.isArray(res.data)) {
        rawData = res.data; 
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        rawData = res.data.data; 
      } else if (res?.data?.images && Array.isArray(res.data.images)) {
        rawData = res.data.images; 
      }

      

      let formatted = [];

      rawData.forEach((item, index) => {
        if (typeof item === "string") {
          formatted.push({ id: index, image: item, category });
        } 
        else if (item.images && Array.isArray(item.images)) {
          item.images.forEach((imgUrl, i) => {
            formatted.push({
              id: item._id ? `${item._id}-${i}` : `${index}-${i}`,
              image: imgUrl,
              category,
              // Fallback params if present
              styleName: item.styleName || null,
              elements: item.elements || [],
              description: item.description || item.summary || null
            });
          });
        } 
        else {
          const imgUrl = item.imageUrl || item.image || item.url || item.enhancedImage || item.enhancedUrl || item.output || item.stagedImage?.url;
          
          if (imgUrl) {
            formatted.push({ 
              id: item._id || index, 
              image: imgUrl, 
              category,
              // ✅ Caputuring Preferences data for the Modal
              styleName: item.styleName || item.roomType || null, // roomType is for interior
              elements: item.elements || [],
              description: item.description || item.summary || null
            });
          }
        }
      });

     
      setDisplayData(formatted);

    } catch (error) {
      console.error(`❌ ${category} fetch failed:`, error);
      setDisplayData([]); 
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (imageUrl, categoryName) => {
    try {
      const key = imageUrl.split(".amazonaws.com/")[1];

      if (!key) {
        notification.error({ message: "Invalid Image URL" });
        return;
      }

      await apiService.download(
        `/download-pdf?key=${encodeURIComponent(key)}`,
        `XOTO_${categoryName}_${Date.now()}.pdf`
      );

    } catch (error) {
      console.error("Download error:", error);
      notification.error({
        message: "Download Failed",
        description: "PDF could not be generated."
      });
    }
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    fetchLibrary(value); 
  };

  useEffect(() => {
    fetchLibrary(selectedCategory);
  }, []);

  return (
    <div style={{ padding: "40px", background: "#f8f9fa", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: "40px", display: "flex", justifycontent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <Title level={1} style={{ margin: 0, fontWeight: 600, fontSize: "36px" }}>
            View Library
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Browse your AI generated designs
          </Text>
        </div>

        {/* --- Dropdown --- */}
        <Select 
          value={selectedCategory} 
          style={{ width: 220 }} 
          onChange={handleCategoryChange}
          size="large"
        >
          <Option value="Landscaping">Landscaping</Option>
          <Option value="Interior AI">Interior AI</Option>
          <Option value="Virtual Staging">Virtual Staging</Option>
          <Option value="Sky Replacement">Sky Replacement</Option>
          <Option value="Image Enhancer">Image Enhancer</Option>
        </Select>
      </div>

      {/* Loading & Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}>
          <Spin size="large" />
        </div>
      ) : displayData.length === 0 ? (
        <div style={{ marginTop: "100px" }}>
          <Empty description={`No images found for ${selectedCategory}`} />
        </div>
      ) : (
        <Row gutter={[32, 32]}>
          {displayData.map((item) => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
              <Card
                hoverable
                styles={{ body: { display: "none" } }}
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                }}
                cover={
                  <div className="img-container">
                    <img
                      src={item.image}
                      alt={selectedCategory}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        transition: "0.4s"
                      }}
                      className="card-img"
                    />
                    
                    {/* ✅ DOWNLOAD & VIEW HOVER OVERLAY */}
                    <div className="overlay">
                      <div style={{ display: 'flex', gap: '20px' }}>
                        
                        {/* VIEW BUTTON */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <button 
                            className="action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Populate Modal with data
                              setCurrentResult({ 
                                url: item.image, 
                                desc: item.description || "Analysis details available in history.", 
                                styleName: item.styleName, 
                                elementsList: item.elements, 
                                instruction: item.description 
                              });
                              setShowGeneratedModal(true);
                            }}
                          >
                            <Eye size={24} />
                          </button>
                          <span style={{ color: "white", fontSize: "11px", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase" }}>
                            View
                          </span>
                        </div>

                        {/* DOWNLOAD BUTTON */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <button 
                            className="action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(item.image, selectedCategory.replace(/\s+/g, ''));
                            }}
                          >
                            <Download size={24} />
                          </button>
                          <span style={{ color: "white", fontSize: "11px", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase" }}>
                            Download
                          </span>
                        </div>

                      </div>
                    </div>
                  </div>
                }
              />
            </Col>
          ))}
        </Row>
      )}

      {/* ✅ SAME MODAL ADDED FROM AIPLANNER */}
      <Modal
        open={showGeneratedModal}
        footer={null}
        onCancel={() => setShowGeneratedModal(false)}
        width={["90vw", "90vw", "90vw", 1000]}
        centered
        bodyStyle={{ padding: 0, borderRadius: '24px', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', height: '500px' }} className="flex-col lg:flex-row">
          
          {/* IMAGE SIDE */}
          <div className="w-full lg:w-3/5 h-[50vh] lg:h-full flex-shrink-0" style={{ height: '100%', flex: '1.5' }}>
            <img src={currentResult.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Final Design" />
          </div>
          
          {/* PREFERENCES SIDE */}
          <div className="w-full lg:w-2/5 flex flex-col justify-between" style={{ padding: '30px', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: BRAND_PURPLE, fontWeight: 'bold', marginBottom: '16px' }}>
                <Sparkles size={18} />
                <span>AI SCENE ANALYSIS</span>
              </div>
              
              <Paragraph style={{ color: '#4b5563', lineHeight: '1.6' }}>
                {currentResult.desc || "Visual enhancement applied."}
              </Paragraph>

              {/* Preferences Box */}
              {(currentResult.styleName || currentResult.elementsList?.length > 0 || currentResult.instruction) && (
                <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fdf4ff', borderRadius: '12px', border: '1px solid #f3e8ff' }}>
                  <h4 style={{ fontWeight: 'bold', fontSize: '14px', color: BRAND_PURPLE, marginBottom: '8px', margin: 0 }}>
                    Your Preferences
                  </h4>

                  {currentResult.styleName && (
                    <p style={{ fontSize: '12px', color: '#374151', margin: '4px 0' }}>
                      <strong>Style:</strong> {currentResult.styleName}
                    </p>
                  )}

                  {currentResult.elementsList?.length > 0 && (
                    <p style={{ fontSize: '12px', color: '#374151', margin: '4px 0' }}>
                      <strong>Elements:</strong> {Array.isArray(currentResult.elementsList) ? currentResult.elementsList.join(", ") : currentResult.elementsList}
                    </p>
                  )}

                  {currentResult.instruction && (
                    <p style={{ fontSize: '12px', color: '#374151', margin: '4px 0' }}>
                      <strong>Instruction:</strong> {currentResult.instruction}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              <Button 
                type="primary" 
                block 
                size="large" 
                style={{ height: '48px', borderRadius: '16px', fontWeight: 'bold', background: BRAND_PURPLE }} 
                onClick={() => downloadImage(currentResult.url, selectedCategory.replace(/\s+/g, ''))}
              >
                Download Render
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ✅ CSS STYLES FOR OVERLAY AND HOVER EFFECT */}
      <style>
        {`
        .img-container {
          position: relative;
          overflow: hidden;
          height: 320px;
        }

        .overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          opacity: 0;
          transition: 0.3s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          backdrop-filter: blur(2px);
        }

        .img-container:hover .overlay {
          opacity: 1;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.3s;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .card-img:hover {
          transform: scale(1.08);
        }

        .ant-card {
          line-height: 0;
        }
        `}
      </style>

    </div>
  );
};

export default ViewLibrary;