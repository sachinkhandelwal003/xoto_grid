import React, { useState, useEffect } from "react";
import {
  Card, Typography, Form, Input, Button, Row, Col, Select,
  InputNumber, Upload, Switch, Alert, Divider, Checkbox,
  DatePicker, Steps, Spin, Tag,
} from "antd";
import dayjs from "dayjs";
import {
  PlusOutlined, ArrowLeftOutlined, MinusCircleOutlined,
  DeleteOutlined, VideoCameraOutlined, EnvironmentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { showToast } from "../../../manageApi/utils/toast";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const THEME = { primary: "#6d28d9" };
const UPLOAD_API = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const extractPhotoUrl = (fileItem) => {
  const r = fileItem.response;
  if (!r) return null;
  return (
    r.url || r.imageUrl || r.image_url || r.secure_url || r.link || r.path ||
    r.filePath || r.fileUrl ||
    r.data?.url || r.data?.imageUrl || r.data?.secure_url || r.data?.path || r.data?.link ||
    r.file?.url || r.file?.imageUrl || r.file?.image_url || r.file?.secure_url ||
    r.file?.path || r.file?.filePath || r.file?.fileUrl || r.file?.link ||
    r.file?.location || r.file?.key || r.file?.filename || r.file?.name ||
    r.result?.url || r.result?.secure_url ||
    null
  );
};

const customUploadRequest = async ({ file, onSuccess, onError }) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res  = await fetch(UPLOAD_API, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error(data.message || "Upload failed");
    onSuccess(data, file);
  } catch (err) {
    onError(err);
  }
};

const UAE_LOCALITIES = [
  "Dubai Marina", "Downtown Dubai", "JVC", "Business Bay", "Palm Jumeirah",
  "Dubai Hills", "Abu Dhabi", "Sharjah", "Al Barsha", "Al Reem Island",
  "Saadiyat Island", "Yas Island", "Jumeirah", "Al Furjan", "Dubai Hills Estate",
  "Mohammed Bin Rashid City", "Creek Harbour", "Sobha Hartland", "Tilal Al Ghaf",
];

const OFFPLAN_AMENITIES = [
  "Swimming Pool", "Gym / Fitness Centre", "Kids Play Area", "Sauna & Steam Room",
  "BBQ Area", "Rooftop Terrace", "Jogging Track", "Yoga / Meditation Deck",
  "Co-working Space", "Cinema / Movie Room", "Club House", "Concierge Service",
  "24/7 Security", "Smart Home Technology", "EV Charging Station", "Spa",
  "Tennis Court", "Basketball Court", "Squash Court", "Golf Simulator",
  "Visitor Parking", "Retail Outlets", "Cafeteria / Café", "Mosque",
  "School / Nursery Nearby", "Pet-Friendly Area", "Business Lounge",
  "Infinity Pool", "Sky Garden", "Water Feature",
];

const STEPS = [
  "Select Developer",
  "Property Overview",
  "Property Details",
  "Inventory Overview",
  "Other Details",
  "Payment Plan",
  "Developer Details",
  "Submission",
];

// ─── Upload Card Component ────────────────────────────────────────────────────
const UploadBox = ({ label, fileList, onChange, maxCount = 20, hint }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</div>
    {hint && <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>{hint}</div>}
    <Upload
      listType="picture-card"
      multiple={maxCount > 1}
      fileList={fileList}
      onChange={({ fileList: fl }) => onChange(fl)}
      customRequest={customUploadRequest}
      beforeUpload={(file) => {
        const ok = file.size / 1024 / 1024 < 5;
        if (!ok) showToast("Image must be smaller than 5MB!", "error");
        return ok || Upload.LIST_IGNORE;
      }}
      accept="image/*"
    >
      {fileList.length < maxCount ? (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 6, fontSize: 12 }}>Upload</div>
        </div>
      ) : null}
    </Upload>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
export default function CreateOffplan() {
  const navigate = useNavigate();

  const [form]                       = Form.useForm();
  const [formLoading,                 setFormLoading]                 = useState(false);
  const [photoError,                  setPhotoError]                  = useState("");
  const [currentStep,                 setCurrentStep]                 = useState(0);
  const [selectedDeveloperId,         setSelectedDeveloperId]         = useState(null);
  const [developers,                  setDevelopers]                  = useState([]);
  const [loadingDevelopers,           setLoadingDevelopers]           = useState(false);
  const [selectedDeveloperProfile,    setSelectedDeveloperProfile]    = useState(null);
  const [fetchingProfile,             setFetchingProfile]             = useState(false);

  // Upload lists
  const [mainLogoFileList,    setMainLogoFileList]    = useState([]);
  const [photosArchitecture,  setPhotosArchitecture]  = useState([]);
  const [photosInterior,      setPhotosInterior]      = useState([]);
  const [photosLobby,         setPhotosLobby]         = useState([]);
  const [photosOther,         setPhotosOther]         = useState([]);
  const [brochureFileList,    setBrochureFileList]    = useState([]);

  // ── Fetch developers ───────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingDevelopers(true);
      try {
        const res  = await apiService.get("/developer/get-all-developers");
        const list = res?.data?.data || res?.data || [];
        setDevelopers(list);
      } catch {
        showToast("Failed to load developers", "error");
      } finally {
        setLoadingDevelopers(false);
      }
    };
    load();
  }, []);

  // ── Fetch developer profile when selected ─────────────────────────────────
useEffect(() => {
  if (!selectedDeveloperId) {
    setSelectedDeveloperProfile(null);
    return;
  }

  const load = async () => {
    setFetchingProfile(true);

    try {

      const res = await apiService.get(
        `developer/get-developer-by-id?id=${selectedDeveloperId}`
      );

      const profile = res?.data?.data || res?.data || res;

      setSelectedDeveloperProfile(profile);

      form.setFieldsValue({
        developerDetails: {
          companyName:
            profile.companyName || profile.name || "",

          developerLicenseNumber:
            profile.developerLicenseNumber || profile.license || "",

          primaryContactName:
            profile.primaryContactName || profile.contactName || "",

          phone:
            profile.phone || profile.phone_number || "",

          email:
            profile.email || "",
        }
      });

    } catch {
      showToast(
        "Could not fetch developer details",
        "error"
      );

    } finally {
      setFetchingProfile(false);
    }
  };

  load();

}, [selectedDeveloperId, form]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isAnyUploading = () =>
    [mainLogoFileList, photosArchitecture, photosInterior, photosLobby, photosOther, brochureFileList]
      .some((l) => l.some((f) => f.status === "uploading"));

  const collectUrls = (fileList) =>
    fileList.filter((f) => f.status === "done").map((f) => f.url || extractPhotoUrl(f)).filter(Boolean);

  // ── Submit ─────────────────────────────────────────────────────────────────
 const handleSave = async (saveType) => {
  if (!selectedDeveloperId) {
    showToast("Please select a developer first", "error");
    return;
  }
  const values = form.getFieldsValue(true);
  if (!values.propertyName?.trim()) return showToast("Project Name is required", "error");
  if (!values.locality) return showToast("Locality is required", "error");
  if (!values.overview?.trim()) return showToast("Project Overview is required", "error");
  if (!values.priceRangeFrom || !values.priceRangeTo) return showToast("Price range is required", "error");
  if (isAnyUploading()) return showToast("Please wait for uploads to finish.", "error");

  const anyFailed = [mainLogoFileList, photosArchitecture, photosInterior, photosLobby, photosOther, brochureFileList]
    .some((l) => l.some((f) => f.status === "error"));
  if (anyFailed) {
    setPhotoError("Some media failed to upload. Please re-upload.");
    return;
  }

  const mainLogoUrls = collectUrls(mainLogoFileList);
  if (mainLogoUrls.length === 0) {
    setPhotoError("Please upload a main logo image.");
    return;
  }

  const brochureUrl = brochureFileList.length > 0 && brochureFileList[0].status === "done"
    ? brochureFileList[0]?.url || extractPhotoUrl(brochureFileList[0]) || ""
    : "";

  const payload = {
      developerId:          selectedDeveloperId,
      propertyType:       values.propertyType || "Residential",
      unitTypes:          values.unitTypes || [],
      unitType:           values.unitTypes?.[0] || "apartment",
      propertySubType:    "off_plan",
      transactionType:    "sell",
      approvalStatus:     saveType === "submit" ? "pending" : "draft",
      projectName:        values.propertyName?.trim(),
      propertyName:       values.propertyName?.trim(),
      locality:           values.locality,
      area:               values.locality,
      city:               values.city || values.locality || "",
      country:            "UAE",
      completionDate: {
        fullDate: values.completionDate ? values.completionDate.format("YYYY-MM-DD") : null,
      },
      overview:           values.overview?.trim(),
      description:        values.overview?.trim(),
      priceRange: {
        from: values.priceRangeFrom || 0,
        to:   values.priceRangeTo   || 0,
      },
      price_min:  values.priceRangeFrom || 0,
      price_max:  values.priceRangeTo   || 0,
      price:      values.priceRangeFrom || 0,
      mainLogo:   mainLogoUrls[0],
      media: {
        mainLogo:           mainLogoUrls[0],
        architectureImages: collectUrls(photosArchitecture),
        interiorImages:     collectUrls(photosInterior),
        lobbyImages:        collectUrls(photosLobby),
        otherImages:        collectUrls(photosOther),
        youtubeVideos:      (values.youtubeVideos || []).filter(Boolean),
      },
      photos: {
        architecture: collectUrls(photosArchitecture),
        interior:     collectUrls(photosInterior),
        lobby:        collectUrls(photosLobby),
        other:        collectUrls(photosOther),
      },
      location: {
        address:   values.address   || "",
        latitude:  values.latitude  || null,
        longitude: values.longitude || null,
      },
      brochure:              brochureUrl,
      buildings:             values.buildings  || [],
      amenities:             values.amenities  || [],
      floorPlans:            values.floorPlans || [],
      inventory:             values.inventory  || [],
      parkingAllocation:     values.parkingAllocation || "",
      parkingSpaces:         values.parkingSpaces || 0,
      numberOfFloors:        values.floors || 0,
      floors:                values.floors || 0,
      furnishingStatus:
        values.furnishing === "unfurnished"    ? "Unfurnished" :
        values.furnishing === "semi-furnished" ? "Semi-Furnished" : "Fully Furnished",
      serviceCharge:         values.serviceCharge || "",
      constructionProgress:  values.constructionProgress || 0,
      readinessProgress:     `${values.constructionProgress || 0}%`,
      paymentPlan:           values.paymentPlan || [],
      projectStatus:         values.projectStatus || "presale",
      developmentStatus:     values.developmentStatus || "Planned",
      saleStatus:            values.saleStatus || "Available",
      isFeatured:            values.isFeatured || false,
      developerDetails: {
        companyName:  selectedDeveloperProfile?.companyName || "",
        contactName:  selectedDeveloperProfile?.primaryContactName || selectedDeveloperProfile?.name || "",
        email:        selectedDeveloperProfile?.email || "",
        phone:        selectedDeveloperProfile?.phone_number || selectedDeveloperProfile?.phone || "",
        logo:         selectedDeveloperProfile?.logo || "",
      },
    };

  setPhotoError("");
  try {
    setFormLoading(true);
    const res = await apiService.post("/properties", payload);
    const savedProperty = res?.data?.data || res?.data;
    if (savedProperty) {
      showToast(
        saveType === "submit"
          ? "Property submitted! Awaiting admin approval."
          : "Property saved as draft.",
        "success"
      );

      // ── RESET EVERYTHING instead of navigating away ──
      form.resetFields();
      setCurrentStep(0);
      setSelectedDeveloperId(null);
      setSelectedDeveloperProfile(null);
      setMainLogoFileList([]);
      setPhotosArchitecture([]);
      setPhotosInterior([]);
      setPhotosLobby([]);
      setPhotosOther([]);
      setBrochureFileList([]);
      setPhotoError("");
      setFormLoading(false);
    } else {
      showToast(res?.message || "Failed to save property.", "error");
    }
  } catch (error) {
    showToast(error?.response?.data?.message || error?.message || "Something went wrong.", "error");
  } finally {
    setFormLoading(false);
  }
};

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!selectedDeveloperId) { showToast("Please select a developer", "error"); return; }
      setCurrentStep(currentStep + 1);
      return;
    }
    // Step 7 (Submission) has no fields to validate
    if (currentStep === 7) { setCurrentStep(currentStep + 1); return; }
    try {
      await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch {}
  };

  const handlePrev = () => setCurrentStep(currentStep - 1);

  // ── PAYMENT PLAN FIELDS ────────────────────────────────────────────────────
  const renderPaymentPlanFields = () => (
    <Form.List name="paymentPlan">
      {(planFields, { add: addPlan, remove: removePlan }) => (
        <>
          {planFields.map(({ key: planKey, name: planName }) => (
            <Card
              key={planKey}
              size="small"
              style={{ marginBottom: 16, borderRadius: 10, border: "1px solid #e0d7f5" }}
              bodyStyle={{ padding: 16 }}
              title={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: THEME.primary }}>
                    Plan {planName + 1}
                  </span>
                  <Button
                    danger size="small" type="text" icon={<DeleteOutlined />}
                    onClick={() => removePlan(planName)}
                  >
                    Remove Plan
                  </Button>
                </div>
              }
            >
              <Form.Item
                name={[planName, "title"]}
                label="Plan Title"
                rules={[{ required: true, message: "Enter plan title" }]}
              >
                <Input placeholder="e.g., Standard Payment Plan" />
              </Form.Item>

              {/* Nested stages */}
              <Form.List name={[planName, "stages"]}>
                {(stageFields, { add: addStage, remove: removeStage }) => (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                      Stages
                    </div>
                    {stageFields.map(({ key: stageKey, name: stageName }) => (
                      <div
                        key={stageKey}
                        style={{
                          background: "#faf9ff", borderRadius: 8, padding: "12px 14px",
                          marginBottom: 10, border: "1px solid #ede9fe",
                        }}
                      >
                        <Row gutter={12} align="middle">
                          <Col xs={24} md={7}>
                            <Form.Item
                              name={[stageName, "stage"]}
                              label="Stage"
                              rules={[{ required: true, message: "Select stage" }]}
                              style={{ marginBottom: 0 }}
                            >
                              <Select placeholder="Select stage">
                                <Option value="on_booking">On Booking</Option>
                                <Option value="during_construction">During Construction</Option>
                                <Option value="upon_handover">Upon Handover</Option>
                                <Option value="other">Other</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={5}>
                            <Form.Item
                              name={[stageName, "percentage"]}
                              label="Percentage (%)"
                              rules={[
                                { required: true, message: "Required" },
                                { type: "number", min: 1, max: 100, message: "1–100" },
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber style={{ width: "100%" }} min={1} max={100} addonAfter="%" />
                            </Form.Item>
                          </Col>
                          <Col xs={12} md={10}>
                            <Form.Item
                              name={[stageName, "description"]}
                              label="Description"
                              style={{ marginBottom: 0 }}
                            >
                              <Input placeholder="e.g., Paid on signing SPA" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={2} style={{ display: "flex", alignItems: "flex-end", paddingBottom: 1 }}>
                            <Button
                              danger type="text" size="small"
                              icon={<MinusCircleOutlined />}
                              onClick={() => removeStage(stageName)}
                              style={{ marginTop: 22 }}
                            />
                          </Col>
                        </Row>
                      </div>
                    ))}
                    <Button
                      type="dashed" block onClick={() => addStage()}
                      style={{ borderColor: "#c4b5fd", color: THEME.primary, marginBottom: 8, borderRadius: 8 }}
                      icon={<PlusOutlined />}
                    >
                      Add Stage
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          ))}
          <Button
            type="dashed" block onClick={() => addPlan()}
            style={{ borderColor: THEME.primary, color: THEME.primary, height: 42, borderRadius: 10 }}
            icon={<PlusOutlined />}
          >
            Add Payment Plan
          </Button>
        </>
      )}
    </Form.List>
  );

  // ── STEP CONTENT ──────────────────────────────────────────────────────────
  const renderOriginalStep = (originalIndex) => {
    switch (originalIndex) {

      // ──────────────────────────── 0: Property Overview ────────────────────
      case 0:
        return (
          <>
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Property Overview</Divider>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="propertyName" label="Project Name"
                  rules={[{ required: true, message: "Enter project name" }]}
                >
                  <Input placeholder="e.g., Luxury Tower Downtown" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="locality" label="Property Locality"
                  rules={[{ required: true, message: "Select locality" }]}
                >
                  <Select showSearch placeholder="Select locality" size="large">
                    {UAE_LOCALITIES.map((l) => <Option key={l} value={l}>{l}</Option>)}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="city" label="City">
                  <Input placeholder="Dubai" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="completionDate" label="Completion Date">
                  <DatePicker style={{ width: "100%" }} size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="propertyType" label="Property Type"
                  rules={[{ required: true, message: "Select property type" }]}
                >
                  <Select size="large">
                    <Option value="Residential">Residential</Option>
                    <Option value="Commercial">Commercial</Option>
                    <Option value="Mixed-Use">Mixed-Use</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="unitTypes" label="Unit Types"
                  rules={[{ required: true, message: "Select at least one unit type" }]}
                >
                  <Select mode="multiple" placeholder="Select unit types" size="large">
                    {["apartment","penthouse","villa","townhouse","duplex","office","retail","warehouse","plot"]
                      .map((v) => (
                        <Option key={v} value={v}>
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="projectStatus" label="Project Status">
                  <Select size="large" defaultValue="presale">
                    <Option value="presale">Pre-Sale</Option>
                    <Option value="under_construction">Under Construction</Option>
                    <Option value="ready">Ready</Option>
                    <Option value="sold_out">Sold Out</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="overview" label="Project Overview / Description"
                  rules={[{ required: true, message: "Overview is required" }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Describe the project — vision, architecture, lifestyle, key highlights…"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        );

      // ──────────────────────────── 1: Property Details ─────────────────────
      case 1:
        return (
          <>
            {/* PRICING */}
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Pricing</Divider>
            <Row gutter={16}>
              <Col xs={12} md={8}>
                <Form.Item
                  name="priceRangeFrom" label="Starting Price (AED)"
                  rules={[{ required: true, message: "Enter starting price" }]}
                >
                  <InputNumber
                    size="large" style={{ width: "100%" }} min={0}
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    placeholder="500,000"
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={8}>
                <Form.Item
                  name="priceRangeTo" label="Max Price (AED)"
                  rules={[{ required: true, message: "Enter max price" }]}
                >
                  <InputNumber
                    size="large" style={{ width: "100%" }} min={0}
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    placeholder="5,000,000"
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={8}>
                <Form.Item name="currency" label="Currency">
                  <Select size="large" defaultValue="AED">
                    <Option value="AED">AED</Option>
                    <Option value="USD">USD</Option>
                    <Option value="EUR">EUR</Option>
                    <Option value="GBP">GBP</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* LOCATION */}
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>
              <EnvironmentOutlined style={{ marginRight: 6 }} /> Location Details
            </Divider>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="address" label="Full Address">
                  <Input size="large" placeholder="e.g., Building 12, Downtown Dubai, Sheikh Mohammed Bin Rashid Blvd" />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="latitude" label="Latitude">
                  <InputNumber size="large" style={{ width: "100%" }} placeholder="25.2048" />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="longitude" label="Longitude">
                  <InputNumber size="large" style={{ width: "100%" }} placeholder="55.2708" />
                </Form.Item>
              </Col>
            </Row>

            {/* AMENITIES */}
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Amenities & Features</Divider>
            <Form.Item name="amenities">
              <Checkbox.Group style={{ width: "100%" }}>
                <Row gutter={[8, 10]}>
                  {OFFPLAN_AMENITIES.map((a) => (
                    <Col xs={12} sm={8} md={6} key={a}>
                      <Checkbox value={a} style={{ fontSize: 13 }}>{a}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>

            {/* MAIN LOGO */}
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Media & Photos</Divider>
            <Alert
              type="info"
              showIcon
              message="Upload high-quality images. Main Logo is required. Accepted: JPG, PNG, WEBP (max 5 MB each)."
              style={{ marginBottom: 20, borderRadius: 8 }}
            />

            <UploadBox
              label="Main Logo / Cover Image *"
              hint="This is the primary image shown on listings"
              fileList={mainLogoFileList}
              onChange={setMainLogoFileList}
              maxCount={1}
            />
            <UploadBox
              label="Architecture Photos"
              hint="Exterior, renders, facade"
              fileList={photosArchitecture}
              onChange={setPhotosArchitecture}
            />
            <UploadBox
              label="Interior Photos"
              hint="Living areas, kitchens, bedrooms"
              fileList={photosInterior}
              onChange={setPhotosInterior}
            />
            <UploadBox
              label="Lobby / Common Area Photos"
              hint="Entrance, corridors, amenity areas"
              fileList={photosLobby}
              onChange={setPhotosLobby}
            />
            <UploadBox
              label="Other Photos"
              fileList={photosOther}
              onChange={setPhotosOther}
            />

            {/* BROCHURE */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Brochure (PDF)
              </div>
              <Upload
                fileList={brochureFileList}
                onChange={({ fileList: fl }) => setBrochureFileList(fl)}
                customRequest={customUploadRequest}
                accept=".pdf"
                maxCount={1}
              >
                <Button icon={<PlusOutlined />}>Upload Brochure</Button>
              </Upload>
            </div>

            {/* YOUTUBE VIDEOS */}
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>
              <VideoCameraOutlined style={{ marginRight: 6 }} /> YouTube Videos
            </Divider>
            <Form.List name="youtubeVideos">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                      <Col flex="auto">
                        <Form.Item
                          name={name}
                          noStyle
                          rules={[{ type: "url", message: "Enter a valid YouTube URL" }]}
                        >
                          <Input
                            prefix={<VideoCameraOutlined style={{ color: "#9ca3af" }} />}
                            placeholder="https://www.youtube.com/watch?v=..."
                            size="large"
                          />
                        </Form.Item>
                      </Col>
                      <Col>
                        <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                      </Col>
                    </Row>
                  ))}
                  <Button
                    type="dashed" onClick={() => add()}
                    icon={<PlusOutlined />}
                    style={{ borderRadius: 8, color: THEME.primary, borderColor: "#c4b5fd" }}
                  >
                    Add YouTube Link
                  </Button>
                </>
              )}
            </Form.List>

            {/* BUILDINGS */}
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Buildings / Towers</Divider>
            <Form.List name="buildings">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Card
                      key={key} size="small"
                      style={{ marginBottom: 12, borderRadius: 10, border: "1px solid #ede9fe" }}
                      extra={
                        <Button danger type="text" size="small" icon={<DeleteOutlined />} onClick={() => remove(name)}>
                          Remove
                        </Button>
                      }
                      title={<span style={{ fontSize: 13, color: THEME.primary, fontWeight: 700 }}>Tower / Block {name + 1}</span>}
                    >
                      <Row gutter={12}>
                        <Col xs={24} md={10}>
                          <Form.Item name={[name, "title"]} label="Building Name">
                            <Input placeholder="e.g., Tower A" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={14}>
                          <Form.Item name={[name, "description"]} label="Description">
                            <Input placeholder="Brief description of this building" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button
                    type="dashed" block onClick={() => add()}
                    style={{ borderColor: "#c4b5fd", color: THEME.primary, borderRadius: 8 }}
                    icon={<PlusOutlined />}
                  >
                    Add Building / Tower
                  </Button>
                </>
              )}
            </Form.List>

            {/* FLOOR PLANS */}
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Floor Plan Summary</Divider>
            <Form.List name="floorPlans">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Row key={key} gutter={12} align="middle" style={{ marginBottom: 8 }}>
                      <Col xs={24} md={8}>
                        <Form.Item name={[name, "unitType"]} label="Unit Type" style={{ marginBottom: 0 }}>
                          <Select placeholder="Select type">
                            {["apartment","villa","townhouse","penthouse","duplex","office","retail"].map((v) => (
                              <Option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={10} md={6}>
                        <Form.Item name={[name, "areaFrom"]} label="Area From (sqft)" style={{ marginBottom: 0 }}>
                          <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                      </Col>
                      <Col xs={10} md={6}>
                        <Form.Item name={[name, "areaTo"]} label="Area To (sqft)" style={{ marginBottom: 0 }}>
                          <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                      </Col>
                      <Col xs={4} md={4} style={{ paddingTop: 28 }}>
                        <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                      </Col>
                    </Row>
                  ))}
                  <Button
                    type="dashed" onClick={() => add()}
                    style={{ marginTop: 8, borderRadius: 8, color: THEME.primary, borderColor: "#c4b5fd" }}
                    icon={<PlusOutlined />}
                  >
                    Add Floor Plan
                  </Button>
                </>
              )}
            </Form.List>
          </>
        );

      // ──────────────────────────── 2: Inventory Overview ────────────────────
      case 2:
        return (
          <>
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Inventory Overview</Divider>
            <Alert
              type="info" showIcon
              message="Add each unit type available in this project — number of units, size, and pricing."
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
            <Form.List name="inventory">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Card
                      key={key} size="small"
                      style={{ marginBottom: 12, borderRadius: 10, border: "1px solid #ede9fe" }}
                      bodyStyle={{ padding: "12px 16px" }}
                    >
                      <Row gutter={12} align="middle">
                        <Col xs={24} md={5}>
                          <Form.Item
                            name={[name, "unitType"]} label="Unit Type"
                            rules={[{ required: true, message: "Required" }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select placeholder="Select type">
                              <Option value="Studio">Studio</Option>
                              <Option value="1BR">1 Bedroom</Option>
                              <Option value="2BR">2 Bedrooms</Option>
                              <Option value="3BR">3 Bedrooms</Option>
                              <Option value="4BR">4 Bedrooms</Option>
                              <Option value="5BR">5 Bedrooms</Option>
                              <Option value="Penthouse">Penthouse</Option>
                              <Option value="Duplex">Duplex</Option>
                              <Option value="Villa">Villa</Option>
                              <Option value="Townhouse">Townhouse</Option>
                              <Option value="Office">Office</Option>
                              <Option value="Retail">Retail</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={12} md={4}>
                          <Form.Item
                            name={[name, "units"]} label="No. of Units"
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber style={{ width: "100%" }} min={1} placeholder="50" />
                          </Form.Item>
                        </Col>
                        <Col xs={12} md={4}>
                          <Form.Item name={[name, "sqft"]} label="Size (sqft)" style={{ marginBottom: 0 }}>
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="850" />
                          </Form.Item>
                        </Col>
                        <Col xs={12} md={4}>
                          <Form.Item name={[name, "sqm"]} label="Size (sqm)" style={{ marginBottom: 0 }}>
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="79" />
                          </Form.Item>
                        </Col>
                        <Col xs={12} md={4}>
                          <Form.Item name={[name, "price"]} label="Price (AED)" style={{ marginBottom: 0 }}>
                            <InputNumber
                              style={{ width: "100%" }} min={0}
                              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                              placeholder="750,000"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={3} style={{ display: "flex", alignItems: "flex-end", paddingBottom: 1 }}>
                          <Button
                            danger type="text" icon={<DeleteOutlined />}
                            onClick={() => remove(name)} style={{ marginTop: 22 }}
                          >
                            Remove
                          </Button>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button
                    type="dashed" block onClick={() => add()}
                    style={{ borderColor: THEME.primary, color: THEME.primary, borderRadius: 8, height: 42 }}
                    icon={<PlusOutlined />}
                  >
                    Add Unit Type
                  </Button>
                </>
              )}
            </Form.List>

            <Divider style={{ margin: "20px 0 16px" }} />
            <Form.Item name="parkingAllocation" label="Parking Allocation Policy">
              <TextArea
                rows={2}
                placeholder="e.g., 1 covered space per unit; 2 spaces allocated for 3BR and above"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Form.Item name="parkingSpaces" label="Total Parking Spaces">
                  <InputNumber size="large" style={{ width: "100%" }} min={0} placeholder="200" />
                </Form.Item>
              </Col>
            </Row>
          </>
        );

      // ──────────────────────────── 3: Other Details ─────────────────────────
      case 3:
        return (
          <>
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Construction & Development</Divider>
            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Form.Item name="floors" label="Number of Floors">
                  <InputNumber size="large" min={0} style={{ width: "100%" }} placeholder="40" />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="constructionProgress" label="Construction Progress (%)">
                  <InputNumber
                    size="large" min={0} max={100} style={{ width: "100%" }}
                    addonAfter="%" placeholder="65"
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="developmentStatus" label="Development Status">
                  <Select size="large" defaultValue="Planned">
                    <Option value="Planned">Planned</Option>
                    <Option value="Under Construction">Under Construction</Option>
                    <Option value="Completed">Completed</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="projectStatus" label="Project Status">
                  <Select size="large" defaultValue="presale">
                    <Option value="presale">Pre-Sale</Option>
                    <Option value="under_construction">Under Construction</Option>
                    <Option value="ready">Ready</Option>
                    <Option value="sold_out">Sold Out</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Property Specifications</Divider>
            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Form.Item name="furnishing" label="Furnishing Status">
                  <Select size="large" defaultValue="unfurnished">
                    <Option value="unfurnished">Unfurnished</Option>
                    <Option value="semi-furnished">Semi-Furnished</Option>
                    <Option value="fully-furnished">Fully Furnished</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="ownershipType" label="Ownership Type">
                  <Select size="large" defaultValue="freehold">
                    <Option value="freehold">Freehold</Option>
                    <Option value="leasehold">Leasehold</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="serviceCharge" label="Service Charge (AED / sqft / yr)">
                  <Input size="large" placeholder="e.g., 15" />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="saleStatus" label="Sale Status">
                  <Select size="large" defaultValue="Available">
                    <Option value="Available">Available</Option>
                    <Option value="Reserved">Reserved</Option>
                    <Option value="Sold">Sold</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Commission & Listing</Divider>
            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Form.Item name="commission" label="Commission (%)">
                  <InputNumber size="large" min={0} max={100} style={{ width: "100%" }} addonAfter="%" placeholder="5" />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="shareCommission" label="Share Commission?" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="shareCommissionPercentage" label="Shared % (if split)">
                  <InputNumber size="large" min={0} max={100} style={{ width: "100%" }} addonAfter="%" />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="isFeatured" label="Featured Listing?" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Form.Item name="showContactOnlyVerified" label="Verified Users Only?" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </>
        );

      // ──────────────────────────── 4: Payment Plan ─────────────────────────
      case 4:
        return (
          <>
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Payment Plan</Divider>
            <Alert
              type="info" showIcon
              message="Add one or more payment plan options. Each plan can have multiple stages — booking, during construction, and on handover."
              style={{ marginBottom: 20, borderRadius: 8 }}
            />
            {renderPaymentPlanFields()}
          </>
        );

      // ──────────────────────────── 5: Developer Details (read-only) ────────
      case 5:
        return (
          <>
            <Divider orientation="left" style={{ borderColor: THEME.primary }}>Developer Details</Divider>
            <Alert
              message="Auto-populated from selected developer's profile"
              description="Review the details below. They are pulled from the developer account you selected in Step 1."
              type="success"
              showIcon
              style={{ marginBottom: 20, borderRadius: 8 }}
            />

            {selectedDeveloperProfile?.logo && (
              <div style={{ marginBottom: 20 }}>
                <img
                  src={selectedDeveloperProfile.logo}
                  alt="Developer Logo"
                  style={{ height: 56, borderRadius: 8, border: "1px solid #e5e7eb", padding: 4, background: "#fff" }}
                />
              </div>
            )}

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name={["developerDetails", "companyName"]} label="Company Name">
                  <Input readOnly size="large" style={{ background: "#fafafa" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name={["developerDetails", "developerLicenseNumber"]} label="Developer Licence Number">
                  <Input readOnly size="large" style={{ background: "#fafafa" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name={["developerDetails", "primaryContactName"]} label="Primary Contact">
                  <Input readOnly size="large" style={{ background: "#fafafa" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name={["developerDetails", "phone"]} label="Phone">
                  <Input readOnly size="large" style={{ background: "#fafafa" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name={["developerDetails", "email"]} label="Email">
                  <Input readOnly size="large" style={{ background: "#fafafa" }} />
                </Form.Item>
              </Col>
            </Row>
          </>
        );

      default:
        return null;
    }
  };

  // ── Step 0 (Select Developer) ──────────────────────────────────────────────
  const renderDeveloperSelection = () => (
    <>
      <Divider orientation="left" style={{ borderColor: THEME.primary }}>Select Developer</Divider>
      <Alert
        message="Choose the developer account this off-plan project belongs to."
        type="info" showIcon
        style={{ marginBottom: 20, borderRadius: 8 }}
      />
      <Form.Item label="Developer" required>
        <Select
          showSearch size="large"
          placeholder="Search and select a developer"
          loading={loadingDevelopers}
          value={selectedDeveloperId}
          onChange={(val) => setSelectedDeveloperId(val)}
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          style={{ width: "100%" }}
        >
          {developers.map((dev) => (
            <Option
              key={dev._id}
              value={dev._id}
              label={dev.name || dev.companyName || dev.username}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {dev.logo && (
                  <img
                    src={dev.logo} alt=""
                    style={{ width: 24, height: 24, borderRadius: 4, objectFit: "contain", flexShrink: 0 }}
                  />
                )}
                <span style={{ fontWeight: 600 }}>{dev.name || dev.companyName}</span>
                {dev.email && (
                  <span style={{ color: "#9ca3af", fontSize: 12 }}>· {dev.email}</span>
                )}
              </div>
            </Option>
          ))}
        </Select>
      </Form.Item>

      {fetchingProfile && (
        <div style={{ textAlign: "center", padding: 20 }}>
          <Spin tip="Loading developer profile…" />
        </div>
      )}

      {selectedDeveloperProfile && !fetchingProfile && (
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "14px 18px", borderRadius: 10,
          background: "#f0fdf4", border: "1px solid #bbf7d0", marginTop: 8,
        }}>
          {selectedDeveloperProfile.logo && (
            <img src={selectedDeveloperProfile.logo} alt="logo"
              style={{ width: 48, height: 48, borderRadius: 8, objectFit: "contain", background: "#fff", padding: 4 }}
            />
          )}
          <div>
            <div style={{ fontWeight: 700, color: "#15803d" }}>
              ✓ {selectedDeveloperProfile.companyName || selectedDeveloperProfile.name}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              {selectedDeveloperProfile.email}
              {selectedDeveloperProfile.phone && ` · ${selectedDeveloperProfile.phone}`}
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  const adminStepToOriginalIndex = (adminStep) => adminStep > 0 ? adminStep - 1 : null;

  return (
    <div style={{ padding: "24px 32px", background: "#f8f9fb", minHeight: "100vh" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>

          <Title level={3} style={{ display: "inline-block", margin: 0 }}>
            Create Off-Plan Project
          </Title>
        </Col>
      </Row>

      <Steps
        current={currentStep}
        items={STEPS.map((title) => ({ title }))}
        style={{ marginBottom: 28 }}
        size="small"
      />

      <Card
        bordered={false}
        style={{ borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb", maxWidth: 1099, margin: "0 auto" }}
        bodyStyle={{ padding: "28px 32px" }}
      >
        <Form
          form={form}
          layout="vertical"
          preserve
          initialValues={{
            currency: "AED", builtUpAreaUnit: "sqft",
            unitType: "apartment", bedroomType: "1bed",
            bedrooms: 1, bathrooms: 1, propertyType: "Residential",
            furnishing: "unfurnished", parkingSpaces: 0,
            ownershipType: "freehold", projectStatus: "presale",
            developmentStatus: "Planned", saleStatus: "Available",
            isFeatured: false, readinessProgress: "0%",
            hasView: false, viewType: [], showContactOnlyVerified: false,
            shareCommission: false, shareCommissionPercentage: 0,
            constructionProgress: 0, commission: 0,
          }}
        >
          {/* Step 0: Select Developer */}
          {currentStep === 0 && renderDeveloperSelection()}

          {/* Steps 1–6: original form steps (index shifted by -1) */}
          {currentStep >= 1 && currentStep <= 6 &&
            renderOriginalStep(adminStepToOriginalIndex(currentStep))
          }

          {/* Step 7: Submission */}
          {currentStep === 7 && (
            <>
              <Divider orientation="left" style={{ borderColor: THEME.primary }}>Review & Submit</Divider>
              <Alert
                message="Ready to submit?"
                description="You can save as draft to continue editing later, or submit for admin approval. The listing will not be publicly visible until approved."
                type="info"
                showIcon
                style={{ marginBottom: 24, borderRadius: 8 }}
              />
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { label: "Developer",      value: selectedDeveloperProfile?.companyName || selectedDeveloperProfile?.name || "—" },
                  { label: "Project Name",   value: form.getFieldValue("propertyName") || "—" },
                  { label: "Locality",       value: form.getFieldValue("locality") || "—" },
                  { label: "Property Type",  value: form.getFieldValue("propertyType") || "—" },
                  { label: "Price Range",    value: form.getFieldValue("priceRangeFrom") && form.getFieldValue("priceRangeTo")
                      ? `AED ${Number(form.getFieldValue("priceRangeFrom")).toLocaleString()} – ${Number(form.getFieldValue("priceRangeTo")).toLocaleString()}`
                      : "—" },
                  { label: "Project Status", value: form.getFieldValue("projectStatus") || "—" },
                  { label: "Main Logo",      value: mainLogoFileList.length > 0 ? `${mainLogoFileList.filter(f => f.status === "done").length} uploaded` : "Not uploaded ⚠️" },
                  { label: "Inventory Items", value: (form.getFieldValue("inventory") || []).length > 0 ? `${form.getFieldValue("inventory").length} unit type(s)` : "None added" },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    padding: "12px 16px", background: "#fafafa",
                    borderRadius: 10, border: "1px solid #e5e7eb", minWidth: 180,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Footer buttons */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginTop: 32, paddingTop: 20, borderTop: "1px solid #f0f0f0",
          }}>
            <div>
              {currentStep > 0 && (
                <Button size="large" onClick={handlePrev} style={{ borderRadius: 8 }}>
                  ← Previous
                </Button>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="primary" size="large" onClick={handleNext}
                  style={{ backgroundColor: THEME.primary, borderRadius: 8, minWidth: 120 }}
                >
                  Next →
                </Button>
              ) : (
                <>
                  <Button
                    size="large" onClick={() => handleSave("draft")}
                    loading={formLoading}
                    style={{ borderRadius: 8, minWidth: 130 }}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="primary" size="large" onClick={() => handleSave("submit")}
                    loading={formLoading}
                    style={{ backgroundColor: THEME.primary, borderRadius: 8, minWidth: 180 }}
                  >
                    Submit for Approval
                  </Button>
                </>
              )}
            </div>
          </div>

          {photoError && (
            <Alert type="error" message={photoError} showIcon style={{ marginTop: 16, borderRadius: 8 }} />
          )}
        </Form>
      </Card>
    </div>
  );
}