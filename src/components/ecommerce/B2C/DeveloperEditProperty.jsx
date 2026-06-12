import React, { useState, useEffect } from "react";
import {
  Card, Typography, Form, Input, Button, Row, Col, Select,
  InputNumber, Upload, Alert, Checkbox, DatePicker,
  Progress, Tag, Space, Spin,
} from "antd";
import {
  PlusOutlined, ArrowLeftOutlined, MinusCircleOutlined,
  SaveOutlined, SendOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { showToast } from "../../../manageApi/utils/toast";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const THEME = { primary: "#6d28d9", light: "#f3e8ff" };
const UPLOAD_API = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload`;

const UAE_LOCALITIES = [
  "Dubai Marina", "Downtown Dubai", "JVC - Jumeirah Village Circle",
  "Business Bay", "Palm Jumeirah", "Dubai Hills Estate", "DIFC",
  "Jumeirah Lake Towers (JLT)", "Al Barsha", "Arabian Ranches",
  "Dubai Creek Harbour", "Dubai South", "Meydan", "Sobha Hartland",
  "Abu Dhabi - Al Reem Island", "Abu Dhabi - Saadiyat Island",
  "Abu Dhabi - Yas Island", "Sharjah", "Ajman", "Ras Al Khaimah",
];

const AMENITIES_LIST = [
  "Swimming Pool", "Gym", "Lounge", "Smart Home", "Concierge",
  "Parking", "Children Play Area", "Gardens", "Security 24/7",
  "BBQ Area", "Tennis Court", "Squash Court", "Padel Court",
  "Spa & Sauna", "Yoga Studio", "Co-working Space", "Rooftop Terrace",
  "Retail Outlets", "Restaurant", "Nursery", "Mosque",
  "Jogging Track", "Cycling Track", "Pet-Friendly Area",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const extractFileUrl = (fileItem) => {
  const r = fileItem?.response;
  if (!r) return null;
  return (
    r.url || r.imageUrl || r.image_url || r.secure_url || r.link || r.path ||
    r.filePath || r.fileUrl ||
    r.data?.url || r.data?.imageUrl || r.data?.secure_url || r.data?.path ||
    r.file?.url || r.file?.imageUrl || r.file?.secure_url || r.file?.path ||
    r.file?.location || r.file?.key || r.file?.filename ||
    r.result?.url || r.result?.secure_url || null
  );
};

const collectUrls = (fileList) =>
  (fileList || [])
    .filter((f) => f.status === "done")
    .map((f) => f.url || extractFileUrl(f))
    .filter(Boolean);

const urlsToFileList = (urls = [], prefix = "img") =>
  urls.map((url, i) => ({
    uid:    `${prefix}-${i}`,
    name:   `${prefix}-${i}.jpg`,
    status: "done",
    url,
  }));

const customUploadRequest = async ({ file, onSuccess, onError }) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(UPLOAD_API, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error(data.message || "Upload failed");
    onSuccess(data, file);
  } catch (err) {
    onError(err);
  }
};

const validateImageSize = (file) => {
  const ok = file.size / 1024 / 1024 < 5;
  if (!ok) showToast("Image must be smaller than 5MB!", "error");
  return ok || Upload.LIST_IGNORE;
};

// Aggregate raw child units into inventory overview rows
const aggregateInventoryListings = (childUnits) => {
  if (!Array.isArray(childUnits) || childUnits.length === 0) return [];
  const isChildList = childUnits.some((u) => u && (u.unitNumber !== undefined || u.price !== undefined));
  if (!isChildList) return childUnits;

  const groups = {};
  childUnits.forEach((unit) => {
    if (!unit) return;
    const ut = String(unit.unitType || "").toLowerCase();
    const bt = String(unit.bedroomType || "").toLowerCase();
    let cat = "Apartment";
    if (["apartment", "hotel_apartment", "duplex"].includes(ut)) {
      const map = { studio: "Studio", "1bed": "1BR", "2bed": "2BR", "3bed": "3BR",
        "4bed": "4BR", "5bed": "5BR", "6bed": "6BR", "7bed": "7BR", "8plus": "8BR+" };
      cat = map[bt] || "Apartment";
    } else if (ut === "penthouse") {
      cat = "Penthouse";
    } else if (ut) {
      cat = ut.charAt(0).toUpperCase() + ut.slice(1);
    }
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(unit);
  });

  return Object.keys(groups).map((cat) => {
    const units = groups[cat];
    const areas = units.map((u) => {
      const v = Number(u.area) || 0;
      return u.areaUnit === "sqm"
        ? { sqft: Math.round(v * 10.7639), sqm: v }
        : { sqft: v, sqm: Math.round(v * 0.092903) };
    });
    return {
      unitType: cat,
      units:    units.length,
      sqft:     areas.length ? Math.min(...areas.map((a) => a.sqft)) : 0,
      sqm:      areas.length ? Math.min(...areas.map((a) => a.sqm))  : 0,
    };
  });
};

// ─── Section components ───────────────────────────────────────────────────────

const SectionHeader = ({ number, title, subtitle }) => (
  <div style={{
    background: THEME.light,
    borderLeft: `4px solid ${THEME.primary}`,
    padding: "12px 16px",
    borderRadius: "0 8px 8px 0",
    marginBottom: 20,
    marginTop: 32,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: THEME.primary, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, flexShrink: 0,
      }}>
        {number}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: THEME.primary }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: "#6b7280" }}>{subtitle}</div>}
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DeveloperEditProperty() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { user }    = useSelector((state) => state.auth);
  const developerId = user?.id || user?._id || null;

  const [form] = Form.useForm();
  const [fetchLoading, setFetchLoading] = useState(true);
  const [savingDraft,  setSavingDraft]  = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [developerProfile, setDeveloperProfile] = useState(null);
  const [approvalStatus,   setApprovalStatus]   = useState("");
  const [adminComments,    setAdminComments]     = useState("");

  // Map preview
  const [mapLat, setMapLat] = useState(null);
  const [mapLng, setMapLng] = useState(null);

  // File lists
  const [mainLogoList,    setMainLogoList]    = useState([]);
  const [archList,        setArchList]        = useState([]);
  const [interiorList,    setInteriorList]    = useState([]);
  const [lobbyList,       setLobbyList]       = useState([]);
  const [projectPlanList, setProjectPlanList] = useState([]);
  const [brochureList,    setBrochureList]    = useState([]);
  const [qrCodeList,      setQrCodeList]      = useState([]);
  const [buildingImages,  setBuildingImages]  = useState({});

  const constructionProgress = Form.useWatch("constructionProgress", form) || 0;

  useEffect(() => {
    if (!developerId) {
      showToast("Developer not found. Please log in again.", "error");
      navigate("/dashboard/developer");
    }
  }, [developerId, navigate]);

  useEffect(() => {
    const init = async () => {
      // Fetch profile first, then property (property may overwrite developer details)
      try {
        const profileRes = await apiService.get("/profile/get-profile-data");
        const profile    = profileRes?.data?.data || profileRes?.data?.profile || profileRes?.data || profileRes?.profile || profileRes;
        if (profile) {
          setDeveloperProfile(profile);
          form.setFieldsValue({
            developerDetails: {
              companyName:            profile.companyName || "",
              developerLicenseNumber: profile.developerLicenseNumber || "",
              primaryContactName:     profile.primaryContactName || profile.name || "",
              phone:                  profile.phone_number || profile.phone || "",
              email:                  profile.email || "",
            },
          });
        }
      } catch (_) {}

      if (id) await fetchProperty();
    };
    init();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setFetchLoading(true);
      const res = await apiService.get(`/properties/${id}?_t=${Date.now()}`);
      const p   = res?.data?.data || res?.data;
      if (!p) return;

      setApprovalStatus(p.approvalStatus || "");
      setAdminComments(p.adminComments   || "");

      const rawInventory = p.inventory || [];
      const hasChildUnits = rawInventory.some((u) => u && (u.unitNumber !== undefined || u.price !== undefined));
      const inventory     = hasChildUnits ? aggregateInventoryListings(rawInventory) : (p.inventoryConfig || rawInventory);

      form.setFieldsValue({
        propertyName:         p.projectName || p.propertyName || "",
        locality:             p.locality    || p.area         || "",
        propertyType:         p.propertyType || "Residential",
        unitTypes: Array.isArray(p.unitTypes) && p.unitTypes.length > 0
          ? p.unitTypes
          : (p.unitType ? [p.unitType] : []),
        completionDate: p.completionDate?.fullDate
          ? dayjs(p.completionDate.fullDate)
          : null,
        overview:      p.overview     || p.description || "",
        priceRangeFrom: p.priceRange?.from || p.price_min || null,
        priceRangeTo:   p.priceRange?.to   || p.price_max || null,
        youtubeVideos:  p.youtubeVideos || [],
        address:   p.location?.address   || "",
        latitude:  p.location?.latitude  || p.coordinates?.lat || null,
        longitude: p.location?.longitude || p.coordinates?.lng || null,
        buildings: p.buildings || [],
        amenities: p.amenities || [],
        floorPlans: p.floorPlans || [],
        inventory,
        parkingAllocation:    p.parkingAllocation || "",
        floors:               p.numberOfFloors    || p.floors || null,
        furnishing:
          p.furnishingStatus === "Semi-Furnished"  ? "semi_furnished"  :
          p.furnishingStatus === "Fully Furnished" ? "fully_furnished" :
          p.furnishing || "unfurnished",
        serviceCharge:        p.serviceCharge     || p.serviceChargeInfo || "",
        constructionProgress: p.constructionProgress || 0,
        developmentStatus:    p.developmentStatus  || "Planned",
        projectStatus:        p.projectStatus      || "presale",
        saleStatus:           p.saleStatus         || "Available",
        trakheesiPermitId:    p.trakheesiPermitId  || "",
        paymentPlan: (p.paymentPlan || []).map((plan) => ({
          title:  plan.title || "",
          stages: (plan.stages || []).map((s) => ({
            milestoneTitle: s.milestoneTitle || s.stage || "",
            percentage:     s.percentage    || 0,
            description:    s.description   || "",
          })),
        })),
      });

      // Merge property developer details with already-populated profile values.
      // Profile was set first; only overwrite a field if the property has a non-empty value.
      // Note: payload saves contactName (not primaryContactName), so check both keys.
      if (p.developerDetails) {
        const current = form.getFieldValue("developerDetails") || {};
        form.setFieldsValue({
          developerDetails: {
            companyName:            p.developerDetails.companyName            || current.companyName            || "",
            developerLicenseNumber: p.developerDetails.developerLicenseNumber || current.developerLicenseNumber || "",
            primaryContactName:     p.developerDetails.primaryContactName     || p.developerDetails.contactName  || current.primaryContactName || "",
            phone:                  p.developerDetails.phone                  || current.phone                  || "",
            email:                  p.developerDetails.email                  || current.email                  || "",
          },
        });
      }

      // Map coords for preview
      const lat = p.location?.latitude  || p.coordinates?.lat || null;
      const lng = p.location?.longitude || p.coordinates?.lng || null;
      setMapLat(lat);
      setMapLng(lng);

      // Media
      if (p.media?.mainLogo || p.mainLogo) {
        setMainLogoList([{ uid: "-main", name: "main-logo.jpg", status: "done",
          url: p.media?.mainLogo || p.mainLogo }]);
      }
      setArchList(urlsToFileList(p.media?.architectureImages || p.photos?.architecture || [], "arch"));
      setInteriorList(urlsToFileList(p.media?.interiorImages || p.photos?.interior      || [], "int"));
      setLobbyList(urlsToFileList(p.media?.lobbyImages       || p.photos?.lobby         || [], "lobby"));

      if (p.projectPlan) {
        setProjectPlanList([{ uid: "-plan", name: "site-plan.pdf", status: "done", url: p.projectPlan }]);
      }
      if (p.brochure) {
        setBrochureList([{ uid: "-brochure", name: "brochure.pdf", status: "done", url: p.brochure }]);
      }
      if (p.qrCode) {
        setQrCodeList([{ uid: "-qr", name: "qr-code.jpg", status: "done", url: p.qrCode }]);
      }

      // Per-building images
      if (Array.isArray(p.buildings)) {
        const imgMap = {};
        p.buildings.forEach((b, idx) => {
          if (b?.image) {
            imgMap[idx] = [{ uid: `bld-${idx}`, name: `building-${idx}.jpg`, status: "done", url: b.image }];
          }
        });
        setBuildingImages(imgMap);
      }
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to fetch property details", "error");
    } finally {
      setFetchLoading(false);
    }
  };

  const isUploading = () =>
    [mainLogoList, archList, interiorList, lobbyList, projectPlanList, brochureList,
      ...Object.values(buildingImages)]
      .some((list) => list?.some((f) => f.status === "uploading"));

  const buildPayload = (values, saveType) => {
    const buildings = (values.buildings || []).map((b, idx) => ({
      ...b,
      image: collectUrls(buildingImages[idx] || [])[0] || b.image || "",
    }));

    const paymentPlan = (values.paymentPlan || []).map((plan) => ({
      title: plan.title || "",
      stages: (plan.stages || []).map((s) => ({
        milestoneTitle: s.milestoneTitle || "",
        percentage:     s.percentage    || 0,
        description:    s.description   || "",
      })),
    }));

    return {
      developer:       developerId,
      propertySubType: "off_plan",
      transactionType: "sell",
      approvalStatus:  saveType === "submit" ? "pending" : "draft",
      status:          saveType === "submit" ? "pending" : "draft",

      projectName:  values.propertyName?.trim(),
      propertyName: values.propertyName?.trim(),
      locality:     values.locality,
      area:         values.locality,
      completionDate: {
        fullDate: values.completionDate ? values.completionDate.format("YYYY-MM-DD") : null,
      },
      propertyType: values.propertyType || "Residential",
      unitTypes: Array.isArray(values.unitTypes)
        ? values.unitTypes
        : (values.unitTypes ? [values.unitTypes] : []),

      overview:    values.overview?.trim(),
      description: values.overview?.trim(),
      priceRange:  { from: values.priceRangeFrom || 0, to: values.priceRangeTo || 0 },
      price_min:   values.priceRangeFrom || 0,
      price_max:   values.priceRangeTo   || 0,
      price:       values.priceRangeFrom || 0,

      media: {
        mainLogo:           collectUrls(mainLogoList)[0] || "",
        architectureImages: collectUrls(archList),
        interiorImages:     collectUrls(interiorList),
        lobbyImages:        collectUrls(lobbyList),
        youtubeVideos:      values.youtubeVideos || [],
      },
      brochure:          collectUrls(brochureList)[0]  || "",
      projectPlan:       collectUrls(projectPlanList)[0] || "",
      qrCode:            collectUrls(qrCodeList)[0]   || "",
      trakheesiPermitId: values.trakheesiPermitId     || null,

      location: {
        address:   values.address   || "",
        latitude:  values.latitude  || null,
        longitude: values.longitude || null,
      },

      buildings,
      amenities:  values.amenities  || [],
      floorPlans: values.floorPlans || [],
      inventory:  values.inventory  || [],
      parkingAllocation: values.parkingAllocation || "",

      numberOfFloors:    values.floors || 0,
      furnishingStatus:
        values.furnishing === "semi_furnished"  ? "Semi-Furnished"  :
        values.furnishing === "fully_furnished" ? "Fully Furnished" : "Unfurnished",
      serviceCharge:        values.serviceCharge        || "",
      constructionProgress: values.constructionProgress || 0,
      developmentStatus:    values.developmentStatus    || "Planned",
      projectStatus:        values.projectStatus        || "presale",
      saleStatus:           values.saleStatus           || "Available",

      paymentPlan,

      developerDetails: {
        companyName:  developerProfile?.companyName            || user?.companyName  || "",
        contactName:  developerProfile?.primaryContactName     || developerProfile?.name || user?.name || "",
        email:        developerProfile?.email                  || user?.email  || "",
        phone:        developerProfile?.phone_number           || developerProfile?.phone || user?.phone || "",
        logo:         developerProfile?.logo                   || user?.logo   || "",
      },
    };
  };

  const handleSave = async (saveType) => {
    let values;
    try {
      values = await form.validateFields();
    } catch (err) {
      const first = err.errorFields?.[0];
      if (first) {
        showToast(first.errors?.[0] || "Please fill all required fields.", "error");
        form.scrollToField(first.name, { behavior: "smooth", block: "center" });
      }
      return;
    }

    if (saveType === "submit") {
      if (archList.filter((f) => f.status === "done").length < 3) {
        showToast("Minimum 3 Architecture photos required.", "error");
        return;
      }
      if (interiorList.filter((f) => f.status === "done").length < 3) {
        showToast("Minimum 3 Interior photos required.", "error");
        return;
      }
      if (lobbyList.filter((f) => f.status === "done").length < 1) {
        showToast("Minimum 1 Lobby photo required.", "error");
        return;
      }
    }

    if (isUploading()) {
      showToast("Please wait for all uploads to finish.", "error");
      return;
    }

    const payload = buildPayload(values, saveType);

    try {
      saveType === "submit" ? setSubmitting(true) : setSavingDraft(true);
      const res = await apiService.patch(`/properties/${id}`, payload);
      if (res?.data?.data || res?.data) {
        showToast(
          saveType === "submit"
            ? "Property submitted! Awaiting Xoto admin approval."
            : "Draft saved successfully.",
          "success"
        );
        navigate("/dashboard/developer/developer-properties");
      } else {
        showToast(res?.message || "Failed to save property.", "error");
      }
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Something went wrong.", "error");
    } finally {
      saveType === "submit" ? setSubmitting(false) : setSavingDraft(false);
    }
  };

  // ─── Loading skeleton ─────────────────────────────────────────────────────
  if (fetchLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Loading property..." />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dashboard/developer/developer-properties")}
          >
            Back
          </Button>
          <Title level={4} style={{ margin: 0, color: THEME.primary }}>
            Edit Project Listing
          </Title>
        </div>
        <Button
          icon={<SaveOutlined />}
          onClick={() => handleSave("draft")}
          loading={savingDraft}
          disabled={submitting}
        >
          Save Draft
        </Button>
      </div>

      {/* Admin feedback banners */}
      {approvalStatus === "changes_requested" && adminComments && (
        <Alert
          type="warning"
          showIcon
          message="Admin Requested Changes"
          description={adminComments}
          style={{ marginBottom: 20 }}
        />
      )}
      {approvalStatus === "approved" && (
        <Alert
          type="info"
          showIcon
          message="Editing this listing will send it back for admin approval."
          style={{ marginBottom: 20 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        scrollToFirstError={{ behavior: "smooth", block: "center" }}
        initialValues={{
          propertyType:         "Residential",
          furnishing:           "unfurnished",
          projectStatus:        "presale",
          developmentStatus:    "Planned",
          saleStatus:           "Available",
          constructionProgress: 0,
        }}
      >
        <Card style={{ borderColor: "#e5e7eb" }}>

          {/* ── Section 1 — Property Overview ─────────────────────────────── */}
          <SectionHeader number="1" title="Property Overview" subtitle="Basic project identification" />
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="propertyName"
                label="Project Name"
                rules={[{ required: true, message: "Project name is required" }]}
              >
                <Input placeholder="e.g., Luxury Towers Downtown" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="locality"
                label="Property Locality"
                rules={[{ required: true, message: "Select a locality" }]}
              >
                <Select showSearch placeholder="Search UAE area..."
                  filterOption={(input, opt) =>
                    opt.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {UAE_LOCALITIES.map((l) => (
                    <Option key={l} value={l}>{l}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="completionDate" label="Completion Date">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="propertyType" label="Property Type" rules={[{ required: true }]}>
                <Select>
                  <Option value="Residential">Residential</Option>
                  <Option value="Commercial">Commercial</Option>
                  <Option value="Mixed-Use">Mixed-Use</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="unitTypes"
                label="Unit Types"
                rules={[{ required: true, message: "Select at least one unit type" }]}
              >
                <Select mode="multiple" placeholder="Select unit types...">
                  <Option value="apartment">Apartment</Option>
                  <Option value="penthouse">Penthouse</Option>
                  <Option value="villa">Villa</Option>
                  <Option value="townhouse">Townhouse</Option>
                  <Option value="duplex">Duplex</Option>
                  <Option value="plot">Plot / Land</Option>
                  <Option value="office">Office</Option>
                  <Option value="retail">Retail</Option>
                  <Option value="warehouse">Warehouse</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* ── Section 2 — Overview & Pricing ───────────────────────────── */}
          <SectionHeader number="2" title="Overview & Pricing" subtitle="Description and price range" />
          <Form.Item
            name="overview"
            label="Project Overview / Description"
            rules={[{ required: true, message: "Project overview is required" }]}
          >
            <TextArea rows={5} placeholder="Describe the project..." showCount maxLength={2000} />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={12} md={8}>
              <Form.Item name="priceRangeFrom" label="Price From (AED)" rules={[{ required: true, message: "Required" }]}>
                <InputNumber
                  style={{ width: "100%" }} min={0}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(v) => v.replace(/,/g, "")}
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="priceRangeTo" label="Price To (AED)" rules={[{ required: true, message: "Required" }]}>
                <InputNumber
                  style={{ width: "100%" }} min={0}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(v) => v.replace(/,/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Section 3 — Media ─────────────────────────────────────────── */}
          <SectionHeader number="3" title="Media" subtitle="Photos and videos" />

          <Form.Item label="Main Logo / Cover Image" required>
            <Upload
              listType="picture-card"
              fileList={mainLogoList}
              customRequest={customUploadRequest}
              beforeUpload={validateImageSize}
              accept="image/*"
              onChange={({ fileList }) => setMainLogoList(fileList)}
              maxCount={1}
            >
              {mainLogoList.length === 0 && (
                <div><PlusOutlined /><div style={{ marginTop: 8 }}>Logo</div></div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            label={
              <span>
                Architecture Photos&nbsp;
                <Tag color="red" style={{ fontSize: 11 }}>min 3</Tag>
                <Tag style={{ fontSize: 11 }}>max 20</Tag>
              </span>
            }
          >
            <Upload
              listType="picture-card"
              fileList={archList}
              customRequest={customUploadRequest}
              beforeUpload={validateImageSize}
              accept="image/*"
              onChange={({ fileList }) => setArchList(fileList)}
              multiple maxCount={20}
            >
              {archList.length < 20 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 4, fontSize: 12 }}>{archList.length}/20</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            label={
              <span>
                Interior Photos&nbsp;
                <Tag color="red" style={{ fontSize: 11 }}>min 3</Tag>
                <Tag style={{ fontSize: 11 }}>max 20</Tag>
              </span>
            }
          >
            <Upload
              listType="picture-card"
              fileList={interiorList}
              customRequest={customUploadRequest}
              beforeUpload={validateImageSize}
              accept="image/*"
              onChange={({ fileList }) => setInteriorList(fileList)}
              multiple maxCount={20}
            >
              {interiorList.length < 20 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 4, fontSize: 12 }}>{interiorList.length}/20</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            label={
              <span>
                Lobby Photos&nbsp;
                <Tag color="red" style={{ fontSize: 11 }}>min 1</Tag>
                <Tag style={{ fontSize: 11 }}>max 10</Tag>
              </span>
            }
          >
            <Upload
              listType="picture-card"
              fileList={lobbyList}
              customRequest={customUploadRequest}
              beforeUpload={validateImageSize}
              accept="image/*"
              onChange={({ fileList }) => setLobbyList(fileList)}
              multiple maxCount={10}
            >
              {lobbyList.length < 10 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 4, fontSize: 12 }}>{lobbyList.length}/10</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.List name="youtubeVideos">
            {(fields, { add, remove }) => (
              <Form.Item label="YouTube Video Links (optional)">
                <Space direction="vertical" style={{ width: "100%" }}>
                  {fields.map(({ key, name, ...rest }) => (
                    <Row key={key} gutter={8} align="middle">
                      <Col flex={1}>
                        <Form.Item {...rest} name={name} noStyle>
                          <Input placeholder="https://youtube.com/watch?v=..." />
                        </Form.Item>
                      </Col>
                      <Col>
                        <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                      </Col>
                    </Row>
                  ))}
                  <Button type="dashed" block onClick={() => add()} icon={<PlusOutlined />}>
                    Add YouTube Link
                  </Button>
                </Space>
              </Form.Item>
            )}
          </Form.List>

          {/* ── Section 4 — Location ──────────────────────────────────────── */}
          <SectionHeader number="4" title="Location" subtitle="Address and map coordinates" />
          <Form.Item name="address" label="Address">
            <Input placeholder="Full address" />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={12} md={8}>
              <Form.Item name="latitude" label="Latitude">
                <InputNumber step={0.000001} style={{ width: "100%" }}
                  placeholder="e.g., 25.2048"
                  onChange={(v) => setMapLat(v)} />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="longitude" label="Longitude">
                <InputNumber step={0.000001} style={{ width: "100%" }}
                  placeholder="e.g., 55.2708"
                  onChange={(v) => setMapLng(v)} />
              </Form.Item>
            </Col>
          </Row>
          {mapLat && mapLng && (
            <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb", marginBottom: 16 }}>
              <iframe
                title="map-preview"
                src={`https://maps.google.com/maps?q=${mapLat},${mapLng}&z=15&output=embed`}
                width="100%" height="260"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}

          {/* ── Section 5 — Project Plan ──────────────────────────────────── */}
          <SectionHeader number="5" title="Project Plan" subtitle="Master site plan (PDF or image)" />
          <Form.Item label="General Site Plan">
            <Upload
              fileList={projectPlanList}
              customRequest={customUploadRequest}
              accept=".pdf,image/*"
              onChange={({ fileList }) => setProjectPlanList(fileList)}
              maxCount={1}
            >
              {projectPlanList.length === 0 && (
                <Button icon={<PlusOutlined />}>Upload Site Plan</Button>
              )}
            </Upload>
          </Form.Item>

          {/* ── Section 6 — Buildings ─────────────────────────────────────── */}
          <SectionHeader number="6" title="Buildings in the Project" />
          <Form.List name="buildings">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Card
                    key={key} size="small"
                    title={`Building / Facility ${name + 1}`}
                    extra={
                      <Button danger type="text" size="small"
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                      >
                        Delete
                      </Button>
                    }
                    style={{ marginBottom: 12, borderColor: "#e5e7eb" }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item name={[name, "title"]} label="Facility / Building Title">
                          <Input placeholder="e.g., Tower A, Clubhouse" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item label="Image">
                          <Upload
                            listType="picture-card"
                            fileList={buildingImages[name] || []}
                            customRequest={customUploadRequest}
                            beforeUpload={validateImageSize}
                            accept="image/*"
                            onChange={({ fileList }) =>
                              setBuildingImages((prev) => ({ ...prev, [name]: fileList }))
                            }
                            maxCount={1}
                          >
                            {(buildingImages[name] || []).length === 0 && (
                              <div><PlusOutlined /><div style={{ marginTop: 4, fontSize: 12 }}>Image</div></div>
                            )}
                          </Upload>
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item name={[name, "description"]} label="Short Description">
                          <TextArea rows={2} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}>
                  Add Building
                </Button>
              </>
            )}
          </Form.List>

          {/* ── Section 7 — Amenities ─────────────────────────────────────── */}
          <SectionHeader number="7" title="Facilities & Amenities" />
          <Form.Item name="amenities">
            <Checkbox.Group style={{ width: "100%" }}>
              <Row gutter={[8, 8]}>
                {AMENITIES_LIST.map((a) => (
                  <Col xs={12} md={8} lg={6} key={a}>
                    <Checkbox value={a}>{a}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>

          {/* ── Section 8 — Floor Plan & Unit Details ───────────────────── */}
          <SectionHeader number="8" title="Floor Plan & Unit Details" subtitle="Unit types with area ranges" />
          <Form.List name="floorPlans">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Row key={key} gutter={12} align="middle" style={{ marginBottom: 8 }}>
                    <Col xs={24} md={8}>
                      <Form.Item name={[name, "unitType"]} label="Unit Type" style={{ marginBottom: 0 }}>
                        <Input placeholder="e.g., 1BR, 2BR, Studio" />
                      </Form.Item>
                    </Col>
                    <Col xs={11} md={6}>
                      <Form.Item name={[name, "areaFrom"]} label="Area From (sq ft)" style={{ marginBottom: 0 }}>
                        <InputNumber style={{ width: "100%" }} min={0} />
                      </Form.Item>
                    </Col>
                    <Col xs={11} md={6}>
                      <Form.Item name={[name, "areaTo"]} label="Area To (sq ft)" style={{ marginBottom: 0 }}>
                        <InputNumber style={{ width: "100%" }} min={0} />
                      </Form.Item>
                    </Col>
                    <Col xs={2}>
                      <Button danger type="text" icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)} style={{ marginTop: 30 }} />
                    </Col>
                  </Row>
                ))}
                <Button type="dashed" block onClick={() => add()} icon={<PlusOutlined />} style={{ marginTop: 8 }}>
                  Add Unit Type
                </Button>
              </>
            )}
          </Form.List>

          {/* ── Section 9 — Inventory Overview ──────────────────────────── */}
          <SectionHeader number="9" title="Inventory Overview" subtitle="Unit count and area per type" />
          <Form.List name="inventory">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Card key={key} size="small" style={{ marginBottom: 10, borderColor: "#e5e7eb" }}
                    extra={
                      <Button danger type="text" size="small" onClick={() => remove(name)}>Remove</Button>
                    }
                  >
                    <Row gutter={12}>
                      <Col xs={12} md={6}>
                        <Form.Item name={[name, "unitType"]} label="Unit Type" style={{ marginBottom: 0 }}>
                          <Select placeholder="Select type">
                            {["Studio","1BR","2BR","3BR","4BR","5BR","6BR","7BR","8BR+",
                              "Penthouse","Villa","Townhouse","Duplex","Plot",
                              "Office","Retail","Warehouse",
                            ].map((t) => <Option key={t} value={t}>{t}</Option>)}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={5}>
                        <Form.Item name={[name, "units"]} label="No. of Units" style={{ marginBottom: 0 }}>
                          <InputNumber style={{ width: "100%" }} min={1} />
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={5}>
                        <Form.Item name={[name, "sqft"]} label="Starting Sq Ft" style={{ marginBottom: 0 }}>
                          <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={5}>
                        <Form.Item name={[name, "sqm"]} label="Starting Sq M" style={{ marginBottom: 0 }}>
                          <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" block onClick={() => add()} icon={<PlusOutlined />}>
                  Add Unit Type
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item name="parkingAllocation" label="Parking Allocation" style={{ marginTop: 16 }}>
            <TextArea rows={2} placeholder="e.g., 1 allocated space per unit; 2 spaces for 3BR and above" />
          </Form.Item>

          {/* ── Section 10 — Other Details ───────────────────────────────── */}
          <SectionHeader number="10" title="Other Details" subtitle="Floors, furnishing, service charge, progress" />
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item name="floors" label="Number of Floors">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="furnishing" label="Furnishing Status">
                <Select>
                  <Option value="unfurnished">Unfurnished</Option>
                  <Option value="semi_furnished">Semi-Furnished</Option>
                  <Option value="fully_furnished">Fully Furnished</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="serviceCharge" label="Service Charge (AED/sq ft/yr)">
                <Input placeholder="e.g., 15" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="constructionProgress" label="Construction Progress (%)">
                <InputNumber min={0} max={100} style={{ width: "100%" }} suffix="%" />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ marginBottom: 20 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Progress bar preview:</Text>
            <Progress percent={constructionProgress} strokeColor={THEME.primary} style={{ marginTop: 6 }} />
          </div>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item name="developmentStatus" label="Development Status">
                <Select>
                  <Option value="Planned">Planned</Option>
                  <Option value="Under Construction">Under Construction</Option>
                  <Option value="Completed">Completed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="projectStatus" label="Project Status">
                <Select>
                  <Option value="presale">Pre-Sale</Option>
                  <Option value="under_construction">Under Construction</Option>
                  <Option value="ready">Ready</Option>
                  <Option value="sold_out">Sold Out</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="saleStatus" label="Sale Status">
                <Select>
                  <Option value="Available">Available</Option>
                  <Option value="Reserved">Reserved</Option>
                  <Option value="Sold">Sold</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* ── Section 11 — Payment Plan ────────────────────────────────── */}
          <SectionHeader number="11" title="Payment Plan" subtitle="Construction-linked milestones" />
          <Alert
            message="Dubai off-plan standard: use Construction-Linked Payment Plan"
            description="e.g., 10% On Booking → 50% During Construction → 40% On Handover"
            type="info" showIcon style={{ marginBottom: 20 }}
          />
          <Form.List name="paymentPlan">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Card
                    key={key}
                    title={`Payment Plan ${name + 1}`}
                    style={{ marginBottom: 16, borderColor: "#e5e7eb" }}
                    extra={
                      <Button danger type="text" size="small"
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                      >
                        Remove
                      </Button>
                    }
                  >
                    <Form.Item
                      name={[name, "title"]}
                      label="Plan Title"
                      rules={[{ required: true, message: "Plan title is required" }]}
                    >
                      <Input placeholder="e.g., Standard Payment Plan" />
                    </Form.Item>

                    <Form.List name={[name, "stages"]}>
                      {(stageFields, { add: addStage, remove: removeStage }) => (
                        <>
                          {stageFields.map(({ key: sk, name: sn, ...sr }) => (
                            <Card key={sk} size="small"
                              style={{ marginBottom: 8, background: "#fafafa" }}
                              extra={
                                <Button danger type="text" size="small"
                                  icon={<MinusCircleOutlined />}
                                  onClick={() => removeStage(sn)}
                                />
                              }
                            >
                              <Row gutter={12}>
                                <Col xs={24} md={10}>
                                  <Form.Item
                                    {...sr}
                                    name={[sn, "milestoneTitle"]}
                                    label="Milestone"
                                    rules={[{ required: true, message: "Milestone title required" }]}
                                    style={{ marginBottom: 0 }}
                                  >
                                    <Input placeholder="e.g., On Booking, 30% on Slab Completion, On Handover" />
                                  </Form.Item>
                                </Col>
                                <Col xs={12} md={6}>
                                  <Form.Item
                                    {...sr}
                                    name={[sn, "percentage"]}
                                    label="Percentage (%)"
                                    rules={[{ required: true, message: "Required" }]}
                                    style={{ marginBottom: 0 }}
                                  >
                                    <InputNumber min={0} max={100} style={{ width: "100%" }} suffix="%" />
                                  </Form.Item>
                                </Col>
                                <Col xs={12} md={8}>
                                  <Form.Item
                                    {...sr}
                                    name={[sn, "description"]}
                                    label="Description (optional)"
                                    style={{ marginBottom: 0 }}
                                  >
                                    <Input placeholder="Additional details..." />
                                  </Form.Item>
                                </Col>
                              </Row>
                            </Card>
                          ))}
                          <Button type="dashed" block onClick={() => addStage()} icon={<PlusOutlined />}>
                            Add Breakdown Row
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                ))}
                <Button type="dashed" block onClick={() => add()} icon={<PlusOutlined />}>
                  Add Payment Plan
                </Button>
              </>
            )}
          </Form.List>

          {/* ── Section 12 — Developer Details ──────────────────────────── */}
          <SectionHeader number="12" title="Developer Details" subtitle="Auto-populated from your profile" />
          <Alert
            message="These details will appear on the public listing."
            description="To update them, go to your Profile section."
            type="info" showIcon style={{ marginBottom: 20 }}
          />
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name={["developerDetails", "companyName"]} label="Company Name">
                <Input readOnly style={{ background: "#f9fafb", cursor: "not-allowed" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name={["developerDetails", "developerLicenseNumber"]} label="Developer Licence Number">
                <Input readOnly style={{ background: "#f9fafb", cursor: "not-allowed" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name={["developerDetails", "primaryContactName"]} label="Primary Contact Name">
                <Input readOnly style={{ background: "#f9fafb", cursor: "not-allowed" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name={["developerDetails", "phone"]} label="Phone">
                <Input readOnly style={{ background: "#f9fafb", cursor: "not-allowed" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name={["developerDetails", "email"]} label="Email">
                <Input readOnly style={{ background: "#f9fafb", cursor: "not-allowed" }} />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Section 13 — Brochure ─────────────────────────────────────── */}
          <SectionHeader number="13" title="Project Brochure" subtitle="Optional PDF upload" />
          <Form.Item label="Brochure (PDF)">
            <Upload
              fileList={brochureList}
              customRequest={customUploadRequest}
              beforeUpload={(file) => {
                const ok = file.type === "application/pdf";
                if (!ok) showToast("Only PDF files allowed for brochure.", "error");
                return ok || Upload.LIST_IGNORE;
              }}
              accept=".pdf"
              onChange={({ fileList }) => setBrochureList(fileList)}
              maxCount={1}
            >
              {brochureList.length === 0 && (
                <Button icon={<PlusOutlined />}>Upload Brochure PDF</Button>
              )}
            </Upload>
          </Form.Item>

          {/* ── Section 14 — Compliance ──────────────────────────────────── */}
          <SectionHeader number="14" title="Compliance" subtitle="Trakheesi Permit ID and QR Code — required before admin can publish" />
          <Row gutter={[20, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span>Trakheesi Permit ID <span style={{ color: "#ef4444" }}>*</span></span>}
                name="trakheesiPermitId"
              >
                <Input size="large" placeholder="Enter Trakheesi Permit ID" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <span>
                    QR Code <span style={{ color: "#ef4444" }}>*</span>
                    <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400, marginLeft: 6 }}>
                      JPG / PNG — must be scannable at full resolution
                    </span>
                  </span>
                }
              >
                <Upload
                  listType="picture-card"
                  fileList={qrCodeList}
                  customRequest={customUploadRequest}
                  onChange={({ fileList }) => setQrCodeList(fileList)}
                  accept="image/*"
                  maxCount={1}
                >
                  {qrCodeList.length < 1 && (
                    <div><PlusOutlined /><div style={{ marginTop: 8, fontSize: 12 }}>Upload QR</div></div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* ── Submit bar ───────────────────────────────────────────────── */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 40,
            paddingTop: 24,
            borderTop: "2px solid #f0f0f0",
          }}>
            <Button
              size="large"
              icon={<SaveOutlined />}
              onClick={() => handleSave("draft")}
              loading={savingDraft}
              disabled={submitting}
            >
              Save as Draft
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              onClick={() => handleSave("submit")}
              loading={submitting}
              disabled={savingDraft}
              style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
            >
              Submit for Approval
            </Button>
          </div>

        </Card>
      </Form>
    </div>
  );
}
