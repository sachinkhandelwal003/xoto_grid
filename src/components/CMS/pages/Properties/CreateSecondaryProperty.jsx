import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../manageApi/utils/custom.apiservice'; 
import {
  Button, Form, Input, Card, Select, Typography, Row, Col, 
  Divider, message, notification, Switch, Upload, InputNumber, 
  DatePicker, Modal, Segmented, Spin, Tag
} from 'antd';
import {
  PlusOutlined, EnvironmentOutlined, ArrowLeftOutlined,
  HomeOutlined, AppstoreAddOutlined, SearchOutlined, CheckCircleFilled
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const THEME = { primary: "#7c3aed", success: "#10b981", error: "#ef4444" };
const UPLOAD_API = "https://xoto.ae/api/upload";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const CreateSecondaryProperty = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [formLoading, setFormLoading] = useState(false);
  const [developers, setDevelopers] = useState([]);

  

  // ================= MODE STATE =================
  // "new" = brand new listing, "existing" = link to an existing off-plan project
  const [propertyMode, setPropertyMode] = useState("new");

  const { id } = useParams();
const isEditMode = Boolean(id);

  // Existing Property Search
  const [existingProperties, setExistingProperties] = useState([]);
  const [existingSearchText, setExistingSearchText] = useState("");
  const [existingLoading, setExistingLoading] = useState(false);
  const [selectedExistingProperty, setSelectedExistingProperty] = useState(null);


  const [mainLogoList, setMainLogoList] = useState([]);
  const [architectureList, setArchitectureList] = useState([]);
  const [interiorList, setInteriorList] = useState([]);
  const [lobbyList, setLobbyList] = useState([]);
  const [otherList, setOtherList] = useState([]);

  // --- 🔍 PREVIEW MODAL ---
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // ================= FETCH DEVELOPERS =================
  const fetchDevelopers = async () => {
    try {
      const res = await apiService.get("/property/get-all-developers");
      const list = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      setDevelopers(list);
    } catch (err) {
      
    }
  };

  // ================= FETCH EXISTING OFF-PLAN PROPERTIES =================
  const fetchExistingProperties = async (search = "") => {
    try {
      setExistingLoading(true);
     const res = await apiService.get(
  `/properties?propertySubType=off_plan&approvalStatus=approved&listingStatus=active&page=1&limit=50${search ? `&search=${search}` : ""}`
);
      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data) ? res.data : [];
      setExistingProperties(list);
    } catch (err) {
      
    } finally {
      setExistingLoading(false);
    }
  };

useEffect(() => {
  fetchDevelopers();
  if (isEditMode) fetchPropertyById();
  
}, []);

  useEffect(() => {
    if (propertyMode === "existing") {
      fetchExistingProperties();
    }
  }, [propertyMode]);


const fetchPropertyById = async () => {
  try {
    setFormLoading(true);
const res = await apiService.get(`/properties/${id}`);
    const data = res?.data?.data || res?.data || res;
    if (!data) return;

    setPropertyMode(data.projectOption === "existing" ? "existing" : "new");

    form.setFieldsValue({
      propertyName: data.propertyName || "",
      developerName: data.developerName || data.developer?.name || "",
      unitType: data.unitType || undefined,
      ownershipType: data.ownershipType || "freehold",
      unitNumber: data.unitNumber || "",
      floorNumber: data.floorNumber || "",
      bedrooms: data.bedrooms || "",
      bathrooms: data.bathrooms || "",
      builtUpArea: data.builtUpArea || "",
      price: data.price || "",
      furnishing: data.furnishing || undefined,
      availableFrom: data.availableFrom ? dayjs(data.availableFrom) : null,
      shareCommission: data.shareCommission || false,
      shareCommissionPercentage: data.shareCommissionPercentage || 0,
      area: data.area || "",
      city: data.city || "",
      lat: data.coordinates?.lat || "",
      lng: data.coordinates?.lng || "",
      viewType: data.viewType || [],
      facilities: Object.entries(data.facilities || {}).filter(([, v]) => v).map(([k]) => k),
      description: data.description || "",
      parkingSpaces: data.parkingSpaces || 0,
      transactionType: data.transactionType || "sell",
      approvalStatus: data.approvalStatus || "pending",
adminComments:  data.adminComments  || "",
    });

    if (data.mainLogo) setMainLogoList([{ uid: '-logo', name: 'main-logo', status: 'done', url: data.mainLogo }]);
    if (data.photos?.architecture?.length > 0)
      setArchitectureList(data.photos.architecture.map((url, i) => ({ uid: `-arch-${i}`, name: `arch-${i}`, status: 'done', url })));
    if (data.photos?.interior?.length > 0)
      setInteriorList(data.photos.interior.map((url, i) => ({ uid: `-int-${i}`, name: `int-${i}`, status: 'done', url })));
    if (data.photos?.lobby?.length > 0)
      setLobbyList(data.photos.lobby.map((url, i) => ({ uid: `-lobby-${i}`, name: `lobby-${i}`, status: 'done', url })));
    if (data.photos?.other?.length > 0)
      setOtherList(data.photos.other.map((url, i) => ({ uid: `-other-${i}`, name: `other-${i}`, status: 'done', url })));

  } catch (err) {
    message.error("Failed to load property for editing.");
  } finally {
    setFormLoading(false);
  }
};
  // ================= EXISTING PROPERTY SELECT → AUTO FILL =================
  const handleExistingPropertySelect = (propertyId) => {
    const property = existingProperties.find(p => p._id === propertyId);
    if (!property) return;

    setSelectedExistingProperty(property);

    // Helper to extract cover image
    const getCoverImage = (p) => {
      if (p.photos?.architecture?.length > 0) return p.photos.architecture[0];
      if (p.photos?.interior?.length > 0) return p.photos.interior[0];
      if (p.mainLogo) return p.mainLogo;
      return "";
    };

    // Auto-fill form fields from selected property
    form.setFieldsValue({
      propertyName: property.propertyName || "",
      developerName: property.developerName || property.developer?.name || "",
      unitType: property.unitType || undefined,
      ownershipType: property.ownershipType || "freehold",
      unitNumber: property.unitNumber || "",
      floorNumber: property.floorNumber || "",
      bedrooms: property.bedrooms || "",
      bathrooms: property.bathrooms || "",
      builtUpArea: property.builtUpArea || "",
      price: property.price || "",
      furnishing: property.furnishing || undefined,
      availableFrom: property.availableFrom ? dayjs(property.availableFrom) : null,
      shareCommission: property.shareCommission || false,
      shareCommissionPercentage: property.shareCommissionPercentage || 0,
      area: property.area || "",
      city: property.city || "",
      lat: property.coordinates?.lat || "",
      lng: property.coordinates?.lng || "",
      viewType: property.viewType || [],
      facilities: Object.entries(property.facilities || {})
        .filter(([_, v]) => v === true)
        .map(([k]) => k),
      description: property.description || "",
      parkingSpaces: property.parkingSpaces || 0,
    });

    // Pre-fill image lists from existing property
    if (property.mainLogo) {
      setMainLogoList([{ uid: '-logo', name: 'main-logo', status: 'done', url: property.mainLogo }]);
    }
    if (property.photos?.architecture?.length > 0) {
      setArchitectureList(property.photos.architecture.map((url, i) => ({
        uid: `-arch-${i}`, name: `architecture-${i + 1}`, status: 'done', url
      })));
    }
    if (property.photos?.interior?.length > 0) {
      setInteriorList(property.photos.interior.map((url, i) => ({
        uid: `-int-${i}`, name: `interior-${i + 1}`, status: 'done', url
      })));
    }
    if (property.photos?.lobby?.length > 0) {
      setLobbyList(property.photos.lobby.map((url, i) => ({
        uid: `-lobby-${i}`, name: `lobby-${i + 1}`, status: 'done', url
      })));
    }
    if (property.photos?.other?.length > 0) {
      setOtherList(property.photos.other.map((url, i) => ({
        uid: `-other-${i}`, name: `other-${i + 1}`, status: 'done', url
      })));
    }

    message.success(`"${property.propertyName}" data has been pre-filled. You can edit any field before submitting.`);
  };

  // Clear existing selection
  const clearExistingSelection = () => {
    setSelectedExistingProperty(null);
    form.resetFields();
    setMainLogoList([]);
    setArchitectureList([]);
    setInteriorList([]);
    setLobbyList([]);
    setOtherList([]);
  };

  // Mode change → reset form
  const handleModeChange = (mode) => {
    setPropertyMode(mode);
    setSelectedExistingProperty(null);
    form.resetFields();
    setMainLogoList([]);
    setArchitectureList([]);
    setInteriorList([]);
    setLobbyList([]);
    setOtherList([]);
  };

  // ================= IMAGE UPLOAD =================
  const handleImageUpload = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiService.upload(UPLOAD_API, formData);
      const uploadedUrl = response?.data?.file?.url || response?.data?.url || response?.file?.url || response?.url;
      if (uploadedUrl) {
        message.success(`${file.name} uploaded!`);
        onSuccess({ url: uploadedUrl });
      } else {
        throw new Error("No URL returned from API");
      }
    } catch (err) {
      message.error(`Upload failed for ${file.name}`);
      onError(err);
    }
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const extractUrl = (file) => file.url || file.response?.url;

  // ================= SUBMIT =================
  const handleSave = async (values) => {
    setFormLoading(true);
    try {
      const payload = {
        // Mode-specific fields
        projectOption: propertyMode === "existing" ? "existing" : "new",
        ...(propertyMode === "existing" && selectedExistingProperty
          ? { existingProjectId: selectedExistingProperty._id }
          : {}),

        propertyName: values.propertyName,
        developerName: values.developerName,
        propertySubType: "secondary",
        transactionType: values.transactionType || "sell",
        unitNumber: values.unitNumber,
        floorNumber: Number(values.floorNumber),
        unitType: values.unitType,
        bedroomType: `${values.bedrooms}bed`,
        bedrooms: Number(values.bedrooms),
        bathrooms: Number(values.bathrooms),

        builtUpArea: Number(values.builtUpArea),
        builtUpArea_min: Number(values.builtUpArea),
        builtUpArea_max: Number(values.builtUpArea),
        builtUpAreaUnit: "sqft",

        price: Number(values.price),
        price_min: Number(values.price),
        price_max: Number(values.price),
        currency: "AED",

        area: values.area,
        city: values.city,
        country: "UAE",
        description: values.description || "",
        furnishing: values.furnishing,
        ownershipType: values.ownershipType,
        projectStatus: values.projectStatus || "presale",

        hasView: values.viewType?.length > 0,
        viewType: values.viewType || [],
        parkingSpaces: Number(values.parkingSpaces || 0),

        shareCommission: values.shareCommission || false,
        shareCommissionPercentage: values.shareCommission ? Number(values.shareCommissionPercentage) : 0,

        coordinates: {
          lat: Number(values.lat || 25.1854),
          lng: Number(values.lng || 55.2637)
        },
        proximity: { airport: "", metro: "", mall: "", school: "" },

        facilities: {
          swimmingPool: values.facilities?.includes('swimmingPool') || false,
          gym: values.facilities?.includes('gym') || false,
          parking: values.facilities?.includes('parking') || false,
          childrenPlayArea: values.facilities?.includes('childrenPlayArea') || false,
          gardens: values.facilities?.includes('gardens') || false,
          security: values.facilities?.includes('security') || false,
          concierge: values.facilities?.includes('concierge') || false,
        },

        mainLogo: mainLogoList.length > 0 ? extractUrl(mainLogoList[0]) : "",
        photos: {
          architecture: architectureList.map(extractUrl).filter(Boolean),
          interior: interiorList.map(extractUrl).filter(Boolean),
          lobby: lobbyList.map(extractUrl).filter(Boolean),
          other: otherList.map(extractUrl).filter(Boolean)
        },

        availableFrom: values.availableFrom ? values.availableFrom.toISOString() : null,
        completionDate: { quarter: null, year: null, fullDate: null },
        isAvailable: true,
        isFeatured: false,
        showContactOnlyVerified: false,
      };

      const response = isEditMode
  ? await apiService.put(`/properties/${id}`, payload)
  : await apiService.post('/properties', payload);

      if (response) {
       notification.success({
  message: isEditMode ? 'Property Updated' : 'Property Created',
  description: `Secondary listing "${values.propertyName}" ${isEditMode ? 'updated' : 'created'} successfully!`,

          placement: 'topRight'
        });
        navigate(-1);
      }
    } catch (err) {
      message.error(err.response?.data?.message || err.message || "Failed to create property.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">

      {/* PAGE HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="border-gray-300" />
        <div>
<Title level={3} style={{ margin: 0 }}>{isEditMode ? 'Edit Secondary Property' : 'Create Secondary Property'}</Title>
<Text type="secondary">{isEditMode ? 'Update the details of this resale property.' : 'Fill in the details to list a new resale property.'}</Text>
        </div>
      </div>

      {/* ================= MODE TOGGLE ================= */}
      <Card
        bordered={false}
        className="shadow-sm rounded-xl max-w-6xl mx-auto mb-4"
        style={{ background: '#faf5ff', border: '1px solid #e9d5ff' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <Text strong style={{ fontSize: 15 }}>Property Type</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 13 }}>
              Create a new listing from scratch or link it to an existing off-plan project
            </Text>
          </div>
          <div className="sm:ml-auto">
            <Segmented
              size="large"
              value={propertyMode}
              onChange={handleModeChange}
              options={[
                {
                  label: (
                    <div style={{ padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AppstoreAddOutlined />
                      <span>New Property</span>
                    </div>
                  ),
                  value: 'new',
                },
                {
                  label: (
                    <div style={{ padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <HomeOutlined />
                      <span>Existing Property</span>
                    </div>
                  ),
                  value: 'existing',
                },
              ]}
              style={{ background: '#ede9fe' }}
            />
          </div>
        </div>
      </Card>

      {/* ================= EXISTING PROPERTY SEARCH (only in existing mode) ================= */}
      {propertyMode === "existing" && (
        <Card
          bordered={false}
          className="shadow-sm rounded-xl max-w-6xl mx-auto mb-4"
          style={{ border: '1px solid #e9d5ff' }}
        >
          <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
            <SearchOutlined style={{ marginRight: 8, color: THEME.primary }} />
            Search Existing Off-Plan Property
          </Text>

          {/* Selected Property Badge */}
          {selectedExistingProperty && (
            <div
              style={{
                background: '#f0fdf4', border: '1px solid #86efac',
                borderRadius: 10, padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Thumbnail */}
                {(selectedExistingProperty.mainLogo || selectedExistingProperty.photos?.architecture?.[0]) ? (
                  <img
                    src={selectedExistingProperty.mainLogo || selectedExistingProperty.photos?.architecture?.[0]}
                    alt=""
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid #bbf7d0' }}
                  />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <HomeOutlined style={{ color: '#16a34a', fontSize: 20 }} />
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <CheckCircleFilled style={{ color: '#16a34a', fontSize: 15 }} />
                    <Text strong style={{ fontSize: 14, color: '#15803d' }}>
                      {selectedExistingProperty.propertyName}
                    </Text>
                    {selectedExistingProperty.unitType && (
                      <Tag color="green" style={{ fontSize: 10, padding: '0 5px', margin: 0 }}>
                        {selectedExistingProperty.unitType}
                      </Tag>
                    )}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {selectedExistingProperty.area || selectedExistingProperty.city}
                    {selectedExistingProperty.developerName ? ` • ${selectedExistingProperty.developerName}` : ''}
                    {' '}• <span style={{ fontFamily: 'monospace', fontSize: 11 }}>ID: {selectedExistingProperty._id}</span>
                  </Text>
                </div>
              </div>
              <Button size="small" danger onClick={clearExistingSelection} style={{ flexShrink: 0 }}>
                Change
              </Button>
            </div>
          )}

          {/* Show search dropdown only when no property is selected */}
          {!selectedExistingProperty ? (
            <>
              <Select
                showSearch
                size="large"
                style={{ width: '100%' }}
                placeholder="Search by property name or area..."
                suffixIcon={existingLoading ? <Spin size="small" /> : <SearchOutlined />}
                filterOption={false}
                onSearch={(val) => {
                  setExistingSearchText(val);
                  fetchExistingProperties(val);
                }}
                onSelect={handleExistingPropertySelect}
                notFoundContent={
                  existingLoading
                    ? <div style={{ textAlign: 'center', padding: 12 }}><Spin size="small" /> Loading...</div>
                    : <Text type="secondary">No properties found</Text>
                }
                value={undefined}
              >
                {existingProperties.map(p => (
                  <Option key={p._id} value={p._id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {(p.mainLogo || p.photos?.architecture?.[0]) ? (
                        <img
                          src={p.mainLogo || p.photos?.architecture?.[0]}
                          alt=""
                          style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: 6, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <HomeOutlined style={{ color: THEME.primary }} />
                        </div>
                      )}
                      <div>
                        <Text strong style={{ display: 'block', fontSize: 13 }}>{p.propertyName}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {p.area || p.city} • {p.developerName || "Developer"} •{' '}
                          <Tag color="purple" style={{ fontSize: 10, padding: '0 4px' }}>
                            {p.unitType || "off-plan"}
                          </Tag>
                        </Text>
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                💡 Once you select a property, all fields will be pre-filled automatically. You can edit any field before submitting.
              </Text>
            </>
          ) : null}
        </Card>
      )}

      {/* ================= MAIN FORM CARD ================= */}
      <Card bordered={false} className="shadow-md rounded-xl max-w-6xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ transactionType: 'sell', ownershipType: 'freehold', currency: 'AED' }}
        >

          {/* 1. BASIC DETAILS */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">Basic Details</Text>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="propertyName" label="Property/Building Name" rules={[{ required: true }]}>
                <Input size="large" placeholder="E.g. Luxury Tower Downtown" />
              </Form.Item>
            </Col>
            {!isEditMode && propertyMode !== "existing" && (
  <Col xs={24} md={12}>
    <Form.Item name="developerName" label="Developer Name">
      <Select size="large" showSearch placeholder="Search or Select Developer" optionFilterProp="children" allowClear>
        {developers.map(dev => (
          <Option key={dev._id || dev.id} value={dev.name}>{dev.name}</Option>
        ))}
      </Select>
    </Form.Item>
  </Col>
)}

{isEditMode && (
  <Col xs={24} md={12}>
    <Form.Item name="developerName" label="Developer Name">
      <Input size="large" disabled />
    </Form.Item>
  </Col>
)}
            <Col xs={12} md={6}>
              <Form.Item name="unitType" label="Unit Type" rules={[{ required: true }]}>
                <Select size="large" placeholder="Select">
                  <Option value="apartment">Apartment</Option>
                  <Option value="villa">Villa</Option>
                  <Option value="townhouse">Townhouse</Option>
                  <Option value="penthouse">Penthouse</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="ownershipType" label="Ownership">
                <Select size="large">
                  <Option value="freehold">Freehold</Option>
                  <Option value="leasehold">Leasehold</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="unitNumber" label="Unit No." rules={[{ required: true }]}>
                <Input size="large" placeholder="1508" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="floorNumber" label="Floor No." rules={[{ required: true }]}>
                <Input size="large" type="number" placeholder="15" />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '10px 0 20px 0' }} />

          {/* 2. AREA, PRICE & CONFIGURATION */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">Area & Pricing</Text>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item name="bedrooms" label="Bedrooms" rules={[{ required: true }]}>
                <Input size="large" type="number" placeholder="2" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="bathrooms" label="Bathrooms" rules={[{ required: true }]}>
                <Input size="large" type="number" placeholder="2" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="builtUpArea" label="Built Up Area (Sqft)" rules={[{ required: true }]}>
                <Input size="large" type="number" placeholder="1250" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="price" label="Price (AED)" rules={[{ required: true }]}>
                <InputNumber size="large" className="w-full" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} placeholder="1450000" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="furnishing" label="Furnishing">
                <Select size="large" placeholder="Select">
                  <Option value="unfurnished">Unfurnished</Option>
                  <Option value="semi_furnished">Semi Furnished</Option>
                  <Option value="furnished">Fully Furnished</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="availableFrom" label="Available From">
                <DatePicker size="large" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="parkingSpaces" label="Parking Spaces">
                <InputNumber size="large" min={0} style={{ width: '100%' }} placeholder="2" />
              </Form.Item>
            </Col>
            <Col xs={12} md={3}>
              <Form.Item name="shareCommission" label="Share Commission?" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Form.Item noStyle dependencies={['shareCommission']}>
              {({ getFieldValue }) => getFieldValue('shareCommission') && (
                <Col xs={12} md={3}>
                  <Form.Item name="shareCommissionPercentage" label="Comm. %">
                    <InputNumber size="large" max={100} min={0} suffix="%" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              )}
            </Form.Item>
          </Row>

          <Divider style={{ margin: '10px 0 20px 0' }} />

          {/* 3. LOCATION & AMENITIES */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">Location & Amenities</Text>
          <Row gutter={16}>
            <Col xs={12} md={8}>
              <Form.Item name="area" label="Community / Area" rules={[{ required: true }]}>
                <Input size="large" prefix={<EnvironmentOutlined className="text-gray-400" />} placeholder="Business Bay" />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="city" label="City" rules={[{ required: true }]}>
                <Input size="large" placeholder="Dubai" />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="lat" label="Latitude">
                <Input size="large" placeholder="25.1854" />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="lng" label="Longitude">
                <Input size="large" placeholder="55.2637" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="viewType" label="View Types">
                <Select size="large" mode="multiple" placeholder="City View, Landmark...">
                  <Option value="city">City View</Option>
                  <Option value="sea">Sea View</Option>
                  <Option value="landmark">Landmark View</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="facilities" label="Facilities">
                <Select size="large" mode="multiple" placeholder="Select facilities...">
                  <Option value="swimmingPool">Swimming Pool</Option>
                  <Option value="gym">Gym</Option>
                  <Option value="parking">Parking</Option>
                  <Option value="childrenPlayArea">Play Area</Option>
                  <Option value="security">Security</Option>
                  <Option value="gardens">Gardens</Option>
                  <Option value="concierge">Concierge</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                <TextArea rows={4} placeholder="Describe the property..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '10px 0 20px 0' }} />

          {/* 4. MEDIA UPLOADS */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">Media Uploads</Text>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item label="Main Logo">
                <Upload listType="picture-card" fileList={mainLogoList}
                  onChange={({ fileList }) => setMainLogoList(fileList)}
                  customRequest={handleImageUpload} onPreview={handlePreview}>
                  {mainLogoList.length >= 1 ? null : uploadButton}
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Architecture Photos">
                <Upload listType="picture-card" multiple fileList={architectureList}
                  onChange={({ fileList }) => setArchitectureList(fileList)}
                  customRequest={handleImageUpload} onPreview={handlePreview}>
                  {uploadButton}
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Interior Photos">
                <Upload listType="picture-card" multiple fileList={interiorList}
                  onChange={({ fileList }) => setInteriorList(fileList)}
                  customRequest={handleImageUpload} onPreview={handlePreview}>
                  {uploadButton}
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Lobby Photos">
                <Upload listType="picture-card" multiple fileList={lobbyList}
                  onChange={({ fileList }) => setLobbyList(fileList)}
                  customRequest={handleImageUpload} onPreview={handlePreview}>
                  {uploadButton}
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Other Amenities Photos">
                <Upload listType="picture-card" multiple fileList={otherList}
                  onChange={({ fileList }) => setOtherList(fileList)}
                  customRequest={handleImageUpload} onPreview={handlePreview}>
                  {uploadButton}
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <>
    {form.getFieldValue("approvalStatus") === "changes_requested" && (
      <Alert
        type="warning"
        showIcon
        message="Admin requested changes"
        description={form.getFieldValue("adminComments") || "Please update and resubmit."}
        style={{ marginBottom: 16 }}
      />
    )}
    {form.getFieldValue("approvalStatus") === "approved" && (
      <Alert
        type="info"
        showIcon
        message="Editing this listing will send it back for admin approval"
        style={{ marginBottom: 16 }}
      />
    )}
  </>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <Button size="large" onClick={() => navigate(-1)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
              size="large"
              style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
            >
             {isEditMode ? 'Update Listing' : 'Publish Secondary Listing'}
            </Button>
          </div>
        </Form>
      </Card>

      {/* IMAGE PREVIEW MODAL */}
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)} centered>
        <img alt="preview" style={{ width: '100%', borderRadius: 8 }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default CreateSecondaryProperty;